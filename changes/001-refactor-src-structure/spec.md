# 001: Restructure `src/` by runtime context

## Description
As a mordoc contributor, I want `src/` organised by role, with no ambiguous folder names, so that I can see at a glance where code belongs and what it may depend on.

This solves five problems:
1. **Clashing names:** `src/content/` (parser) vs `src/app/content/` (components); `src/api/` vs `src/app/api/`.
2. **No visible split** between Node.js build code, Vite tooling and browser code.
3. **One 518-line file** (`markdoc-config.ts`) holds all 15 tags and 4 nodes.
4. **Mixed components** in `app/content/`: tag components, page layouts and page frame.
5. **Catch-all `utils/`**, and a browser type (`Scene`) living in parser code.

This change:
- Moves files to the target structure in [plan.md](./plan.md).
- Splits `markdoc-config.ts` into one file per tag and per node.
- Removes `src/utils/`, moves `CONDITIONAL_BADGE` to `core/openapi/badges.ts`, and renames `app/api/` to `app/openapi/`.
- Updates imports, comments, `bin/cli.js`, `src/app/tsconfig.json` and `paths.ts`.
- Makes the build script clear `dist/` before compiling.

Out of scope: any behaviour change; tests and CI ([006](../006-test-e2e-foundation/spec.md) and `008`, needed first); performance; Markdoc validation; navigation; the theme path issue; anything outside `src/`.

## Acceptance Criteria
- **AC-001:** `tsc` and `tsc -p src/app/tsconfig.json` pass.
- **AC-002:** mordoc-docs built before and after the change gives the same file list and HTML (normalised).
- **AC-003:** `mordoc dev` on mordoc-docs renders pages, and edits to a `.md` file and `sidenav.yaml` appear without a restart.
- **AC-004:** `src/` and `dist/` contain only the new layout (including `dist/cli/dev/index.js` and `dist/cli/build/index.js`).
- **AC-005:** An import check finds only the allowed directions (FR-002), and no runtime exports in `types/`.
- **AC-006:** `git log --follow` on a moved file shows its history from before the move.

## Functional Requirements
- **FR-001:** `src/` contains only `core/`, `cli/`, `app/` and `types/`, laid out as in the target structure. No old folders or files remain.
- **FR-002:** Allowed imports between folders: `cli/` → `core/`, and any folder → `types/` (`app/`: type imports only). No others.
- **FR-003:** `types/` contains type declarations only, no runtime code.
- **FR-004:** `createDefaultMarkdocConfig()` returns the same 4 nodes and 15 tags as before.
- **FR-005:** `mordoc dev` and `mordoc build` keep the same commands, flags and output.
- **FR-006:** The published package (`dist/`, `bin/`, `src/app/`) contains no old-layout files.

## Non-Functional Requirements
- **NFR-001:** No behaviour change: same output files and same HTML, ignoring generated hashes.
- **NFR-002:** Git history is kept (`git mv`).
- **NFR-003:** Build time stays within ±10%.

## Risks
- This conflicts with open PRs that touch `src/`.
- Assumes only the `mordoc` binary is public, and nobody imports from `mordoc/dist/...`.
- Assumes themes use CSS variables, not CSS-module class names, because those hashes change when files move.

## Open Issues
- **Q1:** Confirm the names `core/content/` and `app/components/`. (`markdoc/` was rejected: it suggests Stripe's code.)
- **Q2:** Agree with the maintainer before starting.

## Approval
- **Reviewed by:** pending
- **Approved on:** pending
