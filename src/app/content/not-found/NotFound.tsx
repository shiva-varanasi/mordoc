/**
 * Fallback route component for paths that don't match any page.
 *
 * Mirrors the article-column layout (same max-width, padding, and tokens as
 * ArticlePage.tsx) so the 404 page feels like a natural part of the docs rather
 * than an unstyled fallback. No TOC column — there's nothing to link to.
 *
 * On the client this is purely visual — CSR has no concept of an HTTP status
 * code. The SSR/SSG steps also respond with an actual 404 status alongside
 * rendering this component.
 */

import { useLocation } from 'react-router';
import { Button } from '../landing/button/Button.js';
import { Footer } from '../footer/Footer.js';
import { useUiStrings } from '../../i18n/useUiStrings.js';
import styles from './NotFound.module.css';

export function NotFound() {
  const location = useLocation();
  const t = useUiStrings();
  // `{path}` is rendered as a styled <code> element rather than plain text,
  // so this splits the template around the placeholder instead of using
  // formatUiString (which only produces a plain string).
  const [beforePath, afterPath] = t.notFound.description.split('{path}');
  return (
    <div className={styles.page}>
      <div className={styles.articleArea}>
        <div className={styles.article}>
          <p className={styles.code404} aria-hidden="true">404</p>
          <h1 className={styles.title}>{t.notFound.title}</h1>
          <p className={styles.description}>
            {beforePath}<code className={styles.path}>{location.pathname}</code>{afterPath}
          </p>
          <Button path="/">{t.notFound.goHomeButton}</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
