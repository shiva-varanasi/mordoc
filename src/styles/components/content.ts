/**
 * Content page styles
 * Main content area, article wrapper, and page footer
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, mediaQuery } from '../utils';

interface ContentVariables {
  // Customizable
  contentBorderColor: string;
  contentTitleColor: string;
  contentDescriptionColor: string;
  contentMetaColor: string;
  contentTagBackground: string;
  contentFooterColor: string;
}

export class ContentStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: ContentVariables = {
      contentBorderColor: this.globalVars.borderColorLight,
      contentTitleColor: this.globalVars.primaryColorLight,
      contentDescriptionColor: this.globalVars.textPrimaryLight,
      contentMetaColor: this.globalVars.textSecondaryLight,
      contentTagBackground: this.globalVars.surfaceColorLight,
      contentFooterColor: this.globalVars.textSecondaryLight,
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'contentBorderColor', 'contentTitleColor', 'contentDescriptionColor',
        'contentMetaColor', 'contentTagBackground', 'contentFooterColor'
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

.content-title {
  margin-top: 0;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  color: ${vars.contentTitleColor};
}

.content-description {
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
  color: ${vars.contentDescriptionColor};
  margin-bottom: 1rem;
  max-width: 42rem;
}

.content-meta {
  display: flex;
  font-size: 0.875rem;
  color: ${vars.contentMetaColor};
  margin-bottom: 1rem;
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: ${this.globalVars.spacingSm};
}

.content-tag {
  padding: ${this.globalVars.spacingXs} ${this.globalVars.spacingSm};
  background: ${vars.contentTagBackground};
  border-radius: ${this.globalVars.borderRadiusSm};
  font-size: ${this.globalVars.fontSizeSm};
}

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

.content-footer-info {
  text-align: center;
  color: ${vars.contentFooterColor};
  font-size: ${this.globalVars.fontSizeSm};
}

.content-footer-text {
  margin: 0 0 ${this.globalVars.spacingSm} 0;
}

.content-footer-powered {
  margin: 0;
}

.content-footer-powered a {
  color: ${this.globalVars.linkColorLight};
  text-decoration: none;
}

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

