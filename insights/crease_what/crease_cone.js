// crease_cone: the "ball and G" view for the crease explorer (insights 10-18, after fable's brotoid Fig 5, plot ⇄ cone; drawn independently, not copied).
// Space before squaring: the crossing cone (det J = 0, fixed), the globe at |q|, the ball |x − q| ≤ r coloured by hand, and G, the curve of weft midpoints
// (one m per cone line, brotoid_weft). The plot's h is the distance from q to G: the ball has swallowed G where the weft is (gold), and a crease is
// a dip of G still outside the ball (cyan, from the ball's surface to G; its length is the gap).
import { CONE, LINES, coneLine, curveG, detJ, midOn } from '/codetree/blocks/brotoid_weft/v1.js';
import * as X from '/codetree/blocks/brotoid_weft/v1.js';
import { qOf, momentsOf } from './crease_live.js';
const sub = (a, b) => a.map((v, k) => v - b[k]), add = (a, b) => a.map((v, k) => v + b[k]), sc = (a, s) => a.map(v => v * s);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = a => Math.hypot(a[0], a[1], a[2]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const COL = { cone: '255,79,163', tear: '#ffdb6b', g: '#d9d3c7', crease: '#7af0ff', keep: '#19e0ff', flip: '#ff5a1f', self: '#8cff7a' };

// G as drawn. plant: 'neg' takes −m (the wrong branch), 'off' tilts m 1° off the cone; the controls below must refuse both.
// The cone lines are 0.125° apart, and a dip of G near the seam or fold can be narrower than that (q3's first, at 143.5°: drawn 0.4359 against 0.4348,
// CONE1 caught it), so the dips' own lines (brotoid_moments) are put into the walk, and the ball is seen to touch G where the weft is born.
export function gPoints(Qd, plant = '') { const q = qOf(Qd), G = curveG(q);
  for (const b of momentsOf(Qd).births) { const g = midOn(coneLine(b.lo), q), i = G.findIndex(o => o && o.lo > b.lo); if (g && i > 0) G.splice(i, 0, g); }
  return G.map(g => { if (!g) return null; let m = g.m;
  if (plant === 'neg') m = sc(m, -1); if (plant === 'off') { const L = coneLine(g.lo), t = nrm(m) * Math.sign(dot(m, L.d)), a = Math.PI / 180, e = cross(L.d, cross([1, 0, 0], L.d)); m = sc(add(sc(L.d, Math.cos(a)), sc(e, Math.sin(a) / (nrm(e) || 1))), t); }
  return { ...g, m, h: nrm(sub(m, q)) }; }); }

// X as drawn (insights 10-19): each cone line's switch point x (brotoid_weft switchOn), where that line's weft pair turns from cross to self; G's
// twin, on the third line of the plane (d, n). plant: 'mirror' takes the pair's other point m − t·n (the same rho, but off the cone).
export function xPoints(Qd, plant = '') { const q = qOf(Qd);
  return LINES.map(L => { const o = X.switchOn(L, q); if (!o || !o.x || !isFinite(o.rho)) return null;
    return { lo: o.lo, x: plant === 'mirror' ? sub(o.x, sc(L.n, 2 * o.t)) : o.x, rho: o.rho }; }); }

// controls (brief 5c): G on the cone, and G's local minima = the plot's dips (the ball touches G at r = h·(1 ± 0.002)).
// X (10-19): every drawn switch point on the cone, and ④'s point |q − x| = r away (plant 'mirror' must fail the first).
export function checkCone(Qd, plant = '') { const q = qOf(Qd), G = gPoints(Qd, plant), mo = momentsOf(Qd);
  let cone = 0; for (const g of G) if (g && nrm(g.m) > 1e-6) cone = Math.max(cone, Math.abs(detJ(g.m)) / nrm(g.m) ** 3);
  const touch = mo.births.map(b => { let best = Infinity; for (const g of G) if (g && Math.abs(((g.lo - b.lo) % 180 + 270) % 180 - 90) < 2) best = Math.min(best, g.h);
    return { lo: b.lo, h: b.r, drawn: best, inside: best < b.r * 1.002, outside: best >= b.r * 0.998 }; });
  let xc = 0; for (const p of xPoints(Qd, plant)) if (p && nrm(p.x) > 1e-6 && nrm(p.x) < 50) xc = Math.max(xc, Math.abs(detJ(p.x)) / nrm(p.x) ** 3);
  const sb = mo.selfBirth, x4 = sb ? Math.abs(nrm(sub(sb.at, q)) - sb.r) : 0;
  return { cone, coneOK: cone < 1e-9, touch, touchOK: touch.every(t => t.inside && t.outside), xcone: xc, x4, xOK: xc < 1e-9 && x4 < 1e-9 }; }

// The ball's grid, fixed to the ball (Doug 10-19: "show the cut lines that apply and get distorted too"): latitudes about q with the real axis as pole,
// every 30°, and 12 half-meridians. The same lines are drawn squared on the brotoid (explorer), so each line can be followed through the square.
// The equator (white) and the meridian toward i (white, dashed) are the two to follow.
export function gridLines(Qd, r) { const q = qOf(Qd), at = (lo, la) => { const d = X.dirOf(lo, la); return add(q, sc(d, r)); }, out = [];
  for (let la = -60; la <= 60; la += 30) out.push({ kind: la === 0 ? 'eq' : 'lat', pts: Array.from({ length: 73 }, (_, n) => at(n * 5, la)) });
  for (let lo = 0; lo < 360; lo += 30) out.push({ kind: lo === 0 ? 'mer0' : 'mer', pts: Array.from({ length: 37 }, (_, n) => at(lo, n * 5 - 90)) });
  return out; }
export const gridCol = (kind, a, b) => kind === 'eq' || kind === 'mer0' ? '#ffffff' : detJ(sc(add(a, b), 0.5)) >= 0 ? COL.keep : COL.flip;

// mount on a canvas. get() → { Qd, r, hover (lo or null) }; onHover(lo | null) when the pointer is near G.
export function coneView(cv, get, { onHover } = {}) {
  let yaw = -0.6, pitch = 0.32, drag = null, last = null;
  const V = () => { const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    // screen right, up, toward the viewer, in body coordinates [1, i, j]; at yaw = pitch = 0: right = i, up = 1 (real), toward = −j
    const R = [0, cy, -sy], U0 = [1, 0, 0], T0 = [0, -sy, -cy]; return [R, add(sc(U0, cp), sc(T0, -sp)), add(sc(U0, sp), sc(T0, cp))]; };
  function draw() {
    const dp = devicePixelRatio, w = cv.width = Math.round(cv.clientWidth * dp), h = cv.height = Math.round(cv.clientHeight * dp), c = cv.getContext('2d');
    const { Qd, r, hover } = get(), q = qOf(Qd), Q = nrm(q), Vm = V(), C = sc(q, 0.5), E = Q * Math.max(1.4 / 0.9, 0.5 + r / Q + 0.1 / 0.9), k = Math.min(w, h) * 0.47 / E;
    const P = p => { const d = sub(p, C); return [w / 2 + k * dot(Vm[0], d), h / 2 - k * dot(Vm[1], d), dot(Vm[2], d)]; }, dq = P(q)[2];
    c.fillStyle = '#05070c'; c.fillRect(0, 0, w, h); c.lineCap = 'round';
    const segs = [], seg = (a, b, col, wd = 1, o = {}) => { const A = P(a), B = P(b); segs.push({ A, B, col, wd, ...o, z: (A[2] + B[2]) / 2 }); };
    const dots = [], dot2 = (p, col, rad, o = {}) => { const A = P(p); dots.push({ A, col, rad, ...o, z: A[2] }); };
    // the crossing cone: a fan of its lines through 0, both ways, out to the rim; the rim and the globe's cut (|x| = |q|) as curves
    // the frame is in units of |q| (brotbot's gate 10-24: hosts set |q| = 1, and the absolute floor 1.4 drew the 0.9-era view ~11% larger); at
    // |q| = 0.9 it is the old frame exactly, and every |q| now draws the same picture for the same r/|q|
    const RIM = 1.9 * E, cut = s => { const pts = []; for (let i = 0; i < CONE.length; i += 8) pts.push(sc(CONE[i].d, s)); for (let i = 0; i < CONE.length; i += 8) pts.push(sc(CONE[i].d, -s)); pts.push(pts[0]); return pts; };
    for (let i = 0; i < CONE.length; i += 40) for (const s of [RIM, -RIM]) seg([0, 0, 0], sc(CONE[i].d, s), `rgba(${COL.cone},.22)`, 1);
    for (const s of [RIM, Q]) { const pts = cut(s); for (let i = 1; i < pts.length; i++) seg(pts[i - 1], pts[i], `rgba(${COL.cone},${s === Q ? .7 : .35})`, s === Q ? 1.5 : 1); }
    // the seam and fold lines of the cone: G runs off to infinity on them (the plot's walls)
    for (const [lo, t] of [[45, 'seam'], [135, 'fold']]) { const d = coneLine(lo).d; seg(sc(d, -RIM), sc(d, RIM), 'rgba(201,211,230,.45)', 1, { dash: [3, 4] }); dot2(sc(d, Q), 'rgba(201,211,230,.9)', 2.5, { lab: t }); }
    // the globe at |q|: its outline, and 1, i, j on it
    const globe = { at: P([0, 0, 0]), rad: Q * k };
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]].forEach((e, n) => { seg([0, 0, 0], sc(e, Q), 'rgba(238,233,224,.25)', 1); dot2(sc(e, Q * 1.08), '#eee9e0', 0, { lab: ['1', 'i', 'j'][n], tx: true }); });
    // the ball: latitude and meridian lines about q, coloured by hand (det J at the point: cyan keeps, orange mirrors); the pink seam where it meets the cone
    for (const L of gridLines(Qd, r)) { const hi = L.kind === 'eq' || L.kind === 'mer0'; for (let n = 1; n < L.pts.length; n++) seg(L.pts[n - 1], L.pts[n], gridCol(L.kind, L.pts[n - 1], L.pts[n]), hi ? 1.6 : 1, { ball: true, dash: L.kind === 'mer0' ? [5, 4] : null }); }
    for (let i = 0; i < CONE.length; i += 3) { const d = CONE[i].d, b = dot(q, d), D = b * b - Q * Q + r * r; if (D < 0) continue; for (const s of [b - Math.sqrt(D), b + Math.sqrt(D)]) dot2(sc(d, s), `rgb(${COL.cone})`, 1.2); }
    // G: gold where the ball has swallowed it (the weft), pale outside; broken where it runs off (seam, fold) or leaves the frame
    const G = gPoints(Qd), far = 2.4 * E;
    for (let i = 1; i < G.length; i++) { const a = G[i - 1], b = G[i]; if (!a || !b || nrm(sub(a.m, C)) > far || nrm(sub(b.m, C)) > far || nrm(sub(a.m, b.m)) > 0.4 * E) continue;
      const inn = a.h < r && b.h < r; seg(a.m, b.m, inn ? COL.tear : COL.g, inn ? 2.6 : 1.6); }
    // X: green where the ball has swallowed it (there the line's weft is a self weft), faint and dotted outside; ④ is where the ball first reaches it
    const XP = xPoints(Qd);
    for (let i = 1; i < XP.length; i++) { const a = XP[i - 1], b = XP[i]; if (!a || !b || nrm(sub(a.x, C)) > far || nrm(sub(b.x, C)) > far || nrm(sub(a.x, b.x)) > 0.4 * E) continue;
      const inn = a.rho < r && b.rho < r; seg(a.x, b.x, inn ? COL.self : 'rgba(140,255,122,.32)', inn ? 2.2 : 1.2, { dash: inn ? null : [2, 3] }); }
    for (const o of momentsOf(Qd).selfBirths) if (o.r > r && nrm(sub(o.at, C)) <= far) dot2(o.at, COL.self, 2.6, { lab: `④ ${o.r.toFixed(3)}` });
    // the weft on the ball: its two sheets' points x = m + t·n and y = m − t·n trace two curves on the ball's surface, meeting at the umbrellas
    const T = X.crossing(q, r, { kinds: false });
    for (const run of T.runs) for (let i = 1; i < run.length; i++) { seg(run[i - 1].x, run[i].x, COL.tear, 1.4, { ball: true }); seg(run[i - 1].y, run[i].y, COL.tear, 1.4, { ball: true }); }
    for (const u of T.umbrellas) dot2(u.x, '#fff', 3.2, { ring: COL.tear });
    // creases: each dip of G still outside the ball, joined to the ball's nearest point (the ring); the segment's length is the gap
    for (const b of momentsOf(Qd).births) { if (b.r <= r || nrm(sub(b.at, C)) > far) continue; const ring = add(q, sc(sub(b.at, q), r / b.r));
      seg(ring, b.at, COL.crease, 2.4); dot2(b.at, COL.crease, 3, { lab: `gap ${(b.r - r).toFixed(3)}` }); dot2(ring, COL.crease, 2.2); }
    // the hovered cone line (from the plot or here): its line through 0, its m, q → m (length h), and the point pair or the ring
    if (hover != null) { const g = G.reduce((o, g) => g && (!o || Math.abs(g.lo - hover) < Math.abs(o.lo - hover)) ? g : o, null);
      if (g) { const d = coneLine(g.lo).d; seg(sc(d, -RIM), sc(d, RIM), `rgba(${COL.cone},.95)`, 2.2, { top: true }); seg(q, g.m, '#fff', 1.4, { dash: [4, 4], top: true });
        if (g.h < r) { const t = Math.sqrt(r * r - g.h * g.h); seg(add(g.m, sc(g.n, t)), sub(g.m, sc(g.n, t)), COL.tear, 2.4, { top: true }); dot2(add(g.m, sc(g.n, t)), COL.tear, 3.5, { top: true }); dot2(sub(g.m, sc(g.n, t)), COL.tear, 3.5, { top: true }); }
        else { const ring = add(q, sc(sub(g.m, q), r / g.h)); seg(ring, g.m, COL.crease, 2.4, { top: true }); dot2(ring, COL.crease, 3, { top: true }); }
        { const o = X.switchOn(coneLine(g.lo), q); if (o && o.x && nrm(sub(o.x, C)) <= far) dot2(o.x, COL.self, 3.2, { top: true, lab: `switch, ρ ${o.rho.toFixed(3)}` }); }
        dot2(g.m, '#fff', 3.5, { top: true, lab: `${g.lo.toFixed(1)}°  h ${g.h.toFixed(3)}` }); } }
    seg([0, 0, 0], q, '#fff', 1.6); dot2(q, '#fff', 3.5, { lab: 'q', tx: true }); dot2([0, 0, 0], '#fff', 2, { lab: '0', tx: true });
    // paint: behind q's depth dimmed, then the ball's disc, then in front; hovered marks last
    const stroke = s => { c.strokeStyle = s.col; c.lineWidth = s.wd * dp; c.setLineDash(s.dash ? s.dash.map(v => v * dp) : []); c.beginPath(); c.moveTo(s.A[0], s.A[1]); c.lineTo(s.B[0], s.B[1]); c.stroke(); };
    const spot = o => { if (o.rad) { c.fillStyle = o.col; c.beginPath(); c.arc(o.A[0], o.A[1], o.rad * dp, 0, 7); c.fill(); if (o.ring) { c.strokeStyle = o.ring; c.lineWidth = 1.5 * dp; c.stroke(); } }
      if (o.lab) { c.fillStyle = o.tx ? '#eee9e0' : o.col; c.font = `${11 * dp}px ui-monospace,monospace`; c.fillText(o.lab, o.A[0] + 6 * dp, o.A[1] - 5 * dp); } };
    const back = x => !x.top && x.z < dq - (x.ball ? 0 : 1e-9);
    c.globalAlpha = 0.38; segs.filter(back).sort((a, b) => a.z - b.z).forEach(stroke); dots.filter(back).forEach(spot); c.globalAlpha = 1; c.setLineDash([]);
    c.strokeStyle = 'rgba(238,233,224,.12)'; c.lineWidth = dp; c.beginPath(); c.arc(globe.at[0], globe.at[1], globe.rad, 0, 7); c.stroke();
    const B0 = P(q), gr = c.createRadialGradient(B0[0] - 0.3 * r * k, B0[1] - 0.3 * r * k, 0, B0[0], B0[1], r * k); gr.addColorStop(0, 'rgba(140,160,200,.16)'); gr.addColorStop(1, 'rgba(60,70,100,.10)');
    c.fillStyle = gr; c.beginPath(); c.arc(B0[0], B0[1], r * k, 0, 7); c.fill(); c.strokeStyle = 'rgba(238,233,224,.45)'; c.lineWidth = dp; c.stroke();
    segs.filter(s => !back(s) && !s.top).sort((a, b) => a.z - b.z).forEach(stroke); dots.filter(o => !back(o) && !o.top).forEach(spot); segs.filter(s => s.top).forEach(stroke); dots.filter(o => o.top).forEach(spot); c.setLineDash([]);
    last = { G, P }; }
  cv.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (drag) { yaw += (e.clientX - drag[0]) * 0.008; pitch = Math.max(-1.5, Math.min(1.5, pitch + (e.clientY - drag[1]) * 0.008)); drag = [e.clientX, e.clientY]; draw(); return; }
    if (!last || !onHover) return; const dp = devicePixelRatio, x = e.offsetX * dp, y = e.offsetY * dp; let best = null, bd = 14 * dp;
    for (const g of last.G) { if (!g) continue; const p = last.P(g.m), d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = g.lo; } } onHover(best); });
  cv.addEventListener('pointerup', () => { drag = null; }); cv.addEventListener('pointerleave', () => { if (!drag && onHover) onHover(null); });
  return { draw, get yaw() { return yaw; }, set yaw(v) { yaw = v; }, get pitch() { return pitch; }, set pitch(v) { pitch = v; } }; }
