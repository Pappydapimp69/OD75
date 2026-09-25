# B95 — Heat Readout

## Problem

The skill button read `8% / 25%`, measuring against the ignition line instead of the meter. The top HEAT bar was a 3px line crowded against the HP bar and easy to miss.

## Change

- The skill button reads HEAT against the meter's maximum (`11 / 100`) until the skill can ignite, then shows its ready label.
- The button fills from the bottom with the whole meter, not the 0–25% span.
- The top HEAT bar is a 10px (8px on phones) full-meter gauge with a bright label and a mark at the equipped skill's ignition point (25%, or 70% for Ascended Pip). The HP row moves down to make room.

## Unchanged

Ignition thresholds, drain, charge and all skill behavior from B94.

## Verified

180 full-bundle checks pass across 84 modules. Desktop 1920×1080 and 390×844 browser scenes show the bar, ignition mark and filled button for Beam, Nova and Ascended Pip.
