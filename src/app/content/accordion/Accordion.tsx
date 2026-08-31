/**
 * Accordion — a single collapsible section with a clickable title and a
 * body that accepts arbitrary content: paragraphs, lists, code fences,
 * images, and any nested custom tag (`callout`, `clip`, `videoEmbed`,
 * `cardGrid`, even another `accordion`) — the same content model `section`
 * already allows, so an accordion body reads exactly like article content.
 *
 * Works two ways:
 *   - Standalone: `{% accordion title="..." %}...{% /accordion %}` on its
 *     own, independent of any other accordion on the page.
 *   - Grouped: nested inside `{% accordions %}...{% /accordions %}`, which
 *     provides `AccordionsContext` — see that component's doc comment for
 *     the exclusive-open ("only one item open at a time") mechanism.
 *
 * Built on native `<details>`/`<summary>` rather than a manual open/close
 * state machine: free keyboard support and screen-reader semantics, and it
 * still works if JS never hydrates. `defaultOpen` only sets the *initial*
 * open state (via the `open` attribute) — after that the browser owns
 * toggling natively, same as every other `<details>` on the web.
 *
 * Registered as a Markdoc tag (`accordion`) in markdoc-config.ts and in
 * ArticlePage.tsx's and LandingPage.tsx's components maps.
 */

import { useContext } from 'react';
import type { ReactNode } from 'react';
import { AccordionsContext } from './accordions-context.js';
import styles from './Accordion.module.css';

interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  children?: ReactNode;
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  const group = useContext(AccordionsContext);
  const name = group?.name;

  return (
    <details
      className={`${styles.accordion} ${group ? styles.grouped : styles.standalone}`}
      open={defaultOpen}
      name={name}
    >
      <summary className={styles.summary}>
        <span className={styles.title}>{title}</span>
        <span className={styles.chevron}><ChevronIcon /></span>
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}

export default Accordion;
