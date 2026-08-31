import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import type { FooterConfig } from '../types/navigation.js';

const FOOTER_CONFIG_PATH = join('config', 'navigation', 'footer.yaml');

const ZONE_KEYS = ['start', 'center', 'end'] as const;

/** Matches a YAML sequence item whose value starts with an unquoted "[". */
const UNQUOTED_BRACKET_ITEM_RE = /^\s*-\s*\[/;

/**
 * When yaml.load() fails, checks for the single most common cause with
 * footer.yaml: a line like `- [Privacy Policy](/privacy)`, where the
 * unquoted `[` is read by YAML as the start of an inline list rather than
 * literal text — since footer lines are expected to use `[text](url)` link
 * syntax, this is easy to hit and js-yaml's own error for it ("bad
 * indentation of a mapping entry...") doesn't say what's actually wrong.
 *
 * Returns a pointed hint naming the offending line when found, or null when
 * the parse failure doesn't match this shape (the caller falls back to
 * surfacing js-yaml's own message).
 */
function unquotedBracketHint(content: string): string | null {
  const lines = content.split('\n');
  for (const [index, line] of lines.entries()) {
    if (UNQUOTED_BRACKET_ITEM_RE.test(line)) {
      return (
        `footer.yaml:${index + 1}: this line starts with "[", which YAML reads as the start ` +
        `of a list, not text. Wrap it in quotes: - "[text](url)"`
      );
    }
  }
  return null;
}

function validateZone(raw: unknown, zone: string): string[] {
  if (!Array.isArray(raw)) {
    throw new Error(`footer.yaml: "${zone}" must be an array of strings.`);
  }
  for (const [index, line] of raw.entries()) {
    if (typeof line !== 'string' || line === '') {
      throw new Error(`footer.yaml: "${zone}"[${index}] must be a non-empty string.`);
    }
  }
  return raw as string[];
}

/**
 * Validates the raw YAML from footer.yaml and narrows it to `FooterConfig`.
 * Throws a descriptive error for any malformed entry so authors get actionable feedback.
 */
function validateFooterConfig(raw: unknown): FooterConfig {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(
      'footer.yaml: file must contain a YAML object with optional "start", "center", "end" keys, each an array of strings.',
    );
  }

  const obj = raw as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    if (!ZONE_KEYS.includes(key as (typeof ZONE_KEYS)[number])) {
      throw new Error(
        `footer.yaml: unknown key "${key}" — only "start", "center", "end" are supported.`,
      );
    }
  }

  const config: FooterConfig = {};
  for (const zone of ZONE_KEYS) {
    if (obj[zone] !== undefined) {
      config[zone] = validateZone(obj[zone], zone);
    }
  }
  return config;
}

/**
 * Loads config/navigation/footer.yaml and returns the validated footer
 * columns.
 *
 * Returns null when the file does not exist — callers fall back to Mordoc's
 * built-in default footer (a "Powered by Mordoc" attribution line) in that
 * case. An explicit empty file (or one with no zones / all-empty zones) is
 * different from a missing file: it means the author wants no footer at
 * all, and is returned as `{}`.
 *
 * Inline `[text](url)` links are resolved at render time, not here — this
 * loader only validates shape.
 *
 * @param projectRoot - Absolute path to the project's root directory.
 */
export async function loadFooterConfig(projectRoot: string): Promise<FooterConfig | null> {
  const filePath = join(projectRoot, FOOTER_CONFIG_PATH);

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
    parsed = yaml.load(content);
  } catch (err) {
    throw new Error(unquotedBracketHint(content) ?? `Failed to parse ${filePath}: ${(err as Error).message}`);
  }

  // An empty file parses to undefined/null — treat it the same as an empty
  // object (no zones) rather than a shape error.
  if (parsed === null || parsed === undefined) {
    return {};
  }

  return validateFooterConfig(parsed);
}
