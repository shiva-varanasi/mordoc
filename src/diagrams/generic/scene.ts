/**
 * A `Scene` is the output of every diagram type's `computeLayout()` step: a
 * flat, plain-data description of shapes to paint, with no reference to SVG,
 * React, or any specific diagram grammar. It is produced once in Node at
 * Markdoc transform time (see `build-scene.ts`), stored as part of a
 * page's JSON-serializable `PageData`, and walked into real SVG elements on
 * the client by `src/app/content/diagram/SceneSvg.tsx`.
 *
 * Because it's plain data, `Scene` is imported *by type only* from
 * `src/app/` — the actual parsing/layout code that builds one never ships to
 * the client bundle, only the shape of its output does.
 */

/** A filled (optionally rounded) rectangle. Used for activation bars, etc. */
export interface RectPrimitive {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  /** Corner radius, in px. Omit for square corners. */
  rx?: number;
  opacity?: number;
}

/**
 * A straight line segment. Used for lifelines and message arrows.
 * `arrow: true` draws a small filled triangle at (x2, y2), pointing away
 * from (x1, y1) — see `SceneSvg.tsx` for how that's computed.
 */
export interface LinePrimitive {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  dashed?: boolean;
  arrow?: boolean;
  /** Only meaningful when `arrow` is true. Tip-to-back-corner distance, along the shaft. */
  arrowheadLength?: number;
  /** Only meaningful when `arrow` is true. Each back corner's perpendicular offset from the shaft. */
  arrowheadWidth?: number;
}

/**
 * One or more lines of text, stacked downward from (x, y) — (x, y) is the
 * baseline of the first line. Line breaks are always caller-supplied (e.g. a
 * sequence-diagram author's literal `\n` in a message's text); this
 * primitive does no wrapping or text measurement of its own.
 */
export interface TextPrimitive {
  type: 'text';
  x: number;
  y: number;
  lines: string[];
  fill: string;
  fontSize: number;
  fontWeight?: 'normal' | 'bold';
  /** SVG text-anchor; defaults to 'start' if omitted. */
  anchor?: 'start' | 'middle' | 'end';
  /** Baseline-to-baseline distance between stacked lines. Only meaningful when `lines.length > 1`. */
  lineHeight?: number;
  /**
   * A short marker (e.g. a sequence-diagram step's "3.") rendered
   * immediately to the left of the first line, on its own baseline anchor —
   * excluded from `lines` so it never takes part in `anchor`'s centering.
   * Without this, folding a step number into `lines[0]` skews an anchor:
   * 'middle' block's per-line centering toward whichever line carries the
   * prefix; keeping it separate lets the marker hang like a list bullet
   * while the text block centers on its own content.
   */
  leadMarker?: string;
  /**
   * An opaque rect painted behind this text's (and `leadMarker`'s, if
   * present) measured bounding box — keeps a label legible over a busy
   * backdrop (e.g. the diagram canvas's dotted grid). Sized at paint time,
   * not here, since only the browser knows the text's real rendered width —
   * see `SceneSvg.tsx`.
   */
  background?: {
    fill: string;
    /** Extra space beyond the measured text box, in px. */
    paddingX: number;
    paddingY: number;
    /** Corner radius, in px. Omit for square corners. */
    rx?: number;
  };
}

/**
 * An externally-hosted image, referenced by URL (e.g. an author-supplied
 * icon under the site's `public/` directory). Never inlined/bundled by the
 * diagram engine itself — that's deliberately left to the author.
 */
export interface ImagePrimitive {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  href: string;
}

/**
 * A logical grouping of primitives (e.g. an actor's icon + label). Purely
 * organizational today — it also gives future per-element interactivity
 * (see the diagrams design notes) a natural place to attach a click target
 * without needing to redesign the primitive shape.
 */
export interface GroupPrimitive {
  type: 'group';
  id?: string;
  children: Primitive[];
}

export type Primitive =
  | RectPrimitive
  | LinePrimitive
  | TextPrimitive
  | ImagePrimitive
  | GroupPrimitive;

export interface Scene {
  width: number;
  height: number;
  primitives: Primitive[];
}
