/**
 * Header - Site header with logo and navigation
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../client/contexts/ConfigContext';
import { useSearch } from '../client/hooks/useSearch';
import { useTheme } from '../client/contexts/ThemeContext';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  showMobileMenu?: boolean;
}

/**
 * Site header component
 * Two-row layout: top row with logo/search/actions, optional bottom row with navigation
 */
export function Header({ onMobileMenuToggle, showMobileMenu = false }: HeaderProps) {
  const { config } = useConfig();
  const { openSearch } = useSearch();
  const { theme, toggleTheme } = useTheme();
  
  // Track if component has hydrated to avoid SSR mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const hasTopNav = config.navigation.topnav && config.navigation.topnav.length > 0;

  return (
    <header className={`site-header ${hasTopNav ? 'has-nav' : 'no-nav'}`}>
      {/* Top row: Logo, Search, and Actions */}
      <div className="header-top">
        <div className="header-container">
          {/* Mobile menu button (hamburger) - only visible on mobile */}
          {showMobileMenu && onMobileMenuToggle && (
            <button
              className="mobile-menu-button"
              onClick={onMobileMenuToggle}
              aria-label="Open navigation menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </button>
          )}

          {/* Logo and site title */}
          <div className="header-brand">
            <Link to="/" className="header-logo-link">
              {config.assets.logo ? (
                <>
                  <img
                    src={`/assets/${config.assets.logo}`}
                    alt={config.metadata.title}
                    className="header-logo header-logo-light"
                  />
                  <img
                    src={`/assets/${config.assets.logoDark || config.assets.logo}`}
                    alt={config.metadata.title}
                    className="header-logo header-logo-dark"
                  />
                </>
              ) : (
                <span className="header-title">{config.metadata.title}</span>
              )}
            </Link>
          </div>

          {/* Centered search button (full on desktop, icon-only on mobile) */}
          <div className="header-search">
            <button
              className="header-search-button"
              onClick={openSearch}
              aria-label="Open search"
            >
              <svg 
                className="search-icon" 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <span className="search-text">Search...</span>
              <span className="search-shortcut">Ctrl K</span>
            </button>
          </div>

          {/* Right side actions */}
          <div className="header-actions">
            {/* Theme toggle */}
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="theme-icon"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="theme-icon"
                >
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Navigation menu (only rendered if topnav exists) */}
      {hasTopNav && (
        <div className="header-bottom">
          <div className="header-container">
            <nav className="header-nav">
              <ul className="header-nav-list">
                {config.navigation.topnav!.map((item, index) => (
                  <li key={index} className="header-nav-item">
                    {item.path ? (
                      item.external ? (
                        <a
                          href={item.path}
                          className="header-nav-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link to={item.path} className="header-nav-link">
                          {item.label}
                        </Link>
                      )
                    ) : (
                      <span className="header-nav-label">{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;