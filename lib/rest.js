/**
 * rest.js — a page rests when nobody is there, and wakes when someone is (fable 2026-10-23, first built for brotoid/'s Fig 2).
 * Doug 10-23: "need to auto sleep and be flow still after an idle time out. I want it that pages can rest when idle, and then
 * reanimate when the page has viewer activity." Doug's picks: 60 s; the chip says so and a small badge sits on each frozen picture.
 *
 * How: every requestAnimationFrame loop on the page, and in its same-origin frames (insights' brotoid_flow in Fig 2), is parked
 * while the page rests: a loop's next frame is held, not dropped, so each canvas keeps its last frame and the GPU does nothing.
 * Waking hands the held frames back to the browser; each loop goes on from where it stopped. No loop needs code of its own.
 *
 * SPEC (goal targets; tests in aicolab/tmp/proto_brotoid/spectest.mjs, S20):
 *   R1 after ?rest=N seconds (default 60) with no viewer input, the page rests: no rAF callback runs, on the page or in a frame.
 *   R2 any input from the reader wakes it at once: pointer move or press, wheel, key, touch, the tab shown again, the browser window
 *      resized. Nothing the page does to itself counts: events it dispatches (isTrusted false), and the trusted ones its own layout makes:
 *      a frame resized because a chip got longer (that woke the first build at once), scroll anchoring, a scripted focus().
 *   R3 while any Rest.busy(fn) returns true (a narrated track or a show-me playing, a gallery casting) it stays awake, and the idle
 *      count restarts when the last one ends. A resting page that turns busy (a track started from outside) wakes within a second.
 *   R4 resting, <html> has class 'resting', and each live picture carries a small "resting · move to wake" badge: per <figure>
 *      ([data-live] if the page marks them, else any not [data-fixed]) its largest visible canvas or frame; with no figures, any
 *      visible canvas or frame of 160 × 100 px or more. Pageflow's chips read "resting · move to wake" in place of "live".
 *   R5 ?rest=0 turns it off; so does a browser under automation (navigator.webdriver) unless ?rest=N is given, so a long test
 *      run never falls asleep halfway. Rest.state() reports it all.
 *
 *   <script src="../lib/rest.js"></script>   before any other script, so the page's own first frames are already gated
 *   Rest.busy(() => playing)   Rest.on(resting => …)   Rest.wake()   Rest.sleep()   Rest.state()
 */
(function () {
  if (window.Rest) return;
  const Q = new URLSearchParams(location.search), given = Q.has('rest'), sec = given ? +Q.get('rest') : 60;
  const on = sec > 0 && (given || !navigator.webdriver), idleMs = sec * 1000, PARK0 = 2 ** 30;
  const R = { resting: false, last: performance.now(), busy: [], subs: [], wins: [], rests: 0, wakes: 0 };
  const EVENTS = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart'];   // not scroll or focus: the page's own layout and scripts fire those

  // ---- the gate: a window's rAF parks its callback while resting; cancel finds it parked, or moved to the browser on waking
  function gate(win) { if (!win || win.__restGate) return; const nat = win.requestAnimationFrame.bind(win), natC = win.cancelAnimationFrame.bind(win);
    const G = win.__restGate = { win, nat, natC, parked: new Map(), moved: new Map(), id: PARK0 };
    win.requestAnimationFrame = cb => { if (!R.resting) return nat(cb); const id = G.id++; G.parked.set(id, cb); return id; };
    win.cancelAnimationFrame = id => { if (G.parked.delete(id)) return; if (G.moved.has(id)) { natC(G.moved.get(id)); G.moved.delete(id); return; } natC(id); };
    for (const t of EVENTS) win.addEventListener(t, poke, { capture: true, passive: true });
    if (win === window) win.addEventListener('resize', poke);   // the reader resized the browser; a frame resizes when the page lays itself out
    win.document.addEventListener('visibilitychange', () => { if (!win.document.hidden) poke({ isTrusted: true }); });
    R.wins.push(G); }
  function release(G) { G.moved.clear(); for (const [id, cb] of G.parked) G.moved.set(id, G.nat(cb)); G.parked.clear(); G.nat(() => G.moved.clear()); }

  // ---- same-origin frames: gated on every load (a frame that navigates is a new window); new frames are found as they arrive
  const seen = new WeakSet();
  function frame(fr) { if (seen.has(fr)) return; seen.add(fr); const go = () => { try { gate(fr.contentWindow); } catch (e) {} };   // cross-origin: left alone
    fr.addEventListener('load', go); if (fr.contentDocument?.readyState === 'complete') go(); }
  function frames(root) { root.querySelectorAll?.('iframe').forEach(frame); if (root.tagName === 'IFRAME') frame(root); }

  // ---- idle, busy, rest, wake
  function poke(e) { if (e && e.isTrusted === false) return; R.last = performance.now(); R.why = e?.type || 'shown'; if (R.resting) wake(); }
  const busyNow = () => R.busy.some(f => { try { return !!f(); } catch (e) { return false; } });
  function sleep() { if (R.resting) return; R.resting = true; R.rests++; document.documentElement.classList.add('resting'); badges(); tell(); }
  // a frame that navigated keeps its WindowProxy but has a new global: its old gate is stale (win.__restGate is the new one, or none)
  function wake() { if (!R.resting) return; R.resting = false; R.wakes++; R.wins = R.wins.filter(G => { try { return !G.win.closed && G.win.__restGate === G; } catch (e) { return false; } });
    R.wins.forEach(G => { try { release(G); } catch (e) { console.error(e); } }); document.documentElement.classList.remove('resting'); unbadge(); tell(); }
  function tell() { R.subs.forEach(f => { try { f(R.resting); } catch (e) { console.error(e); } }); }
  // busy wakes a resting page too: a track started from outside (a GBI delivery into an open tab) must not play onto parked loops
  function check() { if (!on) return; const now = performance.now(); if (busyNow()) { R.last = now; R.why = 'busy'; if (R.resting) wake(); return; } if (!R.resting && now - R.last >= idleMs) sleep(); }

  // ---- R4 the badge: one per live picture, in a layer of its own over the page (nothing in the page moves to make room)
  let layer = null;
  const shown = el => { if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return null; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? r : null; };
  function targets() { const figs = [...document.querySelectorAll('figure[data-live]')], list = figs.length ? figs : [...document.querySelectorAll('figure:not([data-fixed])')], out = [];
    for (const f of list) { let best = null, area = 0; f.querySelectorAll('canvas, iframe').forEach(c => { const r = shown(c); if (r && r.width * r.height > area) { area = r.width * r.height; best = r; } }); if (best) out.push(best); }
    if (!document.querySelector('figure')) document.querySelectorAll('canvas, iframe').forEach(c => { const r = shown(c); if (r && r.width >= 160 && r.height >= 100) out.push(r); });
    return out; }
  function badges() { unbadge(); layer = document.createElement('div'); layer.id = 'restlayer'; layer.setAttribute('aria-hidden', 'true');
    for (const r of targets()) { const b = document.createElement('span'); b.className = 'restbadge'; b.textContent = 'resting · move to wake';
      b.style.left = (r.left + scrollX + 8) + 'px'; b.style.top = (r.top + scrollY + 8) + 'px'; layer.appendChild(b); }
    document.body.appendChild(layer); }
  function unbadge() { layer?.remove(); layer = null; }
  const st = document.createElement('style');
  st.textContent = `#restlayer { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 45; }
#restlayer .restbadge { position: absolute; white-space: nowrap; font: 600 11px/1 system-ui, sans-serif; letter-spacing: .03em; color: #eee9e0;
  background: #0b0b10cc; border: 1px solid #eee9e055; border-radius: 999px; padding: 4px 9px; }
@media print { #restlayer { display: none; } }`;
  (document.head || document.documentElement).appendChild(st);

  gate(window);
  const boot = () => { frames(document); new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && frames(n)))).observe(document.documentElement, { childList: true, subtree: true }); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
  setInterval(check, 1000);

  window.Rest = { get resting() { return R.resting; },
    busy: f => { R.busy.push(f); }, on: f => { R.subs.push(f); }, wake: () => { R.last = performance.now(); wake(); }, sleep,
    state: () => ({ on, sec, resting: R.resting, idle: Math.round(performance.now() - R.last), why: R.why || null, busy: busyNow(), rests: R.rests, wakes: R.wakes,
      wins: R.wins.length, parked: R.wins.reduce((n, G) => n + G.parked.size, 0), badges: layer ? layer.children.length : 0 }) };
})();
