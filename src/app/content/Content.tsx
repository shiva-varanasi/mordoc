import { useEffect } from 'react';
import { useLoaderData } from 'react-router';
import React from 'react';
import Markdoc from '@markdoc/markdoc';
import { useMordocData } from '../data-context.js';
import { Toc } from '../toc/Toc.js';
import type { PageData } from '../../types/content.js';
import styles from './Content.module.css';

/**
 * Renders a single content page.
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
export function Content() {
  const pageData = useLoaderData() as PageData;
  const { site } = useMordocData();

  useEffect(() => {
    const pageTitle = pageData.frontmatter.title;
    document.title = pageTitle ? `${pageTitle} — ${site.name}` : site.name;
  }, [pageData.frontmatter.title, site.name]);

  const rendered = Markdoc.renderers.react(pageData.renderable, React, {
    components: {},
  });

  return (
    <div className={styles.page}>
      <article className={styles.article}>
        <header>
          <h1>{pageData.frontmatter.title}</h1>
          {typeof pageData.frontmatter.description === 'string' && (
            <p style={{ color: '#666' }}>{pageData.frontmatter.description}</p>
          )}
        </header>
        <div>{rendered}</div>
      </article>
      <Toc items={pageData.toc} />
    </div>
  );
}
