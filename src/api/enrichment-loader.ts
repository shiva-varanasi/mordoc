import { readdir } from 'node:fs/promises';
import { join, sep } from 'node:path';
import type { ApiRegistry, EnrichmentEntry, EnrichmentKind } from '../types/api.js';

/**
 * Stage B — enrichment discovery.
 *
 * Enrichment lives at `api/enrichment/<id>/operations/*.md` and
 * `api/enrichment/<id>/schemas/*.md`, beside the spec and examples it
 * describes rather than under `content/`. It is written once, in English, so
 * it needs none of the per-language discovery that pages get — and keeping
 * it out of `content/` means everything in `content/` is a route, with no
 * exception for the page walker to know about.
 *
 * The folder is derived from the registry `id`, exactly like
 * `api/examples/<id>/`. An API with no folder on disk simply has no
 * enrichment, which is the normal case for a spec-only API (principle 9).
 */

const ENRICHMENT_DIR = join('api', 'enrichment');

/** Recursively finds all .md files in a directory, relative to it, forward-slashed. */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = (await readdir(dir, { recursive: true })) as unknown as string[];
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return [];
    throw new Error(`Failed to read directory ${dir}: ${(err as Error).message}`);
  }
  return entries.filter((entry) => entry.endsWith('.md')).map((entry) => entry.replaceAll(sep, '/'));
}

/** Reads one API's `operations/` or `schemas/` subfolder. */
async function loadKind(
  projectRoot: string,
  specId: string,
  kind: EnrichmentKind,
): Promise<EnrichmentEntry[]> {
  const folderName = kind === 'operation' ? 'operations' : 'schemas';
  const relBase = `api/enrichment/${specId}/${folderName}`;
  const dir = join(projectRoot, ENRICHMENT_DIR, specId, folderName);

  const files = await findMarkdownFiles(dir);
  const out: EnrichmentEntry[] = [];
  for (const file of files) {
    const target = file.replace(/\.md$/, '');
    if (target.includes('/')) {
      // The filename *is* the target name, so a nested path has no target to be.
      console.warn(
        `⚠ ${relBase}/${file}: enrichment files must sit directly in ${relBase}/ — ` +
          `the filename is the operationId or schema name. Skipped.`,
      );
      continue;
    }
    out.push({ specId, kind, target, filePath: join(dir, file.replaceAll('/', sep)) });
  }
  return out;
}

/** Discovers every enrichment file for every registered API. */
export async function loadEnrichment(
  projectRoot: string,
  registry: ApiRegistry,
): Promise<EnrichmentEntry[]> {
  const found: EnrichmentEntry[] = [];
  for (const entry of registry.entries) {
    found.push(...(await loadKind(projectRoot, entry.id, 'operation')));
    found.push(...(await loadKind(projectRoot, entry.id, 'schema')));
  }
  return found;
}
