# TRANSITION.md — CareTalk360

**Last updated:** 2026-06-27
**Current task:** Contract review and approval

---

## What the app does

CareTalk360 is CTH's standalone clinical operations platform — manages patient encounters, appointments, clinical forms, and care navigation. Design app (Lovable export) lives in `app/`, runs with `cd app && npm run dev`.

## What was done this session

### Contract review — 2 of 4 approved

1. **CT360_DOC_ARCHITECTURE.md** — APPROVED (v1.0)
   - Simplified lifecycle from 7 statuses to 5: SENT → BUILDING → TESTING → DEPLOYED → VERIFIED
   - Added staging test gate before production deploy (steps 8-9 in operating loop)
   - NFR is now a standing reference, not repeated per PRD
   - Traceability table cut from v1 PRDs (IDs still exist for cross-referencing)
   - REQUEST.md beefed up to be self-sufficient for Cairo dev team
   - PUNCH_LIST simplified — separate file only for 5+ items
   - Extraction changed to one commit per pass (not per file)

2. **CT360_EXTRACTION_CONTRACT.md** — APPROVED (v1.0)
   - Fixed app path from legacy `~/Desktop/Development/...` to `~/Desktop/CTH/Code/CareTalk360/app/`
   - Changed commit strategy from per-file to per-pass

### Still pending review

3. **CT360_SKILLS_SPEC.md** — still PROPOSED
4. **CC_HANDOFF_CT360_SETUP.md** — still PROPOSED (already executed, just needs formal sign-off)

## Decisions made

1. DEC-001: Lifecycle uses 5 statuses (SENT/BUILDING/TESTING/DEPLOYED/VERIFIED), not 7
2. DEC-002: Staging test gate is environment-agnostic (not tied to CareTalkBeta specifically)
3. DEC-003: NFR referenced once per PRD, not repeated in full
4. DEC-004: Traceability tables deferred to v2 — add if PRD accuracy becomes a problem
5. DEC-005: Extraction uses one commit per pass, not per file

## Next steps

1. Review and approve CT360_SKILLS_SPEC.md
2. Review and approve CC_HANDOFF_CT360_SETUP.md (formality — already executed)
3. Begin one-time setup: full extraction pass, TO-BE docs, data dictionary, PRD template
