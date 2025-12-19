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
                <img
                  src={`/assets/${config.assets.logo}`}
                  alt={config.metadata.title}
                  className="header-logo"
                />
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
              <span className={`theme-toggle-icon ${isHydrated && theme === 'light' ? 'active' : ''}`}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  stroke="currentColor" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_light)">
                    <path d="M8 1.11133V2.00022" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M12.8711 3.12891L12.2427 3.75735" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M14.8889 8H14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M12.8711 12.8711L12.2427 12.2427" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M8 14.8889V14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M3.12891 12.8711L3.75735 12.2427" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M1.11133 8H2.00022" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M3.12891 3.12891L3.75735 3.75735" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M8.00043 11.7782C10.0868 11.7782 11.7782 10.0868 11.7782 8.00043C11.7782 5.91402 10.0868 4.22266 8.00043 4.22266C5.91402 4.22266 4.22266 5.91402 4.22266 8.00043C4.22266 10.0868 5.91402 11.7782 8.00043 11.7782Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_light">
                      <rect width="16" height="16" fill="white"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </span>
              
              <span className={`theme-toggle-icon ${isHydrated && theme === 'dark' ? 'active' : ''}`}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  stroke="currentColor" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_dark)">
                    <path d="M11.5556 10.4445C8.48717 10.4445 6.00005 7.95743 6.00005 4.88899C6.00005 3.68721 6.38494 2.57877 7.03294 1.66943C4.04272 2.22766 1.77783 4.84721 1.77783 8.0001C1.77783 11.5592 4.66317 14.4445 8.22228 14.4445C11.2196 14.4445 13.7316 12.3948 14.4525 9.62321C13.6081 10.1414 12.6187 10.4445 11.5556 10.4445Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_dark">
                      <rect width="16" height="16" fill="white"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </span>
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