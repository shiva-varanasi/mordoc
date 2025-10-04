#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Get the command from arguments
const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1); // Arguments after the command

// Display help text
function showHelp() {
  console.log(`
Mordoc - Static Site Generator for Documentation

Usage:
  mordoc <command> [options]

Commands:
  build      Build the documentation site
  dev        Start the development server
  
Options:
  --help     Show this help message

Examples:
  mordoc build
  mordoc build --verbose --drafts
  mordoc dev
  mordoc dev --port 8080
  `);
}

// Main CLI logic
async function main() {
  // Show help if no command or --help flag
  if (!command || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  // Check if dist folder exists (TypeScript must be compiled first)
  const distPath = path.join(__dirname, '../dist/cli');
  if (!fs.existsSync(distPath)) {
    console.error('Error: Mordoc is not built. Please run "tsc" first to compile TypeScript.');
    process.exit(1);
  }

  // Route to appropriate command handler
  try {
    switch (command) {
      case 'build': {
        const buildHandler = require('../dist/cli/build.js');
        const options = buildHandler.parseBuildArgs(commandArgs);
        await buildHandler.build(options);
        break;
      }
      
      case 'dev': {
        const devHandler = require('../dist/cli/dev.js');
        const options = devHandler.parseDevArgs(commandArgs);
        await devHandler.dev(options);
        break;
      }
      
      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the CLI
main();