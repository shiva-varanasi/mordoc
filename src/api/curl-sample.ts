import type { FieldView, OpenApiDocument } from '../types/api.js';
import { isObject } from './schema-walk.js';

/**
 * Generates the cURL code sample shown in an operation's right rail.
 *
 * Built in-house rather than pulled from a snippet library: cURL is the one
 * sample every API reference needs and the only one whose shape is settled,
 * so a dependency would buy little now and commit the project to somebody
 * else's template model before the feature has met a real spec. The
 * `samples[]` array is already a list, so additional languages slot in later
 * without a data-shape change.
 *
 * Runs at build time. Nothing here reaches the browser.
 */

/**
 * Wraps a value for a single-quoted POSIX shell argument.
 *
 * A single-quoted shell string cannot contain a single quote, so each one is
 * closed, escaped and reopened — the standard `'\''` dance. Worth doing
 * properly: an apostrophe in an example value would otherwise produce a
 * sample that silently fails to run when pasted.
 */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/** The server the sample points at. Falls back to a placeholder host when the spec declares none. */
function serverUrl(document: OpenApiDocument): string {
  const servers = document['servers'];
  if (Array.isArray(servers) && servers.length > 0 && isObject(servers[0])) {
    const url = (servers[0] as Record<string, unknown>)['url'];
    if (typeof url === 'string' && url !== '') return url.replace(/\/+$/, '');
  }
  return 'https://api.example.com';
}

/**
 * Picks a stand-in for a path, query or header parameter.
 *
 * `concrete` says whether the value came from the spec or is a
 * `<placeholder>` the reader is expected to replace. The distinction drives
 * URL encoding: a real value must be encoded, but encoding a placeholder
 * turns the readable `/payments/<id>` into `/payments/%3Cid%3E`, which tells
 * the reader nothing and looks like a bug.
 */
function parameterValue(field: FieldView): { value: string; concrete: boolean } {
  if (field.enum && field.enum.length > 0) {
    return { value: field.enum[0] as string, concrete: true };
  }
  if (typeof field.default === 'string' || typeof field.default === 'number') {
    return { value: String(field.default), concrete: true };
  }
  if (field.type === 'integer' || field.type === 'number') return { value: '0', concrete: true };
  if (field.type === 'boolean') return { value: 'true', concrete: true };
  return { value: `<${field.name}>`, concrete: false };
}

/** Encodes a parameter value, leaving `<placeholder>` markers legible. */
function encodeValue(picked: { value: string; concrete: boolean }): string {
  return picked.concrete ? encodeURIComponent(picked.value) : picked.value;
}

export interface CurlSampleInput {
  document: OpenApiDocument;
  method: string;
  /** The spec path template, e.g. "/payments/{id}". */
  path: string;
  /** Resolved parameter rows, carrying their `in` location on `_in`. */
  pathParams: FieldView[];
  queryParams: FieldView[];
  headerParams: FieldView[];
  mediaType: string | null;
  /** The request payload to send, already merged/synthesized. */
  body: unknown;
}

/**
 * Builds a runnable cURL invocation for one operation.
 *
 * Path parameters are substituted inline, required query parameters are
 * appended (optional ones are left out to keep the sample to the minimum
 * that actually works), and header parameters become `-H` flags. The body
 * is the same payload the example panel shows, so the two never disagree.
 */
export function buildCurlSample(input: CurlSampleInput): string {
  const { document, method, path, pathParams, queryParams, headerParams, mediaType, body } = input;

  let url = path;
  for (const param of pathParams) {
    url = url.replace(`{${param.name}}`, encodeValue(parameterValue(param)));
  }

  // Only required parameters and headers appear. The sample's job is the
  // minimum invocation that actually works; every optional input is already
  // documented in the field table beside it, and including them all would
  // bury the required ones in a wall of placeholders.
  const query = queryParams
    .filter((p) => p.required)
    .map((p) => `${encodeURIComponent(p.name)}=${encodeValue(parameterValue(p))}`);
  if (query.length > 0) url += `?${query.join('&')}`;

  const lines = [`curl -X ${method.toUpperCase()} ${shellQuote(`${serverUrl(document)}${url}`)}`];

  if (mediaType) lines.push(`-H ${shellQuote(`Content-Type: ${mediaType}`)}`);
  for (const header of headerParams.filter((p) => p.required)) {
    lines.push(`-H ${shellQuote(`${header.name}: ${parameterValue(header).value}`)}`);
  }

  if (body !== undefined && body !== null && mediaType) {
    const payload = mediaType.includes('json') ? JSON.stringify(body, null, 2) : String(body);
    lines.push(`-d ${shellQuote(payload)}`);
  }

  return lines.join(' \\\n  ');
}
