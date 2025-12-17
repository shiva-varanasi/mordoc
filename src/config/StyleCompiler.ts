/**
 * StyleCompiler - Orchestrates style generation
 * Loads user overrides and compiles all component styles into final CSS
 */

import fs from 'fs';
import path from 'path';
import { getGlobalDefaults, mergeGlobalOverrides } from '../styles/variables/main';
import { UserStyleOverrides } from '../styles/types';

// Import all component generators
import { ResetStyleGenerator } from '../styles/components/reset';
import { FontStyleGenerator } from '../styles/components/fonts';
import { LayoutStyleGenerator } from '../styles/components/layout';
import { TypographyStyleGenerator } from '../styles/components/typography';
import { HeaderStyleGenerator } from '../styles/components/header';
import { SideNavStyleGenerator } from '../styles/components/sidenav';
import { ContentStyleGenerator } from '../styles/components/content';
import { HeadingStyleGenerator } from '../styles/components/heading';
import { CodeBlockStyleGenerator } from '../styles/components/codeblock';
import { CardStyleGenerator } from '../styles/components/card';
import { TOCStyleGenerator } from '../styles/components/toc';
import { SearchModalStyleGenerator } from '../styles/components/searchmodal';
import { UtilityStyleGenerator } from '../styles/components/utility';

export class StyleCompiler {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Load user style overrides from config/styles/ directory
   */
  private loadUserOverrides(): UserStyleOverrides {
    const stylesDir = path.join(this.projectRoot, 'config', 'styles');
    
    if (!fs.existsSync(stylesDir)) {
      return { components: {} };
    }

    const result: UserStyleOverrides = { components: {} };

    try {
      // Load main.json (global overrides)
      const mainPath = path.join(stylesDir, 'main.json');
      if (fs.existsSync(mainPath)) {
        const mainContent = fs.readFileSync(mainPath, 'utf8');
        result.global = JSON.parse(mainContent);
      }

      // Load component-specific JSON files
      const files = fs.readdirSync(stylesDir);
      files.forEach(file => {
        if (file.endsWith('.json') && file !== 'main.json') {
          const componentName = file.replace('.json', '');
          const filePath = path.join(stylesDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          result.components[componentName] = JSON.parse(content);
        }
      });
    } catch (error) {
      console.error('Error loading style overrides:', error);
      // Return empty overrides if there's an error
      return { components: {} };
    }

    return result;
  }

  /**
   * Generate complete CSS stylesheet
   */
  generateCSS(): string {
    // Load user overrides
    const userOverrides = this.loadUserOverrides();
    
    // Merge global variables with user overrides
    const globalVars = mergeGlobalOverrides(userOverrides.global);

    // Instantiate all component generators
    const resetGen = new ResetStyleGenerator(globalVars);
    const fontGen = new FontStyleGenerator(globalVars);
    const layoutGen = new LayoutStyleGenerator(globalVars);
    const typographyGen = new TypographyStyleGenerator(globalVars);
    const headerGen = new HeaderStyleGenerator(globalVars);
    const sidenavGen = new SideNavStyleGenerator(globalVars);
    const contentGen = new ContentStyleGenerator(globalVars);
    const headingGen = new HeadingStyleGenerator(globalVars);
    const codeblockGen = new CodeBlockStyleGenerator(globalVars);
    const cardGen = new CardStyleGenerator(globalVars);
    const tocGen = new TOCStyleGenerator(globalVars);
    const searchmodalGen = new SearchModalStyleGenerator(globalVars);
    const utilityGen = new UtilityStyleGenerator(globalVars);

    // Generate CSS for each component in order
    // Order matters: base styles first, then components, utilities last
    const sections: string[] = [
      resetGen.generate(),
      fontGen.generate(),
      layoutGen.generate(),
      typographyGen.generate(userOverrides.components['typography']),
      headerGen.generate(userOverrides.components['header']),
      sidenavGen.generate(userOverrides.components['sidenav']),
      contentGen.generate(userOverrides.components['content']),
      headingGen.generate(userOverrides.components['heading']),
      codeblockGen.generate(userOverrides.components['codeblock']),
      cardGen.generate(userOverrides.components['card']),
      tocGen.generate(userOverrides.components['toc']),
      searchmodalGen.generate(userOverrides.components['searchmodal']),
      utilityGen.generate(),
    ];

    // Join all sections with double newlines
    return sections.join('\n\n');
  }
}

