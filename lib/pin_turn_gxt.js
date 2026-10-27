/**
 * pin_turn_gxt.js — what multiplying by a unit DOES, as a pin: an arm that turns, and a head that carries the rest.
 *
 * Built for reel v2's TURNS scene (Doug, 10-02: "sphere rotations for B and Q … that way we explain the maths operator
 * and then the impact|result … can we show a sphere at the end of the pivot arm, like a large pin head").
 * Left multiplication x → a·x by a unit a of (1, i, j, k) splits into two parts:
 *   the ARM   a quarter turn of the real axis into a (1 → a, a → −1). The same in both algebras: a·a = −1.
 *   the HEAD  a sphere at the arm's tip whose equator carries the other two units b, c; how they move is the whole
 *             difference between the algebras:
 *     quaternion  i, j, k each spin the head 90° (i: j → k; j: k → i; k: i → j): the others jump to a third direction.
 *     Bristorian  (canon i-roll, i·j = j, j·i = −i): i leaves the head still; j MIRRORS it (i → −i through the centre,
 *                 k stays: turns and flips, det −1); k spins it 180° (i → −i, j → −j). Every unit stays on its own
 *                 axis, only its sign changes: a·x = ±x, the product lands back on the right factor.
 * Every motion is computed here from the rules in unit_order_gxt.js (never typed in); selfTest() compares the result,
 * as integers, with the table derived independently in aicolab/tmp/turns_q_b3_20261002_fable.py.
 * Right multiplication is not drawn on purpose: in Bristorian x → x·a is rank 2 (it collapses onto a; (i − j)·k = 0),
 * so it is not a turn of anything.
 *
 * Geometry: the arm pivots at (cx, cy), length L, from pointing right ("1") to pointing up (a); at u = 1 it lies along
 * the head's pole, so the head spins on its own pin. The head is drawn orthographically: pole vertical (labelled a),
 * equator tilted toward the viewer. Ends are exact: at u = 1 every dot sits on the tick of its image.
 *
 * Pure: frame(ctx, state). mount() is the explainer form. selfTest({ sabotage: 'roll' }) swaps in the j-roll and must fail.
 */
import { wireGxt, NOOP_STAGE_API } from './gxt_anim.js';
import { quaternion, bristorian, LABELS } from './unit_order_gxt.js';

const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x, lerp = (a, b, u) => a + (b - a) * u, seg = (t, a, b) => clamp((t - a) / (b - a));
const sio = u => -(Math.cos(Math.PI * u) - 1) / 2, TAU = Math.PI * 2;
const jroll = (a, b) => { const p = bristorian(a, b); return a && b && a !== b ? { sign: -p.sign, idx: b } : p; }; // sabotage only
export const RULES = { quaternion, bristorian };

// the other two units of a, in cyclic order, so a quaternion spin reads +90° for every a
export const others = a => [[2, 3], [3, 1], [1, 2]][a - 1];
// x → a·x on the basis: image of e_b is rule(a, b)
export const image = (rule, a, b) => rule(a, b);
// the head's motion: the 2×2 block of x → a·x on the plane (b, c), as integers, and what kind of motion it is
export function head(rule, a) {
  const [b, c] = others(a), col = x => { const p = rule(a, x); return [p.idx === b ? p.sign : 0, p.idx === c ? p.sign : 0]; };
  const [m00, m10] = col(b), [m01, m11] = col(c), det = m00 * m11 - m01 * m10;
  let kind, deg = 0, flip = null;
  if (det === 1) { deg = Math.round(Math.atan2(m10, m00) * 180 / Math.PI); kind = deg === 0 ? 'still' : Math.abs(deg) === 180 ? 'spin180' : 'spin90'; }
  else if (det === -1 && m01 === 0 && m10 === 0) { kind = 'mirror'; flip = m00 === -1 ? b : c; }
  else kind = 'other';
  return { b, c, M: [[m00, m01], [m10, m11]], det, kind, deg, flip };
}
// coefficients (on e_b, e_c) of unit x's dot at progress u; exact at u = 0 and u = 1
export function dotAt(rule, a, x, u) {
  const H = head(rule, a), e = x === H.b ? [1, 0] : [0, 1];
  if (H.kind === 'mirror') { const k = Math.cos(Math.PI * u); return H.flip === H.b ? [e[0] * k, e[1]] : [e[0], e[1] * k]; }
  if (u >= 1) return [H.M[0][0] * e[0] + H.M[0][1] * e[1], H.M[1][0] * e[0] + H.M[1][1] * e[1]];
  const f = H.deg * Math.PI / 180 * u, cs = Math.cos(f), sn = Math.sin(f);
  return [cs * e[0] - sn * e[1], sn * e[0] + cs * e[1]];
}

export function frame(ctx, S) {
  const { cx, cy, L = 300, r = 105, a = 1, u = 0, show = 1, tilt = .34, labels = true } = S;
  if (show <= 0) return;
  const rule = S.rule ?? quaternion, uh = S.uHead ?? u, fg = S.fg ?? '#eee9e0', accent = S.accent ?? '#19e0ff', dim = S.dim ?? '#8a8a93', bg = S.bg ?? '#0a0a0c';
  const mono = S.mono ?? (p => `500 ${p}px monospace`), serif = S.serif ?? (p => `italic 400 ${p}px serif`);
  const psi = -Math.PI / 2 * sio(clamp(u)), hx = cx + L * Math.cos(psi), hy = cy + L * Math.sin(psi);
  const H = head(rule, a), th = [-.62, -.62 + Math.PI / 2]; // e_b, e_c directions on the equator (angle; sin > 0 = toward the viewer)
  const plane = ([x, y]) => { const v0 = x * Math.cos(th[0]) + y * Math.cos(th[1]), v1 = x * Math.sin(th[0]) + y * Math.sin(th[1]);
    return { x: hx + r * v0, y: hy + r * tilt * v1, z: v1 }; };
  ctx.save(); ctx.globalAlpha = show; ctx.lineCap = 'round';
  // the dial: a quarter turn, 1 → a
  ctx.strokeStyle = dim; ctx.lineWidth = 2; ctx.setLineDash([5, 9]); ctx.beginPath(); ctx.arc(cx, cy, L, -Math.PI / 2, 0); ctx.stroke(); ctx.setLineDash([]);
  if (labels) { ctx.fillStyle = dim; ctx.font = serif(Math.round(.42 * r)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('1', cx + L + r + 34, cy); ctx.globalAlpha = show * (1 - seg(u, .35, .75)); ctx.fillText(LABELS[a], cx, cy - L - r - 46); ctx.globalAlpha = show; }
  // the arm, and the pivot
  ctx.strokeStyle = fg; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, TAU); ctx.fill();
  // the head: shaded sphere, pole a, equator
  const g = ctx.createRadialGradient(hx - .38 * r, hy - .42 * r, .1 * r, hx, hy, r); g.addColorStop(0, '#3a3a44'); g.addColorStop(1, '#141418');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, r, 0, TAU); ctx.fill(); ctx.strokeStyle = dim; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = fg; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx, hy - 1.28 * r); ctx.lineTo(hx, hy + 1.12 * r); ctx.stroke();
  if (labels) { ctx.fillStyle = fg; ctx.font = serif(Math.round(.36 * r)); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(LABELS[a], hx + .2 * r, hy - 1.34 * r); }
  // the equator (squashes with a mirror), and the four position ticks ±b, ±c
  const sq = H.kind === 'mirror' ? Math.cos(Math.PI * uh) : 1;
  ctx.strokeStyle = dim; ctx.lineWidth = 2; ctx.beginPath();
  for (let n = 0; n <= 64; n++) { const f = n / 64 * TAU, p = plane(H.flip === H.c ? [Math.cos(f), Math.sin(f) * sq] : [Math.cos(f) * sq, Math.sin(f)]); n ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
  ctx.stroke();
  ctx.font = mono(Math.round(.25 * r)); ctx.textBaseline = 'middle';
  for (const [x, nm] of [[[1, 0], LABELS[H.b]], [[-1, 0], '−' + LABELS[H.b]], [[0, 1], LABELS[H.c]], [[0, -1], '−' + LABELS[H.c]]]) {
    const p = plane(x), o = plane([x[0] * 1.42, x[1] * 1.42]); ctx.globalAlpha = show * (p.z >= 0 ? 1 : .6);
    ctx.fillStyle = dim; ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, TAU); ctx.fill(); ctx.textAlign = 'center'; ctx.fillText(nm, o.x, o.y + (o.z >= 0 ? 6 : -6)); }
  // the two units, as dots: their path so far (a trail), then the dot; behind the pole first
  const dots = [H.b, H.c].map(x => ({ x, p: plane(dotAt(rule, a, x, uh)) })).sort((A, B) => A.p.z - B.p.z);
  for (const { x, p } of dots) {
    ctx.globalAlpha = show * .45; ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.beginPath();
    for (let n = 0; n <= 24; n++) { const q = plane(dotAt(rule, a, x, uh * n / 24)); n ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); } ctx.stroke();
    const rr = .17 * r * (p.z >= 0 ? 1 : .82); ctx.globalAlpha = show * (p.z >= 0 ? 1 : .7);
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, TAU); ctx.fill();
    ctx.fillStyle = bg; ctx.font = serif(Math.round(1.25 * rr)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(LABELS[x], p.x, p.y + 1); }
  ctx.restore();
  return { head: { x: hx, y: hy }, kind: H.kind };
}

// exact: the table from aicolab/tmp/turns_q_b3_20261002_fable.py (numpy, written before this file), as integers
const EXPECT = {
  quaternion: { 1: ['+i', '-1', '+k', '-j'], 2: ['+j', '-k', '-1', '+i'], 3: ['+k', '+j', '-i', '-1'], kinds: ['spin90', 'spin90', 'spin90'] },
  bristorian: { 1: ['+i', '-1', '+j', '+k'], 2: ['+j', '-i', '-1', '+k'], 3: ['+k', '-i', '-j', '-1'], kinds: ['still', 'mirror', 'spin180'] },
};
export function selfTest({ sabotage = null } = {}) {
  const R = { quaternion, bristorian: sabotage === 'roll' ? jroll : bristorian }, nm = p => (p.sign < 0 ? '-' : '+') + LABELS[p.idx];
  const checks = [];
  for (const alg of ['quaternion', 'bristorian']) {
    const rule = R[alg], E = EXPECT[alg];
    for (const a of [1, 2, 3]) { const got = [0, 1, 2, 3].map(b => nm(image(rule, a, b)));
      checks.push({ name: `${alg}: ${LABELS[a]}·(1, i, j, k) = (${E[a].join(', ')})`, pass: got.join() === E[a].join(), got: got.join(', ') }); }
    const kinds = [1, 2, 3].map(a => head(rule, a).kind);
    checks.push({ name: `${alg}: the head ${E.kinds.join(' / ')} for i / j / k`, pass: kinds.join() === E.kinds.join(), got: kinds.join(' / ') });
  }
  // exact ends: at u = 1 each dot sits on its image's tick, in both algebras, every a
  let worst = 0;
  for (const rule of [R.quaternion, R.bristorian]) for (const a of [1, 2, 3]) { const H = head(rule, a);
    for (const x of [H.b, H.c]) { const p = image(rule, a, x), want = [p.idx === H.b ? p.sign : 0, p.idx === H.c ? p.sign : 0], d = dotAt(rule, a, x, 1);
      worst = Math.max(worst, Math.abs(d[0] - want[0]), Math.abs(d[1] - want[1])); } }
  checks.push({ name: 'exact ends: every dot lands on its image at u = 1', pass: worst < 1e-12, got: worst.toExponential(1) });
  return { pass: checks.every(c => c.pass), checks };
}

export const PinTurnGXT = (() => {
  function mount(canvas, opts = {}) {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    let st = { cx: W * .3, cy: H * .72, L: Math.min(W, H) * .32, r: Math.min(W, H) * .1, a: 3, u: 0, rule: quaternion, ...opts };
    const paint = () => { ctx.fillStyle = st.bg ?? '#0a0a0c'; ctx.fillRect(0, 0, W, H); frame(ctx, st); };
    const ctrl = { set(d = {}) { st = { ...st, ...d }; paint(); }, getState: () => ({ ...st }), selfTest,
      play() {}, pause() {}, beat() {}, reset() { st = { ...st, u: 0 }; paint(); }, ...NOOP_STAGE_API };
    paint(); return wireGxt(canvas, ctrl);
  }
  return { mount };
})();
