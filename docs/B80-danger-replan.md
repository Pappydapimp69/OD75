# B80 — Reconsider a dangerous route (loop 4/50)

Problem: Pip scores danger when choosing a heart source, but once in flight he keeps that decision even when combat moves onto the patch. The stale commitment reads as blindness rather than courage.

ZaneGPT design lens: treat the target as a state variable, then change it only when new evidence clears a real threshold. Before reaching or mining a source, Pip may switch to a detected alternative that is at least 0.30 safer and 15 adjusted-score points better. A 1.2-second cooldown prevents indecision. The short REROUTING cue and one restrained line expose the decision.

Unchanged: heart values and lifetimes, detection range, cargo capacity and speed, mining cadence, return and reunion rules, emergency Support, Loving Rally, player inputs, enemies and damage. Pip never discards cargo or creates a source.

Acceptance: a newly threatened route changes Pip's actual flight target and direction; no viable alternative preserves the commitment; cooldown prevents immediate reversal; paused time cannot consume the cooldown or cue; nearby/mined sources are not abandoned; reset and stage transition clear transient replan state.

Playtest: does the brief REROUTING tell the story clearly, or does a mid-flight switch still feel twitchy?
