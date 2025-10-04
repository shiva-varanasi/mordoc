/**
 * Language utility functions
 */

/**
 * Extract language code from a file path
 * Examples:
 *   "en/getting-started.md" -> "en"
 *   "es/guias/inicio.md" -> "es"
 *   "getting-started.md" -> null (no language prefix)
 */
export function extractLanguageFromPath(filePath: string): string | null {
  const parts = filePath.split('/');
  
  // Check if the first segment looks like a language code (2-3 letters)
  if (parts.length > 1 && /^[a-z]{2,3}$/i.test(parts[0])) {
    return parts[0].toLowerCase();
  }
  
  return null;
}

/**
 * Remove language prefix from a file path
 * Examples:
 *   "en/getting-started.md" -> "getting-started.md"
 *   "es/guias/inicio.md" -> "guias/inicio.md"
 *   "getting-started.md" -> "getting-started.md" (no change)
 */
export function removeLanguagePrefix(filePath: string): string {
  const language = extractLanguageFromPath(filePath);
  
  if (language) {
    // Remove the language prefix and leading slash
    return filePath.substring(language.length + 1);
  }
  
  return filePath;
}

/**
 * Build a URL path with optional language prefix
 * Examples:
 *   ("getting-started", "en", "en") -> "/getting-started" (default language, no prefix)
 *   ("getting-started", "es", "en") -> "/es/getting-started"
 *   ("", "en", "en") -> "/" (home page, default language)
 *   ("", "es", "en") -> "/es" (home page, non-default language)
 */
export function buildPathWithLanguage(
  slug: string,
  language: string,
  defaultLanguage: string
): string {
  // Normalize slug (remove leading/trailing slashes)
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  
  // If default language, don't add language prefix
  if (language === defaultLanguage) {
    return normalizedSlug ? `/${normalizedSlug}` : '/';
  }
  
  // Non-default language, add language prefix
  return normalizedSlug ? `/${language}/${normalizedSlug}` : `/${language}`;
}

/**
 * Validate language code format
 * Returns true if the code looks like a valid language code (2-3 lowercase letters)
 */
export function isValidLanguageCode(code: string): boolean {
  return /^[a-z]{2,3}$/.test(code);
}

/**
 * Get relative content path (path within the language directory)
 * Examples:
 *   "en/getting-started.md" -> "getting-started.md"
 *   "en/guides/quick-start.md" -> "guides/quick-start.md"
 */
export function getRelativeContentPath(filePath: string): string {
  return removeLanguagePrefix(filePath);
}