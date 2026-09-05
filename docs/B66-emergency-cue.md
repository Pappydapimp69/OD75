# B66: Emergency return cue

Supportive's forced return is mechanically useful but easy to miss after its cargo disappears. Reuse the existing combat-tip lane while the emergency is active: show `PIP RETURNING` until reunion, then `PIP GUARDING`, plus current shields toward the required 2. On activation, show one cargo-drop popup at Pip and one partnership message; never repeat them each frame. Clear the cue immediately at two shields. Do not alter return movement, firing, cargo lifetime, heart accounting, shield recovery, or pause state.

Validate activation, zero- and multi-cargo copy, no repeated announcement, returning/guarding labels, recovery clearing, unlearned Support, reset, and browser visibility. Playtest question: does the reused tip communicate the rescue without obscuring higher-priority boss information for too long?
