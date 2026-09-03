# OVERDRIVE 75

[Play OD75](https://pappydapimp69.github.io/OD75/)

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
