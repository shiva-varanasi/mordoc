#!/usr/bin/env node

// Entry point for the Mordoc CLI. This file is intentionally plain JS (not TS)
// so it can be executed directly by Node without a build step.
// The actual logic lives in compiled output under dist/.

import { runPipeline } from '../dist/pipeline.js';
import {
  EAGER_VIRTUAL_IDS,
  PAGE_MODULE_PREFIX,
  generatePageModule,
  generateVirtualModule,
} from '../dist/vite/plugin.js';
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
} else if (command === 'validate') {
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

    // Vite plugin preview — show what each eager virtual module would emit,
    // plus a sample lazy per-route module. This is verification before the
    // React client consumes the modules; once the client exists we can
    // drop this section.
    console.log('\n✔ vite plugin — eager virtual modules\n');
    for (const id of EAGER_VIRTUAL_IDS) {
      const source = generateVirtualModule(id, data);
      const bytes = Buffer.byteLength(source, 'utf8');
      const preview = source.length > 140 ? source.slice(0, 137) + '...' : source;
      console.log(`  ${id} (${bytes} bytes)`);
      console.log(`    ${preview}`);
    }

    if (data.pages.length > 0) {
      const sample = data.pages[0];
      const sampleId = `${PAGE_MODULE_PREFIX}${sample.entry.routePath}`;
      const source = generatePageModule(sample.entry.routePath, data);
      const bytes = Buffer.byteLength(source, 'utf8');
      const preview = source.length > 200 ? source.slice(0, 197) + '...' : source;
      console.log(`\n✔ vite plugin — sample lazy page module\n`);
      console.log(`  ${sampleId} (${bytes} bytes)`);
      console.log(`    ${preview}`);
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
  console.log('  dev        Start the Mordoc dev server');
  console.log('  build      Render the project to static HTML in dist/');
  console.log('  validate   Run the full pipeline and print the resulting data');
  process.exit(1);
}
