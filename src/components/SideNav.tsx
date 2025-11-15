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

  return (
    <li className={`sidenav-item sidenav-item-depth-${depth}`}>
      <div className="sidenav-item-content">
      {item.path ? (
          item.external ? (
            <a
              href={item.path}
              className={`sidenav-link ${isActive ? 'active' : ''}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.icon && <span className="sidenav-icon">{item.icon}</span>}
              <span className="sidenav-label">{item.label}</span>
            </a>
          ) : (
            <Link
              to={item.path}
              className={`sidenav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon && <span className="sidenav-icon">{item.icon}</span>}
              <span className="sidenav-label">{item.label}</span>
            </Link>
          )
        ) : (
          <span className={`sidenav-link ${hasActiveChild ? 'has-active-child' : ''}`}>
            {item.icon && <span className="sidenav-icon">{item.icon}</span>}
            <span className="sidenav-label">{item.label}</span>
          </span>
        )}

        {hasChildren && (
          <button
            className={`sidenav-toggle ${isExpanded ? 'expanded' : 'collapsed'}`}
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <span
              className={`sidenav-toggle-icon ${isExpanded ? 'rotate-down' : 'rotate-right'}`}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 8 8"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M.606 2.334a.75.75 0 0 0-.022 1.06l2.875 3a.75.75 0 0 0 1.082 0L7.416 3.4a.75.75 0 0 0-1.082-1.038L4 4.79 1.667 2.357a.75.75 0 0 0-1.06-.022Z"
                />
              </svg>
            </span>
          </button>
        )}        
      </div>

      {hasChildren && isExpanded && (
        <ul className="sidenav-list sidenav-sublist">
          {item.children!.map((child, index) => (
            <SideNavItem
              key={index}
              item={child}
              currentPath={currentPath}
              depth={depth + 1}
            />
          ))}
        </ul>
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