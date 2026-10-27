/**
 * size_ring_gxt.js — what "size" means: square 240 unit z and plot |zz| round a circle.
 *
 * Built for reel v2 scene 07's "what it means" beat (Doug, 09-30). The same 240 points z = (real, i, j), |z| = 1,
 * on a spiral pole to pole over the sphere of directions, squared two ways and drawn in polar form: point n at angle
 * 2πn/240, radius R·|zz|. The dashed circle is |z|² = 1.
 *   m = 0  QUATERNION: for z = a + bi + cj, z² = a² − b² − c² + 2ab i + 2ac j (ij + ji = 0), and |z²| = |z|² exactly,
 *          for every z (a normed algebra). The ring lies on the circle: size is kept.
 *   m = 1  BRISTORIAN: the canon product with x = a (brotdocs math_bristorian_squaring.md "General B2 product",
 *          declared convention i·j = j, j·i = −i): z² = (a² − b² − c², 2ab − cb, 2ac + bc), the brot's own step. |zz|
 *          leaves the circle, and by a different amount for each z: size breaks.
 * Both squares are computed live, here, from those formulas; nothing is pasted from a script. stats() reports the
 * ranges so a host can caption with measured numbers, and the reel's check compares these radii with numpy's.
 *
 * Pure: frame(ctx, state). mount() is the explainer form. selfTest() is exact: on integer z it compares |zz|² with
 * |z|⁴ as integers, so the headline claims are decided with no tolerance; sabotage 'kept' draws the quaternion
 * square under the Bristorian name, and the "size breaks" check must then fail.
 */
import { wireGxt, NOOP_STAGE_API } from './gxt_anim.js';

const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x, lerp = (a, b, u) => a + (b - a) * u, seg = (t, a, b) => clamp((t - a) / (b - a));
const spring = (u, z = .32, w = 12) => { if (u <= 0) return 0; const wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * u) * (Math.cos(wd * u) + z * w / wd * Math.sin(wd * u)); };
const TAU = Math.PI * 2;
const S1 = spring(1);

// the algebra colours (as instrument_faces COL; not imported, to keep this atom free of a cycle): the ring's colour IS its
// state, so it blends quaternion cyan → Bristorian orange with m and is a true colour only at the ends (Doug, 10-05)
const CQ = [0x19, 0xe0, 0xff], CB = [0xff, 0x5a, 0x1f];
export const ringColour = m => '#' + CQ.map((q, k) => Math.round(q + (CB[k] - q) * clamp(m)).toString(16).padStart(2, '0')).join('');
// the WITNESS (insights §2, P11): z = i + j, z² = −2 − i + j, |z²|² = 6 while |z|⁴ = 4. On the unit ring it is (i + j)/√2,
// |zz| = √6 / 2. The ring's angle is only the sample order (it means nothing), so the witness is drawn APART from the
// ring: its own spoke from the circle out to its exact radius, at a clear angle, never as if it were a ring point.
export function witness(N = 240, sq = null) {
  const B = sq || sqBristorian, n2 = v => v.reduce((t, x) => t + x * x, 0), u = Math.SQRT1_2;
  return { int2: n2(B(0, 1, 1)), int4: n2([0, 1, 1]) ** 2, r: Math.hypot(...B(0, u, u)) };
}
export const sqQuaternion = (a, b, c) => [a * a - b * b - c * c, 2 * a * b, 2 * a * c];
export const sqBristorian = (a, b, c) => [a * a - b * b - c * c, 2 * a * b - c * b, 2 * a * c + b * c];

// the points: a 7-turn spiral, equal steps in cos θ, so the sphere is covered evenly and neighbours on the ring are
// neighbours on the sphere (the ring reads as a curve, not noise)
export function points(N = 240, turns = 7) {
  const Z = []; for (let n = 0; n < N; n++) { const t = n / N, th = Math.acos(1 - 2 * (t + .5 / N)), ph = TAU * t * turns;
    Z.push([Math.cos(th), Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph)]); } return Z;
}
const cache = new Map();
export function radii(N = 240, sabotage = null) {
  const k = N + '|' + sabotage; if (cache.has(k)) return cache.get(k);
  const Z = points(N), B = sabotage === 'kept' ? sqQuaternion : sqBristorian;
  const v = { q: Z.map(z => Math.hypot(...sqQuaternion(...z))), b: Z.map(z => Math.hypot(...B(...z))), z2: Z.map(z => z[0] ** 2 + z[1] ** 2 + z[2] ** 2) };
  cache.set(k, v); return v;
}
export function stats(N = 240, sabotage = null) {
  const r = radii(N, sabotage), dev = a => Math.max(...a.map((x, i) => Math.abs(x - r.z2[i]))), sorted = [...r.b].sort((a, b) => a - b);
  return { N, qMaxDev: dev(r.q), bMin: sorted[0], bMax: sorted[N - 1], bMedianDev: [...r.b.map((x, i) => Math.abs(x - r.z2[i]))].sort((a, b) => a - b)[N >> 1] };
}

// state: { cx, cy, R, m (0 quaternion → 1 Bristorian), trace (0..1: how much of the ring is drawn), show, N, fg, bg,
//   accent, dim, mono(px) }. The burst runs round the ring from angle 0, each point on its own spring.
export function frame(ctx, S) {
  const { cx, cy, R, m = 0, trace = 1, show = 1, N = 240, fg = '#eee9e0', dim = '#8a8a93' } = S, accent = S.accent ?? ringColour(m);
  if (show <= 0) return;
  const mono = S.mono ?? (p => `500 ${p}px monospace`), r = radii(N, S.sabotage ?? null), n1 = Math.max(0, Math.min(N, Math.floor(trace * N + 1e-9)));
  const rad = i => { const v = seg(m, .35 * i / N, .35 * i / N + .65); return R * lerp(r.q[i], r.b[i], v > 0 ? spring(v) / S1 : 0); }; // ÷ spring(1): lands exactly on the measured |zz|
  const pt = i => { const a = TAU * i / N - Math.PI / 2, q = rad(i); return [cx + q * Math.cos(a), cy + q * Math.sin(a)]; };
  ctx.save(); ctx.globalAlpha = show;
  // |z|² = 1: the dashed reference, and faint spokes every 30°
  ctx.strokeStyle = dim; ctx.lineWidth = 2; ctx.setLineDash([6, 9]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = show * .25; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k < 12; k++) { const a = k * TAU / 12; ctx.moveTo(cx + .2 * R * Math.cos(a), cy + .2 * R * Math.sin(a)); ctx.lineTo(cx + 1.55 * R * Math.cos(a), cy + 1.55 * R * Math.sin(a)); } ctx.stroke();
  if (n1 > 1) {
    const full = n1 >= N;
    // how far each point is off the circle, as a filled band between the ring and |z|² = 1
    const bd = seg(m, .1, .5); if (bd > 0) { ctx.globalAlpha = show * .22 * bd; ctx.fillStyle = accent; ctx.beginPath();
      for (let i = 0; i < n1; i++) { const p = pt(i); i ? ctx.lineTo(...p) : ctx.moveTo(...p); }
      for (let i = n1 - 1; i >= 0; i--) { const a = TAU * i / N - Math.PI / 2; ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); } ctx.closePath(); ctx.fill('evenodd'); }
    ctx.globalAlpha = show; ctx.strokeStyle = accent; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i < n1; i++) { const p = pt(i); i ? ctx.lineTo(...p) : ctx.moveTo(...p); } if (full) ctx.closePath(); ctx.stroke();
    ctx.fillStyle = fg; for (let i = 0; i < n1; i += 4) { const p = pt(i); ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0, TAU); ctx.fill(); }
    if (!full) { const p = pt(n1 - 1); ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(p[0], p[1], 8, 0, TAU); ctx.fill(); }
  }
  ctx.globalAlpha = show; ctx.fillStyle = dim; ctx.font = mono(Math.round(.075 * R)); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('|z|² = 1', cx + R * Math.cos(-.6) + 12, cy + R * Math.sin(-.6) - 14);
  // the witness, once the ring is Bristorian (S.witness): its exact |zz|, labelled with its exact integers
  if (S.witness && m >= .999 && n1 >= N) {
    const w = witness(N, S.sabotage === 'kept' ? sqQuaternion : null), a = S.witnessAngle ?? -Math.PI * .78, c = Math.cos(a), sn = Math.sin(a);
    const x0 = cx + R * c, y0 = cy + R * sn, x = cx + R * w.r * c, y = cy + R * w.r * sn;
    ctx.strokeStyle = fg; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
    ctx.beginPath(); ctx.arc(x0, y0, 3.5, 0, TAU); ctx.fillStyle = dim; ctx.fill(); ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fillStyle = fg; ctx.fill();
    ctx.font = mono(Math.round(.1 * R)); ctx.textAlign = c >= 0 ? 'left' : 'right'; const dx = c >= 0 ? 14 : -14;
    ctx.fillText('z = i + j', x + dx, y - 12); ctx.fillStyle = dim; ctx.fillText(`|z²|² = ${w.int2},  |z|⁴ = ${w.int4}`, x + dx, y + 12);
  }
  ctx.restore();
}

// exact: on every integer z with components in −4..4, |zz|² against |z|⁴, as integers
export function selfTest({ sabotage = null } = {}) {
  const B = sabotage === 'kept' ? sqQuaternion : sqBristorian, n2 = v => v.reduce((s, x) => s + x * x, 0);
  let qBad = 0, bBad = 0, tot = 0;
  for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++) for (let c = -4; c <= 4; c++) { const z4 = n2([a, b, c]) ** 2; tot++;
    if (n2(sqQuaternion(a, b, c)) !== z4) qBad++; if (n2(B(a, b, c)) !== z4) bBad++; }
  const s = stats(240, sabotage);
  const checks = [
    { name: `quaternion keeps size: |zz|² = |z|⁴ on all ${tot} integer z`, pass: qBad === 0 },
    { name: `Bristorian breaks size: |zz|² ≠ |z|⁴ on ${bBad} of ${tot} integer z`, pass: bBad > 0 },
    { name: 'the witness (P11): z = i + j gives |z²|² = 6 while |z|⁴ = 4', pass: (w => w.int2 === 6 && w.int4 === 4)(witness(240, B === sqQuaternion ? sqQuaternion : null)) },
    { name: 'the ring wears its state: quaternion cyan at m = 0, Bristorian orange at m = 1', pass: ringColour(0) === '#19e0ff' && ringColour(1) === '#ff5a1f' },
    { name: 'the square is the reel\'s own step (x² − y² − z², y(2x − z), z(2x + y))', pass: [[1, 2, 3], [-2, 1, 4], [3, -1, -2]].every(([x, y, z]) => { const v = B(x, y, z); return v[0] === x * x - y * y - z * z && v[1] === y * (2 * x - z) && v[2] === z * (2 * x + y); }) },
  ];
  return { pass: checks.every(c => c.pass), checks, stats: s };
}

export const SizeRingGXT = (() => {
  function mount(canvas, opts = {}) {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    let st = { cx: W / 2, cy: H / 2, R: Math.min(W, H) * .28, m: 0, trace: 1, show: 1, ...opts };
    const paint = () => { ctx.fillStyle = st.bg ?? '#0a0a0c'; ctx.fillRect(0, 0, W, H); frame(ctx, st); };
    const ctrl = { set(d = {}) { st = { ...st, ...d }; paint(); }, getState: () => ({ ...st }), stats: () => stats(st.N ?? 240, st.sabotage ?? null), radii: () => radii(st.N ?? 240, st.sabotage ?? null),
      selfTest, play() {}, pause() {}, beat() {}, reset() { st = { ...st, m: 0, trace: 1 }; paint(); }, ...NOOP_STAGE_API };
    paint(); return wireGxt(canvas, ctrl);
  }
  return { mount };
})();
