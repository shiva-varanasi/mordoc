/**
 * SearchIndexer - Generates Pagefind search index
 * Executes Pagefind CLI binary directly
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface SearchIndexerOptions {
  outputDir: string;
  verbose?: boolean;
}

export class SearchIndexer {
  private outputDir: string;
  private verbose: boolean;

  constructor(options: SearchIndexerOptions) {
    this.outputDir = options.outputDir;
    this.verbose = options.verbose ?? false;
  }

  /**
   * Generate search index using Pagefind CLI binary
   */
  async generateIndex(): Promise<void> {
    try {
      this.log('Running Pagefind indexer...');

      // Check if output directory exists
      if (!fs.existsSync(this.outputDir)) {
        throw new Error(`Output directory not found: ${this.outputDir}`);
      }

      // Get the path to the Pagefind binary using the same method as Pagefind's CLI wrapper
      const binaryPath = this.resolveBinaryPath(['pagefind_extended', 'pagefind']);

      // Run Pagefind indexer
      const command = `"${binaryPath}" --source "${this.outputDir}" --bundle-dir pagefind`;
      
      this.log(`Executing: ${command}`);

      execSync(command, {
        stdio: this.verbose ? 'inherit' : 'pipe',
        encoding: 'utf-8',
      });

      // Verify that pagefind directory was created
      const pagefindDir = path.join(this.outputDir, 'pagefind');
      if (!fs.existsSync(pagefindDir)) {
        throw new Error('Pagefind indexing completed but pagefind directory was not created');
      }

      this.log('✓ Search index generated successfully');
      
      // Log index stats if verbose
      if (this.verbose) {
        this.logIndexStats(pagefindDir);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to generate search index: ${errorMessage}`);
    }
  }

  /**
   * Resolve the path to Pagefind binary
   * Replicates the logic from pagefind's resolveBinary.js
   */
  private resolveBinaryPath(execnames: string[]): string {
    // Check environment variables first
    for (const execname of execnames) {
      const envVar = process.env[`${execname.toUpperCase()}_BINARY_PATH`];
      if (envVar) return envVar;
    }

    const cpu = process.env.npm_config_arch || require('os').arch();
    const platform = process.platform === 'win32' ? 'windows' : process.platform;

    for (const execname of execnames) {
      const executable = platform === 'windows' ? `${execname}.exe` : execname;

      try {
        // Try to resolve the platform-specific package
        const binaryPath = require.resolve(
          `@pagefind/${platform}-${cpu}/bin/${executable}`
        );
        return binaryPath;
      } catch (e) {
        // Continue to next execname
      }
    }

    throw new Error(
      `Failed to find Pagefind binary for platform ${platform}-${cpu}. ` +
      `Please ensure @pagefind/${platform}-${cpu} is installed.`
    );
  }

  /**
   * Log index statistics
   */
  private logIndexStats(pagefindDir: string): void {
    try {
      const files = fs.readdirSync(pagefindDir);
      const indexFiles = files.filter(f => f.endsWith('.pf_index'));
      const fragmentFiles = files.filter(f => f.endsWith('.pf_fragment'));
      
      this.log(`  - Index files: ${indexFiles.length}`);
      this.log(`  - Fragment files: ${fragmentFiles.length}`);
      
      // Calculate total size
      let totalSize = 0;
      files.forEach(file => {
        const filePath = path.join(pagefindDir, file);
        if (fs.statSync(filePath).isFile()) {
          totalSize += fs.statSync(filePath).size;
        }
      });
      
      const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
      this.log(`  - Total index size: ${sizeMB} MB`);
    } catch (error) {
      // Ignore errors in stats logging
    }
  }

  /**
   * Log message if verbose
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(message);
    }
  }
}