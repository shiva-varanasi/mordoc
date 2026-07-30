import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import type { HeaderLink, HeaderLinksConfig } from '../types/navigation.js';

const HEADER_CONFIG_PATH = join('config', 'navigation', 'headernav.yaml');

const VALID_VARIANTS: ReadonlySet<string> = new Set(['link', 'primary', 'secondary']);

/**
 * Validates the raw YAML from headernav.yaml and narrows it to `HeaderLinksConfig`.
 * Throws a descriptive error for any malformed entry so authors get actionable feedback.
 */
function validateHeaderLinks(raw: unknown): HeaderLinksConfig {
  if (!Array.isArray(raw)) {
    throw new Error('headernav.yaml: file must contain a YAML array at the top level.');
  }

  for (const [index, entry] of (raw as unknown[]).entries()) {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`headernav.yaml: items[${index}] must be an object.`);
    }

    const obj = entry as Record<string, unknown>;

    if (typeof obj['label'] !== 'string' || obj['label'] === '') {
      throw new Error(
        `headernav.yaml: items[${index}].label is required and must be a non-empty string.`,
      );
    }

    if (typeof obj['path'] !== 'string' || obj['path'] === '') {
      throw new Error(
        `headernav.yaml: items[${index}].path is required and must be a non-empty string.`,
      );
    }

    if (obj['variant'] !== undefined) {
      if (typeof obj['variant'] !== 'string' || !VALID_VARIANTS.has(obj['variant'])) {
        throw new Error(
          `headernav.yaml: items[${index}].variant must be 'link', 'primary', or 'secondary'.`,
        );
      }
    }
  }

  return raw as HeaderLinksConfig;
}

/**
 * Loads config/navigation/headernav.yaml and returns the validated list of header links.
 * Returns an empty array if the file does not exist — header links are optional.
 *
 * `variant` defaults to 'link' (plain text) when omitted. External paths
 * (http/https) will open in a new tab; internal paths use React Router.
 *
 * @param projectRoot - Absolute path to the project's root directory.
 */
export async function loadHeaderLinks(projectRoot: string): Promise<HeaderLinksConfig> {
  const filePath = join(projectRoot, HEADER_CONFIG_PATH);

  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw new Error(`Failed to read ${filePath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch (err) {
    throw new Error(`Failed to parse ${filePath}: ${(err as Error).message}`);
  }

  return validateHeaderLinks(parsed);
}
