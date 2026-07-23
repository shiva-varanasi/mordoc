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

/** A single line of text. No wrapping — callers must keep content short. */
export interface TextPrimitive {
  type: 'text';
  x: number;
  y: number;
  content: string;
  fill: string;
  fontSize: number;
  fontWeight?: 'normal' | 'bold';
  /** SVG text-anchor; defaults to 'start' if omitted. */
  anchor?: 'start' | 'middle' | 'end';
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
  /**
   * Optional dotted-grid backdrop, rendered by the generic SVG renderer
   * before any primitives. Any diagram type can opt into this by setting it.
   */
  background?: {
    dotColor: string;
    spacing: number;
  };
  primitives: Primitive[];
}
