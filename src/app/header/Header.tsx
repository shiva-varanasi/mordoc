import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useMordocData } from '../data-context.js';
import { detectCurrentLang, buildLangPrefix, stripLangPrefix, resolveLabel } from '../lang-utils.js';
import { SearchBar } from './SearchBar.js';
import { Topnav } from './Topnav.js';
import { LanguagePicker } from './LanguagePicker.js';
import { Button } from '../landing/button/Button.js';
import type { HeaderLink } from '../../types/navigation.js';
import styles from './Header.module.css';

type Theme = 'light' | 'dark';

interface HeaderProps {
  sidenavOpen: boolean;
  onMenuToggle: () => void;
  onSearchOpen: () => void;
  /** When false, the hamburger/close menu button is not rendered (e.g. on landing pages that have no sidenav). */
  showMenu?: boolean;
  /** Structural layout class injected by App.module.css (.headerArea) */
  className?: string;
}

function HamburgerIcon() {
  return (
    <svg
      width="var(--menu-btn-icon, 20px)"
      height="var(--menu-btn-icon, 20px)"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="var(--menu-btn-icon, 20px)"
      height="var(--menu-btn-icon, 20px)"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: 'var(--toggle-icon-size)', height: 'var(--toggle-icon-size)' }}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ width: 'var(--toggle-icon-size)', height: 'var(--toggle-icon-size)' }}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

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

/**
 * Renders a single headernav.yaml entry. 'link' variant = plain text link;
 * 'primary'/'secondary' delegate to the shared Button component.
 * External paths (http/https) open in a new tab regardless of variant.
 */
function HeaderLinkItem({ item }: { item: HeaderLink }) {
  const variant = item.variant ?? 'link';
  const isExternal =
    item.path.startsWith('http://') ||
    item.path.startsWith('https://') ||
    item.path.startsWith('//');

  if (variant === 'primary' || variant === 'secondary') {
    return <Button path={item.path} variant={variant}>{item.label}</Button>;
  }

  if (isExternal) {
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

  const isExternal = (path: string) =>
    path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//');

  return (
    <div className={styles.headerLinksMenu} ref={wrapperRef}>
      <button
        className={styles.headerLinksMenuBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label="More links"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <EllipsisIcon />
      </button>
      {open && (
        <div className={styles.headerLinksDropdown} role="menu">
          {links.map((item) => {
            const isPrimary = item.variant === 'primary';
            const className = `${styles.dropdownItem}${isPrimary ? ` ${styles.dropdownItemPrimary}` : ''}`;

            if (isExternal(item.path)) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={className}
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
                className={className}
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

export function Header({ sidenavOpen, onMenuToggle, onSearchOpen, showMenu = true, className }: HeaderProps) {
  const { site, assets, language, navigation, headerLinks, translations } = useMordocData();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('mordoc-theme');
      if (stored === 'light' || stored === 'dark') return stored as Theme;
    } catch (e) {}
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('mordoc-theme', theme);
  }, [theme]);

  const currentLang = detectCurrentLang(location.pathname, language, site.defaultLanguage);
  const currentContentPath = stripLangPrefix(location.pathname, currentLang, site.defaultLanguage);
  const translatedHeaderLinks = headerLinks.map((item) => ({
    ...item,
    label: resolveLabel(item.label, currentLang, site.defaultLanguage, translations),
  }));
  const logo = theme === 'dark' ? (assets.logoDark ?? assets.logo) : assets.logo;

  function handleLangChange(newLang: string) {
    const prefix = buildLangPrefix(newLang, site.defaultLanguage);
    const target =
      currentContentPath === '/' ? prefix || '/' : `${prefix}${currentContentPath}`;
    navigate(target);
  }

  const hasTopnav = navigation.kind === 'topnav';

  return (
    <header className={`${styles.header}${className ? ` ${className}` : ''}`}>
      {/* Top bar */}
      <div className={styles.inner}>
        {/* Brand — hamburger + logo */}
        <div className={styles.brand}>
          {showMenu && (
            <button
              className={styles.menuBtn}
              onClick={onMenuToggle}
              aria-label={sidenavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={sidenavOpen}
            >
              {sidenavOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          )}
          <Link to={buildLangPrefix(currentLang, site.defaultLanguage) || '/'} className={styles.logo}>
            {logo ? (
              <img src={logo} alt={site.name} className={styles.logoImage} />
            ) : (
              <span className={styles.logoText}>{site.name}</span>
            )}
          </Link>
        </div>

        {/* Centered search */}
        <div className={styles.search}>
          <SearchBar onOpen={onSearchOpen} />
        </div>

        {/* Right actions */}
        <div className={styles.actions}>
          {translatedHeaderLinks.length > 0 && (
            <>
              {/* Desktop: horizontal strip of links/buttons */}
              <div className={styles.headerLinks}>
                {translatedHeaderLinks.map((item) => (
                  <HeaderLinkItem key={item.path} item={item} />
                ))}
              </div>
              {/* Mobile: collapses into a '...' dropdown */}
              <HeaderLinksOverflowMenu links={translatedHeaderLinks} />
            </>
          )}
          {language && language.languages.length > 1 && (
            <LanguagePicker
              languages={language.languages}
              currentLang={currentLang}
              onChange={handleLangChange}
            />
          )}
          <button
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className={styles.themeToggle}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>

      {/* Topnav second row — desktop only, only when topnav navigation is configured */}
      {hasTopnav && (
        <div className={styles.topnavRow}>
          <Topnav />
        </div>
      )}
    </header>
  );
}
