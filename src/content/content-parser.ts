import { readFile } from 'node:fs/promises';
import Markdoc from '@markdoc/markdoc';
import yaml from 'js-yaml';
import type { Node } from '@markdoc/markdoc';
import type { ContentMap, Frontmatter, TocEntry, ParsedPage } from '../types/content.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parses the raw frontmatter YAML string extracted by Markdoc.
 * Validates that at least a title is present.
 */
function parseFrontmatter(raw: string | undefined, filePath: string): Frontmatter {
  if (!raw || raw.trim() === '') {
    throw new Error(
      `${filePath}: missing frontmatter.\n` +
      `Every content file must have a YAML frontmatter block with at least a "title" field.`,
    );
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (err) {
    throw new Error(`${filePath}: invalid frontmatter YAML — ${(err as Error).message}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error(`${filePath}: frontmatter must be a YAML object.`);
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj['title'] !== 'string' || obj['title'] === '') {
    throw new Error(`${filePath}: frontmatter "title" is required and must be a non-empty string.`);
  }

  return parsed as Frontmatter;
}

/**
 * Collects the text content of a Markdoc node by walking its children.
 * Heading nodes contain inline text as child nodes rather than a single string.
 */
function collectText(node: Node): string {
  let text = '';
  if (node.type === 'text' && typeof node.attributes['content'] === 'string') {
    text += node.attributes['content'];
  }
  for (const child of node.children) {
    text += collectText(child);
  }
  return text;
}

/**
 * Walks the Markdoc AST and extracts heading nodes into TocEntry items.
 * Only includes h2–h6 to keep the table of contents navigable.
 */
function extractToc(ast: Node): TocEntry[] {
  const entries: TocEntry[] = [];

  for (const node of ast.walk()) {
    if (node.type !== 'heading') continue;

    const level = node.attributes['level'] as number;
    if (level < 2 || level > 6) continue;

    const title = collectText(node).trim();
    if (title === '') continue;

    entries.push({ id: slugify(title), title, level });
  }

  return entries;
}

/**
 * Parses all content files from a ContentMap into fully resolved pages.
 * Reads each file, runs it through Markdoc, extracts frontmatter and TOC.
 *
 * @param contentMap - The content discovery result from loadContent().
 * @returns An array of parsed pages, one per content entry.
 */
export async function parseContent(contentMap: ContentMap): Promise<ParsedPage[]> {
  const pages: ParsedPage[] = [];

  for (const entry of contentMap.entries) {
    let raw: string;
    try {
      raw = await readFile(entry.filePath, 'utf-8');
    } catch (err) {
      throw new Error(
        `Failed to read ${entry.filePath}: ${(err as Error).message}`,
      );
    }

    const ast = Markdoc.parse(raw);
    const frontmatter = parseFrontmatter(ast.attributes['frontmatter'] as string | undefined, entry.filePath);
    const toc = extractToc(ast);

    pages.push({ entry, frontmatter, toc, ast });
  }

  return pages;
}
