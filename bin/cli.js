#!/usr/bin/env node

// Entry point for the Mordoc CLI. This file is intentionally plain JS (not TS)
// so it can be executed directly by Node without a build step.
// The actual logic lives in compiled output under dist/.

import { runPipeline } from '../dist/pipeline.js';

const command = process.argv[2];

if (command === 'validate') {
  try {
    const projectRoot = process.cwd();
    const data = await runPipeline(projectRoot);

    console.log('\n✔ site config\n');
    console.log(JSON.stringify(data.site, null, 2));

    if (data.language) {
      console.log('\n✔ language config\n');
      console.log(JSON.stringify(data.language, null, 2));
    } else {
      console.log('\n— language.json not found (single-language project)');
    }

    if (data.navigation.kind === 'topnav') {
      console.log('\n✔ topnav with resolved sidenavs\n');
      console.log(JSON.stringify(data.navigation.topnav, null, 2));
    } else {
      console.log('\n✔ single sidenav (no topnav.yaml)\n');
      console.log(JSON.stringify(data.navigation.sidenav, null, 2));
    }

    console.log('\n✔ assets\n');
    console.log(JSON.stringify(data.assets, null, 2));

    console.log(`\n✔ ${data.pages.length} page(s) transformed\n`);
    for (const page of data.pages) {
      const flags = page.entry.isIndex ? ' (index)' : '';
      console.log(`  ${page.entry.routePath}${flags} — "${page.frontmatter.title}"`);
      if (page.toc.length > 0) {
        for (const heading of page.toc) {
          const indent = '  '.repeat(heading.level - 2);
          console.log(`    ${indent}└─ #${heading.id} ${heading.title}`);
        }
      }
    }
    console.log();
  } catch (err) {
    console.error('\n✘ Validation failed:\n');
    console.error(err.message);
    process.exit(1);
  }
} else {
  console.log('Usage: mordoc <command>');
  console.log('\nCommands:');
  console.log('  validate   Run the full pipeline and print the resulting data');
  process.exit(1);
}
