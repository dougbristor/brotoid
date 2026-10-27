// SPDX-License-Identifier: MIT  (c) 2026 Doug Bristor, bristorbrot.org — attribution requested, not required
// codetree:dock_panel/v1 — a page's control panel either DOCKED beside the stage (side by side, each scrolling on its own,
// so the image never scrolls away under a long panel) or DETACHED as a floating box over a full-window stage (catchfield's
// layout): draggable by its bar, collapsible to the bar, kept on screen. The choice and the float position persist per page.
//
// Doug, 2026-10-05: "the image and UI must be SBS or detached. detach/dock UI should be in codeT now."
//
// Use:
//   import { mountDock } from '/codetree/blocks/dock_panel/v1.js';
//   mountDock({ root: document.querySelector('main'), panel: document.querySelector('aside'),
//               stage: document.querySelector('.stage'), title: 'Controls', key: 'my-page' });
// The page keeps its own look. The block sets body classes dk-docked / dk-detached (and dk-collapsed) for page CSS, e.g.
//   body.dk-detached canvas { height: calc(100vh - 150px) }
// Keys (ignored while typing in a field): \ toggles dock / detach, ` collapses the panel.
// Below 700 px wide the panel always docks, stacked under the stage.

// ---- pure core (conform.mjs tests these) ---------------------------------------------------------------------------
export const MODES = ['docked', 'detached'];
export const DEFAULTS = { mode: 'docked', x: 16, y: 72, collapsed: false };
// Keep a floating panel of size (w, h) inside the viewport (vw, vh), leaving at least `grip` px of its bar reachable.
export function clampFloat({ x, y }, { w, h }, { vw, vh }, grip = 48) {
  const maxX = Math.max(0, vw - Math.min(w, grip * 3)), maxY = Math.max(0, vh - grip);
  return { x: Math.min(Math.max(x, Math.min(0, vw - w)), maxX), y: Math.min(Math.max(y, 0), maxY) };
}
export function parseState(text) {
  let s = {}; try { s = JSON.parse(text ?? '{}') ?? {}; } catch { s = {}; }
  const out = { ...DEFAULTS };
  if (MODES.includes(s.mode)) out.mode = s.mode;
  if (Number.isFinite(s.x)) out.x = s.x; if (Number.isFinite(s.y)) out.y = s.y;
  out.collapsed = s.collapsed === true;
  return out;
}
export const nextMode = m => (m === 'docked' ? 'detached' : 'docked');

// ---- DOM wiring --------------------------------------------------------------------------------------------------
const CSS = `
body.dk-docked{overflow:hidden}
body.dk-docked [data-dk-root]{display:grid;grid-template-columns:var(--dk-w,330px) minmax(0,1fr);height:calc(100vh - var(--dk-top,0px));min-height:0}
body.dk-docked [data-dk-panel]{overflow:auto;min-height:0;overscroll-behavior:contain}
body.dk-docked [data-dk-stage]{overflow:auto;min-height:0;min-width:0}
body.dk-detached{overflow:hidden}
body.dk-detached [data-dk-root]{display:block;height:calc(100vh - var(--dk-top,0px));position:relative}
body.dk-detached [data-dk-stage]{height:100%;overflow:auto}
body.dk-detached [data-dk-panel]{position:fixed;z-index:40;width:var(--dk-w,330px);max-height:calc(100vh - var(--dk-y,72px) - 12px);overflow:auto;
  left:var(--dk-x,16px);top:var(--dk-y,72px);border:1px solid #ffffff22;border-radius:10px;box-shadow:0 10px 40px #0009;
  background:var(--dk-bg,#101a1b);overscroll-behavior:contain}
body.dk-collapsed [data-dk-panel] > :not(.dk-bar){display:none!important}
body.dk-detached.dk-collapsed [data-dk-panel]{max-height:none;overflow:visible}
.dk-bar{position:sticky;top:0;z-index:2;display:flex;gap:6px;align-items:center;margin:-6px -6px 10px;padding:6px;border-radius:7px;
  background:color-mix(in srgb,var(--dk-bg,#101a1b) 94%,transparent);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8eaaa0;user-select:none}
body.dk-detached .dk-bar{cursor:grab}body.dk-detached .dk-bar:active{cursor:grabbing}
.dk-bar .dk-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dk-bar button{font:inherit;font-size:11px;letter-spacing:0;text-transform:none;padding:3px 7px;cursor:pointer;color:#d2e8dc;background:#162728;border:1px solid #3b5651;border-radius:5px}
@media(max-width:700px){body.dk-docked,body.dk-detached{overflow:auto}
  body.dk-docked [data-dk-root],body.dk-detached [data-dk-root]{display:flex;flex-direction:column;height:auto}
  body.dk-detached [data-dk-panel]{position:static;width:auto;max-height:none;box-shadow:none;border-radius:0}
  [data-dk-stage]{order:-1;height:auto!important;overflow:visible!important}[data-dk-panel]{overflow:visible!important}.dk-bar .dk-toggle{display:none}}
`;

export function mountDock({ root, panel, stage, title = 'Controls', key = location.pathname, width = 330, bg = null, onChange = () => {} }) {
  if (!document.getElementById('dk-style')) { const s = document.createElement('style'); s.id = 'dk-style'; s.textContent = CSS; document.head.appendChild(s); }
  root.setAttribute('data-dk-root', ''); panel.setAttribute('data-dk-panel', ''); stage.setAttribute('data-dk-stage', '');
  const store = 'dock_panel:' + key;
  let state; try { state = parseState(localStorage.getItem(store)); } catch { state = { ...DEFAULTS }; }
  const top = Math.round(root.getBoundingClientRect().top + window.scrollY);
  document.documentElement.style.setProperty('--dk-top', top + 'px');
  document.documentElement.style.setProperty('--dk-w', width + 'px');
  if (bg) document.documentElement.style.setProperty('--dk-bg', bg);
  const bar = document.createElement('div'); bar.className = 'dk-bar';
  bar.innerHTML = `<span class="dk-title"></span><button type="button" class="dk-collapse"></button><button type="button" class="dk-toggle"></button>`;
  bar.querySelector('.dk-title').textContent = title; panel.prepend(bar);
  const collapseBtn = bar.querySelector('.dk-collapse'), toggleBtn = bar.querySelector('.dk-toggle');
  const save = () => { try { localStorage.setItem(store, JSON.stringify(state)); } catch { } };
  function place() {
    // The bar sits inside the panel's padding, so the grip is measured to the bar's bottom, not the panel's top (found 10-05
    // by dock_check: dragged to the corner, only 21 px of the bar stayed on screen).
    // Not bar.offsetTop: the bar is sticky, so in a scrolled panel offsetTop includes the scroll (1,691 px in the same check,
    // which pinned the panel to the top). The panel's own top padding is where the bar sits when unscrolled.
    const r = panel.getBoundingClientRect(), barBottom = (parseFloat(getComputedStyle(panel).paddingTop) || 0) + bar.offsetHeight;
    const p = clampFloat(state, { w: r.width || width, h: r.height || 200 }, { vw: innerWidth, vh: innerHeight }, Math.max(48, barBottom + 12));
    state.x = p.x; state.y = p.y;
    document.documentElement.style.setProperty('--dk-x', p.x + 'px'); document.documentElement.style.setProperty('--dk-y', p.y + 'px');
  }
  function apply() {
    document.body.classList.toggle('dk-docked', state.mode === 'docked'); document.body.classList.toggle('dk-detached', state.mode === 'detached');
    document.body.classList.toggle('dk-collapsed', state.collapsed);
    toggleBtn.textContent = state.mode === 'docked' ? '⇱ detach' : '⇲ dock'; toggleBtn.title = (state.mode === 'docked' ? 'Float the panel over a full-window image' : 'Dock the panel beside the image') + ' (\\)';
    collapseBtn.textContent = state.collapsed ? '▸' : '▾'; collapseBtn.title = (state.collapsed ? 'Show' : 'Fold') + ' the panel (`)';
    if (state.mode === 'detached') place();
    save(); onChange({ ...state }); window.dispatchEvent(new Event('resize'));
  }
  const api = {
    get state() { return { ...state }; },
    setMode(m) { if (MODES.includes(m)) { state.mode = m; apply(); } },
    toggle() { state.mode = nextMode(state.mode); apply(); },
    collapse(on = !state.collapsed) { state.collapsed = !!on; apply(); },
    moveTo(x, y) { state.x = x; state.y = y; apply(); },
  };
  toggleBtn.onclick = e => { e.stopPropagation(); api.toggle(); };
  collapseBtn.onclick = e => { e.stopPropagation(); api.collapse(); };
  let drag = null;
  bar.addEventListener('pointerdown', e => { if (state.mode !== 'detached' || e.target.closest('button')) return; drag = { x: e.clientX - state.x, y: e.clientY - state.y }; bar.setPointerCapture(e.pointerId); });
  bar.addEventListener('pointermove', e => { if (!drag) return; state.x = e.clientX - drag.x; state.y = e.clientY - drag.y; place(); });
  const end = () => { if (drag) { drag = null; save(); } }; bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
  window.addEventListener('resize', () => { if (state.mode === 'detached') place(); });
  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input,select,textarea,[contenteditable]')) return;
    if (e.key === '\\') { e.preventDefault(); api.toggle(); } else if (e.key === '`') { e.preventDefault(); api.collapse(); }
  });
  apply();
  return api;
}
