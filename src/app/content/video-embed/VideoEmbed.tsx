/**
 * VideoEmbed — embeds a video hosted on YouTube, Vimeo, Loom, or another
 * recognized provider (as opposed to `clip`'s self-hosted file).
 *
 * Mounts the provider's real embed iframe immediately — no click-to-load
 * facade, no author-supplied `thumbnail` required for a recognized
 * provider. This is a deliberate trade-off, not an oversight:
 * YouTube/Vimeo/Loom's own embedded players already render a "cover" state
 * — the video's real thumbnail, title, and a play button — the instant
 * their iframe loads, even without `autoplay`. Building a facade on top of
 * that would just be reproducing, by hand and per-author, a thumbnail these
 * providers already give away for free (this component used to require an
 * author-supplied `thumbnail` for exactly that reason — see git history).
 *
 * The cost side of that trade-off: unlike `Clip` (which *does* defer a
 * heavy asset until click, because there's no provider iframe to lean on
 * for a self-hosted file), every `videoEmbed` here now loads its provider's
 * player JS/CSS on page load whether or not a reader ever presses play —
 * measured at ~200KB+ of network transfer per distinct YouTube video.
 * `loading="lazy"` below softens this for below-the-fold embeds (deferred
 * until near-viewport, no click required) but doesn't eliminate it. This
 * mirrors how Mintlify and most other docs tooling embed video, and was
 * chosen over the old click-to-load design specifically to get correct
 * thumbnails/aspect ratios for free — see the `videoEmbed` tag's doc
 * comment in markdoc-config.ts for the full trade-off discussion.
 *
 * `aspectRatio` lets an author override the default 16:9 box (e.g. "4 / 3",
 * "9 / 16") — mainly needed for Loom, whose recordings inherit whatever
 * shape the recorder's screen/window was, unlike YouTube/Vimeo which are
 * almost always 16:9.
 *
 * If `src` doesn't resolve to a recognized provider/video ID (see
 * providers.ts), there's no provider iframe to lean on for a cover state —
 * the card falls back to the old thumbnail-or-fallback + play icon facade
 * and links out to `src` in a new tab instead of trying to render a broken
 * iframe. `thumbnail` only matters in this fallback case.
 *
 * The container's box shape follows `aspectRatio` when given; otherwise, in
 * the fallback case, it follows `thumbnail`'s own natural aspect ratio
 * (measured once via the image's `onLoad`, same reasoning as `Clip`); it
 * defaults to 16:9 (set in VideoEmbed.module.css) otherwise.
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
  aspectRatio?: string;
}

export function VideoEmbed({ src, thumbnail, title, alt, aspectRatio }: VideoEmbedProps) {
  const [measuredRatio, setMeasuredRatio] = useState<string | undefined>(undefined);
  const embed = resolveVideoEmbed(src);
  const ratio = aspectRatio ?? measuredRatio;

  const label = alt ?? title ?? (embed ? `${embed.name} video` : 'External video');

  const handleThumbnailLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) setMeasuredRatio(`${naturalWidth} / ${naturalHeight}`);
  };

  return (
    <figure className={styles.figure}>
      <div className={styles.wrap} style={ratio ? { aspectRatio: ratio } : undefined}>
        {embed ? (
          <iframe
            className={styles.iframe}
            src={embed.embedUrl}
            title={label}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <a href={src} target="_blank" rel="noreferrer noopener" className={styles.card} aria-label={`Open: ${label}`}>
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
          </a>
        )}
      </div>
      {title && <figcaption className={styles.caption}>{title}</figcaption>}
    </figure>
  );
}

export default VideoEmbed;
