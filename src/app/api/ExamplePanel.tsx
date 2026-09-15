import { useState, type CSSProperties } from 'react';
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
 *
 * A webhook operation has no request side to curl — it's delivered to the
 * integrator, not called — so its Request-section card (`RequestExamplePanel`
 * delegating to `WebhookPayloadPanel`) drops the language tabs and just shows
 * the payload, the same way `ResponseExamplePanel` already does.
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
 * The sticky column for a webhook's payload: raw JSON only, with an example
 * dropdown when there's more than one case — no language tabs and no code
 * sample, since `view.samples` is always empty for a webhook (there is
 * nothing to curl). Structurally this is `ResponseExamplePanel` with a
 * different title and a request-example source instead of a response one;
 * kept as its own small function rather than parameterizing that one, since
 * the two already diverge on what selects the current example (a `status`
 * prop there vs. local state here).
 */
function WebhookPayloadPanel({ requests }: { requests: ExampleView[] }) {
  const [active, setActive] = useState(0);
  if (requests.length === 0) return null;

  const current = requests[Math.min(active, requests.length - 1)] as ExampleView;

  return (
    <div className={styles.panel}>
      <section className={styles.group}>
        <div className={styles.groupHeader}>
          <h2 className={styles.groupTitle}>Example payload</h2>
          <div className={styles.headerControls}>
            {requests.length > 1 && (
              <select
                className={styles.select}
                style={{ '--select-chars': Math.max(...requests.map((r) => r.label.length)) } as CSSProperties}
                value={Math.min(active, requests.length - 1)}
                onChange={(event) => setActive(Number(event.target.value))}
                aria-label="Choose payload example"
              >
                {requests.map((req, index) => (
                  <option key={req.key} value={index}>
                    {req.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <CodeBlock language="json" content={JSON.stringify(current.json, null, 2)} />
      </section>
    </div>
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

  // A webhook has no code sample to select a language for — it's delivered
  // to the integrator, never called — so it gets the raw-JSON-only card
  // instead of the language-tabbed one below.
  if (view.isWebhook) return <WebhookPayloadPanel requests={requests} />;

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
          <h2 className={styles.groupTitle}>Example request</h2>
          <div className={styles.headerControls}>
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

            {requests.length > 1 && (
              <select
                className={styles.select}
                // Sized to the longest label so the closed box never
                // truncates any of them — see .select in
                // ExamplePanel.module.css.
                style={{ '--select-chars': Math.max(...requests.map((r) => r.label.length)) } as CSSProperties}
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
          </div>
        </div>

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
          <h2 className={styles.groupTitle}>Example response</h2>
          <div className={styles.headerControls}>
            {responses.length > 1 && (
              <select
                className={styles.select}
                style={{ '--select-chars': Math.max(...responses.map((r) => r.label.length)) } as CSSProperties}
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
          </div>
        </div>

        {mediaType && <p className={styles.contentType}>{mediaType}</p>}

        <CodeBlock language="json" content={JSON.stringify(current.json, null, 2)} />
      </section>
    </div>
  );
}
