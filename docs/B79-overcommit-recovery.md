# B79 — Recover from overcommitment (loop 3/50)

Problem: a charger that commits to the wrong lane immediately repeats the same tempo, so drawing it away creates little breathing room.

ZaneGPT design lens: let the outcome change the next decision. A charge that never comes within 80 world pixels of the player adds a short reset before the next aim countdown: 0.18 seconds after one miss, capped at 0.36 after repeated misses. A close pass resets that history. The enemy remains vulnerable and contact collisions remain active during reset. A small RESETTING cue identifies the opening.

Unchanged: damage, charge speed, final locked lane, normal warning duration, loot, boss behavior and every player input. No mid-charge adjustment and no permanent debuff.

Acceptance: distant misses create a real delay, close passes do not, repeated misses remain bounded, paused time cannot consume recovery, recovery neither grants invulnerability nor skips ordinary contact handling.

Playtest: is deliberately baiting a charge now a readable, satisfying opening without making chargers passive?
