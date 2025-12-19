/**
 * Search modal styles
 * Full-screen search overlay with results
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, darkMode, mediaQuery } from '../utils';

interface SearchModalVariables {
  // Customizable
  backdropBackground: string;
  backdropBackgroundDark: string;
  modalBackground: string;
  modalBackgroundDark: string;
  modalBorderColor: string;
  modalBorderColorDark: string;
  modalBorderRadius: string;
  inputColor: string;
  inputColorDark: string;
  inputPlaceholderColor: string;
  inputPlaceholderColorDark: string;
  resultBackground: string;
  resultBackgroundDark: string;
  resultHoverBackground: string;
  resultHoverBackgroundDark: string;
  resultSelectedBorderColor: string;
  resultSelectedBorderColorDark: string;
  resultTitleColor: string;
  resultTitleColorDark: string;
  resultExcerptColor: string;
  resultExcerptColorDark: string;
  resultUrlColor: string;
  resultUrlColorDark: string;
}

export class SearchModalStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: SearchModalVariables = {
      backdropBackground: 'rgba(0, 0, 0, 0.6)',
      backdropBackgroundDark: 'rgba(0, 0, 0, 0.8)',
      modalBackground: this.globalVars.backgroundColorLight,
      modalBackgroundDark: this.globalVars.backgroundColorDark,
      modalBorderColor: this.globalVars.borderColorLight,
      modalBorderColorDark: this.globalVars.borderColorDark,
      modalBorderRadius: this.globalVars.borderRadiusLg,
      inputColor: this.globalVars.textPrimaryLight,
      inputColorDark: this.globalVars.textPrimaryDark,
      inputPlaceholderColor: this.globalVars.textSecondaryLight,
      inputPlaceholderColorDark: this.globalVars.textSecondaryDark,
      resultBackground: this.globalVars.surfaceColorLight,
      resultBackgroundDark: this.globalVars.surfaceColorDark,
      resultHoverBackground: this.globalVars.backgroundColorLight,
      resultHoverBackgroundDark: this.globalVars.backgroundColorDark,
      resultSelectedBorderColor: this.globalVars.primaryColorLight,
      resultSelectedBorderColorDark: this.globalVars.primaryColorDark,
      resultTitleColor: this.globalVars.textPrimaryLight,
      resultTitleColorDark: this.globalVars.textPrimaryDark,
      resultExcerptColor: this.globalVars.textSecondaryLight,
      resultExcerptColorDark: this.globalVars.textSecondaryDark,
      resultUrlColor: this.globalVars.textSecondaryLight,
      resultUrlColorDark: this.globalVars.textSecondaryDark,
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'backdropBackground', 'backdropBackgroundDark', 'modalBackground', 'modalBackgroundDark',
        'modalBorderColor', 'modalBorderColorDark', 'modalBorderRadius', 'inputColor', 'inputColorDark',
        'inputPlaceholderColor', 'inputPlaceholderColorDark', 'resultBackground', 'resultBackgroundDark',
        'resultHoverBackground', 'resultHoverBackgroundDark', 'resultSelectedBorderColor', 'resultSelectedBorderColorDark',
        'resultTitleColor', 'resultTitleColorDark', 'resultExcerptColor', 'resultExcerptColorDark',
        'resultUrlColor', 'resultUrlColorDark'
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

${darkMode(`  .search-modal-backdrop {
    background: ${vars.backdropBackgroundDark};
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

${darkMode(`  .search-modal {
    background: ${vars.modalBackgroundDark};
    border-color: ${vars.modalBorderColorDark};
  }`)}

.search-input-container {
  display: flex;
  align-items: center;
  gap: ${this.globalVars.spacingSm};
  padding: ${this.globalVars.spacingMd};
  border-bottom: 1px solid ${vars.modalBorderColor};
  flex-shrink: 0;
}

${darkMode(`  .search-input-container {
    border-bottom-color: ${vars.modalBorderColorDark};
  }`)}

.search-input-icon {
  width: 20px;
  height: 20px;
  color: ${vars.inputPlaceholderColor};
  flex-shrink: 0;
}

${darkMode(`  .search-input-icon {
    color: ${vars.inputPlaceholderColorDark};
  }`)}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: ${this.globalVars.fontSizeBase};
  color: ${vars.inputColor};
  outline: none;
}

${darkMode(`  .search-input {
    color: ${vars.inputColorDark};
  }`)}

.search-input::placeholder {
  color: ${vars.inputPlaceholderColor};
  opacity: 0.6;
}

${darkMode(`  .search-input::placeholder {
    color: ${vars.inputPlaceholderColorDark};
  }`)}

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

${darkMode(`  .search-close-button {
    color: ${vars.inputPlaceholderColorDark};
  }`)}

.search-close-button:hover {
  background: ${vars.resultBackground};
  color: ${vars.inputColor};
}

${darkMode(`  .search-close-button:hover {
    background: ${vars.resultBackgroundDark};
    color: ${vars.inputColorDark};
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
  background: ${vars.resultBackground};
  border-radius: ${this.globalVars.borderRadiusMd};
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

${darkMode(`  .search-result-link {
    background: ${vars.resultBackgroundDark};
  }`)}

.search-result-link.selected {
  border-color: ${vars.resultSelectedBorderColor};
  background: ${vars.resultHoverBackground};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

${darkMode(`  .search-result-link.selected {
    border-color: ${vars.resultSelectedBorderColorDark};
    background: ${vars.resultHoverBackgroundDark};
  }`)}

.search-result-link:hover,
.search-result-link:focus {
  border-color: ${vars.resultSelectedBorderColor};
  background: ${vars.resultHoverBackground};
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

${darkMode(`  .search-result-link:hover,
  .search-result-link:focus {
    border-color: ${vars.resultSelectedBorderColorDark};
    background: ${vars.resultHoverBackgroundDark};
  }`)}

.search-result-title {
  font-weight: ${this.globalVars.fontWeightMedium};
  color: ${vars.resultTitleColor};
  margin-bottom: ${this.globalVars.spacingXs};
  font-size: ${this.globalVars.fontSizeBase};
}

${darkMode(`  .search-result-title {
    color: ${vars.resultTitleColorDark};
  }`)}

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

${darkMode(`  .search-result-excerpt {
    color: ${vars.resultExcerptColorDark};
  }`)}

.search-result-url {
  font-size: ${this.globalVars.fontSizeSm};
  color: ${vars.resultUrlColor};
  opacity: 0.7;
}

${darkMode(`  .search-result-url {
    color: ${vars.resultUrlColorDark};
  }`)}

.search-loading,
.search-empty,
.search-no-results,
.search-notice {
  text-align: center;
  padding: ${this.globalVars.spacingMd};
  color: ${vars.resultExcerptColor};
}

${darkMode(`  .search-loading,
  .search-empty,
  .search-no-results,
  .search-notice {
    color: ${vars.resultExcerptColorDark};
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
  color: ${vars.resultExcerptColor};
}

${darkMode(`  .search-shortcuts {
    color: ${vars.resultExcerptColorDark};
  }`)}

.search-shortcuts kbd {
  padding: 0.25rem 0.5rem;
  background: ${vars.resultBackground};
  border: 1px solid ${vars.modalBorderColor};
  border-radius: ${this.globalVars.borderRadiusSm};
  font-family: ${this.globalVars.fontFamilyMono};
  font-size: ${this.globalVars.fontSizeXs};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

${darkMode(`  .search-shortcuts kbd {
    background: ${vars.resultBackgroundDark};
    border-color: ${vars.modalBorderColorDark};
  }`)}

.search-separator {
  color: ${vars.resultExcerptColor};
  opacity: 0.5;
}

${darkMode(`  .search-separator {
    color: ${vars.resultExcerptColorDark};
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

