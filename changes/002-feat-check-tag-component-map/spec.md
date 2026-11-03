---
type: feat
status: draft
---

# 002: Check tag schemas against the component map

## User story / objective
As a mordoc contributor, I want `tsc` to fail when a component name used by the Markdoc schema has no matching component (or a component map lists a name nobody uses), so that a typo or a forgotten registration is caught while developing instead of silently rendering nothing.

Today the link between a schema and its React component is only a string, in two forms: `render: 'Callout'` in tag and node schemas, and names created in code (`new Markdoc.Tag('Diagram')` in the fence node, `'Heading'`, `'ContentLink'`). There are also two component maps: `app/content/component-map.ts` (articles and OpenAPI pages) and an inline map in `app/content/landing/LandingPage.tsx`. They have already drifted (see [005](../005-fix-landing-diagram-component/spec.md)).

Approach: a `ComponentName` union type in `types/` (types only, so it fits [001](../001-refactor-src-structure/spec.md)'s rules); schema `render` values, `new Markdoc.Tag(...)` calls and both component maps are typed against it. A check inside `core/` isn't possible, because `core/` may not import from `app/`.

Easier after 001, but doesn't strictly depend on it.

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
