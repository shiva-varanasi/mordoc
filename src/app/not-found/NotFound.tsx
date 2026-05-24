import { Link, useLocation } from 'react-router';
import { Footer } from '../footer/Footer.js';

/**
 * Fallback route component for paths that don't match any page.
 *
 * On the client this is purely visual — CSR has no concept of an HTTP
 * status code. The SSR/SSG steps will also respond with an actual 404
 * status alongside rendering this component.
 */
export function NotFound() {
  const location = useLocation();
  return (
    <>
      <section style={{ padding: '3rem 2rem', flex: 1 }}>
        <h1>Page not found</h1>
        <p>
          No page matches <code>{location.pathname}</code>.
        </p>
        <p>
          <Link to="/">Go home</Link>
        </p>
      </section>
      <Footer />
    </>
  );
}
