/**
 * SearchModal - Search modal with keyboard shortcuts
 */

import React, { useEffect, useRef, useState } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

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

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultClick(results[selectedIndex].url);
        }
        break;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="search-modal-backdrop" onClick={handleBackdropClick}>
      <div className="search-modal" onKeyDown={handleKeyDown}>
        {/* Search input */}
        <div className="search-input-container">
          <svg 
              className="search-input-icon" 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search documentation..."
            value={query}
            onChange={handleInputChange}
            aria-label="Search"
          />
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
              {results.map((result, index) => (
                <li key={result.id} className="search-result-item">
                  <button
                    className={`search-result-link ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => handleResultClick(result.url)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="search-result-title">{result.title}</div>
                    <div className="search-result-excerpt" 
                         dangerouslySetInnerHTML={{ __html: result.excerpt }} 
                    />
                    <div className="search-result-url">{result.url}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;