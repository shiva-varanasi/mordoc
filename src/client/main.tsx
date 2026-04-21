import { createRoot } from 'react-dom/client';
import { App } from './App.js';

/**
 * Browser entry. Mounts the React app into #app.
 *
 * Uses `createRoot` (CSR) for now. Will switch to `hydrateRoot` when
 * SSR-in-dev and the SSG build are wired up in a later step.
 */
const container = document.getElementById('app');
if (!container) {
  throw new Error('mordoc: #app element not found in HTML shell');
}

createRoot(container).render(<App />);
