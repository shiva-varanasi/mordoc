/**
 * MarkdocRenderer - Renders Markdoc content as React components
 */

import React from 'react';
import Markdoc from '@markdoc/markdoc';
import { MarkdocRenderableNode } from '../types/content';
import CodeBlock from './CodeBlock';
import Heading from './Heading';
import { Image } from './Image';
import Card from './Card';
import CardGrid from './CardGrid';
import Callout from './Callout';

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
    h1: (props: any) => <Heading level={1} {...props} />,
    h2: (props: any) => <Heading level={2} {...props} />,
    h3: (props: any) => <Heading level={3} {...props} />,
    h4: (props: any) => <Heading level={4} {...props} />,
    h5: (props: any) => <Heading level={5} {...props} />,
    h6: (props: any) => <Heading level={6} {...props} />,
    
    //links
    Link: (props: any) => {
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
    
    // Inline code (not highlighted)
    code: (props: any) => <code className="inline-code" {...props} />,

    //tables
    table: (props: any) => (
      <div className="table-wrapper">
        <table {...props} />
      </div>
    ),

    //blockquote
    blockquote: (props: any) => <blockquote className="callout" {...props} />,

    // Custom components
    // Maps 'Heading' string → Heading component
    Heading: Heading,        
    
    // Code blocks with syntax highlighting
    CodeBlock: CodeBlock,

    // Images with click-to-expand
    Image: Image,

    // Cards and card grid containers
    Card: Card,
    CardGrid: CardGrid,

    // Callout boxes
    Callout: Callout,

  };
}

export default MarkdocRenderer;