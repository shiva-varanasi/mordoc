import type { SiteConfig } from './site.js';
import type { LanguageConfig } from './language.js';
import type { ResolvedTopnavConfig, SidenavConfig, HeaderLink } from './navigation.js';
import type { ResolvedAssets } from './assets.js';
import type { PageMeta, TransformedPage } from './content.js';

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
  /** Nav label translations keyed by language code. Empty for single-language projects. */
  translations: Record<string, Record<string, string>>;
  /** Header action links from config/navigation/headernav.yaml. Empty array when file is absent. */
  headerLinks: HeaderLink[];
  /**
   * User-defined variables from config/variables.yaml, injected into every
   * Markdoc transform so authors can write `{{ $VAR_NAME }}` in content.
   * Empty object when the file is absent.
   */
  variables: Record<string, unknown>;
}

/**
 * The lightweight projection of `MordocData` consumed by the React shell —
 * everything needed to render the site chrome (header, navigation, link
 * lists), but none of the per-page content trees.
 *
 * Per-page content (`PageData`) is delivered through the route loader → lazy
 * `virtual:mordoc/page/<routePath>` module on both the client and the server.
 * Keeping `ShellData` content-free forces all per-page data through that one
 * channel, which is what makes CSR and SSR symmetric: the server doesn't get
 * a privileged "all pages already loaded" view that the client doesn't have.
 *
 * Three usage sites, one definition:
 *   1. The value shape of `MordocDataContext` in the React tree.
 *   2. The `data` parameter of `entry-server.tsx`'s `render()`.
 *   3. The return type of `toShellData()` in `pipeline.ts`.
 */
export interface ShellData {
  site: SiteConfig;
  language: LanguageConfig | null;
  navigation: NavigationConfig;
  assets: ResolvedAssets;
  pagesIndex: PageMeta[];
  /** Nav label translations keyed by language code. Empty for single-language projects. */
  translations: Record<string, Record<string, string>>;
  /** Header action links from config/navigation/headernav.yaml. Empty array when file is absent. */
  headerLinks: HeaderLink[];
}
