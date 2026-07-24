/**
 * Walks any diagram type's `Scene` into real SVG/React elements. Knows
 * nothing about sequence diagrams (or any other specific diagram type) —
 * a future diagram type (e.g. flowchart-diagram) reuses this file unchanged
 * as long as its own layout.ts also produces a `Scene`.
 *
 * `Scene`/`Primitive` are imported *by type only*: they're plain data
 * definitions, not runtime code, so this import erases at compile time and
 * never actually pulls in anything from outside this client-side folder.
 */

import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import type { Scene, Primitive } from '../../../diagrams/generic/scene.js';

interface SceneSvgProps {
  scene: Scene;
  // When set, renders at exactly `scene.width/height * scale` CSS pixels via
  // inline style (which wins over the `.figure svg { width: 100% }` fit-to-
  // container rule). Omit it for the inline thumbnail, where that rule
  // should keep governing size as before.
  scale?: number;
}

export function SceneSvg({ scene, scale }: SceneSvgProps) {
  const sizeStyle =
    scale !== undefined ? { width: scene.width * scale, height: scene.height * scale } : undefined;

  return (
    <svg
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      width={scene.width}
      height={scene.height}
      style={sizeStyle}
      xmlns="http://www.w3.org/2000/svg"
    >
      {scene.primitives.map((primitive, index) => (
        <PrimitiveElement key={index} primitive={primitive} />
      ))}
    </svg>
  );
}

function PrimitiveElement({ primitive }: { primitive: Primitive }) {
  switch (primitive.type) {
    case 'rect':
      return (
        <rect
          x={primitive.x}
          y={primitive.y}
          width={primitive.width}
          height={primitive.height}
          style={{ fill: primitive.fill }}
          rx={primitive.rx}
          opacity={primitive.opacity}
        />
      );
    case 'line':
      return <LineElement primitive={primitive} />;
    case 'text':
      return <TextPrimitiveElement primitive={primitive} />;
    case 'image':
      return (
        <image
          href={primitive.href}
          x={primitive.x}
          y={primitive.y}
          width={primitive.width}
          height={primitive.height}
        />
      );
    case 'group':
      return (
        <g>
          {primitive.children.map((child, index) => (
            <PrimitiveElement key={index} primitive={child} />
          ))}
        </g>
      );
  }
}

type TextPrimitiveType = Extract<Primitive, { type: 'text' }>;

/**
 * With `anchor: 'middle'`, each of `lines` is centered independently on `x`
 * — so a `leadMarker` (a sequence-diagram step's "3.") can't be placed a
 * fixed distance from `x` itself: `x` is the *center* of every line, not
 * its left edge, and that left edge varies per line (whichever line is
 * widest sticks out furthest). A fixed offset from center lands the marker
 * on top of whichever word ends up nearest the middle instead of outside
 * the block.
 *
 * So the marker is a sibling `<text>`, positioned from the *measured*
 * bounding box of the rendered lines (`getBBox()`) rather than computed at
 * layout time — `layout.ts` never sees real glyph widths, only the browser
 * does. `useLayoutEffect` re-measures after every paint that could change
 * that box, and runs before the browser presents the frame, so there's no
 * visible jump from the fallback position it starts at.
 */
function TextPrimitiveElement({ primitive }: { primitive: TextPrimitiveType }) {
  const lineHeight = primitive.lineHeight ?? primitive.fontSize * DEFAULT_LINE_HEIGHT_RATIO;
  const anchor = primitive.anchor ?? 'start';
  const linesRef = useRef<SVGTextElement>(null);
  const [markerX, setMarkerX] = useState(primitive.x - LEAD_MARKER_GAP);

  useLayoutEffect(() => {
    if (!primitive.leadMarker || anchor !== 'middle') return;
    const node = linesRef.current;
    if (!node) return;
    setMarkerX(node.getBBox().x - LEAD_MARKER_GAP);
  }, [primitive.leadMarker, anchor, primitive.x, primitive.fontSize, primitive.lines.join('\n')]);

  return (
    <Fragment>
      {/* React auto-escapes each line here — an author's message label can
          never inject markup, no manual XSS-escaping needed. */}
      <text
        ref={linesRef}
        x={primitive.x}
        y={primitive.y}
        style={{ fill: primitive.fill }}
        fontSize={primitive.fontSize}
        fontWeight={primitive.fontWeight}
        textAnchor={anchor}
      >
        {primitive.lines.map((line, index) => (
          <tspan key={index} x={primitive.x} dy={index === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
      {primitive.leadMarker && (
        <text
          x={markerX}
          y={primitive.y}
          style={{ fill: primitive.fill }}
          fontSize={primitive.fontSize}
          textAnchor="end"
        >
          {primitive.leadMarker}
        </text>
      )}
    </Fragment>
  );
}

type LinePrimitiveType = Extract<Primitive, { type: 'line' }>;

function LineElement({ primitive }: { primitive: LinePrimitiveType }) {
  const { x1, y1, x2, y2, stroke, strokeWidth, dashed, arrow } = primitive;

  return (
    <Fragment>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        style={{ stroke }}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '4 4' : undefined}
      />
      {arrow && (
        <ArrowheadElement
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          color={stroke}
          length={primitive.arrowheadLength ?? DEFAULT_ARROWHEAD_LENGTH}
          width={primitive.arrowheadWidth ?? DEFAULT_ARROWHEAD_WIDTH}
        />
      )}
    </Fragment>
  );
}

// Fallback for a `LinePrimitive` that omits arrowhead dimensions — every
// arrow this codebase currently emits sets them explicitly (from the owning
// diagram type's theme), but the primitive format itself doesn't require it.
const DEFAULT_ARROWHEAD_LENGTH = 8;
const DEFAULT_ARROWHEAD_WIDTH = 5;

// Fallback for a `TextPrimitive` that omits `lineHeight` — every multi-line
// label this codebase currently emits sets it explicitly (from the owning
// diagram type's theme), but the primitive format itself doesn't require it.
const DEFAULT_LINE_HEIGHT_RATIO = 1.2;

// Horizontal space between a `leadMarker` (e.g. "3.") and the text block it
// precedes. Also its unmeasured fallback position (see TextPrimitiveElement)
// — fine as-is for anchor !== 'middle', which never overwrites it.
const LEAD_MARKER_GAP = 4;

/**
 * Draws a filled triangle at (x2, y2) pointing away from (x1, y1). Computed
 * manually rather than via an SVG `<marker>` so every arrow can have its own
 * color without maintaining a `<defs><marker>` per color.
 */
function ArrowheadElement({
  x1,
  y1,
  x2,
  y2,
  color,
  length,
  width,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  length: number;
  width: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const hypot = Math.hypot(dx, dy) || 1; // guards against a zero-length line
  const unitX = dx / hypot;
  const unitY = dy / hypot;
  // The perpendicular unit vector — the arrowhead's two back corners sit
  // symmetrically on either side of the line along this direction.
  const perpX = -unitY;
  const perpY = unitX;

  const backX = x2 - unitX * length;
  const backY = y2 - unitY * length;

  const points = [
    `${x2},${y2}`,
    `${backX + perpX * width},${backY + perpY * width}`,
    `${backX - perpX * width},${backY - perpY * width}`,
  ].join(' ');

  return <polygon points={points} style={{ fill: color }} />;
}
