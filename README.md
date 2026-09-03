# OVERDRIVE 75

[Play OD75](https://pappydapimp69.github.io/OD75/)

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
