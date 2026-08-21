/**
 * ContentLink — SPA-aware link component for Markdoc-rendered prose.
 *
 * Replaces Markdoc's default `<a>` output so that internal route links use
 * React Router's <Link> (client-side navigation, no page reload) while
 * external URLs open in a new tab. Anchor-only links (#heading) are left as
 * plain <a> elements — they are in-page scrolls and do not involve routing.
 *
 * Registered as a custom Markdoc `link` node in markdoc-config.ts and wired
 * into the components map in ArticlePage.tsx and LandingPage.tsx.
 */

import { Link } from 'react-router';
import React from 'react';

interface ContentLinkProps {
  href: string;
  title?: string;
  children?: React.ReactNode;
}

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
}

export function ContentLink({ href, title, children }: ContentLinkProps) {
  if (href.startsWith('#')) {
    return <a href={href} title={title}>{children}</a>;
  }

  if (isExternal(href)) {
    return (
      <a href={href} title={title} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link to={href} title={title}>
      {children}
    </Link>
  );
}

export default ContentLink;
