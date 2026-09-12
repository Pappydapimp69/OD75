# B89 - Arrival read

Problem: B88 corrected where enemies enter from, but fresh ordinary enemies still become readable only once their bodies are close enough to see. That makes some fair spawns feel like surprise contact, especially on small screens or when HUD attention is elsewhere.

Change: add a short edge-clamped cue for fresh offscreen ordinary enemies. The cue uses enemy type color/shape, fades within 0.9 seconds, and disappears as soon as the enemy is normally visible. It does not alter spawn choice, B88 perimeter weighting, B82 rosters, caps, enemy stats, movement, collision, damage, targeting, drops, bosses, inputs or HUD state.

Acceptance: helper tests cover top/right/bottom/left edge selection and clamping, age fade, suppression for visible/dead/old/boss enemies, and coexistence with B88 spawn geometry. Browser QA exposes a B89 scene with four offscreen arrivals and the full autonomy suite.

Playtest: do new enemies read a beat earlier without making the arena feel busier?
