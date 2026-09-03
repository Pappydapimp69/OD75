# B59 — Pip and you

## Player outcome

Pip's emotional traits visibly change its decisions in combat. Each of the first
three bosses provides opportunities to rally, cover, and set up a joint attack.
Movement and the existing dash inputs complete those opportunities.

## Blueprint

- Loving unlocks Rally at level 1: recall a distant collecting Pip as the bond
  weakens, restore the bond on arrival, and briefly preserve it. Higher levels
  improve recall timing, return speed, and grace. Nearby pickups remain possible.
- Compassionate unlocks Cover: when vulnerable, a nearby Pip anticipates and
  intercepts one incoming attack, then visibly recharges. Existing invulnerability
  and Guardian defenses take precedence. Cover never costs currency.
- Supportive unlocks Setup: Pip prepares a bounded, visible dash opportunity.
  Complete it once to deal a joint strike. A warning leads into Fang's distraction;
  Bloom's node opens only its own petal sector. Higher levels improve availability.
- Priority is immediate danger, a weakening bond, then offense. Mixed traits can
  form sequences; one short action lock prevents simultaneous contradictory acts.
- Grump Star: tracking windup, committed fan, recovery; phase two adds a clearly
  separated second fan. All shots follow the displayed, frozen aim.
- Velvet Fang: stalk, visibly commit a pounce, overshoot, recover. Phase two adds
  a signaled follow-up. Supportive Pip can distract during the stalking phase.
- Static Bloom: forecast petal volleys with a physical safe gap. Gaps progress
  from stationary to rotating; phase-two reversals are announced before firing.
- Trait descriptions and the existing pause view explain the behaviors. Brief
  shape-coded arena cues show actual actions. Ascension amplifies the dominant
  learned instinct, preserving B58's 8–12 second cap and energy rules.

## Preserved systems

Existing currencies, rewards, run reset, Sound Lab purchases and pairings,
other four boss behaviors, regular enemies, movement and dash bindings remain.
New state stays inside S and individual boss entities. The final update guard
freezes simulation during pause, stage menus, and game over, including old wrappers.

## Acceptance

- Syntax of every module and the assembled script; exact order after B58.
- Traits unavailable at level zero, upgrades change priorities, mixed traits blend.
- Rally completes without teleporting or repeatedly abandoning adjacent pickups.
- Cover consumes one cooldown only on an eligible threat; no extra damage or
  shield loss, no consumption during invulnerability, no remote interception.
- Setup rewards require crossing the current mark during an actual dash; one
  reward per opportunity; stale marks disappear on death, reset, or phase change.
- Boss commitment is immutable after lock; phase two preserves an escape route;
  Bloom forecasts and projectile geometry share one authoritative gap angle.
- Pause, stage transitions, restart, boss rewards, Sound Lab and Ascended duration
  continue to behave correctly in the fully assembled game.
- Desktop and small-phone browser checks plus keyboard, pointer/touch and
  simulated gamepad input coverage through the real handlers.
- Verify the deployed commit, successful public responses, B59 stamp and bundle.

## Playtest question

Can the player recognize the Pip they raised without reading its dialogue, and
does that change how they approach each boss? Timing values are initial tuning.
