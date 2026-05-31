import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { LanguageConfig } from '../types/language.js';

const LANGUAGE_CONFIG_PATH = join('config', 'language.json');

function validateLanguageConfig(raw: unknown, defaultLanguage: string): LanguageConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('language.json must contain a JSON object.');
  }

  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj['languages'])) {
    throw new Error('language.json: "languages" must be an array.');
  }

  if (obj['languages'].length === 0) {
    throw new Error('language.json: "languages" array must not be empty.');
  }

  const seen = new Set<string>();

  for (const [index, entry] of (obj['languages'] as unknown[]).entries()) {
    if (typeof entry !== 'string' || entry === '') {
      throw new Error(`language.json: languages[${index}] must be a non-empty string.`);
    }

    if (seen.has(entry)) {
      throw new Error(`language.json: duplicate language code "${entry}".`);
    }
    seen.add(entry);
  }

  const config = raw as LanguageConfig;

  if (!config.languages.includes(defaultLanguage)) {
    throw new Error(
      `language.json: the defaultLanguage "${defaultLanguage}" from site.json ` +
      `is not listed in the languages array. Add it or update site.json.`,
    );
  }

  return config;
}

/**
 * Reads and validates config/language.json for a Mordoc project.
 * Returns null if the file does not exist (single-language project).
 *
 * @param projectRoot - Absolute path to the project's root directory.
 * @param defaultLanguage - The defaultLanguage value from site.json.
 * @returns The validated language configuration, or null if the file is absent.
 */
export async function loadLanguageConfig(
  projectRoot: string,
  defaultLanguage: string,
): Promise<LanguageConfig | null> {
  const filePath = join(projectRoot, LANGUAGE_CONFIG_PATH);

  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw new Error(`Failed to read ${filePath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Failed to parse ${filePath}: Invalid JSON.`);
  }

  return validateLanguageConfig(parsed, defaultLanguage);
}
