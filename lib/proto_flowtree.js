// proto_flowtree.js — the flow tree pane (fable 2026-10-13). proto: the good name stays free.
// Doug 10-13: "I also want a 'flow tree 3d graph visualiser of the node path' with option to click back to that node."
//
// SPEC (goal targets; tests in aicolab/tmp/brotoid_fable/panetest.mjs):
//   T1 the trunk is the page's track: one node per beat, in order, on a slow spiral (3D, turning). A beat not yet read is a
//      hollow grey ring; a read one is filled cyan, bigger the more often it was read.
//   T2 a term asked while a beat (or another term) is in play grows a branch off it, in the term's own colour; asked again on
//      its own branch it returns to that node (no endless chain). The reader's path is a yellow trail through the nodes in
//      the order they were visited, oldest faint, newest bright. The node in play now has a white ring.
//   T3 click a node: the page goes back to it (the figure as it was left there, its caption). Click a grey beat: it plays.
//      Double-click, or "replay ▶": that node plays again. Drag turns the tree, the wheel zooms.
//   T5 motion decays to idle, with no animation-frame polling while idle. Graph, hover, drag and resize changes dirty the
//      picture once. [press to restart] starts another finite spin; pause or reader manipulation stops motion immediately.
//      Hidden/folded panes do not tick; current-node rings are static at idle. destroy() releases a closed frame.
//   T4 a node's learned pace shows as ×n beside it (from the page's auto/manual next, pageflow F14); hover tells it in words.
//   recv { type: 'graph', beats: [{ id, label, title, speed }], nodes: [{ id, kind, ref, parent, visits, label, title, color,
//   speed, snap }], trail: [ids], cur }; send { type: 'goto' | 'replay', node } and { type: 'clear' }.
const css = `
.pft { position: relative; display: flex; flex-direction: column; background: #07080b; color: #e8e8ee; font: 12px ui-monospace, monospace; min-height: 180px; }
.pft-bar { display: flex; gap: 6px; align-items: center; padding: 5px 8px; border-bottom: 1px solid #23252d; flex: none; }
.pft-cur { margin-right: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #b9bdc9; min-width: 0; }
.pft button { font: 12px ui-monospace, monospace; background: none; color: inherit; border: 1px solid #23252d; border-radius: 10px; padding: 1px 8px; cursor: pointer; white-space: nowrap; }
.pft button:hover { border-color: #19e0ff; color: #19e0ff; }
.pft-cv { position: relative; flex: 1 1 auto; min-height: 0; }
.pft-cv canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; cursor: grab; touch-action: none; }
.pft-tip { position: absolute; pointer-events: none; background: #14161cf2; border: 1px solid #23252d; border-radius: 4px; padding: 4px 7px; max-width: 230px; font-size: 11px; line-height: 1.4; z-index: 2; }
.pft-tip[hidden] { display: none; } .pft-tip b { color: #fff; }
.pft-key { flex: none; padding: 3px 8px 5px; color: #8a8a93; font-size: 10px; }`;

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// positions in 3D: the trunk spirals down; branches go outward from the trunk, fanned, shorter at each depth
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
  if (!document.getElementById('pft-css')) { const st = document.createElement('style'); st.id = 'pft-css'; st.textContent = css; document.head.appendChild(st); }
  root.classList.add('pft');
  root.innerHTML = `<div class="pft-bar"><span class="pft-cur">no path yet: play the page or ask a word</span><button class="rp" type="button" title="play the node in play again">replay ▶</button>` +
    `<button class="cl" type="button" title="forget this page's path">clear</button></div><div class="pft-cv"><canvas aria-label="the flow tree: the track as a trunk, terms as branches, your path in yellow; click a node to go back to it"></canvas>` +
    `<div class="pft-tip" hidden></div></div><div class="pft-key"><span style="color:#19e0ff">●</span> beat read · ○ not yet · <span style="color:#ffe14d">━</span> your path · click: go back · double-click: replay · drag: turn</div>` +
    `<div class="pft-key"><span class="pft-status" role="status">idle</span> · <button class="motion" type="button">[press to restart]</button></div>`;
  const cv = root.querySelector('canvas'), cx = cv.getContext('2d'), tip = root.querySelector('.pft-tip'), cur = root.querySelector('.pft-cur');
  let G = { beats: [], nodes: [], trail: [], cur: null }, L = { pos: {}, c: [0, 0, 0], R: 1 }, byId = {};
  const motion = root.querySelector('.motion'), status = root.querySelector('.pft-status'), events = new AbortController();
  let yaw = 0.5, pitch = 0.32, zoom = 1, W = 0, H = 0, dpr = 1, hits = [], hov = null, down = null, last = performance.now(), alive = true;
  let velocity = 0, dirty = true, raf = 0, draws = 0, frames = 0;
  function motionLabel() { status.textContent = velocity ? 'settling to idle' : 'idle · ticker paused'; motion.textContent = velocity ? '[pause motion]' : '[press to restart]'; }
  function schedule() { if (!alive || raf || document.hidden) return; if (!root.isConnected) { destroy(); return; } raf = requestAnimationFrame(frame); }
  function refresh() { dirty = true; schedule(); }
  function pause() { velocity = 0; motionLabel(); refresh(); }
  function restart() { if (RM) { pause(); return; } velocity = 0.12; last = performance.now(); motionLabel(); refresh(); }
  function destroy() { alive = false; cancelAnimationFrame(raf); raf = 0; ro?.disconnect(); events.abort(); }
  const size = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
    const w = Math.max(1, Math.round(W * dpr)), h = Math.max(1, Math.round(H * dpr)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; dirty = true; }
    if (!W || !H) { velocity = 0; motionLabel(); cancelAnimationFrame(raf); raf = 0; } else schedule(); };
  const ro = 'ResizeObserver' in window ? new ResizeObserver(size) : null; ro?.observe(cv);
  function proj(p) { let x = p[0] - L.c[0], y = p[1] - L.c[1], z = p[2] - L.c[2];
    const a = Math.cos(yaw), b = Math.sin(yaw); [x, z] = [x * a - z * b, x * b + z * a]; const c = Math.cos(pitch), d = Math.sin(pitch); [y, z] = [y * c - z * d, y * d + z * c];
    const dist = 3.2, s = (Math.min(W, H) * 0.44 / L.R) * zoom * dist / (dist + z / L.R); return [W / 2 + x * s, H / 2 - y * s, z, s]; }
  function all() { const N = G.beats.map(b => byId[b.id] || { id: b.id, kind: 'beat', ghost: true, label: b.label, title: b.title, speed: b.speed, visits: 0 });
    return N.concat(G.nodes.filter(n => n.kind === 'term')); }
  function draw() {
    draws++; cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H); if (!G.beats.length) return;
    const P = id => L.pos[id] && proj(L.pos[id]);
    cx.lineWidth = 1.5;
    for (let i = 1; i < G.beats.length; i++) { const a = P(G.beats[i - 1].id), b = P(G.beats[i].id); if (!a || !b) continue;
      cx.strokeStyle = byId[G.beats[i].id] && byId[G.beats[i - 1].id] ? '#19e0ff77' : '#3a3d48'; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
    for (const n of G.nodes) if (n.kind === 'term') { const a = P(n.parent), b = P(n.id); if (!a || !b) continue;
      cx.strokeStyle = (n.color || '#ffe14d') + '99'; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
    const T = G.trail.filter((id, k, A) => L.pos[id] && id !== A[k - 1]).slice(-40);
    for (let k = 1; k < T.length; k++) { const a = P(T[k - 1]), b = P(T[k]); cx.strokeStyle = `rgba(255,225,77,${(0.12 + 0.88 * k / (T.length - 1)).toFixed(2)})`; cx.lineWidth = 2.5;
      cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
    hits = []; const t = performance.now() / 1000;
    const D = all().map(n => ({ n, p: P(n.id) })).filter(d => d.p).sort((a, b) => b.p[2] - a.p[2]);
    for (const { n, p } of D) { const k = p[3] / (Math.min(W, H) * 0.44 / L.R), r = Math.max(3, Math.min(14, (4 + 2.2 * Math.sqrt(n.visits || 0)) * k));
      cx.beginPath(); cx.arc(p[0], p[1], r, 0, 2 * Math.PI);
      if (n.ghost) { cx.strokeStyle = '#6a6e7a'; cx.lineWidth = 1.5; cx.stroke(); } else { cx.fillStyle = n.kind === 'term' ? (n.color || '#ffe14d') : '#19e0ff'; cx.fill(); }
      if (n.id === G.cur) { cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.beginPath(); cx.arc(p[0], p[1], r + 4 + (velocity && !RM ? 1.5 * Math.sin(t * 3) : 0), 0, 2 * Math.PI); cx.stroke(); }
      if (n.id === hov) { cx.strokeStyle = '#ffe14d'; cx.lineWidth = 1.5; cx.beginPath(); cx.arc(p[0], p[1], r + 2, 0, 2 * Math.PI); cx.stroke(); }
      cx.font = `${n.kind === 'term' ? 11 : 10}px ui-monospace, monospace`; cx.fillStyle = n.ghost ? '#6a6e7a' : n.kind === 'term' ? (n.color || '#ddd') : '#cfe9ef';
      cx.fillText(n.label, p[0] + r + 3, p[1] + 3);
      if (!n.ghost && Math.abs((n.speed || 1) - 1) > 0.05) { cx.fillStyle = '#ffe14d'; cx.font = '9px ui-monospace, monospace'; cx.fillText('×' + n.speed.toFixed(1), p[0] + r + 3, p[1] + 14); }
      hits.push({ id: n.id, x: p[0], y: p[1], r }); }
  }
  const hit = (x, y) => { let best = null, bd = 1e9; for (const h of hits) { const d = Math.hypot(h.x - x, h.y - y); if (d < h.r + 8 && d < bd) { bd = d; best = h.id; } } return best; };
  const nodeOf = id => all().find(n => n.id === id);
  function showTip(id, x, y) { const n = id && nodeOf(id); if (!n) { tip.hidden = true; return; }
    tip.innerHTML = `<b>${esc(n.title || n.label)}</b><br>` + (n.ghost ? 'not read yet · click: play it' : `visited ${n.visits}× · pace ×${(n.speed || 1).toFixed(2)}${Math.abs((n.speed || 1) - 1) > 0.05 ? ' (learned from your next)' : ''}<br>click: go back here · double-click: replay`);
    tip.hidden = false; tip.style.left = Math.min(W - 180, x + 12) + 'px'; tip.style.top = Math.max(0, y - 10) + 'px'; }
  const at = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { pause(); const [x, y] = at(e); down = { x, y, yaw, pitch, moved: false }; cv.setPointerCapture?.(e.pointerId); });
  cv.addEventListener('pointermove', e => { const [x, y] = at(e);
    if (down) { const dx = x - down.x, dy = y - down.y; if (Math.hypot(dx, dy) > 4) down.moved = true;
      if (down.moved) { yaw = down.yaw + dx * 0.01; pitch = Math.max(-1.3, Math.min(1.3, down.pitch + dy * 0.008)); tip.hidden = true; refresh(); } return; }
    const h = hit(x, y); if (h !== hov) { hov = h; refresh(); } showTip(h, x, y); cv.style.cursor = h ? 'pointer' : 'grab'; });
  cv.addEventListener('pointerup', e => { const [x, y] = at(e), d = down; down = null; if (d && !d.moved) { const h = hit(x, y); if (h) send({ type: 'goto', node: h }); } });
  cv.addEventListener('pointerleave', () => { if (hov) { hov = null; refresh(); } tip.hidden = true; });
  cv.addEventListener('pointercancel', () => { down = null; });
  cv.addEventListener('dblclick', e => { const [x, y] = at(e), h = hit(x, y); if (h) send({ type: 'replay', node: h }); });
  cv.addEventListener('wheel', e => { e.preventDefault(); pause(); zoom = Math.max(0.4, Math.min(4, zoom * Math.exp(-e.deltaY * 0.0012))); refresh(); }, { passive: false });
  motion.addEventListener('click', () => velocity ? pause() : restart());
  root.querySelector('.rp').addEventListener('click', () => { if (G.cur) send({ type: 'replay', node: G.cur }); });
  const cl = root.querySelector('.cl'); cl.addEventListener('click', () => { if (cl.dataset.sure) { delete cl.dataset.sure; cl.textContent = 'clear'; send({ type: 'clear' }); }
    else { cl.dataset.sure = 1; cl.textContent = 'sure?'; setTimeout(() => { delete cl.dataset.sure; cl.textContent = 'clear'; }, 3000); } });
  function frame(now) { raf = 0; if (!alive) return; if (!root.isConnected) { destroy(); return; } frames++;
    if (document.hidden) return; if (!W || !H) size(); if (!W || !H) return;
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
    if (velocity) { yaw += velocity * dt; velocity *= Math.exp(-dt / 1.2); dirty = true; if (velocity < 0.002) { velocity = 0; motionLabel(); } }
    if (dirty) { dirty = false; draw(); } if (velocity) schedule(); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { velocity = 0; motionLabel(); cancelAnimationFrame(raf); raf = 0; } else refresh(); }, { signal: events.signal });
  size(); if (!RM && W && H) restart(); else { motionLabel(); refresh(); }
  root.__ft = { screenOf: id => { if (dirty && !document.hidden && W && H) { dirty = false; draw(); } const h = hits.find(h => h.id === id); if (!h) return null; const r = cv.getBoundingClientRect(); return { x: r.left + h.x, y: r.top + h.y }; }, graph: () => G,
    motion: () => ({ velocity, dirty, scheduled: !!raf, draws, frames, yaw, alive }), pause, restart };
  return { destroy, recv(m) { if (!alive || m?.type !== 'graph') return; G = m; byId = Object.fromEntries(G.nodes.map(n => [n.id, n])); L = layoutOf(G);
    const n = G.cur && nodeOf(G.cur); cur.textContent = n ? 'now: ' + (n.title || n.label) : 'no path yet: play the page or ask a word'; refresh(); } };
}
