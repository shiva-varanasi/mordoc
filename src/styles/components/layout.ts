/**
 * Layout styles
 * Main layout structure, grid, and container styles
 */

import { GlobalVariables } from '../types';
import { mediaQuery } from '../utils';

export class LayoutStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(): string {
    return `/* Layout */
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-container {
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
  height: calc(100vh - ${this.globalVars.headerHeight});
}

.layout-sidebar {
  width: 300px;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
}

.layout-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  height: 100%;
  display: flex;
  justify-content: center;
}

.layout-main-inner {
  width: 100%;
  max-width: 1400px;
  padding: 3rem 1.5rem;
}

.container {
  max-width: ${this.globalVars.containerWidthXl};
  margin: 0 auto;
  padding: 0 ${this.globalVars.spacingMd};
}

${mediaQuery('lg', `  .layout-sidebar {
    width: 220px;
  }`)}

${mediaQuery('md', `  .layout-sidebar {
    width: 200px;
  }

  .layout-main-inner {
    padding: ${this.globalVars.spacingMd};
  }`)}

${mediaQuery('sm', `  .layout-container {
    flex-direction: column;
  }

  .layout-sidebar {
    width: 100%;
    height: auto;
    max-height: 300px;
  }

  .layout-main-inner {
    padding: ${this.globalVars.spacingSm};
  }`)}`;
  }
}

