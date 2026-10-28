// git 10-28: the neutral "first touch" clicks moved from (30,30) / (10,10) to (5,60), below the site menu bar (assets/topnav.js), whose brand link sits at the top left and navigated the page away.
// fable 10-19: proto_brotoid against its spec (tests/SPEC.md here; S1-S20). Each target is a check function over an
// observation of the live page; each also runs over a planted observation (one thing broken on purpose) and must fail there.
// A target passes only if its check passes AND its plant is caught. Chromium; S10 also fits in Firefox.
import { chromium, firefox } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8190', URL = process.env.PAGE || BASE + '/brotoid/';   // git 10-27: the page address from the environment (serve this repo with tests/serve.mjs)
const SKIP = (process.env.SKIP || '').split(',');   // fable 10-23: skip whole targets (e.g. SKIP=S15 when headless WebGL crashes); a skipped target is reported, never passed
const OUT = []; const report = (id, name, pass, caught, info = '') => { const ok = pass && caught; OUT.push([id, ok]);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${name}  [check ${pass ? 'passes' : 'FAILS'}, plant ${caught ? 'caught' : 'NOT CAUGHT'}]${info ? '\n      ' + info : ''}`); };
const target = (id, name, check, obs, plant, info) => { let pass = false, caught = false, why = '';
  try { const r = check(obs); pass = r === true; if (r !== true) why = String(r); } catch (e) { why = 'threw ' + e.message; }
  try { caught = check(plant) !== true; } catch (e) { caught = true; }
  report(id, name, pass, caught, [why, info].filter(Boolean).join(' · ')); };
const clone = o => JSON.parse(JSON.stringify(o));

const b = await chromium.launch(), errs = [];
const open = async (w, h) => { const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  p.on('pageerror', e => errs.push(String(e))); await p.goto(URL + '?model=0&t=' + Date.now()); await p.waitForFunction(() => window.__brot, null, { timeout: 60000 });
  await p.waitForFunction(() => __brot.checks().length > 0, null, { timeout: 120000 }); return p; };
const p = await open(1400, 900);
await p.mouse.click(5, 60);   // a reader's first touch: ambient holds, so pictures move only when q moves

// ---- S1 the whole first, and in view; the section's letter lit
async function s1obs(pg) { const out = {};
  for (const [sec, L] of [['s1', 'B'], ['s2', 'R'], ['s3', 'O'], ['s4', 'T']]) {
    await pg.evaluate(id => { const h = document.querySelector('#' + id + ' h2'), band = getComputedStyle(document.getElementById('stagecol')).position === 'sticky' ? document.getElementById('stagecol').getBoundingClientRect().height : 0;
      scrollTo(0, scrollY + h.getBoundingClientRect().top - band - 20); }, sec);
    await pg.waitForTimeout(400);
    out[L] = await pg.evaluate(() => { const f = document.getElementById('fig-brot').getBoundingClientRect(), cells = [...document.querySelectorAll('.cell')];
      return { inView: f.top >= -2 && f.bottom <= innerHeight + 2 && f.height > 100, lit: cells.filter(c => c.classList.contains('lit')).map(c => c.dataset.l),
        dim: document.getElementById('cells').classList.contains('anylit'), qs: [...new Set(cells.map(c => c.dataset.q))] }; }); }
  return out; }
const s1check = o => Object.entries(o).every(([L, v]) => v.inView && v.lit.join() === L && v.dim && v.qs.length === 1) || JSON.stringify(o);
{ const wide = await s1obs(p), pn = await open(390, 844); await pn.mouse.click(5, 60); const narrow = await s1obs(pn);
  const pm = await open(1200, 800); await pm.mouse.click(5, 60); const mid = await s1obs(pm); await pm.context().close();
  // a beat about one letter lights it too
  await p.evaluate(() => __brot.FLOW.play(4, true)); await p.waitForTimeout(2500); const beatO = await p.evaluate(() => __brot.LIT()); await p.evaluate(() => __brot.FLOW.pause('api'));
  const obs = { wide, narrow, mid, beatO }, plant = clone(obs); plant.mid.R.lit = ['B'];
  target('S1', 'the whole first and in view; the section\'s (or beat\'s) letter lit, the rest dimmed, one q (1400, 390, and 1200 with the dock)', o => s1check(o.wide) === true && s1check(o.narrow) === true && s1check(o.mid) === true && o.beatO.join() === 'O' || JSON.stringify(o).slice(0, 300), obs, plant);
  await pn.context().close(); }

// ---- S2 every letter has a picture that moves with q, and its ℂ answer
{ const snap = () => p.evaluate(() => { __brot.drawCells(); return [...document.querySelectorAll('.cell')].map(c => { const cv = c.querySelector('canvas'), x = cv.getContext('2d'), d = x.getImageData(0, 0, cv.width, cv.height).data; let ink = 0, h = 0;
    for (let i = 3; i < d.length; i += 16) { if (d[i] > 20) ink++; h = (h * 31 + d[i] + d[i - 1] + d[i - 2] + d[i - 3]) % 1000000007; } return { l: c.dataset.l, ink, h, c: c.querySelector('.c').textContent }; }); });
  await p.evaluate(() => __brot.setDir(0, 0)); await p.waitForTimeout(200); const a = await snap();
  await p.evaluate(() => __brot.setDir(60, 30)); await p.waitForTimeout(200); const z = await snap();
  await p.evaluate(() => __brot.setDir(0, 0));
  const obs = { a, z }, plant = clone(obs); plant.z[2].h = plant.a[2].h;
  target('S2', 'B, R, O, T each have a picture that changes with q, and a ℂ answer', o => o.a.every((c, i) => c.ink > 30 && c.h !== o.z[i].h && /ℂ/.test(c.c)) || JSON.stringify(o.a.map((c, i) => [c.l, c.ink, c.h === o.z[i].h])), obs, plant); }

// ---- S2·lw the B cell marks l and w (Doug 10-22: "we're not really showing the length/width"); the panel says r does not move B R O T
{ const read = () => p.evaluate(() => { const out = [];
    for (const [lo, la] of [[0, 0], [90, 27], [60, 30], [83, 5], [-120, -15]]) { __brot.setDir(lo, la); __brot.drawCells(); const lw = document.getElementById('cvB').__lw, R = __brot.RQ();
      // the ellipsoid's own extremes, sampled: |J u| over 6000 unit u (a Fibonacci sphere), not the page's SVD
      let mx = 0, mn = Infinity; for (let i = 0; i < 6000; i++) { const z = 1 - 2 * (i + 0.5) / 6000, rr = Math.sqrt(1 - z * z), ph = i * 2.399963229728653, u = [rr * Math.cos(ph), rr * Math.sin(ph), z];
        const n = Math.hypot(...R.J.map(row => row[0] * u[0] + row[1] * u[1] + row[2] * u[2])); mx = Math.max(mx, n); mn = Math.min(mn, n); }
      const mid = Math.hypot(...R.J.map(row => row[0] * R.Vs[1][0] + row[1] * R.Vs[1][1] + row[2] * R.Vs[1][2]));
      out.push({ q: [lo, la], L: Math.hypot(...lw.l), W: Math.hypot(...lw.w), mx, mn, mid, B: R.B, shown: parseFloat(document.getElementById('vB').textContent.replace('B ', '')) }); }
    __brot.setDir(0, 0); return { out, note: document.getElementById('qonly')?.textContent || '' }; });
  const obs = await read(), plant = clone(obs); plant.out.forEach(o => { o.W = o.mid; });
  target('S2·lw', 'the B cell marks the ellipsoid\'s longest axis l and shortest w (no sampled |J u| beyond them), l/w is the B shown; the panel says BROT reads q alone, not r',
    o => o.out.every(c => c.mx <= c.L * (1 + 1e-9) && c.mn >= c.W * (1 - 1e-9) && c.mx > c.L * 0.98 && Math.abs(c.L / c.W - c.B) < 1e-9 * c.B && Math.abs(c.shown - c.B) < 0.006) && /q alone, not r/.test(o.note) || JSON.stringify(o),
    obs, plant, obs.out.map(c => `(${c.q}) B ${c.B.toFixed(3)} = l ${c.L.toFixed(3)} / w ${c.W.toFixed(3)}`).join(' · ')); }

// ---- S3 Doug's order
{ const obs = await p.evaluate(() => ({ first: document.querySelector('#text > section').id, firstLit: document.querySelector('#text > section').dataset.lit,
    h: [...document.querySelectorAll('#text h2')].map(h => h.textContent.replace(/^\d+/, '').trim()) }));
  const WANT = [/^Four words for one number/, /^B:/, /^R:/, /^O:/, /^T:/, /fractal cannot see/, /^B up close/, /^Explore/, /^Words caught/, /^What it is not/, /^Figures/];
  const plant = clone(obs); [plant.h[1], plant.h[2]] = [plant.h[2], plant.h[1]];
  target('S3', "Doug's order: the whole, B, R, O, T, the fractal, B up close, explore, words, checks, figures", o => o.first === 's0' && o.firstLit === 'B,R,O,T' && o.h.length === WANT.length && o.h.every((t, i) => WANT[i].test(t)) || JSON.stringify(o.h), obs, plant); }

// ---- S4 no contradiction: prose numbers = the live cells at that q; the fractal marks strike exactly O, T and the mirror
{ const nums = {};
  for (const [k, [lo, la]] of Object.entries({ conch: [0, 0], thin: [90, 27], mirrorq: [83, 5], one: [0, 90], t60: [0, 60] })) {
    await p.evaluate(([a, b]) => __brot.setDir(a, b), [lo, la]); await p.waitForTimeout(150);
    nums[k] = await p.evaluate(() => ({ B: document.getElementById('vB').textContent.replace('B ', ''), R: document.getElementById('vR').textContent, O: document.getElementById('vO').textContent.replace('O ', ''), T: document.getElementById('vT').textContent.replace('T ', ''),
      hand: document.getElementById('vRm').textContent, chi: __brot.RQ().chi,
      Tturn: (document.getElementById('vTx').textContent.split(' · ×')[0] || ''), Tsize: (document.getElementById('vTx').textContent.split(' · ×')[1] || '') })); }
  await p.evaluate(() => __brot.setDir(0, 0));
  const prose = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-n]')].map(s => [s.dataset.n, s.textContent])));
  await p.evaluate(() => document.querySelector('#s5 h2').scrollIntoView()); await p.waitForTimeout(400);
  const fr = await p.evaluate(() => __brot.unseenNow());
  const obs = { nums, prose, fr }, plant = clone(obs); plant.prose['conch.B'] = '2.30';
  target('S4', 'the prose numbers are the cells\' at that q; hand words agree; §5 strikes O, T and the mirror half only', o => {
    for (const [key, v] of Object.entries(o.prose)) { if (/^size\./.test(key)) continue; const [qn, L] = key.split('.'); if (!o.nums[qn]) continue; if (o.nums[qn][L] !== v) return `${key}: prose ${v}, cell ${o.nums[qn][L]}`; }
    if (!Object.values(o.nums).every(n => (n.chi > 0) === (n.hand === 'keeps'))) return 'hand word';
    return o.fr.cells.sort().join() === 'O,T' && o.fr.mirrorStruck || JSON.stringify(o.fr); }, obs, plant); }

// ---- S5 numbers come from the atoms
{ const raw = await (await fetch(URL)).text(), src = await p.evaluate(() => __brot.RSRC);
  const obs = { raw, src }, plant = { raw: raw.replace('data-n="conch.B"></span>', 'data-n="conch.B">2.62</span>'), src };
  const check = o => { const typed = [...o.raw.matchAll(/data-n="[^"]+">([^<]*)</g)].filter(m => m[1].trim()); if (typed.length) return 'typed number in the HTML: ' + typed[0][0];
    for (const a of ['bristor_product', 'brotoid_weft', 'brotoid_moments']) if (!o.raw.includes(`/codetree/blocks/${a}/v1.js`)) return 'not imported: ' + a;
    return o.src.startsWith('/codetree/blocks/brot_readings/') || `readings from ${o.src}: the candidate, not yet planted in CodeT (insights asked 10-19)`; };
  target('S5', 'numbers come from the atoms; none typed in the HTML', check, obs, plant); }

// ---- S6 checks with plants
{ const obs = await p.evaluate(() => __brot.checks()), name = obs[0].name, plant = await p.evaluate(n => __brot.runChecks(n), name);
  target('S6', `the page's ${obs.length} checks pass, each with its plant caught (plant: one check's plant made harmless)`, o => o.length >= 6 && o.every(c => c.pass && c.caught !== false) || JSON.stringify(o.filter(c => !c.pass || c.caught === false).map(c => c.name)), obs, plant); }

// ---- S7 words caught
{ const read = (pg, plantSpan) => pg.evaluate(ps => { const W = __brot.W, keyOf = new Map(); W.forEach(w => [w.label, ...(w.aliases || [])].forEach(a => keyOf.set(w.cs ? a : a.toLowerCase(), w)));
    const labels = [...keyOf.keys()].sort((a, b) => b.length - a.length).map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`(?<![\\p{L}\\p{N}_])(${labels.join('|')})(?![\\p{L}\\p{N}_])`, 'giu'), root = document.getElementById('text').cloneNode(true);
    if (ps) root.querySelector('#s1').prepend(Object.assign(document.createElement('p'), { textContent: ps }));
    root.querySelectorAll('#s8, #s9 .checks, #s10, script').forEach(e => e.remove());   // headings, .acro and figures stay (brotbot gate S7b)
    const seen = new Set(), bad = [], walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) for (const m of n.textContent.matchAll(re)) { const w = keyOf.get(m[1]) || keyOf.get(m[1].toLowerCase()); if (!w || (w.cs && !keyOf.has(m[1])) || seen.has(w.key)) continue;
      seen.add(w.key); const a = n.parentElement.closest('a.w'); if (!a || a.dataset.t !== w.key) bad.push(`${w.key}: first use "${m[1]}" not marked`); }
    const marks = [...root.querySelectorAll('a.w')].map(a => a.dataset.t), missing = marks.filter(k => !W.some(w => w.key === k) || !document.getElementById('w-' + k.toLowerCase().replace(/[^a-z0-9]+/g, '-')));
    const sents = root.textContent.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/), side = sents.filter(s => /\bcrossings?\b(?! cone| loop)|\bcaustic\b/.test(s) && !/brotoid|skin|\bball\b|before squaring|after squaring/.test(s));
    const s8 = document.getElementById('s8'), cat = document.getElementById('catches'), want = W.filter(w => ['clash', 'two names', 'two senses', 'three senses'].includes(w.standing)).length;
    return { bad, missing, side, catchTop: s8.children[2] === cat, catchN: cat.querySelectorAll('li').length, want }; }, plantSpan);
  const obs = await read(p, null), plant = await read(p, 'The crossing of q is a keep matter.');
  target('S7', 'every term marked at first use, listed in §8 with its standing; clashes on top; crossing/caustic say their side', o => !o.bad.length && !o.missing.length && !o.side.length && o.catchTop && o.catchN === o.want && o.want > 0 || JSON.stringify(o), obs, plant); }

// ---- S8 rank is said
{ const obs = await p.evaluate(() => ({ chips: [...document.querySelectorAll('figure.fig figcaption .chip')].map(c => c.textContent), panel: document.getElementById('qline').textContent }));
  const plant = clone(obs); plant.chips[0] = plant.chips[0].replace(/B\d/g, '');
  target('S8', 'every figure says its rank', o => o.chips.length >= 4 && o.chips.every(c => /\bB\d\b/.test(c)) && /B2/.test(o.panel) || JSON.stringify(o.chips), obs, plant); }

// ---- S9 the reader drives, the page follows
// a reader presses prose they can see: a visible paragraph, hit-tested (caro 10-19: raw box coordinates went offscreen in Firefox)
const pressProse = async () => { const pt = await p.evaluate(() => { for (const el of document.querySelectorAll('main p, section p')) {
    // any point on the paragraph's visible part that is prose, not a link (fable 10-20: the first line's start alone ran out when a link opened every visible paragraph)
    const r = el.getBoundingClientRect(), y0 = Math.max(r.top, 60) + 6, y1 = Math.min(r.bottom, innerHeight - 20) - 6; if (r.height < 12 || y1 < y0) continue;
    for (let y = y0; y <= y1; y += 10) for (const x of [r.left + Math.min(20, r.width / 2), r.left + r.width / 2, r.right - 30]) {
      const hit = document.elementFromPoint(x, y); if (hit && el.contains(hit) && !hit.closest('a,button')) return [x, y]; } }
  return null; }); if (!pt) throw new Error('S9: no visible prose to press'); await p.mouse.click(pt[0], pt[1]); };
{ await p.evaluate(() => { scrollTo(0, 0); __brot.FLOW.play(1); }); await p.waitForTimeout(4600);   // beat 2 is mid-tween, conch -> thin
  await pressProse();   // a reader's press during the track
  const q0 = await p.evaluate(() => [__brot.S.lon, __brot.S.lat, __brot.FLOW.state.playing]); await p.waitForTimeout(1800);
  const q1 = await p.evaluate(() => [__brot.S.lon, __brot.S.lat]);
  await p.evaluate(() => document.getElementById('f1').scrollIntoView({ block: 'center' })); await p.locator('#f1 button.show').click(); await p.waitForTimeout(900);
  await pressProse();
  const s0 = await p.evaluate(() => [__brot.S.lon, __brot.S.lat]); await p.waitForTimeout(1800); const s1 = await p.evaluate(() => [__brot.S.lon, __brot.S.lat]);
  const y0 = await p.evaluate(() => [__brot.S.yaw, __brot.HOLD()]); await p.waitForTimeout(800); const y1 = await p.evaluate(() => __brot.S.yaw);
  const ret = {};
  for (const [k, go] of [['term', async () => { await p.evaluate(() => __brot.FLOW.showTerm('hand')); await p.waitForTimeout(1500); }],
                         ['fact', async () => { await p.evaluate(() => document.getElementById('f1').scrollIntoView({ block: 'center' })); await p.locator('#f1 button.show').click(); await p.waitForTimeout(900); }]]) {
    await p.evaluate(() => { __brot.setDir(90, 0); __brot.setR(0.5); }); await p.waitForTimeout(200); await go();
    const mid = await p.evaluate(() => [__brot.S.lon, __brot.S.lat]); await p.locator('#pf button.bk').click(); await p.waitForTimeout(700);
    ret[k] = { moved: Math.hypot(mid[0] - 90, mid[1]) > 1, back: await p.evaluate(() => [+__brot.S.lon.toFixed(3), +__brot.S.lat.toFixed(3), +__brot.S.r.toFixed(3)]) }; }
  const obs = { playing: q0[2], q0: q0.slice(0, 2), q1, s0, s1, y0: y0[0], hold: y0[1], y1, ret }, plant = clone(obs); plant.ret.fact.back[0] = 0;
  target('S9', 'a reader\'s press pauses the track and the show-me where they are; ambient holds; ⏮ after a show-me returns to where the reader was', o => !o.playing && o.q0.join() === o.q1.join() && o.s0.join() === o.s1.join() && o.hold && o.y0 === o.y1
    && Object.values(o.ret).every(v => v.moved && v.back.join() === '90,0,0.5') || JSON.stringify(o), obs, plant); }

// ---- in motion (brotbot gate 10-19): the whole track at 3x, sampled every 30 ms. A caption that names a q, a letter or a moment must
// agree with the panel for as long as it is on screen; a disagreement counts when it lasts two samples or more.
{ const pt = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage();
  await pt.addInitScript(() => { try { localStorage.setItem('pageflow-reader', JSON.stringify({ r: 3 })); } catch {} });
  pt.on('pageerror', e => errs.push(String(e))); await pt.goto(URL + '?model=0&t=' + Date.now()); await pt.waitForFunction(() => window.__brot && __brot.checks().length > 0, null, { timeout: 120000 });
  await pt.evaluate(() => { window.__samp = []; const st = document.getElementById('pfstub');
    window.__si = setInterval(() => { __samp.push({ cap: st && !st.hidden ? st.textContent.replace(/\s+/g, ' ').trim() : '', lon: __brot.S.lon, lat: __brot.S.lat, lit: __brot.LIT().join(), hand: __brot.handWord(__brot.RQ()), playing: __brot.FLOW.state.playing }); }, 30);
    __brot.FLOW.play(0); });
  await pt.waitForFunction(() => __samp.length > 60 && !__brot.FLOW.state.playing, null, { timeout: 300000, polling: 500 });
  const samp = await pt.evaluate(() => { clearInterval(__si); return __samp; }), mom = await pt.evaluate(() => __brot.momAt(0, 0).map(m => [m.k, m.r.toFixed(3)]));
  await pt.context().close();
  const runs = (S, bad) => { let n = 0, worst = 0, at = ''; for (const x of S) { if (bad(x)) { n++; if (n > worst) { worst = n; at = x.cap; } } else n = 0; } return worst >= 2 ? `${worst} samples: "${at}"` : true; };
  const NAMED = [[/^At the conch\b/, 0, 0], [/^At the thin one\b/, 90, 27], [/^At \(83°, 5°\)/, 83, 5], [/^At q = 1\b/, null, 90], [/^At \(60°, 30°\)/, 60, 30]];
  const off = x => { for (const [re, lo, la] of NAMED) if (re.test(x.cap)) return Math.abs(x.lat - la) > 0.6 || (lo != null && Math.abs(((x.lon - lo + 540) % 360) - 180) > 0.6); return /neither hand/.test(x.cap) && x.hand !== 'on the crossing cone'; };
  const unlit = x => { const m = /^([BROT]), \w+: /.exec(x.cap); return !!m && x.lit !== m[1]; };
  const momBad = x => { const m = /([①②③④]) r (\d\.\d{3})/.exec(x.cap); return !!m && !mom.some(([k, r]) => k === m[1] && r === m[2]); };
  const spoil = (S, test, f) => { const T = clone(S); let k = T.findIndex(test); for (let j = 0; j < 3 && k >= 0 && k + j < T.length; j++) f(T[k + j]); return T; };
  const seen = re => samp.some(x => re.test(x.cap));
  target('S1·track', 'in motion: a caption about one letter is up only while that letter is lit', S => seen(/^B, Bristor: /) && seen(/^T, the brackets: /) && runs(S, unlit), samp, spoil(samp, x => /^B, /.test(x.cap), x => { x.lit = 'B,R,O,T'; }));
  target('S4·track', 'in motion: a caption that names a q is up only while the panel is at that q (and "neither hand" only on the cone)', S => seen(/^At the conch/) && seen(/^At \(83°/) && runs(S, off), samp, spoil(samp, x => /^At the conch/.test(x.cap), x => { x.lon += 5; }));
  target('S5·track', 'in motion: every moment the track says is the atom\'s at the exact conch', S => seen(/①/) && runs(S, momBad), samp, spoil(samp, x => /① r \d/.test(x.cap), x => { x.cap = x.cap.replace(/r \d\.\d{3}/, 'r 0.367'); })   /* the caption with ①'s r, not "Now to ①…" */,
    'atom at the conch: ' + mom.map(m => m.join(' ')).join(', ')); }

// ---- S6 against a broken atom (brotbot's method): serve brot_readings with one reading wrong; §9 must fail. The identity wrapper must pass.
{ const ATOM = /\/codetree\/blocks\/brot_readings\/v1\.js$/, faults = { id: '', R10: 'r.R += 10;', chi: 'r.chi = -r.chi; r.mirror = !r.mirror;', O102: 'r.O *= 1.02;' }, res = {};
  for (const [k, body] of Object.entries(faults)) { const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
    await ctx.route(u => ATOM.test(new globalThis.URL(u).pathname) && !new globalThis.URL(u).search, rt => rt.fulfill({ contentType: 'text/javascript',
      body: `import * as REAL from '/codetree/blocks/brot_readings/v1.js?real';\nexport * from '/codetree/blocks/brot_readings/v1.js?real';\nexport function readings(q) { const r = REAL.readings(q); ${body} return r; }\n` }));
    const pg = await ctx.newPage(); await pg.goto(URL + '?model=0&t=' + Date.now()); await pg.waitForFunction(() => window.__brot && __brot.checks().length > 0, null, { timeout: 120000 });
    res[k] = await pg.evaluate(() => __brot.checks().filter(c => !c.pass).map(c => c.name.slice(0, 40))); await ctx.close(); }
  const plant = clone(res); plant.R10 = [];
  target('S6·faults', '§9 fails when the readings atom is served with R + 10°, the hand flipped, or O × 1.02, and passes with the atom untouched', o => !o.id.length && o.R10.length > 0 && o.chi.length > 0 && o.O102.length > 0 || JSON.stringify(o), res, plant,
    Object.entries(res).map(([k, v]) => `${k}: ${v.length} failed`).join(' · ')); }


// ---- S13 the reverse box: from the panel's readings back to q, the twin without T, and go sets the panel
{ await p.evaluate(() => { __brot.FLOW.pause && __brot.FLOW.pause('reader'); __brot.setDir(90, 27); document.getElementById('rev').scrollIntoView({ block: 'center' }); });
  await p.click('#rvFill'); await p.click('#rvGo'); await p.waitForFunction(() => !/searching/.test(document.getElementById('rvOut').textContent), null, { timeout: 30000 });
  const hits = () => p.evaluate(() => [...document.querySelectorAll('#rvOut .rvhit')].map(b => [+b.dataset.lo, +b.dataset.la]));
  const typed = await p.evaluate(() => ['rvB', 'rvR', 'rvO', 'rvT'].map(id => document.getElementById(id).value)), all = await hits();
  await p.check('#rvNoT'); await p.click('#rvGo'); await p.waitForFunction(() => /T left out/.test(document.getElementById('rvOut').textContent), null, { timeout: 30000 });
  const noT = await hits(); await p.uncheck('#rvNoT');
  const tw = noT.find(h => Math.hypot(((h[0] - 90 + 540) % 360) - 180, h[1] - 27) > 1);
  let at = null, back = null; if (tw) { await p.evaluate(h => { const b = [...document.querySelectorAll('#rvOut .rvhit')].find(b => +b.dataset.lo === h[0] && +b.dataset.la === h[1]); b.click(); }, tw);
    await p.waitForTimeout(300); [at, back] = await p.evaluate(() => [[__brot.S.lon, __brot.S.lat], (r => [r.B, r.R, r.O])(__brot.RQ())]); }
  const obs = { all, noT, tw, at, back, typed: typed.map(Number) }, plant = clone(obs); plant.all = [...obs.all, [180, 27]];
  const near = (h, lo, la) => Math.hypot(((h[0] - lo + 540) % 360) - 180, h[1] - la) < 0.2;
  target('S13', 'the reverse box: the panel\'s readings give back exactly the panel\'s q; with T left out the fold-mirror twin (180°, 27°) comes back, and its go sets the panel there with the same B, R, O',
    o => o.all.length === 1 && near(o.all[0], 90, 27) && o.noT.length === 2 && o.tw && near(o.tw, 180, 27) && near(o.at, 180, 27)
      && Math.abs(o.back[0] - o.typed[0]) < 6e-4 && Math.abs(o.back[1] - o.typed[1]) < 6e-3 && Math.abs(o.back[2] - o.typed[2]) < 6e-4 || JSON.stringify(o), obs, plant); }

// ---- S14 the model sits with the settings: one brotoid_flow frame in the sticky column, in view at the top and at §6, at the page's q and r; a touch pauses the track
if (SKIP.includes('S14')) console.log('SKIP S14'); else { const pf = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage(); pf.on('pageerror', e => errs.push(String(e)));
  await pf.goto(URL + '?t=' + Date.now()); await pf.waitForFunction(() => window.__brot, null, { timeout: 60000 });   // the one page with Fig 2 live: the rest use ?model=0 (headless GL is software; on Intel and NVIDIA Firefox the brotoid costs the page nothing, probe_rate_ff.mjs 10-20)
  await pf.evaluate(() => scrollTo(0, 0)); await pf.waitForFunction(() => __brot.flowgxt()?.ready, null, { timeout: 30000 }); await pf.waitForTimeout(400);
  const inWin = s => s.fr[1] >= -1 && s.fr[1] + s.fr[3] <= s.H + 1 && s.fr[3] >= 160;
  const top = await pf.evaluate(() => __brot.flowgxt());
  await pf.evaluate(() => document.getElementById('s6').scrollIntoView()); await pf.waitForTimeout(500); const s6 = await pf.evaluate(() => __brot.flowgxt());
  const panel6 = await pf.evaluate(() => (r => r.top >= -1 && r.bottom <= innerHeight + 1)(document.getElementById('panel').getBoundingClientRect()));
  await pf.evaluate(() => { __brot.setDir(83, 5); __brot.setR(0.98); }); await pf.waitForTimeout(300); const fol = await pf.evaluate(() => __brot.flowgxt());
  const frames = await pf.evaluate(() => document.querySelectorAll('iframe[src*="brotoid_flow"], #flowgxt').length), inText = await pf.evaluate(() => !!document.querySelector('#text iframe, #text .flowbox, #text #fig-flow'));
  await pf.evaluate(() => { __brot.setDir(0, 0); __brot.setR(0.6); scrollTo(0, 0); }); await pf.waitForTimeout(600); await pf.evaluate(() => __brot.FLOW.play(1)); await pf.waitForTimeout(800);
  const fb = await pf.evaluate(() => (r => [r.left + r.width / 2, r.top + r.height / 2])(document.getElementById('flowfr').getBoundingClientRect()));
  await pf.mouse.click(fb[0], fb[1]); await pf.waitForTimeout(300); const playing = await pf.evaluate(() => __brot.FLOW.state.playing);
  const obs = { top: inWin(top), s6: inWin(s6), panel6, frames, inText, follow: fol.bf && ['lon', 'lat', 'mag', 'r_frac'].every(k => Math.abs(fol.bf[k] - fol.want[k]) < 1e-9), got: fol.bf, want: fol.want, playing };
  const plant = clone(obs); plant.follow = false;
  target('S14', 'the model sits with the settings: one brotoid_flow frame, none of it in the text, wholly in the window at the top and at §6 with the panel, at the page\'s q and r, and a touch on it pauses the track',
    o => o.frames === 1 && !o.inText && o.top && o.s6 && o.panel6 && o.follow && o.playing === false || JSON.stringify(o), obs, plant); await pf.context().close(); }

// ---- S15 the gallery: casts the named q's in order then the sweep, each still at its q, shrinking as it flies; close leaves no seed, Fig 2 live, q unmoved
if (SKIP.includes('S15')) console.log('SKIP S15'); else { const pg = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage(); pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto(URL + '?t=' + Date.now()); await pg.waitForFunction(() => window.__brot && __brot.flowgxt()?.ready, null, { timeout: 60000 });
  const q0 = await pg.evaluate(() => [__brot.S.lon, __brot.S.lat]);
  await pg.evaluate(() => { const N = __brot.gal.NAMED; __brot.gal.open({ list: [...N.slice(0, 3), [null, 150, 30]] }); });
  await pg.waitForFunction(() => __brot.gal.state().done, null, { timeout: 180000 }); await pg.waitForTimeout(2200);
  // where each still sits on the canvas, against q's direction through the seed's view (re-derived here, not read from the page's draw)
  const st = await pg.evaluate(() => { const g = __brot.gal.state(), cv = document.getElementById('galcv'), W = cv.clientWidth, H = cv.clientHeight, M = Math.min(W, H), V = g.view;
    const dir = (lo, la) => { const a = lo * Math.PI / 180, b = la * Math.PI / 180; return [Math.sin(b), Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a)]; }, dt = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    return { g, want: g.stills.map(s => { const d = dir(s.lon, s.lat); return [W / 2 + 0.43 * M * dt(V[0], d), H / 2 - 0.43 * M * dt(V[1], d)]; }) }; });
  const names = st.g.stills.map(s => s.name), imgs = st.g.stills.every(s => s.img), off = Math.max(...st.g.stills.map((s, k) => s.at && s.at[3] >= 1 ? Math.hypot(s.at[0] - st.want[k][0], s.at[1] - st.want[k][1]) : 99));
  const shrank = st.g.stills.every(s => s.at && s.at[2] < st.g.D * 0.9);
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(500);
  const after = await pg.evaluate(() => ({ open: __brot.gal.state().open, seed: document.querySelectorAll('#galbox iframe').length, held: (() => { try { return document.getElementById('flowfr').contentWindow.__bf.S.paused; } catch (e) { return null; } })(), q: [__brot.S.lon, __brot.S.lat] }));
  await pg.context().close();
  const obs = { names, imgs, n: st.g.cast, off, shrank, after, q0 }, plant = clone(obs); plant.names = [names[1], names[0], ...names.slice(2)]; plant.off = 3;
  target('S15', 'the gallery: the named q\'s cast in order, then the sweep, each still at its q to 1 px and smaller than it left; closing leaves no seed and Fig 2 live, and the page\'s q unmoved',
    o => o.n === 4 && o.names.join('|') === 'the conch, i|j|1|' && o.imgs && o.off <= 1 && o.shrank && !o.after.open && o.after.seed === 0 && o.after.held === false && o.after.q.join() === o.q0.join() || JSON.stringify(o), obs, plant); }

// ---- S16 the q setter: insights' cone view in its own frame in Fig 2 (beside or above the model, never over it), at the page's q and r (r in q's units, not r / |q|); the q sphere on its corner
if (SKIP.includes('S16')) console.log('SKIP S16'); else { const pw = await open(1400, 900); await pw.mouse.click(5, 60); await pw.evaluate(() => scrollTo(0, 0));
  await pw.waitForFunction(() => __brot.pip().ready && __brot.pip().draws > 0 || __brot.pip().err, null, { timeout: 30000 });
  await pw.evaluate(() => { __brot.setDir(30, 20); __brot.setR(0.5); }); await pw.waitForTimeout(300);
  const a = await pw.evaluate(() => ({ pip: __brot.pip(), S: [__brot.S.lon, __brot.S.lat, __brot.S.r] }));
  // a reader rolls the q sphere in the PIP, then turns the wheel over the PIP
  const qb = await pw.evaluate(() => (r => [r.left + r.width / 2, r.top + r.height / 2])(document.getElementById('qset').getBoundingClientRect()));
  await pw.mouse.move(qb[0], qb[1]); await pw.mouse.down(); await pw.mouse.move(qb[0] + 25, qb[1] + 10, { steps: 5 }); await pw.mouse.up(); await pw.waitForTimeout(300);
  const rolled = await pw.evaluate(() => ({ pip: __brot.pip(), S: [__brot.S.lon, __brot.S.lat, __brot.S.r], cellq: document.querySelector('.cell').dataset.q }));
  const pb = await pw.evaluate(() => (r => [r.left + r.width * 0.3, r.bottom - r.height * 0.3])(document.getElementById('conecv').getBoundingClientRect()));
  await pw.mouse.move(pb[0], pb[1]); await pw.mouse.wheel(0, -100); await pw.waitForTimeout(300);
  const wheeled = await pw.evaluate(() => ({ pip: __brot.pip(), r: __brot.S.r, rr2: +document.getElementById('rr2').value }));
  // the cone's lines against det J taken from the product atom by central differences (exact for a square, up to rounding): a second channel, not the weft atom's detJ
  const cone = await pw.evaluate(async () => { const { square } = await import('/codetree/blocks/bristor_product/v1.js'), { CONE } = await import('/codetree/blocks/brotoid_weft/v1.js');
    const E3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], e = 1e-4, nz = v => { const l = Math.hypot(...v); return v.map(t => t / l); };
    const J = x => E3.map(v => { const p = square(x.map((t, k) => t + e * v[k])), m = square(x.map((t, k) => t - e * v[k])); return p.map((t, k) => (t - m[k]) / (2 * e)); });
    const det = M => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
    const scale = Math.max(...E3.map(v => Math.abs(det(J(v))))), rel = d => Math.abs(det(J(nz(d)))) / scale;
    const tilt = d => { const p = nz([d[1], -d[0], 0].some(Boolean) ? [d[1], -d[0], 0] : [0, d[2], -d[1]]), a = Math.PI / 180; return d.map((t, k) => t * Math.cos(a) + p[k] * Math.sin(a)); };
    let on = 0, offMax = 0, n = 0; for (let i = 0; i < CONE.length; i += 12) { n++; on = Math.max(on, rel(CONE[i].d)); offMax = Math.max(offMax, rel(tilt(CONE[i].d))); }
    return { n, on, offMax }; });
  const pn = await open(390, 844); await pn.mouse.click(5, 60); await pn.waitForTimeout(400); const narrow = await pn.evaluate(() => __brot.pip());
  // its own frame at two window shapes: beside the model on a short window, above it on a tall one
  const frames = []; for (const [w, h] of [[1366, 768], [1920, 1000]]) { const pf = await open(w, h); await pf.mouse.click(5, 60); await pf.evaluate(() => scrollTo(0, 0)); await pf.waitForTimeout(500); frames.push({ w, h, ...(await pf.evaluate(() => __brot.pip())) }); await pf.context().close(); }
  await pn.context().close(); await pw.context().close();
  const obs = { a, rolled, wheeled, narrow }, plant = clone(obs); plant.a.pip.r = obs.a.pip.r * 0.9;   // the named risk at |q| = 1: the cone view's own 0.9 unit (crease_live's MAG) leaking into the setter's r
  const same = (s, pip) => pip.Qd[0] === s[0] && pip.Qd[1] === s[1] && pip.r === s[2];
  const apart = p => p.box[2] <= p.model[0] + 1 || p.box[3] <= p.model[1] + 1;   // the setter's frame and the model's share no pixel
  const fits = p => p.box[0] >= p.stage[0] - 1 && p.box[1] >= p.stage[1] - 1 && p.box[2] <= p.stage[2] + 1 && p.box[3] <= p.stage[3] + 1 && apart(p) && p.box[2] - p.box[0] > 120 && p.box[3] - p.box[1] > 100;
  target('S16', 'the q setter: the cone-ball view at the page\'s q and r (r in q\'s units), in its own frame inside Fig 2, sharing no pixel with the model; a roll of its q sphere and a wheel over it move the panel; one q sphere, shown, in the setter (wide) and in the panel (narrow)',
    o => !o.a.pip.err && o.a.pip.ready && o.a.pip.on && o.a.S.join() === '30,20,0.5' && same(o.a.S, o.a.pip) && fits(o.a.pip) && o.a.pip.inPip && o.a.pip.qsShown && o.a.pip.nQs === 1
      && (o.rolled.S[0] !== 30 || o.rolled.S[1] !== 20) && same(o.rolled.S, o.rolled.pip) && o.rolled.cellq === `${Math.round(o.rolled.S[0])},${Math.round(o.rolled.S[1])}` && o.rolled.pip.draws > o.a.pip.draws
      && o.wheeled.r > o.rolled.S[2] && o.wheeled.pip.r === o.wheeled.r && Math.abs(o.wheeled.rr2 - o.wheeled.r) < 1e-9
      && !o.narrow.on && o.narrow.inPanel && o.narrow.qsShown && o.narrow.nQs === 1 || JSON.stringify(o), obs, plant);
  target('S16·cone', `every cone line drawn is det J = 0 by the product atom's finite differences (${cone.n} lines), and a line tilted 1° is not (the plant)`,
    o => o.n > 50 && o.on < 1e-6 || JSON.stringify(o), cone, { n: cone.n, on: cone.offMax }, `on-cone max ${cone.on.toExponential(2)}, tilted max ${cone.offMax.toExponential(2)}`);
  // Doug 10-21: "the setter needs its own frame rather than be PIP frame". The plant is the old PIP, over the model's top left
  const fplant = clone(frames); fplant[0].box = [fplant[0].model[0] + 8, fplant[0].model[1] + 8, fplant[0].model[0] + 308, fplant[0].model[1] + 248];
  target('S16·frame', 'the setter in its own frame: beside the model at 1366×768, above it at 1920×1000, inside Fig 2 and sharing no pixel with the model, the q sphere in it',
    o => o.length === 2 && o[0].side === 'beside' && o[1].side === 'above' && o.every(p => !p.err && p.ready && p.on && p.inPip && p.qsShown && p.nQs === 1 && fits(p)) || JSON.stringify(o.map(p => ({ w: p.w, side: p.side, box: p.box, model: p.model, stage: p.stage }))), frames, fplant,
    frames.map(p => `${p.w}: ${p.side}, setter ${Math.round(p.box[2] - p.box[0])}×${Math.round(p.box[3] - p.box[1])}, model ${Math.round(p.model[2] - p.model[0])}×${Math.round(p.model[3] - p.model[1])}`).join(' · ')); }

// ---- S10 figures carry Fig N, a ref hook and their state; ink-light print; 390 px and mid widths
{ const figs = await p.evaluate(() => ({ figs: [...document.querySelectorAll('figure.fig')].map(f => ({ id: f.id, n: /Fig \d/.test(f.querySelector('figcaption')?.textContent || ''), chip: !!f.querySelector('.chip'), ref: !!f.querySelector('.ref') })),
    list: document.querySelectorAll('#figlist li').length, audit: __brot.FIGS.audit() }));
  await p.evaluate(() => { const g = document.querySelector('.galbox'); if (g) g.style.background = 'rgb(4, 6, 11)'; });   // what the gallery's snap() sets at run time (brotbot g21)
  await p.emulateMedia({ media: 'print' }); await p.evaluate(() => dispatchEvent(new Event('beforeprint'))); await p.waitForTimeout(800);
  const printed = await p.evaluate(() => { const lum = c => { const m = c.match(/\d+(\.\d+)?/g); if (!m || (m.length > 3 && +m[3] === 0)) return 255; return 0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]; };
    return { darkBg: [...document.querySelectorAll('figure.fig, .galbox, .fig > div')].filter(e => e.offsetParent && lum(getComputedStyle(e).backgroundColor) < 64).map(e => e.id || e.className),
      controls: [...document.querySelectorAll('#text input, #text select, #text button')].filter(e => e.offsetParent && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden').map(e => e.id || e.className || e.tagName) }; });
  const dark = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('canvas')].filter(c => c.width && c.height && c.offsetParent).map(c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0, k = 0;
    for (let i = 0; i < d.length; i += 4) { k++; if (d[i + 3] > 128 && (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) < 64) n++; } return [c.id || c.className, +(n / k).toFixed(3)]; })));
  await p.emulateMedia({ media: 'screen' }); await p.evaluate(() => dispatchEvent(new Event('afterprint')));
  const widths = {}; for (const [w, eng] of [[390, 'c'], [1100, 'c'], [1200, 'c'], [390, 'f']]) { const br = eng === 'f' ? await firefox.launch() : b, pg = await (await br.newContext({ viewport: { width: w, height: 800 } })).newPage(), e2 = [];
    pg.on('pageerror', e => e2.push(String(e))); await pg.goto(URL + '?model=0&t=' + Date.now()); await pg.waitForFunction(() => window.__brot, null, { timeout: 60000 }); await pg.waitForTimeout(600);
    widths[eng + w] = await pg.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth); if (e2.length) widths[eng + w + 'err'] = e2.join(' | ');
    if (eng === 'f') await br.close(); else await pg.context().close(); }
  const obs = { ...figs, dark, widths, printed }, plant = clone(obs); plant.list -= 1; plant.printed = { darkBg: ['galbox'], controls: ['rvGo'] };
  target('S10', 'Fig N + chip + ref on every figure, all listed; print ink-light (≤ 15% dark, run-time backgrounds too, no controls); no sideways scroll at 390, 1100, 1200 (and Firefox 390)',
    o => o.figs.every(f => f.n && f.chip && f.ref) && o.list === o.figs.length && !o.audit.length && Object.values(o.dark).every(v => v <= 0.15) && Object.entries(o.widths).every(([k, v]) => v === true) && !o.printed.darkBg.length && !o.printed.controls.length || JSON.stringify({ figs: o.figs, list: o.list, audit: o.audit, dark: o.dark, widths: o.widths, printed: o.printed }), obs, plant,
    'dark: ' + JSON.stringify(dark)); }

// ---- S11 current knowledge only: the banned words are the ones brotdocs' notation_vocabulary_map retires (s11_words.mjs), never a
// hand-written list (proto_dictionary D6, 10-21: the old list banned crease and join, both current). A retired SENSE of a current word is not a ban.
{ const { MAP_URL, retiredFromMap, bannedRx } = await import('./s11_words.mjs'), RW = retiredFromMap(await (await fetch(MAP_URL + '?t=' + Date.now())).text());
  const read = ps => p.evaluate(([ps, src]) => { const k = document.body.cloneNode(true); if (ps) k.querySelector('#s1').append(Object.assign(document.createElement('span'), { textContent: ps }));
    k.querySelectorAll('script, style, svg, #pfdock, #pf, [class*="sign"], [class*="glyph"]').forEach(e => e.remove());
    return (k.textContent + ' ' + [...k.querySelectorAll('[title], [aria-label]')].map(e => (e.title || '') + ' ' + (e.getAttribute('aria-label') || '')).join(' ')).match(new RegExp(src, 'giu')) || []; }, [ps, bannedRx(RW.words).source]);
  const obs = await read(null), plant = await read(RW.words.map(w => 'the ' + w).join(', '));
  target('S11', `no word the map retires (${RW.words.join(', ')}) anywhere a reader sees (plant: each of them)`, o => o.length === 0 || o.join(), obs,
    plant.length - obs.length === RW.words.length ? plant : [], `plant found ${plant.length - obs.length} of ${RW.words.length} · retired senses (not banned): ${RW.senses.map(s => s.word + ' → ' + s.now).join(', ')}`); }

// ---- S17 words from the map (Doug 10-22: "updates of terms feed in"): a listed word the map files shows the map's standing, read live; every
// map word a reader sees is listed. Plants: the map blocked (the typed standings stand), and brim dropped from the list.
{ const { MAP_URL, standingsFromMap, mapTerms } = await import('./s11_words.mjs'), md = await (await fetch(MAP_URL + '?t=' + Date.now())).text(), ST = standingsFromMap(md), TERMS = mapTerms(md);
  const chips = pg => pg.evaluate(async () => { await new Promise(r => { const t = setInterval(() => { if (__brot.mapSt() !== null) { clearInterval(t); r(); } }, 50); });
    return { st: __brot.mapSt() ? 'read' : 'unread', src: document.getElementById('mapsrc').textContent, n: document.querySelectorAll('#words .wd').length, nW: __brot.W.length,
      chips: __brot.W.filter(w => w.map).map(w => ({ k: w.key, map: w.map, chip: document.querySelector('#w-' + w.key.toLowerCase().replace(/[^a-z0-9]+/g, '-') + ' .st.map')?.textContent ?? null })) }; });
  const live = await chips(p), ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.route(u => new globalThis.URL(u).pathname.endsWith('notation_vocabulary_map.md'), rt => rt.abort());
  const pb = await ctx.newPage(); pb.on('pageerror', e => errs.push(String(e))); await pb.goto(URL + '?model=0&t=' + Date.now()); await pb.waitForFunction(() => window.__brot, null, { timeout: 60000 });
  const blocked = await chips(pb); await ctx.close();
  target('S17·live', 'a listed word the map files shows the map\'s standing, read live each load (filed or posed, then its label); with the map unreachable the typed standings stand and §8 says so',
    o => o.live.st === 'read' && o.live.chips.length >= 8 && o.live.chips.every(c => c.chip === ST[c.map]) && o.blocked.st === 'unread' && /could not be read/.test(o.blocked.src) && o.blocked.chips.every(c => c.chip === null) && o.blocked.n === o.blocked.nW || JSON.stringify(o),
    { live, blocked }, { live: blocked, blocked }, live.chips.map(c => `${c.k}: ${c.chip}`).join(', '));
  const listed = drop => p.evaluate(([terms, drop]) => { const W = __brot.W.filter(w => w.key !== drop), names = W.flatMap(w => [w.key, w.label, ...(w.aliases || [])]).map(s => s.toLowerCase());
    const k = document.body.cloneNode(true); k.querySelectorAll('script, style').forEach(e => e.remove()); let txt = k.textContent.toLowerCase();
    for (const n of [...names].sort((a, b) => b.length - a.length)) if (n.includes(' ')) txt = txt.split(n).join(' ');   // a map word inside a longer listed name, or a hyphened one (direction-field), is that name
    const hit = t => new RegExp(`(?<![\\p{L}\\p{N}-])${t}s?(?![\\p{L}\\p{N}-])`, 'iu').test(txt), CATCH = ['clash', 'two names', 'two senses', 'three senses'];
    return { unlisted: terms.filter(t => hit(t) && !names.includes(t) && !names.includes(t + 's')), undeclared: W.filter(w => terms.includes(w.key.toLowerCase()) && !w.map && !CATCH.includes(w.standing)).map(w => w.key), seen: terms.filter(hit) }; }, [TERMS, drop]);
  const lo = await listed(null), lp = await listed('brim');
  target('S17·listed', 'every word the map files that a reader sees is in §8; a listed word the map files takes the map\'s standing or declares its own senses',
    o => !o.unlisted.length && !o.undeclared.length && o.seen.includes('brim') && o.seen.includes('rim') || JSON.stringify(o), lo, lp, 'seen: ' + lo.seen.join(', ')); }

// ---- S18 the eye of the brim, squared, on Fig 5 (Doug 10-22: "show the pink plate"). Every corner is on the brim (det J by finite differences
// of the product atom) and inside the ball; its drawn point is its square less q²; the quads cover every pair of neighbouring rays the ball
// reaches, counted here from the lines alone; none before ①. Plant: the eye taken at r + 0.05.
{ const read = dr => p.evaluate(async dr => { const { square } = await import('/codetree/blocks/bristor_product/v1.js'), { CONE } = await import('/codetree/blocks/brotoid_weft/v1.js'), { eyeQuads } = await import(new URL('brim_eye/v1.js', location.href).href);
    const sub = (a, b) => a.map((v, i) => v - b[i]), nrm = a => Math.hypot(...a), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const fdDet = x => { const h = 1e-6, J = [0, 1, 2].map(k => { const e = [0, 0, 0]; e[k] = h; const a = square(x.map((v, i) => v + e[i])), b = square(x.map((v, i) => v - e[i])); return a.map((v, i) => (v - b[i]) / (2 * h)); });
      return J[0][0] * (J[1][1] * J[2][2] - J[2][1] * J[1][2]) - J[1][0] * (J[0][1] * J[2][2] - J[2][1] * J[0][2]) + J[2][0] * (J[0][1] * J[1][2] - J[1][1] * J[0][2]); };
    const out = []; for (const [lo, la] of [[0, 0], [90, 27], [60, 30], [83, 5], [-120, -15]]) { __brot.setDir(lo, la); const M = __brot.momAt(lo, la), r1 = M.find(m => m.k === '①').r;
      for (const r0 of [r1 - 0.02, r1 + 0.05, 0.6, 1.1]) { __brot.setR(r0); const r = __brot.S.r, Q = __brot.q(),   // r as the page holds it (its slider stops at 0.05)
        Q2 = square(Q), BR = __brot.br(), E0 = dr ? eyeQuads(Q, r + dr) : BR.eye0, E = dr ? E0.map(qd => qd.map(x => sub(square(x), Q2))) : BR.eye;
        let off = 0, out_ = 0, img = 0; E0.forEach((qd, i) => qd.forEach((x, j) => { if (Math.abs(fdDet(x)) > 1e-6 * (1 + nrm(x) ** 3)) off++; if (nrm(sub(x, Q)) > r + 1e-9) out_++; if (nrm(sub(E[i][j], sub(square(x), Q2))) > 1e-12) img++; }));
        // the rays the ball reaches, from the lines alone (every other 0.25° line, as the eye's quads): each line's two rays (±d), each reached if the sphere's chord has a point on its side of 0
        const LN = CONE.filter((_, k) => k % 2 === 0), n = LN.length, hit = [];
        for (let j = 0; j < 2 * n; j += 2) { const d = LN[j % n].d, sg = j < n ? 1 : -1, b = dot(Q, d), disc = b * b - dot(Q, Q) + r * r; hit.push(disc >= 0 && Math.max(sg * (b + Math.sqrt(disc)), sg * (b - Math.sqrt(disc))) > 0); }
        const pairs = hit.filter((h, j) => h && hit[(j + 1) % hit.length]).length;
        out.push({ q: [lo, la], r: +r.toFixed(3), before: r < r1, n: E0.length, pairs, off, out: out_, img }); } }
    __brot.setDir(0, 0); __brot.setR(0.6); return out; }, dr);
  const obs = await read(0), plant = await read(0.05);
  target('S18', 'Fig 5 fills the eye of the brim, squared: every corner on the brim and in the ball, drawn as its square less q², a quad for every pair of neighbouring rays the ball reaches, none before ①',
    o => o.every(c => c.off === 0 && c.out === 0 && c.img === 0 && c.n === c.pairs && (!c.before || c.n === 0)) && o.some(c => c.n > 100) || JSON.stringify(o.filter(c => c.off || c.out || c.img || c.n !== c.pairs || (c.before && c.n))),
    obs, plant, obs.filter(c => !c.before).map(c => `(${c.q}) r ${c.r}: ${c.n}`).join(' · ')); }

// ---- S18·rim Fig 3's pink line on the ball is the rim (Doug 10-22: "pink band on sphere looks wrong"): on the sphere and on the brim. Plant: the
// weft's ball points (crossing().runs), which it drew until 10-22.
{ const read = old => p.evaluate(async old => { const { square } = await import('/codetree/blocks/bristor_product/v1.js'), { crossing } = await import('/codetree/blocks/brotoid_weft/v1.js');
    const sub = (a, b) => a.map((v, i) => v - b[i]), nrm = a => Math.hypot(...a);
    const fdDet = x => { const h = 1e-6, J = [0, 1, 2].map(k => { const e = [0, 0, 0]; e[k] = h; const a = square(x.map((v, i) => v + e[i])), b = square(x.map((v, i) => v - e[i])); return a.map((v, i) => (v - b[i]) / (2 * h)); });
      return J[0][0] * (J[1][1] * J[2][2] - J[2][1] * J[1][2]) - J[1][0] * (J[0][1] * J[2][2] - J[2][1] * J[0][2]) + J[2][0] * (J[0][1] * J[1][2] - J[1][1] * J[0][2]); };
    const out = []; for (const [lo, la] of [[0, 0], [90, 27], [60, 30], [83, 5], [-120, -15]]) { __brot.setDir(lo, la); const r1 = __brot.momAt(lo, la).find(m => m.k === '①').r;
      for (const r0 of [r1 + 0.05, 0.6, 1.1]) { __brot.setR(r0); const r = __brot.S.r, Q = __brot.q();
        const segs = old ? crossing(Q, r, { kinds: false }).runs.flatMap(run => run.slice(1).map((x, k) => [run[k].x, x.x])) : __brot.rim();
        let offS = 0, offC = 0, n = 0; for (const s of segs) for (const x of s) { n++; if (Math.abs(nrm(sub(x, Q)) - r) > 1e-9) offS++; if (Math.abs(fdDet(x)) > 1e-6 * (1 + nrm(x) ** 3)) offC++; }
        out.push({ q: [lo, la], r: +r.toFixed(3), n, offS, offC }); } }
    __brot.setDir(0, 0); __brot.setR(0.6); return out; }, old);
  const obs = await read(false), plant = await read(true);
  target('S18·rim', 'Fig 3\'s pink line on the ball is the rim: every point on the sphere |x − q| = r and on the brim (det J = 0 by finite differences)', o => o.every(c => c.n > 0 && !c.offS && !c.offC) || JSON.stringify(o.filter(c => !c.n || c.offS || c.offC)),
    obs, plant, obs.map(c => `(${c.q}) r ${c.r}: ${c.n}`).join(' · ')); }

// ---- S12 links held, not shown (Doug 10-20, via sites): the three outbound links sit in HTML comments, none rendered
{ const out = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')));
  const raw = await (await fetch(URL + '?t=' + Date.now())).text(), held = (raw.match(/<!--[\s\S]*?-->/g) || []).join('\n');
  const need = ['/fable/proto_explorer_tour/', '/insights/crease_what/explorer.html', '/caro/direction_field/'];
  const obs = { shown: need.filter(u => out.some(h => h.startsWith(u))), held: need.filter(u => held.includes(u)) }, plant = { shown: [need[2]], held: obs.held };
  target('S12', 'the tour, explorer and direction-field links are held in HTML comments, none rendered', o => !o.shown.length && o.held.length === need.length || JSON.stringify(o), obs, plant); }

// ---- S19 q's size is the page's unit, held at 1 (Doug 10-22; 10-23 "yes lets move to |q| = 1.0"): r is r/|q| on both readouts
{ const out = [];
  for (const r of [0.2, 1.0, 1.5]) { await p.evaluate(r => __brot.setR(r), r); await p.waitForTimeout(500);
    out.push(await p.evaluate(r => ({ r, rval: document.getElementById('rval').textContent, rval2: document.getElementById('rval2').textContent }), r)); }
  await p.evaluate(() => __brot.setR(0.667));
  const W = await p.evaluate(() => Object.fromEntries(['q', 'r', 'conch'].map(k => [k, __brot.W.find(w => w.key === k).rule])));
  const mag = await p.evaluate(() => { const Q = typeof __brot.q === 'function' ? __brot.q() : __brot.q; return Math.hypot(...Q); });
  const obs = { out, W, mag }, plant = clone(obs);
  plant.out[1].rval = 'r 1.000 · r/|q| 1.111 (|q| = 0.9)'; plant.W.q = plant.W.q.replace('holds |q| at 1', 'holds |q| at 0.9'); plant.W.conch = 'q = 0.9i, the direction (0°, 0°): the page starts there.';
  const shown = t => { const m = /^r? ?([\d.]+) = r\/\|q\|/.exec(t || ''); return m ? +m[1] : null; };
  target('S19', 'q\'s size is the page\'s unit, held at 1: |q| = 1, both r readouts show r = r/|q|, the q entry says the page holds |q| at 1 and only r against |q| changes the shape, the r entry says r is r/|q|, the conch is q = i',
    o => Math.abs(o.mag - 1) < 1e-12 && o.out.every(c => shown(c.rval) === +c.r.toFixed(3) && /\(\|q\| = 1\)/.test(c.rval) && (!c.rval2 || shown(c.rval2) === +c.r.toFixed(3)))
      && /holds \|q\| at 1\b/.test(o.W.q) && /only r against \|q\|/.test(o.W.q) && /r is r\/\|q\|/.test(o.W.r) && /q = i\b/.test(o.W.conch) && !/0\.9/.test(o.W.q + o.W.r + o.W.conch) || JSON.stringify(o),
    obs, plant, `|q| ${mag} · ` + out.map(c => `${c.rval} | ${c.rval2}`).join(' · ')); }

// ---- S20 the page rests when nobody is there (Doug 10-23; rest.js): ?rest=2 here. Counters: one rAF loop on the page, one in a same-origin frame
// added for the test (srcdoc), so the frame gate is read even with ?model=0 leaving Fig 2's frame unloaded.
{ const pr = await (await b.newContext({ viewport: { width: 1400, height: 900 } })).newPage(); pr.on('pageerror', e => errs.push(String(e)));
  await pr.goto(URL + '?model=0&rest=2&t=' + Date.now()); await pr.waitForFunction(() => window.__brot && window.Rest, null, { timeout: 60000 });
  // the page's checks hold the main thread at load (and the idle timer with it), and they start on a frame, so a reader is kept 'present' until they finish
  for (let k = 0; k < 240 && !(await pr.evaluate(() => __brot.checks().length > 0)); k++) { await pr.mouse.move(700 + k % 2, 450); await pr.waitForTimeout(500); }
  await pr.evaluate(() => { window.__n = 0; const t = () => { __n++; requestAnimationFrame(t); }; requestAnimationFrame(t);
    const f = document.createElement('iframe'); f.id = 'resttest'; f.style.cssText = 'position:fixed;left:0;bottom:0;width:4px;height:4px;border:0;opacity:0';
    f.srcdoc = '<script>window.n = 0; const t = () => { n++; requestAnimationFrame(t); }; requestAnimationFrame(t);<\/script>'; document.body.appendChild(f); });
  await pr.waitForFunction(() => document.getElementById('resttest').contentWindow.n > 0, null, { timeout: 10000 });
  const count = () => pr.evaluate(() => [__n, document.getElementById('resttest').contentWindow.n]);
  const chip = () => pr.evaluate(() => document.querySelector('#fig-brot .chip').textContent);
  const look = async () => { const a = await count(); await pr.waitForTimeout(600); const z = await count();
    return { st: await pr.evaluate(() => Rest.state()), page: z[0] - a[0], frame: z[1] - a[1], cls: await pr.evaluate(() => document.documentElement.classList.contains('resting')), chip: await chip() }; };
  await pr.mouse.move(700, 450); await pr.mouse.move(705, 455); await pr.waitForTimeout(3500); const rest = await look();
  await pr.evaluate(() => { dispatchEvent(new PointerEvent('pointermove')); dispatchEvent(new WheelEvent('wheel')); }); await pr.waitForTimeout(300); const fake = await pr.evaluate(() => Rest.resting);
  await pr.mouse.move(600, 400); await pr.waitForTimeout(150); const woke = await look();
  // R3: busy holds rest off and wakes a resting page (a test predicate), and the track registers its own (never resting while it plays)
  await pr.evaluate(() => { window.__busy = true; Rest.busy(() => window.__busy); }); await pr.waitForTimeout(3500); const busyHeld = await pr.evaluate(() => !Rest.resting);
  await pr.evaluate(() => window.__busy = false); await pr.waitForTimeout(3500); const after = await pr.evaluate(() => Rest.resting);
  await pr.evaluate(() => window.__busy = true); await pr.waitForTimeout(1500); const outside = await pr.evaluate(() => !Rest.resting); await pr.evaluate(() => window.__busy = false);
  await pr.mouse.move(650, 420); await pr.evaluate(() => { __brot.FLOW.play(1); window.__both = 0; window.__playN = 0;
    window.__pi = setInterval(() => { if (__brot.FLOW.state.playing) { __playN++; if (Rest.resting) __both++; } }, 100); });
  await pr.waitForTimeout(4000); const play = await pr.evaluate(() => { clearInterval(__pi); __brot.FLOW.pause(); return { playN: __playN, both: __both }; });
  await pr.goto(URL + '?model=0&rest=0&t=' + Date.now()); await pr.waitForFunction(() => window.Rest); const off0 = await pr.evaluate(() => Rest.state().on);
  await pr.goto(URL + '?model=0&t=' + Date.now()); await pr.waitForFunction(() => window.Rest); const offWd = await pr.evaluate(() => navigator.webdriver ? !Rest.state().on : true);
  await pr.context().close();
  const obs = { rest: { page: rest.page, frame: rest.frame, cls: rest.cls, badges: rest.st.badges, chip: rest.chip.slice(0, 30) }, fake, woke: { page: woke.page, frame: woke.frame, cls: woke.cls, badges: woke.st.badges, chip: woke.chip.slice(0, 12) }, busyHeld, after, outside, play, off0, offWd };
  const plant = clone(obs); plant.rest.frame = 12;
  target('S20', 'the page rests when nobody is there: at ?rest=2, 3.5 s after the last input no rAF loop runs on the page or in a frame, Fig 1\'s chip says resting and live pictures carry a badge; a page-made event doesn\'t wake it, a real mouse move does; never under the playing track, again after it pauses; ?rest=0 is off, and so is automation',
    o => o.rest.page === 0 && o.rest.frame === 0 && o.rest.cls && o.rest.badges > 0 && /^resting · move to wake/.test(o.rest.chip) && o.fake === true
      && o.woke.page > 5 && o.woke.frame > 5 && !o.woke.cls && o.woke.badges === 0 && /^live/.test(o.woke.chip) && o.busyHeld && o.after === true && o.outside === true && o.play.playN > 5 && o.play.both === 0 && o.off0 === false && o.offWd || JSON.stringify(o),
    obs, plant, `rest ${rest.page}/${rest.frame} frames, ${rest.st.badges} badges · woke ${woke.page}/${woke.frame}`); }

console.log('page errors:', errs.length ? errs : 'none');
console.log(`${OUT.filter(r => r[1]).length}/${OUT.length} targets pass`);
await b.close();
