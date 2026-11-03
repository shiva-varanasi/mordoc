# QA Plan: <Change ID> — <Change Name>

**Status:** Draft  
**Specification:** [spec.md](spec.md)  
**Technical plan:** [plan.md](plan.md)

## 1. Test Objectives

Describe what must be demonstrated before the change is considered complete. Focus on observable behavior, regressions, and important failure scenarios.

## 2. Test Strategy

- **Unit tests:** <Components, functions, and rules to test in isolation>
- **Integration tests:** <Interactions, interfaces, or data flows to verify>
- **End-to-end tests (if applicable):** <User journeys to exercise>
- **Regression tests:** <Existing behavior that must remain unchanged>

Use the lowest practical test level that provides confidence. Avoid duplicating the same scenario unnecessarily.

## 3. Test Cases

### TC-001: <Descriptive test name>

- **Requirements:** FR-001, AC-001
- **Level:** Unit / Integration / End-to-end
- **Preconditions:** <Required setup or state>
- **Input / Action:** <What is supplied or performed>
- **Expected result:** <Observable, testable outcome>
- **Automation:** Automated / Manual
- **Test location:** <Path to test file, once implemented>

### TC-002: <Error or boundary scenario>

- **Requirements:** FR-002, AC-002
- **Level:** Unit / Integration / End-to-end
- **Preconditions:** <Required setup or state>
- **Input / Action:** <Invalid input, failure, or edge case>
- **Expected result:** <Expected error handling and unchanged behavior>
- **Automation:** Automated / Manual
- **Test location:** <Path to test file, once implemented>

## 4. Non-Functional Verification

Document only applicable checks. Reference the corresponding NFR identifiers and measurable acceptance thresholds from `spec.md`.

| Requirement | Verification method | Pass criteria |
|---|---|---|
| NFR-001 | <Test, measurement, or inspection> | <Measurable threshold or observable condition> |

## 5. Regression and Compatibility

- <Existing functionality that must continue to work>
- <Supported environments or versions to check, if relevant>
- <Existing test suites to run>

## 6. Test Data and Environment

- **Test data / fixtures:** <Required inputs and fixtures>
- **Environment:** <Local, CI, staging, or other>
- **Dependencies / mocks:** <External services or substitutes>
- **Commands:** `<Commands to execute relevant tests>`

## 7. Completion Criteria

- [ ] Each applicable acceptance criterion has verification coverage.
- [ ] Required automated tests have been implemented.
- [ ] Relevant unit and integration tests pass.
- [ ] Regression tests pass.
- [ ] Applicable non-functional requirements have been verified.
- [ ] Known failures and deviations are documented.
- [ ] No unresolved blocking defects remain.

## 8. Execution Results

*Complete this section after implementation. Do not mark tests as passed unless they were actually executed.*

| Test / check | Result | Evidence / notes |
|---|---|---|
| TC-001 | Not run | |
| TC-002 | Not run | |
| NFR-001 | Not run | |
| Regression suite | Not run | |

**Executed by:** <Name or agent>  
**Date:** <YYYY-MM-DD>  
**Commit / revision:** <Git SHA, if applicable>

## 9. Outstanding Issues and Deviations

- <Unresolved defects, skipped tests, limitations, or approved deviations; write "None" if applicable>

## 10. Review

**QA plan:** Draft / Approved  
**Verification outcome:** Pending / Accepted / Rejected  
**Reviewed by:** <Reviewer>  
**Date:** <YYYY-MM-DD>
