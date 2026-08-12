"use strict";
// Pairwise CVD + luminance audit of Pip's Room threat/entity palettes.
// Canon: the-game-recursion#E12 — two ramps authored independently can land
// on the red-green confusion axis AND at near-identical luminance, and the one
// channel that usually saves you (brightness) doesn't. Check every PAIR.

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;

// Brettel-style LMS simulation matrices (linear approximations, adequate for
// a "do these two collide" screen)
const SIM = {
  protanopia:   [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  deuteranopia: [[0.625, 0.375, 0], [0.70, 0.30, 0], [0, 0.30, 0.70]],
  tritanopia:   [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
};
const apply = (m, [r, g, b]) => m.map(row => row[0] * r + row[1] * g + row[2] * b);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// The sets that must be TELLABLE APART. Guard's is safety-critical: one of
// these you must block, one you must deliberately let through.
const SETS = {
  "GUARD threats (block vs LET THROUGH)": {
    "spark (BLOCK)":    "#ff6e8b",
    "heavy (BLOCK)":    "#ffd36f",
    "splitter (BLOCK)": "#b388ff",
    "heart (LET PASS)": "#fff0f5",
  },
  "WISH star kinds": {
    normal: "#ffd36f", fading: "#ff5c9e", shy: "#9adcf0", heavy: "#c9f3ff",
  },
  "HYPE ring types": {
    tap: "#b388ff", hold: "#a8ffd0", double: "#ff5c9e", inBand: "#ffd36f",
  },
};

// thresholds: below these, two things are hard to tell apart by colour alone
const RGB_MIN = 60;   // simulated-colour distance
const LUM_MIN = 26;   // brightness separation

let problems = 0;
for (const [setName, entries] of Object.entries(SETS)) {
  console.log("\n" + setName);
  const names = Object.keys(entries);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const A = hex(entries[names[i]]), B = hex(entries[names[j]]);
      const dl = Math.abs(lum(A) - lum(B));
      const worst = Object.entries(SIM)
        .map(([k, m]) => ({ k, d: dist(apply(m, A), apply(m, B)) }))
        .sort((a, b) => a.d - b.d)[0];
      // a pair is only a PROBLEM if colour AND brightness both fail
      const bad = worst.d < RGB_MIN && dl < LUM_MIN;
      const warn = worst.d < RGB_MIN || dl < LUM_MIN;
      const tag = bad ? "COLLIDE" : warn ? "weak   " : "ok     ";
      if (bad) problems++;
      console.log(`  ${tag} ${names[i]} vs ${names[j]}: ` +
        `${worst.k} dist ${worst.d.toFixed(0)} (min ${RGB_MIN}), ` +
        `luminance gap ${dl.toFixed(0)} (min ${LUM_MIN})`);
    }
  }
}

console.log(problems
  ? `\n${problems} PAIR(S) COLLIDE on both colour and brightness — these must be separated by SHAPE (they are) and should also be separated by luminance.`
  : "\nno pair collides on both axes");
process.exit(0);
