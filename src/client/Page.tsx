import { useEffect } from 'react';
import { useLoaderData } from 'react-router';
import React from 'react';
import Markdoc from '@markdoc/markdoc';
import { useMordocData } from './data-context.js';
import type { PageData } from '../types/content.js';

/**
 * Renders a single content page.
 *
 * The route's `loader` has already resolved the lazy
 * `virtual:mordoc/page/<routePath>` module, so `useLoaderData()` returns
 * the full `PageData` synchronously at render time.
 *
 * No custom Markdoc tag components yet — the default theme will wire in
 * callouts, tabs, cards, etc. in a later step. For now we render with an
 * empty components map, which falls back to plain HTML tags.
 *
 * CJS interop: `@markdoc/markdoc` is CommonJS; the default-import shape
 * is required. Destructured named imports like `{ renderers }` fail at
 * runtime under Node/Vite's ESM loader even though the `.d.ts` permits
 * them. Same rule as `markdoc-config.ts` on the Node side.
 */
export function Page() {
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
    <article>
      <header>
        <h1>{pageData.frontmatter.title}</h1>
        {typeof pageData.frontmatter.description === 'string' && (
          <p style={{ color: '#666' }}>{pageData.frontmatter.description}</p>
        )}
      </header>

      {pageData.toc.length > 0 && (
        <nav aria-label="On this page" style={{ background: '#f5f5f5', padding: '1rem', margin: '1rem 0' }}>
          <strong>On this page</strong>
          <ul style={{ margin: '0.5rem 0 0' }}>
            {pageData.toc.map((entry) => (
              <li key={entry.id} style={{ marginLeft: `${(entry.level - 2) * 1}rem` }}>
                <a href={`#${entry.id}`}>{entry.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div>{rendered}</div>
    </article>
  );
}
