import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useMordocData } from '../data-context.js';
import { detectCurrentLang, buildLangPrefix, stripLangPrefix } from '../lang-utils.js';
import { SearchBar } from './SearchBar.js';
import { Topnav } from './Topnav.js';
import { LanguagePicker } from './LanguagePicker.js';
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

export function Header({ sidenavOpen, onMenuToggle, onSearchOpen, showMenu = true, className }: HeaderProps) {
  const { site, assets, language, navigation } = useMordocData();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('mordoc-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('mordoc-theme', theme);
  }, [theme]);

  const currentLang = detectCurrentLang(location.pathname, language, site.defaultLanguage);
  const currentContentPath = stripLangPrefix(location.pathname, currentLang, site.defaultLanguage);
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
          <Link to="/" className={styles.logo}>
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
