import { useEffect, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation, useMatches, useNavigation } from 'react-router';
import { Header } from './header/Header.js';
import { Sidenav } from './sidenav/Sidenav.js';
import { SearchModal, switchPagefind } from './header/SearchModal.js';
import { Skeleton } from './skeleton/Skeleton.js';
import { useMordocData } from './data-context.js';
import { detectCurrentLang } from './lang-utils.js';
import styles from './App.module.css';

export function App() {
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const matches = useMatches();
  const { navigation, site, language } = useMordocData();
  const currentLang = detectCurrentLang(location.pathname, language, site.defaultLanguage);

  const routerNav = useNavigation();
  const currentLayout = (matches.at(-1)?.handle as { layout?: string } | undefined)?.layout ?? 'content';
  const isLanding = currentLayout === 'landing';

  // Close sidenav on navigation (mobile)
  useEffect(() => {
    setSidenavOpen(false);
  }, [location.pathname]);

  // Sync <html lang> and Pagefind index whenever the active language changes.
  // Runs on initial mount (initial preload) and on every language switch.
  useEffect(() => {
    document.documentElement.lang = currentLang;
    if (!import.meta.env.DEV) {
      const hasMultiLang = language !== null && language.languages.length > 1;
      const indexPath = hasMultiLang
        ? `/pagefind-${currentLang}/pagefind.js`
        : '/pagefind/pagefind.js';
      switchPagefind(indexPath);
    }
  }, [currentLang]); // eslint-disable-line react-hooks/exhaustive-deps

  // Global Cmd/Ctrl+K shortcut to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keep --topnav-height in sync so sticky offsets (sidenav, TOC, scroll-margin)
  // stay correct whether or not a topnav row is present.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--topnav-height',
      navigation.kind === 'topnav' ? '2.75rem' : '0px',
    );
  }, [navigation.kind]);

  return (
    <div className={styles.app}>
      <ScrollRestoration />
      <Header
        sidenavOpen={sidenavOpen}
        onMenuToggle={() => setSidenavOpen((o) => !o)}
        onSearchOpen={() => setSearchOpen(true)}
        showMenu={!isLanding}
        className={styles.headerArea}
      />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className={styles.layout}>
        {!isLanding && (
          <aside
            className={`${styles.sidenavArea} ${sidenavOpen ? styles.sidenavAreaOpen : ''}`}
            aria-label="Side navigation"
          >
            <Sidenav />
          </aside>
        )}
        {!isLanding && sidenavOpen && (
          <div
            className={styles.overlay}
            onClick={() => setSidenavOpen(false)}
            aria-hidden="true"
          />
        )}
        <div className={styles.contentArea}>
          {routerNav.state === 'loading' ? <Skeleton /> : <Outlet />}
        </div>
      </div>
    </div>
  );
}
