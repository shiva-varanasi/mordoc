import { performance } from 'node:perf_hooks';
import { build as viteBuild } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs/promises';
import { runPipeline } from '../pipeline.js';
import { mordocVitePlugin } from '../vite/plugin.js';
import { getMordocAppRoot } from '../utils/paths.js';
import { beginStep, formatBytes, formatElapsed } from '../utils/reporter.js';
import { runSsg } from './ssg-runner.js';
import { copyAndRewriteAssets } from './asset-rewrite.js';
import { runPagefindIndexer } from './pagefind-indexer.js';
import type { MordocData } from '../types/pipeline.js';

export interface BuildCommandOptions {
  /** Absolute path to the user's project root. */
  projectRoot: string;
  /** When true, prints full detail (every warning, every chunk, every rendered route) instead of collapsed summaries. */
  verbose?: boolean;
}

/** Output directories — the deployable artifact and the throwaway SSR intermediate. */
interface BuildOutDirs {
  /**
   * Where the user's deployable output lands. Everything in here is
   * shippable: rendered HTML, hashed JS/CSS, copied assets. The user
   * uploads this folder to their host of choice.
   */
  clientOutDir: string;
  /**
   * Where the SSR build intermediate lands. Used only by the SSG runner
   * during this command; never deployed. Lives under `node_modules/.mordoc/`
   * because that path is universally gitignored, signals "tool cache" by
   * convention, and `rm -rf node_modules` clears it without ceremony.
   */
  ssrOutDir: string;
}

function getOutDirs(projectRoot: string): BuildOutDirs {
  return {
    clientOutDir: path.join(projectRoot, 'dist'),
    ssrOutDir: path.join(projectRoot, 'node_modules', '.mordoc', 'ssr'),
  };
}

/** One entry of a Rollup/Vite build result's output array — chunk or asset, duck-typed to avoid a hard dependency on Rollup's own types. */
interface BuildOutputFile {
  type: 'chunk' | 'asset';
  fileName: string;
  code?: string;
  source?: string | Uint8Array;
}

function fileBytes(file: BuildOutputFile): number {
  if (typeof file.code === 'string') return Buffer.byteLength(file.code);
  if (typeof file.source === 'string') return Buffer.byteLength(file.source);
  if (file.source) return file.source.byteLength;
  return 0;
}

/**
 * Reduces a Vite `build()` result (one `RollupOutput`, or one per
 * environment) to the handful of numbers worth printing by default: how
 * many JS chunks came out, the total size of everything written, and the
 * single largest chunk — the one figure that actually flags a bloat
 * regression. Everything else Vite would normally print per-file is
 * suppressed via `logLevel: 'silent'` at the call site; `--verbose`
 * restores Vite's own full table instead of calling this at all.
 */
function summarizeBuildOutput(result: unknown): string {
  const outputs: BuildOutputFile[] = Array.isArray(result)
    ? (result as { output: BuildOutputFile[] }[]).flatMap((r) => r.output)
    : (result as { output: BuildOutputFile[] }).output;

  let totalBytes = 0;
  let chunkCount = 0;
  let largest: { fileName: string; bytes: number } | null = null;

  for (const file of outputs) {
    const bytes = fileBytes(file);
    totalBytes += bytes;
    if (file.type === 'chunk') {
      chunkCount += 1;
      if (!largest || bytes > largest.bytes) largest = { fileName: file.fileName, bytes };
    }
  }

  const largestText = largest ? ` · largest: ${largest.fileName} (${formatBytes(largest.bytes)})` : '';
  return `${chunkCount} chunk${chunkCount === 1 ? '' : 's'} · ${formatBytes(totalBytes)}${largestText}`;
}

/**
 * Runs the full Mordoc production build for a project.
 *
 * Architecture mirrors `dev.ts`:
 *   - Vite's `root` is `mordocAppRoot` (mordoc's own `src/app/`) — the
 *     user's project contains no TSX/HTML that Vite ever sees as code.
 *     All user-side data flows through the mordoc plugin's virtual modules.
 *   - `publicDir` is pointed at `<projectRoot>/public/` for the client
 *     build so that author assets (referenced from markdown as
 *     `/images/foo.png` etc.) get copied into `dist/` verbatim. The SSR
 *     build sets `publicDir: false` to avoid copying the same files into
 *     the throwaway SSR intermediate.
 *   - `configFile: false` prevents Vite from picking up any stray
 *     `vite.config.js` the user might have lying around.
 *
 * Pipeline shape:
 *   1. `runPipeline(projectRoot)` once, up front. The result is injected
 *      into both Vite plugin instances below so the pipeline doesn't run
 *      twice. This also gives us a single point to mutate the data later
 *      (e.g. asset URL rewriting) before either Vite pass starts.
 *   2. Wipe the previous `dist/` and SSR cache. We do this manually
 *      rather than relying on Vite's `emptyOutDir` because both output
 *      directories live outside Vite's `root`, where Vite's auto-empty
 *      logic is intentionally cautious. Manual wipe keeps the behaviour
 *      explicit and the same for both passes.
 *   3. Client build: bundles `main.tsx` + every route's lazy chunk into
 *      hashed `dist/assets/*.js`. `manifest: true` emits the chunk-graph
 *      manifest the SSG runner will read to inject per-route preloads.
 *      Vite also transforms `index.html` (rewriting the `<script>` tag
 *      from `/main.tsx` to the hashed entry) and writes it to
 *      `dist/index.html` — that becomes the SSG runner's per-route
 *      template.
 *   4. SSR build: bundles `entry-server.tsx` for Node consumption into
 *      `node_modules/.mordoc/ssr/`. Vite preserves the dynamic
 *      `import('virtual:mordoc/page/...')` calls as runtime imports,
 *      code-split into sibling files, so the SSG runner can lazily load
 *      each route's content as it renders.
 *   5. SSG runner: loads the SSR bundle, calls `render()` per route,
 *      writes the resulting HTML files.
 *
 * Terminal output is collapsed to one line per phase by default (a
 * progress line rewritten in place on a TTY, finishing as `✓ ... (Xs)`);
 * `--verbose` restores full detail everywhere — every warning, Vite's own
 * per-chunk table, and one line per rendered route — instead of the
 * summarized version.
 *
 * The dev path is unaffected by any of this — its plugin instance still
 * runs the pipeline itself, exactly as before. Build is the only caller
 * that pre-loads `data`.
 */
export async function runBuildCommand(options: BuildCommandOptions): Promise<void> {
  const { projectRoot, verbose = false } = options;
  const mordocAppRoot = getMordocAppRoot();
  const publicDir = path.join(projectRoot, 'public');
  const { clientOutDir, ssrOutDir } = getOutDirs(projectRoot);
  const buildStartedAt = performance.now();

  console.log('\n  Mordoc build');
  console.log(`  Project: ${projectRoot}\n`);

  const rawData = await runPipeline(projectRoot, { verbose });

  const wipeStep = beginStep('clearing previous output');
  await fs.rm(clientOutDir, { recursive: true, force: true });
  await fs.rm(ssrOutDir, { recursive: true, force: true });
  wipeStep.done('cleared previous output');

  // Asset rewrite has to happen before either Vite pass: both bundles
  // import `virtual:mordoc/assets` (transitively, via `main.tsx`'s
  // ShellData assembly), and the SSG runner builds its `shellData`
  // from the same `MordocData`. One rewrite, three consistent views.
  // Note: this also creates `dist/_assets/` with the copied files.
  // Vite's subsequent client build runs with `emptyOutDir: false` so
  // those copies survive.
  const assetsStep = beginStep('copying assets');
  const data = await copyAndRewriteAssets(rawData, clientOutDir);
  assetsStep.done('copied assets');

  const clientStep = beginStep('assembling the client bundle');
  const clientOutput = await viteBuild({
    configFile: false,
    root: mordocAppRoot,
    publicDir,
    logLevel: verbose ? 'info' : 'silent',
    plugins: [
      react(),
      mordocVitePlugin({ projectRoot, mode: 'build', data }),
    ],
    build: {
      outDir: clientOutDir,
      // We wiped above; suppress Vite's "outDir is outside root" guard.
      // Also keeps `dist/_assets/` from being deleted between this
      // build and the next phase.
      emptyOutDir: false,
      manifest: true,
      // Gzip sizing is real per-chunk work that only earns its keep when
      // someone's actually looking at the per-file table it feeds.
      reportCompressedSize: verbose,
    },
  });
  clientStep.done(`client bundle · ${summarizeBuildOutput(clientOutput)}`);

  const ssrStep = beginStep('preparing the SSR bundle');
  const ssrOutput = await viteBuild({
    configFile: false,
    root: mordocAppRoot,
    // The SSR pass produces a Node-loadable bundle in a throwaway
    // intermediate; copying author assets into it is wasted I/O and
    // would put them under `node_modules/.mordoc/ssr/` rather than
    // `dist/`. Disable publicDir entirely for this pass.
    publicDir: false,
    logLevel: verbose ? 'info' : 'silent',
    plugins: [
      react(),
      mordocVitePlugin({ projectRoot, mode: 'build', data }),
    ],
    build: {
      outDir: ssrOutDir,
      emptyOutDir: false,
      ssr: 'entry-server.tsx',
      reportCompressedSize: verbose,
    },
    ssr: {
      // Bundle all node_modules into the SSR output so the throwaway
      // intermediate is self-contained. Without this, Vite leaves bare
      // `import 'react'` etc. in entry-server.js; Node then resolves them
      // from node_modules/.mordoc/ssr/ and cannot find packages that are
      // transitive dependencies of mordoc but not hoisted into the consumer
      // project's top-level node_modules.
      noExternal: true,
    },
  });
  ssrStep.done(`SSR bundle · ${summarizeBuildOutput(ssrOutput)}`);

  // Declare the SSR output directory as an ESM scope.
  //
  // Vite emits the SSR bundle in ESM syntax (because mordoc's own
  // package.json has `"type": "module"`, which Vite uses to pick the
  // SSR output format). Without a package.json here, Node's loader
  // walks up looking for `"type": "module"` and — because the bundle
  // lives under the user project's `node_modules/.mordoc/ssr/`, and
  // `node_modules/` acts as a package-scope boundary — falls back to
  // CommonJS. The first `import { ... } from "..."` then SyntaxErrors.
  //
  // Dropping a one-liner package.json next to the bundle declares the
  // scope unambiguously and is the standard pattern other SSR-emitting
  // frameworks (Astro, SvelteKit, Nuxt, Remix) use for the same reason.
  // The cleanup step at the end of this command wipes ssrOutDir
  // entirely, so this file vanishes along with the rest.
  await fs.writeFile(
    path.join(ssrOutDir, 'package.json'),
    '{"type":"module"}\n',
    'utf-8',
  );

  await runSsg({ data, clientOutDir, ssrOutDir, verbose });

  // The SSR bundle is a build-time intermediate; once the SSG runner has
  // finished rendering every route there's no consumer left for it.
  // Wiping it keeps `node_modules/.mordoc/` from accumulating stale
  // chunks across builds and reinforces the "anything not in dist/ is
  // not deployable" mental model.
  const cleanupStep = beginStep('cleaning up SSR intermediate');
  await fs.rm(ssrOutDir, { recursive: true, force: true });
  cleanupStep.done('cleaned up SSR intermediate');

  await verifyBuildOutput(data, clientOutDir);
  await writeSitemapAndRobots(data, clientOutDir);
  await runPagefindIndexer(data, clientOutDir, verbose);

  if (!verbose && data.apiWarnings > 0) {
    console.log(`\n⚠ ${data.apiWarnings} warning(s) — rerun with --verbose for detail`);
  }

  console.log(`\n✔ all done — build complete (${formatElapsed(performance.now() - buildStartedAt)})`);
  console.log(`  output → ${clientOutDir}\n`);
}

/**
 * Writes `sitemap.xml` and `robots.txt` into the client output directory.
 *
 * Every page discovered by the pipeline gets a `<loc>` entry — the sitemap
 * is filesystem-driven, not sidenav-driven, so orphaned pages are included.
 * Both files reference `site.baseUrl`, which is validated to be a full URL
 * with no trailing slash.
 */
async function writeSitemapAndRobots(data: MordocData, clientOutDir: string): Promise<void> {
  const { baseUrl } = data.site;

  // XML spec requires & to be encoded as &amp; in attribute/text content.
  // routePaths are always slash-only ASCII paths so this is academic, but correct.
  const escapeXml = (v: string) => v.replace(/&/g, '&amp;');

  // Fallback pages serve default-language content at a language-prefixed URL;
  // their canonical already points elsewhere, so omitting them from the sitemap
  // avoids advertising duplicate URLs to crawlers. That covers every
  // non-default-language operation page too.
  const indexedRoutes = [
    ...data.pages.filter((page) => !page.entry.isFallback).map((page) => page.entry.routePath),
    ...data.operations.filter((view) => !view.isFallback).map((view) => view.routePath),
  ].sort();

  const urlEntries = indexedRoutes
    .map((routePath) => `  <url>\n    <loc>${escapeXml(baseUrl + routePath)}</loc>\n  </url>`)
    .join('\n');

  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urlEntries + '\n' +
    '</urlset>\n';

  await fs.writeFile(path.join(clientOutDir, 'sitemap.xml'), sitemap, 'utf-8');

  const robots =
    'User-agent: *\n' +
    'Allow: /\n' +
    '\n' +
    `Sitemap: ${baseUrl}/sitemap.xml\n`;

  await fs.writeFile(path.join(clientOutDir, 'robots.txt'), robots, 'utf-8');

  console.log(
    `✓ sitemap.xml (${indexedRoutes.length} URL${indexedRoutes.length === 1 ? '' : 's'}) · robots.txt`,
  );
}

/**
 * Defensive post-build checks.
 *
 * The SSG runner already throws on the obvious failure modes
 * (`writeFile` errors, missing render export). These checks catch
 * subtler regressions:
 *
 *   1. Every route in the pipeline produced a corresponding HTML file.
 *      Defense-in-depth — the runner walks `data.pages` to write, and
 *      this walks `data.pages` to read; a future refactor that skips
 *      a route silently would surface here.
 *
 *   2. The rendered root HTML still contains literal `$$mdtype` markers
 *      (the Markdoc Tag fingerprint) inside the hydration `<script>`.
 *      If the value is absent, the substitution mangled it (string form
 *      of `String.replace` collapsed `$$` → `$`), which would manifest
 *      on the client as the "Objects are not valid as a React child"
 *      crash the moment hydration tried to re-render. Cheapest possible
 *      regression test for that bug; runs in milliseconds.
 *      Skipped when no page has Markdoc content (empty project).
 */
async function verifyBuildOutput(
  data: Awaited<ReturnType<typeof runPipeline>>,
  clientOutDir: string,
): Promise<void> {
  for (const page of data.pages) {
    const routePath = page.entry.routePath;
    const expectedPath =
      routePath === '/'
        ? path.join(clientOutDir, 'index.html')
        : path.join(clientOutDir, routePath.slice(1), 'index.html');
    try {
      await fs.access(expectedPath);
    } catch {
      throw new Error(
        `mordoc build: expected ${expectedPath} for route "${routePath}", but the file is missing.`,
      );
    }
  }

  const hasRenderableContent = data.pages.length > 0;
  if (hasRenderableContent) {
    const rootHtml = await fs.readFile(path.join(clientOutDir, 'index.html'), 'utf-8');
    if (!rootHtml.includes('$$mdtype')) {
      throw new Error(
        'mordoc build: rendered dist/index.html does not contain "$$mdtype". ' +
          'The hydration data may have been mangled by string-form String.replace; ' +
          'check that all SSR template substitutions use the replacement-function form.',
      );
    }
  }
}
