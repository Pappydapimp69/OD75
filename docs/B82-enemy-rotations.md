# B82 — Late-stage enemy rotations (loop 6/50)

Problem: after stage 6, every ordinary wave reaches the same maximum crowd cap and repeats a 50/22/28 chaser/core/charger mix. Difficulty becomes a constant wall instead of a readable sequence.

ZaneGPT design lens: change the population state, not every enemy variable. Stages 7–10 rotate through a lighter chaser swarm, a core-heavy pressure wave, and a controlled charger finish. Landscape caps step 13/14/15; portrait caps step 10/11/12. The old cap is 18/15. Charger share becomes 10%, 18%, then 24% instead of 28% every wave.

Unchanged: enemy HP, movement speed, attack speed, damage, drops, kill goals, double-spawn rule, bosses, stages 1–6, stage 11+ legacy scaling, Pip and player inputs.

Acceptance: stages 1–6 retain the original spawn path; stages 7–10 expose three deterministic roster profiles and lower caps; each profile can still spawn every ordinary enemy; the third wave remains the most charger-heavy without returning to the old saturation; portrait remains lower-density than landscape; stage 11 restores exact legacy behavior.

Playtest: does the three-wave rhythm create enough breathing room after stage 6 while keeping the final wave tense?
