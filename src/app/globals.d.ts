// Ambient declarations for browser-side globals. This file must remain a
// script (no top-level import/export) so that wildcard declare module
// statements are picked up by the TS language server.

// Dynamic import types are allowed in ambient script files since TS 2.9,
// so no export {} needed to use import('...') syntax below.

interface Window {
  __staticRouterHydrationData?: import('react-router').HydrationState;
}

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}
