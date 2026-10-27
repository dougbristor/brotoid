/**
 * unit_order_gxt.js — what "order" means for the units ±1, ±i, ±j, ±k: a quaternion cycle or a Bristorian ranking.
 *
 * Built for reel v2 (Doug 09-30 / 10-01: "show what keeping order means … show breaking order … then the inverse",
 * "run the axis through −re, pingpong", "show this walk through, then that walk through"). One diagram, one morph m:
 *   m = 0  QUATERNION, a cycle: i, j, k on the outer ring, −i, −j, −k on an inner ring, ±1 at the centre.
 *          i·j = k, j·k = i, k·i = j: every product of two units jumps to the third, and turning the ring changes
 *          nothing, so no unit comes first.
 *   m = 1  BRISTORIAN, a ranking: the rings are cut (k → i) and unroll into one line through 0, −k −j −i −1 · 1 i j k,
 *          positives on the right (from the outer ring), negatives on the left (from the inner one). i·j = j, j·i = −i:
 *          a product lands on the multiplier, + stepping up the ranks, − stepping down. A walk ping-pongs across 0.
 * Products are computed live from each algebra's defining rule, never typed in:
 *   quaternion  e_a·e_b = ε_abc e_c for distinct imaginary a, b (Hamilton), e_a·e_a = −1
 *   Bristorian  e_a·e_b = +e_b if a < b, −e_b if a > b, e_a·e_a = −1: the Cayley rule in own symbol order, the declared
 *               convention (notation.overview, Doug 09-08; brotdocs math_bristorian_squaring.md "General B2 product",
 *               verified 09-28). cayley_table.js defaults to this rule since 10-01 (its old default, the opposite algebra, is `oppositeProduct`).
 * Two exact readings of "keeps order" (checked in selfTest, integers only):
 *   · "a before b ⇔ a·b is positive" IS the rank order for Bristorian (total, transitive); for the quaternion it is the
 *     cycle i < j < k < i.
 *   · a Bristorian walk x → x·b lands on ±b, and its sign is (−1)^(steps down + squares) from where it started.
 * A negative is one token in one colour (Doug 10-01: "don't separate the −ve val, same color"): the node is drawn
 * inverted, a filled disc with "−i" cut out of it in the background colour.
 *
 * Pure: frame(ctx, state) draws the whole diagram from state. mount() is the explainer form (set(), gxt:* channel).
 * selfTest() uses integers only, so no tolerance decides anything; sabotage 'rule' swaps in the opposite algebra.
 */
import { wireGxt, NOOP_STAGE_API } from './gxt_anim.js';

const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x, lerp = (a, b, u) => a + (b - a) * u, seg = (t, a, b) => clamp((t - a) / (b - a));
const sio = u => -(Math.cos(Math.PI * u) - 1) / 2, eo = u => u >= 1 ? 1 : 1 - 2 ** (-10 * u), TAU = Math.PI * 2;
export const LABELS = ['1', 'i', 'j', 'k'];

// the two rules, as {sign, idx} for basis a times basis b
export const quaternion = (a, b) => { if (!a) return { sign: 1, idx: b }; if (!b) return { sign: 1, idx: a }; if (a === b) return { sign: -1, idx: 0 };
  const c = 6 - a - b; return { sign: (b - a + 3) % 3 === 1 ? 1 : -1, idx: c }; }; // (1,2),(2,3),(3,1) are the +1 turns
export const bristorian = (a, b) => { if (!a) return { sign: 1, idx: b }; if (!b) return { sign: 1, idx: a }; if (a === b) return { sign: -1, idx: 0 };
  return { sign: a < b ? 1 : -1, idx: b }; };
const opposite = (a, b) => { const p = bristorian(a, b); return a && b && a !== b ? { sign: -p.sign, idx: b } : p; }; // sabotage only
export const U = (idx, sign = 1) => ({ sign, idx });
export const mul = (rule, x, b) => { const p = rule(x.idx, b); return { sign: x.sign * p.sign, idx: p.idx }; };
export const name = x => (x.sign < 0 ? '−' : '') + LABELS[x.idx];
export const text = (rule, a, b) => `${LABELS[a]}·${LABELS[b]} = ${name(rule(a, b))}`;
// a walk: start, then multiply on the right by each of steps → the states, start first
export const walk = (rule, start, steps) => steps.reduce((s, b) => [...s, mul(rule, s[s.length - 1], b)], [start]);

// ── geometry ───────────────────────────────────────────────────────────────────────────────────────────────────
// ring (m = 0): +i lower-left, +j top, +k lower-right (clockwise i → j → k) at R; the negatives at the same angles on
// an inner ring (.55 R); +1 and −1 side by side at the centre, −1 on the left, as on the line. Line (m = 1): x = cx +
// sign·(rank + ½)·L. Each node travels a short way: outer ring → right half, inner ring → left half.
const ANG = [0, 150, 270, 30].map(d => d * Math.PI / 180);
export function nodePos(S, x) {
  const { cx, cy, R, L = R * .82, m = 0 } = S, e = sio(m), r = x.sign > 0 ? R : .55 * R;
  const ring = x.idx ? [cx + r * Math.cos(ANG[x.idx]), cy + r * Math.sin(ANG[x.idx])] : [cx + x.sign * .17 * R, cy + .02 * R], line = [cx + x.sign * (x.idx + .5) * L, cy];
  return [lerp(ring[0], line[0], e), lerp(ring[1], line[1], e)];
}
// where a step's travelling dot is at u (0..1): it leaves `from` on an arc and lands on from·by. Exported so a host
// can draw the dot's trail by time (lib/trail_gxt.js) with the same path the frame draws the dot on.
export function stepPos(S, st, u) {
  const rule = (S.m ?? 0) < .5 ? quaternion : (S.rule ?? bristorian), A = nodePos(S, st.from), B = nodePos(S, mul(rule, st.from, st.by)), go = sio(seg(clamp(u), .08, .6));
  const lift = -Math.sin(Math.PI * go) * (Math.abs(B[0] - A[0]) > .1 * S.R ? .55 : .25) * S.R; // an arc, so a ping across 0 reads as a jump
  return [lerp(A[0], B[0], go), lerp(A[1], B[1], go) + lift];
}
const qb = (P, C, Q, t) => [(1 - t) ** 2 * P[0] + 2 * (1 - t) * t * C[0] + t * t * Q[0], (1 - t) ** 2 * P[1] + 2 * (1 - t) * t * C[1] + t * t * Q[1]];
const ALL = [...[0, 1, 2, 3].map(i => U(i, 1)), ...[0, 1, 2, 3].map(i => U(i, -1))];

// one unit as glyphs: "−" in the upright face, the letter in the math italic, measured and centred as one token
function label(ctx, x, X, Y, px, f, col) {
  const main = f.main ?? (p => `400 ${p}px serif`), math = f.math ?? (p => `italic 400 ${p}px serif`), parts = [];
  if (x.sign < 0) parts.push(['−', main(px)]); parts.push([LABELS[x.idx], x.idx ? math(px) : main(px)]);
  let w = 0; const ws = parts.map(([s, font]) => { ctx.font = font; const v = ctx.measureText(s).width; w += v; return v; });
  let xa = X - w / 2 - (x.idx ? .03 * px : 0); ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  parts.forEach(([s, font], i) => { ctx.font = font; ctx.fillText(s, xa, Y + .33 * px); xa += ws[i]; });
}

// state: { cx, cy, R, L?, m, show, neg (0..1: the negatives' visibility), steps: [{ from, by, u, hold?, fade? }],
//   test: [{ a, b, u }] (the "who comes first?" arrows, positives), at (a unit to ring, the walk's current place),
//   ranks (0..1), fg, bg, accent, dim, fonts: { math, main, mono },
//   focus?: [units] — a pictogram's attention (Doug 10-01, the receipt: "the discarded|unattention parts maybe faded"):
//     nodes outside it, and every edge, drop to `base` (default .18); steps and arrows, the demonstration, stay full;
//   labels?: false — no letters (a pictogram too small to read them keeps the shapes: an inverted disc is a negative) }
export function frame(ctx, S) {
  const { m = 0, show = 1, neg = 1, fg = '#eee9e0', bg = '#0a0a0c', accent = '#19e0ff', dim = '#8a8a93' } = S;
  if (show <= 0) return;
  const f = S.fonts ?? {}, mono = f.mono ?? (p => `500 ${p}px monospace`), main = f.main ?? (p => `400 ${p}px serif`);
  const R = S.R, nr = .14 * R, e = sio(m), drawn = eo(seg(show, 0, .7)), rule = m < .5 ? quaternion : (S.rule ?? bristorian), P = x => nodePos(S, x);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // edges. Ring: i→j→k→i outside, −i→−j→−k→−i inside (fainter); each bows as an arc and straightens as m → 1; the
  // closing arcs (k → i, −k → −i) are the cut. Line: the new rungs 1–i and −1–−i, and the step through 0 (−1 — 1).
  const FK = S.focus ? new Set(S.focus.map(u => u.sign + ':' + u.idx)) : null, base = S.base ?? .18, fa = x => !FK || FK.has(x.sign + ':' + x.idx) ? 1 : base;
  const edge = (A, B, bow, a = 1, t0 = 0, t1 = 1, arrow = true, w = 3) => { if (FK) a *= base; if (a <= 0) return;
    const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], o = [M[0] - S.cx, M[1] - S.cy], ol = Math.hypot(...o) || 1, C = [M[0] + o[0] / ol * bow, M[1] + o[1] / ol * bow];
    const pad = nr / (Math.hypot(B[0] - A[0], B[1] - A[1]) || 1) * 1.15, s0 = Math.max(t0, pad), s1 = s0 + (Math.min(t1, 1 - pad) - s0) * drawn;
    if (s1 <= s0) return;
    ctx.globalAlpha = a * show; ctx.strokeStyle = fg; ctx.lineWidth = w; ctx.beginPath();
    for (let k = 0; k <= 24; k++) { const p = qb(A, C, B, lerp(s0, s1, k / 24)); k ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.stroke();
    if (arrow && s1 > .55 && m < .85) { const p = qb(A, C, B, .56), q = qb(A, C, B, .5), d = Math.atan2(p[1] - q[1], p[0] - q[0]), h = .09 * R;
      ctx.globalAlpha = a * show * (1 - seg(m, .55, .85)); ctx.beginPath(); ctx.moveTo(p[0] - h * Math.cos(d - .5), p[1] - h * Math.sin(d - .5)); ctx.lineTo(...p); ctx.lineTo(p[0] - h * Math.cos(d + .5), p[1] - h * Math.sin(d + .5)); ctx.stroke(); } };
  const gap = .5 * eo(seg(m, .02, .4)), cutA = 1 - seg(m, .15, .45);
  for (const sg of [1, -1]) { const bw = (sg > 0 ? R : .55 * R) * (1 - e), a = sg > 0 ? 1 : .55 * neg;
    edge(P(U(1, sg)), P(U(2, sg)), bw, a); edge(P(U(2, sg)), P(U(3, sg)), bw, a);
    edge(P(U(3, sg)), P(U(1, sg)), bw, a * cutA, 0, .5 - gap, false); edge(P(U(3, sg)), P(U(1, sg)), bw, a * cutA, .5 + gap, 1, false);
    edge(P(U(0, sg)), P(U(1, sg)), 0, a * seg(m, .55, 1), 0, 1, false); }
  edge(P(U(0, -1)), P(U(0, 1)), 0, neg * seg(m, .6, 1), 0, 1, false, 2);
  // the cut: a spark where each closing arc parts
  if (m > 0 && m < .45) for (const sg of [1, -1]) { const A = P(U(3, sg)), B = P(U(1, sg)), bw = (sg > 0 ? R : .55 * R) * (1 - e), M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + bw / 2], k = seg(m, .02, .3) * (1 - seg(m, .2, .42));
    ctx.globalAlpha = k * show * (sg > 0 ? 1 : neg); ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(M[0], M[1], .05 * R * (1 + 2 * seg(m, .02, .3)), 0, TAU); ctx.fill(); }
  // the line: an axis through 0, and "<" between the positive ranks
  if (m > .5) { const a = seg(m, .6, 1) * show, x0 = P(U(3, -1))[0] - .7 * nr * 2, x1 = P(U(3, 1))[0] + .7 * nr * 2;
    ctx.globalAlpha = a * .5; ctx.strokeStyle = dim; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, S.cy); ctx.lineTo(x1, S.cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(S.cx, S.cy - .09 * R); ctx.lineTo(S.cx, S.cy + .09 * R); ctx.stroke();
    ctx.globalAlpha = a; ctx.fillStyle = dim; ctx.font = mono(Math.round(.075 * R)); ctx.textAlign = 'center'; ctx.fillText('0', S.cx, S.cy + .2 * R);
    ctx.fillStyle = fg; ctx.font = main(.16 * R); ctx.textBaseline = 'middle';
    for (let r = 0; r < 3; r++) { const A = P(U(r)), B = P(U(r + 1)); ctx.fillText('<', (A[0] + B[0]) / 2, S.cy - .21 * R); } ctx.textBaseline = 'alphabetic'; }
  // "who comes first?": an arrow a → b, accent when a·b is positive; on the ring it runs outside the arc, on the line above it
  for (const T of S.test ?? []) { const u = clamp(T.u ?? 0); if (u <= 0) continue;
    const A = P(U(T.a)), B = P(U(T.b)), M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], pos = rule(T.a, T.b).sign > 0;
    let C; if (m < .5) { const o = [M[0] - S.cx, M[1] - S.cy], ol = Math.hypot(...o) || 1; C = [M[0] + o[0] / ol * R * .95, M[1] + o[1] / ol * R * .95]; }
    else C = [M[0], S.cy - (1.0 + .35 * Math.abs(T.b - T.a)) * R];
    const s0 = .12, s1 = lerp(s0, .88, eo(u)); ctx.globalAlpha = show * (T.fade ?? 1); ctx.strokeStyle = pos ? accent : dim; ctx.lineWidth = 4; ctx.beginPath();
    for (let k = 0; k <= 30; k++) { const p = qb(A, C, B, lerp(s0, s1, k / 30)); k ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.stroke();
    if (u > .3) { const p = qb(A, C, B, s1), q = qb(A, C, B, s1 - .04), d = Math.atan2(p[1] - q[1], p[0] - q[0]), h = .1 * R; ctx.beginPath();
      ctx.moveTo(p[0] - h * Math.cos(d - .45), p[1] - h * Math.sin(d - .45)); ctx.lineTo(...p); ctx.lineTo(p[0] - h * Math.cos(d + .45), p[1] - h * Math.sin(d + .45)); ctx.stroke(); } }
  // steps: a dot leaves `from`, carrying "·b", and lands where the rule says; the landing node glows
  const glow = new Map(), key = x => x.sign + ':' + x.idx, addGlow = (x, g) => glow.set(key(x), Math.max(glow.get(key(x)) ?? 0, g));
  if (S.at) addGlow(S.at, 1);
  const dots = [];
  for (const st of S.steps ?? []) { const u = clamp(st.u ?? 0); if (u <= 0) continue;
    const to = mul(rule, st.from, st.by), go = sio(seg(u, .08, .6)), land = seg(u, .55, .7), fade = st.hold ? 1 : 1 - seg(u, .85, 1), [dx, dy] = stepPos(S, st, u);
    const fd = st.fade ?? 1; // a host's fade-out for a finished step (so it never has to run u backwards)
    if (land < 1) dots.push({ x: dx, y: dy, a: (1 - land) * fd, by: st.by, go });
    addGlow(to, land * fade * fd); if (u < .2) addGlow(st.from, 1 - seg(u, .1, .2)); }
  // nodes: positive = outline, negative = inverted (a filled disc, the label cut out), one token "−i"
  for (const x of ALL) { const isNeg = x.sign < 0, a = fa(x) * show * (isNeg ? neg : 1) * seg(seg(show, .25, 1), (x.idx + (isNeg ? 4 : 0)) * .05, .4 + (x.idx + (isNeg ? 4 : 0)) * .05);
    if (a <= 0) continue; const [X, Y] = P(x), g = glow.get(key(x)) ?? 0, rr = nr * (1 + .1 * Math.sin(Math.PI * Math.min(g, 1)));
    ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(X, Y, rr, 0, TAU); ctx.fillStyle = isNeg ? fg : bg; ctx.fill();
    ctx.strokeStyle = g > 0 ? accent : fg; ctx.lineWidth = 3 + 3 * g; ctx.stroke();
    if (g > 0) { ctx.globalAlpha = a * g * .4; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, rr * (1.3 + .2 * g), 0, TAU); ctx.stroke(); ctx.globalAlpha = a; }
    if (S.labels !== false) label(ctx, x, X, Y, nr * (isNeg ? .95 : x.idx ? 1.35 : 1.15), f, isNeg ? bg : fg); // sized to the disc, so −i fits inside it
    const rk = (S.ranks ?? 0) * seg(m, .6, 1); if (rk > 0 && !isNeg) { ctx.globalAlpha = a * rk; ctx.fillStyle = dim; ctx.font = mono(Math.round(.07 * R)); ctx.textAlign = 'center'; ctx.fillText(`RANK ${x.idx}`, X, Y + nr + .16 * R); } }
  // the travelling dots, on top, each with its multiplier
  for (const d of dots) { ctx.globalAlpha = show * d.a; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(d.x, d.y, .055 * R, 0, TAU); ctx.fill();
    const by = U(d.by); ctx.globalAlpha = show * d.a * seg(d.go, 0, .15);
    ctx.font = main(.3 * R); ctx.textAlign = 'center'; ctx.fillStyle = accent; ctx.fillText('⋅', d.x - .1 * R, d.y - .12 * R); label(ctx, by, d.x + .08 * R, d.y - .2 * R, .36 * R, f, accent); }
  ctx.restore();
}

// exact checks: integers and table lookups only
export function selfTest({ sabotage = null } = {}) {
  const B = sabotage === 'rule' ? opposite : bristorian, eq = (x, y) => x.sign === y.sign && x.idx === y.idx, UU = [0, 1, 2, 3].map(i => U(i));
  const m3 = (rule, x, y) => { const p = rule(x.idx, y.idx); return { sign: x.sign * y.sign * p.sign, idx: p.idx }; };
  const assoc = rule => { let bad = 0; for (const a of UU) for (const b of UU) for (const c of UU) if (!eq(m3(rule, m3(rule, a, b), c), m3(rule, a, m3(rule, b, c)))) bad++; return bad; };
  const lands = rule => { let n = 0; for (let a = 1; a < 4; a++) for (let b = 1; b < 4; b++) if (a !== b && [a, b].includes(rule(a, b).idx)) n++; return n; };
  const before = rule => (a, b) => rule(a, b).sign > 0, transitive = rule => { const bf = before(rule); for (let a = 1; a < 4; a++) for (let b = 1; b < 4; b++) for (let c = 1; c < 4; c++)
    if (a !== b && b !== c && a !== c && bf(a, b) && bf(b, c) && !bf(a, c)) return false; return true; };
  const W = (rule, s, steps) => walk(rule, s, steps).slice(1).map(name).join(' ');
  // parity: every walk of 1–4 steps from every signed unit; sign flips exactly on a step down or a square
  let par = 0, parN = 0; const seqs = n => n ? seqs(n - 1).flatMap(s => [1, 2, 3].map(b => [...s, b])) : [[]];
  for (const s0 of ALL) for (let n = 1; n <= 4; n++) for (const sq of seqs(n)) { let x = s0, fl = 0; for (const b of sq) { if (x.idx && x.idx >= b) fl++; x = mul(B, x, b); } parN++; if (x.sign === s0.sign * (fl % 2 ? -1 : 1)) par++; }
  const checks = [
    { name: 'quaternion: i·j = k, j·k = i, k·i = j, j·i = −k', pass: text(quaternion, 1, 2) === 'i·j = k' && text(quaternion, 2, 3) === 'j·k = i' && text(quaternion, 3, 1) === 'k·i = j' && text(quaternion, 2, 1) === 'j·i = −k' },
    { name: 'Bristorian (declared convention): i·j = j, j·i = −i; k·i = −i, i·k = k, k·j = −j, j·k = k', pass: ['i·j = j', 'j·i = −i', 'k·i = −i', 'i·k = k', 'k·j = −j', 'j·k = k'].every((s, n) => s === text(B, ...[[1, 2], [2, 1], [3, 1], [1, 3], [3, 2], [2, 3]][n])) },
    { name: 'Doug\'s walks: k ·j ·i → −j i;  k ·i ·i → −i 1;  −i ·j → −j', pass: W(B, U(3), [2, 1]) === '−j i' && W(B, U(3), [1, 1]) === '−i 1' && W(B, U(1, -1), [2]) === '−j' },
    { name: 'quaternion walk: k ·j ·i → −i 1', pass: W(quaternion, U(3), [2, 1]) === '−i 1' },
    { name: `Bristorian walk sign = parity of steps down + squares (${par} of ${parN} walks)`, pass: par === parN },
    { name: '"a before b ⇔ a·b positive": a ranking for Bristorian (transitive), a cycle for the quaternion (not)', pass: transitive(B) && !transitive(quaternion) && before(quaternion)(3, 1) },
    { name: 'quaternion: no product of two units lands on a factor (0 of 6); Bristorian: all 6 do', pass: lands(quaternion) === 0 && lands(B) === 6 },
    { name: `associative: quaternion on all 64 unit triples; Bristorian not (${assoc(B)} differ)`, pass: assoc(quaternion) === 0 && assoc(B) > 0 },
  ];
  return { pass: checks.every(c => c.pass), checks };
}

export const UnitOrderGXT = (() => {
  function mount(canvas, opts = {}) {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    let st = { cx: W / 2, cy: H / 2, R: Math.min(W, H) * .3, m: 0, show: 1, neg: 1, steps: [], ...opts };
    const paint = () => { ctx.fillStyle = st.bg ?? '#0a0a0c'; ctx.fillRect(0, 0, W, H); frame(ctx, st); };
    const ctrl = { set(d = {}) { st = { ...st, ...d }; paint(); }, getState: () => ({ ...st }), selfTest,
      play() {}, pause() {}, beat() {}, reset() { st = { ...st, m: 0, steps: [], test: [] }; paint(); }, ...NOOP_STAGE_API };
    paint(); return wireGxt(canvas, ctrl);
  }
  return { mount };
})();
