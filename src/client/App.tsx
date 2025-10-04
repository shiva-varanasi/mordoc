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
import Layout from '../components/Layout';
import ContentPage from '../components/ContentPage';
import SearchModal from '../components/SearchModal';

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
    const navEntries = window.performance.getEntriesByType('navigation');
    const isInitialLoad = navEntries.length > 0 && 
      (navEntries[0] as PerformanceNavigationTiming)?.type === 'navigate';
    
    if (!isInitialLoad) {
      fetchContent(location.pathname);
    }
  }, [location.pathname, fetchContent]);

  return (
    <>
      <Layout>
        <Routes>
          <Route path="*" element={<ContentPage />} />
        </Routes>
      </Layout>
      
      {/* Search modal (rendered outside layout) */}
      <SearchModal />
    </>
  );
}

export default App;