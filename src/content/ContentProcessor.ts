/**
 * ContentProcessor - Processes raw markdown content with Markdoc
 * Extracts frontmatter, generates TOC, calculates reading time
 */

import Markdoc from '@markdoc/markdoc';
import util from "node:util"; // for console.log temporary

import {
  ProcessedContent,
  ContentMetadata,
  Frontmatter,
  TableOfContents,
  TocEntry,
  MarkdocRenderableNode,
} from '../types/content';
import { RawContentFile } from './ContentLoader';

export class ContentProcessor {
  private averageReadingSpeed: number; // Words per minute

  constructor(averageReadingSpeed: number = 200) {
    this.averageReadingSpeed = averageReadingSpeed;
  }

  /**
   * Process a raw content file into structured content
   * @param rawFile - Raw content file from ContentLoader
   * @returns Processed content with metadata and renderable
   */
  process(rawFile: RawContentFile): ProcessedContent {
    // Parse markdown with Markdoc
    console.log('rawFile.content', rawFile.content);
    const ast = Markdoc.parse(rawFile.content);

    console.log("=== AST ===");

    console.log(
      util.inspect(ast, { depth: null, colors: false })
    );

    // Extract frontmatter from AST
    const frontmatter = this.extractFrontmatter(ast);

    console.log("=== FRONTMATTER ===");
    console.log(
      util.inspect(frontmatter, { depth: null, colors: false })
    );

    // If title is missing, try to extract from first H1 or filename
    if (!frontmatter.title || frontmatter.title.trim() === '') {
      frontmatter.title = this.extractTitleFromContent(ast, rawFile.filePath);
    }

    // Generate table of contents from headings
    const toc = this.generateTableOfContents(ast);

    console.log("=== TOC ===");
    console.log(
      util.inspect(toc, { depth: null, colors: false })
    );

    // Calculate word count and reading time
    const wordCount = this.calculateWordCount(ast);
    const readingTime = this.calculateReadingTime(wordCount);

    // Transform AST to renderable tree
    const renderable = Markdoc.transform(ast);

    console.log("=== RENDERABLE ===");
    console.log(
      util.inspect(renderable, { depth: null, colors: false })
    );

    // Build metadata
    const metadata: ContentMetadata = {
      slug: rawFile.route.slug,
      filePath: rawFile.filePath,
      language: rawFile.route.language,
      path: rawFile.route.path,
      frontmatter,
      toc,
      wordCount,
      readingTime,
    };

    return {
      metadata,
      renderable: renderable as MarkdocRenderableNode,
      rawContent: rawFile.content,
    };
  }

  /**
   * Process multiple raw files
   * @param rawFiles - Array of raw content files
   * @returns Array of processed content
   */
  processAll(rawFiles: RawContentFile[]): ProcessedContent[] {
    return rawFiles.map((file) => {
      try {
        return this.process(file);
      } catch (error) {
        throw new Error(
          `Failed to process ${file.filePath}: ${(error as Error).message}`
        );
      }
    });
  }

  /**
   * Extract frontmatter from Markdoc AST
   */
  private extractFrontmatter(ast: any): Frontmatter {
    // Markdoc stores frontmatter in ast.attributes
    const attributes = ast.attributes || {};

    // Build frontmatter object with required title field
    const frontmatter: Frontmatter = {
      title: attributes.title || '',
      description: attributes.description,
      order: attributes.order !== undefined ? Number(attributes.order) : undefined,
      draft: attributes.draft === true || attributes.draft === 'true',
      tags: Array.isArray(attributes.tags) ? attributes.tags : undefined,
      date: attributes.date,
      author: attributes.author,
      sidenavRef: attributes.sidenavRef,
    };

    // Add any custom frontmatter fields
    for (const [key, value] of Object.entries(attributes)) {
      if (!(key in frontmatter)) {
        frontmatter[key] = value;
      }
    }

    return frontmatter;
  }

  /**
   * Extract title from content (first H1) or filename as fallback
   * @param ast - Markdoc AST
   * @param filePath - File path for fallback title generation
   * @returns Extracted or generated title
   */
  private extractTitleFromContent(ast: any, filePath: string): string {
    // Try to find the first H1 heading in the content
    let firstH1: string | null = null;

    this.walkAST(ast, (node: any) => {
      if (!firstH1 && node.type === 'heading' && node.attributes?.level === 1) {
        firstH1 = this.extractTextFromNode(node);
      }
    });

    if (firstH1) {
      return firstH1;
    }

    // Fallback: generate title from filename
    return this.generateTitleFromFilename(filePath);
  }

  /**
   * Generate a readable title from filename
   * @param filePath - File path (e.g., "en/getting-started.md")
   * @returns Human-readable title
   */
  private generateTitleFromFilename(filePath: string): string {
    // Extract filename without extension
    const parts = filePath.split('/');
    const filename = parts[parts.length - 1].replace(/\.(md|mdx)$/, '');

    // Handle index files
    if (filename === 'index') {
      // Use parent directory name if available
      if (parts.length > 2) {
        return this.humanizeSlug(parts[parts.length - 2]);
      }
      return 'Home';
    }

    // Convert filename to title (e.g., "getting-started" -> "Getting Started")
    return this.humanizeSlug(filename);
  }

  /**
   * Convert a slug to human-readable title
   * @param slug - Slugified string
   * @returns Human-readable string
   */
  private humanizeSlug(slug: string): string {
    return slug
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Validate frontmatter has required fields
   */
  private validateFrontmatter(frontmatter: Frontmatter, filePath: string): void {
    // Currently no required fields - title is handled by extractTitleFromContent fallback
    // Add validation for other required fields here if needed in the future
  }

  /**
   * Generate table of contents from headings in the AST
   */
  private generateTableOfContents(ast: any): TableOfContents {
    const headings: TocEntry[] = [];
    let foundFirstH1 = false;
  
    // Walk the AST to find all heading nodes
    this.walkAST(ast, (node: any) => {
      if (node.type === 'heading') {
        const level = node.attributes?.level || 1;
        const text = this.extractTextFromNode(node);
        const id = this.generateHeadingId(text);
  
        // Skip the first H1 heading (page title)
        if (level === 1 && !foundFirstH1) {
          foundFirstH1 = true;
          return;
        }
  
        headings.push({
          id,
          text,
          level,
        });
      }
    });
  
    // Build hierarchical structure
    return this.buildTocHierarchy(headings);
  }

  /**
   * Build hierarchical TOC structure from flat list of headings
   */
  private buildTocHierarchy(headings: TocEntry[]): TableOfContents {
    const toc: TableOfContents = [];
    const stack: TocEntry[] = [];

    for (const heading of headings) {
      // Remove entries from stack that are same level or deeper
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        // Top-level heading
        toc.push(heading);
      } else {
        // Nested heading
        const parent = stack[stack.length - 1];
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(heading);
      }

      stack.push(heading);
    }

    return toc;
  }

  /**
   * Walk the AST and call visitor function for each node
   */
  private walkAST(node: any, visitor: (node: any) => void): void {
    visitor(node);

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.walkAST(child, visitor);
      }
    }
  }

  /**
   * Extract text content from a node
   */
  private extractTextFromNode(node: any): string {
    if (typeof node === 'string') {
      return node;
    }

    if (node.type === 'text') {
      return node.attributes?.content || '';
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.map((child: any) => this.extractTextFromNode(child)).join('');
    }

    return '';
  }

  /**
   * Generate a URL-friendly ID from heading text
   */
  private generateHeadingId(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Calculate word count from AST
   */
  private calculateWordCount(ast: any): number {
    let wordCount = 0;

    this.walkAST(ast, (node: any) => {
      if (node.type === 'text') {
        const content = node.attributes?.content;
        
        // Only count if content is actually a string
        // Markdoc variables and other objects should be skipped
        if (typeof content === 'string') {
          const words = content.split(/\s+/).filter((word: string) => word.length > 0);
          wordCount += words.length;
        }
      }
    });

    return wordCount;
  }

  /**
   * Calculate estimated reading time in minutes
   */
  private calculateReadingTime(wordCount: number): number {
    return Math.ceil(wordCount / this.averageReadingSpeed);
  }

  /**
   * Get content metadata without processing full content (lightweight)
   * Useful for generating content index
   */
  getMetadataOnly(rawFile: RawContentFile): ContentMetadata {
    const ast = Markdoc.parse(rawFile.content);
    const frontmatter = this.extractFrontmatter(ast);
    
    // Apply title fallback if missing
    if (!frontmatter.title || frontmatter.title.trim() === '') {
      frontmatter.title = this.extractTitleFromContent(ast, rawFile.filePath);
    }

    const toc = this.generateTableOfContents(ast);
    const wordCount = this.calculateWordCount(ast);
    const readingTime = this.calculateReadingTime(wordCount);

    return {
      slug: rawFile.route.slug,
      filePath: rawFile.filePath,
      language: rawFile.route.language,
      path: rawFile.route.path,
      frontmatter,
      toc,
      wordCount,
      readingTime,
    };
  }
}