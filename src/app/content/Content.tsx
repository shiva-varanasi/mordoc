import { useEffect } from 'react';
import { Link, useLoaderData, useLocation } from 'react-router';
import React from 'react';
import Markdoc from '@markdoc/markdoc';
import { useMordocData } from '../data-context.js';
import { Toc } from '../toc/Toc.js';
import { Footer } from '../footer/Footer.js';
import { detectCurrentLang, buildLangPrefix, stripLangPrefix, resolveLabel } from '../lang-utils.js';
import type { PageData } from '../../types/content.js';
import type { SidenavConfig } from '../../types/navigation.js';
import { CodeBlock } from './code-block/CodeBlock.js';
import { Image } from './image/Image.js';
import { Callout } from './callout/Callout.js';
import { Card } from './card/Card.js';
import { CardGrid } from './card/CardGrid.js';
import { Button } from '../landing/button/Button.js';
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

interface BreadcrumbEntry {
  label: string;
  path?: string;
}

function findBreadcrumb(
  items: SidenavConfig,
  targetPath: string,
  ancestors: BreadcrumbEntry[],
): BreadcrumbEntry[] | null {
  for (const item of items) {
    const current: BreadcrumbEntry = { label: item.label, path: item.path };
    if (item.path === targetPath) {
      return [...ancestors, current];
    }
    if (item.children) {
      const found = findBreadcrumb(item.children, targetPath, [...ancestors, current]);
      if (found) return found;
    }
  }
  return null;
}

function resolveActiveSidenavRaw(
  navigation: ReturnType<typeof useMordocData>['navigation'],
  contentPath: string,
): { sectionLabel: string | null; sectionPath: string | null; sidenav: SidenavConfig } {
  if (navigation.kind === 'sidenav') {
    return { sectionLabel: null, sectionPath: null, sidenav: navigation.sidenav };
  }
  const match = navigation.topnav
    .filter((item) => contentPath === item.path || contentPath.startsWith(item.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return {
    sectionLabel: match?.label ?? null,
    sectionPath: match?.path ?? null,
    sidenav: match?.sidenav ?? [],
  };
}

function applyLangToSidenav(
  items: SidenavConfig,
  prefix: string,
  lang: string,
  defaultLanguage: string,
  translations: Record<string, Record<string, string>>,
): SidenavConfig {
  return items.map((item) => ({
    ...item,
    label: resolveLabel(item.label, lang, defaultLanguage, translations),
    path: item.path !== undefined ? `${prefix}${item.path}` : undefined,
    children: item.children
      ? applyLangToSidenav(item.children, prefix, lang, defaultLanguage, translations)
      : undefined,
  }));
}

function estimateReadTime(renderable: unknown): number {
  const text = JSON.stringify(renderable);
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
}

function BreadcrumbSep() {
  return (
    <span className={styles.breadcrumbSep} aria-hidden="true">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </span>
  );
}

function Breadcrumb({ entries }: { entries: BreadcrumbEntry[] }) {
  if (entries.length === 0) return null;
  const lastIndex = entries.length - 1;
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {entries.map((entry, i) => {
        const isCurrent = i === lastIndex;
        const isLink = !isCurrent && entry.path !== undefined;
        return (
          <span key={i} className={styles.breadcrumbItem}>
            {i > 0 && <BreadcrumbSep />}
            {isCurrent ? (
              <span className={styles.breadcrumbCurrent} aria-current="page">
                {entry.label}
              </span>
            ) : isLink ? (
              <Link to={entry.path!} className={styles.breadcrumbLink}>
                {entry.label}
              </Link>
            ) : (
              <span className={styles.breadcrumbMuted}>{entry.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function Content() {
  const pageData = useLoaderData() as PageData;
  const { site, navigation, language, translations } = useMordocData();
  const { pathname } = useLocation();

  const currentLang = detectCurrentLang(pathname, language, site.defaultLanguage);
  const contentPath = stripLangPrefix(pathname, currentLang, site.defaultLanguage);
  const prefix = buildLangPrefix(currentLang, site.defaultLanguage);

  const { sectionLabel, sectionPath, sidenav } = resolveActiveSidenavRaw(navigation, contentPath);
  const processedSidenav = applyLangToSidenav(sidenav, prefix, currentLang, site.defaultLanguage, translations);

  const rawBreadcrumb = findBreadcrumb(processedSidenav, pathname, []) ?? [];
  const resolvedSectionLabel = sectionLabel
    ? resolveLabel(sectionLabel, currentLang, site.defaultLanguage, translations)
    : null;
  const breadcrumb: BreadcrumbEntry[] = [
    { label: 'Home', path: prefix || '/' },
    ...(resolvedSectionLabel && sectionPath
      ? [{ label: resolvedSectionLabel, path: `${prefix}${sectionPath}` }]
      : []),
    ...rawBreadcrumb,
  ];

  const readTime = estimateReadTime(pageData.renderable);

  useEffect(() => {
    const pageTitle = pageData.frontmatter.title;
    document.title = pageTitle ? `${pageTitle} — ${site.name}` : site.name;
  }, [pageData.frontmatter.title, site.name]);

  const rendered = Markdoc.renderers.react(pageData.renderable, React, {
    components: { CodeBlock, Image, Callout, Card, CardGrid, Button },
  });

  return (
    <div className={styles.contentAreaGrid}>
      {/* Article area */}
      <div className={styles.articleArea}>
        <article className={styles.article}>
          <div className={styles.articleMeta}>
            <Breadcrumb entries={breadcrumb} />
          </div>
          <header className={styles.articleHeader}>
            <h1 className={styles.title}>{pageData.frontmatter.title}</h1>
            {typeof pageData.frontmatter.description === 'string' && (
              <p className={styles.description}>{pageData.frontmatter.description}</p>
            )}
            <div className={styles.metaRow}>
              <span className={styles.readTime}>{readTime} MIN READ</span>
            </div>
          </header>
          <div className={styles.prose}>{rendered}</div>
        </article>
      </div>

      {/* TOC area */}
      <aside className={styles.tocArea}>
        <Toc items={pageData.toc} />
      </aside>

      {/* Footer area — spans only under article column, not TOC */}
      <div className={styles.footerArea}>
        <Footer />
      </div>
    </div>
  );
}
