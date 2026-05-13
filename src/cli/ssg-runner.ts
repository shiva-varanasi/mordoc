import path from 'node:path';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import type { MordocData, ShellData } from '../types/pipeline.js';

/** Markers in `index.html` substituted at SSG time. Same shape as `dev.ts`. */
const SSR_TITLE_MARKER = '<!--ssr-title-->';
const SSR_OUTLET_MARKER = '<!--ssr-outlet-->';

/** The contract `entry-server.tsx` exports — kept as a local type so the SSR bundle stays an opaque dependency. */
interface ServerRender {
  render: (request: Request, data: ShellData) => Promise<{ html: string }>;
}

export interface SsgRunnerOptions {
  /**
   * Pipeline output for the project. Same instance the Vite plugin used,
   * so per-page metadata and the route list are guaranteed to match the
   * code-split chunks the client build just emitted.
   */
  data: MordocData;
  /**
   * Where Vite wrote the client bundle and the transformed `index.html`.
   * The runner reads `index.html` from here (it already has the hashed
   * entry script tag), substitutes per-route, and writes the rendered
   * pages back into this same directory tree.
   */
  clientOutDir: string;
  /**
   * Where Vite wrote the SSR bundle. The runner does a single dynamic
   * `import()` of `entry-server.js` from here to obtain the `render()`
   * function. Once this command finishes, this directory is deleted.
   */
  ssrOutDir: string;
}

/**
 * Minimal HTML escape for values interpolated into element text content.
 *
 * Same function as in `dev.ts`. Duplicated rather than extracted because
 * pulling a shared "escape" module out is busywork at two callers; a
 * third caller would justify the refactor. The cost of the duplication
 * is one ~6-line function.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Projects `MordocData` to the SSR-shaped `ShellData`.
 *
 * Identical projection to the Vite plugin's `api.getShellData()`. The
 * SSG runner doesn't have a plugin instance to call (the build command
 * tears the plugins down after each Vite pass), so it does the
 * projection itself from the same `MordocData` the plugins were given.
 */
function toShellData(data: MordocData): ShellData {
  return {
    site: data.site,
    language: data.language,
    navigation: data.navigation,
    assets: data.assets,
    pagesIndex: data.pages.map((p) => ({
      routePath: p.entry.routePath,
      language: p.entry.language,
    })),
    translations: data.translations,
  };
}

/**
 * Maps a routePath to its on-disk output file inside `clientOutDir`.
 *
 * Pretty-URL layout: every route gets its own folder with an
 * `index.html` inside, except the root which writes directly to
 * `dist/index.html`. This is what every static host serves cleanly:
 * a request for `/flight-manual` resolves to
 * `dist/flight-manual/index.html` whether the URL has a trailing slash
 * or not.
 *
 * Trailing slashes on routePaths would break the `slice(1)` arithmetic
 * (e.g. `/foo/` → `dist/foo/` + `index.html` → `dist/foo//index.html`).
 * The pipeline doesn't emit them today, but a future regression is
 * cheap to guard against here.
 */
function toOutputPath(routePath: string, clientOutDir: string): string {
  if (routePath === '/') return path.join(clientOutDir, 'index.html');
  if (!routePath.startsWith('/') || routePath.endsWith('/')) {
    throw new Error(
      `mordoc build: invalid routePath "${routePath}". ` +
        `Expected an absolute, slashless path like "/flight-manual".`,
    );
  }
  return path.join(clientOutDir, routePath.slice(1), 'index.html');
}

/**
 * Renders every route to a static HTML file in `clientOutDir`.
 *
 * Flow per route:
 *   1. Build a synthetic `Request` from the routePath. The SSR `render`
 *      function only consults the URL's pathname for routing, so the
 *      `http://localhost` origin is filler — it just has to parse as a
 *      valid URL.
 *   2. Call `render(request, shellData)` from the SSR bundle. This
 *      runs `createStaticHandler.query()`, which resolves the route's
 *      loader, which dynamically imports the lazy page module from the
 *      same SSR bundle. React Router's `<StaticRouterProvider>` then
 *      renders the matched tree to a string AND emits a `<script>` tag
 *      carrying the loader data, both inside the returned `html`.
 *   3. Substitute `<!--ssr-title-->` and `<!--ssr-outlet-->` in the
 *      transformed-by-Vite `index.html` template using the
 *      replacement-FUNCTION form. The string form of `String.replace`
 *      honours `$` patterns (`$$` → `$`), and the hydration `<script>`
 *      from step 2 contains Markdoc's `$$mdtype` markers — the string
 *      form would mangle them, breaking `Tag.isTag()` on the client and
 *      surfacing as "Objects are not valid as a React child" the moment
 *      hydration tries to re-render. Function form bypasses pattern
 *      processing entirely.
 *   4. Write to the route's `index.html`, creating parent directories
 *      as needed (e.g. `/flight-manual/safety` requires
 *      `dist/flight-manual/safety/`).
 *
 * The template is read once. Vite's client build has already produced
 * `dist/index.html` with the hashed entry `<script>` tag in place, so
 * every per-route file inherits the correct script reference for free.
 *
 * The SSR bundle import uses `pathToFileURL` because Node's ESM loader
 * rejects raw absolute Windows paths in `import()` ("ERR_UNSUPPORTED_ESM_URL_SCHEME").
 */
export async function runSsg(options: SsgRunnerOptions): Promise<void> {
  const { data, clientOutDir, ssrOutDir } = options;

  const templatePath = path.join(clientOutDir, 'index.html');
  const template = await fs.readFile(templatePath, 'utf-8');

  const ssrEntryPath = path.join(ssrOutDir, 'entry-server.js');
  const ssrEntryUrl = pathToFileURL(ssrEntryPath).href;
  const ssrModule = (await import(ssrEntryUrl)) as ServerRender;
  if (typeof ssrModule.render !== 'function') {
    throw new Error(
      `mordoc build: SSR bundle at ${ssrEntryPath} did not export a render() function.`,
    );
  }

  const shellData = toShellData(data);
  const titleHtml = escapeHtml(shellData.site.name);

  for (const page of data.pages) {
    const routePath = page.entry.routePath;
    const request = new Request(`http://localhost${routePath}`);
    const { html: appHtml } = await ssrModule.render(request, shellData);

    const withTitle = template.replace(SSR_TITLE_MARKER, () => titleHtml);
    const finalHtml = withTitle.replace(SSR_OUTLET_MARKER, () => appHtml);

    const outPath = toOutputPath(routePath, clientOutDir);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, finalHtml, 'utf-8');

    const relOut = path.relative(clientOutDir, outPath).replace(/\\/g, '/');
    console.log(`  ${routePath.padEnd(40)} → ${relOut}`);
  }
}
