import type { RenderableTreeNode } from '@markdoc/markdoc';

/**
 * Types for the API reference feature.
 *
 * Two families live here:
 *   - Build-time shapes (`ApiRegistry`, `ResolvedSpec`, `EnrichmentEntry`,
 *     `ParsedEnrichment`) — consumed only by `src/api/` on the Node side.
 *   - Ship-time shapes (`FieldView`, `OperationView`) — the flat,
 *     JSON-serializable payload that reaches the browser.
 *
 * The split mirrors the diagram precedent: the OpenAPI document and every
 * walker that reasons about it stay on the build side, and only their
 * flattened output crosses into the bundle. Nothing in the ship-time half
 * references an OpenAPI type, so the client never needs the spec library.
 */

// ---------------------------------------------------------------------------
// Registry — config/api.yaml
// ---------------------------------------------------------------------------

/** One API declared in `config/api.yaml`. */
export interface ApiRegistryEntry {
  /**
   * Handle for this API. Names its examples and enrichment folders
   * (`api/examples/<id>/`, `api/enrichment/<id>/`) and scopes enrichment
   * targets when a project registers more than one spec. Required to be
   * path-safe (see validation), which is also what makes it a safe default
   * route segment.
   */
  id: string;
  /** Filename under `api/specs/` (e.g. "payments.yaml"). */
  spec: string;
  /**
   * URL prefix for this API's generated operation pages. Optional —
   * defaults to `/api/<id>`, which needs no config since `id` is already
   * required and already path-safe. Set it explicitly to mount operations
   * at the site root (`"/"`, the dedicated-API-repo shape) or to fit a
   * different URL taxonomy (`"reference/payments"`).
   */
  routePrefix?: string;
}

/**
 * The parsed `config/api.yaml`.
 *
 * The file accepts two shapes. A bare YAML array is the shorthand and the
 * common case:
 *
 * ```yaml
 * - id: payments
 *   spec: payments.yaml
 * ```
 *
 * An object form exists solely to carry `strict`, which has nowhere to sit
 * on an array:
 *
 * ```yaml
 * strict: true
 * specs:
 *   - id: payments
 *     ...
 * ```
 */
export interface ApiRegistry {
  /**
   * When true, every warning in the "warn and skip" class is escalated to a
   * build error — the CI gate for teams that want one. Never downgrades a
   * hard failure. Default false (permissive).
   */
  strict: boolean;
  entries: ApiRegistryEntry[];
}

// ---------------------------------------------------------------------------
// Stage A — loaded specs
// ---------------------------------------------------------------------------

/**
 * A minimally-typed OpenAPI document. Deliberately not a full OpenAPI type:
 * the walker treats the document as plain data and reads only the keys it
 * understands, so importing a large third-party type here would buy
 * precision the code never uses and couple every downstream module to the
 * spec library's release cadence.
 */
export type OpenApiDocument = Record<string, unknown>;

/** One registry entry after its spec has been loaded, validated and bundled. */
export interface ResolvedSpec {
  id: string;
  /**
   * The registry entry's `routePrefix` if set, else `/api/<id>`. See
   * `routePrefixFor` in `slug.ts`.
   */
  routePrefix: string;
  /**
   * The bundled document — external file `$ref`s inlined, internal
   * `#/components/...` pointers left intact.
   *
   * Bundled rather than dereferenced on purpose. Dereferencing erases the
   * component name that `FieldView.schemaRef` needs for the type link, and
   * turns any recursive schema into a circular object graph that cannot be
   * JSON-serialized. Internal pointers are followed by the field walker,
   * which knows how to stop at a cycle.
   */
  document: OpenApiDocument;
}

// ---------------------------------------------------------------------------
// Stage B — enrichment discovery
// ---------------------------------------------------------------------------

/** Which kind of spec object an enrichment file attaches to. */
export type EnrichmentKind = 'operation' | 'schema';

/**
 * One discovered enrichment file under `api/enrichment/<specId>/`. Written
 * once, in English — see `src/api/enrichment-loader.ts`.
 */
export interface EnrichmentEntry {
  /** Registry id of the API this file enriches. */
  specId: string;
  /** From the folder: `operations/` or `schemas/`. */
  kind: EnrichmentKind;
  /** From the filename: the `operationId` or the component schema name. */
  target: string;
  filePath: string;
}

// ---------------------------------------------------------------------------
// Stage C — parsed enrichment
// ---------------------------------------------------------------------------

/**
 * The one reserved badge keyword. OpenAPI cannot express every conditional
 * rule, so a writer marks such a field `conditional` and Mordoc renders it
 * with a dedicated style (and requires an explanation — see
 * `checkConditionalBadges`). Matched case-insensitively; normalized to this
 * lowercase form at parse time.
 */
export const CONDITIONAL_BADGE = 'conditional';

/**
 * An authored badge: either the reserved `conditional` keyword, or any other
 * free text, rendered verbatim as an inline-code chip.
 *
 * `deprecated` is deliberately not authored — it is derived from the spec's
 * own `deprecated: true`.
 */
export type Badge = string;

/** Which namespace of an operation a `{% params %}` block addresses. */
export type ParamsScope =
  /** Parameters and request body together — a bare `{% params %}`. */
  | { in: 'request' }
  /** One response, addressed by status. `status` is required; responses are never implicit. */
  | { in: 'response'; status: string };

/** One `###` entry inside a `{% params %}` block. */
export interface EnrichmentField {
  /** The heading text: a field name or dotted path. An identifier, never prose. */
  path: string;
  /** Which namespace this entry addresses. */
  scope: ParamsScope;
  /**
   * 'append' adds an endpoint-scoped note under the shared description;
   * 'replace' overrides it outright. Set on the containing block, not per
   * entry. Meaningless for schema files, which always replace.
   */
  mode: 'append' | 'replace';
  /** Authored badge from the heading annotation, if any. */
  badge: Badge | null;
  /** The entry's body as a renderable tree — full Markdoc, same as guides. */
  body: RenderableTreeNode | null;
}

/** One enrichment file after parsing. */
export interface ParsedEnrichment {
  specId: string;
  kind: EnrichmentKind;
  target: string;
  filePath: string;
  /**
   * Everything outside any `{% params %}` block. For an operation file this
   * is the operation's intro prose, which has the same scope as the spec's
   * `description` and therefore replaces it. Always null for schema files,
   * where every heading is a field by definition.
   */
  narrative: RenderableTreeNode | null;
  fields: EnrichmentField[];
}

// ---------------------------------------------------------------------------
// Stage D — the shipped view
// ---------------------------------------------------------------------------

/** Where a field's description text came from — makes the layering debuggable. */
export type DescriptionSource = 'spec' | 'schema-doc';

/** One row in the rendered field tree. */
export interface FieldView {
  /** The name the spec gives it: "card_token", "Idempotency-Key". */
  name: string;
  /** Dotted path from the namespace root: "billing_address.city". Also the anchor id. */
  path: string;
  /** Rendered type: "string", "object", "array of objects". */
  type: string;
  /** Component schema name behind this field, when it is a `$ref`. Drives the type link. */
  schemaRef?: string;
  required: boolean;
  /**
   * Derived condition for a structurally-conditional field, as a bare
   * clause ("payment_method is card"). The UI renders it as
   * "Required when payment_method is card". Derived from `if`/`then` and
   * `dependentRequired` — never authored.
   */
  requiredWhen?: string;
  enum?: string[];
  format?: string;
  default?: unknown;
  deprecated?: boolean;
  /** Authored in enrichment; `conditional` or free text; usually empty. */
  badges: Badge[];
  description: RenderableTreeNode | null;
  descriptionSource: DescriptionSource;
  /**
   * Endpoint-scoped addendum from an operation file. Only ever non-null when
   * it should render — a schema-level `mode="replace"` override clears this
   * to null rather than leaving a stale note behind, so its presence alone
   * is the signal to render it (see `applyEntry` in `build-operation-views.ts`).
   */
  note: RenderableTreeNode | null;
  children: FieldView[];
  /** `oneOf` / `anyOf` alternatives. */
  variants?: { label: string; fields: FieldView[] }[];
  /**
   * Set when this field re-enters a schema already open further up the
   * tree. The value is the ancestor's `path`; the UI renders a link back to
   * it instead of expanding, which is what stops a self-referential schema
   * from producing an infinite field tree.
   */
  recursiveRef?: string;
}

/** One rendered example or sample payload. */
export interface ExampleView {
  kind: 'request' | 'response';
  /**
   * Case name for a request ("card"); the example's own name for a response
   * ("AmazonPay"), or the bare status when it came from the spec's singular
   * `example` or was synthesized. Unique only in combination with `status`
   * for a response — two different statuses can each have their own
   * same-named example (e.g. an "AmazonPay" example under both 201 and 402).
   */
  key: string;
  /** Humanized key: "bank-transfer" → "Bank transfer". */
  label: string;
  /**
   * The status this example belongs to. Set only for `kind: 'response'` —
   * this, not `key`, is what associates an example with its response, since
   * a named example's `key` is its own name and carries no status of its own.
   */
  status?: string;
  json: unknown;
}

/**
 * Request-side parameters, grouped by OpenAPI `in` location. Shipped this way
 * — instead of one flat list — so the UI can render "Header" / "Path" /
 * "Query" / "Cookie" as their own labelled groups under "Request" rather than
 * dumping every location under one undifferentiated "Parameters" heading. A
 * location nobody declared is simply an empty array.
 */
export interface ParameterGroups {
  path: FieldView[];
  query: FieldView[];
  header: FieldView[];
  cookie: FieldView[];
}

/**
 * One operation page, fully resolved. One per operation × language: the
 * content is the same English in every language, but each language gets
 * its own page so the reader stays inside their own language's shell.
 */
export interface OperationView {
  operationId: string;
  /** Uppercased for display: "POST". */
  method: string;
  /**
   * The spec path template: "/payments/{id}". For a webhook (`isWebhook`
   * true) this is instead the `webhooks` map key — a name, not a callable
   * URL, e.g. "payment.captured".
   */
  path: string;
  /** Language-prefixed route this page is served at. */
  routePath: string;
  language: string;
  /**
   * True for every non-default language. These pages repeat the
   * default-language page's content, so they are fallbacks exactly like an
   * untranslated guide: canonical points at the default-language URL and
   * they stay out of the sitemap.
   */
  isFallback?: boolean;
  /** Registry id of the owning spec. */
  specId: string;
  /**
   * True when this came from the spec's top-level `webhooks` map (OpenAPI
   * 3.1) rather than `paths` — the API delivers this to the integrator's
   * own endpoint, instead of the integrator calling it. Everything else
   * about the page works identically: same routing, same enrichment
   * targeting, same `operation:` nav reference. The only other effect is on
   * `samples`, which is always `[]` for a webhook — there is nothing to
   * curl.
   */
  isWebhook?: boolean;
  /** The spec's `summary` — page title and nav label fallback. */
  summary: string;
  /** Enrichment narrative if present, else the spec's `description`, as a renderable tree. */
  narrative: RenderableTreeNode | null;
  deprecated?: boolean;
  parameters: ParameterGroups;
  requestBody: { mediaType: string; required: boolean; fields: FieldView[] } | null;
  responses: { status: string; description: string; mediaType: string | null; fields: FieldView[] }[];
  examples: ExampleView[];
  /**
   * One code sample per language × request example — a curl invocation
   * varies by which request example is selected (its body is `-d`'s
   * payload), so there is no single canonical sample once more than one
   * request example exists. `forExample` is a request `ExampleView.key`,
   * or `''` when the operation has no request examples at all (a bodyless
   * GET, say) — there is exactly one sample per language in that case.
   */
  samples: { language: string; label: string; forExample: string; code: string }[];
}
