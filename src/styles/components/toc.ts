/**
 * Table of Contents styles
 * Right sidebar navigation for page headings
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, mediaQuery } from '../utils';

interface TOCVariables {
  // Customizable
  tocTitleColor: string;
  tocLinkColor: string;
  tocLinkHoverColor: string;
  tocLinkActiveColor: string;
  tocBorderColor: string;
}

export class TOCStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: TOCVariables = {
      tocTitleColor: this.globalVars.textSecondaryLight,
      tocLinkColor: this.globalVars.textSecondaryLight,
      tocLinkHoverColor: this.globalVars.textPrimaryLight,
      tocLinkActiveColor: this.globalVars.navActiveColorLight,
      tocBorderColor: this.globalVars.borderColorLight,
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      ['tocTitleColor', 'tocLinkColor', 'tocLinkHoverColor', 'tocLinkActiveColor', 'tocBorderColor']
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

.toc-title {
  font-size: ${this.globalVars.fontSizeXs};
  font-weight: ${this.globalVars.fontWeightSemibold};
  margin-bottom: ${this.globalVars.spacingMd};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${vars.tocTitleColor};
}

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

.toc-link:hover {
  color: ${vars.tocLinkHoverColor};
}

.toc-link.active {
  color: ${vars.tocLinkActiveColor};
  font-weight: ${this.globalVars.fontWeightMedium};
}

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

  .toc-title {
    font-size: ${this.globalVars.fontSizeBase};
  }`)}`;
  }
}

