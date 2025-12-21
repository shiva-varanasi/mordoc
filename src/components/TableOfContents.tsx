/**
 * TableOfContents - Displays page headings for quick navigation
 */

import React, { useEffect, useState, useRef } from 'react';
import { TableOfContents as TocType, TocEntry } from '../types/content';

interface TableOfContentsProps {
  toc: TocType;
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle initial page load with hash in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        // Delay to ensure DOM is fully rendered
        setTimeout(() => {
          setIsScrolling(true);
          setActiveId(id);
          scrollToElement(element);
          startScrollEndDetection();
        }, 100);
      }
    }
  }, []);

  // Track which heading is currently visible using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Only update during manual scrolling, not programmatic scrolling
        if (!isScrolling) {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        }
      },
      {
        // Focus on viewport area below header and above bottom 80%
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

  /**
   * Detects when smooth scrolling completes using debounced scroll events.
   * Re-enables IntersectionObserver 150ms after the last scroll event.
   * This approach works for any scroll distance, unlike fixed timeouts.
   */
  const startScrollEndDetection = () => {
    const scrollContainer = document.querySelector('.layout-main') as HTMLElement | null;
    
    const handleScrollEnd = () => {
      // Clear previous timeout on each scroll event (debouncing)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Wait 150ms after last scroll event to consider scrolling complete
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        
        // Clean up event listener
        if (scrollContainer) {
          scrollContainer.removeEventListener('scroll', handleScrollEnd);
        } else {
          window.removeEventListener('scroll', handleScrollEnd);
        }
      }, 150);
    };
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScrollEnd);
    } else {
      window.addEventListener('scroll', handleScrollEnd);
    }
  };

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    // Disable IntersectionObserver to prevent TOC from animating through sections
    setIsScrolling(true);
    // Set active immediately so TOC highlights the target section right away
    setActiveId(id);
    
    scrollToElement(element);
    window.history.pushState(null, '', `#${id}`);
    
    // Start listening for scroll completion
    startScrollEndDetection();
  };

  // Handle browser back/forward navigation
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
      // Cleanup timeout on unmount to prevent memory leaks
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
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