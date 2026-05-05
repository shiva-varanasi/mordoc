import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router';
import type { ShellData } from '../types/pipeline.js';
import { MordocDataContext } from './data-context.js';
import { buildRoutes } from './routes.js';

/**
 * Server-side render of a single request to HTML.
 *
 * Pure function — no Vite, no `req`/`res`, no I/O. The dev middleware
 * loads this module via `vite.ssrLoadModule` and calls `render()` per
 * request; the future SSG runner will load it from the bundled SSR
 * output and call it once per route at build time. Same contract.
 *
 * The flow:
 *   1. Build the route list (shared with the browser router via
 *      `buildRoutes`).
 *   2. `createStaticHandler.query(request)` runs the matched route's
 *      loader on the server. The loader is the same function used in
 *      CSR; it performs a dynamic `import('virtual:mordoc/page/...')`,
 *      which Vite resolves through the plugin's `load` hook and
 *      evaluates in Node.
 *   3. `createStaticRouter` + `<StaticRouterProvider>` render the
 *      matched tree, identically to what the browser router would
 *      produce. The provider also emits a `<script>` tag containing
 *      the loader data, which `main.tsx` consumes as
 *      `window.__staticRouterHydrationData` to skip re-running loaders
 *      on hydrate.
 *   4. The whole tree is wrapped in `MordocDataContext.Provider` and
 *      `StrictMode` to mirror `main.tsx` exactly — any divergence here
 *      surfaces as a hydration mismatch.
 *
 * The return shape is intentionally minimal (`{ html }`). When the head
 * pipeline lands, this function will grow a `head` field for per-route
 * `<title>`/`<meta>` injection. Add fields when callers need them; do
 * not speculate.
 *
 * If the static handler returns a `Response` (a redirect from a loader,
 * for example), this function throws. Redirect handling is a follow-up
 * once a real-world case requires it; for now, surfacing the unhandled
 * case loudly is preferable to silently producing broken HTML.
 */
export async function render(
  request: Request,
  data: ShellData,
): Promise<{ html: string }> {
  const routes = buildRoutes();
  const handler = createStaticHandler(routes);
  const context = await handler.query(request);

  if (context instanceof Response) {
    throw new Error(
      `mordoc render: static handler returned Response (status ${context.status}). ` +
        'Redirects/responses from loaders are not yet supported in the SSR path.',
    );
  }

  const router = createStaticRouter(routes, context);

  const html = renderToString(
    <StrictMode>
      <MordocDataContext.Provider value={data}>
        <StaticRouterProvider router={router} context={context} />
      </MordocDataContext.Provider>
    </StrictMode>,
  );

  return { html };
}
