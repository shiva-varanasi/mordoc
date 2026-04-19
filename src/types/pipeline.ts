import type { SiteConfig } from './site.js';
import type { LanguageConfig } from './language.js';
import type { ResolvedTopnavConfig, SidenavConfig } from './navigation.js';
import type { ResolvedAssets } from './assets.js';
import type { TransformedPage } from './content.js';

/**
 * Resolved navigation for the site, discriminated by `kind`:
 *   - `topnav`: project has a top navigation bar; each entry owns its own sidenav.
 *   - `sidenav`: no topnav.yaml — the project uses a single, site-wide sidenav.
 *
 * Downstream consumers (Vite plugin, SSG renderer, React client) branch on
 * `kind` so the two cases stay explicit and impossible to confuse.
 */
export type NavigationConfig =
  | { kind: 'topnav'; topnav: ResolvedTopnavConfig }
  | { kind: 'sidenav'; sidenav: SidenavConfig };

/**
 * The complete Mordoc data set for a project: every config object plus
 * every transformed page. This is the single hand-off shape between the
 * pipeline and its consumers.
 *
 * Both consumers — the Vite plugin in dev and the SSG build in prod —
 * take a `MordocData` and translate it into virtual modules / pre-rendered
 * HTML respectively. The pipeline itself stays Vite-agnostic; nothing in
 * this type or its dependencies imports from any delivery framework.
 *
 * The shape is JSON-serializable (renderable trees are plain tags + strings),
 * so it can be ferried across the dev/build boundary without any custom
 * serialization.
 */
export interface MordocData {
  site: SiteConfig;
  /** Null when the project ships a single language and omits language.json. */
  language: LanguageConfig | null;
  navigation: NavigationConfig;
  assets: ResolvedAssets;
  pages: TransformedPage[];
}
