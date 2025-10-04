/**
 * Breadcrumbs - Shows navigation path to current page
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from '../client/contexts/ContentContext';
import { slugify } from '../utils/slugify';

/**
 * Breadcrumbs component
 */
export function Breadcrumbs() {
  const location = useLocation();
  const { currentContent } = useContent();

  // Build breadcrumb items from path
  const pathSegments = location.pathname
    .split('/')
    .filter(Boolean);

  // Remove language prefix if present (e.g., "en", "es")
  const isLanguagePrefix = pathSegments.length > 0 && /^[a-z]{2,3}$/i.test(pathSegments[0]);
  const contentSegments = isLanguagePrefix ? pathSegments.slice(1) : pathSegments;

  // Build breadcrumb trail
  const breadcrumbs = [
    { label: 'Home', path: '/' },
  ];

  let currentPath = isLanguagePrefix ? `/${pathSegments[0]}` : '';

  contentSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Use actual page title if this is the last segment and we have content
    const isLast = index === contentSegments.length - 1;
    const label = isLast && currentContent
      ? currentContent.metadata.frontmatter.title
      : formatSegment(segment);

    breadcrumbs.push({
      label,
      path: currentPath,
    });
  });

  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={crumb.path} className="breadcrumbs-item">
              {isLast ? (
                <span className="breadcrumbs-current" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link to={crumb.path} className="breadcrumbs-link">
                    {crumb.label}
                  </Link>
                  <span className="breadcrumbs-separator">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Format URL segment to readable label
 */
function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default Breadcrumbs;