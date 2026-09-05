# B69: Mobile HUD spacing

The currency HUD's 30px mobile override collides with the tip, Pip level, mood, and new difficulty readout. Preserve the expressive 30px desktop display. At 560px and below, turn currencies into one compact 12px pill at 151px: no wrapping, bounded to the viewport, smaller gaps, translucent backing, and ellipsis overflow. Keep every currency visible in source/accessible text, retain idle/movement fading, and preserve the difficulty and Pip rows above it.

Validate the late CSS contract, all currency items and accessibility labels, state updates, movement fading, and 390px/320px bounds with screenshots. Playtest question: is the compact mobile row readable without blocking combat?
