/**
 * ContentContext - Manages current page content and navigation state
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ProcessedContent, ContentMetadata } from '../../types/content';
import { NavigationContext } from '../../types/navigation';

interface ContentContextValue {
  // Current page content
  currentContent: ProcessedContent | null;
  setCurrentContent: (content: ProcessedContent) => void;
  
  // Navigation context (breadcrumbs, page nav, etc.)
  navigationContext: NavigationContext | null;
  setNavigationContext: (navContext: NavigationContext) => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error state
  error: Error | null;
  setError: (error: Error | null) => void;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
  initialContent?: ProcessedContent | null;
  initialNavigationContext?: NavigationContext | null;
}

/**
 * ContentProvider - Manages content and navigation state
 */
export function ContentProvider({ 
  children, 
  initialContent = null,
  initialNavigationContext = null 
}: ContentProviderProps) {
  const [currentContent, setCurrentContent] = useState<ProcessedContent | null>(initialContent);
  const [navigationContext, setNavigationContext] = useState<NavigationContext | null>(
    initialNavigationContext
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const value: ContentContextValue = {
    currentContent,
    setCurrentContent: useCallback((content: ProcessedContent) => {
      setCurrentContent(content);
      setError(null);
    }, []),
    navigationContext,
    setNavigationContext: useCallback((navContext: NavigationContext) => {
      setNavigationContext(navContext);
    }, []),
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

/**
 * useContent - Hook to access content state
 */
export function useContent(): ContentContextValue {
  const context = useContext(ContentContext);
  
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  
  return context;
}