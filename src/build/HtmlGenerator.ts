/**
 * HtmlGenerator - Generates static HTML files using React SSR
 * Creates pre-rendered HTML for each content page
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { ProcessedContent } from '../types/content';
import { SiteConfig } from '../types/config';
import App from '../client/App';
import { ConfigProvider } from '../client/contexts/ConfigContext';
import { ContentProvider } from '../client/contexts/ContentContext';
import { SearchProvider } from '../client/contexts/SearchContext';

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
   * Generate body content with full React SSR
   * Renders the complete App component tree including Layout, Header, SideNav, etc.
   */
  private generateBody(content: ProcessedContent): string {
    const pagePath = content.metadata.path;

    // Render the full React component tree with StaticRouter
    const bodyHtml = ReactDOMServer.renderToString(
      React.createElement(
        StaticRouter,
        { location: pagePath },
        React.createElement(
          ConfigProvider,
          { config: this.siteConfig, children: 
            React.createElement(
              ContentProvider,
              { initialContent: content, children:
                React.createElement(
                  SearchProvider,
                  { children:
                    React.createElement(App, {
                      siteConfig: this.siteConfig,
                      initialContent: content,
                      isServerRender: true
                    })
                  }
                )
              }
            )
          }
        )
      )
    );

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