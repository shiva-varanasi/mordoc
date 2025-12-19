/**
 * Global design tokens (MORDOC variables)
 * Provides default values and merge logic for global styling variables
 */

import { GlobalVariables } from '../types';

/**
 * Get default global variables
 */
export function getGlobalDefaults(): GlobalVariables {
  return {
    // Colors - Light mode
    primaryColorLight: '#171717',
    primaryColorDark: '#fafafa',
    secondaryColorLight: '#525252',
    secondaryColorDark: '#b3b3b3',
    backgroundColorLight: '#ffffff',
    backgroundColorDark: '#0a0a0a',
    surfaceColorLight: '#f8f8f8',
    surfaceColorDark: '#1a1a1a',
    textPrimaryLight: '#1c1c1c',
    textPrimaryDark: '#e5e5e5',
    textSecondaryLight: '#525252',
    textSecondaryDark: '#c9c9c9',
    textDisabledLight: '#cccccc',
    textDisabledDark: '#404040',
    borderColorLight: '#e5e5e5',
    borderColorDark: '#262626',
    linkColorLight: '#171717',
    linkColorDark: '#fafafa',
    
    // Status colors
    successColorLight: '#2d3436',
    successColorDark: '#dfe6e9',
    warningColorLight: '#636e72',
    warningColorDark: '#b2bec3',
    errorColorLight: '#1a1a1a',
    errorColorDark: '#ffffff',
    infoColorLight: '#2d3436',
    infoColorDark: '#dfe6e9',
    
    // Navigation colors
    navTextColorLight: '#666666',
    navTextColorDark: '#b3b3b3',
    navHoverColorLight: '#171717',
    navHoverColorDark: '#fafafa',
    navActiveColorLight: '#171717',
    navActiveColorDark: '#fafafa',
    
    // Typography
    fontFamilyBase: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyHeading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyMono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    
    // Spacing (locked)
    spacingXs: '0.25rem',
    spacingSm: '0.5rem',
    spacingMd: '1rem',
    spacingLg: '1.5rem',
    spacingXl: '2rem',
    spacing2xl: '3rem',
    spacing3xl: '4rem',
    
    // Font sizes (locked)
    fontSizeXs: '0.75rem',
    fontSizeSm: '0.875rem',
    fontSizeBase: '1rem',
    fontSizeLg: '1.25rem',
    fontSizeXl: '1.5rem',
    fontSize2xl: '2rem',
    fontSize3xl: '2.25rem',
    fontSize4xl: '2.75rem',
    
    // Font weights (locked)
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,
    
    // Line heights (locked)
    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
    
    // Border radius (locked)
    borderRadiusSm: '0.125rem',
    borderRadiusMd: '0.25rem',
    borderRadiusLg: '0.5rem',
    borderRadiusFull: '9999px',
    
    // Container widths (locked)
    containerWidthSm: '640px',
    containerWidthMd: '768px',
    containerWidthLg: '1024px',
    containerWidthXl: '1280px',
    
    // Layout dimensions (locked)
    headerHeight: '4rem',
    sidebarWidth: '16rem',
    sidebarCollapsedWidth: '4rem',
  };
}

/**
 * Merge user overrides with global defaults
 * Only allows customization of colors and typography
 */
export function mergeGlobalOverrides(
  userOverrides?: Record<string, string>
): GlobalVariables {
  const defaults = getGlobalDefaults();
  
  if (!userOverrides) {
    return defaults;
  }
  
  // Whitelist of customizable global variables
  const customizableKeys: (keyof GlobalVariables)[] = [
    'primaryColorLight', 'primaryColorDark',
    'secondaryColorLight', 'secondaryColorDark',
    'backgroundColorLight', 'backgroundColorDark',
    'surfaceColorLight', 'surfaceColorDark',
    'textPrimaryLight', 'textPrimaryDark',
    'textSecondaryLight', 'textSecondaryDark',
    'textDisabledLight', 'textDisabledDark',
    'borderColorLight', 'borderColorDark',
    'linkColorLight', 'linkColorDark',
    'successColorLight', 'successColorDark',
    'warningColorLight', 'warningColorDark',
    'errorColorLight', 'errorColorDark',
    'infoColorLight', 'infoColorDark',
    'navTextColorLight', 'navTextColorDark',
    'navHoverColorLight', 'navHoverColorDark',
    'navActiveColorLight', 'navActiveColorDark',
    'fontFamilyBase', 'fontFamilyHeading', 'fontFamilyMono',
  ];
  
  const merged: GlobalVariables = { ...defaults };
  
  customizableKeys.forEach(key => {
    if (userOverrides[key] !== undefined) {
      (merged as any)[key] = userOverrides[key];
    }
  });
  
  return merged;
}

