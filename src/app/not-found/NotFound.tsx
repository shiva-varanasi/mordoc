/**
 * Fallback route component for paths that don't match any page.
 *
 * Mirrors the article-column layout (same max-width, padding, and tokens as
 * Content.tsx) so the 404 page feels like a natural part of the docs rather
 * than an unstyled fallback. No TOC column — there's nothing to link to.
 *
 * On the client this is purely visual — CSR has no concept of an HTTP status
 * code. The SSR/SSG steps also respond with an actual 404 status alongside
 * rendering this component.
 */

import { Link, useLocation } from 'react-router';
import { Footer } from '../footer/Footer.js';
import styles from './NotFound.module.css';

export function NotFound() {
  const location = useLocation();
  return (
    <div className={styles.page}>
      <div className={styles.articleArea}>
        <div className={styles.article}>
          <p className={styles.code404} aria-hidden="true">404</p>
          <h1 className={styles.title}>Page not found</h1>
          <p className={styles.description}>
            No page exists at <code className={styles.path}>{location.pathname}</code>.
          </p>
          <Link to="/" className={styles.homeButton}>Go home</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
