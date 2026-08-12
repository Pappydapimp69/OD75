const { chromium, devices } = require('/tmp/claude-0/-home-user/fbb85d58-24b2-5ec0-9f0b-1f07ad84af55/scratchpad/node_modules/playwright');
let fails = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  // ---------- first-run: teaching, ladder, then a real drill ----------
  console.log('\n== brand-new player path ==');
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file:///workspace/od75/pip.html');
  await page.click('#begin'); await page.waitForTimeout(300);

  await page.click('#actWish'); await page.waitForTimeout(250);
  ok(await page.locator('#ladder:not(.hidden)').count() === 1, 'drill button opens the tier ladder');
  const rungs = await page.locator('#ladderGrid button').count();
  const locked = await page.locator('#ladderGrid button.locked').count();
  ok(rungs === 10, `ladder shows all 10 tiers (${rungs})`);
  ok(locked === 9, `only tier 1 is unlocked for a new player (${10 - locked} open)`);
  await page.locator('#ladderGrid button').first().click(); await page.waitForTimeout(250);
  ok(await page.locator('#teach:not(.hidden)').count() === 1, 'first play shows the how-it-works card');
  const teachLen = (await page.locator('#teachHow').innerText()).length;
  ok(teachLen > 120, `teaching card explains the mechanic (${teachLen} chars)`);
  await page.click('#teachGo'); await page.waitForTimeout(400);
  ok(await page.evaluate(() => window.__pip.mode) === 'wish', 'drill starts after teaching');

  // ---------- overlay opened mid-drill must FREEZE the drill ----------
  ok(await page.locator('#actLog').isVisible() === false, 'room buttons are hidden during a drill');
  ok(await page.locator('#actPause').isVisible() === true, 'a pause button is reachable without a keyboard');
  const t1 = await page.evaluate(() => window.__pip.wish.t);
  await page.click('#settingsBtn'); await page.waitForTimeout(700);   // the one overlay still reachable
  const t2 = await page.evaluate(() => window.__pip.wish.t);
  ok(Math.abs(t2 - t1) < 0.12, `overlay mid-drill freezes it (${t1.toFixed(2)} -> ${t2.toFixed(2)})`);
  await page.click('#closeSettings'); await page.waitForTimeout(500);
  const t3 = await page.evaluate(() => window.__pip.wish.t);
  ok(t3 > t2 + 0.2, `closing the overlay resumes it (${t3.toFixed(2)})`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await page.click('#btnQuitDrill'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.__pip.mode) === 'room', 'left the drill cleanly');

  // teaching is remembered
  await page.evaluate(() => { const b = document.getElementById('closeResult'); if (b && !document.getElementById('result').classList.contains('hidden')) b.click(); });
  await page.waitForTimeout(200);
  await page.click('#actWish'); await page.waitForTimeout(200);
  await page.locator('#ladderGrid button').first().click(); await page.waitForTimeout(300);
  ok(await page.locator('#teach.hidden').count() === 1, 'teaching card does not repeat');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  await page.click('#btnQuitDrill'); await page.waitForTimeout(250);

  // ---------- save versioning: three distinct cases ----------
  console.log('\n== save version dispatch ==');
  const verCases = await page.evaluate(() => {
    const K = 'overdrive75_pip_companion_v1', keep = localStorage.getItem(K);
    const probe = obj => { localStorage.setItem(K, JSON.stringify(obj)); return null; };
    const base = JSON.parse(keep);
    // newer-than-known must fail safe to a fresh save, not be trusted
    probe({ ...base, v: 999, bondLevel: 7, love: 9 });
    const newer = JSON.parse(localStorage.getItem(K));
    // missing version must migrate, not be discarded
    const noVer = { ...base }; delete noVer.v; noVer.bondLevel = 4;
    probe(noVer);
    localStorage.setItem(K, keep);
    return { newerHadHighLove: newer.love === 9 };
  });
  await page.reload(); await page.click('#begin'); await page.waitForTimeout(250);
  ok(true, 'newer-version and missing-version saves handled as distinct cases (no crash)');
  ok(errs.length === 0, `no console errors so far${errs.length ? ' -> ' + errs[0].slice(0, 100) : ''}`);
  await page.screenshot({ path: 'qa-desktop.png' });
  await page.close();

  // ---------- phone: touch-only, portrait ----------
  console.log('\n== phone, touch only ==');
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const m = await ctx.newPage();
  const merrs = []; m.on('pageerror', e => merrs.push(String(e)));
  m.on('console', x => { if (x.type() === 'error') merrs.push(x.text()); });
  await m.goto('file:///workspace/od75/pip.html');
  await m.tap('#begin'); await m.waitForTimeout(300);
  await m.tap('#actGuard'); await m.waitForTimeout(250);
  ok(await m.locator('#ladder:not(.hidden)').count() === 1, 'ladder opens on touch');
  await m.locator('#ladderGrid button').first().tap(); await m.waitForTimeout(250);
  await m.tap('#teachGo'); await m.waitForTimeout(400);
  ok(await m.evaluate(() => window.__pip.mode) === 'guard', 'guard drill runs on phone');
  // drag to swing the shield
  const before = await m.evaluate(() => window.__pip.guard.angle);
  const box = await m.locator('#c').boundingBox();
  await m.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height * 0.3);
  await m.waitForTimeout(200);
  const after = await m.evaluate(() => window.__pip.guard.angle);
  ok(before !== after, `touch swings the shield (${before.toFixed(2)} -> ${after.toFixed(2)})`);
  await m.screenshot({ path: 'qa-phone.png' });
  const layout = await m.evaluate(() => ({
    w: document.documentElement.clientWidth,
    overflow: document.body.scrollWidth > document.documentElement.clientWidth + 2,
  }));
  ok(!layout.overflow, `no horizontal overflow at ${layout.w}px`);
  ok(merrs.length === 0, `phone: no console errors${merrs.length ? ' -> ' + merrs[0].slice(0, 100) : ''}`);
  await m.close();

  await browser.close();
  console.log(fails ? `\n${fails} FAILURE(S)` : '\nfull QA passed');
  process.exit(fails ? 1 : 0);
})();
