import { useState } from 'react';
import { CodeBlock } from '../content/code-block/CodeBlock.js';
import type { ExampleView, OperationView } from '../../types/api.js';
import styles from './ExamplePanel.module.css';

/**
 * The sticky right-column content for the Request and Response sections of
 * an operation page.
 *
 * There are two entry points rather than one panel because each section
 * (Request, Response) now sticks independently as the reader scrolls past
 * its own fields column (see `Operation.module.css`) — a single combined
 * rail would have nothing of its own to stick to once split that way.
 *
 * Each is one card, not two stacked ones. A curl invocation's `-d` body
 * *is* the request example, so showing a cURL block and a separate "example
 * payload" block next to it was always showing the same fact twice — one
 * card with an example dropdown that feeds whichever language sample is
 * active is both fewer moving parts and what Redocly's reference UI does.
 */

/** One code sample matching a language and a request example, or the closest fallback. */
function pickSample(
  samples: OperationView['samples'],
  language: string,
  forExample: string,
): OperationView['samples'][number] | undefined {
  return (
    samples.find((s) => s.language === language && s.forExample === forExample) ??
    samples.find((s) => s.language === language) ??
    samples[0]
  );
}

/**
 * The sticky column for the Request section: one card with a language
 * selector (just cURL today; the shape is ready for more), an example
 * dropdown when the operation has more than one request example, and the
 * matching code sample.
 */
export function RequestExamplePanel({ view }: { view: OperationView }) {
  const requests = view.examples.filter((e) => e.kind === 'request');
  const languages = [...new Set(view.samples.map((s) => s.language))];
  const [activeLanguage, setActiveLanguage] = useState(0);
  const [activeExample, setActiveExample] = useState(0);

  if (languages.length === 0) return null;

  const language = languages[Math.min(activeLanguage, languages.length - 1)] as string;
  const example = requests[Math.min(activeExample, requests.length - 1)] as ExampleView | undefined;
  const sample = pickSample(view.samples, language, example?.key ?? '');
  if (!sample) return null;

  return (
    <div className={styles.panel}>
      <section className={styles.group}>
        <div className={styles.groupHeader}>
          <h2 className={styles.groupTitle}>Request</h2>
          {languages.length > 1 && (
            <div className={styles.tabs} role="tablist">
              {languages.map((lang, index) => (
                <button
                  key={lang}
                  type="button"
                  role="tab"
                  aria-selected={index === activeLanguage}
                  className={`${styles.tab} ${index === activeLanguage ? styles.tabActive : ''}`}
                  onClick={() => setActiveLanguage(index)}
                >
                  {lang === 'curl' ? 'cURL' : lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {requests.length > 1 && (
          <select
            className={styles.select}
            value={Math.min(activeExample, requests.length - 1)}
            onChange={(event) => setActiveExample(Number(event.target.value))}
            aria-label="Choose request example"
          >
            {requests.map((req, index) => (
              <option key={req.key} value={index}>
                {req.label}
              </option>
            ))}
          </select>
        )}

        <CodeBlock language={sample.language} content={sample.code} />
      </section>
    </div>
  );
}

/**
 * The sticky column for the Response section: the payload for whichever
 * status is currently selected in the fields column's response tabs.
 *
 * `status` is the source of truth for which examples apply — this panel
 * carries no status tab state of its own, so a click on the left's status
 * tabs is exactly what changes the sample on the right. The parent remounts
 * this component (via `key`) when `status` changes, so its own example
 * selection resets instead of carrying over a stale index from the last
 * status.
 */
export function ResponseExamplePanel({
  view,
  status,
  mediaType,
}: {
  view: OperationView;
  status: string;
  mediaType: string | null;
}) {
  const [active, setActive] = useState(0);
  const responses = view.examples.filter((e) => e.kind === 'response' && e.status === status);
  if (responses.length === 0) return null;

  const current = responses[Math.min(active, responses.length - 1)] as ExampleView;

  return (
    <div className={styles.panel}>
      <section className={styles.group}>
        <div className={styles.groupHeader}>
          <h2 className={styles.groupTitle}>Response</h2>
        </div>

        {mediaType && <p className={styles.contentType}>{mediaType}</p>}

        {responses.length > 1 && (
          <select
            className={styles.select}
            value={Math.min(active, responses.length - 1)}
            onChange={(event) => setActive(Number(event.target.value))}
            aria-label="Choose response example"
          >
            {responses.map((res, index) => (
              <option key={res.key} value={index}>
                {res.label}
              </option>
            ))}
          </select>
        )}

        <CodeBlock language="json" content={JSON.stringify(current.json, null, 2)} />
      </section>
    </div>
  );
}
