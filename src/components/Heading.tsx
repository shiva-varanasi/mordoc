/**
 * Heading - Heading component with anchor link copy functionality
 */

import React, { useState } from 'react';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
  children: React.ReactNode;
  [key: string]: any;
}

/**
 * Heading component with copy link icon
 */
export function Heading({ level, id, children, ...props }: HeadingProps) {
  const [showCopied, setShowCopied] = useState(false);
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const handleCopyLink = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!id) return;

    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <Tag id={id} className="heading-with-anchor" {...props}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="heading-anchor-link"
          onClick={handleCopyLink}
          aria-label="Link to this heading"
          title="Copy link to heading"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"
              fill="currentColor"
            />
          </svg>
          {showCopied && <span className="heading-copied-tooltip">Copied!</span>}
        </a>
      )}
    </Tag>
  );
}

export default Heading;