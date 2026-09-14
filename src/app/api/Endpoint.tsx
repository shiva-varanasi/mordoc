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
export function Endpoint({ method, path }: { method: string; path: string }) {
  const modifier = styles[method.toLowerCase()] ?? '';
  return (
    <div className={styles.endpoint}>
      <span className={`${styles.method} ${modifier}`}>{method}</span>
      <code className={styles.path}>{path}</code>
    </div>
  );
}
