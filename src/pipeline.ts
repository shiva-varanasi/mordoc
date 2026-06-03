import { loadSiteConfig } from './config/site-loader.js';
import { loadLanguageConfig } from './config/language-loader.js';
import { loadTopnavConfig } from './config/topnav-loader.js';
import { loadSidenavConfig } from './config/sidenav-loader.js';
import { loadAssets } from './config/assets-loader.js';
import { loadContent } from './content/content-loader.js';
import { loadNavTranslations } from './config/translations-loader.js';
import { loadHeaderLinks } from './config/header-loader.js';
import { parseContent } from './content/content-parser.js';
import { transformContent } from './content/content-transformer.js';
import path from 'node:path';
export { loadNavTranslations, loadHeaderLinks };
import type { ContentEntry, TransformedPage } from './types/content.js';
import type { MordocData, NavigationConfig, ShellData } from './types/pipeline.js';

/**
 * Loads the project's navigation configuration.
 *
 * If `config/navigation/topnav.yaml` exists, every sidenav file it
 * references is loaded and the resolved tree is returned. Otherwise the
 * single `config/navigation/sidenav.yaml` is loaded as a site-wide sidenav.
 *
 * Exported separately from `runPipeline` because the Vite plugin's HMR
 * handler will need to re-resolve navigation independently when any nav
 * file changes — without re-reading site.json or re-transforming content.
 */
export async function loadNavigation(projectRoot: string): Promise<NavigationConfig> {
  const topnav = await loadTopnavConfig(projectRoot);
  if (topnav) {
    return { kind: 'topnav', topnav };
  }
  const sidenav = await loadSidenavConfig(projectRoot);
  return { kind: 'sidenav', sidenav };
}

/**
 * Runs the full Mordoc data pipeline for a project.
 *
 * Stages, in order:
 *   1. Load every config file (site, language, navigation, assets).
 *   2. Discover content files and build the route manifest.
 *   3. Parse each markdown file into frontmatter + Markdoc AST.
 *   4. Transform each AST into a renderable tree with TOC.
 *
 * Returns a single, JSON-serializable `MordocData`. This is the canonical
 * hand-off shape consumed by both the Vite plugin (in dev) and the SSG
 * build (in prod). The pipeline itself knows nothing about either —
 * keeping it framework-agnostic means new consumers (a CI checker, a
 * different bundler) can be added without touching this code.
 *
 * @param projectRoot - Absolute path to the user's project root.
 */
export async function runPipeline(projectRoot: string): Promise<MordocData> {
  const site = await loadSiteConfig(projectRoot);
  const language = await loadLanguageConfig(projectRoot, site.defaultLanguage);
  const navigation = await loadNavigation(projectRoot);
  const assets = await loadAssets(projectRoot);

  const contentMap = await loadContent(
    projectRoot,
    site.defaultLanguage,
    language?.languages ?? null,
  );

  const translations = await loadNavTranslations(
    projectRoot,
    language?.languages ?? [site.defaultLanguage],
    site.defaultLanguage,
  );
  const headerLinks = await loadHeaderLinks(projectRoot);

  const parsedContent = await parseContent(contentMap);
  const transformedContent = transformContent(parsedContent);

  return { site, language, navigation, assets, pages: transformedContent, translations, headerLinks };
}

/**
 * Re-runs the parse + transform stages for a single content entry.
 *
 * This is the per-file granular update primitive the Vite plugin's
 * `handleHotUpdate` will call when one markdown file changes — it returns
 * a fresh `TransformedPage` for that entry alone, without touching any
 * other page or any config.
 *
 * The wrapping `ContentMap` is synthetic; `parseContent` only iterates
 * `entries`, so a one-element list is sufficient.
 */
export async function reparsePage(entry: ContentEntry): Promise<TransformedPage> {
  const parsed = await parseContent({
    entries: [entry],
    languages: [entry.language],
  });
  const [transformed] = transformContent(parsed);
  if (!transformed) {
    // parseContent + transformContent both produce one output per input
    // entry, so this branch should be unreachable. Guarded so a future
    // refactor can't silently return undefined.
    throw new Error(`reparsePage produced no result for ${entry.filePath}`);
  }
  return transformed;
}

/**
 * Stable fingerprint of which routes exist — used to decide whether a
 * config or content-tree edit requires a full browser reload (v1 skips
 * mutating the route table client-side when pages are added or removed).
 */
export function pagesRouteSignature(pages: TransformedPage[]): string {
  return pages
    .map((p) => `${p.entry.language}\t${p.entry.routePath}`)
    .sort()
    .join('|');
}

/** Projects `MordocData` to the `ShellData` consumed by the React shell and SSR renderer. */
export function toShellData(data: MordocData): ShellData {
  return {
    site: data.site,
    language: data.language,
    navigation: data.navigation,
    assets: data.assets,
    pagesIndex: data.pages.map((p) => ({
      routePath: p.entry.routePath,
      language: p.entry.language,
    })),
    translations: data.translations,
    headerLinks: data.headerLinks,
  };
}

/**
 * Replaces one page in an in-memory `MordocData` after `reparsePage`.
 * Matches by normalized absolute `filePath` so Windows drives and
 * separators stay consistent with the dev watcher.
 */
export function replaceTransformedPage(data: MordocData, page: TransformedPage): void {
  const target = path.normalize(page.entry.filePath);
  const idx = data.pages.findIndex((p) => path.normalize(p.entry.filePath) === target);
  if (idx === -1) {
    throw new Error(`replaceTransformedPage: no page for ${page.entry.filePath}`);
  }
  data.pages[idx] = page;
  data.pages.sort((a, b) => a.entry.routePath.localeCompare(b.entry.routePath));
}
