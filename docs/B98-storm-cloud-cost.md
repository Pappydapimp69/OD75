# B98 — Storm Cloud Cost

## Problem

Thunderstorm spent a flat 20% over a one-second hold regardless of clouds, and charging had little on-screen presence.

## Change

- Each cloud costs 8% of maximum HEAT. The first forms on press; another every 0.2s while held, up to five (40%).
- With less than 8% left, gathering pauses (button reads NEED HEAT). It resumes if HEAT comes back while still held.
- A quick tap spends one cloud and strikes once. Focus loss, pause and stage transitions refund every cloud.
- Visuals: a flash, shake and ring on start; a ring, sparks and chime per cloud; a big flash, double ring and "STORM FULL" at five clouds. The sky darkens with each cloud, lightning arcs between gathered clouds, and the button and a caption show the count.

## Unchanged

25% ignition, release-to-strike, cloud targeting, Constellation ricochets and the 1.25s cooldown.

## Verified

182 full-bundle checks pass across 87 modules. Desktop and 390×844 browser holds on the real button formed five clouds for exactly 40% HEAT, showed the full-charge flash and strike on release, with no errors.
