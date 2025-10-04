/**
 * ContentLoader - Discovers and loads markdown files from content directory
 * Scans the content/ folder and reads raw markdown content
 */

import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { RouteManager } from './RouteManager';
import { Route, RouteMap } from '../types/navigation';

export interface RawContentFile {
  filePath: string; // Relative path from content/ (e.g., "en/getting-started.md")
  absolutePath: string; // Absolute file system path
  content: string; // Raw markdown content
  route: Route; // Route information
}

export class ContentLoader {
  private contentDir: string;
  private routeManager: RouteManager;

  constructor(contentDir: string, routeManager: RouteManager) {
    this.contentDir = contentDir;
    this.routeManager = routeManager;
  }

  /**
   * Discover all markdown files in the content directory
   * @returns Array of relative file paths from content/
   */
  async discoverFiles(): Promise<string[]> {
    // Check if content directory exists
    if (!fs.existsSync(this.contentDir)) {
      throw new Error(`Content directory not found: ${this.contentDir}`);
    }

    // Find all .md and .mdx files recursively
    const files = await fg(['**/*.md', '**/*.mdx'], {
      cwd: this.contentDir,
      ignore: ['**/node_modules/**', '**/.git/**'],
    });

    // Sort files alphabetically for consistent ordering
    return files.sort();
  }

  /**
   * Load a single markdown file
   * @param filePath - Relative path from content/ directory
   * @returns Raw content file object
   */
  async loadFile(filePath: string): Promise<RawContentFile> {
    const absolutePath = path.join(this.contentDir, filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    // Read file content
    const content = fs.readFileSync(absolutePath, 'utf8');

    // Create route for this file
    const route = this.routeManager.createRoute(filePath);

    return {
      filePath,
      absolutePath,
      content,
      route,
    };
  }

  /**
   * Load all markdown files from content directory
   * @returns Array of raw content files
   */
  async loadAll(): Promise<RawContentFile[]> {
    const filePaths = await this.discoverFiles();

    const files: RawContentFile[] = [];

    for (const filePath of filePaths) {
      try {
        const file = await this.loadFile(filePath);
        files.push(file);
      } catch (error) {
        console.warn(`Warning: Failed to load file ${filePath}:`, (error as Error).message);
        // Continue loading other files
      }
    }

    return files;
  }

  /**
   * Load all files and create a route map
   * @returns RouteMap with all discovered routes
   */
  async loadWithRoutes(): Promise<{ files: RawContentFile[]; routeMap: RouteMap }> {
    const files = await this.loadAll();
    const filePaths = files.map((f) => f.filePath);
    const routeMap = this.routeManager.createRouteMap(filePaths);

    return {
      files,
      routeMap,
    };
  }

  /**
   * Load files for a specific language
   * @param language - Language code
   * @returns Array of raw content files for that language
   */
  async loadByLanguage(language: string): Promise<RawContentFile[]> {
    const allFiles = await this.loadAll();
    return allFiles.filter((file) => file.route.language === language);
  }

  /**
   * Check if content exists for a specific language
   * @param language - Language code
   * @returns True if content exists for the language
   */
  async hasContentForLanguage(language: string): Promise<boolean> {
    const filePaths = await this.discoverFiles();
    
    // Check if any file starts with the language prefix
    return filePaths.some((filePath) => {
      const parts = filePath.split('/');
      return parts.length > 0 && parts[0] === language;
    });
  }

  /**
   * Get statistics about discovered content
   * @returns Content statistics
   */
  async getStats(): Promise<{
    totalFiles: number;
    byLanguage: Record<string, number>;
    byExtension: Record<string, number>;
  }> {
    const files = await this.loadAll();

    const stats = {
      totalFiles: files.length,
      byLanguage: {} as Record<string, number>,
      byExtension: {} as Record<string, number>,
    };

    for (const file of files) {
      // Count by language
      const lang = file.route.language;
      stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;

      // Count by extension
      const ext = path.extname(file.filePath);
      stats.byExtension[ext] = (stats.byExtension[ext] || 0) + 1;
    }

    return stats;
  }

  /**
   * Find a file by slug and language
   * @param slug - Content slug
   * @param language - Language code
   * @returns Raw content file or undefined
   */
  async findFile(slug: string, language: string): Promise<RawContentFile | undefined> {
    const files = await this.loadAll();
    
    return files.find((file) => {
      return file.route.slug === slug && file.route.language === language;
    });
  }
}