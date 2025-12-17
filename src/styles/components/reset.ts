/**
 * CSS Reset and base styles
 * Normalizes browser defaults and sets up base element styling
 */

import { GlobalVariables } from '../types';
import { darkMode } from '../utils';

export class ResetStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(): string {
    return `/* CSS Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: ${this.globalVars.fontFamilyBase};
  font-size: ${this.globalVars.fontSizeBase};
  line-height: ${this.globalVars.lineHeightNormal};
  font-weight: ${this.globalVars.fontWeightNormal};
  color: ${this.globalVars.textPrimaryLight};
  background-color: ${this.globalVars.backgroundColorLight};
}

${darkMode(`  body {
    color: ${this.globalVars.textPrimaryDark};
    background-color: ${this.globalVars.backgroundColorDark};
  }`)}

#root {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

button {
  background: none;
  border: none;
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: inherit;
}

ul, ol {
  list-style: none;
}

h1, h2, h3, h4, h5, h6 {
  font-size: inherit;
  font-weight: inherit;
}

p {
  margin: 0;
}`;
  }
}

