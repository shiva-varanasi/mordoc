# 006: Browser tests and sample website

## Description
As a mordoc contributor, I want a sample website that uses every feature, and browser tests that build it and check the result, so that I can change `src/` step by step and know the generated site still works.

Mordoc has no tests today. This change is the safety net for [001](../001-refactor-src-structure/spec.md), which is why it comes first.

This change adds:
- A sample website in `e2e/site/`, built with the local `mordoc` CLI. It is separate from `mordoc-docs`, because that is another repo that changes on its own schedule. AC-002 of 001 still uses `mordoc-docs`.
- Playwright browser tests in Chromium against the production build.
- A short smoke test against `mordoc dev`.
- A coverage check that fails when a tag or node is missing from the sample website.
- `npm test` as the single command to run the tests locally.

`e2e/` is used because `.gitignore` already ignores `test-project*/`, so that name can't hold a tracked sample website. The `dist/` and `node_modules/` rules already cover the sample website's build output.

Out of scope:
- Unit tests and Vitest (`007`).
- GitHub Actions (`008`) and automated releases (`009`).
- Any change to `src/` or `bin/`, including fixing bugs these tests find.
- Screenshot comparison, Docker, and browsers other than Chromium.
- Narrow (mobile) layouts.
- Build failure cases, such as an invalid diagram or a bad OpenAPI file.
- Custom themes, fonts and `custom-head.html`.
- Direct visits to an unknown URL: `mordoc build` generates no `404.html`, so what a reader sees depends on the host. FR-006 only covers client-side navigation.

## Acceptance Criteria
- **AC-001:** Given a fresh clone with dependencies and Chromium installed, when `npm test` runs, then all tests pass and it exits 0.
- **AC-002:** Given a component is removed from `contentComponents`, when `npm test` runs, then it fails and names the affected tag or page. (Checked once by hand, then reverted.)
- **AC-003:** Given a page with a broken React component that throws in the browser, when `npm test` runs, then the no-errors test fails for that route. (Checked once by hand, then reverted.)
- **AC-004:** Given a tag's only usage is removed from the sample website, when `npm test` runs, then the coverage check fails and names that tag.
- **AC-005:** Given a new page is added to the sample website, when `npm test` runs, then the no-errors test includes it with no test changes.
- **AC-006:** Given port 5173 is already in use, when `npm test` runs, then it fails with a clear message instead of testing the wrong server.
- **AC-007:** When `npm pack --dry-run` runs, then the output contains no `e2e/` files.
- **AC-008:** After the change, `git diff main -- src bin` is empty.

## Functional Requirements
- **FR-001:** `e2e/site/` is a valid Mordoc project with its own config, built by running the repo's `bin/cli.js`. It is not included in the published npm package.
- **FR-002:** The sample website uses:
  - **Tags:** `callout` (all 4 types), `card`, `cardGrid`, `hero`, `section`, `button`, `link`, `image`, `clip`, `videoEmbed`, `accordion`, `accordions`, `column`, `columns`, `params`.
  - **Nodes:** `heading`, `link`, `fence` (a code block and a `sequence-diagram`), `image`.
  - **Pages and site features:** a landing page, article pages, API reference pages from an OpenAPI file with enrichment, a sidenav, and two languages (`en`, `de`).
- **FR-003:** `npm test` compiles mordoc, builds the sample website, serves it, runs all tests, and exits non-zero if anything fails.
- **FR-004:** Every route in the built site loads with no console errors, uncaught page errors, hydration errors, or failed same-origin requests. The route list comes from the build output, so a new page is covered automatically.
- **FR-005:** Each tag and node from FR-002 (except `params`, see FR-007) renders as its real component with its authored content, and no page shows raw `{% %}` syntax.
- **FR-006:** These interactions work in the production build:
  - An accordion opens and closes, and opening one in an `accordions` group closes the others.
  - The theme toggle switches theme, and the choice survives a reload.
  - The language picker moves to the same page in the other language.
  - Search finds a known page, in both languages.
  - A sidenav or content link navigates without a full page reload.
  - A table of contents link goes to its heading.
  - The code block copy button copies the code.
  - An image opens in the lightbox, and a clip plays and pauses on click.
  - An unknown route reached by client-side navigation shows the not found page.
- **FR-007:** Generated output is correct:
  - The sequence diagram shows its actors and messages as an SVG.
  - An API operation page shows its method, path, parameters, request body, responses, enrichment text (`params`) and curl sample.
- **FR-008:** A coverage check compares the tags and nodes registered in `createDefaultMarkdocConfig()` with what the sample website uses, and fails naming anything unused, including a `sequence-diagram` fence.
- **FR-009:** A smoke test starts `mordoc dev` on the sample website and checks that a landing page, an article page and an API page render with no console or page errors.

## Non-Functional Requirements
- **NFR-001:** The tests make no external network requests. `videoEmbed` is checked through its iframe `src`.
- **NFR-002:** A full `npm test` takes under 2 minutes locally, once Chromium is installed.
- **NFR-003:** The tests are stable: 3 consecutive full runs pass with retries turned off.
- **NFR-004:** Tests find elements by role, label or text, not by generated CSS module class names, so moving files in 001 doesn't break them.
- **NFR-005:** `@playwright/test` is the only new dependency, as a dev dependency.

## Risks
- The approach is mostly unproven. A manual build on 2026-11-04 (Node 22, existing `dist/`, a tiny throwaway site) only showed that the local CLI can build a project outside the repo. Playwright, serving the site in a browser, search results, `mordoc dev`, API pages, two languages and most tags are untried.
- The components may lack the roles or text needed to find them. Adding a test hook would change `src/`, so stop and ask if that happens.
- The tests only protect what the sample website covers. The coverage check handles this for tags and nodes, but not for interactions or page types.

## Open Issues
- **Q1:** A diagram on a landing page currently fails the whole build (see [005](../005-fix-landing-diagram-component/spec.md)), so the sample website can't include one yet. Proposal: leave it out here, and have 005 add it to the sample website together with the fix.
- **Q2:** `engines` requires Node `>=24.18.1`, but this machine runs v22.19.0. Should `npm test` be verified on 24?
- **Q3:** Confirm `e2e/` as the location.
- **To confirm during the plan:** `sidenav.yaml` must list the API operations, and any generated routes appear in `sitemap.xml`.

## Approval
- **Reviewed by:** pending
- **Approved on:** pending
