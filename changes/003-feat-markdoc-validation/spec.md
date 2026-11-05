# 003: Validate Markdoc content

## Description
As a docs author, I want `mordoc build` and `mordoc dev` to report unknown tags, unknown or invalid attributes, and wrong nesting, with file and line number, so that mistakes in my content are caught instead of silently ignored.

`Markdoc.validate()` is never called today. Markdoc already knows each tag's allowed attributes, types and `matches` values from the schema, so most of the checking comes for free.

## Acceptance Criteria
- TBD

## Functional Requirements
- TBD

## Non-Functional Requirements
- TBD

## Risks
- TBD

## Open Issues
- Should errors fail the build or only warn, and should `dev` and `build` behave differently?
- Should API enrichment files be validated too?

## Approval
- **Reviewed by:** pending
- **Approved on:** pending
