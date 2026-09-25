# B93 — Thunderstorm Charge

## Problem

Thunderstorm says to hold for chained lightning, but currently begins repeated strikes on press. There is no readable charge, release moment, or cooldown.

## Change

- Press begins gathering clouds; no lightning fires on press.
- Release inside 0.18 seconds flashes the screen and strikes one random visible enemy without ricochet.
- Holding spends up to 20 percentage points of the HEAT bar over one second, creating one cloud per four points for a maximum of five. Holding longer spends nothing more.
- Release sends every cloud toward a random visible enemy. On arrival it strikes, then ricochets to nearby enemies once per Constellation level.
- Add a 1.25-second Thunderstorm cooldown and expose charge, cloud count, striking state and cooldown through the existing button.

## Unchanged

One shared skill button, unlocks, Thunderstorm level damage, HEAT capacity progression, Constellation's existing Pip starburst, other Overdrives, enemies and scoring.

## Acceptance

Press causes no damage. Quick release damages exactly one enemy. A full hold creates five clouds, spends exactly 20% HEAT and cannot overspend. Constellation level controls bounce count. Cooldown blocks reactivation. Pause freezes the mechanic; focus loss and transitions cancel safely.

## Playtest

Does one second feel deliberate without making Thunderstorm too slow during panic?
