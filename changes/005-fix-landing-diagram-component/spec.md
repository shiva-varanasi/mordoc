---
type: fix
status: draft
---

# 005: Diagrams on landing pages

## User story / objective
As a docs author, I want a diagram (```` ```sequence-diagram ````) on a landing page to render like it does on an article page.

The inline component map in `app/content/landing/LandingPage.tsx:55` lists every content component except `Diagram`, while the fence node always produces a `Diagram` tag. A diagram on a landing page most likely renders as an empty, unknown `<Diagram>` element. Not yet reproduced: verify first with a landing page containing a diagram.

Likely fix: add `Diagram` to that map (or build the landing map from the shared `component-map.ts` plus `Hero` and `Section`). Independent of [001](../001-refactor-src-structure/spec.md); can be done before it. [002](../002-feat-check-tag-component-map/spec.md) would prevent this class of bug.

## Scope
**In scope:**
- TBD

**Out of scope:**
- TBD

## Functional requirements
- TBD

## Non-functional requirements
- TBD

## Acceptance criteria
- TBD

## Open questions / assumptions
- TBD

## Additional information
- None

## Approval
- **Reviewed by:** pending
- **Approved on:** pending
