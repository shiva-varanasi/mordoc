/**
 * useContent hook - Fetches and manages content data
 */

import { useCallback, useEffect } from 'react';
import { useContent as useContentContext } from '../contexts/ContentContext';
import { ProcessedContent, ContentDataFile } from '../../types/content';

/**
 * Hook for fetching content data for SPA navigation
 */
export function useContentData() {
  const { setCurrentContent, setIsLoading, setError } = useContentContext();

  /**
   * Fetch content data from JSON file
   */
  const fetchContent = useCallback(
    async (path: string): Promise<ProcessedContent | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Build content data path
        // For default language pages: /content-data/slug.json
        // For other languages: /content-data/lang/slug.json
        const contentDataPath = path === '/' 
          ? '/content-data/index.json'
          : `${path.replace(/\/$/, '')}.json`.replace(/^\//, '/content-data/');

        // Fetch content data
        const response = await fetch(contentDataPath);

        if (!response.ok) {
          // Special handling for 404
          if (response.status === 404) {
            throw new Error('NOT_FOUND');
          }
          throw new Error(`Failed to fetch content: ${response.status}`);
        }

        const data = await response.json() as ContentDataFile;

        // Convert to ProcessedContent
        const content: ProcessedContent = {
          metadata: data.metadata,
          renderable: data.renderable,
        };

        setCurrentContent(content);
        setIsLoading(false);

        return content;
      } catch (error) {
        const err = error as Error;
        setError(err);
        setIsLoading(false);
        console.error('Failed to fetch content:', err);
        return null;
      }
    },
    [setCurrentContent, setIsLoading, setError]
  );

  /**
   * Prefetch content for a given path (for hover/link preloading)
   */
  const prefetchContent = useCallback(async (path: string): Promise<void> => {
    try {
      const contentDataPath = path === '/' 
        ? '/content-data/index.json'
        : `${path.replace(/\/$/, '')}.json`.replace(/^\//, '/content-data/');

      // Use link prefetch
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = contentDataPath;
      document.head.appendChild(link);
    } catch (error) {
      // Silent fail for prefetch
      console.warn('Prefetch failed:', error);
    }
  }, []);

  return {
    fetchContent,
    prefetchContent,
  };
}