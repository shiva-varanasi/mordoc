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

import { useState, useEffect, useLayoutEffect, useCallback, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { SceneSvg } from './SceneSvg.js';
import type { Scene } from '../../../diagrams/generic/scene.js';
import styles from './Diagram.module.css';

interface DiagramProps {
  scene: Scene;
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

export function Diagram({ scene }: DiagramProps) {
  const [isOpen, setIsOpen] = useState(false);
  // `zoom` is a multiplier on top of `fitScale`, not an absolute scale —
  // 100% means "the whole diagram fits the lightbox viewport", whatever
  // that takes, so small diagrams get scaled up and large ones scaled down.
  const [zoom, setZoom] = useState(1);
  const [fitScale, setFitScale] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Each open starts back at 100% (freshly re-fit) rather than remembering
  // the last zoom level from a previous visit to the lightbox.
  const open = () => {
    setZoom(1);
    setFitScale(null);
    setIsOpen(true);
  };
  const close = useCallback(() => setIsOpen(false), []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2))), []);

  // `fitScale` is how much the diagram's native size must be scaled to
  // exactly fill `wrapRef`'s content box (no padding of its own — see
  // Diagram.module.css) — measured live so it tracks viewport resizes too.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const node = wrapRef.current;
    if (!node) return;

    const measure = () => {
      const { clientWidth, clientHeight } = node;
      if (clientWidth > 0 && clientHeight > 0) {
        setFitScale(Math.min(clientWidth / scene.width, clientHeight / scene.height));
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [isOpen, scene.width, scene.height]);

  const effectiveScale = (fitScale ?? 1) * zoom;

  // Escape key closes the lightbox; +/- zoom; body scroll is locked while open.
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-') zoomOut();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, close, zoomIn, zoomOut]);

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

      <div className={styles.zoomControls} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.zoomButton}
          onClick={zoomOut}
          disabled={zoom <= ZOOM_MIN}
          aria-label="Zoom out"
          type="button"
        >
          −
        </button>
        <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
        <button
          className={styles.zoomButton}
          onClick={zoomIn}
          disabled={zoom >= ZOOM_MAX}
          aria-label="Zoom in"
          type="button"
        >
          +
        </button>
      </div>

      <div
        className={styles.lightboxViewport}
        // Drives the CSS aspect-ratio the viewport box sizes itself to (see
        // Diagram.module.css) so the box matches this diagram's own shape
        // instead of a fixed rectangle unrelated to it.
        style={{ '--diagram-ratio': scene.width / scene.height } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={wrapRef} className={styles.lightboxDiagramWrap}>
          {fitScale !== null && <SceneSvg scene={scene} scale={effectiveScale} />}
        </div>
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
