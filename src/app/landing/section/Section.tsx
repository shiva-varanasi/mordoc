/**
 * Section — full-width landing page content block.
 *
 * Provides a visual grouping container with optional background and an
 * optional title rendered as an <h2>. The inner content is constrained
 * to a readable max-width and centered.
 *
 * Background via `background` attribute:
 *   - image path (/... or http...)   → background-image
 *   - CSS color (#hex, rgb, named…)  → background-color
 *   - omitted                        → transparent
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
  let isImageBg = false;

  if (background) {
    const isImagePath =
      background.startsWith('/') ||
      background.startsWith('http://') ||
      background.startsWith('https://');
    if (isImagePath) {
      style.backgroundImage = `url(${background})`;
      isImageBg = true;
    } else {
      style.backgroundColor = background;
    }
  }

  const className = [
    styles.section,
    isImageBg ? styles.hasBackgroundImage : '',
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
