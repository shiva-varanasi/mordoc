import { readdir, access } from 'node:fs/promises';
import { join, sep } from 'node:path';
import type { ContentEntry, ContentMap } from '../types/content.js';

const CONTENT_DIR = 'content';

/**
 * Checks whether a directory exists on disk.
 */
async function dirExists(dirPath: string): Promise<boolean> {
  try {
    await access(dirPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively finds all .md files in a directory and returns their paths
 * relative to that directory, using forward slashes.
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(dir, { recursive: true }) as unknown as string[];
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return [];
    throw new Error(`Failed to read directory ${dir}: ${(err as Error).message}`);
  }

  return entries
    .filter((entry) => entry.endsWith('.md'))
    .map((entry) => entry.replaceAll(sep, '/'));
}

/**
 * Converts a relative .md file path into a ContentEntry.
 *
 * @param relativePath - Forward-slash path relative to the language dir (e.g. "prerequisites/install-code-editor.md").
 * @param language - The language code (e.g. "en").
 * @param langDir - Absolute path to the language content directory.
 * @param defaultLanguage - The project's default language (no URL prefix for this language).
 */
function buildEntry(
  relativePath: string,
  language: string,
  langDir: string,
  defaultLanguage: string,
): ContentEntry {
  const filePath = join(langDir, relativePath.replaceAll('/', sep));

  const withoutExt = relativePath.replace(/\.md$/, '');
  const isIndex = withoutExt.endsWith('/index') || withoutExt === 'index';

  const segments = isIndex
    ? withoutExt === 'index' ? [] : withoutExt.replace(/\/index$/, '').split('/')
    : withoutExt.split('/');

  const slug = isIndex
    ? 'index'
    : segments[segments.length - 1]!;

  const prefix = language === defaultLanguage ? '' : `/${language}`;
  const routePath = segments.length === 0
    ? prefix || '/'
    : `${prefix}/${segments.join('/')}`;

  return { language, segments, routePath, filePath, slug, isIndex };
}

/**
 * Detects route collisions — e.g. both "prerequisites.md" and
 * "prerequisites/index.md" claiming the same route path.
 */
function detectCollisions(entries: ContentEntry[], language: string): void {
  const seen = new Map<string, string>();
  for (const entry of entries) {
    const existing = seen.get(entry.routePath);
    if (existing) {
      throw new Error(
        `Route collision for "${entry.routePath}" in language "${language}": ` +
        `"${existing}" and "${entry.filePath}" both resolve to the same route.`,
      );
    }
    seen.set(entry.routePath, entry.filePath);
  }
}

/**
 * Discovers all markdown content files and builds a route manifest.
 *
 * - Scans content/<lang>/ for each language.
 * - Default language routes have no prefix ("/overview"); other languages are prefixed ("/de/overview").
 * - If a declared language has no content directory, it is skipped with a warning (falls back to default at runtime).
 * - Errors if the default language has no content directory or no index.md.
 *
 * @param projectRoot - Absolute path to the project's root directory.
 * @param defaultLanguage - The defaultLanguage value from site.json.
 * @param languages - Array of declared languages from language.json, or null for single-language projects.
 * @returns The content manifest with all discovered entries.
 */
export async function loadContent(
  projectRoot: string,
  defaultLanguage: string,
  languages: string[] | null,
): Promise<ContentMap> {
  const contentRoot = join(projectRoot, CONTENT_DIR);
  const langCodes = languages ?? [defaultLanguage];

  const allEntries: ContentEntry[] = [];
  const activeLanguages: string[] = [];

  for (const lang of langCodes) {
    const langDir = join(contentRoot, lang);

    if (!(await dirExists(langDir))) {
      if (lang === defaultLanguage) {
        throw new Error(
          `Content directory not found: ${langDir}\n` +
          `Every Mordoc project requires a content/${defaultLanguage}/ directory.`,
        );
      }
      console.warn(
        `⚠ No content directory for language "${lang}" — ` +
        `content will fall back to "${defaultLanguage}" at runtime.`,
      );
      continue;
    }

    const mdFiles = await findMarkdownFiles(langDir);

    if (mdFiles.length === 0) {
      if (lang === defaultLanguage) {
        throw new Error(
          `No markdown files found in ${langDir}.\n` +
          `The default language content directory must contain at least an index.md file.`,
        );
      }
      console.warn(
        `⚠ No markdown files in content/${lang}/ — ` +
        `content will fall back to "${defaultLanguage}" at runtime.`,
      );
      continue;
    }

    const entries = mdFiles.map((file) => buildEntry(file, lang, langDir, defaultLanguage));
    detectCollisions(entries, lang);

    const hasIndex = entries.some((e) => e.isIndex && e.segments.length === 0);
    if (lang === defaultLanguage && !hasIndex) {
      throw new Error(
        `Missing content/${defaultLanguage}/index.md.\n` +
        `The default language must have a root index.md — it serves as the landing page.`,
      );
    }

    allEntries.push(...entries);
    activeLanguages.push(lang);
  }

  allEntries.sort((a, b) => a.routePath.localeCompare(b.routePath));

  return { entries: allEntries, languages: activeLanguages };
}
