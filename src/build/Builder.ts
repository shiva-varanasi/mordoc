/**
 * Builder - Main build orchestrator for Mordoc
 * Coordinates the entire static site generation process
 */

import fs from 'fs';
import path from 'path';
import { ConfigLoader } from '../config/ConfigLoader';
import { ThemeGenerator } from '../config/ThemeGenerator';
import { ContentLoader, RawContentFile } from '../content/ContentLoader';
import { ContentProcessor } from '../content/ContentProcessor';
import { RouteManager } from '../content/RouteManager';
import { HtmlGenerator } from './HtmlGenerator';
import { ProcessedContent, ContentDataFile } from '../types/content';
import { SiteConfig } from '../types/config';
import { ClientBundler } from './ClientBundler';
import { StyleCompiler } from '../config/StyleCompiler';
import { mergeGlobalOverrides } from '../styles/variables/main';
import { SearchIndexer } from './SearchIndexer';

export interface BuilderOptions {
  projectRoot: string; // Path to user's project
  outputDir?: string; // Output directory (default: dist)
  clean?: boolean; // Clean output directory before build (default: true)
  includeDrafts?: boolean; // Include draft content (default: false)
  verbose?: boolean; // Verbose logging (default: false)
}

export class Builder {
  private projectRoot: string;
  private outputDir: string;
  private contentDir: string;
  private configDir: string;
  private publicDir: string;
  private clean: boolean;
  private includeDrafts: boolean;
  private verbose: boolean;

  constructor(options: BuilderOptions) {
    this.projectRoot = options.projectRoot;
    this.outputDir = options.outputDir || path.join(this.projectRoot, 'dist');
    this.contentDir = path.join(this.projectRoot, 'content');
    this.configDir = path.join(this.projectRoot, 'config');
    this.publicDir = path.join(this.projectRoot, 'public');
    this.clean = options.clean ?? true;
    this.includeDrafts = options.includeDrafts ?? false;
    this.verbose = options.verbose ?? false;
  }

  /**
   * Execute the complete build process
   */
  async build(): Promise<void> {
    this.log('Starting Mordoc build...');

    try {
      // Step 1: Clean and prepare output directory
      if (this.clean) {
        this.log('Cleaning output directory...');
        this.cleanOutputDir();
      }
      this.ensureOutputDir();

      // Step 2: Load configuration
      this.log('Loading configuration...');
      const siteConfig = await this.loadConfig();

      // Step 3: Load and process content
      this.log('Loading content files...');
      const processedContent = await this.loadAndProcessContent(siteConfig);
      this.log(`Processed ${processedContent.length} content files`);

      // Step 4: Generate static HTML pages
      this.log('Generating static HTML pages...');
      await this.generateHtmlPages(processedContent, siteConfig);

      // Step 5: Generate content data JSON files (for SPA navigation)
      this.log('Generating content data files...');
      this.generateContentDataFiles(processedContent);

      // Step 6: Generate theme CSS
      this.log('Generating theme CSS...');
      this.generateThemeCSS(siteConfig);

      // Step 7: Bundle client React app
      this.log('Bundling client application...');
      await this.bundleClientApp();

      // Step 8: Copy static assets
      this.log('Copying static assets...');
      this.copyStaticAssets(siteConfig);

      // Step 9: Generate client config
      this.log('Generating client configuration...');
      this.generateClientConfig(siteConfig);

      // Step 10: Generate search index with Pagefind
      this.log('Generating search index...');
      await this.generateSearchIndex();

      this.log('✓ Build completed successfully!');
      this.printBuildStats(processedContent);
    } catch (error) {
      console.error('Build failed:', (error as Error).message);
      if (this.verbose) {
        console.error((error as Error).stack);
      }
      throw error;
    }
  }

  /**
   * Load site configuration
   */
  private async loadConfig(): Promise<SiteConfig> {
    const configLoader = new ConfigLoader(this.projectRoot);
    return await configLoader.load();
  }

  /**
   * Load and process all content files
   */
  private async loadAndProcessContent(siteConfig: SiteConfig): Promise<ProcessedContent[]> {
    // Create route manager with language settings
    const routeManager = new RouteManager(
      siteConfig.defaultLanguage,
      siteConfig.languages.map((lang) => lang.code)
    );

    // Load content files
    const contentLoader = new ContentLoader(this.contentDir, routeManager);
    const rawFiles = await contentLoader.loadAll();

    // Process content
    const contentProcessor = new ContentProcessor();
    const processedContent = contentProcessor.processAll(rawFiles);

    return processedContent;
  }

  /**
   * Generate static HTML pages for all content
   */
  private async generateHtmlPages(
    processedContent: ProcessedContent[],
    siteConfig: SiteConfig
  ): Promise<void> {
    const htmlGenerator = new HtmlGenerator({ siteConfig });

    for (const content of processedContent) {
      // Skip drafts in production
      if (!this.includeDrafts && content.metadata.frontmatter.draft) {
        continue;
      }

      const html = htmlGenerator.generatePage(content);
      this.writeHtmlFile(content, html);
    }

    // Generate 404 page
    const html404 = htmlGenerator.generate404Page();
    const path404 = path.join(this.outputDir, '404.html');
    fs.writeFileSync(path404, html404, 'utf8');
  }

  /**
   * Write HTML file for a content page
   */
  private writeHtmlFile(content: ProcessedContent, html: string): void {
    const { metadata } = content;
    const { language, slug, path: urlPath } = metadata;

    // Determine output path
    let outputPath: string;
    if (language === metadata.frontmatter.sidenavRef || language === 'en') {
      // Default language
      outputPath = slug === 'index'
        ? path.join(this.outputDir, 'index.html')
        : path.join(this.outputDir, urlPath, 'index.html');
    } else {
      // Non-default language
      outputPath = slug === 'index'
        ? path.join(this.outputDir, language, 'index.html')
        : path.join(this.outputDir, language, urlPath, 'index.html');
    }

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write HTML file
    fs.writeFileSync(outputPath, html, 'utf8');
  }

  /**
   * Generate JSON data files for SPA navigation
   */
  private generateContentDataFiles(processedContent: ProcessedContent[]): void {
    const contentDataDir = path.join(this.outputDir, 'content-data');
    fs.mkdirSync(contentDataDir, { recursive: true });
  
    for (const content of processedContent) {
      // Skip drafts
      if (!this.includeDrafts && content.metadata.frontmatter.draft) {
        continue;
      }
  
      const dataFile: ContentDataFile = {
        metadata: content.metadata,
        renderable: content.renderable,
      };
  
      const json = JSON.stringify(dataFile);
      const { language, slug, dirPath } = content.metadata;
  
      // Determine output path
      let outputPath: string;
      if (language === 'en') {
        // For default language
        if (slug === 'index' && !dirPath) {
          // Root index page
          outputPath = path.join(contentDataDir, 'index.json');
        } else if (dirPath) {
          // Page in subdirectory
          outputPath = path.join(contentDataDir, dirPath, `${slug}.json`);
        } else {
          // Page at root level
          outputPath = path.join(contentDataDir, `${slug}.json`);
        }
      } else {
        // For non-default languages
        const langDir = path.join(contentDataDir, language);
        fs.mkdirSync(langDir, { recursive: true });
        
        if (slug === 'index' && !dirPath) {
          // Root index page in non-default language
          outputPath = path.join(langDir, 'index.json');
        } else if (dirPath) {
          // Page in subdirectory in non-default language
          outputPath = path.join(langDir, dirPath, `${slug}.json`);
        } else {
          // Page at root level in non-default language
          outputPath = path.join(langDir, `${slug}.json`);
        }
      }
  
      // Ensure directory exists
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      
      // Write file
      fs.writeFileSync(outputPath, json, 'utf8');
    }
  }

  /**
   * Generate theme CSS and component styles
   */
  private generateThemeCSS(siteConfig: SiteConfig): void {
    const assetsDir = path.join(this.outputDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
  
    // Load user style overrides and generate styles
    const styleCompiler = new StyleCompiler(this.projectRoot);
    const stylesCss = styleCompiler.generateCSS();
    const stylesPath = path.join(assetsDir, 'styles.css');
    fs.writeFileSync(stylesPath, stylesCss, 'utf8');
    
    // Generate theme.css (CSS variables) using global defaults
    const globalVars = mergeGlobalOverrides();
    const themeGenerator = new ThemeGenerator(globalVars);
    const themeCss = themeGenerator.generateCSSVariables();
    const themePath = path.join(assetsDir, 'theme.css');
    fs.writeFileSync(themePath, themeCss, 'utf8');
  }

  /**
   * Bundle client React application
   */
  private async bundleClientApp(): Promise<void> {
    // Get the Mordoc package root (where src/ is located)
    const mordocRoot = path.join(__dirname, '../..');

    const bundler = new ClientBundler({
      projectRoot: mordocRoot,
      outputDir: this.outputDir,
      minify: !this.verbose, // Don't minify in verbose mode for debugging
      sourcemap: this.verbose, // Generate sourcemaps in verbose mode
    });

    await bundler.bundle();
  }

  /**
   * Copy static assets (logo, favicon, public/ folder, and MORDOC fonts)
   */
  private copyStaticAssets(siteConfig: SiteConfig): void {
    const assetsDir = path.join(this.outputDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    // Copy MORDOC's built-in fonts
    this.copyMordocAssets();

    // Copy logo
    if (siteConfig.assets.logo) {
      const logoSrc = path.join(this.configDir, siteConfig.assets.logo);
      if (fs.existsSync(logoSrc)) {
        const logoDest = path.join(assetsDir, siteConfig.assets.logo);
        fs.copyFileSync(logoSrc, logoDest);
      }
    }

    // Copy favicon
    if (siteConfig.assets.favicon) {
      const faviconSrc = path.join(this.configDir, siteConfig.assets.favicon);
      if (fs.existsSync(faviconSrc)) {
        const faviconDest = path.join(this.outputDir, siteConfig.assets.favicon);
        fs.copyFileSync(faviconSrc, faviconDest);
      }
    }

    // Copy public/ directory
    if (fs.existsSync(this.publicDir)) {
      this.copyDirectory(this.publicDir, this.outputDir);
    }
  }

  /**
   * Copy MORDOC's built-in assets (fonts, etc.)
   */
  private copyMordocAssets(): void {
    const mordocRoot = path.join(__dirname, '../..');
    const mordocAssetsDir = path.join(mordocRoot, 'src/assets');
    
    if (!fs.existsSync(mordocAssetsDir)) {
      return;
    }

    const outputAssetsDir = path.join(this.outputDir, 'assets');
    
    // Copy fonts
    const fontsSource = path.join(mordocAssetsDir, 'fonts');
    if (fs.existsSync(fontsSource)) {
      const fontsDestination = path.join(outputAssetsDir, 'fonts');
      this.copyDirectory(fontsSource, fontsDestination);
    }
  }

  /**
   * Generate client configuration JSON
   */
  private generateClientConfig(siteConfig: SiteConfig): void {
    // Client config (subset of site config for browser)
    const clientConfig = {
      metadata: siteConfig.metadata,
      languages: siteConfig.languages,
      defaultLanguage: siteConfig.defaultLanguage,
      navigation: siteConfig.navigation,
      assets: siteConfig.assets,
    };

    const configPath = path.join(this.outputDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(clientConfig), 'utf8');
  }

  /**
   * Generate search index using Pagefind
   */
  private async generateSearchIndex(): Promise<void> {
    try {
      const searchIndexer = new SearchIndexer({
        outputDir: this.outputDir,
        verbose: this.verbose,
      });

      await searchIndexer.generateIndex();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️  Search indexing failed: ${errorMessage}`);
      console.warn('   Search functionality will not be available.');
      console.warn('   The build will continue, but search will be disabled.');
      
      // Don't throw - allow build to complete even if search indexing fails
      // This is useful for development or if Pagefind binary has issues
    }
  }  

  /**
   * Clean output directory
   */
  private cleanOutputDir(): void {
    if (fs.existsSync(this.outputDir)) {
      fs.rmSync(this.outputDir, { recursive: true, force: true });
    }
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Copy directory recursively
   */
  private copyDirectory(src: string, dest: string): void {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Log message if verbose mode is enabled
   */
  private log(message: string): void {
    if (this.verbose || true) {
      // Always log for now
      console.log(message);
    }
  }

  /**
   * Print build statistics
   */
  private printBuildStats(processedContent: ProcessedContent[]): void {
    const stats = {
      total: processedContent.length,
      byLanguage: {} as Record<string, number>,
    };

    for (const content of processedContent) {
      const lang = content.metadata.language;
      stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
    }

    console.log('\nBuild Statistics:');
    console.log(`  Total pages: ${stats.total}`);
    console.log('  By language:');
    for (const [lang, count] of Object.entries(stats.byLanguage)) {
      console.log(`    ${lang}: ${count}`);
    }
    console.log(`  Output: ${this.outputDir}`);
  }
}