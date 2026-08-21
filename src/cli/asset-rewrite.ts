import path from 'node:path';
import fs from 'node:fs/promises';
import type { MordocData } from '../types/pipeline.js';
import type { ResolvedAssets } from '../types/assets.js';
import type { ResolvedFont, ResolvedFonts } from '../types/fonts.js';

/**
 * Public URL prefix used for rewritten asset paths.
 *
 * Underscore-prefixed deliberately: Vite's client build emits its own
 * code chunks into `dist/assets/` (no underscore) and we don't want a
 * collision with that directory. `_assets` is conventional for "static
 * resources copied verbatim, not bundler output".
 */
const ASSET_URL_PREFIX = '/_assets';
const ASSET_DIR_NAME = '_assets';

/**
 * Copies every non-null asset file out of the user's `config/assets/`
 * to a flat `<clientOutDir>/_assets/` folder, then returns a new
 * `MordocData` whose `assets` field references the served URLs instead
 * of the original absolute disk paths.
 *
 * Why this exists right now:
 *   `loadAssets` produces absolute disk paths (e.g.
 *   `C:\Users\...\config\assets\favicon.ico`). Those paths land inside
 *   the bundled `virtual:mordoc/assets` module on the client and inside
 *   the React tree's serialized loader data on SSR. Neither has any
 *   business in deployed output — disk paths are useless to a browser
 *   and embedding them in HTML/JS leaks the build machine's filesystem
 *   layout. The moment a theme component reads `assets.favicon`, that
 *   leak becomes a visible bug. Rewriting now closes the gap before any
 *   theme exists; the cost is small and the alternative is a latent
 *   regression waiting for the first `<link rel="icon" href={...} />`.
 *
 * Why build-only:
 *   Dev rewrites asset paths at virtual-module generation time (plugin.ts
 *   `rewriteAssetsForDev`) and serves files via a `/_assets/*` middleware
 *   in dev.ts — no copy step needed there.
 *
 * Filename strategy:
 *   Output filename = basename of the source file. favicon/logo/logo-dark
 *   are discovered by fixed convention, so those three can never collide.
 *   The custom font (site.json's "fonts" field) is a user-supplied filename
 *   rather than a fixed convention, so collision-freedom there is incidental
 *   rather than structural: it holds only because font extensions
 *   (woff2/woff/ttf) never overlap with the image extensions the other
 *   assets use. If a future asset type reuses an existing extension, this
 *   strategy will need a content-hash suffix to disambiguate.
 *
 * Note on `logoDark` falling back to `logo`:
 *   `loadAssets` returns the same source path for both when no separate
 *   dark logo exists. `fs.copyFile` is idempotent under repeated copies
 *   to the same destination, so the duplicate copy is harmless and the
 *   resulting URLs are identical — exactly the fall-through the loader
 *   intended.
 */
export async function copyAndRewriteAssets(
  data: MordocData,
  clientOutDir: string,
): Promise<MordocData> {
  const targetDir = path.join(clientOutDir, ASSET_DIR_NAME);
  await fs.mkdir(targetDir, { recursive: true });

  const rewritten: ResolvedAssets = {
    favicon: await copyAndRewriteOne(data.assets.favicon, targetDir),
    logo: await copyAndRewriteOne(data.assets.logo, targetDir),
    logoDark: await copyAndRewriteOne(data.assets.logoDark, targetDir),
  };

  const fonts: ResolvedFonts = {
    body: await copyAndRewriteFontFace(data.fonts.body, targetDir),
    code: await copyAndRewriteFontFace(data.fonts.code, targetDir),
  };

  return { ...data, assets: rewritten, fonts };
}

async function copyAndRewriteOne(
  sourcePath: string | null,
  targetDir: string,
): Promise<string | null> {
  if (sourcePath === null) return null;
  const filename = path.basename(sourcePath);
  await fs.copyFile(sourcePath, path.join(targetDir, filename));
  return `${ASSET_URL_PREFIX}/${filename}`;
}

async function copyAndRewriteFontFace(
  face: ResolvedFont | null,
  targetDir: string,
): Promise<ResolvedFont | null> {
  if (!face) return null;
  return {
    family: face.family,
    regular: await copyAndRewriteOne(face.regular, targetDir),
    italic: await copyAndRewriteOne(face.italic, targetDir),
  };
}
