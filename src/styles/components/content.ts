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

.content-loading {
  width: 100%;
}

.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: ${this.globalVars.spacingXl};
  animation: fadeIn 0.3s ease-out;
}

.skeleton {
  border-radius: ${this.globalVars.borderRadiusSm};
}

.shimmer {
  position: relative;
  overflow: hidden;
  background: hsl(215 15% 40% / 0.15);
}

.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    hsl(0 0% 100% / 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

${darkMode(`  .shimmer {
    background: hsl(210 15% 60% / 0.15);
  }

  .shimmer::after {
    background: linear-gradient(
      90deg,
      transparent,
      hsl(0 0% 100% / 0.08),
      transparent
    );
  }`)}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.skeleton-title-group {
  display: flex;
  flex-direction: column;
  gap: ${this.globalVars.spacingLg};
}

.skeleton.title {
  height: 2.5rem;
  width: 30%;
}

.skeleton.subtitle {
  height: 1.25rem;
  width: 75%;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: ${this.globalVars.spacingLg};
}

.skeleton-paragraph {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.skeleton.line {
  height: 1rem;
}

.skeleton.subheading {
  height: 1.75rem;
}

.full { width: 100%; }
.w-83 { width: 83.333%; }
.w-80 { width: 80%; }
.w-75 { width: 75%; }
.w-66 { width: 66.666%; }
.w-56 { width: 14rem; }
.w-50 { width: 50%; }
.w-48 { width: 12rem; }
.w-36 { width: 9rem; }

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
  }`)}

${mediaQuery('md', `  .skeleton.title {
    width: 85%;
  }

  .skeleton.subtitle {
    max-width: 100%;
  }`)}

${mediaQuery('sm', `  .skeleton.title {
    width: 90%;
    height: 2rem;
  }

  .skeleton.subtitle {
    height: 1rem;
  }

  .skeleton-container {
    gap: ${this.globalVars.spacingLg};
  }

  .skeleton-content {
    gap: ${this.globalVars.spacingMd};
  }`)}`;
  }
}

