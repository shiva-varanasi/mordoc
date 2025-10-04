/**
 * ThemeGenerator - Generates CSS from StyleConfig
 * Converts theme configuration into CSS custom properties and base styles
 */

import { StyleConfig, ColorScheme, FontConfig } from '../types/config';

export class ThemeGenerator {
  constructor(private styleConfig: StyleConfig) {}

  /**
   * Generate complete CSS string for the theme
   */
  generateCSS(): string {
    const sections = [
      this.generateCSSVariables(),
      this.generateTypographyStyles(),
      this.generateLayoutStyles(),
      this.generateBaseStyles(),
    ];

    return sections.join('\n\n');
  }

  /**
   * Generate CSS custom properties (variables) for colors, typography, and layout
   */
  private generateCSSVariables(): string {
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
    variables.push('  }');
    variables.push('}');

    return variables.join('\n');
  }

  /**
   * Generate typography styles
   */
  private generateTypographyStyles(): string {
    const styles: string[] = [];

    styles.push('/* Typography Styles */');
    styles.push('body {');
    styles.push('  font-family: var(--font-family-base);');
    styles.push('  font-size: var(--font-size-base);');
    styles.push('  line-height: var(--line-height-normal);');
    styles.push('  font-weight: var(--font-weight-normal);');
    styles.push('  color: var(--color-text-primary);');
    styles.push('  background-color: var(--color-background);');
    styles.push('}');

    styles.push('');
    styles.push('h1, h2, h3, h4, h5, h6 {');
    styles.push('  font-family: var(--font-family-heading);');
    styles.push('  font-weight: var(--font-weight-semibold);');
    styles.push('  line-height: var(--line-height-tight);');
    styles.push('  color: var(--color-text-primary);');
    styles.push('  margin-top: var(--spacing-xl);');
    styles.push('  margin-bottom: var(--spacing-md);');
    styles.push('}');

    styles.push('');
    styles.push('h1 { font-size: var(--font-size-4xl); }');
    styles.push('h2 { font-size: var(--font-size-3xl); }');
    styles.push('h3 { font-size: var(--font-size-2xl); }');
    styles.push('h4 { font-size: var(--font-size-xl); }');
    styles.push('h5 { font-size: var(--font-size-lg); }');
    styles.push('h6 { font-size: var(--font-size-base); }');

    styles.push('');
    styles.push('p {');
    styles.push('  margin-top: 0;');
    styles.push('  margin-bottom: var(--spacing-md);');
    styles.push('}');

    styles.push('');
    styles.push('a {');
    styles.push('  color: var(--color-link);');
    styles.push('  text-decoration: underline;');
    styles.push('  transition: opacity 0.2s ease;');
    styles.push('}');

    styles.push('');
    styles.push('a:hover {');
    styles.push('  opacity: 0.8;');
    styles.push('}');

    styles.push('');
    styles.push('code, pre {');
    styles.push('  font-family: var(--font-family-mono);');
    styles.push('  font-size: var(--font-size-sm);');
    styles.push('}');

    styles.push('');
    styles.push('code {');
    styles.push('  background-color: var(--color-surface);');
    styles.push('  padding: 0.125rem 0.375rem;');
    styles.push('  border-radius: var(--border-radius-sm);');
    styles.push('}');

    styles.push('');
    styles.push('pre {');
    styles.push('  background-color: var(--color-surface);');
    styles.push('  padding: var(--spacing-md);');
    styles.push('  border-radius: var(--border-radius-md);');
    styles.push('  overflow-x: auto;');
    styles.push('  margin-bottom: var(--spacing-md);');
    styles.push('}');

    styles.push('');
    styles.push('pre code {');
    styles.push('  background-color: transparent;');
    styles.push('  padding: 0;');
    styles.push('}');

    return styles.join('\n');
  }

  /**
   * Generate layout styles
   */
  private generateLayoutStyles(): string {
    const styles: string[] = [];

    styles.push('/* Layout Styles */');
    styles.push('* {');
    styles.push('  box-sizing: border-box;');
    styles.push('}');

    styles.push('');
    styles.push('html, body {');
    styles.push('  margin: 0;');
    styles.push('  padding: 0;');
    styles.push('  width: 100%;');
    styles.push('  height: 100%;');
    styles.push('}');

    styles.push('');
    styles.push('.container {');
    styles.push('  max-width: var(--container-width-xl);');
    styles.push('  margin: 0 auto;');
    styles.push('  padding: 0 var(--spacing-md);');
    styles.push('}');

    styles.push('');
    styles.push('.container-sm { max-width: var(--container-width-sm); }');
    styles.push('.container-md { max-width: var(--container-width-md); }');
    styles.push('.container-lg { max-width: var(--container-width-lg); }');

    return styles.join('\n');
  }

  /**
   * Generate base utility styles
   */
  private generateBaseStyles(): string {
    const styles: string[] = [];

    styles.push('/* Base Utility Styles */');
    styles.push('hr {');
    styles.push('  border: none;');
    styles.push('  border-top: 1px solid var(--color-border);');
    styles.push('  margin: var(--spacing-lg) 0;');
    styles.push('}');

    styles.push('');
    styles.push('blockquote {');
    styles.push('  margin: var(--spacing-md) 0;');
    styles.push('  padding-left: var(--spacing-md);');
    styles.push('  border-left: 4px solid var(--color-border);');
    styles.push('  color: var(--color-text-secondary);');
    styles.push('}');

    styles.push('');
    styles.push('ul, ol {');
    styles.push('  padding-left: var(--spacing-xl);');
    styles.push('  margin-bottom: var(--spacing-md);');
    styles.push('}');

    styles.push('');
    styles.push('li {');
    styles.push('  margin-bottom: var(--spacing-sm);');
    styles.push('}');

    styles.push('');
    styles.push('table {');
    styles.push('  width: 100%;');
    styles.push('  border-collapse: collapse;');
    styles.push('  margin-bottom: var(--spacing-md);');
    styles.push('}');

    styles.push('');
    styles.push('th, td {');
    styles.push('  text-align: left;');
    styles.push('  padding: var(--spacing-sm) var(--spacing-md);');
    styles.push('  border-bottom: 1px solid var(--color-border);');
    styles.push('}');

    styles.push('');
    styles.push('th {');
    styles.push('  font-weight: var(--font-weight-semibold);');
    styles.push('  background-color: var(--color-surface);');
    styles.push('}');

    return styles.join('\n');
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