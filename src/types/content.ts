import type { Node, RenderableTreeNode } from '@markdoc/markdoc';

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

/**
 * A parsed content page — discovery metadata plus the raw Markdoc AST and
 * frontmatter. TOC is not computed at this stage; it is derived from the
 * transformed renderable tree so that anchor IDs always match what is
 * actually rendered. See {@link TransformedPage}.
 */
export interface ParsedPage {
  /** The original discovery entry (route, file path, language, etc.). */
  entry: ContentEntry;
  /** Parsed frontmatter from the YAML block at the top of the file. */
  frontmatter: Frontmatter;
  /** Markdoc AST node for downstream transformation. */
  ast: Node;
}

/**
 * A transformed content page — the Markdoc AST has been run through the
 * default config (heading IDs, future tag transforms, etc.) and converted
 * into a JSON-serializable renderable tree ready to ship to the client.
 *
 * The TOC is derived from the renderable tree after transform, so its IDs
 * are guaranteed to match the IDs on the rendered heading tags.
 */
export interface TransformedPage {
  /** The original discovery entry (route, file path, language, etc.). */
  entry: ContentEntry;
  /** Parsed frontmatter carried through from the parse stage. */
  frontmatter: Frontmatter;
  /** Table of contents extracted from the transformed renderable tree. */
  toc: TocEntry[];
  /**
   * Serializable renderable tree produced by `Markdoc.transform()`.
   * Always a single root node (transformContent normalizes this).
   */
  renderable: RenderableTreeNode;
}
