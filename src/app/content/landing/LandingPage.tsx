/**
 * LandingPage — renders the landing flavor of a page's content, for pages
 * whose frontmatter declares `layout: landing`. Rendered by Content inside
 * its `.landingLayout` wrapper — Content owns the flavor split and Footer
 * placement (shared with ArticlePage); LandingPage owns only its own
 * content.
 *
 * Unlike ArticlePage, LandingPage has no article chrome: no breadcrumb, no
 * TOC, no read-time badge, no frontmatter title/description header. The
 * author composes the page entirely via Markdoc tags. The .content wrapper
 * has no horizontal padding — hero and section components each own their
 * inner padding so full-bleed backgrounds reach the viewport edge.
 *
 * The same loader mechanism as ArticlePage — lazy
 * virtual:mordoc/page/<routePath> — supplies the PageData, so SSR, SSG, and
 * HMR all work identically.
 *
 * CJS interop: same Markdoc default-import constraint as ArticlePage.tsx.
 */

import { useEffect } from 'react';
import { useLoaderData } from 'react-router';
import React from 'react';
import Markdoc from '@markdoc/markdoc';
import { useMordocData } from '../../data-context.js';
import { contentComponents } from '../component-map.js';
import { Hero } from './hero/Hero.js';
import { Section } from './section/Section.js';
import type { PageData } from '../../../types/content.js';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const pageData = useLoaderData() as PageData;
  const { site } = useMordocData();

  useEffect(() => {
    const pageTitle = pageData.frontmatter.title;
    document.title = pageTitle ? `${pageTitle} — ${site.name}` : site.name;
  }, [pageData.frontmatter.title, site.name]);

  const rendered = Markdoc.renderers.react(pageData.renderable, React, {
    // Every component an article page can show, plus the two that only
    // exist on landing pages, so the two lists cannot grow apart.
    components: { ...contentComponents, Hero, Section },
  });

  return (
    <div className={styles.content} data-pagefind-body>
      {rendered}
    </div>
  );
}

export default LandingPage;
