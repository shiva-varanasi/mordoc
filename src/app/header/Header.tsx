import { Link, useLocation, useNavigate } from 'react-router';
import { useMordocData } from '../data-context.js';
import { detectCurrentLang, buildLangPrefix, stripLangPrefix, resolveLabel } from '../lang-utils.js';
import { SearchBar } from './SearchBar.js';
import { Topnav } from './Topnav.js';
import { LanguagePicker } from './LanguagePicker.js';
import { HeaderLinks } from './HeaderLinks.js';
import { ThemeToggle } from './ThemeToggle.js';
import { useTheme } from './useTheme.js';
import styles from './Header.module.css';

interface HeaderProps {
  sidenavOpen: boolean;
  onMenuToggle: () => void;
  onSearchOpen: () => void;
  /** When false, the hamburger/close menu button is not rendered (e.g. on landing pages that have no sidenav). */
  showMenu?: boolean;
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

export function Header({ sidenavOpen, onMenuToggle, onSearchOpen, showMenu = true }: HeaderProps) {
  const { site, assets, language, navigation, headerLinks, translations } = useMordocData();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

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
    <div className={styles.header}>
      {/* Primary row */}
      <div className={styles.primaryArea}>
        {/* Left section — hamburger + logo */}
        <div className={styles.leftSection}>
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

        {/* Middle section — centered search */}
        <div className={styles.middleSection}>
          <SearchBar onOpen={onSearchOpen} />
        </div>

        {/* Right section — actions */}
        <div className={styles.rightSection}>
          <HeaderLinks links={translatedHeaderLinks} />
          {language && language.languages.length > 1 && (
            <LanguagePicker
              languages={language.languages}
              currentLang={currentLang}
              onChange={handleLangChange}
            />
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Topnav second row — desktop only, only when topnav navigation is configured */}
      {hasTopnav && (
        <div className={styles.topnavArea}>
          <Topnav />
        </div>
      )}
    </div>
  );
}
