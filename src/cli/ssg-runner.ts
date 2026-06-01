import path from 'node:path';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { toShellData } from '../pipeline.js';
import { detectCurrentLang } from '../utils/lang-utils.js';
import type { MordocData, ShellData } from '../types/pipeline.js';
import type { TransformedPage } from '../types/content.js';
import type { SiteConfig } from '../types/site.js';

/** Markers in `index.html` substituted at SSG time. */
const SSR_LANG_MARKER = '<!--ssr-lang-->';
const SSR_HEAD_MARKER = '<!--ssr-head-->';
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds the per-route `<head>` HTML injected at `<!--ssr-head-->`.
 *
 * Title format matches `Content.tsx`'s `document.title` assignment so
 * dev and prod are consistent: `Page Title — Site Name`.
 *
 * Always emits:
 *   - `<title>`, `<meta name="description">` (if available), `<link rel="icon">` (if configured)
 *   - `<link rel="canonical">` and `og:url` using `site.baseUrl + routePath`
 *   - `og:title`, `og:description` (falls back to site description when page has none)
 *
 * Emits conditionally from `site.metadata`:
 *   - `og:type` and `og:image` if declared
 *   - Full Twitter Card block (`twitter:card`, `twitter:site`, `twitter:title`,
 *     `twitter:description`, `twitter:image`) when `twitterCard` is declared — without
 *     `twitter:card` the other twitter tags have no effect, so the whole block is gated on it.
 */
function buildHeadHtml(
  page: TransformedPage,
  site: SiteConfig,
  faviconUrl: string | null,
  routePath: string,
): string {
  const pageTitle = page.frontmatter.title;
  const title = pageTitle
    ? `${escapeHtml(pageTitle)} — ${escapeHtml(site.name)}`
    : escapeHtml(site.name);

  // Page description with fallback to site description for social tags only.
  const pageDescription = page.frontmatter.description;
  const socialDescription = pageDescription ?? site.description;

  const canonicalUrl = `${site.baseUrl}${routePath}`;
  const meta = site.metadata;

  const parts = [`<title>${title}</title>`];

  if (pageDescription) {
    parts.push(`<meta name="description" content="${escapeHtml(pageDescription)}">`);
  }

  if (faviconUrl) {
    parts.push(`<link rel="icon" href="${escapeHtml(faviconUrl)}">`);
  }

  parts.push(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`);

  // OpenGraph
  parts.push(`<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`);
  parts.push(`<meta property="og:title" content="${escapeHtml(title)}">`);
  if (socialDescription) {
    parts.push(`<meta property="og:description" content="${escapeHtml(socialDescription)}">`);
  }
  if (meta?.ogType) {
    parts.push(`<meta property="og:type" content="${escapeHtml(meta.ogType)}">`);
  }
  if (meta?.ogImage) {
    parts.push(`<meta property="og:image" content="${escapeHtml(site.baseUrl + meta.ogImage)}">`);
  }

  // Twitter Card — the full block is only useful when twitter:card is present.
  if (meta?.twitterCard) {
    parts.push(`<meta name="twitter:card" content="${escapeHtml(meta.twitterCard)}">`);
    if (meta.twitterSite) {
      parts.push(`<meta name="twitter:site" content="${escapeHtml(meta.twitterSite)}">`);
    }
    parts.push(`<meta name="twitter:title" content="${escapeHtml(title)}">`);
    if (socialDescription) {
      parts.push(`<meta name="twitter:description" content="${escapeHtml(socialDescription)}">`);
    }
    if (meta.ogImage) {
      parts.push(`<meta name="twitter:image" content="${escapeHtml(site.baseUrl + meta.ogImage)}">`);
    }
  }

  return parts.join('\n  ');
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
 *   3. Substitute `<!--ssr-head-->` and `<!--ssr-outlet-->` in the
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

  for (const page of data.pages) {
    const routePath = page.entry.routePath;
    const request = new Request(`http://localhost${routePath}`);
    const { html: appHtml } = await ssrModule.render(request, shellData);

    const pageLang = detectCurrentLang(routePath, data.language, data.site.defaultLanguage);
    const headHtml = buildHeadHtml(page, data.site, data.assets.favicon, routePath);
    // lang is a plain ASCII code — string-form replace is safe (no $-patterns)
    const withLang = template.replace(SSR_LANG_MARKER, pageLang);
    const withHead = withLang.replace(SSR_HEAD_MARKER, () => headHtml);
    const finalHtml = withHead.replace(SSR_OUTLET_MARKER, () => appHtml);

    const outPath = toOutputPath(routePath, clientOutDir);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, finalHtml, 'utf-8');

    const relOut = path.relative(clientOutDir, outPath).replace(/\\/g, '/');
    console.log(`  ${routePath.padEnd(40)} → ${relOut}`);
  }
}
