// proto_flowtree_svg.js — the flow tree pane drawn as SVG (fable 2026-10-17). proto: the good name stays free.
// Doug 10-16 proposed the tree as SVG; agreed with one push-back: 3-D as styling, not motion, so labels stay upright and
// readable. Same wire, same rules (T1-T4) as the canvas pane proto_flowtree.js; proto_panes.js picks this one unless the
// page (or pane window) has ?tree=canvas.
//
// SPEC (goal targets; tests in aicolab/tmp/brotoid_fable/svgtreetest.mjs, plus panetest.mjs run on both):
//   S1 the tree is SVG: every node is an element (a <g data-id>), every label is <text>, upright; there is no canvas.
//   S2 3-D is styling: the trunk is the same spiral seen from a fixed tilt; a node further back is smaller and fainter and is
//      drawn behind a nearer one. Nothing turns on its own: no animation frame runs unless the reader drags, zooms, resizes
//      or the graph changes, and then exactly one.
//   S3 labels read: a halo of the pane's background behind each label, so a line or node crossing it does not cut it.
//   S4 keys: Tab walks the nodes in the order of the page (beats, then terms); Enter goes back to one, R replays it.
//   T1-T4 as proto_flowtree.js: trunk = track, terms branch, yellow trail oldest faint, white ring = in play now; click goes
//      back (a grey beat plays), double-click or "replay ▶" replays; drag turns, wheel zooms; ×n pace beside a node.
//   recv { type: 'graph', beats, nodes, trail, cur }; send { type: 'goto' | 'replay', node } and { type: 'clear' }.
const css = `
.pft { position: relative; display: flex; flex-direction: column; background: #07080b; color: #e8e8ee; font: 12px ui-monospace, monospace; min-height: 180px; }
.pft-bar { display: flex; gap: 6px; align-items: center; padding: 5px 8px; border-bottom: 1px solid #23252d; flex: none; }
.pft-cur { margin-right: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #b9bdc9; min-width: 0; }
.pft button { font: 12px ui-monospace, monospace; background: none; color: inherit; border: 1px solid #23252d; border-radius: 10px; padding: 1px 8px; cursor: pointer; white-space: nowrap; }
.pft button:hover { border-color: #19e0ff; color: #19e0ff; }
.pft-cv { position: relative; flex: 1 1 auto; min-height: 0; }
.pft-cv svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; cursor: grab; touch-action: none; user-select: none; }
.pft-cv svg text { font-family: ui-monospace, monospace; paint-order: stroke; stroke: #07080b; stroke-width: 3px; stroke-linejoin: round; pointer-events: none; }
.pft-cv .nd { cursor: pointer; outline: none; } .pft-cv .nd .hv { fill: none; stroke: none; stroke-width: 1.5; }
.pft-cv .nd:hover .hv, .pft-cv .nd:focus-visible .hv { stroke: #ffe14d; }
.pft-tip { position: absolute; pointer-events: none; background: #14161cf2; border: 1px solid #23252d; border-radius: 4px; padding: 4px 7px; max-width: 230px; font-size: 11px; line-height: 1.4; z-index: 2; }
.pft-tip[hidden] { display: none; } .pft-tip b { color: #fff; }
.pft-key { flex: none; padding: 3px 8px 5px; color: #8a8a93; font-size: 10px; }`;

const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const f1 = v => v.toFixed(1);

// positions in 3D: the trunk spirals down; branches go outward from the trunk, fanned, shorter at each depth (as the canvas pane)
function layoutOf(G) {
  const pos = {}, N = G.beats.length, par = {};
  G.beats.forEach((b, i) => { const a = i * 0.85; pos[b.id] = [0.55 * Math.cos(a), ((N - 1) / 2 - i) * 0.5, 0.55 * Math.sin(a)]; });
  const kids = {}; for (const n of G.nodes) if (n.kind === 'term') { (kids[n.parent] ||= []).push(n); par[n.id] = n.parent; }
  const grow = (pid, depth) => { const L = kids[pid] || [], p = pos[pid]; if (!p || depth > 12) return;
    const q = pos[par[pid]]; let ox = q ? p[0] - q[0] : p[0], oz = q ? p[2] - q[2] : p[2]; const m = Math.hypot(ox, oz) || 1; ox /= m; oz /= m;
    L.forEach((n, j) => { const t = (j - (L.length - 1) / 2) * 0.75, c = Math.cos(t), s = Math.sin(t), len = 0.95 * Math.pow(0.82, depth - 1);
      pos[n.id] = [p[0] + (ox * c - oz * s) * len, p[1] + (j % 2 ? -0.16 : 0.16) - 0.05 * depth, p[2] + (ox * s + oz * c) * len]; grow(n.id, depth + 1); }); };
  G.beats.forEach(b => grow(b.id, 1));
  const P = Object.values(pos), c = [0, 1, 2].map(k => P.reduce((a, v) => a + v[k], 0) / Math.max(1, P.length));
  const R = Math.max(0.8, ...P.map(v => Math.hypot(v[0] - c[0], v[1] - c[1], v[2] - c[2])));
  return { pos, c, R };
}

export function mountPane(root, { send }) {
  if (!document.getElementById('pfts-css')) { const st = document.createElement('style'); st.id = 'pfts-css'; st.textContent = css; document.head.appendChild(st); }
  root.classList.add('pft');
  root.innerHTML = `<div class="pft-bar"><span class="pft-cur">no path yet: play the page or ask a word</span><button class="rp" type="button" title="play the node in play again">replay ▶</button>` +
    `<button class="cl" type="button" title="forget this page's path">clear</button></div><div class="pft-cv"><svg xmlns="http://www.w3.org/2000/svg" role="group" aria-label="the flow tree: the track as a trunk, terms as branches, your path in yellow; click a node to go back to it"></svg>` +
    `<div class="pft-tip" hidden></div></div><div class="pft-key"><span style="color:#19e0ff">●</span> beat read · ○ not yet · <span style="color:#ffe14d">━</span> your path · click: go back · double-click: replay · drag: turn · Tab, Enter, R</div>`;
  const sv = root.querySelector('svg'), tip = root.querySelector('.pft-tip'), cur = root.querySelector('.pft-cur'), events = new AbortController();
  let G = { beats: [], nodes: [], trail: [], cur: null }, L = { pos: {}, c: [0, 0, 0], R: 1 }, byId = {};
  let yaw = 0.5, pitch = 0.32, zoom = 1, W = 0, H = 0, hits = [], down = null, alive = true, dirty = true, raf = 0, draws = 0, frames = 0;
  function schedule() { if (!alive || raf || document.hidden) return; if (!root.isConnected) { destroy(); return; } raf = requestAnimationFrame(frame); }
  function refresh() { dirty = true; schedule(); }
  function destroy() { alive = false; cancelAnimationFrame(raf); raf = 0; ro?.disconnect(); events.abort(); }
  const size = () => { const r = sv.getBoundingClientRect(); if (r.width !== W || r.height !== H) { W = r.width; H = r.height; refresh(); } };
  const ro = 'ResizeObserver' in window ? new ResizeObserver(size) : null; ro?.observe(sv);
  function proj(p) { let x = p[0] - L.c[0], y = p[1] - L.c[1], z = p[2] - L.c[2];
    const a = Math.cos(yaw), b = Math.sin(yaw); [x, z] = [x * a - z * b, x * b + z * a]; const c = Math.cos(pitch), d = Math.sin(pitch); [y, z] = [y * c - z * d, y * d + z * c];
    const dist = 3.2, s = (Math.min(W, H) * 0.44 / L.R) * zoom * dist / (dist + z / L.R); return [W / 2 + x * s, H / 2 - y * s, z, s]; }
  // depth as styling (S2): 1 at the front of the tree, 0.45 at the back (span set per draw from the nodes in view)
  let z0 = -1, z1 = 1; const fade = z => Math.max(0.45, Math.min(1, 1 - 0.55 * (z - z0) / Math.max(1e-6, z1 - z0)));
  function all() { const N = G.beats.map(b => byId[b.id] || { id: b.id, kind: 'beat', ghost: true, label: b.label, title: b.title, speed: b.speed, visits: 0 });
    return N.concat(G.nodes.filter(n => n.kind === 'term')); }
  const line = (a, b, stroke, w, op) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" opacity="${op.toFixed(2)}"/>`;
  function draw() {
    draws++; sv.setAttribute('viewBox', `0 0 ${f1(Math.max(1, W))} ${f1(Math.max(1, H))}`); hits = [];
    if (!G.beats.length || !W || !H) { sv.innerHTML = ''; return; }
    const focus = document.activeElement?.closest?.('.nd')?.dataset.id;
    const P = id => L.pos[id] && proj(L.pos[id]), out = [];
    const Z = Object.keys(L.pos).map(id => P(id)[2]); z0 = Math.min(...Z); z1 = Math.max(...Z);
    for (let i = 1; i < G.beats.length; i++) { const a = P(G.beats[i - 1].id), b = P(G.beats[i].id); if (!a || !b) continue;
      const read = byId[G.beats[i].id] && byId[G.beats[i - 1].id]; out.push(line(a, b, read ? '#19e0ff' : '#3a3d48', 1.5, (read ? 0.47 : 1) * fade((a[2] + b[2]) / 2))); }
    for (const n of G.nodes) if (n.kind === 'term') { const a = P(n.parent), b = P(n.id); if (!a || !b) continue;
      out.push(line(a, b, n.color || '#ffe14d', 1.5, 0.6 * fade((a[2] + b[2]) / 2))); }
    const T = G.trail.filter((id, k, A) => L.pos[id] && id !== A[k - 1]).slice(-40);
    for (let k = 1; k < T.length; k++) out.push(line(P(T[k - 1]), P(T[k]), '#ffe14d', 2.5, 0.12 + 0.88 * k / (T.length - 1)));
    const order = all(), D = order.map((n, k) => ({ n, k, p: P(n.id) })).filter(d => d.p).sort((a, b) => b.p[2] - a.p[2]);
    for (const { n, k, p } of D) { const sc = p[3] / (Math.min(W, H) * 0.44 / L.R), r = Math.max(3, Math.min(14, (4 + 2.2 * Math.sqrt(n.visits || 0)) * sc));
      const [x, y] = [f1(p[0]), f1(p[1])], col = n.kind === 'term' ? (n.color || '#ffe14d') : '#19e0ff', fs = (n.kind === 'term' ? 11 : 10) * Math.max(0.85, Math.min(1.1, sc));
      const pace = !n.ghost && Math.abs((n.speed || 1) - 1) > 0.05;
      out.push(`<g class="nd" data-id="${esc(n.id)}" tabindex="0" role="button" style="--k:${k}" opacity="${fade(p[2]).toFixed(2)}" aria-label="${esc((n.title || n.label) + (n.ghost ? ', not read yet' : `, visited ${n.visits} times`))}">` +
        `<circle cx="${x}" cy="${y}" r="${f1(r + 8)}" fill="transparent"/>` +
        (n.ghost ? `<circle cx="${x}" cy="${y}" r="${f1(r)}" fill="none" stroke="#6a6e7a" stroke-width="1.5"/>` : `<circle cx="${x}" cy="${y}" r="${f1(r)}" fill="${col}"/>`) +
        (n.id === G.cur ? `<circle class="now" cx="${x}" cy="${y}" r="${f1(r + 4)}" fill="none" stroke="#fff" stroke-width="2"/>` : '') +
        `<circle class="hv" cx="${x}" cy="${y}" r="${f1(r + 2)}"/>` +
        `<text x="${f1(p[0] + r + 3)}" y="${f1(p[1] + 3)}" font-size="${f1(fs)}" fill="${n.ghost ? '#6a6e7a' : n.kind === 'term' ? (n.color || '#ddd') : '#cfe9ef'}">${esc(n.label)}</text>` +
        (pace ? `<text class="pace" x="${f1(p[0] + r + 3)}" y="${f1(p[1] + 14)}" font-size="9" fill="#ffe14d">×${n.speed.toFixed(1)}</text>` : '') + `</g>`);
      hits.push({ id: n.id, x: p[0], y: p[1], r, k }); }
    sv.innerHTML = out.join('');
    // S4: Tab walks the page's order, not the depth order the nodes are painted in
    const tabbed = [...sv.querySelectorAll('.nd')].sort((a, b) => a.style.getPropertyValue('--k') - b.style.getPropertyValue('--k'));
    tabbed.forEach((g, i) => g.setAttribute('tabindex', i ? '-1' : '0'));
    sv.__order = tabbed;
    if (focus) sv.querySelector(`.nd[data-id="${CSS.escape(focus)}"]`)?.focus({ preventScroll: true });
  }
  const hit = (x, y) => { let best = null, bd = 1e9; for (const h of hits) { const d = Math.hypot(h.x - x, h.y - y); if (d < h.r + 8 && d < bd) { bd = d; best = h.id; } } return best; };
  const nodeOf = id => all().find(n => n.id === id);
  function showTip(id, x, y) { const n = id && nodeOf(id); if (!n) { tip.hidden = true; return; }
    tip.innerHTML = `<b>${esc(n.title || n.label)}</b><br>` + (n.ghost ? 'not read yet · click: play it' : `visited ${n.visits}× · pace ×${(n.speed || 1).toFixed(2)}${Math.abs((n.speed || 1) - 1) > 0.05 ? ' (learned from your next)' : ''}<br>click: go back here · double-click: replay`);
    tip.hidden = false; tip.style.left = Math.min(W - 180, x + 12) + 'px'; tip.style.top = Math.max(0, y - 10) + 'px'; }
  const at = e => { const r = sv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const on = (t, f, o = {}) => sv.addEventListener(t, f, { ...o, signal: events.signal });
  on('pointerdown', e => { const [x, y] = at(e); down = { x, y, yaw, pitch, moved: false, id: e.pointerId }; });
  on('pointermove', e => { const [x, y] = at(e);
    if (down) { const dx = x - down.x, dy = y - down.y; if (!down.moved && Math.hypot(dx, dy) > 4) { down.moved = true; sv.setPointerCapture?.(down.id); sv.style.cursor = 'grabbing'; }
      if (down.moved) { yaw = down.yaw + dx * 0.01; pitch = Math.max(-1.3, Math.min(1.3, down.pitch + dy * 0.008)); tip.hidden = true; refresh(); } return; }
    showTip(hit(x, y), x, y); });
  on('pointerup', e => { const [x, y] = at(e), d = down; down = null; sv.style.cursor = ''; if (d && !d.moved) { const h = hit(x, y); if (h) send({ type: 'goto', node: h }); } });
  on('pointerleave', () => { tip.hidden = true; });
  on('pointercancel', () => { down = null; sv.style.cursor = ''; });
  on('dblclick', e => { const [x, y] = at(e), h = hit(x, y); if (h) send({ type: 'replay', node: h }); });
  on('wheel', e => { e.preventDefault(); zoom = Math.max(0.4, Math.min(4, zoom * Math.exp(-e.deltaY * 0.0012))); refresh(); }, { passive: false });
  on('keydown', e => { const g = e.target.closest?.('.nd'); if (!g) return; const O = sv.__order || [], i = O.indexOf(g);
    if (e.key === 'Enter') { e.preventDefault(); send({ type: 'goto', node: g.dataset.id }); }
    else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); send({ type: 'replay', node: g.dataset.id }); }
    else if (e.key === 'Tab' && i >= 0 && O[i + (e.shiftKey ? -1 : 1)]) { e.preventDefault(); O[i + (e.shiftKey ? -1 : 1)].focus({ preventScroll: true }); } });
  root.querySelector('.rp').addEventListener('click', () => { if (G.cur) send({ type: 'replay', node: G.cur }); }, { signal: events.signal });
  const cl = root.querySelector('.cl'); cl.addEventListener('click', () => { if (cl.dataset.sure) { delete cl.dataset.sure; cl.textContent = 'clear'; send({ type: 'clear' }); }
    else { cl.dataset.sure = 1; cl.textContent = 'sure?'; setTimeout(() => { delete cl.dataset.sure; cl.textContent = 'clear'; }, 3000); } }, { signal: events.signal });
  function frame() { raf = 0; if (!alive) return; if (!root.isConnected) { destroy(); return; } frames++;
    if (document.hidden) return; if (!W || !H) size(); if (dirty && W && H) { dirty = false; draw(); } }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (dirty) schedule(); }, { signal: events.signal });
  size(); refresh();
  // same handle as the canvas pane; nothing moves on its own, so pause/restart are no-ops and velocity is always 0
  root.__ft = { screenOf: id => { if (dirty && !document.hidden && W && H) { dirty = false; draw(); } const h = hits.find(h => h.id === id); if (!h) return null; const r = sv.getBoundingClientRect(); return { x: r.left + h.x, y: r.top + h.y }; }, graph: () => G,
    motion: () => ({ velocity: 0, dirty, scheduled: !!raf, draws, frames, yaw, alive }), pause() {}, restart() {}, kind: 'svg' };
  return { destroy, recv(m) { if (!alive || m?.type !== 'graph') return; G = m; byId = Object.fromEntries(G.nodes.map(n => [n.id, n])); L = layoutOf(G);
    const n = G.cur && nodeOf(G.cur); cur.textContent = n ? 'now: ' + (n.title || n.label) : 'no path yet: play the page or ask a word'; refresh(); } };
}
