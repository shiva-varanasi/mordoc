/**
 * Build-time diagnostics for the API reference stages.
 *
 * The rule the whole feature follows: **correctness problems fail the build;
 * completeness problems warn.** A broken link or an unbuildable spec is a
 * `fail`; a missing description, an unmatched enrichment file, or an
 * unlinked operation is a `warn`.
 *
 * `warn` exists as a collector rather than a bare `console.warn` for two
 * reasons: `strict: true` in `config/api.yaml` has to be able to escalate
 * the whole warning class to a build error in one place, and the escalated
 * report reads far better as one grouped message than as N interleaved
 * lines.
 *
 * Note that `fail` is not affected by `strict` in either direction — the
 * hard-failure list is not downgradable.
 */
export class Diagnostics {
  // Sets, not arrays, so a problem reached more than once is reported once —
  // the author has one thing to fix. Insertion order is preserved, so
  // grouping still reads well.
  private readonly warnings = new Set<string>();
  private readonly errors = new Set<string>();

  constructor(private readonly strict: boolean) {}

  /**
   * Records a completeness problem. The output is still correct — just less
   * enriched — so this never stops the build unless `strict` is set.
   */
  warn(message: string): void {
    this.warnings.add(message);
  }

  /** Records a correctness problem: shipped output would be broken. */
  fail(message: string): void {
    this.errors.add(message);
  }

  get hasErrors(): boolean {
    return this.errors.size > 0 || (this.strict && this.warnings.size > 0);
  }

  /**
   * True when something in the hard-failure class was recorded, regardless of
   * `strict`.
   *
   * Distinct from {@link hasErrors} because it answers a different question:
   * not "will the build fail?" but "is the data downstream stages are about
   * to reason about actually trustworthy?". A spec that failed to load
   * produces no operations, which would make every `operation:` reference in
   * the nav look dangling — a page of cascading errors with the real cause
   * buried at the top.
   */
  get hasFailures(): boolean {
    return this.errors.size > 0;
  }

  /**
   * Prints accumulated warnings and throws if anything fatal was recorded.
   *
   * Called once at the end of the API stages rather than per-problem so a
   * spec with twenty unmatched enrichment files reports all twenty, instead
   * of making the author fix and re-run twenty times.
   */
  flush(): void {
    if (this.warnings.size > 0 && !this.strict) {
      for (const warning of this.warnings) {
        console.warn(`⚠ ${warning}`);
      }
    }

    if (!this.hasErrors) return;

    const parts: string[] = [];
    if (this.errors.size > 0) {
      parts.push(
        `API reference build failed:\n${[...this.errors].map((e) => `  ✗ ${e}`).join('\n')}`,
      );
    }
    if (this.strict && this.warnings.size > 0) {
      parts.push(
        `API reference warnings (escalated by "strict: true" in config/api.yaml):\n` +
          [...this.warnings].map((w) => `  ✗ ${w}`).join('\n'),
      );
    }
    throw new Error(parts.join('\n\n'));
  }
}
