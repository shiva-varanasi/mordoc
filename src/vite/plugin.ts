import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { loadAssets } from '../config/assets-loader.js';
import { loadSiteConfig } from '../config/site-loader.js';
import {
  loadNavigation,
  loadTranslations,
  pagesRouteSignature,
  replaceTransformedPage,
  reparsePage,
  runPipeline,
} from '../pipeline.js';
import type { MordocData, ShellData } from '../types/pipeline.js';
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

const EAGER_SET: ReadonlySet<string> = new Set(EAGER_VIRTUAL_IDS);

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
  return {
    routePath: page.entry.routePath,
    language: page.entry.language,
  };
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

async function reloadVirtualModule(server: ViteDevServer, virtualId: string): Promise<void> {
  const resolvedId = resolvedVirtualId(virtualId);

  // Invalidate in the client module graph + trigger HMR
  const clientMod = server.moduleGraph.getModuleById(resolvedId);
  if (clientMod) {
    server.moduleGraph.invalidateModule(clientMod);
  }

  // Invalidate in the SSR module graph so ssrLoadModule re-runs load()
  const ssrMod = server.environments.ssr.moduleGraph.getModuleById(resolvedId);
  if (ssrMod) {
    server.environments.ssr.moduleGraph.invalidateModule(ssrMod);
  }

  // Trigger HMR for the client side
  if (clientMod) {
    await server.reloadModule(clientMod);
  }
}

async function reloadAllMordocVirtualModules(
  server: ViteDevServer,
  pages: TransformedPage[],
): Promise<void> {
  for (const id of EAGER_VIRTUAL_IDS) {
    await reloadVirtualModule(server, id);
  }
  for (const page of pages) {
    await reloadVirtualModule(server, `${PAGE_MODULE_PREFIX}${page.entry.routePath}`);
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

  // Any new/removed path under content ⇒ re-run pipeline.
  if (hasContentStructural) {
    await rerunPipelineForDev(server, projectRoot, getData, setData);
    return;
  }

  if (configEvents.some(({ rel }) => rel === 'config/language.json')) {
    await rerunPipelineForDev(server, projectRoot, getData, setData);
    return;
  }

  const siteRel = 'config/site.json';
  if (configEvents.some(({ rel }) => rel === siteRel)) {
    const site = await loadSiteConfig(projectRoot);
    if (site.defaultLanguage !== data.site.defaultLanguage) {
      await rerunPipelineForDev(server, projectRoot, getData, setData);
      return;
    }
    data.site = site;
    await reloadVirtualModule(server, 'virtual:mordoc/site');
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
    await reloadVirtualModule(server, 'virtual:mordoc/navigation');
  }

  if (isTranslationsChange) {
    data.translations = await loadTranslations(
      projectRoot,
      data.language?.languages ?? [data.site.defaultLanguage],
      data.site.defaultLanguage,
    );
    await reloadVirtualModule(server, 'virtual:mordoc/translations');
  }

  const isAssetsPath = (rel: string) =>
    rel === 'config/assets' || rel.startsWith('config/assets/');
  if (configEvents.some(({ rel }) => isAssetsPath(rel))) {
    data.assets = await loadAssets(projectRoot);
    await reloadVirtualModule(server, 'virtual:mordoc/assets');
  }

  /**
   * Dev: invalidate lazy virtual page modules so SSR re-runs `load()` with fresh
   * `data`, then full document reload so the new HTML and `__staticRouterHydrationData`
   * match.
   */
  const reparsedVirtualIds: string[] = [];
  for (const { abs, rel } of contentEvents) {
    if (batch.get(abs) !== 'change') continue;
    if (!rel.toLowerCase().endsWith('.md')) continue;

    const page = data.pages.find((p) => path.normalize(p.entry.filePath) === abs);
    if (!page) {
      await rerunPipelineForDev(server, projectRoot, getData, setData);
      return;
    }
    const reparsed = await reparsePage(page.entry);
    replaceTransformedPage(data, reparsed);
    reparsedVirtualIds.push(`${PAGE_MODULE_PREFIX}${reparsed.entry.routePath}`);
  }
  if (reparsedVirtualIds.length > 0) {
    for (const virtualId of reparsedVirtualIds) {
      await reloadVirtualModule(server, virtualId);
    }
    server.ws.send({ type: 'full-reload', path: '*' });
  }
}

async function rerunPipelineForDev(
  server: ViteDevServer,
  projectRoot: string,
  getData: () => MordocData | null,
  setData: (next: MordocData) => void,
): Promise<void> {
  const prev = getData();
  if (!prev) return;
  const prevSig = pagesRouteSignature(prev.pages);
  const next = await runPipeline(projectRoot);
  const nextSig = pagesRouteSignature(next.pages);
  setData(next);
  if (prevSig !== nextSig) {
    server.ws.send({ type: 'full-reload', path: '*' });
    return;
  }
  await reloadAllMordocVirtualModules(server, next.pages);
}

export interface MordocVitePluginOptions {
  /** Absolute path to the user's project root. */
  projectRoot: string;
  /**
   * Pre-loaded pipeline output. When provided, the plugin skips its own
   * `runPipeline(projectRoot)` call in `buildStart` and uses this value
   * directly.
   *
   * The build command runs Vite twice (once for the client, once for the
   * SSR entry) and both passes need the same `MordocData`. Letting the
   * caller compute it once and inject it here avoids running the pipeline
   * twice per build, and gives the build command a single point at which
   * to mutate the data (e.g. rewriting asset paths) before either Vite
   * pass starts.
   *
   * Dev path passes `projectRoot` only; this remains unset and the
   * plugin runs the pipeline itself, exactly as before.
   */
  data?: MordocData;
}

/**
 * Public surface of the plugin's `api` object.
 *
 * Vite's plugin `api` field is the standard, documented mechanism for a
 * plugin to expose values to other plugins or to the embedding server
 * (e.g. our `dev.ts` middleware). Using it instead of module-level state
 * keeps the boundary explicit and re-runnable: each `mordocVitePlugin()`
 * invocation has its own cache and its own api.
 *
 * Today only `getShellData` is exposed. The SSG runner will hang the same
 * pattern off this object when it lands.
 */
export interface MordocVitePluginApi {
  /**
   * Returns the lightweight `ShellData` projection of the cached pipeline
   * output. The projection happens inside the plugin so callers never see
   * `TransformedPage[]`, keeping the SSR boundary content-free.
   *
   * Throws if called before `buildStart` has populated the cache. In
   * normal Vite lifecycle, `buildStart` for all plugins completes inside
   * `server.listen()` before any HTTP request can reach middleware, so
   * this should be unreachable in practice.
   */
  getShellData(): ShellData;
}

/**
 * Vite plugin that exposes a Mordoc project's data to the React client
 * via virtual modules.
 *
 * Lifecycle:
 *   - `buildStart`: runs the pipeline once and caches the result.
 *     Fires in both dev (when the server starts) and prod (before bundling).
 *   - `resolveId` / `load`: serves the cached data as virtual ES modules.
 *     Eager modules (configs, route index, loader map) resolve by exact id.
 *     Lazy per-route page modules resolve by `PAGE_MODULE_PREFIX` match.
 *   - `api.getShellData()`: lets the dev middleware (and later the SSG
 *     runner) read the same cached data the virtual modules expose,
 *     pre-projected to the SSR-shaped `ShellData`.
 *   - `configureServer` (dev only, when `data` is not injected): watches
 *     `content/` and `config/`, refreshes the in-memory pipeline cache,
 *     triggers `reloadModule` for config-only eager updates, runs `runPipeline`
 *     when the route set may change, and sends a **full document reload** after
 *     granular `.md` edits so React Router picks up fresh loader data (invalidate
 *     lazy virtuals for SSR, then **full document reload**).
 *
 * Note: asset paths in `virtual:mordoc/assets` are still absolute disk
 * paths at this stage. Translating them to browser-fetchable URLs is part
 * of the deferred asset-serving design.
 */
export function mordocVitePlugin(options: MordocVitePluginOptions): Plugin {
  // Seed the cache from the caller if data was injected; otherwise it
  // gets filled by buildStart's own runPipeline call. Either way, every
  // hook below sees a populated `data` by the time it runs.
  let data: MordocData | null = options.data ?? null;

  const api: MordocVitePluginApi = {
    getShellData(): ShellData {
      if (!data) {
        throw new Error(
          'mordoc plugin: getShellData() called before buildStart populated the cache.',
        );
      }
      return {
        site: data.site,
        language: data.language,
        navigation: data.navigation,
        assets: data.assets,
        pagesIndex: data.pages.map(toPageMeta),
        translations: data.translations,
      };
    },
  };

  return {
    name: 'mordoc',
    api,

    async buildStart() {
      // Skip the pipeline if the caller already supplied data — the build
      // command does this so the client and SSR Vite passes share one
      // pipeline result. Dev (no `data`) still runs it here.
      if (!data) {
        data = await runPipeline(options.projectRoot);
      }
    },

    configureServer(server) {
      if (options.data) {
        return;
      }
      const projectRoot = options.projectRoot;
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      const pending = new Map<string, WatchEvent>();

      const flush = async () => {
        debounceTimer = null;
        if (pending.size === 0) return;
        if (!data) {
          debounceTimer = setTimeout(flush, 50);
          return;
        }
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
          console.error('[mordoc] watch update failed:', err);
          try {
            const recovered = await runPipeline(projectRoot);
            data = recovered;
            await reloadAllMordocVirtualModules(server, recovered.pages);
            server.ws.send({ type: 'full-reload', path: '*' });
          } catch (recoverErr) {
            console.error('[mordoc] watch recovery failed:', recoverErr);
          }
        }
      };

      const schedule = (absPath: string, event: WatchEvent) => {
        pending.set(absPath, event);
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(flush, 75);
      };

      server.watcher.add(path.join(projectRoot, 'content'));
      server.watcher.add(path.join(projectRoot, 'config'));

      server.watcher.on('all', (event, rawPath) => {
        if (event !== 'add' && event !== 'change' && event !== 'unlink') return;
        const absPath = path.normalize(String(rawPath));
        const rel = forwardProjectRel(projectRoot, absPath);
        if (!rel) return;
        if (!rel.startsWith('content/') && !rel.startsWith('config/')) return;
        schedule(absPath, event as WatchEvent);
      });
    },

    resolveId(id) {
      if (EAGER_SET.has(id) || isPageModuleId(id)) {
        return RESOLVED_PREFIX + id;
      }
      return null;
    },

    load(id) {
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
