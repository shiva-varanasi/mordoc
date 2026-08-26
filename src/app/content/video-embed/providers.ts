/**
 * Provider lookup for the `videoEmbed` tag — turns a video's public page URL
 * (whatever a reader would paste from their browser's address bar) into the
 * two things VideoEmbed.tsx needs: a provider name ("YouTube", "Vimeo") used
 * for the accessible label when the author doesn't supply `alt`/`title`, and
 * the actual iframe `src` to swap in once the reader clicks play.
 *
 * This is deliberately just a small static table, not a thumbnail-fetching
 * service — see the `videoEmbed` tag's doc comment in markdoc-config.ts for
 * why VideoEmbed never calls a provider's oEmbed API at build time. Adding a
 * new provider (Loom, etc.) means adding one entry here, nothing else.
 */

interface VideoProvider {
  /** Shown on the generic fallback card when no `thumbnail` is given. */
  name: string;
  /** True if this provider owns the given hostname. */
  matches: (hostname: string) => boolean;
  /**
   * Extracts the provider's video ID from any of that provider's URL
   * shapes and returns the iframe embed URL, or `null` if `url` doesn't
   * contain a recognizable video ID (e.g. a channel/profile link).
   */
  embedUrl: (url: URL) => string | null;
}

const providers: VideoProvider[] = [
  {
    name: 'YouTube',
    matches: (hostname) => hostname === 'youtube.com' || hostname === 'youtu.be' || hostname.endsWith('.youtube.com'),
    embedUrl: (url) => {
      // youtu.be/<id> — the id is the entire pathname.
      if (url.hostname === 'youtu.be') {
        const id = url.pathname.slice(1);
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      // youtube.com/watch?v=<id>
      const v = url.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      // youtube.com/embed/<id> or youtube.com/shorts/<id> — already
      // embed-shaped, or one path segment away from it.
      const match = /^\/(?:embed|shorts)\/([^/?]+)/.exec(url.pathname);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    },
  },
  {
    name: 'Vimeo',
    matches: (hostname) => hostname === 'vimeo.com' || hostname === 'player.vimeo.com',
    embedUrl: (url) => {
      // player.vimeo.com/video/<id> — already embed-shaped.
      // vimeo.com/<id> — the id is the entire pathname.
      const match = /^\/(?:video\/)?(\d+)/.exec(url.pathname);
      return match ? `https://player.vimeo.com/video/${match[1]}` : null;
    },
  },
];

export interface VideoEmbedInfo {
  name: string;
  embedUrl: string;
}

/**
 * Resolves a pasted video URL to its provider + embed URL, or `null` when
 * the host isn't a recognized provider, or the URL doesn't parse, or it
 * parses but carries no extractable video ID (e.g. a bare channel link).
 * `VideoEmbed` treats a `null` result as "link out instead of embedding" —
 * see its own doc comment.
 */
export function resolveVideoEmbed(src: string): VideoEmbedInfo | null {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  const provider = providers.find((p) => p.matches(url.hostname));
  if (!provider) return null;

  const embedUrl = provider.embedUrl(url);
  return embedUrl ? { name: provider.name, embedUrl } : null;
}
