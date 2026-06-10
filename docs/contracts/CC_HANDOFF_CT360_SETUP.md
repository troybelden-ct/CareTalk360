# CC_HANDOFF: CareTalk360 — Repo Setup & Structure Normalization

**Task type:** One-time setup (Boris Tane: this IS the plan; implement directly)
**Working directory:** `~/Desktop/CTH/Code/CareTalk360/`
**Out of scope:** Extraction pass (separate handoff), any code changes to the app, skill building.

---

## Context

CareTalk360 is a standalone product. This folder currently contains a raw Lovable
export (Vite + React 18 + TS + Tailwind + shadcn) and a `docs/` folder holding three
governing documents. Your job: normalize the structure to match the approved doc
architecture, get the repo under git, and verify the design app runs.

## Target structure

```
CareTalk360/
├── app/                       ← ALL Lovable export code moves here
│   ├── src/  public/  package.json  vite.config.ts  etc.
├── docs/
│   ├── contracts/
│   │   ├── CT360_EXTRACTION_CONTRACT.md     (move from docs/ root)
│   │   ├── CT360_DOC_ARCHITECTURE.md        (move from docs/ root)
│   │   └── CT360_SKILLS_SPEC.md             (move from docs/ root)
│   ├── as-built/
│   │   ├── pages/  components/  flows/      (empty dirs, .gitkeep)
│   ├── to-be/
│   │   └── modules/                         (empty, .gitkeep)
│   ├── data/                                (empty, .gitkeep)
│   ├── prd/                                 (empty, .gitkeep)
│   ├── requests/                            (empty, .gitkeep)
│   └── BUILD_TRACKER.md                     (create skeleton, see below)
├── skills/                                  (empty, .gitkeep)
├── .gitignore                               (use the one from the Lovable export; ensure node_modules, dist)
└── README.md                                (create, see below)
```

## Tasks

### 1. Normalize structure
- Create `app/` and move the entire Lovable export into it (everything except `docs/`).
  If the export is in a subfolder like `click-and-configure-main/`, its *contents* become `app/` — no nested wrapper folder.
- Delete any `__MACOSX/` artifacts and `.DS_Store` files.
- Move the three governing docs into `docs/contracts/`.
- Create the remaining `docs/` tree per the target structure with `.gitkeep` files.

### 2. BUILD_TRACKER.md skeleton
```markdown
# CareTalk360 Build Tracker
Lifecycle: DRAFT → SENT → IN BUILD → DELIVERED → IN TEST → APPROVED/REJECTED → DEPLOYED → VERIFIED (closed)

| REQ | Module | PRD ver | Status | Sent | Delivered | Tested | Deployed | Open PLs |
|-----|--------|---------|--------|------|-----------|--------|----------|----------|
```

### 3. README.md
Brief: what CareTalk360 is (standalone CTH clinical operations platform), the
build → test → lock → extract → generate → deploy loop (one paragraph), pointer to
`docs/contracts/` as the governing documents, and `cd app && npm install && npm run dev`
to run the design app.

### 4. Git
- `git init` at repo root (NOT inside app/); remove any `.git` folder that came inside the Lovable export.
- Create the private GitHub repo `troybelden-ct/CareTalk360` (gh CLI if available) and set as origin.
- Single initial commit: `chore: initial structure — Lovable export in app/, doc architecture, tracker`
- Push main.

### 5. Verify the design app runs
- `cd app && npm install && npm run dev`
- Confirm the dev server starts and `/dashboard` renders.
- Spot-check three routes in the report: `/doctor-appointments`, `/forms`, `/user-list`.
- Report the local URL/port and any install warnings worth knowing. Do NOT fix
  lint/dependency warnings — report only.

### 6. Tag the baseline
- `git tag design-lock/baseline-v1` and push the tag.
  (This is the tag the first full extraction pass will run against.)

## Definition of done
- [ ] Structure matches target exactly
- [ ] App runs locally; three routes verified
- [ ] Repo live at troybelden-ct/CareTalk360, pushed, tagged
- [ ] Report back: file moves performed, dev-server result, any anomalies

## Reply format
Short report: what was done, dev-server verification result, anomalies, and
confirmation the repo + tag are pushed. Next handoff after this is the baseline
extraction pass per `docs/contracts/CT360_EXTRACTION_CONTRACT.md` (full mode).
