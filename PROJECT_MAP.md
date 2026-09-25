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

B93 adds `b21-82.js`: Thunderstorm now gathers up to five clouds across a one-second hold, spends at most 20% HEAT, launches on release, seeks random targets and ricochets by Constellation level. Quick taps strike once without ricochet; a 1.25-second cooldown prevents spam. Regression and desktop/mobile browser fixtures cover charge, release, chaining, pause and focus loss.

B94 adds `b21-83.js`: every basic skill ignites at 25% HEAT and Ascended Pip at 70%. Beam and Guardian drain while held; Thunderstorm, Nova and Gravity Well charge while held, stop draining when full and strike on release. Sound Lab audition buttons get the game's button style.

B95 adds `b21-84.js`: the skill button reads HEAT against the meter maximum and fills with the whole meter; the top HEAT bar is a prominent gauge with an ignition mark.

B96 adds `b21-85.js`: the Sound Lab wallet row scrolls with the page instead of sticking to the top.

B97 adds `b21-86.js`: the Sound Lab wallet row pins again while scrolling down, and snaps home when the top Pip Sounds row is selected or scrolled back into.

B98 adds `b21-87.js`: Thunderstorm clouds cost 8% HEAT each, gathering pauses below 8%, and charging gets start/cloud/full flashes, a darkening sky and arcing lightning.

B99 adds `b21-88.js`: variable enemies. Heart level (stage-end hearts ÷ 20) sets speed/health ranges, stage sets aggression, run stars unlock the roster (Sniper, Splitter, Thief added), spawn gaps follow rolled speed, bosses scale on their own track. Supersedes B63's enemy scaling and B82's rosters.

## Access Pattern

1. Read `AGENTS.md`, `PROJECT_MAP.md`, `TASKS.md`, and the relevant blueprint.
2. Run one targeted `brain query` for the task.
3. Use `rg` before broad reads.
4. Run `npm test` and `npm run build` before publishing.
