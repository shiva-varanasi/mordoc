/**
 * Code block styles with syntax highlighting
 * Prism-based syntax highlighting for code blocks
 */

import { GlobalVariables } from '../types';
import { darkMode } from '../utils';

export class CodeBlockStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(): string {
    return `/* Code Block with Syntax Highlighting */
.code-block-wrapper {
  position: relative;
  margin-bottom: ${this.globalVars.spacingMd};
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${this.globalVars.spacingSm} ${this.globalVars.spacingMd};
  background-color: ${this.globalVars.surfaceColorLight};
  border: 1px solid ${this.globalVars.borderColorLight};
  border-bottom: none;
  border-radius: ${this.globalVars.borderRadiusMd} ${this.globalVars.borderRadiusMd} 0 0;
}

${darkMode(`  .code-block-header {
    background-color: ${this.globalVars.surfaceColorDark};
    border-color: ${this.globalVars.borderColorDark};
  }`)}

.code-block-language {
  font-size: ${this.globalVars.fontSizeSm};
  font-weight: ${this.globalVars.fontWeightSemibold};
  color: ${this.globalVars.textSecondaryLight};
  text-transform: capitalize;
  font-family: ${this.globalVars.fontFamilyBase};
}

${darkMode(`  .code-block-language {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.code-block-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: ${this.globalVars.textSecondaryLight};
  cursor: pointer;
  border-radius: ${this.globalVars.borderRadiusSm};
  transition: all 0.2s ease;
}

${darkMode(`  .code-block-copy {
    color: ${this.globalVars.textSecondaryDark};
  }`)}

.code-block-copy:hover {
  background-color: ${this.globalVars.backgroundColorLight};
  color: ${this.globalVars.textPrimaryLight};
}

${darkMode(`  .code-block-copy:hover {
    background-color: ${this.globalVars.backgroundColorDark};
    color: ${this.globalVars.textPrimaryDark};
  }`)}


.code-block-copy:active {
  transform: scale(0.95);
}

.code-block-copy svg {
  width: 16px;
  height: 16px;
}

.code-block-wrapper pre {
  margin-top: 0;
  margin-bottom: 0;
  border: 1px solid ${this.globalVars.borderColorLight};
  border-radius: 0 0 ${this.globalVars.borderRadiusMd} ${this.globalVars.borderRadiusMd};
}

${darkMode(`  .code-block-wrapper pre {
    border-color: ${this.globalVars.borderColorDark};
  }`)}

/* Prism Token Colors */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6a737d;
}

${darkMode(`  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #8b949e;
  }`)}

.token.content,
.token.punctuation {
  color: ${this.globalVars.textPrimaryLight};
}

${darkMode(`  .token.content,
  .token.punctuation {
    color: ${this.globalVars.textPrimaryDark};
  }`)}


.token.namespace {
  opacity: 0.7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: #0184bc;
}

${darkMode(`  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #79c0ff;
  }`)}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #50a14f;
}

${darkMode(`  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #7ee787;
  }`)}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #a626a4;
}

${darkMode(`  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #d2a8ff;
  }`)}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #a626a4;
}

${darkMode(`  .token.atrule,
  .token.attr-value,
  .token.keyword {
    color: #ff7b72;
  }`)}

.token.function,
.token.class-name {
  color: #c18401;
}

${darkMode(`  .token.function,
  .token.class-name {
    color: #d29922;
  }`)}

.token.regex,
.token.important,
.token.variable {
  color: #e45649;
}

${darkMode(`  .token.regex,
  .token.important,
  .token.variable {
    color: #ffa657;
  }`)}


.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

pre[class*="language-"] {
  position: relative;
  line-height: 1.5;
}

code[class*="language-"],
pre[class*="language-"] {
  color: ${this.globalVars.textPrimaryLight};
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  tab-size: 2;
  hyphens: none;
}

${darkMode(`  code[class*="language-"],
  pre[class*="language-"] {
    color: ${this.globalVars.textPrimaryDark};
  }`)}`;
  }
}

