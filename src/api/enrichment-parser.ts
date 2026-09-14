import { readFile } from 'node:fs/promises';
import Markdoc from '@markdoc/markdoc';
import type { Config, Node, RenderableTreeNode } from '@markdoc/markdoc';
import { createDefaultMarkdocConfig } from '../content/markdoc-config.js';
import { createSlugger } from '../content/slug.js';
import { BADGES } from '../types/api.js';
import type {
  Badge,
  EnrichmentEntry,
  EnrichmentField,
  ParamsScope,
  ParsedEnrichment,
} from '../types/api.js';
import type { Diagnostics } from './diagnostics.js';

/**
 * Stage C — parses enrichment markdown into a narrative tree plus a flat
 * list of field entries.
 *
 * The `{% params %}` split happens on the **raw AST**, before transform.
 * That is what makes §9's trace true: a `###` inside a params block is
 * consumed as a lookup key and never reaches the heading transform, so it
 * produces no `Heading` tag, no anchor id, and no TOC entry. Each entry's
 * body is then transformed on its own, through the same
 * `createDefaultMarkdocConfig()` guides use — so `{% callout %}`, tables,
 * variables and links behave identically inside a field description.
 *
 * Nothing in this file can fail a build. Every problem is a warning: a
 * malformed block is skipped and the spec baseline still renders, per the
 * enrichment invariant.
 */

/** Markdoc `Node.type` for a heading; entries are level-3 headings. */
const FIELD_HEADING_LEVEL = 3;

/**
 * Concatenates the text of an AST subtree.
 *
 * Operates on the parse-time AST rather than a renderable tree because the
 * heading is being read as an identifier, not rendered. Inline code is
 * included so `### \`card_token\`` addresses the same field as
 * `### card_token` — writers reach for backticks on a field name by reflex,
 * and silently missing the join over a formatting choice would be a nasty
 * class of bug.
 */
function astText(node: Node): string {
  let text = '';
  if (node.type === 'text' || node.type === 'code') {
    const content = node.attributes['content'];
    if (typeof content === 'string') text += content;
  }
  for (const child of node.children) {
    text += astText(child);
  }
  return text;
}

/**
 * Transforms a run of AST nodes into one renderable tree.
 *
 * The nodes are wrapped in a synthetic `document` so the result is a single
 * root node, matching what `TransformedPage.renderable` guarantees and what
 * `Markdoc.renderers.react` expects. Returns null for an empty or
 * whitespace-only run so callers can treat "no prose here" as a plain null
 * rather than an empty tag.
 *
 * Each call gets a fresh slugger: any heading that survives inside a body
 * (an `####` under a field entry, say) gets ids unique within that body.
 */
function transformNodes(nodes: Node[], config: Config): RenderableTreeNode | null {
  if (nodes.length === 0) return null;
  const doc = new Markdoc.Ast.Node('document', {}, nodes);
  const scoped: Config = {
    ...config,
    variables: { ...(config.variables ?? {}), slugger: createSlugger() },
  };
  const rendered = Markdoc.transform(doc, scoped);
  if (Array.isArray(rendered)) {
    // `transform` of a document node yields a single root; guarded so a
    // future Markdoc change surfaces here rather than downstream.
    return rendered.length > 0 ? (rendered[0] as RenderableTreeNode) : null;
  }
  if (Markdoc.Tag.isTag(rendered) && rendered.children.length === 0) return null;
  return rendered;
}

/** Reads the `badge` heading annotation, validating it against the closed vocabulary. */
function readBadge(
  node: Node,
  fieldPath: string,
  filePath: string,
  diagnostics: Diagnostics,
): Badge | null {
  const raw = node.attributes['badge'];
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'string' && (BADGES as readonly string[]).includes(raw)) {
    return raw as Badge;
  }
  // Dropped rather than fatal: an unknown badge leaves the field rendering
  // correctly, just without its marker. Listing the vocabulary makes the
  // typo self-correcting.
  diagnostics.warn(
    `${filePath}: field "${fieldPath}" has unknown badge "${String(raw)}" — badge dropped. ` +
      `Valid badges: ${BADGES.join(', ')}.`,
  );
  return null;
}

/**
 * Splits the children of a `{% params %}` block (or of a schema file's body)
 * into one entry per `###` heading.
 *
 * Content appearing before the first heading is reported and dropped: inside
 * a params block only entries carry meaning, and a writer who put a
 * paragraph there almost certainly expected it to render somewhere.
 */
function splitEntries(
  children: Node[],
  scope: ParamsScope,
  mode: 'append' | 'replace',
  filePath: string,
  config: Config,
  diagnostics: Diagnostics,
): EnrichmentField[] {
  const fields: EnrichmentField[] = [];
  let current: { path: string; badge: Badge | null; body: Node[] } | null = null;
  let strayLeadingContent = false;

  const flush = () => {
    if (!current) return;
    fields.push({
      path: current.path,
      scope,
      mode,
      badge: current.badge,
      body: transformNodes(current.body, config),
    });
    current = null;
  };

  for (const child of children) {
    const isFieldHeading =
      child.type === 'heading' && child.attributes['level'] === FIELD_HEADING_LEVEL;

    if (isFieldHeading) {
      flush();
      const path = astText(child).trim();
      if (path === '') {
        diagnostics.warn(`${filePath}: a "###" entry has an empty name — skipped.`);
        continue;
      }
      current = { path, badge: readBadge(child, path, filePath, diagnostics), body: [] };
      continue;
    }

    if (current) {
      current.body.push(child);
    } else if (child.type !== 'text' || astText(child).trim() !== '') {
      strayLeadingContent = true;
    }
  }
  flush();

  if (strayLeadingContent) {
    diagnostics.warn(
      `${filePath}: content before the first "###" entry inside a {% params %} block is ignored. ` +
        `Move it outside the block to render it as narrative.`,
    );
  }

  return fields;
}

/** Reads and validates the scope attributes on one `{% params %}` tag. */
function readScope(
  node: Node,
  filePath: string,
  diagnostics: Diagnostics,
): ParamsScope | null {
  const where = node.attributes['in'];
  const status = node.attributes['status'];

  if (where === undefined || where === 'request') {
    if (status !== undefined) {
      diagnostics.warn(
        `${filePath}: {% params %} has "status" without in="response" — status ignored.`,
      );
    }
    return { in: 'request' };
  }

  if (where !== 'response') {
    diagnostics.warn(
      `${filePath}: {% params in="${String(where)}" %} is not a valid scope — block skipped. ` +
        `Use a bare {% params %} for parameters and request body, or in="response" with a status.`,
    );
    return null;
  }

  if (status === undefined || String(status) === '') {
    // Responses are never implicit: request and response field names collide
    // constantly, so an unscoped response block would attach prose by
    // coincidence rather than by intent.
    diagnostics.warn(
      `${filePath}: {% params in="response" %} requires a "status" attribute — block skipped.`,
    );
    return null;
  }

  return { in: 'response', status: String(status) };
}

/** Reads the block-level `mode`, defaulting to the append semantics of an operation note. */
function readMode(
  node: Node,
  filePath: string,
  diagnostics: Diagnostics,
): 'append' | 'replace' {
  const mode = node.attributes['mode'];
  if (mode === undefined) return 'append';
  if (mode === 'append' || mode === 'replace') return mode;
  diagnostics.warn(
    `${filePath}: {% params mode="${String(mode)}" %} is not valid — using "append". ` +
      `Valid modes: append, replace.`,
  );
  return 'append';
}

/**
 * Parses one enrichment file.
 *
 * In `operations/*.md` the `{% params %}` wrapper is required, because the
 * file mixes narrative and entries: distinguishing them by heading level
 * alone would mean a writer using `###` in ordinary prose silently creates a
 * bogus field entry. In `schemas/*.md` the wrapper is optional, since every
 * heading there is a field by definition — so a bare `###` at the top level
 * of a schema file is treated as an entry, and a schema file has no
 * narrative.
 */
async function parseFile(
  entry: EnrichmentEntry,
  config: Config,
  diagnostics: Diagnostics,
): Promise<ParsedEnrichment | null> {
  let raw: string;
  try {
    raw = await readFile(entry.filePath, 'utf-8');
  } catch (err) {
    diagnostics.warn(
      `Failed to read enrichment file ${entry.filePath}: ${(err as Error).message} — skipped.`,
    );
    return null;
  }

  const ast = Markdoc.parse(raw);
  const fields: EnrichmentField[] = [];
  const narrativeNodes: Node[] = [];

  for (const child of ast.children) {
    if (child.type === 'tag' && child.tag === 'params') {
      const scope = readScope(child, entry.filePath, diagnostics);
      if (!scope) continue;
      const mode = readMode(child, entry.filePath, diagnostics);
      fields.push(
        ...splitEntries(child.children, scope, mode, entry.filePath, config, diagnostics),
      );
      continue;
    }

    if (entry.kind === 'schema') {
      // Schema files need no wrapper — collect their top-level content and
      // split it below, so `### country` works with or without one.
      narrativeNodes.push(child);
      continue;
    }

    narrativeNodes.push(child);
  }

  let narrative: RenderableTreeNode | null = null;

  if (entry.kind === 'schema') {
    fields.push(
      ...splitEntries(
        narrativeNodes,
        { in: 'request' },
        // Schema-level prose replaces the spec description outright: the
        // scope is identical, so it is two attempts at the same job and the
        // better writing wins.
        'replace',
        entry.filePath,
        config,
        diagnostics,
      ),
    );
  } else {
    narrative = transformNodes(narrativeNodes, config);
  }

  return {
    specId: entry.specId,
    kind: entry.kind,
    target: entry.target,
    filePath: entry.filePath,
    narrative,
    fields,
  };
}

/**
 * Key under which a parsed enrichment file is looked up during the join:
 * `"payments/operation/createPayment"`, scoped by spec id so two APIs can
 * each have their own `schemas/Address.md`.
 */
export function enrichmentKey(
  specId: string,
  kind: 'operation' | 'schema',
  target: string,
): string {
  return `${specId}/${kind}/${target}`;
}

/**
 * Parses every discovered enrichment file, keyed for the stage-D join.
 *
 * @param variables - `config/variables.yaml`, so `{{ $VAR }}` resolves in
 *   enrichment prose exactly as it does in guides.
 */
export async function parseApiDocs(
  entries: EnrichmentEntry[],
  variables: Record<string, unknown>,
  diagnostics: Diagnostics,
): Promise<Map<string, ParsedEnrichment>> {
  const base = createDefaultMarkdocConfig();
  const config: Config = {
    ...base,
    variables: { ...(base.variables ?? {}), ...variables },
  };

  const out = new Map<string, ParsedEnrichment>();
  for (const entry of entries) {
    const parsed = await parseFile(entry, config, diagnostics);
    if (!parsed) continue;
    out.set(enrichmentKey(entry.specId, entry.kind, entry.target), parsed);
  }
  return out;
}
