/**
 * ContentIndexer - Creates content-index.json for navigation and search
 * Generates a lightweight index of all content metadata
 */

import { ProcessedContent } from '../types/content';
import { ContentIndex, ContentIndexEntry } from '../types/content';
import { buildPathWithLanguage } from '../utils/language-utils';

export interface ContentIndexerOptions {
  includeDrafts?: boolean; // Include draft content in index (default: false)
  defaultLanguage?: string; // Default language for path building (default: 'en')
}

export class ContentIndexer {
  private includeDrafts: boolean;
  private defaultLanguage: string;

  constructor(options: ContentIndexerOptions = {}) {
    this.includeDrafts = options.includeDrafts ?? false;
    this.defaultLanguage = options.defaultLanguage ?? 'en';
  }

  /**
   * Create content index from processed content
   * @param processedContent - Array of processed content
   * @returns Content index array
   */
  createIndex(processedContent: ProcessedContent[]): ContentIndex {
    const entries: ContentIndexEntry[] = [];

    for (const content of processedContent) {
      // Skip drafts if not including them
      if (!this.includeDrafts && content.metadata.frontmatter.draft) {
        continue;
      }

      const entry = this.createIndexEntry(content);
      entries.push(entry);
    }

    // Sort entries by order (if specified), then by title
    return this.sortEntries(entries);
  }

  /**
   * Create a single index entry from processed content
   */
  private createIndexEntry(content: ProcessedContent): ContentIndexEntry {
    const { metadata } = content;
    const { slug, language, frontmatter, path } = metadata;

    return {
      slug,
      language,
      title: frontmatter.title,
      description: frontmatter.description,
      path,
      order: frontmatter.order,
      tags: frontmatter.tags,
      draft: frontmatter.draft,
    };
  }

  /**
   * Sort index entries
   * based on title alphabetically
   */
  private sortEntries(entries: ContentIndexEntry[]): ContentIndex {
    return entries.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });
  }

  /**
   * Convert index to JSON string
   * @param index - Content index
   * @param pretty - Pretty print JSON (default: false)
   * @returns JSON string
   */
  toJSON(index: ContentIndex, pretty: boolean = false): string {
    if (pretty) {
      return JSON.stringify(index, null, 2);
    }
    return JSON.stringify(index);
  }
}