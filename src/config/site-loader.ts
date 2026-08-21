import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import type { FontConfig, SiteConfig } from '../types/site.js';
import type { ResolvedFont, ResolvedFonts } from '../types/fonts.js';

// Relative path to the site config file within any Mordoc project root.
const SITE_CONFIG_PATH = join('config', 'site.json');

// Directory a project's custom font files (declared via site.json's "fonts"
// field) are expected to live in.
const FONT_DIR = join('config', 'assets', 'fonts');

const FONT_SLOTS = ['body', 'code'] as const;
type FontSlot = (typeof FONT_SLOTS)[number];

// CSS format() hints, keyed by extension — all "-variations" since Mordoc's
// custom font files are expected to be variable fonts (one file covers the
// whole weight range).
const FONT_FORMAT_BY_EXTENSION: Record<string, string> = {
  woff2: 'woff2-variations',
  woff: 'woff-variations',
  ttf: 'truetype-variations',
};

function extensionOf(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx === -1 ? '' : filename.slice(idx + 1).toLowerCase();
}

/** Returns the CSS format() hint for a resolved font path, or null if unrecognized. */
export function fontFormat(filePath: string): string | null {
  return FONT_FORMAT_BY_EXTENSION[extensionOf(filePath)] ?? null;
}

// Fields that must be present and non-empty for a config to be considered valid.
const REQUIRED_FIELDS: (keyof SiteConfig)[] = [
  'name',
  'description',
  'baseUrl',
  'defaultLanguage',
];

/**
 * Validates the raw parsed JSON from site.json and narrows it to SiteConfig.
 * Throws a descriptive error if any required field is missing or malformed,
 * so the user gets actionable feedback rather than a cryptic runtime crash.
 */
function validateSiteConfig(raw: unknown): SiteConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('site.json must contain a JSON object.');
  }

  const obj = raw as Record<string, unknown>;

  for (const field of REQUIRED_FIELDS) {
    if (typeof obj[field] !== 'string' || obj[field] === '') {
      throw new Error(`site.json: "${field}" is required and must be a non-empty string.`);
    }
  }

  // Validate baseUrl with the built-in URL parser — it handles all the edge
  // cases (missing protocol, invalid characters, etc.) so we don't have to.
  const baseUrl = obj['baseUrl'] as string;
  try {
    new URL(baseUrl);
  } catch {
    throw new Error(`site.json: "baseUrl" must be a valid URL. Got: "${baseUrl}"`);
  }

  // A trailing slash on baseUrl would cause double-slashes when paths are appended.
  if (baseUrl.endsWith('/')) {
    throw new Error(`site.json: "baseUrl" must not end with a trailing slash. Got: "${baseUrl}"`);
  }

  const meta = obj['metadata'];
  if (meta !== undefined) {
    if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) {
      throw new Error('site.json: "metadata" must be an object.');
    }
    const metaObj = meta as Record<string, unknown>;
    if (metaObj['ogImage'] !== undefined) {
      if (typeof metaObj['ogImage'] !== 'string') {
        throw new Error('site.json: "metadata.ogImage" must be a string.');
      }
      if (!metaObj['ogImage'].startsWith('/')) {
        throw new Error(
          `site.json: "metadata.ogImage" must be a root-relative path starting with "/" (e.g. "/images/og-cover.png"). Got: "${metaObj['ogImage']}"`,
        );
      }
    }
  }

  const fonts = obj['fonts'];
  if (fonts !== undefined) {
    if (typeof fonts !== 'object' || fonts === null || Array.isArray(fonts)) {
      throw new Error('site.json: "fonts" must be an object.');
    }
    const fontsObj = fonts as Record<string, unknown>;
    for (const slot of FONT_SLOTS) {
      const face = fontsObj[slot];
      if (face !== undefined) {
        validateFontFace(face, slot);
      }
    }
  }

  return raw as SiteConfig;
}

/** Validates one slot of site.json's "fonts" field (fonts.body or fonts.code). */
function validateFontFace(face: unknown, slot: FontSlot): void {
  if (typeof face !== 'object' || face === null || Array.isArray(face)) {
    throw new Error(`site.json: "fonts.${slot}" must be an object.`);
  }
  const faceObj = face as Record<string, unknown>;
  if (typeof faceObj['family'] !== 'string' || faceObj['family'] === '') {
    throw new Error(`site.json: "fonts.${slot}.family" is required and must be a non-empty string.`);
  }
  // "family" gets interpolated into a generated @font-face/--font-sans CSS
  // string literal — quote or backslash characters would break that CSS,
  // so reject them here rather than let a typo produce silently-broken output.
  if (/['"\\]/.test(faceObj['family'])) {
    throw new Error(
      `site.json: "fonts.${slot}.family" must not contain quote or backslash characters. Got: "${faceObj['family']}"`,
    );
  }
  for (const field of ['regular', 'italic'] as const) {
    if (faceObj[field] !== undefined && typeof faceObj[field] !== 'string') {
      throw new Error(`site.json: "fonts.${slot}.${field}" must be a string.`);
    }
  }
}

/**
 * Reads and validates the site.json config file for a Mordoc project.
 *
 * @param projectRoot - Absolute path to the project's root directory.
 * @returns The validated site configuration object.
 * @throws If the file is missing, unreadable, contains invalid JSON,
 *         or fails field validation.
 */
export async function loadSiteConfig(projectRoot: string): Promise<SiteConfig> {
  const filePath = join(projectRoot, SITE_CONFIG_PATH);

  let content: string;
  try {
    content = await readFile(filePath, 'utf-8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      throw new Error(`Config file not found: ${filePath}\nEvery Mordoc project requires a config/site.json file.`);
    }
    throw new Error(`Failed to read ${filePath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`Failed to parse ${filePath}: Invalid JSON.`);
  }

  return validateSiteConfig(parsed);
}

/**
 * Resolves one declared font file (e.g. site.json's fonts.body.regular) to
 * an absolute disk path. Unlike config/assets/'s convention-discovered
 * assets (favicon, logo), this is an explicit reference the user wrote —
 * a missing file or unsupported extension is a broken reference, not an
 * absent optional file, so this throws rather than returning null.
 *
 * @param label - Dotted path for error messages, e.g. "body.regular".
 */
async function resolveFontFile(
  projectRoot: string,
  filename: string,
  label: string,
): Promise<string> {
  const ext = extensionOf(filename);
  if (!FONT_FORMAT_BY_EXTENSION[ext]) {
    throw new Error(
      `site.json: "fonts.${label}" must be a .woff2, .woff, or .ttf file. Got: "${filename}"`,
    );
  }
  const filePath = join(projectRoot, FONT_DIR, filename);
  try {
    await access(filePath);
  } catch {
    throw new Error(
      `site.json: "fonts.${label}" references "${filename}", but no such file was found at ${filePath}.`,
    );
  }
  return filePath;
}

/** Resolves one slot's declared font face (site.json's fonts.body or fonts.code). */
async function resolveFontFace(
  projectRoot: string,
  face: FontConfig,
  slot: FontSlot,
): Promise<ResolvedFont> {
  const regular = face.regular
    ? await resolveFontFile(projectRoot, face.regular, `${slot}.regular`)
    : null;
  const italic = face.italic
    ? await resolveFontFile(projectRoot, face.italic, `${slot}.italic`)
    : null;
  return { family: face.family, regular, italic };
}

/**
 * Resolves the custom fonts declared in site.json's "fonts" field, one slot
 * per role ("body" for --font-sans, "code" for --font-mono). A slot is
 * null when its declaration is absent — that role falls back to Mordoc's
 * default stack. Whichever "regular"/"italic" files are declared are
 * validated to exist and use a supported format.
 *
 * @param projectRoot - Absolute path to the project's root directory.
 * @param site - Already-loaded, already-validated site config.
 */
export async function loadFonts(projectRoot: string, site: SiteConfig): Promise<ResolvedFonts> {
  const fonts = site.fonts;
  const body = fonts?.body ? await resolveFontFace(projectRoot, fonts.body, 'body') : null;
  const code = fonts?.code ? await resolveFontFace(projectRoot, fonts.code, 'code') : null;
  return { body, code };
}
