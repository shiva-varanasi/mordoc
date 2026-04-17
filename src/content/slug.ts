/**
 * Normalizes a string into a URL-safe slug.
 * Lowercases, strips diacritics, collapses non-alphanumeric runs to hyphens,
 * and trims leading/trailing hyphens.
 *
 * This is the pure form — no collision handling. For heading anchors within
 * a single page, use {@link createSlugger} instead so duplicate headings
 * produce distinct IDs.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * A stateful slugger that remembers IDs it has already issued and appends
 * a numeric suffix to disambiguate duplicates.
 *
 * Each call returns a unique slug within the lifetime of this instance.
 * The first occurrence of a base slug is returned as-is; subsequent
 * occurrences are suffixed: `overview`, `overview-2`, `overview-3`, …
 *
 * Intended usage: one slugger per page. Both the TOC extractor and the
 * Markdoc heading transform for a given page must share the same instance
 * (or apply the same sequence in the same order) so anchor IDs in the
 * rendered HTML match the IDs in the TOC.
 */
export type Slugger = (text: string) => string;

export function createSlugger(): Slugger {
  const used = new Set<string>();
  return (text: string): string => {
    const base = slugify(text);
    let candidate = base;
    let n = 2;
    while (used.has(candidate)) {
      candidate = `${base}-${n}`;
      n += 1;
    }
    used.add(candidate);
    return candidate;
  };
}
