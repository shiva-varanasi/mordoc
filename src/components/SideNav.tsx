/**
 * SideNav - Sidebar navigation component
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useConfig } from '../client/contexts/ConfigContext';
import { NavigationItem } from '../types/config';

/**
 * Sidebar navigation component
 */
export function SideNav() {
  const { config } = useConfig();
  const location = useLocation();

  // TODO: Determine which sidenav to show based on current page or topnav selection
  const sidenavItems = config.navigation.sidenav || [];

  return (
    <nav className="sidenav">
      <ul className="sidenav-list">
        {sidenavItems.map((item, index) => (
          <SideNavItem
            key={index}
            item={item}
            currentPath={location.pathname}
            depth={0}
          />
        ))}
      </ul>
    </nav>
  );
}

interface SideNavItemProps {
  item: NavigationItem;
  currentPath: string;
  depth: number;
}

/**
 * Individual sidebar navigation item (recursive for nested items)
 */
function SideNavItem({ item, currentPath, depth }: SideNavItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  
  // Check if current path matches this item
  const isActive = item.path === currentPath;
  
  // Check if any child is active
  const hasActiveChild = hasChildren && item.children!.some(child => 
    isPathActive(child, currentPath)
  );

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const ChevronIcon = () => (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 8 8" 
      xmlns="http://www.w3.org/2000/svg"
      className={`sidenav-chevron ${isExpanded ? 'expanded' : 'collapsed'}`}
      aria-hidden="true"
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M.606 2.334a.75.75 0 0 0-.022 1.06l2.875 3a.75.75 0 0 0 1.082 0L7.416 3.4a.75.75 0 0 0-1.082-1.038L4 4.79 1.667 2.357a.75.75 0 0 0-1.06-.022Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <li className={`sidenav-item sidenav-item-depth-${depth}`}>
      {item.path ? (
        item.external ? (
          <div className="sidenav-item-wrapper">
            <a
              href={item.path}
              className={`sidenav-link ${isActive ? 'active' : ''}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.icon && <span className="sidenav-icon">{item.icon}</span>}
              <span className="sidenav-label">{item.label}</span>
              {hasChildren && <ChevronIcon />}
            </a>
            {hasChildren && (
              <button
                className="sidenav-toggle-overlay"
                onClick={handleToggle}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                aria-expanded={isExpanded}
              />
            )}
          </div>
        ) : (
          <div className="sidenav-item-wrapper">
            <Link
              to={item.path}
              className={`sidenav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon && <span className="sidenav-icon">{item.icon}</span>}
              <span className="sidenav-label">{item.label}</span>
              {hasChildren && <ChevronIcon />}
            </Link>
            {hasChildren && (
              <button
                className="sidenav-toggle-overlay"
                onClick={handleToggle}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                aria-expanded={isExpanded}
              />
            )}
          </div>
        )
      ) : (
        <button
          className={`sidenav-link sidenav-group-label ${hasActiveChild ? 'has-active-child' : ''}`}
          onClick={handleToggle}
        >
          {item.icon && <span className="sidenav-icon">{item.icon}</span>}
          <span className="sidenav-label">{item.label}</span>
          {hasChildren && <ChevronIcon />}
        </button>
      )}
  
      {hasChildren && (
        <div className={`sidenav-sublist-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
          <ul className="sidenav-sublist">
            {item.children!.map((child, index) => (
              <SideNavItem
                key={index}
                item={child}
                currentPath={currentPath}
                depth={depth + 1}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

/**
 * Check if a navigation item or any of its children match the current path
 */
function isPathActive(item: NavigationItem, currentPath: string): boolean {
  if (item.path === currentPath) {
    return true;
  }
  
  if (item.children && item.children.length > 0) {
    return item.children.some(child => isPathActive(child, currentPath));
  }
  
  return false;
}

export default SideNav;