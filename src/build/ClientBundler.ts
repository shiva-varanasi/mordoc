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
   */
  async bundle(): Promise<void> {
    const assetsDir = path.join(this.outputDir, 'assets');

    // Ensure assets directory exists
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Entry point for client app
    const entryPoint = path.join(this.projectRoot, 'src/client/main.tsx');

    // Check if entry point exists
    if (!fs.existsSync(entryPoint)) {
      throw new Error(`Client entry point not found: ${entryPoint}`);
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
          console.log(`  Client bundle: ${sizeInKB} KB`);
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
   */
  async watch(): Promise<void> {
    const assetsDir = path.join(this.outputDir, 'assets');
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