/**
 * Image — inline content image with a lightbox popup.
 *
 * Renders a styled <figure> inline; clicking it opens a full-screen overlay
 * via a React portal mounted on document.body. The portal approach avoids
 * z-index stacking context fights with the fixed header and sidebar.
 *
 * SSR safety: the portal is only rendered when `isOpen` is true, which starts
 * as false — so document.body is never accessed during server-side rendering.
 *
 * Wired via the `image` node override in markdoc-config.ts, registered in
 * Content.tsx's components map.
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Image.module.css';

interface ImageProps {
  src: string;
  alt?: string;
  title?: string;
}

export function Image({ src, alt = '', title }: ImageProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      aria-label={alt || 'Image preview'}
    >
      <button
        className={styles.closeButton}
        onClick={close}
        aria-label="Close image preview"
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
        {title && <p className={styles.lightboxCaption}>{title}</p>}
      </div>
    </div>
  );

  return (
    <>
      <figure className={styles.figure} onClick={open}>
        <img
          src={src}
          alt={alt}
          className={styles.image}
        />
        {title && <figcaption className={styles.caption}>{title}</figcaption>}
      </figure>

      {isOpen && createPortal(lightbox, document.body)}
    </>
  );
}

export default Image;
