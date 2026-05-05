// Ambient declarations for browser-side globals not part of the standard
// DOM lib. Kept separate from `virtual-modules.d.ts` because these aren't
// virtual modules — they're real-but-non-standard properties of `window`.

/**
 * Hydration data emitted by React Router's `<StaticRouterProvider>` as a
 * `<script>` tag in the rendered HTML. The browser entry passes this to
 * `createBrowserRouter({ hydrationData })` so the data router skips
 * re-running loaders for the initial route — those loaders already ran on
 * the server, and their results are baked into the HTML.
 *
 * Optional: present after SSR, absent during pure-CSR fallback (e.g. an
 * error path that bypasses SSR). The browser entry handles both.
 */
declare global {
  interface Window {
    __staticRouterHydrationData?: import('react-router').HydrationState;
  }
}

export {};
