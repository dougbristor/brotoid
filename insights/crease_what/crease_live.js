// crease_live: the h plot + the live brotoid beside it, shared by crease_what's inline view and its explorer (insights 10-18).
// h(lo) = |m − q| along G (brotoid_weft); dips = wefts-to-be (crease while above r), peaks = where two wefts will join (brotoid_moments).
import { curveG, dirOf } from '/codetree/blocks/brotoid_weft/v1.js';
import * as X from '/codetree/blocks/brotoid_weft/v1.js';
import { moments } from '/codetree/blocks/brotoid_moments/v1.js';
export { dirOf };
export let MAG = 0.9;   // |q|; a host page sets its own with setMag (fable 10-23: their pages move to |q| = 1.0). Importers see it live.
export const setMag = m => { if (m > 0 && m !== MAG) MAG = m; };
const MOM = new Map();
export const qOf = Qd => dirOf(Qd[0], Qd[1]).map(v => v * MAG);
export function momentsOf(Qd) { const k = Qd.join() + '|' + MAG; if (!MOM.has(k)) { if (MOM.size > 40) MOM.clear(); MOM.set(k, moments(qOf(Qd))); } return MOM.get(k); }
export const umbrellaCount = (Qd, r) => X.crossing(qOf(Qd), r, { kinds: false }).umbrellas.length;

// the plot. Returns what it found, for captions.
export function drawPlot(cv, Qd, r, { YM = 2.6, compact = false, hover = null } = {}) {
  const dp = devicePixelRatio, w = cv.width = cv.clientWidth * dp, h = cv.height = cv.clientHeight * dp, cx = cv.getContext('2d');
  const q = qOf(Qd), G = curveG(q), mo = momentsOf(Qd), L = 40 * dp, B = 26 * dp, T = 10 * dp;
  const X0 = lo => L + (w - L - 10 * dp) * lo / 180, Y = v => h - B - (h - B - T) * Math.min(v, YM) / YM;
  cx.fillStyle = '#0f1320'; cx.fillRect(0, 0, w, h); cx.font = `${11 * dp}px ui-monospace,monospace`;
  const step = YM > 3.5 ? 1 : 0.5; for (let v = 0; v <= YM + 1e-9; v += step) { cx.fillStyle = '#1c2236'; cx.fillRect(L, Y(v), w - L, 1); cx.fillStyle = '#8d8aa0'; cx.fillText(v.toFixed(1), 6 * dp, Y(v) + 4 * dp); }
  for (const lo of [0, 45, 90, 135, 180]) { const t = lo + '°' + (lo === 45 ? ' seam' : lo === 135 ? ' fold' : ''); cx.fillStyle = '#8d8aa0'; cx.fillText(t, Math.min(X0(lo) - 8 * dp, w - cx.measureText(t).width - 4 * dp), h - 8 * dp); }
  cx.fillStyle = 'rgba(201,211,230,.08)'; for (const lo of [45, 135]) cx.fillRect(X0(lo) - 2 * dp, T, 4 * dp, h - B - T);   // the walls: G at infinity
  cx.fillStyle = 'rgba(255,219,107,.25)'; for (let i = 1; i < G.length; i++) { const a = G[i - 1], b = G[i]; if (a && b && a.h < r && b.h < r) cx.fillRect(X0(a.lo), Y(r), X0(b.lo) - X0(a.lo) + 1, Y(Math.max(a.h, 0)) - Y(r)); }
  cx.lineWidth = 2 * dp; cx.strokeStyle = '#d9d3c7'; cx.beginPath(); let pen = false;
  for (const g of G) { if (!g || g.h > 50) { pen = false; continue; } const x = X0(g.lo), y = Y(g.h); pen ? cx.lineTo(x, y) : cx.moveTo(x, y); pen = true; } cx.stroke();
  cx.strokeStyle = '#ffdb6b'; cx.setLineDash([6 * dp, 4 * dp]); cx.beginPath(); cx.moveTo(L, Y(r)); cx.lineTo(w, Y(r)); cx.stroke(); cx.setLineDash([]); cx.fillStyle = '#ffdb6b'; cx.fillText('r', w - 14 * dp, Y(r) - 5 * dp);
  const lab = (t, x, y, col) => { const lw = cx.measureText(t).width; cx.fillStyle = col; cx.fillText(t, x + 9 * dp + lw > w - 4 * dp ? x - 9 * dp - lw : x + 9 * dp, y); };
  // dips (exact, from the moments atom): crease above r, weft below
  const dips = mo.births.map(b => ({ lo: b.lo, h: b.r, crease: b.r > r }));
  for (const d of dips) { if (d.h > YM) continue; const x = X0(d.lo), y = Y(d.h); cx.lineWidth = 2 * dp; cx.strokeStyle = d.crease ? '#7af0ff' : '#ffdb6b'; cx.beginPath(); cx.arc(x, y, 6 * dp, 0, 2 * Math.PI); cx.stroke();
    if (d.crease) { cx.strokeStyle = 'rgba(122,240,255,.7)'; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x, Y(r)); cx.stroke(); }
    lab(d.crease ? `crease, gap ${(d.h - r).toFixed(3)}` : `weft (born r ${d.h.toFixed(3)})`, x, y + (d.crease ? -8 : 16) * dp, d.crease ? '#7af0ff' : '#ffdb6b'); }
  // peaks: where two wefts join. Pending when both sides already weft (a sample below r between the peak and the next wall or peak, each side).
  const idx = lo => { let k = 0; for (let i = 0; i < G.length; i++) if (G[i] && Math.abs(G[i].lo - lo) < Math.abs((G[k] ? G[k].lo : 1e9) - lo)) k = i; return k; };
  // walk down one flank from the peak: it holds a weft iff it drops below r before it starts climbing again (or meets a wall)
  const side = (k, s) => { let prev = G[k] ? G[k].h : Infinity; for (let n = 1; n < G.length; n++) { const g = G[((k + s * n) % G.length + G.length) % G.length];
    if (!g) return false; if (g.h < r) return true; if (g.h > prev + 1e-12) return false; prev = g.h; } return false; };
  const peaks = mo.weftMerges.map(p => { const k = idx(p.lo), both = side(k, -1) && side(k, 1); return { lo: p.lo, h: p.r, state: p.r <= r ? 'joined' : both ? 'pending' : 'hump' }; });
  for (const p of peaks) { if (p.h > YM) continue; const x = X0(p.lo), y = Y(p.h), col = p.state === 'pending' ? '#d98cff' : '#8d8aa0'; cx.lineWidth = 2 * dp; cx.strokeStyle = col;
    cx.beginPath(); cx.moveTo(x - 6 * dp, y - 6 * dp); cx.lineTo(x, y); cx.lineTo(x + 6 * dp, y - 6 * dp); cx.stroke();
    if (!compact || p.state === 'pending') lab(p.state === 'joined' ? `joined at r ${p.h.toFixed(3)}` : p.state === 'pending' ? `two wefts join at r ${p.h.toFixed(3)}` : `peak ${p.h.toFixed(3)}`, x, y - 10 * dp, col); }
  // the hovered cone line (linked with the cone view and the brotoid)
  if (hover != null) { const g = G.reduce((o, g) => g && (!o || Math.abs(g.lo - hover) < Math.abs(o.lo - hover)) ? g : o, null);
    if (g) { const x = X0(g.lo); cx.strokeStyle = 'rgba(255,79,163,.9)'; cx.lineWidth = 1.5 * dp; cx.beginPath(); cx.moveTo(x, T); cx.lineTo(x, h - B); cx.stroke();
      cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(x, Y(g.h), 4 * dp, 0, 7); cx.fill(); lab(`${g.lo.toFixed(1)}°  h ${g.h.toFixed(3)}${g.h < r ? ' (weft)' : `, gap ${(g.h - r).toFixed(3)}`}`, x, T + 12 * dp, '#ff9fd0'); } }
  return { dips, peaks, mo, loAt: px => (px * dp - L) / (w - L - 10 * dp) * 180 }; }

// one line saying what is going on at this r
export function sayAt(Qd, r, found) { const { dips, peaks, mo } = found, n = umbrellaCount(Qd, r), tears = dips.filter(d => !d.crease), cr = dips.filter(d => d.crease).sort((a, b) => a.h - b.h);
  const pend = peaks.filter(p => p.state === 'pending'), joined = peaks.filter(p => p.state === 'joined');
  const parts = [`r = ${r.toFixed(3)}: ${n} umbrella${n === 1 ? '' : 's'}, so ${n / 2} weft${n === 2 ? '' : 's'}`];
  if (tears.length) parts.push(`born at r ${tears.map(d => d.h.toFixed(3)).join(', ')}${joined.length ? ` (${joined.length === 1 ? 'two of them joined' : joined.length + ' joins'} at r ${joined.map(p => p.h.toFixed(3)).join(', ')})` : ''}`);
  if (cr.length) parts.push(`${cr.length === 1 ? 'a crease' : cr.length + ' creases'} still open: ${cr.map(d => `${d.lo.toFixed(0)}° gap ${(d.h - r).toFixed(3)}`).join(', ')}`);
  if (pend.length) parts.push(`two wefts will join at r ${pend.map(p => p.h.toFixed(3)).join(', ')}`);
  const next = [...mo.births.map(b => ({ r: b.r, t: 'a crease becomes a weft' })), ...mo.weftMerges.map(p => ({ r: p.r, t: 'two wefts join' })), ...mo.touches.map(t => ({ r: t.r, t: 'a crossing loop is born' })), { r: mo.apex.r, t: '③ the skin passes through 0' },
    ...mo.selfBirths.map(o => ({ r: o.r, t: 'a self weft is born (④)' })), ...mo.selfMerges.map(o => ({ r: o.r, t: 'two self wefts meet' }))]
    .filter(e => e.r > r + 1e-9).sort((a, b) => a.r - b.r)[0];
  if (next) parts.push(`next: ${next.t} at r ${next.r.toFixed(3)}`);
  return parts.join('; ') + '.'; }

// every moment for this q, for the r ruler
export function momentList(Qd) { const mo = momentsOf(Qd);
  return [...mo.touches.map(t => ({ r: t.r, k: 'join', t: 'crossing loop born' })), ...mo.crossingMerges.map(t => ({ r: t.r, k: 'jm', t: 'two rims meet' })), ...mo.births.map(b => ({ r: b.r, k: 'birth', t: `crease → weft (${b.lo.toFixed(0)}°)` })),
    ...mo.weftMerges.map(p => ({ r: p.r, k: 'tm', t: 'two wefts join' })), { r: mo.apex.r, k: 'apex', t: '③ r = |q|' },
    // ④ (insights 10-19): a self weft is born where the ball reaches X, the weft's switch points (brotoid_weft switchOn); names from the atom
    ...mo.selfBirths.map(o => ({ r: o.r, k: 'sb', t: `${o.name} (${o.lo.toFixed(0)}°)` })), ...mo.selfMerges.map(o => ({ r: o.r, k: 'sm', t: o.name }))].sort((a, b) => a.r - b.r); }
export const KCOL = { join: '#ff4fa3', jm: '#b0417e', birth: '#7af0ff', tm: '#d98cff', apex: '#ffffff', sb: '#8cff7a', sm: '#3f9a52' };
export function drawRuler(cv, Qd, r, rMax) { const dp = devicePixelRatio, w = cv.width = cv.clientWidth * dp, h = cv.height = cv.clientHeight * dp, cx = cv.getContext('2d');
  const X0 = v => 8 * dp + (w - 16 * dp) * v / rMax; cx.clearRect(0, 0, w, h); cx.fillStyle = '#1c2236'; cx.fillRect(8 * dp, h / 2, w - 16 * dp, 1);
  const L = momentList(Qd).filter(m => m.r <= rMax); for (const m of L) { cx.fillStyle = KCOL[m.k]; cx.fillRect(X0(m.r) - 1.5 * dp, 3 * dp, 3 * dp, h - 6 * dp); }
  cx.fillStyle = '#ffdb6b'; cx.beginPath(); cx.moveTo(X0(r), h - 2 * dp); cx.lineTo(X0(r) - 5 * dp, h - 10 * dp); cx.lineTo(X0(r) + 5 * dp, h - 10 * dp); cx.fill(); return { L, X0 }; }

// a live brotoid_flow (?embed=1) iframe kept at this q and r. brotoid_flow draws the crease rings itself since 10-18 (its 'creases' layer, CREASE1);
// the overlay canvas is kept for page marks but left empty.
export function liveBrot(iframe, overlay, get) {
  const sync = () => { const bf = iframe.contentWindow && iframe.contentWindow.__bf; if (!bf) return null; const { Qd, r } = get();
    if (bf.S.lon !== Qd[0] || bf.S.lat !== Qd[1] || bf.S.r_frac !== r / MAG) { bf.S.lon = Qd[0]; bf.S.lat = Qd[1]; bf.S.mag = MAG; bf.S.r_frac = r / MAG; } return bf; };
  const tick = () => { requestAnimationFrame(tick); sync(); };
  iframe.addEventListener('load', sync); tick(); return { sync }; }
