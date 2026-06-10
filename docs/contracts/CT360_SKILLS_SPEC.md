# CT360_SKILLS_SPEC.md
**Version:** v0.1 (draft)
**Status:** PROPOSED — pending Troy sign-off
**Scope:** The Claude Code skills powering the CareTalk360 documentation → PRD pipeline.

---

## 1. Design stance

Two skills, not five. Each skill is a thin workflow wrapper around a locked contract/template — the intelligence lives in the .md contracts (version-controlled, reviewable), not buried in skill prose. This keeps the skills stable while the design evolves.

| Skill | Job | Consumes | Produces |
|---|---|---|---|
| `ct360-extract` | As-built extraction of UI codebases | EXTRACTION_CONTRACT + source code | `docs/as-built/*` |
| `ct360-prd` | Generate dev-team-ready request packages | PRD_TEMPLATE + APPROVED docs | `docs/requests/REQ-###_*/` (PRD + TEST_PLAN + REQUEST cover + PUNCH_LIST on reject) + BUILD_TRACKER.md row |

Deliberately **not** built as skills: data dictionary extraction (one-time Claude Code task against the CTH schema — Boris Tane it), and design-lock validation (a ~50-line Python script bundled inside `ct360-prd`, not a separate skill). Simple is best.

---

## 2. Skill: `ct360-extract`

### SKILL.md frontmatter (draft)

```yaml
name: ct360-extract
description: Extract an as-built design documentation set from a React/TypeScript
  UI codebase following the CT360 Extraction Contract. Use this skill whenever the
  user asks to extract, document, inventory, or "work through" a front-end codebase,
  prototype, or Lovable export into markdown design docs — even if they don't say
  "extraction." Triggers on phrases like "document the pages," "extract the screens,"
  "as-built pass," or any request to turn UI code into design-lock files.
```

### Structure

```
ct360-extract/
├── SKILL.md            workflow: read contract → build _INDEX → pass order → extract → commit
├── references/
│   ├── page_schema.md  the exact PAGE_*.md schema (mirrors contract §4)
│   └── comp_schema.md  the exact COMP_*.md schema (contract §5)
└── scripts/
    └── check_schema.py validates every output file has all required sections,
                        a Status header, and zero "should/could/recommend" language
```

### Workflow encoded in SKILL.md

1. Read `docs/contracts/CT360_EXTRACTION_CONTRACT.md` — it is authoritative; this skill never overrides it
2. Determine mode: no `_INDEX.md` → **full pass**; otherwise **incremental** — `git diff --name-only <last tag>..<new tag>` and re-extract only changed pages/components (version-bumped), per contract §7
3. Extract in contract pass order, one file per commit; stamp every doc with `Extracted at tag`
4. Run `check_schema.py` after each batch; fix failures before continuing
5. Roll up Open Questions into `_INDEX.md` at the end

### Why a skill (vs. one-off prompt)
Reusable: future Lovable prototypes, Pulse page documentation, or any vendor codebase audit runs through the same contract-driven pass.

---

## 3. Skill: `ct360-prd`

### SKILL.md frontmatter (draft)

```yaml
name: ct360-prd
description: Generate a complete, dev-team-ready PRD for a CareTalk360 module by
  filling CT360_PRD_TEMPLATE.md from APPROVED design-lock documents. Use this skill
  whenever the user asks to create, generate, update, or regenerate a PRD, product
  requirements document, feature spec, or dev handoff document for CareTalk360 —
  even if they just say "write up the requirements for X" or "spec out the
  appointments module."
```

### Structure

```
ct360-prd/
├── SKILL.md             workflow below
├── references/
│   └── prd_example.md   one gold-standard completed PRD (added after first manual review)
└── scripts/
    └── preflight.py     gating checks before any generation (see below)
```

### `preflight.py` — the accuracy gate

Run first, refuse to generate on failure:
- [ ] `CT360_PRD_TEMPLATE.md` exists and is APPROVED
- [ ] Target `MOD_*.md` is APPROVED (not PROPOSED)
- [ ] Every `SCR-`/`ENT-` ID referenced in the MOD file resolves in `_INDEX.md` / `DATA_DICTIONARY.md`
- [ ] **AS-BUILT docs are current**: every referenced PAGE/COMP doc's `Extracted at tag` matches the latest `design-lock/<module>-v<N>` tag — stale extraction = refusal (re-run ct360-extract first)
- [ ] `CT360_NFR.md` and `CT360_ROLES_PERMISSIONS.md` are APPROVED
- [ ] No unresolved `DEC-` references marked BLOCKING

On failure: emit the exact list of missing/unapproved inputs and stop. **A refused PRD is cheaper than a wrong PRD.**

### Workflow encoded in SKILL.md

1. Run `preflight.py <module>`
2. Load template + MOD + referenced AS-BUILT pages + DATA_DICTIONARY entries + NFR + ROLES + relevant DECISIONS
3. Fill every template section; never invent an entity, rule, or screen not present in inputs — gaps become numbered Open Items
4. Build the traceability table (AC → BR → SCR/ENT → DEC); flag any untraceable AC
5. Write the full request package to `docs/requests/REQ-###_<Mod>_v<N>/`:
   - `PRD_<MOD>_<Name>_v<N>.md` (Status: GENERATED; also copied to `docs/prd/`)
   - `TEST_PLAN.md` — every AC-### becomes TC-### (steps / expected / pass-fail),
     in three groups: (a) functional from ACs, (b) regression spot-checks,
     (c) production smoke tests for post-deploy verification
   - `REQUEST.md` cover sheet with delta summary vs. last DEPLOYED version
6. Append/update the REQ row in `docs/BUILD_TRACKER.md` (Status: DRAFT)
7. On rejection (user invokes with test results): generate `PUNCH_LIST.md` —
   PL-### items tied to failing TC-### — and set tracker Status: REJECTED
8. Output a one-paragraph diff summary if regenerating an existing version

### Lifecycle support (tracker commands)

The skill also handles status updates when asked ("mark REQ-004 delivered",
"REQ-004 deployed"): one-line BUILD_TRACKER.md edit with date. VERIFIED requires
confirmation that all section-(c) smoke tests passed in production — the skill
asks before closing. A REQ is never closed at APPROVED; deployed-and-verified
is the only terminal state.

### Hard rules
- GENERATED PRDs are never hand-edited; fixes go upstream, then regenerate
- Acceptance criteria are Given/When/Then, numbered, testable — no "the system should be fast"
- NFR section is mandatory in every PRD regardless of module

---

## 4. Build & test plan (per skill-creator process)

1. **Draft** both SKILL.md files + scripts (Claude Code, Boris Tane'd)
2. **Test `ct360-extract`** on 3 prototype pages spanning complexity: `NotFound` (trivial), `UserList` (table+CRUD), `Forms` (complex tabs/modals). Review outputs against contract manually.
3. **Test `ct360-prd`** with three prompts: a happy-path package generation for MOD_Appointments (verify PRD + TEST_PLAN + REQUEST + tracker row all emit), a deliberately broken run (PROPOSED input) to verify the preflight refusal fires, and a rejection run (fake failing TC results) to verify PUNCH_LIST generation and tracker status flip.
4. **Iterate** SKILL.md from failures; version-bump.
5. **Lock** v1.0 of each only after one full real module has gone extraction → PRD end-to-end and the dev team has reviewed the PRD output.

## 5. Speed & accuracy summary

- **Speed:** extraction and PRD assembly become single-command Claude Code runs; the human time concentrates on APPROVED-gate reviews, where it belongs.
- **Accuracy:** four compounding checks — schema validation (extract), preflight gating (prd), traceability table (every AC must trace), and regenerate-don't-edit (errors fixed once, upstream, propagate everywhere).
