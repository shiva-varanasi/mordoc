import { Link, Outlet } from 'react-router';
import { useMordocData } from './data-context.js';
import { Header } from './header/Header.js';
import styles from './App.module.css';

export function App() {
  const { pagesIndex } = useMordocData();

  return (
    <div className={styles.app}>
      <Header />

      <div className={styles.layout}>
        {/* Placeholder — will be replaced by Sidenav component */}
        <nav aria-label="All pages" className={styles.sidenav}>
          <strong>All pages</strong>
          <ul className={styles.navList}>
            {pagesIndex.map((pageIndex) => (
              <li key={pageIndex.routePath} className={styles.navItem}>
                <Link to={pageIndex.routePath} className={styles.navLink}>
                  <code>{pageIndex.routePath}</code>
                </Link>{' '}
                <span className={styles.navMeta}>[{pageIndex.language}]</span>
              </li>
            ))}
          </ul>
        </nav>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
