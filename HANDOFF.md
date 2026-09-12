# Handoff

You are taking over OD75. It tracks `https://github.com/Pappydapimp69/OD75`
on `main`; GitHub Pages deploys every push to `main`.

Read first:
1. `AGENTS.md`
2. `PROJECT_MAP.md`
3. `TASKS.md`
4. `docs/AUTONOMOUS-BUILDS.md` — the progress authority for the 50-loop run

Then run:

```
brain status
brain query OD75
```

Use Brain through the CLI only. Do not read Brain node repos directly.
Brain mode is `full` and stance is `brief`.

Low context cost is deliberate: use `rg` before broad file reads, inspect only
task-relevant files, avoid whole-repo summaries unless asked, keep replies
terse.

Run `npm test` and `npm run build` before publishing any change.

## Toolchain

Node 22 or newer. `npm ci` installs the one dependency (jsdom).

**Claude Code / Linux** — the environment this is worked on in from B84.

- `npm ci && npm test && npm run build` need no environment overrides.
- Browser checks: Chromium is preinstalled at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Drive it with
  `npm install --no-save playwright` and launch via `executablePath`; do not
  run `playwright install`. Keep the driver script out of the repo — the
  committed browser artifacts are the `tests/*-browser.js` fixtures.
- `node scripts/serve.mjs` serves `_site` on port 8175 and the local fixtures
  at `/qa`. Check whether a server is already running before starting one.
- The dev server has no favicon, so every page load logs one
  `/favicon.ico` 404. It is server noise, not an application error — filter it
  out of browser checks rather than chasing it.
- `brain gate` runs as a pre-commit hook and matches keywords against open
  tensions, so it can refuse an unrelated commit. Read the tension it names;
  if it genuinely does not touch the change, re-commit with
  `BRAIN_ACK=<slug> git commit ...` and say so.

**Codex / Windows** — how B77 to B83 were built.

- Set `NODE_PATH=C:/Users/Kompooter/Documents/OD75/node_modules` for the
  existing JSDOM dependency.
- Browser checks used CUA against the same `/qa` fixture buttons.

Either way: browser tests drive production-path fixture buttons, never
application-state injection from `evaluate`.

## Current state

B88 Perimeter Pressure is the verified head at loop 12 of 50. Its exact release
commit deployed successfully and the public stamp, cache key and assembled
bundle independently matched. No gameplay implementation is currently
unfinished; select loop 13 / B89 next.

Suggested first action: read `TASKS.md`, check `git status` and the current
Pages run, and continue the listed step.
