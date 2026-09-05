# B72 — Heart timer

## Player problem

The heart meter communicates Pip's bond visually, but its exact reserve and Compassion's extra duration are hard to judge during a trip.

## Change

- Show the remaining heart reserve in seconds beside the heart only while Pip is away.
- Derive the value from the same bond and Compassion duration used by gameplay.
- Keep the readout off while Pip is in orbit so the normal HUD stays quiet.

## Acceptance

- The readout falls with the mechanical heart meter and reaches `0.0s` at loneliness.
- Compassion levels increase the displayed reserve by 0.5 seconds each.
- Orbit, stage menus, game over, and inactive runs do not display the timer.
- Existing pause and meter behavior remain unchanged.
