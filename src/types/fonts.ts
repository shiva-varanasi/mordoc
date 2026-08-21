/**
 * Resolved custom font face declared via one slot of site.json's "fonts"
 * field. `regular`/`italic` are absolute disk paths in the pipeline; the
 * Vite plugin and build step rewrite them to `/_assets/<basename>` web URLs
 * before they reach the browser. Null when the corresponding style wasn't
 * declared.
 */
export interface ResolvedFont {
  /** CSS font-family name to register via @font-face and assign to the slot's CSS variable. */
  family: string;
  regular: string | null;
  italic: string | null;
}

/**
 * Resolved custom fonts for a project, one slot per CSS role. A slot is
 * null when its corresponding site.json fonts.<slot> declaration is absent
 * — the site falls back to Mordoc's default stack for that role.
 */
export interface ResolvedFonts {
  body: ResolvedFont | null;
  code: ResolvedFont | null;
}
