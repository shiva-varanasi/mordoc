/**
 * Mobile menu styles
 * Drawer and backdrop for mobile navigation
 */

import { GlobalVariables } from '../types';
import { darkMode } from '../utils';

export class MobileMenuStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(): string {
    return `/* Mobile Menu */
.mobile-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.mobile-menu-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: ${this.globalVars.backgroundColorLight};
  z-index: 95;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

${darkMode(`  .mobile-menu-drawer {
    background: ${this.globalVars.backgroundColorDark};
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  }`)}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.mobile-menu-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: ${this.globalVars.spacingMd};
  border-bottom: 1px solid ${this.globalVars.borderColorLight};
  flex-shrink: 0;
}

${darkMode(`  .mobile-menu-header {
    border-bottom-color: ${this.globalVars.borderColorDark};
  }`)}

.mobile-menu-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  color: ${this.globalVars.textPrimaryLight};
  cursor: pointer;
  border-radius: ${this.globalVars.borderRadiusMd};
  transition: background-color 0.2s ease;
}

${darkMode(`  .mobile-menu-close {
    color: ${this.globalVars.textPrimaryDark};
  }`)}

.mobile-menu-close:hover {
  background: ${this.globalVars.surfaceColorLight};
}

${darkMode(`  .mobile-menu-close:hover {
    background: ${this.globalVars.surfaceColorDark};
  }`)}

.mobile-menu-content {
  flex: 1;
  overflow-y: auto;
  padding: ${this.globalVars.spacingMd};
}`;
  }
}

