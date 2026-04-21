import type { Plugin } from 'vite';
import { runPipeline } from '../pipeline.js';
import type { MordocData } from '../types/pipeline.js';
import type { PageMeta, TransformedPage } from '../types/content.js';

/**
 * The set of "eager" virtual module IDs this plugin exposes.
 *
 * Eager = loaded up-front by the React client shell. These are small
 * modules holding the configs and a lightweight per-page metadata index
 * (no per-page renderable trees).
 *
 * Per-route page chunks (`virtual:mordoc/page/<routePath>`) are added in
 * a later step and lazy-loaded on navigation.
 */
export const EAGER_VIRTUAL_IDS = [
  'virtual:mordoc/site',
  'virtual:mordoc/language',
  'virtual:mordoc/navigation',
  'virtual:mordoc/assets',
  'virtual:mordoc/pages',
] as const;

export type EagerVirtualId = typeof EAGER_VIRTUAL_IDS[number];

/** Vite/Rollup convention: virtual modules are addressed with a leading null byte. */
const RESOLVED_PREFIX = '\0';

const EAGER_SET: ReadonlySet<string> = new Set(EAGER_VIRTUAL_IDS);

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
 * Builds the JS source for a virtual module given a Mordoc data set.
 * Returns null if the id isn't one of ours.
 *
 * Pure function — no I/O, no Vite dependency. The plugin's `load` hook
 * uses it at runtime; the `validate` CLI uses it to preview output for
 * inspection without spinning up a dev server.
 *
 * `JSON.stringify` is safe as ES module source because every JSON literal
 * is also a valid JS expression. Renderable trees (which the per-page
 * lazy chunks will eventually emit) are plain Markdoc Tag objects — also
 * JSON-safe.
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
    case 'virtual:mordoc/pages':
      return `export default ${JSON.stringify(data.pages.map(toPageMeta))};`;
    default:
      return null;
  }
}

export interface MordocVitePluginOptions {
  /** Absolute path to the user's project root. */
  projectRoot: string;
}

/**
 * Vite plugin that exposes a Mordoc project's data to the React client
 * via virtual modules.
 *
 * Lifecycle:
 *   - `buildStart`: runs the pipeline once and caches the result.
 *     Fires in both dev (when the server starts) and prod (before bundling).
 *   - `resolveId` / `load`: serves the cached data as virtual ES modules.
 *
 * HMR (granular re-runs on file changes) and the per-page lazy chunks
 * are deferred to subsequent steps. This scaffold establishes the contract
 * and gives the React client something to import against.
 *
 * Note: asset paths in `virtual:mordoc/assets` are still absolute disk
 * paths at this stage. Translating them to browser-fetchable URLs is part
 * of the deferred asset-serving design.
 */
export function mordocVitePlugin(options: MordocVitePluginOptions): Plugin {
  let data: MordocData | null = null;

  return {
    name: 'mordoc',

    async buildStart() {
      data = await runPipeline(options.projectRoot);
    },

    resolveId(id) {
      if (EAGER_SET.has(id)) {
        return RESOLVED_PREFIX + id;
      }
      return null;
    },

    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return null;
      const virtualId = id.slice(RESOLVED_PREFIX.length);
      if (!EAGER_SET.has(virtualId)) return null;
      if (!data) {
        // buildStart populates `data` before any load can happen; this
        // guard exists only to surface an unexpected lifecycle ordering
        // rather than silently emit a broken module.
        throw new Error(
          `mordoc plugin: load("${id}") called before buildStart populated data.`,
        );
      }
      return generateVirtualModule(virtualId, data);
    },
  };
}
