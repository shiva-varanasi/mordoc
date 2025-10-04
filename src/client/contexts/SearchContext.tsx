/**
 * SearchContext - Manages search state and functionality
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface SearchResult {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  score: number;
}

interface SearchContextValue {
  // Search query
  query: string;
  setQuery: (query: string) => void;
  
  // Search results
  results: SearchResult[];
  setResults: (results: SearchResult[]) => void;
  
  // Search modal state
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  
  // Search loading state
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  
  // Perform search
  search: (searchQuery: string) => Promise<void>;
  
  // Clear search
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

/**
 * SearchProvider - Manages search state and modal
 */
export function SearchProvider({ children }: SearchProviderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setQuery(searchQuery);

    try {
      // Pagefind search will be implemented here
      // For now, return empty results
      // TODO: Integrate with Pagefind when SearchIndexer is ready
      
      // Placeholder for Pagefind integration:
      // const pagefind = await import('/pagefind/pagefind.js');
      // const searchResults = await pagefind.search(searchQuery);
      // const processed = await Promise.all(
      //   searchResults.results.map(r => r.data())
      // );
      // setResults(processed);
      
      setResults([]);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const value: SearchContextValue = {
    query,
    setQuery,
    results,
    setResults,
    isOpen,
    openSearch,
    closeSearch,
    toggleSearch,
    isSearching,
    setIsSearching,
    search,
    clearSearch,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

/**
 * useSearch - Hook to access search state and functions
 */
export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  
  return context;
}