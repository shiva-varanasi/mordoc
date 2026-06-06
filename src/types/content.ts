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
  /**
   * True when this is a synthetic entry that serves the default language's
   * content file at a non-default language route — i.e. a translation gap
   * where no `content/<lang>/...` file exists.
   */
  isFallback?: boolean;
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
  /** When set to 'landing', the page renders with the full-width landing layout (no sidenav, no TOC). */
  layout?: 'landing';
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

/**
 * Per-route payload shipped by the lazy `virtual:mordoc/page/<routePath>`
 * modules — the full content a page component needs to render.
 *
 * Only fetched when the user navigates to the route. The eager
 * `virtual:mordoc/pages-index` carries just the route identity
 * ({@link PageMeta}); everything visual or title-bar-facing lives here.
 *
 * `isIndex` is intentionally excluded — index-ness is already encoded in
 * the route path shape (e.g. `/flight-manual` vs `/flight-manual/safety`),
 * and any component that genuinely needs the distinction can derive it
 * from the path or cross-reference the navigation tree.
 */
export interface PageData {
  /** Serializable renderable tree produced by `Markdoc.transform()`. */
  renderable: RenderableTreeNode;
  /** Full parsed frontmatter, including title, description, and any theme-specific keys. */
  frontmatter: Frontmatter;
  /** Table of contents extracted from the renderable tree. */
  toc: TocEntry[];
}

/**
 * Lightweight projection of a `TransformedPage` — just the route identity.
 *
 * Shipped eagerly via `virtual:mordoc/pages-index`. Its only job is to let the
 * shell enumerate which routes exist: the React Router route table on the
 * client, page enumeration for the SSG build, and "does this path exist in
 * other languages?" lookups for a language switcher.
 *
 * Everything else a page carries — title, description, TOC, frontmatter,
 * renderable tree, isIndex — lives in the per-route lazy chunk
 * (`virtual:mordoc/page/<routePath>`) and is only fetched when that route
 * is actually visited. Human-readable labels for cross-page UI (sidenav
 * entries, next/prev, breadcrumb ancestors) come from the navigation
 * config, which already spells out its own labels. Index-ness is encoded
 * in the `routePath` shape itself, so it doesn't need a flag here either.
 *
 * `segments` is excluded because it's derivable from `routePath` and
 * `language`.
 */
export interface PageMeta {
  /** Resolved route path (same as ContentEntry.routePath). */
  routePath: string;
  /** Language code this page belongs to. */
  language: string;
  /** Present only when the page opts into the landing layout via `layout: landing` in frontmatter. */
  layout?: 'landing';
  /** True when this page's content falls back to the default language because no translation exists. */
  isFallback?: boolean;
}
