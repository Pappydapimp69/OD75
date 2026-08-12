"use strict";
// Tier curve design + smoothness validation for Pip's Room drills.
// Canon: brain-builder#E5 — assert SMOOTHNESS, not just monotonicity (a step
// function is monotonic). opticon#E19 — confirm a difficulty knob moves the
// metric the way its LABEL claims.
//
// Each drill exposes a per-tier config plus a single scalar "pressure" metric
// derived from that config, so the curve can be checked before any game code
// is written around it.

const T = 10;

// ---------------------------------------------------------------- WISH
// identity: spatial routing / prioritization under decay.
// pressure = required collection rate / how much time the router actually has
function wishTier(t) {
  return {
    goal: 6 + t,                                  // stars needed
    time: 34 - t * 0.6,                           // seconds
    spawnEvery: 1.05 - t * 0.03,                  // seconds between spawns
    starLife: 6.6 - t * 0.17,                     // seconds before expiry
    maxMiss: Math.max(3, 8 - Math.floor(t * 0.45)),
    queueMax: 3,
    fading: t >= 3, shy: t >= 5, heavy: t >= 7,
  };
}
function wishPressure(t) {
  const c = wishTier(t);
  const needRate = c.goal / c.time;               // stars per second required
  const supplyWindow = c.starLife;                // how long a star waits
  const typeTax = 1 + (c.fading ? 0.04 : 0) + (c.shy ? 0.05 : 0) + (c.heavy ? 0.04 : 0);
  const missTax = 1 + (8 - c.maxMiss) * 0.02;
  return (needRate / (supplyWindow / 6.6)) * typeTax * missTax;
}

// ---------------------------------------------------------------- HYPE
// identity: rhythm / timing precision.
function hypeTier(t) {
  return {
    rounds: 8 + t,
    band: 12.5 - t * 0.42,                        // px half-width of hit window
    speedMul: 1 + t * 0.055,
    concurrent: t >= 7 ? 3 : t >= 4 ? 2 : 1,
    lives: 3,
    holds: t >= 4, doubles: t >= 6,
    accuracy: 0.6 + t * 0.012,                    // fraction of rounds to pass
  };
}
function hypePressure(t) {
  const c = hypeTier(t);
  // time-in-window shrinks with band and grows with speed -> the real difficulty
  const windowMs = (c.band * 2) / (c.speedMul * 0.19);
  const typeTax = 1 + (c.holds ? 0.05 : 0) + (c.doubles ? 0.06 : 0);
  return (1 / windowMs) * 100 * c.concurrent ** 0.5 * typeTax * (c.accuracy / 0.6) ** 0.5;
}

// --------------------------------------------------------------- GUARD
// identity: reflex + discrimination (block sparks, LET HEARTS THROUGH).
function guardTier(t) {
  return {
    time: 26 + t,
    spawnEvery: 1.22 - t * 0.036,
    speed: 84 + t * 4.5,
    arc: 0.80 - t * 0.017,                        // radians half-width of shield
    needBlocks: 9 + Math.round(t * 1.6),
    maxLeak: Math.max(2, 6 - Math.floor(t / 3)),
    hearts: t >= 3, heavy: t >= 6, splitter: t >= 9,
  };
}
function guardPressure(t) {
  const c = guardTier(t);
  const threatRate = 1 / c.spawnEvery;
  const reachMs = 1000 * (260 / c.speed);         // rough travel time to Pip
  const coverage = c.arc / 0.80;                  // shrinking shield
  const typeTax = 1 + (c.hearts ? 0.05 : 0) + (c.heavy ? 0.04 : 0) + (c.splitter ? 0.05 : 0);
  const leakTax = 1 + (6 - c.maxLeak) * 0.025;
  return (threatRate / coverage) * (400 / reachMs) * typeTax * leakTax;
}

// ------------------------------------------------------------ validation
function check(name, fn) {
  const p = [];
  for (let t = 1; t <= T; t++) p.push(fn(t));
  const norm = p.map(x => x / p[0]);

  // 1. monotonic increasing
  let mono = true;
  for (let i = 1; i < p.length; i++) if (p[i] <= p[i - 1]) mono = false;

  // 2. SMOOTH: no single step may be a huge multiple of the median step
  const steps = [];
  for (let i = 1; i < p.length; i++) steps.push(p[i] - p[i - 1]);
  const sorted = [...steps].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const worst = Math.max(...steps.map(s => s / median));
  const smooth = worst <= 2.6;                    // no cliff

  // 3. total span: tier 10 should be meaningfully harder, not absurd
  const span = p[p.length - 1] / p[0];
  const spanOk = span >= 2.4 && span <= 4.6;   // learnable mastery, not a wall

  console.log(`\n${name}`);
  console.log("  pressure  :", p.map(x => x.toFixed(2)).join(" "));
  console.log("  vs tier1  :", norm.map(x => x.toFixed(2) + "x").join(" "));
  console.log("  monotonic :", mono ? "yes" : "NO");
  console.log(`  smooth    : ${smooth ? "yes" : "NO"} (worst step ${worst.toFixed(2)}x median)`);
  console.log(`  span      : ${span.toFixed(2)}x ${spanOk ? "ok" : "OUT OF RANGE"}`);
  return mono && smooth && spanOk;
}

const ok = [
  check("WISH  (routing/prioritization)", wishPressure),
  check("HYPE  (rhythm/precision)", hypePressure),
  check("GUARD (reflex/discrimination)", guardPressure),
].every(Boolean);

// show the shape of the extremes so the numbers are human-checkable
console.log("\nwish  t1:", JSON.stringify(wishTier(1)), "\nwish t10:", JSON.stringify(wishTier(10)));
console.log("hype  t1:", JSON.stringify(hypeTier(1)), "\nhype t10:", JSON.stringify(hypeTier(10)));
console.log("guard t1:", JSON.stringify(guardTier(1)), "\nguard t10:", JSON.stringify(guardTier(10)));

console.log("\nALL CURVES VALID:", ok);
process.exit(ok ? 0 : 1);
