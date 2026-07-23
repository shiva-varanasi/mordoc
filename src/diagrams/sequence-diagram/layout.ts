import type { Scene, Primitive } from '../generic/scene.js';
import type { SequenceDiagramAst } from './parser.js';
import { theme } from './theme.js';

/** One continuous "busy" window for a single actor, in message-row indices. */
interface ActivationInterval {
  actorId: string;
  startRow: number;
  endRow: number;
}

/**
 * Turns a parsed sequence-diagram AST into a flat `Scene`. Runs once, in
 * Node, at Markdoc transform time — see `build-scene.ts`.
 */
export function computeLayout(ast: SequenceDiagramAst): Scene {
  const { actors, messages } = ast;

  const actorIndex = new Map(actors.map((actor, i) => [actor.id, i]));
  const columnX = (i: number) => theme.marginX + i * theme.columnWidth;

  const width = theme.marginX * 2 + Math.max(0, actors.length - 1) * theme.columnWidth;
  const lifelineTop = theme.headerHeight;
  const height = lifelineTop + theme.topPadding + messages.length * theme.stepHeight + theme.bottomPadding;
  const lifelineBottom = height;

  // The vertical center of the arrow for a given message row.
  const messageY = (row: number) =>
    lifelineTop + theme.topPadding + row * theme.stepHeight + theme.stepHeight / 2;

  const activationIntervals = computeActivationIntervals(messages, actorIndex);
  const isActiveAt = (actorId: string, row: number) =>
    activationIntervals.some((iv) => iv.actorId === actorId && row >= iv.startRow && row <= iv.endRow);

  const primitives: Primitive[] = [];

  // ── Actor headers (icon + label) and their lifelines ─────────────────────
  actors.forEach((actor, i) => {
    const x = columnX(i);

    const headerChildren: Primitive[] = [];
    let labelY = theme.actorLabelFontSize + 4;
    if (actor.icon) {
      headerChildren.push({
        type: 'image',
        href: actor.icon,
        x: x - theme.iconSize / 2,
        y: 0,
        width: theme.iconSize,
        height: theme.iconSize,
      });
      labelY = theme.iconSize + theme.actorLabelFontSize + 4;
    }
    headerChildren.push({
      type: 'text',
      x,
      y: labelY,
      content: actor.label,
      fill: theme.labelColor,
      fontSize: theme.actorLabelFontSize,
      fontWeight: 'bold',
      anchor: 'middle',
    });
    primitives.push({ type: 'group', id: `actor-${actor.id}-header`, children: headerChildren });

    primitives.push({
      type: 'line',
      x1: x,
      y1: lifelineTop,
      x2: x,
      y2: lifelineBottom,
      stroke: theme.lifelineStroke,
      strokeWidth: 1,
      dashed: true,
    });
  });

  // ── Activation bars — drawn after lifelines, before arrows, so arrows sit
  //    visually on top of / flush against the bar edges they connect to ────
  for (const interval of activationIntervals) {
    const i = actorIndex.get(interval.actorId);
    if (i === undefined) continue; // unreachable given how intervals are built, but keeps this defensive
    const x = columnX(i);
    const color = theme.activationColors[i % theme.activationColors.length];

    // A self-message loop has its own vertical extent (± selfLoopHalfHeight
    // around its row's y) instead of being a flat line at that y, so a
    // segment boundary landing on one needs extra clearance to keep the same
    // effective activationPadding gap beyond the shape actually drawn there.
    const startMessage = messages[interval.startRow];
    const endMessage = messages[interval.endRow];
    const topExtra = startMessage.from === startMessage.to ? theme.selfLoopHalfHeight : 0;
    const bottomExtra = endMessage.from === endMessage.to ? theme.selfLoopHalfHeight : 0;

    const y1 = messageY(interval.startRow) - theme.activationPadding - topExtra;
    const y2 = messageY(interval.endRow) + theme.activationPadding + bottomExtra;
    primitives.push({
      type: 'rect',
      x: x - theme.activationWidth / 2,
      y: y1,
      width: theme.activationWidth,
      height: y2 - y1,
      fill: color,
      rx: 2,
    });
  }

  // ── Messages: numbered arrows + labels ─────────────────────────────────────
  messages.forEach((message, row) => {
    const stepNumber = row + 1;
    const y = messageY(row);
    const labelContent = `${stepNumber}. ${message.text}`;

    if (message.from === message.to) {
      // Self-loops always run rightward out of the lifeline, so — like the
      // "from" side of a rightward cross-actor arrow — they start at the
      // activation bar's right edge (not the bare lifeline center) when the
      // actor is active at this row.
      const selfActive = isActiveAt(message.from, row);
      const selfX = columnX(actorIndex.get(message.from)!) + (selfActive ? theme.activationWidth / 2 : 0);
      primitives.push(...selfMessagePrimitives(message, selfX, y, labelContent));
      return;
    }

    const fromI = actorIndex.get(message.from)!;
    const toI = actorIndex.get(message.to)!;
    const fromX = columnX(fromI);
    const toX = columnX(toI);
    const direction = toX > fromX ? 1 : -1;

    // Arrows start/end at the edge of an activation bar (rather than the raw
    // lifeline center) when the actor on that end is active at this row —
    // this is what makes arrows visually "plug into" the colored bars.
    const fromActive = isActiveAt(message.from, row);
    const toActive = isActiveAt(message.to, row);
    const x1 = fromX + (fromActive ? direction * (theme.activationWidth / 2) : 0);
    const x2 = toX - (toActive ? direction * (theme.activationWidth / 2) : 0);

    primitives.push({
      type: 'line',
      x1,
      y1: y,
      x2,
      y2: y,
      stroke: theme.arrowStroke,
      strokeWidth: 1.5,
      dashed: message.style === 'dashed',
      arrow: true,
      arrowheadLength: theme.arrowheadLength,
      arrowheadWidth: theme.arrowheadWidth,
    });

    primitives.push({
      type: 'text',
      x: (fromX + toX) / 2,
      y: y - 10,
      content: labelContent,
      fill: theme.labelColor,
      fontSize: theme.labelFontSize,
      anchor: 'middle',
    });
  });

  return { width, height, background: theme.background, primitives };
}

/**
 * A self-message (an actor calling itself) is drawn as a small bracket-shaped
 * loop out from and back to its own lifeline, with the label to its right.
 */
function selfMessagePrimitives(
  _message: SequenceDiagramAst['messages'][number],
  x: number,
  y: number,
  labelContent: string,
): Primitive[] {
  const top = y - theme.selfLoopHalfHeight;
  const bottom = y + theme.selfLoopHalfHeight;
  const out = x + theme.selfLoopWidth;

  return [
    { type: 'line', x1: x, y1: top, x2: out, y2: top, stroke: theme.arrowStroke, strokeWidth: 1.5 },
    { type: 'line', x1: out, y1: top, x2: out, y2: bottom, stroke: theme.arrowStroke, strokeWidth: 1.5 },
    {
      type: 'line',
      x1: out,
      y1: bottom,
      x2: x,
      y2: bottom,
      stroke: theme.arrowStroke,
      strokeWidth: 1.5,
      arrow: true,
      arrowheadLength: theme.arrowheadLength,
      arrowheadWidth: theme.arrowheadWidth,
    },
    {
      type: 'text',
      x: out + 8,
      y: y + 4,
      content: labelContent,
      fill: theme.labelColor,
      fontSize: theme.labelFontSize,
      anchor: 'start',
    },
  ];
}

/**
 * Figures out each actor's activation bar(s) from plain message geometry —
 * arrow style (solid/dashed) plays no part in this; it only affects how the
 * arrow line itself is drawn.
 *
 * An actor's bar spans from its first to its last touch row (a row where
 * it's the `from` or `to` of a message), staying continuous through any row
 * that doesn't involve it — *unless* that row is a message between two
 * other actors whose columns straddle this actor's column. Such a message
 * visually crosses this actor's lifeline, so the bar breaks there and
 * resumes at the actor's next touch row. Leftmost/rightmost actors can
 * never be straddled, so they always get a single unbroken bar.
 */
function computeActivationIntervals(
  messages: SequenceDiagramAst['messages'],
  actorIndex: Map<string, number>,
): ActivationInterval[] {
  const intervals: ActivationInterval[] = [];

  for (const [actorId, col] of actorIndex) {
    const touchRows: number[] = [];
    messages.forEach((message, row) => {
      if (message.from === actorId || message.to === actorId) touchRows.push(row);
    });
    if (touchRows.length === 0) continue;

    const firstRow = touchRows[0];
    const lastRow = touchRows[touchRows.length - 1];
    const touchSet = new Set(touchRows);

    let segStart: number | null = null;
    let segEnd: number | null = null;

    for (let row = firstRow; row <= lastRow; row++) {
      if (touchSet.has(row)) {
        if (segStart === null) segStart = row;
        segEnd = row;
        continue;
      }

      const message = messages[row];
      const fromCol = actorIndex.get(message.from)!;
      const toCol = actorIndex.get(message.to)!;
      const crosses = Math.min(fromCol, toCol) < col && col < Math.max(fromCol, toCol);
      if (crosses && segStart !== null) {
        intervals.push({ actorId, startRow: segStart, endRow: segEnd! });
        segStart = null;
        segEnd = null;
      }
    }

    if (segStart !== null) {
      intervals.push({ actorId, startRow: segStart, endRow: segEnd! });
    }
  }

  return intervals;
}
