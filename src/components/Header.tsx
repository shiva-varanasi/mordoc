/**
 * Header - Site header with logo and navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../client/contexts/ConfigContext';
import { useSearch } from '../client/hooks/useSearch';

/**
 * Site header component
 * Two-row layout: top row with logo/search/actions, optional bottom row with navigation
 */
export function Header() {
  const { config } = useConfig();
  const { openSearch } = useSearch();

  const hasTopNav = config.navigation.topnav && config.navigation.topnav.length > 0;

  return (
    <header className={`site-header ${hasTopNav ? 'has-nav' : 'no-nav'}`}>
      {/* Top row: Logo, Search, and Actions */}
      <div className="header-top">
        <div className="header-container">
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

          {/* Centered search button */}
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
            {/* Reserved for future additions */}
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