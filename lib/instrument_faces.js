// instrument_faces.js — the classes of instrument, each with a FACE: a small picture of what the instrument is made of
// (its null, neutral grey) and of what it reads on each algebra (quaternion cyan, Bristorian orange, as the reel).
// Doug, 10-08: "provide more classification to the instruments. the bristorian size squiggle is a good glyph and the
// ones you use in the reel."  Faces are COMPUTED from the same atoms the reel uses (unit_order, size_ring, pin_turn),
// never drawn by hand; where a face is a cited result rather than a computation, the class says so (cited: true).
//
// Classification (two axes beyond the face):
//   operands  self = reads z·z (one number used twice): sees only the symmetric part of the product, so it is BLIND to
//             all three defects and to the hand (canon math.bristorian_defect_ladder §2). Drawn as a ONE-prong probe.
//             pair = reads a·b with a ≠ b: can see order, the defects, the hand. Drawn as a TWO-prong probe.
//   outputs   every instrument has three: holds (yes), folds (no), could-not-tell; the third must never look like the
//             second (fable memory: instruments need three outputs). A self instrument asked about the hand says
//             could-not-tell, not no.
import { quaternion, bristorian, mul, U } from './unit_order_gxt.js';
import { radii } from './size_ring_gxt.js';
import { head } from './pin_turn_gxt.js';

export const COL = { q: '#19e0ff', b: '#ff5a1f', n: '#b9b4ab' };
const RULE = { q: quaternion, b: bristorian };
const f = x => +x.toFixed(2);

// ---- computations (exported for the self-test and the page) ----
// ranks: a total order a < b iff a·b = +b; null when products leave their factors (no order to keep)
export function ranks(rule) {
  for (let a = 1; a <= 3; a++) for (let b = 1; b <= 3; b++) if (a !== b && ![a, b].includes(rule(a, b).idx)) return null;
  return [1, 2, 3].sort((a, b) => rule(a, b).sign > 0 ? -1 : 1);
}
// defects on the units: R1 some a·b ≠ b·a, R2 some (ab)c ≠ a(bc), R3 some (aa)b ≠ a(ab)
export function defects(rule) {
  const eq = (x, y) => x.sign === y.sign && x.idx === y.idx, u = [0, 1, 2, 3];
  const rm = (x, b) => mul(rule, x, b);                                                    // (signed unit x) · e_b
  const lm = (a, y) => { const p = rule(a, y.idx); return { sign: p.sign * y.sign, idx: p.idx }; }; // e_a · (signed unit y)
  let r1 = false, r2 = false, r3 = false;
  for (const a of u) for (const b of u) {
    if (!eq(rule(a, b), rule(b, a))) r1 = true;
    if (!eq(rm(rule(a, a), b), lm(a, rule(a, b)))) r3 = true;
    for (const c of u) if (!eq(rm(rule(a, b), c), lm(a, rule(b, c)))) r2 = true;
  }
  return [r1, r2, r3];
}
// planes: directions u in the imaginary (i, j) plane whose span{1, u} is closed under squaring
export function closedPlanes(alg, n = 72) {
  const rule = RULE[alg], sq = (a, b) => { // (a i + b j)^2 by the rule, as [re, i, j]
    const out = [0, 0, 0], add = (c, p) => { out[p.idx] += c * p.sign; };
    add(a * a, rule(1, 1)); add(b * b, rule(2, 2)); add(a * b, rule(1, 2)); add(a * b, rule(2, 1)); return out;
  };
  const hits = [];
  for (let k = 0; k < n; k++) { const t = Math.PI * k / n, a = Math.cos(t), b = Math.sin(t), [, si, sj] = sq(a, b);
    if (Math.abs(si * b - sj * a) < 1e-9) hits.push(t); } // the imaginary part of u² is parallel to u
  return hits;
}
// the ORDER Γ (Doug, 10-08): the ranked line folded at zero. + units along the top arm, − units down the side arm, each
// at its rank's distance from the corner; the 45° diagonal through the corner is the FOLD (a mirror of SIGN, +e ↔ −e,
// not a geometric axis of the algebra). Where a product lands: its sign picks the arm, its unit picks the place.
export function lpos(rule, a, b) {
  const rk = ranks(rule); if (!rk) return null;               // no ranking (quaternion): no Γ, it stays a ring
  const p = rule(a, b), place = p.idx === 0 ? 0 : 1 + rk.indexOf(p.idx);
  return { arm: p.sign > 0 ? '+' : '−', place };
}
export function turns(alg) { return [1, 2, 3].map(a => head(RULE[alg], a).kind); }

// ---- the classes ----
export const CLASSES = {
  size:    { reads: '|zz| against |z|²', operands: 'self', nullIs: 'the circle |zz| = |z|²', q: 'stays on the circle: keeps size', b: 'leaves it: breaks size', gxt: 'size_ring_gxt' },
  order:   { reads: 'where a product of two units lands', operands: 'pair', nullIs: 'the Γ: + along the top, − down the side, the fold between', q: 'leaves both factors: a cycle, nothing first', b: 'a ranking: up the ranks it stays on the + arm, down the ranks it crosses the fold', gxt: 'unit_order_gxt' },
  turn:    { reads: 'what multiplying by one unit does to the others', operands: 'pair', nullIs: 'a pin: an arm and a head', q: 'revolves: a quarter turn at every unit', b: 'folds by rank: still, mirror, half turn', gxt: 'pin_turn_gxt' },
  planes:  { reads: 'which flat slices through 1 are closed under squaring', operands: 'self', nullIs: 'one slice', q: 'every slice: a copy of ℂ at any angle', b: '2ⁿ − 1 slices (3 in B2)', gxt: 'boolean_lattice_gxt' },
  count:   { reads: 'bounded cells of the C map, wrt the slice angle θ', operands: 'self', nullIs: 'the same count at every θ', q: 'the same cells at every θ tested', b: '13,520 → 12,222 by 0.7 rad (40.1°)', gxt: 'the C picker (caro; reproduced 10-08)', cited: true },
  defects: { reads: 'R1 commutative?  R2 associative?  R3 alternative?', operands: 'pair', nullIs: 'three rungs, all dark', q: 'R1 lit', b: 'R1 R2 R3 lit', gxt: 'BUILD: defect ladder grid' },
  hand:    { reads: 'is the algebra its own mirror (A ≅ Aᵒᵖ)?', operands: 'pair', nullIs: 'a shape and its mirror', q: 'yes: no hand (conj reverses products)', b: 'no: a hand (proved, B2–B4)', gxt: 'hand_that_wasnt_gxt', cited: true },
};

// ---- faces: SVG strings centred at (x, y), radius r ----
const dot = (x, y, r, c) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${c}"/>`;
const line = (x1, y1, x2, y2, c, w = 1.4, dash = '') => `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" stroke="${c}" stroke-width="${w}"${dash ? ` stroke-dasharray="${dash}"` : ''} fill="none"/>`;
const arcArrow = (x, y, rr, a0, a1, c) => { const p = a => [x + rr * Math.cos(a), y + rr * Math.sin(a)], [x0, y0] = p(a0), [x1, y1] = p(a1), big = Math.abs(a1 - a0) > Math.PI ? 1 : 0, sw = a1 > a0 ? 1 : 0;
  const t = a1 + (sw ? -1 : 1) * .5, [hx, hy] = [x1 + 2.6 * Math.cos(t + (sw ? 1.9 : -1.9)), y1 + 2.6 * Math.sin(t + (sw ? 1.9 : -1.9))];
  return `<path d="M${f(x0)} ${f(y0)}A${rr} ${rr} 0 ${big} ${sw} ${f(x1)} ${f(y1)}" stroke="${c}" stroke-width="1.3" fill="none"/>${line(x1, y1, hx, hy, c, 1.3)}`; };

export function face(cls, alg, x, y, r) {
  const c = COL[alg] || COL.n, s = r / 11;
  switch (cls) {
    case 'size': {
      if (alg === 'n') return `<circle cx="${x}" cy="${y}" r="${f(7 * s)}" fill="none" stroke="${c}" stroke-width="1.2" stroke-dasharray="2 2"/>`;
      const R = radii(72)[alg === 'q' ? 'q' : 'b']; // |zz| for 72 unit z, the size_ring atom's own numbers
      const pts = R.map((v, k) => { const a = 2 * Math.PI * k / R.length - Math.PI / 2; return `${f(x + 7 * s * v * Math.cos(a))} ${f(y + 7 * s * v * Math.sin(a))}`; });
      return `<path d="M${pts.join('L')}Z" fill="none" stroke="${c}" stroke-width="1.3" stroke-linejoin="round"/>`;
    }
    case 'order': {
      const cx = x - 7 * s, cy = y - 7 * s, gam = line(cx, cy, x + 8 * s, cy, c, 1.3) + line(cx, cy, cx, y + 8 * s, c, 1.3) + line(cx, cy, cx + 10 * s, cy + 10 * s, c, 1, '1.5 2');
      if (alg === 'n') return gam;
      const rk = ranks(RULE[alg]);
      if (!rk) return [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6].map(a => dot(x + 7 * s * Math.cos(a), y + 7 * s * Math.sin(a), 1.9 * s, c) + arcArrow(x, y, 7 * s, a + .45, a + 1.65, c)).join(''); // a cycle: i → j → k → i, nothing first
      const d = k => (3 + 3.5 * k) * s; // 1, then the units in rank order, out from the corner
      return gam + [0, ...rk].map((u, k) => dot(cx + d(k), cy, 1.5 * s, c)
        + `<circle cx="${f(cx)}" cy="${f(cy + d(k))}" r="${f(1.3 * s)}" fill="none" stroke="${c}" stroke-width="1"/>`).join('');
    }
    case 'turn': {
      if (alg === 'n') return line(x - 7 * s, y + 5 * s, x + 3 * s, y - 3 * s, c) + `<circle cx="${f(x + 4.5 * s)}" cy="${f(y - 4.5 * s)}" r="${f(3 * s)}" fill="none" stroke="${c}" stroke-width="1.2"/>`;
      return turns(alg).map((k, n) => { const cx = x + (n - 1) * 7 * s;
        if (k === 'still') return dot(cx, y, 1.6 * s, c);
        if (k === 'mirror') return line(cx, y - 5 * s, cx, y + 5 * s, c, 1.4) + line(cx - 2.5 * s, y, cx + 2.5 * s, y, c, 1);
        if (k === 'spin180') return arcArrow(cx, y, 2.8 * s, -Math.PI / 2, Math.PI / 2 - .01, c);
        return arcArrow(cx, y, 2.8 * s, -Math.PI / 2, 0, c); }).join('');
    }
    case 'planes': {
      if (alg === 'n') return line(x - 8 * s, y, x + 8 * s, y, c, 1.2, '2 2');
      return closedPlanes(alg, alg === 'q' ? 12 : 72).map(t => line(x - 8 * s * Math.cos(t), y + 8 * s * Math.sin(t), x + 8 * s * Math.cos(t), y - 8 * s * Math.sin(t), c, 1.1)).join('');
    }
    case 'count': { // two bars, true proportion from a zero baseline (cited: 13,520 and 12,222)
      const h = v => 14 * s * v / 13520, base = y + 7 * s, bar = (bx, v, solid) => `<rect x="${f(bx)}" y="${f(base - h(v))}" width="${f(4 * s)}" height="${f(h(v))}" fill="${solid ? c : 'none'}" stroke="${c}" stroke-width="1"/>`;
      if (alg === 'n') return bar(x - 5 * s, 13520, false) + bar(x + 1 * s, 13520, false);
      return bar(x - 5 * s, 13520, true) + bar(x + 1 * s, alg === 'q' ? 13520 : 12222, true);
    }
    case 'defects': {
      const lit = alg === 'n' ? [false, false, false] : defects(RULE[alg]);
      return lit.map((on, k) => `<rect x="${f(x - 7 * s)}" y="${f(y + (3.5 - 5 * k) * s)}" width="${f(14 * s)}" height="${f(2.6 * s)}" rx="1" fill="${on ? c : 'none'}" stroke="${c}" stroke-width="1"/>`).join('');
    }
    case 'hand': { // a curl and its mirror: the mirror is solid when the algebra is its own mirror (cited)
      const curl = (dx, m) => `<path d="M${f(x + dx)} ${f(y + 6 * s)}V${f(y - 2 * s)}a${f(3 * s)} ${f(3 * s)} 0 1 ${m > 0 ? 1 : 0} ${f(m * 5 * s)} 0" fill="none" stroke="${c}" stroke-width="1.4"/>`;
      if (alg === 'n') return curl(-5 * s, 1) + `<g opacity=".5">${curl(5 * s, -1)}</g>`;
      return curl(-5 * s, 1) + (alg === 'q' ? curl(5 * s, -1) : `<g opacity=".35" stroke-dasharray="2 2">${curl(5 * s, -1)}</g>` + line(x + 1 * s, y + 6 * s, x + 7 * s, y - 6 * s, '#ff5470', 1.2));
    }
    case 'imordial': { // ranked imaginaries: three quarter turns standing on a rising line, in the rule's own rank order
      const rk = ranks(bristorian), xs = [-6.5, 0, 6.5];
      return line(x - 9 * s, y + 6 * s, x + 9 * s, y + 6 * s, c, 1) + rk.map((u, k) => { const cx = x + xs[k] * s, cy = y + (3 - 3 * k) * s;
        return arcArrow(cx, cy, 2.6 * s, 0, -Math.PI / 2, c); }).join('');
    }
  }
  return `<text x="${x}" y="${y + 4}" text-anchor="middle" fill="#ff5470" font-size="11">?</text>`; // unknown class: visibly unknown
}

// the order Γ, large and labelled, with two products drawn as moves (every position from lpos, none typed in)
export function orderGamma(rule = bristorian, { W = 420, H = 300 } = {}) {
  const rk = ranks(rule), c = COL.b, ink = '#d6dce8', dim = '#8a8a93', cx = 70, cy = 60, step = 52, LBL = ['1', 'i', 'j', 'k'];
  if (!rk) return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><text x="20" y="40" fill="#ff5470" font-size="14">no ranking: this rule has no Γ</text></svg>`;
  const P = (arm, place) => arm === '+' ? [cx + 28 + step * place, cy] : [cx, cy + 28 + step * place];
  let g = line(cx, cy, cx + 28 + step * 3 + 22, cy, c, 2.2) + line(cx, cy, cx, cy + 28 + step * 3 + 22, c, 2.2)
    + line(cx - 6, cy - 6, cx + 190, cy + 190, dim, 1.2, '5 5') + `<text x="${cx + 150}" y="${cy + 196}" fill="${dim}" font-size="12">fold (sign mirror: +e ↔ −e)</text>`;
  [0, ...rk].forEach((u, k) => { const [px, py] = P('+', k), [qx, qy] = P('−', k);
    g += dot(px, py, 6, c) + `<text x="${px}" y="${py - 14}" fill="${ink}" font-size="16" text-anchor="middle" font-style="italic">${LBL[u]}</text>`
      + `<circle cx="${qx}" cy="${qy}" r="6" fill="#0e1014" stroke="${c}" stroke-width="2"/><text x="${qx - 16}" y="${qy + 5}" fill="${ink}" font-size="16" text-anchor="end" font-style="italic">−${LBL[u]}</text>`; });
  const move = (a, b, col, lab, bend) => { const from = P('+', 1 + rk.indexOf(a)), L = lpos(rule, a, b), to = P(L.arm, L.place), mx = (from[0] + to[0]) / 2 + bend[0], my = (from[1] + to[1]) / 2 + bend[1];
    return `<path d="M${from[0]} ${from[1] + 9}Q${mx} ${my} ${to[0] + (L.arm === '−' ? 9 : 0)} ${to[1] + (L.arm === '+' ? 9 : 0)}" stroke="${col}" stroke-width="1.8" fill="none" stroke-dasharray="${L.arm === '−' ? '5 4' : ''}"/>`
      + `<text x="${mx}" y="${my + 4}" fill="${col}" font-size="14" text-anchor="middle" font-weight="700">${lab} = ${L.arm === '+' ? '' : '−'}${LBL[b]}</text>`; };
  g += move(1, 2, '#ffe066', 'i·j', [0, 34]) + move(2, 1, '#ff5470', 'j·i', [40, 40]);
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="The order gamma: + along the top, − down the side, the fold between">${g}</svg>`;
}

// self-test: every face is computed from the rules; planted rules must change what the faces say.
export function selfTest({ sabotage = null } = {}) {
  const B = sabotage === 'quaternion' ? quaternion : sabotage === 'commutative' ? ((a, b) => (a && b && a !== b) ? { sign: 1, idx: Math.max(a, b) } : bristorian(a, b)) : bristorian;
  const rows = [], ok = (name, pass, detail = '') => rows.push({ name, pass, detail });
  const rb = ranks(B), rq = ranks(quaternion);
  ok('Bristorian has a ranking i < j < k; quaternion has none', JSON.stringify(rb) === '[1,2,3]' && rq === null, `B ${JSON.stringify(rb)}, Q ${rq}`);
  const db = defects(B), dq = defects(quaternion);
  ok('defect rungs on units: Q lights R1 only; B lights R1 R2 R3', JSON.stringify(dq) === '[true,false,false]' && JSON.stringify(db) === '[true,true,true]', `Q ${dq} B ${db}`);
  const pb = closedPlanes('b').length, pq = closedPlanes('q', 12).length;
  ok('closed slices in the (i, j) plane: B2 has 2²−1 = 3; Q has all', pb === 3 && pq === 12, `B ${pb}, Q ${pq}/12`);
  const L1 = lpos(B, 1, 2), L2 = lpos(B, 2, 1), L3 = lpos(B, 3, 3);
  ok('order Γ: i·j on the + arm at j; j·i across the fold, − arm at i; k·k at −1 by the corner', !!L1 && L1.arm === '+' && L1.place === 2 && L2.arm === '−' && L2.place === 1 && L3.arm === '−' && L3.place === 0,
    `${JSON.stringify(L1)} ${JSON.stringify(L2)} ${JSON.stringify(L3)}`);
  const tb = turns('b').join(','), tq = turns('q').join(',');
  ok('pin turns: B still, mirror, half turn; Q a quarter turn at each unit', tb === 'still,mirror,spin180' && tq === 'spin90,spin90,spin90', `B ${tb}; Q ${tq}`);
  const R = radii(72), qd = Math.max(...R.q.map(v => Math.abs(v - 1))), bs = Math.max(...R.b) - Math.min(...R.b);
  ok('size face: Q on the circle, B off it', qd < 1e-12 && bs > .5, `Q dev ${qd.toExponential(1)}, B spread ${bs.toFixed(2)}`);
  return { pass: rows.every(r => r.pass), rows };
}
