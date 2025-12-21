/**
 * Table of Contents styles
 * Right sidebar navigation for page headings
 */

import { GlobalVariables } from '../types';
import { mergeOverrides, darkMode } from '../utils';

interface TOCVariables {
  tocForeground: string;
  tocForegroundDark: string;
  tocMutedForeground: string;
  tocMutedForegroundDark: string;
}

export class TOCStyleGenerator {
  constructor(private globalVars: GlobalVariables) {}
  
  generate(userOverrides?: Record<string, string>): string {
    const defaults: TOCVariables = {
      tocForeground: '#171717',
      tocForegroundDark: '#fafafa',
      tocMutedForeground: '#737373',
      tocMutedForegroundDark: '#a3a3a3',
    };
    
    const vars = mergeOverrides(
      defaults,
      userOverrides,
      ['tocForeground', 'tocForegroundDark', 'tocMutedForeground', 'tocMutedForegroundDark']
    );
    
    return `/* Table of Contents */
.toc {
  position: sticky;
  top: 5rem;
  width: 14rem;
  display: none;
}

@media (min-width: 1280px) {
  .toc {
    display: block;
  }
}

.toc-title {
  font-size: 0.875rem;
  font-weight: ${this.globalVars.fontWeightSemibold};
  color: ${vars.tocForeground};
  margin: 0 0 1rem 0;
}

${darkMode(`  .toc-title {
    color: ${vars.tocForegroundDark};
  }`)}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li + li {
  margin-top: 0.5rem;
}

.toc-link {
  display: block;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding: 0;
  padding-left: 0.75rem;
  border: none;
  border-left: 2px solid transparent;
  background: transparent;
  color: ${vars.tocMutedForeground};
  font-weight: ${this.globalVars.fontWeightNormal};
  cursor: pointer;
  transition: color 200ms ease;
}

${darkMode(`  .toc-link {
    color: ${vars.tocMutedForegroundDark};
  }`)}

.toc-link:hover {
  color: ${vars.tocForeground};
}

${darkMode(`  .toc-link:hover {
    color: ${vars.tocForegroundDark};
  }`)}

.toc-link.active {
  color: ${vars.tocForeground};
  font-weight: ${this.globalVars.fontWeightMedium};
  border-left-color: ${vars.tocForeground};
}

${darkMode(`  .toc-link.active {
    color: ${vars.tocForegroundDark};
    border-left-color: ${vars.tocForegroundDark};
  }`)}

.toc-link[data-level="3"] {
  padding-left: 1rem;
}

.toc-link[data-level="4"] {
  padding-left: 1.5rem;
}

.toc-link[data-level="5"] {
  padding-left: 2rem;
}

.toc-link[data-level="6"] {
  padding-left: 2.5rem;
}`;
  }
}

