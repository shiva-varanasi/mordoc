import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import yaml from 'js-yaml';
import type { SidenavConfig, SidenavItem } from '../types/navigation.js';

const NAV_DIR = join('config', 'navigation');
const DEFAULT_SIDENAV = 'sidenav.yaml';

function validateItem(item: unknown, location: string, fileName: string): SidenavItem {
  if (typeof item !== 'object' || item === null) {
    throw new Error(`${fileName}: ${location} must be an object.`);
  }

  const obj = item as Record<string, unknown>;

  if (typeof obj['label'] !== 'string' || obj['label'] === '') {
    throw new Error(`${fileName}: ${location}.label is required and must be a non-empty string.`);
  }

  if (obj['path'] !== undefined && (typeof obj['path'] !== 'string' || obj['path'] === '')) {
    throw new Error(`${fileName}: ${location}.path must be a non-empty string when provided.`);
  }

  if (obj['children'] !== undefined) {
    if (!Array.isArray(obj['children'])) {
      throw new Error(`${fileName}: ${location}.children must be an array.`);
    }

    if (obj['children'].length === 0) {
      throw new Error(`${fileName}: ${location}.children must not be empty when provided.`);
    }

    for (const [i, child] of (obj['children'] as unknown[]).entries()) {
      validateItem(child, `${location}.children[${i}]`, fileName);
    }
  }

  if (obj['path'] === undefined && obj['children'] === undefined) {
    throw new Error(
      `${fileName}: ${location} must have either "path", "children", or both.`,
    );
  }

  return item as SidenavItem;
}

function validateSidenavArray(raw: unknown, fileName: string): SidenavConfig {
  if (!Array.isArray(raw)) {
    throw new Error(`${fileName}: file must contain a YAML array at the top level.`);
  }

  if (raw.length === 0) {
    throw new Error(`${fileName}: navigation array must not be empty.`);
  }

  return raw.map((item, index) => validateItem(item, `items[${index}]`, fileName));
}

/**
 * Reads and validates a sidenav YAML file at the given absolute path.
 * Shared by both the standalone sidenav loader and the topnav loader.
 */
export async function loadSidenavFile(filePath: string): Promise<SidenavConfig> {
  const fileName = filePath.split(/[\\/]/).pop()!;

  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new Error(`Sidenav file not found: ${filePath}`);
    }
    throw new Error(`Failed to read ${filePath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(content);
  } catch (err) {
    throw new Error(`Failed to parse ${filePath}: ${(err as Error).message}`);
  }

  return validateSidenavArray(parsed, fileName);
}

/**
 * Loads the default config/navigation/sidenav.yaml for projects without topnav.
 *
 * @param projectRoot - Absolute path to the project's root directory.
 * @returns The validated side navigation configuration.
 */
export async function loadSidenavConfig(projectRoot: string): Promise<SidenavConfig> {
  const filePath = join(projectRoot, NAV_DIR, DEFAULT_SIDENAV);
  return loadSidenavFile(filePath);
}
