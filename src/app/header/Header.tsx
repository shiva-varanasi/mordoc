import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useMordocData } from '../data-context.js';
import { detectCurrentLang, buildLangPrefix, stripLangPrefix } from '../lang-utils.js';
import { SearchBar } from './SearchBar.js';
import { Topnav } from './Topnav.js';
import styles from './Header.module.css';

type Theme = 'light' | 'dark';

export function Header() {
  const { site, assets, language } = useMordocData();
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('mordoc-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mordoc-theme', theme);
  }, [theme]);

  const currentLang = detectCurrentLang(location.pathname, language, site.defaultLanguage);
  const currentContentPath = stripLangPrefix(location.pathname, currentLang, site.defaultLanguage);
  const logo = theme === 'dark' ? (assets.logoDark ?? assets.logo) : assets.logo;

  function handleLangChange(newLang: string) {
    const prefix = buildLangPrefix(newLang, site.defaultLanguage);
    const target = currentContentPath === '/' ? (prefix || '/') : `${prefix}${currentContentPath}`;
    navigate(target);
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.logo}>
          {logo ? (
            <img src={logo} alt={site.name} className={styles.logoImage} />
          ) : (
            <span>{site.name}</span>
          )}
        </Link>
        <Topnav />
      </div>

      <div className={styles.right}>
        <SearchBar />

        <div className={styles.controls}>
          {language && language.languages.length > 1 && (
            <select
              value={currentLang}
              onChange={(e) => handleLangChange(e.target.value)}
              className={styles.languagePicker}
            >
              {language.languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className={styles.themeToggle}
          >
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
      </div>
    </header>
  );
}
