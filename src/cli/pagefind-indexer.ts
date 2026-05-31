import path from 'node:path';
import fs from 'node:fs/promises';
import { createIndex } from 'pagefind';
import type { MordocData } from '../types/pipeline.js';

/**
 * Builds a Pagefind search index from a set of glob patterns within distDir.
 * Each glob is added as a separate addDirectory call so callers can mix
 * root-level and subdirectory globs without negation patterns (which Pagefind
 * does not support).
 */
async function buildIndex(
  distDir: string,
  globs: string[],
  outputPath: string,
): Promise<void> {
  const { index, errors } = await createIndex({});
  if (!index) throw new Error(`pagefind createIndex failed: ${errors.join(', ')}`);
  for (const glob of globs) {
    await index.addDirectory({ path: distDir, glob });
  }
  await index.writeFiles({ outputPath });
}

/**
 * Returns top-level subdirectory names of distDir, excluding the given names
 * and any Pagefind output dirs or Vite asset dirs that begin with `_`.
 */
async function getContentDirs(distDir: string, exclude: string[]): Promise<string[]> {
  const entries = await fs.readdir(distDir, { withFileTypes: true });
  return entries
    .filter(
      (e) =>
        e.isDirectory() &&
        !exclude.includes(e.name) &&
        !e.name.startsWith('pagefind') &&
        !e.name.startsWith('_'),
    )
    .map((e) => e.name);
}

/**
 * Builds Pagefind search indexes after SSG completes.
 *
 * Single-language sites produce one index at `dist/pagefind/`.
 *
 * Multi-language sites produce a separate index per language at
 * `dist/pagefind-{lang}/` so the browser loads only the index for the
 * currently-active language. Non-default languages live under `/{lang}/` in
 * the dist tree, which makes glob scoping straightforward. The default
 * language lives at the root, so its index is built by including root HTML
 * files plus every content subdirectory that is NOT claimed by another lang.
 */
export async function runPagefindIndexer(data: MordocData, distDir: string): Promise<void> {
  const { language, site } = data;

  if (!language || language.languages.length <= 1) {
    await buildIndex(distDir, ['**/*.html'], path.join(distDir, 'pagefind'));
    console.log('  pagefind index → dist/pagefind/');
    return;
  }

  const defaultLang = site.defaultLanguage;
  const nonDefaultLangs = language.languages.filter((l) => l !== defaultLang);

  for (const lang of language.languages) {
    const outputPath = path.join(distDir, `pagefind-${lang}`);

    if (lang !== defaultLang) {
      // Non-default language: pages are entirely under /{lang}/
      await buildIndex(distDir, [`${lang}/**/*.html`], outputPath);
    } else {
      // Default language: root HTML + any content subdir not owned by another lang
      const contentDirs = await getContentDirs(distDir, nonDefaultLangs);
      const globs = ['*.html', ...contentDirs.map((d) => `${d}/**/*.html`)];
      await buildIndex(distDir, globs, outputPath);
    }

    console.log(`  pagefind index → dist/pagefind-${lang}/`);
  }
}
