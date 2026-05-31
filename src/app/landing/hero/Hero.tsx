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
 * `background` sets a background image or color but applies no overlay —
 * the author is responsible for preparing an image that works with the
 * existing text colors.
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
  titleColor?: string;
  titleAccentColor?: string;
  descriptionColor?: string;
  children?: React.ReactNode;
}

export function Hero({ title, titleAccent, description, image, background, titleColor, titleAccentColor, descriptionColor, children }: HeroProps) {
  const style: React.CSSProperties = {};
  if (background) {
    const isImagePath =
      background.startsWith('/') ||
      background.startsWith('http://') ||
      background.startsWith('https://');
    if (isImagePath) {
      style.backgroundImage = `url(${background})`;
    } else {
      style.backgroundColor = background;
    }
  }
  if (titleColor)       (style as Record<string, string>)['--hero-title-color']        = titleColor;
  if (titleAccentColor) (style as Record<string, string>)['--hero-title-accent-color'] = titleAccentColor;
  if (descriptionColor) (style as Record<string, string>)['--hero-desc-color']         = descriptionColor;

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
