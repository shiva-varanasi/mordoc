import React, { useCallback, useEffect, useState } from 'react';
import Markdoc from '@markdoc/markdoc';
import { useLoaderData, useLocation } from 'react-router';
import { contentComponents } from '../content/component-map.js';
import { Footer } from '../content/footer/Footer.js';
import { useMordocData } from '../data-context.js';
import { Breadcrumb } from '../breadcrumb/Breadcrumb.js';
import { useBreadcrumbEntries } from '../breadcrumb/useBreadcrumb.js';
import { Endpoint } from './Endpoint.js';
import { RequestExamplePanel, ResponseExamplePanel } from './ExamplePanel.js';
import { FieldTree } from './FieldTree.js';
import type { FieldView, OperationView } from '../../types/api.js';
import styles from './Operation.module.css';
import typography from '../content/Typography.module.css';

/**
 * An API operation page.
 *
 * The route-level component for `PageMeta.kind === 'operation'` — the
 * counterpart to `Content` for authored pages. It owns the same things
 * `Content` owns for its flavor: the grid, where the rail sits, and where
 * the footer sits. The shell around it (header, sidenav, footer, theme,
 * language picker) is entirely unchanged and shared with guides; only this
 * article region differs.
 *
 * The article is always English — spec, enrichment and the labels written
 * here — whatever language the surrounding shell is in, so the article and
 * the example rail carry their own `lang="en"` for screen readers.
 *
 * Its data arrives through exactly the same channel a page's does — the
 * route loader resolves `virtual:mordoc/page/<routePath>`, which for this
 * route carries an `OperationView` rather than a `PageData`. Everything in
 * it was resolved at build time, so there is no spec parsing, no
 * dereferencing and no OpenAPI library anywhere in the bundle.
 *
 * Request and Response are two independent sections rather than one grid:
 * each pairs a fields column with its own sticky sample column, so the
 * request payload stays put while a reader reads through request fields and
 * hands off to the response payload once they reach the response fields —
 * one sticky rail spanning the whole page would have nothing of its own to
 * hand off to.
 */

/** Anchor ids of every ancestor of a field, derived from its dotted path. */
function ancestorsOf(anchorId: string): string[] {
  const parts = anchorId.split('.');
  const out: string[] = [];
  for (let i = 1; i < parts.length; i += 1) {
    out.push(parts.slice(0, i).join('.'));
  }
  return out;
}

interface ParamGroupProps {
  title: string;
  fields: FieldView[];
  expanded: Set<string>;
  onToggle: (path: string) => void;
}

/** One "Path parameters" / "Query parameters" / … subsection. Renders nothing when empty. */
function ParamGroup({ title, fields, expanded, onToggle }: ParamGroupProps) {
  if (fields.length === 0) return null;
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>{title}</h3>
      <FieldTree fields={fields} anchorPrefix="" expanded={expanded} onToggle={onToggle} />
    </div>
  );
}

export function Operation() {
  const view = useLoaderData() as OperationView;
  const { site } = useMordocData();
  const { hash } = useLocation();
  const breadcrumb = useBreadcrumbEntries();

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    () => view.responses[0]?.status,
  );

  const toggle = useCallback((anchorId: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(anchorId)) next.delete(anchorId);
      else next.add(anchorId);
      return next;
    });
  }, []);

  useEffect(() => {
    document.title = `${view.summary} — ${site.name}`;
  }, [view.summary, site.name]);

  // Everything nested starts collapsed, so a deep link to a nested field
  // would otherwise land silently at the top of the page with its target
  // hidden. Expand every ancestor of the target first, then scroll. A
  // response-scoped anchor also has to select that response's tab first —
  // only the selected status's fields are in the DOM at all.
  useEffect(() => {
    if (!hash || hash.length < 2) return;
    const anchorId = decodeURIComponent(hash.slice(1));

    const targetResponse = view.responses.find((r) => anchorId.startsWith(`response-${r.status}-`));
    if (targetResponse) setSelectedStatus(targetResponse.status);

    const ancestors = ancestorsOf(anchorId);
    if (ancestors.length > 0) {
      setExpanded((previous) => new Set([...previous, ...ancestors]));
    }
    // One frame later the newly-expanded ancestors (and the newly-selected
    // response tab) are in the DOM and the target actually has a position to
    // scroll to.
    const frame = requestAnimationFrame(() => {
      document.getElementById(anchorId)?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, view.responses]);

  const narrative = view.narrative
    ? Markdoc.renderers.react(view.narrative, React, { components: contentComponents })
    : null;

  const hasBody = (view.requestBody?.fields.length ?? 0) > 0;
  const selectedResponse = view.responses.find((r) => r.status === selectedStatus) ?? view.responses[0];

  return (
    <div className={styles.page}>
      <article className={styles.articleArea} lang="en" data-pagefind-body>
        <div className={styles.breadcrumbRow} data-pagefind-ignore>
          <Breadcrumb entries={breadcrumb} />
        </div>

        <header>
          <h1 className={typography.title} data-pagefind-meta="title">
            {view.summary}
          </h1>
          {view.deprecated && <p className={styles.deprecated}>This operation is deprecated.</p>}
          <Endpoint method={view.method} path={view.path} />
        </header>

        <hr className={styles.separator} />

        {narrative && <div className={`${styles.narrative} ${typography.prose}`}>{narrative}</div>}

        {/* Request always renders — even an operation with no parameters or
            body still has a cURL sample worth showing beside it. */}
        <section className={styles.sectionRow}>
          <div className={styles.fieldsCol}>
            <h2 className={styles.sectionTitle}>Request</h2>

            <ParamGroup title="Path parameters" fields={view.parameters.path} expanded={expanded} onToggle={toggle} />
            <ParamGroup title="Query parameters" fields={view.parameters.query} expanded={expanded} onToggle={toggle} />
            <ParamGroup title="Header parameters" fields={view.parameters.header} expanded={expanded} onToggle={toggle} />
            <ParamGroup title="Cookie parameters" fields={view.parameters.cookie} expanded={expanded} onToggle={toggle} />

            {hasBody && view.requestBody && (
              <div className={styles.subsection}>
                <h3 className={styles.subsectionTitle}>
                  Body
                  <span className={styles.mediaType}>{view.requestBody.mediaType}</span>
                </h3>
                <FieldTree
                  fields={view.requestBody.fields}
                  anchorPrefix=""
                  expanded={expanded}
                  onToggle={toggle}
                />
              </div>
            )}
          </div>
          <div className={styles.railCol} data-pagefind-ignore>
            <RequestExamplePanel view={view} />
          </div>
        </section>

        {view.responses.length > 0 && selectedResponse && (
          <section className={styles.sectionRow}>
            <div className={styles.fieldsCol}>
              <h2 className={styles.sectionTitle}>Response</h2>

              {view.responses.length > 1 && (
                <div className={styles.statusTabs} role="tablist">
                  {view.responses.map((response) => (
                    <button
                      key={response.status}
                      type="button"
                      role="tab"
                      aria-selected={response.status === selectedResponse.status}
                      className={`${styles.statusTab} ${
                        response.status === selectedResponse.status ? styles.statusTabActive : ''
                      }`}
                      onClick={() => setSelectedStatus(response.status)}
                    >
                      <span className={styles.statusCode}>{response.status}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* A response's own description comes from the spec and is not
                  enrichable; its fields are. */}
              {selectedResponse.description && (
                <p className={styles.responseDescription}>{selectedResponse.description}</p>
              )}

              {selectedResponse.fields.length > 0 && (
                <div className={styles.subsection}>
                  <h3 className={styles.subsectionTitle}>Body</h3>
                  <FieldTree
                    fields={selectedResponse.fields}
                    anchorPrefix={`response-${selectedResponse.status}-`}
                    expanded={expanded}
                    onToggle={toggle}
                  />
                </div>
              )}
            </div>
            <div className={styles.railCol} data-pagefind-ignore>
              <ResponseExamplePanel
                key={selectedResponse.status}
                view={view}
                status={selectedResponse.status}
                mediaType={selectedResponse.mediaType}
              />
            </div>
          </section>
        )}
      </article>

      <div className={styles.footerArea}>
        <Footer />
      </div>
    </div>
  );
}
