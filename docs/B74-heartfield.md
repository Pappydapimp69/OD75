# Pending builds

## B74 — Heartfield

Status: B74 implementation blueprint. Ship as one integrated release rather than separate micro-builds.

### Player problem

Large fights can leave too many individual heart objects on screen. Pip spends too much time selecting nearby singles, while the most interesting transport decisions happen only after cargo is collected.

### Included work

1. **Heart denominations**
   - Ordinary enemies roll 0–3 heart value using enemy-type weights tuned to preserve current average rewards.
   - Values 2 and 3 render as distinct layered heart clusters with `×2` or `×3` clarity.
   - Boss rewards remain individual single hearts and never join nodes.

2. **Heart nodes**
   - Eligible loose drops settle for 2.25 seconds before clustering.
   - Existing nodes capture first within 220px.
   - A new node requires at least 3 total heart value and holds at most 8.
   - Captured drops spiral into the seed with weight-sensitive motion.
   - Full nodes sparkle on independently staggered 3–5 second schedules.

3. **Pip mining**
   - Pip picks up single hearts immediately. Clusters and nodes release one heart value every 0.18 seconds.
   - Every extracted heart weighs 3 cargo points.
   - Pip stops mining and returns at capacity; remaining value stays at the source.
   - Meeting Pip within 30px banks current cargo immediately.

4. **Route choice**
   - Pip scores sources by reachable value, distance, remaining lifetime, and current capacity.
   - A nearby expiring source beats a distant full node.
   - Pip commits to a chosen source unless it disappears, becomes empty, or Rally/emergency behavior overrides it.

5. **Player tuning**
   - Add a Heartfield section to Game Settings and pause Settings.
   - Adjustable values: node radius, settle delay, node capacity, and mining interval.
   - Presets: Sparse, Balanced, and Dense.
   - Invalid saved values fall back safely without changing cargo or upgrades.

6. **Skill compatibility**
   - Heart Sense controls Pip's source-detection distance and existing carry capacity.
   - Swift controls travel speed; cargo weight and loneliness keep their current final multipliers.
   - Compassion keeps its heart-meter duration role.
   - Rally abandons mining cleanly and preserves the source.
   - Supportive emergency return abandons mining, drops carried cargo, and protects that recovery cache exactly as it does now.
   - Ascended Pip mines 20% faster. Gravity increases loose-heart pull speed and radius without changing reward value or node capacity.

7. **Presentation**
   - Nodes stay in the existing pink heart palette, with layered depth and restrained size growth.
   - Mining animates a single heart moving from the source into Pip's cargo orbit.
   - One soft formation sound and a bounded mining rhythm replace repeated pickup noise.
   - Node value, cargo weight, return state, heart timer, and recovery markers remain readable at 390px.

### Decisions

- Use denominations and nodes together because they solve different clutter stages: drops are compact immediately, then old drops consolidate spatially.
- Use 220px rather than 300px so separate combat areas do not collapse into one field.
- Keep a maximum node value of 8.
- Mine denominations one heart at a time so clusters cannot create large cargo overflow.
- Preserve each captured heart's remaining lifetime; nodes do not extend rewards.
- Mine the earliest-expiring value first.
- Keep boss rewards as singles for impact and clarity.
- Do not add a new currency, upgrade, menu step, or direct player mining action.

### Required invariants

- Loose value + node value + Pip cargo + banked value remains conserved through clustering, mining, Rally, emergency return, expiration, stage clear, and reset.
- Difficulty increases only when Pip banks hearts.
- Nodes never duplicate, silently extend, or merge protected emergency cargo.
- Pausing freezes settling, spiraling, mining, decay, sparkle scheduling, and audio scheduling.

### Acceptance

- Deterministic weighted drops preserve current average rewards by enemy type.
- Node ownership, radius, minimum, capacity, split absorption, staggered sparkle, and expiry pass automated checks.
- Mining cadence, cargo weight, over-cap behavior, route scoring, reunion, Relay, Rally, Compassion, Supportive, Ascension, and Gravity pass regression checks.
- Every Heartfield setting validates, applies, persists, resets, and works through pointer, keyboard, and controller routes.
- Desktop and 390px QA scenarios show dense drops, a full node, active mining, burdened return, emergency cargo, and a boss reward without overlap.
- The assembled build, deployment stamp, cache key, and public bundle match exactly.

### Default feel target

A full eight-heart node takes 1.44 seconds to mine, while ordinary and boss singles keep their immediate pickup behavior. That is long enough for the player to notice Pip working and choose whether to meet him, while remaining short enough to keep collection moving during combat.
### Preflight gaps and resolved questions

1. **What is the authoritative reward unit?**
   - Heart value becomes authoritative; object count is only presentation.
   - Add shared helpers for loose value, node value, cargo value, protected value, and total conserved value.
   - Replace every system that currently assumes heartBits.length equals reward value, including cargo weight, safe-cargo counts, recovery markers, QA status, Ascension, cleanup, and tests.

2. **How are multiple lifetimes stored?**
   - Clusters and nodes retain one remaining-lifetime entry per heart value.
   - Expiration removes only the expired value rather than deleting the entire cluster or node.
   - Mining always extracts the earliest-expiring value first.
   - Clustering never resets or extends lifetime.

3. **How are ordinary drop odds balanced?**
   - Chasers: 15% zero, 72% one, 11% two, 2% three; expected value remains exactly 1.0.
   - Chargers and cores: 5% zero, 15% one, 55% two, 25% three; expected value remains exactly 2.0.
   - Chain kills use the defeated enemy's normal table.
   - Boss drops remain their current deterministic count of individual singles.

4. **Do single hearts also require mining time?**
   - No. Pip picks up a single immediately.
   - Only clusters and nodes use the 0.18-second extraction cadence.
   - This preserves boss-reward collection speed and keeps sparse play responsive.

5. **How does partial absorption work?**
   - A node takes only the value that fits.
   - Any remainder stays in the source cluster with its original lifetimes and a downgraded visual.
   - No node may exceed its configured value cap.

6. **How is node ownership deterministic?**
   - Every drop and node receives a monotonic run-scoped ID.
   - A 220px spatial grid is evaluated every 0.25 seconds.
   - Existing nodes claim eligible sources by oldest node ID, then distance, then source ID.
   - New seeds choose the source with the greatest nearby eligible value, then oldest source ID.
   - A hard cap of 24 active nodes prevents runaway object growth; excess drops stay loose.

7. **How does Pip choose a source?**
   - Reachable value equals the smaller of source value and remaining cargo slots, including the existing one-heart overflow allowance.
   - Score: reachable value × 90, minus distance × 0.35, plus up to 240 urgency points during the final three lifetime seconds.
   - Pip keeps the selected source until it empties, expires, leaves validity, or partnership behavior interrupts him.
   - A new source must beat the current score by 20% to prevent route flicker.

8. **What happens when Pip is interrupted while mining?**
   - Rally releases the source lock without removing value.
   - Supportive emergency releases the lock, drops current cargo through the existing protected-cache path, and returns.
   - Cover and Setup do not cancel mining unless their existing movement rules require Pip elsewhere.
   - Reunion banks only extracted cargo; unmined source value remains on the field.

9. **How are deliveries presented?**
   - A multi-heart reunion becomes one banking transaction with one ♥ +N popup and one bounded sound.
   - Praise thresholds crossed by the batch still fire once at the highest crossed threshold.
   - Difficulty recalculates from the final banked total and emits at most one tier cue for the final reached tier.
   - Heart Relay still triggers once per real reunion.

10. **What happens at wave, boss, stage, and reset boundaries?**
    - Nodes continue settling and mining during normal wave breaks.
    - Boss singles remain node-immune for their full lifetime.
    - Opening the stage shop banks Pip's current cargo exactly once but does not bank ground or node value.
    - Stage advance and new-run reset clear remaining field value, node locks, IDs, mining clocks, and sparkle schedules.

11. **How do Gravity and Ascended Pip interact without changing rewards?**
    - Active Gravity expands node pull radius by 25% and increases spiral speed by 50%.
    - Ascended Pip reduces cluster and node mining interval by 20%.
    - Neither effect changes drop odds, value, node capacity, cargo capacity, or expiration.

12. **Where do the new settings live?**
    - Extend the existing shared settings form rather than adding a menu.
    - Put Heartfield controls in a collapsible advanced section used by both the main screen and pause tab.
    - Merge saved settings with versioned defaults so existing movement settings survive migration.
    - Balanced defaults: 220px radius, 2.25s settle delay, value cap 8, 0.18s mining interval.
    - Sparse: 160px, 3.0s, cap 6, 0.22s. Dense: 280px, 1.5s, cap 10, 0.14s.

13. **How is state communicated without more clutter?**
    - The existing cargo label changes to MINE ×N, GATHER, or RETURN weight/capacity.
    - Recovery markers display protected heart value rather than object count.
    - Pip's polite status region announces only source selection, return, and delivery transitions, never every mined unit.
    - Off-screen nodes receive no new beacon; route choice remains Pip's responsibility.

14. **How is audio kept useful?**
    - Formation uses one quiet swirl per completed node, rate-limited globally.
    - Mining uses a short pitched sequence capped at four audible ticks per second.
    - Delivery uses one sound scaled by batch size rather than overlapping one sound per heart.
    - Deterministic production-graph renders must prove wave and boss audibility, mute behavior, voice bounds, and no combat-cue masking.

15. **Who owns pause-sensitive time?**
    - The final B74 update wrapper owns settling, spatial scans, spiraling, mining, expiration, sparkle, and cue timers.
    - It exits before every Heartfield clock when paused, in a stage menu, or at game over.
    - One assembled-state test snapshots all Heartfield clocks together through pause and resume.

16. **How large should the implementation be?**
    - One B74 release may use three ordered modules: value/node authority, Pip/settings integration, and presentation/QA.
    - It receives one version stamp, one regression run, one browser pass, and one deployment.

17. **What performance proof is required?**
    - Run a seeded 200-drop, 60-second soak with active clustering, mining, expiry, Gravity, and camera movement.
    - Assert the 24-node cap, bounded source assignments, no duplicate IDs, no negative value, no NaN positions, and conserved value.
    - Record spatial-scan work and require it to scale with nearby buckets rather than every source-node pair.

18. **What could make the build fail playtesting?**
    - Pip may appear stuck at a node, route scoring may overvalue distant piles, or node motion may compete with combat telegraphs.
    - The chosen defaults address these risks: immediate singles, 1.44-second maximum mining time, 20% route hysteresis, restrained node size, and no off-screen beacons.
    - These defaults are accepted for the first B74 playtest and remain adjustable in-game.