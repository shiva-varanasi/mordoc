/**
 * Main App component - Sets up routing and providers
 */

import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ConfigProvider } from './contexts/ConfigContext';
import { ContentProvider } from './contexts/ContentContext';
import { SearchProvider } from './contexts/SearchContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SiteConfig } from '../types/config';
import { ProcessedContent } from '../types/content';
import { useContentData } from './hooks/useContent';
import Layout from '../components/Layout';
import ContentPage from '../components/ContentPage';
import SearchModal from '../components/SearchModal';

interface AppProps {
  siteConfig: SiteConfig;
  initialContent: ProcessedContent | null;
  isServerRender?: boolean;
}

/**
 * Main App component
 * Works on both server (SSR) and client (hydration + SPA)
 */
function App({ siteConfig, initialContent, isServerRender = false }: AppProps) {
  return (
    <ConfigProvider config={siteConfig}>
      <ThemeProvider>
        <ContentProvider initialContent={initialContent}>
          <SearchProvider>
            <AppContent isServerRender={isServerRender} />
          </SearchProvider>
        </ContentProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

/**
 * App content with routing (inside providers)
 */
function AppContent({ isServerRender }: { isServerRender: boolean }) {
  const location = useLocation();
  const { fetchContent } = useContentData();
  const hasHydratedRef = React.useRef(false);

  // Scroll to top on route change (unless there's a hash)
  useEffect(() => {
    if (!window.location.hash) {
      // Check if using a scroll container or window
      const scrollContainer = document.querySelector('.layout-main') as HTMLElement | null;
      
      if (scrollContainer) {
        scrollContainer.scrollTo(0, 0);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [location.pathname]); // Runs whenever the path changes

  // Fetch content when route changes (for SPA navigation)
  useEffect(() => {
    // Skip on server render
    if (isServerRender) return;

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true; // skip only the initial hydration run
      return;
    }

    fetchContent(location.pathname);
  }, [location.pathname, fetchContent, isServerRender]);

  return (
    <>
      <Layout>
        <Routes>
          <Route path="*" element={<ContentPage />} />
        </Routes>
      </Layout>
      
      {/* Search modal only renders on client */}
      {!isServerRender && <SearchModal />}
    </>
  );
}

export default App;