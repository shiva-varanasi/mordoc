import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { useMordocData } from '../data-context.js';
import { detectCurrentLang, buildLangPrefix, stripLangPrefix, resolveLabel, applyLangToSidenav } from '../lang-utils.js';
import { samePath } from '../path-utils.js';
import type { SidenavConfig, SidenavItem } from '../../types/navigation.js';
import styles from './Sidenav.module.css';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function groupContainsActive(items: SidenavConfig, activePath: string): boolean {
  return items.some(
    (item) =>
      (item.path !== undefined && samePath(item.path, activePath)) ||
      (item.children !== undefined && groupContainsActive(item.children, activePath)),
  );
}

function SidenavList({
  items,
  depth = 0,
  onNavigate,
}: {
  items: SidenavConfig;
  depth?: number;
  onNavigate?: () => void;
}) {
  return (
    <ul className={styles.menu}>
      {items.map((item, i) => (
        <SidenavNode key={i} item={item} depth={depth} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

function SidenavNode({
  item,
  depth,
  onNavigate,
}: {
  item: SidenavItem;
  depth: number;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isGroupActive = item.children
    ? groupContainsActive(item.children, location.pathname)
    : false;
  const isLabelActive = item.path ? samePath(location.pathname, item.path) : false;
  const [open, setOpen] = useState(isGroupActive || isLabelActive || item.expanded === true);

  useEffect(() => {
    if (isGroupActive || isLabelActive) setOpen(true);
  }, [isGroupActive, isLabelActive]);

  // Leaf item — path only, no children
  if (item.path && !item.children) {
    return (
      <li className={styles.menuItem}>
        <NavLink
          to={item.path}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`
          }
        >
          {item.label}
        </NavLink>
      </li>
    );
  }

  // Variant 2 — linked group: whole row navigates + toggles as one unit
  if (item.path && item.children) {
    function handleLinkedGroupClick(e: React.MouseEvent<HTMLAnchorElement>) {
      e.preventDefault();
      if (isLabelActive && open) {
        setOpen(false);
      } else {
        setOpen(true);
        if (!isLabelActive) navigate(item.path!);
      }
    }

    return (
      <li className={styles.menuItem}>
        <a
          href={item.path}
          onClick={handleLinkedGroupClick}
          aria-expanded={open}
          className={isLabelActive ? `${styles.linkedGroupLabel} ${styles.linkActive}` : styles.linkedGroupLabel}
        >
          <span>{item.label}</span>
          <ChevronIcon open={open} />
        </a>
        {open && (
          <div className={styles.groupContent}>
            <SidenavList items={item.children} depth={depth + 1} onNavigate={onNavigate} />
          </div>
        )}
      </li>
    );
  }

  // Variant 1 — non-linked group label, whole row toggles
  return (
    <li className={styles.menuItem}>
      <button
        className={styles.groupLabelTrigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.groupLabelText}>{item.label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && item.children && (
        <div className={styles.groupContent}>
          <SidenavList items={item.children} depth={depth + 1} onNavigate={onNavigate} />
        </div>
      )}
    </li>
  );
}

function resolveActiveSidenav(
  navigation: ReturnType<typeof useMordocData>['navigation'],
  contentPath: string,
): SidenavConfig {
  if (navigation.kind === 'sidenav') return navigation.sidenav;

  const match = navigation.topnav
    .filter((item) => samePath(contentPath, item.path) || contentPath.startsWith(item.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return match?.sidenav ?? [];
}

/**
 * Renders the topnav section links inside the mobile off-canvas drawer.
 * Hidden on desktop (display:none) — the `<Topnav>` row handles desktop.
 * Only rendered when navigation.kind === 'topnav'; returns null otherwise.
 */
export function MobileTopnavSection({ onNavigate }: { onNavigate?: () => void } = {}) {
  const { navigation, language, site, translations } = useMordocData();
  const { pathname } = useLocation();

  if (navigation.kind !== 'topnav') return null;

  const currentLang = detectCurrentLang(pathname, language, site.defaultLanguage);
  const prefix = buildLangPrefix(currentLang, site.defaultLanguage);

  return (
    <div className={styles.mobileTopnav}>
      <ul className={styles.menu}>
        {navigation.topnav.map((item) => (
          <li key={item.path} className={styles.menuItem}>
            <NavLink
              to={`${prefix}${item.path}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {resolveLabel(item.label, currentLang, site.defaultLanguage, translations)}
            </NavLink>
          </li>
        ))}
      </ul>
      <hr className={styles.mobileTopnavDivider} />
    </div>
  );
}

export function Sidenav({ onNavigate }: { onNavigate?: () => void } = {}) {
  const { navigation, language, site, translations } = useMordocData();
  const { pathname } = useLocation();

  const currentLang = detectCurrentLang(pathname, language, site.defaultLanguage);
  const contentPath = stripLangPrefix(pathname, currentLang, site.defaultLanguage);
  const sidenav = resolveActiveSidenav(navigation, contentPath);

  if (sidenav.length === 0) {
    return <nav className={styles.sidenav} aria-label="Side navigation" />;
  }

  const prefix = buildLangPrefix(currentLang, site.defaultLanguage);
  const processedSidenav = applyLangToSidenav(
    sidenav,
    prefix,
    currentLang,
    site.defaultLanguage,
    translations,
  );

  return (
    <nav className={styles.sidenav} aria-label="Side navigation">
      <SidenavList items={processedSidenav} depth={0} onNavigate={onNavigate} />
    </nav>
  );
}
