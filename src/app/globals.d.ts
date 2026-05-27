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
