/**
 * ConfigLoader - Loads and validates user configuration files
 * Merges user config with sensible defaults
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  SiteConfig,
  ProcessedStyleConfig,
  UserStyleConfig,
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
    const style = this.loadStyleConfig();
    const navigation = this.loadNavigationConfig();
    const assets = this.loadAssets();

    const config: SiteConfig = {
      metadata,
      languages,
      defaultLanguage: languages.find((lang) => lang.default)?.code || 'en',
      style,
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
   * Load and transform user style configuration
   */
  private loadStyleConfig(): ProcessedStyleConfig {
    const defaultStyle = this.getDefaultProcessedConfig();

    const styleJsonPath = path.join(this.configDir, 'style.json');
    if (!fs.existsSync(styleJsonPath)) {
      return defaultStyle;
    }

    try {
      const userStyleJson = fs.readFileSync(styleJsonPath, 'utf8');
      const userStyle: UserStyleConfig = JSON.parse(userStyleJson);
      const transformedStyle = this.transformUserStyleToProcessed(userStyle);
      return this.deepMerge(defaultStyle, transformedStyle) as ProcessedStyleConfig;
    } catch (error) {
      throw new Error(`Failed to parse style.json: ${(error as Error).message}`);
    }
  }

  /**
   * Get default processed style configuration
   */
  private getDefaultProcessedConfig(): ProcessedStyleConfig {
    return {
      colors: {
        primary: {
          light: '#000000',
          dark: '#ffffff',
        },
        secondary: {
          light: '#404040',
          dark: '#b0b0b0',
        },
        background: {
          light: '#ffffff',
          dark: '#0a0a0a',
        },
        surface: {
          light: '#f8f8f8',
          dark: '#1a1a1a',
        },
        text: {
          primary: {
            light: '#000000',
            dark: '#ffffff',
          },
          secondary: {
            light: '#666666',
            dark: '#999999',
          },
          disabled: {
            light: '#cccccc',
            dark: '#404040',
          },
        },
        border: {
          light: '#e0e0e0',
          dark: '#333333',
        },
        link: {
          light: '#000000',
          dark: '#ffffff',
        },
        success: {
          light: '#2d3436',
          dark: '#dfe6e9',
        },
        warning: {
          light: '#636e72',
          dark: '#b2bec3',
        },
        error: {
          light: '#000000',
          dark: '#ffffff',
        },
        info: {
          light: '#2d3436',
          dark: '#dfe6e9',
        },
        navigation: {
          text: {
            light: '#666666',
            dark: '#999999',
          },
          hover: {
            light: '#000000',
            dark: '#ffffff',
          },
          active: {
            light: '#000000',
            dark: '#ffffff',
          },
        },
        header: {
          background: {
            light: '#ffffff',
            dark: '#0a0a0a',
          },
        },
      },
      typography: {
        fontFamily: {
          base: {
            family: '-apple-system',
            fallbacks: [
              'BlinkMacSystemFont',
              '"Segoe UI"',
              'Roboto',
              '"Helvetica Neue"',
              'Arial',
              'sans-serif',
            ],
          },
          heading: {
            family: '-apple-system',
            fallbacks: [
              'BlinkMacSystemFont',
              '"Segoe UI"',
              'Roboto',
              '"Helvetica Neue"',
              'Arial',
              'sans-serif',
            ],
            weight: 600,
          },
          mono: {
            family: '"SF Mono"',
            fallbacks: [
              'Monaco',
              '"Cascadia Code"',
              '"Roboto Mono"',
              'Consolas',
              '"Courier New"',
              'monospace',
            ],
          },
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2rem',
          '5xl': '2.5rem',
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      layout: {
        containerWidth: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem',
          '3xl': '4rem',
        },
        borderRadius: {
          sm: '0.125rem',
          md: '0.25rem',
          lg: '0.5rem',
          full: '9999px',
        },
        header: {
          height: '4rem',
        },
        sidebar: {
          width: '16rem',
          collapsedWidth: '4rem',
        },
      },
    };
  }

  /**
   * Transform user-facing config to internal processed config
   */
  private transformUserStyleToProcessed(
    userStyle: UserStyleConfig
  ): Partial<ProcessedStyleConfig> {
    const processed: Partial<ProcessedStyleConfig> = {
      colors: {} as any,
      typography: {} as any,
      layout: {} as any,
    };

    // Type assertion helper - we know colors is initialized
    const colors = processed.colors!;

    // Handle font family (applies to both base and heading)
    if (userStyle.fontFamily) {
      const fontParts = userStyle.fontFamily.split(',').map((f) => f.trim());
      const primaryFont = fontParts[0];
      const fallbacks = fontParts.slice(1);

      processed.typography = {
        fontFamily: {
          base: {
            family: primaryFont,
            fallbacks: fallbacks.length > 0 ? fallbacks : undefined,
          },
          heading: {
            family: primaryFont,
            fallbacks: fallbacks.length > 0 ? fallbacks : undefined,
            weight: 600,
          },
        },
      } as any;
    }

    // Handle light theme colors
    if (userStyle.light) {
      const light = userStyle.light;

      if (light.brandColor) {
        colors.primary = { light: light.brandColor } as any;
        colors.navigation = {
          active: { light: light.brandColor },
        } as any;
      }

      if (light.navigation) {
        if (!colors.navigation) colors.navigation = {} as any;

        if (light.navigation.textColor) {
          colors.navigation.text = {
            light: light.navigation.textColor,
          } as any;
        }

        if (light.navigation.hoverColor) {
          colors.navigation.hover = {
            light: light.navigation.hoverColor,
          } as any;
        }
      }

      if (light.header?.background) {
        colors.header = {
          background: { light: light.header.background },
        } as any;
      }
    }

    // Handle dark theme colors
    if (userStyle.dark) {
      const dark = userStyle.dark;

      if (dark.brandColor) {
        if (!colors.primary) colors.primary = {} as any;
        (colors.primary as any).dark = dark.brandColor;

        if (!colors.navigation) colors.navigation = {} as any;
        if (!colors.navigation.active) {
          colors.navigation.active = {} as any;
        }
        (colors.navigation.active as any).dark = dark.brandColor;
      }

      if (dark.navigation) {
        if (!colors.navigation) colors.navigation = {} as any;

        if (dark.navigation.textColor) {
          if (!colors.navigation.text) {
            colors.navigation.text = {} as any;
          }
          (colors.navigation.text as any).dark = dark.navigation.textColor;
        }

        if (dark.navigation.hoverColor) {
          if (!colors.navigation.hover) {
            colors.navigation.hover = {} as any;
          }
          (colors.navigation.hover as any).dark = dark.navigation.hoverColor;
        }
      }

      if (dark.header?.background) {
        if (!colors.header) colors.header = {} as any;
        if (!colors.header.background) {
          colors.header.background = {} as any;
        }
        (colors.header.background as any).dark = dark.header.background;
      }
    }

    return processed;
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
    let logoFound = false;

    for (const format of logoFormats) {
      const logoPath = path.join(this.configDir, `logo.${format}`);
      if (fs.existsSync(logoPath)) {
        assets.logo = `logo.${format}`;
        logoFound = true;
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

  /**
   * Deep merge two objects (user config overrides defaults)
   */
  private deepMerge(target: any, source: any): any {
    const output = { ...target };

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }

    return output;
  }

  /**
   * Check if value is a plain object
   */
  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}