# OD75 Project Map

## Purpose

Standalone OD75 game workspace with Brain/GitHub workflow intact and compact agent context.

## Source Map

- `index.html`: base shell and original launch/stage/end markup.
- `b21-*.js`: lexically ordered gameplay modules and late overrides; see `docs/AUTONOMOUS-BUILDS.md` for the active release.
- `scripts/build.mjs`: syntax-checks and assembles `_site/game.js` with the release stamp.
- `tests/verify-b59.cjs`: complete JSDOM regression entrypoint.
- `tests/*-checks.js`: focused gameplay, settings, survival, Heartfield and launch contracts.
- `.github/workflows/pages.yml`: test, assemble and deploy GitHub Pages.
- `docs/`: versioned build blueprints and pending state.
- `AGENTS.md`: Codex operating instructions.
- `CLAUDE.md`: Brain-managed pointer created by `brain link`; do not edit manually.
- `TASKS.md`: active state and next work queue.
- `ASTRA_HANDOFF.md`: compact model handoff context retained from project setup.
- `.brain/`: ignored local Brain link/cache.

## Brain State

- Mode: full
- Stance: brief
- Current issue: some global Brain proposals remain in intake/held state. OpenAI-owned fixed proposals are waiting on steward, not held.

## Current Build

B76 adds `b21-65.js`: run memory, emotional source scoring, early returns and approach recognition. `tests/feelings-checks.js` checks behavior; `tests/feelings-browser.js` supplies local browser scenarios. B74 Heartfield authority remains in `b21-61.js` through `b21-63.js`; B75 launch layout is `b21-64.js`.

## Access Pattern

1. Read `AGENTS.md`, `PROJECT_MAP.md`, `TASKS.md`, and the relevant blueprint.
2. Run one targeted `brain query` for the task.
3. Use `rg` before broad reads.
4. Run `npm test` and `npm run build` before publishing.
