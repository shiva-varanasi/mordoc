import Markdoc from '@markdoc/markdoc';
import type { Config, Node, Schema, RenderableTreeNode } from '@markdoc/markdoc';
import type { Slugger } from './slug.js';
import { buildScene } from '../diagrams/build-scene.js';
import { notInsideClickable } from './content-validation.js';

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
    return new Markdoc.Tag('Heading', { ...rest, id, level }, children);
  },
};

/**
 * Custom link node — routes all Markdoc inline links to the ContentLink
 * React component, which uses React Router <Link> for internal paths and
 * a plain <a target="_blank"> for external URLs. Anchor-only links (#id)
 * pass through as plain <a> elements (in-page scroll, no routing needed).
 *
 * Without this override Markdoc emits a plain <a href="..."> for every
 * markdown link, which triggers a full browser navigation instead of
 * client-side routing.
 *
 * `children` is exactly Markdoc's own `link` node list: Mordoc allows what
 * Markdoc allows, no more and no less. So a tag (such as `{% image /%}`) may
 * sit inside a link, and a Markdown image inside a link is reported as a
 * warning, as Markdoc reports it.
 */
const link: Schema = {
  render: 'ContentLink',
  children: ['strong', 'em', 's', 'code', 'text', 'tag'],
  attributes: {
    href:  { type: String, required: true },
    title: { type: String },
  },
  validate: notInsideClickable('link'),
};

/**
 * Link tag — variable-capable counterpart to the plain `[text](url)` syntax.
 *
 * Markdoc parses a Markdown link's destination as a raw string, so a `$VAR`
 * inside `[text]($VAR)` is never resolved against `config.variables` (this
 * is a documented Markdoc limitation, not a Mordoc bug). Authors who need a
 * variable in a link target use this tag instead:
 * `{% link path=$VAR %}Text{% /link %}`.
 *
 * Renders through the same ContentLink component as the native `link` node
 * above, so SPA-routing behavior is identical regardless of which syntax
 * produced it. The attribute is named `path` (matching the `button` tag's
 * convention) rather than `href`, so it's renamed back to `href` here before
 * building the Tag.
 *
 * Allows the same children as the `link` node above, so both syntaxes accept
 * the same content.
 */
const linkTag: Schema = {
  render: 'ContentLink',
  inline: undefined,
  children: ['strong', 'em', 's', 'code', 'text', 'tag'],
  attributes: {
    path:  { type: String, required: true },
    title: { type: String },
  },
  transform(node, config) {
    const { path, ...rest } = node.transformAttributes(config) as Record<string, unknown>;
    const children = node.transformChildren(config);
    return new Markdoc.Tag('ContentLink', { ...rest, href: path }, children);
  },
  validate: notInsideClickable('link'),
};

/**
 * The text a code block shows.
 *
 * Markdoc processes the variables and tags in a code block into its children
 * while parsing. Those produce text, which is joined back into one string for
 * highlighting and copying. Without processed text, or when `process` is
 * false, the code block shows its `content` as written.
 */
function codeBlockContent(node: Node, config: Config, process: boolean): string {
  const raw = typeof node.attributes['content'] === 'string' ? node.attributes['content'] : '';
  const hasProcessedText = process && node.children.length > 0;
  if (!hasProcessedText) return raw;

  const parts = node.transformChildren(config);
  // A component, such as a callout, cannot be shown inside a code block yet.
  if (parts.some((part) => Markdoc.Tag.isTag(part))) return raw;

  return parts.map((part) => (part === null || part === undefined ? '' : String(part))).join('');
}

/**
 * Routes fenced code blocks to the CodeBlock React component — except for
 * diagram fences (```sequence-diagram, and any future ```<type>-diagram),
 * which are parsed and laid out right here, once, at build time.
 *
 * A diagram fence's raw text is turned into a flat, JSON-serializable
 * `Scene` (see `src/diagrams/build-scene.ts`) and wrapped as a `Diagram`
 * tag; the diagram engine's parser/layout code itself never reaches the
 * client bundle, only its `Scene` output does. An invalid diagram throws
 * here, which fails the build with a clear error rather than shipping a
 * broken page.
 *
 * Every other fenced language falls through to the CodeBlock component.
 *
 * Like Markdoc's own `fence` node, a code block is processed: variables and
 * tags inside it are evaluated, unless the author writes
 * ```lang {% process=false %} to show it exactly as written. See
 * `codeBlockContent()` for how the processed result becomes text.
 *
 * `process` is not rendered to the page: the transform below builds the
 * `CodeBlock` from `language` and `content` only. It is left renderable so
 * `transformAttributes` hands it over with its default applied.
 */
const fence: Schema = {
  render: 'CodeBlock',
  attributes: {
    language: { type: String },
    content:  { type: String, render: true },
    process:  { type: Boolean, default: true },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const language = typeof attributes['language'] === 'string' ? attributes['language'] : '';
    const content = codeBlockContent(node, config, attributes['process'] !== false);

    if (language.endsWith('-diagram')) {
      const scene = buildScene(language, content);
      return new Markdoc.Tag('Diagram', { scene }, []);
    }

    return new Markdoc.Tag('CodeBlock', { language, content }, []);
  },
};

/**
 * Routes Markdown images to the Image React component, a plain <img>.
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
 * Image tag — variable-capable counterpart to the plain `![alt](src)` syntax.
 *
 * Same limitation as the `link` tag above: `![alt]($VAR)`'s destination is a
 * raw string, so `$VAR` never resolves there. Authors who need a variable in
 * an image source use this tag instead: `{% image src=$VAR alt="..." /%}`.
 *
 * Self-closing — `alt`/`title` are attributes, not children, because `<img>`
 * is a void element and can't render nested content. `children: []` enforces
 * that at validation time rather than leaving it merely unused.
 *
 * Renders through the same Image component as the native `image` node above.
 */
const imageTag: Schema = {
  render: 'Image',
  inline: undefined,
  children: [],
  attributes: {
    src:   { type: String, required: true },
    alt:   { type: String },
    title: { type: String },
  },
};

/**
 * Advanced image tag — an image with a visible caption, which opens larger
 * when clicked: `{% advancedImage src="..." alt="..." caption="..." /%}`.
 *
 * It renders a <figure>, a block element, and HTML allows no block element
 * inside a paragraph, so it can only stand on its own line, like every other
 * block tag.
 *
 * `caption` (not `title`) because it is visible text below the image, where
 * an image's `title` only shows when hovering.
 */
const advancedImageTag: Schema = {
  render: 'AdvancedImage',
  children: [],
  inline: false,
  attributes: {
    src:     { type: String, required: true },
    alt:     { type: String },
    caption: { type: String },
  },
};

/**
 * Clip tag — muted, looping demo clips, the recommended replacement for
 * animated GIFs in content.
 *
 * Named `clip` (not `video`) to leave `video` free for a future long-form,
 * audible tutorial-video tag with native player controls — a different job
 * with different defaults (no forced mute, no autoplay-on-click, real
 * scrubbing) that this component deliberately doesn't try to do.
 *
 * A plain `<img src="*.gif">` autoplays with no way to pause it, which fails
 * WCAG 2.2.2 (moving content lasting more than 5s needs a pause mechanism)
 * and reads as "crowded" next to prose. `<video>` doesn't have that problem
 * because `HTMLVideoElement` has a real `play()`/`pause()`, so the Clip
 * component renders paused on `thumbnail` by default and toggles playback on
 * click, instead of autoplaying like a GIF would.
 *
 * `src` (not `path`) because this is a resource the browser loads directly,
 * the same category as `image.src` above — not a navigable destination like
 * `link`/`button`/`card`'s `path`, which get routed through `isExternal()`.
 *
 * `thumbnail` (not `poster`, though it maps to the native `<video poster>`
 * attribute under the hood) — "poster" is filmmaking jargon; "thumbnail" is
 * what content authors actually call this, and it's the same name used by
 * the `videoEmbed` tag below, which has no native `poster` attribute to
 * mirror at all since it isn't a real `<video>` element.
 *
 * Self-closing, same reasoning as `imageTag`: `thumbnail`/`title`/`alt` are
 * attributes, not children — a clip embed has no nested content to parse.
 *
 * Authors use: {% clip src="/videos/demo.mp4" thumbnail="/images/demo-thumb.jpg" title="..." /%}
 */
const clip: Schema = {
  render: 'Clip',
  inline: false,
  children: [],
  attributes: {
    src:       { type: String, required: true },
    thumbnail: { type: String },
    title:     { type: String },
    alt:       { type: String },
  },
};

/**
 * VideoEmbed tag — a video hosted on YouTube, Vimeo, Loom, or another
 * recognized provider (as opposed to `clip`'s self-hosted file). See the
 * VideoEmbed component's own doc comment for the full reasoning; summary
 * here:
 *
 * `src` is the video's ordinary public page URL — whatever an author would
 * paste from their browser, in any of that provider's URL shapes
 * (`youtube.com/watch?v=`, `youtu.be/`, `vimeo.com/`, `loom.com/share/`,
 * …). `providers.ts` resolves it to a provider name + iframe embed URL; an
 * unrecognized host or an unparseable video ID falls back to a plain
 * link-out card rather than a broken iframe.
 *
 * For a recognized provider, that iframe is mounted immediately and
 * unconditionally — no author-supplied `thumbnail` needed, because
 * YouTube/Vimeo/Loom's own players already render a real thumbnail + play
 * button the instant they load. `thumbnail` (optional, same name and role
 * as `clip.thumbnail`) only does anything in the *unrecognized*-provider
 * case: omit it there and readers get a generic branded fallback card
 * instead of a real screenshot. See the component doc comment for the
 * trade-off this implies (every recognized-provider embed now pays that
 * provider's player-JS weight on page load, not just on click).
 *
 * `aspectRatio` (optional, e.g. `"4 / 3"`, `"9 / 16"`) overrides the 16:9
 * default box. Mainly needed for Loom, whose recordings inherit whatever
 * shape the recorder's screen/window was rather than a fixed video ratio.
 *
 * Self-closing, same reasoning as `clip`/`imageTag`.
 *
 * Authors use: {% videoEmbed src="https://youtu.be/dQw4w9WgXcQ" title="..." /%}
 */
const videoEmbed: Schema = {
  render: 'VideoEmbed',
  inline: false,
  children: [],
  attributes: {
    src:         { type: String, required: true },
    thumbnail:   { type: String },
    title:       { type: String },
    alt:         { type: String },
    aspectRatio: { type: String },
  },
};

/**
 * Callout block tag — renders note, warning, danger, and tip callout boxes.
 *
 * Authors use: {% callout type="note" title="..." %}...{% /callout %}
 * The `children` array lists the Markdoc node types allowed inside, keeping
 * callout content intentionally limited (no nested headings or images).
 */
const callout: Schema = {
  render: 'Callout',
  inline: false,
  children: ['paragraph', 'list', 'fence', 'blockquote'],
  attributes: {
    type:  { type: String, default: 'note', matches: ['note', 'warning', 'danger', 'tip'] },
    title: { type: String },
  },
};

/**
 * Card tag — a single card with optional icon, image, link, and badge.
 *
 * Variant is inferred from attributes: `image` → image card, `icon` → icon
 * card, neither → plain. Self-closing (no body) → compact mode.
 * Authors use: {% card title="..." path="..." icon="..." %}Description{% /card %}
 * Must be used inside {% cardGrid %}.
 */
const card: Schema = {
  render: 'Card',
  inline: false,
  children: ['paragraph', 'inline', 'list'],
  attributes: {
    title: { type: String, required: true },
    path:  { type: String },
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
  inline: false,
  children: ['tag'],
  attributes: {
    cols: { type: String, default: '3', matches: ['1', '2', '3', '4'] },
  },
};

/**
 * Hero tag — full-width landing page hero section.
 *
 * Layout is inferred: `image` present → split (text + image), absent → centered.
 * `background` accepts an image path or URL only — solid background color
 * and all text colors are design decisions owned by Hero.module.css's
 * tokens, not markdown attributes.
 * CTA buttons are passed as children ({% button %} tags).
 * Authors use: {% hero title="..." description="..." image="..." background="..." %}
 *   {% button path="..." %}Label{% /button %}
 * {% /hero %}
 */
const hero: Schema = {
  render: 'Hero',
  inline: false,
  children: ['tag', 'paragraph'],
  attributes: {
    title:       { type: String, required: true },
    titleAccent: { type: String },
    description: { type: String },
    image:       { type: String },
    background:  { type: String },
  },
};

/**
 * Section tag — full-width landing page content block.
 *
 * Optional `title` renders an <h2>. `background` accepts an image path or
 * URL only — solid background color is a design decision owned by
 * Section.module.css's --section-bg token, not a markdown attribute.
 * Authors use: {% section title="..." background="/images/foo.jpg" %}...{% /section %}
 */
const section: Schema = {
  render: 'Section',
  inline: false,
  children: ['heading', 'paragraph', 'list', 'fence', 'blockquote', 'tag', 'hr'],
  attributes: {
    title:      { type: String },
    background: { type: String },
  },
};

/**
 * Button tag — styled CTA link, usable in landing pages and content pages.
 *
 * Internal paths use React Router Link; external URLs open in a new tab.
 * Authors use: {% button path="..." %}Label{% /button %}
 */
const button: Schema = {
  render: 'Button',
  inline: undefined,
  children: ['paragraph', 'inline', 'text', 'strong', 'em'],
  attributes: {
    path:    { type: String, required: true },
    variant: { type: String, default: 'primary', matches: ['primary', 'secondary'] },
  },
  validate: notInsideClickable('button'),
};

/**
 * Accordion tag — a single collapsible section: `title` drives the
 * clickable header, and the body accepts the same broad content model as
 * `section` (headings, paragraphs, lists, code fences, images, and any
 * nested custom tag), so authors can put callouts, clips, embeds, cards —
 * even another accordion — inside it, same as writing plain article body
 * content.
 *
 * Works standalone, or nested inside `accordions` for grouped/coordinated
 * behavior — see the `accordions` tag and the Accordion component's own doc
 * comment for the mechanism.
 *
 * Authors use: {% accordion title="..." %}...{% /accordion %}
 */
const accordion: Schema = {
  render: 'Accordion',
  inline: false,
  children: ['heading', 'paragraph', 'list', 'fence', 'blockquote', 'tag', 'hr'],
  attributes: {
    title:       { type: String, required: true },
    defaultOpen: { type: Boolean, default: false },
  },
};

/**
 * Accordions tag — optional group wrapper for several `accordion` tags.
 *
 * Makes the group exclusive: opening one item closes any other open item
 * in the group. See the Accordions component's own doc comment for how
 * this is implemented with no JS via native `<details name="...">`.
 *
 * Authors use:
 *   {% accordions %}
 *     {% accordion title="..." %}...{% /accordion %}
 *     {% accordion title="..." %}...{% /accordion %}
 *   {% /accordions %}
 */
const accordions: Schema = {
  render: 'Accordions',
  inline: false,
  children: ['tag'],
};

/**
 * Column tag — a single column inside `columns`.
 *
 * No attributes: content accepts the same broad model as `section`/
 * `accordion` (headings, paragraphs, lists, code fences, images, and any
 * nested custom tag), so a column reads exactly like normal article content.
 *
 * Authors use: {% column %}...{% /column %}, nested inside `columns`.
 */
const column: Schema = {
  render: 'Column',
  inline: false,
  children: ['heading', 'paragraph', 'list', 'fence', 'blockquote', 'tag', 'hr'],
};

/**
 * Columns tag — lays out its `column` children side by side, equal width.
 *
 * An ordinary block-level tag, so it needs no special handling to appear
 * mid-page: normal content, then a `{% columns %}...{% /columns %}` block,
 * then normal content again — or the author wraps the whole page body in
 * one `columns` block. Column count follows however many `column` children
 * are nested; there's no `cols` attribute to keep in sync with them.
 *
 * `divider` (default `false`) draws a vertical rule between columns.
 * Collapses to a single stacked column on narrow viewports.
 *
 * Authors use:
 *   {% columns %}
 *     {% column %}...{% /column %}
 *     {% column %}...{% /column %}
 *   {% /columns %}
 */
const columns: Schema = {
  render: 'Columns',
  inline: false,
  children: ['tag'],
  attributes: {
    divider: { type: Boolean, default: false },
  },
};

/**
 * Params tag — the container for API field entries in an enrichment file.
 *
 * ```markdown
 * {% params %}                              ← parameters + request body
 * {% params in="response" status="402" %}   ← one response
 * {% params mode="replace" %}               ← the rare full override
 * ```
 *
 * The wrapper exists because an operation file mixes narrative prose and
 * field entries, and telling them apart by heading level alone would mean a
 * writer using `###` in ordinary prose silently creates a bogus field entry.
 * `mode` sits on the container rather than on each entry: two lines per
 * file, not two per field.
 *
 * Registered here purely so the attribute declarations below make a typo in
 * `in` or `mode` catchable rather than silently ignored — this tag isn't
 * part of the documented authoring surface for ordinary content. No
 * `transform` or `render` is declared: in an enrichment file the tag is
 * consumed at the AST level, before transform — `src/api/enrichment-parser.ts`
 * splits the block on its `###` headings and uses each as a lookup key, so
 * those headings never become `Heading` tags and never reach the TOC, and
 * `Markdoc.transform()` never runs on this node in that path. If a
 * `{% params %}` block ever ends up outside an enrichment file — undocumented
 * usage, not a supported case — Markdoc's own default for a tag with neither
 * `transform` nor `render` already renders its children unwrapped, which is
 * plain, unremarkable behavior for a tag nobody is told to use.
 */
const params: Schema = {
  inline: false,
  children: ['heading', 'paragraph', 'list', 'fence', 'blockquote', 'tag', 'hr'],
  attributes: {
    in:     { type: String, default: 'request', matches: ['request', 'response'] },
    status: { type: String },
    mode:   { type: String, default: 'append', matches: ['append', 'replace'] },
  },
};

/**
 * The tags every page can use: article pages, landing pages, and the texts
 * for the API reference. It matches `contentComponents`, the components
 * those pages render with.
 */
const articleTags: Record<string, Schema> = { callout, card, cardGrid, button, link: linkTag, image: imageTag, advancedImage: advancedImageTag, clip, videoEmbed, accordion, accordions, column, columns, params };

/**
 * The tags a landing page can use: every article tag, plus `hero` and
 * `section`, as a landing page renders with `contentComponents` plus `Hero`
 * and `Section`.
 */
const landingTags: Record<string, Schema> = { ...articleTags, hero, section };

/**
 * The Markdoc config for article pages, and the base for the API reference
 * texts. A tag that is not in it, such as `hero`, is reported by Markdoc as
 * an undefined tag.
 */
export function createArticleMarkdocConfig(): Config {
  return createMarkdocConfig(articleTags);
}

/** The Markdoc config for pages with `layout: landing` in their frontmatter. */
export function createLandingMarkdocConfig(): Config {
  return createMarkdocConfig(landingTags);
}

function createMarkdocConfig(tags: Record<string, Schema>): Config {
  assertEveryTagStatesPlacement(tags);
  return {
    nodes: { heading, link, fence, image },
    tags,
  };
}

/**
 * Every tag must say where it may stand: `inline: false` for a block, or an
 * explicit `inline: undefined` for a tag that may also go inside a sentence
 * or a link. Validation can only report a tag in the wrong place if its
 * schema says so, so a tag that forgets it would let broken pages through.
 */
function assertEveryTagStatesPlacement(tags: Record<string, Schema>): void {
  const missing = Object.keys(tags).filter((name) => !Object.hasOwn(tags[name]!, 'inline'));
  if (missing.length > 0) {
    throw new Error(`mordoc: these tags don't state where they may stand (inline): ${missing.join(', ')}`);
  }
}
