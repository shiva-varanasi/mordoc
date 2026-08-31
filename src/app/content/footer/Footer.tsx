import { Link, useLocation } from 'react-router';
import { useMordocData } from '../../data-context.js';
import { detectCurrentLang, resolveLabel } from '../../lang-utils.js';
import type { FooterConfig } from '../../../types/navigation.js';
import styles from './Footer.module.css';

/**
 * Mordoc's built-in footer, used whenever config/navigation/footer.yaml is
 * absent. A single attribution line in the `end` column — no copyright text,
 * since that's a legal claim only the site owner can make correctly.
 */
const DEFAULT_FOOTER: FooterConfig = {
  end: ['Powered by [Mordoc](https://mordoc.dev)'],
};

/** Zones rendered left-to-right (start → center → end) as three stacked columns. */
const ZONES = ['start', 'center', 'end'] as const;

/** One parsed run of a footer line: plain text, or a link when `path` is set. */
interface FooterRun {
  text: string;
  path?: string;
}

const INLINE_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Splits a footer line into plain-text and link runs on CommonMark-style
 * `[text](url)` syntax — e.g. "Powered by [Mordoc](https://mordoc.dev)"
 * becomes a plain "Powered by " run followed by a linked "Mordoc" run.
 * Single-level only (no nested brackets), which is all footer copy needs.
 */
function parseFooterLine(line: string): FooterRun[] {
  const runs: FooterRun[] = [];
  let lastIndex = 0;
  for (const match of line.matchAll(INLINE_LINK_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      runs.push({ text: line.slice(lastIndex, index) });
    }
    runs.push({ text: match[1]!, path: match[2] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < line.length) {
    runs.push({ text: line.slice(lastIndex) });
  }
  return runs;
}

function isExternal(path: string) {
  return path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//');
}

/** Renders one run: a link when `path` is set, plain text otherwise. */
function FooterRunView({ run }: { run: FooterRun }) {
  if (!run.path) return <>{run.text}</>;

  if (isExternal(run.path)) {
    return (
      <a href={run.path} className={styles.link} target="_blank" rel="noopener noreferrer">
        {run.text}
      </a>
    );
  }

  return (
    <Link to={run.path} className={styles.link}>
      {run.text}
    </Link>
  );
}

/**
 * One footer column: `lines` stacked one per line, each already translated.
 * Renders nothing when the column is empty, so an absent/empty zone doesn't
 * reserve a flex slot.
 */
function FooterColumn({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;

  return (
    <div className={styles.column}>
      {lines.map((line, index) => (
        <div key={index} className={styles.line}>
          {parseFooterLine(line).map((run, runIndex) => (
            <FooterRunView key={runIndex} run={run} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Site footer. Renders config/navigation/footer.yaml's `start`/`center`/`end`
 * columns when present, or {@link DEFAULT_FOOTER} otherwise. Renders nothing
 * when every column is empty (an author-configured empty footer).
 *
 * Each line is translated through the same pipeline as nav labels
 * (`config/navigation/translations/<lang>.yaml`, keyed on the literal
 * default-language line), then `[text](url)` runs are split out for
 * rendering.
 *
 * Columns sit side by side on desktop and stack vertically (start, then
 * center, then end) on narrow screens — see Footer.module.css.
 */
export function Footer() {
  const { site, language, translations, footer } = useMordocData();
  const location = useLocation();
  const currentLang = detectCurrentLang(location.pathname, language, site.defaultLanguage);
  const config = footer ?? DEFAULT_FOOTER;

  const resolveLine = (line: string) => resolveLabel(line, currentLang, site.defaultLanguage, translations);

  const columns = ZONES.map((zone) => (config[zone] ?? []).map(resolveLine));

  if (columns.every((lines) => lines.length === 0)) return null;

  return (
    <footer className={styles.footer} data-pagefind-ignore>
      <div className={styles.columns}>
        {ZONES.map((zone, i) => (
          <FooterColumn key={zone} lines={columns[i]!} />
        ))}
      </div>
    </footer>
  );
}
