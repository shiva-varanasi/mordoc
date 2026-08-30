import { NavLink, useLocation } from 'react-router';
import { useMordocData } from '../data-context.js';
import { detectCurrentLang, buildLangPrefix, resolveLabel } from '../lang-utils.js';
import { useUiStrings } from '../i18n/useUiStrings.js';
import styles from './Topnav.module.css';

export function Topnav() {
  const { navigation, language, site, translations } = useMordocData();
  const { pathname } = useLocation();
  const t = useUiStrings();

  if (navigation.kind !== 'topnav') return null;

  const currentLang = detectCurrentLang(pathname, language, site.defaultLanguage);
  const prefix = buildLangPrefix(currentLang, site.defaultLanguage);

  return (
    <nav className={styles.topnav} aria-label={t.nav.topNavigationLabel}>
      {navigation.topnav.map((item) => (
        <NavLink
          key={item.path}
          to={`${prefix}${item.path}`}
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          {resolveLabel(item.label, currentLang, site.defaultLanguage, translations)}
        </NavLink>
      ))}
    </nav>
  );
}
