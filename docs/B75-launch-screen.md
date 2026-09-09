# B75 — Immediate launch

## Player problem

The launch screen explains every control in full sentences before exposing the two actions that matter. At 390×844, both Start and Game Settings begin below the fold; the settings action is also hidden at a common desktop height. The game is ready, but the first screen makes it feel farther away.

## Change

Keep one short live goal, reduce Move, Auto-fire and Dash to scan-level control labels, and place Start plus Settings in one action group. Use a stacked phone layout and a two-button desktop row. Keep the original button nodes so pointer, keyboard and controller listeners remain authoritative.

## Preserved systems

No movement, dash, auto-fire, settings, audio, progression, Heartfield, pause, or controller behavior changes. This build changes only launch-screen copy, hierarchy and responsive layout.

## Acceptance

- The launch screen contains one concise goal and exactly three compact control summaries.
- Start and Settings remain the original interactive elements and retain A/Cross and Y/Triangle labels.
- Both actions are visible without page scrolling at 390×844 and a normal desktop viewport.
- Settings still opens and returns focus to its launch button.
- Start still enters wave 1 through the existing authoritative handler.
- The complete prior suite, assembled module order and public build stamp remain exact.

## Playtest question

Does the compressed screen give a first-time player enough information to start confidently without making a returning player read around the game?
