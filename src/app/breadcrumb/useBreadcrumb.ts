import { useLocation } from 'react-router';
import { useMordocData } from '../data-context.js';
import { detectCurrentLang, buildLangPrefix, stripLangPrefix, resolveLabel, applyLangToSidenav } from '../lang-utils.js';
import { samePath } from '../path-utils.js';
import { useUiStrings } from '../i18n/useUiStrings.js';
import type { SidenavConfig } from '../../types/navigation.js';

/**
 * Breadcrumb resolution, shared by every page flavor that renders one
 * (`ArticlePage` for guides, `Operation` for API reference pages).
 *
 * An `operation:` sidenav entry is resolved to an ordinary `path` before
 * navigation ever reaches the client (see `SidenavItem.operation`), so this
 * needs no special case for operation pages — it walks the same resolved
 * sidenav tree matching on `path`, exactly as it does for a guide.
 */

export interface BreadcrumbEntry {
  label: string;
  path?: string;
}

function findBreadcrumb(
  items: SidenavConfig,
  targetPath: string,
  ancestors: BreadcrumbEntry[],
): BreadcrumbEntry[] | null {
  for (const item of items) {
    const current: BreadcrumbEntry = { label: item.label ?? '', path: item.path };
    if (item.path !== undefined && samePath(item.path, targetPath)) {
      return [...ancestors, current];
    }
    if (item.children) {
      const found = findBreadcrumb(item.children, targetPath, [...ancestors, current]);
      if (found) return found;
    }
  }
  return null;
}

function resolveActiveSidenavRaw(
  navigation: ReturnType<typeof useMordocData>['navigation'],
  contentPath: string,
): { sectionLabel: string | null; sectionPath: string | null; sidenav: SidenavConfig } {
  if (navigation.kind === 'sidenav') {
    return { sectionLabel: null, sectionPath: null, sidenav: navigation.sidenav };
  }
  const match = navigation.topnav
    .filter((item) => samePath(contentPath, item.path) || contentPath.startsWith(item.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return {
    sectionLabel: match?.label ?? null,
    sectionPath: match?.path ?? null,
    sidenav: match?.sidenav ?? [],
  };
}

/** Resolves the breadcrumb trail for the current route, home entry included. */
export function useBreadcrumbEntries(): BreadcrumbEntry[] {
  const { site, navigation, language, translations } = useMordocData();
  const { pathname } = useLocation();
  const t = useUiStrings();

  const currentLang = detectCurrentLang(pathname, language, site.defaultLanguage);
  const contentPath = stripLangPrefix(pathname, currentLang, site.defaultLanguage);
  const prefix = buildLangPrefix(currentLang, site.defaultLanguage);

  const { sectionLabel, sectionPath, sidenav } = resolveActiveSidenavRaw(navigation, contentPath);
  const processedSidenav = applyLangToSidenav(sidenav, prefix, currentLang, site.defaultLanguage, translations);

  const rawBreadcrumb = findBreadcrumb(processedSidenav, pathname, []) ?? [];
  const resolvedSectionLabel = sectionLabel
    ? resolveLabel(sectionLabel, currentLang, site.defaultLanguage, translations)
    : null;

  return [
    { label: t.breadcrumb.home, path: prefix || '/' },
    ...(resolvedSectionLabel && sectionPath
      ? [{ label: resolvedSectionLabel, path: `${prefix}${sectionPath}` }]
      : []),
    ...rawBreadcrumb,
  ];
}
