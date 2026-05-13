import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs/promises';
import { mordocVitePlugin, type MordocVitePluginApi } from '../vite/plugin.js';
import { getClientRoot, getPackageRoot } from '../utils/paths.js';

/** Markers in `index.html` substituted at request time. */
const SSR_TITLE_MARKER = '<!--ssr-title-->';
const SSR_OUTLET_MARKER = '<!--ssr-outlet-->';

/**
 * Minimal HTML escape for values interpolated into element text content.
 *
 * `site.name` comes from `config/site.json` — content the project owner
 * controls — but escaping is cheap insurance against `<` / `&` / quotes
 * in legitimate site names breaking the resulting HTML.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Locates mordoc's plugin instance on a running Vite server and returns its api. */
function getMordocApi(server: ViteDevServer): MordocVitePluginApi {
  const plugin = server.config.plugins.find((p) => p.name === 'mordoc');
  if (!plugin) {
    throw new Error('mordoc dev: mordoc plugin not registered on the Vite server.');
  }
  const api = plugin.api as MordocVitePluginApi | undefined;
  if (!api || typeof api.getShellData !== 'function') {
    throw new Error('mordoc dev: mordoc plugin is missing its api.getShellData() method.');
  }
  return api;
}

export interface DevCommandOptions {
  /** Absolute path to the user's project root. */
  projectRoot: string;
  /** Port to listen on. Defaults to Vite's default (5173). */
  port?: number;
}

/**
 * Starts the Mordoc dev server.
 *
 * Dev mode is pure client-side rendering — no SSR per request. Vite's HMR
 * runtime handles CSS injection and module hot-reloading natively, and React
 * mounts into the empty `#app` div via `createRoot`. This avoids the FOUC
 * that arises from SSR HTML arriving before Vite's client runtime has injected
 * styles, and sidesteps SSR/hydration mismatch noise during development.
 *
 * The production `mordoc build` path still runs full SSR + SSG: `entry-server.tsx`
 * and the static-HTML output are exercised at build time.
 *
 * Per-request flow:
 *   1. Read the raw `index.html` template from disk (re-read each request so
 *      edits to the shell are picked up without a restart).
 *   2. `vite.transformIndexHtml` injects the HMR client and any plugin
 *      transforms (e.g. React refresh preamble).
 *   3. Substitute `<!--ssr-title-->` with `site.name` so the browser tab
 *      shows the correct title immediately, before React mounts.
 *   4. Replace `<!--ssr-outlet-->` with empty string — React renders the full
 *      app client-side via `createRoot`.
 *   5. Send response.
 */
export async function runDevCommand(options: DevCommandOptions): Promise<void> {
  const { projectRoot, port } = options;
  const clientRoot = getClientRoot();
  const templatePath = path.join(clientRoot, 'index.html');

  const server = await createServer({
    configFile: false,
    root: clientRoot,
    publicDir: path.join(projectRoot, 'public'),
    appType: 'custom',
    plugins: [
      react(),
      mordocVitePlugin({ projectRoot }),
    ],
    server: {
      port,
      fs: {
        allow: [getPackageRoot()],
      },
    },
  });

  const mordocApi = getMordocApi(server);

  server.middlewares.use(async (req, res, next) => {
    try {
      const url = req.originalUrl ?? req.url ?? '/';

      // Let Vite handle asset/module requests (anything with a file extension).
      const lastSegment = url.split('?')[0]?.split('/').pop() ?? '';
      if (lastSegment.includes('.')) {
        return next();
      }

      const shellData = mordocApi.getShellData();
      const rawTemplate = await fs.readFile(templatePath, 'utf-8');
      const transformed = await server.transformIndexHtml(url, rawTemplate);

      const finalHtml = transformed
        .replace(SSR_TITLE_MARKER, () => escapeHtml(shellData.site.name))
        .replace(SSR_OUTLET_MARKER, '');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(finalHtml);
    } catch (err) {
      if (err instanceof Error) {
        server.ssrFixStacktrace(err);
      }
      next(err);
    }
  });

  await server.listen();

  const resolvedPort = server.config.server.port ?? 5173;
  console.log(`\n  Mordoc dev server running`);
  console.log(`  → http://localhost:${resolvedPort}/`);
  console.log(`  Project: ${projectRoot}\n`);
}
