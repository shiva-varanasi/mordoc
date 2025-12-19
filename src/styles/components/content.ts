/**
 * Content page styles
 * Main content area, article wrapper, and page footer
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, darkMode, mediaQuery } from '../utils';

interface ContentVariables {
  // Customizable
  contentBorderColor: string;
  contentBorderColorDark: string;
  contentTitleColor: string;
  contentTitleColorDark: string;
  contentDescriptionColor: string;
  contentDescriptionColorDark: string;
  contentMetaColor: string;
  contentMetaColorDark: string;
  contentTagBackground: string;
  contentTagBackgroundDark: string;
  contentTagColor: string;
  contentTagColorDark: string;
  contentFooterColor: string;
  contentFooterColorDark: string;
  contentFooterLinkColor: string;
  contentFooterLinkColorDark: string;
}

export class ContentStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: ContentVariables = {
      contentBorderColor: this.globalVars.borderColorLight,
      contentBorderColorDark: this.globalVars.borderColorDark,
      contentTitleColor: this.globalVars.primaryColorLight,
      contentTitleColorDark: this.globalVars.primaryColorDark,
      contentDescriptionColor: this.globalVars.textPrimaryLight,
      contentDescriptionColorDark: this.globalVars.textPrimaryDark,
      contentMetaColor: this.globalVars.textSecondaryLight,
      contentMetaColorDark: this.globalVars.textSecondaryDark,
      contentTagBackground: this.globalVars.surfaceColorLight,
      contentTagBackgroundDark: this.globalVars.surfaceColorDark,
      contentTagColor: this.globalVars.textPrimaryLight,
      contentTagColorDark: this.globalVars.textPrimaryDark,
      contentFooterColor: this.globalVars.textSecondaryLight,
      contentFooterColorDark: this.globalVars.textSecondaryDark,
      contentFooterLinkColor: this.globalVars.linkColorLight,
      contentFooterLinkColorDark: this.globalVars.linkColorDark,
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'contentBorderColor', 'contentBorderColorDark', 'contentTitleColor', 'contentTitleColorDark',
        'contentDescriptionColor', 'contentDescriptionColorDark', 'contentMetaColor', 'contentMetaColorDark',
        'contentTagBackground', 'contentTagBackgroundDark', 'contentTagColor', 'contentTagColorDark',
        'contentFooterColor', 'contentFooterColorDark', 'contentFooterLinkColor', 'contentFooterLinkColorDark'
      ]
    );
    
    return `/* Content Page */
.content-page {
  width: 100%;
}

.content-wrapper {
  display: flex;
  gap: ${this.globalVars.spacing3xl};
  width: 100%;
}

.content-article {
  flex: 1;
  min-width: 0;
  max-width: 60rem;
}

.content-header {
  margin-bottom: ${this.globalVars.spacingXl};
  border-bottom: 1px solid ${vars.contentBorderColor};
}

${darkMode(`  .content-header {
    border-bottom-color: ${vars.contentBorderColorDark};
  }`)}

.content-title {
  margin-top: 0;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  color: ${vars.contentTitleColor};
}

${darkMode(`  .content-title {
    color: ${vars.contentTitleColorDark};
  }`)}

.content-description {
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
  color: ${vars.contentDescriptionColor};
  margin-bottom: 1rem;
  max-width: 42rem;
}

${darkMode(`  .content-description {
    color: ${vars.contentDescriptionColorDark};
  }`)}

.content-meta {
  display: flex;
  font-size: 0.875rem;
  color: ${vars.contentMetaColor};
  margin-bottom: 1rem;
}

${darkMode(`  .content-meta {
    color: ${vars.contentMetaColorDark};
  }`)}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: ${this.globalVars.spacingSm};
}

.content-tag {
  padding: ${this.globalVars.spacingXs} ${this.globalVars.spacingSm};
  background: ${vars.contentTagBackground};
  color: ${vars.contentTagColor};
  border-radius: ${this.globalVars.borderRadiusSm};
  font-size: ${this.globalVars.fontSizeSm};
}

${darkMode(`  .content-tag {
    background: ${vars.contentTagBackgroundDark};
    color: ${vars.contentTagColorDark};
  }`)}


.content-body {
  margin-bottom: ${this.globalVars.spacing2xl};
}

.content-toc {
  width: 280px;
  flex-shrink: 0;
}

.content-footer {
  margin-top: ${this.globalVars.spacing3xl};
  margin-bottom: ${this.globalVars.spacing2xl};
  padding-top: ${this.globalVars.spacingXl};
  border-top: 1px solid ${vars.contentBorderColor};
}

${darkMode(`  .content-footer {
    border-top-color: ${vars.contentBorderColorDark};
  }`)}

.content-footer-info p {
  text-align: center;
  color: ${vars.contentFooterColor};
  font-size: ${this.globalVars.fontSizeSm};
}

${darkMode(`  .content-footer-info p {
    color: ${vars.contentFooterColorDark};
  }`)}

.content-footer-text {
  margin: 0 0 ${this.globalVars.spacingSm} 0;
}

.content-footer-powered {
  margin: 0;
}

.content-footer-powered a {
  color: ${vars.contentFooterLinkColor};
  text-decoration: none;
}

${darkMode(`  .content-footer-powered a {
    color: ${vars.contentFooterLinkColorDark};
  }`)}

.content-footer-powered a:hover {
  text-decoration: underline;
}

${mediaQuery('xl', `  .content-toc {
    width: 240px;
  }`)}

${mediaQuery('lg', `  .content-toc {
    width: 220px;
  }

  .content-article {
    max-width: 720px;
  }`)}

${mediaQuery('md', `  .content-wrapper {
    flex-direction: column;
  }

  .content-article {
    max-width: 100%;
  }

  .content-toc {
    width: 100%;
    order: -1;
  }

  .content-title {
    font-size: ${this.globalVars.fontSize3xl};
  }`)}

${mediaQuery('sm', `  .content-title {
    font-size: ${this.globalVars.fontSize2xl};
  }

  .content-meta {
    flex-direction: column;
    gap: ${this.globalVars.spacingSm};
  }`)}`;
  }
}

