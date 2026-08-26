/**
 * Clip — inline muted, looping demo clip with a click-to-play/pause toggle.
 *
 * The recommended replacement for animated GIFs in content (see the `clip`
 * tag's doc comment in markdoc-config.ts for why): a plain GIF autoplays
 * with no way to stop it, which is both a WCAG 2.2.2 violation (moving
 * content lasting more than 5s needs a pause mechanism) and distracting
 * next to prose. This component renders paused on `thumbnail` by default and
 * only plays once the reader clicks it — same "always animating" look as a
 * GIF once playing, but under the reader's control.
 *
 * Deliberately scoped to short, silent, decorative demo loops — not a
 * general-purpose video player. No lightbox/portal, just an inline
 * play/pause toggle. `alt`, if given, becomes the toggle button's
 * accessible label since the button carries no visible text. A long-form,
 * audible tutorial video is a different tag with different defaults (native
 * controls, no forced mute) — not this component's job.
 *
 * Wired via the `clip` tag in markdoc-config.ts, registered in
 * ArticlePage.tsx's and LandingPage.tsx's components maps.
 */

import { useRef, useState } from 'react';
import styles from './Clip.module.css';

interface ClipProps {
  src: string;
  thumbnail?: string;
  title?: string;
  alt?: string;
}

export function Clip({ src, thumbnail, title, alt }: ClipProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  };

  return (
    <figure className={styles.figure}>
      <div className={styles.wrap}>
        <video
          ref={videoRef}
          className={styles.video}
          src={src}
          poster={thumbnail}
          muted
          loop
          playsInline
          onClick={toggle}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-label={isPlaying ? `Pause${alt ? `: ${alt}` : ''}` : `Play${alt ? `: ${alt}` : ''}`}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 5.5v13a1 1 0 0 0 1.53.848l10.5-6.5a1 1 0 0 0 0-1.696l-10.5-6.5A1 1 0 0 0 7 5.5Z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
      {title && <figcaption className={styles.caption}>{title}</figcaption>}
    </figure>
  );
}

export default Clip;
