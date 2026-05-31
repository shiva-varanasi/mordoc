/**
 * Heading — renders h1–h6 with a hover-reveal anchor link icon.
 *
 * Clicking the icon does three things via a plain <a href="#id">:
 *   1. Browser natively updates the URL to currentPath#id
 *   2. Browser natively scrolls the heading into view (scroll-margin-top in
 *      Content.module.css already accounts for the fixed topnav offset)
 *   3. onClick copies the full URL (with hash) to the clipboard and shows
 *      a brief "Copied" tooltip
 *
 * The icon is hidden by default and revealed on heading hover via CSS.
 * Registered as a custom Markdoc `heading` node in markdoc-config.ts.
 */

import React, { useState } from 'react';
import styles from './Heading.module.css';

interface HeadingProps {
  id: string;
  level: number;
  children?: React.ReactNode;
}

function LinkIcon() {
  return (
    <svg
      width="0.75em"
      height="0.75em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function Heading({ id, level, children }: HeadingProps) {
  const [copied, setCopied] = useState(false);
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Tag id={id} className={styles.heading}>
      {children}
      <a
        href={`#${id}`}
        onClick={handleClick}
        className={styles.anchor}
        aria-label="Copy link to this section"
      >
        <LinkIcon />
        {copied && <span className={styles.tooltip}>Copied</span>}
      </a>
    </Tag>
  );
}

export default Heading;
