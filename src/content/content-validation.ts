import path from 'node:path';
import type { ValidateError, ValidationError } from '@markdoc/markdoc';

/*
 * Mordoc works with Markdoc's own validation results: `Markdoc.validate()`
 * returns a list of `ValidateError`s, each holding a `ValidationError` (its
 * level, from `warning` to `critical`, and its message) and the location it
 * was found at. Pages are parsed with their file path, so the location names
 * the file. Markdoc never throws for validation; Mordoc decides what to do
 * with the list.
 */

/**
 * Levels that stop `mordoc build`. Warnings are only reported: some of them
 * come from nesting rules rather than from broken content, and the page
 * still renders.
 */
const BLOCKING_LEVELS: ReadonlySet<ValidationError['level']> = new Set(['error', 'critical']);

export function hasBlockingErrors(errors: readonly ValidateError[]): boolean {
  return errors.some((result) => BLOCKING_LEVELS.has(result.error.level));
}

/** `content/en/guide/setup.md:12  error  Undefined variable: 'productName'` */
export function formatValidateError(result: ValidateError, projectRoot: string): string {
  const filePath = result.location?.file ?? '';
  const file = filePath ? path.relative(projectRoot, filePath).replace(/\\/g, '/') : '(unknown file)';
  // Markdoc counts lines from 0; editors count from 1.
  const line = (result.location?.start.line ?? result.lines[0] ?? 0) + 1;
  return `${file}:${line}  ${result.error.level}  ${result.error.message}`;
}

/** Prints every validation result, one per line, under a short heading. */
export function reportValidateErrors(errors: readonly ValidateError[], projectRoot: string): void {
  if (errors.length === 0) return;
  const noun = errors.length === 1 ? 'problem' : 'problems';
  console.log(`\n  Markdoc found ${errors.length} ${noun} in your content:\n`);
  for (const result of errors) {
    console.log(`  ${formatValidateError(result, projectRoot)}`);
  }
  console.log('');
}

/**
 * Thrown by `mordoc build` to stop when validation finds errors. The errors
 * themselves are already listed for the author, so the CLI prints only this
 * message, without a stack trace.
 */
export class ValidationFailedError extends Error {
  constructor(errors: readonly ValidateError[]) {
    const blocking = errors.filter((result) => BLOCKING_LEVELS.has(result.error.level)).length;
    const noun = blocking === 1 ? 'error' : 'errors';
    super(`Your content has ${blocking} ${noun}, listed above. Fix them and build again.`);
    this.name = 'ValidationFailedError';
  }
}
