/**
 * ConfigLoader - Loads and validates user configuration files
 * Merges user config with sensible defaults
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  SiteConfig,
  SideNavConfig,
  TopNavConfig,
  NavigationItem,
  SiteMetadata,
  LanguageConfig,
  AssetConfig,
} from '../types/config';

export class ConfigLoader {
  private configDir: string;

  constructor(projectRoot: string) {
    this.configDir = path.join(projectRoot, 'config');
  }

  /**
   * Load complete site configuration
   */
  async load(): Promise<SiteConfig> {
    // Load individual config components
    const metadata = this.loadMetadata();
    const languages = this.loadLanguages();
    const navigation = this.loadNavigationConfig();
    const assets = this.loadAssets();

    const config: SiteConfig = {
      metadata,
      languages,
      defaultLanguage: languages.find((lang) => lang.default)?.code || 'en',
      navigation,
      assets,
      assetsPath: '/assets',
    };

    // Validate the complete configuration
    this.validateConfig(config);

    return config;
  }

  /**
   * Load site metadata
   */
  private loadMetadata(): SiteMetadata {
    const defaultMetadata: SiteMetadata = {
      title: 'Documentation',
      description: 'Product documentation',
      keywords: [],
      baseUrl: '',
    };

    const siteJsonPath = path.join(this.configDir, 'site.json');
    if (!fs.existsSync(siteJsonPath)) {
      return defaultMetadata;
    }

    try {
      const siteJsonContent = fs.readFileSync(siteJsonPath, 'utf8');
      const userMetadata: Partial<SiteMetadata> = JSON.parse(siteJsonContent);
      
      // Merge user metadata with defaults
      return { ...defaultMetadata, ...userMetadata };
    } catch (error) {
      throw new Error(`Failed to parse site.json: ${(error as Error).message}`);
    }
  }

  /**
   * Load language configuration
   */
  private loadLanguages(): LanguageConfig[] {
    // Default: English only
    const defaultLanguages: LanguageConfig[] = [
      {
        code: 'en',
        label: 'English',
        default: true,
      },
    ];

    // TODO: Load from languages.json if exists
    return defaultLanguages;
  }

  /**
   * Load navigation configuration
   */
  private loadNavigationConfig(): {
    sidenav: SideNavConfig;
    topnav?: TopNavConfig;
    additionalSidenavs?: Record<string, SideNavConfig>;
  } {
    const sidenav = this.loadSideNav('sidenav.yaml');
    const topnav = this.loadTopNav();
    const additionalSidenavs = this.loadAdditionalSidenavs();

    return {
      sidenav,
      topnav,
      additionalSidenavs,
    };
  }

  /**
   * Load main sidenav configuration
   */
  private loadSideNav(filename: string): SideNavConfig {
    const sidenavPath = path.join(this.configDir, filename);

    if (!fs.existsSync(sidenavPath)) {
      // Return empty sidenav if file doesn't exist
      return [];
    }

    try {
      const content = fs.readFileSync(sidenavPath, 'utf8');
      const parsed = yaml.load(content) as NavigationItem[];
      return parsed || [];
    } catch (error) {
      throw new Error(`Failed to parse ${filename}: ${(error as Error).message}`);
    }
  }

  /**
   * Load top navigation configuration
   */
  private loadTopNav(): TopNavConfig | undefined {
    const topnavPath = path.join(this.configDir, 'topnav.yaml');

    if (!fs.existsSync(topnavPath)) {
      return undefined;
    }

    try {
      const content = fs.readFileSync(topnavPath, 'utf8');
      const parsed = yaml.load(content) as NavigationItem[];
      return parsed || [];
    } catch (error) {
      throw new Error(`Failed to parse topnav.yaml: ${(error as Error).message}`);
    }
  }

  /**
   * Load additional sidenav files (e.g., guides-sidenav.yaml, api-sidenav.yaml)
   */
  private loadAdditionalSidenavs(): Record<string, SideNavConfig> | undefined {
    if (!fs.existsSync(this.configDir)) {
      return undefined;
    }

    const files = fs.readdirSync(this.configDir);
    const sidenavFiles = files.filter(
      (file) =>
        file.endsWith('-sidenav.yaml') ||
        (file.endsWith('-sidenav.yml') && file !== 'sidenav.yaml' && file !== 'sidenav.yml')
    );

    if (sidenavFiles.length === 0) {
      return undefined;
    }

    const additionalSidenavs: Record<string, SideNavConfig> = {};

    for (const file of sidenavFiles) {
      // Extract name: "guides-sidenav.yaml" -> "guides"
      const name = file.replace(/-sidenav\.ya?ml$/, '');
      additionalSidenavs[name] = this.loadSideNav(file);
    }

    return additionalSidenavs;
  }

  /**
   * Load asset configuration
   */
  private loadAssets(): AssetConfig {
    const assets: AssetConfig = {};

    // Check for logo in different formats (SVG preferred, then PNG, then JPG)
    const logoFormats = ['svg', 'png', 'jpg', 'jpeg'];

    for (const format of logoFormats) {
      const logoPath = path.join(this.configDir, `logo.${format}`);
      if (fs.existsSync(logoPath)) {
        assets.logo = `logo.${format}`;
        break;  // Use the first format found
      }
    }

    // Check for favicon
    const faviconPath = path.join(this.configDir, 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
      assets.favicon = 'favicon.ico';
    }

    return assets;
  }

  /**
   * Validate the complete configuration
   */
  private validateConfig(config: SiteConfig): void {
    // Validate required fields
    if (!config.metadata.title) {
      throw new Error('Site title is required in metadata');
    }

    if (config.languages.length === 0) {
      throw new Error('At least one language must be configured');
    }

    const defaultLang = config.languages.find((lang) => lang.default);
    if (!defaultLang) {
      throw new Error('A default language must be specified');
    }

    // Validate navigation structure
    if (config.navigation.sidenav) {
      this.validateNavigationItems(config.navigation.sidenav);
    }

    if (config.navigation.topnav) {
      this.validateNavigationItems(config.navigation.topnav);
    }
  }

  /**
   * Validate navigation items recursively
   */
  private validateNavigationItems(items: NavigationItem[]): void {
    for (const item of items) {
      if (!item.label) {
        throw new Error('Navigation item must have a label');
      }

      if (item.children && item.children.length > 0) {
        this.validateNavigationItems(item.children);
      }
    }
  }
}
