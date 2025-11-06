/**
 * HtmlGenerator - Generates static HTML files using React SSR
 * Creates pre-rendered HTML for each content page
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ProcessedContent } from '../types/content';
import { SiteConfig } from '../types/config';
import MarkdocRenderer from '../components/MarkdocRenderer';

export interface HtmlGeneratorOptions {
  siteConfig: SiteConfig;
}

export class HtmlGenerator {
  private siteConfig: SiteConfig;

  constructor(options: HtmlGeneratorOptions) {
    this.siteConfig = options.siteConfig;
  }

  /**
   * Generate HTML for a content page
   * @param content - Processed content
   * @returns Complete HTML string
   */
  generatePage(content: ProcessedContent): string {

    // Build full URL for this page
    const pageUrl = this.siteConfig.metadata.baseUrl + content.metadata.path;

    // Generate HTML structure
    const html = `<!DOCTYPE html>
    <html lang="${content.metadata.language}">
    <head>
      ${this.generateHead(content, pageUrl)}
    </head>
    <body>
      <div id="root">${this.generateBody(content)}</div>
      ${this.generateScripts(content)}
    </body>
    </html>`;

    return html;
  }

  /**
   * Generate <head> section with metadata and asset links
   */
  private generateHead(content: ProcessedContent, pageUrl: string): string {
    const { metadata } = content;
    const { frontmatter } = metadata;
    const title = `${frontmatter.title} | ${this.siteConfig.metadata.title}`;
    const description = frontmatter.description || this.siteConfig.metadata.description || '';

    const headParts: string[] = [];

    // Basic meta tags
    headParts.push(`<meta charset="UTF-8">`);
    headParts.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    headParts.push(`<title>${this.escapeHtml(title)}</title>`);

    if (description) {
      headParts.push(`<meta name="description" content="${this.escapeHtml(description)}">`);
    }

    // Author
    const author = frontmatter.author
    if (author) {
      headParts.push(`<meta name="author" content="${this.escapeHtml(author)}">`);
    }

    // Keywords
    const keywords = frontmatter.tags || this.siteConfig.metadata.keywords;
    if (keywords && keywords.length > 0) {
      headParts.push(`<meta name="keywords" content="${keywords.join(', ')}">`);
    }

    // Open Graph tags for social sharing
    headParts.push(`<meta property="og:title" content="${this.escapeHtml(frontmatter.title)}">`);
    if (description) {
      headParts.push(`<meta property="og:description" content="${this.escapeHtml(description)}">`);
    }
    headParts.push(`<meta property="og:url" content="${pageUrl}">`);
    headParts.push(`<meta property="og:type" content="article">`);

    // Twitter Card tags
    headParts.push(`<meta name="twitter:card" content="summary">`);
    headParts.push(`<meta name="twitter:title" content="${this.escapeHtml(frontmatter.title)}">`);
    if (description) {
      headParts.push(`<meta name="twitter:description" content="${this.escapeHtml(description)}">`);
    }

    // Canonical URL
    headParts.push(`<link rel="canonical" href="${pageUrl}">`);

    // Favicon
    if (this.siteConfig.assets.favicon) {
      headParts.push(`<link rel="icon" href="${this.siteConfig.assetsPath}/${this.siteConfig.assets.favicon}">`);
    }

    // Stylesheets
    headParts.push(`<link rel="stylesheet" href="${this.siteConfig.assetsPath}/theme.css">`);
    headParts.push(`<link rel="stylesheet" href="${this.siteConfig.assetsPath}/styles.css">`);

    // Pagefind CSS (for search)
    headParts.push(`<link rel="stylesheet" href="/pagefind/pagefind-ui.css">`);

    return headParts.map(part => `  ${part}`).join('\n');
  }

  /**
   * Generate body content with server-side rendered Markdoc content
   */
  private generateBody(content: ProcessedContent): string {
    const { metadata, renderable } = content;

    // Render Markdoc content to HTML string
    const contentHtml = ReactDOMServer.renderToString(
      React.createElement(MarkdocRenderer, { content: renderable })
    );

    // Generate full page HTML with placeholder structure
    // React will hydrate the full layout on client-side
    const bodyHtml = `
    <div class="layout">
      <header class="site-header">
        <div class="header-container">
          <div class="header-brand">
            <a href="/" class="header-logo-link">
              <span class="header-title">${this.escapeHtml(this.siteConfig.metadata.title)}</span>
            </a>
          </div>
        </div>
      </header>
      
      <div class="layout-container">
        <main class="layout-main">
          <div class="content-page">
            <article class="content-article">
              <header class="content-header">
                <h1 class="content-title">${this.escapeHtml(metadata.frontmatter.title)}</h1>
                ${metadata.frontmatter.description ? `<p class="content-description">${this.escapeHtml(metadata.frontmatter.description)}</p>` : ''}
              </header>
              
              <div class="content-body" data-pagefind-body>
                ${contentHtml}
              </div>
            </article>
          </div>
        </main>
      </div>
      
      <footer class="site-footer">
        <div class="footer-container">
          <p class="footer-text">© ${new Date().getFullYear()} ${this.escapeHtml(this.siteConfig.metadata.title)}</p>
        </div>
      </footer>
    </div>`;

    return bodyHtml;
  }

  /**
   * Generate script tags for client-side hydration
   */
  private generateScripts(content: ProcessedContent): string {
    const scripts: string[] = [];

    // Inject content data for client-side hydration
    const contentData = {
      metadata: content.metadata,
      renderable: content.renderable,
    };

    scripts.push(`  <script id="__CONTENT_DATA__" type="application/json">`);
    scripts.push(`    ${JSON.stringify(contentData)}`);
    scripts.push(`  </script>`);

    // Inject site config for client
    scripts.push(`  <script id="__SITE_CONFIG__" type="application/json">`);
    scripts.push(`    ${JSON.stringify(this.siteConfig)}`);
    scripts.push(`  </script>`);

    // Client-side React bundle
    scripts.push(`  <script src="${this.siteConfig.assetsPath}/main.js" defer></script>`);

    // Pagefind search script
    scripts.push(`  <script src="/pagefind/pagefind-ui.js" defer></script>`);

    return scripts.join('\n');
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const htmlEscapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
  }

  /**
   * Generate a simple 404 page
   */
  generate404Page(): string {
    const html = `<!DOCTYPE html>
<html lang="${this.siteConfig.defaultLanguage}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found | ${this.escapeHtml(this.siteConfig.metadata.title)}</title>
  <link rel="stylesheet" href="${this.siteConfig.assetsPath}/theme.css">
  <link rel="stylesheet" href="${this.siteConfig.assetsPath}/styles.css">
</head>
<body>
  <div id="root">
    <div class="page-container">
      <main class="content-main">
        <div class="container" style="text-align: center; padding: 4rem 0;">
          <h1>404</h1>
          <p>Page not found</p>
          <a href="/">Go to home</a>
        </div>
      </main>
    </div>
  </div>
  <script src="${this.siteConfig.assetsPath}/main.js" defer></script>
</body>
</html>`;

    return html;
  }
}