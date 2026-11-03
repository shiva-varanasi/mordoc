---
type: feat
status: draft
---

# 003: Validate Markdoc content

## User story / objective
As a docs author, I want `mordoc build` and `mordoc dev` to report unknown tags, unknown or invalid attributes, and wrong nesting, with file and line number, so that mistakes in my content are caught instead of silently ignored.

`Markdoc.validate()` is never called today. Markdoc already knows each tag's allowed attributes, types and `matches` values from the schema, so most of the checking comes for free.

To decide: whether errors fail the build or only warn (and whether `dev` and `build` behave differently), and whether API enrichment files are validated too.

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
