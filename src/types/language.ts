/**
 * Shape of the config/language.json file.
 * This file is optional — single-language projects can omit it entirely.
 * Each entry is a language code matching a folder under content/ (e.g. "en", "de").
 */
export interface LanguageConfig {
  languages: string[];
}
