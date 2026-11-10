/**
 * Image — a plain content image, as in standard Markdown.
 *
 * Renders only an <img>, which HTML allows everywhere an image can be
 * written: on its own line, inside a sentence and inside a link. Markdoc
 * places every Markdown image inside a paragraph, and a block element such as
 * <figure> is not allowed there. The title shows when hovering.
 *
 * Wired via the `image` node and the `image` tag in markdoc-config.ts,
 * registered in component-map.ts and LandingPage.tsx's components map.
 */

import styles from './Image.module.css';

interface ImageProps {
  src: string;
  alt?: string;
  title?: string;
}

export function Image({ src, alt = '', title }: ImageProps) {
  return <img src={src} alt={alt} title={title} className={styles.image} />;
}

export default Image;
