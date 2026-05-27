import styles from './SearchBar.module.css';

export function SearchBar({ onOpen }: { onOpen: () => void }) {
  return (
    <button className={styles.searchBar} onClick={onOpen}>
      <svg
        className={styles.icon}
        width="16"
        height="16"
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
      <span className={styles.placeholder}>Search...</span>
      <kbd className={styles.kbd}>⌘K</kbd>
    </button>
  );
}
