/**
 * useSearch hook - Re-export and extend search functionality
 */

import { useCallback, useEffect } from 'react';
import { useSearch as useSearchContext } from '../contexts/SearchContext';

/**
 * Hook for search functionality with keyboard shortcuts
 */
export function useSearch() {
  const searchContext = useSearchContext();

  /**
   * Setup keyboard shortcuts for search
   */
  useEffect(() => {
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
    (() => {
      let timeoutId: NodeJS.Timeout;

      return (query: string, delay: number = 300) => {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          searchContext.search(query);
        }, delay);
      };
    })(),
    [searchContext]
  );

  return {
    ...searchContext,
    debouncedSearch,
  };
}