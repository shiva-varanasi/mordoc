import { access } from 'node:fs/promises';
import { join } from 'node:path';
import type { ApiRegistry, OpenApiDocument, ResolvedSpec } from '../types/api.js';
import type { Diagnostics } from './diagnostics.js';
import { routePrefixFor } from './slug.js';

/** Directory holding the machine-generated specs, relative to the project root. */
export const SPEC_DIR = join('api', 'specs');

/**
 * A problem reported by the spec linter, formatted for a build log.
 * `location[0].pointer` is the JSON pointer into the document, which is the
 * one piece of context that makes a struct error actionable.
 */
interface SpecProblem {
  message: string;
  ruleId: string;
  severity: 'error' | 'warn';
  location: { pointer?: string }[];
}

function formatProblem(specFile: string, problem: SpecProblem): string {
  const pointer = problem.location?.[0]?.pointer;
  const where = pointer ? ` at ${pointer}` : '';
  return `${specFile}${where}: ${problem.message} (${problem.ruleId})`;
}

/**
 * Stage A — loads, validates and bundles every spec in the registry.
 *
 * The only stage that touches the OpenAPI library. Everything downstream
 * walks a plain object, which is what keeps `buildOperationViews` free of
 * library imports and cheap to extract if a second spec format ever earns
 * its own module.
 *
 * The document is **bundled, not dereferenced**. Bundling inlines external
 * file `$ref`s and leaves internal `#/components/...` pointers alone.
 * Dereferencing would break two things at once: it erases the component
 * name `FieldView.schemaRef` needs to render the type link, and it turns a
 * recursive schema into a circular object graph that cannot be
 * JSON-serialized into a virtual module. The field walker follows internal
 * pointers itself, and knows how to stop at a cycle.
 *
 * Validation runs the `minimal` ruleset — `struct` and `no-unresolved-refs`
 * at error severity, with the stylistic rules off. A spec that isn't valid
 * OpenAPI fails the build; one that merely lacks an `info.contact` does not,
 * because the docs site is not the API team's linter and failing there would
 * block a docs deploy over something the docs team cannot fix.
 */
export async function loadApiSpecs(
  projectRoot: string,
  registry: ApiRegistry,
  diagnostics: Diagnostics,
): Promise<ResolvedSpec[]> {
  // Imported here rather than at module scope so the cost lands only on
  // projects that actually registered a spec. `src/api/` as a whole is
  // already dynamically imported by the pipeline, so this is belt-and-braces
  // for the case where some other entry point reaches this module directly.
  const { bundle, createConfig, lint } = await import('@redocly/openapi-core');
  const config = await createConfig({ extends: ['minimal'] });

  const specs: ResolvedSpec[] = [];

  for (const entry of registry.entries) {
    const specPath = join(projectRoot, SPEC_DIR, entry.spec);

    try {
      await access(specPath);
    } catch {
      // A registry pointing at a missing file is unbuildable, not merely
      // unenriched — there is no baseline to render.
      diagnostics.fail(
        `config/api.yaml: API "${entry.id}" declares spec "${entry.spec}", but ` +
          `${join(SPEC_DIR, entry.spec)} does not exist.`,
      );
      continue;
    }

    // Only error-severity problems are surfaced. The ruleset's warn-severity
    // rules are style opinions about the *API* — "every operation should have
    // security defined", "prefer no trailing slash" — not defects in the
    // docs, and the spec is never hand-edited, so the docs team could not act
    // on them even if they wanted to. Worse, `strict: true` would then fail a
    // docs deploy over the API team's `security` block. The docs site is not
    // the API team's linter; it only needs the spec to be valid enough to
    // render, which is exactly the error class.
    const problems = (await lint({ ref: specPath, config })) as unknown as SpecProblem[];
    const errors = problems.filter((p) => p.severity === 'error');
    if (errors.length > 0) {
      diagnostics.fail(
        `Spec "${entry.spec}" is not valid OpenAPI:\n` +
          errors.map((p) => `      ${formatProblem(entry.spec, p)}`).join('\n'),
      );
      continue;
    }

    const result = await bundle({ ref: specPath, config, dereference: false });
    const document = result.bundle.parsed as OpenApiDocument;

    specs.push({
      id: entry.id,
      routePrefix: routePrefixFor(entry.id, entry.routePrefix),
      document,
    });
  }

  return specs;
}
