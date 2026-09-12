# OD75 Project Map

## Purpose

Standalone OD75 game workspace with Brain/GitHub workflow intact and compact agent context. Built through Codex to B83, worked on in Claude Code from B84.

## Source Map

- `index.html`: base shell and original launch/stage/end markup.
- `b21-*.js`: lexically ordered gameplay modules and late overrides; see `docs/AUTONOMOUS-BUILDS.md` for the active release.
- `scripts/build.mjs`: syntax-checks and assembles `_site/game.js` with the release stamp.
- `tests/verify-b59.cjs`: complete JSDOM regression entrypoint.
- `tests/*-checks.js`: focused gameplay, settings, survival, Heartfield and launch contracts.
- `.github/workflows/pages.yml`: test, assemble and deploy GitHub Pages.
- `docs/`: versioned build blueprints and pending state.
- `AGENTS.md`: agent operating instructions, environment-independent.
- `CLAUDE.md`: Brain-managed pointer created by `brain link`; do not edit manually.
- `TASKS.md`: active state and next work queue.
- `HANDOFF.md`: compact takeover context and the per-environment toolchain.
- `.brain/`: ignored local Brain link/cache.

## Brain State

- Mode: full
- Stance: brief
- Current issue: some global Brain proposals remain in intake/held state. OpenAI-owned fixed proposals are waiting on steward, not held.

## Current Build

B90 adds `b21-79.js`: dash cooldown readiness now gets a short player-centered arena cue when it crosses ready without changing dash mechanics, inputs, enemies or scoring. B89 arrival read is `b21-78.js`; B88 perimeter weighting is `b21-77.js`. `tests/autonomy-checks.js` covers these behaviors and `tests/autonomy-browser.js` supplies their browser fixtures.

## Access Pattern

1. Read `AGENTS.md`, `PROJECT_MAP.md`, `TASKS.md`, and the relevant blueprint.
2. Run one targeted `brain query` for the task.
3. Use `rg` before broad reads.
4. Run `npm test` and `npm run build` before publishing.
