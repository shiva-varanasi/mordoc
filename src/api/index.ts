import type { ApiRegistry, OperationView } from '../types/api.js';
import type { ContentMap } from '../types/content.js';
import type { NavigationConfig } from '../types/pipeline.js';
import { Diagnostics } from './diagnostics.js';
import { buildOperationViews } from './build-operation-views.js';
import { loadEnrichment } from './enrichment-loader.js';
import { parseApiDocs } from './enrichment-parser.js';
import { applyApiNavigation, checkRouteCollisions } from './nav-check.js';
import { loadApiSpecs } from './spec-loader.js';

export { loadApiRegistry, API_CONFIG_PATH } from './registry-loader.js';
export { operationSlug, routePrefixFor } from './slug.js';

/**
 * Entry point for the API reference stages.
 *
 * This module exists so `pipeline.ts` has exactly one thing to import, and
 * so that import can be dynamic: a project without `config/api.yaml` never
 * loads this file, and therefore never loads the OpenAPI library sitting
 * behind it. That gets most of the isolation benefit of shipping the
 * feature as a separate package at none of the cost — no plugin API
 * designed against a sample size of one, no cross-package component
 * registry for the SSG.
 */

export interface RunApiStagesInput {
  projectRoot: string;
  registry: ApiRegistry;
  contentMap: ContentMap;
  /** Mutated in place: `operation:` references are resolved to routes. */
  navigation: NavigationConfig;
  variables: Record<string, unknown>;
  defaultLanguage: string;
  languages: string[];
  /** When true, `flush()` prints full warning detail inline instead of a `--verbose` hint. */
  verbose: boolean;
}

export interface RunApiStagesResult {
  operations: OperationView[];
  /** Count of distinct warnings recorded across every stage — lets the CLI print a final tally. */
  warningCount: number;
}

/**
 * Runs stage B, then A, C and D, then the navigation checks, then reports.
 *
 * Diagnostics are collected across every stage and flushed once at the end,
 * so a spec with twenty problems reports all twenty instead of making the
 * author fix and re-run twenty times. `flush()` throws if anything in the
 * hard-failure class was recorded — or, under `strict: true`, if anything at
 * all was.
 */
export async function runApiStages(input: RunApiStagesInput): Promise<RunApiStagesResult> {
  const { projectRoot, registry, contentMap, navigation, variables, defaultLanguage, languages, verbose } = input;

  const diagnostics = new Diagnostics(registry.strict);

  const enrichmentEntries = await loadEnrichment(projectRoot, registry);

  const specs = await loadApiSpecs(projectRoot, registry, diagnostics);
  const apiDocs = await parseApiDocs(enrichmentEntries, variables, diagnostics);

  const operations = await buildOperationViews({
    projectRoot,
    specs,
    apiDocs,
    languages,
    defaultLanguage,
    variables,
    diagnostics,
  });

  // Enrichment files that name nothing in the spec. Warn and skip, never
  // fail: an upstream `operationId` rename would otherwise turn docs CI red
  // and block every unrelated deploy until the docs team reconciled
  // filenames they were never told had changed.
  const knownOperations = new Set(operations.map((v) => `${v.specId}/${v.operationId}`));
  const knownSchemas = new Set<string>();
  for (const spec of specs) {
    const components = spec.document['components'];
    const schemas =
      typeof components === 'object' && components !== null
        ? (components as Record<string, unknown>)['schemas']
        : undefined;
    if (typeof schemas === 'object' && schemas !== null) {
      for (const name of Object.keys(schemas)) knownSchemas.add(`${spec.id}/${name}`);
    }
  }

  for (const entry of enrichmentEntries) {
    const known =
      entry.kind === 'operation'
        ? knownOperations.has(`${entry.specId}/${entry.target}`)
        : knownSchemas.has(`${entry.specId}/${entry.target}`);
    if (known) continue;
    diagnostics.warn(
      entry.kind === 'operation'
        ? `${entry.filePath}: no operation with operationId "${entry.target}" — file skipped.`
        : `${entry.filePath}: no component schema named "${entry.target}" — file skipped.`,
    );
  }

  const allPageRoutes = new Set(contentMap.entries.map((e) => e.routePath));
  const defaultLanguagePageRoutes = new Set(
    contentMap.entries.filter((e) => e.language === defaultLanguage).map((e) => e.routePath),
  );

  // Both checks compare the nav against the set of operations that exist. If
  // a spec failed to load that set is empty through no fault of the nav, so
  // running them would bury the real cause under one dangling-reference error
  // per entry. Report the cause; the nav is checked on the next run.
  if (!diagnostics.hasFailures) {
    checkRouteCollisions(operations, allPageRoutes, diagnostics);
    applyApiNavigation({
      navigation,
      operations,
      pageRoutes: defaultLanguagePageRoutes,
      specs,
      defaultLanguage,
      diagnostics,
    });
  }

  const warningCount = diagnostics.flush({ verbose });
  return { operations, warningCount };
}
