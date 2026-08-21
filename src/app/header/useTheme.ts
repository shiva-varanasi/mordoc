import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'mordoc-theme';
const listeners = new Set<() => void>();

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (e) {}
  return 'light';
}

let currentTheme: Theme = readStoredTheme();
let domSynced = false;

function syncDom(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(STORAGE_KEY, theme);
}

function subscribe(listener: () => void) {
  if (!domSynced) {
    // First client subscriber applies the persisted theme to the DOM —
    // equivalent to the mount-time effect this used to be.
    syncDom(currentTheme);
    domSynced = true;
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return 'light';
}

/** Changes the theme and notifies every {@link useTheme} subscriber. */
export function setTheme(theme: Theme) {
  if (theme === currentTheme) return;
  currentTheme = theme;
  syncDom(theme);
  listeners.forEach((listener) => listener());
}

/**
 * Live theme value, shared across every caller — e.g. Header (to pick the
 * logo variant) and ThemeToggle (to render + flip the switch) both read
 * from the same underlying state, so toggling in one place updates both.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
