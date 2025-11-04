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
    //links
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

    //code blocks
    pre: (props: any) => <pre className="code-block" {...props} />,
    code: (props: any) => <code className="inline-code" {...props} />,

    //tables
    table: (props: any) => (
      <div className="table-wrapper">
        <table {...props} />
      </div>
    ),

    //blockquote
    blockquote: (props: any) => <blockquote className="callout" {...props} />,

    //images
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

export default MarkdocRenderer;