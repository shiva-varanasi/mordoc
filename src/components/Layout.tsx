/**
 * Layout - Main layout wrapper for all pages
 */

import React, { ReactNode, useState } from 'react';
import Header from './Header';
import SideNav from './SideNav';
import MobileMenu from './MobileMenu';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const hasSidenav = showSidebar && config.navigation.sidenav;

  return (
    <div className="layout">
      <Header 
        onMobileMenuToggle={hasSidenav ? handleMobileMenuToggle : undefined}
        showMobileMenu={!!hasSidenav}
      />
      
      <div className="layout-container">
        {hasSidenav && (
          <>
            {/* Desktop sidebar */}
            <aside className="layout-sidebar">
              <SideNav />
            </aside>
            
            {/* Mobile menu drawer */}
            <MobileMenu 
              isOpen={isMobileMenuOpen}
              onClose={handleMobileMenuClose}
            />
          </>
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