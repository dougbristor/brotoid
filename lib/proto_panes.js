// proto_panes.js — the pane manager (fable 2026-10-13). proto: the good name stays free.
// Doug 10-13: "I think we need a window|frame glyph pane manager".
//
// SPEC (goal targets; tests in aicolab/tmp/brotoid_fable/panetest.mjs):
//   P1 a pane is one view of the page (Symbols, Flow tree, Sign). Each lives in one place: frame (stacked in the dock beside
//      the page), window (its own small window, proto_pane.html?pane=<id>&for=<path>) or off; the Sign also has inset (the
//      floating corner it has always had).
//   P2 the manager ("panes" in the bar) shows every pane with its places as chips; the choice is remembered per viewer
//      (localStorage pageflow-panes).
//   P3 one wire for both places: the page calls send(id, msg) and hears the pane through onUp(id, msg). In a frame that is a
//      call; in a window it is BroadcastChannel('pageflow') { type: 'pane', pane, path, msg } down and 'pane-up' back. A window
//      says pane-hello on load and pane-bye on close; the page answers hello with the pane's whole state (init(id)).
//   P4 frames stack in the dock in a fixed order, each with a header: title, ▁ fold, ⇱ window, × off. The dock takes room only
//      while a frame is open. A blocked popup leaves the pane in its frame. A reload pings its windows: one that answers
//      stays a window, else the pane comes back in its frame.
// the Flow tree is SVG (proto_flowtree_svg.js, 10-17); ?tree=canvas on the page or the pane window keeps the canvas pane
const TREE_CANVAS = (() => { try { return new URLSearchParams(location.search).get('tree') === 'canvas'; } catch { return false; } })();
export const PANES = {
  guide: { title: 'Symbols', module: 'proto_symguide.js' },
  tree: { title: 'Flow tree', module: TREE_CANVAS ? 'proto_flowtree.js' : 'proto_flowtree_svg.js' },
  sign: { title: 'Sign', module: 'proto_signpane.js', inset: true },
};

const css = `
#pfdock { position: fixed; top: 0; right: 0; bottom: 0; width: min(340px, 86vw); z-index: 52; display: flex; flex-direction: column; background: #0d0e12f8;
  border-left: 1px solid #23252d; box-shadow: -4px 0 18px #0008; font: 12px var(--mono, ui-monospace, monospace); color: #e8e8ee; box-sizing: border-box; }
#pfdock[hidden] { display: none; }
.pfp { display: flex; flex-direction: column; min-height: 0; flex: 1 1 0; border-bottom: 1px solid #23252d; }
.pfp.fold { flex: none; } .pfp.fold .pfp-body { display: none; }
.pfp-h { display: flex; align-items: center; gap: 4px; padding: 4px 6px 4px 10px; background: #14161c; flex: none; }
.pfp-h b { margin-right: auto; letter-spacing: .05em; font-size: 12px; }
.pfp-h button, #pfpanes button { font: 12px var(--mono, monospace); background: none; color: inherit; border: 1px solid #23252d; border-radius: 10px; padding: 1px 8px; cursor: pointer; }
.pfp-h button:hover, #pfpanes button:hover { border-color: #19e0ff; color: #19e0ff; }
.pfp-body { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.pfp-body > * { flex: 1 1 auto; min-height: 0; }
#pfpanes { position: fixed; left: 50%; bottom: 62px; transform: translateX(-50%); z-index: 53; width: min(420px, calc(100vw - 24px)); box-sizing: border-box;
  background: #0d0e12f8; border: 1px solid #23252d; border-radius: 6px; padding: 8px 12px; font: 12px var(--mono, monospace); color: #e8e8ee; }
#pfpanes[hidden] { display: none; } #pfpanes h4 { margin: 2px 0 6px; font-size: 11px; color: #8a8a93; text-transform: uppercase; letter-spacing: .08em; }
#pfpanes .row { display: flex; align-items: center; gap: 6px; margin: 6px 0; flex-wrap: wrap; } #pfpanes .row b { width: 84px; }
#pfpanes button.on { border-color: #19e0ff; color: #19e0ff; background: #19e0ff18; }
@media (min-width: 1100px) { html.pf-docked #pfpanes { left: calc(50% - 170px); } }
@media print { #pfdock, #pfpanes { display: none !important; } }`;

export function createPanes({ lib, bc, button, defaults = {}, init, onUp, onPlace }) {
  if (!document.getElementById('pfpanes-css')) { const st = document.createElement('style'); st.id = 'pfpanes-css'; st.textContent = css; document.head.appendChild(st); }
  const path = location.pathname, ids = Object.keys(PANES);
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('pageflow-panes')) || {}; } catch {}
  const place = {}, inst = {}, frames = {}, mods = {};
  const dock = Object.assign(document.createElement('div'), { id: 'pfdock', hidden: true }); dock.setAttribute('role', 'complementary'); dock.setAttribute('aria-label', 'panes');
  const pop = Object.assign(document.createElement('div'), { id: 'pfpanes', hidden: true }); document.body.append(dock, pop);
  const post = d => { try { bc?.postMessage({ ...d, path }); } catch {} };
  const save = () => { try { localStorage.setItem('pageflow-panes', JSON.stringify(place)); } catch {} };
  const mod = id => mods[id] || (mods[id] = import(lib + PANES[id].module));
  function layout() { const any = ids.some(id => place[id] === 'frame'); dock.hidden = !any; document.documentElement.classList.toggle('pf-docked', any);
    for (const id of ids) if (frames[id]) dock.append(frames[id]);
    button?.classList.toggle('on', ids.some(id => place[id] === 'frame' || place[id] === 'window')); fillPop(); }
  // a div, not a section: pages style their own <section>s
  function frame(id) { const f = document.createElement('div'); f.className = 'pfp'; f.dataset.pane = id;
    f.innerHTML = `<div class="pfp-h"><b>${PANES[id].title}</b><button type="button" data-a="fold" title="fold this frame">▁</button>` +
      `<button type="button" data-a="window" title="move to its own window">⇱</button><button type="button" data-a="off" title="close" aria-label="close ${PANES[id].title}">×</button></div><div class="pfp-body"></div>`;
    f.querySelector('.pfp-h').addEventListener('click', e => { const a = e.target.closest('button')?.dataset.a; if (a === 'fold') f.classList.toggle('fold'); else if (a) set(id, a); });
    return f; }
  function unplace(id) { const was = place[id];
    if (was === 'frame') { inst[id]?.destroy?.(); frames[id]?.remove(); delete frames[id]; delete inst[id]; }
    if (was === 'window') post({ type: 'pane', pane: id, msg: { type: 'close' } }); }
  async function set(id, p) {
    if (!PANES[id]) return; if (p === 'inset' && !PANES[id].inset) p = 'off';
    if (place[id] === p && (p !== 'frame' || frames[id])) return;
    unplace(id); place[id] = p;
    if (p === 'window') { const w = open(lib + 'proto_pane.html?pane=' + id + '&for=' + encodeURIComponent(path) + (TREE_CANVAS ? '&tree=canvas' : ''), 'pfpane_' + id + path.replace(/\W+/g, '_'),
        'popup,width=420,height=' + (id === 'sign' ? 380 : 760));
      if (!w) { place[id] = 'off'; return set(id, 'frame'); } }   // a blocked popup leaves the pane in its frame
    save(); layout(); onPlace?.(id, p);
    if (p === 'frame') { const f = frame(id); frames[id] = f; layout(); const M = await mod(id); if (frames[id] !== f) return;
      inst[id] = M.mountPane(f.querySelector('.pfp-body'), { host: 'frame', send: m => onUp(id, m) }); inst[id].recv(await init(id)); } }
  function send(id, msg) { if (place[id] === 'frame') inst[id]?.recv(msg); else if (place[id] === 'window') post({ type: 'pane', pane: id, msg }); }
  function handle(d) { const id = d.pane; if (!PANES[id]) return;
    if (d.type === 'pane-hello') { if (place[id] !== 'window') { unplace(id); place[id] = 'window'; save(); layout(); onPlace?.(id, 'window'); }
      Promise.resolve(init(id)).then(m => post({ type: 'pane', pane: id, msg: m })); }
    else if (d.type === 'pane-up') onUp(id, d.msg);
    else if (d.type === 'pane-dock') set(id, 'frame');
    else if (d.type === 'pane-bye' && place[id] === 'window') { place[id] = 'off'; save(); layout(); onPlace?.(id, 'off'); } }
  function fillPop() { pop.innerHTML = '<h4>Panes: where each one lives</h4>';
    for (const id of ids) { const r = document.createElement('div'); r.className = 'row'; r.dataset.pane = id; r.innerHTML = `<b>${PANES[id].title}</b>`;
      for (const p of [...(PANES[id].inset ? ['inset'] : []), 'frame', 'window', 'off']) { const b = document.createElement('button'); b.type = 'button'; b.textContent = p; b.dataset.p = p;
        b.classList.toggle('on', (place[id] || 'off') === p); b.addEventListener('click', () => set(id, p)); r.append(b); }
      pop.append(r); } }
  button?.addEventListener('click', () => { fillPop(); pop.hidden = !pop.hidden; });
  for (const id of ids) { const p = saved[id] || defaults[id] || 'off';
    if (p === 'window') { place[id] = 'off'; post({ type: 'pane-ping', pane: id }); setTimeout(() => { if (place[id] !== 'window') set(id, 'frame'); }, 800); }
    else set(id, p); }
  return { set, place: id => place[id] || 'off', send, handle, inst: id => inst[id], dock, pop };
}
