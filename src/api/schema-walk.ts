import Markdoc from '@markdoc/markdoc';
import type { Config, RenderableTreeNode } from '@markdoc/markdoc';
import { createSlugger } from '../content/slug.js';
import type { DescriptionSource, FieldView, OpenApiDocument } from '../types/api.js';

/**
 * Walks a bundled OpenAPI schema into the flat `FieldView[]` the UI renders.
 *
 * Everything structural is read from the spec and nothing is read from
 * enrichment: this file alone is what makes principle 9 true — a project
 * with a registry entry, a spec, and no content whatsoever still gets
 * paths, types, required-ness, enums, formats and derived conditions on
 * every operation page.
 *
 * Internal `#/components/...` pointers are followed here rather than by the
 * spec library, because the component *name* at each hop is exactly what
 * `schemaRef` needs, and because a recursive schema has to be stopped at
 * the cycle rather than expanded forever.
 */

/** A schema object as it appears in a bundled document. */
type Schema = Record<string, unknown>;

/** Lookup for a description authored in `schemas/<Name>.md`. */
export type SchemaDocLookup = (
  schemaName: string | null,
  relPath: string,
) => RenderableTreeNode | null;

interface WalkOptions {
  document: OpenApiDocument;
  /** Renders a spec `description` string into a tree, so prose reads the same everywhere. */
  renderMarkdown: (markdown: string) => RenderableTreeNode | null;
  lookupSchemaDoc: SchemaDocLookup;
}

interface Frame {
  /** Dotted path from the namespace root — the anchor id. */
  path: string;
  /** Component schema currently in scope, or null inside an inline schema. */
  schemaName: string | null;
  /** Dotted path relative to `schemaName`, which is how `schemas/X.md` addresses fields. */
  relPath: string;
  /** Pointers open on this branch, mapped to the field path that opened them. */
  open: Map<string, string>;
}

function isObject(value: unknown): value is Schema {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function joinPath(prefix: string, name: string): string {
  return prefix === '' ? name : `${prefix}.${name}`;
}

/**
 * Renders a spec `description` string through the full Markdoc pipeline.
 *
 * Spec descriptions are CommonMark by the OpenAPI specification, so they get
 * the same treatment as authored prose — a list or a link in a generated
 * description renders as a list or a link, not as literal asterisks.
 */
export function makeMarkdownRenderer(config: Config): (markdown: string) => RenderableTreeNode | null {
  return (markdown: string) => {
    if (typeof markdown !== 'string' || markdown.trim() === '') return null;
    const ast = Markdoc.parse(markdown);
    const scoped: Config = {
      ...config,
      variables: { ...(config.variables ?? {}), slugger: createSlugger() },
    };
    const rendered = Markdoc.transform(ast, scoped);
    if (Array.isArray(rendered)) return rendered.length > 0 ? (rendered[0] as RenderableTreeNode) : null;
    return rendered;
  };
}

// ---------------------------------------------------------------------------
// $ref resolution
// ---------------------------------------------------------------------------

/** Follows a local JSON pointer (`#/components/schemas/Address`) through the document. */
function resolvePointer(document: OpenApiDocument, pointer: string): Schema | null {
  if (!pointer.startsWith('#/')) return null;
  const segments = pointer
    .slice(2)
    .split('/')
    .map((s) => s.replace(/~1/g, '/').replace(/~0/g, '~'));

  let current: unknown = document;
  for (const segment of segments) {
    if (!isObject(current)) return null;
    current = current[segment];
  }
  return isObject(current) ? current : null;
}

/** The component name at the end of a pointer, when it names a schema component. */
function componentName(pointer: string): string | null {
  const match = /^#\/components\/schemas\/(.+)$/.exec(pointer);
  return match ? (match[1] as string).replace(/~1/g, '/').replace(/~0/g, '~') : null;
}

interface Resolved {
  schema: Schema;
  /** Component name, when the schema was reached through a named component `$ref`. */
  name: string | null;
  /** The pointer followed, for cycle detection. Null for inline schemas. */
  pointer: string | null;
}

/**
 * Resolves a possible `$ref` one hop at a time until a concrete schema is
 * reached, remembering the last component name seen. Chained refs
 * (`A → B → C`) resolve to C's body but report C's name, which is the one
 * a reader would click through to.
 */
function resolve(document: OpenApiDocument, schema: Schema): Resolved {
  let current = schema;
  let name: string | null = null;
  let pointer: string | null = null;
  const seen = new Set<string>();

  while (typeof current['$ref'] === 'string') {
    const ref = current['$ref'];
    if (seen.has(ref)) break;
    seen.add(ref);
    const target = resolvePointer(document, ref);
    if (!target) break;
    pointer = ref;
    name = componentName(ref) ?? name;
    current = target;
  }

  return { schema: current, name, pointer };
}

// ---------------------------------------------------------------------------
// allOf merging
// ---------------------------------------------------------------------------

/**
 * Flattens `allOf` into a single schema for display.
 *
 * Composition is a modelling device, not something a reader of the
 * reference should have to reassemble in their head: a field inherited from
 * a shared base belongs in the same list as one declared inline. Properties
 * are merged with the outer schema winning (an override is deliberate), and
 * `required`, `dependentRequired` and `if`/`then` pairs are unioned so a
 * condition declared in a base still derives on the composed view.
 */
function mergeAllOf(document: OpenApiDocument, schema: Schema): Schema {
  const allOf = schema['allOf'];
  if (!Array.isArray(allOf)) return schema;

  const properties: Schema = {};
  const required = new Set<string>();
  const dependentRequired: Schema = {};
  const conditionals: Schema[] = [];
  const merged: Schema = { ...schema };
  delete merged['allOf'];

  const absorb = (part: Schema) => {
    const flattened = mergeAllOf(document, part);
    if (isObject(flattened['properties'])) {
      Object.assign(properties, flattened['properties']);
    }
    if (Array.isArray(flattened['required'])) {
      for (const name of flattened['required']) {
        if (typeof name === 'string') required.add(name);
      }
    }
    if (isObject(flattened['dependentRequired'])) {
      Object.assign(dependentRequired, flattened['dependentRequired']);
    }
    if (isObject(flattened['if'])) conditionals.push(flattened);
    for (const key of ['type', 'description', 'title', 'format'] as const) {
      if (merged[key] === undefined && flattened[key] !== undefined) {
        merged[key] = flattened[key];
      }
    }
  };

  for (const part of allOf) {
    if (!isObject(part)) continue;
    absorb(resolve(document, part).schema);
  }
  // The outer schema's own members are absorbed last so they win on collision.
  absorb({ ...schema, allOf: undefined });

  if (Object.keys(properties).length > 0) merged['properties'] = properties;
  if (required.size > 0) merged['required'] = [...required];
  if (Object.keys(dependentRequired).length > 0) merged['dependentRequired'] = dependentRequired;
  if (conditionals.length > 0) merged['__conditionals'] = conditionals;

  return merged;
}

// ---------------------------------------------------------------------------
// Derived conditions
// ---------------------------------------------------------------------------

/**
 * Renders one `if` clause as a human-readable antecedent:
 * `{ properties: { payment_method: { const: card } } }` → "payment_method is card".
 */
function describeCondition(ifSchema: Schema): string | null {
  const properties = ifSchema['properties'];
  if (!isObject(properties)) return null;

  const clauses: string[] = [];
  for (const [name, raw] of Object.entries(properties)) {
    if (!isObject(raw)) continue;
    if (raw['const'] !== undefined) {
      clauses.push(`${name} is ${String(raw['const'])}`);
    } else if (Array.isArray(raw['enum'])) {
      const values = raw['enum'].map((v) => String(v));
      clauses.push(
        values.length === 1
          ? `${name} is ${values[0]}`
          : `${name} is one of ${values.join(', ')}`,
      );
    }
  }
  return clauses.length > 0 ? clauses.join(' and ') : null;
}

/**
 * Collects "this field becomes required when …" for every field of an object
 * schema, from the two places JSON Schema 2020-12 can express it.
 *
 * This is the machine-checkable half of §4's conditional-parameter split:
 * where the rule genuinely is structural, it is derived here and rendered as
 * the actual condition, with zero authoring. The other half — a use-case
 * rule with no structural antecedent — has no schema to key on and is
 * badged in enrichment instead.
 */
function deriveConditions(schema: Schema): Map<string, string> {
  const out = new Map<string, string>();

  const applyIfThen = (host: Schema) => {
    const ifSchema = host['if'];
    const thenSchema = host['then'];
    if (!isObject(ifSchema) || !isObject(thenSchema)) return;
    const condition = describeCondition(ifSchema);
    if (!condition) return;
    const required = thenSchema['required'];
    if (!Array.isArray(required)) return;
    for (const name of required) {
      if (typeof name === 'string' && !out.has(name)) out.set(name, condition);
    }
  };

  applyIfThen(schema);
  const nested = schema['__conditionals'];
  if (Array.isArray(nested)) {
    for (const host of nested) {
      if (isObject(host)) applyIfThen(host);
    }
  }

  const dependent = schema['dependentRequired'];
  if (isObject(dependent)) {
    for (const [trigger, names] of Object.entries(dependent)) {
      if (!Array.isArray(names)) continue;
      for (const name of names) {
        if (typeof name === 'string' && !out.has(name)) {
          out.set(name, `${trigger} is present`);
        }
      }
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Type naming
// ---------------------------------------------------------------------------

/** Renders a schema's type for display: "string", "object", "array<Money>". */
function typeName(document: OpenApiDocument, schema: Schema, refName: string | null): string {
  const rawType = schema['type'];
  const type = Array.isArray(rawType)
    ? rawType.filter((t) => t !== 'null').map(String)[0] ?? 'null'
    : typeof rawType === 'string'
      ? rawType
      : null;

  if (type === 'array') {
    const items = schema['items'];
    if (isObject(items)) {
      const resolvedItems = resolve(document, items);
      const inner =
        resolvedItems.name ??
        typeName(document, mergeAllOf(document, resolvedItems.schema), null);
      return `array<${inner}>`;
    }
    return 'array';
  }

  if (type) return type;
  if (refName) return 'object';
  if (isObject(schema['properties'])) return 'object';
  if (Array.isArray(schema['oneOf']) || Array.isArray(schema['anyOf'])) return 'oneOf';
  return 'any';
}

/** The component name to link to, unwrapping one level of array. */
function linkTarget(document: OpenApiDocument, schema: Schema, refName: string | null): string | undefined {
  if (refName) return refName;
  const items = schema['items'];
  if (isObject(items)) {
    const resolvedItems = resolve(document, items);
    if (resolvedItems.name) return resolvedItems.name;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// The walk
// ---------------------------------------------------------------------------

/** Reads a spec `description`, honouring an override authored in a schema file. */
function resolveDescription(
  opts: WalkOptions,
  schema: Schema,
  schemaName: string | null,
  relPath: string,
): { description: RenderableTreeNode | null; source: DescriptionSource } {
  const authored = opts.lookupSchemaDoc(schemaName, relPath);
  if (authored) return { description: authored, source: 'schema-doc' };

  const raw = schema['description'];
  return {
    description: typeof raw === 'string' ? opts.renderMarkdown(raw) : null,
    source: 'spec',
  };
}

/**
 * Builds one field row, descending into its children.
 *
 * A field has two identities and both matter here.
 *
 * As a **property of its parent schema** it is addressed by the parent's
 * component name plus its own name — that is the key `schemas/X.md` uses to
 * describe it, so `PaymentCreate.md`'s `### billing_address` reaches the
 * `billing_address` row.
 *
 * As a **namespace for its own children** it switches to whatever component
 * it points at, with the schema-relative path reset — so `Address.md`'s
 * `### country` reaches `billing_address.country`, and reaches it equally
 * at `shipping_address.country`, which is the whole point of writing it once.
 *
 * `path` is the third coordinate, independent of both: the field's address
 * within the operation, which is what an operation file and the anchor id use.
 */
function buildField(
  opts: WalkOptions,
  name: string,
  rawSchema: Schema,
  parent: Frame,
  required: boolean,
  requiredWhen: string | undefined,
): FieldView {
  const resolved = resolve(opts.document, rawSchema);
  const path = joinPath(parent.path, name);
  const merged = mergeAllOf(opts.document, resolved.schema);

  // An array contributes its *item* schema's fields as children, so for every
  // question about children — which component is in scope, and whether this
  // branch has looped — the item schema is what counts, not the array wrapper.
  // Missing this is how a self-referential `children: array<Node>` escapes the
  // cycle guard: the array itself carries no `$ref` for the guard to see.
  const isArray = merged['type'] === 'array' && isObject(merged['items']);
  const content = isArray
    ? resolve(opts.document, merged['items'] as Schema)
    : { schema: merged, name: resolved.name, pointer: resolved.pointer };
  const contentSchema = isArray ? mergeAllOf(opts.document, content.schema) : merged;

  const { description, source } = resolveDescription(
    opts,
    merged,
    parent.schemaName,
    joinPath(parent.relPath, name),
  );

  const field: FieldView = {
    name,
    path,
    type: typeName(opts.document, merged, resolved.name),
    required,
    badges: [],
    description,
    descriptionSource: source,
    note: null,
    children: [],
  };

  const ref = linkTarget(opts.document, merged, resolved.name);
  if (ref) field.schemaRef = ref;
  if (requiredWhen) field.requiredWhen = requiredWhen;
  if (Array.isArray(merged['enum'])) field.enum = merged['enum'].map((v) => String(v));
  if (typeof merged['format'] === 'string') field.format = merged['format'];
  if (merged['default'] !== undefined) field.default = merged['default'];
  if (merged['deprecated'] === true) field.deprecated = true;

  // A pointer already open on this branch means the schema refers back to
  // itself. Render a link to the ancestor instead of expanding, which is the
  // only way a self-referential schema terminates.
  if (content.pointer !== null) {
    const ancestor = parent.open.get(content.pointer);
    if (ancestor !== undefined) {
      field.recursiveRef = ancestor;
      return field;
    }
  }

  const open = new Map(parent.open);
  if (content.pointer !== null) open.set(content.pointer, path);

  // Child paths carry no `[]` marker for array items: a writer addressing one
  // types `line_items.sku`, and inventing bracket syntax nobody asked for
  // would only be a second thing to get wrong.
  const childFrame: Frame = {
    path,
    schemaName: content.name ?? parent.schemaName,
    relPath: content.name ? '' : joinPath(parent.relPath, name),
    open,
  };

  field.children = walkProperties(opts, contentSchema, childFrame);

  const variants = buildVariants(opts, contentSchema, childFrame);
  if (variants) field.variants = variants;

  return field;
}

/** Expands `oneOf` / `anyOf` alternatives into labelled variant field lists. */
function buildVariants(
  opts: WalkOptions,
  schema: Schema,
  frame: Frame,
): { label: string; fields: FieldView[] }[] | undefined {
  const raw = schema['oneOf'] ?? schema['anyOf'];
  if (!Array.isArray(raw) || raw.length === 0) return undefined;

  const variants: { label: string; fields: FieldView[] }[] = [];
  for (const [index, member] of raw.entries()) {
    if (!isObject(member)) continue;
    const resolved = resolve(opts.document, member);
    const merged = mergeAllOf(opts.document, resolved.schema);
    const label =
      resolved.name ??
      (typeof merged['title'] === 'string' ? merged['title'] : `Option ${index + 1}`);
    const variantFrame: Frame = {
      ...frame,
      schemaName: resolved.name ?? frame.schemaName,
      relPath: resolved.name ? '' : frame.relPath,
    };
    variants.push({ label, fields: walkProperties(opts, merged, variantFrame) });
  }
  return variants.length > 0 ? variants : undefined;
}

/** Walks an object schema's `properties` into field rows, in declaration order. */
export function walkProperties(opts: WalkOptions, schema: Schema, frame: Frame): FieldView[] {
  const properties = schema['properties'];
  if (!isObject(properties)) return [];

  const required = new Set(
    Array.isArray(schema['required'])
      ? schema['required'].filter((n): n is string => typeof n === 'string')
      : [],
  );
  const conditions = deriveConditions(schema);

  const fields: FieldView[] = [];
  for (const [name, raw] of Object.entries(properties)) {
    if (!isObject(raw)) continue;
    fields.push(
      buildField(opts, name, raw, frame, required.has(name), conditions.get(name)),
    );
  }
  return fields;
}

/**
 * Entry point: walks a schema (typically a request or response body) into a
 * field tree rooted at the given namespace.
 */
export function walkSchema(opts: WalkOptions, rawSchema: Schema): FieldView[] {
  const resolved = resolve(opts.document, rawSchema);
  const merged = mergeAllOf(opts.document, resolved.schema);
  const frame: Frame = {
    path: '',
    schemaName: resolved.name,
    relPath: '',
    open: resolved.pointer ? new Map([[resolved.pointer, '']]) : new Map(),
  };

  const fields = walkProperties(opts, merged, frame);
  if (fields.length > 0) return fields;

  // A body that is a bare `oneOf` has no properties of its own; surface the
  // alternatives as a single synthetic row so the payload is still documented.
  const variants = buildVariants(opts, merged, frame);
  if (!variants) return [];
  return [
    {
      name: 'body',
      path: 'body',
      type: typeName(opts.document, merged, resolved.name),
      required: true,
      badges: [],
      description: null,
      descriptionSource: 'spec',
      note: null,
      children: [],
      variants,
    },
  ];
}

export { resolve as resolveSchema, mergeAllOf, isObject, typeName };
export type { Schema, WalkOptions, Frame };
