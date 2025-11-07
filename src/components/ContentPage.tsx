/**
 * ContentPage - Main content page component
 */

import React from 'react';
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

  // Loading state
  if (isLoading) {
    return (
      <div className="content-page">
        <div className="content-loading">
          <p>Loading...</p>
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
          {/* Page header */}
          <header className="content-header">
            <h1 className="content-title">{frontmatter.title}</h1>
            
            {frontmatter.description && (
              <p className="content-description">{frontmatter.description}</p>
            )}
            
            <div className="content-meta">
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
          <div className="content-body" data-pagefind-body>
            <MarkdocRenderer content={renderable} />
          </div>

          {/* Page navigation (prev/next) */}
          <footer className="content-footer">
            <PageNavigation />
  
            {/* Site footer info */}
            <div className="content-footer-info">
              <p className="footer-text">
                © {new Date().getFullYear()} {config.metadata.title}
              </p>
              
              <p className="content-footer-powered">
                Powered by <a href="https://github.com/yourusername/mordoc" target="_blank" rel="noopener noreferrer">Mordoc</a>
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