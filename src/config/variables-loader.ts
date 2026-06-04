import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';

const VARIABLES_PATH = join('config', 'variables.yaml');

/**
 * Reads config/variables.yaml and returns a flat key-value map injected
 * as Markdoc variables during content transform.
 *
 * The file is optional — projects that don't need variable substitution
 * can omit it entirely. When absent, an empty object is returned so the
 * rest of the pipeline can always treat variables as a plain record.
 *
 * Values may be any YAML-serializable type (string, number, boolean, etc.);
 * Markdoc accepts any value in its `variables` map and will stringify
 * scalars when they appear in inline `{{ $name }}` expressions.
 *
 * @param projectRoot - Absolute path to the user's project root.
 */
export async function loadVariables(projectRoot: string): Promise<Record<string, unknown>> {
  const filePath = join(projectRoot, VARIABLES_PATH);

  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    throw new Error(`Failed to read ${filePath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch (err) {
    throw new Error(`Failed to parse ${filePath}: ${(err as Error).message}`);
  }

  if (parsed === null || parsed === undefined) {
    return {};
  }

  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(
      `${filePath}: must contain a YAML mapping (key: value pairs), not a list or scalar.`,
    );
  }

  return parsed as Record<string, unknown>;
}
