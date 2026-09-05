# B71: Emergency cue declutter

B68 made the one-frame `CARGO DROPPED` world popup redundant: the recovery marker, Supportive combat tip, and Pip message now communicate the same event persistently. On small screens it collides with `SHIELD BROKE`. Remove only the cargo-drop world popup. Retain the shield popup, one Pip message, marker, tip, audio cue, cargo physics, and all emergency timing.

Validate that activation emits no cargo-drop popup, still emits the normal shield result, still creates the marker/message/tip, and never repeats. Inspect the phone emergency frame. Playtest question: does removing the redundant text make the rescue readable without weakening its impact?
