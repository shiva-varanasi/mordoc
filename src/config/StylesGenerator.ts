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
      this.generatePrismStyles(),
      this.generateHeaderStyles(),
      this.generateThemeToggleStyles(),
      this.generateFooterStyles(),
      this.generateSideNavStyles(),
      this.generateContentStyles(),
      this.generateTOCStyles(),
      this.generatePageNavigationStyles(),
      this.generateSearchModalStyles(),
      this.generateUtilityStyles(),
      this.generateImageModalStyles(),
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
    overflow: hidden;
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
    height: 100vh;
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
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .layout-container {
    display: flex;
    flex: 1;
    width: 100%;
    overflow: hidden;
    height: calc(100vh - var(--header-height));
  }

  .layout-sidebar {
    width: 300px;
    flex-shrink: 0;
    border-right: 1px solid var(--color-border);
    overflow-y: auto;
    height: 100;
  }

  .layout-main {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    height: 100%;
    display: flex;
    justify-content: center;
  }
  
  .layout-main-inner {
    width: 100%;
    max-width: 1400px;
    padding: var(--spacing-lg);
  }

  .container {
    max-width: var(--container-width-xl);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }
  
  /* Responsive Layout */
  @media (max-width: 1024px) {
    .layout-sidebar {
      width: 220px;
    }
  }

  @media (max-width: 768px) {
    .layout-sidebar {
      width: 200px;
    }

    .layout-main-inner {
      padding: var(--spacing-md);
    }
  }

  @media (max-width: 640px) {
    .layout-container {
      flex-direction: column;
    }

    .layout-sidebar {
      width: 100%;
      height: auto;
      max-height: 300px;
      border-right: none;
      border-bottom: 1px solid var(--color-border);
    }

    .layout-main-inner {
      padding: var(--spacing-sm);
    }
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

  h1 { font-size: var(--font-size-2xl); }
  h2 { font-size: var(--font-size-xl); }
  h3 { font-size: var(--font-size-lg); }
  h4 { font-size: var(--font-size-base); }
  h5 { font-size: var(--font-size-sm); }
  h6 { font-size: var(--font-size-xs); }

  /* Heading with anchor link */
  .heading-with-anchor {
    position: relative;
    scroll-margin-top: calc(var(--header-height) + var(--spacing-md));
  }

  .heading-anchor-link {
    position: absolute;
    left: -1.5rem;
    opacity: 0;
    padding: 0.25rem;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: opacity 0.2s ease, color 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius-sm);
  }

  .heading-anchor-link:hover {
    color: var(--color-link);
    background-color: var(--color-surface);
  }

  .heading-with-anchor:hover .heading-anchor-link {
    opacity: 1;
  }

  .heading-anchor-link:focus-visible {
    opacity: 1;
    outline: 2px solid var(--color-link);
    outline-offset: 2px;
  }

  .heading-copied-tooltip {
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: var(--color-text-secondary);
    color: var(--color-background);
    font-size: var(--font-size-sm);
    border-radius: var(--border-radius-md);
    white-space: nowrap;
    pointer-events: none;
    font-family: var(--font-family-base);
    font-weight: var(--font-weight-normal);
  }

  /* Mobile: show icon on touch devices */
  @media (hover: none) and (pointer: coarse) {
    .heading-anchor-link {
      opacity: 0.6;
    }
    
    .heading-with-anchor:active .heading-anchor-link {
      opacity: 1;
    }
  }

  /* Smaller screens: move icon to the right side */
  @media (max-width: 768px) {
    .heading-anchor-link {
      position: relative;
      left: auto;
      margin-left: 0.5rem;
      display: inline-flex;
      vertical-align: middle;
    }
  }

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
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: var(--spacing-md) 0;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  img:hover {
    opacity: 0.9;
  }`;
  }

  /**
   * Prism syntax highlighting styles
   */
  private generatePrismStyles(): string {
    return `/* Prism Syntax Highlighting */
    /* Based on Prism Tomorrow theme with adjustments for light/dark modes */

    /* Code block wrapper with header */
    .code-block-wrapper {
      position: relative;
      margin-bottom: var(--spacing-md);
    }

    .code-block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) var(--spacing-md);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-bottom: none;
      border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
    }

    .code-block-language {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      text-transform: capitalize;
      font-family: var(--font-family-base);
    }

    .code-block-copy {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      border-radius: var(--border-radius-sm);
      transition: all 0.2s ease;
    }

    .code-block-copy:hover {
      background-color: var(--color-background);
      color: var(--color-text-primary);
    }

    .code-block-copy:active {
      transform: scale(0.95);
    }

    .code-block-copy svg {
      width: 16px;
      height: 16px;
    }

    /* Adjust pre styles for wrapper */
    .code-block-wrapper pre {
      margin-top: 0;
      margin-bottom: 0;
      border: 1px solid var(--color-border);
      border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
    }

    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
      color: #6a737d;
    }

    .token.punctuation {
      color: var(--color-text-primary);
    }

    .token.namespace {
      opacity: 0.7;
    }

    .token.property,
    .token.tag,
    .token.boolean,
    .token.number,
    .token.constant,
    .token.symbol,
    .token.deleted {
      color: #0184bc;
    }

    .token.selector,
    .token.attr-name,
    .token.string,
    .token.char,
    .token.builtin,
    .token.inserted {
      color: #50a14f;
    }

    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
      color: #a626a4;
    }

    .token.atrule,
    .token.attr-value,
    .token.keyword {
      color: #a626a4;
    }

    .token.function,
    .token.class-name {
      color: #c18401;
    }

    .token.regex,
    .token.important,
    .token.variable {
      color: #e45649;
    }

    .token.important,
    .token.bold {
      font-weight: bold;
    }

    .token.italic {
      font-style: italic;
    }

    .token.entity {
      cursor: help;
    }

    /* Code block enhancements */
    pre[class*="language-"] {
      position: relative;
      line-height: 1.5;
    }

    code[class*="language-"],
    pre[class*="language-"] {
      color: var(--color-text-primary);
      text-align: left;
      white-space: pre;
      word-spacing: normal;
      word-break: normal;
      word-wrap: normal;
      tab-size: 2;
      hyphens: none;
    }`;
  }

  /**
   * Header styles
   * Adaptive two-row layout: logo/search/actions on top, optional navigation on bottom
   */
  private generateHeaderStyles(): string {
    return `/* Header */
    .site-header {
      background-color: var(--header-background);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
    }

    /* Adjust header height based on presence of navigation */
    .site-header.has-nav {
      height: 144px;
    }

    .site-header.no-nav {
      height: 80px;
    }

    /* Top row container */
    .header-top {
      height: 80px;
    }

    .site-header.has-nav .header-top {
      border-bottom: 1px solid var(--color-border);
    }

    /* Bottom row container */
    .header-bottom {
      height: 64px;
    }

    .header-container {
      max-width: 100%;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 var(--spacing-sm) 0 var(--spacing-xl);  
    }

    /* Logo section */
    .header-brand {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .header-logo-link {
      text-decoration: none;
      color: var(--color-text-primary);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-lg);
    }

    .header-logo {
      height: 2.5rem;
    }

    /* Search section - centered */
    .header-search {
      flex: 1;
      display: flex;
      justify-content: center;
      height: 2.2rem;
      padding: 0 var(--spacing-lg);
    }

    .header-search-button {
      display: flex;
      align-items: center;      
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 300px;
    }

    .header-search-button:hover {
      border-color: var(--color-primary);
      background: var(--color-background);
    }

    .search-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: var(--color-text-secondary);
    }

    .search-text {
      flex: 1;
      text-align: left;
    }

    .search-shortcut {
      padding-left: 6px;
      padding-right: 6px;
      padding-bottom: 1px;
      background: var(--color-surface);
      font-size: var(--font-size-sm);
      font-family: var(--font-family-base);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
    }

    /* Actions section */
    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-shrink: 0;
      min-width: 100px;
    }

    /* Navigation menu */
    .header-nav {
      width: 100%;
    }

    .header-nav-list {
      display: flex;
      list-style: none;
      gap: var(--spacing-lg);
      margin: 0;
      padding: 0;
    }

    .header-nav-item {
      margin: 0;
    }

    .header-nav-link {
      text-decoration: none;
      color: var(--nav-text-color);
      padding: var(--spacing-sm) 0;
      transition: color 0.2s ease;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .header-nav-link:hover {
      color: var(--nav-hover-color);
    }

    .header-nav-link.active {
      color: var(--nav-active-color);
      border-bottom: 2px solid var(--color-primary);
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .header-search {
        padding: 0 var(--spacing-sm);
      }

      .header-search-button {
        min-width: 200px;
      }

      .search-text {
        display: none;
      }
    }`;
  }

  /**
   * Theme toggle button styles
   */
  private generateThemeToggleStyles(): string {
    return `/* Theme Toggle */
    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-full);
      padding: 4px;
    }

    .theme-toggle-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      background: transparent;
      border: none;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
      position: relative;
    }

    .theme-toggle-button:hover {
      color: var(--color-text-primary);
    }    

    .theme-toggle-button.active:hover {
      opacity: 0.9;
    }

    .theme-toggle-button svg {
      width: 12px;
      height: 12px;
      display: block;
      fill: none;
      stroke: currentColor;
    }

    .theme-toggle-button.active svg {
      fill: var(--color-text-primary);
    }

    /* Responsive: hide on very small screens */
    @media (max-width: 480px) {
      .theme-toggle {
        gap: 2px;
        padding: 3px;
      }

      .theme-toggle-button {
        padding: 5px;
      }

      .theme-toggle-button svg {
        width: 12px;
        height: 12px;
      }
    }`;
  }  

  /**
   * Footer styles
   */
  private generateFooterStyles(): string {
    return `/* Footer */
  .site-footer {
    margin-top: var(--spacing-2xl);
  }

  .footer-container {
    max-width: 948px;
    padding: var(--spacing-lg) 0;
    border-top: 1px solid var(--color-border);
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
  
  .rotate-right {
    transform: rotate(-90deg);
  }

  .rotate-down {
    transform: rotate(0deg);
  }

  .sidenav-link {
    display: block;
    padding-top: var(--spacing-xs);
    padding-bottom: var(--spacing-xs);
    border-radius: var(--border-radius-md);
    color: var(--nav-text-color);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .sidenav-link:hover {
    color: var(--nav-hover-color);
  }

  .sidenav-link.active {
    color: var(--nav-active-color);
    font-weight: var(--font-weight-medium);
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
    width: 100%;
  }

  .content-wrapper {
    display: flex;
    gap: var(--spacing-2xl);
    width: 100%;
  }

  .content-article {
    flex: 1;
    min-width: 0;
    max-width: 900px;
  }

  .content-header {
    margin-bottom: var(--spacing-xl);
    border-bottom: 1px solid var(--color-border);
  }

  .content-title {
    margin-top: 0;
    font-size: 36px;
    margin-bottom: 12px;
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
    margin-bottom: var(--spacing-sm);
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
    width: 280px;
    flex-shrink: 0;
  }
  
  .content-footer {
    margin-top: var(--spacing-3xl);
    margin-bottom: var(--spacing-2xl);
    padding-top: var(--spacing-xl);
    border-top: 1px solid var(--color-border);
  }

  .content-footer-info {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .content-footer-text {
    margin: 0 0 var(--spacing-sm) 0;
  }

  .content-footer-powered {
    margin: 0;
  }

  .content-footer-powered a {
    color: var(--color-link);
    text-decoration: none;
  }

  .content-footer-powered a:hover {
    text-decoration: underline;
  }
  
  /* Responsive Content */
  @media (max-width: 1280px) {
    .content-toc {
      width: 240px;
    }
  }

  @media (max-width: 1024px) {
    .content-toc {
      width: 220px;
    }

    .content-article {
      max-width: 720px;
    }
  }

  @media (max-width: 768px) {
    .content-wrapper {
      flex-direction: column;
    }

    .content-article {
      max-width: 100%;
    }

    .content-toc {
      width: 100%;
      order: -1;
    }

    .content-title {
      font-size: var(--font-size-3xl);
    }
  }

  @media (max-width: 640px) {
    .content-title {
      font-size: var(--font-size-2xl);
    }

    .content-meta {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }`;  
  }

  /**
   * Image Modal styles
   */
  private generateImageModalStyles(): string {
    return `/* Image Modal/Lightbox */
    .image-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xl);
      cursor: zoom-out;
    }
  
    .image-modal img {
      max-width: 90vw;
      max-height: 90vh;
      width: auto;
      height: auto;
      cursor: default;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
  
    .image-modal-close {
      position: absolute;
      top: var(--spacing-lg);
      right: var(--spacing-lg);
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: 32px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
    }
  
    .image-modal-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }`;
  }

  /**
   * Table of Contents styles
   */
  private generateTOCStyles(): string {
    return `/* Table of Contents */
  .toc {
    position: sticky;
    top: var(--spacing-md);
    max-height: calc(100vh - var(--header-height) - var(--spacing-lg) * 2);
    overflow-y: auto;
    padding: var(--spacing-md);
    border-left: 1px solid var(--color-border);
  }

  .toc-title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-md);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-secondary);
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
    line-height: var(--line-height-relaxed);
  }

  .toc-link:hover {
    color: var(--color-text-primary);
  }

  .toc-link.active {
    color: var(--nav-active-color);
    font-weight: var(--font-weight-medium);
  }

  .toc-sublist {
    list-style: none;
    margin-left: var(--spacing-md);
    padding-left: 0;
  }
  
  /* Responsive TOC */
  @media (max-width: 768px) {
    .toc {
      position: relative;
      top: 0;
      max-height: 400px;
      border-left: none;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--spacing-lg);
    }

    .toc-title {
      font-size: var(--font-size-base);
    }
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
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .search-modal {
    background: var(--color-background);
    border-radius: var(--border-radius-lg);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 90%;
    max-width: 42rem;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideDown 0.2s ease-out;
    border: 1px solid var(--color-border);
  }

  .search-input-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .search-input-icon {
    width: 20px;
    height: 20px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    outline: none;
  }

  .search-input::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.6;
  }

  .search-close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--spacing-sm);
    color: var(--color-text-secondary);
    border-radius: var(--border-radius-sm);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-close-button:hover {
    background: var(--color-surface);
    color: var(--color-text-primary);
  }

  .search-close-icon {
    font-size: var(--font-size-xl);
    line-height: 1;
  }

  .search-results {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
    min-height: 0;
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
  
  .search-result-link.selected {
    border-color: var(--color-primary);
    background: var(--color-background);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .search-result-link:hover,
  .search-result-link:focus {
    border-color: var(--color-primary);
    background: var(--color-background);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .search-result-title {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-base);
  }

  .search-result-excerpt {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: var(--spacing-xs);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .search-result-url {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    opacity: 0.7;
  }

  .search-loading,
  .search-empty,
  .search-no-results,
  .search-notice {
    text-align: center;
    padding: var(--spacing-md);
    color: var(--color-text-secondary);
  }

  .search-empty-text,
  .search-help-text,
  .search-notice-text {
    margin: 0 0 0 0;
  }

  .search-shortcuts {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .search-shortcuts kbd {
    padding: 0.25rem 0.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .search-separator {
    color: var(--color-text-secondary);
    opacity: 0.5;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .search-modal-backdrop {
      padding-top: 5vh;
    }

    .search-modal {
      width: 95%;
      max-height: 90vh;
    }

    .search-input-container {
      padding: var(--spacing-md);
    }

    .search-input {
      font-size: var(--font-size-base);
    }
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