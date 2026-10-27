// proto_symguide.js — the page symbol guide (fable 2026-10-13). proto: the good name stays free.
// Doug 10-13: "There should be a page symbol guide, think self focusing dictionary that can run along side or detach."
//
// SPEC (goal targets; tests in aicolab/tmp/brotoid_fable/guidetest.mjs):
//   G1 one dictionary of everything a reader meets on the page: the page's WORDS (its glossary terms, with their colour, their
//      own small glyph and a "show me"), its COLOURS (every swatch in a .key on the page, read from the page, never retyped)
//      and the GLYPH SYMBOLS (shape, colour, fill, the marks between glyphs, NOT, the sentence types), each drawn by the
//      glyph grammar itself. A sample that does not parse shows the grammar's error in red, never a blank.
//   G2 self-focusing: a "Now" strip at the top holds the entries for what is in play (the caption's words, the sign's
//      symbols; with nothing playing, the colours of the figure in view). Hovering a word on the page lights its entry and
//      scrolls the dictionary to it. A reader scrolling the guide pauses the follow; "follow" resumes it.
//   G3 alongside or detached: a pane of the pane manager (proto_panes.js), in a frame beside the page or its own window.
//      mountPane(root, { send }) -> { recv }: recv { type: 'data', entries, focus } | 'focus' | 'hover'; "show me" sends
//      { type: 'show', term }. The manager owns where it lives (frame header: fold, window, close).
//   G4 the big view (Doug 10-18: "When I mouse over the Symbols tab, can you add a large symbol view popup"): a mouse resting
//      on an entry (list or Now strip) for 200 ms opens one large card beside the pane: the picture drawn large by the same
//      grammar (or the swatch), the name, the plain words, the glyph source. It never takes the pointer; it follows the hovered
//      entry, and closes on leaving the rows, scrolling (the next move reopens it), or Escape. Mouse only: touch keeps the rows as they are.
//   Entries are plain data { key, group, name, plain, glyph?, swatch?, term? } so they cross the channel unchanged.
import { svg, TYPES } from './glyph_grammar.js';

// the glyph grammar in plain words; the picture beside each one is the grammar's own drawing of the sample
const G = (key, group, name, plain, glyph) => ({ key: 'g:' + key, group, name, plain, glyph });
export const SYMBOLS = [
  G('o', 'Glyph: shape', 'circle  o', 'an idea, a claim', 'o(an idea)'),
  G('s', 'Glyph: shape', 'square  s', 'a device: a thing built', 's(a device)'),
  G('t', 'Glyph: shape', 'triangle  t', 'an instrument: it measures, aimed at what it reads', 't(an instrument)'),
  G('u', 'Glyph: shape', 'dice spots  i j k', 'a unit: i one spot, j two, k three', 'j'),
  G('h', 'Glyph: shape', 'empty socket  ?( )', 'a hole: a word we do not have yet', '?(missing word)'),
  G('.b', 'Glyph: colour', 'orange  .b', 'Bristorian algebra (the glyph\'s colour is its algebra, not the page\'s key)', 'o.b(x)'),
  G('.q', 'Glyph: colour', 'cyan  .q', 'quaternion algebra', 'o.q(x)'),
  G('posed', 'Glyph: fill', 'dashed  :posed', 'posed: said, not yet weighed', 'o:posed(x)'),
  G('load', 'Glyph: fill', 'half  :load', 'under load: being weighed', 'o:load(x)'),
  G('holds', 'Glyph: fill', 'solid  :holds', 'holds: weighed and it stood', 'o:holds(x)'),
  G('folds', 'Glyph: fill', 'struck  :folds', 'folds: weighed and it fell', 'o:folds(x)'),
  G('cnt', 'Glyph: fill', 'dotted grey  :cnt', 'could not tell: the instrument gave no answer', 'o:cnt(x)'),
  G('#', 'Glyph: name', 'tag  #name', 'names the thing, so one thing can be shown many ways', 'o.b#hand(hand)'),
  G('>', 'Glyph: between', 'acts on  >', 'left acts on right; order matters, the result lands on the right', 'o(A) > o(B)'),
  G('=', 'Glyph: between', 'equals  =', 'the chain on the left comes out as the thing on the right', 'o(A) > o(B) = o(C)'),
  G(':.', 'Glyph: between', 'therefore  :.', 'so this follows', 'o(A) :. o(B)'),
  G('@', 'Glyph: between', 'inside  @', 'the left sits inside the right (its scope)', 'o(A) @ o(B)'),
  G('join', 'Glyph: between', 'join', 'touching: contact within tolerance', 'o(A) join o(B)'),
  G('seam', 'Glyph: between', 'seam', 'overlapping', 'o(A) seam o(B)'),
  G('spread', 'Glyph: between', 'spread', 'apart: a space between', 'o(A) spread o(B)'),
  G('gap', 'Glyph: between', 'gap', 'an odd vs even break', 'o(A) gap o(B)'),
  G('along', 'Glyph: between', 'along', 'parallel: they agree', 'o(A) along o(B)'),
  G('normal', 'Glyph: between', 'normal', 'at right angles', 'o(A) normal o(B)'),
  G('<>', 'Glyph: between', 'against  <>', 'a control facing what it checks', 't(control) <> o(subject)'),
  G('~>', 'Glyph: between', 'through  ~>', 'carried across a change: a trail', 'o(A) ~> o(B)'),
  G('not', 'Glyph: NOT', 'not  ![ … ]!', 'NOT, with both ends; a NOT that lost an end reads could not tell', '![o(x)]!'),
  ...Object.entries(TYPES).map(([k, v]) => G('type:' + k, 'Glyph: sentence', k + ':', v, k + ': o(x)')),
];

// which glyph symbols a sentence uses (for focus only: the grammar's parse() stays the reader)
export function symbolsIn(src) {
  const s = String(src || ''), K = new Set(), bare = s.replace(/\([^)]*\)/g, '()');
  const ty = s.match(/^\s*(\w+):\s/); if (ty && TYPES[ty[1]]) K.add('g:type:' + ty[1]);
  for (const m of bare.matchAll(/(?:^|[\s[!])([ost])(?=[.:#=*(])/g)) K.add('g:' + m[1]);
  if (/(?:^|\s)[+\-−]?(?:i|j|k|e\d+)(?=[\s.:]|$)/.test(bare)) K.add('g:u'); if (/\?\(|(?:^|\s)\?(?:\s|$)/.test(bare)) K.add('g:h');
  if (/[ost]\.b\b/.test(bare)) K.add('g:.b'); if (/[ost]\.q\b/.test(bare)) K.add('g:.q');
  for (const m of bare.matchAll(/:(posed|load|holds|folds|cnt)\b/g)) K.add('g:' + m[1]);
  if (/#\w/.test(bare)) K.add('g:#'); if (/!\[/.test(bare)) K.add('g:not');
  if (/\s[>·*]\s/.test(bare)) K.add('g:>'); if (/\s=\s/.test(bare)) K.add('g:='); if (/:\.|∴/.test(bare)) K.add('g::.');
  if (/\s@\s/.test(bare)) K.add('g:@'); if (/\s<>\s/.test(bare)) K.add('g:<>'); if (/\s~>\s/.test(bare)) K.add('g:~>');
  for (const m of bare.matchAll(/\s(join|seam|spread|gap|along|normal)\s/g)) K.add('g:' + m[1]);
  return [...K];
}

const css = `
.sg { box-sizing: border-box; display: flex; flex-direction: column; background: #0d0e12f8; color: #e8e8ee; font: 13px/1.45 var(--mono, ui-monospace, monospace); }
.sg * { box-sizing: border-box; }
.sg-head { display: flex; align-items: center; gap: 6px; padding: 8px 10px; border-bottom: 1px solid #23252d; flex: none; }
.sg-head .sg-hint { margin-right: auto; color: #8a8a93; font-size: 11px; }
.sg button { font: 12px var(--mono, monospace); background: none; color: inherit; border: 1px solid #23252d; border-radius: 12px; padding: 3px 9px; cursor: pointer; }
.sg button:hover { border-color: #19e0ff; color: #19e0ff; } .sg .fol.on { border-color: #19e0ff88; color: #19e0ff; }
.sg-find { margin: 8px 10px 0; padding: 5px 8px; background: #14161c; color: inherit; border: 1px solid #23252d; border-radius: 4px; font: inherit; flex: none; }
.sg-why { padding: 6px 10px 0; color: #8a8a93; font-size: 11px; flex: none; min-height: 1.5em; }
.sg-now { flex: none; max-height: 38%; overflow: auto; margin: 4px 6px 0; padding: 2px 4px 6px; border: 1px solid #19e0ff55; border-radius: 6px; background: #0b1a1f; }
.sg-now:empty::after { content: 'nothing in play: hover a word, or play the page'; display: block; padding: 8px 4px; color: #8a8a93; font-size: 12px; }
.sg-list { flex: 1 1 auto; overflow: auto; padding: 0 6px 80px; }
.sg h5 { margin: 12px 4px 4px; font: 600 11px var(--mono, monospace); color: #8a8a93; text-transform: uppercase; letter-spacing: .08em; }
.sg-row { display: grid; grid-template-columns: 74px 1fr; gap: 2px 8px; align-items: center; padding: 5px 4px; border-radius: 4px; border: 1px solid transparent; }
.sg-row .pic { grid-row: span 2; display: flex; align-items: center; justify-content: center; min-height: 30px; }
.sg-row .pic svg { max-width: 74px; max-height: 40px; width: auto; height: auto; }
.sg-row .sw { width: 22px; height: 22px; border-radius: 4px; border: 1px solid #ffffff33; }
.sg-row .nm { font-weight: 600; } .sg-row .pl { color: #b9bdc9; font-size: 12px; }
.sg-row .show { justify-self: start; grid-column: 2; margin-top: 2px; }
.sg-row.now { border-color: #19e0ff88; background: #19e0ff12; } .sg-row.hov { border-color: #ffe14d; background: #ffe14d14; }
.sg-row .err { color: #ff5470; font-size: 11px; }
.sg-row[hidden] { display: none; }
.sg-big { position: fixed; z-index: 70; width: 420px; max-width: calc(100vw - 16px); box-sizing: border-box; padding: 14px 16px 12px; pointer-events: none;
  background: #0d0e12fa; color: #e8e8ee; border: 1px solid #19e0ff88; border-radius: 8px; box-shadow: 0 8px 28px #000c; font: 13px/1.45 var(--mono, ui-monospace, monospace); }
.sg-big[hidden] { display: none; }
.sg-big .bp { display: flex; align-items: center; justify-content: center; min-height: 150px; padding: 6px 0; }
.sg-big .bp svg { height: 170px; width: auto; max-width: 100%; }   /* tight glyphs come at their natural size: the viewBox scales them up */
.sg-big .bp .sw { width: 128px; height: 128px; border-radius: 12px; border: 1px solid #ffffff33; }
.sg-big .bp .err { color: #ff5470; }
.sg-big .nm { font-weight: 600; font-size: 17px; margin-top: 8px; } .sg-big .gp { color: #8a8a93; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
.sg-big .pl { color: #c9ccd6; margin-top: 4px; } .sg-big code { display: block; margin-top: 8px; color: #8a8a93; font-size: 12px; word-break: break-all; }`;

const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function pic(e, height = 40) {
  if (e.swatch) return `<span class="sw" style="background:${esc(e.swatch)}"></span>`;
  if (!e.glyph) return '';
  try { return svg(e.glyph, { height, tight: true }); } catch (err) { return `<span class="err" title="${esc(err.message || err)}">does not parse</span>`; }
}

// mount the guide into root. opts: { entries, onShow(term) }
export function mountGuide(root, opts = {}) {
  if (!document.getElementById('sg-css')) { const st = document.createElement('style'); st.id = 'sg-css'; st.textContent = css; document.head.appendChild(st); }
  root.classList.add('sg');
  root.innerHTML = `<div class="sg-head"><span class="sg-hint">a dictionary that follows what is in play</span><button class="fol on" type="button" title="the guide follows what is in play">follow</button></div>` +
    `<input class="sg-find" type="search" placeholder="find a word or symbol" aria-label="find a word or symbol">` +
    `<div class="sg-why"></div><div class="sg-now" aria-label="in play now"></div><div class="sg-list"></div>`;
  const $ = s => root.querySelector(s), list = $('.sg-list'), now = $('.sg-now'), why = $('.sg-why'), fol = $('.fol');
  let E = [], follow = true, pausedAt = 0, nowKeys = [], hovKeys = [];
  const row = e => { const r = document.createElement('div'); r.className = 'sg-row'; r.dataset.key = e.key;
    r.innerHTML = `<span class="pic">${pic(e)}</span><span class="nm"${e.color ? ` style="color:${esc(e.color)}"` : ''}>${esc(e.name)}</span><span class="pl">${esc(e.plain || '')}</span>` +
      (e.term ? `<button class="show" type="button" data-term="${esc(e.term)}">show me ▸</button>` : '');
    return r; };
  function setEntries(entries) { E = entries || []; list.innerHTML = ''; let g = null;
    for (const e of E) { if (e.group !== g) { g = e.group; const h = document.createElement('h5'); h.textContent = g; list.append(h); } list.append(row(e)); }
    applyFind(); paint(); }
  function applyFind() { const q = $('.sg-find').value.trim().toLowerCase();
    list.querySelectorAll('.sg-row').forEach(r => { const e = E.find(e => e.key === r.dataset.key); r.hidden = !!q && !(e.name + ' ' + (e.plain || '') + ' ' + (e.alias || '')).toLowerCase().includes(q); });
    list.querySelectorAll('h5').forEach(h => { let n = h.nextElementSibling, any = false; while (n && n.tagName !== 'H5') { if (!n.hidden) any = true; n = n.nextElementSibling; } h.hidden = !any; }); }
  function paint() {
    list.querySelectorAll('.sg-row').forEach(r => { r.classList.toggle('now', nowKeys.includes(r.dataset.key)); r.classList.toggle('hov', hovKeys.includes(r.dataset.key)); });
    now.innerHTML = ''; for (const k of nowKeys) { const e = E.find(e => e.key === k); if (e) { const r = row(e); r.classList.add('now'); now.append(r); } }
  }
  const following = () => follow && Date.now() - pausedAt > 8000;
  function scrollTo(k) { const r = list.querySelector(`.sg-row[data-key="${CSS.escape(k)}"]:not([hidden])`); if (!r || !following()) return;
    list.scrollTo({ top: r.offsetTop - list.offsetTop - 48, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  function focus(keys, reason = '') { nowKeys = [...new Set(keys || [])]; why.textContent = reason ? 'now: ' + reason : ''; paint(); }
  function hover(keys) { hovKeys = [...new Set(keys || [])]; paint(); if (hovKeys[0]) scrollTo(hovKeys[0]); }
  // a reader scrolling the guide pauses the follow (it resumes after 8 s, or at once on "follow")
  for (const t of ['wheel', 'touchmove']) list.addEventListener(t, e => { if (e.isTrusted) { pausedAt = Date.now(); fol.textContent = 'follow (paused)'; setTimeout(() => { if (following()) fol.textContent = 'follow'; }, 8100); } }, { passive: true });
  fol.addEventListener('click', () => { if (Date.now() - pausedAt < 8000) { pausedAt = 0; follow = true; } else follow = !follow; fol.classList.toggle('on', follow); fol.textContent = follow ? 'follow' : 'follow (off)'; });
  $('.sg-find').addEventListener('input', applyFind);
  // G4 the big view: one card, beside the pane, for the entry under a resting mouse
  const big = Object.assign(document.createElement('div'), { className: 'sg-big', hidden: true }); big.setAttribute('role', 'tooltip'); document.body.append(big);
  let bigKey = null, bigT = 0;
  function bigShow(r) { const e = E.find(e => e.key === r.dataset.key); if (!e || !root.isConnected) return bigHide();
    if (bigKey !== e.key) { bigKey = e.key;
      big.innerHTML = `<div class="gp">${esc(e.group || '')}</div><div class="bp">${pic(e, 150) || ''}</div><div class="nm"${e.color ? ` style="color:${esc(e.color)}"` : ''}>${esc(e.name)}</div>` +
        `<div class="pl">${esc(e.plain || '')}</div>` + (e.glyph ? `<code>${esc(e.glyph)}</code>` : e.swatch ? `<code>${esc(e.swatch)}</code>` : '');
      big.querySelector('.bp').hidden = !big.querySelector('.bp').innerHTML; }
    big.hidden = false; const R = r.getBoundingClientRect(), W = big.offsetWidth, H = big.offsetHeight, m = 8;
    let x = R.left - W - 10; if (x < m) x = R.right + 10; if (x + W > innerWidth - m) x = Math.max(m, Math.min(innerWidth - W - m, R.left));
    let y = R.top + R.height / 2 - H / 2; if (x === R.left || (x < R.right && x + W > R.left)) y = R.bottom + 6 + H < innerHeight ? R.bottom + 6 : R.top - H - 6;
    big.style.left = Math.round(x) + 'px'; big.style.top = Math.round(Math.max(m, Math.min(innerHeight - H - m, y))) + 'px'; }
  function bigHide() { clearTimeout(bigT); big.hidden = true; bigKey = null; }
  // pointermove, not pointerover: after a scroll the pointer can sit on a new row without entering a new element
  root.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const r = e.target.closest('.sg-row');
    if (!r) return bigHide(); if (!big.hidden && r.dataset.key === bigKey) return;
    clearTimeout(bigT); bigT = setTimeout(() => bigShow(r), big.hidden ? 200 : 0); });
  root.addEventListener('pointerleave', bigHide);
  for (const el of [list, now]) el.addEventListener('scroll', bigHide, { passive: true });
  addEventListener('keydown', e => { if (e.key === 'Escape') bigHide(); });
  root.addEventListener('click', e => { const b = e.target.closest('button.show'); if (b) opts.onShow?.(b.dataset.term); });
  setEntries(opts.entries);
  return { el: root, focus, hover, setEntries, destroy: () => { bigHide(); big.remove(); }, state: () => ({ follow: following(), now: nowKeys, hov: hovKeys }) };
}

// the guide as a pane (proto_panes.js P3)
export function mountPane(root, { send }) {
  const g = mountGuide(root, { entries: [], onShow: term => send({ type: 'show', term }) });
  return { destroy: g.destroy, recv(m) { if (!m) return;
    if (m.type === 'data') { g.setEntries(m.entries); if (m.focus) g.focus(m.focus.keys, m.focus.why); }
    else if (m.type === 'focus') g.focus(m.keys, m.why); else if (m.type === 'hover') g.hover(m.keys); }, guide: g };
}
