/**
 * Callout component styles
 * Note, warning, and danger callout boxes
 */

import { GlobalVariables } from '../types';
import { darkMode } from '../utils';

export class CalloutStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(): string {
    return `/* Callout Component */
/* Base Callout Container */
.callout {
  background-color: #F5F5F5;
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  border-left-style: solid;
  border-left-width: 4px;
}

/* Note Callout (Blue/Cyan) */
.callout-note {
  border-left-color: #47A3D1;
}

/* Warning Callout (Amber/Yellow) */
.callout-warning {
  border-left-color: #E6911A;
}

/* Danger Callout (Red) */
.callout-danger {
  border-left-color: #D22D2D;
}

/* Callout Title */
.callout-title {
  font-weight: 600;
  font-size: 16px;
  line-height: 1.4;
  margin-bottom: 4px;
  color: #0f172a;
}

/* Callout Body Text */
.callout-body {
  font-size: 16px;
  line-height: 1.625;
  color: #576375;
}

/* Icon Styling */
.callout-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  color: #576375;
}

${darkMode(`  .callout {
    background-color: #1D212B;
  }
  
  .callout-title {
    color: #F3F5F7;
  }
  
  .callout-body {
    color: #8A99A8;
  }
  
  .callout-icon {
    color: #8A99A8;
  }`)}`;
  }
}

