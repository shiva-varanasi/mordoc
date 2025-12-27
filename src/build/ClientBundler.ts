/**
 * ClientBundler - Bundles the React client app using esbuild
 */

import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';

export interface ClientBundlerOptions {
  projectRoot: string; // Mordoc package root
  outputDir: string; // User's dist/ directory
  minify?: boolean; // Minify output (default: true)
  sourcemap?: boolean; // Generate sourcemaps (default: false)
}

export class ClientBundler {
  private projectRoot: string;
  private outputDir: string;
  private minify: boolean;
  private sourcemap: boolean;

  constructor(options: ClientBundlerOptions) {
    this.projectRoot = options.projectRoot;
    this.outputDir = options.outputDir;
    this.minify = options.minify ?? true;
    this.sourcemap = options.sourcemap ?? false;
  }

  /**
   * Bundle the client application
   * Uses pre-bundled file if available, otherwise bundles from source
   */
  async bundle(): Promise<void> {
    const assetsDir = path.join(this.outputDir, 'assets');

    // Ensure assets directory exists
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Check for pre-bundled client (created during package build)
    const preBundledClient = path.join(this.projectRoot, 'dist/bundles/client.js');
    
    if (fs.existsSync(preBundledClient)) {
      // Use pre-bundled file (fast path for installed package)
      await this.copyPreBundled(preBundledClient, assetsDir);
    } else {
      // Fallback to bundling from source (for development)
      await this.bundleFromSource(assetsDir);
    }
  }

  /**
   * Copy pre-bundled client file to output directory
   * This is the fast path used when running from an installed package
   */
  private async copyPreBundled(sourcePath: string, assetsDir: string): Promise<void> {
    const outputFile = path.join(assetsDir, 'main.js');
    
    try {
      fs.copyFileSync(sourcePath, outputFile);
      
      // Log bundle size
      const stats = fs.statSync(outputFile);
      const sizeInKB = (stats.size / 1024).toFixed(2);
      console.log(`  Client bundle: ${sizeInKB} KB (pre-bundled)`);
    } catch (error) {
      throw new Error(`Failed to copy pre-bundled client: ${(error as Error).message}`);
    }
  }

  /**
   * Bundle client from source files
   * This is the fallback path used during development
   */
  private async bundleFromSource(assetsDir: string): Promise<void> {
    // Entry point for client app (source files)
    const entryPoint = path.join(this.projectRoot, 'src/client/main.tsx');

    // Check if entry point exists
    if (!fs.existsSync(entryPoint)) {
      throw new Error(
        `Client entry point not found: ${entryPoint}\n` +
        'Hint: Pre-bundled client not found. Run "npm run build" to create it.'
      );
    }

    try {
      const result = await esbuild.build({
        entryPoints: [entryPoint],
        bundle: true,
        outfile: path.join(assetsDir, 'main.js'),
        platform: 'browser',
        target: ['es2020'],
        format: 'iife',
        minify: this.minify,
        sourcemap: this.sourcemap,
        jsx: 'automatic',
        jsxImportSource: 'react',
        define: {
          'process.env.NODE_ENV': this.minify ? '"production"' : '"development"',
        },
        loader: {
          '.tsx': 'tsx',
          '.ts': 'ts',
          '.jsx': 'jsx',
          '.js': 'js',
        },
        external: [], // Bundle everything
        logLevel: 'warning',
        metafile: true,
      });

      // Log bundle size
      if (result.metafile) {
        const outputs = Object.values(result.metafile.outputs);
        if (outputs.length > 0) {
          const totalSize = outputs.reduce((sum, output) => sum + output.bytes, 0);
          const sizeInKB = (totalSize / 1024).toFixed(2);
          console.log(`  Client bundle: ${sizeInKB} KB (bundled from source)`);
        }
      }
    } catch (error) {
      throw new Error(`Failed to bundle client app: ${(error as Error).message}`);
    }
  }

  /**
   * Bundle CSS (placeholder for future CSS bundling)
   */
  async bundleCSS(): Promise<void> {
    // For now, we generate theme.css via ThemeGenerator
    // This method is a placeholder for bundling additional CSS files
    // or processing CSS modules in the future
  }

  /**
   * Watch mode for development (future enhancement)
   * Always bundles from source in watch mode
   */
  async watch(): Promise<void> {
    const assetsDir = path.join(this.outputDir, 'assets');
    
    // Entry point for client app (source files)
    const entryPoint = path.join(this.projectRoot, 'src/client/main.tsx');

    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const context = await esbuild.context({
      entryPoints: [entryPoint],
      bundle: true,
      outfile: path.join(assetsDir, 'main.js'),
      platform: 'browser',
      target: ['es2020'],
      format: 'iife',
      minify: false,
      sourcemap: true,
      jsx: 'automatic',
      jsxImportSource: 'react',
      define: {
        'process.env.NODE_ENV': '"development"',
      },
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js',
      },
      logLevel: 'info',
    });

    await context.watch();
    console.log('Watching for client changes...');
  }

  /**
   * Get bundle statistics
   */
  async getStats(): Promise<{
    size: number;
    files: string[];
  }> {
    const mainJsPath = path.join(this.outputDir, 'assets/main.js');

    if (!fs.existsSync(mainJsPath)) {
      return { size: 0, files: [] };
    }

    const stats = fs.statSync(mainJsPath);

    return {
      size: stats.size,
      files: ['main.js'],
    };
  }
}