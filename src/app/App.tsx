import { useEffect, useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation, useMatches, useNavigation } from 'react-router';
import { Header } from './header/Header.js';
import { Sidenav, MobileTopnavSection } from './sidenav/Sidenav.js';
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

  // Latest pathname, readable from the scroll-lock effect's cleanup without
  // making that effect re-run on every route change.
  const pathnameRef = useRef(location.pathname);
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Lock background scroll while the mobile drawer is open. Plain
  // `overflow: hidden` doesn't reliably stop touch-scrolling on iOS, so pin
  // body in place at its current scroll offset and restore it on close.
  useEffect(() => {
    if (!sidenavOpen) return;
    const openedPathname = pathnameRef.current;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = { position: style.position, top: style.top, left: style.left, right: style.right };
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = '0';
    style.right = '0';
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      // Only re-apply the old offset if the drawer closed WITHOUT navigating
      // (toggle button / backdrop tap / same-page link). A real route change
      // is <ScrollRestoration>'s job — forcing the old offset here would
      // fight it and can leave the new page stuck mid-scroll instead of at top.
      if (pathnameRef.current === openedPathname) {
        window.scrollTo(0, scrollY);
      }
    };
  }, [sidenavOpen]);

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

  // Toggle a class instead of an inline style so that CSS media queries can
  // override --topnav-area-height to 0px on mobile (inline styles win the
  // cascade unconditionally, making the @media override impossible). The
  // rule reacting to this class lives in Header.module.css, not here —
  // Header owns its own row heights.
  useEffect(() => {
    document.documentElement.classList.toggle('has-topnav', navigation.kind === 'topnav');
  }, [navigation.kind]);

  return (
    <div className={styles.app}>
      <ScrollRestoration />
      <header className={styles.headerArea}>
        <Header
          sidenavOpen={sidenavOpen}
          onMenuToggle={() => setSidenavOpen((o) => !o)}
          onSearchOpen={() => setSearchOpen(true)}
          showMenu={!isLanding}
        />
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className={styles.layout}>
        {!isLanding && (
          <aside
            className={`${styles.sidenavArea} ${sidenavOpen ? styles.sidenavAreaOpen : ''}`}
          >
            <MobileTopnavSection onNavigate={() => setSidenavOpen(false)} />
            <Sidenav onNavigate={() => setSidenavOpen(false)} />
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
