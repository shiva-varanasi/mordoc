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

import { useId, Fragment } from 'react';
import type { Scene, Primitive } from '../../../diagrams/generic/scene.js';

interface SceneSvgProps {
  scene: Scene;
}

export function SceneSvg({ scene }: SceneSvgProps) {
  // useId keeps the dotted-grid pattern's id unique even when several
  // diagrams render on the same page — SSR markup and the client hydration
  // pass must agree on this id, which is exactly what useId guarantees.
  const patternId = `diagram-grid-${useId()}`;

  return (
    <svg
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      width={scene.width}
      height={scene.height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {scene.background && (
        <defs>
          <pattern
            id={patternId}
            width={scene.background.spacing}
            height={scene.background.spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={1} cy={1} r={1} fill={scene.background.dotColor} />
          </pattern>
        </defs>
      )}
      {scene.background && (
        <rect x={0} y={0} width={scene.width} height={scene.height} fill={`url(#${patternId})`} />
      )}
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
          fill={primitive.fill}
          rx={primitive.rx}
          opacity={primitive.opacity}
        />
      );
    case 'line':
      return <LineElement primitive={primitive} />;
    case 'text':
      // React auto-escapes `primitive.content` here — an author's message
      // label can never inject markup, no manual XSS-escaping needed.
      return (
        <text
          x={primitive.x}
          y={primitive.y}
          fill={primitive.fill}
          fontSize={primitive.fontSize}
          fontWeight={primitive.fontWeight}
          textAnchor={primitive.anchor ?? 'start'}
        >
          {primitive.content}
        </text>
      );
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
        stroke={stroke}
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

  return <polygon points={points} fill={color} />;
}
