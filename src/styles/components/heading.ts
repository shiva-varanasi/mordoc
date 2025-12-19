/**
 * Heading with anchor link styles
 * Headings with copyable anchor links for deep linking
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, darkMode, mediaQuery } from '../utils';

interface HeadingVariables {
  // Customizable
  anchorLinkColor: string;
  anchorLinkColorDark: string;
  anchorHoverColor: string;
  anchorHoverColorDark: string;
  anchorHoverBackground: string;
  anchorHoverBackgroundDark: string;
  anchorOutlineColor: string;
  anchorOutlineColorDark: string;
  tooltipBackground: string;
  tooltipBackgroundDark: string;
  tooltipTextColor: string;
  tooltipTextColorDark: string;
}

export class HeadingStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: HeadingVariables = {
      anchorLinkColor: this.globalVars.textSecondaryLight,
      anchorLinkColorDark: this.globalVars.textSecondaryDark,
      anchorHoverColor: this.globalVars.linkColorLight,
      anchorHoverColorDark: this.globalVars.linkColorDark,
      anchorHoverBackground: this.globalVars.surfaceColorLight,
      anchorHoverBackgroundDark: this.globalVars.surfaceColorDark,
      anchorOutlineColor: this.globalVars.linkColorLight,
      anchorOutlineColorDark: this.globalVars.linkColorDark,
      tooltipBackground: this.globalVars.textSecondaryLight,
      tooltipBackgroundDark: this.globalVars.textSecondaryDark,
      tooltipTextColor: this.globalVars.backgroundColorLight,
      tooltipTextColorDark: this.globalVars.backgroundColorDark,
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'anchorLinkColor', 'anchorLinkColorDark', 'anchorHoverColor', 'anchorHoverColorDark',
        'anchorHoverBackground', 'anchorHoverBackgroundDark', 'anchorOutlineColor', 'anchorOutlineColorDark',
        'tooltipBackground', 'tooltipBackgroundDark', 'tooltipTextColor', 'tooltipTextColorDark'
      ]
    );
    
    return `/* Heading with Anchor Link */
.heading-with-anchor {
  position: relative;
  scroll-margin-top: calc(${this.globalVars.headerHeight} + ${this.globalVars.spacingMd});
}

.heading-anchor-link {
  position: absolute;
  left: -1.5rem;
  opacity: 0;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: ${vars.anchorLinkColor};
  cursor: pointer;
  transition: opacity 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${this.globalVars.borderRadiusSm};
}

${darkMode(`  .heading-anchor-link {
    color: ${vars.anchorLinkColorDark};
  }`)}

.heading-anchor-link:hover {
  color: ${vars.anchorHoverColor};
  background-color: ${vars.anchorHoverBackground};
}

${darkMode(`  .heading-anchor-link:hover {
    color: ${vars.anchorHoverColorDark};
    background-color: ${vars.anchorHoverBackgroundDark};
  }`)}

.heading-with-anchor:hover .heading-anchor-link {
  opacity: 1;
}

.heading-anchor-link:focus-visible {
  opacity: 1;
  outline: 2px solid ${vars.anchorOutlineColor};
  outline-offset: 2px;
}

${darkMode(`  .heading-anchor-link:focus-visible {
    outline-color: ${vars.anchorOutlineColorDark};
  }`)}

.heading-copied-tooltip {
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: ${vars.tooltipBackground};
  color: ${vars.tooltipTextColor};
  font-size: ${this.globalVars.fontSizeSm};
  border-radius: ${this.globalVars.borderRadiusMd};
  white-space: nowrap;
  pointer-events: none;
  font-family: ${this.globalVars.fontFamilyBase};
  font-weight: ${this.globalVars.fontWeightNormal};
}

${darkMode(`  .heading-copied-tooltip {
    background-color: ${vars.tooltipBackgroundDark};
    color: ${vars.tooltipTextColorDark};
  }`)}


@media (hover: none) and (pointer: coarse) {
  .heading-anchor-link {
    opacity: 0.6;
  }
  
  .heading-with-anchor:active .heading-anchor-link {
    opacity: 1;
  }
}

${mediaQuery('md', `  .heading-anchor-link {
    position: relative;
    left: auto;
    margin-left: 0.5rem;
    display: inline-flex;
    vertical-align: middle;
  }`)}`;
  }
}

