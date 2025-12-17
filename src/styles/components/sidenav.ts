/**
 * Side navigation component styles
 * Left sidebar navigation menu with collapsible sections
 */

import { GlobalVariables } from '../types';
import { mergeOverrides } from '../utils';

interface SideNavVariables {
  // Customizable
  navBackgroundLight: string;
  navBackgroundDark: string;
  navTextColorLight: string;
  navTextColorDark: string;
  navHoverColorLight: string;
  navHoverColorDark: string;
  navHoverBackgroundLight: string;
  navHoverBackgroundDark: string;
  navActiveColorLight: string;
  navActiveColorDark: string;
  navActiveBackgroundLight: string;
  navActiveBackgroundDark: string;
  navGroupLabelColorLight: string;
  navGroupLabelColorDark: string;
  navBorderColorLight: string;
  navBorderColorDark: string;
  navBorderRadius: string;
}

export class SideNavStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: SideNavVariables = {
      navBackgroundLight: '#FAFAFA',
      navBackgroundDark: '#0F0F0F',
      navTextColorLight: '#1C1C1C',
      navTextColorDark: '#F2F2F2',
      navHoverColorLight: '#1C1C1C',
      navHoverColorDark: '#F2F2F2',
      navHoverBackgroundLight: '#E5E5E5',
      navHoverBackgroundDark: '#1F1F1F',
      navActiveColorLight: '#171717',
      navActiveColorDark: '#FAFAFA',
      navActiveBackgroundLight: '#E5E5E5',
      navActiveBackgroundDark: '#1F1F1F',
      navGroupLabelColorLight: 'rgba(28, 28, 28, 0.7)',
      navGroupLabelColorDark: 'rgba(242, 242, 242, 0.7)',
      navBorderColorLight: '#E8E8E8',
      navBorderColorDark: '#1F1F1F',
      navBorderRadius: '6px',
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'navBackgroundLight', 'navBackgroundDark',
        'navTextColorLight', 'navTextColorDark',
        'navHoverColorLight', 'navHoverColorDark',
        'navHoverBackgroundLight', 'navHoverBackgroundDark',
        'navActiveColorLight', 'navActiveColorDark',
        'navActiveBackgroundLight', 'navActiveBackgroundDark',
        'navGroupLabelColorLight', 'navGroupLabelColorDark',
        'navBorderColorLight', 'navBorderColorDark',
        'navBorderRadius'
      ]
    );
    
    return `/* SideNav */
.sidenav {
  background-color: ${vars.navBackgroundLight};
  border-right: 1px solid ${vars.navBorderColorLight};
  padding: 1rem 0.75rem 1rem 0.5rem;
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

[data-theme="dark"] .sidenav {
  background-color: ${vars.navBackgroundDark};
  border-right-color: ${vars.navBorderColorDark};
}

.sidenav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidenav-group {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
}

.sidenav-item {
  margin-bottom: 0.25rem;
}

.sidenav-item-wrapper {
  position: relative;
}

.sidenav-toggle-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1;
  opacity: 0;
}

.sidenav-chevron {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
  opacity: 0.7;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
  margin-left: auto;
}

.sidenav-link:hover .sidenav-chevron {
  opacity: 1;
}

.sidenav-chevron.collapsed {
  transform: rotate(-90deg);
}

.sidenav-chevron.expanded {
  transform: rotate(0deg);
}

.sidenav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: ${vars.navBorderRadius};
  color: ${vars.navTextColorLight};
  text-decoration: none;
  font-size: ${this.globalVars.fontSizeSm};
  line-height: 1.25;
  transition: all 0.15s ease;
  background-color: transparent;
  width: 100%;
  min-height: 2rem;
  border: none;
  text-align: left;
  cursor: pointer;
  position: relative;
}

[data-theme="dark"] .sidenav-link {
  color: ${vars.navTextColorDark};
}

.sidenav-link:hover {
  color: ${vars.navHoverColorLight};
  background-color: ${vars.navHoverBackgroundLight};
}

[data-theme="dark"] .sidenav-link:hover {
  color: ${vars.navHoverColorDark};
  background-color: ${vars.navHoverBackgroundDark};
}

.sidenav-link:focus-visible {
  outline: 2px solid ${vars.navActiveColorLight};
  outline-offset: 2px;
}

[data-theme="dark"] .sidenav-link:focus-visible {
  outline-color: ${vars.navActiveColorDark};
}

.sidenav-link.active {
  color: ${vars.navActiveColorLight};
  background-color: ${vars.navActiveBackgroundLight};
  font-weight: ${this.globalVars.fontWeightMedium};
}

[data-theme="dark"] .sidenav-link.active {
  color: ${vars.navActiveColorDark};
  background-color: ${vars.navActiveBackgroundDark};
}


.sidenav-link.sidenav-group-label {
  font-size: ${this.globalVars.fontSizeXs};
  font-weight: ${this.globalVars.fontWeightMedium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${vars.navGroupLabelColorLight};
  padding: 0.375rem 0.5rem;
  min-height: 2rem;
}

[data-theme="dark"] .sidenav-link.sidenav-group-label {
  color: ${vars.navGroupLabelColorDark};
}

.sidenav-link.sidenav-group-label:hover {
  background-color: transparent;
  opacity: 1;
}

.sidenav-link.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.sidenav-sublist-wrapper {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidenav-sublist-wrapper.collapsed {
  grid-template-rows: 0fr;
}

.sidenav-sublist-wrapper.expanded {
  grid-template-rows: 1fr;
}

.sidenav-sublist {
  list-style: none;
  margin: 0;
  padding-left: 1.5rem;
  overflow: hidden;
  min-height: 0;
}

.sidenav-sublist-wrapper.expanded .sidenav-sublist {
  padding-top: 0.25rem;
}

.sidenav-sublist .sidenav-item {
  margin-bottom: 0.25rem;
}

.sidenav-sublist .sidenav-link {
  min-height: 1.75rem;
  padding: 0.25rem 0.5rem;
}`;
  }
}

