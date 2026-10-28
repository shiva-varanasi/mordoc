import React from 'react';
import Markdoc from '@markdoc/markdoc';
import type { RenderableTreeNode } from '@markdoc/markdoc';
import { contentComponents } from '../content/component-map.js';
import { CONDITIONAL_BADGE } from '../../types/api.js';
import type { Badge, FieldView } from '../../types/api.js';
import styles from './FieldTree.module.css';

/**
 * The recursive field list.
 *
 * Two rendering modes meet in this component and both have to work. The
 * rows themselves are data-driven from `FieldView[]` — names, types,
 * required-ness, enums and derived conditions all come off the spec as
 * plain values. But every `description` and `note` is a `RenderableTreeNode`
 * and is rendered through the same component map guides use, so a
 * `{% callout %}` written inside a field description behaves exactly as it
 * would in an article.
 */

interface FieldTreeProps {
  fields: FieldView[];
  /**
   * Prefix for DOM anchor ids. Empty for request-side fields, so a deep link
   * reads `#billing_address.country` as §10 specifies. Response fields are
   * prefixed by status, because the same field path routinely appears in
   * both a request and a response and duplicate DOM ids would make the
   * deep link land on whichever came first.
   */
  anchorPrefix: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  depth?: number;
}

export function FieldTree({ fields, anchorPrefix, expanded, onToggle, depth = 0 }: FieldTreeProps) {
  if (fields.length === 0) return null;
  return (
    <ul className={styles.list} data-depth={depth}>
      {fields.map((field) => (
        <li key={field.path} className={styles.item}>
          <Field
            field={field}
            anchorPrefix={anchorPrefix}
            expanded={expanded}
            onToggle={onToggle}
            depth={depth}
          />
        </li>
      ))}
    </ul>
  );
}

function renderTree(tree: RenderableTreeNode | null): React.ReactNode {
  if (!tree) return null;
  return Markdoc.renderers.react(tree, React, { components: contentComponents });
}

/**
 * Invisible (font-size: 0) space — see the comment above `.type` in `Field`
 * for why this exists. A real text node, so it survives into whatever reads
 * the page's plain text (Pagefind, a screen reader), but zero-width so it
 * adds nothing on top of the row's own flex `gap`.
 */
function Sep() {
  return <span className={styles.sep}> </span>;
}

/**
 * `conditional` is the reserved keyword and keeps its dedicated uppercase
 * style. Any other badge is free text, shown verbatim as an inline-code chip.
 */
function BadgeChip({ badge }: { badge: Badge }) {
  if (badge === CONDITIONAL_BADGE) {
    return (
      <span className={`${styles.badge} ${styles.badge_conditional}`}>
        <Sep />
        {badge}
      </span>
    );
  }
  return (
    <span>
      <Sep />
      <code className={styles.badgeCode}>{badge}</code>
    </span>
  );
}

/**
 * Link glyph for the per-field "copy link" affordance — same artwork as the
 * guide heading anchor icon (Heading.tsx) for visual consistency across the
 * app, duplicated locally rather than imported: this file already owns its
 * own small icon components (Plus/Minus below) and the two call sites live
 * in unrelated route trees (guides vs. API docs).
 */
function LinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

/** Plus/Minus glyphs for the disclosure button — inline rather than a dependency, since no icon library is installed. */
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>
  );
}

interface FieldProps {
  field: FieldView;
  anchorPrefix: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  depth: number;
}

/** "1 property" / "4 properties" / "2 options" — the expand control's label. */
function childCountLabel(field: FieldView, hasVariants: boolean): string {
  if (hasVariants) {
    const count = field.variants?.length ?? 0;
    return `${count} option${count === 1 ? '' : 's'}`;
  }
  const count = field.children.length;
  return `${count} propert${count === 1 ? 'y' : 'ies'}`;
}

function Field({ field, anchorPrefix, expanded, onToggle, depth }: FieldProps) {
  const anchorId = `${anchorPrefix}${field.path}`;
  const hasVariants = (field.variants?.length ?? 0) > 0;
  const hasChildren = field.children.length > 0 || hasVariants;
  // Root rows are always rendered by `FieldTree` regardless of `isOpen` — this
  // only governs *this* field's own children, so every nested level starts
  // collapsed and only a click (or a deep link's ancestor chain) opens one.
  const isOpen = expanded.has(anchorId);
  const [linkCopied, setLinkCopied] = React.useState(false);

  // Mirrors Heading.tsx's click handler (same three effects: smooth-scroll,
  // push the hash without a full navigation, copy the resulting URL) rather
  // than importing it — that component lives under content/heading, owned by
  // guides, and pulling API docs' interaction logic from it would couple two
  // otherwise-independent route trees for a dozen lines of duplication.
  function handleCopyLink(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${anchorId}`);
    const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  return (
    <div className={styles.field}>
      {/* A real heading, not just a styled <div> — carries the anchor id so
          Pagefind can offer this exact field as a search "sub-result" (it
          only ever anchors sub-results to h1-h6 elements, never to an
          arbitrary id). One fixed level for every field regardless of
          nesting depth: Pagefind doesn't use heading level for anchoring,
          and a fixed level means a deeply-nested schema never runs out of
          h1-h6 — it just sits under each subsection's own h3 (see
          Operation.module.css .subsectionTitle). `.row` in
          FieldTree.module.css resets the browser's default h4 margin/weight
          so this renders identically to the plain row it replaces. */}
      <h4 id={anchorId} className={styles.row}>
        {/* field.path, not field.name — a root field's path is just its own
            name (schema-walk.ts's joinPath('', name) === name), but a nested
            field's path carries every ancestor ("browserInfo.acceptHeaders"),
            matching how e.g. Redoc labels nested fields. Indentation already
            shows the nesting visually; the full path is what makes a field
            unambiguous and copy-pasteable out of that visual context — the
            same reason this is also what Pagefind ends up showing as the
            section title for a parameter search match. */}
        <code className={styles.name}>{field.path}</code>

        {/* Always the literal type — "object", "string", "array of objects" —
            never substituted with the `$ref` component name. An object field
            reads as "object" whether or not it happens to be a named schema.
            The leading <Sep/> in this and every span below it is invisible
            (font-size: 0) — visual spacing is entirely the row's flex `gap`.
            It exists only so Pagefind's plain-text extraction sees a word
            boundary between segments; without it, adjacent segments run
            together into one word ("amountobject<...>") both in the search
            index and in the section title SearchModal shows for a match. */}
        <span className={styles.type}><Sep />{field.type}</span>

        {/* The named schema behind this field — useful to a real reader too
            (it's the same object `getCustomer` returns), so it ships as
            plain text with no tooltip: this page is seen by API clients,
            not just the writers who'd know what to do with a file path. */}
        {field.schemaRef && <span className={styles.schemaRef}><Sep />{`<${field.schemaRef}>`}</span>}

        {field.format && <span className={styles.format}><Sep />{field.format}</span>}

        {field.required && <span className={styles.required}><Sep />Required</span>}

        {field.deprecated && <span className={styles.deprecated}><Sep />Deprecated</span>}
        {field.badges.map((badge) => (
          <BadgeChip key={badge} badge={badge} />
        ))}

        {/* Placed last, like Heading.tsx's own anchor icon — hover-reveal
            opacity means position within the row is a purely visual choice,
            and trailing keeps it out of the text run above (it would
            otherwise land between the name and the type). */}
        <a
          href={`#${anchorId}`}
          onClick={handleCopyLink}
          className={styles.anchorLink}
          aria-label={`Copy link to ${field.path}`}
        >
          <LinkIcon />
          {linkCopied && <span className={styles.tooltip}>Copied</span>}
        </a>
      </h4>

      {field.requiredWhen && <p className={styles.condition}>Required when {field.requiredWhen}</p>}

      {(field.description || field.note) && (
        <div className={styles.description}>
          {renderTree(field.description)}
          {renderTree(field.note)}
        </div>
      )}

      {field.enum && field.enum.length > 0 && (
        <p className={styles.enumRow}>
          <span className={styles.metaLabel}>Allowed values</span>
          {field.enum.map((value) => (
            <code key={value} className={styles.enumValue}>
              {value}
            </code>
          ))}
        </p>
      )}

      {field.default !== undefined && (
        <p className={styles.enumRow}>
          <span className={styles.metaLabel}>Default</span>
          <code className={styles.enumValue}>{JSON.stringify(field.default)}</code>
        </p>
      )}

      {/* A branch that re-enters a schema already open above it links back to
          the ancestor instead of expanding — the only way a self-referential
          schema terminates. */}
      {field.recursiveRef !== undefined && (
        <p className={styles.recursive}>
          <a href={`#${anchorPrefix}${field.recursiveRef}`}>
            Defined above at{' '}
            {field.recursiveRef === '' ? field.schemaRef ?? field.type : field.recursiveRef}
          </a>
        </p>
      )}

      {/* The expand affordance: a plus/minus icon plus a count, in the manner
          of Redoc's nested-schema expander — not the type name doubling as a
          button. */}
      {hasChildren && !field.recursiveRef && (
        <button
          type="button"
          className={styles.expandToggle}
          aria-expanded={isOpen}
          aria-controls={`${anchorId}-children`}
          onClick={() => onToggle(anchorId)}
        >
          <span className={styles.expandIcon} aria-hidden="true">
            {isOpen ? <MinusIcon /> : <PlusIcon />}
          </span>
          {isOpen ? 'Hide' : 'Show'} {childCountLabel(field, hasVariants)}
        </button>
      )}

      {hasChildren && !field.recursiveRef && (
        <div id={`${anchorId}-children`} hidden={!isOpen} className={styles.children}>
          {hasVariants ? (
            <VariantTabs
              variants={field.variants ?? []}
              anchorPrefix={anchorPrefix}
              expanded={expanded}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ) : (
            <FieldTree
              fields={field.children}
              anchorPrefix={anchorPrefix}
              expanded={expanded}
              onToggle={onToggle}
              depth={depth + 1}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface VariantTabsProps {
  variants: { label: string; fields: FieldView[] }[];
  anchorPrefix: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  depth: number;
}

/**
 * `oneOf` / `anyOf` alternatives as tabs.
 *
 * Tabs rather than a stacked list because the alternatives are mutually
 * exclusive: showing them all at once invites a reader to send fields from
 * two variants in one payload, which is exactly what `oneOf` forbids.
 */
export function VariantTabs({ variants, anchorPrefix, expanded, onToggle, depth }: VariantTabsProps) {
  const [active, setActive] = React.useState(0);
  if (variants.length === 0) return null;
  const current = variants[Math.min(active, variants.length - 1)] as { label: string; fields: FieldView[] };

  return (
    <div className={styles.variants}>
      <div className={styles.variantTabs} role="tablist">
        {variants.map((variant, index) => (
          <button
            key={variant.label}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={`${styles.variantTab} ${index === active ? styles.variantTabActive : ''}`}
            onClick={() => setActive(index)}
          >
            {variant.label}
          </button>
        ))}
      </div>
      <FieldTree
        fields={current.fields}
        anchorPrefix={anchorPrefix}
        expanded={expanded}
        onToggle={onToggle}
        depth={depth}
      />
    </div>
  );
}
