/**
 * Hero — full-width landing page hero section.
 *
 * Always renders as a centered column. When `image` is provided it appears
 * below the CTAs (full inner width), giving a "product preview" feel.
 *
 * Title supports two lines via `title` + `titleAccent`. `titleAccent` is
 * rendered on a new line in the accent color so authors can highlight a key
 * phrase without any custom CSS.
 *
 * `background` sets a background image (a path or URL) and applies no
 * overlay — the author is responsible for preparing an image that works
 * with the existing text colors. Solid background color, title color,
 * title-accent color, and description color are all design decisions, not
 * content — they live in Hero.module.css's tokens (--hero-bg,
 * --hero-title-color, --hero-title-accent-color, --hero-desc-color) so a
 * site owner controls them once via CSS, not per-instance in markdown.
 *
 * Registered as a Markdoc tag (`hero`) in markdoc-config.ts and in
 * LandingPage.tsx's components map.
 */

import React from 'react';
import styles from './Hero.module.css';

interface HeroProps {
  title: string;
  titleAccent?: string;
  description?: string;
  image?: string;
  background?: string;
  children?: React.ReactNode;
}

export function Hero({ title, titleAccent, description, image, background, children }: HeroProps) {
  const style: React.CSSProperties = {};
  if (background) {
    style.backgroundImage = `url(${background})`;
  }

  return (
    <section className={styles.hero} style={style}>
      <div className={styles.inner}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            <span>{title}</span>
            {titleAccent && (
              <>
                <br />
                <span className={styles.titleAccent}>{titleAccent}</span>
              </>
            )}
          </h1>
          {description && (
            <p className={styles.heroDescription}>{description}</p>
          )}
          {children && (
            <div className={styles.heroCtas}>{children}</div>
          )}
        </div>
        {image && (
          <div className={styles.heroImageWrap}>
            <img src={image} alt="" className={styles.heroImage} />
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;
