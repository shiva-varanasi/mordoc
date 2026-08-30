import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../content/landing/button/Button.js';
import type { HeaderLink } from '../../types/navigation.js';
import { useUiStrings } from '../i18n/useUiStrings.js';
import styles from './HeaderLinks.module.css';

function EllipsisIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: 20, height: 20 }}
    >
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function isExternal(path: string) {
  return path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//');
}

/**
 * Renders a single headernav.yaml entry. 'link' variant = plain text link;
 * 'primary'/'secondary' delegate to the shared Button component.
 * External paths (http/https) open in a new tab regardless of variant.
 */
function HeaderLinkItem({ item }: { item: HeaderLink }) {
  const variant = item.variant ?? 'link';

  if (variant === 'primary' || variant === 'secondary') {
    return <Button path={item.path} variant={variant}>{item.label}</Button>;
  }

  if (isExternal(item.path)) {
    return (
      <a
        href={item.path}
        className={styles.headerLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.path} className={styles.headerLink}>
      {item.label}
    </Link>
  );
}

/**
 * Mobile overflow menu — renders a '...' button that opens a dropdown
 * listing all header links. Shown only on small screens via CSS; the
 * horizontal strip is shown on desktop via the sibling `.headerLinks` div.
 *
 * Click-outside closes the dropdown via a ref attached to the wrapper.
 */
function HeaderLinksOverflowMenu({ links }: { links: HeaderLink[] }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = useUiStrings();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className={styles.headerLinksMenu} ref={wrapperRef}>
      <button
        className={styles.headerLinksMenuBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label={t.nav.moreLinksLabel}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <EllipsisIcon />
      </button>
      {open && (
        <div className={styles.headerLinksDropdown} role="menu">
          {links.map((item) => {
            if (isExternal(item.path)) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={styles.dropdownItem}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={styles.dropdownItem}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Header nav links from headernav.yaml — a horizontal strip on desktop,
 * collapsing into a '...' overflow dropdown on mobile. Renders nothing
 * when there are no links configured.
 */
export function HeaderLinks({ links }: { links: HeaderLink[] }) {
  if (links.length === 0) return null;

  return (
    <>
      {/* Desktop: horizontal strip of links/buttons */}
      <div className={styles.headerLinks}>
        {links.map((item) => (
          <HeaderLinkItem key={item.path} item={item} />
        ))}
      </div>
      {/* Mobile: collapses into a '...' dropdown */}
      <HeaderLinksOverflowMenu links={links} />
    </>
  );
}
