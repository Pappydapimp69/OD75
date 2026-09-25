# B91 Wave Closeout Read

## Player problem

The end of an ordinary wave can become hard to parse when the HUD is competing with combat, especially after spawn and arrival reads add more edge activity.

## Change

When ordinary wave kills reduce the remaining target to 2 or 1, a short arena cue appears around the player with `2 LEFT` or `1 LEFT`. The cue is derived from `S.waveKills` and `S.waveGoal`, fades during live play, preserves during pause, and clears on wave transitions, boss state, stage upgrade or reset.

## Must stay unchanged

- Wave goals, spawn timing, enemy caps, roster selection and break/boss transitions.
- Kill scoring, drops, XP, combo, heat and dash-chain rewards.
- Boss kills and boss phase state.
- Existing HUD text and button state.

## Acceptance checks

- Ordinary kills at 2 and 1 remaining create the matching cue.
- Final kills, boss kills and non-active wave states do not leave a stale cue.
- Pause preserves the cue clock; live update fades it.
- Starting a wave, stage upgrade and reset clear the transient.
- The draw helper is visual-only and does not mutate wave counters.

## Playtest question

Does the closeout cue help you hunt the last enemies faster, or does it add too much player-centered text during already-readable waves?
