# B99 — Variable Enemies

## Problem

Enemies scaled in lockstep off one difficulty number, and late waves flooded the screen (caps up to 18).

## Change

- **Heart level.** At each stage end, banked run hearts ÷ 20 sets the heart level for the next stage.
- **Speed and health ranges.** Each heart level raises the minimum and, faster, the maximum. Speed: min +3%, max +6% per level. Health: min +0.35, max +0.7 hits per level. Past level 8 growth halves.
- **Aggression (stage-based).** The minimum starts at 1 and rises by a random 1–3 every three stages (4, 7, 10…), uncapped. Range is min to min+3. Its effect has diminishing returns: shorter charger wind-ups (floor 0.3s), faster charges, more frequent sniper shots, slightly faster chasers.
- **Rolls.** Every enemy rolls speed, health and aggression inside the ranges, weighted low. Tough rolls grow slightly and get a white or gold outline. At most two elites on screen.
- **Breather.** The stage after a boss holds all ranges; a due aggression bump waits one stage.
- **Roster.** Stages 1–3 are chasers only. Run stars unlock: Charger 6, Core 14, Sniper 25, Splitter 38, Thief 52. New types start at a third of their weight and mature over three stages, with a NEW ENEMY callout on first sight.
- **Spawning.** Each spawn's gap follows its rolled speed and health, so fast or tough enemies arrive thinner. Caps: 10 landscape, 8 portrait. Replaces B82's stage 7–10 rotations and the flat HP tiers.
- **New enemies.** Sniper keeps ~260px away and fires a telegraphed aimed shot. Splitter breaks into two small chasers. Thief steals a heart from Pip's cargo (or the ground) and flees; kill it to recover the heart, or lose it if it escapes.
- **Bosses.** Heart level adds 9 health per level. Run stars quicken boss rhythm up to 30%. From the third boss, a telegraphed ring volley joins their attacks.

## Unchanged

Every hit costs one shield. Wave kill targets, boss selection and star thresholds for bosses.

## Verified

187 full-bundle checks pass across 88 modules; five mutations of the new rules each turned a named check red. Desktop and 390×844 browser runs spawned every type with no errors.
