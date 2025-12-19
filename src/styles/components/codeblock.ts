/**
 * Code block styles with syntax highlighting
 * Prism-based syntax highlighting for code blocks
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, darkMode } from '../utils';

interface CodeBlockVariables {
  // Customizable
  codeBlockBackground: string;
  codeBlockBackgroundDark: string;
  codeBlockBorderColor: string;
  codeBlockBorderColorDark: string;
  codeBlockBorderRadius: string;
  codeHeaderBackground: string;
  codeHeaderBackgroundDark: string;
  codeLanguageColor: string;
  codeLanguageColorDark: string;
  codeCopyButtonColor: string;
  codeCopyButtonColorDark: string;
  codeCopyButtonHoverBg: string;
  codeCopyButtonHoverBgDark: string;
  codeCopyButtonHoverColor: string;
  codeCopyButtonHoverColorDark: string;
  codeTextColor: string;
  codeTextColorDark: string;
  
  // Syntax highlighting colors (customizable)
  codeCommentColor: string;
  codeCommentColorDark: string;
  codePunctuationColor: string;
  codePunctuationColorDark: string;
  codePropertyColor: string;
  codePropertyColorDark: string;
  codeSelectorColor: string;
  codeSelectorColorDark: string;
  codeOperatorColor: string;
  codeOperatorColorDark: string;
  codeFunctionColor: string;
  codeFunctionColorDark: string;
  codeKeywordColor: string;
  codeKeywordColorDark: string;
  codeVariableColor: string;
  codeVariableColorDark: string;
}

export class CodeBlockStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: CodeBlockVariables = {
      codeBlockBackground: this.globalVars.surfaceColorLight,
      codeBlockBackgroundDark: this.globalVars.surfaceColorDark,
      codeBlockBorderColor: this.globalVars.borderColorLight,
      codeBlockBorderColorDark: this.globalVars.borderColorDark,
      codeBlockBorderRadius: this.globalVars.borderRadiusMd,
      codeHeaderBackground: this.globalVars.surfaceColorLight,
      codeHeaderBackgroundDark: this.globalVars.surfaceColorDark,
      codeLanguageColor: this.globalVars.textSecondaryLight,
      codeLanguageColorDark: this.globalVars.textSecondaryDark,
      codeCopyButtonColor: this.globalVars.textSecondaryLight,
      codeCopyButtonColorDark: this.globalVars.textSecondaryDark,
      codeCopyButtonHoverBg: this.globalVars.backgroundColorLight,
      codeCopyButtonHoverBgDark: this.globalVars.backgroundColorDark,
      codeCopyButtonHoverColor: this.globalVars.textPrimaryLight,
      codeCopyButtonHoverColorDark: this.globalVars.textPrimaryDark,
      codeTextColor: this.globalVars.textPrimaryLight,
      codeTextColorDark: this.globalVars.textPrimaryDark,
      
      // Syntax highlighting - Light mode
      codeCommentColor: '#6a737d',
      codeCommentColorDark: '#8b949e',
      codePunctuationColor: this.globalVars.textPrimaryLight,
      codePunctuationColorDark: this.globalVars.textPrimaryDark,
      codePropertyColor: '#0184bc',
      codePropertyColorDark: '#79c0ff',
      codeSelectorColor: '#50a14f',
      codeSelectorColorDark: '#7ee787',
      codeOperatorColor: '#a626a4',
      codeOperatorColorDark: '#d2a8ff',
      codeFunctionColor: '#c18401',
      codeFunctionColorDark: '#d29922',
      codeKeywordColor: '#a626a4',
      codeKeywordColorDark: '#ff7b72',
      codeVariableColor: '#e45649',
      codeVariableColorDark: '#ffa657',
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'codeBlockBackground', 'codeBlockBackgroundDark', 'codeBlockBorderColor', 'codeBlockBorderColorDark',
        'codeBlockBorderRadius', 'codeHeaderBackground', 'codeHeaderBackgroundDark', 'codeLanguageColor',
        'codeLanguageColorDark', 'codeCopyButtonColor', 'codeCopyButtonColorDark', 'codeCopyButtonHoverBg',
        'codeCopyButtonHoverBgDark', 'codeCopyButtonHoverColor', 'codeCopyButtonHoverColorDark',
        'codeTextColor', 'codeTextColorDark', 'codeCommentColor', 'codeCommentColorDark',
        'codePunctuationColor', 'codePunctuationColorDark', 'codePropertyColor', 'codePropertyColorDark',
        'codeSelectorColor', 'codeSelectorColorDark', 'codeOperatorColor', 'codeOperatorColorDark',
        'codeFunctionColor', 'codeFunctionColorDark', 'codeKeywordColor', 'codeKeywordColorDark',
        'codeVariableColor', 'codeVariableColorDark'
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

${darkMode(`  .code-block-header {
    background-color: ${vars.codeHeaderBackgroundDark};
    border-color: ${vars.codeBlockBorderColorDark};
  }`)}

.code-block-language {
  font-size: ${this.globalVars.fontSizeSm};
  font-weight: ${this.globalVars.fontWeightSemibold};
  color: ${vars.codeLanguageColor};
  text-transform: capitalize;
  font-family: ${this.globalVars.fontFamilyBase};
}

${darkMode(`  .code-block-language {
    color: ${vars.codeLanguageColorDark};
  }`)}

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

${darkMode(`  .code-block-copy {
    color: ${vars.codeCopyButtonColorDark};
  }`)}

.code-block-copy:hover {
  background-color: ${vars.codeCopyButtonHoverBg};
  color: ${vars.codeCopyButtonHoverColor};
}

${darkMode(`  .code-block-copy:hover {
    background-color: ${vars.codeCopyButtonHoverBgDark};
    color: ${vars.codeCopyButtonHoverColorDark};
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
  border: 1px solid ${vars.codeBlockBorderColor};
  border-radius: 0 0 ${vars.codeBlockBorderRadius} ${vars.codeBlockBorderRadius};
}

${darkMode(`  .code-block-wrapper pre {
    border-color: ${vars.codeBlockBorderColorDark};
  }`)}

/* Prism Token Colors */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: ${vars.codeCommentColor};
}

${darkMode(`  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: ${vars.codeCommentColorDark};
  }`)}

.token.punctuation {
  color: ${vars.codePunctuationColor};
}

${darkMode(`  .token.punctuation {
    color: ${vars.codePunctuationColorDark};
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
  color: ${vars.codePropertyColor};
}

${darkMode(`  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: ${vars.codePropertyColorDark};
  }`)}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: ${vars.codeSelectorColor};
}

${darkMode(`  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: ${vars.codeSelectorColorDark};
  }`)}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: ${vars.codeOperatorColor};
}

${darkMode(`  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: ${vars.codeOperatorColorDark};
  }`)}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: ${vars.codeKeywordColor};
}

${darkMode(`  .token.atrule,
  .token.attr-value,
  .token.keyword {
    color: ${vars.codeKeywordColorDark};
  }`)}

.token.function,
.token.class-name {
  color: ${vars.codeFunctionColor};
}

${darkMode(`  .token.function,
  .token.class-name {
    color: ${vars.codeFunctionColorDark};
  }`)}

.token.regex,
.token.important,
.token.variable {
  color: ${vars.codeVariableColor};
}

${darkMode(`  .token.regex,
  .token.important,
  .token.variable {
    color: ${vars.codeVariableColorDark};
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
  color: ${vars.codeTextColor};
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
    color: ${vars.codeTextColorDark};
  }`)}`;
  }
}

