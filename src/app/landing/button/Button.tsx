/**
 * Button — styled CTA link for landing pages and content pages.
 *
 * Renders as a React Router Link for internal paths (starting with "/")
 * or a plain <a target="_blank"> for external URLs.
 *
 * Markdoc wraps the button's body text in a <p> tag because the tag is
 * block-level. The CSS collapses it with `display: contents` so the
 * button renders as a clean inline-flex element regardless.
 *
 * Registered as a Markdoc tag (`button`) in markdoc-config.ts and in
 * LandingPage.tsx's components map. Also registered in Content.tsx so it
 * can be used in regular content pages.
 */

import { Link } from 'react-router';
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  href: string;
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
}

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
}

export function Button({ href, variant = 'primary', children }: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;

  if (isExternal(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export default Button;
