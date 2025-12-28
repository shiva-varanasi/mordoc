/**
 * Side navigation component styles
 * Left sidebar navigation menu with collapsible sections
 */

import { GlobalVariables } from '../types';
import { mergeOverrides } from '../utils';

interface SideNavVariables {
  navHoverBackgroundLight: string;
  navHoverBackgroundDark: string;
  navActiveBackgroundLight: string;
  navActiveBackgroundDark: string;
  navActiveTextColorLight: string;
  navActiveTextColorDark: string;
}

export class SideNavStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: SideNavVariables = {
      navHoverBackgroundLight: '#E5E5E5',
      navHoverBackgroundDark: '#1F1F1F',
      navActiveBackgroundLight: '#E5E5E5',
      navActiveBackgroundDark: '#1F1F1F',
      navActiveTextColorLight: '#171717',
      navActiveTextColorDark: '#FAFAFA',
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      [
        'navHoverBackgroundLight', 'navHoverBackgroundDark',
        'navActiveBackgroundLight', 'navActiveBackgroundDark',
        'navActiveTextColorLight', 'navActiveTextColorDark'
      ]
    );
    
    return `/* SideNav */
.sidenav {
  background-color: #FAFAFA;
  border-right: 1px solid #E8E8E8;
  padding: 1rem 0.75rem 1rem 0.5rem;
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

[data-theme="dark"] .sidenav {
  background-color: #0F0F0F;
  border-right-color: #1F1F1F;
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
  border-radius: 6px;
  color: #1C1C1C;
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
  color: #F2F2F2;
}

.sidenav-link:hover {
  color: #1C1C1C;
  background-color: ${vars.navHoverBackgroundLight};
}

[data-theme="dark"] .sidenav-link:hover {
  color: #F2F2F2;
  background-color: ${vars.navHoverBackgroundDark};
}

.sidenav-link:focus-visible {
  outline: 2px solid #171717;
  outline-offset: 2px;
}

[data-theme="dark"] .sidenav-link:focus-visible {
  outline-color: #FAFAFA;
}

.sidenav-link.active {
  color: ${vars.navActiveTextColorLight};
  background-color: ${vars.navActiveBackgroundLight};
  font-weight: ${this.globalVars.fontWeightMedium};
}

[data-theme="dark"] .sidenav-link.active {
  color: ${vars.navActiveTextColorDark};
  background-color: ${vars.navActiveBackgroundDark};
}


.sidenav-link.sidenav-group-label {
  font-size: ${this.globalVars.fontSizeXs};
  font-weight: ${this.globalVars.fontWeightMedium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(28, 28, 28, 0.7);
  padding: 0.375rem 0.5rem;
  min-height: 2rem;
}

[data-theme="dark"] .sidenav-link.sidenav-group-label {
  color: rgba(242, 242, 242, 0.7);
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

