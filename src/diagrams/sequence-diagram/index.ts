/**
 * This type's `DiagramDefinition` — see `build-scene.ts`, which imports
 * `parse` and `computeLayout` from here as one object under the
 * `"sequence-diagram"` key of its dispatch table.
 */
export { parse } from './parser.js';
export { computeLayout } from './layout.js';
