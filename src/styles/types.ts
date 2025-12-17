/**
 * Type definitions for the styling system
 * Defines interfaces for MORDOC style variables
 */

// Global design tokens available to all components
export interface GlobalVariables {
  // Colors - Customizable
  primaryColorLight: string;
  primaryColorDark: string;
  secondaryColorLight: string;
  secondaryColorDark: string;
  backgroundColorLight: string;
  backgroundColorDark: string;
  surfaceColorLight: string;
  surfaceColorDark: string;
  textPrimaryLight: string;
  textPrimaryDark: string;
  textSecondaryLight: string;
  textSecondaryDark: string;
  textDisabledLight: string;
  textDisabledDark: string;
  borderColorLight: string;
  borderColorDark: string;
  linkColorLight: string;
  linkColorDark: string;
  
  // Status colors - Customizable
  successColorLight: string;
  successColorDark: string;
  warningColorLight: string;
  warningColorDark: string;
  errorColorLight: string;
  errorColorDark: string;
  infoColorLight: string;
  infoColorDark: string;
  
  // Navigation colors - Customizable
  navTextColorLight: string;
  navTextColorDark: string;
  navHoverColorLight: string;
  navHoverColorDark: string;
  navActiveColorLight: string;
  navActiveColorDark: string;
  
  // Typography - Customizable
  fontFamilyBase: string;
  fontFamilyHeading: string;
  fontFamilyMono: string;
  
  // Spacing - Locked (not customizable)
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  spacing2xl: string;
  spacing3xl: string;
  
  // Font sizes - Locked
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeBase: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2xl: string;
  fontSize3xl: string;
  fontSize4xl: string;
  
  // Font weights - Locked
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightSemibold: number;
  fontWeightBold: number;
  
  // Line heights - Locked
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
  
  // Border radius - Locked
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  borderRadiusFull: string;
  
  // Container widths - Locked
  containerWidthSm: string;
  containerWidthMd: string;
  containerWidthLg: string;
  containerWidthXl: string;
  
  // Layout dimensions - Locked
  headerHeight: string;
  sidebarWidth: string;
  sidebarCollapsedWidth: string;
}

// User override configuration
export interface UserStyleOverrides {
  global?: Record<string, string>;
  components: Record<string, Record<string, string>>;
}

