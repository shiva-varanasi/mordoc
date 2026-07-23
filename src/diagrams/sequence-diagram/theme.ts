/**
 * Default colors and spacing for the sequence-diagram type.
 *
 * KNOWN LIMITATION: these are literal hex values, baked into each message's
 * `Scene` primitives once, in Node, at build time — before the browser's
 * light/dark theme is known. They will not follow Mordoc's dark-mode toggle
 * today. Fixing this (e.g. emitting `var(--...)` references instead of hex,
 * resolved later by the browser) is a deliberately deferred, not-yet-designed
 * follow-up — see the diagrams design notes.
 */

// Per-actor activation-bar colors, in fixed assignment order (actor 1 always
// gets slot 1, etc. — never re-ordered or randomly cycled, so the same
// diagram always colors its actors identically across renders). Values are
// Mordoc's validated categorical palette, chosen so adjacent activation bars
// stay visually distinct for colorblind and full-color readers alike.
const ACTIVATION_COLORS = [
  '#2a78d6', // blue
  '#008300', // green
  '#e87ba4', // magenta
  '#eda100', // yellow
  '#1baf7a', // aqua
  '#eb6834', // orange
  '#4a3aa7', // violet
  '#e34948', // red
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
  lifelineStroke: '#c3c2b7', // muted, uniform across every actor
  arrowStroke: '#52514e',
  labelColor: '#0b0b0b',
  labelFontSize: 13,
  actorLabelFontSize: 14,

  // ── Dotted grid backdrop ────────────────────────────────────────────────
  background: {
    dotColor: '#e1e0d9',
    spacing: 20,
  },
};
