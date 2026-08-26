/**
 * VideoEmbed — click-to-load embed for a video hosted on YouTube, Vimeo, or
 * another recognized provider.
 *
 * Renders a static facade (thumbnail or generic fallback card + play badge)
 * until clicked; only then does the real provider `<iframe>` get mounted.
 * This matters for page weight, not just aesthetics — a YouTube/Vimeo
 * iframe loads several hundred KB of player JS the instant it's in the DOM,
 * whether or not the reader ever presses play, so a doc page with a few
 * embeds pays that cost on every visit unless the iframe is deferred until
 * an actual click. This is the same "facade" pattern the popular
 * `lite-youtube-embed` library uses.
 *
 * Deliberately does not fetch a real thumbnail from the provider's oEmbed
 * API at build time — that would be this pipeline's first build-time
 * network dependency (every other content feature is local-file-only), and
 * it'd be a new failure mode with no local equivalent (offline build, video
 * went private/deleted, rate limiting). Authors who want a real screenshot
 * supply `thumbnail` themselves, same as `Clip`; otherwise this renders a
 * generic on-brand fallback card with the provider's name and a play icon,
 * which is the same "always show *something* structured, never a blank
 * box" rule link-preview cards (Slack, Twitter, Notion) fall back to when
 * they have no image either.
 *
 * If `src` doesn't resolve to a recognized provider/video ID (see
 * providers.ts), there's nothing to embed — the card links out to `src` in
 * a new tab instead of trying to render a broken iframe.
 *
 * The container's box shape follows `thumbnail`'s own natural aspect ratio
 * (measured once via the image's `onLoad`, since a cross-origin `<iframe>`
 * has no way to report its embedded video's real dimensions back to us —
 * some explicit box size always has to come from our side). That measured
 * ratio is kept in state rather than read fresh each render, so it persists
 * across the click-to-play swap: the iframe that replaces the thumbnail
 * inherits the exact same box, no separate handling needed. Defaults to
 * 16:9 (set in VideoEmbed.module.css) until measured, or permanently when
 * no `thumbnail` is given at all.
 *
 * Wired via the `videoEmbed` tag in markdoc-config.ts, registered in
 * ArticlePage.tsx's and LandingPage.tsx's components maps.
 */

import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { resolveVideoEmbed } from './providers.js';
import styles from './VideoEmbed.module.css';

interface VideoEmbedProps {
  src: string;
  thumbnail?: string;
  title?: string;
  alt?: string;
}

export function VideoEmbed({ src, thumbnail, title, alt }: VideoEmbedProps) {
  const [isActive, setIsActive] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string | undefined>(undefined);
  const embed = resolveVideoEmbed(src);

  const label = alt ?? title ?? (embed ? `${embed.name} video` : 'External video');

  const handleThumbnailLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) setAspectRatio(`${naturalWidth} / ${naturalHeight}`);
  };

  // Shared facade markup for both the "click to embed" and "link out to an
  // unrecognized provider" cases below — they only differ in wrapper
  // element, click behavior, and badge text.
  const facade = (
    <>
      {thumbnail ? (
        <img className={styles.thumbnail} src={thumbnail} alt="" onLoad={handleThumbnailLoad} />
      ) : (
        <div className={styles.fallback} />
      )}
      <span className={styles.toggle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 5.5v13a1 1 0 0 0 1.53.848l10.5-6.5a1 1 0 0 0 0-1.696l-10.5-6.5A1 1 0 0 0 7 5.5Z" fill="currentColor" />
        </svg>
      </span>
      <span className={styles.badge}>{embed ? embed.name : 'External video'}</span>
    </>
  );

  return (
    <figure className={styles.figure}>
      <div className={styles.wrap} style={aspectRatio ? { aspectRatio } : undefined}>
        {isActive && embed ? (
          <iframe
            className={styles.iframe}
            src={`${embed.embedUrl}?autoplay=1`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : embed ? (
          <button type="button" className={styles.card} onClick={() => setIsActive(true)} aria-label={`Play: ${label}`}>
            {facade}
          </button>
        ) : (
          <a href={src} target="_blank" rel="noreferrer noopener" className={styles.card} aria-label={`Open: ${label}`}>
            {facade}
          </a>
        )}
      </div>
      {title && <figcaption className={styles.caption}>{title}</figcaption>}
    </figure>
  );
}

export default VideoEmbed;
