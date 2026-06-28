import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs/promises';
import { mordocVitePlugin } from '../vite/plugin.js';
import { getAppRoot, getPackageRoot } from '../utils/paths.js';

/** Markers in `index.html` replaced at request time. */
const SSR_LANG_MARKER = '<!--ssr-lang-->';
const SSR_HEAD_MARKER = '<!--ssr-head-->';
const SSR_OUTLET_MARKER = '<!--ssr-outlet-->';

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
 * `document.title` is set by `Content.tsx` via `useEffect` once the route
 * loader resolves — no server-side title injection needed in dev.
 *
 * The production `mordoc build` path still runs full SSR + SSG: `entry-server.tsx`
 * and the static-HTML output are exercised at build time.
 *
 * Per-request flow:
 *   1. Read the raw `index.html` template from disk (re-read each request so
 *      edits to the shell are picked up without a restart).
 *   2. `vite.transformIndexHtml` injects the HMR client and any plugin
 *      transforms (e.g. React refresh preamble).
 *   3. Replace `<!--ssr-outlet-->` with empty string — React renders the full
 *      app client-side via `createRoot`.
 *   4. Send response.
 */
export async function runDevCommand(options: DevCommandOptions): Promise<void> {
  const { projectRoot, port } = options;
  const appRoot = getAppRoot();
  const templatePath = path.join(appRoot, 'index.html');

  const server = await createServer({
    configFile: false,
    root: appRoot,
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

  // Serve config/assets/* at /_assets/* — same URL shape as build output.
  server.middlewares.use(async (req, res, next) => {
    const url = (req.url ?? '').split('?')[0];
    if (!url.startsWith('/_assets/')) return next();
    const filename = url.slice('/_assets/'.length);
    if (!filename || filename.includes('/') || filename.includes('..')) return next();
    const filePath = path.join(projectRoot, 'config', 'assets', filename);
    try {
      const content = await fs.readFile(filePath);
      const ext = path.extname(filename).slice(1).toLowerCase();
      const mime: Record<string, string> = {
        svg: 'image/svg+xml',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        ico: 'image/x-icon',
        gif: 'image/gif',
        webp: 'image/webp',
      };
      res.setHeader('Content-Type', mime[ext] ?? 'application/octet-stream');
      res.statusCode = 200;
      res.end(content);
    } catch {
      next();
    }
  });

  server.middlewares.use(async (req, res, next) => {
    try {
      const url = req.url ?? '/';

      // Let Vite handle asset/module requests (anything with a file extension).
      const lastSegment = url.split('?')[0]?.split('/').pop() ?? '';
      if (lastSegment.includes('.')) {
        return next();
      }

      const rawTemplate = await fs.readFile(templatePath, 'utf-8');
      const transformed = await server.transformIndexHtml(url, rawTemplate);

      const faviconPath = path.join(projectRoot, 'config', 'assets', 'favicon.ico');
      let headHtml = '';
      try {
        await fs.access(faviconPath);
        headHtml = '<link rel="icon" href="/_assets/favicon.ico">';
      } catch {
        // no favicon configured
      }

      try {
        const customHead = (await fs.readFile(
          path.join(projectRoot, 'config', 'custom-head.html'),
          'utf-8',
        )).trim();
        if (customHead) {
          headHtml += (headHtml ? '\n  ' : '') + customHead;
        }
      } catch {
        // optional file
      }

      // In dev, App.tsx's useEffect corrects document.documentElement.lang after hydration.
      // We still replace the marker so the attribute value is valid (empty = unknown language).
      const finalHtml = transformed
        .replace(SSR_LANG_MARKER, '')
        .replace(SSR_HEAD_MARKER, headHtml)
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
