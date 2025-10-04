/**
 * Main App component - Sets up routing and providers
 */

import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ConfigProvider } from './contexts/ConfigContext';
import { ContentProvider } from './contexts/ContentContext';
import { SearchProvider } from './contexts/SearchContext';
import { SiteConfig } from '../types/config';
import { ProcessedContent } from '../types/content';
import { useContentData } from './hooks/useContent';

interface AppProps {
  siteConfig: SiteConfig;
  initialContent: ProcessedContent | null;
}

/**
 * Main App component
 */
function App({ siteConfig, initialContent }: AppProps) {
  return (
    <ConfigProvider config={siteConfig}>
      <ContentProvider initialContent={initialContent}>
        <SearchProvider>
          <AppContent />
        </SearchProvider>
      </ContentProvider>
    </ConfigProvider>
  );
}

/**
 * App content with routing (inside providers)
 */
function AppContent() {
  const location = useLocation();
  const { fetchContent } = useContentData();

  // Fetch content when route changes (for SPA navigation)
  useEffect(() => {
    // Only fetch if not initial load (initial content is already injected)
    const isInitialLoad = (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'navigate';
    
    if (!isInitialLoad) {
      fetchContent(location.pathname);
    }
  }, [location.pathname, fetchContent]);

  return (
    <Routes>
      <Route path="*" element={<PageRenderer />} />
    </Routes>
  );
}

/**
 * Page renderer - Renders the current page content
 */
function PageRenderer() {
  // Placeholder for now - will be replaced with actual Layout component
  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h1>Mordoc App</h1>
        <p>Content will be rendered here</p>
        <p>This will be replaced with Layout and content components</p>
      </div>
    </div>
  );
}

export default App;