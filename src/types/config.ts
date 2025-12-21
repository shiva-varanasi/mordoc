/**
 * Configuration type definitions for Mordoc
 * These interfaces define the structure of user configuration files
 */

// Navigation item structure (used in both sidenav and topnav)
export interface NavigationItem {
  label: string;
  path?: string;
  icon?: string;
  external?: boolean;
  children?: NavigationItem[];
  sidenavRef?: string; // Reference to which sidenav file to show (for topnav items)
}

// Navigation configurations
export type SideNavConfig = NavigationItem[];
export type TopNavConfig = NavigationItem[];

// Language configuration
export interface LanguageConfig {
  code: string; // e.g., "en", "es"
  label: string; // e.g., "English", "Español"
  default?: boolean;
}

// Site metadata
export interface SiteMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  baseUrl?: string;
}

// Asset paths
export interface AssetConfig {
  logo?: string;
  logoDark?: string;
  favicon?: string;
}

// Main site configuration (combined from all config files)
export interface SiteConfig {
  metadata: SiteMetadata;
  languages: LanguageConfig[];
  defaultLanguage: string;
  navigation: {
    sidenav: SideNavConfig;
    topnav?: TopNavConfig;
    additionalSidenavs?: Record<string, SideNavConfig>;
  };
  assets: AssetConfig;
  assetsPath: string;
}
