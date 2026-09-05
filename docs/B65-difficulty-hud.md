# B65: Difficulty HUD

The new curve is hard to evaluate without seeing its active state. Add one compact, noninteractive HUD pill below the Heart Bit wallet. Stages 1–3 read `DIFF · OPENING`. Stages 4–10 show the active heart tier and progress toward the next 20 difficulty-heart boundary; tier 10 reads `MAX`. Stage 11 onward reads `DIFF · STAGE SCALE`. Derive every value from B63's authoritative functions, update through the existing UI pipeline, expose a useful accessibility label/title, fit mobile width, and reset without stale text. Do not alter difficulty or run state.

Validate all three stage bands, the stage-4 opening-heart discount, tier boundaries, max state, reset, and mobile bounds. Playtest question: is the compact label readable during combat without competing with the heart wallet?
