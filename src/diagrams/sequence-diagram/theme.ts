/**
 * Default colors and spacing for the sequence-diagram type.
 *
 * Colors are `var(--diagram-...)` references, not literal hex — they're baked
 * into each message's `Scene` primitives once, in Node, at build time, but
 * resolve in the browser at paint time, so they follow Mordoc's light/dark
 * toggle live. The actual light/dark hex pairs live in Diagram.module.css
 * (`:root` / `:global(.dark)`), alongside this codebase's other themeable
 * chrome tokens.
 */

// Per-actor activation-bar colors, in fixed assignment order (actor 1 always
// gets slot 1, etc. — never re-ordered or randomly cycled, so the same
// diagram always colors its actors identically across renders). Values are
// Mordoc's validated categorical palette, chosen so adjacent activation bars
// stay visually distinct for colorblind and full-color readers alike.
const ACTIVATION_COLORS = [
  'var(--diagram-activation-1)', // blue
  'var(--diagram-activation-2)', // green
  'var(--diagram-activation-3)', // magenta
  'var(--diagram-activation-4)', // yellow
  'var(--diagram-activation-5)', // aqua
  'var(--diagram-activation-6)', // orange
  'var(--diagram-activation-7)', // violet
  'var(--diagram-activation-8)', // red
];

export const theme = {
  activationColors: ACTIVATION_COLORS,

  // ── Layout ──────────────────────────────────────────────────────────────
  marginX: 90, // horizontal margin before the first / after the last lifeline
  columnWidth: 260, // horizontal space allotted per actor lifeline
  headerHeight: 70, // vertical space reserved for each actor's icon + label
  iconSize: 40,
  topPadding: 40, // gap between the header row and the first message
  stepHeight: 60, // vertical space allotted per message
  bottomPadding: 30, // gap between the last message and the lifeline's end

  // ── Activation bars ─────────────────────────────────────────────────────
  activationWidth: 10,
  activationPadding: 14, // how far a bar extends above/below the arrows it spans

  // ── Self-message loop ────────────────────────────────────────────────────
  selfLoopWidth: 40,
  selfLoopHalfHeight: 20,

  // ── Arrowheads ───────────────────────────────────────────────────────────
  arrowheadLength: 8,
  arrowheadWidth: 5,

  // ── Ink ──────────────────────────────────────────────────────────────────
  lifelineStroke: 'var(--diagram-lifeline)', // muted, uniform across every actor
  arrowStroke: 'var(--diagram-arrow)',
  labelColor: 'var(--diagram-label)',
  labelFontSize: 13,
  // Baseline-to-baseline distance between an author's `\n`-broken label
  // lines. Also drives how much extra vertical room a row needs beyond the
  // single-line default.
  labelLineHeight: 15,
  // Gap between a cross-actor message label's bottom line and the arrow it
  // sits above.
  labelArrowGap: 10,
  actorLabelFontSize: 14,

  // ── Message label background ────────────────────────────────────────────
  // Same color as the canvas itself (not a new hue) — the goal is to erase
  // the dotted grid immediately behind a label, not to draw an obvious box.
  labelBg: 'var(--diagram-label-bg)',
  labelBgPaddingX: 4,
  labelBgPaddingY: 3,
  labelBgRadius: 4,
};
