# B86 — Display ratio (loop 10/50)

Problem: `resizeArena()` re-reads `devicePixelRatio` and rebuilds the canvas
backing store, and `b21-08.js` calls it on `resize`. Zoom fires `resize`, so
that path is covered. Moving the window to a monitor with a different ratio
does not — the CSS viewport is unchanged, only `devicePixelRatio` moves — so
the canvas keeps the old backing ratio and the game renders soft or
over-sharp until something unrelated triggers a resize. `matchMedia` appeared
nowhere in the 74 modules before this build.

This is `mirage#E10`, recorded first-hand from the MIRAGE build and retrieved
by `brain query`: *"`devicePixelRatio` cached at construction goes stale on
scaling/zoom/monitor changes … re-read DPR on resize plus a re-arming
`(resolution: Ndppx)` query."* OD75 had the resize half and not the query.

`b21-75.js` arms `matchMedia('(resolution: <live ratio>dppx)')`, rebuilds the
backing store when it stops matching, and re-arms at the new ratio. The query
uses the RAW `devicePixelRatio`, not the clamped `DPR`: above the clamp of 2
the two disagree, and a query pinned to the clamp could never stop matching.
`resizeArena` re-arms too, or the watch would keep testing a ratio the page
has already left. A browser without `matchMedia` — including the JSDOM the
suite runs in — is tolerated and simply keeps the old resize-only behaviour.

Unchanged: the DPR clamp of 2, the canvas sizing arithmetic, the resize
handler, rendering, damage, speed and inputs. No new controls, no live model.

Acceptance: the query tracks the live ratio and re-arms off the old one; a
ratio change with no resize event still rebuilds the backing store; the raw
ratio drives the query past the clamp and a bad ratio defaults to 1; resize
re-arms; a browser with no `matchMedia` still loads.

Coverage limit, stated plainly: the four unit guards drive a faked
`matchMedia`, and the browser pass covers `deviceScaleFactor` 1, 1.5, 2 and 3
in real Chromium — confirming the watch arms at the live ratio and the backing
store follows the clamp. Neither actually drags a window between two physical
monitors, which is the event this build exists for. That step is unautomated
here and remains a manual check.

Playtest: on a two-monitor setup, drag the window across and see whether the
game stays sharp without a resize.
