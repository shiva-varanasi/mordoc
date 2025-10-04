/**
 * MarkdocRenderer - Renders Markdoc content as React components
 */

import React from 'react';
import Markdoc from '@markdoc/markdoc';
import { MarkdocRenderableNode } from '../types/content';

interface MarkdocRendererProps {
  content: MarkdocRenderableNode;
  components?: Record<string, React.ComponentType<any>>;
}

/**
 * Renders Markdoc renderable tree as React components
 */
export function MarkdocRenderer({ content, components = {} }: MarkdocRendererProps) {
  // Markdoc's React renderer
  const rendered = Markdoc.renderers.react(content, React, {
    components: {
      // Default HTML tag mappings
      ...getDefaultComponents(),
      // Custom component overrides
      ...components,
    },
  });

  return <>{rendered}</>;
}

/**
 * Default component mappings for HTML elements
 */
function getDefaultComponents(): Record<string, React.ComponentType<any>> {
  return {
    // Headings with anchor links
    h1: (props: any) => <h1 id={generateId(props.children)} {...props} />,
    h2: (props: any) => <h2 id={generateId(props.children)} {...props} />,
    h3: (props: any) => <h3 id={generateId(props.children)} {...props} />,
    h4: (props: any) => <h4 id={generateId(props.children)} {...props} />,
    h5: (props: any) => <h5 id={generateId(props.children)} {...props} />,
    h6: (props: any) => <h6 id={generateId(props.children)} {...props} />,

    // Links with proper handling
    a: (props: any) => {
      const { href, children, ...rest } = props;
      const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
      
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          {...rest}
        >
          {children}
        </a>
      );
    },

    // Code blocks
    pre: (props: any) => (
      <pre className="code-block" {...props} />
    ),

    code: (props: any) => (
      <code className="inline-code" {...props} />
    ),

    // Tables
    table: (props: any) => (
      <div className="table-wrapper">
        <table {...props} />
      </div>
    ),

    // Blockquotes
    blockquote: (props: any) => (
      <blockquote className="callout" {...props} />
    ),

    // Images
    img: (props: any) => {
      const { src, alt, ...rest } = props;
      return (
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          {...rest}
        />
      );
    },
  };
}

/**
 * Generate ID from heading text for anchor links
 */
function generateId(children: any): string {
  if (!children) return '';
  
  const text = extractText(children);
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extract plain text from React children
 */
function extractText(children: any): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (Array.isArray(children)) {
    return children.map(extractText).join('');
  }
  
  if (children?.props?.children) {
    return extractText(children.props.children);
  }
  
  return '';
}

export default MarkdocRenderer;