/**
 * Skeleton loading screen shown during SPA navigations.
 *
 * Mirrors the article-column layout (same max-width, padding, grid structure
 * as Content.tsx) so the transition feels continuous rather than jarring.
 * Rendered by App.tsx when useNavigation().state === 'loading'.
 *
 * Each Block is a shimmer pill whose width and height are supplied as inline
 * styles. The shimmer animation is driven purely by CSS — no JS timers.
 */

import styles from './Skeleton.module.css';

function Block({ width = '100%', height = '1rem' }: { width?: string; height?: string }) {
  return <div className={styles.block} style={{ width, height }} aria-hidden="true" />;
}

export function Skeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-label="Loading page">
      <div className={styles.articleArea}>
        <div className={styles.article}>

          {/* Breadcrumb stub */}
          <div className={styles.breadcrumbRow}>
            <Block width="8rem" height="0.75rem" />
          </div>

          {/* Article header: title, description lines, meta row */}
          <div className={styles.header}>
            <Block width="62%" height="2.5rem" />
            <div className={styles.headerDesc}>
              <Block width="85%" height="1rem" />
              <Block width="58%" height="1rem" />
            </div>
            <Block width="5rem" height="0.7rem" />
          </div>

          {/* Prose body: paragraph groups + a heading break */}
          <div className={styles.prose}>
            <div className={styles.paraGroup}>
              <Block width="100%" />
              <Block width="96%" />
              <Block width="88%" />
              <Block width="72%" />
            </div>

            <div className={styles.paraGroup}>
              <Block width="100%" />
              <Block width="93%" />
              <Block width="81%" />
            </div>

            <div className={styles.heading}>
              <Block width="42%" height="1.5rem" />
            </div>

            <div className={styles.paraGroup}>
              <Block width="100%" />
              <Block width="97%" />
              <Block width="89%" />
              <Block width="64%" />
            </div>

            <div className={styles.paraGroup}>
              <Block width="100%" />
              <Block width="76%" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
