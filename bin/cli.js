#!/usr/bin/env node

// Entry point for the Mordoc CLI. This file is intentionally plain JS (not TS)
// so it can be executed directly by Node without a build step.
// The actual logic lives in compiled output under dist/.

import { loadSiteConfig } from '../dist/config/site-loader.js';
import { loadLanguageConfig } from '../dist/config/language-loader.js';
import { loadSidenavConfig } from '../dist/config/sidenav-loader.js';
import { loadTopnavConfig } from '../dist/config/topnav-loader.js';
import { loadAssets } from '../dist/config/assets-loader.js';
import { loadContent } from '../dist/content/content-loader.js';
import { parseContent } from '../dist/content/content-parser.js';
import { transformContent } from '../dist/content/content-transformer.js';

const command = process.argv[2];

if (command === 'validate') {
  try {
    const projectRoot = process.cwd();

    // 1. Site config (required)
    const siteConfig = await loadSiteConfig(projectRoot);
    console.log('\n✔ site.json loaded successfully\n');
    console.log(JSON.stringify(siteConfig, null, 2));

    // 2. Language config (optional)
    const languageConfig = await loadLanguageConfig(projectRoot, siteConfig.defaultLanguage);
    if (languageConfig) {
      console.log('\n✔ language.json loaded successfully\n');
      console.log(JSON.stringify(languageConfig, null, 2));
    } else {
      console.log('\n— language.json not found (single-language project)');
    }

    // 3. Navigation
    const topnavConfig = await loadTopnavConfig(projectRoot);
    if (topnavConfig) {
      console.log('\n✔ topnav.yaml loaded successfully (with resolved sidenavs)\n');
      console.log(JSON.stringify(topnavConfig, null, 2));
    } else {
      console.log('\n— topnav.yaml not found (single-sidenav project)');
      const sidenavConfig = await loadSidenavConfig(projectRoot);
      console.log('\n✔ sidenav.yaml loaded successfully\n');
      console.log(JSON.stringify(sidenavConfig, null, 2));
    }

    // 4. Assets
    const assets = await loadAssets(projectRoot);
    console.log('\n✔ assets resolved successfully\n');
    console.log(JSON.stringify(assets, null, 2));

    // 5. Content
    const content = await loadContent(
      projectRoot,
      siteConfig.defaultLanguage,
      languageConfig?.languages ?? null,
    );

    console.log(`\n✔ Content discovery complete — ${content.entries.length} page(s) found`);
    console.log(`  Languages with content: ${content.languages.join(', ')}`);

    // 6. Parse content — frontmatter + Markdoc AST
    const pages = await parseContent(content);

    console.log(`\n✔ Content parsed — ${pages.length} page(s)`);
    for (const page of pages) {
      const flags = page.entry.isIndex ? ' (index)' : '';
      console.log(`  ${page.entry.routePath}${flags} — "${page.frontmatter.title}"`);
    }

    // 7. Transform content — renderable trees + TOCs
    const transformed = transformContent(pages);

    console.log(`\n✔ Content transformed — ${transformed.length} page(s)\n`);
    for (const page of transformed) {
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
  console.log('  validate   Load all config and content, then print the results');
  process.exit(1);
}
