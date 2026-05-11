import { Outlet } from 'react-router';
import { Header } from './header/Header.js';
import { Sidenav } from './sidenav/Sidenav.js';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.app}>
      <Header />

      <div className={styles.layout}>
        <Sidenav />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
