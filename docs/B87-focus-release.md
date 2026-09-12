# B87 — Focus release (loop 11/50)

Problem: keyboard movement and held actions clear only on their matching keyup
or pointer-release event. If the player changes tabs, switches apps, or locks the
screen while still holding an input, the browser may never deliver that release.
Returning can leave the ship moving, a basic Overdrive draining HEAT, or a
hold-to-buy action completing without the player still holding it.

ZaneGPT design lens: leaving the game is an implicit release. A held action
should describe what the player is doing now, not preserve an input event the
window failed to receive.

On window blur or when the document becomes hidden, clear keyboard movement,
release the touch joystick, reset the pending double-tap gesture, bank a held
basic Overdrive, and cancel active upgrade/Sound Lab holds. The handler is
idempotent because browsers commonly deliver both events for one departure.

Unchanged: pause state, timers, gamepad polling, HEAT amount, Ascended Pip's
automatic drain, pointer and keyboard bindings, purchases, movement speed,
damage, and all focus-gain behavior. No new control, overlay, or live model.

Acceptance: blur clears keyboard and touch motion plus the pending double tap;
a held basic Overdrive banks without spending HEAT; automatic Ascended Pip is
not cancelled; upgrade and Sound Lab holds cannot complete after focus loss;
visibility hiding uses the same release path while a visible event does nothing.

Playtest: after alt-tabbing or switching mobile apps mid-input, does returning
feel inert and predictable without making the game seem paused?
