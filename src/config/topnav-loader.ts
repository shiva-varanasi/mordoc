import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';
import type { TopnavConfig, TopnavItem, ResolvedTopnavConfig } from '../types/navigation.js';
import { loadSidenavFile } from './sidenav-loader.js';

const NAV_DIR = join('config', 'navigation');
const TOPNAV_CONFIG_PATH = join(NAV_DIR, 'topnav.yaml');

function validateTopnavConfig(raw: unknown): TopnavConfig {
  if (!Array.isArray(raw)) {
    throw new Error('topnav.yaml: file must contain a YAML array at the top level.');
  }

  if (raw.length === 0) {
    throw new Error('topnav.yaml: navigation array must not be empty.');
  }

  const seenSidenavs = new Set<string>();

  for (const [index, entry] of (raw as unknown[]).entries()) {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`topnav.yaml: items[${index}] must be an object.`);
    }

    const obj = entry as Record<string, unknown>;

    if (typeof obj['label'] !== 'string' || obj['label'] === '') {
      throw new Error(`topnav.yaml: items[${index}].label is required and must be a non-empty string.`);
    }

    if (typeof obj['path'] !== 'string' || obj['path'] === '') {
      throw new Error(`topnav.yaml: items[${index}].path is required and must be a non-empty string.`);
    }

    if (typeof obj['sidenav'] !== 'string' || obj['sidenav'] === '') {
      throw new Error(`topnav.yaml: items[${index}].sidenav is required and must be a non-empty string.`);
    }

    if (!obj['sidenav'].endsWith('.yaml') && !obj['sidenav'].endsWith('.yml')) {
      throw new Error(`topnav.yaml: items[${index}].sidenav must be a .yaml or .yml filename.`);
    }

    if (seenSidenavs.has(obj['sidenav'] as string)) {
      throw new Error(`topnav.yaml: duplicate sidenav reference "${obj['sidenav']}".`);
    }
    seenSidenavs.add(obj['sidenav'] as string);
  }

  return raw as TopnavConfig;
}

/**
 * Loads config/navigation/topnav.yaml and resolves all referenced sidenav files.
 * Returns null if topnav.yaml does not exist (single-sidenav project).
 *
 * @param projectRoot - Absolute path to the project's root directory.
 * @returns The resolved topnav with loaded sidenavs, or null if topnav.yaml is absent.
 */
export async function loadTopnavConfig(projectRoot: string): Promise<ResolvedTopnavConfig | null> {
  const filePath = join(projectRoot, TOPNAV_CONFIG_PATH);

  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw new Error(`Failed to read ${filePath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch (err) {
    throw new Error(`Failed to parse ${filePath}: ${(err as Error).message}`);
  }

  const topnavItems = validateTopnavConfig(parsed);

  const resolved: ResolvedTopnavConfig = [];
  for (const item of topnavItems) {
    const sidenavPath = join(projectRoot, NAV_DIR, item.sidenav);
    const sidenav = await loadSidenavFile(sidenavPath);
    resolved.push({
      label: item.label,
      path: item.path,
      sidenav,
    });
  }

  return resolved;
}
