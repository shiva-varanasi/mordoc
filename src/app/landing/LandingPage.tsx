/**
 * LandingPage — full-width route component for pages with `layout: landing`.
 *
 * Rendered instead of Content when a page's frontmatter declares
 * `layout: landing`. The App shell suppresses the sidenav and hamburger
 * for these routes (detected via the route handle set in routes.tsx).
 *
 * Unlike Content, LandingPage has no article chrome: no breadcrumb, no
 * TOC column, no read-time badge, no frontmatter title/description header.
 * The author composes the page entirely via Markdoc tags (cardGrid, card,
 * callout, and future landing-specific tags like hero and section).
 *
 * The same loader mechanism as Content — lazy virtual:mordoc/page/<routePath>
 * — supplies the PageData, so SSR, SSG, and HMR all work identically.
 *
 * CJS interop: same Markdoc default-import constraint as Content.tsx.
 */

import { useEffect } from 'react';
import { useLoaderData } from 'react-router';
import React from 'react';
import Markdoc from '@markdoc/markdoc';
import { useMordocData } from '../data-context.js';
import { Footer } from '../footer/Footer.js';
import { CodeBlock } from '../content/code-block/CodeBlock.js';
import { Image } from '../content/image/Image.js';
import { Callout } from '../content/callout/Callout.js';
import { Card } from '../content/card/Card.js';
import { CardGrid } from '../content/card/CardGrid.js';
import type { PageData } from '../../types/content.js';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const pageData = useLoaderData() as PageData;
  const { site } = useMordocData();

  useEffect(() => {
    const pageTitle = pageData.frontmatter.title;
    document.title = pageTitle ? `${pageTitle} — ${site.name}` : site.name;
  }, [pageData.frontmatter.title, site.name]);

  const rendered = Markdoc.renderers.react(pageData.renderable, React, {
    components: { CodeBlock, Image, Callout, Card, CardGrid },
  });

  return (
    <div className={styles.landing}>
      <div className={styles.content}>
        {rendered}
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;
