import Markdoc from '@markdoc/markdoc';
import type { Config, Schema, RenderableTreeNode } from '@markdoc/markdoc';
import type { Slugger } from './slug.js';

/**
 * Walks a renderable subtree and concatenates its text content.
 * Used to derive the default heading text for slug generation.
 *
 * Note: we use `Markdoc.Tag.isTag` rather than a named `Tag` import because
 * the published `@markdoc/markdoc` package is CommonJS and only exposes Tag
 * as a static member of its default export. Named imports fail at runtime
 * in Node's ESM loader even though the .d.ts claims they exist.
 */
function extractText(children: RenderableTreeNode[]): string {
  let text = '';
  for (const child of children) {
    if (typeof child === 'string') text += child;
    else if (Markdoc.Tag.isTag(child)) text += extractText(child.children);
  }
  return text;
}

/**
 * Custom heading node.
 *
 * Renders a standard `<h{level}>` tag and guarantees every heading has a
 * stable `id` attribute:
 *   - If the author supplied `{% #explicit-id %}`, that wins.
 *   - Otherwise a per-page slugger (passed via config.variables.slugger)
 *     generates one, deduplicating within the page.
 *
 * The slugger instance is the same one the transformer uses to derive the
 * TOC, so TOC anchor IDs are guaranteed to match rendered heading IDs.
 */
const heading: Schema = {
  children: ['inline'],
  attributes: {
    id: { type: String },
    level: { type: Number, required: true, default: 1 },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    const slugger = (config.variables as { slugger?: Slugger } | undefined)?.slugger;
    const explicitId = typeof attributes['id'] === 'string' && attributes['id'] !== ''
      ? attributes['id']
      : undefined;

    const text = extractText(children);
    const id = explicitId ?? (slugger ? slugger(text) : text);

    const { level, id: _ignored, ...rest } = attributes as Record<string, unknown>;
    void _ignored;
    return new Markdoc.Tag(`h${level}`, { ...rest, id }, children);
  },
};

/**
 * Routes fenced code blocks to the CodeBlock React component.
 * Markdoc's built-in fence node provides `language` and `content` attributes.
 */
const fence: Schema = {
  render: 'CodeBlock',
  attributes: {
    language: { type: String },
    content:  { type: String, render: true },
  },
};

/**
 * Routes inline images to the Image React component, which adds a lightbox.
 * Markdoc's built-in image node provides `src`, `alt`, and `title` attributes.
 */
const image: Schema = {
  render: 'Image',
  attributes: {
    src:   { type: String },
    alt:   { type: String },
    title: { type: String },
  },
};

/**
 * Callout block tag — renders note, warning, and danger callout boxes.
 *
 * Authors use: {% callout type="note" title="..." %}...{% /callout %}
 * The `children` array lists the Markdoc node types allowed inside, keeping
 * callout content intentionally limited (no nested headings or images).
 */
const callout: Schema = {
  render: 'Callout',
  children: ['paragraph', 'list', 'fence', 'blockquote'],
  attributes: {
    type:  { type: String, default: 'note', matches: ['note', 'warning', 'danger'] },
    title: { type: String },
  },
};

/**
 * Card tag — a single card with optional icon, image, link, and badge.
 *
 * Variant is inferred from attributes: `image` → image card, `icon` → icon
 * card, neither → plain. Self-closing (no body) → compact mode.
 * Authors use: {% card title="..." href="..." icon="..." %}Description{% /card %}
 * Must be used inside {% cardGrid %}.
 */
const card: Schema = {
  render: 'Card',
  children: ['paragraph', 'inline', 'list'],
  attributes: {
    title: { type: String, required: true },
    href:  { type: String },
    icon:  { type: String },
    image: { type: String },
    tag:   { type: String },
  },
};

/**
 * CardGrid tag — responsive grid container for card tags.
 *
 * `cols` controls the number of columns (1–4, default 3). The grid
 * collapses responsively: 2-col at medium viewports, 1-col at small.
 * Authors use: {% cardGrid cols="3" %}...{% /cardGrid %}
 */
const cardGrid: Schema = {
  render: 'CardGrid',
  children: ['tag'],
  attributes: {
    cols: { type: String, default: '3' },
  },
};

/**
 * The default Markdoc config used by Mordoc's content transformer.
 *
 * Currently minimal:
 *   - Custom `heading` node (adds stable, deduplicated anchor IDs).
 *   - Custom `fence` node (routes to CodeBlock for syntax highlighting).
 *   - Custom `image` node (routes to Image for lightbox support).
 *   - Custom `callout` tag (routes to Callout for note/warning/danger boxes).
 *   - Custom `card` / `cardGrid` tags (routes to Card / CardGrid components).
 */
export function createDefaultMarkdocConfig(): Config {
  return {
    nodes: { heading, fence, image },
    tags: { callout, card, cardGrid },
  };
}
