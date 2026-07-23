/**
 * This file — not `generic/` — is the right home for the dispatch table and
 * `buildScene` below, even though neither is specific to any one diagram
 * type. `generic/` is reserved for shared *contracts* (`Scene`,
 * `DiagramDefinition`) that every concrete diagram type folder depends on,
 * and which have no knowledge that any concrete type exists. This file is
 * the reverse: it's the one place that imports every concrete diagram type
 * (`sequence-diagram/index.js` today, a future `flowchart-diagram/index.js`
 * later) to dispatch between them, and it's the public entry point
 * `markdoc-config.ts` calls into — so it belongs at `src/diagrams/`'s root,
 * a peer to `generic/` and each type folder, not nested inside either.
 */

import type { Scene } from './generic/scene.js';
import type { DiagramDefinition } from './generic/diagram-definition.js';
import * as sequenceDiagram from './sequence-diagram/index.js';

/**
 * Plain object literal dispatch table: a fence's `language` string (e.g.
 * `"sequence-diagram"`) is used directly, as-is, as the lookup key here.
 * No mutable Map, no self-registering "call register() at module load"
 * pattern — mirrors how `markdoc-config.ts`'s own `tags: {}` config object
 * already works in this codebase.
 *
 * Adding a new diagram type means adding one entry here plus a new
 * `src/diagrams/<type>/` folder — nothing under `src/app/` changes.
 */
const diagramTypes: Record<string, DiagramDefinition> = {
  'sequence-diagram': sequenceDiagram,
};

/**
 * Parses and lays out a fenced diagram block's DSL source into a `Scene`.
 * Called once per diagram, in Node, at Markdoc transform time (see the
 * `fence` node's transform in `markdoc-config.ts`) — never on the client.
 *
 * Throws a descriptive error for an unregistered diagram type or invalid
 * DSL syntax, which fails the build rather than silently producing nothing.
 */
export function buildScene(language: string, content: string): Scene {
  const definition = diagramTypes[language];
  if (!definition) {
    throw new Error(
      `Unknown diagram type "${language}". Registered types: ${Object.keys(diagramTypes).join(', ')}`,
    );
  }
  const ast = definition.parse(content);
  return definition.computeLayout(ast);
}
