/**
 * Callout — block-level callout box for note, warning, and danger messages.
 *
 * Registered as a Markdoc tag (not a node), so authors use the
 * {% callout type="note" title="..." %}...{% /callout %} syntax.
 * Children are rendered Markdoc content (React nodes) passed through
 * Markdoc.renderers.react — no special handling needed.
 *
 * Wired via config.tags in markdoc-config.ts, registered in
 * Content.tsx's components map.
 */

import React from 'react';
import styles from './Callout.module.css';

interface CalloutProps {
  type?: 'note' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
}

function NoteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function DangerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

const icons = {
  note:    <NoteIcon />,
  warning: <WarningIcon />,
  danger:  <DangerIcon />,
};

export function Callout({ type = 'note', title, children }: CalloutProps) {
  return (
    <div className={`${styles.callout} ${styles[type]}`} data-type={type}>
      <div className={styles.iconWrap}>
        {icons[type]}
      </div>
      <div className={styles.body}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export default Callout;
