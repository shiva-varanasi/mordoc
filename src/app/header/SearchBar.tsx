import styles from './SearchBar.module.css';

export function SearchBar() {
  return (
    <button className={styles.searchBar} onClick={() => {/* will open SearchModal */}}>
      <span>&#128269;</span>
      <span>Search...</span>
    </button>
  );
}
