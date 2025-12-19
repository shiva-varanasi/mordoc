/**
 * Utility styles
 * Helper classes for common patterns
 */

import { GlobalVariables } from '../types';
import { darkMode } from '../utils';

export class UtilityStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(): string {
    return `/* Utility Classes */
.loading {
  text-align: center;
  padding: ${this.globalVars.spacing2xl};
  color: ${this.globalVars.textSecondaryLight};
}

${darkMode(`  .loading {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.error {
  color: ${this.globalVars.errorColorLight};
  padding: ${this.globalVars.spacingMd};
  background: ${this.globalVars.surfaceColorLight};
  border-radius: ${this.globalVars.borderRadiusMd};
  border-left: 4px solid ${this.globalVars.errorColorLight};
}

${darkMode(`  .error {
    color: ${this.globalVars.errorColorDark};
    background: ${this.globalVars.surfaceColorDark};
    border-left-color: ${this.globalVars.errorColorDark};
  }`)}


.table-wrapper {
  overflow-x: auto;
  margin-bottom: ${this.globalVars.spacingMd};
}

/* Image Modal/Lightbox */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${this.globalVars.spacingXl};
  cursor: zoom-out;
}

.image-modal img {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  cursor: default;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.image-modal-close {
  position: absolute;
  top: ${this.globalVars.spacingLg};
  right: ${this.globalVars.spacingLg};
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 32px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.image-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Theme Toggle */
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${this.globalVars.surfaceColorLight};
  border: 1px solid ${this.globalVars.borderColorLight};
  border-radius: ${this.globalVars.borderRadiusFull};
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

${darkMode(`  .theme-toggle {
    background: ${this.globalVars.surfaceColorDark};
    border-color: ${this.globalVars.borderColorDark};
  }`)}

.theme-toggle:hover {
  background: ${this.globalVars.backgroundColorLight};
  border-color: ${this.globalVars.primaryColorLight};
}

${darkMode(`  .theme-toggle:hover {
    background: ${this.globalVars.backgroundColorDark};
    border-color: ${this.globalVars.primaryColorDark};
  }`)}

.theme-toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: transparent;
  border-radius: ${this.globalVars.borderRadiusSm};
  color: ${this.globalVars.textSecondaryLight};
  transition: all 0.2s ease;
  position: relative;
}

${darkMode(`  .theme-toggle-icon {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.theme-toggle:hover .theme-toggle-icon {
  color: ${this.globalVars.textPrimaryLight};
}

${darkMode(`  .theme-toggle:hover .theme-toggle-icon {
    color: ${this.globalVars.textPrimaryDark};
  }`)}

.theme-toggle-icon.active {
  color: ${this.globalVars.textPrimaryLight};
}

${darkMode(`  .theme-toggle-icon.active {
    color: ${this.globalVars.textPrimaryDark};
  }`)}

.theme-toggle:hover .theme-toggle-icon.active {
  opacity: 0.9;
}

.theme-toggle-icon svg {
  width: 12px;
  height: 12px;
  display: block;
  fill: none;
  stroke: currentColor;
}

.theme-toggle-icon.active svg {
  fill: ${this.globalVars.textPrimaryLight};
}

${darkMode(`  .theme-toggle-icon.active svg {
    fill: ${this.globalVars.textPrimaryDark};
  }`)}


@media (max-width: 480px) {
  .theme-toggle {
    gap: 2px;
    padding: 3px;
  }

  .theme-toggle-icon {
    padding: 5px;
  }

  .theme-toggle-icon svg {
    width: 12px;
    height: 12px;
  }
}

/* Page Navigation (Prev/Next) */
.page-navigation {
  margin-top: ${this.globalVars.spacing2xl};
  padding-top: ${this.globalVars.spacing2xl};
  border-top: 1px solid ${this.globalVars.borderColorLight};
}

${darkMode(`  .page-navigation {
    border-top-color: ${this.globalVars.borderColorDark};
  }`)}

.page-nav-container {
  display: flex;
  justify-content: space-between;
  gap: ${this.globalVars.spacingMd};
}

.page-nav-link {
  display: flex;
  flex-direction: column;
  gap: ${this.globalVars.spacingXs};
  padding: ${this.globalVars.spacingMd};
  border: 1px solid ${this.globalVars.borderColorLight};
  border-radius: ${this.globalVars.borderRadiusMd};
  text-decoration: none;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 45%;
}

${darkMode(`  .page-nav-link {
    border-color: ${this.globalVars.borderColorDark};
  }`)}

.page-nav-link:hover {
  background: ${this.globalVars.surfaceColorLight};
  border-color: ${this.globalVars.primaryColorLight};
}

${darkMode(`  .page-nav-link:hover {
    background: ${this.globalVars.surfaceColorDark};
    border-color: ${this.globalVars.primaryColorDark};
  }`)}

.page-nav-prev {
  text-align: left;
}

.page-nav-next {
  text-align: right;
}

.page-nav-direction {
  font-size: ${this.globalVars.fontSizeSm};
  color: ${this.globalVars.textSecondaryLight};
}

${darkMode(`  .page-nav-direction {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.page-nav-label {
  font-weight: ${this.globalVars.fontWeightMedium};
  color: ${this.globalVars.textPrimaryLight};
}

${darkMode(`  .page-nav-label {
    color: ${this.globalVars.textPrimaryDark};
  }`)}


.page-nav-spacer {
  flex: 1;
}`;
  }
}

