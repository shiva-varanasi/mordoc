# 005: Diagrams on landing pages

## Description
As a docs author, I want a diagram (```` ```sequence-diagram ````) on a landing page to render like it does on an article page.

Today a `sequence-diagram` on a `layout: landing` page fails the whole `mordoc build` with `Element type is invalid: expected a string ... but got: undefined`. The same site builds without the diagram. This was seen in a manual build of a small throwaway site on 2026-11-04, on Node 22, using the existing `dist/`.

The likely cause is that the inline component map in `app/content/landing/LandingPage.tsx:55` lists every content component except `Diagram`, while the fence node always produces a `Diagram` tag. This is inferred from the code and hasn't been confirmed with a fix.

Likely fix: add `Diagram` to that map (or build the landing map from the shared `component-map.ts` plus `Hero` and `Section`). Independent of [001](../001-refactor-src-structure/spec.md); can be done before it. [002](../002-feat-check-tag-component-map/spec.md) would prevent this class of bug.

## Acceptance Criteria
- TBD

## Functional Requirements
- TBD

## Non-Functional Requirements
- TBD

## Risks
- TBD

## Open Issues
- Repeat the failing build after a fresh `npm run build`, to confirm it wasn't caused by a stale `dist/`.
- Should this change add a landing page diagram to the sample website? See Q1 in [006](../006-test-e2e-foundation/spec.md).

## Approval
- **Reviewed by:** pending
- **Approved on:** pending
