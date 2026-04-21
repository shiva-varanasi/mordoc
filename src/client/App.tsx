import site from 'virtual:mordoc/site';
import language from 'virtual:mordoc/language';
import navigation from 'virtual:mordoc/navigation';
import assets from 'virtual:mordoc/assets';
import pages from 'virtual:mordoc/pages';

/**
 * Scaffolding App — proves the Vite plugin wiring works end-to-end by
 * importing every eager virtual module and rendering its contents in the
 * browser. Intentionally ugly; the default theme is a later step.
 */
export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>{site.name}</h1>
      <p>{site.description}</p>

      <section>
        <h2>Pages ({pages.length})</h2>
        <ul>
          {pages.map((page) => (
            <li key={page.routePath}>
              <a href={page.routePath}>
                <code>{page.routePath}</code>
              </a>{' '}
              <span style={{ color: '#888' }}>[{page.language}]</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Navigation</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
          {JSON.stringify(navigation, null, 2)}
        </pre>
      </section>

      <section>
        <h2>Language</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
          {JSON.stringify(language, null, 2)}
        </pre>
      </section>

      <section>
        <h2>Assets</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem' }}>
          {JSON.stringify(assets, null, 2)}
        </pre>
      </section>
    </div>
  );
}
