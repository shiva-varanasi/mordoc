/**
 * ContentPage - Main content page component
 */

import React, { useEffect } from 'react';
import { useContent } from '../client/contexts/ContentContext';
import MarkdocRenderer from './MarkdocRenderer';
import TableOfContents from './TableOfContents';
import PageNavigation from './PageNavigation';
import { useConfig } from '../client/contexts/ConfigContext';

/**
 * Content page component - displays documentation page
 */
export function ContentPage() {
  const { currentContent, isLoading, error } = useContent();
  const { config } = useConfig();

  // Update document title and meta tags when content changes
  useEffect(() => {
    if (currentContent) {
      const { frontmatter } = currentContent.metadata;
      const title = `${frontmatter.title} | ${config.metadata.title}`;
      const description = frontmatter.description || config.metadata.description || '';
      const currentUrl = window.location.href;

      // Update document title
      document.title = title;

      // Helper to update or create a meta tag
      const updateMetaTag = (selector: string, attribute: string, content: string) => {
        let metaTag = document.querySelector(selector);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          const match = selector.match(/\[(.+?)="(.+?)"\]/);
          if (match) {
            const [, attrName, attrValue] = match;
            metaTag.setAttribute(attrName, attrValue);
          }
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute(attribute, content);
      };

      // Helper to update or create a link tag
      const updateLinkTag = (rel: string, href: string) => {
        let linkTag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
        if (!linkTag) {
          linkTag = document.createElement('link');
          linkTag.rel = rel;
          document.head.appendChild(linkTag);
        }
        linkTag.href = href;
      };

      // Update description
      if (description) {
        updateMetaTag('meta[name="description"]', 'content', description);
      }

      // Update author
      if (frontmatter.author) {
        updateMetaTag('meta[name="author"]', 'content', frontmatter.author);
      }

      // Update keywords
      const keywords = frontmatter.tags || config.metadata.keywords;
      if (keywords && keywords.length > 0) {
        const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
        updateMetaTag('meta[name="keywords"]', 'content', keywordsString);
      }

      // Update Open Graph tags
      updateMetaTag('meta[property="og:title"]', 'content', frontmatter.title);
      if (description) {
        updateMetaTag('meta[property="og:description"]', 'content', description);
      }
      updateMetaTag('meta[property="og:url"]', 'content', currentUrl);

      // Update Twitter Card tags
      updateMetaTag('meta[name="twitter:title"]', 'content', frontmatter.title);
      if (description) {
        updateMetaTag('meta[name="twitter:description"]', 'content', description);
      }

      // Update canonical URL
      updateLinkTag('canonical', currentUrl);
    }
  }, [currentContent, config.metadata.title, config.metadata.description, config.metadata.keywords]);

  // Loading state
  if (isLoading) {
    return (
      <div className="content-page">
        <div className="content-loading">
          <div className="skeleton-container">
            {/* Title skeleton */}
            <div className="skeleton-title-group">
              <div className="skeleton shimmer title"></div>
              <div className="skeleton shimmer subtitle"></div>
            </div>

            {/* Content sections */}
            <div className="skeleton-content">
              {/* Paragraph block 1 */}
              <div className="skeleton-paragraph">
                <div className="skeleton shimmer line full"></div>
                <div className="skeleton shimmer line full"></div>
                <div className="skeleton shimmer line w-80"></div>
              </div>

              {/* Subheading */}
              <div className="skeleton shimmer subheading w-48"></div>

              {/* Paragraph block 2 */}
              <div className="skeleton-paragraph">
                <div className="skeleton shimmer line full"></div>
                <div className="skeleton shimmer line w-83"></div>
                <div className="skeleton shimmer line full"></div>
                <div className="skeleton shimmer line w-75"></div>
              </div>

              {/* Subheading */}
              <div className="skeleton shimmer subheading w-36"></div>

              {/* Paragraph block 3 */}
              <div className="skeleton-paragraph">
                <div className="skeleton shimmer line full"></div>
                <div className="skeleton shimmer line w-66"></div>
              </div>

              {/* Subheading */}
              <div className="skeleton shimmer subheading w-56"></div>

              {/* Paragraph block 4 */}
              <div className="skeleton-paragraph">
                <div className="skeleton shimmer line full"></div>
                <div className="skeleton shimmer line full"></div>
                <div className="skeleton shimmer line w-50"></div>
                <div className="skeleton shimmer line full"></div>
                <div className="skeleton shimmer line w-83"></div>
                <div className="skeleton shimmer line full"></div>
                <div className="skeleton shimmer line w-75"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="content-page">
        <div className="content-error">
          <h1>Error</h1>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // No content state
  if (!currentContent) {
    return (
      <div className="content-page">
        <div className="content-empty">
          <h1>Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { metadata, renderable } = currentContent;
  const { frontmatter, toc, wordCount, readingTime } = metadata;

  return (
    <div className="content-page">
      <div className="content-wrapper">
        {/* Main content area */}
        <article className="content-article">
          <div data-pagefind-body>
            {/* Page header */}
            <header className="content-header">
              <h1 className="content-title" data-pagefind-weight="10">
                {frontmatter.title}
              </h1>
              
              {frontmatter.description && (
                <p className="content-description">{frontmatter.description}</p>
              )}
              
              <div className="content-meta" data-pagefind-ignore>
                {readingTime > 0 && (
                  <span className="content-meta-item">
                    {readingTime} min read
                  </span>
                )}
                
                {frontmatter.author && (
                  <span className="content-meta-item">
                    By {frontmatter.author}
                  </span>
                )}
                
                {frontmatter.date && (
                  <span className="content-meta-item">
                    {new Date(frontmatter.date).toLocaleDateString()}
                  </span>
                )}
              </div>

              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <div className="content-tags">
                  {frontmatter.tags.map((tag, index) => (
                    <span key={index} className="content-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Rendered content */}
            <div className="content-body">
              <MarkdocRenderer content={renderable} />
            </div>
          </div>

          {/* Page navigation (prev/next) */}
          <footer className="content-footer">
            <PageNavigation />
  
            {/* Site footer info */}
            <div className="content-footer-info">
              <p className="content-footer-text">
                © {new Date().getFullYear()} {config.metadata.title}
              </p>
              
              <p className="content-footer-powered">
                Powered by <a href="https://www.mordoc.dev/" target="_blank" rel="noopener noreferrer">Mordoc</a>
              </p>
            </div>
          </footer>
        </article>

        {/* Table of contents sidebar */}
        {toc && toc.length > 0 && (
          <aside className="content-toc">
            <TableOfContents toc={toc} />
          </aside>
        )}
      </div>
    </div>
  );
}

export default ContentPage;