import { useLocation } from 'react-router';
import { useMordocData } from '../data-context.js';
import { detectCurrentLang } from '../lang-utils.js';
import { locales } from './locales/index.js';
import type { UiStrings } from './types.js';

/**
 * Resolves Mordoc's own chrome strings (search UI, aria-labels, "On this
 * page", etc.) for the current page's language.
 *
 * Falls back to the `en` catalog when the current language isn't one of
 * the tier-1 built-ins in ./locales/index.ts — this never fails the build;
 * it's a graceful per-string degradation, same as any other missing asset.
 */
export function useUiStrings(): UiStrings {
  const { site, language } = useMordocData();
  const { pathname } = useLocation();
  const currentLang = detectCurrentLang(pathname, language, site.defaultLanguage);
  return locales[currentLang] ?? locales.en;
}
