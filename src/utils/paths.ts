import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Resolves the absolute path to mordoc's own package root.
 *
 * This file compiles to `dist/utils/paths.js`, which sits two directories
 * below the package root. Using `import.meta.url` means the resolution
 * works regardless of where mordoc is installed — in its own repo during
 * development, or under `node_modules/mordoc/` in a user's project.
 *
 * Shared by `cli/dev.ts` and `cli/build.ts` because both Vite invocations
 * (dev server, production build) point Vite's `root` at mordoc's own
 * app source folder, not at anything inside the user's project.
 */
export function getPackageRoot(): string {
  return path.resolve(fileURLToPath(import.meta.url), '../../..');
}

/**
 * Resolves the absolute path to mordoc's own app source directory, which
 * Vite uses as its `root` for both dev serving and production builds.
 *
 * This is where `index.html`, `main.tsx`, and `entry-server.tsx` live
 * inside the mordoc package — all application source that Vite compiles.
 * The user's project never points Vite at any of its own files; everything
 * user-side flows through the mordoc plugin's virtual modules.
 */
export function getMordocAppRoot(): string {
  return path.join(getPackageRoot(), 'src', 'app');
}
