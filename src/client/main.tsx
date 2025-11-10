/**
 * Client entry point - Hydrates the React app
 */

import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SiteConfig } from '../types/config';
import { ProcessedContent } from '../types/content';

/**
 * Read initial data from server-injected script tags
 */
function getInitialData(): {
  siteConfig: SiteConfig | null;
  initialContent: ProcessedContent | null;
} {
  let siteConfig: SiteConfig | null = null;
  let initialContent: ProcessedContent | null = null;

  // Get site config
  const configScript = document.getElementById('__SITE_CONFIG__');
  if (configScript && configScript.textContent) {
    try {
      siteConfig = JSON.parse(configScript.textContent) as SiteConfig;
    } catch (error) {
      console.error('Failed to parse site config:', error);
    }
  }

  // Get initial content data
  const contentScript = document.getElementById('__CONTENT_DATA__');
  if (contentScript && contentScript.textContent) {
    try {
      initialContent = JSON.parse(contentScript.textContent) as ProcessedContent;
    } catch (error) {
      console.error('Failed to parse content data:', error);
    }
  }

  return { siteConfig, initialContent };
}

/**
 * Initialize and hydrate the app
 */
function initializeApp() {
  const { siteConfig, initialContent } = getInitialData();

  if (!siteConfig) {
    console.error('Site config not found - cannot initialize app');
    return;
  }

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  // Hydrate the React app with BrowserRouter (client-side)
  hydrateRoot(
    rootElement,
    <React.StrictMode>
      <BrowserRouter>
        <App 
          siteConfig={siteConfig} 
          initialContent={initialContent}
          isServerRender={false}
        />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}