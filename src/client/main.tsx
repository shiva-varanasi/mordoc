import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import site from 'virtual:mordoc/site';
import language from 'virtual:mordoc/language';
import navigation from 'virtual:mordoc/navigation';
import assets from 'virtual:mordoc/assets';
import pagesIndex from 'virtual:mordoc/pages-index';
import type { ShellData } from '../types/pipeline.js';
import { MordocDataContext } from './data-context.js';
import { createAppRouter } from './routes.js';

/**
 * Browser entry. Assembles `ShellData` from the eager virtual modules
 * and hydrates the React tree.
 *
 * This is the only file in `src/client/` that is allowed to import the
 * eager `virtual:mordoc/*` modules directly — every other shell
 * component reads them via `useMordocData()`. Keeping the imports
 * pinned here is what guarantees CSR/SSR symmetry: the server entry
 * doesn't need any virtual imports because its `render(request, data)`
 * receives the same `ShellData` from the dev middleware (or, later,
 * from the SSG runner).
 *
 * `createBrowserRouter` is given `hydrationData` from the
 * `<script>window.__staticRouterHydrationData = ...</script>` tag that
 * `<StaticRouterProvider>` emits during SSR. Without this, the data
 * router would re-run the initial route's loader on first mount,
 * triggering a redundant fetch of the same lazy page chunk that the
 * server already used to produce the initial HTML.
 */
const container = document.getElementById('app');
if (!container) {
  throw new Error('mordoc: #app element not found in HTML shell');
}

const shellData: ShellData = {
  site,
  language,
  navigation,
  assets,
  pagesIndex,
};

const router = createAppRouter(window.__staticRouterHydrationData);

hydrateRoot(
  container,
  <StrictMode>
    <MordocDataContext.Provider value={shellData}>
      <RouterProvider router={router} />
    </MordocDataContext.Provider>
  </StrictMode>,
);
