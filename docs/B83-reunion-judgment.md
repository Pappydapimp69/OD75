# B83 — Reunion judgment (loop 7/50)

Problem: the Loving reunion volley always targets the nearest enemy, even when a slightly farther charger is already heading into the player.

ZaneGPT design lens: distinguish proximity from urgency, and let shared experience support initiative. With run trust at least 0.65, Pip prioritizes a charging enemy whose current committed trajectory will pass within contact radius plus 18 pixels during the next 0.35 seconds. The charger must be within 200 pixels of the player and within the volley's existing 470-pixel range. An enemy already within 65 pixels of the player retains priority. Otherwise the old nearest-target rule remains.

Unchanged: Loving level-three unlock, physical reunion trigger, three-shot count, spread, damage, projectile speed/lifetime, all other weapon targeting, player inputs and enemy stats. No live model or extra control.

Acceptance: actual volley direction changes toward a collision-course charger only after trust; moving-away chargers and close threats preserve nearest targeting; unlock and existing heart-bond guards still work; physical reunion invokes the changed volley without extra shots.

Playtest: does this feel like Pip understands the moment, rather than unpredictably stealing the target?
