// Ambient declarations for browser-side globals. This file must remain a
// script (no top-level import/export) so that wildcard declare module
// statements are picked up by the TS language server.

// Dynamic import types are allowed in ambient script files since TS 2.9,
// so no export {} needed to use import('...') syntax below.

interface Window {
  __staticRouterHydrationData?: import('react-router').HydrationState;
}

/** Shape of a single result returned by pagefind.search(). */
interface PagefindSearchResult {
  id: string;
  data: () => Promise<PagefindSearchResultData>;
}

interface PagefindSearchResultData {
  url: string;
  excerpt: string;
  meta: { title?: string; [key: string]: string | undefined };
  /** Heading-scoped slices of this page's matches — see PagefindSubResult. */
  sub_results?: PagefindSubResult[];
}

interface PagefindWeightedLocation {
  weight: number;
  balanced_score: number;
  location: number;
}

/**
 * One heading-scoped slice of a page's matches. Pagefind splits a page's
 * matched words by its h1-h6 elements — only elements Pagefind treats as
 * headings become split points, so plain elements (even with their own
 * `id`) never produce their own sub-result.
 *
 * `anchor` is present only for a slice that actually starts at a heading;
 * the slice covering everything before the first heading (or a page with no
 * headings at all) omits it and its `url` has no `#fragment` — that slice
 * is really just "the top of the page" wearing the sub-result shape.
 */
interface PagefindSubResult {
  title: string;
  url: string;
  excerpt: string;
  anchor?: {
    element: string;
    id: string;
    text: string;
    location: number;
  };
  weighted_locations?: PagefindWeightedLocation[];
}

/** Shape of the dynamically-imported Pagefind browser bundle (/pagefind[-lang]/pagefind.js). */
interface PagefindAPI {
  init?: () => Promise<void>;
  search: (query: string) => Promise<{ results: PagefindSearchResult[] }>;
  /** Releases index memory. Call before switching to a different language index. */
  destroy?: () => Promise<void>;
}

declare module '*.css' {                                                                                                                                                                 
  const styles: Record<string, string>;                                                                                                                                                  
  export default styles;                                                                                                                                                                 
}    

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}
