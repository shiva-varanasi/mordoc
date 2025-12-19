/**
 * Code block styles with syntax highlighting
 * Prism-based syntax highlighting for code blocks
 */

import { GlobalVariables } from '../types';
import { mergeOverrides } from '../utils';

interface CodeBlockVariables {
  // Customizable
  codeBlockBackground: string;
  codeBlockBorderColor: string;
  codeBlockBorderRadius: string;
  codeHeaderBackground: string;
  codeLanguageColor: string;
  codeCopyButtonColor: string;
  codeCopyButtonHoverBg: string;
  codeCopyButtonHoverColor: string;
  
  // Syntax highlighting colors (customizable)
  codeCommentColor: string;
  codePunctuationColor: string;
  codePropertyColor: string;
  codeSelectorColor: string;
  codeOperatorColor: string;
  codeFunctionColor: string;
  codeKeywordColor: string;
  codeVariableColor: string;
}

export class CodeBlockStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: CodeBlockVariables = {
      codeBlockBackground: this.globalVars.surfaceColorLight,
      codeBlockBorderColor: this.globalVars.borderColorLight,
      codeBlockBorderRadius: this.globalVars.borderRadiusMd,
      codeHeaderBackground: this.globalVars.surfaceColorLight,
      codeLanguageColor: this.globalVars.textSecondaryLight,
      codeCopyButtonColor: this.globalVars.textSecondaryLight,
      codeCopyButtonHoverBg: this.globalVars.backgroundColorLight,
      codeCopyButtonHoverColor: this.globalVars.textPrimaryLight,
      
      // Syntax highlighting
      codeCommentColor: '#6a737d',
      codePunctuationColor: this.globalVars.textPrimaryLight,
      codePropertyColor: '#0184bc',
      codeSelectorColor: '#50a14f',
      codeOperatorColor: '#a626a4',
      codeFunctionColor: '#c18401',
      codeKeywordColor: '#a626a4',
      codeVariableColor: '#e45649',
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'codeBlockBackground', 'codeBlockBorderColor', 'codeBlockBorderRadius',
        'codeHeaderBackground', 'codeLanguageColor', 'codeCopyButtonColor',
        'codeCopyButtonHoverBg', 'codeCopyButtonHoverColor',
        'codeCommentColor', 'codePunctuationColor', 'codePropertyColor',
        'codeSelectorColor', 'codeOperatorColor', 'codeFunctionColor',
        'codeKeywordColor', 'codeVariableColor'
      ]
    );
    
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
  background-color: ${vars.codeHeaderBackground};
  border: 1px solid ${vars.codeBlockBorderColor};
  border-bottom: none;
  border-radius: ${vars.codeBlockBorderRadius} ${vars.codeBlockBorderRadius} 0 0;
}

.code-block-language {
  font-size: ${this.globalVars.fontSizeSm};
  font-weight: ${this.globalVars.fontWeightSemibold};
  color: ${vars.codeLanguageColor};
  text-transform: capitalize;
  font-family: ${this.globalVars.fontFamilyBase};
}

.code-block-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: ${vars.codeCopyButtonColor};
  cursor: pointer;
  border-radius: ${this.globalVars.borderRadiusSm};
  transition: all 0.2s ease;
}

.code-block-copy:hover {
  background-color: ${vars.codeCopyButtonHoverBg};
  color: ${vars.codeCopyButtonHoverColor};
}

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
  border: 1px solid ${vars.codeBlockBorderColor};
  border-radius: 0 0 ${vars.codeBlockBorderRadius} ${vars.codeBlockBorderRadius};
}

/* Prism Token Colors */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: ${vars.codeCommentColor};
}

.token.punctuation {
  color: ${vars.codePunctuationColor};
}

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
  color: ${vars.codePropertyColor};
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: ${vars.codeSelectorColor};
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: ${vars.codeOperatorColor};
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: ${vars.codeKeywordColor};
}

.token.function,
.token.class-name {
  color: ${vars.codeFunctionColor};
}

.token.regex,
.token.important,
.token.variable {
  color: ${vars.codeVariableColor};
}

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
}`;
  }
}

