import type { OperationView, ResolvedSpec } from '../types/api.js';
import type { SidenavConfig, SidenavItem } from '../types/navigation.js';
import type { NavigationConfig } from '../types/pipeline.js';
import type { Diagnostics } from './diagnostics.js';

/**
 * Resolves `operation:` references in hand-authored navigation, and runs the
 * two checks that make hand-authoring safe.
 *
 * Navigation is hand-authored, exactly like guides — there is no generated
 * nav, no expansion node, and the spec does not influence the sidebar at
 * all. But guides and API operations differ in one way that matters:
 * **guide pages are created by the person editing the nav, while operations
 * arrive from someone else's codegen, often in another repo, without the
 * docs team being told.** That asymmetry is what earns these two guards,
 * which guides never needed.
 */

/** Walks every sidenav tree in a navigation config, whatever its kind. */
function eachTree(navigation: NavigationConfig, visit: (tree: SidenavConfig) => void): void {
  if (navigation.kind === 'topnav') {
    for (const area of navigation.topnav) visit(area.sidenav);
  } else {
    visit(navigation.sidenav);
  }
}

/** Depth-first walk over a sidenav tree. */
function eachItem(tree: SidenavConfig, visit: (item: SidenavItem) => void): void {
  for (const item of tree) {
    visit(item);
    if (item.children) eachItem(item.children, visit);
  }
}

export interface ApiNavigationInput {
  navigation: NavigationConfig;
  /** Every built operation, all languages. */
  operations: OperationView[];
  /** Route paths of authored pages in the default language. */
  pageRoutes: Set<string>;
  specs: ResolvedSpec[];
  defaultLanguage: string;
  diagnostics: Diagnostics;
}

/**
 * Rewrites `operation: createPayment` into the route it names, then
 * validates the result.
 *
 * Resolution happens here rather than inside `loadNavigation` so that
 * loader keeps its current signature and its independent-HMR contract — it
 * still knows nothing about specs, and the plugin can still reload
 * navigation on its own. This pass simply runs afterwards, once both specs
 * and navigation are in hand.
 *
 * Items are mutated in place: by the time navigation reaches the client it
 * carries an ordinary `path`, so `applyLangToSidenav` prefixes it and
 * `Sidenav` renders it with no knowledge that an operation was involved.
 */
export function applyApiNavigation(input: ApiNavigationInput): void {
  const { navigation, operations, pageRoutes, specs, defaultLanguage, diagnostics } = input;

  const byOperationId = new Map<string, OperationView>();
  for (const view of operations) {
    if (view.language === defaultLanguage) byOperationId.set(view.operationId, view);
  }

  const referenced = new Set<string>();

  // --- resolve `operation:` into `path` -------------------------------------
  eachTree(navigation, (tree) =>
    eachItem(tree, (item) => {
      if (!item.operation) return;
      const view = byOperationId.get(item.operation);
      if (!view) {
        // A hard error: this is the renamed-or-deleted-operation case, and it
        // produces a broken link in shipped output.
        diagnostics.fail(
          `Navigation references operation "${item.operation}", which no registered spec ` +
            `declares. Check the operationId, or remove the entry.`,
        );
        return;
      }
      referenced.add(item.operation);
      item.path = view.routePath;
      // `label` is optional in the nav file: omit it and the spec's `summary`
      // is used, so the sidebar stays correct when a summary is reworded.
      // It is a literal string either way, so the existing
      // config/navigation/translations/<lang>.yaml mechanism translates it.
      if (!item.label) item.label = view.summary;
    }),
  );

  // --- dangling internal paths under an API prefix — fail -------------------
  const operationRoutes = new Set(
    operations.filter((v) => v.language === defaultLanguage).map((v) => v.routePath),
  );
  const apiPrefixes = specs.map((s) => s.routePrefix).filter((p) => p !== '');

  eachTree(navigation, (tree) =>
    eachItem(tree, (item) => {
      const path = item.path;
      if (!path || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) return;
      // Scoped to routes inside an API area on purpose. A stale `path:` in a
      // guide sidenav is pre-existing behaviour this feature has no business
      // changing; a stale one under an API prefix is exactly the breakage
      // an upstream `operationId` rename causes, which is what this check is for.
      if (!apiPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return;
      if (operationRoutes.has(path) || pageRoutes.has(path)) return;
      diagnostics.fail(
        `Navigation entry "${item.label}" points at "${path}", which is not a route. ` +
          `Reference operations by "operation: <operationId>" rather than by path so ` +
          `slugs stay correct when the spec changes.`,
      );
    }),
  );

  // --- coverage — warn ------------------------------------------------------
  const uncovered = [...byOperationId.values()].filter(
    (view) => !referenced.has(view.operationId) && !operationRouteIsLinked(view, navigation),
  );

  if (uncovered.length > 0) {
    // Deliberately a warning. The page exists, works, is reachable by URL and
    // is indexed by Pagefind — it is unlinked, which is *incomplete*, not
    // *broken*. Failing here would also contradict principle 9: a spec-only
    // project has no nav entries at all and could never build. Teams wanting
    // CI enforcement set `strict: true`; teams with deliberately unlinked
    // operations leave it at warn, so no exemption list is needed.
    const lines = uncovered
      .map((view) => `      - operation: ${view.operationId}   # ${view.routePath}`)
      .join('\n');
    diagnostics.warn(
      `${uncovered.length} operation(s) have no navigation entry and are reachable only by URL:\n${lines}`,
    );
  }
}

/** True when some nav item already points at this operation's route by path. */
function operationRouteIsLinked(view: OperationView, navigation: NavigationConfig): boolean {
  let found = false;
  eachTree(navigation, (tree) =>
    eachItem(tree, (item) => {
      if (item.path === view.routePath) found = true;
    }),
  );
  return found;
}

/**
 * Fails the build when a generated operation route collides with an authored
 * page route.
 *
 * The same class as the content loader's existing route-collision check, and
 * hard for the same reason: two sources claiming one URL means one of them
 * silently never renders.
 */
export function checkRouteCollisions(
  operations: OperationView[],
  pageRoutes: Set<string>,
  diagnostics: Diagnostics,
): void {
  const seen = new Map<string, string>();

  for (const view of operations) {
    if (pageRoutes.has(view.routePath)) {
      diagnostics.fail(
        `Route collision at "${view.routePath}": operation "${view.operationId}" and an ` +
          `authored page both claim it. Rename the page, or move the API's content folder.`,
      );
      continue;
    }
    const previous = seen.get(view.routePath);
    if (previous && previous !== view.operationId) {
      diagnostics.fail(
        `Route collision at "${view.routePath}": operations "${previous}" and ` +
          `"${view.operationId}" produce the same slug.`,
      );
      continue;
    }
    seen.set(view.routePath, view.operationId);
  }
}
