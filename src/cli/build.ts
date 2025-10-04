/**
 * Build command - Generates static site from content
 * Usage: mordoc build [options]
 */

import path from 'path';
import { Builder } from '../build/Builder';

export interface BuildCommandOptions {
  projectRoot?: string;
  outputDir?: string;
  verbose?: boolean;
  drafts?: boolean;
  clean?: boolean;
}

/**
 * Execute the build command
 */
export async function build(options: BuildCommandOptions = {}): Promise<void> {
  const startTime = Date.now();

  try {
    // Get project root (current working directory by default)
    const projectRoot = options.projectRoot || process.cwd();

    // Resolve output directory
    const outputDir = options.outputDir
      ? path.resolve(projectRoot, options.outputDir)
      : path.join(projectRoot, 'dist');

    // Create builder instance
    const builder = new Builder({
      projectRoot,
      outputDir,
      clean: options.clean ?? true,
      includeDrafts: options.drafts ?? false,
      verbose: options.verbose ?? false,
    });

    // Execute build
    await builder.build();

    // Calculate build time
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n⚡ Build completed in ${buildTime}s`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Build failed:');
    console.error((error as Error).message);

    if (options.verbose) {
      console.error('\nStack trace:');
      console.error((error as Error).stack);
    }

    process.exit(1);
  }
}

/**
 * Parse command-line arguments for build command
 */
export function parseBuildArgs(args: string[]): BuildCommandOptions {
  const options: BuildCommandOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;

      case '--verbose':
      case '-v':
        options.verbose = true;
        break;

      case '--drafts':
      case '-d':
        options.drafts = true;
        break;

      case '--no-clean':
        options.clean = false;
        break;

      case '--help':
      case '-h':
        showBuildHelp();
        process.exit(0);
        break;

      default:
        if (arg.startsWith('-')) {
          console.warn(`Warning: Unknown option ${arg}`);
        }
        break;
    }
  }

  return options;
}

/**
 * Show help text for build command
 */
function showBuildHelp(): void {
  console.log(`
mordoc build - Generate static documentation site

Usage:
  mordoc build [options]

Options:
  -o, --output <dir>    Output directory (default: dist)
  -v, --verbose         Enable verbose logging
  -d, --drafts          Include draft content in build
  --no-clean            Don't clean output directory before build
  -h, --help            Show this help message

Examples:
  mordoc build
  mordoc build --output build
  mordoc build --verbose --drafts
  `);
}