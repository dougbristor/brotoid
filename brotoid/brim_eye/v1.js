// brim_eye / v1 — candidate (fable 2026-10-22), for insights to plant at /codetree/blocks/brim_eye/v1.js
// The eye of the brim: the part of the brim (the crossing cone, det J = 0) inside the ball |x − q| < r, as quads between neighbouring cone
// lines, and which face of the brim each quad shows. Lifted from fable/web/proto_brim (its checks 8 and 9 hold it there), so the brotoid
// page draws the same eye and proto_brim can import it in turn.
//
//   LN                 every other line of brotoid_weft's CONE (0.25° apart)
//   span(d, q, r)      where the sphere |x − q| = r crosses the line through 0 along unit d: [A, B], or null if it doesn't reach the line
//   eyeQuads(q, r)     the eye as quads [a0, a1, b1, b0] in ray order (round, then out), on every other LN line (0.5° apart). Each line is two
//                      rays out of 0, and each ray keeps only its stretch inside the ball, so a quad never crosses 0
//   quadN(qd)          a quad's winding normal
//   PLATE_N            the brim's mean plane normal: the least eigenvector of Σ d dᵀ over the lines (fixed: det J depends on neither q nor r)
//   TOPS               the sign that turns a quad's winding normal toward the brim's top, the face toward PLATE_N
//   topNormal(qd)      sc(quadN(qd), TOPS): points out of the top face. A page's own projection says whether it faces the viewer (pink)
//                      or not (violet). Squaring keeps a quad's winding, so on a squared quad it points out of the image of the top.
import { CONE } from '/codetree/blocks/brotoid_weft/v1.js';

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = a => Math.hypot(a[0], a[1], a[2]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], sc = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const cr3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export const LN = CONE.filter((_, k) => k % 2 === 0);

export const span = (d, q, r) => { const b = dot(q, d), disc = b * b - dot(q, q) + r * r; if (disc < 0) return null; const t = Math.sqrt(disc);
  return [sc(d, b + t), sc(d, b - t)]; };

export function eyeQuads(q, r) { const n = LN.length, rays = [], out = [];
  for (let j = 0; j < 2 * n; j += 2) { const k = j % n, sg = j < n ? 1 : -1, R = span(LN[k].d, q, r);
    const s = R ? R.map(p => sg * dot(p, LN[k].d)) : null, hi = s ? Math.max(...s) : 0;
    rays.push(hi > 0 ? [Math.max(0, Math.min(...s)), hi].map(t => sc(LN[k].d, sg * t)) : null); }
  for (let j = 0; j < rays.length; j++) { const a = rays[j], b = rays[(j + 1) % rays.length]; if (a && b) out.push([a[0], a[1], b[1], b[0]]); }
  return out; }

export const quadN = qd => cr3(sub(qd[2], qd[0]), sub(qd[3], qd[1]));

export const PLATE_N = (() => { const N = CONE.length, M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const { d } of CONE) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] += d[i] * d[j] / N;
  const t = M[0][0] + M[1][1] + M[2][2]; let v = [1, 0.3, -0.2];   // power iteration on (tr M)·I − M: M's least eigenvector
  for (let it = 0; it < 300; it++) { const w = [0, 1, 2].map(i => t * v[i] - (M[i][0] * v[0] + M[i][1] * v[1] + M[i][2] * v[2])); v = sc(w, 1 / nrm(w)); }
  return v; })();

export const TOPS = (() => { const a = LN[0].d, b = LN[2].d; return Math.sign(dot(quadN([sc(a, 0.5), sc(a, 1), sc(b, 1), sc(b, 0.5)]), PLATE_N)); })();

export const topNormal = qd => sc(quadN(qd), TOPS);
