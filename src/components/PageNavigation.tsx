/**
 * PageNavigation - Previous/Next page links
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../client/contexts/ContentContext';

/**
 * Page navigation component (prev/next links)
 */
export function PageNavigation() {
  const { navigationContext } = useContent();

  if (!navigationContext || !navigationContext.pageNavigation) {
    return null;
  }

  const { prev, next } = navigationContext.pageNavigation;

  // Don't render if no prev or next
  if (!prev && !next) {
    return null;
  }

  return (
    <nav className="page-navigation" aria-label="Page navigation">
      <div className="page-nav-container">
        {prev ? (
          <Link to={prev.path} className="page-nav-link page-nav-prev">
            <span className="page-nav-direction">← Previous</span>
            <span className="page-nav-label">{prev.label}</span>
          </Link>
        ) : (
          <div className="page-nav-spacer" />
        )}

        {next ? (
          <Link to={next.path} className="page-nav-link page-nav-next">
            <span className="page-nav-direction">Next →</span>
            <span className="page-nav-label">{next.label}</span>
          </Link>
        ) : (
          <div className="page-nav-spacer" />
        )}
      </div>
    </nav>
  );
}

export default PageNavigation;