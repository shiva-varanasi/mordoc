/**
 * Header component styles
 * Top navigation bar with logo, search, and optional top-level navigation
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, darkMode, mediaQuery } from '../utils';

interface HeaderVariables {
  // Customizable
  headerBackgroundLight: string;
  headerBackgroundDark: string;
  headerBorderColor: string;
  headerTextColor: string;
  headerLogoHeight: string;
  navTextColorLight: string;
  navTextColorDark: string;
  navHoverColorLight: string;
  navHoverColorDark: string;
  navActiveColorLight: string;
  navActiveColorDark: string;
}

export class HeaderStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: HeaderVariables = {
      headerBackgroundLight: this.globalVars.backgroundColorLight,
      headerBackgroundDark: this.globalVars.backgroundColorDark,
      headerBorderColor: this.globalVars.borderColorLight,
      headerTextColor: this.globalVars.textPrimaryLight,
      headerLogoHeight: '2.5rem',
      navTextColorLight: this.globalVars.navTextColorLight,
      navTextColorDark: this.globalVars.navTextColorDark,
      navHoverColorLight: this.globalVars.navHoverColorLight,
      navHoverColorDark: this.globalVars.navHoverColorDark,
      navActiveColorLight: this.globalVars.navActiveColorLight,
      navActiveColorDark: this.globalVars.navActiveColorDark,
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'headerBackgroundLight', 'headerBackgroundDark', 'headerBorderColor', 
        'headerTextColor', 'headerLogoHeight',
        'navTextColorLight', 'navTextColorDark',
        'navHoverColorLight', 'navHoverColorDark',
        'navActiveColorLight', 'navActiveColorDark'
      ]
    );
    
    return `/* Header */
.site-header {
  background-color: ${vars.headerBackgroundLight};
  border-bottom: 1px solid ${vars.headerBorderColor};
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

${darkMode(`  .site-header {
    background-color: ${vars.headerBackgroundDark};
  }`)}

.site-header.has-nav {
  height: 144px;
}

.site-header.no-nav {
  height: 80px;
}

.header-top {
  height: 80px;
}

.site-header.has-nav .header-top {
  border-bottom: 1px solid ${vars.headerBorderColor};
}

.header-bottom {
  height: 64px;
}

.header-container {
  max-width: 100%;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 ${this.globalVars.spacingSm} 0 ${this.globalVars.spacingXl};
}

.mobile-menu-button {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  color: ${this.globalVars.textPrimaryLight};
  cursor: pointer;
  border-radius: ${this.globalVars.borderRadiusMd};
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

${darkMode(`  .mobile-menu-button {
    color: ${this.globalVars.textPrimaryDark};
  }`)}

.mobile-menu-button:hover {
  background: ${this.globalVars.surfaceColorLight};
}

${darkMode(`  .mobile-menu-button:hover {
    background: ${this.globalVars.surfaceColorDark};
  }`)}

.header-brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-logo-link {
  text-decoration: none;
  color: ${vars.headerTextColor};
  font-weight: ${this.globalVars.fontWeightSemibold};
  font-size: ${this.globalVars.fontSizeLg};
}

.header-logo {
  height: ${vars.headerLogoHeight};
}

.header-search {
  flex: 1;
  display: flex;
  justify-content: center;
  height: 2.2rem;
  padding: 0 ${this.globalVars.spacingLg};
}

.header-search-button {
  display: flex;
  align-items: center;      
  gap: ${this.globalVars.spacingSm};
  padding: ${this.globalVars.spacingSm} ${this.globalVars.spacingMd};
  background: ${this.globalVars.surfaceColorLight};
  border: 1px solid ${this.globalVars.borderColorLight};
  border-radius: ${this.globalVars.borderRadiusLg};
  color: ${this.globalVars.textSecondaryLight};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 300px;
}

${darkMode(`  .header-search-button {
    background: ${this.globalVars.surfaceColorDark};
    border-color: ${this.globalVars.borderColorDark};
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.header-search-button:hover {
  border-color: ${this.globalVars.primaryColorLight};
  background: ${this.globalVars.backgroundColorLight};
}

${darkMode(`  .header-search-button:hover {
    border-color: ${this.globalVars.primaryColorDark};
    background: ${this.globalVars.backgroundColorDark};
  }`)}

.search-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: ${this.globalVars.textSecondaryLight};
}

${darkMode(`  .search-icon {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.search-text {
  flex: 1;
  text-align: left;
}

.search-shortcut {
  padding-left: 6px;
  padding-right: 6px;
  padding-bottom: 1px;
  background: ${this.globalVars.surfaceColorLight};
  font-size: ${this.globalVars.fontSizeSm};
  font-family: ${this.globalVars.fontFamilyBase};
  color: ${this.globalVars.textSecondaryLight};
  font-weight: ${this.globalVars.fontWeightMedium};
}

${darkMode(`  .search-shortcut {
    background: ${this.globalVars.surfaceColorDark};
    color: ${this.globalVars.textSecondaryDark};
  }`)}


.header-actions {
  display: flex;
  align-items: center;
  gap: ${this.globalVars.spacingSm};
  flex-shrink: 0;
  min-width: 100px;
}

.header-nav {
  width: 100%;
}

.header-nav-list {
  display: flex;
  list-style: none;
  gap: ${this.globalVars.spacingLg};
  margin: 0;
  padding: 0;
}

.header-nav-item {
  margin: 0;
}

.header-nav-link {
  text-decoration: none;
  color: ${vars.navTextColorLight};
  padding: ${this.globalVars.spacingSm} 0;
  transition: color 0.2s ease;
  font-size: ${this.globalVars.fontSizeSm};
  font-weight: ${this.globalVars.fontWeightMedium};
}

.header-nav-link:hover {
  color: ${vars.navHoverColorLight};
}

.header-nav-link.active {
  color: ${vars.navActiveColorLight};
  border-bottom: 2px solid ${this.globalVars.primaryColorLight};
}

${darkMode(`  .header-nav-link {
    color: ${vars.navTextColorDark};
  }

  .header-nav-link:hover {
    color: ${vars.navHoverColorDark};
  }

  .header-nav-link.active {
    color: ${vars.navActiveColorDark};
  }`)}

${mediaQuery('md', `  .header-search {
    padding: 0 ${this.globalVars.spacingSm};
  }

  .header-search-button {
    min-width: 200px;
  }

  .header-container {
    padding: 0 ${this.globalVars.spacingMd};
  }

  .search-text {
    display: none;
  }

  .search-shortcut {
    display: none;
  }`)}

${mediaQuery('sm', `  .mobile-menu-button {
    display: flex;
  }

  .header-container {
    padding: 0 ${this.globalVars.spacingSm};
  }

  .header-brand {
    flex: 1;
    justify-content: center;
  }

  .header-search {
    display: none;
  }

  .header-actions {
    min-width: auto;
  }`)}`;
  }
}


