/**
 * Navigation type definitions for Mordoc
 * These interfaces define routing and navigation structures
 */

// Single route in the application
export interface Route {
  path: string; // Full URL path (e.g., "/getting-started" or "/es/comenzar")
  slug: string; // Content slug
  dirPath: string;   // Directory path (e.g., "guides")
  language: string; // Language code
}

// Route map for quick lookups (path -> route)
export type RouteMap = Map<string, Route>;

// Navigation node (built from content + sidenav config)
export interface NavigationNode {
  label: string;
  path?: string;
  order?: number;
  active?: boolean;
  external?: boolean;
  icon?: string;
  children?: NavigationNode[];
}

// Navigation tree (hierarchical structure)
export type NavigationTree = NavigationNode[];

// Breadcrumb item
export interface BreadcrumbItem {
  label: string;
  path?: string; // Omit path for current page
}

// Breadcrumb trail
export type Breadcrumbs = BreadcrumbItem[];

// Page navigation link (prev/next)
export interface PageNavigationLink {
  label: string;
  path: string;
}

// Page navigation (prev/next links)
export interface PageNavigation {
  prev?: PageNavigationLink;
  next?: PageNavigationLink;
}

// Language alternative for a page
export interface LanguageAlternative {
  code: string; // Language code (e.g., "en", "es")
  label: string; // Display name (e.g., "English", "Español")
  path?: string; // URL to same content in this language (undefined if not available)
  available: boolean; // Whether content exists in this language
}

// Language alternatives for the current page
export type LanguageSwitcher = LanguageAlternative[];

// Navigation context (all navigation data for a page)
export interface NavigationContext {
  currentPath: string;
  currentLanguage: string;
  sidenav: NavigationTree;
  topnav?: NavigationTree;
  breadcrumbs: Breadcrumbs;
  pageNavigation: PageNavigation;
  languageSwitcher: LanguageSwitcher;
}