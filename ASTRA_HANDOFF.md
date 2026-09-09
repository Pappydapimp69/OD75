# Astra Handoff

You are taking over OD75 in its own Codex workspace.

Read first:
1. `AGENTS.md`
2. `PROJECT_MAP.md`
3. `TASKS.md`

Then run:

```powershell
brain status
brain query OD75
```

Use Brain through the CLI only. Do not read Brain node repos directly.

The project is configured for low context cost:
- use `rg` before broad file reads
- inspect only task-relevant files
- avoid whole-repo summaries unless requested
- keep replies terse by default

Current state:
- Brain mode is full and stance is brief.
- The project tracks `https://github.com/Pappydapimp69/OD75.git` on `main`.
- B76 Pip Notices is the active build; read `docs/B76-pip-notices.md`.
- Run `npm test` and `npm run build` before publishing any change.

Suggested first action after launch:
Read `TASKS.md`, inspect the current Git status, and continue the listed deployment or playtest step.
