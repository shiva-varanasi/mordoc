/** Optional Open Graph and Twitter Card meta tags for social sharing previews. */
export interface SiteMetadata {
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
}

/**
 * One custom font face declaration. `regular`/`italic` are filenames resolved
 * against config/assets/fonts/ — both optional, since a project may supply
 * only one style.
 */
export interface FontConfig {
  /** CSS font-family name to register via @font-face and assign to the slot's CSS variable. */
  family: string;
  /** Filename within config/assets/fonts/ for the normal style (.woff2, .woff, or .ttf). */
  regular?: string;
  /** Filename within config/assets/fonts/ for the italic style (.woff2, .woff, or .ttf). */
  italic?: string;
}

/**
 * Optional custom fonts declaration, one slot per role. Each slot is
 * independently optional; absent entirely (or a given slot absent), the
 * site falls back to Mordoc's default stack for that role (Inter for
 * `body`, the default system-monospace stack for `code`).
 */
export interface FontsConfig {
  /** Body/UI text — assigned to --font-sans. */
  body?: FontConfig;
  /** Code blocks and inline code — assigned to --font-mono. */
  code?: FontConfig;
}

/**
 * Top-level configuration for a Mordoc documentation site,
 * as defined in the project's config/site.json file.
 */
export interface SiteConfig {
  name: string;
  description: string;
  /** Fully-qualified base URL with no trailing slash (e.g. "https://docs.example.com"). */
  baseUrl: string;
  defaultLanguage: string;
  metadata?: SiteMetadata;
  fonts?: FontsConfig;
}
