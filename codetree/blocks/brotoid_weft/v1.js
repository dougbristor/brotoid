// brotoid_weft / v1
// codetree:brotoid_weft/v1 — see codetree/blocks/brotoid_weft/ (named brotoid_crossing until 19 October, then for some hours brotoid_tear: Doug renamed the tear the weft)
//
// Where the brotoid's skin passes through itself (the weft), and the umbrellas (cross-caps, Whitney umbrellas) at the ends of that line.
// The ball is |x − q| ≤ r in B2 (x = [1, i, j] parts); its skin is the sphere squared (x ↦ x², minus q² if the caller wants it centred).
//
// THE CLOSED FORM (fable 10-17, brotoid Fig 4). Two ball points x ≠ y square alike only if
//     x² − y² = ½·J(x + y)(x − y) = 0,
// so their midpoint m lies on the crossing cone (det J = 0) and x − y runs along n, J(m)'s null direction. Both on the sphere forces
// (m − q)·n = 0 and |x − m| = √(r² − |m − q|²). On each line d of the cone that fixes m = s·d with s = (q·n)/(d·n): ONE midpoint per cone
// line. The midpoints form one curve G that depends only on q. A ball of radius r crosses itself along the part of G nearer q than r,
// and the weft ends where |m − q| = r: the umbrellas, where n lies along the sphere.
//
// G's TWO BRANCHES (insights 10-17). G runs off to infinity where d·n = 0, and that happens exactly on the seam (i + j, lo 45°) and the
// fold (i − j, lo 135°): on the seam line J's null direction IS the fold direction, and on the fold line it is the seam direction. So the
// weft never reaches across the seam or the fold. "Exactly 2 umbrellas" is NOT general: a branch can hold two valleys of |m − q|
// (q3 = 0.9·dir(150°, 30°): valleys 0.4348 and 0.8754, the other branch 1.9102, and a peak at 2.1286 where two wefts meet), so q3 has
// 2, 4, 6, then 4 umbrellas as r grows (oracle B agrees, conform C5; the valleys and peaks are listed by brotoid_moments).
//
// THE SWITCH POINT (insights 10-19: brotdocs and fable asked whether the cross → self switch is a moment). J(x)y = xy + yx is symmetric, so
// J(n)d = J(d)n = 0: n lies on the cone too, and its null direction is d (the seam ↔ fold pair above is one case). The plane (d, n) meets the
// cubic cone in three lines: det J(αd + βn) = αβ(α·c + β·b), c = tr(adj J(d)·J(n)), b = tr(J(d)·adj J(n)) (planeOf), and the
// third is d − (c/b)·n. Along the weft's line det J(m + t·n) = s²c·t + s·b·t², so besides m there is ONE root, t = −s·c/b: one sheet's point
// x = s·(d − (c/b)·n) sits on the crossing (switchOn; the curve X is G's twin, the same s on the third line). The pair is a cross weft while
// |m − q| < r < ρ = |x − q| and a self weft, of hand sign(s·b), once r > ρ: once per line, never back. So self wefts are born at the minima
// of ρ and meet at its maxima (brotoid_moments ④), and split by hand where the weft runs through 0 (s = 0, at ③). ρ is infinite on four fixed
// lines, which stay cross for good: the seam and the fold (G's gaps) and b = 0, lo 109.38° and 160.50° (the plane (d, n) tangent to the cone
// along n). Conform C18, C19; the atom's own kinds at 5919 radii on 20 q agree (aicolab/tmp/rcm/moment4/switch2.mjs).
//
// THE CONE. det J = 0 is a cubic cone, fixed (it does not depend on q or r), so its lines are found once, at load (CONE, and LINES with a ladder toward
// G's gaps, below). Each meridian
// (longitude lo, latitude from −real to +real) holds exactly ONE cone point: with t = tan(lat), det J along a meridian is
// 4·cos³(lat)·(2t³ + (Y − Z)t² + 2(Y² + Z²)t + Y³ + Y²Z − YZ² − Z³), Y = cos lo, Z = sin lo, whose t-derivative
// 6t² + 2(Y − Z)t + 2(Y² + Z²) has discriminant 4(Y − Z)² − 48(Y² + Z²) < 0: strictly increasing, one root. Half the meridians
// (lo in [0°, 180°)) give every line once, because the line through d and −d meets the meridians lo and lo + 180°.
//
// Jacobian from CodeT (bristor_square_jacobian, the shipped i-roll pair), never retyped here.
// NAMES are parameters, defaulting to Doug's names (crossing (19 October; it was 'join' from 17 October), crossing cone, weft (19 October; it was 'tear' from 17 October: a weft passes through the warp without cutting it, and there is no hole), umbrella.
// The API keeps its own words (crossing()); the weft list is `wefts` and the kinds' NAMES keys crossWeft / selfWeft (Doug 10-21; `tears`, crossTear, selfTear until then).

import { bristorSquareJacobian, SHIPPED } from '../bristor_square_jacobian/v1.js';

export const NAMES = { crossing: 'weft', umbrella: 'umbrella', crossWeft: 'cross weft', selfWeft: 'self weft' };   // the two kinds: Doug 10-18; weft 10-19

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = a => Math.hypot(a[0], a[1], a[2]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sc = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// adj M for rows a, b, c: its columns are b×c, c×a, a×b. tr(A·B) = Σ A[i][j]·B[j][i].
const adj = ([a, b, c]) => { const C = [crs(b, c), crs(c, a), crs(a, b)]; return [0, 1, 2].map(i => C.map(col => col[i])); };
const trAB = (A, B) => { let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += A[i][j] * B[j][i]; return s; };

/** Direction at (longitude, latitude) in degrees, as fable's sphere_setter: latitude runs toward the real axis. [1, i, j]. */
export const dirOf = (lo, la) => { lo *= Math.PI / 180; la *= Math.PI / 180; return [Math.sin(la), Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo)]; };

/** J(x) as three rows. */
export const jacobianRows = x => { const J = bristorSquareJacobian(x[0], x[1], x[2], SHIPPED); return [J.slice(0, 3), J.slice(3, 6), J.slice(6, 9)]; };
/** det J(x). */
export const detJ = x => { const [a, b, c] = jacobianRows(x); return dot(a, crs(b, c)); };
/** J(x)'s null direction (unit; sign arbitrary): the largest cross product of two rows. Meaningful on the cone, away from 0. */
export function nullDir(x) { const R = jacobianRows(x); let best = null, bn = -1;
  for (const [a, b] of [[0, 1], [1, 2], [0, 2]]) { const v = crs(R[a], R[b]), n = nrm(v); if (n > bn) { bn = n; best = v; } }
  return sc(best, 1 / bn); }

/**
 * A root of f in [a, b] (fa, fb of opposite signs) to |b − a| ≤ tol, by Illinois (regula falsi that halves the stuck end's value), with a
 * bisection whenever a step fails to halve the bracket, so it never does worse than bisection. Returns [x, fx] at the end with the smaller |f|.
 * A non-finite f (G at infinity) takes the bisection too. 10-18: replaces 60- and 50-step bisections, ~10 evaluations each (fable: spans
 * dominated their frame).
 */
function rootIn(f, a, b, fa, fb, tol) { let side = 0, w = Math.abs(b - a);
  for (let it = 0; it < 200 && Math.abs(b - a) > tol && fa !== 0 && fb !== 0; it++) {
    let c = isFinite(fa) && isFinite(fb) ? (a * fb - b * fa) / (fb - fa) : (a + b) / 2;
    if (!(c > Math.min(a, b) && c < Math.max(a, b)) || (it % 3 === 2 && Math.abs(b - a) > w / 2)) c = (a + b) / 2;
    if (it % 3 === 2) w = Math.abs(b - a);
    const fc = f(c);
    if (!isFinite(fc) || Math.sign(fc) === Math.sign(fb)) { b = c; fb = fc; if (side === -1) fa /= 2; side = -1; }
    else { a = c; fa = fc; if (side === 1) fb /= 2; side = 1; } }
  return Math.abs(fa) <= Math.abs(fb) || !isFinite(fb) ? [a, fa] : [b, fb]; }

/** The cone's line on meridian lo (degrees): { lo, d (unit), n (unit null direction), dn = d·n }. det J along a meridian is strictly increasing
 * in latitude (block.md), so one root, found by rootIn on latitude to 1e-13°. */
export function coneLine(lo) { const f = la => detJ(dirOf(lo, la)), [la] = rootIn(f, -90, 90, f(-90), f(90), 1e-13);
  const d = dirOf(lo, la), n = nullDir(d); return { lo, d, n, dn: dot(d, n) }; }
/** The plane (d, n)'s cubic on a cone line, det J(αd + βn) = αβ(α·c + β·b): sets L.c, L.b on first use and returns L. Its third line is
 * d − (c/b)·n (THE SWITCH POINT, above). Lazy because crossing() never needs it: computed in coneLine it cost crossing() 26% (10-19). */
export const planeOf = L => { if (L.c === undefined) { const Jd = jacobianRows(L.d), Jn = jacobianRows(L.n); L.c = trAB(adj(Jd), Jn); L.b = trAB(Jd, adj(Jn)); } return L; };

/** The cone's lines at STEP degrees, lo in [0°, 180°): found once. */
export const STEP = 0.125;
export const CONE = Array.from({ length: Math.round(180 / STEP) }, (_, k) => coneLine(k * STEP));
/**
 * The lines G is walked on: CONE plus a geometric ladder toward each of G's gaps (the seam, lo 45°, and the fold, lo 135°) from both sides, at
 * STEP·0.8^k, k = 1 … 64, sorted by lo. Near a gap G runs off to infinity like 1 / (distance to the gap), so a valley of |m − q| there can be far
 * narrower than one step, with no sample beside it lower than its neighbours: oracle B found a pair of umbrellas the uniform lines missed, at
 * q = 0.9·dir(134.9°, 16.8°), r 0.503 (insights 10-18, conform C12). Spaced geometrically, the ladder puts a few samples across such a valley at
 * any distance from the gap.
 */
export const LINES = (() => { const out = CONE.slice(); for (const gap of [45, 135]) for (const side of [-1, 1]) for (let k = 1; k <= 64; k++) out.push(coneLine(gap + side * STEP * 0.8 ** k));
  return out.sort((a, b) => a.lo - b.lo); })();
const NL = LINES.length, loAt = i => LINES[((i % NL) + NL) % NL].lo + 180 * Math.floor(i / NL);   // unwrapped: it runs on past 180° for a span over the wrap

/** The midpoint on one cone line for centre q: { lo, m, n, h = |m − q| }, or null where d·n = 0 (G runs off to infinity there). */
export function midOn(L, q) { if (Math.abs(L.dn) < 1e-9) return null; const m = sc(L.d, dot(q, L.n) / L.dn); return { lo: L.lo, m, n: L.n, h: nrm(sub(m, q)) }; }

/** G, the curve of weft midpoints for centre q: one entry per line of LINES, in order of lo (null where it is at infinity: the seam and fold lines). */
export const curveG = q => LINES.map(L => midOn(L, q));

/** The switch point on one cone line for centre q: { lo, x, t, rho, hand, h }, or null where d·n = 0 (as midOn). x = m + t·n is the one point
 * of this line's weft pair that sits on the crossing (t is along this line's n, so its sign is n's); rho = |x − q|, the radius from which the
 * line's weft is a self weft (a cross weft for h < r < rho, h = |m − q|); hand = that self weft's hand (+1 keeps, −1 mirrors; 0 where the
 * weft runs through 0). Where b = 0 the switch is at infinity: x null, rho Infinity (the line stays cross). */
export function switchOn(L, q) { if (Math.abs(L.dn) < 1e-9) return null; const s = dot(q, L.n) / L.dn, m = sc(L.d, s), h = nrm(sub(m, q)); planeOf(L);
  if (!L.b) return { lo: L.lo, x: null, t: Infinity, rho: Infinity, hand: 0, h };
  const t = -s * L.c / L.b; return { lo: L.lo, x: add(m, sc(L.n, t)), t, rho: Math.hypot(h, t), hand: Math.sign(s * L.b), h }; }

/** X, the curve of switch points for centre q (G's twin): one entry per line of LINES, in order of lo (null where G is at infinity). */
export const curveX = q => LINES.map(L => switchOn(L, q));

// The spans of G nearer q than r, each end polished on the meridians. A sign change between two samples brackets an end; a valley whose
// samples all stay outside r is refined (golden section) too, because just past ② both ends can fall inside one step (q2 caught it, 10-17).
const hOf = (q, lo) => { const g = midOn(coneLine(lo), q); return g ? g : { lo, h: Infinity }; };
function endBetween(q, r, lo0, lo1) { const seen = new Map(), f = lo => { const g = hOf(q, lo); seen.set(lo, g); return g.h - r; };
  const [lo] = rootIn(f, lo0, lo1, f(lo0), f(lo1), 1e-13), g = seen.get(lo);
  return g && isFinite(g.h) ? g : null; }
function valleyMin(q, a, b) { const g = (Math.sqrt(5) - 1) / 2; let x1 = b - g * (b - a), x2 = a + g * (b - a), f1 = hOf(q, x1).h, f2 = hOf(q, x2).h;
  for (let it = 0; it < 60; it++) { if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = b - g * (b - a); f1 = hOf(q, x1).h; } else { a = x1; x1 = x2; f1 = f2; x2 = a + g * (b - a); f2 = hOf(q, x2).h; } }
  return (a + b) / 2; }
function spans(q, r, G) { const N = G.length, h = i => { const g = G[((i % N) + N) % N]; return g ? g.h : Infinity; }, lo = loAt;
  let start = -1; for (let i = 0; i < N; i++) if (h(i) >= r) { start = i; break; }
  if (start < 0) return null;   // all of G inside r: no ends
  const out = []; let open = null, i0 = 0;
  for (let i = start; i < start + N; i++) { const a = h(i), b = h(i + 1);
    if (a >= r && b < r) { open = endBetween(q, r, lo(i), lo(i + 1)); i0 = i + 1; }
    else if (a < r && b >= r) { out.push({ a: open, b: endBetween(q, r, lo(i), lo(i + 1)), i0, i1: i }); open = null; }
    else if (a >= r && b >= r && h(i - 1) >= a && a <= b && isFinite(a)) { const lm = valleyMin(q, lo(i - 1), lo(i + 1));
      if (hOf(q, lm).h < r) out.push({ a: endBetween(q, r, lo(i - 1), lm), b: endBetween(q, r, lm, lo(i + 1)), i0: i + 1, i1: i }); } }
  return out; }

/**
 * The umbrellas for the ball |x − q| = r: points in the ball's own coordinates (before squaring), with the meridian each sits on.
 * [{ kind: 'umbrella', name, x, lo }]. Two per weft; one q can have several wefts (q3: 2, 4, 6, then 4 umbrellas).
 */
export function umbrellas(q, r, { names = NAMES, G = curveG(q) } = {}) { if (G.length !== NL) G = curveG(q);   // a G from before the ladder (10-18)
  return umbrellasOf(spans(q, r, G) || [], names); }
const umbrellasOf = (S, names) => S.flatMap(s => [s.a, s.b].filter(Boolean).map(g => ({ kind: 'umbrella', name: names.umbrella, x: g.m, lo: g.lo })));

/**
 * The weft for the ball |x − q| = r: the spans of G nearer q than r, each a list of { m, x, y, lo } from one umbrella to the other,
 * where x = m + t·n and y = m − t·n (t = √(r² − h²), 0 at the caps) are the two ball points that square alike. The image line is
 * x² (= y²). n is kept one way along a run, so x and y each trace one sheet. G can move fast along the cone (q2: 0.1 per 0.125°), so a run
 * is subdivided on the meridians until no step of m or t exceeds `step`. step defaults to 0.02·|q| (r where q = 0): the shape depends on r/|q|
 * alone, so the sampling does too (T-212, 10-24: an absolute 0.02 walked 10% coarser at |q| 1.0 than at 0.9; fable's proto_qunit). A step
 * passed in is absolute, as before. closed = true when all of G is inside (no umbrellas).
 * umbrellas: the same list umbrellas(q, r) gives, from the same spans (10-18, fable: one call per frame, not two).
 * wefts: the runs cut into cross wefts and self wefts, [{ kind: 'cross' | 'self', name, hand (self: ±1; cross: 0), run, pts }] (below);
 * each run point also gets hx, hy. kinds: false skips them (~0.3 ms of ~1 ms at the conch) and leaves wefts null.
 */
export function crossing(q, r, { names = NAMES, G = curveG(q), step = 0.02 * (nrm(q) || r), kinds = true } = {}) { if (G.length !== NL) G = curveG(q); const S = spans(q, r, G), N = G.length;
  const tOf = g => Math.sqrt(Math.max(0, r * r - g.h * g.h)), far = (a, b) => nrm(sub(a.m, b.m)) + Math.abs(tOf(a) - tOf(b)) > step;
  const fill = (a, b, out, depth) => { if (depth < 10 && far(a, b)) { const g = midOn(coneLine((a.at + b.at) / 2), q);
      if (g && g.h < r) { const c = { ...g, at: (a.at + b.at) / 2 }; fill(a, c, out, depth + 1); out.push(c); fill(c, b, out, depth + 1); } } };
  const run = list => { const pts = []; list = list.filter(Boolean);
    for (let i = 0; i < list.length; i++) { if (i) fill(list[i - 1], list[i], pts, 0); pts.push(list[i]); }
    const out = []; let nPrev = null;
    for (const g of pts) { let n = g.n; if (nPrev && dot(n, nPrev) < 0) n = sc(n, -1); nPrev = n; const t = tOf(g);
      out.push({ m: g.m, x: add(g.m, sc(n, t)), y: sub(g.m, sc(n, t)), lo: ((g.at % 180) + 180) % 180 }); }
    return out; };
  // `at` is the unwrapped meridian (it runs past 180° when a span crosses the wrap), so subdivision bisects the right interval
  if (!S) { const runs = [run(G.map((g, i) => g && { ...g, at: loAt(i) }))];
    return { kind: 'crossing', name: names.crossing, runs, closed: true, umbrellas: [], wefts: kinds ? weftsOf(q, r, runs, true, names) : null }; }
  const runs = S.map(s => { const mid = []; for (let i = s.i0; i <= s.i1; i++) { const g = G[i % N]; if (g) mid.push({ ...g, at: loAt(i) }); }
    return run([s.a && { ...s.a, at: s.a.lo }, ...mid, s.b && { ...s.b, at: s.b.lo }]); });
  return { kind: 'crossing', name: names.crossing, closed: false, umbrellas: umbrellasOf(S, names), runs, wefts: kinds ? weftsOf(q, r, runs, false, names) : null }; }

/*
 * CROSS WEFT AND SELF WEFT (Doug 10-18; 'tear' until 10-19). Each weft point is a pair x, y of ball points, one on each sheet, and each has a hand
 * (sign det J: +1 keeps, −1 mirrors). A cross weft is where the two hands pass through each other (x and y opposite); a self weft is where
 * one hand passes through itself (the same; `hand` says which). A stretch changes kind where x or y crosses the crossing; those switch points
 * are found exactly (det J along the weft, to 1e-12°) and shared by the two stretches either side. Each point of a run gets hx, hy;
 * an umbrella has hx = hy = 0 (x = y = m, on the crossing).
 * Measured 10-18: a weft is always born a cross weft (at an umbrella x − y runs along J(m)'s null direction n, so det J at m ± t·n has
 * the sign of ±t·∇det·n: opposite, unless n is tangent to the crossing; C16), and grows a self middle. The self hand is sign(s·b): it flips
 * only where the weft runs through 0 (m = 0, at ③), where x and y cross the crossing together. Which hand comes first depends on q (10-19: near the
 * real axis keep-hand self wefts are born before ③; the 10-18 reading 'self-keep only after ③' held only for the q tested).
 */
function weftsOf(q, r, runs, closed, names) { const out = [];
  const at = (lo, nRef) => { const g = midOn(coneLine(lo), q); if (!g) return null; const n = dot(g.n, nRef) < 0 ? sc(g.n, -1) : g.n, t = Math.sqrt(Math.max(0, r * r - g.h * g.h));
    return { m: g.m, x: add(g.m, sc(n, t)), y: sub(g.m, sc(n, t)), lo: ((lo % 180) + 180) % 180 }; };
  const unwrap = (lo0, lo1) => lo1 < lo0 - 90 ? lo1 + 180 : lo1 > lo0 + 90 ? lo1 - 180 : lo1;
  const kindOf = h => h.hx * h.hy < 0 ? 'cross' : h.hx === h.hy && h.hx ? 'self' + h.hx : null;
  // h: the stretch's hands (between two switches there may be no sample); a hand of exactly 0 falls back to its points, then to cross
  const stretch = (k, pts, h) => { const kd = kindOf(h) || pts.map(kindOf).find(Boolean) || 'cross', self = kd !== 'cross';
    return { kind: self ? 'self' : 'cross', name: self ? names.selfWeft : names.crossWeft, hand: self ? +kd.slice(4) : 0, run: k, pts }; };
  runs.forEach((pts, k) => { if (!pts.length) return;
    const list = closed ? [...pts, pts[0]] : pts, L = list.length;
    // H: the hands that decide the kind. An umbrella (x = y, on the crossing) takes those just inside it, 1e-6 of the way to its neighbour: next to
    // the gaps ∇det·n is small and the cross stretch an umbrella starts can be shorter than one sample step (10-18, C16 caught it).
    const nudge = i => { const o = i === 0 ? 1 : L - 2, lo = list[i].lo, lo1 = unwrap(lo, list[o].lo); return lo + 1e-6 * (lo1 - lo); };
    const H = list.map((p, i) => { const end = !closed && (i === 0 || i === L - 1); p.hx = end ? 0 : Math.sign(detJ(p.x)); p.hy = end ? 0 : Math.sign(detJ(p.y));
      if (!end || L < 2) return { hx: p.hx, hy: p.hy, lo: p.lo };
      // the limit just inside the umbrella: det J(m ± t·n) ≈ ±t·D, D = tr(adj J(m)·J(n)) along the run's n (from the nearest point inward that is
      // off the umbrella). Exact where the nudge below is not: beside a gap a weft can be 2e-7° wide, its points closer in lo than a float step
      // allows 1e-6 of, and the nudge read det J's rounding (q5 = 0.9·dir(134.9°, 16.8°), r 0.405: a 2-point self weft at the umbrella; caught by
      // brotoid_moments M11, 10-19). Where D is negligible (the umbrella at 0, at ③; n tangent to the crossing) the nudge decides, as before.
      { const dir = i === 0 ? 1 : -1, tiny = 1e-12 * (r + nrm(q)); let j = i + dir; while (j > 0 && j < L - 1 && nrm(sub(list[j].x, list[j].y)) <= tiny) j += dir;
        const u = sub(list[j].x, list[j].y), un = nrm(u);
        if (un > tiny) { const D = trAB(adj(jacobianRows(p.m)), jacobianRows(sc(u, 1 / un))), sD = Math.sign(D);
          if (Math.abs(D) > 1e-9 * (r + nrm(q)) ** 2) return { hx: sD, hy: -sD, lo: nudge(i) }; } }   // D is a length²: at ③ (m ~ 1e-16) it is rounding
      const o = list[i === 0 ? 1 : L - 2], lo = nudge(i), e = at(lo, sub(o.x, o.y)), hx = e ? Math.sign(detJ(e.x)) : 0, hy = e ? Math.sign(detJ(e.y)) : 0;
      // a weft shorter than float can split (next to the seam, 1e-12° long: the journey met one, 10-18) puts the nudge back on the umbrella
      return hx && hy ? { hx, hy, lo } : { hx: Math.sign(detJ(o.x)), hy: Math.sign(detJ(o.y)), lo: o.lo }; });
    // the cuts between samples a and b when the weft runs through 0 between them, in order: [switch,] 0 (both sheets) [, switch]; null (the
    // general route decides) unless every root brackets and the flips land on b's hands
    const throughZero = (a, b, ha, hb, i) => { if (!kindOf(ha) || !kindOf(hb)) return null;
      const lo0 = ha.lo, lo1 = unwrap(lo0, hb.lo), end = i === 1 ? b : a, nRef = sub(end.x, end.y);
      const mf = lo => { const g = midOn(coneLine(lo), q); return g ? dot(g.m, a.m) : NaN; }, f0 = mf(lo0), f1 = mf(lo1);
      if (!(f0 > 0 && f1 < 0)) return null; const z = rootIn(mf, lo0, lo1, f0, f1, 1e-12)[0];
      const rf = lo => { const o = switchOn(coneLine(lo), q); return o ? o.rho - r : NaN; }, rz = rf(z);
      if (!(rz < 0)) return null;
      // an end's H sits 1e-6 of a step inside its umbrella, which can be past a cross end only ~(r − |q|)² long (r just past ③): bracket from the
      // umbrella itself, and where even that reads rho ≤ r the switch is at the umbrella to within lo's resolution (as the general route does)
      const sw = (lo, ka, u) => { if (kindOf(ka) !== 'cross') return null; const l = u ? unwrap(lo0, u.lo) : lo, fa = rf(l);
        return fa > 0 ? rootIn(rf, l, z, fa, rz, 1e-12)[0] : u ? l : undefined; };
      const cA = sw(lo0, ha, !closed && i === 1 && a), cB = sw(lo1, hb, !closed && i === L - 1 && b); if (cA === undefined || cB === undefined) return null;
      // the self hands either side of 0 (opposite): from a self sample, else from switchOn (sign(s·b), intrinsic) beside 0
      const hA = kindOf(ha) !== 'cross' ? ha.hx : kindOf(hb) !== 'cross' ? -hb.hx : switchOn(coneLine((cA + z) / 2), q).hand;
      if (!hA) return null;
      const cuts = [];
      if (cA !== null) cuts.push({ lo: cA, on: [ha.hx !== hA ? 'x' : 'y'] });
      cuts.push({ lo: z, on: ['x', 'y'] });
      if (cB !== null) cuts.push({ lo: cB, on: [hb.hx !== -hA ? 'x' : 'y'] });
      let h = { hx: ha.hx, hy: ha.hy }; for (const c of cuts) h = { hx: c.on.includes('x') ? -h.hx : h.hx, hy: c.on.includes('y') ? -h.hy : h.hy };
      if (h.hx !== hb.hx || h.hy !== hb.hy) return null;
      for (const c of cuts) { c.p = at(c.lo, nRef); if (!c.p) return null; }
      return cuts; };
    const cur = [list[0]], mine = [];
    for (let i = 1; i < L; i++) { const a = list[i - 1], b = list[i], ha = H[i - 1], hb = H[i];
      // THROUGH 0 INSIDE ONE STEP (T-212, 10-24). m = s·d is continuous along a run, so s changes sign between two samples iff a.m·b.m < 0
      // (at the 180° wrap s and d flip together and m does not). There both sheets flip at s = 0 (m = 0, needs r > |q|), and rho → |q| < r, so
      // each side of 0 is self next to it; a side whose sample is cross holds its switch (rho = r, exact by switchOn) in between. Sampled signs
      // could not see a sheet that flipped twice in one step: beside the seam the default step dropped a self half (`c s-1 c` for `c s1 s-1 c`).
      const thru = r > nrm(q) && dot(a.m, b.m) < 0 && throughZero(a, b, ha, hb, i);
      if (thru) { let h = { hx: ha.hx, hy: ha.hy };
        for (const c of thru) { const p = c.p; p.hx = c.on.includes('x') ? 0 : h.hx; p.hy = c.on.includes('y') ? 0 : h.hy;
          cur.push(p); mine.push(stretch(k, cur.splice(0), h)); cur.push(p);
          h = { hx: c.on.includes('x') ? -h.hx : h.hx, hy: c.on.includes('y') ? -h.hy : h.hy }; } }
      else if (kindOf(ha) !== kindOf(hb)) { const lo0 = ha.lo, lo1 = unwrap(lo0, hb.lo), end = i === 1 ? b : a, nRef = sub(end.x, end.y); let cuts = [];
        for (const s of ['x', 'y']) if (ha['h' + s] !== hb['h' + s]) { const f = lo => { const p = at(lo, nRef); return p ? detJ(p[s]) : NaN; };
          cuts.push({ lo: rootIn(f, lo0, lo1, f(lo0), f(lo1), 1e-12)[0], on: [s] }); }
        cuts.sort((u, v) => (u.lo - v.lo) * (lo1 - lo0)); for (const c of cuts) c.p = at(c.lo, nRef);
        // beside a gap a cross end can be narrower than one float step of lo: no root to bracket, and rootIn hands back the self side's sample
        // (q5 r 0.95: det 4.2). The switch is then at the umbrella to within lo's resolution, and the umbrella is on the crossing: put it there.
        if (!closed && (i === 1 || i === L - 1)) { const u = list[i === 1 ? 0 : L - 1];
          for (const c of cuts) if (c.p && c.on.some(w => Math.abs(detJ(c.p[w])) > 1e-6 * Math.max(1, nrm(c.p[w]) ** 3))) { c.lo = u.lo; c.p = { m: u.m, x: u.m, y: u.m, lo: u.lo }; } }
        // both at once (the weft runs through 0): merged by where the points are, not by lo, which next to a gap can hold 1e-9° of a long stretch
        if (cuts.length === 2 && nrm(sub(cuts[0].p.x, cuts[1].p.x)) + nrm(sub(cuts[0].p.y, cuts[1].p.y)) < 1e-9 * (r + nrm(q))) cuts = [{ ...cuts[0], on: ['x', 'y'] }];
        let h = { hx: ha.hx, hy: ha.hy };
        for (const c of cuts) { const p = c.p; p.hx = c.on.includes('x') ? 0 : h.hx; p.hy = c.on.includes('y') ? 0 : h.hy;
          cur.push(p); mine.push(stretch(k, cur.splice(0), h)); cur.push(p);
          h = { hx: c.on.includes('x') ? hb.hx : h.hx, hy: c.on.includes('y') ? hb.hy : h.hy }; } }
      cur.push(b); }
    mine.push(stretch(k, cur, H[L - 1]));
    // THROUGH 0 (T-212, 10-24). The self hand is sign(s·b), so it flips at s = 0 (m = 0) or at b = 0. At b = 0 rho is infinite and a real cross
    // weft sits between the two hands (lo ~109.4°: |m| ≥ 1e-3·(r + |q|), stable at every step). At s = 0, det J(s·d ± t·n) = ±s·t·(s·c ± t·b) ≈ s·t²·b
    // for BOTH sheets, so x and y change hand at one point and no cross weft is possible. The computed n sits off the cone by rounding (±t³·det J(n)),
    // which splits that point into two roots up to 4e-7·(r + |q|) apart. A sample landing between them made a 2-point cross weft that came and went
    // with step, |q| and engine (q5: fable, proto_qunit 10-23). Measured on 42 q × 6 r × 2 units × 3 steps: 77 such pieces ≤ 3.9e-7, 270 real ones
    // ≥ 1e-3, nothing between; the tolerance sits in that gap. The piece is dropped and its two neighbours meet at one point on the crossing.
    // Since the through-0 cuts (throughZero, same day) this is only the net for when they decline: a sample inside the split itself, ~5e-6 of
    // the time at the default step. Off, the 1512 calls above show no such piece; so it is not planted (it cannot fire on the fixtures).
    for (let i = mine.length - 2; i > 0; i--) { const a = mine[i - 1], c = mine[i], b = mine[i + 1];
      if (c.kind === 'cross' && a.kind === 'self' && b.kind === 'self' && a.hand === -b.hand && c.pts.every(p => nrm(p.m) < 1e-5 * (r + nrm(q)))) {
        const p = a.pts[a.pts.length - 1]; p.hx = p.hy = 0; b.pts[0] = p; mine.splice(i, 1); } }
    if (closed && mine.length > 1 && mine[0].kind === mine[mine.length - 1].kind && mine[0].hand === mine[mine.length - 1].hand) { const last = mine.pop(); mine[0].pts = [...last.pts.slice(0, -1), ...mine[0].pts]; }
    out.push(...mine); });
  return out; }
