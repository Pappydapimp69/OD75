# B88 - Perimeter pressure

Problem: ordinary enemy spawns chose one of four edge labels at equal odds, then chose a position on that edge. On unequal screens that over-feeds the shorter pair of edges: portrait phones get too much top/bottom pressure per pixel, while landscape screens get too much side pressure per pixel.

Change: keep the existing 52px offscreen margin, spawn cadence, caps, enemy stats, B82 roster selection, damage, speed, drops, bosses and inputs, but pick the entry point from a uniform distance around the visible rectangle perimeter. Wide edges receive proportionally more spawns because they contain proportionally more perimeter.

Acceptance: deterministic helper rolls land on each exact edge with correct coordinates; portrait and landscape edge shares match visible edge length; the late spawn wrapper preserves enemy construction and B82 composition authority; the complete ordered bundle includes the B88 module after B87.

Playtest: does pressure stop feeling artificially funneled on phones without becoming easier?
