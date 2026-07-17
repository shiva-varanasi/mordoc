import type { LanguageConfig } from '../types/language.js';
import type { SidenavConfig } from '../types/navigation.js';

/**
 * Lang utilities for the React app. Self-contained so that src/app/ has no
 * imports outside its own directory — required for it to work as a published
 * npm artifact compiled by the user's Vite. Node-side code uses the copy in
 * src/utils/lang-utils.ts compiled to dist/.
 */

export function detectCurrentLang(
  pathname: string,
  language: LanguageConfig | null,
  defaultLanguage: string,
): string {
  if (!language || language.languages.length <= 1) return defaultLanguage;
  const firstSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  const nonDefault = language.languages.filter((l) => l !== defaultLanguage);
  return nonDefault.includes(firstSegment) ? firstSegment : defaultLanguage;
}

export function buildLangPrefix(lang: string, defaultLanguage: string): string {
  return lang === defaultLanguage ? '' : `/${lang}`;
}

export function stripLangPrefix(
  pathname: string,
  lang: string,
  defaultLanguage: string,
): string {
  if (lang === defaultLanguage) return pathname;
  const prefix = `/${lang}`;
  const stripped = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
  return stripped || '/';
}

export function resolveLabel(
  defaultLabel: string,
  lang: string,
  defaultLanguage: string,
  translations: Record<string, Record<string, string>>,
): string {
  if (lang === defaultLanguage) return defaultLabel;
  return translations[lang]?.[defaultLabel] ?? defaultLabel;
}

export function applyLangToSidenav(
  items: SidenavConfig,
  prefix: string,
  lang: string,
  defaultLanguage: string,
  translations: Record<string, Record<string, string>>,
): SidenavConfig {
  return items.map((item) => ({
    ...item,
    label: resolveLabel(item.label, lang, defaultLanguage, translations),
    path: item.path !== undefined ? `${prefix}${item.path}` : undefined,
    children: item.children
      ? applyLangToSidenav(item.children, prefix, lang, defaultLanguage, translations)
      : undefined,
  }));
}
