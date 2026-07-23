import type { Scene } from './scene.js';

/**
 * The contract every diagram type implements. `build-scene.ts` looks a
 * type up by its fence language (e.g. "sequence-diagram") in a plain object
 * literal and calls these two functions in sequence — it never inspects
 * `Ast` itself, just threads `parse()`'s output straight into `computeLayout()`.
 *
 * `Ast` is intentionally each diagram type's own shape (e.g. sequence-diagram's
 * `{ actors, messages }`) — there is no shared AST format across diagram types,
 * only a shared `Scene` output format.
 */
export interface DiagramDefinition<Ast = unknown> {
  parse(content: string): Ast;
  computeLayout(ast: Ast): Scene;
}
