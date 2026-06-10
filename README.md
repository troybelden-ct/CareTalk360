# CareTalk360

CareTalk360 is CareTalk Health's standalone clinical operations platform — purpose-built for managing patient encounters, appointments, clinical forms, and care navigation workflows across Doctor, Nurse, Care Navigator, Supervisor, and Admin roles.

## Development loop

The product follows a **build → test → lock → extract → generate → deploy** cycle. Claude Code builds and modifies screens in the design app; Troy click-tests locally; approved modules are tagged (`design-lock/<module>-v<N>`), extracted into as-built markdown docs, and fed into PRD generation that produces dev-team-ready request packages. The full process — from design lock through production deployment and verification — is tracked in `docs/BUILD_TRACKER.md`.

## Governing documents

All contracts, architecture decisions, and skill specs live in `docs/contracts/`. Start there.

## Running the design app

```sh
cd app && npm install && npm run dev
```
