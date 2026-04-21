// Type declarations for the virtual modules exposed by mordoc's Vite plugin.
// These files don't exist on disk — the plugin generates their contents at
// import time. These declarations let the client code import them with full
// type safety despite the "virtual:" prefix.
//
// Kept in sync with EAGER_VIRTUAL_IDS in src/vite/plugin.ts.
//
// Uses inline `import()` type expressions rather than top-level `import type`
// statements, because:
//   1. TS forbids relative imports inside `declare module 'x' { ... }` blocks.
//   2. Hoisting imports to file scope would make this file a module, and
//      module-scope `declare module` declarations only register globally if
//      the containing file is imported elsewhere. Staying fully ambient (no
//      top-level imports) keeps the declarations globally available to every
//      file in the project without ceremony.

declare module 'virtual:mordoc/site' {
  const value: import('../types/site.js').SiteConfig;
  export default value;
}

declare module 'virtual:mordoc/language' {
  const value: import('../types/language.js').LanguageConfig | null;
  export default value;
}

declare module 'virtual:mordoc/navigation' {
  const value: import('../types/pipeline.js').NavigationConfig;
  export default value;
}

declare module 'virtual:mordoc/assets' {
  const value: import('../types/assets.js').ResolvedAssets;
  export default value;
}

declare module 'virtual:mordoc/pages' {
  const value: import('../types/content.js').PageMeta[];
  export default value;
}
