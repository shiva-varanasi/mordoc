/**
 * Slugify utility - Converts strings to URL-friendly slugs
 */

/**
 * Convert a string to a URL-friendly slug
 * Examples:
 *   "Getting Started" -> "getting-started"
 *   "API Reference!" -> "api-reference"
 *   "Hello_World" -> "hello-world"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Convert a file path to a slug by removing extension and slugifying
 * Examples:
 *   "getting-started.md" -> "getting-started"
 *   "API Reference.md" -> "api-reference"
 *   "guides/Quick Start.md" -> "quick-start"
 */
export function filePathToSlug(filePath: string): string {
  // Get the filename without extension
  const fileName = filePath.split('/').pop()?.replace(/\.mdx?$/, '') || '';
  
  // If the filename is 'index', use the parent directory name
  if (fileName === 'index') {
    const parts = filePath.split('/');
    // Get the parent directory, or use 'index' if at root
    return parts.length > 1 ? slugify(parts[parts.length - 2]) : 'index';
  }
  
  return slugify(fileName);
}