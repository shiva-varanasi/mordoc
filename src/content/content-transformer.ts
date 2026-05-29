import Markdoc from '@markdoc/markdoc';
import type { Config, RenderableTreeNode } from '@markdoc/markdoc';
import { createSlugger } from './slug.js';
import { createDefaultMarkdocConfig } from './markdoc-config.js';
import type { ParsedPage, TransformedPage, TocEntry } from '../types/content.js';

/**
 * Concatenates the text content of a renderable subtree for TOC display.
 */
function extractText(children: RenderableTreeNode[]): string {
  let text = '';
  for (const child of children) {
    if (typeof child === 'string') text += child;
    else if (Markdoc.Tag.isTag(child)) text += extractText(child.children);
  }
  return text;
}

function walk(node: RenderableTreeNode, visit: (n: RenderableTreeNode) => void): void {
  visit(node);
  if (Markdoc.Tag.isTag(node)) {
    for (const child of node.children) walk(child, visit);
  }
}

/**
 * Walks the transformed renderable tree and extracts Heading component nodes
 * (level 2–6) into TOC entries. Because this runs after the heading transform,
 * the IDs it reads are exactly the IDs that will appear in the rendered HTML.
 */
function extractToc(root: RenderableTreeNode): TocEntry[] {
  const entries: TocEntry[] = [];
  walk(root, (node) => {
    if (!Markdoc.Tag.isTag(node)) return;

    let level: number | null = null;
    if (node.name === 'Heading') {
      const l = node.attributes['level'];
      if (typeof l === 'number' && l >= 2 && l <= 6) level = l;
    }
    if (level === null) return;

    const id = typeof node.attributes['id'] === 'string' ? node.attributes['id'] : '';
    if (id === '') return;
    const title = extractText(node.children).trim();
    if (title === '') return;
    entries.push({ id, title, level });
  });
  return entries;
}

/**
 * Transforms parsed pages into renderable, JSON-serializable trees.
 *
 * For each page:
 *   1. A fresh slugger is created and attached to a per-page Markdoc config
 *      as `variables.slugger`. The heading node transform pulls it out to
 *      generate unique anchor IDs within that page.
 *   2. `Markdoc.transform()` runs the AST through the default config.
 *   3. The TOC is derived from the resulting renderable tree so its IDs
 *      stay in sync with the rendered headings.
 *
 * The function is synchronous — no I/O happens here; the AST is already
 * in memory from the parse stage.
 */
export function transformContent(pages: ParsedPage[]): TransformedPage[] {
  const base = createDefaultMarkdocConfig();
  const out: TransformedPage[] = [];

  for (const page of pages) {
    const slugger = createSlugger();
    const config: Config = {
      ...base,
      variables: { ...(base.variables ?? {}), slugger },
    };

    const raw = Markdoc.transform(page.ast, config);

    // `Markdoc.transform` is typed as returning a node-or-array, but when
    // given a parsed document AST it always yields a single root node.
    // Fail loudly if that ever changes rather than silently breaking the
    // TOC and renderer downstream.
    if (Array.isArray(raw)) {
      throw new Error(
        `Unexpected array result from Markdoc.transform for ${page.entry.filePath}`,
      );
    }

    const renderable = raw;
    const toc = extractToc(renderable);

    out.push({
      entry: page.entry,
      frontmatter: page.frontmatter,
      toc,
      renderable,
    });
  }

  return out;
}
