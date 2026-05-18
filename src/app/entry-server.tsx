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
 * Renders a single route to an HTML string for SSG.
 *
 * Called once per route by the SSG runner at build time. Pure function —
 * no Vite, no I/O. The SSG runner synthesises a `Request` for each route
 * path, loads this module from the bundled SSR output, and calls `render()`.
 *
 * The flow:
 *   1. Build the route list (shared with the browser entry via `buildRoutes`).
 *   2. `createStaticHandler.query(request)` runs the matched route's loader,
 *      which imports the lazy `virtual:mordoc/page/...` module — resolved by
 *      the Vite plugin and bundled into the SSR output.
 *   3. `createStaticRouter` + `<StaticRouterProvider>` render the matched
 *      component tree to a string.
 *   4. The tree is wrapped in `MordocDataContext.Provider` and `StrictMode`
 *      to mirror `main.tsx` — divergence here causes hydration mismatches.
 *
 * If the static handler returns a `Response` (e.g. a redirect from a loader),
 * this function throws — redirect handling is not yet supported.
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
