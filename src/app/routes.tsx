import type { HydrationState, RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import pagesIndex from 'virtual:mordoc/pages-index';
import loaders from 'virtual:mordoc/page-loaders';
import { App } from './App.js';
import { Content } from './content/Content.js';
import { LandingPage } from './landing/LandingPage.js';
import { NotFound } from './not-found/NotFound.js';

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
 * The same loader function runs in two contexts; only the runtime
 * resolving the dynamic `import('virtual:mordoc/page/...')` differs:
 *   - Browser (CSR / post-hydration): native `import()` fetches the
 *     lazy chunk over HTTP (Vite-served virtual in dev, hashed JS in
 *     prod).
 *   - SSG (build time): the bundled SSR output's module map resolves
 *     it directly.
 * The component code (`useLoaderData()`) and the data shape (`PageData`)
 * are identical in both; only the resolution mechanism changes.
 *
 * Kept as its own module so the SSR entry reuses the same route list
 * against `createStaticHandler`/`createStaticRouter` without duplicating
 * logic.
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
      Component: pageIndex.layout === 'landing' ? LandingPage : Content,
      handle: { language: pageIndex.language, routePath: pageIndex.routePath, layout: pageIndex.layout ?? 'content' },
    };
    return pageIndex.routePath === '/'
      ? { index: true, ...common }
      : { path: pageIndex.routePath, ...common };
  });

  return [
    {
      path: '/',
      Component: App,
      HydrateFallback: () => null,
      children: [...pageRoutes, { path: '*', Component: NotFound }],
    },
  ];
}

/**
 * Creates the browser-side data router. Consumed by `main.tsx`.
 *
 * `hydrationData` should be passed when SSR has run for the initial
 * request — `<StaticRouterProvider>` serializes the loaders' results
 * into a `<script>` tag at render time, exposed on the client as
 * `window.__staticRouterHydrationData`. Threading it through here lets
 * the data router skip re-running the initial route's loader (which
 * would otherwise re-fetch the same lazy chunk that already produced
 * the SSR HTML).
 */
export function createAppRouter(hydrationData?: HydrationState) {
  return createBrowserRouter(buildRoutes(), { hydrationData });
}
