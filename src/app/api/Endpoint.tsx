import styles from './Endpoint.module.css';

/**
 * The method pill and path template at the top of an operation page:
 * `POST /payments`.
 *
 * The pill needs its own semantic colors rather than the site accent: GET,
 * POST, PUT and DELETE are a fixed, universally-recognized vocabulary, and a
 * reader scanning a reference identifies an operation by that color before
 * reading a word of it. Tinting them all with one brand accent would throw
 * away the fastest signal on the page.
 */
export function Endpoint({
  method,
  path,
  isWebhook,
}: {
  method: string;
  path: string;
  isWebhook?: boolean;
}) {
  const modifier = styles[method.toLowerCase()] ?? '';
  return (
    <div className={styles.endpoint}>
      <span className={`${styles.method} ${modifier}`}>{method}</span>
      <code className={styles.path}>{path}</code>
      {/* A badge alongside the method pill, not a swap — the real HTTP
          method still matters (it's what your handler actually receives),
          "Webhook" just adds the one fact the method pill alone can't
          carry: this is delivered to you, not called by you. */}
      {isWebhook && <span className={`${styles.method} ${styles.webhook}`}>Webhook</span>}
    </div>
  );
}
