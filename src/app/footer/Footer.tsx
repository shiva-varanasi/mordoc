import { useMordocData } from '../data-context.js';
import styles from './Footer.module.css';

export function Footer() {
  const { site } = useMordocData();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copy}>
          © {year} {site.name}
        </span>
        <span className={styles.built}>
          Built with{' '}
          <a
            href="https://mordoc.dev"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Mordoc
          </a>
        </span>
      </div>
    </footer>
  );
}
