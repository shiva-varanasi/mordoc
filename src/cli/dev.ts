import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs/promises';
import { mordocVitePlugin } from '../vite/plugin.js';
import { getMordocAppRoot, getPackageRoot } from '../utils/paths.js';

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
  const mordocAppRoot = getMordocAppRoot();
  const templatePath = path.join(mordocAppRoot, 'index.html');

  const server = await createServer({
    configFile: false,
    root: mordocAppRoot,
    publicDir: path.join(projectRoot, 'public'),
    appType: 'custom',
    plugins: [
      react(),
      mordocVitePlugin({ projectRoot, mode: 'dev' }),
    ],
    server: {
      port,
      fs: {
        allow: [getPackageRoot()],
      },
    },
  });

  // Serves `config/assets/*` at `/_assets/*`, matching the URL shape the
  // production build uses (`copyAndRewriteAssets` in build.ts physically
  // copies files into `dist/_assets/`). Dev mode never runs that copy step,
  // so there is no real file backing these URLs anywhere Vite's own static
  // serving would look (root is `mordocAppRoot`, publicDir is
  // `<projectRoot>/public` — neither is `config/assets/`). This handler
  // fakes the URL's existence by reading straight from the real source
  // directory on every request instead.
  server.middlewares.use(async (req, res, next) => {
    const url = (req.url ?? '').split('?')[0];
    if (!url.startsWith('/_assets/')) return next();
    const filename = url.slice('/_assets/'.length);
    // `filename` is attacker-controllable (it comes straight from the
    // request URL) and is about to be joined into a filesystem path, so it
    // must be validated before that happens, not after:
    //   - reject '/': keeps this directory flat (assets are only ever
    //     discovered directly under config/assets/, never nested) and
    //     blocks multi-segment traversal like `/_assets/../config/x.json`.
    //   - reject '..': catches traversal that uses '\' instead of '/' as
    //     the separator (e.g. `..\..\..\Windows\win.ini`). `path.join`
    //     treats backslash as a separator on Windows too, so the '/' check
    //     above would not by itself catch this case.
    if (!filename || filename.includes('/') || filename.includes('..')) return next();
    // Custom fonts (site.json's "fonts" field) live one level deeper, in
    // config/assets/fonts/, but are served at the same flat /_assets/<basename>
    // URL as everything else — so a miss at the flat path falls back to that
    // one known subdirectory before giving up.
    const flatPath = path.join(projectRoot, 'config', 'assets', filename);
    const fontPath = path.join(projectRoot, 'config', 'assets', 'fonts', filename);
    let filePath = flatPath;
    try {
      await fs.access(flatPath);
    } catch {
      filePath = fontPath;
    }
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
        woff2: 'font/woff2',
        woff: 'font/woff',
        ttf: 'font/ttf',
      };
      res.setHeader('Content-Type', mime[ext] ?? 'application/octet-stream');
      res.statusCode = 200;
      res.end(content);
    } catch {
      next();
    }
  });

  // Serves the app shell (`index.html`) for page/route requests. This is the
  // catch-all at the bottom of the middleware stack: everything with a file
  // extension (`.tsx`, `.css`, virtual modules, etc.) is declined via
  // `next()` above and handled by Vite's own already-registered middleware,
  // so only extensionless route URLs (e.g. `/getting-started`) reach here.
  //
  // What this handler actually owns, per request:
  //   1. Re-read the raw template from disk every time (not cached), so
  //      edits to `src/app/index.html` show up without a server restart.
  //   2. Hand it to `server.transformIndexHtml()` — this is Vite's own
  //      pipeline, not something we implement: it injects the HMR client
  //      script, the React Fast Refresh preamble, and rewrites the
  //      `/main.tsx` entry script tag. None of that is our logic.
  //   3. Splice user-project-specific data into the three markers the
  //      template defines (`<!--ssr-lang-->`, `<!--ssr-head-->`,
  //      `<!--ssr-outlet-->`): favicon `<link>` + `config/custom-head.html`
  //      go into ssr-head; lang and outlet are left empty because dev mode
  //      is pure CSR (no per-request SSR here — see file-level comment above).
  //
  // Notably absent: <title> and all <style> tags you'd see in DevTools.
  // Those are never part of this response — <title> is set client-side by
  // Content.tsx's useEffect once route data resolves, and styles are
  // injected into the live DOM by Vite's CSS-HMR runtime after main.tsx
  // executes. This handler only ever produces the initial empty-bodied shell.
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
