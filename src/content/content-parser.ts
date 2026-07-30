import { readFile } from 'node:fs/promises';
import Markdoc from '@markdoc/markdoc';
import * as yaml from 'js-yaml';
import type { ContentMap, Frontmatter, ParsedPage } from '../types/content.js';

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
 * Parses all content files from a ContentMap into ASTs plus frontmatter.
 * The TOC and the renderable tree are produced in a later stage
 * (see `content-transformer.ts`) so that anchor IDs stay in sync with
 * what the renderer emits.
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

    pages.push({ entry, frontmatter, ast });
  }

  return pages;
}
