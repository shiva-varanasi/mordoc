import { performance } from 'node:perf_hooks';

/**
 * Not a TTY when stdout is piped or redirected (CI logs, `> file.txt`).
 * Captured once at module load — a process's stream kind doesn't change
 * mid-run.
 */
const isTTY = process.stdout.isTTY === true;

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SPINNER_INTERVAL_MS = 80;
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function checkmark(): string {
  return isTTY ? `${GREEN}✓${RESET}` : '✓';
}

export function formatElapsed(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export interface StepHandle {
  /** Updates the in-progress label. No-op on non-TTY output — see {@link beginStep}. */
  update(text: string): void;
  /** Stops the spinner and finalizes the line with a green checkmark and elapsed time. */
  done(text: string): void;
}

/**
 * Only one step is ever actually visible at a time — a step that hands off
 * to a nested sub-step (e.g. `runPipeline`'s outer "reading the project"
 * step, immediately superseded by "config & content loaded") is never seen
 * idling by anyone. Tracking the single active spinner here, rather than
 * having every StepHandle own an independent timer, is what lets steps nest
 * without two intervals racing to redraw the same terminal line: starting a
 * new step always stops whatever spinner came before it.
 */
let stopActiveSpinner: (() => void) | null = null;

/**
 * Starts an animated progress line for one phase of dev/build output.
 *
 * On a TTY, prints a spinner cycling through `text...` and rewrites the
 * same line on every frame, `update()`, and `done()` via `\r`; `done()`
 * settles it into a green `✓ text (Xms)`. On plain output (CI, piped logs)
 * nothing animates and `update()` is swallowed — only the final `done()`
 * line prints — so a log file gets one line per phase instead of one per
 * spinner frame or intermediate tick.
 */
export function beginStep(text: string, options: { indent?: string } = {}): StepHandle {
  const indent = options.indent ?? '';
  const start = performance.now();

  stopActiveSpinner?.();
  stopActiveSpinner = null;

  if (!isTTY) {
    return {
      update() {},
      done(next: string) {
        process.stdout.write(
          `${indent}${checkmark()} ${next} (${formatElapsed(performance.now() - start)})\n`,
        );
      },
    };
  }

  let frame = 0;
  let label = text;
  const render = () => process.stdout.write(`\r\x1b[K${indent}${SPINNER_FRAMES[frame]} ${label}...`);
  render();

  const timer = setInterval(() => {
    frame = (frame + 1) % SPINNER_FRAMES.length;
    render();
  }, SPINNER_INTERVAL_MS);
  // Never keep the process alive on this timer alone — every step ends in
  // done() well before the CLI command exits, but this is the defensive
  // backstop if one ever doesn't.
  timer.unref();

  const stop = () => clearInterval(timer);
  stopActiveSpinner = stop;

  return {
    update(next: string) {
      label = next;
      render();
    },
    done(next: string) {
      stop();
      if (stopActiveSpinner === stop) stopActiveSpinner = null;
      const line = `${indent}${checkmark()} ${next} (${formatElapsed(performance.now() - start)})`;
      process.stdout.write(`\r\x1b[K${line}\n`);
    },
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
