import React from 'react';
import Markdoc from '@markdoc/markdoc';
import type { RenderableTreeNode } from '@markdoc/markdoc';
import { contentComponents } from '../content/component-map.js';
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

/** The badge keyword is its own label — the vocabulary is closed and English. */
function BadgeChip({ badge }: { badge: Badge }) {
  return <span className={`${styles.badge} ${styles[`badge_${badge}`] ?? ''}`}>{badge}</span>;
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

  return (
    <div className={styles.field} id={anchorId}>
      <div className={styles.row}>
        <code className={styles.name}>{field.name}</code>

        {/* Always the literal type — "object", "string", "array<Money>" —
            never substituted with the `$ref` component name. An object field
            reads as "object" whether or not it happens to be a named schema. */}
        <span className={styles.type}>{field.type}</span>

        {/* The named schema behind this field — useful to a real reader too
            (it's the same object `getCustomer` returns), so it ships as
            plain text with no tooltip: this page is seen by API clients,
            not just the writers who'd know what to do with a file path. */}
        {field.schemaRef && <span className={styles.schemaRef}>{`<${field.schemaRef}>`}</span>}

        {field.format && <span className={styles.format}>{field.format}</span>}

        {field.required && <span className={styles.required}>Required</span>}

        {field.deprecated && <span className={styles.deprecated}>Deprecated</span>}
        {field.badges.map((badge) => (
          <BadgeChip key={badge} badge={badge} />
        ))}
      </div>

      {field.requiredWhen && <p className={styles.condition}>Required when {field.requiredWhen}</p>}

      {field.description && <div className={styles.description}>{renderTree(field.description)}</div>}

      {field.note && (
        <div className={styles.note}>
          <span className={styles.noteLabel}>On this endpoint</span>
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
