/**
 * Resolved asset paths discovered from config/assets/.
 * All fields are optional — the UI renders gracefully without them.
 */
export interface ResolvedAssets {
  /** Absolute path to favicon.ico, or null if not present. */
  favicon: string | null;
  /** Absolute path to the light-mode logo, or null if not present. */
  logo: string | null;
  /** Absolute path to the dark-mode logo. Falls back to logo if not present. */
  logoDark: string | null;
}
