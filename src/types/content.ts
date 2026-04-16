import type { Node } from '@markdoc/markdoc';

/** A single content page discovered on disk. */
export interface ContentEntry {
  /** Language code derived from the top-level directory (e.g. "en", "de"). */
  language: string;
  /** URL path segments after the language prefix (e.g. ["prerequisites", "install-code-editor"]). */
  segments: string[];
  /**
   * Resolved route path for navigation.
   * Default language has no prefix: "/overview", "/prerequisites/install-code-editor".
   * Other languages get a prefix: "/de/overview", "/de/prerequisites/install-code-editor".
   */
  routePath: string;
  /** Absolute path to the .md file on disk. */
  filePath: string;
  /** Slug of the file (filename without extension, e.g. "install-code-editor"). */
  slug: string;
  /** Whether this is an index page (index.md). */
  isIndex: boolean;
}

/** The full result of content discovery: every page and which languages have content. */
export interface ContentMap {
  /** All discovered content entries, sorted by routePath for stable ordering. */
  entries: ContentEntry[];
  /** Language codes that have actual content directories on disk. */
  languages: string[];
}

/** Parsed YAML frontmatter from a markdown file. Title is required. */
export interface Frontmatter {
  title: string;
  description?: string;
  [key: string]: unknown;
}

/** A single heading extracted for the table of contents. */
export interface TocEntry {
  /** Anchor ID for linking (slugified heading text). */
  id: string;
  /** Display text of the heading. */
  title: string;
  /** Heading depth: 2 for h2, 3 for h3, etc. */
  level: number;
}

/** A fully parsed content page — discovery metadata combined with parsed data. */
export interface ParsedPage {
  /** The original discovery entry (route, file path, language, etc.). */
  entry: ContentEntry;
  /** Parsed frontmatter from the YAML block at the top of the file. */
  frontmatter: Frontmatter;
  /** Table of contents extracted from headings. */
  toc: TocEntry[];
  /** Markdoc AST node for later rendering/transformation. */
  ast: Node;
}
