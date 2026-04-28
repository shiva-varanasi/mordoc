import type { RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import pagesIndex from 'virtual:mordoc/pages-index';
import loaders from 'virtual:mordoc/page-loaders';
import { App } from './App.js';
import { Page } from './Page.js';
import { NotFound } from './NotFound.js';

/**
 * Builds the React Router route config from Mordoc's eager virtual
 * modules.
 *
 * Shape: one root layout route (`App`) whose children are all known
 * pages plus a catch-all `*` for 404s. Absolute child paths are used
 * so each route's `path` matches its `PageMeta.routePath` identity
 * verbatim — no slice/join tricks, easier to reason about.
 *
 * Each route's `loader` resolves the matching lazy
 * `virtual:mordoc/page/<routePath>` module via the pre-built
 * `page-loaders` map. The map is what lets Vite statically code-split:
 * every specifier inside it is a literal `import("...")` string.
 *
 * Kept as its own module so the (future) SSR entry can reuse the same
 * route list against `createStaticRouter` without duplicating logic.
 */
export function buildRoutes(): RouteObject[] {
  const pageRoutes: RouteObject[] = pagesIndex.map((pageIndex) => {
    const pageLoader = loaders[pageIndex.routePath];
    if (!pageLoader) {
      // Defensive: the plugin emits `page-loaders` and `pages-index` from the
      // same pipeline output, so they should always agree. A mismatch
      // here means the eager modules went out of sync — surface it
      // loudly at app bootstrap rather than during navigation.
      throw new Error(
        `mordoc: no page loader found for routePath "${pageIndex.routePath}". ` +
          `virtual:mordoc/pages-index and virtual:mordoc/page-loaders are out of sync.`,
      );
    }
    const common = {
      loader: async () => (await pageLoader()).default,
      Component: Page,
      handle: { language: pageIndex.language, routePath: pageIndex.routePath },
    };
    return pageIndex.routePath === '/'
      ? { index: true, ...common }
      : { path: pageIndex.routePath, ...common };
  });

  return [
    {
      path: '/',
      Component: App,
      children: [...pageRoutes, { path: '*', Component: NotFound }],
    },
  ];
}

/** Creates the browser-side data router. Consumed by `main.tsx`. */
export function createAppRouter() {
  return createBrowserRouter(buildRoutes());
}
