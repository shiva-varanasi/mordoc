import { build as viteBuild } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs/promises';
import { runPipeline } from '../pipeline.js';
import { mordocVitePlugin } from '../vite/plugin.js';
import { getAppRoot } from '../utils/paths.js';
import { runSsg } from './ssg-runner.js';
import { copyAndRewriteAssets } from './asset-rewrite.js';
import { runPagefindIndexer } from './pagefind-indexer.js';
import type { MordocData } from '../types/pipeline.js';

export interface BuildCommandOptions {
  /** Absolute path to the user's project root. */
  projectRoot: string;
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

/**
 * Runs the full Mordoc production build for a project.
 *
 * Architecture mirrors `dev.ts`:
 *   - Vite's `root` is mordoc's own `src/app/` — the user's project
 *     contains no TSX/HTML that Vite ever sees as code. All user-side
 *     data flows through the mordoc plugin's virtual modules.
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
 *      writes the resulting HTML files. (Wired in a follow-up step.)
 *
 * The dev path is unaffected by any of this — its plugin instance still
 * runs the pipeline itself, exactly as before. Build is the only caller
 * that pre-loads `data`.
 */
export async function runBuildCommand(options: BuildCommandOptions): Promise<void> {
  const { projectRoot } = options;
  const appRoot = getAppRoot();
  const publicDir = path.join(projectRoot, 'public');
  const { clientOutDir, ssrOutDir } = getOutDirs(projectRoot);

  console.log('\n  Mordoc build');
  console.log(`  Project: ${projectRoot}\n`);

  console.log('→ running pipeline...');
  const rawData = await runPipeline(projectRoot);
  console.log(`  ${rawData.pages.length} page(s) discovered\n`);

  console.log('→ wiping previous output...');
  await fs.rm(clientOutDir, { recursive: true, force: true });
  await fs.rm(ssrOutDir, { recursive: true, force: true });

  // Asset rewrite has to happen before either Vite pass: both bundles
  // import `virtual:mordoc/assets` (transitively, via `main.tsx`'s
  // ShellData assembly), and the SSG runner builds its `shellData`
  // from the same `MordocData`. One rewrite, three consistent views.
  // Note: this also creates `dist/_assets/` with the copied files.
  // Vite's subsequent client build runs with `emptyOutDir: false` so
  // those copies survive.
  console.log('→ copying assets...');
  const data = await copyAndRewriteAssets(rawData, clientOutDir);

  console.log('→ building client bundle...');
  await viteBuild({
    configFile: false,
    root: appRoot,
    publicDir,
    plugins: [
      react(),
      mordocVitePlugin({ projectRoot, data }),
    ],
    build: {
      outDir: clientOutDir,
      // We wiped above; suppress Vite's "outDir is outside root" guard.
      // Also keeps `dist/_assets/` from being deleted between this
      // build and the next phase.
      emptyOutDir: false,
      manifest: true,
    },
  });

  console.log('→ building SSR bundle...');
  await viteBuild({
    configFile: false,
    root: appRoot,
    // The SSR pass produces a Node-loadable bundle in a throwaway
    // intermediate; copying author assets into it is wasted I/O and
    // would put them under `node_modules/.mordoc/ssr/` rather than
    // `dist/`. Disable publicDir entirely for this pass.
    publicDir: false,
    plugins: [
      react(),
      mordocVitePlugin({ projectRoot, data }),
    ],
    build: {
      outDir: ssrOutDir,
      emptyOutDir: false,
      ssr: 'entry-server.tsx',
    },
  });

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

  console.log('\n→ rendering routes to static HTML...');
  await runSsg({ data, clientOutDir, ssrOutDir });

  // The SSR bundle is a build-time intermediate; once the SSG runner has
  // finished rendering every route there's no consumer left for it.
  // Wiping it keeps `node_modules/.mordoc/` from accumulating stale
  // chunks across builds and reinforces the "anything not in dist/ is
  // not deployable" mental model.
  console.log('\n→ cleaning up SSR intermediate...');
  await fs.rm(ssrOutDir, { recursive: true, force: true });

  console.log('\n→ verifying output...');
  await verifyBuildOutput(data, clientOutDir);

  console.log('\n→ writing sitemap and robots.txt...');
  await writeSitemapAndRobots(data, clientOutDir);

  console.log('\n→ building search index...');
  await runPagefindIndexer(data, clientOutDir);

  console.log('\n✔ build complete');
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

  const urlEntries = data.pages
    .map((page) => `  <url>\n    <loc>${escapeXml(baseUrl + page.entry.routePath)}</loc>\n  </url>`)
    .join('\n');

  const sitemap =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urlEntries + '\n' +
    '</urlset>\n';

  await fs.writeFile(path.join(clientOutDir, 'sitemap.xml'), sitemap, 'utf-8');
  console.log(`  sitemap.xml  (${data.pages.length} URL${data.pages.length === 1 ? '' : 's'})`);

  const robots =
    'User-agent: *\n' +
    'Allow: /\n' +
    '\n' +
    `Sitemap: ${baseUrl}/sitemap.xml\n`;

  await fs.writeFile(path.join(clientOutDir, 'robots.txt'), robots, 'utf-8');
  console.log('  robots.txt');
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
