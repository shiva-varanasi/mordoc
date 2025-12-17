/**
 * ThemeGenerator - Generates CSS variables from GlobalVariables
 * Converts global design tokens into CSS custom properties
 */

import { GlobalVariables } from '../styles/types';

export class ThemeGenerator {
  constructor(private globalVars: GlobalVariables) {}

  /**
   * Generate CSS custom properties (variables) for colors, typography, and layout
   */
  generateCSSVariables(): string {
    const vars = this.globalVars;
    const cssVars: string[] = [];

    // Light mode variables
    cssVars.push(':root, [data-theme="light"] {');
    cssVars.push('  /* Colors - Light Mode */');
    cssVars.push(`  --color-primary: ${vars.primaryColorLight};`);
    cssVars.push(`  --color-secondary: ${vars.secondaryColorLight};`);
    cssVars.push(`  --color-background: ${vars.backgroundColorLight};`);
    cssVars.push(`  --color-surface: ${vars.surfaceColorLight};`);
    cssVars.push(`  --color-text-primary: ${vars.textPrimaryLight};`);
    cssVars.push(`  --color-text-secondary: ${vars.textSecondaryLight};`);
    cssVars.push(`  --color-text-disabled: ${vars.textDisabledLight};`);
    cssVars.push(`  --color-border: ${vars.borderColorLight};`);
    cssVars.push(`  --color-link: ${vars.linkColorLight};`);
    cssVars.push(`  --color-success: ${vars.successColorLight};`);
    cssVars.push(`  --color-warning: ${vars.warningColorLight};`);
    cssVars.push(`  --color-error: ${vars.errorColorLight};`);
    cssVars.push(`  --color-info: ${vars.infoColorLight};`);

    cssVars.push('');
    cssVars.push('  /* Navigation - Light Mode */');
    cssVars.push(`  --nav-text-color: ${vars.navTextColorLight};`);
    cssVars.push(`  --nav-hover-color: ${vars.navHoverColorLight};`);
    cssVars.push(`  --nav-active-color: ${vars.navActiveColorLight};`);

    cssVars.push('');
    cssVars.push('  /* Typography */');
    cssVars.push(`  --font-family-base: ${vars.fontFamilyBase};`);
    cssVars.push(`  --font-family-heading: ${vars.fontFamilyHeading};`);
    cssVars.push(`  --font-family-mono: ${vars.fontFamilyMono};`);
    
    cssVars.push(`  --font-size-xs: ${vars.fontSizeXs};`);
    cssVars.push(`  --font-size-sm: ${vars.fontSizeSm};`);
    cssVars.push(`  --font-size-base: ${vars.fontSizeBase};`);
    cssVars.push(`  --font-size-lg: ${vars.fontSizeLg};`);
    cssVars.push(`  --font-size-xl: ${vars.fontSizeXl};`);
    cssVars.push(`  --font-size-2xl: ${vars.fontSize2xl};`);
    cssVars.push(`  --font-size-3xl: ${vars.fontSize3xl};`);
    cssVars.push(`  --font-size-4xl: ${vars.fontSize4xl};`);

    cssVars.push(`  --line-height-tight: ${vars.lineHeightTight};`);
    cssVars.push(`  --line-height-normal: ${vars.lineHeightNormal};`);
    cssVars.push(`  --line-height-relaxed: ${vars.lineHeightRelaxed};`);

    cssVars.push(`  --font-weight-normal: ${vars.fontWeightNormal};`);
    cssVars.push(`  --font-weight-medium: ${vars.fontWeightMedium};`);
    cssVars.push(`  --font-weight-semibold: ${vars.fontWeightSemibold};`);
    cssVars.push(`  --font-weight-bold: ${vars.fontWeightBold};`);

    cssVars.push('');
    cssVars.push('  /* Layout */');
    cssVars.push(`  --container-width-sm: ${vars.containerWidthSm};`);
    cssVars.push(`  --container-width-md: ${vars.containerWidthMd};`);
    cssVars.push(`  --container-width-lg: ${vars.containerWidthLg};`);
    cssVars.push(`  --container-width-xl: ${vars.containerWidthXl};`);

    cssVars.push(`  --spacing-xs: ${vars.spacingXs};`);
    cssVars.push(`  --spacing-sm: ${vars.spacingSm};`);
    cssVars.push(`  --spacing-md: ${vars.spacingMd};`);
    cssVars.push(`  --spacing-lg: ${vars.spacingLg};`);
    cssVars.push(`  --spacing-xl: ${vars.spacingXl};`);
    cssVars.push(`  --spacing-2xl: ${vars.spacing2xl};`);
    cssVars.push(`  --spacing-3xl: ${vars.spacing3xl};`);

    cssVars.push(`  --border-radius-sm: ${vars.borderRadiusSm};`);
    cssVars.push(`  --border-radius-md: ${vars.borderRadiusMd};`);
    cssVars.push(`  --border-radius-lg: ${vars.borderRadiusLg};`);
    cssVars.push(`  --border-radius-full: ${vars.borderRadiusFull};`);

    cssVars.push(`  --header-height: ${vars.headerHeight};`);
    cssVars.push(`  --sidebar-width: ${vars.sidebarWidth};`);
    cssVars.push(`  --sidebar-collapsed-width: ${vars.sidebarCollapsedWidth};`);

    cssVars.push('}');

    // Dark mode variables
    cssVars.push('');
    cssVars.push('[data-theme="dark"] {');
    cssVars.push('  /* Colors - Dark Mode */');
    cssVars.push(`  --color-primary: ${vars.primaryColorDark};`);
    cssVars.push(`  --color-secondary: ${vars.secondaryColorDark};`);
    cssVars.push(`  --color-background: ${vars.backgroundColorDark};`);
    cssVars.push(`  --color-surface: ${vars.surfaceColorDark};`);
    cssVars.push(`  --color-text-primary: ${vars.textPrimaryDark};`);
    cssVars.push(`  --color-text-secondary: ${vars.textSecondaryDark};`);
    cssVars.push(`  --color-text-disabled: ${vars.textDisabledDark};`);
    cssVars.push(`  --color-border: ${vars.borderColorDark};`);
    cssVars.push(`  --color-link: ${vars.linkColorDark};`);
    cssVars.push(`  --color-success: ${vars.successColorDark};`);
    cssVars.push(`  --color-warning: ${vars.warningColorDark};`);
    cssVars.push(`  --color-error: ${vars.errorColorDark};`);
    cssVars.push(`  --color-info: ${vars.infoColorDark};`);

    cssVars.push('');
    cssVars.push('  /* Navigation - Dark Mode */');
    cssVars.push(`  --nav-text-color: ${vars.navTextColorDark};`);
    cssVars.push(`  --nav-hover-color: ${vars.navHoverColorDark};`);
    cssVars.push(`  --nav-active-color: ${vars.navActiveColorDark};`);
    cssVars.push('}');

    // System preference dark mode
    cssVars.push('');
    cssVars.push('@media (prefers-color-scheme: dark) {');
    cssVars.push('  :root:not([data-theme="light"]) {');
    cssVars.push(`    --color-primary: ${vars.primaryColorDark};`);
    cssVars.push(`    --color-secondary: ${vars.secondaryColorDark};`);
    cssVars.push(`    --color-background: ${vars.backgroundColorDark};`);
    cssVars.push(`    --color-surface: ${vars.surfaceColorDark};`);
    cssVars.push(`    --color-text-primary: ${vars.textPrimaryDark};`);
    cssVars.push(`    --color-text-secondary: ${vars.textSecondaryDark};`);
    cssVars.push(`    --color-text-disabled: ${vars.textDisabledDark};`);
    cssVars.push(`    --color-border: ${vars.borderColorDark};`);
    cssVars.push(`    --color-link: ${vars.linkColorDark};`);
    cssVars.push(`    --color-success: ${vars.successColorDark};`);
    cssVars.push(`    --color-warning: ${vars.warningColorDark};`);
    cssVars.push(`    --color-error: ${vars.errorColorDark};`);
    cssVars.push(`    --color-info: ${vars.infoColorDark};`);
    cssVars.push(`    --nav-text-color: ${vars.navTextColorDark};`);
    cssVars.push(`    --nav-hover-color: ${vars.navHoverColorDark};`);
    cssVars.push(`    --nav-active-color: ${vars.navActiveColorDark};`);
    cssVars.push('  }');
    cssVars.push('}');

    return cssVars.join('\n');
  }
}
