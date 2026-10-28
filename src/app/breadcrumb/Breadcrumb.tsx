import { Link } from 'react-router';
import { useUiStrings } from '../i18n/useUiStrings.js';
import type { BreadcrumbEntry } from './useBreadcrumb.js';
import styles from './Breadcrumb.module.css';

/**
 * The breadcrumb trail rendered above a page's title — shared by guides
 * (`ArticlePage`) and API operation pages (`Operation`). Purely
 * presentational; `useBreadcrumbEntries` does the resolution.
 */

function BreadcrumbSep() {
  return (
    <span className={styles.sep} aria-hidden="true">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </span>
  );
}

export function Breadcrumb({ entries }: { entries: BreadcrumbEntry[] }) {
  const t = useUiStrings();
  if (entries.length === 0) return null;
  const lastIndex = entries.length - 1;
  return (
    <nav className={styles.breadcrumb} aria-label={t.breadcrumb.ariaLabel}>
      {entries.map((entry, i) => {
        const isCurrent = i === lastIndex;
        const isLink = !isCurrent && entry.path !== undefined;
        return (
          <span key={i} className={styles.item}>
            {i > 0 && <BreadcrumbSep />}
            {isCurrent ? (
              <span className={styles.current} aria-current="page">
                {entry.label}
              </span>
            ) : isLink ? (
              <Link to={entry.path!} className={styles.link}>
                {entry.label}
              </Link>
            ) : (
              <span className={styles.muted}>{entry.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
