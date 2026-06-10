# CT360_DOC_ARCHITECTURE.md
**Version:** v0.1 (draft)
**Status:** PROPOSED — pending Troy sign-off
**Scope:** The complete markdown file system for CareTalk360 — what files exist, what each locks in, lifecycle, and traceability.

---

## 1. Principles

1. **Standalone product.** CareTalk360 is its own application — not a Pulse module. Pulse patterns may be referenced; nothing is shared by default.
2. **The app is the design surface.** New screens and changes are built in the running app by Claude Code and click-tested by Troy. Markdown locks are *snapshots* of approved app states (taken at design-lock git tags), not upfront specs. During design, code leads; once locked, the docs lead for the dev team.
3. **Three document classes, never mixed:**
   - **AS-BUILT** — what the design app contains at a given tag (extraction output, mechanical)
   - **TO-BE** — what the app cannot express: real data sources, business rules, auth, integrations (decisions, Troy-owned)
   - **GENERATED** — PRDs produced by skill from the two above (regenerable, never hand-edited)
4. **Simple is best.** Flat folders, predictable names, one concern per file.

## 2. Repository layout

```
CareTalk360/                          (troybelden-ct/CareTalk360)
├── app/                              the working design app (Lovable export as starting point;
│                                     evolves via Claude Code; always runnable: npm run dev)
├── docs/
│   ├── contracts/
│   │   ├── CT360_EXTRACTION_CONTRACT.md
│   │   └── CT360_PRD_TEMPLATE.md     ← the template the skill fills
│   ├── as-built/                     extraction output (see Extraction Contract)
│   │   ├── pages/  components/  flows/  _INDEX.md
│   ├── to-be/
│   │   ├── CT360_VISION.md           one-pager: what CareTalk360 is, who uses it, why
│   │   ├── CT360_ROLES_PERMISSIONS.md  role matrix: Doctor/Nurse/CareNav/Supervisor/Admin × capability
│   │   ├── CT360_NFR.md              standing non-functional reqs: auth, PHI/HIPAA, audit, logging, performance
│   │   ├── CT360_INTEGRATIONS.md     HERMES, Humana eligibility, CCDA/Halbert, formData touchpoints
│   │   ├── DECISIONS.md              numbered decision log (answers Open Questions; append-only)
│   │   └── modules/
│   │       └── MOD_<Name>.md         one per product module (to-be spec; references AS-BUILT pages)
│   ├── data/
│   │   ├── CT360_DATA_DICTIONARY.md  canonical entities: fields, types, sources, keys
│   │   └── CT360_ENTITY_MAP.md       UI mock fields → real CTH schema mapping (validated, not guessed)
│   ├── prd/
│   │   └── PRD_<MOD>_<Name>_v<N>.md  generated PRDs, one per module/feature
│   ├── requests/
│   │   └── REQ-###_<Mod>_v<N>/       one self-contained dev request package per build ask
│   │       ├── REQUEST.md            cover sheet (scope, delta, deliverables, links)
│   │       ├── PRD_<MOD>_<Name>_v<N>.md   the PRD copy frozen for this request
│   │       ├── TEST_PLAN.md          test cases derived 1:1 from acceptance criteria
│   │       └── PUNCH_LIST.md         created on rejection; PL-### items
│   └── BUILD_TRACKER.md              the punch list / follow-up board (one table, see §7)
├── skills/
│   ├── ct360-extract/                (see Skills Spec)
│   └── ct360-prd/
└── src/                              future application code
```

## 3. The PRD template (`CT360_PRD_TEMPLATE.md`)

Locked **before** the PRD skill is built. Mandatory sections:

| # | Section | Source |
|---|---|---|
| 1 | Header: PRD ID, module, version, status, author, date | metadata |
| 2 | Summary & Goals (incl. explicit non-goals) | MOD + VISION |
| 3 | Users & Roles | ROLES_PERMISSIONS |
| 4 | Screen Design — per screen: layout, elements, states, navigation | AS-BUILT pages + MOD deltas |
| 5 | Data Archetypes & Structures — entities, fields, types, keys, source systems | DATA_DICTIONARY + ENTITY_MAP |
| 6 | Business Logic — rules table: ID, trigger, rule, outcome, source decision | MOD + DECISIONS + as-built validation rules |
| 7 | Integrations & Dependencies | INTEGRATIONS |
| 8 | Non-Functional Requirements | NFR (standing inclusion, every PRD) |
| 9 | Acceptance Criteria — Given/When/Then, numbered AC-### | MOD; mandatory, no PRD ships without |
| 10 | Traceability table | auto-generated (see §5) |
| 11 | Open Items | unresolved DECISIONS refs |

## 4. Lifecycle & versioning

Every doc carries `**Status:**` and `**Version:**` in its header.

```
AS-BUILT  →  (extraction; mechanical; v0.x)
PROPOSED  →  drafted, awaiting Troy
APPROVED  →  Troy signed off; design is locked
SUPERSEDED →  replaced by a later version (file kept, header updated)
```

Rules:
- Only **APPROVED** docs feed PRD generation. The skill refuses PROPOSED inputs.
- Changing an APPROVED doc = version bump + entry in `DECISIONS.md`. No silent edits.
- GENERATED PRDs are never hand-edited — fix the source docs and regenerate. (This is the accuracy lever: errors get fixed once, upstream.)

## 5. Traceability IDs

Stable IDs make PRDs auditable and let the dev team trace any requirement to its source:

| Prefix | Example | Lives in |
|---|---|---|
| `SCR-` | SCR-012 (screen) | as-built PAGE files (assigned in _INDEX.md) |
| `ENT-` | ENT-004 (entity) | DATA_DICTIONARY |
| `BR-`  | BR-031 (business rule) | MOD files |
| `AC-`  | AC-112 (acceptance criterion) | PRDs |
| `DEC-` | DEC-007 (decision) | DECISIONS.md |
| `NFR-` | NFR-003 | CT360_NFR.md |

Every PRD ends with a traceability table: `AC → BR → SCR/ENT → DEC`. If an AC can't be traced, it's flagged — that's the skill's built-in accuracy check.

## 6. Dev request packages, tracker, and test plans

**REQUEST.md (cover sheet)** — the only thing a developer must read first:
ID, module, PRD version, design-lock tag, **Delta summary** (what's new/changed since the last deployed version — generated from PRD version diff), deliverables, target date, links to the live design app route(s) for visual reference.

**TEST_PLAN.md** — derived mechanically from the PRD: every `AC-###` becomes a `TC-###` with steps / expected result / pass-fail checkbox, grouped into: (a) functional cases from ACs, (b) regression spot-checks on adjacent screens, (c) **production smoke tests** — the minimal subset re-run after deploy to verify in prod. Approval requires all (a) pass; closure requires all (c) pass in production.

**PUNCH_LIST.md** — created on rejection or partial pass: numbered `PL-###` items, each tied to the failing `TC-###`. Punch items either get fixed within the same REQ (re-test) or roll into the next REQ version. No untracked feedback — if it isn't a PL item, it didn't happen.

**BUILD_TRACKER.md** — one table, the punch list board:

| REQ | Module | PRD ver | Status | Sent | Delivered | Tested | Deployed | Open PLs |

**Request lifecycle (status column):**

```
DRAFT → SENT → IN BUILD → DELIVERED → IN TEST → ┬→ APPROVED → DEPLOYED → VERIFIED (closed)
                                                └→ REJECTED → (punch list) → IN BUILD …
```

Rules:
- A REQ is **closed only at VERIFIED** — approved-but-not-deployed work stays open on the tracker.
- VERIFIED = production smoke tests (TEST_PLAN section c) passed against the live site.
- Every status change is a one-line edit to BUILD_TRACKER.md with a date — this file is the follow-up ritual; if the board says IN BUILD for two weeks, that's the nudge.
- REQ packages are frozen once SENT (like GENERATED PRDs): changes mean a new PRD version and a new/updated REQ.

## 7. The operating loop

**One-time setup:**
1. Repo created; Lovable export lands in `app/`; `npm install && npm run dev` verified
2. Full extraction pass → `as-built/` baseline (Extraction Contract, full mode)
3. `CT360_VISION.md` + `ROLES_PERMISSIONS` + `NFR` + `INTEGRATIONS` drafted and APPROVED
4. `DATA_DICTIONARY` + `ENTITY_MAP` built by Claude Code against the real CTH schema
5. `CT360_PRD_TEMPLATE.md` locked

**Steady state (per module/feature — this is the loop Troy runs):**

```
1. BUILD    Claude Code adds/changes screens in app/   (Boris Tane'd task)
2. TEST     Troy: npm run dev → click-test → iterate with CC until right
3. LOCK     git tag design-lock/<module>-v<N>
4. EXTRACT  ct360-extract incremental pass against the tag → as-built docs bump
5. DECIDE   Troy answers any new Open Questions in DECISIONS.md;
            MOD_<Name>.md updated with business rules the UI can't show → APPROVED
6. GENERATE ct360-prd → full REQ package: PRD + TEST_PLAN + REQUEST cover
            + new row in BUILD_TRACKER.md (Status: DRAFT)
7. SEND     REQ package to dev team → Status: SENT → IN BUILD
8. TEST     Delivered build run against TEST_PLAN (a)+(b)
            → APPROVED, or REJECTED with PUNCH_LIST.md → back to dev
9. DEPLOY   Approved build to production
10. VERIFY  Production smoke tests (TEST_PLAN c) pass → Status: VERIFIED, REQ closed
```

The pipeline ends at **deployed to production and verified** — not at an approved document. BUILD_TRACKER.md is the single follow-up surface for everything in flight.

Step 5 is the one that keeps PRDs from going hollow: the running app proves the *screens*, but real data sources, business rules, role enforcement, and integrations only exist in the TO-BE layer — every loop pass must touch it, even briefly.
