import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import site from 'virtual:mordoc/site';
import language from 'virtual:mordoc/language';
import navigation from 'virtual:mordoc/navigation';
import assets from 'virtual:mordoc/assets';
import pagesIndex from 'virtual:mordoc/pages-index';
import translations from 'virtual:mordoc/translations';
import headerLinks from 'virtual:mordoc/header-links';
import type { ShellData } from '../types/pipeline.js';
import './index.css';
import { MordocDataContext } from './data-context.js';
import { createAppRouter } from './routes.js';
// Generated @font-face + --font-sans/--font-mono for a project's custom fonts
// (site.json's "fonts" field) — after index.css's default stacks, before theme.css.
import 'virtual:mordoc/font-face.css';
// theme.css must be last so user overrides win over component-level :root tokens
import 'virtual:mordoc/theme';
// Per-component "advanced tier" token overrides — after theme.css, so a
// component-specific override can win over a same-named global theme.css
// token in the (expected-rare) case the two ever collide. Each resolves to
// config/styles/<name>.css when present, empty otherwise — see
// COMPONENT_THEME_FILES in src/vite/plugin.ts for the full list.
import 'virtual:mordoc/theme/app';
import 'virtual:mordoc/theme/sidenav';
import 'virtual:mordoc/theme/header';
import 'virtual:mordoc/theme/header-links';
import 'virtual:mordoc/theme/topnav';
import 'virtual:mordoc/theme/language-picker';
import 'virtual:mordoc/theme/theme-toggle';
import 'virtual:mordoc/theme/search-bar';
import 'virtual:mordoc/theme/search-modal';
import 'virtual:mordoc/theme/content';
import 'virtual:mordoc/theme/article-page';
import 'virtual:mordoc/theme/not-found';
import 'virtual:mordoc/theme/skeleton';
import 'virtual:mordoc/theme/toc';
import 'virtual:mordoc/theme/hero';
import 'virtual:mordoc/theme/section';
import 'virtual:mordoc/theme/diagram';
import 'virtual:mordoc/theme/image';
import 'virtual:mordoc/theme/clip';
import 'virtual:mordoc/theme/video-embed';
import 'virtual:mordoc/theme/code-block';
import 'virtual:mordoc/theme/callout';
import 'virtual:mordoc/theme/card';
import 'virtual:mordoc/theme/button';

/**
 * Browser entry. Assembles `ShellData` from the eager virtual modules
 * and hydrates the React tree.
 *
 * This is the only file in `src/app/` that imports the
 * eager `virtual:mordoc/*` modules directly — every other shell
 * component reads them via `useMordocData()`. Keeping the imports
 * pinned here is what guarantees CSR/SSR symmetry: the server entry
 * doesn't need any virtual imports because its `render(request, data)`
 * receives the same `ShellData` directly from the SSG runner at build time.
 *
 * `createBrowserRouter` is given `hydrationData` from the
 * `<script>window.__staticRouterHydrationData = ...</script>` tag that
 * `<StaticRouterProvider>` emits during SSR. Without this, the data
 * router would re-run the initial route's loader on first mount,
 * triggering a redundant fetch of the same lazy page chunk that the
 * server already used to produce the initial HTML.
 */
// React Router's beforeunload handler saves scroll position to sessionStorage
// on every page exit — including reloads — so the next load restores it,
// causing a visible jump from top to the saved position. Clearing the entry
// here (after the reload, before hydrateRoot) prevents the restoration.
if ((performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'reload') {
  try {
    sessionStorage.removeItem('react-router-scroll-positions');
  } catch { /* unavailable in some private-browsing modes */ }
}

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
  translations,
  headerLinks,
};

const hydrationData = window.__staticRouterHydrationData;
const router = createAppRouter(hydrationData);

const app = (
  <StrictMode>
    <MordocDataContext.Provider value={shellData}>
      <RouterProvider router={router} />
    </MordocDataContext.Provider>
  </StrictMode>
);

// SSR/SSG (production): server-rendered HTML is in the container — hydrate to
// preserve it and attach event listeners without a full re-render.
// Dev: container is empty — mount fresh via createRoot.
if (hydrationData) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
