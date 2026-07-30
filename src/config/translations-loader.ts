import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as yaml from 'js-yaml';

const TRANSLATIONS_DIR = join('config', 'navigation', 'translations');

async function loadTranslationFile(filePath: string, lang: string): Promise<Record<string, string>> {
  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw new Error(`Failed to read translation file for "${lang}": ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch (err) {
    throw new Error(`Failed to parse translation file for "${lang}": ${(err as Error).message}`);
  }

  if (parsed === null || parsed === undefined) return {};

  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(
      `Translation file for "${lang}" must be a YAML object (label: translation pairs).`,
    );
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'string') {
      throw new Error(
        `Translation file for "${lang}": value for key "${key}" must be a string.`,
      );
    }
    result[key] = value;
  }

  return result;
}

/**
 * Loads navigation label translations for all non-default languages from
 * config/navigation/translations/<lang>.yaml. Missing files silently yield
 * an empty map (English labels are shown as fallback).
 */
export async function loadNavTranslations(
  projectRoot: string,
  languages: string[],
  defaultLanguage: string,
): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {};

  for (const lang of languages) {
    if (lang === defaultLanguage) continue;
    const filePath = join(projectRoot, TRANSLATIONS_DIR, `${lang}.yaml`);
    result[lang] = await loadTranslationFile(filePath, lang);
  }

  return result;
}
