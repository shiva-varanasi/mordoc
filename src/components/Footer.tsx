/**
 * Footer - Site footer
 */

import React from 'react';
import { useConfig } from '../client/contexts/ConfigContext';

/**
 * Site footer component
 */
export function Footer() {
  const { config } = useConfig();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-text">
            © {currentYear} {config.metadata.title}
            {config.metadata.author && ` • ${config.metadata.author}`}
          </p>
          
          <p className="footer-powered">
            Powered by <a href="https://github.com/yourusername/mordoc" target="_blank" rel="noopener noreferrer">Mordoc</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;