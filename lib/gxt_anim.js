/**
 * gxt_anim.js — shared animation toolkit for this project's GXT tools.
 *
 * Extracts mechanics that were independently duplicated across six GXT
 * files this session (Doug, 2026-08-05: "we need an animate.js-like tool"):
 * an easing function, a beat/state-machine (DURATION map + ORDER array +
 * progress-since-stateStart + reached()), an rAF play/pause loop, and a
 * canvas-resize-observer. Every one of palindrome_gxt.js, sign_drift_gxt.js,
 * quadrature_triangle_gxt.js, vector_scan_gxt.js had byte-for-byte identical
 * easeInOutQuad; permutation_residual_gxt.js and mobius_traveler_gxt.js had
 * their own separate rAF-loop and resize boilerplate. This is a retrofit of
 * shared MECHANICS, not a rewrite of any component's visual content — every
 * number/beat-name/timing each tool already had stays exactly what it was.
 *
 * Deliberately NOT forced onto every component uniformly: mobius_traveler_gxt.js
 * (continuous orbiting/traveling) and, elsewhere in the ecosystem,
 * flat_brot's hand_meter_gxt.js are continuous-mode animations, not discrete
 * transient beats — they use createLoop()/autoResizeCanvas() here but not
 * createBeatMachine(), because that abstraction genuinely doesn't fit their
 * shape. Don't force it there.
 *
 * ── THREE CONVENTIONS FOR PAGES THAT HOST THESE COMPONENTS ────────────────
 * All three exist because each one cost real debugging time on 2026-08-05, and
 * all three failed the same way: the page looked fine and was wrong.
 *
 * 1. EXPOSE THE LIVE CONTROLLER. A host page must put its mounted ctrl(s) on
 *    window — `window.__gxt = { panel, wide }` in a screentest,
 *    `SP_DEBUG.gxt()` in audio_player.html. Without it the only way to check a
 *    beat is to catch a real-time playback window mid-paragraph, and an
 *    auto-advance into the next chapter's beatless first item renders an IDLE
 *    canvas that looks exactly like a broken component. That misread happened
 *    twice in one session before the hook existed. Two lines; highest-leverage
 *    change of the day.
 *
 * 2. TEST AT THE ASPECT THAT SHIPS, FIRST. The audio player's GXT panel is
 *    ~784x273 (aspect ~0.35); a screentest at a comfortable 2:1 is a different
 *    picture. boolean_lattice_gxt.js drew its label at h*0.12 while padding the
 *    lattice by min(w,h)*0.12 — a guaranteed collision at EVERY aspect, which
 *    read as a near-miss at 2:1 and shipped. Panel aspect leads; 2:1 is the
 *    secondary read, not the primary one.
 *
 * 3. CACHE-BUST COMPONENT IMPORTS. Load components as
 *    `import(`./lib/x.js?v=${Date.now()}`)`, not a static import. A soft reload
 *    re-fetches the HTML but serves the ES module from cache, so an edit is
 *    invisible and you verify a fix that isn't loaded. Verified behaviourally:
 *    before the change, the same URL served a stale module across reloads.
 *
 * 4. PIN THE TAB, AND TAG THE PAYLOAD. `webcmd eval` targets whatever the
 *    extension's current tab is, and that MOVES — another agent opening a page,
 *    or several copies of the player being open at once. A polling loop then
 *    silently reads a different page than it wrote to. This produced a 43-beat
 *    result on a 41-beat script, complete with duplicated beats and beats from
 *    chapters that were never played — all of it fiction. Before any timed run:
 *      webcmd claim --tab N && webcmd focus-lock --tab N
 *    and put a `window.__TAG` in the instrumentation, echoed in every poll, so a
 *    hop shows up as a changed tag instead of as a plausible wrong number.
 *
 * And one about the components themselves: a picture that looks right is not
 * evidence the code behind it is right. defect_sphere_gxt.js passed its own
 * numeric check at every subset size with a deliberate off-by-one injected,
 * because a shifted subset lands on ANOTHER VALID lattice direction. Assert
 * STRUCTURE (support size, distinctness), not just measured agreement.
 *
 * The common thread in all five: every one of them produced a CONFIDENT WRONG
 * ANSWER rather than an error. That is the failure mode to design against here.
 */

// ── Easing ───────────────────────────────────────────────────────────────
// outBack has a deliberate small overshoot — reserved for "landing" moments
// (a label/stamp popping in on a reveal beat), not for geometry in motion
// (an overshooting line reads as a glitch; an overshooting label reads as a
// deliberate snap). Per Doug's edu-tainment note: game-feel on pacing/payoff,
// never on the claims themselves.
export const Ease = {
  linear: (t) => t,
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

// pulse(nowMs, opts) — a continuous 0..1..0 attention cue for "watch this
// region, it's about to change" (Doug, 2026-08-05: "look at the pulsating
// number|region, then see it transform to..."). NOT tied to a beat — this
// runs off wall-clock time directly, so a component calls it every frame
// while a region is "armed" (waiting to transform), independent of the
// beat machine's own state timing. periodMs is a full pulse cycle; default
// settles into a gentle breathing rate, not a strobe.
export function pulse(nowMs, opts = {}) {
  const period = opts.periodMs ?? 1100;
  const min = opts.min ?? 0.35;
  const max = opts.max ?? 1;
  const phase = (nowMs % period) / period;             // 0..1
  const s = (1 - Math.cos(phase * Math.PI * 2)) / 2;    // 0..1..0, smooth
  return min + (max - min) * s;
}

// ── Beat/state machine ──────────────────────────────────────────────────
// durations: { beatName: ms, ... }. State order (for reached()) is 'idle'
// followed by Object.keys(durations) in declaration order — matches every
// existing component's own hand-written ORDER array exactly, since object
// key order already matched declaration order in all of them.
export function createBeatMachine(durations, opts = {}) {
  const defaultEase = opts.ease || Ease.inOutQuad;
  const order = ['idle', ...Object.keys(durations)];
  let state = 'idle';
  let stateStart = performance.now();

  const idx = (name) => order.indexOf(name);

  return {
    get state() { return state; },
    beat(name) {
      if (name !== 'idle' && !(name in durations)) return false;
      state = name;
      stateStart = performance.now();
      return true;
    },
    reset() { state = 'idle'; stateStart = performance.now(); },
    is(name) { return state === name; },
    reached(name) { return idx(state) >= idx(name); },
    // raw 0..1 linear progress since this state began
    raw() { return Math.min(1, (performance.now() - stateStart) / (durations[state] || 1)); },
    // eased progress — pass a per-call ease fn to override the machine default
    t(easeFn) { return (easeFn || defaultEase)(Math.min(1, (performance.now() - stateStart) / (durations[state] || 1))); },
    // settle() — jump to the settled end of the current beat, so raw()/t()
    // both read 1 on the very next call. Beat progress is otherwise
    // wall-clock coupled (raw()/t() measure real elapsed time), so a still
    // could previously only be WAITED for, never ASKED for — the root cause
    // behind every capture tool's own settle-heuristic and the silent
    // duplicate-frame bug when a capture tab loses OS focus (rAF throttled,
    // wall clock keeps moving, canvas never repaints). settle() then
    // step() makes a still deterministic and immune to both. Contract-level
    // addition, html.gxt_contract "Stills" section (brotdocs, 2026-08-10;
    // measurement and proposal: insights).
    settle() { stateStart = performance.now() - ((durations[state] || 1) + 1); },
  };
}

// ── rAF play/pause loop ─────────────────────────────────────────────────
// drawFn receives the rAF timestamp (dt-based components need it) and may
// call this loop's own pause() to self-terminate (e.g. an interpolation
// that stops once it reaches its target) — frame() checks `running` AFTER
// drawFn returns, before deciding whether to reschedule, so a self-pause
// during drawFn actually takes effect instead of one extra frame sneaking
// through.
export function createLoop(drawFn) {
  let running = false, animId = 0;
  function frame(ts) {
    drawFn(ts);
    if (running) animId = requestAnimationFrame(frame);
  }
  return {
    get running() { return running; },
    play() { if (!running) { running = true; frame(performance.now()); } },
    pause() { running = false; cancelAnimationFrame(animId); },
    // step(ts) — draw exactly one frame, synchronously, without touching
    // `running` or scheduling rAF. Paired with createBeatMachine's settle():
    // `ctrl.beat(name); ctrl.settle(); ctrl.step();` leaves the canvas
    // holding the settled frame immediately, for capture code that wants a
    // still on demand rather than a live, playing component.
    step(ts) { drawFn(ts ?? performance.now()); },
  };
}

// ── Canvas auto-resize ───────────────────────────────────────────────────
// Mirrors every component's existing syncSize()+ResizeObserver pattern
// exactly (offsetWidth/offsetHeight, fallback to parent clientWidth, aspect
// ratio for height). Calls onResize() once immediately, matching the prior
// draw()-on-mount behavior.
//
// FIRST CALL ALWAYS FIRES onResize(), even if the backing store already
// matches the CSS box — insights, capturing thumbnails 2026-08-11: a host
// that pre-sizes the canvas to the box it wants (exactly what a player
// shell mounting into a known-size slot does — T-009's own situation)
// hits `canvas.width===w && canvas.height===h` on the very first sync(),
// so onResize() never fires, and any tool that draws exclusively from that
// callback never paints its first frame. No error, healthy frame rate,
// just a blank canvas — 12 of 25 surveyed components went blank exactly
// this way, silently. Costs one redundant draw at mount for every
// caller that WASN'T pre-sized; correctness for every caller that was.
// opts.dpr — cloud, 2026-08-21: this set canvas.width = offsetWidth with no
// devicePixelRatio, so the BACKING STORE sat at CSS pixels. Canvas2D survives that
// because the browser rescales; a WebGL drawing buffer does not, and every GL tool
// built on this helper was soft on a HiDPI display.
//
// DEFAULT IS STILL 1, deliberately. Raising it silently would break every existing
// caller: their draw code reads canvas.width as the LOGICAL size, so a 2x backing
// store would draw everything at half scale in one corner. Opting in is therefore a
// two-part contract — pass dpr, and use the CSS size handed to onResize:
//
//   autoResizeCanvas(canvas, (w, h, dpr) => { ctx.setTransform(dpr,0,0,dpr,0,0); draw(w,h); },
//                    { dpr: true });
//
// dpr: true → devicePixelRatio capped at 2; a number → that exact ratio.
//
// THE HOST MUST GIVE THE CANVAS A CSS HEIGHT (or aspect-ratio). With height:auto the displayed height follows the
// backing store, offsetHeight (border included) is read back into canvas.height, the parent resizes, the observer
// fires, and the canvas grows a little every frame (fable/web/orchard/flow.html, 2026-09-24: 606 → 640 px in 0.5 s,
// caught by a same-state pixel-purity check, not by eye).
export function autoResizeCanvas(canvas, onResize, opts = {}) {
  const aspect = opts.aspect ?? 0.4;
  const dpr = opts.dpr === true ? Math.min(2, globalThis.devicePixelRatio || 1)
            : (typeof opts.dpr === 'number' ? opts.dpr : 1);
  let first = true;
  function sync() {
    const w = canvas.offsetWidth || canvas.parentElement?.clientWidth || 600;
    const h = canvas.offsetHeight || Math.round(w * aspect);
    const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    const changed = canvas.width !== bw || canvas.height !== bh;
    if (changed) { canvas.width = bw; canvas.height = bh; }
    if (changed || first) onResize(w, h, dpr);
    first = false;
  }
  sync();
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(sync).observe(canvas.parentElement || canvas);
  }
  return sync;
}

// ── wireGxt — the gxt:* CustomEvent channel, as one shared adapter ───────
// cloud's design (2026-08-21), taken over their own alternative and mine. The
// audit that prompted it: of fable/web/lib's 24 modules, 24/24 matched
// mount(canvas,opts)->ctrl but 0/24 implemented html.gxt_contract's event
// channel and only 2/24 had destroy(). The two options on the table were
// retrofit-all-24 by hand, or amend the contract to bless two conventions —
// the first is 24x the work plus retesting, the second gives up the one
// property that made the contract worth writing (a host driving a tool it has
// never heard of). This is the third: retrofitting becomes ONE line.
//
//   return wireGxt(canvas, { beat, play, pause, reset, ...NOOP_STAGE_API });
//
// It lives here and not in host code on purpose: a host that must remember to
// wrap is a host that will forget, which fails the same way as no channel.
//
// Defaults cover the contract's own verbs, so most tools pass no map at all:
//   gxt:beat {name,...}  -> ctrl.beat(name, detail)
//   gxt:set  {...}       -> ctrl.setState(detail), or ctrl.set(detail)
// Pass `map` to add or override; a cue with no handler is IGNORED, never an
// error, because one host drives many tools and most cues are not for you.
//
// AWAITABLE CUES: if a handler returns a promise (insights' camera verbs do),
// the canvas fires 'gxt:arrive' {name} when it settles, so a narration cue can
// wait for the move to land instead of guessing a sleep. Matches the convention
// insights built against this file's own tools.
export function wireGxt(canvas, ctrl, map = {}) {
  const dflt = {
    'gxt:beat': (d, c) => c.beat && c.beat(d.name ?? d, d),
    'gxt:set':  (d, c) => (c.setState || c.set) && (c.setState || c.set).call(c, d),
  };
  const all = { ...dflt, ...map };
  const bound = [];
  for (const [evt, handler] of Object.entries(all)) {
    if (typeof handler !== 'function') continue;
    const fn = (e) => {
      const d = e.detail || {};
      let r;
      try { r = handler(d, ctrl); } catch (err) { console.warn('[wireGxt]', evt, err); return; }
      if (r && typeof r.then === 'function') {
        r.then(() => canvas.dispatchEvent(new CustomEvent('gxt:arrive', { detail: { name: d.name ?? evt } })),
               () => {});
      }
    };
    canvas.addEventListener(evt, fn);
    bound.push([evt, fn]);
  }
  const prev = ctrl.destroy;
  ctrl.destroy = () => {
    for (const [evt, fn] of bound) canvas.removeEventListener(evt, fn);
    if (prev) prev.call(ctrl);
  };
  return ctrl;
}

// ── Standard no-op ctrl contract ────────────────────────────────────────
// Every GXT tool's returned ctrl spreads this in — goto()/playStage()/playTo()
// safeties plus STAGES:[] (no stage machine), matching hand_meter_gxt.js's
// original contract (flat_brot, not fable's file, referenced not copied).
export const NOOP_STAGE_API = { goto() {}, playStage() {}, playTo() {}, STAGES: [] };

// ── Shared orbit/camera — one drag driving several mounted GXTs ──────────
// T-003 (OBJ-001), unblocked 2026-08-11 once T-002 named a canonical sign
// convention: `az -= dx*0.008`, elevation clamp `1.4` ("ribbon" lineage —
// gxt_contract's "Camera convention" section). This object speaks ONLY that
// canonical convention; a GXT built on the other lineage ("bsplat":
// `az += dx*0.008`, clamp `1.55`) converts at the ONE place it reads
// `opts.orbit`, not by rewriting its own internal rotation math:
//
//   // ribbon-lineage GXT — already matches, reads canonical directly:
//   if (sharedOrbit) sharedOrbit.subscribe((a, e) => { az = a; el = e; });
//
//   // bsplat-lineage GXT — converts at the boundary. BOTH signs flip, not
//   // just azimuth — ledger #46 (2026-08-11): a differential test with a
//   // matrix-transpose bug had this backwards for a while ("elevation
//   // already agrees"); verified against actual source, corrected, it
//   // doesn't, and needs its own flip:
//   if (sharedOrbit) sharedOrbit.subscribe((a, e) => { rotAz = -a; rotEl = Math.max(-1.55, Math.min(1.55, -e)); });
//
// ⚠ KNOWN LIMITATION, not silently papered over: this sign-flip adapter is
// EXACT only when az=0 or el=0 (the two lineages compose their rotations in
// OPPOSITE ORDER — ribbon applies azimuth then elevation, bsplat applies
// elevation then azimuth; confirmed by direct matrix multiplication, not
// just formula-reading — 3D rotations don't commute, so a boundary sign
// adapter cannot fully reconcile two different composition orders). Away
// from the axes, expect a small, growing residual disagreement as az and el
// both move from zero together. Full agreement at all angles needs one
// lineage's actual rotation order changed, not just this adapter — filed
// as a follow-up, not solved here. This adapter is still a strict
// improvement over no adapter (which disagrees even AT the axes).
//
// Opt-in via `opts.orbit`; a GXT that doesn't pass it keeps its own private
// az/el and its own drag listener, exactly as before — nothing not opting in
// changes. `attachDrag` is meant to be called ONCE, on the container that
// wraps every composed pane, not per-canvas — that is the whole point of
// sharing one object instead of four independent listeners.
// ── T-015: share an ORIENTATION, not two Euler angles ───────────────────
// Two angles are not a camera. Ribbon composes Rx(el)·Ry(az); codon's cloud
// composes Ry(-az)·Rx(el). Fed the SAME (az, el) they hold different poses,
// and no sign convention on either angle can fix it — negating elevation to
// repair the axes turns codon's matrix into ribbon's exact TRANSPOSE, i.e.
// its inverse, so the panes counter-rotate at every pose but the identity.
// Verified to 0.00e+00 against both files' current source by
// insights/tools/orbit_orientation_check.py. A matrix has no composition
// order left to disagree about, so that is what travels between tools.
//
// LAYOUT IS THE HAZARD HERE, not the algebra — a row/column-major slip in
// exactly this pairing is ledger #46, which shipped an inverted finding to
// four agents. So: orbitMatrix() returns ROW-major and says so in its name's
// documentation, columnMajor() is the only way to get the other layout, and
// every WebGL upload site calls it explicitly rather than relying on how the
// nine floats happen to be ordered.
export function orbitMatrix(az, el) {
  const ca = Math.cos(az), sa = Math.sin(az);
  const ce = Math.cos(el), se = Math.sin(el);
  // Rx(el) · Ry(az) — ribbon's own composition, canonical per T-002. Rows 0
  // and 1 are exactly ribbon's orbitProject(), which is asserted rather than
  // assumed in the check script above.
  return [ca, 0, -sa,
          -se * sa, ce, -se * ca,
          ce * sa, se, ce * ca];
}

// Row-major 9 -> the column-major 9 `gl.uniformMatrix3fv(loc, false, m)` wants.
export function columnMajor(m) {
  return [m[0], m[3], m[6],
          m[1], m[4], m[7],
          m[2], m[5], m[8]];
}

export function createSharedOrbit(opts = {}) {
  let az = opts.az ?? 0, el = opts.el ?? 0;
  const subs = new Set();
  // Third argument is the canonical orientation. Existing two-argument
  // subscribers keep working untouched; a tool that can take a pose should
  // prefer it, because the angles are only unambiguous within one lineage.
  function notify() { const m = orbitMatrix(az, el); for (const fn of subs) fn(az, el, m); }
  return {
    get az() { return az; }, get el() { return el; },
    get matrix() { return orbitMatrix(az, el); },
    set(a, e) { az = a; el = Math.max(-1.4, Math.min(1.4, e)); notify(); },
    subscribe(fn) { subs.add(fn); fn(az, el, orbitMatrix(az, el)); return () => subs.delete(fn); },
    attachDrag(el_) {
      let dragging = false, lastX = 0, lastY = 0;
      el_.addEventListener('mousedown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
      addEventListener('mouseup', () => { dragging = false; });
      addEventListener('mousemove', (e) => {
        if (!dragging) return;
        this.set(az - (e.clientX - lastX) * 0.008, el + (e.clientY - lastY) * 0.008);
        lastX = e.clientX; lastY = e.clientY;
      });
    },
  };
}

// ── Combined capture — compositing N stacked canvases into one ───────────
// T-005 (OBJ-001). canvas.toDataURL()/captureStream() only ever see that
// canvas's own backing buffer, never what the browser composited above or
// below it — so a page stacking several GXTs (PROPOSAL_gxt_shared_scene.md
// item 3) has no single canvas holding "the picture," only the compositor
// does. drawImage() into an offscreen target in z-order fixes that for both
// stills (targetCanvas.toDataURL()) and video (targetCanvas.captureStream()
// into a MediaRecorder) — same technique either way, no OS screencapture.
//
// REQUIRES preserveDrawingBuffer:true on any WebGL source canvas (or a
// same-frame read, before its implicit clear) — without it drawImage() reads
// back BLACK for that layer while this function itself reports nothing
// wrong, since drawImage() doesn't throw on an empty/cleared source. That
// silent-failure shape is exactly why this is stated here rather than left
// as something that happens to work in the two files that currently do it
// right (toothpaste_ribbon_webgl_gxt.js, codon's cloud). See gxt_contract's
// "Camera convention"-adjacent capture section for the stated requirement.
export function compositeLayers(targetCanvas, sourceCanvases) {
  const ctx = targetCanvas.getContext('2d');
  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  for (const src of sourceCanvases) ctx.drawImage(src, 0, 0, targetCanvas.width, targetCanvas.height);
  return targetCanvas;
}

// ── Scene compositing — N canvases at arbitrary rects (T-009, OBJ-001) ────
// compositeLayers() above stacks every source at 0,0 scaled to the target: the
// right shape for LAYERS (one slot, z-ordered) and the wrong one for a SCENE
// (N slots side by side, each with its own layer stack). The player shell
// needs both, so this is additive — compositeLayers is untouched and still the
// answer for a pure stack.
//
// items: [{ canvas, x, y, w, h }] in draw order. Coordinates are in TARGET
// pixels, so the caller owns layout and this owns nothing but the blit.
// Same preserveDrawingBuffer requirement as compositeLayers: a WebGL source
// without it reads back BLACK here too, silently.
export function compositeScene(targetCanvas, items, opts = {}) {
  const ctx = targetCanvas.getContext('2d');
  if (opts.background) {
    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  } else {
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  }
  for (const it of items) {
    if (!it || !it.canvas) continue;
    const w = it.w ?? targetCanvas.width, h = it.h ?? targetCanvas.height;
    if (w <= 0 || h <= 0) continue;
    ctx.drawImage(it.canvas, it.x ?? 0, it.y ?? 0, w, h);
  }
  return targetCanvas;
}

// ── Structure gate for captures — T-014 (OBJ-001) ────────────────────────
// "A picture that looks right is not evidence the code is right" (contract,
// debugging rule 5). Both known capture failures in this codebase are SILENT
// and produce a plausible still: a WebGL layer without preserveDrawingBuffer
// composites pure black, and an SVG rasterized through an Image element drops
// every subresource it could not inline, leaving those regions empty while the
// surrounding picture renders perfectly.
//
// So capture code asserts INK IN THE REGIONS THAT MUST HAVE IT, per region,
// rather than checking that the overall image is non-blank — a whole-image
// check passes comfortably while the only parts that mattered are missing.
//
// Threshold discipline (insights' ledger #67): a fire-condition stated as an
// absolute number is an instrument with no noise floor. Pass `controlRects`
// covering areas that are SUPPOSED to be blank; the floor is measured from
// them and each required region must beat it by `factor`. With no controls
// given it falls back to `minInk`, and says so in the report.
export function regionInk(canvas, rects, opts = {}) {
  const { tol = 12, controlRects = null, factor = 4, minInk = 0.02, minDistinct = 24 } = opts;
  const ctx = canvas.getContext('2d');

  function measure(r) {
    const x = Math.max(0, Math.round(r.x)), y = Math.max(0, Math.round(r.y));
    const w = Math.min(canvas.width - x, Math.round(r.w));
    const h = Math.min(canvas.height - y, Math.round(r.h));
    if (w <= 0 || h <= 0) return { ink: 0, distinct: 0, px: 0, degenerate: true };
    const d = ctx.getImageData(x, y, w, h).data;
    const n = w * h;
    // modal quantized colour = the region's own background, whatever it is —
    // never assume the page's background colour here, since a region may sit
    // over a panel, a gradient, or another layer.
    // Bucket to find the modal colour, but keep each bucket's running SUM so
    // the reference is the bucket's actual mean rather than its centre. Using
    // the centre is a real bug with a confusing signature: a perfectly uniform
    // region whose colour sits near a bucket edge reads as 100% ink, so the
    // gate fires on blank and inked regions alike and looks "strict" rather
    // than broken. Caught by the negative test on first run, 2026-08-20.
    const hist = new Map();
    for (let i = 0; i < n; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      const k = (r >> 4) + ',' + (g >> 4) + ',' + (b >> 4);
      let e = hist.get(k);
      if (!e) { e = { c: 0, r: 0, g: 0, b: 0 }; hist.set(k, e); }
      e.c++; e.r += r; e.g += g; e.b += b;
    }
    let modal = null, best = -1;
    for (const e of hist.values()) if (e.c > best) { best = e.c; modal = e; }
    const mr = modal.r / modal.c, mg = modal.g / modal.c, mb = modal.b / modal.c;
    let ink = 0;
    for (let i = 0; i < n; i++) {
      if (Math.abs(d[i * 4] - mr) + Math.abs(d[i * 4 + 1] - mg) + Math.abs(d[i * 4 + 2] - mb) > tol) ink++;
    }
    return { ink: ink / n, distinct: hist.size, px: n, degenerate: false };
  }

  const measured = rects.map((r, i) => ({ i, label: r.label ?? `region ${i}`, ...measure(r) }));

  // TWO discriminators, because ink alone does not separate the failure this
  // gate exists for — measured, not assumed (fable, 2026-08-20, T-014):
  //
  //   case                     min ink   distinct
  //   content present           0.182     29..62
  //   subresource dropped       0.060      3..16   <- the silent failure
  //   region genuinely blank    0.000      1..3
  //
  // A dropped subresource leaves the surrounding borders and panel behind, so
  // it still scores 0.06 ink — six hundred times the blank-strip floor, and it
  // sails through an ink-only gate. What actually separates it is COLOUR
  // DIVERSITY: real content here is a dense point cloud, its absence is a few
  // flat edges. The first version of this gate checked ink only and passed the
  // sabotage run; that is why the negative test is part of the deliverable and
  // not an optional extra.
  let floor = minInk, basis = `minInk fallback (${minInk}) — no controlRects given`;
  let distinctFloor = minDistinct, distinctBasis = `minDistinct (${minDistinct})`;
  if (controlRects && controlRects.length) {
    const c = controlRects.map(measure);
    const worstInk = Math.max(...c.map(m => m.ink));
    const worstDistinct = Math.max(...c.map(m => m.distinct));
    floor = Math.max(worstInk * factor, 1e-4);
    basis = `${c.length} blank control(s): worst ink ${worstInk.toFixed(5)} × ${factor}`;
    distinctFloor = Math.max(worstDistinct * factor, minDistinct);
    distinctBasis = `max(${worstDistinct} × ${factor}, minDistinct ${minDistinct})`;
  }
  const empty = measured.filter(m => m.degenerate || m.ink < floor || m.distinct < distinctFloor);
  const margin = measured.length
    ? Math.min(...measured.map(m => m.distinct)) - distinctFloor
    : null;
  return {
    ok: empty.length === 0,
    floor, basis, distinctFloor, distinctBasis, margin,
    regions: measured, empty,
  };
}

// ── DOM-hosted (SVG) capture — T-014 (OBJ-001) ───────────────────────────
// The contract names DOM-hosted GXTs as a legitimate second shape but leaves
// capture unspecified for them; codon_waterfall_gxt.js is the one component of
// 30 the canvas thumbnail harness cannot photograph, because its mount()
// replaces the canvas it was handed with an <svg>.
//
// CORRECTION TO THE RECORDED OBSTACLE (fable, 2026-08-20, measured not
// assumed). T-014's ticket says twice that the waterfall emits <image>
// elements with HTTP hrefs, so the naive path would return a plausible still
// with those regions empty. Measured on the live component: 13 <image>
// elements, ALL `blob:`, zero http, and no other external reference anywhere
// in the 76-node tree. The chips are self-contained SVG generated in memory
// (generateChipSVG) and handed to URL.createObjectURL. So the inlining is
// entirely local — fetch() reads a same-origin blob back without touching the
// network — and the http-fetch problem the ticket anticipated does not arise.
// The FAILURE SHAPE it warned about is real and unchanged, though: anything
// left un-inlined vanishes silently. Hence the mandatory structure gate.
export async function inlineExternalRefs(svgClone) {
  const HREF = ['href', 'xlink:href'];
  const nodes = [svgClone, ...svgClone.querySelectorAll('*')];
  const jobs = [];
  let inlined = 0, skipped = 0;
  for (const n of nodes) {
    for (const attr of HREF) {
      const v = n.getAttribute && n.getAttribute(attr);
      if (!v || v.startsWith('#') || v.startsWith('data:')) continue;
      jobs.push((async () => {
        try {
          const res = await fetch(v);
          const blob = await res.blob();
          const dataURI = await new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          });
          n.setAttribute(attr, dataURI);
          inlined++;
        } catch (e) { skipped++; }
      })());
    }
  }
  await Promise.all(jobs);
  return { inlined, skipped };
}

// Rasterize a live SVG element onto a canvas and PROVE the result carries the
// content it is supposed to. `requiredSelector` names the elements whose
// regions must contain ink (default: every <image>, i.e. exactly the ones the
// subresource trap would silently blank).
export async function captureDOMHosted(host, targetCanvas, opts = {}) {
  const svg = (host && host.tagName && host.tagName.toLowerCase() === 'svg')
    ? host
    : (host && host.id ? document.getElementById(host.id) : null);
  if (!svg || svg.tagName.toLowerCase() !== 'svg') {
    return { ok: false, error: 'no <svg> found — mount() replaces the host, so pass the live element or one with a stable id' };
  }

  const box = svg.getBoundingClientRect();
  const W = Math.round(opts.width ?? box.width);
  const H = Math.round(opts.height ?? box.height);
  if (!(W > 0 && H > 0)) return { ok: false, error: `SVG has zero size (${W}x${H}) — is it in the layout?` };

  targetCanvas.width = W; targetCanvas.height = H;

  // Expected-ink regions are read from the LIVE element (screen coords), then
  // scaled into target pixels — not computed from viewBox units, so this holds
  // whatever preserveAspectRatio/viewBox the component chose.
  const sx = W / box.width, sy = H / box.height;
  const required = [...svg.querySelectorAll(opts.requiredSelector ?? 'image')].map((el, i) => {
    const r = el.getBoundingClientRect();
    return { label: `${el.tagName}[${i}]`, x: (r.left - box.left) * sx, y: (r.top - box.top) * sy,
             w: r.width * sx, h: r.height * sy };
  });

  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.setAttribute('width', W);
  clone.setAttribute('height', H);
  if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const { inlined, skipped } = await inlineExternalRefs(clone);

  const xml = new XMLSerializer().serializeToString(clone);
  const url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));

  const img = new Image();
  const loaded = await new Promise((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
  if (!loaded) return { ok: false, error: 'SVG failed to load through Image()', inlined, skipped, bytes: xml.length };

  const ctx = targetCanvas.getContext('2d');
  if (opts.background) { ctx.fillStyle = opts.background; ctx.fillRect(0, 0, W, H); }
  else ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);

  // Controls: thin strips of the outer margin, which the waterfall leaves
  // empty. Gives the gate a measured noise floor instead of a bare constant.
  const controlRects = opts.controlRects ?? [
    { x: 1, y: 1, w: Math.max(2, W - 2), h: 4 },
    { x: 1, y: H - 5, w: Math.max(2, W - 2), h: 4 },
  ];
  const gate = required.length
    ? regionInk(targetCanvas, required, { controlRects, factor: opts.factor ?? 4, minInk: opts.minInk ?? 0.02 })
    : { ok: true, floor: 0, basis: 'no required regions', regions: [], empty: [] };

  return {
    ok: gate.ok && skipped === 0,
    width: W, height: H, inlined, skipped, bytes: xml.length,
    requiredCount: required.length, gate,
  };
}
