---
type: refactor
status: draft
---

# 001: Restructure `src/` by runtime context

## User story / objective
As a mordoc contributor, I want `src/` organised by role, with no ambiguous folder names, so that I can see at a glance where code belongs and what it may depend on.

### Problems this solves
1. **Clashing names:** `src/content/` (parser) vs `src/app/content/` (components); `src/api/` vs `src/app/api/`.
2. **No visible split** between Node.js build code, Vite tooling and browser code.
3. **One 518-line file** (`markdoc-config.ts`) holds all 15 tags and 4 nodes.
4. **Mixed components** in `app/content/`: tag components, page layouts and page frame.
5. **Catch-all `utils/`**, and a browser type (`Scene`) living in parser code.

## Scope
**In scope:**
- Move files to the target structure (see *Additional information*).
- Split `markdoc-config.ts` into one file per tag and per node.
- Remove `src/utils/`; move `CONDITIONAL_BADGE` to `core/openapi/badges.ts`; rename `app/api/` to `app/openapi/`.
- Update imports, comments, `bin/cli.js`, `src/app/tsconfig.json`, and `paths.ts` (one folder deeper: `'../../..'` → `'../../../..'`).
- Build script clears `dist/` before compiling.

**Out of scope:** any behaviour change; tests and CI (separate change, needed first); performance; Markdoc validation; navigation; the theme path issue; anything outside `src/`.

## Functional requirements
- **FR-001:** `src/` contains only `core/`, `cli/`, `app/` and `types/`, laid out as in the target structure. No old folders or files remain.
- **FR-002:** Allowed imports between folders: `cli/` → `core/`, and any folder → `types/` (`app/`: type imports only). No others.
- **FR-003:** `types/` contains type declarations only, no runtime code.
- **FR-004:** `createDefaultMarkdocConfig()` returns the same 4 nodes and 15 tags as before.
- **FR-005:** `mordoc dev` and `mordoc build` keep the same commands, flags and output.
- **FR-006:** The published package (`dist/`, `bin/`, `src/app/`) contains no old-layout files.

## Non-functional requirements
- **NFR-001:** No behaviour change: same output files and same HTML, ignoring generated hashes.
- **NFR-002:** Git history is kept (`git mv`).
- **NFR-003:** Build time stays within ±10%.

## Acceptance criteria
- **AC-001:** `tsc` and `tsc -p src/app/tsconfig.json` pass.
- **AC-002:** mordoc-docs built before and after the change gives the same file list and HTML (normalised).
- **AC-003:** `mordoc dev` on mordoc-docs renders pages, and edits to a `.md` file and `sidenav.yaml` appear without a restart.
- **AC-004:** `src/` and `dist/` contain only the new layout (including `dist/cli/dev/index.js` and `dist/cli/build/index.js`).
- **AC-005:** An import check finds only the allowed directions (FR-002), and no runtime exports in `types/`.
- **AC-006:** `git log --follow` on a moved file shows its history from before the move.

## Open questions / assumptions
- **Q1:** Confirm the names `core/content/` and `app/components/`. (`markdoc/` was rejected: it suggests Stripe's code.)
- **Q2:** Agree with the maintainer before starting; this conflicts with open PRs that touch `src/`.
- **Assumption:** Only the `mordoc` binary is public; nobody imports from `mordoc/dist/...`.
- **Assumption:** Themes use CSS variables, not CSS-module class names (those hashes change when files move).

## Additional information
### Target structure

| Folder | Role | May import from |
|---|---|---|
| `core/` | Builds `MordocData` from the docs project. Node.js only. | `types/` |
| `cli/` | The commands: run `core/`, Vite and the build steps, write `dist/`. | `core/`, `types/` |
| `app/` | Displays `MordocData` in the browser. | `types/` (types only) |
| `types/` | The contract: types of `MordocData`. No code. | — |

- A feature with a build part and a display part (OpenAPI, diagrams) has a folder in both `core/` and `app/`, with matching names.
- No `shared/` or `utils/` folders. A helper lives next to its only user; once shared, it moves to the lowest layer that uses it.
- In `cli/`: one folder per command; code shared by commands lives in `cli/vite/`.

`←` marks where a file comes from.

```
src/
├── core/                               ── A. BUILDS MordocData FROM THE DOCS PROJECT (Node.js only, no Vite/React)
│   ├── pipeline.ts                     ← src/pipeline.ts
│   ├── reporter.ts                     ← utils/reporter.ts: progress output, used by core/ and cli/
│   ├── config/                         ← src/config/ (contents unchanged)
│   │   ├── assets-loader.ts
│   │   ├── footer-loader.ts
│   │   ├── header-loader.ts
│   │   ├── language-loader.ts
│   │   ├── sidenav-loader.ts
│   │   ├── site-loader.ts
│   │   ├── topnav-loader.ts
│   │   ├── translations-loader.ts
│   │   └── variables-loader.ts
│   ├── content/                        ← src/content/: Markdown pages → renderable trees
│   │   ├── diagrams/                   ← src/diagrams/: only called by nodes/fence.ts
│   │   │   ├── build-scene.ts
│   │   │   ├── generic/
│   │   │   │   └── diagram-definition.ts   (scene.ts moves to types/)
│   │   │   └── sequence-diagram/
│   │   │       ├── index.ts
│   │   │       ├── layout.ts
│   │   │       ├── parser.ts
│   │   │       └── theme.ts
│   │   ├── loader.ts                   ← content-loader.ts
│   │   ├── parse.ts                    ← content-parser.ts
│   │   ├── transform.ts                ← content-transformer.ts
│   │   ├── slug.ts
│   │   └── schema/                     ← split from markdoc-config.ts
│   │       ├── index.ts                createDefaultMarkdocConfig()
│   │       ├── nodes/                  overrides of standard Markdown syntax
│   │       │   ├── index.ts
│   │       │   ├── fence.ts
│   │       │   ├── heading.ts          (incl. extractText helper, only used here)
│   │       │   ├── image.ts
│   │       │   └── link.ts
│   │       └── tags/                   mordoc's {% %} tags
│   │           ├── index.ts
│   │           ├── accordion.ts
│   │           ├── accordions.ts
│   │           ├── button.ts
│   │           ├── callout.ts
│   │           ├── card.ts
│   │           ├── card-grid.ts
│   │           ├── clip.ts
│   │           ├── column.ts
│   │           ├── columns.ts
│   │           ├── hero.ts
│   │           ├── image.ts
│   │           ├── link.ts
│   │           ├── params.ts           (only used in API enrichment files, not by content authors)
│   │           ├── section.ts
│   │           └── video-embed.ts
│   └── openapi/                        ← src/api/: separate page source (config/api.yaml + spec)
│       ├── index.ts
│       ├── badges.ts                   ← CONDITIONAL_BADGE from types/api.ts (only used in openapi/)
│       ├── build-operation-views.ts
│       ├── curl-sample.ts
│       ├── diagnostics.ts
│       ├── enrichment-loader.ts
│       ├── enrichment-parser.ts
│       ├── examples.ts
│       ├── nav-check.ts
│       ├── registry-loader.ts
│       ├── schema-walk.ts
│       ├── slug.ts
│       └── spec-loader.ts
│
├── cli/                                ── B. THE MORDOC COMMANDS: build the website (Node.js + Vite)
│   │                                   bin/cli.js is only the entry point; it calls cli/<command>/index.ts.
│   ├── vite/                           shared by dev and build
│   │   ├── plugin.ts                   ← vite/plugin.ts
│   │   └── paths.ts                    ← utils/paths.ts (one level deeper: root path '../../..' → '../../../..')
│   ├── dev/                            mordoc dev
│   │   └── index.ts                    ← cli/dev.ts
│   └── build/                          mordoc build, and the steps only it uses
│       ├── index.ts                    ← cli/build.ts
│       ├── asset-rewrite.ts            ← cli/asset-rewrite.ts: copies config/assets → dist/_assets
│       ├── lang-utils.ts               ← utils/lang-utils.ts: only used by ssg-runner.ts
│       ├── pagefind-indexer.ts         ← cli/pagefind-indexer.ts: search index from the HTML
│       └── ssg-runner.ts               ← cli/ssg-runner.ts: renders every route to HTML
│
├── types/                              ── C. THE CONTRACT: types of MordocData, used by core, cli and app (types only)
│   ├── api.ts                          (CONDITIONAL_BADGE moves to core/openapi/badges.ts)
│   ├── assets.ts
│   ├── content.ts
│   ├── fonts.ts
│   ├── language.ts
│   ├── navigation.ts
│   ├── pipeline.ts
│   ├── scene.ts                        ← diagrams/generic/scene.ts
│   └── site.ts
│
└── app/                                ── D. THE WEBSITE (browser, shipped as source)
    ├── index.html
    ├── index.css
    ├── main.tsx
    ├── entry-server.tsx
    ├── App.tsx
    ├── App.module.css
    ├── routes.tsx
    ├── data-context.tsx
    ├── lang-utils.ts
    ├── path-utils.ts
    ├── globals.d.ts
    ├── virtual-modules.d.ts
    ├── vite-env.d.ts
    ├── tsconfig.json                   (include: ../types only)
    ├── assets/
    │   └── fonts/
    │       ├── InterVariable.woff2
    │       └── InterVariable-Italic.woff2
    ├── components/                     ← app/content/: what tags and nodes render to
    │   ├── Content.tsx                 ← content/Content.tsx
    │   ├── Content.module.css
    │   ├── Typography.module.css
    │   ├── component-map.ts
    │   ├── accordion/
    │   │   ├── Accordion.tsx
    │   │   ├── Accordion.module.css
    │   │   ├── Accordions.tsx
    │   │   ├── Accordions.module.css
    │   │   └── accordions-context.ts
    │   ├── button/                     ← content/landing/button/
    │   │   ├── Button.tsx
    │   │   └── Button.module.css
    │   ├── callout/
    │   │   ├── Callout.tsx
    │   │   └── Callout.module.css
    │   ├── card/
    │   │   ├── Card.tsx
    │   │   ├── Card.module.css
    │   │   ├── CardGrid.tsx
    │   │   └── CardGrid.module.css
    │   ├── clip/
    │   │   ├── Clip.tsx
    │   │   └── Clip.module.css
    │   ├── code-block/                 (fence node)
    │   │   ├── CodeBlock.tsx
    │   │   └── CodeBlock.module.css
    │   ├── columns/
    │   │   ├── Column.tsx
    │   │   ├── Column.module.css
    │   │   ├── Columns.tsx
    │   │   └── Columns.module.css
    │   ├── diagram/
    │   │   ├── Diagram.tsx
    │   │   ├── Diagram.module.css
    │   │   └── SceneSvg.tsx
    │   ├── heading/                    (heading node)
    │   │   ├── Heading.tsx
    │   │   └── Heading.module.css
    │   ├── hero/                       ← content/landing/hero/
    │   │   ├── Hero.tsx
    │   │   └── Hero.module.css
    │   ├── image/
    │   │   ├── Image.tsx
    │   │   └── Image.module.css
    │   ├── link/
    │   │   └── ContentLink.tsx
    │   ├── section/                    ← content/landing/section/
    │   │   ├── Section.tsx
    │   │   └── Section.module.css
    │   └── video-embed/
    │       ├── VideoEmbed.tsx
    │       ├── VideoEmbed.module.css
    │       └── providers.ts
    ├── layout/                         page frame
    │   ├── breadcrumb/                 ← app/breadcrumb/
    │   │   ├── Breadcrumb.tsx
    │   │   ├── Breadcrumb.module.css
    │   │   └── useBreadcrumb.ts
    │   ├── footer/                     ← content/footer/
    │   │   ├── Footer.tsx
    │   │   └── Footer.module.css
    │   ├── header/                     ← app/header/
    │   │   ├── Header.tsx
    │   │   ├── Header.module.css
    │   │   ├── HeaderLinks.tsx
    │   │   ├── HeaderLinks.module.css
    │   │   ├── LanguagePicker.tsx
    │   │   ├── LanguagePicker.module.css
    │   │   ├── SearchBar.tsx
    │   │   ├── SearchBar.module.css
    │   │   ├── SearchModal.tsx
    │   │   ├── SearchModal.module.css
    │   │   ├── ThemeToggle.tsx
    │   │   ├── ThemeToggle.module.css
    │   │   ├── Topnav.tsx
    │   │   ├── Topnav.module.css
    │   │   └── useTheme.ts
    │   ├── sidenav/                    ← app/sidenav/
    │   │   ├── Sidenav.tsx
    │   │   └── Sidenav.module.css
    │   └── toc/                        ← content/toc/
    │       ├── Toc.tsx
    │       └── Toc.module.css
    ├── pages/                          ← from app/content/
    │   ├── article/
    │   │   ├── ArticlePage.tsx
    │   │   └── ArticlePage.module.css
    │   ├── landing/
    │   │   ├── LandingPage.tsx
    │   │   └── LandingPage.module.css
    │   ├── not-found/
    │   │   ├── NotFound.tsx
    │   │   └── NotFound.module.css
    │   ├── route-error/
    │   │   ├── RouteError.tsx
    │   │   └── RouteError.module.css
    │   └── skeleton/
    │       ├── Skeleton.tsx
    │       └── Skeleton.module.css
    ├── openapi/                        ← app/api/: displays the pages built by core/openapi/
    │   ├── Endpoint.tsx
    │   ├── Endpoint.module.css
    │   ├── ExamplePanel.tsx
    │   ├── ExamplePanel.module.css
    │   ├── FieldTree.tsx
    │   ├── FieldTree.module.css
    │   ├── Operation.tsx
    │   └── Operation.module.css
    └── i18n/                           (unchanged)
        ├── format.ts
        ├── types.ts
        ├── useUiStrings.ts
        └── locales/
            ├── index.ts
            └── ar, de, en, es, fr, hi, it, ja, ko, nl, pt, ru, zh (.ts)
```

How one tag lines up after the change:

| | Location | Example |
|---|---|---|
| Schema (what authors may write) | `core/content/schema/tags/` | `callout.ts` |
| Component (what the browser shows) | `app/components/` | `callout/Callout.tsx` |
| Link between them | `app/components/component-map.ts` | `Callout` |

## Approval
- **Reviewed by:** pending
- **Approved on:** pending
