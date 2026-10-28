import { slugify } from '../content/slug.js';

/**
 * Turns an `operationId` into its URL slug: `createPayment` → `create-payment`.
 *
 * The shared `slugify()` can't be used directly: it only breaks on
 * non-alphanumeric runs, so it would flatten `createPayment` to
 * `createpayment`. Operation ids are camelCase by overwhelming convention,
 * so the camel boundaries are split first and the result handed to
 * `slugify` for the rest (lowercasing, diacritics, separator collapsing) —
 * one definition of "URL-safe", not two.
 *
 * The `([a-z0-9])([A-Z])` pass handles `createPayment`; the
 * `([A-Z]+)([A-Z][a-z])` pass keeps acronyms intact, so `getHTTPConfig`
 * becomes `get-http-config` rather than `get-h-t-t-p-config`.
 */
export function operationSlug(operationId: string): string {
  const spaced = operationId
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return slugify(spaced);
}

/**
 * Turns an example key into a display label: `bank-transfer` → "Bank transfer",
 * `402-declined` → "402 declined".
 */
export function humanizeKey(key: string): string {
  const words = key.replace(/[-_.]+/g, ' ').trim();
  if (words === '') return key;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Derives an operation's route prefix for a registry entry.
 *
 * Defaults to `/api/<id>` when no `routePrefix` is given — `id` is already
 * required and already path-safe, so the common case needs no route config
 * at all. An explicit `routePrefix` overrides it: `"/"` mounts operations at
 * the site root (the dedicated-API-repo shape), anything else becomes that
 * path verbatim (`"reference/payments"` → `"/reference/payments"`).
 */
export function routePrefixFor(id: string, routePrefix?: string): string {
  const raw = routePrefix ?? `/api/${id}`;
  const trimmed = raw.replace(/^\.?\/*/, '').replace(/\/+$/, '');
  return trimmed === '' ? '' : `/${trimmed}`;
}
