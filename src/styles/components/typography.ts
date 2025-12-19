/**
 * Typography styles
 * Global typography for headings, paragraphs, links, lists, tables, etc.
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, darkMode, mediaQuery } from '../utils';

interface TypographyVariables {
  // Customizable
  headingColor: string;
  headingColorDark: string;
  linkColor: string;
  linkColorDark: string;
  linkHoverColor: string;
  linkHoverColorDark: string;
  codeBackground: string;
  codeBackgroundDark: string;
  blockquoteColor: string;
  blockquoteColorDark: string;
  blockquoteBorder: string;
  blockquoteBorderDark: string;
  tableHeaderBackground: string;
  tableHeaderBackgroundDark: string;
  tableBorder: string;
  tableBorderDark: string;
}

export class TypographyStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: TypographyVariables = {
      headingColor: this.globalVars.textPrimaryLight,
      headingColorDark: this.globalVars.textPrimaryDark,
      linkColor: this.globalVars.linkColorLight,
      linkColorDark: this.globalVars.linkColorDark,
      linkHoverColor: '#000000',
      linkHoverColorDark: '#ffffff',
      codeBackground: this.globalVars.surfaceColorLight,
      codeBackgroundDark: this.globalVars.surfaceColorDark,
      blockquoteColor: this.globalVars.textSecondaryLight,
      blockquoteColorDark: this.globalVars.textSecondaryDark,
      blockquoteBorder: this.globalVars.borderColorLight,
      blockquoteBorderDark: this.globalVars.borderColorDark,
      tableHeaderBackground: this.globalVars.surfaceColorLight,
      tableHeaderBackgroundDark: this.globalVars.surfaceColorDark,
      tableBorder: this.globalVars.borderColorLight,
      tableBorderDark: this.globalVars.borderColorDark,
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      ['headingColor', 'headingColorDark', 'linkColor', 'linkColorDark', 'linkHoverColor', 'linkHoverColorDark', 
       'codeBackground', 'codeBackgroundDark', 'blockquoteColor', 'blockquoteColorDark', 'blockquoteBorder', 
       'blockquoteBorderDark', 'tableHeaderBackground', 'tableHeaderBackgroundDark', 'tableBorder', 'tableBorderDark']
    );
    
    return `/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: ${this.globalVars.fontFamilyHeading};
  color: ${vars.headingColor};
}

h1 {
  font-size: 1.875rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  line-height: 1.4;
  letter-spacing: -0.01em;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}

h3 {
  font-size: 1.25rem;
  line-height: 1.5;
  letter-spacing: -0.01em;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

h4 {
  font-size: 1.125rem;
  line-height: 1.5;
  letter-spacing: 0.01em;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

h5 {
  font-size: 1rem;
  line-height: 1.5;
  letter-spacing: 0.01em;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

h6 {
  font-size: 0.875rem;
  line-height: 1.5;
  letter-spacing: 0.01em;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

p {
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 400;
  margin-top: 0;
  margin-bottom: 1rem;
}

a {
  color: ${vars.linkColor};
  text-decoration: underline;
  transition: color 0.2s ease;
}

a:hover {
  color: ${vars.linkHoverColor};
}

${darkMode(`  h1, h2, h3, h4, h5, h6 {
    color: ${vars.headingColorDark};
  }

  a {
    color: ${vars.linkColorDark};
  }

  a:hover {
    color: ${vars.linkHoverColorDark};
  }`)}

code, pre {
  font-family: ${this.globalVars.fontFamilyMono};
  font-size: ${this.globalVars.fontSizeSm};
}

code {
  background-color: ${vars.codeBackground};
  padding: 0.125rem 0.375rem;
  border-radius: ${this.globalVars.borderRadiusSm};
}

${darkMode(`  code {
    background-color: ${vars.codeBackgroundDark};
  }`)}

pre {
  background-color: ${vars.codeBackground};
  padding: ${this.globalVars.spacingMd};
  border-radius: ${this.globalVars.borderRadiusMd};
  overflow-x: auto;
  margin-bottom: ${this.globalVars.spacingMd};
}

${darkMode(`  pre {
    background-color: ${vars.codeBackgroundDark};
  }`)}


pre code {
  background-color: transparent;
  padding: 0;
}

ul, ol {
  padding-left: ${this.globalVars.spacingXl};
  margin-bottom: 1.5rem;
  line-height: 1.7;
}

ul {
  list-style: disc;
  list-style-position: outside;
}

ol {
  list-style: decimal;
  list-style-position: outside;
}

ul ul {
  list-style-type: circle;
}

ul ul ul {
  list-style-type: square;
}

ol ol {
  list-style-type: lower-alpha;
}

ol ol ol {
  list-style-type: lower-roman;
}

li {
  margin-bottom: ${this.globalVars.spacingSm};
  line-height: 1.7;
}

li p {
  margin-bottom: ${this.globalVars.spacingSm};
}

blockquote {
  margin: ${this.globalVars.spacingMd} 0;
  padding-left: ${this.globalVars.spacingMd};
  border-left: 4px solid ${vars.blockquoteBorder};
  color: ${vars.blockquoteColor};
}

${darkMode(`  blockquote {
    border-left-color: ${vars.blockquoteBorderDark};
    color: ${vars.blockquoteColorDark};
  }`)}

hr {
  border: none;
  border-top: 1px solid ${vars.tableBorder};
  margin: ${this.globalVars.spacingLg} 0;
}

${darkMode(`  hr {
    border-top-color: ${vars.tableBorderDark};
  }`)}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${this.globalVars.spacingMd};
}

th, td {
  text-align: left;
  padding: ${this.globalVars.spacingSm} ${this.globalVars.spacingMd};
  border-bottom: 1px solid ${vars.tableBorder};
}

${darkMode(`  th, td {
    border-bottom-color: ${vars.tableBorderDark};
  }`)}

th {
  font-weight: ${this.globalVars.fontWeightSemibold};
  background-color: ${vars.tableHeaderBackground};
}

${darkMode(`  th {
    background-color: ${vars.tableHeaderBackgroundDark};
  }`)}


img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: ${this.globalVars.spacingMd} 0;
  border-radius: ${this.globalVars.borderRadiusMd};
  cursor: pointer;
  transition: transform 0.2s ease;
}

img:hover {
  transform: scale(1.02);
}`;
  }
}

