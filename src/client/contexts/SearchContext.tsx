/**
 * SearchContext - Manages search state and functionality
 */

import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';

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

// Pagefind types (minimal - Pagefind doesn't ship with TypeScript types)
interface PagefindResult {
  id: string;
  score: number;
  words: number[];
  data: () => Promise<PagefindResultData>;
}

interface PagefindResultData {
  url: string;
  content: string;
  word_count: number;
  filters: Record<string, string[]>;
  meta: {
    title?: string;
    image?: string;
  };
  anchors: Array<{
    element: string;
    id: string;
    text: string;
    location: number;
  }>;
  weighted_locations: Array<{
    weight: number;
    balanced_score: number;
    location: number;
  }>;
  locations: number[];
  raw_content: string;
  raw_url: string;
  excerpt: string;
  sub_results: Array<{
    title: string;
    url: string;
    weighted_locations: number[];
    locations: number[];
    excerpt: string;
  }>;
}

interface PagefindSearchResults {
  results: PagefindResult[];
  unfilteredResultCount: number;
  filters: Record<string, Record<string, number>>;
  totalFilters: Record<string, Record<string, number>>;
  timings: {
    preload: number;
    search: number;
    total: number;
  };
}

interface PagefindInstance {
  options?: (config: { excerptLength?: number }) => void;
  search: (query: string, options?: Record<string, unknown>) => Promise<PagefindSearchResults>;
  debouncedSearch: (query: string, options?: Record<string, unknown>) => Promise<PagefindSearchResults>;
  preload: (query: string) => Promise<void>;
  init: () => Promise<void>;
}

/**
 * SearchProvider - Manages search state and modal
 */
export function SearchProvider({ children }: SearchProviderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Cache Pagefind instance to avoid re-importing
  const pagefindRef = useRef<PagefindInstance | null>(null);
  const pagefindLoadingRef = useRef<Promise<PagefindInstance | null> | null>(null);

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

  /**
   * Load Pagefind instance (lazy loading)
   */
  const loadPagefind = useCallback(async (): Promise<PagefindInstance | null> => {
    // Return cached instance if available
    if (pagefindRef.current) {
      return pagefindRef.current;
    }

    // Return existing loading promise if already loading
    if (pagefindLoadingRef.current) {
      return pagefindLoadingRef.current;
    }

    // Start loading Pagefind
    pagefindLoadingRef.current = (async () => {
      try {
        // Dynamically import Pagefind (generated at build time)
        const pagefindPath = '/pagefind/pagefind.js';
        const pagefindModule: any = await import(
          /* webpackIgnore: true */
          /* @vite-ignore */
          pagefindPath
        );
        
        const pagefind = (pagefindModule.default || pagefindModule) as PagefindInstance;

        // Configure Pagefind options (must be called before init)
        if (pagefind.options) {
          pagefind.options({
            excerptLength: 10, // Set your desired excerpt length in words
          });
        }

        // Initialize Pagefind (optional, but recommended)
        if (pagefind.init) {
          await pagefind.init();
        }

        // Cache the instance
        pagefindRef.current = pagefind;
        return pagefind;
      } catch (error) {
        console.error('Failed to load Pagefind:', error);
        console.warn('Search functionality is not available. Run "mordoc build" to generate search index.');
        return null;
      } finally {
        // Clear loading promise
        pagefindLoadingRef.current = null;
      }
    })();

    return pagefindLoadingRef.current;
  }, []);

  /**
   * Perform search using Pagefind
   */
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
  
    setIsSearching(true);
    setQuery(searchQuery);
  
    try {
      const pagefind = await loadPagefind();
      
      if (!pagefind) {
        setResults([]);
        return;
      }
  
      const trimmedQuery = searchQuery.trim();
  
      // Use only broad search - it has proper scoring
      // Pagefind's exact phrase matching returns score=1 for all matches (binary)
      const searchResults = await pagefind.search(trimmedQuery);
  
      // Process results
      const processed = await Promise.all(
        searchResults.results.map(async (result) => {
          const data = await result.data();
          return {
            id: result.id,
            url: data.url,
            title: data.meta.title || 'Untitled',
            excerpt: data.excerpt || '',
            score: result.score,
          };
        })
      );
  
      // Pagefind already sorts by score, but ensure it's sorted descending
      const sortedResults = processed.sort((a, b) => b.score - a.score);
  
      setResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [loadPagefind]);

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