// brotoid_moments / v1
// codetree:brotoid_moments/v1 — see codetree/blocks/brotoid_moments/
//
// The 3-D cardioid moment for a ball centre q (insights 10-17, turn_through §5; closed form fable 10-17). In 2-D the cusp is one moment; on
// the brotoid it splits in three, as the ball's radius r grows:
//   ① touch: the ball first touches the crossing cone. The crossing (det J = 0 on the ball) is born, a small loop; no weft yet.
//            r = the cone's distance from q = min over cone lines d of |q − (q·d)d|.
//   ② birth: the weft is born at one point, with its two umbrellas (separation² ≈ 3.4·(r − r②) at the conch).
//            r = the nearest point of G (brotoid_weft) to q = min over cone lines of |m − q|.
//   ③ apex:  r = |q|. The skin passes through 0, where J vanishes whole.
// And the merges (insights 10-18), where a count falls again:
//   crossingMerge: two rims meet and become one (the loop on the ball is the rim: brotdocs' map 10-21; name Doug 10-23), at a local FARTHEST cone line nearer q than |q| (q4 = 0.6·dir(−100°, 10°): 0.3682).
//   weftMerge: two wefts meet and become one, their two inner umbrellas meeting and vanishing, at a peak of |m − q| along G
//              (q3 = 0.9·dir(150°, 30°): 2.1286, so q3 has 2, 4, 6, then 4 umbrellas).
// And a fourth kind (insights 10-19; brotdocs and fable asked whether a weft's switch from cross to self is a moment):
//   ④ selfBirth: a self weft is born in the middle of a cross weft: on one cone line, one sheet's weft point reaches the crossing.
//            r = the nearest point of X (brotoid_weft's switch points, G's twin curve) to q = min over cone lines of |x − q|. Each line turns
//            self once and for good (brotoid_weft, THE SWITCH POINT), and |x − q|² = |m − q|² + t², so ② ≤ ④. q3: 0.5494 (lo 143.4°), then 1.6814.
//   selfMerge: two self wefts meet, the cross stretch between them closing, at a peak of |x − q| along X. Not every q has one (972 of 3000
//            random q did); q = 0.344·dir(25°, 55.2°): self wefts born 0.3379, 0.4198, 0.5481, and the last two meet at 0.5508.
//            |x − q| is infinite on four fixed lines (the seam, the fold, lo 109.38° and 160.50°), and the samples beside them are not peaks.
// Radii are absolute (divide by |q| for a slider that runs in units of |q|). Each moment also gives where it happens, in the ball's coordinates.
// NAMES are parameters (Doug's names: crossing (19 October; it was 'join' from 17 October), crossing cone, weft (19 October; it was 'tear'), umbrella, cross weft, self weft).
// The fourth kind's names are insights' placeholders in the same pattern, until Doug names it (identify first, then name: brotdocs 10-19).

import { LINES, STEP, coneLine, midOn, switchOn } from '../brotoid_weft/v1.js';

export const NAMES = { touch: '① crossing born', birth: '② weft born', apex: '③ r = |q|', crossingMerge: 'two rims meet', weftMerge: 'two wefts meet',
  selfBirth: '④ self weft born', selfMerge: 'two self wefts meet' };

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = a => Math.hypot(a[0], a[1], a[2]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], sc = (a, s) => [a[0] * s, a[1] * s, a[2] * s];

// every local minimum of f over the cone's lines (s = −1: every local maximum), each refined by golden section between its two neighbouring
// lines, smallest val first. The lines are brotoid_weft's LINES, with its ladder toward G's gaps (a valley there can be far narrower than one
// step, 10-18). A maximum needs both neighbours present: beside G's gaps |m − q| only climbs to infinity, it has no peak there. keep(o, a, b)
// can refuse a candidate by its neighbours (|x − q|'s poles: the sample beside one is higher than its neighbours but no peak).
function extremaOverCone(f0, s = 1, keep = null) { const f = L => { const o = f0(L); return o && { ...o, v: s * o.val }; };
  const v = LINES.map(L => f(L)), N = v.length, at = lo => f(coneLine(lo)), g = (Math.sqrt(5) - 1) / 2, out = [];
  for (let i = 0; i < N; i++) { const o = v[i], a = v[(i + N - 1) % N], b = v[(i + 1) % N];
    if (!o || (a && a.v < o.v) || (b && b.v < o.v) || (s < 0 && (!a || !b)) || (keep && !keep(o, a, b))) continue;
    let lo = i ? LINES[i - 1].lo : LINES[N - 1].lo - 180, hi = i < N - 1 ? LINES[i + 1].lo : LINES[0].lo + 180, x1 = hi - g * (hi - lo), x2 = lo + g * (hi - lo), f1 = at(x1), f2 = at(x2);
    for (let it = 0; it < 60; it++) { const v1 = f1 ? f1.v : Infinity, v2 = f2 ? f2.v : Infinity;
      if (v1 < v2) { hi = x2; x2 = x1; f2 = f1; x1 = hi - g * (hi - lo); f1 = at(x1); } else { lo = x1; x1 = x2; f1 = f2; x2 = lo + g * (hi - lo); f2 = at(x2); } }
    let best = o; for (const c of [f1, f2]) if (c && c.v < best.v) best = c;
    if (!out.some(m => Math.abs(m.val - best.val) < 1e-12 && Math.abs(((m.lo - best.lo) % 180 + 270) % 180 - 90) < STEP)) out.push(best); }   // a flat bottom on two samples is one valley
  return out.sort((a, b) => a.val - b.val); }

/**
 * The moments for centre q: { touch, birth, apex, selfBirth, touches, births, crossingMerges, weftMerges, selfBirths, selfMerges }. touch / birth /
 * selfBirth are the first of their kind
 * ({ kind, name, r, at, lo }); touches / births list every valley, smallest first, because one q can have more than one:
 * q3 = 0.9·dir(150°, 30°) has a second weft born at r 0.8754 (two more umbrellas), and the cone's distance can have
 * more than one local minimum (each a new crossing loop). birth is null if G is empty. crossingMerges / weftMerges list where two crossing loops,
 * or two wefts, meet and become one (smallest first; at = where they meet). The farthest cone lines, |q| away, are ③, not join merges.
 * selfBirths / selfMerges (④): where a self weft is born (at = the ball point that reaches the crossing) and where two self wefts meet. Every
 * q with a weft has selfBirths (one per stretch of X between its four poles, at least); selfBirth is null only where G is.
 */
export function moments(q, { names = NAMES } = {}) {
  const D = L => { const p = sc(L.d, dot(q, L.d)); return { val: nrm(sub(q, p)), at: p, lo: L.lo }; };
  const H = L => { const g = midOn(L, q); return g && { val: g.h, at: g.m, lo: L.lo }; };
  const X = L => { const o = switchOn(L, q); return o && isFinite(o.rho) && { val: o.rho, at: o.x, lo: L.lo, hand: o.hand }; }, sameHand = (o, a, b) => a && b && a.hand === o.hand && b.hand === o.hand;
  // ① below |q| only: when q is exactly perpendicular to the fold or seam, the ladder's lines beside that gap all sit at |q| to rounding, and the
  // flat top passed as a valley (a false ① at r = |q|; insights 10-23, brim_scope, M13). No line is farther than |q|, so no ① can be there.
  const T = extremaOverCone(D).filter(o => o.val < nrm(q) - 1e-9), B = extremaOverCone(H), JM = extremaOverCone(D, -1).filter(o => o.val < nrm(q) - 1e-9), TM = extremaOverCone(H, -1);
  const SB = extremaOverCone(X), SM = extremaOverCone(X, -1, sameHand);
  const mk = (kind, o) => o && { kind, name: names[kind], r: o.val, at: o.at, lo: o.lo };
  const out = { touch: mk('touch', T[0]), birth: mk('birth', B[0]) || null, apex: { kind: 'apex', name: names.apex, r: nrm(q), at: [0, 0, 0] },
    selfBirth: mk('selfBirth', SB[0]) || null, touches: T.map(o => mk('touch', o)), births: B.map(o => mk('birth', o)),
    crossingMerges: JM.map(o => mk('crossingMerge', o)), weftMerges: TM.map(o => mk('weftMerge', o)),
    selfBirths: SB.map(o => mk('selfBirth', o)), selfMerges: SM.map(o => mk('selfMerge', o)) };
  return out; }
