import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ExampleView, OpenApiDocument } from '../types/api.js';
import type { Diagnostics } from './diagnostics.js';
import { isObject, mergeAllOf, resolveSchema, type Schema } from './schema-walk.js';
import { humanizeKey } from './slug.js';

/** Directory holding authored example payloads, relative to the project root. */
export const EXAMPLES_DIR = join('api', 'examples');

/**
 * Example payloads for an operation page: synthesized from the schema,
 * merged with the spec's own named examples, then merged with anything
 * authored under `api/examples/`.
 *
 * Examples are deliberately language-neutral — one set renders for every
 * language. A payload is field names and values from the API's own domain;
 * translating it would produce a request body that does not work.
 */

// ---------------------------------------------------------------------------
// Synthesis
// ---------------------------------------------------------------------------

/**
 * Builds a representative payload from a schema alone.
 *
 * This is what makes principle 9 hold for the example panel: an operation
 * page shows a payload even when nobody has authored one and the spec
 * carries no `example` of its own. The spec's own hints win wherever they
 * exist — `example`, then `examples[0]`, then `default`, then the first
 * `enum` member — and only a schema offering none of those falls through to
 * a placeholder derived from `type` and `format`.
 *
 * `open` carries the pointers already being expanded so a self-referential
 * schema terminates instead of recursing forever; a repeat visit yields
 * null, which reads as an explicit "nothing further here".
 */
function synthesize(
  document: OpenApiDocument,
  rawSchema: Schema,
  open: Set<string>,
  depth = 0,
): unknown {
  const resolved = resolveSchema(document, rawSchema);
  if (resolved.pointer !== null && open.has(resolved.pointer)) return null;
  if (depth > 8) return null;

  const schema = mergeAllOf(document, resolved.schema);

  if (schema['example'] !== undefined) return schema['example'];
  if (Array.isArray(schema['examples']) && schema['examples'].length > 0) {
    return schema['examples'][0];
  }
  if (schema['default'] !== undefined) return schema['default'];
  if (Array.isArray(schema['enum']) && schema['enum'].length > 0) return schema['enum'][0];
  if (schema['const'] !== undefined) return schema['const'];

  const nextOpen = new Set(open);
  if (resolved.pointer !== null) nextOpen.add(resolved.pointer);

  const alternatives = schema['oneOf'] ?? schema['anyOf'];
  if (Array.isArray(alternatives) && alternatives.length > 0 && isObject(alternatives[0])) {
    return synthesize(document, alternatives[0] as Schema, nextOpen, depth + 1);
  }

  const rawType = schema['type'];
  const type = Array.isArray(rawType)
    ? rawType.filter((t) => t !== 'null').map(String)[0]
    : typeof rawType === 'string'
      ? rawType
      : isObject(schema['properties'])
        ? 'object'
        : undefined;

  switch (type) {
    case 'object': {
      const properties = schema['properties'];
      if (!isObject(properties)) return {};
      const out: Record<string, unknown> = {};
      for (const [name, raw] of Object.entries(properties)) {
        if (!isObject(raw)) continue;
        out[name] = synthesize(document, raw, nextOpen, depth + 1);
      }
      return out;
    }
    case 'array': {
      const items = schema['items'];
      if (!isObject(items)) return [];
      return [synthesize(document, items, nextOpen, depth + 1)];
    }
    case 'integer':
      return 0;
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'null':
      return null;
    case 'string':
    default:
      return placeholderString(schema);
  }
}

/** A plausible string for a schema with no example of its own, guided by `format`. */
function placeholderString(schema: Schema): string {
  switch (schema['format']) {
    case 'date-time':
      return '2024-01-01T00:00:00Z';
    case 'date':
      return '2024-01-01';
    case 'email':
      return 'user@example.com';
    case 'uri':
    case 'url':
      return 'https://example.com';
    case 'uuid':
      return '00000000-0000-0000-0000-000000000000';
    case 'byte':
      return 'ZXhhbXBsZQ==';
    default:
      return 'string';
  }
}

/** Public wrapper — synthesizes a payload for one schema. */
export function synthesizeExample(document: OpenApiDocument, schema: Schema): unknown {
  return synthesize(document, schema, new Set());
}

// ---------------------------------------------------------------------------
// Authored examples
// ---------------------------------------------------------------------------

/** One example file found on disk. */
interface AuthoredExample {
  kind: 'request' | 'response';
  key: string;
  json: unknown;
}

/**
 * Reads `api/examples/<specId>/<operationId>/*.json`.
 *
 * Filenames carry the addressing: `request.<case>.json` for a request case,
 * `response.<status>[-suffix].json` for a response. Folder-per-operation is
 * right here even though it was rejected for descriptions — a full payload
 * is meaningful for exactly one operation, so there is no `$ref` reuse to
 * exploit and no duplication to prevent.
 *
 * Read once and shared across languages, since examples are not translated.
 */
export async function loadAuthoredExamples(
  projectRoot: string,
  specId: string,
  diagnostics: Diagnostics,
): Promise<Map<string, AuthoredExample[]>> {
  const root = join(projectRoot, EXAMPLES_DIR, specId);
  const byOperation = new Map<string, AuthoredExample[]>();

  let operationDirs: string[];
  try {
    const entries = await readdir(root, { withFileTypes: true });
    operationDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch (err) {
    // No examples folder at all is the normal case for a new project.
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      diagnostics.warn(`Failed to read ${join(EXAMPLES_DIR, specId)}: ${(err as Error).message}`);
    }
    return byOperation;
  }

  for (const operationId of operationDirs) {
    const dir = join(root, operationId);
    const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith('.json'));
    const examples: AuthoredExample[] = [];

    for (const file of files) {
      const match = /^(request|response)\.(.+)\.json$/i.exec(file);
      if (!match) {
        diagnostics.warn(
          `${join(EXAMPLES_DIR, specId, operationId, file)}: filename must be ` +
            `"request.<case>.json" or "response.<status>.json" — skipped.`,
        );
        continue;
      }

      let json: unknown;
      try {
        json = JSON.parse(await readFile(join(dir, file), 'utf-8'));
      } catch (err) {
        diagnostics.warn(
          `${join(EXAMPLES_DIR, specId, operationId, file)}: invalid JSON — ` +
            `${(err as Error).message} — skipped.`,
        );
        continue;
      }

      examples.push({
        kind: (match[1] as string).toLowerCase() as 'request' | 'response',
        key: match[2] as string,
        json,
      });
    }

    if (examples.length > 0) byOperation.set(operationId, examples);
  }

  return byOperation;
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/**
 * Pulls the named `examples` (and singular `example`) out of a media-type
 * object.
 *
 * A named example's `key` is its own name ("AmazonPay") — it carries no
 * status of its own, so `status` (when this is a response) is stamped onto
 * every `ExampleView` explicitly rather than folded into `key`. Two
 * different responses can each have an identically-named example, and
 * without `status` as a separate field there would be no way to tell them
 * apart, or to find "every example belonging to this status" at all.
 */
function specExamples(mediaType: Schema | null, kind: 'request' | 'response', status?: string): ExampleView[] {
  if (!mediaType) return [];
  const out: ExampleView[] = [];

  const named = mediaType['examples'];
  if (isObject(named)) {
    for (const [key, raw] of Object.entries(named)) {
      if (!isObject(raw)) continue;
      const value = raw['value'];
      if (value === undefined) continue;
      const label = typeof raw['summary'] === 'string' ? raw['summary'] : humanizeKey(key);
      out.push({ kind, key, label, status, json: value });
    }
  }

  if (mediaType['example'] !== undefined) {
    const key = status ?? 'default';
    out.push({ kind, key, label: humanizeKey(key), status, json: mediaType['example'] });
  }

  return out;
}

/**
 * Merges spec examples with authored ones, keyed by name — **authored wins
 * on collision**, and a writer can add cases the spec never had, which is
 * most of the value of the folder existing at all.
 *
 * A request side with nothing at all falls back to a synthesized payload so
 * the panel is never empty.
 */
export function mergeExamples(
  document: OpenApiDocument,
  requestMedia: Schema | null,
  responses: { status: string; media: Schema | null }[],
  authored: AuthoredExample[],
): ExampleView[] {
  const merged = new Map<string, ExampleView>();
  // Keyed by status too: a response example's `key` is just its own name, and
  // two different statuses routinely reuse the same name (an "AmazonPay"
  // example under both 201 and 402) — without `status` in the map key one
  // would silently overwrite the other.
  const put = (view: ExampleView) => merged.set(`${view.kind}:${view.status ?? ''}:${view.key}`, view);

  for (const view of specExamples(requestMedia, 'request')) put(view);
  for (const { status, media } of responses) {
    for (const view of specExamples(media, 'response', status)) put(view);
  }

  // Authored examples come next so they win on collision, and so the
  // synthesis pass below can see them. `response.<status>[-suffix].json`'s
  // status is the leading digits of the filename key — the same convention
  // the loader itself documents.
  for (const example of authored) {
    const status = example.kind === 'response' ? /^(\d+)/.exec(example.key)?.[1] : undefined;
    put({
      kind: example.kind,
      key: example.key,
      label: humanizeKey(example.key),
      status,
      json: example.json,
    });
  }

  // Synthesis runs last and only fills genuine gaps. Running it before the
  // authored merge would leave a generated payload sitting next to the real
  // one an author wrote — technically a superset, but it presents a made-up
  // request as a peer of a curated one, which is exactly backwards.
  const existing = [...merged.values()];
  if (
    requestMedia &&
    isObject(requestMedia['schema']) &&
    !existing.some((e) => e.kind === 'request')
  ) {
    put({
      kind: 'request',
      key: 'default',
      label: humanizeKey('example'),
      json: synthesizeExample(document, requestMedia['schema'] as Schema),
    });
  }
  for (const { status, media } of responses) {
    const hasOne = existing.some((e) => e.kind === 'response' && e.status === status);
    if (media && isObject(media['schema']) && !hasOne) {
      put({
        kind: 'response',
        key: status,
        label: status,
        status,
        json: synthesizeExample(document, media['schema'] as Schema),
      });
    }
  }

  const order = (view: ExampleView) => (view.kind === 'request' ? 0 : 1);
  return [...merged.values()].sort(
    (a, b) =>
      order(a) - order(b) ||
      (a.status ?? '').localeCompare(b.status ?? '') ||
      a.key.localeCompare(b.key),
  );
}

export type { AuthoredExample };
