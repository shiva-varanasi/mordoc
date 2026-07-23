/**
 * Diagram — the one React component every diagram type renders through
 * (only sequence-diagram exists today; a future flowchart-diagram etc.
 * reuses this unchanged). Renders the Scene inline as SVG via SceneSvg.tsx,
 * and opens a fullscreen lightbox on click.
 *
 * Mirrors Image.tsx's lightbox pattern exactly: useState + createPortal to
 * document.body + Escape-key close + body-scroll lock. See that file for the
 * SSR-safety reasoning (the portal only renders once `isOpen` flips true, so
 * document.body is never touched during server-side rendering).
 *
 * Wired via the `fence` node's transform in markdoc-config.ts (which produces
 * a `Diagram` tag for any ```<type>-diagram fence), registered in
 * Content.tsx's components map.
 */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { SceneSvg } from './SceneSvg.js';
import type { Scene } from '../../../diagrams/generic/scene.js';
import styles from './Diagram.module.css';

interface DiagramProps {
  scene: Scene;
}

export function Diagram({ scene }: DiagramProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = useCallback(() => setIsOpen(false), []);

  // Escape key closes the lightbox; body scroll is locked while open.
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
      aria-label="Diagram preview"
    >
      <button
        className={styles.closeButton}
        onClick={close}
        aria-label="Close diagram preview"
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={styles.lightboxDiagramWrap} onClick={(e) => e.stopPropagation()}>
        <SceneSvg scene={scene} />
      </div>
    </div>
  );

  return (
    <>
      <figure className={styles.figure} onClick={open}>
        <SceneSvg scene={scene} />
      </figure>

      {isOpen && createPortal(lightbox, document.body)}
    </>
  );
}

export default Diagram;
