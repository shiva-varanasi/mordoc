/**
 * ConfigContext - Provides site configuration to the app
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { SiteConfig } from '../../types/config';

interface ConfigContextValue {
  config: SiteConfig;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

interface ConfigProviderProps {
  config: SiteConfig;
  children: ReactNode;
}

/**
 * ConfigProvider - Wraps the app with site configuration
 */
export function ConfigProvider({ config, children }: ConfigProviderProps) {
  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * useConfig - Hook to access site configuration
 */
export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext);
  
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  
  return context;
}