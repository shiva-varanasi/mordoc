import { access } from 'node:fs/promises';
import { join } from 'node:path';
import type { ResolvedAssets } from '../types/assets.js';

const ASSETS_DIR = join('config', 'assets');
const LOGO_EXTENSIONS = ['svg', 'png', 'jpg'];

/**
 * Returns the absolute path if the file exists, or null otherwise.
 */
async function findFile(filePath: string): Promise<string | null> {
  try {
    await access(filePath);
    return filePath;
  } catch {
    return null;
  }
}

/**
 * Searches for a file by base name across supported image extensions.
 * Returns the absolute path of the first match, or null if none found.
 * Priority order: svg → png → jpg.
 */
async function findByExtension(dir: string, baseName: string): Promise<string | null> {
  for (const ext of LOGO_EXTENSIONS) {
    const result = await findFile(join(dir, `${baseName}.${ext}`));
    if (result) return result;
  }
  return null;
}

/**
 * Scans config/assets/ for known asset files by convention.
 * All assets are optional — missing files result in null, never errors.
 * If logo-dark is not found, it falls back to the light logo.
 *
 * @param projectRoot - Absolute path to the project's root directory.
 * @returns Discovered asset paths.
 */
export async function loadAssets(projectRoot: string): Promise<ResolvedAssets> {
  const assetsDir = join(projectRoot, ASSETS_DIR);

  const favicon = await findFile(join(assetsDir, 'favicon.ico'));
  const logo = await findByExtension(assetsDir, 'logo');
  const logoDarkFile = await findByExtension(assetsDir, 'logo-dark');
  const logoDark = logoDarkFile ?? logo;

  return { favicon, logo, logoDark };
}
