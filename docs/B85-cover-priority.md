# B85 — Cover priority (loop 9/50)

Problem: `incomingThreatB59()` picks the threat the Cover arc points at. It
scans `enemyShots` with a time-ordered `soon` comparison, then scans `enemies`
and assigns `best` unconditionally — no time, no comparison. The last
qualifying body in array order wins over every shot, however imminent, and over
every earlier body. Cover itself spends in `hurt()` on whatever actually lands
first, so the arc can point away from the thing that hits you. Compassion has
not been touched since B63 changed what the trait does.

ZaneGPT design lens: a directional cue is a claim about which way to move. A
cue that is right about *a* threat and wrong about *the* threat is worse than
none, because the player acts on it.

Both passes now rank on entry time — when the thing reaches you — on one
0.28-second scale, and the soonest wins. Qualification is untouched: a shot
still needs its closest approach inside the window, a body still needs to be
inside the 0.22-second lookahead. Only the ordering changes.

Unchanged: when Cover spends, its cooldown, the vulnerability and
invulnerability gates, the 0.22s body lookahead, the 7px slack, the arc's shape
and colour, damage, speed and inputs. No new controls, no live model.

Acceptance: an imminent shot keeps the arc against a later body; a body already
inside contact range beats a shot still in flight; between two bodies the
sooner one wins in either scan order; a receding contact still outranks a later
approach; qualification, both gates and Cover spending are unchanged.

Playtest: when Cover fires, was the arc pointing at what hit you?
