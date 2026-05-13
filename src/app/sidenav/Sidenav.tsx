import { NavLink, useLocation } from 'react-router';
import { useMordocData } from '../data-context.js';
import { detectCurrentLang, buildLangPrefix, stripLangPrefix, resolveLabel } from '../lang-utils.js';
import type { SidenavConfig, SidenavItem } from '../../types/navigation.js';
import styles from './Sidenav.module.css';

function SidenavList({ items }: { items: SidenavConfig }) {
  return (
    <ul className={styles.list}>
      {items.map((item, i) => (
        <SidenavNode key={i} item={item} />
      ))}
    </ul>
  );
}

function SidenavNode({ item }: { item: SidenavItem }) {
  if (item.path) {
    return (
      <li className={styles.item}>
        <NavLink
          to={item.path}
          end
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          {item.label}
        </NavLink>
        {item.children && <SidenavList items={item.children} />}
      </li>
    );
  }
  return (
    <li className={styles.item}>
      <span className={styles.group}>{item.label}</span>
      {item.children && <SidenavList items={item.children} />}
    </li>
  );
}

/**
 * Recursively prepends the lang prefix to all item paths and translates labels.
 * Run once at the Sidenav level so the render components stay data-only.
 */
function applyLangToSidenav(
  items: SidenavConfig,
  prefix: string,
  lang: string,
  defaultLanguage: string,
  translations: Record<string, Record<string, string>>,
): SidenavConfig {
  return items.map((item) => ({
    ...item,
    label: resolveLabel(item.label, lang, defaultLanguage, translations),
    path: item.path !== undefined ? `${prefix}${item.path}` : undefined,
    children: item.children
      ? applyLangToSidenav(item.children, prefix, lang, defaultLanguage, translations)
      : undefined,
  }));
}

function resolveActiveSidenav(
  navigation: ReturnType<typeof useMordocData>['navigation'],
  contentPath: string,
): SidenavConfig {
  if (navigation.kind === 'sidenav') return navigation.sidenav;

  // Longest-prefix match so /flight-school beats / when both match.
  const match = navigation.topnav
    .filter((item) => contentPath === item.path || contentPath.startsWith(item.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return match?.sidenav ?? [];
}

export function Sidenav() {
  const { navigation, language, site, translations } = useMordocData();
  const { pathname } = useLocation();

  const currentLang = detectCurrentLang(pathname, language, site.defaultLanguage);
  const contentPath = stripLangPrefix(pathname, currentLang, site.defaultLanguage);
  const sidenav = resolveActiveSidenav(navigation, contentPath);

  if (sidenav.length === 0) return <nav className={styles.sidenav} aria-label="Side navigation" />;

  const prefix = buildLangPrefix(currentLang, site.defaultLanguage);
  const processedSidenav = applyLangToSidenav(sidenav, prefix, currentLang, site.defaultLanguage, translations);

  return (
    <nav className={styles.sidenav} aria-label="Side navigation">
      <SidenavList items={processedSidenav} />
    </nav>
  );
}
