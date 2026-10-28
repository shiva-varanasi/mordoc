import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import type { ApiRegistry, ApiRegistryEntry } from '../types/api.js';

/** Path of the registry file, relative to the project root. */
export const API_CONFIG_PATH = join('config', 'api.yaml');

const FILE_LABEL = 'config/api.yaml';

/** Validates an optional string field, returning `undefined` when absent. */
function optionalString(obj: Record<string, unknown>, key: string, location: string): string | undefined {
  if (obj[key] === undefined) return undefined;
  if (typeof obj[key] !== 'string' || obj[key] === '') {
    throw new Error(`${FILE_LABEL}: ${location}.${key} must be a non-empty string when provided.`);
  }
  return obj[key];
}

function validateEntry(raw: unknown, location: string): ApiRegistryEntry {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(`${FILE_LABEL}: ${location} must be an object.`);
  }
  const obj = raw as Record<string, unknown>;

  for (const key of ['id', 'spec'] as const) {
    if (typeof obj[key] !== 'string' || obj[key] === '') {
      throw new Error(
        `${FILE_LABEL}: ${location}.${key} is required and must be a non-empty string.`,
      );
    }
  }

  const id = obj['id'] as string;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    // The id names folders on disk (api/examples/<id>/, api/enrichment/<id>/),
    // is used as a lookup handle throughout, and is the default route segment
    // (/api/<id>/...); keeping it to a path-safe character set avoids a
    // whole class of "works on my filesystem" (and "works in a URL") bugs.
    throw new Error(
      `${FILE_LABEL}: ${location}.id "${id}" must contain only letters, digits, hyphens and underscores.`,
    );
  }

  return {
    id,
    spec: obj['spec'] as string,
    routePrefix: optionalString(obj, 'routePrefix', location),
  };
}

/**
 * Reads and validates `config/api.yaml`.
 *
 * Returns null when the file is absent — that is the normal case for a
 * project with no API reference, and it is what lets the pipeline skip
 * loading the OpenAPI library entirely.
 *
 * Two file shapes are accepted. A bare YAML array is the shorthand:
 *
 * ```yaml
 * - id: payments
 *   spec: payments.yaml
 * ```
 *
 * An object with a `specs` key exists so `strict` has somewhere to live —
 * an array has no top level to hang it off:
 *
 * ```yaml
 * strict: true
 * specs:
 *   - id: payments
 *     ...
 * ```
 */
export async function loadApiRegistry(projectRoot: string): Promise<ApiRegistry | null> {
  let content: string;
  try {
    content = await readFile(join(projectRoot, API_CONFIG_PATH), 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw new Error(`Failed to read ${FILE_LABEL}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch (err) {
    throw new Error(`Failed to parse ${FILE_LABEL}: ${(err as Error).message}`);
  }

  let strict = false;
  let rawEntries: unknown;

  if (Array.isArray(parsed)) {
    rawEntries = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    if (obj['strict'] !== undefined) {
      if (typeof obj['strict'] !== 'boolean') {
        throw new Error(`${FILE_LABEL}: "strict" must be a boolean when provided.`);
      }
      strict = obj['strict'];
    }
    if (!Array.isArray(obj['specs'])) {
      throw new Error(
        `${FILE_LABEL}: expected either a top-level array of API entries, or an ` +
          `object with a "specs" array.`,
      );
    }
    rawEntries = obj['specs'];
  } else {
    throw new Error(
      `${FILE_LABEL}: expected either a top-level array of API entries, or an ` +
        `object with a "specs" array.`,
    );
  }

  const list = rawEntries as unknown[];
  if (list.length === 0) {
    throw new Error(`${FILE_LABEL}: at least one API entry is required.`);
  }

  const entries = list.map((raw, i) => validateEntry(raw, `entries[${i}]`));

  const seenIds = new Set<string>();
  for (const entry of entries) {
    if (seenIds.has(entry.id)) {
      throw new Error(`${FILE_LABEL}: duplicate API id "${entry.id}".`);
    }
    seenIds.add(entry.id);
  }

  return { strict, entries };
}
