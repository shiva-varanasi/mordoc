/**
 * Content page styles
 * Main content area, article wrapper, and page footer
 */

import { GlobalVariables } from '../types';
import { darkMode, mediaQuery } from '../utils';

export class ContentStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(): string {
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
  border-bottom: 1px solid ${this.globalVars.borderColorLight};
}

${darkMode(`  .content-header {
    border-bottom-color: ${this.globalVars.borderColorDark};
  }`)}

.content-title {
  margin-top: 0;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
  color: ${this.globalVars.primaryColorLight};
}

${darkMode(`  .content-title {
    color: ${this.globalVars.primaryColorDark};
  }`)}

.content-description {
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
  color: ${this.globalVars.textPrimaryLight};
  margin-bottom: 1rem;
}

${darkMode(`  .content-description {
    color: ${this.globalVars.textPrimaryDark};
  }`)}

.content-meta {
  display: flex;
  font-size: 0.875rem;
  color: ${this.globalVars.textSecondaryLight};
  margin-bottom: 1rem;
}

${darkMode(`  .content-meta {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: ${this.globalVars.spacingSm};
}

.content-tag {
  padding: ${this.globalVars.spacingXs} ${this.globalVars.spacingSm};
  background: ${this.globalVars.surfaceColorLight};
  color: ${this.globalVars.textPrimaryLight};
  border-radius: ${this.globalVars.borderRadiusSm};
  font-size: ${this.globalVars.fontSizeSm};
}

${darkMode(`  .content-tag {
    background: ${this.globalVars.surfaceColorDark};
    color: ${this.globalVars.textPrimaryDark};
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
  border-top: 1px solid ${this.globalVars.borderColorLight};
}

${darkMode(`  .content-footer {
    border-top-color: ${this.globalVars.borderColorDark};
  }`)}

.content-footer-info p {
  text-align: center;
  color: ${this.globalVars.textSecondaryLight};
  font-size: ${this.globalVars.fontSizeSm};
}

${darkMode(`  .content-footer-info p {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

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

${darkMode(`  .content-footer-powered a {
    color: ${this.globalVars.linkColorDark};
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

${mediaQuery('lg', `  .content-wrapper {
    gap: ${this.globalVars.spacing2xl};
  }`)}

${mediaQuery('md', `  .content-wrapper {
    flex-direction: column;
    gap: ${this.globalVars.spacingXl};
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

${mediaQuery('sm', `  .content-toc {
    display: none;
  }

  .content-title {
    font-size: ${this.globalVars.fontSize2xl};
  }

  .content-meta {
    flex-direction: column;
    gap: ${this.globalVars.spacingSm};
  }`)}`;
  }
}

