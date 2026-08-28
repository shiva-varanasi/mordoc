/**
 * Accordions — optional group wrapper coordinating several `Accordion`s.
 *
 * Without this wrapper, `accordion` tags are fully independent (opening one
 * has no effect on any other). Wrapping a set of them in
 * `{% accordions %}...{% /accordions %}` does two things:
 *
 *   - Visual: connects the items into one bordered block with dividers
 *     between them instead of each having its own margin/shadow — see
 *     Accordion.module.css's `.grouped` class.
 *   - Behavioral, when `type="single"` (the default): only one item can be
 *     open at a time. This is implemented with zero JS via the native
 *     `<details name="...">` attribute — browsers close every other
 *     `<details>` sharing a `name` when one opens. `type="multiple"` omits
 *     the shared name, so items behave independently (grouped visually,
 *     coordinated open/close is opt-out for authors who want an
 *     FAQ-style list where several answers can stay open together).
 *
 * The group id is generated once via `useId()` so multiple `accordions`
 * groups on the same page never collide with each other.
 *
 * Registered as a Markdoc tag (`accordions`) in markdoc-config.ts and in
 * ArticlePage.tsx's and LandingPage.tsx's components maps.
 */

import { useId } from 'react';
import type { ReactNode } from 'react';
import { AccordionsContext } from './accordions-context.js';
import styles from './Accordions.module.css';

interface AccordionsProps {
  type?: 'single' | 'multiple';
  children?: ReactNode;
}

export function Accordions({ type = 'single', children }: AccordionsProps) {
  const name = useId();

  return (
    <div className={styles.accordions}>
      <AccordionsContext.Provider value={{ name, type }}>
        {children}
      </AccordionsContext.Provider>
    </div>
  );
}

export default Accordions;
