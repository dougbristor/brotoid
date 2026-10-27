// needle_vp.js: the weft needles (insights 10-24, from the sketch tmp/rcm/qmodel/needles.html). Three views of one relation, h(q, line) = |m − q|,
// the distance from q to the weft's midpoint m on a cone line (brotoid_weft's midOn):
//   overlay: the needles drawn on the flat q map (every q whose ball of size a has a weft on that line);
//   one:     one needle, looking straight down its brim point d (one line, every q), Fig 6;
//   profile: q's two distances to every brim line (one q, every line), Fig 7: one's inverse VP. They meet at the chosen line's cursor.
//   map:     the sketch's own map, Fig 8: a needle every sp° of the brim on the flat q map, with the pink discs and the floor if asked.
// The needle is exact at every size: half-length a along b = d × e, half-width a·cos γ along e (n made square to d, cos γ = |d·n|). The stitch's thread
// runs along n, across the needle. Colours follow the page: pink = the ball reaches the line (the crossing), gold = a weft, the det J tints = the q map
// floor's keep / mirror, violet = the thread and the chosen line (Doug 10-24: green is the self weft's).
(function (g) {
  const D = Math.PI / 180, dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = a => Math.hypot(...a), sc = (a, s) => a.map(v => v * s), sub = (a, b) => a.map((v, i) => v - b[i]), un = a => sc(a, 1 / nrm(a));
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const ll = p => [Math.atan2(p[2], p[1]) / D, Math.asin(Math.max(-1, Math.min(1, p[0]))) / D];
  const COL = { pink: '#ff4fa3', gold: '#ffd27a', thread: '#b48cff', keep: '#102834', mir: '#30180e', ink: '#eee9e0', dim: '#8d8aa0', panel: '#0f1320' };
  // the q map floor's colours (qmap.js COL, so Fig 8's floor is Fig 2's flat floor): keep, mirror, crossing, weft, two wefts
  const FLOOR = { keep: [16, 40, 52], mir: [48, 24, 14], join: [128, 38, 92], tear: [150, 112, 40], tear2: [236, 196, 104], todo: [26, 28, 36] };
  function make(C) {
    const gradDet = x => [0, 1, 2].map(i => { const h = 1e-6, p = x.slice(), m = x.slice(); p[i] += h; m[i] -= h; return (C.detJ(p) - C.detJ(m)) / (2 * h); });
    const cache = new Map();
    // a cone line with its frame: g the crossing's normal (∇det J at d), t along the brim, e and b the needle's axes; pierce = the thread's angle through the crossing
    function lineAt(lo) { lo = Math.round(lo * 8) / 8; if (cache.has(lo)) return cache.get(lo); const L = C.coneLine(lo), gn = un(gradDet(L.d)), t = un(crs(gn, L.d)), cg = Math.abs(L.dn), e = un(sub(L.n, sc(L.d, L.dn)));
      const o = { ...L, g: gn, t, e, b: crs(L.d, e), cg, pierce: Math.asin(Math.min(1, Math.abs(dot(L.n, gn)))) / D }; if (cache.size > 3000) cache.clear(); cache.set(lo, o); return o; }
    const nearestLo = q => C.CONE.reduce((m, L) => Math.abs(dot(q, L.d)) > m.c ? { c: Math.abs(dot(q, L.d)), lo: L.lo } : m, { c: -1, lo: 0 }).lo;
    // a tangent offset w at the s end of a line → the direction (clipped to the hemisphere); the needle (w0 = its half-width) and the disc (w0 = a) as offsets
    const offDir = (L, w, s) => { const n = nrm(w), k = Math.min(1, n), ww = k < n ? sc(w, k / n) : w; return sc([0, 1, 2].map(i => Math.sqrt(1 - k * k) * L.d[i] + ww[i]), s); };
    const halfW = (L, a, plant) => plant === 'tan' ? a * L.cg / Math.sqrt(1 - L.cg * L.cg) : a * L.cg;
    const outline = (L, a, w0, N = 120) => Array.from({ length: N + 1 }, (_, k) => { const ph = 2 * Math.PI * k / N; return [0, 1, 2].map(i => w0 * Math.cos(ph) * L.e[i] + a * Math.sin(ph) * L.b[i]); });
    function classify(L, q, a) { const sn = Math.sqrt(Math.max(0, 1 - dot(q, L.d) ** 2)), m = C.midOn(L, q), h = m ? m.h : Infinity; return { sn, h, kind: h < a ? 'needle' : sn < a ? 'disc' : 'out' }; }
    // the lines the profile runs over (the gap lines have no finite midpoint), each with tan γ for the closed form
    const F = C.LINES.filter(L => Math.abs(L.dn) > 1e-9).map(L => { const e = un(sub(L.n, sc(L.d, L.dn))); return { lo: L.lo, d: L.d, e, tg: Math.sqrt(1 - L.dn * L.dn) / Math.abs(L.dn) }; }).sort((u, v) => u.lo - v.lo);
    // the stretches of a profile curve under a (k = 1 pink, 2 gold) as lo runs [a, b], a run over the 180° wrap joined into one
    const runs = (Dd, a, k = 2) => { const R = []; let cur = null; for (const d of Dd) { if (d[k] < a) { if (!cur) { cur = { a: d[0], b: d[0] }; R.push(cur); } cur.b = d[0]; } else cur = null; }
      if (R.length > 1 && Dd[0][k] < a && Dd[Dd.length - 1][k] < a) { const last = R.pop(); R[0] = { a: last.a, b: R[0].b + 180 }; } return R; };
    // the atoms' wefts on the brim: brotoid_weft's umbrellas, in pairs, as lo spans (10-24: a weft can be 0.001° of brim, narrower than the lines' spacing,
    // so the sampled curve misses it; the atoms do not)
    const weftSpans = (q, a) => { const U = (C.crossing(q, a, { kinds: false }).umbrellas || []).map(u => u.lo), out = []; for (let i = 0; i + 1 < U.length; i += 2) out.push({ a: U[i], b: U[i + 1] }); return out; };
    const dists = q => F.map(f => { const c = dot(q, f.d), s2 = Math.max(0, 1 - c * c), qe = dot(q, f.e); return [f.lo, Math.sqrt(s2), Math.sqrt(s2 + f.tg * f.tg * qe * qe)]; });

    // OVERLAY on the flat q map: P(lon, lat) → screen. Needles every `every`° of lo (both ends), the chosen one violet
    function overlay(ctx, P, u, a, lo, every = 10) {
      const poly = (pts, col, w) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); let prev = null; for (const [x, y] of pts) { const p = P(x, y); if (prev === null || Math.abs(x - prev) > 180) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); prev = x; } ctx.stroke(); ctx.restore(); };
      for (let l = 0; l < 180; l += every) { const L = lineAt(l); for (const s of [1, -1]) poly(outline(L, a, halfW(L, a), 72).map(w => ll(offDir(L, w, s))), 'rgba(255,225,140,.9)', 1.1 * u); }
      const L = lineAt(lo); for (const s of [1, -1]) { poly(outline(L, a, halfW(L, a)).map(w => ll(offDir(L, w, s))), COL.thread, 2.2 * u); const p = P(...ll(sc(L.d, s))); ctx.save(); ctx.strokeStyle = COL.thread; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(p[0], p[1], 4 * u, 0, 7); ctx.stroke(); ctx.restore(); } }

    // ONE NEEDLE (Fig 6): orthographic from the s end of the line (s = the end q is nearer): X = s·t along the brim, Y = g. In these coordinates the needle
    // is an exact ellipse. Every direction d + k·n lands on the line through the centre along n's projection, so the tint under the thread is det J's sign
    // at the thread's own points. get() → { q (unit), a, lo, plant, fix }; onPick(lon, lat). fix (Doug 10-24: "the view angle is current vs fixed angle"):
    // the frame at the same point turned to the map's, east across and north up, so the needle's tilt is Fig 8's (less the map's 1/cos(lat) stretch)
    function mountOne(cv, get, onPick) { const oc = cv.getContext('2d'), tint = document.createElement('canvas'); let view = null, tkey = '';
      function draw() { const r = devicePixelRatio || 1, Wc = Math.round(cv.clientWidth * r), Hc = Math.round(cv.clientHeight * r); if (!Wc || !Hc) return; if (cv.width !== Wc || cv.height !== Hc) { cv.width = Wc; cv.height = Hc; }
        const { q, a, lo, plant, fix } = get(), L = lineAt(lo), s = dot(q, L.d) < 0 ? -1 : 1, [ln] = ll(sc(L.d, s)), la = ll(sc(L.d, s))[1] * D,
          X = fix ? [0, -Math.sin(ln * D), Math.cos(ln * D)] : sc(L.t, s), Y = fix ? [Math.cos(la), -Math.sin(la) * Math.cos(ln * D), -Math.sin(la) * Math.sin(ln * D)] : L.g, R = Math.min(1, 1.3 * Math.max(a, 0.05)), n = Math.min(Wc, Hc), k = n / (2 * R), cx = Wc / 2, cy = Hc / 2, lw = r;
        const P2 = p => [cx + dot(p, X) * k, cy - dot(p, Y) * k], W2 = w => P2(offDir(L, w, s)); view = { L, s, X, Y, k, cx, cy, fix: !!fix };
        oc.fillStyle = COL.panel; oc.fillRect(0, 0, Wc, Hc);
        // det J's tints, cached per line, end and size
        const key = [lo, s, R.toFixed(4), n, !!fix].join(); if (key !== tkey) { tkey = key; const G = 96; tint.width = tint.height = G; const tc = tint.getContext('2d'), id = tc.createImageData(G, G);
          for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const uu = ((i + 0.5) / G * 2 - 1) * R, vv = (1 - (j + 0.5) / G * 2) * R, uv = uu * uu + vv * vv, o = 4 * (j * G + i);
            let c = [15, 19, 32]; if (uv < 1) { const p = [0, 1, 2].map(m => s * Math.sqrt(1 - uv) * L.d[m] + uu * X[m] + vv * Y[m]); c = C.detJ(p) >= 0 ? [16, 40, 52] : [48, 24, 14]; } id.data.set([...c, 255], o); }
          tc.putImageData(id, 0, 0); }
        oc.save(); oc.imageSmoothingEnabled = false; oc.drawImage(tint, cx - n / 2, cy - n / 2, n, n); oc.restore();
        // the brim: every cone line's end in view
        oc.fillStyle = 'rgba(255,255,255,.75)'; for (const Cl of C.CONE) for (const gs of [1, -1]) { const p = sc(Cl.d, gs); if (dot(p, sc(L.d, s)) <= 0) continue; const [x, y] = P2(p); if (Math.abs(x - cx) < n / 2 && Math.abs(y - cy) < n / 2) oc.fillRect(x - 0.8 * lw, y - 0.8 * lw, 1.6 * lw, 1.6 * lw); }
        const path = (pts, st, wd, fill) => { oc.beginPath(); pts.forEach((w, i) => { const [x, y] = W2(w); i ? oc.lineTo(x, y) : oc.moveTo(x, y); }); if (fill) { oc.fillStyle = fill; oc.fill(); } oc.strokeStyle = st; oc.lineWidth = wd * lw; oc.stroke(); };
        path(outline(L, a, a), 'rgba(255,79,163,.85)', 1.3); path(outline(L, a, halfW(L, a, plant)), COL.gold, 2, 'rgba(255,210,122,.22)');
        // the thread
        const tn = [dot(L.n, X), -dot(L.n, Y)], tl = Math.hypot(...tn), ux = tn[0] / tl, uy = tn[1] / tl, A = 0.86 * n / 2;
        oc.strokeStyle = COL.thread; oc.fillStyle = COL.thread; oc.lineWidth = 2.2 * lw; oc.beginPath(); oc.moveTo(cx - ux * A, cy - uy * A); oc.lineTo(cx + ux * A, cy + uy * A); oc.stroke();
        oc.font = `${11 * lw}px ui-monospace, monospace`;
        for (const sg of [1, -1]) { const hx = cx + sg * ux * A, hy = cy + sg * uy * A, hs = 9 * lw; oc.beginPath(); oc.moveTo(hx, hy); oc.lineTo(hx - sg * (ux * hs - uy * hs * 0.5), hy - sg * (uy * hs + ux * hs * 0.5)); oc.lineTo(hx - sg * (ux * hs + uy * hs * 0.5), hy - sg * (uy * hs - ux * hs * 0.5)); oc.closePath(); oc.fill();
          const ex = cx + sg * ux * A * 0.62, ey = cy + sg * uy * A * 0.62; oc.beginPath(); oc.arc(ex, ey, 4 * lw, 0, 7); oc.fill(); oc.fillText(sg > 0 ? 'y' : 'x', ex + 7 * lw, ey - 6 * lw); }
        oc.fillText('thread n', cx + ux * A * 0.3 - uy * 14 * lw - 24 * lw, cy + uy * A * 0.3 + ux * 14 * lw + 4 * lw);
        oc.fillStyle = '#fff'; oc.fillRect(cx - 2 * lw, cy - 2 * lw, 4 * lw, 4 * lw);
        for (const [y, c, t] of [[4, COL.keep, 'det J > 0 (keeps)'], [19, COL.mir, 'det J < 0 (mirrors)']]) { oc.fillStyle = c; oc.fillRect(4 * lw, y * lw, 11 * lw, 11 * lw); oc.strokeStyle = COL.dim; oc.lineWidth = lw; oc.strokeRect(4 * lw, y * lw, 11 * lw, 11 * lw); oc.fillStyle = '#c9c5bc'; oc.fillText(t, 20 * lw, (y + 9) * lw); }
        const cq = classify(L, q, a), [qx, qy] = P2(q), inV = Math.abs(qx - cx) < n / 2 && Math.abs(qy - cy) < n / 2, col = cq.kind === 'needle' ? COL.gold : cq.kind === 'disc' ? COL.pink : COL.ink;
        if (inV) { oc.strokeStyle = col; oc.lineWidth = 2.2 * lw; oc.beginPath(); oc.arc(qx, qy, 7 * lw, 0, 7); oc.stroke(); oc.fillStyle = col; oc.fillText('q', qx + 9 * lw, qy - 8 * lw); }
        const gap = L.cg < 1e-9;
        draw.cap = `${fix ? 'map frame (north up, as Fig 8)' : 'brim level'} · lo ${lo.toFixed(3)}°${Math.abs(lo - 45) < 1e-9 ? ' (seam)' : Math.abs(lo - 135) < 1e-9 ? ' (fold)' : ''} · γ ${(Math.acos(L.cg) / D).toFixed(1)}° · needle ${a.toFixed(2)} long, ${halfW(L, a, plant).toFixed(3)} wide (half)` + (gap ? ', none: γ = 90°, all or nothing' : ` (${(1 / L.cg).toFixed(1)}× thinner)`)
          + ` · thread through the crossing ${L.pierce.toFixed(1)}°: ${L.pierce > 0.5 ? 'ends on opposite sides' : 'lies in the crossing, ends on one side'} · q ${cq.kind === 'needle' ? `in the needle: a weft (|m − q| ${cq.h.toFixed(3)} < ${a.toFixed(2)})` : cq.kind === 'disc' ? `reaches the line, no weft (|m − q| ${isFinite(cq.h) ? cq.h.toFixed(3) : '∞'})` : 'does not reach this line'}${inV ? '' : ' (out of view)'}`;
        return draw.cap; }
      cv.addEventListener('click', e => { if (!view) return; const { L, s, X, Y, k, cx, cy } = view, rc = cv.getBoundingClientRect(), r = devicePixelRatio || 1, uu = ((e.clientX - rc.left) * r - cx) / k, vv = (cy - (e.clientY - rc.top) * r) / k;
        if (uu * uu + vv * vv >= 1) return; const p = [0, 1, 2].map(c => s * Math.sqrt(1 - uu * uu - vv * vv) * L.d[c] + uu * X[c] + vv * Y[c]); onPick(...ll(p)); });
      return { draw, get view() { return view; } }; }

    // PROFILE (Fig 7): one q, every line. Pink ① sin θ (the ball reaches the line below the dashed r/|q|), gold ② |m − q| (a weft below it); the violet
    // cursor is Fig 6's line, its two values from midOn (a different route from the curves' closed form). onLo(lo) when clicked
    function mountProf(cv, get, onLo) { const px = cv.getContext('2d'); let geo = null;
      function draw() { const r = devicePixelRatio || 1, w = Math.round(cv.clientWidth * r), h = Math.round(cv.clientHeight * r); if (!w || !h) return; if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        const { q, a, lo, plant } = get(), lw = r, top = 1.3, x0 = 34 * lw, xw = w - 42 * lw, xl = l => x0 + l / 180 * xw, yv = v => h - 18 * lw - Math.min(v, top) / top * (h - 40 * lw); geo = { x0, xw };
        px.fillStyle = COL.panel; px.fillRect(0, 0, w, h); px.font = `${10.5 * lw}px ui-monospace, monospace`; px.fillStyle = COL.dim;
        for (const v of [0, 0.5, 1]) { px.fillText(v.toFixed(1), 4 * lw, yv(v) + 4 * lw); px.fillRect(xl(0), yv(v), xw, 0.5 * lw); }
        for (const l of [0, 45, 90, 135, 180]) px.fillText(l + '°' + (l === 45 ? ' seam' : l === 135 ? ' fold' : ''), xl(l) - 8 * lw, h - 4 * lw);
        const Dd = dists(q), line = (k, col, wd) => { px.strokeStyle = col; px.lineWidth = wd * lw; px.beginPath(); let up = true; for (const d of Dd) { if (d[k] > top * 1.2) { up = true; continue; } up ? px.moveTo(xl(d[0]), yv(d[k])) : px.lineTo(xl(d[0]), yv(d[k])); up = false; } px.stroke(); };
        line(1, COL.pink, 1.5); line(2, COL.gold, 2);
        px.strokeStyle = '#fff'; px.setLineDash([4 * lw, 4 * lw]); px.lineWidth = lw; px.beginPath(); px.moveTo(xl(0), yv(a)); px.lineTo(xl(180), yv(a)); px.stroke(); px.setLineDash([]);
        px.fillStyle = COL.pink; px.fillText('① sin θ: reaches', xl(1), 12 * lw); px.fillStyle = COL.gold; px.fillText('② |m − q|: weft', xl(1) + 128 * lw, 12 * lw); px.fillStyle = '#fff'; px.fillText('--- r/|q|', xl(1) + 248 * lw, 12 * lw);
        const L = lineAt(plant === 'cur' ? lo + 1 : lo), cq = classify(L, q, a), xc = xl(lo); draw.cur = { lo, sn: cq.sn, h: cq.h };
        px.strokeStyle = COL.thread; px.lineWidth = 1.5 * lw; px.setLineDash([3 * lw, 3 * lw]); px.beginPath(); px.moveTo(xc, yv(top)); px.lineTo(xc, yv(0)); px.stroke(); px.setLineDash([]);
        for (const [v, c] of [[cq.sn, COL.pink], [cq.h, COL.gold]]) if (v <= top) { px.fillStyle = c; px.beginPath(); px.arc(xc, yv(v), 4.5 * lw, 0, 7); px.fill(); px.strokeStyle = COL.thread; px.lineWidth = 1.2 * lw; px.stroke(); }
        const tx = `lo ${lo.toFixed(2)}°: ① ${cq.sn.toFixed(3)} ② ${isFinite(cq.h) ? cq.h.toFixed(3) : '∞'}`; px.fillStyle = COL.thread; px.fillText(tx, Math.min(xc + 6 * lw, w - px.measureText(tx).width - 4 * lw), yv(top) + 11 * lw);
        // the wefts, from the atoms: a gold tick under the axis for each (at least 3 px, so a hairline shows); one the curve's lines miss is outlined white
        const W = weftSpans(q, a), R = runs(Dd, a), seen = sp => R.some(r => r.a <= sp.b + 0.25 && r.b + 0.25 >= sp.a); let missed = 0;
        for (const sp of W) { const m = !seen(sp); missed += m; for (const off of [0, -180, 180]) { const x1 = xl(sp.a + off), x2 = xl(sp.b + off), xa = Math.min(x1, x2), wd = Math.max(3 * lw, Math.abs(x2 - x1)); if (xa + wd < xl(0) || xa > xl(180)) continue;
          px.fillStyle = COL.gold; px.fillRect(xa - (wd === 3 * lw ? 1.5 * lw : 0), yv(0) + 3 * lw, wd, 5 * lw); if (m) { px.strokeStyle = '#fff'; px.lineWidth = lw; px.strokeRect(xa - 3 * lw, yv(0) + 1 * lw, wd + 3 * lw, 9 * lw); } } }
        draw.cap = `at r/|q| ${a.toFixed(2)}: ${W.length ? `${W.length === 1 ? 'one weft' : W.length + ' wefts'} (the atoms, gold ticks under the axis)${missed ? `, ${missed} too narrow for the curve's line spacing (white box: a hairline)` : ''}` : 'no weft'} · cursor = Fig 6's line`;
        return draw.cap; }
      cv.addEventListener('click', e => { if (!geo) return; const rc = cv.getBoundingClientRect(), r = devicePixelRatio || 1, l = ((e.clientX - rc.left) * r - geo.x0) / geo.xw * 180; onLo(Math.max(0, Math.min(179.875, Math.round(l * 8) / 8))); });
      return { draw }; }
    // THE NEEDLE MAP (Fig 8; the sketch's map, Doug 10-24: "a really useful plot"). The flat q map at |q| = 1, fitted 2:1 in the canvas: the brim (white),
    // a needle every sp° of lo at both ends (gold; filled if asked), each line's disc (pink, if asked: the needle always lies inside it), the seam and fold
    // lines ringed (no width there), Fig 6's line violet, q white. The floor (if asked) is Fig 2's flat floor at this size (QMap.counts on the terrain).
    // get() → { lon, lat, a, lo, sp, disc, floor, fill, T, counts }; onPick(lon, lat) when clicked
    function mountMap(cv, get, onPick) { const ctx = cv.getContext('2d'), fl = document.createElement('canvas'); let fkey = '', geo = null;
      function draw() { const o = get(), u = devicePixelRatio || 1, W = Math.round(cv.clientWidth * u), H = Math.round(cv.clientHeight * u); if (!W || !H) return ''; if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
        const k = Math.min(W / 360, H / 180), x0 = (W - 360 * k) / 2, y0 = (H - 180 * k) / 2, P = (lo, la) => [x0 + (lo + 180) * k, y0 + (90 - la) * k], a = o.a; geo = { x0, y0, k };
        ctx.fillStyle = COL.panel; ctx.fillRect(0, 0, W, H);
        if (o.floor && o.T && o.counts) { const T = o.T, key = T.nx + ',' + a; if (key !== fkey) { fkey = key; fl.width = T.nx; fl.height = T.ny; const fc = fl.getContext('2d'), im = fc.createImageData(T.nx, T.ny);
            for (let j = 0; j < T.ny; j++) for (let i = 0; i < T.nx; i++) { const c = T.cells[j * T.nx + i]; let col = FLOOR.todo;
              if (c) { const n = o.counts(c, a); col = n.wefts >= 2 ? FLOOR.tear2 : n.wefts ? FLOOR.tear : n.crossings ? FLOOR.join : !T.hand || T.hand[j * T.nx + i] ? FLOOR.keep : FLOOR.mir; }
              im.data.set([...col, 255], 4 * ((T.ny - 1 - j) * T.nx + i)); } fc.putImageData(im, 0, 0); }
          ctx.imageSmoothingEnabled = false; ctx.drawImage(fl, x0, y0, 360 * k, 180 * k); }
        else { ctx.fillStyle = '#161820'; ctx.fillRect(x0, y0, 360 * k, 180 * k); }
        const poly = (pts, col, wd, fill) => { ctx.beginPath(); let prev = null; for (const [lo, la] of pts) { const p = P(lo, la); if (prev === null || Math.abs(lo - prev) > 180) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); prev = lo; }
          if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.strokeStyle = col; ctx.lineWidth = wd * u; ctx.stroke(); };
        for (const s of [1, -1]) poly(F.filter((_, i) => i % 4 === 0).map(f => ll(sc(f.d, s))).sort((p, q) => p[0] - q[0]), 'rgba(255,255,255,.7)', 1.1);
        const sp = Math.max(1, o.sp), lines = []; for (let l = 0; l < 180 - 1e-9; l += sp) lines.push(l);
        for (const l of lines) { const L = lineAt(l); for (const s of [1, -1]) {
          if (o.disc) poly(outline(L, a, a, 72).map(w => ll(offDir(L, w, s))), 'rgba(255,79,163,.6)', 1);
          poly(outline(L, a, halfW(L, a, o.plant), 72).map(w => ll(offDir(L, w, s))), 'rgba(255,225,140,.95)', 1.3, o.fill ? 'rgba(255,225,140,.2)' : null);
          const p = P(...ll(sc(L.d, s))); ctx.fillStyle = '#fff'; ctx.fillRect(p[0] - 1.5 * u, p[1] - 1.5 * u, 3 * u, 3 * u); } }
        for (const l of [45, 135]) for (const s of [1, -1]) { const p = P(...ll(sc(lineAt(l).d, s))); ctx.strokeStyle = '#7fd4ff'; ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.arc(p[0], p[1], 6 * u, 0, 7); ctx.stroke(); }
        { const L = lineAt(o.lo); for (const s of [1, -1]) { poly(outline(L, a, halfW(L, a)).map(w => ll(offDir(L, w, s))), COL.thread, 2.2); const p = P(...ll(sc(L.d, s))); ctx.strokeStyle = COL.thread; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(p[0], p[1], 4 * u, 0, 7); ctx.stroke(); } }
        { const p = P(o.lon, o.lat); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(p[0], p[1], 7 * u, 0, 7); ctx.stroke(); }
        ctx.font = `${10.5 * u}px ui-monospace, monospace`; ctx.fillStyle = COL.dim; ctx.fillText('ringed: seam 45°, fold 135° (no width)', x0 + 4 * u, y0 + 180 * k - 5 * u);
        draw.lines = lines; return draw.cap = `r/|q| ${a.toFixed(2)} · a needle every ${sp}° of the brim (${lines.length} lines, both ends)${o.disc ? ' · pink: each line\'s disc' : ''}${o.floor ? ' · floor: Fig 2\'s' : ''} · violet: Fig 6's line ${o.lo.toFixed(3)}°`; }
      cv.addEventListener('click', e => { if (!geo) return; const rc = cv.getBoundingClientRect(), u = devicePixelRatio || 1, lo = ((e.clientX - rc.left) * u - geo.x0) / geo.k - 180, la = 90 - ((e.clientY - rc.top) * u - geo.y0) / geo.k;
        if (lo >= -180 && lo <= 180 && la >= -90 && la <= 90) onPick(lo, la); });
      return { draw, get geo() { return geo; } }; }
    return { lineAt, nearestLo, offDir, halfW, outline, classify, dists, runs, weftSpans, F, overlay, mountOne, mountProf, mountMap, COL, ll }; }
  g.NeedleVP = { make };
})(window);
