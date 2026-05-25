/**
 * Resolved asset references discovered from config/assets/.
 * Values are absolute disk paths in the pipeline; the Vite plugin and build
 * step rewrite them to `/_assets/<basename>` web URLs before they reach the
 * browser. All fields are optional — the UI renders gracefully without them.
 */
export interface ResolvedAssets {
  /** Favicon path or URL, or null if not present. */
  favicon: string | null;
  /** Light-mode logo path or URL, or null if not present. */
  logo: string | null;
  /** Dark-mode logo path or URL. Falls back to logo if not present. */
  logoDark: string | null;
}
