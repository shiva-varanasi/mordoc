/** Path utilities for the React app. */

/**
 * Compares two pathnames ignoring a trailing slash.
 *
 * Pagefind indexes built pages as directories (`/foo/index.html` → url
 * `/foo/`), while Mordoc route paths and sidenav config paths never have a
 * trailing slash (`/foo`). Client-side navigation from search results can
 * land on the slash variant, so sidebar/breadcrumb active-path comparisons
 * must be trailing-slash-insensitive or they silently fail to match.
 */
export function samePath(a: string, b: string): boolean {
  const norm = (p: string) => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p);
  return norm(a) === norm(b);
}
