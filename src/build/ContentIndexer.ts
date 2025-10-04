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
  private options: Required<ContentIndexerOptions>;

  constructor(options: ContentIndexerOptions = {}) {
    this.options = {
      includeDrafts: options.includeDrafts ?? false,
      defaultLanguage: options.defaultLanguage ?? 'en',
    };
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
      if (!this.options.includeDrafts && content.metadata.frontmatter.draft) {
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
    const { slug, language, frontmatter } = metadata;

    // Build full URL path
    const path = buildPathWithLanguage(slug, language, this.options.defaultLanguage);

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
   * Priority: order (ascending) > title (alphabetical)
   */
  private sortEntries(entries: ContentIndexEntry[]): ContentIndex {
    return entries.sort((a, b) => {
      // First, sort by order if both have it
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }

      // If only one has order, it comes first
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;

      // Otherwise, sort alphabetically by title
      return a.title.localeCompare(b.title);
    });
  }

  /**
   * Filter index entries by language
   * @param index - Content index
   * @param language - Language code
   * @returns Filtered index
   */
  filterByLanguage(index: ContentIndex, language: string): ContentIndex {
    return index.filter((entry) => entry.language === language);
  }

  /**
   * Filter index entries by tag
   * @param index - Content index
   * @param tag - Tag to filter by
   * @returns Filtered index
   */
  filterByTag(index: ContentIndex, tag: string): ContentIndex {
    return index.filter((entry) => entry.tags?.includes(tag));
  }

  /**
   * Group index entries by language
   * @param index - Content index
   * @returns Map of language to entries
   */
  groupByLanguage(index: ContentIndex): Map<string, ContentIndex> {
    const grouped = new Map<string, ContentIndex>();

    for (const entry of index) {
      const existing = grouped.get(entry.language) || [];
      existing.push(entry);
      grouped.set(entry.language, existing);
    }

    return grouped;
  }

  /**
   * Get all unique tags from index
   * @param index - Content index
   * @returns Array of unique tags
   */
  getAllTags(index: ContentIndex): string[] {
    const tagsSet = new Set<string>();

    for (const entry of index) {
      if (entry.tags) {
        for (const tag of entry.tags) {
          tagsSet.add(tag);
        }
      }
    }

    return Array.from(tagsSet).sort();
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

  /**
   * Get statistics about the index
   * @param index - Content index
   * @returns Statistics object
   */
  getStats(index: ContentIndex): {
    total: number;
    byLanguage: Record<string, number>;
    byTag: Record<string, number>;
    drafts: number;
  } {
    const stats = {
      total: index.length,
      byLanguage: {} as Record<string, number>,
      byTag: {} as Record<string, number>,
      drafts: 0,
    };

    for (const entry of index) {
      // Count by language
      stats.byLanguage[entry.language] = (stats.byLanguage[entry.language] || 0) + 1;

      // Count by tag
      if (entry.tags) {
        for (const tag of entry.tags) {
          stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
        }
      }

      // Count drafts
      if (entry.draft) {
        stats.drafts++;
      }
    }

    return stats;
  }
}