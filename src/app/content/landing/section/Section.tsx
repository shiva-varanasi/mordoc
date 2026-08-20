/**
 * Section — full-width landing page content block.
 *
 * Provides a visual grouping container with an optional background image and
 * an optional title rendered as an <h2>. The inner content is constrained to
 * a readable max-width and centered.
 *
 * `background` accepts an image path/URL only — a solid background color is
 * a design decision, not content, and lives in Section.module.css's
 * --section-bg token so a site owner controls it once via CSS.
 *
 * Children can be any mix of Markdoc block content (headings, paragraphs,
 * lists, code fences) and custom tags (cardGrid, card, callout, button).
 *
 * Registered as a Markdoc tag (`section`) in markdoc-config.ts and in
 * LandingPage.tsx's components map.
 */

import React from 'react';
import styles from './Section.module.css';

interface SectionProps {
  title?: string;
  background?: string;
  children?: React.ReactNode;
}

export function Section({ title, background, children }: SectionProps) {
  const style: React.CSSProperties = {};
  if (background) {
    style.backgroundImage = `url(${background})`;
  }

  const className = [
    styles.section,
    background ? styles.hasBackgroundImage : '',
  ].filter(Boolean).join(' ');

  return (
    <section className={className} style={style}>
      <div className={styles.inner}>
        {title && <h2 className={styles.sectionTitle}>{title}</h2>}
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}

export default Section;
