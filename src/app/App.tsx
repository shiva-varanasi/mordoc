import { Link, Outlet } from 'react-router';
import { useMordocData } from './data-context.js';

/**
 * Root layout component.
 *
 * Intentionally minimal — just the site header, a flat `<Link>` list
 * over every known route for navigation testing, and the `<Outlet />`
 * where the matched route renders. The real topnav/sidenav rendering
 * is theme work (it would also live at this layer) and will be wired
 * up once the default theme step begins.
 *
 * The link list uses `<Link>` rather than `<a>` so client-side
 * navigation (route transitions, lazy chunk loading) is actually
 * exercised — that's the whole point of verifying the router wiring.
 *
 * Reads site-wide data via `useMordocData()` rather than importing the
 * eager virtual modules directly. That single channel is what keeps
 * CSR and SSR symmetric: the same component reads the same context,
 * whether the provider is filled by `main.tsx` (browser) or
 * `entry-server.tsx` (Node).
 */
export function App() {
  const { site, pagesIndex } = useMordocData();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            {site.name}
          </Link>
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: '#666' }}>{site.description}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
        <nav aria-label="All pages" style={{ borderRight: '1px solid #e5e5e5', paddingRight: '1rem' }}>
          <strong>All pages</strong>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
            {pagesIndex.map((pageIndex) => (
              <li key={pageIndex.routePath} style={{ marginBottom: '0.25rem' }}>
                <Link to={pageIndex.routePath}>
                  <code>{pageIndex.routePath}</code>
                </Link>{' '}
                <span style={{ color: '#999', fontSize: '0.85em' }}>[{pageIndex.language}]</span>
              </li>
            ))}
          </ul>
        </nav>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
