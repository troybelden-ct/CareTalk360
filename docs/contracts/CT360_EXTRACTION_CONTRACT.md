# CT360_EXTRACTION_CONTRACT.md
**Version:** v1.0
**Status:** APPROVED
**Scope:** Recurring as-built extraction of the CareTalk360 design app (initially the Lovable export) into versioned design-lock markdown files.
**Owner:** Troy | **Executor:** Claude Code

---

## 1. Purpose

CareTalk360 follows a **build → test → lock → extract → PRD** loop: Claude Code adds or modifies screens in the design app, Troy click-tests locally, and once a module is approved the codebase is tagged and this extraction runs against the tag. Extraction converts the app's UI code into a uniform, machine-consumable set of `as-built` markdown documents — the **screen-design input** to PRD generation. Extraction documents **what exists at the tag** — it makes no design decisions and proposes no improvements; design changes happen in code, in the prior loop step.

**Prime directive:** One page = one file, one fixed schema, no freeform commentary. If something is ambiguous, it goes in `Open Questions`, never in prose guesses.

---

## 2. Inputs

| Input | Location |
|---|---|
| Design app | `~/Desktop/CTH/Code/CareTalk360/app/` (initially the Lovable export; evolves via Claude Code) |
| Design-lock tag | `design-lock/<module>-v<N>` git tag — extraction always runs against a tag, never loose HEAD |
| This contract | `docs/contracts/CT360_EXTRACTION_CONTRACT.md` |

Known codebase facts (verified 2026-06-10):
- Vite + React 18 + TypeScript + Tailwind + shadcn/ui
- 20 routes in `src/App.tsx`, ~10.7K lines TS/TSX
- 100% front-end: **no API client, no auth, no persistence — all mock data**
- 23 domain components (`appointments/`, `forms/`, `layout/`) + standard shadcn `ui/` kit (do NOT extract `ui/` primitives)

## 3. Outputs

```
docs/
  as-built/
    pages/        PAGE_<RouteName>.md        (one per route, 20 files)
    components/   COMP_<ComponentName>.md    (domain components only, ~23 files)
    flows/        FLOW_<Name>.md             (cross-page user flows, discovered during pass)
    _INDEX.md                                (master index: every file, status, route map)
```

## 4. Required schema — PAGE files

Every `PAGE_*.md` must contain **exactly** these sections, in this order:

```markdown
# PAGE_<RouteName>
**Route:** /path | **Source:** src/pages/X.tsx | **Status:** AS-BUILT | **Version:** v0.1
**Extracted:** <date> | **Implied role(s):** <Doctor|Nurse|CareNav|Supervisor|Admin|All|Unknown>

## Purpose
1–3 sentences. What this page is for, stated from the UI evidence only.

## UI Inventory
Table: Element | Type (table/form/modal/chart/tab/button) | Behavior observed in code | Component file

## States
Loading / empty / error / populated states present in code. Note "not implemented" explicitly.

## Navigation
Entry points (what links here) and exit points (what this links to). Modal launches count.

## Implied Data Entities
Table: Entity | Fields visible in UI/mock data | Mock source (file:line) | Probable CTH source-of-truth (best guess, flagged as guess)

## Implied Business Rules
Only rules *enforceable from the code* (validation in zod schemas, conditional rendering, disabled states). Cite file:line.

## Gaps vs. Production Reality
What this page would need that the prototype lacks (auth, real data, audit, error handling). Bullet list, no solutions.

## Open Questions
Numbered. Anything ambiguous. These feed the TO-BE decision log — never resolve them inline.
```

## 5. Required schema — COMP files

Same header block, then: **Purpose / Props & Inputs / UI Inventory / Validation & Rules (zod, cite lines) / Implied Data Entities / Used By (pages) / Open Questions**.

## 6. Extraction rules

1. **AS-BUILT only.** Never write what the page *should* do. "Should" belongs in TO-BE docs (separate phase, Troy-owned).
2. **Cite everything.** Every entity, rule, and behavior claim carries `file:line`.
3. **No `ui/` primitives.** shadcn components are infrastructure, not design.
4. **Mock data is evidence, not truth.** Record mock field names verbatim; CTH source-of-truth mapping is a flagged guess for later validation against the real schema.
5. **Forms are the crown jewels.** The clinical form suite (HRA, HPI/ROS/Exam/Assessment/Plan, PHQ-2/9, vitals modals, med/diagnosis review) gets the most careful entity and validation extraction — these map directly to the formData/FormDefinitions world.
6. **One commit per extraction pass.** Commit message: `extract(as-built): full pass at design-lock/baseline-v1` or `extract(as-built): incremental pass at design-lock/<module>-v<N>`. The git tag pins the snapshot; per-file commits are unnecessary overhead.
7. **No schema drift.** If the schema doesn't fit a page, flag it in Open Questions and follow the schema anyway. Contract changes go through Troy, version-bumped here.

## 7. Modes & pass order

**Full pass (first run only)** — baseline extraction of the inherited Lovable code:

1. `_INDEX.md` skeleton from `App.tsx` route table (15 min, gives the checklist)
2. Layout components (Header, Sidebar, MainLayout) — establishes nav model
3. Role dashboards (Doctor/Nurse/CareNav/Supervisor + Dashboard + Index)
4. Clinical form suite (all `forms/` components + Forms, FormSetup pages)
5. Appointments components + appointment pages
6. Admin (UserList/UserTypes/Create/Edit, CreatePatient, SearchPatient, AppointmentTypes)
7. Detail pages (AppointmentDetails, ProviderDetails, StateDetails) + NotFound
8. FLOW docs last — only flows actually wired in the code
9. Final `_INDEX.md` completion + summary of all Open Questions in one rollup section

**Incremental pass (every run after)** — the steady-state loop mode:

1. `git diff --name-only <previous design-lock tag>..<new tag>` → list of changed files
2. Re-extract only the PAGE/COMP/FLOW docs whose source files changed; version-bump each (v0.1 → v0.2 …)
3. New pages/components get new docs with new `SCR-` IDs in `_INDEX.md`
4. Deleted pages: doc Status → SUPERSEDED, never deleted
5. `_INDEX.md` updated with the tag each doc was last extracted at

Every as-built doc header carries `**Extracted at tag:** design-lock/<module>-v<N>` — this is what lets a PRD prove which version of the working app it describes.

## 8. Definition of done

- [ ] 20/20 PAGE files, all schema-conformant
- [ ] All domain COMP files complete
- [ ] `_INDEX.md` lists every file with status + route map
- [ ] Zero "should/could/recommend" language in any AS-BUILT file
- [ ] Every Open Question numbered and rolled up in `_INDEX.md`
- [ ] All files committed atomically to `troybelden-ct/CareTalk360`

## 9. Out of scope

- TO-BE design decisions, PRD writing, data dictionary extraction (separate workstreams)
- Any code changes to the prototype
- shadcn `ui/` documentation
