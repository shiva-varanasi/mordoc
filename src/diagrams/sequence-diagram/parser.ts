/**
 * Parser for the `sequence-diagram` fence DSL.
 *
 * Syntax (see the project's diagram design notes for the full rationale):
 *
 *   # a comment (ignored)
 *   actor <id> [as "<label>"] [icon=<path>]
 *   <from> -> <to>: <message text>      (solid arrow — a call)
 *   <from> --> <to>: <message text>     (dashed arrow — a return/response)
 *
 * A message's text may contain literal `\n` sequences to force a line break
 * in the rendered label (e.g. `Alice -> Bob: line one\nline two`) — the
 * engine never wraps text automatically; the author decides where labels
 * break, typically after spotting an overflow in the preview.
 *
 * Declaring actors up front is optional — an actor mentioned in a message
 * that was never declared is auto-registered with no icon, label = its id.
 * Column order in the rendered diagram is the order actors are first seen,
 * whether that's an `actor` line or a message line.
 *
 * `icon` is a path the author supplies themselves (typically a file they've
 * placed under the site's `public/` directory, e.g. `/icons/customer.svg`) —
 * this engine ships no bundled icon set.
 */

export interface Actor {
  id: string;
  label: string;
  icon?: string;
}

export type ArrowStyle = 'solid' | 'dashed';

export interface Message {
  from: string;
  to: string;
  /** Rendered label, pre-split on the author's literal `\n` line breaks. Always at least one entry. */
  lines: string[];
  style: ArrowStyle;
}

export interface SequenceDiagramAst {
  actors: Actor[];
  messages: Message[];
}

const IDENTIFIER = '[A-Za-z_][A-Za-z0-9_]*';

// `as "<label>"` must come before `icon=<path>` when both are present —
// keeps the grammar simple (one fixed attribute order) for v1.
const ACTOR_LINE = new RegExp(
  `^actor\\s+(${IDENTIFIER})(?:\\s+as\\s+"([^"]*)")?(?:\\s+icon=(\\S+))?\\s*$`,
);

const MESSAGE_LINE = new RegExp(
  `^(${IDENTIFIER})\\s*(-->|->)\\s*(${IDENTIFIER})\\s*:\\s*(.+)$`,
);

export function parse(content: string): SequenceDiagramAst {
  // A Map (not an array) so re-declaring an already auto-registered actor
  // (e.g. it appeared in a message before its own `actor` line does) updates
  // its label/icon in place without disturbing its column position — Map
  // iteration order follows first-insertion order, not last-write order.
  const actorsById = new Map<string, Actor>();
  const messages: Message[] = [];

  function ensureActor(id: string): void {
    if (!actorsById.has(id)) {
      actorsById.set(id, { id, label: id });
    }
  }

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (line === '' || line.startsWith('#')) continue;

    const actorMatch = ACTOR_LINE.exec(line);
    if (actorMatch) {
      const [, id, label, icon] = actorMatch;
      const existing = actorsById.get(id);
      actorsById.set(id, {
        id,
        label: label ?? existing?.label ?? id,
        icon: icon ?? existing?.icon,
      });
      continue;
    }

    const messageMatch = MESSAGE_LINE.exec(line);
    if (messageMatch) {
      const [, from, arrow, to, text] = messageMatch;
      ensureActor(from);
      ensureActor(to);
      const lines = text.trim().split('\\n').map((textLine) => textLine.trim());
      messages.push({ from, to, lines, style: arrow === '-->' ? 'dashed' : 'solid' });
      continue;
    }

    throw new Error(
      `Invalid sequence-diagram syntax at line ${i + 1}: "${raw.trim()}"\n` +
        'Expected an actor declaration (actor <name> [as "<label>"] [icon=<path>]) ' +
        'or a message (<from> -> <to>: <text> / <from> --> <to>: <text>).',
    );
  }

  if (messages.length === 0) {
    throw new Error(
      'sequence-diagram must contain at least one message, e.g. "Alice -> Bob: Hello"',
    );
  }

  return { actors: [...actorsById.values()], messages };
}
