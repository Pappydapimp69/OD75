# B84 — Escalation cue (loop 8/50)

Problem: the mid-fight cue fires the instant a boss's health crosses half
(`b21-06.js`, inside `hitEnemy`), but a B59 boss keeps its phase-one pattern
until the next attack boundary — `q.second` only latches in `bossCycleB59`
(`b21-47.js`). Grump's cycle is ~4.0s, Velvet Fang's ~4.9s, Static Bloom's
~5.1s. For up to a full cycle the game announces an escalation the player
cannot see, and the announcement is a "big" praise that pulls attention at the
exact moment nothing has changed.

ZaneGPT design lens: an announcement is a promise about the world. When the
cue and the behaviour disagree, the player learns to distrust the cue rather
than read it. Move the cue to the moment the promise becomes true.

For the three B59 bosses (keys 1, 5, 7) the threshold cue is held and fires on
the frame `q.second` actually turns true — the same frame the boss commits to
its heavier pattern. Bosses 11, 13, 17 and 22 have no B59 phase two, so they
keep the immediate threshold cue unchanged.

Unchanged: boss health, damage, speed, patterns, phase timings, when
`q.second` latches, the health bar, every other praise line, and all inputs.
No new controls, no live model. A boss killed before it escalates announces
nothing, which is correct — the fight ended before the promise came due.

Acceptance: the cue does not fire at the health threshold; it fires with the
pattern change and only once; repeated hits below half never leak it early;
a boss killed before the boundary stays silent; non-B59 bosses are untouched.

Playtest: does phase two now read as the boss changing, rather than as a line
of praise you heard several seconds earlier?
