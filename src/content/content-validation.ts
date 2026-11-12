import path from 'node:path';
import Markdoc from '@markdoc/markdoc';
import type { Config, Node, Schema, ValidateError, ValidationError } from '@markdoc/markdoc';

/*
 * Mordoc works with Markdoc's own validation results: `Markdoc.validate()`
 * returns a list of `ValidateError`s, each holding a `ValidationError` (its
 * level, from `warning` to `critical`, and its message) and the location it
 * was found at. Texts are parsed with their file path, so the location names
 * the file. Markdoc never throws for validation; Mordoc decides what to do
 * with the list.
 */

/**
 * Levels that stop `mordoc build`. Warnings are only reported: some of them
 * come from nesting rules rather than from broken content, and the page
 * still renders.
 */
const BLOCKING_LEVELS: ReadonlySet<ValidationError['level']> = new Set(['error', 'critical']);

/**
 * A link or button can't sit inside another link or button: one click can
 * only go to one place, and HTML doesn't allow it either. Markdoc lets any
 * tag sit inside a link, so the link node, the link tag and the button tag
 * each use this rule as their `validate()`, which gets the parents Markdoc
 * passes along as `config.validation.parents`.
 */
export function notInsideClickable(what: string): Schema['validate'] {
  return (_node, config) => {
    const parents = config.validation?.parents ?? [];
    const insideClickable = parents.some(
      (parent) => parent.type === 'link' || (parent.type === 'tag' && (parent.tag === 'link' || parent.tag === 'button')),
    );
    if (!insideClickable) return [];
    return [{
      id: 'clickable-inside-clickable',
      level: 'critical',
      message: `A ${what} can't be placed inside a link or a button, because one click can only go to one place.`,
    }];
  };
}

/**
 * Formats one validation result as one line: the file relative to the
 * project, the line number as editors count it, the level and the message.
 *
 * Example: `content/en/guide/setup.md:12  error  Undefined variable: 'productName'`
 */
export function formatValidateError(result: ValidateError, projectRoot: string): string {
  const filePath = result.location?.file ?? '';
  const file = filePath ? path.relative(projectRoot, filePath).replace(/\\/g, '/') : '(unknown file)';
  // Markdoc counts lines from 0; editors count from 1.
  const line = (result.location?.start.line ?? result.lines[0] ?? 0) + 1;
  return `${file}:${line}  ${result.error.level}  ${result.error.message}`;
}

/** Where a report goes; the console by default. */
export type ReportOutput = (text: string) => void;

/**
 * Validates every Markdoc text of one run — the pages and the texts for the
 * API reference — and keeps the results, so they are reported as one list.
 *
 * Create a new one for every run: it starts empty, so a run never shows the
 * results of an earlier one.
 */
export class ContentValidator {
  private readonly results: ValidateError[] = [];

  constructor(
    private readonly projectRoot: string,
    private readonly output: ReportOutput = (text) => console.log(text),
  ) {}

  /** Validates one parsed text with the config it will be transformed with. */
  validate(ast: Node, config: Config): void {
    this.results.push(...Markdoc.validate(ast, config));
  }

  /** Writes every result, one per line under a short heading, to the output in one go. */
  report(): void {
    if (this.results.length === 0) return;
    const noun = this.results.length === 1 ? 'problem' : 'problems';
    const lines = [
      '',
      `  Markdoc found ${this.results.length} ${noun} in your content:`,
      '',
      ...this.results.map((result) => `  ${formatValidateError(result, this.projectRoot)}`),
      '',
    ];
    this.output(lines.join('\n'));
  }

  /** Throws a `ValidationFailedError` when a result is an error. */
  stopOnErrors(): void {
    const blocking = this.results.filter((result) => BLOCKING_LEVELS.has(result.error.level)).length;
    if (blocking > 0) throw new ValidationFailedError(blocking);
  }
}

/**
 * Thrown by `mordoc build` to stop when validation finds errors. The errors
 * themselves are already listed for the author, so the CLI prints only this
 * message, without a stack trace.
 */
export class ValidationFailedError extends Error {
  constructor(errorCount: number) {
    const noun = errorCount === 1 ? 'error' : 'errors';
    super(`Your content has ${errorCount} ${noun}, listed above. Fix them and build again.`);
    this.name = 'ValidationFailedError';
  }
}
