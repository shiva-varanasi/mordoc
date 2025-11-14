/**
 * useSearch hook - Re-export and extend search functionality
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSearch as useSearchContext } from '../contexts/SearchContext';

/**
 * Hook for search functionality with keyboard shortcuts
 */
export function useSearch() {
  const searchContext = useSearchContext();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Setup keyboard shortcuts for search (client-side only)
   */
  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchContext.openSearch();
      }

      // Escape to close search
      if (event.key === 'Escape' && searchContext.isOpen) {
        searchContext.closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchContext]);

  /**
   * Debounced search function
   */
  const debouncedSearch = useCallback(
    (query: string, delay: number = 500) => {
      // Clear existing timeout
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set new timeout
      debounceTimerRef.current = setTimeout(() => {
        searchContext.search(query);
      }, delay);
    },
    [searchContext]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    ...searchContext,
    debouncedSearch,
  };
}