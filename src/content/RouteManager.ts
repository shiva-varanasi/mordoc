/**
 * RouteManager - Manages URL routing and path construction
 * Handles language prefixing and route generation for content files
 */

import path from 'path';
import { Route, RouteMap } from '../types/navigation';
import {
  extractLanguageFromPath,
  removeLanguagePrefix,
  buildPathWithLanguage,
  getRelativeContentPath,
} from '../utils/language-utils';
import { filePathToSlug } from '../utils/slugify';

export class RouteManager {
  private defaultLanguage: string;
  private availableLanguages: string[];

  constructor(defaultLanguage: string = 'en', availableLanguages: string[] = ['en']) {
    this.defaultLanguage = defaultLanguage;
    this.availableLanguages = availableLanguages;
  }

  /**
   * Create a route object from a content file path
   * @param filePath - Relative path from content/ directory (e.g., "en/getting-started.md")
   * @returns Route object with path, slug, language, and file locations
   */
  createRoute(filePath: string): Route {
    // Extract language from path
    const language = extractLanguageFromPath(filePath) || this.defaultLanguage;

    // Get relative path without language prefix
    const relativePath = removeLanguagePrefix(filePath);
    console.log('relativePath inside route manager: ', relativePath);

    // Generate slug from file path
    const slug = filePathToSlug(relativePath);
    console.log('slug inside route manager: ', slug);

    // Get directory path (excluding language prefix and filename)
    const dirPath = path.dirname(relativePath) === '.' ? '' : path.dirname(relativePath);
    console.log('dirPath inside route manager: ', dirPath);

    // Build URL path with language prefix and directory structure
    const urlPath = buildPathWithLanguage(
      dirPath ? `${dirPath}/${slug}` : slug,
      language, 
      this.defaultLanguage
    );
    console.log('urlPath inside route manager: ', urlPath);

    // Determine paths in dist/ directory
    const contentPath = this.getContentDataPath(slug, language);
    console.log('contentPath inside route manager: ', contentPath);

    return {
      path: urlPath,
      slug,
      dirPath,
      language,
      contentPath,
    };
  }

  /**
   * Create a route map from an array of file paths
   * @param filePaths - Array of relative file paths from content/ directory
   * @returns RouteMap with URL paths as keys
   */
  createRouteMap(filePaths: string[]): RouteMap {
    const routeMap = new Map<string, Route>();

    for (const filePath of filePaths) {
      const route = this.createRoute(filePath);
      routeMap.set(route.path, route);
    }

    return routeMap;
  }

  /**
   * Get content data JSON file path in dist/content-data/
   * @param slug - Content slug
   * @param language - Language code
   * @returns Path to JSON file relative to dist/
   */
  private getContentDataPath(slug: string, language: string): string {
    // For default language: content-data/slug.json
    // For other languages: content-data/lang/slug.json
    if (language === this.defaultLanguage) {
      return slug === 'index' 
        ? 'content-data/index.json'
        : `content-data/${slug}.json`;
    }

    return slug === 'index'
      ? `content-data/${language}/index.json`
      : `content-data/${language}/${slug}.json`;
  }

  /**
   * Get HTML file path in dist/
   * @param slug - Content slug
   * @param language - Language code
   * @returns Path to HTML file relative to dist/
   */
  private getHtmlPath(slug: string, language: string): string {
    // For default language: slug/index.html or index.html (for home)
    // For other languages: lang/slug/index.html or lang/index.html (for home)
    if (language === this.defaultLanguage) {
      return slug === 'index'
        ? 'index.html'
        : `${slug}/index.html`;
    }

    return slug === 'index'
      ? `${language}/index.html`
      : `${language}/${slug}/index.html`;
  }

  /**
   * Extract language from a URL path
   * @param urlPath - URL path (e.g., "/es/getting-started")
   * @returns Language code or default language
   */
  getLanguageFromPath(urlPath: string): string {
    const parts = urlPath.split('/').filter(Boolean);
    
    if (parts.length > 0 && this.availableLanguages.includes(parts[0])) {
      return parts[0];
    }

    return this.defaultLanguage;
  }

  /**
   * Get slug from a URL path (without language prefix)
   * @param urlPath - URL path (e.g., "/es/getting-started" or "/getting-started")
   * @returns Slug
   */
  getSlugFromPath(urlPath: string): string {
    const parts = urlPath.split('/').filter(Boolean);

    // Remove language prefix if present
    if (parts.length > 0 && this.availableLanguages.includes(parts[0])) {
      parts.shift();
    }

    // Join remaining parts (for nested paths)
    return parts.join('/') || 'index';
  }

  /**
   * Build URL path from slug and language
   * @param slug - Content slug
   * @param language - Language code
   * @returns URL path
   */
  buildPath(slug: string, language: string): string {
    return buildPathWithLanguage(slug, language, this.defaultLanguage);
  }

  /**
   * Check if a language is the default language
   * @param language - Language code
   * @returns True if default language
   */
  isDefaultLanguage(language: string): boolean {
    return language === this.defaultLanguage;
  }

  /**
   * Get all routes grouped by language
   * @param routeMap - Route map
   * @returns Map of language code to array of routes
   */
  groupRoutesByLanguage(routeMap: RouteMap): Map<string, Route[]> {
    const grouped = new Map<string, Route[]>();

    for (const route of routeMap.values()) {
      const existing = grouped.get(route.language) || [];
      existing.push(route);
      grouped.set(route.language, existing);
    }

    return grouped;
  }

  /**
   * Find route by slug and language
   * @param routeMap - Route map
   * @param slug - Content slug
   * @param language - Language code
   * @returns Route or undefined
   */
  findRoute(routeMap: RouteMap, slug: string, language: string): Route | undefined {
    const path = this.buildPath(slug, language);
    return routeMap.get(path);
  }
}