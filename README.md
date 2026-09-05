# OVERDRIVE 75

[Play OD75](https://pappydapimp69.github.io/OD75/)

## B74: Heartfield

Ordinary enemies now drop zero to three heart value while preserving their previous average rewards. Two- and three-heart drops appear as layered clusters. After 2.25 seconds, nearby ordinary drops spiral into heart nodes holding up to eight hearts. Boss rewards remain individual hearts.

Pip picks up singles immediately and mines clusters or nodes one heart at a time. He chooses sources using value, distance and expiration pressure, keeps the existing one-heart cargo overflow, and banks each reunion as one clear delivery. Rally, Supportive emergency return, Ascended Pip, Gravity, Heart Relay, difficulty tiers and protected recovery caches share the same conserved heart accounting.

Open **Advanced Heartfield tuning** in Game Settings or pause Settings to change node radius, settle delay, node capacity and mining interval, or load Sparse, Balanced and Dense presets. See [the B74 blueprint](docs/B74-heartfield.md).

## B63: Partnership survival

Compassion adds 0.5 seconds of heart-meter duration per level instead of reducing
shield recharge delay. Supportive Pip drops cargo and immediately flies back
when shields fall below 2, using learned Pip attacks at orbit strength during
the return. He stays with you until shields recover to 2. Dropped hearts can be
recovered; they are not banked automatically. The 10% empty-heart speed penalty remains.

Stages 1–3 keep opening difficulty. Stages 4–10 gain one difficulty tier per
20 difficulty hearts, capped at tier 10. On entering stage 4, hearts banked in
stages 1–3 count at one-third value; subsequent hearts count normally. Spending hearts does not reduce
difficulty, and unbanked cargo does not increase it. Stage 11 onward resumes
the original stage/wave/boss scaling. See [the B63 blueprint](docs/B63-partnership-difficulty.md).

## B62: Lonely Pip

When Pip's heart meter is empty, he moves 10% slower after cargo slowdown.
The penalty applies while gathering and returning, and disappears as soon as
the meter has charge again. For example, 35% full-load speed becomes 31.5%
while lonely. Your saved movement settings remain in effect.

## B61: Movement settings

Open **Game settings** on the main screen or **Settings** in the Pip pause menu.
Adjust Pip's starting speed, Swift's flat and percentage increases and upgrade
pattern, the speed remaining at full cargo, and the player's normal top speed.
The table previews every Swift level before you press **Apply settings**.
Changes apply to the current run and save on this browser/device.

Use the **140 / +10 / 1% / 35% preset** to try alternating Swift growth, or
**Load B60 defaults** to restore the original movement. Press Apply after either.
With a controller, Y/Triangle opens main-screen settings; up/down selects controls,
left/right adjusts values, A selects buttons, and B/Start closes the menu.
See [the B61 blueprint](docs/B61-settings.md).

## B60: Heart transport

Pip carries hearts home in a loose cluster. Each heart weighs 3; starting
capacity is 10, and the last pickup may go slightly over. Full cargo halves
his flight speed. Move within 30px of Pip to bank his hearts early.

Heart Sense adds 2 capacity each level. Its range grows by 8px per level through
level 10, then 2px per level, capped at 200px. Swift Pip controls flight speed.
Heart Relay now lasts 0.5 seconds plus 0.1 per extra level, with an eight-second
trigger cooldown and a real delivery required.

Spend multiple Prism Seeds before choosing Continue. Sound Lab mixes now have
distinct recurring music parts in waves and boss fights, with free auditions.
Mix purchases automatically audition the changed part when audio is enabled.
See [the B60 blueprint](docs/B60-heart-transport.md).

## B59: Pip partnership

Raise Pip's emotional traits with Prism Seeds to develop three combat instincts:

- **Loving / Rally:** Pip returns as your bond weakens and briefly keeps it steady.
- **Compassionate / Cover:** nearby Pip intercepts a hit when you're vulnerable,
  then recharges. Watch the small blue recovery arc around Pip.
- **Supportive / Setup:** Pip prepares a gold diamond. Dash through it to finish
  a joint strike. Against Velvet Fang, Pip can draw its pounce; against Static
  Bloom, the diamond opens a passage through the petals.

Grump Star commits to aimed volleys, Velvet Fang stalks and pounces, and Static
Bloom fires petal patterns with visible gaps. Each develops a second phase.
Traits combine, and Ascended Pip amplifies the strongest learned instinct.

Move with WASD/arrows, the floating touch stick, or a controller. Dash with
Space, DASH, two taps/clicks toward a point, or the existing controller bindings.
Open the Pip pause view to inspect your learned instincts.

## Development

Requires Node 22 or newer.

```sh
npm ci
npm test
npm run build
npm run dev
```

Open `http://127.0.0.1:8175/` for the assembled game. `/qa` adds local-only boss,
trait and input fixtures, plus the same checks used by CI. QA controls are never
included in the deployed site.

The Pages workflow assembles the numbered `b21-*.js` modules in order. B59 adds
`b21-46.js` (Pip decisions), `b21-47.js` (bosses) and `b21-48.js` (presentation and
the final simulation guard). See [the blueprint](docs/B59-partnership.md).
