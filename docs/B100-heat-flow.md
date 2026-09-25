# B100 — Heat Flow

## Problem

After B99, HEAT filled slowly. Kills paid HEAT only once combo reached 2 (about six kills, each within 1.35s), and B99's thinner, tougher waves rarely got there. Every kill after the first Overdrive use also paid only 65%.

## Change

- Every ordinary kill gives HEAT: 2.5 × type × toughness × √speed roll × combo bonus, plus the existing +1 chain and +1 dash.
- Type: chaser 1, charger 1.2, core 2.5, sniper 1.3, splitter 1.2, thief 1.5, splitter babies 0.5.
- Toughness: 0.6 + 0.4 × rolled health ÷ base health, so tougher rolls pay more.
- Combo is a bonus of +10% per combo point above 1, not a gate.
- The 65% post-Overdrive cut is gone.
- HEAT still never drains on its own; B25 already restores any passive loss.

## Unchanged

Wish stars (+3), bonus pickups, Cosmic resonance, Overdrive costs and HEAT capacity.

## Verified

190 full-bundle checks pass across 89 modules; three mutations each turned a named check red. In 20 seconds of browser play at stages 1 and 6, HEAT rose 55 and 57 versus 28 and 20 on B99.
