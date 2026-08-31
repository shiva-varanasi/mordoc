/**
 * Context bridging `Accordions` (group wrapper) to the `Accordion`s nested
 * inside it. `Accordion` works standalone with no provider present — this
 * context is only consulted to pick up group coordination when one exists.
 *
 * `name` becomes the native `<details name="...">` attribute, which is what
 * makes the group's exclusive-open behavior work with zero JS: browsers
 * close every other `<details>` sharing a `name` when one opens. `Accordions`
 * generates it once via `useId()` so multiple groups on the same page never
 * collide.
 */

import { createContext } from 'react';

export interface AccordionsGroupContext {
  name: string;
}

export const AccordionsContext = createContext<AccordionsGroupContext | null>(null);
