/**
 * `errorElement` for page routes: shown when a route's loader or render
 * throws — most commonly the lazy page chunk failing to load (dev server
 * stopped, network drop, or a redeploy that changed chunk hashes).
 *
 * Deliberately generic: one message for every error, and the raw error is
 * not rendered (meaningless to readers, may leak internal module paths;
 * React Router already logs it to the console). Rendered inside the app
 * shell's <Outlet />, so the header and sidenav stay usable.
 *
 * Recovery is a full document reload of the current URL — re-running the
 * router's loader would not help, since the browser caches a failed module
 * import.
 */

import { useLocation } from 'react-router';
import { Button } from '../landing/button/Button.js';
import { Footer } from '../footer/Footer.js';
import { useUiStrings } from '../../i18n/useUiStrings.js';
import styles from './RouteError.module.css';

export function RouteError() {
  const location = useLocation();
  const t = useUiStrings();
  return (
    <div className={styles.page}>
      <div className={styles.articleArea}>
        <div className={styles.article} role="alert">
          <h1 className={styles.title}>{t.routeError.title}</h1>
          <p className={styles.description}>{t.routeError.description}</p>
          <Button path={location.pathname + location.search + location.hash} reloadDocument>
            {t.routeError.reloadButton}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
