# B73 — Difficulty tier cue

## Player problem

The difficulty pill shows the current heart tier, but crossing a 20-heart boundary can pass unnoticed during collection.

## Change

- Briefly brighten, enlarge, and glow the existing difficulty pill when banking a heart raises the tier.
- Announce the reached tier through the pill's existing status semantics.
- Freeze the one-second cue with the rest of gameplay while paused.

## Acceptance

- Only banked-heart thresholds in stages 4–10 trigger the cue.
- Opening stages and legacy stage scaling never trigger it.
- The pill reports the new tier immediately and returns to its normal style after one second of active play.
- Pause freezes the cue and reset clears it.
