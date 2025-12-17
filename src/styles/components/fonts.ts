/**
 * Font declarations
 * @font-face rules for bundled fonts (Inter)
 */

import { GlobalVariables } from '../types';

export class FontStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(): string {
    return `/* Font Declarations */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/assets/fonts/inter/Inter-VariableFont_opsz,wght.ttf') format('truetype-variations');
  font-named-instance: 'Regular';
}

@font-face {
  font-family: 'Inter';
  font-style: italic;
  font-weight: 100 900;
  font-display: swap;
  src: url('/assets/fonts/inter/Inter-Italic-VariableFont_opsz,wght.ttf') format('truetype-variations');
  font-named-instance: 'Italic';
}`;
  }
}

