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
 * The default Markdoc config used by Mordoc's content transformer.
 *
 * Currently minimal:
 *   - Custom `heading` node (adds stable, deduplicated anchor IDs).
 *   - No custom tags yet — they will be registered as the default theme
 *     adds components that render them (callouts, cards, tabs, etc.).
 *
 * TODO: add custom `link` and `image` node transforms to rewrite relative
 * paths (`./safety.md` → `/flight-manual/safety`, `./images/foo.png` →
 * served asset URL). Deferred until the client is visible in the browser
 * and the asset-serving strategy is decided.
 */
export function createDefaultMarkdocConfig(): Config {
  return {
    nodes: { heading },
    tags: {},
  };
}
