/**
 * ThemeGenerator - Generates CSS variables from StyleConfig
 * Converts theme configuration into CSS custom properties
 */

import { ProcessedStyleConfig, FontConfig } from '../types/config';

export class ThemeGenerator {
  constructor(private styleConfig: ProcessedStyleConfig) {}

  /**
   * Generate CSS custom properties (variables) for colors, typography, and layout
   */
  generateCSSVariables(): string {
    const { colors, typography, layout } = this.styleConfig;

    const variables: string[] = [];

    // Color variables (light mode)
    variables.push(':root, [data-theme="light"] {');
    variables.push(`  /* Colors - Light Mode */`);
    variables.push(`  --color-primary: ${colors.primary.light};`);
    variables.push(`  --color-secondary: ${colors.secondary.light};`);
    variables.push(`  --color-background: ${colors.background.light};`);
    variables.push(`  --color-surface: ${colors.surface.light};`);
    variables.push(`  --color-text-primary: ${colors.text.primary.light};`);
    variables.push(`  --color-text-secondary: ${colors.text.secondary.light};`);
    variables.push(`  --color-text-disabled: ${colors.text.disabled.light};`);
    variables.push(`  --color-border: ${colors.border.light};`);
    variables.push(`  --color-link: ${colors.link.light};`);
    variables.push(`  --color-success: ${colors.success.light};`);
    variables.push(`  --color-warning: ${colors.warning.light};`);
    variables.push(`  --color-error: ${colors.error.light};`);
    variables.push(`  --color-info: ${colors.info.light};`);

    // Navigation colors (light mode)
    variables.push('');
    variables.push(`  /* Navigation - Light Mode */`);
    variables.push(`  --nav-text-color: ${colors.navigation.text.light};`);
    variables.push(`  --nav-hover-color: ${colors.navigation.hover.light};`);
    variables.push(`  --nav-active-color: ${colors.navigation.active.light};`);

    // Header colors (light mode)
    variables.push('');
    variables.push(`  /* Header - Light Mode */`);
    variables.push(`  --header-background: ${colors.header.background.light};`);

    // Typography variables
    variables.push('');
    variables.push(`  /* Typography */`);
    variables.push(`  --font-family-base: ${this.formatFontFamily(typography.fontFamily.base)};`);
    variables.push(`  --font-family-heading: ${this.formatFontFamily(typography.fontFamily.heading)};`);
    variables.push(`  --font-family-mono: ${this.formatFontFamily(typography.fontFamily.mono)};`);
    
    variables.push(`  --font-size-xs: ${typography.fontSize.xs};`);
    variables.push(`  --font-size-sm: ${typography.fontSize.sm};`);
    variables.push(`  --font-size-base: ${typography.fontSize.base};`);
    variables.push(`  --font-size-lg: ${typography.fontSize.lg};`);
    variables.push(`  --font-size-xl: ${typography.fontSize.xl};`);
    variables.push(`  --font-size-2xl: ${typography.fontSize['2xl']};`);
    variables.push(`  --font-size-3xl: ${typography.fontSize['3xl']};`);
    variables.push(`  --font-size-4xl: ${typography.fontSize['4xl']};`);

    variables.push(`  --line-height-tight: ${typography.lineHeight.tight};`);
    variables.push(`  --line-height-normal: ${typography.lineHeight.normal};`);
    variables.push(`  --line-height-relaxed: ${typography.lineHeight.relaxed};`);

    variables.push(`  --font-weight-normal: ${typography.fontWeight.normal};`);
    variables.push(`  --font-weight-medium: ${typography.fontWeight.medium};`);
    variables.push(`  --font-weight-semibold: ${typography.fontWeight.semibold};`);
    variables.push(`  --font-weight-bold: ${typography.fontWeight.bold};`);

    // Layout variables
    variables.push('');
    variables.push(`  /* Layout */`);
    variables.push(`  --container-width-sm: ${layout.containerWidth.sm};`);
    variables.push(`  --container-width-md: ${layout.containerWidth.md};`);
    variables.push(`  --container-width-lg: ${layout.containerWidth.lg};`);
    variables.push(`  --container-width-xl: ${layout.containerWidth.xl};`);

    variables.push(`  --spacing-xs: ${layout.spacing.xs};`);
    variables.push(`  --spacing-sm: ${layout.spacing.sm};`);
    variables.push(`  --spacing-md: ${layout.spacing.md};`);
    variables.push(`  --spacing-lg: ${layout.spacing.lg};`);
    variables.push(`  --spacing-xl: ${layout.spacing.xl};`);
    variables.push(`  --spacing-2xl: ${layout.spacing['2xl']};`);

    variables.push(`  --border-radius-sm: ${layout.borderRadius.sm};`);
    variables.push(`  --border-radius-md: ${layout.borderRadius.md};`);
    variables.push(`  --border-radius-lg: ${layout.borderRadius.lg};`);
    variables.push(`  --border-radius-full: ${layout.borderRadius.full};`);

    variables.push(`  --header-height: ${layout.header.height};`);
    variables.push(`  --sidebar-width: ${layout.sidebar.width};`);
    variables.push(`  --sidebar-collapsed-width: ${layout.sidebar.collapsedWidth};`);

    variables.push('}');

    // Dark mode color variables
    variables.push('');
    variables.push('[data-theme="dark"] {');
    variables.push(`  /* Colors - Dark Mode */`);
    variables.push(`  --color-primary: ${colors.primary.dark};`);
    variables.push(`  --color-secondary: ${colors.secondary.dark};`);
    variables.push(`  --color-background: ${colors.background.dark};`);
    variables.push(`  --color-surface: ${colors.surface.dark};`);
    variables.push(`  --color-text-primary: ${colors.text.primary.dark};`);
    variables.push(`  --color-text-secondary: ${colors.text.secondary.dark};`);
    variables.push(`  --color-text-disabled: ${colors.text.disabled.dark};`);
    variables.push(`  --color-border: ${colors.border.dark};`);
    variables.push(`  --color-link: ${colors.link.dark};`);
    variables.push(`  --color-success: ${colors.success.dark};`);
    variables.push(`  --color-warning: ${colors.warning.dark};`);
    variables.push(`  --color-error: ${colors.error.dark};`);
    variables.push(`  --color-info: ${colors.info.dark};`);

    // Navigation colors (dark mode)
    variables.push('');
    variables.push(`  /* Navigation - Dark Mode */`);
    variables.push(`  --nav-text-color: ${colors.navigation.text.dark};`);
    variables.push(`  --nav-hover-color: ${colors.navigation.hover.dark};`);
    variables.push(`  --nav-active-color: ${colors.navigation.active.dark};`);

    // Header colors (dark mode)
    variables.push('');
    variables.push(`  /* Header - Dark Mode */`);
    variables.push(`  --header-background: ${colors.header.background.dark};`);
    variables.push('}');

    // Prefer dark mode based on system preference
    variables.push('');
    variables.push('@media (prefers-color-scheme: dark) {');
    variables.push('  :root:not([data-theme="light"]) {');
    variables.push(`    --color-primary: ${colors.primary.dark};`);
    variables.push(`    --color-secondary: ${colors.secondary.dark};`);
    variables.push(`    --color-background: ${colors.background.dark};`);
    variables.push(`    --color-surface: ${colors.surface.dark};`);
    variables.push(`    --color-text-primary: ${colors.text.primary.dark};`);
    variables.push(`    --color-text-secondary: ${colors.text.secondary.dark};`);
    variables.push(`    --color-text-disabled: ${colors.text.disabled.dark};`);
    variables.push(`    --color-border: ${colors.border.dark};`);
    variables.push(`    --color-link: ${colors.link.dark};`);
    variables.push(`    --color-success: ${colors.success.dark};`);
    variables.push(`    --color-warning: ${colors.warning.dark};`);
    variables.push(`    --color-error: ${colors.error.dark};`);
    variables.push(`    --color-info: ${colors.info.dark};`);
    variables.push(`    --nav-text-color: ${colors.navigation.text.dark};`);
    variables.push(`    --nav-hover-color: ${colors.navigation.hover.dark};`);
    variables.push(`    --nav-active-color: ${colors.navigation.active.dark};`);
    variables.push(`    --header-background: ${colors.header.background.dark};`);
    variables.push('  }');
    variables.push('}');

    return variables.join('\n');
  }

  /**
   * Format font family with fallbacks
   */
  private formatFontFamily(fontConfig: FontConfig): string {
    const fonts = [fontConfig.family];
    if (fontConfig.fallbacks) {
      fonts.push(...fontConfig.fallbacks);
    }
    return fonts.join(', ');
  }
}