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
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // Observe all headings
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [toc]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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