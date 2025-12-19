/**
 * MobileMenu - Mobile drawer menu component
 * Displays sidenav in a slide-out drawer on mobile devices
 */

import React, { useEffect } from 'react';
import SideNav from './SideNav';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile menu drawer component
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="mobile-menu-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <aside className="mobile-menu-drawer" role="dialog" aria-modal="true">
        <div className="mobile-menu-header">
          <button
            className="mobile-menu-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="mobile-menu-content">
          <SideNav />
        </div>
      </aside>
    </>
  );
}

export default MobileMenu;

