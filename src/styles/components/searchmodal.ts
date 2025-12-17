/**
 * Search modal styles
 * Full-screen search overlay with results
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, mediaQuery } from '../utils';

interface SearchModalVariables {
  // Customizable
  backdropBackground: string;
  modalBackground: string;
  modalBorderColor: string;
  modalBorderRadius: string;
  inputColor: string;
  inputPlaceholderColor: string;
  resultHoverBackground: string;
  resultSelectedBorderColor: string;
  resultTitleColor: string;
  resultExcerptColor: string;
  resultUrlColor: string;
}

export class SearchModalStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: SearchModalVariables = {
      backdropBackground: 'rgba(0, 0, 0, 0.6)',
      modalBackground: this.globalVars.backgroundColorLight,
      modalBorderColor: this.globalVars.borderColorLight,
      modalBorderRadius: this.globalVars.borderRadiusLg,
      inputColor: this.globalVars.textPrimaryLight,
      inputPlaceholderColor: this.globalVars.textSecondaryLight,
      resultHoverBackground: this.globalVars.backgroundColorLight,
      resultSelectedBorderColor: this.globalVars.primaryColorLight,
      resultTitleColor: this.globalVars.textPrimaryLight,
      resultExcerptColor: this.globalVars.textSecondaryLight,
      resultUrlColor: this.globalVars.textSecondaryLight,
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'backdropBackground', 'modalBackground', 'modalBorderColor', 'modalBorderRadius',
        'inputColor', 'inputPlaceholderColor', 'resultHoverBackground',
        'resultSelectedBorderColor', 'resultTitleColor', 'resultExcerptColor', 'resultUrlColor'
      ]
    );
    
    return `/* Search Modal */
.search-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${vars.backdropBackground};
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
  background: ${vars.modalBackground};
  border-radius: ${vars.modalBorderRadius};
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 42rem;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
  border: 1px solid ${vars.modalBorderColor};
}

.search-input-container {
  display: flex;
  align-items: center;
  gap: ${this.globalVars.spacingSm};
  padding: ${this.globalVars.spacingMd};
  border-bottom: 1px solid ${vars.modalBorderColor};
  flex-shrink: 0;
}

.search-input-icon {
  width: 20px;
  height: 20px;
  color: ${vars.inputPlaceholderColor};
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: ${this.globalVars.fontSizeBase};
  color: ${vars.inputColor};
  outline: none;
}

.search-input::placeholder {
  color: ${vars.inputPlaceholderColor};
  opacity: 0.6;
}

.search-close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: ${this.globalVars.spacingSm};
  color: ${vars.inputPlaceholderColor};
  border-radius: ${this.globalVars.borderRadiusSm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-close-button:hover {
  background: ${this.globalVars.surfaceColorLight};
  color: ${vars.inputColor};
}

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

.search-result-link.selected {
  border-color: ${vars.resultSelectedBorderColor};
  background: ${vars.resultHoverBackground};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.search-result-link:hover,
.search-result-link:focus {
  border-color: ${vars.resultSelectedBorderColor};
  background: ${vars.resultHoverBackground};
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.search-result-title {
  font-weight: ${this.globalVars.fontWeightMedium};
  color: ${vars.resultTitleColor};
  margin-bottom: ${this.globalVars.spacingXs};
  font-size: ${this.globalVars.fontSizeBase};
}

.search-result-excerpt {
  font-size: ${this.globalVars.fontSizeSm};
  color: ${vars.resultExcerptColor};
  line-height: 1.5;
  margin-bottom: ${this.globalVars.spacingXs};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.search-result-url {
  font-size: ${this.globalVars.fontSizeSm};
  color: ${vars.resultUrlColor};
  opacity: 0.7;
}

.search-loading,
.search-empty,
.search-no-results,
.search-notice {
  text-align: center;
  padding: ${this.globalVars.spacingMd};
  color: ${vars.resultExcerptColor};
}

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
  color: ${vars.resultExcerptColor};
}

.search-shortcuts kbd {
  padding: 0.25rem 0.5rem;
  background: ${this.globalVars.surfaceColorLight};
  border: 1px solid ${vars.modalBorderColor};
  border-radius: ${this.globalVars.borderRadiusSm};
  font-family: ${this.globalVars.fontFamilyMono};
  font-size: ${this.globalVars.fontSizeXs};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-separator {
  color: ${vars.resultExcerptColor};
  opacity: 0.5;
}

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

