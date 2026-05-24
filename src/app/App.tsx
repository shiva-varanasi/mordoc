import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from './header/Header.js';
import { Sidenav } from './sidenav/Sidenav.js';
import { useMordocData } from './data-context.js';
import styles from './App.module.css';

export function App() {
  const [sidenavOpen, setSidenavOpen] = useState(false);
  const location = useLocation();
  const { navigation } = useMordocData();

  // Close sidenav on navigation (mobile)
  useEffect(() => {
    setSidenavOpen(false);
  }, [location.pathname]);

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
      <Header
        sidenavOpen={sidenavOpen}
        onMenuToggle={() => setSidenavOpen((o) => !o)}
        className={styles.headerArea}
      />
      <div className={styles.layout}>
        <aside
          className={`${styles.sidenavArea} ${sidenavOpen ? styles.sidenavAreaOpen : ''}`}
          aria-label="Side navigation"
        >
          <Sidenav />
        </aside>
        {sidenavOpen && (
          <div
            className={styles.overlay}
            onClick={() => setSidenavOpen(false)}
            aria-hidden="true"
          />
        )}
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
