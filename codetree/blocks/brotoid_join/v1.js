// brotoid_join / v1
// codetree:brotoid_join/v1 — see codetree/blocks/brotoid_join/
//
// The brotoid's join (Doug 10-17): where the ball's sphere |x − q| = r meets the crossing cone (det J = 0), so where squaring turns the solid
// ball over and the keep and mirror sides meet. Points are in the ball's own coordinates (before squaring), [1, i, j]; the caller squares.
//
// ON THE CONE LINES (fable 10-17). The crossing cone is fixed, and every one of its lines t·d meets the sphere where |t·d − q| = r:
//     t = q·d ± √(r² − |q|² + (q·d)²),
// two points while the line is nearer q than r, one when it is tangent, none past it. So the crossing needs no grid: brotoid_weft's CONE
// (1440 lines, 0.125° apart, found once) gives two points per line, and the points join up line to line.
//
// HOW THE POINTS JOIN UP. The line on meridian lo + 180° is the line on lo with d → −d, which swaps its two roots. So walk the unwrapped
// meridian `at` with D = ±d (the sign flips every 180°) and one root x = (q·D ± √disc)·D: at and at + 180° are the two points of one line.
// An arc of lines nearer q than r gives one closed loop: the + root out along the arc, the − root back, meeting where the arc's end lines
// are tangent (disc = 0, one point). If no line misses the ball, the + root alone runs once round the doubled circle: one loop.
//
// ③ FOR THE JOIN (insights 10-18). The farthest cone line from q is exactly |q| away: the plane through 0 square to q always holds a cone line
// (a cubic cone meets a plane in at least one line). So below r = |q| some line misses and no loop goes round the cone's apex 0
// (around: false); at r = |q| the crossing passes through 0; above it the crossing is one loop that goes once round the cone (around: true).
// Loops are born at the cone's local nearest lines (brotoid_moments' touches) and two loops merge at a local farthest line.
//
// NAMES are parameters (Doug's names: crossing (19 October; it was 'join' from 17 October), crossing cone, weft, umbrella).
//
// { f }: WHICH JOIN (10-18, fable: "join(q, r, { f }), so one call covers both joins"). B3's bold slice has a second join, the plane
// P3 = 2·1 + i + j = 0 (its det J is detF × P3 there). f is the caller's own function of [x, y, z]: one that equals det J is the cone (the
// default); a linear one is a plane through 0, whose normal is read off f. The sphere meets the plane in an exact circle. Its `around` is
// the cone's rule too: the circle goes round 0 only for r > |q|. Any other f is refused, not guessed at.

import { CONE, STEP, coneLine, detJ } from '../brotoid_weft/v1.js';

export const NAMES = { join: 'crossing', joinPlane: 'crossing plane' };

// what f is: 'cone' (= det J), { n } (linear: a plane through 0 with normal n), or null. Probed at fixed points, to 1e-9 of their scale.
const PROBES = [[0.31, -0.72, 0.45], [-0.58, 0.27, 0.81], [0.66, 0.53, -0.19]];
function kindOf(f) { if (!f) return 'cone';
  if (PROBES.every(x => Math.abs(f(x) - detJ(x)) <= 1e-9 * (1 + Math.abs(detJ(x))))) return 'cone';
  const n = [f([1, 0, 0]), f([0, 1, 0]), f([0, 0, 1])], s = Math.hypot(...n), lin = x => n[0] * x[0] + n[1] * x[1] + n[2] * x[2];
  if (s > 0 && Math.abs(f([0, 0, 0])) <= 1e-12 * s && PROBES.every(x => Math.abs(f(x) - lin(x)) <= 1e-9 * s && Math.abs(f(sc(x, 2.5)) - 2.5 * lin(x)) <= 1e-9 * s)) return { n };
  return null; }

// the plane's join: the circle where |x − q| = r meets n·x = 0, as one closed polyline (gaps ≤ step); none when the plane misses the ball
function planeJoin(q, r, n, step, name) { const s = Math.hypot(...n), u = sc(n, 1 / s), p = dot(q, u), rho2 = r * r - p * p;
  if (!(rho2 > 0)) return { kind: 'join', name, loops: [] };
  const c = sub(q, sc(u, p)), rho = Math.sqrt(rho2), a0 = Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const e1 = (v => sc(v, 1 / nrm(v)))(sub(a0, sc(u, dot(a0, u)))), e2 = [u[1] * e1[2] - u[2] * e1[1], u[2] * e1[0] - u[0] * e1[2], u[0] * e1[1] - u[1] * e1[0]];
  const K = Math.max(8, Math.ceil(2 * Math.PI * rho / step)), pts = [];
  for (let k = 0; k < K; k++) { const t = 2 * Math.PI * k / K; pts.push([0, 1, 2].map(j => c[j] + rho * (Math.cos(t) * e1[j] + Math.sin(t) * e2[j]))); }
  pts.push(pts[0]);
  return { kind: 'join', name, loops: [{ pts, around: nrm(q) < r }] }; }

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = a => Math.hypot(a[0], a[1], a[2]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], sc = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const N = CONE.length, wrap = at => ((at % 180) + 180) % 180;

/**
 * The crossing on the ball |x − q| = r: { kind: 'join', name, loops: [{ pts, around }] }. Each loop's pts is a closed polyline (the last point
 * repeats the first) of ball points on the crossing cone. around: the loop goes round the cone's apex (only when r ≥ |q|).
 * Options: step (default 0.02), the largest gap between neighbouring points, kept by subdividing on the meridians (√disc is steep
 * where a line is nearly tangent); thin (default 0.005), drop a point nearer than this to the last one kept (0 keeps every cone line);
 * f (default: det J, the cone), or a linear f for a plane through 0 (B3's P3): then one exact circle, named names.joinPlane.
 */
export function join(q, r, { names = NAMES, step = 0.02, thin = 0.005, f: fn } = {}) {
  const kind = kindOf(fn);
  if (!kind) throw new Error('brotoid_join: f must equal det J (the cone, the default) or be linear (a plane through 0, such as B3\'s P3 = 2x + y + z)');
  if (kind !== 'cone') return planeJoin(q, r, kind.n, step, names.joinPlane ?? NAMES.joinPlane);
  const k = r * r - dot(q, q), discOf = L => k + dot(q, L.d) ** 2, cache = new Map();
  const lineAt = at => { const w = wrap(at), i = w / STEP; if (Number.isInteger(i)) return CONE[i % N];
    let L = cache.get(w); if (!L) cache.set(w, L = coneLine(w)); return L; };
  const ptAt = (at, sgn) => { const L = lineAt(at), D = Math.floor(at / 180) % 2 ? sc(L.d, -1) : L.d, p = dot(q, D);
    return sc(D, p + sgn * Math.sqrt(Math.max(0, k + p * p))); };
  const end = (lo0, lo1) => { let f0 = discOf(lineAt(lo0));   // a tangent line between two meridians (disc changes sign)
    for (let it = 0; it < 40; it++) { const m = (lo0 + lo1) / 2, f = discOf(lineAt(m)); if (f0 * f <= 0) lo1 = m; else { lo0 = m; f0 = f; } }
    return (lo0 + lo1) / 2; };
  const golden = (a, b, s) => { const g = (Math.sqrt(5) - 1) / 2, f = at => s * discOf(lineAt(at)); let x1 = b - g * (b - a), x2 = a + g * (b - a), f1 = f(x1), f2 = f(x2);
    for (let it = 0; it < 60; it++) { if (f1 > f2) { b = x2; x2 = x1; f2 = f1; x1 = b - g * (b - a); f1 = f(x1); } else { a = x1; x1 = x2; f1 = f2; x2 = a + g * (b - a); f2 = f(x2); } }
    return (a + b) / 2; };   // s = +1: the peak of disc, s = −1: its valley
  // the walk along one root, subdividing on the meridians until no gap exceeds step, then thinned
  const walk = (ats, sgn) => { const out = [];
    const fill = (a, xa, b, xb, depth) => { if (depth < 10 && nrm(sub(xa, xb)) > step) { const m = (a + b) / 2, xm = ptAt(m, sgn);
        fill(a, xa, m, xm, depth + 1); out.push(xm); fill(m, xm, b, xb, depth + 1); } };
    let pa = null, xa = null; for (const at of ats) { const x = ptAt(at, sgn); if (xa) fill(pa, xa, at, x, 0); out.push(x); pa = at; xa = x; }
    return out; };
  const tidy = pts => { const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) if (nrm(sub(pts[i], out[out.length - 1])) >= Math.max(thin, 1e-15)) out.push(pts[i]);
    out.push(pts[pts.length - 1]); return out; };
  // disc on every cone line, plus the polished top of any sampled peak that is below 0 (an arc narrower than one step: just past a touch) and
  // the polished bottom of any sampled valley that is above 0 (a gap narrower than one step: just before two loops merge, or just below r = |q|).
  // Only a sample within twice its own step change of 0 is polished: further out, the extremum within a step cannot reach 0 (and the cost
  // is in the polishing).
  const disc = CONE.map(discOf), dk = i => disc[(i + N) % N], pos = disc.map((f, i) => ({ at: i * STEP, f }));
  for (let i = 0; i < N; i++) { const a = dk(i - 1), o = disc[i], b = dk(i + 1), s = o < 0 ? 1 : -1;
    if (s * a <= s * o && s * o >= s * b && Math.abs(o) <= 2 * (Math.abs(a - o) + Math.abs(b - o))) {
      const m = wrap(golden(i * STEP - STEP, i * STEP + STEP, s)), f = discOf(lineAt(m)); if ((f < 0) !== (o < 0)) pos.push({ at: m, f }); } }
  pos.sort((u, v) => u.at - v.at); const P = pos.length, at = j => pos[j % P].at + 180 * Math.floor(j / P), f = j => pos[j % P].f;
  let start = -1; for (let j = 0; j < P; j++) if (f(j) < 0) { start = j; break; }
  if (start < 0) { const ats = Array.from({ length: 2 * N + 1 }, (_, i) => i * STEP);   // no line misses: one loop, the + root once round
    return { kind: 'join', name: names.join, loops: [{ pts: tidy(walk(ats, 1)), around: true }] }; }
  const arcs = []; let ats = null;
  for (let j = start; j < start + P; j++) {
    if (f(j) < 0 && f(j + 1) >= 0) ats = [end(at(j), at(j + 1))];
    else if (f(j) >= 0) { ats.push(at(j)); if (f(j + 1) < 0) { ats.push(end(at(j), at(j + 1))); arcs.push(ats); } } }
  return { kind: 'join', name: names.join, loops: arcs.map(ats => { const out = walk(ats, 1), back = walk(ats.slice().reverse(), -1);
    return { pts: tidy([...out, ...back.slice(1, -1), out[0]]), around: false }; }) }; }
