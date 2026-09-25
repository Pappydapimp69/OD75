# B94 — Hold Contract

## Problem

Skills ignited at mixed thresholds (Beam 50%, other basics 20%, Ascended Pip 100%). Nova and Gravity Well hit while held instead of on release, unlike Thunderstorm. The Sound Lab's mix audition buttons rendered as blank white boxes.

## Change

- Every basic skill ignites at 25% HEAT. Ascended Pip ignites at 70%.
- Press fires, release ends. A held skill keeps going below 25% until released or HEAT runs out.
- Beam and Guardian are continuous: they drain HEAT the whole time they are held.
- Thunderstorm, Nova and Gravity Well are charged area skills. Holding drains HEAT until fully charged (20% over one second), then drains nothing more. Nothing hits until release. Quick taps spend 4%.
- Nova release: one to three expanding shockwaves around you, bigger and harder with more charge.
- Gravity Well release: a singularity at your target that pulls and damages, lasting longer with more charge.
- Focus loss, pause and stage transitions cancel a Nova or Gravity charge and refund its HEAT.
- The Enable sound and Hear Mix buttons now use the game's dark button style.

## Unchanged

Ascended Pip still activates on one tap and drains automatically. Thunderstorm's clouds, ricochets and cooldown. Guardian and Beam effects. HEAT capacity.

## Verified

179 full-bundle checks pass across 83 modules. Desktop and 390×844 browser scenes held Nova on the real button: HEAT fell 60→40 and stopped, enemies were untouched until release, then all took damage. Sound Lab audition buttons read clearly.
