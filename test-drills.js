const { chromium } = require('/tmp/claude-0/-home-user/fbb85d58-24b2-5ec0-9f0b-1f07ad84af55/scratchpad/node_modules/playwright');
const URL = 'file:///workspace/od75/pip.html';
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };

async function fresh(browser, tiers) {
  const page = await browser.newPage({ viewport: { width: 900, height: 760 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.addInitScript(t => {
    localStorage.setItem('overdrive75_pip_companion_v1', JSON.stringify({
      v: 1, bondLevel: 5, bondXP: 0, love: 0, compassion: 0, support: 0,
      energy: 100, snacks: 5, fed: 100, affection: 100, dust: 0,
      decos: [], keeps: [], sCount: 0, tiers: t,
      prefs: { ts: 100, motion: 'auto' }, journal: [], welcomed: 1,
      totals: { feeds: 0, pets: 0, wishes: 0, hypes: 0, guards: 0 },
      best: { wish: 0, hype: 0, guard: 0 }, lastMs: Date.now(),
    }));
  }, tiers);
  await page.goto(URL);
  await page.click('#begin');
  await page.waitForTimeout(250);
  return { page, errs };
}

// sample which entity KINDS actually spawn during a live drill
async function kindsSeen(page, drill, ms) {
  return await page.evaluate(async ({ drill, ms }) => {
    const seen = new Set();
    let maxConcurrent = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      const st = window.__pip[drill];
      if (st) {
        if (drill === 'wish') for (const s of st.stars) seen.add(s.kind);
        if (drill === 'guard') for (const b of st.blips) seen.add(b.kind);
        if (drill === 'hype') {
          const live = st.rings.filter(r => !r.dead);
          maxConcurrent = Math.max(maxConcurrent, live.length);
          for (const r of live) seen.add(r.type);
        }
      }
      await new Promise(r => setTimeout(r, 40));
    }
    return { kinds: [...seen], maxConcurrent };
  }, { drill, ms });
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  // ============ 1. every tier-gated mechanic must actually be WIRED ============
  // canon: a tier modifier declared in config but never invoked is a silent
  // no-op that no syntax check and no smoke test can see.
  console.log('\n== tier mechanics are wired (declared flags produce real entities) ==');
  const wiring = [
    { drill: 'wish',  tier: 1,  expect: ['normal'],  absent: ['fading', 'shy', 'heavy'] },
    { drill: 'wish',  tier: 4,  expect: ['fading'],  absent: ['shy', 'heavy'] },
    { drill: 'wish',  tier: 6,  expect: ['shy'],     absent: ['heavy'] },
    { drill: 'wish',  tier: 8,  expect: ['heavy'],   absent: [] },
    { drill: 'guard', tier: 1,  expect: ['spark'],   absent: ['heart', 'heavy', 'splitter'] },
    { drill: 'guard', tier: 4,  expect: ['heart'],   absent: ['heavy', 'splitter'] },
    { drill: 'guard', tier: 7,  expect: ['heavy'],   absent: ['splitter'] },
    { drill: 'guard', tier: 10, expect: ['splitter'], absent: [] },
    { drill: 'hype',  tier: 1,  expect: ['tap'],     absent: ['hold', 'double'] },
    { drill: 'hype',  tier: 5,  expect: ['hold'],    absent: ['double'] },
    { drill: 'hype',  tier: 8,  expect: ['double'],  absent: [] },
  ];
  for (const w of wiring) {
    const t = { wish: 0, hype: 0, guard: 0 };
    t[w.drill] = w.tier - 1;                     // so playingTier() == w.tier
    const { page, errs } = await fresh(browser, t);
    // hype ends after 3 unanswered rings, so one run samples too few spawns —
    // union the kinds across several runs to test WIRING, not luck
    const runs = w.drill === 'hype' ? 6 : 3;
    const all = new Set(); let maxConcurrent = 0;
    for (let i = 0; i < runs; i++) {
      await page.evaluate(d => { if (window.__pip.mode !== 'room') return; window.__pip.start(d); }, w.drill);
      const r = await kindsSeen(page, w.drill, 5000);
      r.kinds.forEach(k => all.add(k));
      maxConcurrent = Math.max(maxConcurrent, r.maxConcurrent);
      if (runs > 1) { await page.evaluate(() => { const b = document.getElementById('closeResult'); if (b) b.click(); }); await page.waitForTimeout(120); }
    }
    const kinds = [...all];
    const label = `${w.drill} T${w.tier}: saw [${kinds.sort().join(',')}]`;
    ok(w.expect.every(k => kinds.includes(k)), `${label} — expected ${w.expect.join(',')}`);
    ok(w.absent.every(k => !kinds.includes(k)), `${label} — must NOT yet have ${w.absent.join(',') || '(none)'}`);
    if (w.drill === 'hype') {
      const want = w.tier >= 7 ? 3 : w.tier >= 4 ? 2 : 1;
      ok(maxConcurrent <= want && maxConcurrent >= 1, `hype T${w.tier}: concurrent rings ${maxConcurrent} (cap ${want})`);
    }
    ok(errs.length === 0, `${w.drill} T${w.tier}: no console errors${errs.length ? ' -> ' + errs[0].slice(0, 90) : ''}`);
    await page.close();
  }

  // ============ 2. tier 1 is beatable by a competent bot ============
  console.log('\n== tier 1 beatable (bot plays; proves reachable, NOT that it feels fair) ==');

  // WISH bot: always keep the queue full with the nearest unqueued star
  {
    const { page, errs } = await fresh(browser, { wish: 0, hype: 0, guard: 0 });
    await page.evaluate(() => window.__pip.start('wish'));
    const res = await page.evaluate(async () => {
      const P = window.__pip;
      while (P.mode === 'wish' && P.wish) {
        const w = P.wish, pip = P.pip;
        if (w.queue.length < w.cfg.queueMax) {
          let best = null, bd = 1e9;
          for (const s of w.stars) {
            if (s.queued || s.done) continue;
            const d = Math.hypot(s.x - pip.x, s.y - pip.y) / Math.max(0.2, s.life);
            if (d < bd) { bd = d; best = s; }
          }
          if (best) {
            const r = document.getElementById('c').getBoundingClientRect();
            window.dispatchEvent(new Event('noop'));
            document.getElementById('c').dispatchEvent(new PointerEvent('pointerdown',
              { clientX: r.left + best.x, clientY: r.top + best.y, bubbles: true }));
          }
        }
        await new Promise(r => setTimeout(r, 60));
      }
      const sv = P.sv;
      return { score: sv.best.wish, cleared: sv.tiers.wish, love: sv.love, diag: window.__wishDiag || null };
    });
    ok(res.cleared >= 1, `wish T1 cleared by bot (score ${res.score}, tier ${res.cleared}, love ${res.love})`);
    ok(res.love === res.cleared, `wish stat tracks tier (${res.love} == ${res.cleared})`);
    ok(errs.length === 0, 'wish bot run: no console errors');
    await page.close();
  }

  // GUARD bot: aim at the nearest BLOCKABLE threat, never at a heart
  {
    const { page, errs } = await fresh(browser, { wish: 0, hype: 0, guard: 3 }); // T4 has hearts
    await page.evaluate(() => window.__pip.start('guard'));
    const res = await page.evaluate(async () => {
      const P = window.__pip;
      const BLOCK = { spark: 1, heavy: 1, splitter: 1 };
      while (P.mode === 'guard' && P.guard) {
        const g = P.guard, pip = P.pip;
        let best = null, bd = 1e9;
        for (const b of g.blips) {
          if (b.done || !BLOCK[b.kind]) continue;      // deliberately ignore hearts
          const d = Math.hypot(b.x - pip.x, b.y - pip.y);
          if (d < bd) { bd = d; best = b; }
        }
        if (best) g.angle = Math.atan2(best.y - pip.y, best.x - pip.x);
        await new Promise(r => setTimeout(r, 30));
      }
      const sv = P.sv;
      return { cleared: sv.tiers.guard, comp: sv.compassion };
    });
    ok(res.cleared >= 4, `guard T4 cleared by discriminating bot (tier ${res.cleared}, compassion ${res.comp})`);
    ok(errs.length === 0, 'guard bot run: no console errors');
    await page.close();
  }

  // HYPE bot: poll the band and tap inside it
  {
    const { page, errs } = await fresh(browser, { wish: 0, hype: 0, guard: 0 });
    await page.evaluate(() => window.__pip.start('hype'));
    const res = await page.evaluate(async () => {
      const P = window.__pip;
      const c = document.getElementById('c');
      const tap = () => c.dispatchEvent(new PointerEvent('pointerdown', { clientX: 5, clientY: 5, bubbles: true }));
      const rel = () => c.dispatchEvent(new PointerEvent('pointerup', { clientX: 5, clientY: 5, bubbles: true }));
      while (P.mode === 'hype' && P.hype) {
        const h = P.hype;
        let inner = null, bd = 1e9;
        for (const r of h.rings) { if (r.dead) continue; const d = Math.abs(r.r - 64); if (d < bd) { bd = d; inner = r; } }
        const bandPx = Math.max(7, inner ? inner.speed * (h.cfg.bandMs / 1000) : 7);
        if (inner && bd < bandPx * 0.85) {
          if (inner.type === 'hold') { tap(); await new Promise(r => setTimeout(r, 30)); rel(); }
          else if (inner.type === 'double') { tap(); rel(); tap(); rel(); }
          else { tap(); rel(); }
        }
        await new Promise(r => setTimeout(r, 8));
      }
      const sv = P.sv;
      return { cleared: sv.tiers.hype, sup: sv.support, best: sv.best.hype };
    });
    ok(res.cleared >= 1, `hype T1 cleared by bot (tier ${res.cleared}, hits ${res.best}, support ${res.sup})`);
    ok(errs.length === 0, 'hype bot run: no console errors');
    await page.close();
  }

  // ============ 2b. the CEILING is reachable: tier 10 of each drill ============
  console.log('\n== tier 10 reachable within 3 attempts (ceiling, not a wall) ==');
  {
    const { page, errs } = await fresh(browser, { wish: 9, hype: 9, guard: 9 });
    const retry = async (drill, play) => {
      for (let a = 1; a <= 3; a++) {
        await page.evaluate(d => { if (window.__pip.mode === 'room') window.__pip.start(d); }, drill);
        const r = await play();
        await page.evaluate(() => { const b = document.getElementById('closeResult'); if (b) b.click(); });
        await page.waitForTimeout(150);
        await page.evaluate(() => { window.__pip.sv.energy = 100; });
        if (r.tier === 10) return { ...r, attempts: a };
      }
      return { tier: await page.evaluate(() => window.__pip.sv.tiers), attempts: 3 };
    };
    // WISH T10
    const w10 = await retry('wish', () => page.evaluate(async () => {
      const P = window.__pip;
      while (P.mode === 'wish' && P.wish) {
        const w = P.wish, pip = P.pip;
        if (w.queue.length < w.cfg.queueMax) {
          let best = null, bd = 1e9;
          for (const s of w.stars) {
            if (s.queued || s.done) continue;
            const d = Math.hypot(s.x - pip.x, s.y - pip.y) / Math.max(0.2, s.life);
            if (d < bd) { bd = d; best = s; }
          }
          if (best) {
            const r = document.getElementById('c').getBoundingClientRect();
            document.getElementById('c').dispatchEvent(new PointerEvent('pointerdown',
              { clientX: r.left + best.x, clientY: r.top + best.y, bubbles: true }));
          }
        }
        await new Promise(r => setTimeout(r, 55));
      }
      return { tier: P.sv.tiers.wish, love: P.sv.love, diag: window.__wishDiag || null };
    }));
    ok(w10.tier === 10, `wish T10 reachable in ${w10.attempts} attempt(s) ${JSON.stringify(w10.diag)}`);

    // GUARD T10 (hearts + heavy + splitters all live)
    const g10 = await retry('guard', () => page.evaluate(async () => {
      const P = window.__pip;
      const BLOCK = { spark: 1, heavy: 1, splitter: 1 };
      while (P.mode === 'guard' && P.guard) {
        const g = P.guard, pip = P.pip;
        let best = null, bd = 1e9;
        for (const b of g.blips) {
          if (b.done || !BLOCK[b.kind]) continue;
          const d = Math.hypot(b.x - pip.x, b.y - pip.y);
          if (d < bd) { bd = d; best = b; }
        }
        if (best) g.angle = Math.atan2(best.y - pip.y, best.x - pip.x);
        await new Promise(r => setTimeout(r, 25));
      }
      return { tier: P.sv.tiers.guard, comp: P.sv.compassion };
    }));
    ok(g10.tier === 10, `guard T10 reachable in ${g10.attempts} attempt(s)`);

    // HYPE T10 (3 concurrent, holds + doubles, tightest band)
    const h10 = await retry('hype', () => page.evaluate(async () => {
      const P = window.__pip;
      const c = document.getElementById('c');
      const tap = () => c.dispatchEvent(new PointerEvent('pointerdown', { clientX: 5, clientY: 5, bubbles: true }));
      const rel = () => c.dispatchEvent(new PointerEvent('pointerup', { clientX: 5, clientY: 5, bubbles: true }));
      while (P.mode === 'hype' && P.hype) {
        const h = P.hype;
        let inner = null, bd = 1e9;
        for (const r of h.rings) { if (r.dead) continue; const d = Math.abs(r.r - 64); if (d < bd) { bd = d; inner = r; } }
        const bandPx = Math.max(7, inner ? inner.speed * (h.cfg.bandMs / 1000) : 7);
        if (inner && bd < bandPx * 0.85) {
          if (inner.type === 'hold') { tap(); await new Promise(r => setTimeout(r, 25)); rel(); }
          else if (inner.type === 'double') { tap(); rel(); tap(); rel(); }
          else { tap(); rel(); }
        }
        await new Promise(r => setTimeout(r, 6));
      }
      return { tier: P.sv.tiers.hype, sup: P.sv.support, diag: window.__hypeDiag || null };
    }));
    ok(h10.tier === 10, `hype T10 reachable in ${h10.attempts} attempt(s) ${JSON.stringify(h10.diag)}`);
    ok(errs.length === 0, 'tier-10 runs: no console errors');
    await page.close();
  }

  // ============ 3. pause + abandon do not corrupt state ============
  console.log('\n== pause / leave a drill cleanly ==');
  {
    const { page, errs } = await fresh(browser, { wish: 0, hype: 0, guard: 0 });
    await page.evaluate(() => window.__pip.start('guard'));
    await page.waitForTimeout(1200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const pausedShown = await page.locator('#pauseCard:not(.hidden)').count();
    const frozen1 = await page.evaluate(() => window.__pip.guard.t);
    await page.waitForTimeout(700);
    const frozen2 = await page.evaluate(() => window.__pip.guard.t);
    ok(pausedShown === 1, 'Esc opens the pause card');
    ok(Math.abs(frozen2 - frozen1) < 0.05, `drill clock frozen while paused (${frozen1.toFixed(2)} -> ${frozen2.toFixed(2)})`);
    await page.click('#btnQuitDrill');
    await page.waitForTimeout(200);
    const back = await page.evaluate(() => ({ mode: window.__pip.mode, g: window.__pip.guard }));
    ok(back.mode === 'room' && back.g === null, 'leaving a drill returns to the room cleanly');
    ok(errs.length === 0, 'pause path: no console errors');
    await page.close();
  }

  await browser.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nall drill checks passed');
  process.exit(fails ? 1 : 0);
})();
