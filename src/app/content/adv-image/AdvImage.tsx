/**
 * AdvImage — the `advImage` tag: an image with a caption, which opens larger
 * in a lightbox.
 *
 * Renders a <figure>; its image sits in a button, so the lightbox opens with
 * the mouse and with the keyboard. The lightbox is a full-screen overlay
 * mounted via a React portal on document.body. The portal approach avoids
 * z-index stacking context fights with the fixed header and sidebar.
 *
 * SSR safety: the portal is only rendered when `isOpen` is true, which starts
 * as false — so document.body is never accessed during server-side rendering.
 *
 * A <figure> is a block element, so the `advImage` tag in markdoc-config.ts may
 * only stand on its own line (`inline: false`), never inside a paragraph.
 * Registered in component-map.ts and LandingPage.tsx's components map.
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useUiStrings } from '../../i18n/useUiStrings.js';
import styles from './AdvImage.module.css';

interface AdvImageProps {
  src: string;
  alt?: string;
  caption?: string;
}

export function AdvImage({ src, alt = '', caption }: AdvImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useUiStrings();

  const open = () => setIsOpen(true);

  const close = useCallback(() => setIsOpen(false), []);

  // Escape key closes the lightbox; body scroll is locked while open
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, close]);

  const lightbox = (
    <div
      className={styles.overlay}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={alt || t.image.previewFallbackLabel}
    >
      <button
        className={styles.closeButton}
        onClick={close}
        aria-label={t.image.closePreviewLabel}
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        className={styles.lightboxImageWrap}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className={styles.lightboxImage}
        />
        {caption && <p className={styles.lightboxCaption}>{caption}</p>}
      </div>
    </div>
  );

  return (
    <>
      <figure className={styles.figure}>
        <button type="button" className={styles.trigger} onClick={open}>
          <img
            src={src}
            alt={alt}
            className={styles.image}
          />
        </button>
        {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
      </figure>

      {isOpen && createPortal(lightbox, document.body)}
    </>
  );
}

export default AdvImage;
