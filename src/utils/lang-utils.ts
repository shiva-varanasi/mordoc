import type { LanguageConfig } from '../types/language.js';

/**
 * Returns the active language code from the current pathname.
 *
 * The default language has no URL prefix, so `/flight-manual/safety` is
 * English (or whichever `defaultLanguage` is). Only non-default language
 * codes appear as the first path segment: `/de/flight-manual/safety` → `de`.
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

/** Returns `/<lang>` for non-default languages, or `''` for the default. */
export function buildLangPrefix(lang: string, defaultLanguage: string): string {
  return lang === defaultLanguage ? '' : `/${lang}`;
}

/**
 * Strips the language prefix from a pathname to get the content-relative path.
 * e.g. `/de/flight-manual/safety` → `/flight-manual/safety`
 *      `/flight-manual/safety`    → `/flight-manual/safety` (default lang, unchanged)
 */
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

/**
 * Looks up a translated nav label for `lang`, falling back to `defaultLabel`
 * when no translation is found (missing file, missing key, or default language).
 */
export function resolveLabel(
  defaultLabel: string,
  lang: string,
  defaultLanguage: string,
  translations: Record<string, Record<string, string>>,
): string {
  if (lang === defaultLanguage) return defaultLabel;
  return translations[lang]?.[defaultLabel] ?? defaultLabel;
}
