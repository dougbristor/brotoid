// SPDX-License-Identifier: MIT  (c) 2026 Doug Bristor, bristorbrot.org — attribution requested, not required
// codetree:dock_panel/v2 — a page's control panel in one of THREE places, switchable live, owned by one atom (the Brotoscope rule: one controller):
//   docked    beside the stage, each scrolling on its own, so the image never scrolls away under a long panel;
//   detached  a floating box over a full-window stage (catchfield's layout): dragged by its bar, folded to the bar, kept on screen;
//   window    in a browser window of its own (a second screen): the same elements, listeners and state, moved there live (adoptNode).
//             The stage takes the freed width. Closing that window brings the panel back to where it was; leaving the page closes it.
//
// Doug, 2026-10-05: "the image and UI must be SBS or detached. detach/dock UI should be in codeT now." (v1, insights)
// Doug, 2026-10-24: "add the undock to the controller so that it could work from a separate window … should be an atom for that" (fable's
// lib/undock.js); insights 10-24: one atom should own all three places, so v2 = v1 + 'window'. v1 stays as it is for its signers.
//
// Use:
//   import { mountDock } from '/codetree/blocks/dock_panel/v2.js';
//   const dock = mountDock({ root: document.querySelector('main'), panel: document.querySelector('aside'),
//                            stage: document.querySelector('.stage'), title: 'Controls', key: 'my-page' });
//   const { $, $$, $1 } = dock.lookup;   // find the panel's controls in whichever document holds them (see the contract)
// The page keeps its own look. The block sets body classes dk-docked / dk-detached / dk-window (and dk-collapsed) for page CSS, e.g.
//   body.dk-detached canvas, body.dk-window canvas { height: calc(100vh - 150px) }
// Keys (ignored while typing in a field), on the page and in the panel's window: \ toggles dock / detach (from the window: back to the page),
// ` folds the panel. Below 700 px the panel always docks, stacked under the stage, and there is no window button.
// onChange(state) runs on every change, synchronously, except the mount's first call, which waits one microtask: page state declared below
// the mountDock call (let / const) is not yet initialised during the mount, and a TDZ ReferenceError would abort it (fable 10-25).
//
// CONTRACT — the cross-document lookup. In 'window' the panel's elements live in ANOTHER document, so:
//   - document.getElementById / document.querySelector(All) from the page do NOT find them. Find them with dock.lookup's $ (by id), $1 (one by
//     selector) and $$ (all by selector): each tries the page, then the panel's window. Or hold them by reference (panel.querySelector), taken
//     once at mount: a reference stays good across moves.
//   - Elements the panel adds later (an overlay, a popover) go into el.ownerDocument, not the page's document.
//   - `x instanceof HTMLInputElement` is false across windows (another realm): test x.tagName / x.type instead.
//   - Listeners on the page's window (keydown, resize) do not see events in the panel's window: the block forwards its own keys; a page that
//     needs more uses dock.win (null unless in 'window').
//   - In the window the panel is a direct child of a bare <body class="dk-win {winBodyClass}">: page CSS that styles the panel through an html/body
//     class or an ancestor (html.scope .panel, main .panel) stops matching there; pass what it needs as winBodyClass. Only <style> text and
//     stylesheet <link>s are copied, so rules added by insertRule or adoptedStyleSheets do not reach the window.

// ---- pure core (conform.mjs tests these) ---------------------------------------------------------------------------
export const MODES = ['docked', 'detached', 'window'];
export const PAGE_MODES = ['docked', 'detached'];   // the two places on the page; 'window' always returns to one of them (`back`)
export const DEFAULTS = { mode: 'docked', back: 'docked', x: 16, y: 72, collapsed: false, ww: null, wh: null, wx: null, wy: null };
// Keep a floating panel of size (w, h) inside the viewport (vw, vh), leaving at least `grip` px of its bar reachable.
export function clampFloat({ x, y }, { w, h }, { vw, vh }, grip = 48) {
  const maxX = Math.max(0, vw - Math.min(w, grip * 3)), maxY = Math.max(0, vh - grip);
  return { x: Math.min(Math.max(x, Math.min(0, vw - w)), maxX), y: Math.min(Math.max(y, 0), maxY) };
}
export function parseState(text) {
  let s = {}; try { s = JSON.parse(text ?? '{}') ?? {}; } catch { s = {}; }
  const out = { ...DEFAULTS };
  if (MODES.includes(s.mode)) out.mode = s.mode;
  if (PAGE_MODES.includes(s.back)) out.back = s.back;
  if (Number.isFinite(s.x)) out.x = s.x; if (Number.isFinite(s.y)) out.y = s.y;
  out.collapsed = s.collapsed === true;
  for (const k of ['ww', 'wh']) if (Number.isFinite(s[k]) && s[k] >= 120) out[k] = s[k];
  for (const k of ['wx', 'wy']) if (Number.isFinite(s[k])) out[k] = s[k];
  return out;
}
// The mode a page opens in. A window cannot be opened without the reader's press (popups are blocked), so a page left in 'window' reopens in
// the place the panel came from, and the reader presses ⧉ again.
export const bootMode = s => (s.mode === 'window' ? s.back : s.mode);
// \ : docked <-> detached; from the window, back to the page place it came from
export const nextMode = (m, back = 'docked') => (m === 'window' ? back : m === 'docked' ? 'detached' : 'docked');
// The lookup of the contract: docs() gives the documents to search, in order (the page, then the panel's window if any).
export function lookupIn(docs) {
  const list = () => docs().filter(Boolean);
  return {
    $: id => { for (const d of list()) { const e = d.getElementById(id); if (e) return e; } return null; },
    $1: sel => { for (const d of list()) { const e = d.querySelector(sel); if (e) return e; } return null; },
    $$: sel => list().flatMap(d => [...d.querySelectorAll(sel)]),
  };
}

// ---- DOM wiring --------------------------------------------------------------------------------------------------
// align-items:stretch on the root (both layouts): a root's own align-items carried into the block's grid / column (hatscope's flex-start:
// the docked panel took its full height, foot at 977 px in a 900 px window; on a phone the stacked column shrank to its content; fable 10-25).
const CSS = `
body.dk-docked{overflow:hidden}
body.dk-docked [data-dk-root]{display:grid;grid-template-columns:var(--dk-w,330px) minmax(0,1fr);height:calc(100vh - var(--dk-top,0px));min-height:0;align-items:stretch}
body.dk-docked [data-dk-panel]{overflow:auto;min-height:0;overscroll-behavior:contain}
body.dk-docked [data-dk-stage]{overflow:auto;min-height:0;min-width:0}
body.dk-detached,body.dk-window{overflow:hidden}
body.dk-detached [data-dk-root],body.dk-window [data-dk-root]{display:block;height:calc(100vh - var(--dk-top,0px));position:relative}
body.dk-detached [data-dk-stage],body.dk-window [data-dk-stage]{height:100%;overflow:auto}
body.dk-detached [data-dk-panel]{position:fixed;z-index:40;width:var(--dk-w,330px);max-height:calc(100vh - var(--dk-y,72px) - 12px);overflow:auto;
  left:var(--dk-x,16px);top:var(--dk-y,72px);border:1px solid #ffffff22;border-radius:10px;box-shadow:0 10px 40px #0009;
  background:var(--dk-bg,#101a1b);overscroll-behavior:contain}
body.dk-collapsed [data-dk-panel] > :not(.dk-bar){display:none!important}
body.dk-detached.dk-collapsed [data-dk-panel]{max-height:none;overflow:visible}
body.dk-win{margin:0;background:var(--dk-bg,#101a1b);overflow:auto}
body.dk-win [data-dk-panel]{position:static;width:auto;max-height:none;overflow:visible;margin:0;border:0;border-radius:0;box-shadow:none;min-height:100vh;box-sizing:border-box}
.dk-bar{position:sticky;top:0;z-index:2;display:flex;gap:6px;align-items:center;margin:-6px -6px 10px;padding:6px;border-radius:7px;
  background:color-mix(in srgb,var(--dk-bg,#101a1b) 94%,transparent);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8eaaa0;user-select:none}
body.dk-detached .dk-bar{cursor:grab}body.dk-detached .dk-bar:active{cursor:grabbing}
.dk-bar .dk-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dk-bar button,.dk-note button{font:inherit;font-size:11px;letter-spacing:0;text-transform:none;padding:3px 7px;cursor:pointer;color:#d2e8dc;background:#162728;border:1px solid #3b5651;border-radius:5px}
body.dk-win .dk-toggle{display:none}
.dk-note{display:none;position:fixed;right:10px;bottom:8px;z-index:60;padding:5px 8px;border-radius:7px;font:11px ui-monospace,Menlo,monospace;color:#8eaaa0;
  background:color-mix(in srgb,var(--dk-bg,#101a1b) 94%,transparent);border:1px solid #ffffff22;white-space:nowrap}
body.dk-window .dk-note{display:block}
@media(max-width:700px){body.dk-docked,body.dk-detached{overflow:auto}
  body.dk-docked [data-dk-root],body.dk-detached [data-dk-root]{display:flex;flex-direction:column;height:auto;align-items:stretch}
  body.dk-detached [data-dk-panel]{position:static;width:auto;max-height:none;box-shadow:none;border-radius:0}
  [data-dk-stage]{order:-1;height:auto!important;overflow:visible!important}[data-dk-panel]{overflow:visible!important}.dk-bar .dk-toggle,.dk-bar .dk-undock{display:none}
  body.dk-win .dk-bar .dk-undock{display:inline-block}}
`;

// width is the DOCKED column; winW / winH are the window's first size (later ones are remembered). undock.js's width / height were the window's.
export function mountDock({ root, panel, stage, title = 'Controls', key = location.pathname, width = 330, winW = 380, winH = 900, bg = null, noteIn = null, winBodyClass = '', onChange = () => {} }) {
  const D0 = root.ownerDocument, W0 = D0.defaultView;
  if (!D0.getElementById('dk-style')) { const s = D0.createElement('style'); s.id = 'dk-style'; s.textContent = CSS; D0.head.appendChild(s); }
  root.setAttribute('data-dk-root', ''); panel.setAttribute('data-dk-panel', ''); stage.setAttribute('data-dk-stage', '');
  const store = 'dock_panel:' + key;
  let state; try { state = parseState(W0.localStorage.getItem(store)); } catch { state = { ...DEFAULTS }; }
  state.mode = bootMode(state);
  let win = null; const home = D0.createComment('dock_panel: the panel docks here');   // holds the panel's place while it is in its window
  const top = Math.round(root.getBoundingClientRect().top + W0.scrollY), css = D0.documentElement.style;
  css.setProperty('--dk-top', top + 'px'); css.setProperty('--dk-w', width + 'px'); if (bg) css.setProperty('--dk-bg', bg);
  const bar = D0.createElement('div'); bar.className = 'dk-bar';
  bar.innerHTML = `<span class="dk-title"></span><button type="button" class="dk-collapse"></button><button type="button" class="dk-toggle"></button><button type="button" class="dk-undock"></button>`;
  bar.querySelector('.dk-title').textContent = title; panel.prepend(bar);
  const collapseBtn = bar.querySelector('.dk-collapse'), toggleBtn = bar.querySelector('.dk-toggle'), undockBtn = bar.querySelector('.dk-undock');
  // the note that says where the panel went: in noteIn if given, else a chip in the page's corner (it takes no room from the stage)
  const note = D0.createElement('div'); note.className = 'dk-note';
  note.innerHTML = '<span></span> is in its own window · <button type="button">⇲ dock it here</button>'; note.querySelector('span').textContent = title;
  if (noteIn) { note.style.cssText = 'position:static'; noteIn.appendChild(note); } else D0.body.appendChild(note);
  const save = () => { try { W0.localStorage.setItem(store, JSON.stringify(state)); } catch { } };
  // inner size: window.open's width/height are the content's, so saving outer sizes grew the window by its chrome on every reopen (Firefox
  // +41 px a time, insights 10-25; headless Chromium has no chrome and cannot show it). left/top and screenX/Y are both the outer corner.
  const saveWin = w => { try { if (w.innerWidth > 0) Object.assign(state, { ww: w.innerWidth, wh: w.innerHeight, wx: w.screenX, wy: w.screenY }); save(); } catch { } };
  function place() {
    // The bar sits inside the panel's padding, so the grip is measured to the bar's bottom, not the panel's top (found 10-05
    // by dock_check: dragged to the corner, only 21 px of the bar stayed on screen).
    // Not bar.offsetTop: the bar is sticky, so in a scrolled panel offsetTop includes the scroll (1,691 px in the same check,
    // which pinned the panel to the top). The panel's own top padding is where the bar sits when unscrolled.
    const r = panel.getBoundingClientRect(), barBottom = (parseFloat(W0.getComputedStyle(panel).paddingTop) || 0) + bar.offsetHeight;
    const p = clampFloat(state, { w: r.width || width, h: r.height || 200 }, { vw: W0.innerWidth, vh: W0.innerHeight }, Math.max(48, barBottom + 12));
    state.x = p.x; state.y = p.y;
    css.setProperty('--dk-x', p.x + 'px'); css.setProperty('--dk-y', p.y + 'px');
  }
  function apply(mounting = false) {
    const B = D0.body;
    for (const m of MODES) B.classList.toggle('dk-' + m, state.mode === m);
    for (const b of [B, win?.document.body]) b?.classList.toggle('dk-collapsed', state.collapsed);
    toggleBtn.textContent = state.mode === 'docked' ? '⇱ detach' : '⇲ dock'; toggleBtn.title = (state.mode === 'docked' ? 'Float the panel over a full-window image' : 'Dock the panel beside the image') + ' (\\)';
    undockBtn.textContent = win ? '⇲ dock' : '⧉ window'; undockBtn.title = win ? `Put the panel back in the page, ${state.back} (\\)` : 'Move the panel into its own window (a second screen); closing that window docks it';
    collapseBtn.textContent = state.collapsed ? '▸' : '▾'; collapseBtn.title = (state.collapsed ? 'Show' : 'Fold') + ' the panel (`)';
    if (state.mode === 'detached') place();
    save(); if (mounting) queueMicrotask(() => onChange({ ...state })); else onChange({ ...state }); W0.dispatchEvent(new Event('resize'));
  }
  // ---- the window
  function openWin() {
    if (win) return true;
    const w0 = state.ww || winW, h0 = state.wh || winH, x0 = state.wx ?? (W0.screenX + W0.outerWidth - w0), y0 = state.wy ?? W0.screenY;
    const w = W0.open('', store.replace(/\W+/g, '_'), `popup,width=${w0},height=${h0},left=${x0},top=${y0}`);
    if (!w) { undockBtn.textContent = '⧉ popup blocked'; return false; }
    const sheets = [...D0.querySelectorAll('style, link[rel=stylesheet]')].map(e => e.outerHTML).join('\n');
    w.document.open(); w.document.write(`<!doctype html><html><head><meta charset="utf-8"><base href="${D0.baseURI}"><title>${title.replace(/</g, '&lt;')} · ${D0.title.replace(/</g, '&lt;')}</title>${sheets}</head><body class="dk-win ${winBodyClass}"></body></html>`); w.document.close();
    for (const p of ['--dk-bg', '--dk-w']) { const v = css.getPropertyValue(p); if (v) w.document.documentElement.style.setProperty(p, v); }
    panel.parentNode.insertBefore(home, panel); w.document.body.appendChild(w.document.adoptNode(panel)); win = w;
    w.addEventListener('pagehide', () => { if (win === w) { leaveWin(state.back); apply(); } });   // the reader closed the window
    w.addEventListener('beforeunload', () => saveWin(w));
    w.addEventListener('keydown', onKey);
    return true;
  }
  function leaveWin(m) {
    if (!win) return; const w = win; win = null; saveWin(w);
    home.parentNode.insertBefore(D0.adoptNode(panel), home); home.remove(); state.mode = m;
    try { w.close(); } catch { }
  }
  function setMode(m) {
    if (!MODES.includes(m) || m === state.mode) return;
    if (m === 'window') { if (W0.innerWidth <= 700 || !openWin()) return; state.back = state.mode; state.mode = 'window'; }
    else if (state.mode === 'window') leaveWin(m); else state.mode = m;
    apply();
  }
  const api = {
    get state() { return { ...state }; },
    get win() { return win; },
    get doc() { return panel.ownerDocument; },
    lookup: lookupIn(() => [D0, win?.document]),
    setMode,
    toggle() { setMode(nextMode(state.mode, state.back)); },
    undock() { setMode('window'); },
    dock() { if (state.mode === 'window') setMode(state.back); },
    collapse(on = !state.collapsed) { state.collapsed = !!on; apply(); },
    moveTo(x, y) { state.x = x; state.y = y; apply(); },
    bar,
  };
  toggleBtn.onclick = e => { e.stopPropagation(); api.toggle(); };
  undockBtn.onclick = e => { e.stopPropagation(); win ? api.dock() : api.undock(); };
  collapseBtn.onclick = e => { e.stopPropagation(); api.collapse(); };
  note.querySelector('button').onclick = () => api.dock();
  let drag = null;
  bar.addEventListener('pointerdown', e => { if (state.mode !== 'detached' || e.target.closest('button')) return; drag = { x: e.clientX - state.x, y: e.clientY - state.y }; bar.setPointerCapture(e.pointerId); });
  bar.addEventListener('pointermove', e => { if (!drag) return; state.x = e.clientX - drag.x; state.y = e.clientY - drag.y; place(); });
  const end = () => { if (drag) { drag = null; save(); } }; bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
  W0.addEventListener('resize', () => { if (state.mode === 'detached') place(); });
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input,select,textarea,[contenteditable]')) return;
    if (e.key === '\\') { e.preventDefault(); api.toggle(); } else if (e.key === '`') { e.preventDefault(); api.collapse(); }
  }
  W0.addEventListener('keydown', onKey);
  W0.addEventListener('pagehide', () => { try { win?.close(); } catch { } });
  apply(true);
  return api;
}
