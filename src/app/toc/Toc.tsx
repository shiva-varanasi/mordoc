import type { TocEntry } from '../../types/content.js';
import styles from './Toc.module.css';

interface TocProps {
  items: TocEntry[];
}

export function Toc({ items }: TocProps) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.heading}>On this page</p>
      <ul className={styles.list}>
        {items.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <a
              href={`#${entry.id}`}
              className={styles.link}
              style={{ paddingLeft: `${(entry.level - 2) * 0.75}rem` }}
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
