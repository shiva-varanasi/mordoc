/**
 * StylesGenerator - Generates component CSS styles
 * Creates styles.css with all component styling using CSS variables
 */

export class StylesGenerator {
  /**
   * Generate complete CSS stylesheet
   */
  generateCSS(): string {
    const sections = [
      this.generateResetStyles(),
      this.generateBaseStyles(),
      this.generateLayoutStyles(),
      this.generateTypographyStyles(),
      this.generateHeaderStyles(),
      this.generateFooterStyles(),
      this.generateSideNavStyles(),
      this.generateContentStyles(),
      this.generateTOCStyles(),
      this.generateBreadcrumbsStyles(),
      this.generatePageNavigationStyles(),
      this.generateSearchModalStyles(),
      this.generateUtilityStyles(),
    ];

    return sections.join('\n\n');
  }

  /**
   * CSS Reset
   */
  private generateResetStyles(): string {
    return `/* CSS Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
}`;
  }

  /**
   * Base styles
   */
  private generateBaseStyles(): string {
    return `/* Base Styles */
body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}`;
  }

  /**
   * Layout styles
   */
  private generateLayoutStyles(): string {
    return `/* Layout */
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-container {
  display: flex;
  flex: 1;
  max-width: var(--container-width-xl);
  margin: 0 auto;
  width: 100%;
}

.layout-sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  position: sticky;
  top: var(--header-height);
  height: calc(100vh - var(--header-height));
}

.layout-main {
  flex: 1;
  min-width: 0;
  padding: var(--spacing-lg);
}

.container {
  max-width: var(--container-width-xl);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}`;
  }

  /**
   * Typography styles
   */
  private generateTypographyStyles(): string {
    return `/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: var(--color-text-primary);
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

p {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--color-link);
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

a:hover {
  opacity: 0.8;
}

code, pre {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}

code {
  background-color: var(--color-surface);
  padding: 0.125rem 0.375rem;
  border-radius: var(--border-radius-sm);
}

pre {
  background-color: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  overflow-x: auto;
  margin-bottom: var(--spacing-md);
}

pre code {
  background-color: transparent;
  padding: 0;
}

ul, ol {
  padding-left: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
}

li {
  margin-bottom: var(--spacing-sm);
}

blockquote {
  margin: var(--spacing-md) 0;
  padding-left: var(--spacing-md);
  border-left: 4px solid var(--color-border);
  color: var(--color-text-secondary);
}

hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--spacing-lg) 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-md);
}

th, td {
  text-align: left;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

th {
  font-weight: var(--font-weight-semibold);
  background-color: var(--color-surface);
}`;
  }

  /**
   * Header styles
   */
  private generateHeaderStyles(): string {
    return `/* Header */
.site-header {
  height: var(--header-height);
  background-color: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: var(--container-width-xl);
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
}

.header-brand {
  display: flex;
  align-items: center;
}

.header-logo-link {
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.header-logo {
  height: 2rem;
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-nav-list {
  display: flex;
  list-style: none;
  gap: var(--spacing-md);
  margin: 0;
  padding: 0;
}

.header-nav-item {
  margin: 0;
}

.header-nav-link {
  text-decoration: none;
  color: var(--color-text-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all 0.2s ease;
}

.header-nav-link:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-search-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-search-button:hover {
  background: var(--color-background);
  border-color: var(--color-primary);
}

.search-shortcut {
  font-size: var(--font-size-xs);
  opacity: 0.7;
}`;
  }

  /**
   * Footer styles
   */
  private generateFooterStyles(): string {
    return `/* Footer */
.site-footer {
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-lg) 0;
  margin-top: auto;
}

.footer-container {
  max-width: var(--container-width-xl);
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.footer-content {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.footer-text, .footer-powered {
  margin: var(--spacing-sm) 0;
}`;
  }

  /**
   * SideNav styles
   */
  private generateSideNavStyles(): string {
    return `/* SideNav */
.sidenav {
  padding: var(--spacing-lg) var(--spacing-md);
}

.sidenav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidenav-item {
  margin-bottom: var(--spacing-xs);
}

.sidenav-item-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.sidenav-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidenav-link {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.sidenav-link:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.sidenav-link.active {
  background: var(--color-primary);
  color: var(--color-background);
}

.sidenav-sublist {
  list-style: none;
  margin-left: var(--spacing-md);
  padding-left: var(--spacing-md);
  border-left: 1px solid var(--color-border);
}`;
  }

  /**
   * Content page styles
   */
  private generateContentStyles(): string {
    return `/* Content Page */
.content-page {
  max-width: 100%;
}

.content-wrapper {
  display: flex;
  gap: var(--spacing-xl);
}

.content-article {
  flex: 1;
  min-width: 0;
}

.content-header {
  margin-bottom: var(--spacing-xl);
}

.content-title {
  margin-top: 0;
  font-size: var(--font-size-5xl);
}

.content-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.content-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.content-tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-surface);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
}

.content-body {
  margin-bottom: var(--spacing-2xl);
}

.content-toc {
  width: 16rem;
  flex-shrink: 0;
}`;
  }

  /**
   * Table of Contents styles
   */
  private generateTOCStyles(): string {
    return `/* Table of Contents */
.toc {
  position: sticky;
  top: calc(var(--header-height) + var(--spacing-md));
  padding: var(--spacing-md);
  border-left: 1px solid var(--color-border);
}

.toc-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-item {
  margin-bottom: var(--spacing-xs);
}

.toc-link {
  display: block;
  padding: var(--spacing-xs) 0;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color 0.2s ease;
}

.toc-link:hover {
  color: var(--color-text-primary);
}

.toc-link.active {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.toc-sublist {
  list-style: none;
  margin-left: var(--spacing-md);
  padding-left: 0;
}`;
  }

  /**
   * Breadcrumbs styles
   */
  private generateBreadcrumbsStyles(): string {
    return `/* Breadcrumbs */
.breadcrumbs {
  margin-bottom: var(--spacing-lg);
}

.breadcrumbs-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--spacing-xs);
}

.breadcrumbs-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.breadcrumbs-link {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.breadcrumbs-link:hover {
  color: var(--color-primary);
}

.breadcrumbs-current {
  color: var(--color-text-primary);
}

.breadcrumbs-separator {
  color: var(--color-text-disabled);
}`;
  }

  /**
   * Page Navigation styles
   */
  private generatePageNavigationStyles(): string {
    return `/* Page Navigation */
.page-navigation {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-2xl);
  border-top: 1px solid var(--color-border);
}

.page-nav-container {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.page-nav-link {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 45%;
}

.page-nav-link:hover {
  background: var(--color-surface);
  border-color: var(--color-primary);
}

.page-nav-prev {
  text-align: left;
}

.page-nav-next {
  text-align: right;
}

.page-nav-direction {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.page-nav-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.page-nav-spacer {
  flex: 1;
}`;
  }

  /**
   * Search Modal styles
   */
  private generateSearchModalStyles(): string {
    return `/* Search Modal */
.search-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.search-modal {
  background: var(--color-background);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 42rem;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-input-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  outline: none;
}

.search-close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.search-results-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.search-result-item {
  margin-bottom: var(--spacing-sm);
}

.search-result-link {
  display: block;
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.search-result-link:hover {
  border-color: var(--color-primary);
}

.search-result-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.search-result-excerpt {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.search-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}`;
  }

  /**
   * Utility styles
   */
  private generateUtilityStyles(): string {
    return `/* Utility Classes */
.loading {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-error);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  border-left: 4px solid var(--color-error);
}

.table-wrapper {
  overflow-x: auto;
  margin-bottom: var(--spacing-md);
}`;
  }
}