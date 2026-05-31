import { createContext, useContext } from 'react';
import type { ShellData } from '../types/pipeline.js';

/**
 * React context carrying the site-wide `ShellData` projection.
 *
 * This context is the single channel by which shell components read the
 * configs, navigation, and route index. The browser entry (`main.tsx`)
 * assembles the value from the eager `virtual:mordoc/*` modules; the
 * server entry (`entry-server.tsx`) receives it as the `data` parameter
 * of `render()`. Both then wrap the React tree in this provider, which
 * is what makes the same component code (`App`, `Page`, future theme
 * components) work identically under CSR and SSR.
 *
 * The default value is `null` so that any component reading the context
 * outside a provider trips a clear runtime error in `useMordocData()`,
 * rather than silently rendering against an empty object.
 */
export const MordocDataContext = createContext<ShellData | null>(null);

/**
 * Hook for shell components to read the current `ShellData`.
 *
 * Throws if called outside a `<MordocDataContext.Provider>`. Both
 * entry points (`main.tsx`, `entry-server.tsx`) wrap their entire tree
 * in the provider, so a missing-provider error means a regression in
 * the entry wiring — surface it loudly rather than letting components
 * read `null` and crash deeper.
 */
export function useMordocData(): ShellData {
  const value = useContext(MordocDataContext);
  if (value === null) {
    throw new Error(
      'mordoc: useMordocData() called outside <MordocDataContext.Provider>. ' +
        'Both main.tsx and entry-server.tsx must wrap the React tree in the provider.',
    );
  }
  return value;
}
