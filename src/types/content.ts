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
