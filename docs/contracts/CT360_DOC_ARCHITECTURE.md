# CT360_DOC_ARCHITECTURE.md
**Version:** v1.0
**Status:** APPROVED
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
5. **One-stop PRDs.** The REQUEST.md cover sheet should be self-sufficient for a senior dev. The full PRD backs it up for detail, but the cover sheet stands alone.

## 2. Repository layout

```
CareTalk360/                          (troybelden-ct/CareTalk360)
├── app/                              the working design app (Lovable export as starting point;
│                                     evolves via Claude Code; always runnable: npm run dev)
├── docs/
│   ├── contracts/
│   │   ├── CT360_DOC_ARCHITECTURE.md  ← you are here
│   │   ├── CT360_EXTRACTION_CONTRACT.md
│   │   ├── CT360_SKILLS_SPEC.md
│   │   └── CT360_PRD_TEMPLATE.md     ← the template the skill fills
│   ├── as-built/                     extraction output (see Extraction Contract)
│   │   ├── pages/  components/  flows/  _INDEX.md
│   ├── to-be/
│   │   ├── CT360_VISION.md           one-pager: what CareTalk360 is, who uses it, why
│   │   ├── CT360_ROLES_PERMISSIONS.md  role matrix: Doctor/Nurse/CareNav/Supervisor/Admin x capability
│   │   ├── CT360_NFR.md              standing non-functional reqs: auth, PHI/HIPAA, audit, logging, performance
│   │   ├── CT360_INTEGRATIONS.md     HERMES, Humana eligibility, CCDA/Halbert, formData touchpoints
│   │   ├── DECISIONS.md              numbered decision log (answers Open Questions; append-only)
│   │   └── modules/
│   │       └── MOD_<Name>.md         one per product module (to-be spec; references AS-BUILT pages)
│   ├── data/
│   │   ├── CT360_DATA_DICTIONARY.md  canonical entities: fields, types, sources, keys
│   │   └── CT360_ENTITY_MAP.md       UI mock fields -> real CTH schema mapping (validated, not guessed)
│   ├── prd/
│   │   └── PRD_<MOD>_<Name>_v<N>.md  generated PRDs, one per module/feature
│   ├── requests/
│   │   └── REQ-###_<Mod>_v<N>/       one self-contained dev request package per build ask
│   │       ├── REQUEST.md            cover sheet (self-sufficient — scope, screens, delta, environments, rules, test summary)
│   │       ├── PRD_<MOD>_<Name>_v<N>.md   the full PRD frozen for this request
│   │       ├── TEST_PLAN.md          test cases derived from acceptance criteria
│   │       └── PUNCH_LIST.md         created on rejection (5+ items); small rejections tracked inline on BUILD_TRACKER
│   └── BUILD_TRACKER.md              status board for all in-flight requests
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
| 5 | Data Structures — entities, fields, types, keys, source systems | DATA_DICTIONARY + ENTITY_MAP |
| 6 | Business Logic — rules table: ID, trigger, rule, outcome | MOD + DECISIONS + as-built validation rules |
| 7 | Integrations & Dependencies | INTEGRATIONS |
| 8 | Non-Functional Requirements | One-liner reference to CT360_NFR.md; module-specific NFRs only if applicable |
| 9 | Acceptance Criteria — Given/When/Then, numbered AC-### | MOD; mandatory, no PRD ships without |
| 10 | Open Items | unresolved DECISIONS refs |

## 4. Lifecycle & versioning

Every doc carries `**Status:**` and `**Version:**` in its header.

```
AS-BUILT   →  (extraction; mechanical; v0.x)
PROPOSED   →  drafted, awaiting Troy
APPROVED   →  Troy signed off; design is locked
SUPERSEDED →  replaced by a later version (file kept, header updated)
```

Rules:
- Only **APPROVED** docs feed PRD generation. The skill refuses PROPOSED inputs.
- Changing an APPROVED doc = version bump + entry in `DECISIONS.md`. No silent edits.
- GENERATED PRDs are never hand-edited — fix the source docs and regenerate.

## 5. Traceability IDs

Stable IDs for cross-referencing across documents:

| Prefix | Example | Lives in |
|---|---|---|
| `SCR-` | SCR-012 (screen) | as-built PAGE files (assigned in _INDEX.md) |
| `ENT-` | ENT-004 (entity) | DATA_DICTIONARY |
| `BR-`  | BR-031 (business rule) | MOD files |
| `AC-`  | AC-112 (acceptance criterion) | PRDs |
| `DEC-` | DEC-007 (decision) | DECISIONS.md |
| `NFR-` | NFR-003 | CT360_NFR.md |

IDs enable cross-referencing (e.g., an AC can cite the BR it validates). Formal traceability tables are not required in v1 PRDs — add later if PRD accuracy becomes a problem.

## 6. Dev request packages and tracker

**REQUEST.md (cover sheet)** — the primary document Cairo reads. Must be self-sufficient:
- REQ ID, module, PRD version, design-lock tag
- **Scope** — what this request covers (1-3 sentences)
- **Screens** — route paths + what each does (with link to running design app for visual reference)
- **Delta summary** — what's new/changed since last deployed version
- **Key business rules** — the critical logic, not everything, just what a senior dev needs
- **Environments** — staging URL and production URL
- **Test plan summary** — the top-level test cases (full plan in TEST_PLAN.md)

**TEST_PLAN.md** — derived from the PRD:
- **(a) Functional tests** — every AC-### becomes a TC-### with steps / expected result / pass-fail
- **(b) Regression spot-checks** — adjacent screens that could be affected
- **(c) Production smoke tests** — minimal subset re-run after deploy to verify in production

**PUNCH_LIST.md** — created on rejection when there are 5+ failing items, each tied to the failing TC-###. For 1-4 items, track inline as a note on the BUILD_TRACKER row.

**BUILD_TRACKER.md** — one table, the status board:

| REQ | Module | PRD ver | Status | Sent | Delivered | Tested | Deployed | Verified | Notes |
|-----|--------|---------|--------|------|-----------|--------|----------|----------|-------|

### Request lifecycle (5 statuses):

```
SENT → BUILDING → TESTING → ┬→ DEPLOYED → VERIFIED (closed)
                              └→ punch list → BUILDING → TESTING …
```

- **SENT** — REQ package delivered to Cairo
- **BUILDING** — Cairo is working on it
- **TESTING** — Cairo has deployed to staging; Troy is testing against TEST_PLAN (a)+(b)
- **DEPLOYED** — staging tests passed; build pushed to production
- **VERIFIED** — production smoke tests (section c) passed; REQ is closed

Rules:
- A REQ is **closed only at VERIFIED** — deployed-but-not-verified stays open.
- VERIFIED = production smoke tests passed against the live site.
- Rejection is not a status — it's a loop back to BUILDING with a punch list (inline note or PUNCH_LIST.md).
- Every status change = one-line edit to BUILD_TRACKER.md with a date.
- REQ packages are frozen once SENT: changes mean a new PRD version and a new/updated REQ.

## 7. The operating loop

**One-time setup:**
1. Repo created; Lovable export lands in `app/`; `npm install && npm run dev` verified
2. Full extraction pass -> `as-built/` baseline (Extraction Contract, full mode)
3. `CT360_VISION.md` + `ROLES_PERMISSIONS` + `NFR` + `INTEGRATIONS` drafted and APPROVED
4. `DATA_DICTIONARY` + `ENTITY_MAP` built by Claude Code against the real CTH schema
5. `CT360_PRD_TEMPLATE.md` locked

**Steady state (per module/feature — this is the loop Troy runs):**

```
1. BUILD      Claude Code adds/changes screens in app/
2. TEST       Troy: npm run dev -> click-test -> iterate with CC until right
3. LOCK       git tag design-lock/<module>-v<N>
4. EXTRACT    ct360-extract against the tag -> as-built docs updated
5. DECIDE     Troy answers Open Questions in DECISIONS.md;
              MOD_<Name>.md updated with business rules -> APPROVED
6. GENERATE   ct360-prd -> full REQ package: REQUEST + PRD + TEST_PLAN
              + new row in BUILD_TRACKER.md (Status: SENT)
7. SEND       REQ package to Cairo
8. BUILD      Cairo builds; deploys to staging
9. TEST       Troy tests on staging against TEST_PLAN (a)+(b)
              -> Pass: move to DEPLOY
              -> Fail: punch list back to Cairo, they fix, re-deploy to staging, re-test
10. DEPLOY    Approved build pushed to production
11. VERIFY    Production smoke tests (TEST_PLAN section c) pass -> VERIFIED, REQ closed
```
