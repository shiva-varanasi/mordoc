/**
 * Re-exports all lang utilities from the shared `src/utils/lang-utils.ts`.
 * The shared location is importable by both the React app and Node-side code
 * (pipeline, SSG runner). App-side imports continue to use this path unchanged.
 */
export {
  detectCurrentLang,
  buildLangPrefix,
  stripLangPrefix,
  resolveLabel,
} from '../utils/lang-utils.js';
