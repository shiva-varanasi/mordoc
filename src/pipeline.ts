import { loadSiteConfig, loadFonts } from './config/site-loader.js';
import { loadLanguageConfig } from './config/language-loader.js';
import { loadTopnavConfig } from './config/topnav-loader.js';
import { loadSidenavConfig } from './config/sidenav-loader.js';
import { loadAssets } from './config/assets-loader.js';
import { loadVariables } from './config/variables-loader.js';
import { loadContent } from './content/content-loader.js';
import { loadNavTranslations } from './config/translations-loader.js';
import { loadHeaderLinks } from './config/header-loader.js';
import { loadFooterConfig } from './config/footer-loader.js';
import { parseContent } from './content/content-parser.js';
import { transformContent } from './content/content-transformer.js';
import path from 'node:path';
import fs from 'node:fs/promises';
export { loadNavTranslations, loadHeaderLinks, loadFooterConfig };
import type { ContentEntry, PageMeta, TransformedPage } from './types/content.js';
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
  const fonts = await loadFonts(projectRoot, site);

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
  const footer = await loadFooterConfig(projectRoot);

  const variables = await loadVariables(projectRoot);
  const parsedContent = await parseContent(contentMap);
  const transformedContent = transformContent(parsedContent, variables);

  let customHead: string | null = null;
  try {
    const raw = await fs.readFile(path.join(projectRoot, 'config', 'custom-head.html'), 'utf-8');
    customHead = raw.trim() || null;
  } catch {
    // optional file — absent is the normal case
  }

  return { site, language, navigation, assets, fonts, pages: transformedContent, translations, headerLinks, footer, variables, customHead };
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
 *
 * @param variables - Current variables map from `MordocData.variables`.
 *   Must match what was used in the last full pipeline run so that
 *   `{{ $VAR }}` expressions resolve consistently during HMR.
 */
export async function reparsePage(
  entry: ContentEntry,
  variables: Record<string, unknown> = {},
): Promise<TransformedPage> {
  const parsed = await parseContent({
    entries: [entry],
    languages: [entry.language],
  });
  const [transformed] = transformContent(parsed, variables);
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

/** Projects `MordocData` to `ShellData`. Used by `ssg-runner.ts` to build 
 * the data passed into `entry-server.tsx`'s `render()`. 
 */
export function toShellData(data: MordocData): ShellData {
  return {
    site: data.site,
    language: data.language,
    navigation: data.navigation,
    assets: data.assets,
    pagesIndex: data.pages.map((p) => {
      const meta: PageMeta = {
        routePath: p.entry.routePath,
        language: p.entry.language,
      };
      if (p.frontmatter.layout === 'landing') meta.layout = 'landing';
      if (p.entry.isFallback) meta.isFallback = true;
      return meta;
    }),
    translations: data.translations,
    headerLinks: data.headerLinks,
    footer: data.footer,
  };
}

/**
 * Replaces one page in an in-memory `MordocData` after `reparsePage`.
 * Matches by `routePath`, which is always unique (enforced by detectCollisions).
 * Using filePath would be ambiguous once synthetic fallback entries share the
 * same filePath as the real default-language entry.
 */
export function replaceTransformedPage(data: MordocData, page: TransformedPage): void {
  const idx = data.pages.findIndex((p) => p.entry.routePath === page.entry.routePath);
  if (idx === -1) {
    throw new Error(`replaceTransformedPage: no page for route "${page.entry.routePath}"`);
  }
  data.pages[idx] = page;
  data.pages.sort((a, b) => a.entry.routePath.localeCompare(b.entry.routePath));
}
