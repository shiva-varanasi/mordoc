/**
 * SearchModal - Search modal with keyboard shortcuts
 */

import React, { useEffect, useRef } from 'react';
import { useSearch } from '../client/hooks/useSearch';
import { useNavigation } from '../client/hooks/useNavigation';

/**
 * Search modal component
 */
export function SearchModal() {
  const {
    isOpen,
    closeSearch,
    query,
    setQuery,
    results,
    isSearching,
    debouncedSearch,
  } = useSearch();

  const { navigateToPath } = useNavigation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle input change with debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle result click
  const handleResultClick = (url: string) => {
    closeSearch();
    navigateToPath(url);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeSearch();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="search-modal-backdrop" onClick={handleBackdropClick}>
      <div className="search-modal">
        {/* Search input */}
        <div className="search-input-container">
          <span className="search-input-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search documentation..."
            value={query}
            onChange={handleInputChange}
            aria-label="Search"
          />
          <button
            className="search-close-button"
            onClick={closeSearch}
            aria-label="Close search"
          >
            <span className="search-close-icon">✕</span>
          </button>
        </div>

        {/* Search results */}
        <div className="search-results">
          {isSearching ? (
            <div className="search-loading">
              <p>Searching...</p>
            </div>
          ) : query.trim() === '' ? (
            <div className="search-empty">
              <p className="search-empty-text">Start typing to search</p>
              <div className="search-shortcuts">
                <kbd>↑</kbd> <kbd>↓</kbd> to navigate
                <span className="search-separator">•</span>
                <kbd>Enter</kbd> to select
                <span className="search-separator">•</span>
                <kbd>Esc</kbd> to close
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="search-no-results">
              <p>No results found for "{query}"</p>
              <p className="search-help-text">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <ul className="search-results-list">
              {results.map((result) => (
                <li key={result.id} className="search-result-item">
                  <button
                    className="search-result-link"
                    onClick={() => handleResultClick(result.url)}
                  >
                    <div className="search-result-title">{result.title}</div>
                    <div className="search-result-excerpt">{result.excerpt}</div>
                    <div className="search-result-url">{result.url}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Placeholder for Pagefind integration */}
          {query.trim() !== '' && results.length === 0 && !isSearching && (
            <div className="search-notice">
              <p className="search-notice-text">
                💡 Search indexing will be available after running the build process
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="search-footer">
          <span className="search-footer-text">
            Powered by Pagefind
          </span>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;