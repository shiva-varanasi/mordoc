/**
 * Content type definitions for Mordoc
 * These interfaces define the structure of processed markdown content
 */

import type { RenderableTreeNode } from '@markdoc/markdoc';

// Frontmatter structure (metadata at the top of markdown files)
export interface Frontmatter {
  title: string;
  description?: string;
  order?: number;
  draft?: boolean;
  tags?: string[];
  date?: string;
  author?: string;
  sidenavRef?: string; // Override which sidenav to display for this page
  [key: string]: unknown; // Allow custom frontmatter fields
}

// Table of contents entry
export interface TocEntry {
  id: string;
  text: string;
  level: number;
  children?: TocEntry[];
}

// Table of contents (extracted headings)
export type TableOfContents = TocEntry[];

// Content metadata (information about a content file)
export interface ContentMetadata {
  slug: string; // URL-friendly identifier (e.g., "getting-started")
  filePath: string; // Relative path from content/ (e.g., "en/getting-started.md")
  language: string; // Language code (e.g., "en", "es")
  path: string; // Full URL path (e.g., "/getting-started" or "/es/comenzar")
  dirPath: string; // Directory path (e.g., "guides" for "guides/first-steps")
  frontmatter: Frontmatter;
  toc: TableOfContents;
  wordCount: number;
  readingTime: number; // Estimated reading time in minutes
}

// Markdoc renderable node (output from Markdoc processing)
export type MarkdocRenderableNode = RenderableTreeNode;

// Processed content (full content with metadata and renderable)
export interface ProcessedContent {
  metadata: ContentMetadata;
  renderable: MarkdocRenderableNode;
  rawContent?: string; // Original markdown (optional, useful for search)
}

// Content data file (JSON file for SPA navigation)
export interface ContentDataFile {
  metadata: ContentMetadata;
  renderable: MarkdocRenderableNode;
}

// Content map (in-memory map of all processed content, keyed by slug)
export type ContentMap = Map<string, ProcessedContent>;