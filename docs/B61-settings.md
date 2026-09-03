# B61 tuning settings

Expose the discussed movement parameters without rebuilds: Pip base speed, Swift flat increment, Swift percentage increment, flat-every-level versus alternating growth, full-load remaining-speed percentage, and player normal top speed. Keep B60 defaults. Offer the proposed 140 / alternating +10,+1% / 35% preset and a defaults preset. Preview levels 0–8 before applying. Validate finite bounded numbers, save locally on Apply, recalculate the current build while paused, preserve upgrades/cargo, and persist across reloads. A shared form opens from the main screen and from a Settings tab in pause. Keyboard form input must not leak to game shortcuts; controllers can navigate and edit. Reset remains a run reset, not a settings reset. Tests cover formula, validation, persistence, pause, and input paths. Leave nodes and heart drops unchanged.

Playtest question: which speed and load curve makes meeting Pip halfway feel useful while keeping heart collection responsive? No balance change is forced by this build; the player chooses and applies each experiment.

Validation: complete assembled-game checks, actual browser form submission and reload persistence, desktop and 390px pause/main layouts, keyboard tab navigation, and simulated controller navigation through the production input pipeline. Physical controller feel remains a player playtest item.
