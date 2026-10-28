import { useEffect } from 'react';
import { useLoaderData } from 'react-router';
import React from 'react';
import Markdoc from '@markdoc/markdoc';
import { useMordocData } from '../../data-context.js';
import { useUiStrings } from '../../i18n/useUiStrings.js';
import { formatUiString } from '../../i18n/format.js';
import type { PageData } from '../../../types/content.js';
import { contentComponents } from '../component-map.js';
import { Breadcrumb } from '../../breadcrumb/Breadcrumb.js';
import { useBreadcrumbEntries } from '../../breadcrumb/useBreadcrumb.js';
import styles from './ArticlePage.module.css';
import typography from '../Typography.module.css';

/**
 * Renders the article flavor of a content page: breadcrumb, title/description
 * header, and the Markdoc-rendered prose body.
 *
 * Rendered by Content inside its `.articleArea` grid cell — Content owns the
 * surrounding grid (TOC column, footer placement); ArticlePage owns only its
 * own content, same split as every other Area/component pair in the app.
 *
 * The route's `loader` has already resolved the lazy
 * `virtual:mordoc/page/<routePath>` module, so `useLoaderData()` returns
 * the full `PageData` synchronously at render time.
 *
 * CJS interop: `@markdoc/markdoc` is CommonJS; the default-import shape
 * is required. Destructured named imports like `{ renderers }` fail at
 * runtime under Node/Vite's ESM loader even though the `.d.ts` permits
 * them. Same rule as `markdoc-config.ts` on the Node side.
 */

function estimateReadTime(renderable: unknown): number {
  const text = JSON.stringify(renderable);
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
}

export function ArticlePage() {
  const pageData = useLoaderData() as PageData;
  const { site } = useMordocData();
  const t = useUiStrings();

  const breadcrumb = useBreadcrumbEntries();
  const readTime = estimateReadTime(pageData.renderable);

  useEffect(() => {
    const pageTitle = pageData.frontmatter.title;
    document.title = pageTitle ? `${pageTitle} — ${site.name}` : site.name;
  }, [pageData.frontmatter.title, site.name]);

  const rendered = Markdoc.renderers.react(pageData.renderable, React, {
    components: contentComponents,
  });

  return (
    <article className={styles.article} data-pagefind-body>
      <div className={styles.articleMeta} data-pagefind-ignore>
        <Breadcrumb entries={breadcrumb} />
      </div>
      <header className={styles.articleHeader}>
        <h1 className={typography.title} data-pagefind-meta="title">{pageData.frontmatter.title}</h1>
        {typeof pageData.frontmatter.description === 'string' && (
          <p className={styles.description}>{pageData.frontmatter.description}</p>
        )}
        <div className={styles.metaRow} data-pagefind-ignore>
          <span className={styles.readTime}>{formatUiString(t.article.readTime, { count: readTime })}</span>
        </div>
      </header>
      <div className={typography.prose}>{rendered}</div>
    </article>
  );
}
