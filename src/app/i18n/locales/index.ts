import type { UiStrings } from '../types.js';
import { en } from './en.js';
import { es } from './es.js';
import { fr } from './fr.js';
import { de } from './de.js';
import { pt } from './pt.js';
import { ja } from './ja.js';
import { zh } from './zh.js';
import { ko } from './ko.js';
import { it } from './it.js';
import { nl } from './nl.js';
import { ru } from './ru.js';
import { ar } from './ar.js';
import { hi } from './hi.js';

/**
 * Tier-1 built-in chrome-string catalogs, keyed by language code.
 *
 * A project may declare (config/language.json) any language code at all —
 * only the ones listed here get fully localized chrome; anything else
 * falls back to `en` (see ../useUiStrings.ts). Content, sidenav/topnav/header
 * labels are unaffected either way — those go through resolveLabel() in
 * ../lang-utils.ts instead, which is authored by the user, not Mordoc.
 */
export const locales: Record<string, UiStrings> = {
  en, es, fr, de, pt, ja, zh, ko, it, nl, ru, ar, hi,
};
