/**
 * Layout - Main layout wrapper for all pages
 */

import React, { ReactNode } from 'react';
import Header from './Header';
import SideNav from './SideNav';
import { useConfig } from '../client/contexts/ConfigContext';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

/**
 * Main layout component
 */
export function Layout({ children, showSidebar = true }: LayoutProps) {
  const { config } = useConfig();

  return (
    <div className="layout">
      <Header />
      
      <div className="layout-container">
        {showSidebar && config.navigation.sidenav && (
          <aside className="layout-sidebar">
            <SideNav />
          </aside>
        )}
        
        <main className="layout-main">
        <div className="layout-main-inner">
            {children}
          </div>
        </main>
      </div>  
    </div>
  );
}

export default Layout;