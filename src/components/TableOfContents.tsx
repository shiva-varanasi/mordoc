/**
 * TableOfContents - Displays page headings for quick navigation
 */

import React, { useEffect, useState } from 'react';
import { TableOfContents as TocType, TocEntry } from '../types/content';

interface TableOfContentsProps {
  toc: TocType;
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isScrolling, setIsScrolling] = useState(false);
  
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          setIsScrolling(true);
          setActiveId(id);
          scrollToElement(element);
          
          setTimeout(() => {
            setIsScrolling(false);
          }, 1000);
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!isScrolling) {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [toc, isScrolling]);

  const scrollToElement = (element: HTMLElement) => {
    const scrollContainer = document.querySelector('.layout-main') as HTMLElement | null;
    const offset = 100;

    if (scrollContainer) {
      const containerTop = scrollContainer.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const scrollOffset = scrollContainer.scrollTop + (elementTop - containerTop) - offset;

      scrollContainer.scrollTo({
        top: scrollOffset,
        behavior: 'smooth',
      });
    } else {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    setIsScrolling(true);
    setActiveId(id);
    
    scrollToElement(element);
    window.history.pushState(null, '', `#${id}`);
    
    setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.slice(1);
        handleClick(id);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const flattenToc = (entries: TocEntry[]): TocEntry[] => {
    const result: TocEntry[] = [];
    const flatten = (items: TocEntry[]) => {
      items.forEach((item) => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(entries);
    return result;
  };

  const flatToc = flattenToc(toc);

  return (
    <nav className="toc">
      <p className="toc-title">On this page</p>
      <ul className="toc-list">
        {flatToc.map((entry) => (
          <li key={entry.id}>
            <button
              className={`toc-link ${entry.id === activeId ? 'active' : ''}`}
              data-level={entry.level}
              onClick={() => handleClick(entry.id)}
            >
              {entry.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;