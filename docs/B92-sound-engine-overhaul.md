# B92 — Sound engine overhaul

## Problem

The soundtrack and effects share too little structure: dense combat can drop important cues, most impacts feel centered, the mix does not react to arena pressure, and the output has only one broad compressor protecting its headroom.

## Change

- Add a dedicated SFX cleanup and presence chain plus a final rumble filter and brick-wall-style limiter.
- Give critical damage, boss and Pip cues priority-based voice stealing so routine fire cannot silence them.
- Pan enemy hit and defeat sounds from their world position, bounded for headphones and phone speakers.
- Smooth an arena-intensity signal from enemy pressure, boss state, health and Overdrive. Use it to brighten the music, widen delay, trim dense SFX and add restrained high-pressure percussion.
- Keep existing Sound Lab layers, unlocks and themes as the musical source material.

## Unchanged

Gameplay state, damage, timing, inputs, progression, Sound Lab costs, audio unlock requirements and mute behavior.

The same release repairs the shared skill gate: Beam fires from 50% HEAT, other basic Overdrives retain their lower threshold, and only Ascended Pip requires a full meter.

## Acceptance

Critical cues survive a full routine voice pool; ordinary cues still obey the cap. Spatial pan is centered at the player and bounded at arena edges. Intensity is bounded, smoothed and pause-safe. The upgraded graph installs once, includes the limiter, and renders every existing wave/boss/Heartfield mix below clipping.

## Playtest

Does combat sound clearer and more physical without the adaptive percussion making late waves tiring?
