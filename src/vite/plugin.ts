import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { loadAssets } from '../config/assets-loader.js';
import type { ResolvedAssets } from '../types/assets.js';
import { loadSiteConfig } from '../config/site-loader.js';
import {
  loadNavigation,
  loadNavTranslations,
  loadHeaderLinks,
  replaceTransformedPage,
  reparsePage,
  runPipeline,
} from '../pipeline.js';
import type { MordocData } from '../types/pipeline.js';
import type { PageData, PageMeta, TransformedPage } from '../types/content.js';

/**
 * The set of "eager" virtual module IDs this plugin exposes.
 *
 * Eager = loaded up-front by the React client shell. They hold the
 * configs, a lightweight per-page route index, and a map of per-route
 * lazy loaders. None of them carry the heavy per-page content.
 *
 * Per-route page chunks live under the `virtual:mordoc/page/<routePath>`
 * prefix ({@link PAGE_MODULE_PREFIX}) and are loaded on navigation via
 * the `virtual:mordoc/page-loaders` map.
 */
export const EAGER_VIRTUAL_IDS = [
  'virtual:mordoc/site',
  'virtual:mordoc/language',
  'virtual:mordoc/navigation',
  'virtual:mordoc/assets',
  'virtual:mordoc/pages-index',
  'virtual:mordoc/page-loaders',
  'virtual:mordoc/translations',
  'virtual:mordoc/header-links',
] as const;

export type EagerVirtualId = typeof EAGER_VIRTUAL_IDS[number];

/**
 * Prefix for lazy per-route page modules.
 *
 * The full id is `${PAGE_MODULE_PREFIX}${routePath}`. Because every
 * routePath starts with `/`, concatenation yields clean ids like
 * `virtual:mordoc/page/flight-manual/safety`, and the root route `/`
 * yields `virtual:mordoc/page/` (trailing slash). No sentinels needed.
 */
export const PAGE_MODULE_PREFIX = 'virtual:mordoc/page';

/** Vite/Rollup convention: virtual modules are addressed with a leading null byte. */
const RESOLVED_PREFIX = '\0';

/** Virtual module ID for the user's optional config/styles/theme.css. */
const THEME_CSS_ID = 'virtual:mordoc/theme';
/** Resolved ID used when config/styles/theme.css does not exist — load returns empty. */
const RESOLVED_THEME_CSS_EMPTY = '\0virtual:mordoc/theme';

const EAGER_SET: ReadonlySet<string> = new Set(EAGER_VIRTUAL_IDS);

/**
 * Rewrites absolute disk paths in `ResolvedAssets` to `/_assets/<basename>`
 * web URLs so the browser can fetch them from the dev middleware.
 */
function rewriteAssetsForDev(assets: ResolvedAssets): ResolvedAssets {
  const toUrl = (p: string | null) =>
    p ? `/_assets/${path.basename(p)}` : null;
  return {
    favicon: toUrl(assets.favicon),
    logo: toUrl(assets.logo),
    logoDark: toUrl(assets.logoDark),
  };
}

/** True if `id` is a lazy per-route page module id (after prefix). */
function isPageModuleId(id: string): boolean {
  return id.startsWith(PAGE_MODULE_PREFIX + '/');
}

/** Extracts the routePath back out of a lazy page module id. */
function routePathFromPageModuleId(id: string): string {
  return id.slice(PAGE_MODULE_PREFIX.length);
}

/**
 * Projects a `TransformedPage` down to its route identity.
 *
 * Everything else the page carries (frontmatter, TOC, renderable tree)
 * ships with the per-route lazy chunk that the shell only fetches on
 * navigation. See the rationale in the `PageMeta` type's doc comment.
 */
function toPageMeta(page: TransformedPage): PageMeta {
  const meta: PageMeta = {
    routePath: page.entry.routePath,
    language: page.entry.language,
  };
  if (page.frontmatter.layout === 'landing') {
    meta.layout = 'landing';
  }
  if (page.entry.isFallback) {
    meta.isFallback = true;
  }
  return meta;
}

/**
 * Projects a `TransformedPage` into the shape shipped by the per-route
 * lazy module — i.e. the payload of `virtual:mordoc/page/<routePath>`.
 */
function toPageData(page: TransformedPage): PageData {
  return {
    renderable: page.renderable,
    frontmatter: page.frontmatter,
    toc: page.toc,
  };
}

/**
 * Builds the JS source for the `virtual:mordoc/page-loaders` module.
 *
 * Unlike the other eager modules this one can't just JSON-stringify its
 * payload: it needs to emit real JS containing a literal `import()`
 * expression per route. Emitting literals (rather than one dynamic
 * `import(\`…${routePath}\`)` at the call site) is what lets Vite/Rollup
 * statically analyze, code-split, and preload each route's chunk.
 *
 * Output shape:
 *   export default {
 *     "/": () => import("virtual:mordoc/page/"),
 *     "/flight-manual": () => import("virtual:mordoc/page/flight-manual"),
 *     ...
 *   };
 *
 * `JSON.stringify` is used for both the object keys and the import
 * specifiers — valid JSON strings are valid JS strings, so it handles
 * any escaping the routePath might require.
 */
function generatePageLoadersSource(data: MordocData): string {
  if (data.pages.length === 0) {
    return 'export default {};';
  }
  const entries = data.pages.map((page) => {
    const routePath = page.entry.routePath;
    const key = JSON.stringify(routePath);
    const specifier = JSON.stringify(`${PAGE_MODULE_PREFIX}${routePath}`);
    return `  ${key}: () => import(${specifier})`;
  });
  return `export default {\n${entries.join(',\n')}\n};`;
}

/**
 * Builds the JS source for a given *eager* virtual module.
 * Returns null if the id isn't one of ours.
 *
 * Pure function — no I/O, no Vite dependency. The plugin's `load` hook
 * uses it at runtime; the `validate` CLI uses it to preview output for
 * inspection without spinning up a dev server.
 *
 * Most cases emit plain `export default ${JSON.stringify(...)}` — a JSON
 * literal is also a valid JS expression, and renderable trees are plain
 * Markdoc Tag objects, also JSON-safe. The `page-loaders` case diverges
 * because it must emit literal `import()` expressions rather than data.
 *
 * Lazy per-route modules (`virtual:mordoc/page/<routePath>`) go through
 * {@link generatePageModule} instead.
 */
export function generateVirtualModule(id: string, data: MordocData): string | null {
  switch (id) {
    case 'virtual:mordoc/site':
      return `export default ${JSON.stringify(data.site)};`;
    case 'virtual:mordoc/language':
      return `export default ${JSON.stringify(data.language)};`;
    case 'virtual:mordoc/navigation':
      return `export default ${JSON.stringify(data.navigation)};`;
    case 'virtual:mordoc/assets':
      return `export default ${JSON.stringify(data.assets)};`;
    case 'virtual:mordoc/pages-index':
      return `export default ${JSON.stringify(data.pages.map(toPageMeta))};`;
    case 'virtual:mordoc/page-loaders':
      return generatePageLoadersSource(data);
    case 'virtual:mordoc/translations':
      return `export default ${JSON.stringify(data.translations)};`;
    case 'virtual:mordoc/header-links':
      return `export default ${JSON.stringify(data.headerLinks)};`;
    default:
      return null;
  }
}

/**
 * Builds the JS source for the lazy `virtual:mordoc/page/<routePath>`
 * module that carries a single page's full `PageData`. Returns null if
 * no page matches the given routePath.
 *
 * Pure function, mirrors {@link generateVirtualModule} for the lazy side.
 */
export function generatePageModule(routePath: string, data: MordocData): string | null {
  const page = data.pages.find((p) => p.entry.routePath === routePath);
  if (!page) return null;
  return `export default ${JSON.stringify(toPageData(page))};`;
}

/**
 * absPath must be normalized absolute path.
 */
function forwardProjectRel(projectRoot: string, absPath: string): string | null {
  const rel = path.relative(projectRoot, absPath).split(path.sep).join('/');
  if (rel.startsWith('..')) return null;
  return rel;
}

function resolvedVirtualId(virtualId: string): string {
  return RESOLVED_PREFIX + virtualId;
}

/**
 * Invalidates a virtual module in both the client and SSR module graphs.
 *
 * Every dev-mode update in this file ends in an explicit `full-reload`
 * (see {@link applyMordocWatchBatch} and {@link rerunPipelineForDev}) rather
 * than granular Vite HMR, so this only needs to mark the module stale —
 * it does *not* call `server.reloadModule()`, which would trigger Vite's
 * own HMR propagation and, finding no `import.meta.hot.accept()` boundary
 * for any of these modules, send its own premature `full-reload` from
 * inside that call. Invalidation is still required even though we're about
 * to hard-reload: Vite's transform cache lives on the long-running dev
 * server process, not the browser tab, so without it the post-reload page
 * would be served the same stale cached output despite `data` having been
 * updated.
 */
function invalidateVirtualModule(server: ViteDevServer, virtualId: string): void {
  const resolvedId = resolvedVirtualId(virtualId);

  const clientMod = server.moduleGraph.getModuleById(resolvedId);
  if (clientMod) {
    server.moduleGraph.invalidateModule(clientMod);
  }

  const ssrMod = server.environments.ssr.moduleGraph.getModuleById(resolvedId);
  if (ssrMod) {
    server.environments.ssr.moduleGraph.invalidateModule(ssrMod);
  }
}

/**
 * Invalidates every known virtual module — all eager ids plus every page's
 * lazy module. Used after a full pipeline re-run, where potentially
 * anything (route set, navigation, every page) may have changed, so there's
 * no cheaper way to know which specific ids are now stale.
 */
function invalidateAllMordocVirtualModules(
  server: ViteDevServer,
  pages: TransformedPage[],
): void {
  for (const id of EAGER_VIRTUAL_IDS) {
    invalidateVirtualModule(server, id);
  }
  for (const page of pages) {
    invalidateVirtualModule(server, `${PAGE_MODULE_PREFIX}${page.entry.routePath}`);
  }
}

type WatchEvent = 'add' | 'change' | 'unlink';

/** Applies a debounced batch of `content/` + `config/` file events for dev HMR. */
async function applyMordocWatchBatch(
  server: ViteDevServer,
  projectRoot: string,
  batch: Map<string, WatchEvent>,
  getData: () => MordocData | null,
  setData: (next: MordocData) => void,
): Promise<void> {
  const data = getData();
  if (!data || batch.size === 0) return;

  const rels = [...batch.keys()]
    .map((abs) => ({ abs, rel: forwardProjectRel(projectRoot, abs) }))
    .filter((x): x is { abs: string; rel: string } => x.rel !== null);

  const contentEvents = rels.filter(({ rel }) => rel.startsWith('content/'));
  const configEvents = rels.filter(({ rel }) => rel.startsWith('config/'));

  const hasContentStructural = contentEvents.some(
    ({ abs }) => batch.get(abs) !== 'change',
  );

  // Structural content changes (route set may differ), language.json
  // (can add/remove fallback pages), and variables.yaml (invalidates every
  // page's transform output) all require re-running the full pipeline —
  // a targeted reparse isn't safe/sufficient for any of these.
  const needsFullPipeline =
    hasContentStructural ||
    configEvents.some(
      ({ rel }) => rel === 'config/language.json' || rel === 'config/variables.yaml',
    );

  if (needsFullPipeline) {
    await rerunPipelineForDev(server, projectRoot, getData, setData);
    return;
  }

  // Below this point, every branch recomputes only the specific slice of
  // `data` its file(s) affect and invalidates only the matching virtual
  // id(s) — cheaper than a full pipeline re-run. `changed` tracks whether
  // any branch actually did work, since a batch may contain only
  // unrecognized config paths. Every update, targeted or not, ends in the
  // same explicit `full-reload` (see the module-level comment on
  // `invalidateVirtualModule` for why this is a deliberate simplification
  // rather than granular Vite HMR).
  let changed = false;

  const siteRel = 'config/site.json';
  if (configEvents.some(({ rel }) => rel === siteRel)) {
    const site = await loadSiteConfig(projectRoot);
    if (site.defaultLanguage !== data.site.defaultLanguage) {
      await rerunPipelineForDev(server, projectRoot, getData, setData);
      return;
    }
    data.site = site;
    invalidateVirtualModule(server, 'virtual:mordoc/site');
    changed = true;
  }

  const isNavStructureChange = configEvents.some(
    ({ rel }) =>
      rel.startsWith('config/navigation/') &&
      !rel.startsWith('config/navigation/translations/'),
  );
  const isTranslationsChange = configEvents.some(({ rel }) =>
    rel.startsWith('config/navigation/translations/'),
  );

  if (isNavStructureChange) {
    data.navigation = await loadNavigation(projectRoot);
    data.headerLinks = await loadHeaderLinks(projectRoot);
    invalidateVirtualModule(server, 'virtual:mordoc/navigation');
    invalidateVirtualModule(server, 'virtual:mordoc/header-links');
    changed = true;
  }

  if (isTranslationsChange) {
    data.translations = await loadNavTranslations(
      projectRoot,
      data.language?.languages ?? [data.site.defaultLanguage],
      data.site.defaultLanguage,
    );
    invalidateVirtualModule(server, 'virtual:mordoc/translations');
    changed = true;
  }

  const isAssetsPath = (rel: string) =>
    rel === 'config/assets' || rel.startsWith('config/assets/');
  if (configEvents.some(({ rel }) => isAssetsPath(rel))) {
    data.assets = await loadAssets(projectRoot);
    invalidateVirtualModule(server, 'virtual:mordoc/assets');
    changed = true;
  }

  for (const { abs, rel } of contentEvents) {
    if (batch.get(abs) !== 'change') continue;
    if (!rel.toLowerCase().endsWith('.md')) continue;

    // A default-language file may serve as the filePath for multiple entries:
    // the real entry plus any synthetic fallback entries for other languages.
    // Find all of them so the reparse stays consistent across the whole
    // fallback set.
    const matchingPages = data.pages.filter(
      (p) => path.normalize(p.entry.filePath) === abs,
    );
    if (matchingPages.length === 0) {
      await rerunPipelineForDev(server, projectRoot, getData, setData);
      return;
    }
    for (const page of matchingPages) {
      const reparsed = await reparsePage(page.entry, data.variables);
      replaceTransformedPage(data, reparsed);
      invalidateVirtualModule(server, `${PAGE_MODULE_PREFIX}${reparsed.entry.routePath}`);
    }
    changed = true;
  }

  if (changed) {
    server.ws.send({ type: 'full-reload', path: '*' });
  }
}

/**
 * Re-runs the full pipeline and reloads the browser.
 *
 * Used whenever a change is broad enough that a targeted recompute isn't
 * safe (new/removed content, language.json, variables.yaml, a default
 * language change, or an edited file that doesn't match any known page).
 * Since potentially everything changed, every virtual module is
 * invalidated rather than computing a precise subset.
 */
async function rerunPipelineForDev(
  server: ViteDevServer,
  projectRoot: string,
  getData: () => MordocData | null,
  setData: (next: MordocData) => void,
): Promise<void> {
  const prev = getData();
  if (!prev) return;
  const next = await runPipeline(projectRoot);
  setData(next);
  invalidateAllMordocVirtualModules(server, next.pages);
  server.ws.send({ type: 'full-reload', path: '*' });
}

/**
 * Options for dev mode. The plugin runs the pipeline itself inside
 * `buildStart` and keeps the result in memory for HMR updates.
 */
interface MordocVitePluginDevOptions {
  projectRoot: string;
  mode: 'dev';
}

/**
 * Options for build mode. The caller must pre-load `data` by running the
 * pipeline once and passing the result here.
 *
 * The build command runs Vite twice (once for the client bundle, once for
 * the SSR entry) and both passes need the same `MordocData`. Pre-loading
 * avoids running the pipeline twice and gives the build command a single
 * point at which to mutate the data (e.g. rewriting asset paths) before
 * either Vite pass starts.
 */
interface MordocVitePluginBuildOptions {
  projectRoot: string;
  mode: 'build';
  data: MordocData;
}

/**
 * Options for {@link mordocVitePlugin}.
 *
 * The `mode` field is a discriminant that controls two behaviours:
 *  - `configureServer` (file watching / HMR) is registered only in dev.
 *    In build mode Vite runs once and exits, so watching is never needed.
 *  - `virtual:mordoc/assets` rewrites disk paths to `/_assets/<basename>`
 *    web URLs only in dev, where the dev-server middleware serves them.
 *    In build mode `copyAndRewriteAssets` handles the rewrite before the
 *    plugin receives the data.
 */
export type MordocVitePluginOptions = MordocVitePluginDevOptions | MordocVitePluginBuildOptions;

/**
 * Vite plugin that exposes a Mordoc project's data to the React client
 * via virtual modules.
 *
 * Lifecycle:
 *   - `buildStart`: runs the pipeline once and caches the result.
 *     Fires in both dev (when the server starts) and build (before bundling).
 *     In build mode the caller pre-loads `data` so the pipeline is skipped.
 *   - `resolveId` / `load`: serves the cached data as virtual ES modules.
 *     Eager modules (configs, route index, loader map) resolve by exact id.
 *     Lazy per-route page modules resolve by `PAGE_MODULE_PREFIX` match.
 *   - `configureServer` (dev mode only): watches `content/` and `config/`,
 *     refreshes the in-memory pipeline cache — either a targeted recompute
 *     (single-page reparse, a single config loader) or a full `runPipeline`
 *     re-run when the change is broad enough that a targeted update isn't
 *     safe — invalidates the affected virtual module(s) so Vite's transform
 *     cache doesn't serve stale output, and always ends in an explicit
 *     `full-reload`. See {@link applyMordocWatchBatch}.
 *
 * Asset paths: in dev mode `virtual:mordoc/assets` emits `/_assets/<basename>`
 * web URLs and `configureServer` registers a middleware that serves those files
 * from `<projectRoot>/config/assets/`. In build mode `copyAndRewriteAssets`
 * handles the rewrite before the plugin receives the data.
 */
export function mordocVitePlugin(options: MordocVitePluginOptions): Plugin {
  // Build mode always provides data upfront; dev mode starts null and
  // buildStart populates it. The discriminated union on `mode` enforces this.
  let data: MordocData | null = options.mode === 'dev' ? null : options.data;

  return {
    name: 'mordoc',

    async buildStart() {
      // Dev mode: run the pipeline now. The result is kept in memory and
      // updated incrementally by the file watcher throughout the session.
      // Build mode: data was pre-loaded by the caller — nothing to do here.
      if (options.mode === 'dev') {
        data = await runPipeline(options.projectRoot);
      }
    },

    configureServer(server) {
      if (options.mode === 'build') {
        return;
      }
      const projectRoot = options.projectRoot;
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      const pending = new Map<string, WatchEvent>();

      // Processes whatever file events have accumulated in `pending` since
      // the last flush. Runs on a timer (see `schedule` below), not per-event.
      const flush = async () => {
        debounceTimer = null;
        if (pending.size === 0) return;
        if (!data) {
          // buildStart's runPipeline() hasn't resolved yet — reschedule
          // instead of dropping these events, since applyMordocWatchBatch
          // needs the current MordocData snapshot to diff against.
          debounceTimer = setTimeout(flush, 50);
          return;
        }
        // Snapshot + clear immediately so any events that arrive while
        // applyMordocWatchBatch is awaiting go into a fresh `pending` map
        // for the *next* flush, rather than being lost or mutated mid-batch.
        const batch = new Map(pending);
        pending.clear();
        try {
          await applyMordocWatchBatch(
            server,
            projectRoot,
            batch,
            () => data,
            (next) => {
              data = next;
            },
          );
        } catch (err) {
          // A targeted incremental update failed — fall back to rebuilding
          // everything from scratch and forcing the browser to reload, so a
          // bug in the incremental path can't leave the dev server serving
          // stale or inconsistent data.
          console.error('[mordoc] watch update failed:', err);
          try {
            const recovered = await runPipeline(projectRoot);
            data = recovered;
            invalidateAllMordocVirtualModules(server, recovered.pages);
            server.ws.send({ type: 'full-reload', path: '*' });
          } catch (recoverErr) {
            console.error('[mordoc] watch recovery failed:', recoverErr);
          }
        }
      };

      // Records an event and (re)starts the debounce timer. Called once per
      // matching file-system event; `flush` only fires 75ms after the last
      // one, so a burst of saves (editors often write several times per
      // save) collapses into a single flush.
      const schedule = (absPath: string, event: WatchEvent) => {
        pending.set(absPath, event);
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(flush, 75);
      };

      // Vite's watcher only covers files already part of the module graph
      // by default; content/config files are read directly off disk rather
      // than imported, so they must be added explicitly to be watched.
      server.watcher.add(path.join(projectRoot, 'content'));
      server.watcher.add(path.join(projectRoot, 'config'));

      server.watcher.on('all', (event, rawPath) => {
        // Ignore watcher events we don't handle (e.g. directory add/unlink).
        if (event !== 'add' && event !== 'change' && event !== 'unlink') return;
        const absPath = path.normalize(String(rawPath));
        const rel = forwardProjectRel(projectRoot, absPath);
        // Path is outside the project root, or otherwise not expressible
        // as a forward-slash relative path.
        if (!rel) return;
        // Only content/config changes affect MordocData; ignore anything
        // else the watcher happens to report (e.g. from a broader chokidar
        // config elsewhere).
        if (!rel.startsWith('content/') && !rel.startsWith('config/')) return;
        schedule(absPath, event as WatchEvent);
      });
    },

    resolveId(id) {
      if (id === THEME_CSS_ID) {
        const themePath = path.join(options.projectRoot, 'config', 'styles', 'theme.css');
        return fs.existsSync(themePath) ? themePath : RESOLVED_THEME_CSS_EMPTY;
      }
      if (EAGER_SET.has(id) || isPageModuleId(id)) {
        return RESOLVED_PREFIX + id;
      }
      return null;
    },

    load(id) {
      if (id === RESOLVED_THEME_CSS_EMPTY) return '';
      if (!id.startsWith(RESOLVED_PREFIX)) return null;
      const virtualId = id.slice(RESOLVED_PREFIX.length);
      const isEager = EAGER_SET.has(virtualId);
      const isPage = isPageModuleId(virtualId);
      if (!isEager && !isPage) return null;
      if (!data) {
        // buildStart populates `data` before any load can happen; this
        // guard exists only to surface an unexpected lifecycle ordering
        // rather than silently emit a broken module.
        throw new Error(
          `mordoc plugin: load("${id}") called before buildStart populated data.`,
        );
      }
      if (isEager) {
        // In dev mode, rewrite asset disk paths to /_assets/ web URLs so the
        // browser can fetch them via the dev-server asset middleware.
        // In build mode copyAndRewriteAssets already handled this rewrite.
        if (virtualId === 'virtual:mordoc/assets' && options.mode === 'dev') {
          return generateVirtualModule(virtualId, {
            ...data,
            assets: rewriteAssetsForDev(data.assets),
          });
        }
        return generateVirtualModule(virtualId, data);
      }
      const routePath = routePathFromPageModuleId(virtualId);
      const source = generatePageModule(routePath, data);
      if (source === null) {
        // Reaching here means a consumer imported a page module for a
        // routePath that isn't in the pipeline output. The static
        // `page-loaders` map only emits entries for known pages, so this
        // should be unreachable in normal operation.
        throw new Error(
          `mordoc plugin: no page found for routePath "${routePath}" (id: ${id}).`,
        );
      }
      return source;
    },
  };
}
