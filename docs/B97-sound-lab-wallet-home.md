# B97 — Sound Lab Wallet Home

## Problem

B96 stopped the Notes / Sound Choices / Mix Choices row from sticking at all. The real problem was narrower: the pinned row covered the top row of Pip Sounds, so selecting or scrolling back to those cards left them hidden.

## Change

- The row stays pinned while scrolling down the lists.
- Selecting a top-row Pip Sound (gamepad, keyboard or pointer) returns the Sound Lab to the top, with the row back in its home position above the cards.
- Scrolling up until the top row slides under the pinned row finishes the trip to the top.

## Verified

180 full-bundle checks pass across 86 modules. Desktop and 390×844 browser scenes: the row pins when scrolled down, wheel-scrolling up snaps home once the top row reaches it, and gamepad selection of a top-row card from deep in the list returns to the top.
