// brot_readings / v1
// codetree:brot_readings/v1 — see codetree/blocks/brot_readings/  (fable 10-19; planted by insights 10-19, imports made relative)
// The four readings of BROT for one B2 number q (parts [1, i, j]), composed from bristor_product and bristor_square_jacobian only.
//
//   B  Bristor:  squaring takes a tiny ball round q to an ellipsoid with axes σ1 ≥ σ2 ≥ σ3 (the singular values of J(q)).
//                B = σ1 / σ3, the longest stretch over the shortest. 1 = the ball stays round. In ℂ: always 1.
//   R  Rotation: the turning part of J, its polar factor Q = U Vᵀ. hand χ = sign det J (keep +1, mirror −1; canon), and 0 on the crossing cone,
//                where J is singular (the same test that makes Q null and B ∞; insights 10-21, fable's ask).
//                R = the angle Q turns: about its axis if it keeps; if it mirrors, Q = reflection × turn about one axis, and R is that turn.
//                In ℂ: J = 2q, so R = the angle of q, and it never mirrors.
//   O  Order:    max over unit v of |q·v − v·q|, over |q|. In ℂ: 0. Ov is the v that attains it.
//   T  Torsion:  |(q·i)·j − q·(i·j)| over |q|, one witness triple (the same one the full instrument uses). In ℂ and the quaternions: 0.
//                Torsion is the name's reading, not a geometric torsion tensor.
// Every reading is unchanged when q is scaled by s > 0 (J is linear in q, and each reading is divided by the right power of |q|), so the
// readings depend only on q's direction. Rank: B2 only. (B3 would need a 4×4 J; not here.)
import { mul } from '../bristor_product/v1.js';
import { bristorSquareJacobian } from '../bristor_square_jacobian/v1.js';

export const RANK = 2;
const E = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const nrm = a => Math.hypot(a[0], a[1], a[2]), sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const T = A => A[0].map((_, j) => A.map(r => r[j]));
const mm = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
export const det3 = M => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);

/** J(q) as 3 rows: the derivative of the square at q (J·v = q·v + v·q). */
export const jacobian = q => { const J = bristorSquareJacobian(q[0], q[1], q[2]); return [J.slice(0, 3), J.slice(3, 6), J.slice(6, 9)]; };

/** Cyclic Jacobi on a symmetric 3×3: { w (eigenvalues), V (eigenvectors as columns) }. */
export function eigSym(A0) {
  const A = A0.map(r => r.slice()), V = E.map(r => r.slice());
  for (let sweep = 0; sweep < 50; sweep++) {
    let off = 0; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) off += A[i][j] ** 2;
    if (off < 1e-30) break;
    for (let p = 0; p < 3; p++) for (let q = p + 1; q < 3; q++) {
      if (Math.abs(A[p][q]) < 1e-300) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) { const a = A[k][p], b = A[k][q]; A[k][p] = c * a - s * b; A[k][q] = s * a + c * b; }
      for (let k = 0; k < 3; k++) { const a = A[p][k], b = A[q][k]; A[p][k] = c * a - s * b; A[q][k] = s * a + c * b; }
      for (let k = 0; k < 3; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = c * a - s * b; V[k][q] = s * a + c * b; }
    }
  }
  return { w: [A[0][0], A[1][1], A[2][2]], V };
}

/** Singular values (largest first), their right and left vectors, and the polar factor Q = U Vᵀ (null when M is singular). */
export function svd3(M) {
  const { w, V } = eigSym(mm(T(M), M)), idx = [0, 1, 2].sort((a, b) => w[b] - w[a]);
  const s = idx.map(i => Math.sqrt(Math.max(0, w[i]))), Vs = idx.map(i => V.map(r => r[i]));
  if (s[2] <= 1e-7 * s[0]) return { s, Vs, Us: null, Q: null };   // sqrt lifts a zero eigenvalue to ~1e-8
  const Us = Vs.map((v, k) => [0, 1, 2].map(r => M[r].reduce((a, m, c) => a + m * v[c], 0) / s[k]));
  const Q = [0, 1, 2].map(r => [0, 1, 2].map(c => Us.reduce((a, u, k) => a + u[r] * Vs[k][c], 0)));
  return { s, Vs, Us, Q };
}

/** The axis Q turns about: for a keep Q, the eigenvector of +1; for a mirror Q, of −1 (the normal of the reflecting plane). */
export function axisOf(Q, chi) { const S = Q.map((r, i) => r.map((v, j) => (v + Q[j][i]) / 2 - (i === j ? chi : 0))), { w, V } = eigSym(mm(T(S), S));
  const k = [0, 1, 2].reduce((b, i) => w[i] < w[b] ? i : b, 0); return V.map(r => r[k]); }

/** |q·v − v·q| / (|q| |v|): how much order matters for this pair. */
export const orderGap = (q, v) => nrm(sub(mul(q, v), mul(v, q))) / (nrm(q) * nrm(v));

/** The witness triple's two bracketings: (q·i)·j and q·(i·j). */
export const torsionPair = q => ({ left: mul(mul(q, E[1]), E[2]), right: mul(q, mul(E[1], E[2])) });

/** All four readings for q (q ≠ 0). */
export function readings(q) {
  const n = nrm(q), J = jacobian(q), d = det3(J), { s, Vs, Us, Q } = svd3(J), chi = !Q ? 0 : d >= 0 ? 1 : -1;
  const out = { rank: RANK, s: s.map(v => v / n), det: d / n ** 3, chi, mirror: chi < 0, J, Vs, Us, Q };
  out.B = Q ? s[0] / s[2] : Infinity;
  if (Q) { const tr = Q[0][0] + Q[1][1] + Q[2][2]; out.R = Math.acos(Math.max(-1, Math.min(1, chi > 0 ? (tr - 1) / 2 : (tr + 1) / 2))) * 180 / Math.PI; out.axis = axisOf(Q, chi); }
  else { out.R = NaN; out.axis = null; }
  const C = [0, 1, 2].map(r => [0, 1, 2].map(c => mul(q, E[c])[r] - mul(E[c], q)[r])), O = eigSym(mm(T(C), C)), k = [0, 1, 2].reduce((b, i) => O.w[i] > O.w[b] ? i : b, 0);
  out.O = Math.sqrt(Math.max(0, O.w[k])) / n; out.Ov = O.V.map(r => r[k]);
  const P = torsionPair(q); out.T = nrm(sub(P.left, P.right)) / n; out.Tpair = P;
  return out;
}

/** What ℂ answers to the same four questions, for the angle of a complex number (radians). */
export const inC = theta => ({ B: 1, R: Math.abs(theta) * 180 / Math.PI, mirror: false, O: 0, T: 0 });
