# 004: Load content components per page

## Description
As a site reader, I want each page to load only the components it actually uses, so that adding more tags and fence types doesn't make every page heavier.

Both component maps (`app/content/component-map.ts` and the inline map in `LandingPage.tsx`) import every component, so all of them are in the main bundle (612 KB / 193 KB gzip at 134 pages, measured 2026-11; it grows with every new tag). Heavy, rarely used components (diagram, video embed, the OpenAPI pages in `app/openapi/` after [001](../001-refactor-src-structure/spec.md)) are the first candidates for splitting out.

Out of scope: keeping the Markdoc parser itself out of the browser bundle, which is related but separate.

## Acceptance Criteria
- TBD

## Functional Requirements
- TBD

## Non-Functional Requirements
- TBD

## Risks
- TBD

## Open Issues
- TBD

## Approval
- **Reviewed by:** pending
- **Approved on:** pending
