import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { createAppRouter } from './routes.js';

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

const router = createAppRouter();

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
