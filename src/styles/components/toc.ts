/**
 * Table of Contents styles
 * Right sidebar navigation for page headings
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, darkMode, mediaQuery } from '../utils';

interface TOCVariables {
  // Customizable
  tocTitleColor: string;
  tocTitleColorDark: string;
  tocLinkColor: string;
  tocLinkColorDark: string;
  tocLinkHoverColor: string;
  tocLinkHoverColorDark: string;
  tocLinkActiveColor: string;
  tocLinkActiveColorDark: string;
  tocBorderColor: string;
  tocBorderColorDark: string;
}

export class TOCStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: TOCVariables = {
      tocTitleColor: this.globalVars.textSecondaryLight,
      tocTitleColorDark: this.globalVars.textSecondaryDark,
      tocLinkColor: this.globalVars.textSecondaryLight,
      tocLinkColorDark: this.globalVars.textSecondaryDark,
      tocLinkHoverColor: this.globalVars.textPrimaryLight,
      tocLinkHoverColorDark: this.globalVars.textPrimaryDark,
      tocLinkActiveColor: this.globalVars.navActiveColorLight,
      tocLinkActiveColorDark: this.globalVars.navActiveColorDark,
      tocBorderColor: this.globalVars.borderColorLight,
      tocBorderColorDark: this.globalVars.borderColorDark,
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      ['tocTitleColor', 'tocTitleColorDark', 'tocLinkColor', 'tocLinkColorDark', 'tocLinkHoverColor', 
       'tocLinkHoverColorDark', 'tocLinkActiveColor', 'tocLinkActiveColorDark', 'tocBorderColor', 'tocBorderColorDark']
    );
    
    return `/* Table of Contents */
.toc {
  position: sticky;
  top: ${this.globalVars.spacingMd};
  max-height: calc(100vh - ${this.globalVars.headerHeight} - ${this.globalVars.spacingLg} * 2);
  overflow-y: auto;
  padding: ${this.globalVars.spacingMd};
  border-left: 1px solid ${vars.tocBorderColor};
}

${darkMode(`  .toc {
    border-left-color: ${vars.tocBorderColorDark};
  }`)}

.toc-title {
  font-size: ${this.globalVars.fontSizeXs};
  font-weight: ${this.globalVars.fontWeightSemibold};
  margin-bottom: ${this.globalVars.spacingMd};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${vars.tocTitleColor};
}

${darkMode(`  .toc-title {
    color: ${vars.tocTitleColorDark};
  }`)}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-item {
  margin-bottom: 4px;
}

.toc-link {
  display: block;
  padding: 4px 0;
  color: ${vars.tocLinkColor};
  text-decoration: none;
  font-size: ${this.globalVars.fontSizeSm};
  transition: color 0.2s ease;
  line-height: 1.6;
}

${darkMode(`  .toc-link {
    color: ${vars.tocLinkColorDark};
  }`)}

.toc-link:hover {
  color: ${vars.tocLinkHoverColor};
}

${darkMode(`  .toc-link:hover {
    color: ${vars.tocLinkHoverColorDark};
  }`)}

.toc-link.active {
  color: ${vars.tocLinkActiveColor};
  font-weight: ${this.globalVars.fontWeightMedium};
}

${darkMode(`  .toc-link.active {
    color: ${vars.tocLinkActiveColorDark};
  }`)}


.toc-sublist {
  list-style: none;
  margin-left: ${this.globalVars.spacingMd};
  padding-left: 0;
  margin-top: 4px;
}

${mediaQuery('md', `  .toc {
    position: relative;
    top: 0;
    max-height: 400px;
    border-left: none;
    border-bottom: 1px solid ${vars.tocBorderColor};
    margin-bottom: ${this.globalVars.spacingLg};
  }

  ${darkMode(`    .toc {
      border-bottom-color: ${vars.tocBorderColorDark};
    }`)}

  .toc-title {
    font-size: ${this.globalVars.fontSizeBase};
  }`)}`;
  }
}

