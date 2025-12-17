/**
 * Shared utility functions for style generation
 * Used by all component style generators
 */

/**
 * Merge user overrides with defaults, respecting customizable keys whitelist
 */
export function mergeOverrides<T extends Record<string, any>>(
  defaults: T,
  userOverrides: Record<string, string> | undefined,
  customizableKeys: (keyof T)[]
): T {
  if (!userOverrides) {
    return defaults;
  }
  
  const merged = { ...defaults };
  
  customizableKeys.forEach(key => {
    if (userOverrides[key as string] !== undefined) {
      merged[key] = userOverrides[key as string] as any;
    }
  });
  
  return merged;
}

/**
 * Wrap CSS in dark mode selector
 */
export function darkMode(css: string): string {
  return `[data-theme="dark"] {\n${css}\n}`;
}

/**
 * Generate media query for responsive styles
 */
export function mediaQuery(breakpoint: 'sm' | 'md' | 'lg' | 'xl', css: string): string {
  const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  };
  
  return `@media (max-width: ${breakpoints[breakpoint]}) {\n${css}\n}`;
}

/**
 * Generate media query for system dark mode preference
 */
export function prefersDarkMode(css: string): string {
  return `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${css}\n  }\n}`;
}

