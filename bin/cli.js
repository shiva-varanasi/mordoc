#!/usr/bin/env node

// Entry point for the Mordoc CLI. This file is intentionally plain JS (not TS)
// so it can be executed directly by Node without a build step.
// The actual logic lives in compiled output under dist/.

import { runDevCommand } from '../dist/cli/dev.js';
import { runBuildCommand } from '../dist/cli/build.js';

const command = process.argv[2];

if (command === 'dev') {
  try {
    await runDevCommand({ projectRoot: process.cwd() });
  } catch (err) {
    console.error('\n✘ Dev server failed to start:\n');
    console.error(err.message);
    process.exit(1);
  }
} else if (command === 'build') {
  try {
    await runBuildCommand({ projectRoot: process.cwd() });
  } catch (err) {
    console.error('\n✘ Build failed:\n');
    console.error(err.stack ?? err.message);
    process.exit(1);
  }
} else {
  console.log('Usage: mordoc <command>');
  console.log('\nCommands:');
  console.log('  dev      Start the Mordoc dev server');
  console.log('  build    Render the project to static HTML in dist/');
  process.exit(1);
}
