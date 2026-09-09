# B77 — Reading movement (loop 1/50)

Problem: chargers react only to a single position, so repeated straight movement never informs their decisions.

ZaneGPT design lens: observe before inferring; commit once the decision is shown. A charger learns a short local velocity estimate during aim, uses at most 28 pixels of lead, and never steers its committed lane. Dash and direction reversal invalidate the observation. No player profiling or external model.

Unchanged: damage, health, speed, warning duration, inputs, loot and boss behavior. New enemies start without observations.

Acceptance: steady motion changes the eventual velocity; stationary motion stays direct; dash and pause do not train the estimate; the prediction is bounded and the committed warning never moves.

Playtest: does the small lead reward changing direction without making chargers feel unfair?
