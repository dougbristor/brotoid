/**
 * pageflow.js — a page as a media flow, and figures with hooks (fable 2026-10-13, first built for brotoid/).
 * Doug 10-13: "images on page must come with labels and ref hooks, even if is 'figure 3', with EOF references" ... "we could
 * create the whole page as a media flow, i.e. it has a page play btn at bottom, with popup track|content index|listing|#.
 * the footer playbtn can be dismissed to make the page still again but the page will feel that its alive".
 * Doug's picks: the page loads LIVE (figures drift) and the track waits for ▶; a beat LEAVES its figure where it ends.
 *
 * SPEC (goal targets; tests in aicolab/tmp/brotoid_fable/flowtest.mjs):
 *   F1 every <figure class="fig"> gets "Fig N" (page order), its title, a state chip and a copy-ref button; its id is the hook
 *      (#fig-<name>, stable across renumbering). Figs.audit() lists any canvas/svg outside a hooked figure: [] or it fails.
 *   F2 an end-of-file list (the element given as list) has one entry per figure: number, title, what it shows, state now, link.
 *   F3 a live figure's chip says it is one state of many and which state; Figs.refresh() rewrites every chip from its state().
 *   F4 the footer bar: ▶/❚❚, beat n / N, the beat's title, ☰ popup (track · contents · figures, each a # link), × to go still.
 *   F5 ▶ plays the beats in order from the current one: scroll to its target, run it, next. Any trusted input from the reader
 *      (pointer press, wheel, key, touch) pauses at once; the figure stays where the beat left it. ▶ again restarts that beat.
 *   F6 live: the page's ambient(dt) runs every frame while not playing and not still; × stops it and the track, hides the bar,
 *      shows a small "▶ live" pill and calls onStill (the page mounts its nudger there); the pill calls onLive and comes back.
 *   F7 prefers-reduced-motion (or ?flow=still): loads still; if made live, tweens jump to their end (no motion) and ambient never runs.
 *   F8 the media layers ("brotulated", Doug 10-13: "make the subtitles larger, tiktok style ... keep the marque telegram at
 *      bottom as it is unobtrusive, but the larger screen stubs carry formatting and glyphs, think signed language|deaf on
 *      tv. marque stays plain raw text"). Three channels for one beat, all optional per beat:
 *        marquee  the footer line: the beat's title as PLAIN raw text; it scrolls only while playing and overflowing.
 *                 At pause/end it becomes static, with a [press to restart] line that restarts the current term or beat.
 *        stub     a big caption over the page while a beat plays: beat.say (or the title), faint read-ahead with a moving word emphasis, **x** and the
 *                 page's terms (o.terms: word -> colour) formatted. Never blocks the page (pointer-events: none).
 *        sign     the inset: beat.glyph, a glyph_grammar.js sentence, drawn with the grammar's own reading under it. A
 *                 sentence that does not parse shows the grammar's error in a red chip, never a blank or a guess.
 *      CC in the bar turns stub + sign off and on (remembered per viewer); the marquee always stays. Still, print and the
 *      end of the track hide them; reduced motion shows the whole caption at once.
 *   F9 "show me <term>" (Doug 10-13: "as I can ask show me keep, show me mirror, what is the cone. Just as the brot defines
 *      those terms, I need it to express them"). o.glossary: { key: { label, color, say, glyph, target, run, aliases } }: each
 *      term is a mini-beat the PAGE computes (the brot's own definition, not a drawing of it). A term word in the stub, or
 *      in the glossary list in the ☰ popup, is a hotlink; flow.showTerm(word) runs it and leaves the figure there. An
 *      unknown word says so ("no <word> on this page yet"), never runs the nearest term.
 *   F10 asking from outside (brotbot, STT): ?show=<term> on load; window.postMessage({ type: 'pageflow-show', term });
 *      BroadcastChannel('pageflow') { type: 'show', term, path? }. Every ask, by click or from outside, is announced:
 *      a 'pageflow-term' CustomEvent on window and BroadcastChannel('pageflow') { type: 'term-asked' | 'term-missing',
 *      term, via, path, title } so brotbot can take the hotlink clicks. flow.glossary() lists the terms with their words.
 *   F12 the symbol guide (Doug 10-13: "a page symbol guide, think self focusing dictionary that can run along side or detach"):
 *      proto_symguide.js (its spec G1-G3). "symbols" in the bar docks it beside the page; "detach" moves it to its own window,
 *      kept in step over BroadcastChannel('pageflow'). The page feeds it what is in play: the caption's term words and the
 *      sign's glyph symbols; with nothing playing, the key colours of the figure in view; hovering a term word or a key
 *      swatch lights that entry. It is now one pane of F13.
 *   F13 panes (Doug 10-13: "we need a window|frame glyph pane manager"), proto_panes.js P1-P4: Symbols, Flow tree and Sign,
 *      each in a frame (stacked in the dock beside the page), its own window, or off (the Sign also: inset, the default).
 *      "panes" in the bar chooses; remembered per viewer. Wide screens start with Symbols + Flow tree framed.
 *      o.panes ({ guide, tree, sign }: 'frame' | 'window' | 'off' | 'inset') sets a page's own first state instead (reader block 10-19).
 *   F14 next and pace (Doug 10-13: "2 modes auto & manual next. learn from the reader's rate so that auto can accommodate.
 *      If in auto user goes next then you learn the flow rate ... as a reader gets used to parts they will play that section
 *      faster"). ⏭ (or →) finishes the beat now, its figure landing where the beat ends, and goes on. After each beat's run
 *      comes a reading hold (700 ms + 280 ms a word): auto lets it pass, manual waits for next. Speed = reader rate (all pages,
 *      pageflow-reader) × familiarity of that beat or term (this page, pageflow-rate:<path>), 0.4-4; every tween, wait,
 *      caption word and hold runs at it. Learning: next before the end -> x = expected / taken (expected from the last
 *      unskipped run; 1.3 when none yet); next in manual -> x from the reading hold, ignored past 4× (the reader was away);
 *      a reader pausing in an auto hold -> x = 0.85. f *= x^0.5, rate *= x^0.1, x held to 0.5-2.5. The mode button shows the
 *      speed of the beat in play. Switching manual -> auto mid-hold goes on and learns nothing.
 *   F15 the path (Doug 10-13: "a flow tree 3d graph visualiser of the node path with option to click back to that node"):
 *      every visit recorded (pageflow-path:<path>) as a tree, the track as trunk and each term as a branch off what was in
 *      play, with the trail in order and, when the page gives o.snapshot()/o.restore(s), a snapshot where the reader left each
 *      node. flow.path.goto(id) restores it and shows its caption still; a node never read plays. Drawn by proto_flowtree.js.
 *   F16 back and again (Doug 10-18: "play it again and go back should be on the nav bar"): ⏮ walks back along the reader's own
 *      trail (the order they saw things, which is what feels linear to them, not the track order), one step a press, restoring
 *      each node as F15 does; a new visit starts again from the end. ↺ plays the beat or term in play again from its start.
 *   F17 (brotbot gate 10-19, opt-in): o.returns: true snapshots the reader's state before every show-me (a term, or a page's own
 *      show-me through flow.markReturn()); ⏮'s first press after it restores that state, before walking the trail. beat.enter()
 *      runs before a beat's caption appears, so what the caption names is already lit (a beat's run starts after a 650 ms rest).
 * Classic script: defines window.Pageflow.
 *   Pageflow.figs({ list, states: { 'fig-x': () => 'chip text' }, shows: { 'fig-x': 'what it shows' } }) → { refresh, audit, figs }
 *   Pageflow.mount({ beats: [{ title, target: el | '#id', run: async ctx => {} }], ambient(dt), onStill(), onLive(), contents })
 *     + glossary, terms, snapshot() -> state, restore(state). → also next, mode(m), pace, path, panes
 *     ctx.tween(ms, k => {}) and ctx.wait(ms) reject when paused; the flow catches that.  → { play(from, only), pause, still, live, state }
 *   play(i, true) runs beat i alone (a "show me" button); <a class="fref" href="#fig-x"></a> in prose is filled with "Fig N".
 */
(function () {
  'use strict';
  const LIB = document.currentScript ? new URL('.', document.currentScript.src).href : '../lib/';   // where glyph_grammar.js lives
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = `
.fig { margin: 0 0 14px; }
.fig figcaption { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; font: 12px var(--mono, monospace); color: var(--dim, #8a8a93); margin: 6px 0 0; }
.fig figcaption .fn { color: var(--fg, #eee); font-weight: 600; } .fig figcaption .ft { color: var(--fg, #eee); }
.fig .chip { border: 1px solid #19e0ff55; color: #19e0ff; border-radius: 3px; padding: 0 6px; font-size: 11px; }
.fig .chip.fixed { border-color: var(--line, #23252d); color: var(--dim, #8a8a93); }
.fig .ref { font: 11px var(--mono, monospace); background: none; border: 1px solid var(--line, #23252d); color: var(--dim, #8a8a93); border-radius: 3px; padding: 0 6px; cursor: pointer; margin-left: auto; }
.fig .ref:hover { color: #19e0ff; border-color: #19e0ff; } .fig:target { outline: 1px dashed #19e0ff88; outline-offset: 6px; }
ol.figlist { font-size: 15px; } ol.figlist li { margin-bottom: 8px; } ol.figlist .st { font: 12px var(--mono, monospace); color: var(--dim, #8a8a93); }
#pf { position: fixed; left: 50%; bottom: 12px; transform: translateX(-50%); z-index: 50; display: flex; align-items: center; gap: 8px;
  width: max-content; max-width: calc(100vw - 24px); box-sizing: border-box; padding: 6px 8px; background: #0d0e12f0;   /* max-content: at left 50% a fixed box would shrink to the half on its right */ border: 1px solid #23252d; border-radius: 22px;
  font: 12px var(--mono, monospace); color: var(--fg, #eee); box-shadow: 0 4px 18px #000a; }
#pf button { font: 13px var(--mono, monospace); background: none; color: inherit; border: 1px solid #23252d; border-radius: 16px; min-width: 32px; height: 32px; cursor: pointer; }
#pf button:hover { border-color: #19e0ff; color: #19e0ff; } #pf button:disabled { opacity: .35; cursor: default; border-color: #23252d; color: inherit; } #pf .pp { border-color: #19e0ff; color: #19e0ff; }
#pf .bn { color: var(--dim, #8a8a93); white-space: nowrap; } #pf .bt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1 1 auto; max-width: 52ch; }
/* the ticker (beat number and title) on its own line above the buttons (Doug 10-20: "the ticker ... needs to separate out into an above line. the positions
   of the play btns should stay page fixed"): the bar holds only buttons, so a new title no longer changes its width and moves them */
#pf .tk { position: absolute; left: 50%; bottom: calc(100% + 6px); transform: translateX(-50%); display: flex; align-items: center; gap: 8px; width: max-content;
  max-width: min(760px, calc(100vw - 24px)); box-sizing: border-box; padding: 4px 12px; background: #0d0e12f0; border: 1px solid #23252d; border-radius: 12px; }
#pf .md { min-width: 11ch; }
#pf .pp.needpress { animation: pfpress 1.1s ease-in-out infinite; } @keyframes pfpress { 0%, 100% { box-shadow: 0 0 0 0 #19e0ffaa; } 60% { box-shadow: 0 0 0 9px #19e0ff00; } }
@media (prefers-reduced-motion: reduce) { #pf .pp.needpress { animation: none; box-shadow: 0 0 0 3px #19e0ff; } }   /* 'auto ×1.0' and 'manual' take one width */
#pfpill { position: fixed; right: 12px; bottom: 12px; z-index: 50; font: 12px var(--mono, monospace); background: #0d0e12f0; color: #19e0ff;
  border: 1px solid #19e0ff88; border-radius: 16px; padding: 6px 12px; cursor: pointer; }
#pfpop { position: fixed; left: 50%; bottom: 62px; transform: translateX(-50%); z-index: 51; width: min(460px, calc(100vw - 24px)); max-height: 60vh; overflow: auto;
  box-sizing: border-box; background: #0d0e12f8; border: 1px solid #23252d; border-radius: 6px; padding: 10px 14px; font: 13px/1.5 var(--mono, monospace); }
#pfpop h4 { margin: 8px 0 4px; font: 11px var(--mono, monospace); text-transform: uppercase; letter-spacing: .08em; color: var(--dim, #8a8a93); }
#pfpop a { color: var(--fg, #eee); text-decoration: none; display: block; padding: 2px 0; } #pfpop a:hover, #pfpop a.on { color: #19e0ff; }
#pf .bt { position: relative; } #pf .bt .mq { display: inline-block; }
#pf .bt.run .mq { animation: pfmq var(--mqd, 14s) linear infinite; padding-left: 100%; }
#pf { flex-wrap: wrap; } #pf .rr { flex: 1 0 100%; border: none; height: 20px; font-size: 11px; color: #19e0ff; }
#pf .rr[hidden] { display: none; } #pf.paused .bt.run .mq { animation: none; padding-left: 0; transform: none; }
@media (prefers-reduced-motion: reduce) { #pf .bt.run .mq { animation: none; padding-left: 0; } }
@keyframes pfmq { from { transform: translateX(0); } to { transform: translateX(-100%); } }
#pf .cc.off, #pf .vo.off { opacity: .45; text-decoration: line-through; } #pf .vo.busy { color: #e0b53b; opacity: 1; }
#pf .vo svg { vertical-align: -2px; } #pf .vo .slash { display: none; } #pf .vo.off .slash { display: inline; } #pf .vo.off .wave { display: none; }
@media (max-width: 600px) { #pf .vo .vw { display: none; } }
#pfstub { position: fixed; left: 50%; bottom: var(--pf-caption-bottom, 78px); transform: translateX(-50%); z-index: 49; width: max-content; max-width: min(860px, calc(100vw - 32px));
  text-align: center; pointer-events: none; font: 400 clamp(24px, 3.6vw, 44px)/1.18 var(--title, "Archivo Black", system-ui, sans-serif); color: #fff;
  -webkit-text-stroke: .15em #000; paint-order: stroke fill; text-shadow: 0 3px 14px #000c; letter-spacing: .01em; transition: opacity .3s; }
#pfstub[hidden] { display: block; opacity: 0; }
#pfstub .w { opacity: .32; display: inline-block; transition: opacity .32s ease, transform .18s ease; transform: none; margin: 0 .12em; }
#pfstub .w.ahead { opacity: .62; } #pfstub .w.in { opacity: 1; } #pfstub .w.now { transform: scale(1.12); }
#pfstub .hl { color: #ffe14d; } #pfstub.dim { opacity: .8; } #pfstub[hidden] .w.t { pointer-events: none; }   /* a hidden caption's words never take a click */
#pfstub .w.t { pointer-events: auto; cursor: pointer; text-decoration: underline dotted .08em; text-underline-offset: .14em; }
#pfstub .w.t:hover { text-decoration-style: solid; }
#pfsign { position: fixed; right: 14px; bottom: 112px; z-index: 49; width: min(300px, 40vw); background: #0d0e12ee; border: 1px solid #ffffff2a; border-radius: 10px;
  padding: 8px 10px 9px; pointer-events: none; transition: opacity .3s; }
#pfsign[hidden] { display: block; opacity: 0; } #pfsign svg { display: block; max-width: 100%; height: auto; }
#pfsign svg .lab { font: 11px system-ui; fill: #aab2c3; } #pfsign svg .sub, #pfsign svg .sup { font: 700 11px system-ui; }
#pfstub .mg { display: inline-block; vertical-align: middle; line-height: 0; background: #14161ce6; border-radius: 6px; padding: 2px 4px; margin: 0 .15em 0 -.05em;
  -webkit-text-stroke: 0; transform: translateY(-.08em); } #pfstub .mg svg { height: .95em; width: auto; } #pfstub .mg svg .lab { font: 11px system-ui; fill: #aab2c3; -webkit-text-stroke: 0; }
#pfstub .mg { transition: opacity .12s; } #pfstub .w:not(.in) + .mg { opacity: 0; }   /* a word's glyph arrives with its word */
@media (prefers-reduced-motion: reduce) { #pfstub .w, #pfstub .mg { transition: none; } #pfstub .w.now { transform: none; } }
#pfsign .nt { font: 700 12px system-ui; letter-spacing: .06em; text-transform: uppercase; color: #ffe14d; margin-bottom: 2px; }
#pfsign .rd { font: 12px/1.35 var(--mono, monospace); color: var(--dim, #8a8a93); margin-top: 4px; }
#pfsign .err { border: 1px solid #ff5470; color: #ff5470; border-radius: 6px; padding: 2px 6px; font: 12px system-ui; }
/* wide: the caption stops short of the glyph inset on the right (centred, so the same margin both sides) */
@media (min-width: 901px) { #pfstub { max-width: min(860px, calc(100vw - 2 * (min(300px, 40vw) + 34px))); } }
@media (max-width: 900px) { #pfsign { top: 12px; bottom: auto; width: min(260px, 60vw); } }
#pf .pnb.on { border-color: #19e0ff88; color: #19e0ff; } #pf .md { min-width: 72px; padding: 0 8px; white-space: nowrap; }
#pf .nx.wait { border-color: #ffe14d; color: #ffe14d; animation: pfwait 1.2s ease-in-out infinite; } @keyframes pfwait { 50% { box-shadow: 0 0 0 5px #ffe14d33; } }
@media (prefers-reduced-motion: reduce) { #pf .nx.wait { animation: none; } }
@media (min-width: 1100px) { html.pf-docked body { margin-right: 340px; } html.pf-docked #pf, html.pf-docked #pfstub, html.pf-docked #pfpop { left: calc(50% - 170px); }
  html.pf-docked #pfsign { top: 12px; bottom: auto; right: 354px; } html.pf-docked #pfpill { right: 352px; }   /* docked: the sign goes up top, the caption keeps the width */
  html.pf-docked #pfstub { max-width: min(860px, calc(100vw - 372px)); } }
@media print { html.pf-docked body { margin-right: 0; } }
@media print { #pf, #pfpop, #pfpill, #pfstub, #pfsign, .fig .ref { display: none !important; } .fig { break-inside: avoid; } .fig .chip { color: #333; border-color: #999; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const el = (tag, attrs = {}, text) => { const e = document.createElement(tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; };

  // ---- figures: number, label, chip, copy-ref, EOF list
  function figs(o = {}) {
    const list = typeof o.list === 'string' ? document.querySelector(o.list) : o.list, states = o.states || {}, shows = o.shows || {};
    const F = [...document.querySelectorAll('figure.fig')].map((f, i) => {
      const n = i + 1, title = f.dataset.title || f.id, cap = f.querySelector('figcaption') || f.appendChild(el('figcaption'));
      const chip = el('span', { class: 'chip' + (f.dataset.fixed != null ? ' fixed' : '') }), ref = el('button', { class: 'ref', type: 'button', title: 'copy a reference to this figure' }, '⧉ ref');
      cap.prepend(el('span', { class: 'fn' }, 'Fig ' + n), el('span', { class: 'ft' }, title), chip); cap.append(ref);
      const fig = { n, id: f.id, title, el: f, chip, state: states[f.id] || (() => f.dataset.fixed != null ? 'still' : 'live'), shows: shows[f.id] || '' };
      ref.addEventListener('click', () => { const t = `${location.origin}${location.pathname}#${f.id} · Fig ${n}, ${title} (${fig.state()})`;
        const done = ok => { ref.textContent = ok ? 'copied' : t; setTimeout(() => ref.textContent = '⧉ ref', ok ? 1200 : 6000); };
        navigator.clipboard?.writeText(t).then(() => done(true), () => done(false)) ?? done(false); });
      return fig; });
    const items = list ? F.map(f => { const li = el('li'), a = el('a', { href: '#' + f.id }, `Fig ${f.n}, ${f.title}`), s = el('span', { class: 'st' });
      li.append(a, document.createTextNode(f.shows ? ' — ' + f.shows + ' ' : ' '), s); list.appendChild(li); return s; }) : [];
    // a resting page (rest.js) says so on every live chip; data-live tells rest.js which figures to badge
    function refresh() { const rest = window.Rest?.resting; F.forEach((f, i) => { let t = f.state(); const live = /^live\b/.test(t); f.el.toggleAttribute('data-live', live);
      if (rest && live) t = t.replace(/^live/, 'resting · move to wake'); f.chip.textContent = t; if (items[i]) items[i].textContent = '· now: ' + t; }); }
    window.Rest?.on(refresh);
    function audit() { const bad = []; document.querySelectorAll('canvas, svg').forEach(c => { if (c.closest('#pf, #pfpop, #pfdock, #pfpanes, #pfsign, .nudger')) return;   // page chrome, not figures
        const f = c.closest('figure.fig'); if (!f || !f.id || !f.querySelector('figcaption .fn')) bad.push(c.id || c.getAttribute('aria-label') || c.tagName); });
      if (list && list.children.length !== F.length) bad.push(`list has ${list.children.length} entries for ${F.length} figures`); return bad; }
    // in-text references: <a class="fref" href="#fig-x"></a> reads "Fig N", so prose never carries a stale number
    document.querySelectorAll('a.fref').forEach(a => { const f = F.find(f => '#' + f.id === a.getAttribute('href')); a.textContent = f ? 'Fig ' + f.n : '(no such figure)'; });
    refresh(); return { figs: F, refresh, audit };
  }

  // ---- the flow: footer bar, track, ambient, still/live
  class Paused extends Error {}
  function mount(o) {
    const beats = o.beats, Q = new URLSearchParams(location.search);
    const S = { i: 0, step: 0, stepDone: false, playing: false, still: RM || Q.get('flow') === 'still', gen: 0, log: [], asks: [], term: null, hold: false, skip: null, learnLog: [], lastDone: -1, only: false, backAt: null };
    const ls = { get: (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
      set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
    let figInView = null, inPlay = { keys: [], why: '' }, curGlyph = null, signHtml = '', lastSay = '', panes = null, symMod = null;
    let ambientRAF = 0, ambientLast = performance.now();
    window.Rest?.busy(() => S.playing);   // a narrated track is watched hands-off: the page doesn't rest under it (rest.js)
    S.mode = ls.get('pageflow-mode', 'auto') === 'manual' ? 'manual' : 'auto';
    const bar = el('div', { id: 'pf', role: 'region', 'aria-label': 'page player' });
    const pp = el('button', { class: 'pp', type: 'button', 'aria-label': 'play the page' }, '▶'), bn = el('span', { class: 'bn' }), bt = el('span', { class: 'bt' });
    const nx = el('button', { class: 'nx', type: 'button', 'aria-label': 'next', title: 'next ▸ (→ key): in auto it also teaches the page your pace' }, '⏭');
    const bk = el('button', { class: 'bk', type: 'button', 'aria-label': 'go back', title: 'go back: to what you saw before, the figures as you left them (your own path, not the track order)' }, '⏮');
    const ag = el('button', { class: 'ag', type: 'button', 'aria-label': 'play it again', title: 'play it again: the beat or show me in play, from its start' }, '↺');
    const md = el('button', { class: 'md', type: 'button', 'aria-label': 'auto or manual next' });
    const menu = el('button', { type: 'button', 'aria-label': 'track, contents and figures', title: 'track · contents · figures' }, '☰');
    const x = el('button', { type: 'button', 'aria-label': 'make the page still', title: 'make the page still' }, '×');
    const cc = el('button', { type: 'button', class: 'cc', 'aria-label': 'big captions and glyphs on or off', title: 'big captions + glyph inset (the footer line always stays)' }, 'CC');
    const vo = el('button', { type: 'button', class: 'vo off', 'aria-label': 'Brot voice on or off', title: 'Brot voice: speaks the captions. Off; the first use downloads about 45 MB' });
    vo.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path class="wave" d="M11 5.6q1.8 2.4 0 4.8M12.9 3.9q3.2 4.1 0 8.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path class="slash" d="M2.5 13.5 13.5 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span class="vw"> voice</span>';
    const pb = el('button', { type: 'button', class: 'pnb', 'aria-label': 'panes', title: 'panes: symbols · flow tree · sign, each in a frame, a window or off' }, 'panes');
    const rr = el('button', { class: 'rr', type: 'button', 'aria-label': 'restart the current explanation' }, '[press to restart]');
    const tk = el('div', { class: 'tk' }); tk.append(bn, bt);
    bar.append(bk, ag, pp, nx, md, cc, vo, pb, menu, x, rr, tk);
    const stub = el('div', { id: 'pfstub', hidden: '', 'aria-live': 'polite' }), sign = el('div', { id: 'pfsign', hidden: '', 'aria-hidden': 'true' });
    document.body.append(stub, sign);
    try { S.cc = localStorage.getItem('pageflow-cc') !== 'off'; } catch { S.cc = true; }
    // ---- F16 voice (proto_voice.js; Doug 10-17: "add brot voice to the CC's. would need a quiet|off btn"). Off by default and
    // nothing downloads until it is turned on. Each caption line is spoken; a line or sign a beat gives (c.say, c.sign) waits
    // until the line before it has been heard (Doug 10-18), and is rendered while that line speaks; the caption's word run starts
    // with the audio and spreads over the spoken line; its next c.wait lasts until it is heard; a beat holds until its line ends (or its reading
    // time, whichever is longer); pause, next, still, a new beat or term, and off silence it at once. The engine is caro's
    // Speaking Brot, unchanged, in voice/ beside this lib (locally a link to caro/web/speaking_brot; on the site a folder),
    // or at o.voice.base / window.PAGEFLOW_VOICE_BASE.
    const VBASE = o.voice?.base || window.PAGEFLOW_VOICE_BASE || LIB + 'voice/';
    S.voice = ls.get('pageflow-voice', 'off') === 'on'; let voiceP = null, voiceTail = null, voiceReady = false, voiceWarm = false, wordRun = null; const WORD_WAIT_MS = 6000;
    const getVoice = () => voiceP || (voiceP = import(LIB + 'proto_voice.js').then(M => M.createVoice({ base: VBASE,
      onState: m => { vo.title = 'Brot voice: ' + m; }, onError: e => voiceFail(e), onBlocked: () => needPress(true) })).then(V => { voiceReady = true; return V; }));
    // the line hold (ctx: inTurn, wait) holds only for a voice that is ready, and never longer than VOICE_HOLD_MS for one line. Until the voice
    // has formed its first line (warm) the hold is VOICE_WARM_MS: the engine is up in under a second, but its first line takes ~30 s on Doug's
    // machine even cached (probe_voice4.mjs, 10-20), and a 20 s hold let the track run on unheard.
    const VOICE_HOLD_MS = 20000, VOICE_WARM_MS = 45000, heldVoice = () => S.voice && voiceTail ? Promise.race([voiceTail, new Promise(r => setTimeout(r, voiceWarm ? VOICE_HOLD_MS : VOICE_WARM_MS, false))]) : null;
    // set to play but not playing (Doug 10-20: "if it can't play the player need to show what needs doing to fix. i.e. pulse play btn"): the browser
    // held the voice's sound until a press, so ▶ pulses; a press on it then frees the sound and says the line again, without pausing the track
    function needPress(on) { pp.classList.toggle('needpress', on); if (on) vo.title = 'Brot voice: the browser is holding the sound. Press ▶ to let it play'; }
    const warmed = () => { if (voiceWarm) return; voiceWarm = true; vo.classList.remove('busy'); vo.title = 'Brot voice on: the captions are spoken. Click to turn it off'; show(); };
    // form a line now, so the first one said is ready: the button stays busy (warming up) until a line has been formed
    function warmUp(b) { if (!S.voice) return; if (!voiceWarm) vo.classList.add('busy');
      getVoice().then(V => V.prepare(b ? b.say || b.title : '')).then(buf => { if (buf) warmed(); }, () => {}); }
    function voiceFail(e) { S.voice = false; ls.set('pageflow-voice', 'off'); voiceP = null; voiceReady = false; voiceWarm = false; vo.classList.remove('busy'); vo.title = 'Brot voice unavailable: ' + (e?.message || e); show(); }
    function speak(t, g) { if (!S.voice || S.still || g !== S.gen || !t) return; const run = wordRun;
      voiceTail = getVoice().then(V => g === S.gen ? V.say(t, { onStart: s => run?.go(s) }) : false, e => { voiceFail(e); return false; })
        .then(r => { if (r) { warmed(); needPress(false); } else run?.go(null); return r; }); }
    function hush() { voiceTail = null; if (voiceP) voiceP.then(V => V.stop(), () => {}); }
    // the lines a beat says inside its run (c.say with a plain string), rendered as it starts so none waits on its render;
    // a cache warm only: a line not found here renders when it is said
    function prepareInner(b) { if (!S.voice || S.still || typeof b.run !== 'function') return;   // the voice is loading already: speak() just asked for it
      const L = [...String(b.run).matchAll(/c\.say\((['"`])((?:\\.|(?!\1).)*?)\1\)/g)].filter(m => m[1] !== '`' || !m[2].includes('${')).map(m => m[2].replace(/\\(.)/g, '$1'));
      if (L.length) getVoice().then(V => L.forEach(t => V.prepare(t)), () => {}); }
    function prepareLine(b) { if (S.voice && b && voiceP) voiceP.then(V => V.prepare(b.say || b.title), () => {}); }
    // a voice remembered on is warmed once the page is idle (Doug 10-20: "voice doesn't auto come on when I press play"). A cold engine started
    // only at the first ▶ and took ~35 s to speak its first line (Firefox, probe_voice.mjs), so the track ran on unheard until a second press of
    // the voice button found it ready. Warm, ▶ speaks at once. A reader with the voice off pays nothing.
    if (S.voice) { const warm = () => { warmUp(beats[S.i] || beats[0]); prepareInner(beats[S.i] || beats[0]); };
      'requestIdleCallback' in window ? requestIdleCallback(warm, { timeout: 4000 }) : setTimeout(warm, 1500); }
    const pill = el('button', { id: 'pfpill', type: 'button', title: 'bring the page back to life' }, '▶ live');
    const pop = el('div', { id: 'pfpop', hidden: '' });
    document.body.append(bar, pill, pop);
    // Leave room for a wrapped footer, including its paused restart line.
    // the caption sits above the ticker line, which sits above the bar
    const capAt = () => { if (!bar.hidden) stub.style.setProperty('--pf-caption-bottom', Math.ceil(innerHeight - Math.min(bar.getBoundingClientRect().top, tk.getBoundingClientRect().top) + 10) + 'px'); };
    { const ro = new ResizeObserver(capAt); ro.observe(bar); ro.observe(tk); }
    const tgt = b => typeof b.target === 'string' ? document.querySelector(b.target) : b.target;
    const GL = o.glossary || {}, alias = {};
    for (const [k, v] of Object.entries(GL)) { alias[k] = k; (v.aliases || []).forEach(a => alias[a] = k); }
    const terms = { ...(o.terms || {}) }; for (const [a, k] of Object.entries(alias)) if (GL[k].color && !terms[a]) terms[a] = GL[k].color;
    const termBeat = k => ({ ...GL[k], term: k, title: GL[k].title || (GL[k].steps ? (GL[k].label || k) : (GL[k].label || k) + ': ' + String(GL[k].say || '').replace(/\*\*/g, '')) });

    // ---- pace (F14): one reader rate for every page (pageflow-reader) times a familiarity per beat or term on this page
    // (pageflow-rate:<path>). Every tween, wait, caption word and reading hold runs at that speed.
    const RKEY = 'pageflow-rate:' + location.pathname, RR = ls.get('pageflow-reader', { r: 1 }), RT = ls.get(RKEY, {});
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const speedOf = k => clamp((RR.r || 1) * (RT[k]?.f || 1), 0.4, 4);
    const saveRates = () => { ls.set(RKEY, RT); ls.set('pageflow-reader', RR); };
    function learn(k, x, how) { x = clamp(x, 0.5, 2.5); const e = RT[k] || (RT[k] = { f: 1, n: 0 });
      e.f = clamp(e.f * Math.pow(x, 0.5), 0.5, 4); e.n++; RR.r = clamp((RR.r || 1) * Math.pow(x, 0.1), 0.6, 2); saveRates();
      S.learnLog.push({ k, x: +x.toFixed(3), how, f: +e.f.toFixed(3), r: +RR.r.toFixed(3) }); treeFeed(); }

    // ---- the path (F15): every beat and term the reader visits, as a tree (the track is the trunk, a term asked in play is a
    // branch off what was in play), the trail in visit order, and a snapshot of the figures where the reader left each node
    const PKEY = 'pageflow-path:' + location.pathname; let P = ls.get(PKEY, null); if (!P || !P.nodes) P = { nodes: {}, trail: [], cur: null };
    const savePath = () => ls.set(PKEY, P);
    function visit(kind, ref) { let id = null, parent = null; S.backAt = null;   // a new visit: back starts again from the end of the trail
      if (kind === 'beat') { id = 'b' + ref; parent = ref > 0 ? 'b' + (ref - 1) : null; }
      else { const from = P.cur || 'b' + S.i;
        for (let a = from; a; a = P.nodes[a]?.parent) if (P.nodes[a]?.kind === 'term' && P.nodes[a].ref === ref) { id = a; break; }   // asked again on its own branch: back to it
        if (!id) { id = from + '>' + ref; parent = from; } }
      const n = P.nodes[id] || (P.nodes[id] = { id, kind, ref, parent, visits: 0 }); n.visits++; n.t = Date.now();
      P.cur = id; P.trail.push(id); if (P.trail.length > 300) P.trail.splice(0, P.trail.length - 300); savePath(); treeFeed(); return n; }
    function snapCur() { const n = P.nodes[P.cur]; if (!n) return; if (o.snapshot) try { n.snap = o.snapshot(); } catch {} n.say = lastSay; n.glyph = curGlyph; n.step = S.step; n.stepDone = S.stepDone; savePath(); }
    const graphMsg = () => ({ type: 'graph',
      beats: beats.map((b, i) => ({ id: 'b' + i, label: String(i + 1), title: `${i + 1}. ${b.title}`, speed: speedOf('b' + i) })),
      nodes: Object.values(P.nodes).map(n => { const k = n.kind === 'term' ? 't:' + n.ref : 'b' + n.ref;
        return { id: n.id, kind: n.kind, ref: n.ref, parent: n.parent, visits: n.visits, snap: !!n.snap, speed: speedOf(k), learned: RT[k]?.n || 0,
          step: n.step ?? 0, label: (n.kind === 'term' ? (GL[n.ref]?.label || n.ref) : String(n.ref + 1)) + ((n.kind === 'term' ? GL[n.ref] : beats[n.ref])?.steps?.length ? ` · ${(n.step ?? 0) + 1}/${(n.kind === 'term' ? GL[n.ref] : beats[n.ref]).steps.length}` : ''), color: n.kind === 'term' ? GL[n.ref]?.color || null : null,
          title: n.kind === 'term' ? 'show me ' + (GL[n.ref]?.label || n.ref) : `${n.ref + 1}. ${beats[n.ref]?.title || ''}` }; }),
      trail: P.trail.slice(-80), cur: P.cur });
    function treeFeed() { if (panes && panes.place('tree') !== 'off') panes.send('tree', graphMsg()); }
    function gotoNode(id) { const n = P.nodes[id], m = /^b(\d+)$/.exec(id);
      if (!n || ((!n.snap || !o.restore) && !(n.kind === 'term' ? GL[n.ref] : beats[n.ref])?.steps)) { if (m) play(+m[1], true); else if (n) replayNode(id); return; }   // never read (or no snapshot): play it
      pause('goto'); if (S.still) live(); S.ret = null;
      try { o.restore(n.snap); } catch {}
      if (n.kind === 'beat') { S.i = n.ref; S.term = null; } else S.term = termBeat(n.ref);
      P.cur = id; P.trail.push(id); S.step = n.step ?? 0; S.stepDone = !!n.stepDone; savePath();
      const b = n.kind === 'beat' ? beats[n.ref] : S.term, g = ++S.gen; if (b.steps) previewStep(b); layers({ say: n.say || b.say || b.title, title: b.title, glyph: n.glyph || b.glyph }, g, 99);
      stub.classList.add('dim'); show(); treeFeed(); const t = tgt(b); if (t) t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); }
    // F16: the trail step before the one back is at (or before the end), skipping repeats of the same node; -1 when there is none
    function backFrom() { const T = P.trail; let k = S.backAt ?? T.length - 1; const here = T[k]; while (k > 0 && T[k - 1] === here) k--; return k > 0 ? k - 1 : -1; }
    // F17: the reader's state just before the last show-me; ⏮'s first step, then the trail. Cleared by any other navigation.
    function markReturn() { if (!o.returns || !o.snapshot) return; try { S.ret = o.snapshot(); } catch { S.ret = null; } show(); }
    function back() { if (S.ret) { const r = S.ret; S.ret = null; pause('goto'); if (S.still) live(); try { o.restore(r); } catch {} S.term = null; layersOff(); show(); return; }
      const k = backFrom(); if (k < 0) return; gotoNode(P.trail[k]); S.backAt = k; show(); }
    // again replays the node the reader is on (P.cur): after a beat ends S.i already points at the next one
    const curBeat = () => { const m = /^b(\d+)$/.exec(P.cur || ''); return m ? +m[1] : -1; };
    function again() { if (S.term) return showTerm(S.term.term, 'again'); const i = curBeat(); if (i >= 0) play(i, S.only); }
    function replayNode(id) { const n = P.nodes[id], m = /^b(\d+)$/.exec(id);
      if (m) return play(+m[1], true); if (!n) return; P.cur = n.parent; showTerm(n.ref, 'tree'); }
    function clearPath() { P = { nodes: {}, trail: [], cur: null }; savePath(); treeFeed(); }

    // the marquee: plain raw text, a ticker only when it does not fit
    function marquee(t) { bt.innerHTML = ''; const m = el('span', { class: 'mq' }, t); bt.appendChild(m); bt.classList.remove('run');
      requestAnimationFrame(() => { if (m.scrollWidth > bt.clientWidth + 2) { bt.style.setProperty('--mqd', Math.max(8, t.length / 6) + 's'); bt.classList.add('run'); } }); }
    const current = () => S.term || beats[S.i];
    function show() { const b = current(), ttl = b.steps ? `${b.title} · ${S.step + 1}/${b.steps.length} · ${b.steps[S.step]?.title || ''}` : b.title, waiting = S.playing && S.hold && S.mode === 'manual' && (!S.term || b.steps);
      bn.textContent = S.term ? (S.playing ? (waiting ? 'branch · next ▸' : 'branch') : !b.steps || S.stepDone ? 'shown ✓' : 'paused') : `${S.i + 1} / ${beats.length}` + (waiting ? ' · next ▸' : '');
      if (bt.dataset.t !== ttl) { bt.dataset.t = ttl; marquee(ttl); }
      cc.classList.toggle('off', !S.cc); vo.classList.toggle('off', !S.voice); pp.textContent = S.playing ? '❚❚' : '▶'; nx.classList.toggle('wait', waiting);
      bk.disabled = !S.ret && backFrom() < 0; ag.disabled = !S.term && curBeat() < 0;
      const k = S.term ? 't:' + S.term.term : 'b' + S.i, sp = speedOf(k);
      md.textContent = S.mode === 'auto' ? 'auto ×' + sp.toFixed(1) : 'manual';
      md.title = S.mode === 'auto' ? `auto: the page moves on by itself at your pace (×${sp.toFixed(2)} here, learned each time you press next early). Click for manual.`
        : 'manual: after each beat the page waits for next ▸ (→ key). Click for auto.';
      pp.setAttribute('aria-label', S.playing ? 'pause' : 'play the page'); bar.hidden = S.still; pill.hidden = !S.still;
      bar.classList.toggle('paused', !S.playing); rr.hidden = S.playing || S.still; syncAmbient();
      pop.querySelectorAll('a[data-beat]').forEach(a => a.classList.toggle('on', +a.dataset.beat === S.i));
      dispatchEvent(new CustomEvent('pageflow-state', { detail: { playing: S.playing, term: S.term?.term || null, beat: S.i, step: S.step, done: S.stepDone } })); }
    // the popup: track · contents · figures
    function fill() { pop.innerHTML = ''; pop.append(el('h4', {}, 'Track'));
      beats.forEach((b, i) => { const a = el('a', { href: '#', 'data-beat': i }, `${i + 1}. ${b.title}`); a.addEventListener('click', e => { e.preventDefault(); pop.hidden = true; play(i); }); pop.append(a); });
      const H = [...document.querySelectorAll(o.contents || 'section h2')]; if (H.length) pop.append(el('h4', {}, 'Contents'));
      H.forEach(h => { if (!h.id) h.id = 's-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); pop.append(el('a', { href: '#' + h.id }, h.textContent)); });
      const K = Object.keys(GL); if (K.length) pop.append(el('h4', {}, 'Terms: show me'));
      K.forEach(k => { const a = el('a', { href: '#', 'data-term': k }, (GL[k].label || k) + (GL[k].aliases?.length ? ' (' + GL[k].aliases.join(', ') + ')' : ''));
        if (GL[k].color) a.style.color = GL[k].color; a.addEventListener('click', e => { e.preventDefault(); pop.hidden = true; showTerm(k, 'menu'); }); pop.append(a); });
      const F = [...document.querySelectorAll('figure.fig')]; if (F.length) pop.append(el('h4', {}, 'Figures'));
      F.forEach(f => pop.append(el('a', { href: '#' + f.id }, (f.querySelector('.fn')?.textContent || '') + ', ' + (f.dataset.title || f.id))));
      pop.querySelectorAll('a[href^="#"]:not([data-beat])').forEach(a => a.addEventListener('click', () => { pop.hidden = true; })); }
    menu.addEventListener('click', () => { if (pop.hidden) fill(); pop.hidden = !pop.hidden; show(); });
    // ctx for a beat, at speed sp: tweens and waits reject the moment the flow is paused, and finish at once on next (skip)
    const wakers = new Set(), wakeAll = () => [...wakers].forEach(f => f());
    function ctx(g, sp = 1) { const live = () => { if (g !== S.gen) throw new Paused(); }, sk = () => S.skip === g;
      const hold = (ms, forever) => new Promise((res, rej) => { if (sk()) return res(); let id = 0;
        const done = () => { clearTimeout(id); wakers.delete(done); g === S.gen ? res() : rej(new Paused()); };
        wakers.add(done); if (!forever) id = setTimeout(done, RM ? Math.min(ms, 1500) : ms / sp); });
      // voice on (Doug 10-18: "the voice can lag. hold the next CC until the voice has finished"): a line or sign waits for the
      // line being spoken to end, in the order the beat gave them; a wait after a line said here also lasts until its voice ends
      let lineP = null, said = false;
      const inTurn = f => { if (!S.voice) { live(); f(); return Promise.resolve(); }
        const before = lineP; lineP = (async () => { if (before) await before; const v = heldVoice(); if (v) await until(v); live(); f(); })(); lineP.catch(() => {}); return lineP; };
      const until = p => new Promise((res, rej) => { if (sk()) return res(); let v; const done = () => { wakers.delete(done); g === S.gen ? res(v) : rej(new Paused()); };
          wakers.add(done); Promise.resolve(p).then(x => { v = x; done(); }, done); });
      return { sign: (glyph, note) => inTurn(() => setSign(glyph, g, note)),
        say: t => { if (S.voice && voiceReady) voiceP?.then(V => V.prepare(t), () => {});   // render it while the line before it speaks
          return inTurn(() => { said = true; layers({ say: t, title: t, keepSign: true }, g, sp); speak(t, g); }); },   // a new line keeps the glyph in play
        tween: (ms, f) => new Promise((res, rej) => { if (RM || ms <= 0 || sk()) { try { live(); f(1); res(); } catch (e) { rej(e); } return; }
          const t0 = performance.now(), T = ms / sp; const step = now => { if (g !== S.gen) return rej(new Paused()); const k = sk() ? 1 : Math.min(1, (now - t0) / T); f(k); k < 1 ? requestAnimationFrame(step) : res(); };
          requestAnimationFrame(step); }),
        wait: async ms => { if (lineP) await lineP; const v = said ? heldVoice() : null; await Promise.all([hold(ms, false), v && until(v)]); },
        rest: ms => hold(ms, false), next: () => hold(0, true), live, until }; }
    // ---- the stub (big caption) and the sign (glyph inset) for one beat
    const escH = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let glyphLib = null; const loadGlyphs = () => glyphLib || (glyphLib = import(LIB + 'glyph_grammar.js'));
    function settleCaption() { stub.querySelectorAll('.w').forEach(w => { w.classList.add('in'); w.classList.remove('now', 'ahead'); }); }
    function layersOff() { stub.hidden = true; deliverSign(''); stub.classList.remove('dim'); guideFig(); }
    function layers(b, g, sp = 1) {
      lastSay = b.say || b.title;
      if (!S.cc || S.still) return layersOff();
      const words = []; String(lastSay).replace(/\bdet J\b/g, 'det⁠J').split(/(\*\*[^*]+\*\*[^\s*]*)/).forEach(part => { const hl = /^\*\*/.test(part);   // a bold run keeps its trailing punctuation
        part.replace(/\*\*/g, '').split(/\s+/).filter(Boolean).forEach(w => { const key = w.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
          const tk = alias[key]; words.push(`<span class="w${hl && !terms[key] ? ' hl' : ''}${tk ? ' t' : ''}"${tk ? ` data-term="${tk}" title="show me: ${escH(GL[tk].label || tk)}"` : ''}${terms[key] ? ` style="color:${terms[key]}"` : ''}>${escH(w).replace(/⁠/g, ' ')}</span>`); }); });
      stub.innerHTML = words.join(' '); stub.hidden = false; stub.classList.remove('dim');
      const W = [...stub.querySelectorAll('.w')]; wordRun = null;
      if (RM || sp >= 99) W.forEach(w => w.classList.add('in'));
      else {
        W.slice(0, 4).forEach(w => w.classList.add('ahead'));
        // voice on (Doug 10-18: "allow a little pause for the voice to start before the words highlight"): the run waits for the
        // audio to start, then spreads over the spoken line by word length; a line not heard (skipped, failed, or not started
        // within WORD_WAIT_MS) runs at reading pace
        const run = { started: false, go(secs) { if (run.started || g !== S.gen || !W[0]?.isConnected) return; run.started = true; clearTimeout(run.t);
          const wt = W.map(w => w.textContent.length + 2), tot = wt.reduce((a, b) => a + b, 0); let acc = 0;
          const at = secs ? W.map((_, k) => { const t = acc / tot * secs * 1000; acc += wt[k]; return t; }) : W.map((_, k) => (120 + k * 210) / sp);
          W.forEach((w, k) => setTimeout(() => { if (g !== S.gen) return;
            if (k) W[k - 1].classList.remove('now'); w.classList.remove('ahead'); w.classList.add('in', 'now');
            W.slice(k + 1, k + 5).forEach(v => v.classList.add('ahead'));
          }, at[k]));
          setTimeout(() => { if (g === S.gen && W[0]?.isConnected) settleCaption(); }, secs ? secs * 1000 : (120 + W.length * 210) / sp); } };
        if (S.voice && voiceReady && !S.still) { wordRun = run; run.t = setTimeout(() => run.go(null), WORD_WAIT_MS); } else run.go(null);
      }
      minis(g); if (!b.keepSign) setSign(b.glyph, g); guideFromStub();
    }
    // the sign goes where its pane lives: the inset (default), a frame, a window, or nowhere
    function deliverSign(html) { signHtml = html; const p = panes ? panes.place('sign') : 'inset';
      if (p === 'inset' && html) { sign.innerHTML = html; sign.hidden = false; } else sign.hidden = true;
      if (p === 'frame' || p === 'window') panes.send('sign', { type: 'sign', html }); }
    function setSign(glyph, g, note = '') {
      curGlyph = glyph || null; if (!glyph || !S.cc || S.still) { deliverSign(''); return; }
      loadGlyphs().then(G => { if (g !== S.gen) return; let pic, rd;
        try { pic = G.svg(glyph, { height: 64 }); rd = G.reading(glyph); }   // a parse error throws its own "did you mean"; an open NOT draws as could-not-tell
        catch (e) { pic = `<span class="err">glyph does not parse: ${escH(e.message || e)}</span>`; rd = escH(glyph); }
        sign.dataset.glyph = glyph; deliverSign((note ? `<div class="nt">${escH(note)}</div>` : '') + pic + `<div class="rd">${escH(rd)}</div>`); guideFromStub(); })
        .catch(e => deliverSign(`<span class="err">glyph library did not load: ${escH(e.message || e)}</span>`));
    }
    // &g at word level: a term word in the stub carries its own small glyph (glossary .mini), drawn by the grammar
    function minis(g) { const T = [...stub.querySelectorAll('.w.t')].filter(w => GL[w.dataset.term]?.mini); if (!T.length) return;
      loadGlyphs().then(G => { if (g !== S.gen && !stub.classList.contains('dim')) return;
        for (const w of T) { if (w.nextElementSibling?.classList.contains('mg')) continue; const m = document.createElement('span'); m.className = 'mg';
          try { m.innerHTML = G.svg(GL[w.dataset.term].mini, { height: 40, tight: true }); m.title = G.reading(GL[w.dataset.term].mini); } catch (e) { m.className = 'mg err'; m.textContent = '?'; m.title = String(e.message || e); }
          w.after(m); } }).catch(() => {}); }
    stub.addEventListener('click', e => { const w = e.target.closest('.w.t'); if (w) showTerm(w.dataset.term, 'caption'); });
    // ---- terms: shown by the page, asked by a click or from outside, every ask announced
    let bc = null; try { bc = new BroadcastChannel('pageflow'); } catch {}
    const announce = (type, term, via) => { const d = { type, term, via, path: location.pathname, title: document.title };
      dispatchEvent(new CustomEvent('pageflow-term', { detail: d })); try { bc?.postMessage(d); } catch {} S.asks.push(d); };
    // ---- panes (F13, proto_panes.js): Symbols (F12), Flow tree (F15), Sign, each in a frame, a window or off
    const loadSym = () => symMod || (symMod = import(LIB + 'proto_symguide.js'));
    const placeOf = id => panes ? panes.place(id) : 'off';
    const figName = f => f?.querySelector('.fn')?.textContent || f?.id || '';
    function guideEntries(M) { const E = [], C = new Map();
      for (const [k, v] of Object.entries(GL)) E.push({ key: 't:' + k, group: 'Words on this page', name: v.label || k, plain: String(v.say || '').replace(/\*\*/g, ''),
        glyph: v.mini || null, color: v.color || null, term: k, alias: (v.aliases || []).join(' ') });
      document.querySelectorAll('.key span').forEach(s => { const sw = s.querySelector('.sw'), name = s.textContent.trim(); if (!sw || !name) return;
        const c = C.get(name) || { key: 'c:' + name, group: 'Colours on this page', name, swatch: sw.style.background || getComputedStyle(sw).backgroundColor, figs: [] };
        const f = figName(s.closest('figure.fig')); if (f && !c.figs.includes(f)) c.figs.push(f); C.set(name, c); });
      for (const c of C.values()) { c.plain = c.figs.length ? 'in the key of ' + c.figs.join(', ') : 'in a key on the page'; delete c.figs; E.push(c); }
      return E.concat(M.SYMBOLS); }
    const post = d => { try { bc?.postMessage({ ...d, path: location.pathname }); } catch {} };
    function guideFocus(keys, why) { inPlay = { keys, why }; if (placeOf('guide') !== 'off') panes.send('guide', { type: 'focus', keys, why }); }
    function guideFromStub() { if (placeOf('guide') === 'off' || stub.hidden) return; loadSym().then(M => {
      const K = [...stub.querySelectorAll('.w.t')].map(w => 't:' + w.dataset.term); if (curGlyph && S.cc && !S.still) K.push(...M.symbolsIn(curGlyph));
      guideFocus([...new Set(K)], S.term ? 'show me ' + (S.term.label || S.term.term) : `beat ${S.i + 1}, ${beats[S.i].title}`); }); }
    function guideFig() { if (placeOf('guide') === 'off' || !figInView || (S.playing || !stub.hidden)) return;
      guideFocus([...new Set([...figInView.querySelectorAll('.key span')].filter(s => s.querySelector('.sw')).map(s => 'c:' + s.textContent.trim()))], figName(figInView) + ' in view'); }
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) figInView = e.target; guideFig(); }, { threshold: 0.3 }) : null;
    document.querySelectorAll('figure.fig').forEach(f => io?.observe(f));
    let hovSet = '';
    addEventListener('mouseover', e => { if (placeOf('guide') === 'off' || e.target.closest?.('#pfdock')) return; const t = e.target.closest?.('.w.t, .key span, #pfpop a[data-term]');
      const keys = !t ? [] : t.matches('.key span') ? ['c:' + t.textContent.trim()] : ['t:' + t.dataset.term]; if (keys.join() === hovSet) return; hovSet = keys.join();
      panes.send('guide', { type: 'hover', keys }); }, true);
    const paneInit = async id => id === 'guide' ? { type: 'data', entries: guideEntries(await loadSym()), focus: inPlay } : id === 'tree' ? graphMsg() : { type: 'sign', html: signHtml };
    function paneUp(id, m) { if (!m) return;
      if (m.type === 'show') showTerm(m.term, id === 'guide' ? 'guide' : id);
      else if (m.type === 'goto') gotoNode(m.node); else if (m.type === 'replay') replayNode(m.node); else if (m.type === 'clear') clearPath(); }
    const panesReady = import(LIB + 'proto_panes.js').then(M => { panes = M.createPanes({ lib: LIB, bc, button: pb, init: paneInit, onUp: paneUp,
        defaults: o.panes || (innerWidth >= 1100 ? { guide: 'frame', tree: 'frame', sign: 'inset' } : { guide: 'off', tree: 'off', sign: 'inset' }),   // o.panes: a page's own first state (a reader's choice is still remembered)
        onPlace: (id, p) => { if (id === 'sign') deliverSign(signHtml); if (id === 'guide' && p !== 'off') { if (!stub.hidden) guideFromStub(); else guideFig(); } } });
      return panes; }).catch(e => { console.error('pageflow: panes did not load', e); return null; });
    async function showTerm(word, via = 'api', options = {}) {
      const raw = String(word || '').trim(), k = alias[raw.toLowerCase().replace(/^show me\s+|^what is (the )?/, '').replace(/[^\p{L}\p{N} ]+/gu, '').trim()];
      if (!k) { announce('term-missing', raw, via); if (S.cc && !S.still) { stub.innerHTML = `<span class="w in">No “${escH(raw)}” on this page yet.</span>`; stub.hidden = false; stub.classList.add('dim'); deliverSign(''); } return false; }
      if (S.playing) pause('term'); else snapCur();
      announce('term-asked', k, via); markReturn(); if (S.still) live(); hush(); const g = ++S.gen, b = termBeat(k);
      S.term = b; S.step = Math.max(0, Math.min(options.step || 0, (b.steps?.length || 1) - 1)); S.stepDone = false; S.playing = !options.paused; S.pauseReason = null; visit('term', k); show(); const t = tgt(b); if (t) t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
      if (options.paused) { previewStep(b); snapCur(); show(); treeFeed(); return true; }
      try { await perform(b, g); } catch (e) { if (!(e instanceof Paused)) throw e; }
      // Doug 10-13: the caption stays when a term ends (dimmed, its words still clickable) until the next beat, term, CC or still
      if (g === S.gen) { S.playing = false; ++S.gen; show(); settleCaption(); stub.classList.add('dim'); }
      return true; }
    cc.addEventListener('click', () => { S.cc = !S.cc; try { localStorage.setItem('pageflow-cc', S.cc ? 'on' : 'off'); } catch {} if (!S.cc) layersOff(); else if (current().steps || S.playing) layers(current().steps?.[S.step] || current(), S.gen, speedOf(S.term ? 't:' + S.term.term : 'b' + S.i)); show(); });
    // one beat (or term) at its learned speed: run it, then hold for reading. auto: the hold passes on its own; manual: it
    // waits for next. Next pressed early teaches the pace (Doug 10-13: "if in auto user goes next then you learn the flow rate")
    // Opt in with beat/glossary.steps = [{title, say, enter?, run?(ctx)}].
    // begin(ctx) may activate the unit; begin({preview:true}) and step.enter()
    // restore a selected picture synchronously. onPause freezes visual work.
    // seekStep(i, {term?, playing:false}) previews; play()/resume() continues.
    // Native sentence steps: the player owns the cursor, cancellation and voice.
    // A pause keeps the current sentence; resume repeats it, then continues.
    function previewStep(b) {
      if (!b.steps) return;
      b.begin?.({ step: S.step, preview: true });
      b.steps[S.step]?.enter?.({ preview: true });
      layers(b.steps[S.step], S.gen, 99); settleCaption(); stub.classList.add('dim');
    }
    async function performSteps(b, g) {
      const sp = speedOf(b.term ? 't:' + b.term : 'b' + S.i), c = ctx(g, sp);
      S.stepDone = false; S.log.push({ beat: b.term ? 'term:' + b.term : S.i, step: S.step, t: performance.now(), speed: sp });
      await b.begin?.(c); c.live();
      for (; S.step < b.steps.length; S.step++) {
        c.live(); const step = b.steps[S.step]; S.skip = null;
        step.enter?.(); c.live(); layers(step, g, sp); speak(step.say || step.title, g);
        prepareLine(b.steps[S.step + 1]); snapCur(); treeFeed(); show();
        await step.run?.(c); c.live();
        const v = heldVoice();
        if (v) await c.until(v); else await c.rest(Math.max(1000, String(step.say || '').split(/\s+/).length * 220));
        c.live();
        if (S.mode === 'manual') { S.hold = true; show(); await c.next(); c.live(); S.hold = false; }
      }
      S.step = b.steps.length - 1; S.stepDone = true; S.hold = false;
      b.onEnd?.({ complete: true }); snapCur(); treeFeed(); if (!b.term) S.lastDone = S.i;
    }
    async function resume() {
      const b = current();
      if (!b.steps) return S.term ? showTerm(S.term.term, 'resume') : play(S.i, S.only);
      if (S.still) live(); hush(); const g = ++S.gen; S.playing = true; S.pauseReason = null;
      if (S.stepDone) S.step = 0;
      show();
      try {
        await performSteps(b, g); if (g !== S.gen) return;
        if (!b.term && !S.only && S.i + 1 < beats.length) return play(S.i + 1);
        S.playing = false; S.gen++; show(); settleCaption(); stub.classList.add('dim');
      } catch (e) { if (!(e instanceof Paused)) { S.playing = false; show(); throw e; } }
    }
    async function seekStep(index, { term, playing = false } = {}) {
      if (term && S.term?.term !== term) {
        await showTerm(term, 'step', { step: index, paused: true });
      } else {
        pause('seek'); const b = current(); if (!b.steps) return;
        S.step = clamp(index, 0, b.steps.length - 1); S.stepDone = false;
        previewStep(b); snapCur(); treeFeed(); show();
      }
      if (playing) return resume();
    }
    async function perform(b, g) {
      if (b.steps) return performSteps(b, g);
      const k = b.term ? 't:' + b.term : 'b' + S.i, sp = speedOf(k), t0 = performance.now(); S.skip = null; S.skipQuiet = false;
      S.log.push({ beat: b.term ? 'term:' + b.term : S.i, t: t0, speed: sp }); const c = ctx(g, sp); if (b.enter) try { b.enter(); } catch {} layers(b, g, sp); speak(b.say || b.title, g); prepareInner(b); if (!b.term) prepareLine(beats[S.i + 1]);
      let th = 0, readMs = 0;
      try { await c.rest(RM ? 0 : 650); await b.run(c);
        readMs = RM ? 0 : 700 + String(b.say || b.title).split(/\s+/).length * 280; th = performance.now(); S.hold = true; show();
        if (S.mode === 'manual' && !b.term) await c.next();
        else if (S.voice && voiceTail) { const t1 = performance.now();   // voice on: the spoken line sets the pace, then a breath;
          if (await c.until(voiceTail)) await c.rest(RM ? 0 : 700);       // a line that was not heard (stopped, no audio yet) falls back to reading time
          else await c.rest(Math.max(0, readMs - (performance.now() - t1))); }
        else await c.rest(readMs);
      } catch (e) { if (e instanceof Paused && S.hold && S.mode === 'auto' && S.pauseReason === 'reader') learn(k, 0.85, 'paused to read'); throw e; }
      finally { S.hold = false; }
      const now = performance.now();
      if (S.skip === g && !S.skipQuiet) { const e = S.skipAt - t0, full = RT[k]?.full;
        if (S.skipHold && S.mode === 'manual') { const exp = readMs / sp, held = S.skipAt - th; if (held < 4 * exp) learn(k, exp / Math.max(300, held), 'next in manual'); }   // a long dwell (away) teaches nothing
        else learn(k, full ? (full / sp) / Math.max(300, e) : 1.3, 'next before the end'); }
      else if (S.skip !== g && (S.mode === 'auto' || b.term)) { const e = RT[k] || (RT[k] = { f: 1, n: 0 }); e.full = Math.round((now - t0) * sp); saveRates(); }
      snapCur(); if (!b.term) S.lastDone = S.i; }
    async function play(from = S.i, only = false) {
      if (arguments.length === 0) return resume();
      if (typeof from !== 'number') from = S.i;
      if (S.playing) pause('play'); else snapCur();
      if (S.still) live(); hush(); S.ret = null; const g = ++S.gen; S.i = from; S.only = only; S.playing = true; S.term = null; S.pauseReason = null; show();
      try { for (; S.i < beats.length; S.i++) { if (only && S.i > from) break; S.step = 0; S.stepDone = false; show(); const b = beats[S.i], t = tgt(b);
          if (t) t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
          visit('beat', S.i); await perform(b, g); }
        S.i = Math.min(S.i, beats.length - 1); S.playing = false; S.gen++; show(); settleCaption(); stub.classList.add('dim');
      } catch (e) { if (!(e instanceof Paused)) { S.playing = false; show(); throw e; } } }
    // next: in a beat, finish it now (the figure lands where the beat ends) and go on; between beats, play the next one
    function next() { if (S.still) { live(); return; }
      if (current().steps) { const b = current(); if (S.step < b.steps.length - 1) return seekStep(S.step + 1, { playing: S.playing });
        if (b.term) return pause('end'); if (S.i + 1 < beats.length) return play(S.i + 1); return pause('end'); }
      if (S.playing) { hush(); S.skip = S.gen; S.skipAt = performance.now(); S.skipHold = S.hold; wakeAll(); return; }
      const to = S.lastDone >= S.i ? S.i + 1 : S.i; if (to < beats.length) play(to); }
    function pause(reason = 'api') { hush(); if (!S.playing) return; S.pauseReason = reason; S.gen++; S.playing = false; wakeAll();   // S.hold stays until the beat's finally: its catch reads it.
      if (current().steps) S.hold = false; current().onPause?.(); snapCur(); show();
      settleCaption(); stub.classList.add('dim'); }
    // ▶ is a reader's press: it also wakes the voice's audio, for a browser that held it asleep until one
    pp.addEventListener('click', () => { if (pp.classList.contains('needpress')) { needPress(false);
        getVoice().then(V => V.resume().then(() => { if (S.playing && lastSay) speak(lastSay, S.gen); }), () => {}); if (!S.playing) play(); return; }
      if (S.voice) getVoice().then(V => V.resume(), () => {}); S.playing ? pause('button') : play(); });
    vo.addEventListener('click', () => { S.voice = !S.voice; ls.set('pageflow-voice', S.voice ? 'on' : 'off');
      if (!S.voice) { hush(); vo.classList.remove('busy'); vo.title = 'Brot voice off. Click to speak the captions'; show(); return; }
      const pressedGen = S.gen;
      vo.classList.add('busy'); vo.title = 'Brot voice: loading (the first time about 45 MB)…'; show();
      getVoice().then(V => { V.resume(); if (voiceWarm) warmed(); else if (!(S.playing && lastSay)) warmUp(beats[S.i] || beats[0]);   // busy until a line is formed
        if (S.playing && lastSay && S.gen === pressedGen) speak(lastSay, S.gen); show(); }, voiceFail); });
    rr.addEventListener('click', () => S.term ? showTerm(S.term.term, 'restart') : play(S.i, S.only));
    nx.addEventListener('click', next); bk.addEventListener('click', back); ag.addEventListener('click', again);
    md.addEventListener('click', () => { S.mode = S.mode === 'auto' ? 'manual' : 'auto'; ls.set('pageflow-mode', S.mode);
      if (S.playing && S.hold && S.mode === 'auto') { S.skip = S.gen; S.skipQuiet = true; S.skipHold = true; S.skipAt = performance.now(); wakeAll(); }   // waiting in manual: auto goes on, learning nothing
      show(); });
    // any trusted input from the reader, outside the bar and the panes, pauses (the figure stays where the beat left it);
    // → is next. A click on a caption word asks that word instead.
    const onInput = e => { if (!e.isTrusted || !S.playing) return; if (e.target.closest?.('#pf, #pfpop, #pfdock, #pfpanes, #pfstub .w.t, [data-pageflow-controls]')) return;
      if (e.type === 'keydown' && e.key === 'ArrowRight') return; pause('reader'); };
    for (const t of ['pointerdown', 'wheel', 'keydown', 'touchstart']) addEventListener(t, onInput, { capture: true, passive: true });
    addEventListener('keydown', e => { if (e.key !== 'ArrowRight' || S.still || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('input, textarea, select, [contenteditable], [data-pageflow-controls]')) return;
      e.preventDefault(); next(); });
    function still() { pause('still'); S.still = true; pop.hidden = true; layersOff(); show(); o.onStill?.(); }
    function live() { S.still = false; show(); o.onLive?.(); }
    x.addEventListener('click', still); pill.addEventListener('click', live);
    // No background RAF for pages without ambient work, during playback, while still, or while hidden.
    // o.resting(): the page's own rest (brotoid's idle rest, 10-18) stops the ambient without stilling the flow, so captions stay; o.wake() restarts it
    const wantsAmbient = () => !S.still && !S.playing && !RM && !document.hidden && !o.resting?.() && typeof o.ambient === 'function';
    function syncAmbient() { if (!wantsAmbient()) { cancelAnimationFrame(ambientRAF); ambientRAF = 0; return; }
      if (!ambientRAF) { ambientLast = performance.now(); ambientRAF = requestAnimationFrame(ambientFrame); } }
    function ambientFrame(now) { ambientRAF = 0; if (!wantsAmbient()) return; const dt = Math.min(0.1, (now - ambientLast) / 1000); ambientLast = now;
      o.ambient(dt); if (wantsAmbient()) ambientRAF = requestAnimationFrame(ambientFrame); }
    document.addEventListener('visibilitychange', syncAmbient);
    addEventListener('message', e => { if (e.origin === location.origin && e.data?.type === 'pageflow-show') showTerm(e.data.term, 'message'); });
    if (bc) bc.onmessage = e => { const d = e.data || {}; if (d.path && d.path !== location.pathname) return;
      if (d.type === 'show') showTerm(d.term, 'channel');
      else if (/^pane-(hello|up|dock|bye)$/.test(d.type || '')) panesReady.then(p => p?.handle(d)); };
    const glossary = () => Object.entries(GL).map(([k, v]) => ({ term: k, label: v.label || k, aliases: v.aliases || [], say: String(v.say || '').replace(/\*\*/g, ''), glyph: v.glyph || null }));
    show(); if (S.still) o.onStill?.(); else o.onLive?.();
    const ask = Q.get('show'); if (ask) setTimeout(() => showTerm(ask, 'url'), 900);
    return { play, pause, resume, seekStep, next, back, again, markReturn, still, live, wake: syncAmbient, showTerm, glossary, state: S, beats, layers: { stub, sign, marquee: bt, cc },
      mode: m => { if (m) { S.mode = m === 'manual' ? 'manual' : 'auto'; ls.set('pageflow-mode', S.mode); show(); } return S.mode; },
      pace: { speedOf, RT, RR, log: S.learnLog, reset: () => { for (const k in RT) delete RT[k]; RR.r = 1; S.learnLog.length = 0; saveRates(); } },
      path: { get: () => P, goto: gotoNode, replay: replayNode, clear: clearPath, graph: graphMsg },
      voice: { on: () => S.voice, engine: () => voiceP, stop: hush },
      panes: { ready: panesReady, set: (id, p) => panes?.set(id, p), place: placeOf, inst: id => panes?.inst(id) } };
  }
  window.Pageflow = { figs, mount, reducedMotion: RM };
})();
