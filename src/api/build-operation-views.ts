import type { Config, RenderableTreeNode } from '@markdoc/markdoc';
import { createDefaultMarkdocConfig } from '../content/markdoc-config.js';
import { CONDITIONAL_BADGE } from '../types/api.js';
import type {
  EnrichmentField,
  ExampleView,
  FieldView,
  OpenApiDocument,
  OperationView,
  ParsedEnrichment,
  ResolvedSpec,
} from '../types/api.js';
import type { Diagnostics } from './diagnostics.js';
import { buildCurlSample } from './curl-sample.js';
import { enrichmentKey } from './enrichment-parser.js';
import { loadAuthoredExamples, mergeExamples, type AuthoredExample } from './examples.js';
import {
  isObject,
  makeMarkdownRenderer,
  resolveSchema,
  walkProperties,
  walkSchema,
  type Frame,
  type Schema,
  type WalkOptions,
} from './schema-walk.js';
import { operationSlug } from './slug.js';

/**
 * Stage D — the join.
 *
 * Takes the bundled specs, the parsed enrichment and the authored examples,
 * and produces one flat, JSON-serializable `OperationView` per operation ×
 * language (the non-default languages being fallback copies). This mirrors
 * the diagram precedent exactly:
 *
 *   buildScene(language, content)              → Scene         → <Diagram scene={…} />
 *   buildOperationViews(specs, docs, examples) → OperationView → <Operation view={…} />
 *
 * Deliberately plain-data-in / plain-data-out with no OpenAPI library
 * import, so extraction stays cheap if a second spec format ever justifies
 * its own module.
 */

/** HTTP methods a path item can declare. Anything else on a path item is metadata. */
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

/** Preference order when an operation declares several request media types. */
const MEDIA_TYPE_PREFERENCE = ['application/json', 'application/x-www-form-urlencoded'];

interface OperationSource {
  spec: ResolvedSpec;
  operationId: string;
  method: string;
  path: string;
  operation: Schema;
  /** Parameters declared on the path item, shared by every method under it. */
  pathLevelParameters: Schema[];
  /**
   * True when this operation came from the spec's top-level `webhooks` map
   * rather than `paths`. Both are the same PathItem shape — a webhook's map
   * key is a name ("payment.captured"), not a URL — so this flag is the only
   * thing that distinguishes them from here on: it turns off cURL sample
   * generation (a webhook is delivered *to* the integrator, never called)
   * and rides along into `OperationView` for the UI's "Webhook" badge.
   */
  isWebhook: boolean;
}

// ---------------------------------------------------------------------------
// Spec traversal
// ---------------------------------------------------------------------------

/**
 * Enumerates every operation in a spec — from `paths`, and, per OpenAPI
 * 3.1's `webhooks` keyword, inbound webhooks.
 *
 * An operation with no `operationId` fails the build. Mordoc requires it:
 * it is both the route slug and the enrichment filename, and inventing a
 * fallback slug would make published URLs move whenever the spec is
 * reordered. `operationId` uniqueness is checked across `paths` and
 * `webhooks` together, not per collection — they already share one
 * `enrichment/operations/*.md` folder and one sidenav `operation:` map, so a
 * collision between a webhook and a path operation is the same failure as a
 * collision between two paths.
 */
function collectOperations(spec: ResolvedSpec, diagnostics: Diagnostics): OperationSource[] {
  const out: OperationSource[] = [];
  const seen = new Map<string, string>();

  collectFromItemMap(spec, spec.document['paths'], false, out, seen, diagnostics);
  collectFromItemMap(spec, spec.document['webhooks'], true, out, seen, diagnostics);

  return out;
}

/**
 * Walks one `paths`- or `webhooks`-shaped map, appending every operation it
 * finds to `out`. Both keywords hold the same PathItem shape — only the
 * diagnostic wording and the `isWebhook` flag carried onto each
 * `OperationSource` differ.
 */
function collectFromItemMap(
  spec: ResolvedSpec,
  rawMap: unknown,
  isWebhook: boolean,
  out: OperationSource[],
  seen: Map<string, string>,
  diagnostics: Diagnostics,
): void {
  if (!isObject(rawMap)) return;

  for (const [path, rawItem] of Object.entries(rawMap)) {
    if (!isObject(rawItem)) continue;
    const item = resolveSchema(spec.document, rawItem).schema;

    const pathLevelParameters = Array.isArray(item['parameters'])
      ? item['parameters'].filter(isObject)
      : [];

    for (const method of HTTP_METHODS) {
      const raw = item[method];
      if (!isObject(raw)) continue;
      const operation = raw;

      // A webhook's map key is a name ("payment.captured"), not a URL — say
      // so in every diagnostic that names it, so a build failure points at
      // the right map instead of reading like a stray path operation.
      const reference = isWebhook
        ? `webhook ${method.toUpperCase()} ${path}`
        : `${method.toUpperCase()} ${path}`;

      const operationId = operation['operationId'];
      if (typeof operationId !== 'string' || operationId === '') {
        diagnostics.fail(
          `${spec.id}: ${reference} has no "operationId". ` +
            `Mordoc requires one — it is both the page's route slug and the name of ` +
            `its enrichment file.`,
        );
        continue;
      }

      const previous = seen.get(operationId);
      if (previous) {
        diagnostics.fail(
          `${spec.id}: operationId "${operationId}" is used by both ${previous} and ` +
            `${reference}. Operation ids must be unique.`,
        );
        continue;
      }
      seen.set(operationId, reference);

      out.push({ spec, operationId, method, path, operation, pathLevelParameters, isWebhook });
    }
  }
}

/** Merges path-level and operation-level parameters, the operation's own winning. */
function effectiveParameters(document: OpenApiDocument, source: OperationSource): Schema[] {
  const own = Array.isArray(source.operation['parameters'])
    ? source.operation['parameters'].filter(isObject)
    : [];

  const byIdentity = new Map<string, Schema>();
  for (const raw of [...source.pathLevelParameters, ...own]) {
    const parameter = resolveSchema(document, raw).schema;
    const name = parameter['name'];
    const location = parameter['in'];
    if (typeof name !== 'string' || typeof location !== 'string') continue;
    byIdentity.set(`${location}:${name}`, parameter);
  }
  return [...byIdentity.values()];
}

/** Picks the media type to document, preferring JSON. */
function pickMediaType(content: unknown): { mediaType: string; media: Schema } | null {
  if (!isObject(content)) return null;
  const available = Object.keys(content);
  if (available.length === 0) return null;

  const chosen =
    MEDIA_TYPE_PREFERENCE.find((type) => available.includes(type)) ??
    available.find((type) => type.endsWith('+json')) ??
    (available[0] as string);

  const media = content[chosen];
  return isObject(media) ? { mediaType: chosen, media } : null;
}

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

/**
 * Turns OpenAPI `parameters` into field rows.
 *
 * `{% params %}` deliberately covers these *and* request-body properties,
 * even though OpenAPI reserves the word "parameter" for this half only.
 * Both are addressed the same way — by the exact `name` the spec gives,
 * case-sensitive — so both go through the very same field-row builder used
 * for request/response bodies (`walkProperties`/`buildField` in
 * `schema-walk.ts`): the parameter list is synthesized here into one object
 * schema's `properties`, which is also what lets an object-shaped parameter
 * (a `deepObject`-style query parameter, say) get its nested fields walked
 * instead of silently flattening to nothing, the way a hand-rolled parallel
 * implementation of the same field-construction logic did before.
 *
 * A parameter can carry its own `description`/`deprecated`, sibling to (not
 * inside) its `schema` — the OpenAPI Parameter Object allows both. Those are
 * applied as a post-walk overlay rather than written into the synthesized
 * property schema: a parameter whose `schema` is a bare `$ref` needs
 * `resolve()` to see that `$ref` untouched at the top of the property value
 * to derive `schemaRef` correctly, and stamping sibling keys onto a
 * `$ref`-bearing object would only be silently discarded once `resolve()`
 * replaces it with the pointed-to schema anyway.
 *
 * One thing a synthesized object schema can't represent: two parameters
 * sharing a `name` in different locations (legal in OpenAPI, e.g. `id` in
 * both `path` and `header`) collide on one property key. This is no worse
 * than before — the two were already ambiguous by `path`/anchor id, since a
 * parameter's `FieldView.path` is just its bare name — it just now keeps one
 * row instead of rendering two indistinguishable ones.
 */
function buildParameters(
  opts: WalkOptions,
  parameters: Schema[],
): (FieldView & { in: string })[] {
  const properties: Schema = {};
  const required: string[] = [];
  const locations = new Map<string, string>();
  const descriptionOverrides = new Map<string, string>();
  const deprecatedOverrides = new Set<string>();

  for (const parameter of parameters) {
    const name = parameter['name'];
    const location = parameter['in'];
    if (typeof name !== 'string' || typeof location !== 'string') continue;

    properties[name] = isObject(parameter['schema']) ? (parameter['schema'] as Schema) : {};
    locations.set(name, location);
    if (parameter['required'] === true || location === 'path') required.push(name);
    if (typeof parameter['description'] === 'string') descriptionOverrides.set(name, parameter['description']);
    if (parameter['deprecated'] === true) deprecatedOverrides.add(name);
  }

  const synthetic: Schema = { type: 'object', properties, required };
  const frame: Frame = { path: '', schemaName: null, relPath: '', open: new Map() };

  return walkProperties(opts, synthetic, frame).map((field) => {
    const result: FieldView & { in: string } = { ...field, in: locations.get(field.name) ?? 'query' };
    const overrideDescription = descriptionOverrides.get(field.name);
    if (overrideDescription !== undefined) {
      result.description = opts.renderMarkdown(overrideDescription);
      result.descriptionSource = 'spec';
    }
    if (deprecatedOverrides.has(field.name)) result.deprecated = true;
    return result;
  });
}

// ---------------------------------------------------------------------------
// Enrichment application
// ---------------------------------------------------------------------------

/** Flattens a field tree (children and variants included) for lookup by path or name. */
function flatten(fields: FieldView[]): FieldView[] {
  const out: FieldView[] = [];
  const visit = (list: FieldView[]) => {
    for (const field of list) {
      out.push(field);
      visit(field.children);
      for (const variant of field.variants ?? []) visit(variant.fields);
    }
  };
  visit(fields);
  return out;
}

/**
 * Attaches one operation-file entry to its field.
 *
 * A dotted path matches exactly; a bare name matches any field with that
 * name. **More than one match is skipped, not guessed** — attaching prose to
 * the wrong field publishes misleading documentation, which is worse than
 * publishing none. The warning lists the candidates so the writer can
 * qualify the heading.
 */
function applyEntry(
  entry: EnrichmentField,
  fields: FieldView[],
  namespace: string,
  filePath: string,
  diagnostics: Diagnostics,
): void {
  const all = flatten(fields);
  let matches = all.filter((f) => f.path === entry.path);
  if (matches.length === 0) {
    matches = all.filter((f) => f.name === entry.path);
  }

  if (matches.length === 0) {
    const valid = all.map((f) => f.path);
    const shown = valid.slice(0, 25).join(', ');
    diagnostics.warn(
      `${filePath}: "${entry.path}" does not match any field in ${namespace} — entry skipped. ` +
        `Valid fields: ${shown}${valid.length > 25 ? `, … (${valid.length} total)` : ''}.`,
    );
    return;
  }

  if (matches.length > 1) {
    diagnostics.warn(
      `${filePath}: "${entry.path}" is ambiguous in ${namespace} — entry skipped. ` +
        `Candidates: ${matches.map((f) => f.path).join(', ')}. Use the full dotted path.`,
    );
    return;
  }

  const field = matches[0] as FieldView;

  if (entry.badge && !field.badges.includes(entry.badge)) {
    field.badges.push(entry.badge);
  }

  if (!entry.body) return;

  if (entry.mode === 'replace') {
    // The rare case where shared text is actively misleading on this
    // endpoint — the operation file overrides outright rather than adding to it.
    field.description = entry.body;
    field.descriptionSource = 'schema-doc';
    field.note = null;
    return;
  }

  // The default. An operation-level entry is a different job from the shared
  // description — not a better definition, an extra fact that is true here —
  // so it appends as a scoped note. Making it replace by default would force
  // the writer to restate the shared text and let it rot silently when that
  // shared text improves.
  field.note = entry.body;
}

/** Reports a `conditional` badge whose condition is never explained anywhere. */
function checkConditionalBadges(
  fields: FieldView[],
  operationId: string,
  diagnostics: Diagnostics,
): void {
  for (const field of flatten(fields)) {
    if (!field.badges.includes(CONDITIONAL_BADGE)) continue;
    if (field.description || field.note || field.requiredWhen) continue;
    diagnostics.warn(
      `${operationId}: field "${field.path}" is badged "conditional" but has no description ` +
        `in any layer. A bare "conditional" does not tell an integrator what the condition is.`,
    );
  }
}

// ---------------------------------------------------------------------------
// The build
// ---------------------------------------------------------------------------

export interface BuildOperationViewsInput {
  projectRoot: string;
  specs: ResolvedSpec[];
  /** Parsed enrichment, keyed by `enrichmentKey()`. */
  apiDocs: Map<string, ParsedEnrichment>;
  languages: string[];
  defaultLanguage: string;
  variables: Record<string, unknown>;
  diagnostics: Diagnostics;
}

/**
 * Builds every operation page for every language.
 *
 * The three resolution rules of §6 all land here:
 *   - a spec `description` is the base;
 *   - `schemas/X.md` **replaces** it, because the scope is identical and the
 *     better writing should win;
 *   - `operations/Y.md` **appends** a scoped note, because it is a different
 *     job — an extra fact that is true on this endpoint only.
 *
 * Each operation is resolved once, in the default language. Every other
 * language gets the same view at its own prefixed route, marked as a
 * fallback — the same rule an untranslated guide follows.
 */
export async function buildOperationViews(
  input: BuildOperationViewsInput,
): Promise<OperationView[]> {
  const { projectRoot, specs, apiDocs, languages, defaultLanguage, variables, diagnostics } = input;

  const base = createDefaultMarkdocConfig();
  const markdocConfig: Config = {
    ...base,
    variables: { ...(base.variables ?? {}), ...variables },
  };
  const renderMarkdown = makeMarkdownRenderer(markdocConfig);

  const views: OperationView[] = [];

  for (const spec of specs) {
    const operations = collectOperations(spec, diagnostics);
    const authoredExamples = await loadAuthoredExamples(projectRoot, spec.id, diagnostics);

    // Descriptions authored in `schemas/*.md`, indexed by component name and
    // schema-relative path.
    const schemaDocs = new Map<string, RenderableTreeNode>();
    for (const parsed of apiDocs.values()) {
      if (parsed.specId !== spec.id || parsed.kind !== 'schema') continue;
      for (const entry of parsed.fields) {
        if (entry.body) schemaDocs.set(`${parsed.target}\u0000${entry.path}`, entry.body);
      }
    }

    const walkOptions: WalkOptions = {
      document: spec.document,
      renderMarkdown,
      lookupSchemaDoc: (schemaName, relPath) =>
        schemaName ? schemaDocs.get(`${schemaName}\u0000${relPath}`) ?? null : null,
    };

    for (const source of operations) {
      const view = buildOne({
        source,
        spec,
        defaultLanguage,
        walkOptions,
        renderMarkdown,
        apiDocs,
        authored: authoredExamples.get(source.operationId) ?? [],
        diagnostics,
      });
      views.push(view);

      for (const language of languages) {
        if (language === defaultLanguage) continue;
        views.push({
          ...view,
          language,
          routePath: `/${language}${view.routePath}`,
          isFallback: true,
        });
      }
    }
  }

  reportDescriptionCoverage(views, diagnostics);
  return views;
}

interface BuildOneInput {
  source: OperationSource;
  spec: ResolvedSpec;
  defaultLanguage: string;
  walkOptions: WalkOptions;
  renderMarkdown: (markdown: string) => RenderableTreeNode | null;
  apiDocs: Map<string, ParsedEnrichment>;
  authored: AuthoredExample[];
  diagnostics: Diagnostics;
}

/** Builds one operation's default-language view. */
function buildOne(input: BuildOneInput): OperationView {
  const {
    source,
    spec,
    defaultLanguage,
    walkOptions,
    renderMarkdown,
    apiDocs,
    authored,
    diagnostics,
  } = input;
  const { document } = walkOptions;
  const { operation, operationId, method, path, isWebhook } = source;

  const routePath = `${spec.routePrefix}/${operationSlug(operationId)}`;

  // --- parameters -----------------------------------------------------------
  const parameters = buildParameters(walkOptions, effectiveParameters(document, source));

  // --- request body ---------------------------------------------------------
  const rawBody = operation['requestBody'];
  const body = isObject(rawBody) ? resolveSchema(document, rawBody).schema : null;
  const requestMedia = body ? pickMediaType(body['content']) : null;
  const requestFields =
    requestMedia && isObject(requestMedia.media['schema'])
      ? walkSchema(walkOptions, requestMedia.media['schema'] as Schema)
      : [];

  // --- responses ------------------------------------------------------------
  const rawResponses = operation['responses'];
  const responses: {
    status: string;
    description: string;
    mediaType: string | null;
    fields: FieldView[];
    media: Schema | null;
  }[] = [];
  if (isObject(rawResponses)) {
    for (const [status, raw] of Object.entries(rawResponses)) {
      if (!isObject(raw)) continue;
      const response = resolveSchema(document, raw).schema;
      const media = pickMediaType(response['content']);
      responses.push({
        status,
        // A response's own description comes from the spec and is not
        // enrichable; its *fields* are.
        description: typeof response['description'] === 'string' ? response['description'] : '',
        mediaType: media?.mediaType ?? null,
        fields:
          media && isObject(media.media['schema'])
            ? walkSchema(walkOptions, media.media['schema'] as Schema)
            : [],
        media: media?.media ?? null,
      });
    }
  }

  // --- enrichment -----------------------------------------------------------
  const enrichment = apiDocs.get(enrichmentKey(spec.id, 'operation', operationId));
  const requestSide = [...parameters, ...requestFields];

  if (enrichment) {
    for (const entry of enrichment.fields) {
      // Bound to a local so the discriminant narrowing survives into the
      // `find` callback below.
      const scope = entry.scope;
      if (scope.in === 'request') {
        applyEntry(entry, requestSide, `${operationId} (parameters and request body)`, enrichment.filePath, diagnostics);
        continue;
      }
      const target = responses.find((r) => r.status === scope.status);
      if (!target) {
        diagnostics.warn(
          `${enrichment.filePath}: {% params in="response" status="${scope.status}" %} — ` +
            `${operationId} declares no ${scope.status} response. Declared: ` +
            `${responses.map((r) => r.status).join(', ') || 'none'}.`,
        );
        continue;
      }
      applyEntry(entry, target.fields, `${operationId} response ${target.status}`, enrichment.filePath, diagnostics);
    }
  }

  checkConditionalBadges(requestSide, operationId, diagnostics);

  // Operation narrative has the same scope as the spec's `description`, so it
  // replaces it — consistent with the schema-level rule. The spec's `summary`
  // (page title and nav-label fallback) is untouched.
  const specDescription = typeof operation['description'] === 'string' ? operation['description'] : null;
  const narrative =
    enrichment?.narrative ?? (specDescription ? renderMarkdown(specDescription) : null);

  // --- examples and samples -------------------------------------------------
  const examples: ExampleView[] = mergeExamples(
    document,
    requestMedia?.media ?? null,
    responses.map((r) => ({ status: r.status, media: r.media })),
    authored,
  );

  // A curl sample's `-d` body is whichever request example is selected, so
  // there is one sample per request example rather than one canonical
  // sample — a request with several payment-method examples needs its curl
  // invocation to change along with the example dropdown, the way Redocly's
  // does. An operation with no request examples at all (a bodyless GET) gets
  // exactly one sample with no body; `forExample: ''` marks that case, since
  // a real example key is never empty.
  const requestExamples = examples.filter((e) => e.kind === 'request');
  const curlSample = (body: unknown, forExample: string) => ({
    language: 'curl',
    label: 'cURL',
    forExample,
    code: buildCurlSample({
      document,
      method,
      path,
      pathParams: parameters.filter((p) => p.in === 'path'),
      queryParams: parameters.filter((p) => p.in === 'query'),
      headerParams: parameters.filter((p) => p.in === 'header'),
      mediaType: requestMedia?.mediaType ?? null,
      body,
    }),
  });
  // A webhook is delivered *to* the integrator, not called — there is
  // nothing to curl. It gets no code samples at all; the payload examples
  // above still render, and the example panel shows them as raw JSON
  // instead of wrapping them in an invocation nobody would run.
  const samples = isWebhook
    ? []
    : requestExamples.length > 0
      ? requestExamples.map((example) => curlSample(example.json, example.key))
      : [curlSample(undefined, '')];

  const strip = ({ in: _location, ...field }: FieldView & { in: string }): FieldView => field;
  const groupedParameters = {
    path: parameters.filter((p) => p.in === 'path').map(strip),
    query: parameters.filter((p) => p.in === 'query').map(strip),
    header: parameters.filter((p) => p.in === 'header').map(strip),
    cookie: parameters.filter((p) => p.in === 'cookie').map(strip),
  };

  const view: OperationView = {
    operationId,
    method: method.toUpperCase(),
    path,
    routePath,
    language: defaultLanguage,
    specId: spec.id,
    summary: typeof operation['summary'] === 'string' ? operation['summary'] : operationId,
    narrative,
    parameters: groupedParameters,
    requestBody: requestMedia
      ? {
          mediaType: requestMedia.mediaType,
          required: body?.['required'] === true,
          fields: requestFields,
        }
      : null,
    responses: responses.map(({ media: _media, ...rest }) => rest),
    examples,
    samples,
  };

  if (operation['deprecated'] === true) view.deprecated = true;
  if (isWebhook) view.isWebhook = true;

  return view;
}

/**
 * Reports how much of the reference still renders raw spec text.
 *
 * Emitted as one aggregate line per spec rather than one warning per field.
 * A 200-field API would otherwise bury every other diagnostic under hundreds
 * of individually-useless lines, and a warning nobody reads is not a warning.
 * The count is the actionable part; `descriptionSource` on each field is
 * what makes the number computable.
 */
function reportDescriptionCoverage(views: OperationView[], diagnostics: Diagnostics): void {
  const bySpec = new Map<string, { total: number; missing: string[] }>();

  for (const view of views) {
    // Fallback views are copies of the default-language one; counting them
    // would multiply the same finding by the number of languages.
    if (view.isFallback) continue;

    const stats = bySpec.get(view.specId) ?? { total: 0, missing: [] };
    const fields = flatten([
      ...view.parameters.path,
      ...view.parameters.query,
      ...view.parameters.header,
      ...view.parameters.cookie,
      ...(view.requestBody?.fields ?? []),
      ...view.responses.flatMap((r) => r.fields),
    ]);
    for (const field of fields) {
      stats.total += 1;
      if (!field.description && !field.note) {
        stats.missing.push(`${view.operationId}.${field.path}`);
      }
    }
    bySpec.set(view.specId, stats);
  }

  for (const [specId, stats] of bySpec) {
    if (stats.missing.length === 0 || stats.total === 0) continue;
    const documented = Math.round(((stats.total - stats.missing.length) / stats.total) * 100);
    diagnostics.warn({
      summary:
        `${specId}: ${documented}% of fields documented ` +
        `(${stats.missing.length.toLocaleString('en-US')} of ${stats.total.toLocaleString('en-US')} missing)`,
      detail: stats.missing.map((field) => `  - ${field}`).join('\n'),
    });
  }
}
