import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mordocVitePlugin } from '../vite/plugin.js';

/**
 * Resolves the absolute path to mordoc's own package root.
 *
 * This file compiles to `dist/cli/dev.js`, which sits two directories below
 * the package root. Using `import.meta.url` means the resolution works
 * regardless of where mordoc is installed — in its own repo during
 * development, or under `node_modules/mordoc/` in a user's project.
 */
function getPackageRoot(): string {
  return path.resolve(fileURLToPath(import.meta.url), '../../..');
}

/**
 * HTML shell served in dev. Minimal: no title derived from site config
 * yet (that requires routing + per-route data), no SSR content, just the
 * mount point and the client entry. Vite's `transformIndexHtml` injects
 * its HMR client and React Fast Refresh setup on top of this.
 */
const DEV_HTML_SHELL = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mordoc Dev</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/main.tsx"></script>
</body>
</html>
`;

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
 *   - Vite's `root` is set to mordoc's own `src/client/` — that's where
 *     the React app source lives. The user's project does NOT contain any
 *     TSX; Vite never looks at user code as code.
 *   - The user's content and config are funneled in through the mordoc
 *     Vite plugin's virtual modules. Vite sees them as ordinary module
 *     imports from the client's perspective.
 *   - `appType: 'custom'` disables Vite's default HTML handling so we can
 *     serve a hand-crafted shell and, in a later step, SSR-rendered HTML.
 *   - `configFile: false` prevents Vite from accidentally picking up any
 *     vite.config.js the user might have in their project.
 *
 * Deferred from this step: SSR-in-dev, HMR for virtual modules, React
 * Router. Those land together when routing comes online.
 */
export async function runDevCommand(options: DevCommandOptions): Promise<void> {
  const { projectRoot, port } = options;
  const clientRoot = path.join(getPackageRoot(), 'src', 'client');

  const server = await createServer({
    configFile: false,
    root: clientRoot,
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

  // Single middleware: every non-asset request gets the HTML shell.
  // Per-route rendering arrives when routing + SSR land in the next step.
  server.middlewares.use(async (req, res, next) => {
    try {
      const url = req.originalUrl ?? req.url ?? '/';

      // Let Vite handle asset/module requests (anything with a file
      // extension in the last path segment).
      const lastSegment = url.split('?')[0]?.split('/').pop() ?? '';
      if (lastSegment.includes('.')) {
        return next();
      }

      const html = await server.transformIndexHtml(url, DEV_HTML_SHELL);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
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
