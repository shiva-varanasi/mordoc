/**
 * Search modal styles
 * Full-screen search overlay with results
 */

import { GlobalVariables } from '../types';
import { darkMode, mediaQuery } from '../utils';

export class SearchModalStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(): string {
    
    return `/* Search Modal */
.search-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  padding-left: ${this.globalVars.spacingXl};
  padding-right: ${this.globalVars.spacingXl};
  padding-bottom: ${this.globalVars.spacingXl};
  animation: fadeIn 0.15s ease-out;
}

${darkMode(`  .search-modal-backdrop {
    background: rgba(0, 0, 0, 0.8);
  }`)}


@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-modal {
  background: ${this.globalVars.backgroundColorLight};
  border-radius: ${this.globalVars.borderRadiusLg};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 42rem;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
  border: 1px solid ${this.globalVars.borderColorLight};
}

${darkMode(`  .search-modal {
    background: ${this.globalVars.backgroundColorDark};
    border-color: ${this.globalVars.borderColorDark};
  }`)}

.search-input-container {
  display: flex;
  align-items: center;
  gap: ${this.globalVars.spacingSm};
  padding: ${this.globalVars.spacingMd};
  border-bottom: 1px solid ${this.globalVars.borderColorLight};
  flex-shrink: 0;
}

${darkMode(`  .search-input-container {
    border-bottom-color: ${this.globalVars.borderColorDark};
  }`)}

.search-input-icon {
  width: 20px;
  height: 20px;
  color: ${this.globalVars.textSecondaryLight};
  flex-shrink: 0;
}

${darkMode(`  .search-input-icon {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: ${this.globalVars.fontSizeBase};
  color: ${this.globalVars.textPrimaryLight};
  outline: none;
}

${darkMode(`  .search-input {
    color: ${this.globalVars.textPrimaryDark};
  }`)}

.search-input::placeholder {
  color: ${this.globalVars.textSecondaryLight};
  opacity: 0.6;
}

${darkMode(`  .search-input::placeholder {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.search-close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: ${this.globalVars.spacingSm};
  color: ${this.globalVars.textSecondaryLight};
  border-radius: ${this.globalVars.borderRadiusSm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

${darkMode(`  .search-close-button {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.search-close-button:hover {
  background: ${this.globalVars.surfaceColorLight};
  color: ${this.globalVars.textPrimaryLight};
}

${darkMode(`  .search-close-button:hover {
    background: ${this.globalVars.surfaceColorDark};
    color: ${this.globalVars.textPrimaryDark};
  }`)}


.search-close-icon {
  font-size: ${this.globalVars.fontSizeXl};
  line-height: 1;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: ${this.globalVars.spacingMd};
  min-height: 0;
}

.search-results-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.search-result-item {
  margin-bottom: ${this.globalVars.spacingSm};
}

.search-result-link {
  display: block;
  padding: ${this.globalVars.spacingMd};
  background: ${this.globalVars.surfaceColorLight};
  border-radius: ${this.globalVars.borderRadiusMd};
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

${darkMode(`  .search-result-link {
    background: ${this.globalVars.surfaceColorDark};
  }`)}

.search-result-link.selected {
  border-color: ${this.globalVars.primaryColorLight};
  background: ${this.globalVars.backgroundColorLight};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

${darkMode(`  .search-result-link.selected {
    border-color: ${this.globalVars.primaryColorDark};
    background: ${this.globalVars.backgroundColorDark};
  }`)}

.search-result-link:hover,
.search-result-link:focus {
  border-color: ${this.globalVars.primaryColorLight};
  background: ${this.globalVars.backgroundColorLight};
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

${darkMode(`  .search-result-link:hover,
  .search-result-link:focus {
    border-color: ${this.globalVars.primaryColorDark};
    background: ${this.globalVars.backgroundColorDark};
  }`)}

.search-result-title {
  font-weight: ${this.globalVars.fontWeightMedium};
  color: ${this.globalVars.textPrimaryLight};
  margin-bottom: ${this.globalVars.spacingXs};
  font-size: ${this.globalVars.fontSizeBase};
}

${darkMode(`  .search-result-title {
    color: ${this.globalVars.textPrimaryDark};
  }`)}

.search-result-excerpt {
  font-size: ${this.globalVars.fontSizeSm};
  color: ${this.globalVars.textSecondaryLight};
  line-height: 1.5;
  margin-bottom: ${this.globalVars.spacingXs};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

${darkMode(`  .search-result-excerpt {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.search-result-url {
  font-size: ${this.globalVars.fontSizeSm};
  color: ${this.globalVars.textSecondaryLight};
  opacity: 0.7;
}

${darkMode(`  .search-result-url {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.search-loading,
.search-empty,
.search-no-results,
.search-notice {
  text-align: center;
  padding: ${this.globalVars.spacingMd};
  color: ${this.globalVars.textSecondaryLight};
}

${darkMode(`  .search-loading,
  .search-empty,
  .search-no-results,
  .search-notice {
    color: ${this.globalVars.textSecondaryDark};
  }`)}


.search-empty-text,
.search-help-text,
.search-notice-text {
  margin: 0;
}

.search-shortcuts {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${this.globalVars.spacingSm};
  flex-wrap: wrap;
  font-size: ${this.globalVars.fontSizeSm};
  color: ${this.globalVars.textSecondaryLight};
}

${darkMode(`  .search-shortcuts {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.search-shortcuts kbd {
  padding: 0.25rem 0.5rem;
  background: ${this.globalVars.surfaceColorLight};
  border: 1px solid ${this.globalVars.borderColorLight};
  border-radius: ${this.globalVars.borderRadiusSm};
  font-family: ${this.globalVars.fontFamilyMono};
  font-size: ${this.globalVars.fontSizeXs};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

${darkMode(`  .search-shortcuts kbd {
    background: ${this.globalVars.surfaceColorDark};
    border-color: ${this.globalVars.borderColorDark};
  }`)}

.search-separator {
  color: ${this.globalVars.textSecondaryLight};
  opacity: 0.5;
}

${darkMode(`  .search-separator {
    color: ${this.globalVars.textSecondaryDark};
  }`)}


${mediaQuery('md', `  .search-modal-backdrop {
    padding-top: 5vh;
  }

  .search-modal {
    width: 95%;
    max-height: 90vh;
  }

  .search-input-container {
    padding: ${this.globalVars.spacingMd};
  }

  .search-input {
    font-size: ${this.globalVars.fontSizeBase};
  }`)}`;
  }
}

