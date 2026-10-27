/**
 * qmap.js — the q map: a flat (equirectangular) map of q's direction for the brotoid, with the ball's radius r drawn over it (insights 10-18, after Doug:
 * "the q rectangular map with journey path … the marker size or pin height for r, or try the isometric bird's eye view and show the r as a 'bird' dot with
 * shadow over the map"). Doug 10-18 picked the bird and named it: "go with the bird, call it q map"; pin and size stay as modes (?qm=) for comparison.
 *
 * Across: longitude ("around", −180° … 180°); up: latitude ("toward 1"). Directions as brotoid_flow's dirOf and fable's sphere setter: [1, i, j] = [sin la,
 * cos la cos lo, cos la sin lo]. Heights are r / |q|: the crossing cone is a cone, so every moment's radius scales with |q| and the map depends on q's direction only.
 *
 * THE FLOOR. Each cell holds its direction's moments, from the CodeT atoms (brotoid_moments on brotoid_weft's laddered lines; computed once by
 * make_qmap_terrain.mjs, since the floor depends on q's direction only): crossing loops are born at the local nearest cone lines (touches) and two meet at a
 * local farthest line below 1 (crossingMerges); wefts are born at the valleys of |m − q| along G (births) and two meet at its peaks (weftMerges). At height a:
 * crossing loops = born − met below a (one loop for a ≥ 1, round the apex); wefts = born − met below a; umbrellas = 2 × wefts. The floor is coloured by what a
 * ball of radius a·|q| has, at every q at once: the bird's height floods the terrain. q and −q square to the same skin (hands swapped), so the map
 * repeats itself turned over, (lon, lat) ↔ (lon + 180°, −lat).
 *
 * Classic script: defines window.QMap.
 *   QMap.counts(E, a) → { crossings, wefts }       E = { touches, crossingMerges, births, weftMerges } (heights, ascending)
 *   const T = QMap.terrain(json, hand)         the cells of make_qmap_terrain.mjs's file; hand(direction) → true where squaring keeps the hand
 *   const M = QMap.mount(canvas, { T, mode: 'bird' | 'pin' | 'size', onInput, coneDirs, marks, ring })   ring: false hides the ball-seen-from-0 ring
 *   M.set({ lon, lat, a, E, here: { crossings, wefts } }) · M.draw() · M.mode · M.pulse(text) · M.clearTrack()
 *   const Gb = QMap.globe(canvas, { T, coneDirs, marks, view, ring, label, small, onPick, onView })   the same floor on the sphere of directions
 *   Gb.set({ lon, lat, a }) · Gb.draw() · Gb.project(d) · Gb.pixelDir(x, y) · Gb.colorOfDir(d)
 */
(function (g) {
  const D2R = Math.PI / 180;
  const dirOf = (lo, la) => { lo *= D2R; la *= D2R; return [Math.sin(la), Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo)]; };
  const below = (arr, a) => { let c = 0; for (const v of arr) if (v < a) c++; return c; };
  const counts = (E, a) => ({ crossings: a >= 1 ? 1 : below(E.touches, a) - below(E.crossingMerges, a), wefts: below(E.births, a) - below(E.weftMerges, a) });
  // the file's cells ([touches, crossingMerges, births, weftMerges] per cell, row j = latitude −90 + step·(j + ½) from the south) as event lists, and each cell's hand
  function terrain(J, hand = () => true) { const { step, nx, ny } = J, cells = J.cells.map(([t, jm, b, tm]) => ({ touches: t, crossingMerges: jm, births: b, weftMerges: tm })), hd = new Int8Array(nx * ny);
    const lonOf = i => -180 + step * (i + 0.5), latOf = j => -90 + step * (j + 0.5);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) hd[j * nx + i] = hand(dirOf(lonOf(i), latOf(j))) ? 1 : 0;
    return { step, nx, ny, cells, hand: hd, rows: ny, done: true, lonOf, latOf, made: J.made, atoms: J.atoms, keep: J.keep ?? Infinity }; }

  // colours: what the ball has at the bird's height (Doug's names: crossing (10-19, was join), weft, umbrella)
  const COL = { keep: [16, 40, 52], mir: [48, 24, 14], join: [128, 38, 92], tear: [150, 112, 40], tear2: [236, 196, 104], todo: [26, 28, 36] };
  function mount(cv, o = {}) {
    const ctx = cv.getContext('2d'), T = o.T, img = document.createElement('canvas'); img.width = T.nx; img.height = T.ny;
    const ig = img.getContext('2d'), ID = ig.createImageData(T.nx, T.ny);
    let mode = o.mode || 'bird', st = { lon: 0, lat: 0, a: 0.72, E: null }, floorKey = '', psi = -22 * D2R, eps = 44 * D2R, pulseT = 0, pulseTxt = '';
    const track = [], dp = () => devicePixelRatio || 1;
    function paintFloor() { const key = st.a + ',' + T.rows; if (key === floorKey) return; floorKey = key;
      for (let j = 0; j < T.ny; j++) for (let i = 0; i < T.nx; i++) { const c = T.cells[j * T.nx + i], p = 4 * ((T.ny - 1 - j) * T.nx + i);
        let col = COL.todo; if (c) { const k = counts(c, st.a); col = k.wefts >= 2 ? COL.tear2 : k.wefts ? COL.tear : k.crossings ? COL.join : T.hand[j * T.nx + i] ? COL.keep : COL.mir; }
        ID.data[p] = col[0]; ID.data[p + 1] = col[1]; ID.data[p + 2] = col[2]; ID.data[p + 3] = 255; }
      ig.putImageData(ID, 0, 0); }
    // geometry. Flat: the map in a rectangle. Bird: an orthographic camera over the floor (X = lon/180, Y = lat/180, Z = height × ZS), turned by psi and tilted by eps
    const ZS = 0.32, AMAX = 1.25;
    let G = null;
    function layout() { const W = cv.width, H = cv.height, m = 10 * dp();
      if (mode !== 'bird') { const top = mode === 'pin' ? 0.08 * H : m, left = 30 * dp(), bot = 16 * dp(), w = Math.min(W - left - m, 2 * (H - top - bot)), h = w / 2;
        const x0 = left + (W - left - m - w) / 2, y0 = top + (H - top - bot - h) / 2;
        return { flat: true, x0, y0, w, h, P: (lo, la, a = 0) => [x0 + (lo + 180) / 360 * w, y0 + (90 - la) / 180 * h], up: h * 0.36 }; }
      const cp = Math.cos(psi), sp = Math.sin(psi), ce = Math.cos(eps), se = Math.sin(eps);
      const V = (X, Y, Z) => [X * cp - Y * sp, (X * sp + Y * cp) * se + Z * ce];
      let x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity;
      for (const X of [-1, 1]) for (const Y of [-0.5, 0.5]) for (const Z of [0, AMAX * ZS]) { const [a, b] = V(X, Y, Z); x1 = Math.min(x1, a); x2 = Math.max(x2, a); y1 = Math.min(y1, b); y2 = Math.max(y2, b); }
      const s = Math.min((W - 2 * m) / (x2 - x1), (H - 2 * m) / (y2 - y1)), cx = W / 2 - s * (x1 + x2) / 2, cy = H / 2 + s * (y1 + y2) / 2;
      const P = (lo, la, a = 0) => { const [a1, b1] = V(lo / 180, la / 180, a * ZS); return [cx + s * a1, cy - s * b1]; };
      return { flat: false, P, s, V, cx, cy, ZS }; }
    // screen → (lon, lat) on the floor (inverse of the affine floor map), null off the map
    function pick(x, y) { if (!G) return null; const o0 = G.P(0, 0), ex = G.P(180, 0), ey = G.P(0, 90), a = ex[0] - o0[0], b = ex[1] - o0[1], c = ey[0] - o0[0], d = ey[1] - o0[1], D = a * d - b * c;
      if (!D) return null; const u = ((x - o0[0]) * d - (y - o0[1]) * c) / D, v = (a * (y - o0[1]) - b * (x - o0[0])) / D, lon = 180 * u, lat = 90 * v;
      return Math.abs(lon) <= 180 && Math.abs(lat) <= 90 ? { lon, lat } : null; }
    function line(pts, w, col, dash) { ctx.save(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.setLineDash(dash || []); ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.restore(); }
    function text(t, x, y, col, size = 11, align = 'left') { ctx.save(); ctx.font = `${size * dp()}px system-ui, sans-serif`; ctx.lineWidth = 3 * dp();
      if (align === 'left') { const w = ctx.measureText(t).width; x = Math.max(2 * dp(), Math.min(x, cv.width - w - 4 * dp())); } ctx.textAlign = align;   // kept inside the canvas
      ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); ctx.restore(); }
    function draw() { const W = cv.clientWidth * dp(), H = cv.clientHeight * dp(); if (cv.width !== Math.round(W) || cv.height !== Math.round(H)) { cv.width = Math.round(W); cv.height = Math.round(H); }
      G = layout(); paintFloor(); const P = G.P, u = dp(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      // the floor: the image's pixel (x, y) is the cell at lon −180 + step·x, lat 90 − step·y; the floor map is affine, so one transform draws it
      { const o0 = P(-180, 90), ex = P(-180 + T.step, 90), ey = P(-180, 90 - T.step); ctx.save(); ctx.imageSmoothingEnabled = false;
        ctx.setTransform(ex[0] - o0[0], ex[1] - o0[1], ey[0] - o0[0], ey[1] - o0[1], o0[0], o0[1]); ctx.drawImage(img, 0, 0); ctx.restore(); }
      // graticule every 30°, the equator brighter
      for (let lo = -180; lo <= 180; lo += 30) line([P(lo, -90), P(lo, 90)], lo === 0 ? 1.2 * u : 0.6 * u, lo === 0 ? '#ffffff55' : '#ffffff22');
      for (let la = -90; la <= 90; la += 30) line([P(-180, la), P(180, la)], la === 0 ? 1.2 * u : 0.6 * u, la === 0 ? '#ffffff55' : '#ffffff22');
      if (G.flat) { for (let lo = -180; lo <= 180; lo += 90) text(`${lo}°`, ...sc2(P(lo, -90), 0, 12 * u), '#8d8aa0', 10, 'center');
        for (let la = -60; la <= 60; la += 60) text(`${la}°`, ...sc2(P(-180, la), -4 * u, 4 * u), '#8d8aa0', 10, 'right'); }
      else { text('around →', ...sc2(P(120, -90), 0, 14 * u), '#8d8aa0', 10, 'center'); text('toward 1 →', ...sc2(P(180, 45), 8 * u, 0), '#8d8aa0', 10); }
      // where q itself lies on the crossing cone (the hand border, r① = 0): each cone line and its opposite
      if (o.coneDirs) { ctx.save(); ctx.fillStyle = '#ff4fa3'; for (const [lo, la] of o.coneDirs) { const p = P(lo, la); ctx.fillRect(p[0] - 0.8 * u, p[1] - 0.8 * u, 1.6 * u, 1.6 * u); } ctx.restore(); }
      // a host's drawing on the floor (brotoid_flow's weft needles, needle_vp.js): P is the floor map, u the pixel ratio
      if (o.overlay) o.overlay(ctx, P, u, st);
      // the ball seen from 0 (Doug 10-23: "why are the weft and the rim so bloated"): every direction within α = asin(r/|q|) of q. A q has a crossing exactly
      // when this ring reaches the cone (the pink dots), so the pink band is the cone widened by α each side: 46° at r/|q| 0.72. It is r/|q|, not |q|.
      if (st.a < 1 && o.ring !== false) { const al = Math.asin(st.a), q = dirOf(st.lon, st.lat), X = (x, y) => [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
        const t0 = X(q, Math.abs(q[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]), n0 = Math.hypot(...t0), e1 = t0.map(v => v / n0), e2 = X(q, e1), seg = []; let top = null;
        for (let k = 0; k <= 240; k++) { const t = k * Math.PI / 120, d = q.map((v, i) => Math.cos(al) * v + Math.sin(al) * (Math.cos(t) * e1[i] + Math.sin(t) * e2[i]));
          const lo = Math.atan2(d[2], d[1]) / D2R, la = Math.asin(Math.max(-1, Math.min(1, d[0]))) / D2R;
          if (seg.length && Math.abs(lo - seg[seg.length - 1].lo) > 180) { line(seg.map(v => v.p), 1.4 * u, '#ffffffcc', [5 * u, 3 * u]); seg.length = 0; }
          seg.push({ lo, p: P(lo, la) }); if (!top || la > top.la) top = { la, p: P(lo, la) }; }
        line(seg.map(v => v.p), 1.4 * u, '#ffffffcc', [5 * u, 3 * u]); text(`the ball seen from 0 · α ${(al / D2R).toFixed(0)}°`, top.p[0] + 4 * u, top.p[1] - 4 * u, '#ffffff', 10); }
      for (const b of o.marks || []) { const p = P(b.lon, b.lat); ctx.save(); ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.arc(p[0], p[1], 3 * u, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
        text(b.name, p[0] + 5 * u, p[1] - 4 * u, '#d8d4ea', 10); }
      // the ground track (where q has been), fading toward its start, broken where it wraps round ±180°
      band(track.map((t, i) => ({ p: P(t.lon, t.lat), brk: i > 0 && Math.abs(t.lon - track[i - 1].lon) > 180 })), 1.6 * u, '255,255,255', 0.15, 0.85);
      const E = st.E, here = st.here || (E ? counts(E, st.a) : { crossings: 0, wefts: 0 }), ringCol = here.wefts ? '#ffd27a' : here.crossings ? '#ff4fa3' : '#ffffff';
      const ticks = E ? [['①', E.touches[0], '#ff4fa3'], ['②', E.births[0], '#ffd27a'], ['③', 1, '#ffffff']].filter(t => t[1] !== undefined && t[1] <= AMAX) : [];
      const g0 = P(st.lon, st.lat);
      if (mode === 'bird') {
        // ③'s ceiling, r = |q|, the same height everywhere
        line([P(-180, -90, 1), P(180, -90, 1), P(180, 90, 1), P(-180, 90, 1), P(-180, -90, 1)], 1 * u, '#ffffff40', [4 * u, 4 * u]); text('③ r = |q|', ...sc2(P(-180, 90, 1), 4 * u, -4 * u), '#ffffff88', 10);
        // the flight, in the air, fading
        band(track.map((t, i) => ({ p: P(t.lon, t.lat, t.a), brk: i > 0 && Math.abs(t.lon - track[i - 1].lon) > 180 })), 1.2 * u, '255,210,122', 0.1, 0.6);
        const b = P(st.lon, st.lat, st.a);
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.ellipse(g0[0], g0[1], 7 * u, 3.5 * u, 0, 0, 2 * Math.PI); ctx.fill(); ctx.restore();   // the shadow
        line([g0, b], 1 * u, '#ffffffaa', [3 * u, 3 * u]);
        for (const [lab, a, col] of ticks) { const p = P(st.lon, st.lat, a); line([[p[0] - 5 * u, p[1]], [p[0] + 5 * u, p[1]]], 1.6 * u, col); text(lab, p[0] - 8 * u, p[1] + 4 * u, col, 10, 'right'); }
        bird(b, ringCol); }
      else if (mode === 'pin') { const top = [g0[0], g0[1] - st.a * G.up];
        line([g0, top], 2 * u, '#ffffffcc'); for (const [lab, a, col] of ticks) { const y = g0[1] - a * G.up; line([[g0[0] - 5 * u, y], [g0[0] + 5 * u, y]], 1.6 * u, col); text(lab, g0[0] - 8 * u, y + 4 * u, col, 10, 'right'); }
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.ellipse(g0[0], g0[1], 4 * u, 2 * u, 0, 0, 2 * Math.PI); ctx.fill(); ctx.restore(); bird(top, ringCol); }
      else { const R0 = G.h * 0.09;
        for (const [lab, a, col] of ticks) { line(circ(g0, a * R0), 1 * u, col, [3 * u, 3 * u]); text(lab, g0[0] + a * R0 * 0.71 + 2 * u, g0[1] - a * R0 * 0.71 - 2 * u, col, 10); }
        ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.strokeStyle = ringCol; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(g0[0], g0[1], Math.max(1, st.a * R0), 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); ctx.restore(); }
      // a moment just happened: a ring that opens out from the bird's ground point, with its name
      const pt = performance.now() - pulseT; if (pt < 1600) { const f = pt / 1600; ctx.save(); ctx.globalAlpha = 1 - f; ctx.strokeStyle = ringCol; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(g0[0], g0[1], (8 + 40 * f) * u, 0, 2 * Math.PI); ctx.stroke(); ctx.restore();
        text(pulseTxt, g0[0] + 14 * u, g0[1] + 16 * u, ringCol, 12); } }
    const sc2 = (p, dx, dy) => [p[0] + dx, p[1] + dy];
    // a polyline in 12 bands, each one stroke, alpha rising from a0 at the start to a1 at the end
    function band(pts, w, rgb, a0, a1) { const L = pts.length, NB = 12; if (L < 2) return;
      for (let b = 0; b < NB; b++) { const i0 = Math.floor(b * (L - 1) / NB), i1 = Math.floor((b + 1) * (L - 1) / NB); if (i1 <= i0) continue;
        ctx.save(); ctx.lineWidth = w; ctx.strokeStyle = `rgba(${rgb},${(a0 + (a1 - a0) * (b + 1) / NB).toFixed(2)})`; ctx.beginPath();
        for (let i = i0; i <= i1; i++) { const { p, brk } = pts[i]; if (i === i0 || brk) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); } ctx.stroke(); ctx.restore(); } }
    const circ = (c, r) => Array.from({ length: 49 }, (_, k) => [c[0] + r * Math.cos(k * Math.PI / 24), c[1] + r * Math.sin(k * Math.PI / 24)]);
    function bird(p, col) { const u = dp(); ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10 * u; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0], p[1], 4.5 * u, 0, 2 * Math.PI); ctx.fill();
      ctx.shadowBlur = 0; ctx.strokeStyle = col; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(p[0], p[1], 7 * u, 0, 2 * Math.PI); ctx.stroke(); ctx.restore(); }
    // input: drag on the map moves q (a 'q-set map'); in the bird view a drag off the floor turns the view; the wheel changes r
    let drag = null;
    cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * dp(), y = (e.clientY - r.top) * dp(), p = pick(x, y);
      drag = p ? { q: true } : mode === 'bird' ? { q: false, x: e.clientX, y: e.clientY, psi, eps } : null; if (!drag) return; cv.setPointerCapture(e.pointerId);
      if (p) o.onInput?.({ lon: p.lon, lat: p.lat }); });
    cv.addEventListener('pointermove', e => { if (!drag) return; if (drag.q) { const r = cv.getBoundingClientRect(), p = pick((e.clientX - r.left) * dp(), (e.clientY - r.top) * dp()); if (p) o.onInput?.({ lon: p.lon, lat: p.lat }); }
      else { psi = drag.psi + (e.clientX - drag.x) * 0.008; eps = Math.max(12 * D2R, Math.min(89 * D2R, drag.eps + (e.clientY - drag.y) * 0.006)); draw(); } });
    cv.addEventListener('pointerup', () => { drag = null; });
    cv.addEventListener('wheel', e => { e.preventDefault(); o.onInput?.({ da: -e.deltaY * 0.0006 }); }, { passive: false });
    const api = {
      set(s) { const moved = !track.length || Math.abs(s.lon - track[track.length - 1].lon) > 0.15 || Math.abs(s.lat - track[track.length - 1].lat) > 0.15 || Math.abs(s.a - track[track.length - 1].a) > 0.002;
        st = { ...st, ...s }; if (moved) { track.push({ lon: st.lon, lat: st.lat, a: st.a }); if (track.length > 1200) track.shift(); } },
      draw, pulse(t) { pulseT = performance.now(); pulseTxt = t; }, clearTrack() { track.length = 0; }, track,
      get mode() { return mode; }, set mode(m) { mode = m; draw(); o.onMode?.(m); }, get view() { return { psi, eps }; }, layout: () => G };
    return api; }
  // ---- the globe (Doug 10-23: "I need the 3d sphere plots to explain it to me"): the same floor painted on the sphere of directions, seen from outside.
  // Screen axes at the default view: right = j, up = 1, toward the viewer = i, so i faces you as in the middle of the flat map. (j, 1, i) is a cyclic turn of
  // (1, i, j), so nothing is mirrored: Bristorian is chiral, and a mirrored globe would show the other hand's pattern (GLOBE1's plant).
  // Every pixel is looked up in the terrain at its own direction; nothing is baked. Drag turns it (a shared view object turns linked globes together);
  // a click without a drag picks q. o: { T, coneDirs, marks, view: { yaw, pitch }, ring, label, shade, plant, onPick, onView }
  function matOf(view) { const cy = Math.cos(view.yaw), sy = Math.sin(view.yaw), cp = Math.cos(view.pitch), sp = Math.sin(view.pitch), M0 = [[0, 0, 1], [1, 0, 0], [0, 1, 0]];
    const Ry = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], Rx = [[1, 0, 0], [0, cp, -sp], [0, sp, cp]], mm = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((t, v, k) => t + v * B[k][j], 0)));
    return mm(Rx, mm(Ry, M0)); }
  function globe(cv, o = {}) {
    const ctx = cv.getContext('2d'), T = o.T, view = o.view || { yaw: 0, pitch: 0.35 }, cellCol = new Uint8Array(T.nx * T.ny * 3);
    let st = { lon: 0, lat: 0, a: 0.72 }, colKey = '', G = null;
    function paint(a) { const key = a + ',' + T.rows; if (key === colKey) return; colKey = key;
      for (let k = 0; k < T.nx * T.ny; k++) { const c = T.cells[k]; let col = COL.todo;
        if (c) { const n = counts(c, a); col = n.wefts >= 2 ? COL.tear2 : n.wefts ? COL.tear : n.crossings ? COL.join : T.hand[k] ? COL.keep : COL.mir; } cellCol.set(col, 3 * k); } }
    // world [1, i, j] → screen (right, up, toward you): M = Rx(pitch) · Ry(yaw) · M0, with M0 sending j → right, 1 → up, i → toward you
    const mat = () => matOf(view);
    const cellOf = d => { const lo = Math.atan2(d[2], d[1]) / D2R, la = Math.asin(Math.max(-1, Math.min(1, d[0]))) / D2R;
      return Math.min(T.ny - 1, Math.floor((la + 90) / T.step)) * T.nx + Math.min(T.nx - 1, Math.floor((lo + 180) / T.step)); };
    const colorOfDir = d => { paint(st.a); const k = 3 * cellOf(d); return [cellCol[k], cellCol[k + 1], cellCol[k + 2]]; };
    function project(d) { const M = G ? G.M : mat(), s = M.map(r => r[0] * d[0] + r[1] * d[1] + r[2] * d[2]), R = G ? G.R : 1, cx = G ? G.cx : 0, cyy = G ? G.cy : 0; return [cx + R * s[0], cyy - R * s[1], s[2]]; }
    function pixelDir(x, y) { if (!G) return null; const nx = (x - G.cx) / G.R, ny = -(y - G.cy) / G.R, r2 = nx * nx + ny * ny; if (r2 > 1) return null; const nz = Math.sqrt(1 - r2), M = G.M;
      return [0, 1, 2].map(j => M[0][j] * nx + M[1][j] * ny + M[2][j] * nz); }   // Mᵀ · s
    function draw() { const u = dp(), W = Math.round(cv.clientWidth * u), H = Math.round(cv.clientHeight * u); if (!W || !H) return; if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      paint(st.a); const R = 0.46 * Math.min(W, H), cx = W / 2, cy = H / 2 + (o.label ? 6 * u : 0), M = mat(); G = { R, cx, cy, M };
      const img = ctx.createImageData(W, H), D = img.data, x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(W, Math.ceil(cx + R)), y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(H, Math.ceil(cy + R));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const nx = (x + 0.5 - cx) / R, ny = -(y + 0.5 - cy) / R, r2 = nx * nx + ny * ny; if (r2 > 1) continue;
        const nz = Math.sqrt(1 - r2), d = [0, 1, 2].map(j => M[0][j] * nx + M[1][j] * ny + M[2][j] * nz); if (o.plant) d[2] = -d[2];   // plant: the pattern mirrored (j → −j)
        const k = 3 * cellOf(d), f = o.shade === false ? 1 : 0.6 + 0.75 * nz, p = 4 * (y * W + x);
        D[p] = Math.min(255, cellCol[k] * f); D[p + 1] = Math.min(255, cellCol[k + 1] * f); D[p + 2] = Math.min(255, cellCol[k + 2] * f); D[p + 3] = 255; }
      ctx.putImageData(img, 0, 0); if (o.overlay === false) return;   // overlay: false = the painted floor alone (GLOBE1)
      const front = (pts, w, col, dash) => { let seg = []; const flush = () => { if (seg.length > 1) line(seg, w, col, dash); seg = []; };
        for (const d of pts) { const p = project(d); if (p[2] > 0) seg.push([p[0], p[1]]); else flush(); } flush(); };
      for (let la = -60; la <= 60; la += 30) front(Array.from({ length: 121 }, (_, k) => dirOf(-180 + 3 * k, la)), (la ? 0.5 : 1) * u, la ? '#ffffff22' : '#ffffff55');
      for (let lo = -180; lo < 180; lo += 30) front(Array.from({ length: 61 }, (_, k) => dirOf(lo, -90 + 3 * k)), (lo ? 0.5 : 1) * u, lo ? '#ffffff22' : '#ffffff55');
      if (o.coneDirs) { ctx.save(); ctx.fillStyle = '#ff4fa3'; for (const [lo, la] of o.coneDirs) { const p = project(dirOf(lo, la)); if (p[2] > 0) ctx.fillRect(p[0] - 0.9 * u, p[1] - 0.9 * u, 1.8 * u, 1.8 * u); } ctx.restore(); }
      const lab = (name, lo, la, col = '#d8d4ea') => { const p = project(dirOf(lo, la)); if (p[2] <= 0.05) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.arc(p[0], p[1], 2.5 * u, 0, 7); ctx.stroke(); ctx.restore(); text(name, p[0] + 4 * u, p[1] - 4 * u, col, o.small ? 9 : 10); };
      if (!o.small) for (const b of o.marks || []) lab(b.name, b.lon, b.lat);
      for (const [n, lo, la] of [['1', 0, 90], ['−1', 0, -90], ['j', 90, 0], ['−i', 180, 0], ['−j', -90, 0]].concat(o.small ? [['i', 0, 0]] : [])) lab(n, lo, la, '#a9a6bd');
      if (o.ring !== false && st.a < 1) { const al = Math.asin(st.a), q = dirOf(st.lon, st.lat), X = (x, y) => [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
        const t0 = X(q, Math.abs(q[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]), n0 = Math.hypot(...t0), e1 = t0.map(v => v / n0), e2 = X(q, e1);
        front(Array.from({ length: 181 }, (_, k) => { const t = k * Math.PI / 90; return q.map((v, i) => Math.cos(al) * v + Math.sin(al) * (Math.cos(t) * e1[i] + Math.sin(t) * e2[i])); }), 1.5 * u, '#ffffffdd', [5 * u, 3 * u]); }
      { const p = project(dirOf(st.lon, st.lat)); if (p[2] > 0) { ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p[0], p[1], (o.small ? 2.5 : 4) * u, 0, 7); ctx.fill(); ctx.restore(); if (!o.small) text('q', p[0] + 6 * u, p[1] + 12 * u, '#fff', 11); } }
      ctx.save(); ctx.strokeStyle = '#ffffff30'; ctx.lineWidth = 1 * u; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.restore();
      if (o.label) text(typeof o.label === 'function' ? o.label(st) : o.label, 4 * u, 12 * u, '#d8d4ea', o.small ? 9.5 : 11); }
    let drag = null;
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw: view.yaw, pitch: view.pitch, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 4) drag.moved = true; if (!drag.moved) return;
      view.yaw = drag.yaw + dx * 0.01; view.pitch = Math.max(-1.5, Math.min(1.5, drag.pitch + dy * 0.01)); draw(); o.onView?.(); });
    cv.addEventListener('pointerup', e => { if (drag && !drag.moved && o.onPick) { const r = cv.getBoundingClientRect(), d = pixelDir((e.clientX - r.left) * dp(), (e.clientY - r.top) * dp());
        if (d) o.onPick({ lon: Math.atan2(d[2], d[1]) / D2R, lat: Math.asin(Math.max(-1, Math.min(1, d[0]))) / D2R }); } drag = null; });
    // the overlay helpers above are mount()'s; the globe has its own copies so it can live without a mount
    function line(pts, w, col, dash) { ctx.save(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.setLineDash(dash || []); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.restore(); }
    function text(t, x, y, col, size = 11) { ctx.save(); ctx.font = `${size * dp()}px system-ui, sans-serif`; ctx.lineWidth = 3 * dp(); ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); ctx.restore(); }
    const dp = () => devicePixelRatio || 1;
    return { set(s) { st = { ...st, ...s }; }, draw, project, pixelDir, colorOfDir, view, get geo() { return G; } }; }
  // ---- the ball and the brim (Doug 10-23: "I need the pattern visually explained. I'm assuming it's how the ball crosses the brim … unless it's to do with
  // the sphere size on the brim"). In units of |q| (the shape depends on r/|q| alone) the ball sits at q̂ with radius a = r/|q|; seen from 0 it spans α = asin a.
  // It has a crossing exactly when it reaches the brim, the cone det J = 0 through 0: when θ, the angle from q̂ to the nearest brim direction, is below α
  // (① = sin θ at every cell of the terrain; BRIM1). scene() draws that in x-space with 0 at the centre, turned by the same matrix as the globe (matOf), so the globe is this
  // scene's unit sphere and its pink wave is the brim's trace on it. body() draws the same ball squared (fable's Fig 2 body, laySq) as a shaded skin.
  const v3 = { add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], sc: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], X: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    un: a => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; } };
  // the brim as one closed curve of directions: det J is −8 at −1 and +8 at 1, and changes sign once on every meridian (checked at 0.1°); bisected, in longitude order
  function brimLoop(detF, n = 720) { const out = [];
    for (let i = 0; i < n; i++) { const lo = -180 + 360 * i / n; let a = -90, b = 90;
      for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (detF(dirOf(lo, m)) < 0) a = m; else b = m; } out.push(dirOf(lo, (a + b) / 2)); }
    return out; }
  // θ: the angle from q̂ to the nearest brim direction (the loop holds both nappes: −x is on the brim when x is, det J being odd)
  function nearestBrim(L, q) { q = v3.un(q); let best = -2, d = L[0]; for (const v of L) { const t = v3.dot(v, q); if (t > best) { best = t; d = v; } } return { d, th: Math.acos(Math.min(1, best)) }; }
  // turn a view side-on to q: the plane through 0, q and the nearest brim ray faces the viewer, so θ and α are drawn flat (M's third row, toward the viewer,
  // is [sin pitch, cos pitch cos yaw, −cos pitch sin yaw] in [1, i, j]; matOf). On the brim, the plane holds the brim's normal instead of q
  function sideOn(view, q, L, detF) { q = v3.un(q); const nb = nearestBrim(L, q); let n;
    if (nb.th > 0.02) n = v3.X(nb.d, q); else { const h = 1e-5, d = nb.d, gr = [0, 1, 2].map(k => { const e = [0, 0, 0]; e[k] = h; return (detF(v3.add(d, e)) - detF(v3.sub(d, e))) / (2 * h); });
      n = v3.X(d, v3.sub(gr, v3.sc(d, v3.dot(gr, d)))); }
    n = v3.un(n); if (n[0] < 0) n = v3.sc(n, -1); view.pitch = Math.asin(Math.min(1, n[0])); view.yaw = Math.atan2(-n[2], n[1]); return view; }
  const KEEP = [95, 200, 232], MIR = [226, 136, 84], GOLD = '#ffd36a', LT = v3.un([-0.45, 0.55, 0.7]);
  const rgb = (c, f) => `rgb(${Math.min(255, c[0] * f) | 0},${Math.min(255, c[1] * f) | 0},${Math.min(255, c[2] * f) | 0})`;
  // back to front; a filled item is a polygon (stroked in its own colour to close the hairline gaps between neighbours), a stroked one a polyline
  function painter(ctx, items) { items.sort((A, B) => A.z - B.z);
    for (const it of items) { ctx.beginPath(); it.p.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      if (it.f) { ctx.closePath(); ctx.fillStyle = it.f; ctx.fill(); if (it.seam) { ctx.strokeStyle = it.f; ctx.lineWidth = it.seam; ctx.setLineDash([]); ctx.stroke(); } }
      else { ctx.strokeStyle = it.s; ctx.lineWidth = it.w; ctx.setLineDash(it.dash || []); ctx.stroke(); } } ctx.setLineDash([]); }
  // the ball's mesh around q̂ (rows from q̂'s pole out), its det J at each vertex, and the crossing (det J = 0) by marching squares on each quad
  function ballMesh(q, a, detF, NU, NV) { const e1 = v3.un(v3.X(q, Math.abs(q[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0])), e2 = v3.X(q, e1), X = [], U = [], F = [];
    for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) { const th = Math.PI * i / NU, ph = 2 * Math.PI * j / NV;
      const u = v3.add(v3.sc(q, Math.cos(th)), v3.add(v3.sc(e1, Math.sin(th) * Math.cos(ph)), v3.sc(e2, Math.sin(th) * Math.sin(ph)))), x = v3.add(q, v3.sc(u, a)); U.push(u); X.push(x); F.push(detF(x)); }
    const quads = [], id = (i, j) => i * (NV + 1) + j;
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const c = [id(i, j), id(i + 1, j), id(i + 1, j + 1), id(i, j + 1)], zs = [];
      for (let e = 0; e < 4; e++) { const A = c[e], B = c[(e + 1) % 4]; if ((F[A] < 0) !== (F[B] < 0)) { const t = F[A] / (F[A] - F[B]); zs.push(v3.add(X[A], v3.sc(v3.sub(X[B], X[A]), t))); } }
      const xm = v3.add(q, v3.sc(v3.un(c.reduce((s, k) => v3.add(s, U[k]), [0, 0, 0])), a));
      quads.push({ c, keep: detF(xm) >= 0, segs: zs.length === 2 ? [[zs[0], zs[1]]] : zs.length === 4 ? [[zs[0], zs[1]], [zs[2], zs[3]]] : [] }); }
    return { X, U, F, quads }; }
  function text2(ctx, t, x, y, col, size, align = 'left') { const u = devicePixelRatio || 1; ctx.save(); ctx.font = `${size * u}px system-ui, sans-serif`; ctx.textAlign = align; ctx.lineWidth = 3 * u;
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); ctx.restore(); }
  function fitCanvas(cv) { const u = devicePixelRatio || 1, W = Math.round(cv.clientWidth * u), H = Math.round(cv.clientHeight * u); if (!W || !H) return null; if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; } return [W, H, u]; }
  // o: { detF, L (brimLoop), view (shared with the globes), small, onView }; set({ q, a }); draw()
  function scene(cv, o = {}) {
    const ctx = cv.getContext('2d'), view = o.view || { yaw: 0, pitch: 0.35 }, L = o.L, detF = o.detF, NU = o.small ? 12 : 24, NV = o.small ? 24 : 48;
    let st = { q: [0, 1, 0], a: 0.5 }, G = null;
    function draw() { const fc = fitCanvas(cv); if (!fc) return; const [W, H, u] = fc, M = matOf(view), a = st.a, q = v3.un(st.q), Lx = 1 + Math.min(a, 1.2) + 0.1;
      const R = 0.47 * Math.min(W, H) / Lx, cx = W / 2, cy = H / 2; G = { M, R, cx, cy, Lx };
      const P = x => [cx + R * v3.dot(M[0], x), cy - R * v3.dot(M[1], x), v3.dot(M[2], x)], items = [], zOf = ps => ps.reduce((s, p) => s + p[2], 0) / ps.length;
      const seg3 = (x0, x1, n, s, w, dash, dz = 0) => { for (let k = 0; k < n; k++) { const p0 = P(v3.add(x0, v3.sc(v3.sub(x1, x0), k / n))), p1 = P(v3.add(x0, v3.sc(v3.sub(x1, x0), (k + 1) / n))); items.push({ p: [p0, p1], z: (p0[2] + p1[2]) / 2 + dz, s, w, dash }); } };
      ctx.clearRect(0, 0, W, H);
      // the brim: a translucent fan of rays from 0 along the loop (both nappes), in 3 pieces each so the depth sort can put the ball in front of it or behind it
      const NW = o.small ? 60 : 120, stp = L.length / NW;
      for (let w = 0; w < NW; w++) { const d0 = L[Math.round(w * stp) % L.length], d1 = L[Math.round((w + 1) * stp) % L.length];
        for (let k = 0; k < 3; k++) { const ps = [v3.sc(d0, Lx * k / 3), v3.sc(d0, Lx * (k + 1) / 3), v3.sc(d1, Lx * (k + 1) / 3), v3.sc(d1, Lx * k / 3)].map(P); items.push({ p: ps, z: zOf(ps), f: 'rgba(255,79,163,0.13)' }); }
        const e0 = P(v3.sc(d0, Lx)), e1 = P(v3.sc(d1, Lx)); items.push({ p: [e0, e1], z: (e0[2] + e1[2]) / 2, s: 'rgba(255,120,190,0.8)', w: 1.2 * u }); }
      // the ball, opaque (the hidden half is culled), coloured by det J's sign: cyan keeps the hand, orange mirrors it; gold = the crossing
      const B = ballMesh(q, a, detF, NU, NV);
      for (const Q of B.quads) { const ps = Q.c.map(k => P(B.X[k])), n = v3.un(Q.c.reduce((s, k) => v3.add(s, B.U[k]), [0, 0, 0])), sn = [v3.dot(M[0], n), v3.dot(M[1], n), v3.dot(M[2], n)];
        if (sn[2] < 0) continue; const z = zOf(ps); items.push({ p: ps, z, f: rgb(Q.keep ? KEEP : MIR, 0.35 + 0.7 * Math.max(0, v3.dot(sn, LT))), seam: 0.8 * u });
        for (const [x0, x1] of Q.segs) items.push({ p: [P(x0), P(x1)], z: z + 0.01, s: GOLD, w: (o.small ? 1.6 : 2.4) * u }); }
      const nb = nearestBrim(L, q), O = [0, 0, 0];
      seg3(O, v3.sc(nb.d, Lx), 8, '#ff7fc4', (o.small ? 1.6 : 2.4) * u, null, 2e-4);   // the nearest brim ray
      seg3(O, v3.sc(q, Lx), 10, '#ffffffcc', 1.2 * u, [4 * u, 3 * u], 2e-4);   // the ray from 0 through q
      let tp = null;
      if (a < 1) { const ca = Math.sqrt(1 - a * a), w1 = v3.un(v3.X(q, M[2])), w2 = v3.X(q, w1), ring = t => v3.sc(v3.add(v3.sc(q, ca), v3.add(v3.sc(w1, a * Math.cos(t)), v3.sc(w2, a * Math.sin(t)))), ca);
        tp = [ring(0), ring(Math.PI)]; for (const p of tp) seg3(O, p, 8, '#ffffffaa', 1 * u, [3 * u, 3 * u], 2e-4);   // the two sight lines that graze the ball, seen from 0
        for (let k = 0; k < 72; k++) { const p0 = P(ring(k * Math.PI / 36)), p1 = P(ring((k + 1) * Math.PI / 36)); items.push({ p: [p0, p1], z: (p0[2] + p1[2]) / 2 + 2e-4, s: '#ffffffcc', w: 1.2 * u, dash: [4 * u, 3 * u] }); } }
      if (!o.small) for (const [nm, e] of [['1', [1, 0, 0]], ['i', [0, 1, 0]], ['j', [0, 0, 1]]]) seg3(O, v3.sc(e, 0.3), 3, '#a9a6bd', 1 * u, null);
      painter(ctx, items);
      // on top: the angles θ (q̂ to the brim) and α (q̂ to a sight line), as arcs near 0, and the names
      const arc = (A, Bv, rho, col, lab) => { const A1 = v3.un(A), B1 = v3.un(Bv), pts = []; for (let k = 0; k <= 24; k++) pts.push(P(v3.sc(v3.un(v3.add(v3.sc(A1, 1 - k / 24), v3.sc(B1, k / 24))), rho)));
        ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.6 * u; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
        if (lab && !o.small) { const m = pts[12]; text2(ctx, lab, m[0] + 4 * u, m[1] - 4 * u, col, 12); } };
      const D = x => (x * 180 / Math.PI).toFixed(0) + '°';
      arc(q, nb.d, 0.93 * Lx, '#ff9fd2', `θ ${D(nb.th)}`); if (tp) arc(q, tp[0], Math.max(0.12, 0.8 * (1 - a)), '#ffffff', `α ${D(Math.asin(a))}`);   // θ out past the ball, α inside it
      const p0 = P(O); ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p0[0], p0[1], 2.5 * u, 0, 7); ctx.fill(); ctx.restore();
      if (!o.small) { text2(ctx, '0', p0[0] - 10 * u, p0[1] + 4 * u, '#fff', 11);
        for (const [nm, e] of [['1', [1, 0, 0]], ['i', [0, 1, 0]], ['j', [0, 0, 1]]]) { const p = P(v3.sc(e, 0.34)); text2(ctx, nm, p[0], p[1], '#a9a6bd', 11, 'center'); }
        const pq = P(q); text2(ctx, 'q', pq[0] + 6 * u, pq[1] - 6 * u, '#fff', 12);
        const pb = P(v3.sc(nb.d, Lx)), rt = pb[0] > 0.6 * W; text2(ctx, 'brim · det J = 0', pb[0] + (rt ? -4 : 4) * u, pb[1] + 14 * u, '#ff9fd2', 11, rt ? 'right' : 'left'); } }
    let drag = null;
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw: view.yaw, pitch: view.pitch }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!drag) return; view.yaw = drag.yaw + (e.clientX - drag.x) * 0.01; view.pitch = Math.max(-1.5, Math.min(1.5, drag.pitch + (e.clientY - drag.y) * 0.01)); draw(); o.onView?.(); });
    cv.addEventListener('pointerup', e => { if (drag && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4) o.onClick?.(); drag = null; });
    return { set(s) { st = { ...st, ...s }; }, draw, get geo() { return G; }, get st() { return st; }, view }; }
  // the same ball squared: fable's Fig 2 body (laySq: y = x² − q², at q̂ with radius a), turned as the flow's stage is. o: { detF, sq, viewM, small }
  function body(cv, o = {}) {
    const ctx = cv.getContext('2d'), detF = o.detF, NU = o.small ? 16 : 28, NV = o.small ? 32 : 56;
    let st = { q: [0, 1, 0], a: 0.5 }, G = null;
    function draw() { const fc = fitCanvas(cv); if (!fc) return; const [W, H, u] = fc, Vm = o.viewM(), q = v3.un(st.q), q2 = o.sq(q), B = ballMesh(q, st.a, detF, NU, NV), Y = B.X.map(x => v3.sub(o.sq(x), q2));
      let Rb = 1e-9; for (const y of Y) Rb = Math.max(Rb, Math.hypot(y[0], y[1], y[2]));
      const k = 0.45 * Math.min(W, H) / Rb, cx = W / 2, cy = H / 2, P = y => [cx + k * v3.dot(Vm[0], y), cy - k * v3.dot(Vm[1], y), v3.dot(Vm[2], y)], items = []; G = { k, cx, cy, Rb };
      ctx.clearRect(0, 0, W, H);
      for (const Q of B.quads) { const ys = Q.c.map(i => Y[i]), ps = ys.map(P), n = v3.un(v3.X(v3.sub(ys[2], ys[0]), v3.sub(ys[3], ys[1]))), sn = [v3.dot(Vm[0], n), v3.dot(Vm[1], n), v3.dot(Vm[2], n)];
        const z = ps.reduce((s, p) => s + p[2], 0) / 4; items.push({ p: ps, z, f: rgb(Q.keep ? KEEP : MIR, 0.3 + 0.75 * Math.abs(v3.dot(sn, LT))), seam: 0.7 * u });   // two-sided: the skin passes through itself
        for (const [x0, x1] of Q.segs) items.push({ p: [P(v3.sub(o.sq(x0), q2)), P(v3.sub(o.sq(x1), q2))], z: z + 0.01 * Rb, s: GOLD, w: (o.small ? 1.5 : 2.2) * u }); }
      painter(ctx, items); }
    return { set(s) { st = { ...st, ...s }; }, draw, get geo() { return G; } }; }
  g.QMap = { counts, terrain, mount, globe, dirOf, matOf, brimLoop, nearestBrim, scene, body, ballMesh, sideOn };
})(window);
