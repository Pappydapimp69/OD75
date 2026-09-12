# B90 Dash Readiness

## Player problem

Dash readiness is mostly communicated through the button lane. During combat the eye is already tracking the player, enemies and shots, so the moment a dash becomes available can be missed.

## Change

When dash cooldown crosses from cooling down to ready during live play, a short arena cue pulses around the player and fades. The cue clears when the player dashes, on stage upgrades and on reset.

## Must stay unchanged

- Dash cooldown duration, dash velocity, invulnerability, cooldown reductions and kill scoring.
- Keyboard, touch and gamepad dash input routes.
- Button readiness text/classes and the rest of the HUD.
- Enemy targeting, collisions, spawn logic and stage progression.

## Acceptance checks

- A cooling dash that reaches zero starts the cue exactly once.
- A run that is already dash-ready does not create a cue.
- Pause preserves the cue clock, while stage and reset clear it.
- Dashing clears the cue without changing dash cooldown or dash time.
- The draw helper is visual-only and does not mutate player or cooldown state.

## Playtest question

Does the ring land as useful peripheral information, or does it compete with enemy arrival/target reads?
