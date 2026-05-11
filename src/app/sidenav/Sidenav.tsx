import { NavLink, useLocation } from 'react-router';
import { useMordocData } from '../data-context.js';
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

function resolveActiveSidenav(navigation: ReturnType<typeof useMordocData>['navigation'], pathname: string): SidenavConfig {
  if (navigation.kind === 'sidenav') return navigation.sidenav;

  // Longest-prefix match wins so /flight-school beats / if both match.
  const match = navigation.topnav
    .filter((item) => pathname === item.path || pathname.startsWith(item.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];

  return match?.sidenav ?? [];
}

export function Sidenav() {
  const { navigation } = useMordocData();
  const { pathname } = useLocation();
  const sidenav = resolveActiveSidenav(navigation, pathname);
  console.log('active sidenav', sidenav);
  console.log('navigation', navigation);

  return (
    <nav className={styles.sidenav} aria-label="Side navigation">
      {sidenav.length > 0 && <SidenavList items={sidenav} />}
    </nav>
  );
}
