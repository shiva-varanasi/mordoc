/** Optional Open Graph and Twitter Card meta tags for social sharing previews. */
export interface SiteMetadata {
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
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
}
