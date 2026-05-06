import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import { mordocVitePlugin, type MordocVitePluginApi } from '../vite/plugin.js';
import type { ShellData } from '../types/pipeline.js';
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

/**
 * Adapts Node's `IncomingMessage` to a fetch `Request`, which is what
 * React Router's `createStaticHandler.query()` expects.
 *
 * Body-less by design — Mordoc's SSR path only handles GETs. Method and
 * headers are preserved so loader code that consults them sees the same
 * shape it would in a real fetch. Multi-value headers (e.g. `set-cookie`
 * on incoming requests, rare but possible) are appended individually.
 *
 * The SSG runner will construct a synthetic `new Request(\`http://localhost\${routePath}\`)`
 * directly when it lands; this adapter only exists for the dev path.
 */
function nodeRequestToFetchRequest(req: IncomingMessage): Request {
  const protocol =
    typeof req.headers['x-forwarded-proto'] === 'string'
      ? req.headers['x-forwarded-proto']
      : 'http';
  const host = req.headers.host ?? 'localhost';
  const url = `${protocol}://${host}${req.url ?? '/'}`;

  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(name, v);
    } else {
      headers.set(name, value);
    }
  }

  return new Request(url, { method: req.method ?? 'GET', headers });
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
 * Architecture:
 *   - Vite's `root` is set to mordoc's own `src/app/` — that's where
 *     the React app source AND the HTML shell (`index.html`) live. The
 *     user's project does NOT contain any TSX or HTML; Vite never looks
 *     at user code as code.
 *   - `publicDir` is pointed at the user's `<projectRoot>/public/` so
 *     that markdown references like `![cockpit](/images/cockpit.png)`
 *     resolve against files the author drops there. Vite's default
 *     would resolve `publicDir` against `root` (i.e. `src/app/public/`),
 *     which is not what we want — author assets live in the user's
 *     project, not in mordoc's package.
 *   - The user's content and config are funneled in through the mordoc
 *     Vite plugin's virtual modules (for the React tree) and through
 *     `plugin.api.getShellData()` (for the SSR `render(request, data)`
 *     call).
 *   - `appType: 'custom'` disables Vite's default HTML handling so we
 *     read `index.html` ourselves, transform it for HMR, run SSR, and
 *     inject the rendered tree.
 *   - `configFile: false` prevents Vite from accidentally picking up
 *     any vite.config.js the user might have in their project.
 *
 * Per-request flow:
 *   1. Read the raw `index.html` template from disk (re-read each
 *      request so HMR-driven edits to the shell are picked up).
 *   2. `vite.transformIndexHtml` injects the HMR client + plugin
 *      transforms.
 *   3. Substitute `<!--ssr-title-->` with `site.name`. The proper
 *      per-route `<title>`/`<meta>` injection is its own follow-up.
 *   4. `vite.ssrLoadModule('/entry-server.tsx')` evaluates the server
 *      entry in Node (resolving any `virtual:mordoc/*` imports through
 *      our plugin's `load` hook).
 *   5. `render(request, shellData)` returns `{ html }`. The
 *      `<StaticRouterProvider>` it uses also emits a `<script>` tag
 *      containing the hydration data — that lands inside `html` and
 *      flows into the document automatically.
 *   6. Substitute `<!--ssr-outlet-->` with the rendered tree, send.
 *
 * Deferred from this step: granular HMR for content/config edits,
 * route-aware head injection, redirect/Response handling from loaders.
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
        // Vite's default allow-list is the nearest package root. The
        // explicit entry here future-proofs for a world where the client
        // imports from workspace-adjacent paths, and silences warnings
        // when mordoc is linked in via pnpm/npm link during development.
        allow: [getPackageRoot()],
      },
    },
  });

  const mordocApi = getMordocApi(server);

  server.middlewares.use(async (req, res, next) => {
    try {
      const url = req.originalUrl ?? req.url ?? '/';

      // Let Vite handle asset/module requests (anything with a file
      // extension in the last path segment). Vite's own middleware will
      // already have picked up the lazy `virtual:mordoc/page/...`
      // chunks via its `/@id/` mapping before reaching this point, so
      // this only catches static-style URLs.
      const lastSegment = url.split('?')[0]?.split('/').pop() ?? '';
      if (lastSegment.includes('.')) {
        return next();
      }

      const shellData: ShellData = mordocApi.getShellData();

      const rawTemplate = await fs.readFile(templatePath, 'utf-8');
      const transformed = await server.transformIndexHtml(url, rawTemplate);

      const withTitle = transformed.replace(
        SSR_TITLE_MARKER,
        () => escapeHtml(shellData.site.name),
      );

      const serverEntry = (await server.ssrLoadModule('/entry-server.tsx')) as {
        render: (request: Request, data: ShellData) => Promise<{ html: string }>;
      };

      const request = nodeRequestToFetchRequest(req);
      const { html: appHtml } = await serverEntry.render(request, shellData);

      const finalHtml = withTitle.replace(SSR_OUTLET_MARKER, () => appHtml);

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
