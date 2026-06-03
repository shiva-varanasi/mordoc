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
 *
 * The prop is named `path` (not `href`) to match Mordoc's authoring
 * convention — consistent with sidenav/topnav YAML and card tags.
 */

import { Link } from 'react-router';
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  path: string;
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
}

function isExternal(path: string) {
  return path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//');
}

export function Button({ path, variant = 'primary', children }: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;

  if (isExternal(path)) {
    return (
      <a href={path} className={className} target="_blank" rel="noopener noreferrer" data-pagefind-ignore>
        {children}
      </a>
    );
  }

  return (
    <Link to={path} className={className} data-pagefind-ignore>
      {children}
    </Link>
  );
}

export default Button;
