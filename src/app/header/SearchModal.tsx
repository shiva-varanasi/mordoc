import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import styles from './SearchModal.module.css';

// Module-level singleton so the loaded Pagefind instance is reused across
// open/close cycles. Replaced atomically when the language changes.
let pf: PagefindAPI | null = null;
let pfLoadPromise: Promise<void> | null = null;
let currentIndexPath: string | null = null;

/**
 * Loads (or switches to) the Pagefind index at `indexPath`.
 *
 * Called from App.tsx on every language change, including the initial mount.
 * Switching languages:
 *   1. Destroys the previous Pagefind instance to release index memory.
 *   2. Resets module state so any in-progress search awaits the new index.
 *   3. Starts fetching the new index manifest in the background.
 *
 * Race-condition guard: if another switch fires before this load completes,
 * the stale `.then()` handler checks `currentIndexPath` and discards itself.
 */
export function switchPagefind(indexPath: string): void {
  if (indexPath === currentIndexPath) return;

  pf?.destroy?.();
  pf = null;
  pfLoadPromise = null;
  currentIndexPath = indexPath;

  pfLoadPromise = import(/* @vite-ignore */ indexPath)
    .then(async (mod) => {
      if (currentIndexPath !== indexPath) return; // superseded by a later switch
      pf = mod as PagefindAPI;
      await mod.init?.();
    })
    .catch(() => {
      if (currentIndexPath === indexPath) {
        pf = null;
        pfLoadPromise = null;
        currentIndexPath = null;
      }
    });
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  url: string;
  title: string;
  excerpt: string;
}

/**
 * Full-screen search modal with Pagefind-powered results.
 *
 * Dev mode: shows the input disabled with a "build required" notice, since
 * the Pagefind index only exists after `mordoc build` has run.
 *
 * Production: queries the preloaded Pagefind index on every keystroke
 * (debounced). If the index is still loading when the user types, the
 * component awaits the load promise before running the query.
 *
 * Keyboard navigation: ↑/↓ moves between results, Enter navigates, Esc closes.
 *
 * Result excerpts use dangerouslySetInnerHTML for Pagefind's <mark> highlights.
 * This is safe — the content comes from our own indexed pages, not user input.
 */
export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isDev = import.meta.env.DEV;

  // Focus input on open; reset state on close
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounced search — waits 180 ms after the last keystroke
  useEffect(() => {
    if (!query.trim() || isDev) {
      setResults([]);
      return;
    }

    const timerId = setTimeout(async () => {
      if (!pf) {
        if (pfLoadPromise) {
          setIsLoading(true);
          await pfLoadPromise;
          setIsLoading(false);
        }
        if (!pf) return;
      }

      const capturedQuery = query;
      try {
        const { results: raw } = await pf.search(capturedQuery);
        const resolved = await Promise.all(
          raw.slice(0, 8).map(async (r) => {
            const data = await r.data();
            return {
              id: r.id,
              url: data.url,
              title: data.meta?.title ?? data.url,
              excerpt: data.excerpt,
            };
          }),
        );
        setResults(resolved);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      }
    }, 180);

    return () => clearTimeout(timerId);
  }, [query, isDev]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onClose();
      navigate(results[selectedIndex].url);
    }
  }

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className={styles.modal} onKeyDown={handleKeyDown}>
        <div className={styles.inputRow}>
          <svg
            className={styles.searchIcon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder={isDev ? 'Search unavailable in dev mode' : 'Search docs…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isDev}
            aria-label="Search"
          />
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close search"
            type="button"
          >
            <kbd>esc</kbd>
          </button>
        </div>

        {isDev && (
          <div className={styles.notice}>
            Search is only available after running <code>mordoc build</code>.
          </div>
        )}

        {!isDev && isLoading && (
          <div className={styles.status}>Loading search index…</div>
        )}

        {!isDev && !isLoading && query.trim() && results.length === 0 && (
          <div className={styles.status}>No results for &ldquo;{query}&rdquo;</div>
        )}

        {results.length > 0 && (
          <ul className={styles.results} role="listbox">
            {results.map((result, i) => (
              <li
                key={result.id}
                role="option"
                aria-selected={i === selectedIndex}
                className={`${styles.result}${i === selectedIndex ? ` ${styles.resultSelected}` : ''}`}
                onClick={() => { onClose(); navigate(result.url); }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span className={styles.resultTitle}>{result.title}</span>
                {/* Pagefind wraps matched terms in <mark> — safe to inject as HTML */}
                <span
                  className={styles.resultExcerpt}
                  dangerouslySetInnerHTML={{ __html: result.excerpt }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
