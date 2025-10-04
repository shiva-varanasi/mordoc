/**
 * Header - Site header with logo and navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../client/contexts/ConfigContext';
import { useSearch } from '../client/hooks/useSearch';

/**
 * Site header component
 */
export function Header() {
  const { config } = useConfig();
  const { openSearch } = useSearch();

  return (
    <header className="site-header">
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

        {/* Top navigation */}
        {config.navigation.topnav && config.navigation.topnav.length > 0 && (
          <nav className="header-nav">
            <ul className="header-nav-list">
              {config.navigation.topnav.map((item, index) => (
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
        )}

        {/* Search button */}
        <div className="header-actions">
          <button
            className="header-search-button"
            onClick={openSearch}
            aria-label="Open search"
          >
            <span className="search-icon">🔍</span>
            <span className="search-shortcut">⌘K</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;