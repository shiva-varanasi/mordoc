/**
 * useNavigation hook - Navigation helpers and utilities
 */

import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContentData } from './useContent';
import { useContent } from '../contexts/ContentContext';

/**
 * Hook for handling navigation with SPA content loading
 */
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchContent, prefetchContent } = useContentData();
  const { setIsLoading, setError } = useContent();

  /**
   * Navigate to a path and load its content
   */
  const navigateToPath = useCallback(
    async (path: string) => {
      // Don't navigate if already on this path
      if (location.pathname === path) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch content first
        const content = await fetchContent(path);

        if (content) {
          // Navigate to the NORMALIZED path (same as what fetchContent uses)
          const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
          navigate(normalizedPath);
          
          // Scroll to top
          window.scrollTo(0, 0);
        }
      } catch (error) {
        setError(error as Error);
        setIsLoading(false);
      }
    },
    [location.pathname, navigate, fetchContent, setIsLoading, setError]
  );

  /**
   * Handle link click for SPA navigation
   */
  const handleLinkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Check if it's an external link
      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      
      // Check if it's a hash link (anchor)
      const isHash = href.startsWith('#');

      // Let browser handle external links and hash links
      if (isExternal || isHash) {
        return;
      }

      // Prevent default navigation
      event.preventDefault();

      // Use SPA navigation
      navigateToPath(href);
    },
    [navigateToPath]
  );

  /**
   * Prefetch content on link hover
   */
  const handleLinkHover = useCallback(
    (href: string) => {
      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      const isHash = href.startsWith('#');

      if (!isExternal && !isHash) {
        prefetchContent(href);
      }
    },
    [prefetchContent]
  );

  /**
   * Get current language from path
   */
  const getCurrentLanguage = useCallback((): string => {
    const parts = location.pathname.split('/').filter(Boolean);
    
    // Check if first segment is a language code (2-3 letters)
    if (parts.length > 0 && /^[a-z]{2,3}$/i.test(parts[0])) {
      return parts[0];
    }
    
    return 'en'; // Default language
  }, [location.pathname]);

  /**
   * Build language-specific path
   */
  const buildLanguagePath = useCallback(
    (slug: string, language: string, defaultLanguage: string = 'en'): string => {
      if (language === defaultLanguage) {
        return slug === 'index' || slug === '' ? '/' : `/${slug}`;
      }
      
      return slug === 'index' || slug === '' ? `/${language}` : `/${language}/${slug}`;
    },
    []
  );

  return {
    navigateToPath,
    handleLinkClick,
    handleLinkHover,
    getCurrentLanguage,
    buildLanguagePath,
    currentPath: location.pathname,
  };
}