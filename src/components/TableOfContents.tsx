/**
 * TableOfContents - Displays page headings for quick navigation
 */

import React, { useEffect, useState } from 'react';
import { TableOfContents as TocType, TocEntry } from '../types/content';

interface TableOfContentsProps {
  toc: TocType;
}

/**
 * Table of contents component
 */
export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  

  useEffect(() => {
    // Get header height from CSS variable for consistent spacing
    const headerHeightRem = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--header-height')
    );
    // Get actual root font size instead of assuming 16px
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const headerHeightPx = headerHeightRem * rootFontSize;
    
    // Track which heading is currently visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        // Adjust viewport to account for fixed header and focus on content area
        rootMargin: `-${headerHeightPx}px 0px -80% 0px`,
      }
    );

    // Observe all headings
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    console.log('headings inside table of contents: ', headings);
    headings.forEach((heading) => observer.observe(heading));
    console.log('toc inside table of contents: ', toc);

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [toc]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    console.log('element inside table of contents: ', element);
    if (element) {
      // Get header height from CSS variable
      const headerHeightRem = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height')
      );
      // Get actual root font size instead of assuming 16px
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const headerHeightPx = headerHeightRem * rootFontSize;
      
      // Calculate scroll position accounting for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeightPx;
      
      // Scroll to element with smooth animation
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveId(id);
    }
  };

  return (
    <nav className="toc">
      <h4 className="toc-title">On this page</h4>
      <ul className="toc-list">
        {toc.map((entry) => (
          <TocItem
            key={entry.id}
            entry={entry}
            activeId={activeId}
            onItemClick={handleClick}
          />
        ))}
      </ul>
    </nav>
  );
}

interface TocItemProps {
  entry: TocEntry;
  activeId: string;
  onItemClick: (id: string) => void;
}

/**
 * Individual TOC item (recursive for nested headings)
 */
function TocItem({ entry, activeId, onItemClick }: TocItemProps) {
  const isActive = entry.id === activeId;
  const hasChildren = entry.children && entry.children.length > 0;

  return (
    <li className={`toc-item toc-item-level-${entry.level}`}>
      <a
        href={`#${entry.id}`}
        className={`toc-link ${isActive ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          onItemClick(entry.id);
        }}
      >
        {entry.text}
      </a>

      {hasChildren && (
        <ul className="toc-sublist">
          {entry.children!.map((child) => (
            <TocItem
              key={child.id}
              entry={child}
              activeId={activeId}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default TableOfContents;