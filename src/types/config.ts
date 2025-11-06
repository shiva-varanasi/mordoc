/**
 * Configuration type definitions for Mordoc
 * These interfaces define the structure of user configuration files
 */

// ============================================
// USER-FACING CONFIGURATION (style.json)
// ============================================

/**
 * User-facing style configuration from style.json
 * Simplified structure for Level 1 users
 */
export interface UserStyleConfig {
  fontFamily?: string;
  light?: ThemeConfig;
  dark?: ThemeConfig;
}

export interface ThemeConfig {
  brandColor?: string;
  navigation?: NavigationConfig;
  header?: HeaderConfig;
}

export interface NavigationConfig {
  textColor?: string;
  hoverColor?: string;
}

export interface HeaderConfig {
  background?: string;
}

// ============================================
// INTERNAL PROCESSED CONFIGURATION
// ============================================

// Color definition supporting light and dark modes
export interface ColorScheme {
  light: string;
  dark: string;
}

// Typography configuration
export interface FontConfig {
  family: string;
  fallbacks?: string[];
  weight?: number | string;
}

export interface TypographyConfig {
  fontFamily: {
    base: FontConfig;
    heading: FontConfig;
    mono: FontConfig;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

// Layout configuration
export interface LayoutConfig {
  containerWidth: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  header: {
    height: string;
  };
  sidebar: {
    width: string;
    collapsedWidth: string;
  };
}

// Color configuration
export interface ColorsConfig {
  primary: ColorScheme;
  secondary: ColorScheme;
  background: ColorScheme;
  surface: ColorScheme;
  text: {
    primary: ColorScheme;
    secondary: ColorScheme;
    disabled: ColorScheme;
  };
  border: ColorScheme;
  link: ColorScheme;
  success: ColorScheme;
  warning: ColorScheme;
  error: ColorScheme;
  info: ColorScheme;
  navigation: {
    text: ColorScheme;
    hover: ColorScheme;
    active: ColorScheme;
  };
  header: {
    background: ColorScheme;
  };
}

// Processed style configuration (internal use after transformation)
export interface ProcessedStyleConfig {
  colors: ColorsConfig;
  typography: TypographyConfig;
  layout: LayoutConfig;
}

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
  favicon?: string;
}

// Main site configuration (combined from all config files)
export interface SiteConfig {
  metadata: SiteMetadata;
  languages: LanguageConfig[];
  defaultLanguage: string;
  style: ProcessedStyleConfig;
  navigation: {
    sidenav: SideNavConfig;
    topnav?: TopNavConfig;
    additionalSidenavs?: Record<string, SideNavConfig>;
  };
  assets: AssetConfig;
  assetsPath: string;
}

// Utility type for deep partial
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PartialUserStyleConfig = DeepPartial<UserStyleConfig>;