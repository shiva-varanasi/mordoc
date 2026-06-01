import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SiteConfig } from '../types/site.js';

// Relative path to the site config file within any Mordoc project root.
const SITE_CONFIG_PATH = join('config', 'site.json');

// Fields that must be present and non-empty for a config to be considered valid.
const REQUIRED_FIELDS: (keyof SiteConfig)[] = [
  'name',
  'description',
  'baseUrl',
  'defaultLanguage',
];

/**
 * Validates the raw parsed JSON from site.json and narrows it to SiteConfig.
 * Throws a descriptive error if any required field is missing or malformed,
 * so the user gets actionable feedback rather than a cryptic runtime crash.
 */
function validateSiteConfig(raw: unknown): SiteConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('site.json must contain a JSON object.');
  }

  const obj = raw as Record<string, unknown>;

  for (const field of REQUIRED_FIELDS) {
    if (typeof obj[field] !== 'string' || obj[field] === '') {
      throw new Error(`site.json: "${field}" is required and must be a non-empty string.`);
    }
  }

  // Validate baseUrl with the built-in URL parser — it handles all the edge
  // cases (missing protocol, invalid characters, etc.) so we don't have to.
  const baseUrl = obj['baseUrl'] as string;
  try {
    new URL(baseUrl);
  } catch {
    throw new Error(`site.json: "baseUrl" must be a valid URL. Got: "${baseUrl}"`);
  }

  // A trailing slash on baseUrl would cause double-slashes when paths are appended.
  if (baseUrl.endsWith('/')) {
    throw new Error(`site.json: "baseUrl" must not end with a trailing slash. Got: "${baseUrl}"`);
  }

  const meta = obj['metadata'];
  if (meta !== undefined) {
    if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) {
      throw new Error('site.json: "metadata" must be an object.');
    }
    const metaObj = meta as Record<string, unknown>;
    if (metaObj['ogImage'] !== undefined) {
      if (typeof metaObj['ogImage'] !== 'string') {
        throw new Error('site.json: "metadata.ogImage" must be a string.');
      }
      if (!metaObj['ogImage'].startsWith('/')) {
        throw new Error(
          `site.json: "metadata.ogImage" must be a root-relative path starting with "/" (e.g. "/images/og-cover.png"). Got: "${metaObj['ogImage']}"`,
        );
      }
    }
  }

  return raw as SiteConfig;
}

/**
 * Reads and validates the site.json config file for a Mordoc project.
 *
 * @param projectRoot - Absolute path to the project's root directory.
 * @returns The validated site configuration object.
 * @throws If the file is missing, unreadable, contains invalid JSON,
 *         or fails field validation.
 */
export async function loadSiteConfig(projectRoot: string): Promise<SiteConfig> {
  const filePath = join(projectRoot, SITE_CONFIG_PATH);

  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new Error(`Config file not found: ${filePath}\nEvery Mordoc project requires a config/site.json file.`);
    }
    throw new Error(`Failed to read ${filePath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Failed to parse ${filePath}: Invalid JSON.`);
  }

  return validateSiteConfig(parsed);
}
