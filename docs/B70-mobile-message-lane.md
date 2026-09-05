# B70: Mobile Pip message lane

On narrow screens, Pip's message at 98px overlaps the combat tip at 88px, especially during Supportive emergency copy. Keep desktop placement. At 560px and below, place Pip's message beneath the 151px resource row at 181px, bound it between 8px screen margins, retain ellipsis, and avoid changing message timing. Mark the existing element as a polite status region so a Pip line is announced once when its text changes.

Validate status semantics, message content and fade state, unchanged emergency tip, and 390px/320px non-overlap against all HUD rows. Playtest question: is the lower message still associated with Pip without covering immediate combat information?
