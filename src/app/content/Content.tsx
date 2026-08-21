import { useLoaderData } from 'react-router';
import { ArticlePage } from './article/ArticlePage.js';
import { LandingPage } from './landing/LandingPage.js';
import { Toc } from './toc/Toc.js';
import { Footer } from './footer/Footer.js';
import type { PageData } from '../../types/content.js';
import styles from './Content.module.css';

/**
 * Root component rendered inside App's `.contentArea` for every page route.
 *
 * Owns the layout split between the two page flavors — mirrors the App-level
 * Area pattern one level down: Content owns placement (which flavor renders,
 * where TOC and Footer sit), ArticlePage/LandingPage own only their own
 * content.
 *
 *  - Article flavor: article column + TOC column, with Footer spanning only
 *    under the article column, not TOC. Defined here (not inside
 *    ArticlePage) because Footer's placement needs to know about the TOC
 *    column it's excluding — Footer is a sibling Content owns, not part of
 *    ArticlePage's own content.
 *  - Landing flavor: full width, no TOC, Footer stacked below.
 *
 * `pageData.frontmatter.layout` (already present on `Frontmatter`) is what
 * routes.tsx's `handle.layout` mirrors for App's own sidenav/hamburger
 * decision — this is the same information, read directly off the
 * already-resolved loader data instead of via route handle, since Content
 * has it at hand anyway.
 */
export function Content() {
  const pageData = useLoaderData() as PageData;

  if (pageData.frontmatter.layout === 'landing') {
    return (
      <div className={styles.landingLayout}>
        <LandingPage />
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.contentAreaGrid}>
      <div className={styles.articleArea}>
        <ArticlePage />
      </div>
      <aside className={styles.tocArea}>
        <Toc items={pageData.toc} />
      </aside>
      <div className={styles.footerArea}>
        <Footer />
      </div>
    </div>
  );
}
