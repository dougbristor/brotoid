/**
 * sphere_setter.js — a 3-D direction (and length) input: a wireframe sphere rolling under a fixed pin, like a trackball.
 * Born as brotoid_light's q setter (Doug 10-11: "I love the controller"); lifted here 10-12 so other pages reuse one source.
 *
 * The pin stands still on the screen, leaning right and toward you. Drag rolls the sphere under it; the sphere's point
 * under the pin is the direction. The pin's length is the vector's length (one sphere radius = 1), set by the wheel over
 * the sphere or by the page (S.r = ...). In 'fixed' length mode the wheel is left to the page and only the page sets the length
 * (S.r): rolling and S.set(v) never change it (brotoid ties it to its ball size, Doug 10-12).
 * The sphere's lines are coloured by opts.hand(direction): true = cyan (keeps its hand), false = orange (mirrors), so the
 * border between the colours is where the hand flips. Body coordinates are [1, i, j].
 *
 * Classic script (works from classic pages and, as a side-effect import, from modules): defines window.SphereSetter.
 *   const S = SphereSetter.mount(canvas, { M0, r, rMax, length: 'free' | 'fixed', hand, tip, onInput });
 *   S.get() → vector · S.set(v) rolls the least that puts v under the pin (and takes |v| in 'free' mode)
 *   S.r, S.M (get/set) · S.draw() · S.P0 (the pin's foot, screen coordinates: x right, y up, z toward you)
 *   S.roll(dx, dy): what a drag of (dx, dy) client px does, input callback included (for a demo that operates the setter)
 */
(function (g) {
  const E = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const sub = (a, b) => a.map((v, k) => v - b[k]), add = (a, b) => a.map((v, k) => v + b[k]), sc = (a, s) => a.map(v => v * s);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = a => Math.hypot(a[0], a[1], a[2]);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const mv = (M, v) => M.map(r => dot(r, v)), T = A => A[0].map((_, j) => A.map(r => r[j]));
  const mm = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
  const rot = (ax, an) => { const l = nrm(ax); if (l < 1e-15 || !an) return E.map(r => r.slice()); const [x, y, z] = sc(ax, 1 / l), c = Math.cos(an), s = Math.sin(an), t = 1 - c;
    return [[t*x*x + c, t*x*y - s*z, t*x*z + s*y], [t*x*y + s*z, t*y*y + c, t*y*z - s*x], [t*x*z - s*y, t*y*z + s*x, t*z*z + c]]; };
  const ortho = M => { const a = sc(M[0], 1 / nrm(M[0])), b0 = sub(M[1], sc(a, dot(M[1], a))), b = sc(b0, 1 / nrm(b0)); return [a, b, cross(a, b)]; };
  const dirOf = (lo, la) => { lo *= Math.PI / 180; la *= Math.PI / 180; return [Math.sin(la), Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo)]; };
  const P0 = (v => sc(v, 1 / nrm(v)))([Math.sin(0.44), Math.cos(0.44), 0.4]);
  // the sphere's lines (5 latitudes, 6 meridians), built once
  const LINES = [];
  for (let a = -60; a <= 60; a += 30) LINES.push(Array.from({ length: 49 }, (_, n) => dirOf(n * 7.5, a)));
  for (let o = 0; o < 180; o += 30) LINES.push(Array.from({ length: 49 }, (_, n) => dirOf(o, n * 7.5 - 90)));

  function mount(cv, o = {}) {
    const ctx = cv.getContext('2d'), DPR = () => devicePixelRatio || 1;
    const fixed = o.length === 'fixed', rMin = o.rMin ?? 0, rMax = o.rMax ?? 1.5, rStep = o.rStep ?? 0.02;
    let M = (o.M0 || [[0, 1, 0], [1, 0, 0], [0, 0, -1]]).map(r => r.slice()), r = o.r ?? 1;
    const hand = o.hand || (() => true), tip = o.tip ?? 'q', input = () => { api.draw(); o.onInput?.(api.get()); };
    const api = {
      P0, ortho, rot,
      get M() { return M; }, set M(v) { M = v; },
      get r() { return r; }, set r(v) { r = Math.max(rMin, Math.min(rMax, v)); },
      get: () => sc(mv(T(M), P0), r),
      set(v) {   // roll the least that puts v's direction under the pin; at v = 0 the sphere stays where it is
        const l = nrm(v); if (!fixed) r = l; if (l < 1e-9) return; const a = mv(M, sc(v, 1 / l)); let ax = cross(a, P0); if (nrm(ax) < 1e-12) ax = cross(P0, [1, 0, 0]);
        M = ortho(mm(rot(ax, Math.acos(Math.max(-1, Math.min(1, dot(a, P0))))), M)); },
      draw() {
        const W = Math.round(cv.clientWidth * DPR()), H = Math.round(cv.clientHeight * DPR()); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
        const Rs = 0.25 * W, cx = 0.36 * W, cy = 0.68 * H, scr = v => [cx + Rs * v[0], cy - Rs * v[1]], c = ctx;
        c.clearRect(0, 0, W, H);
        const P = new Map();
        for (const L of LINES) for (let n = 0; n + 1 < L.length; n++) { const m = add(L[n], L[n + 1]), key = (mv(M, m)[2] > 0 ? 'f' : 'b') + (hand(m) ? 'c' : 'o');
          let p = P.get(key); if (!p) P.set(key, p = new Path2D()); const a = scr(mv(M, L[n])), b = scr(mv(M, L[n + 1])); p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]); }
        const st = { bc: 'rgba(25,224,255,.2)', bo: 'rgba(255,90,31,.2)', fc: 'rgba(25,224,255,.9)', fo: 'rgba(255,90,31,.9)' };
        c.lineWidth = DPR(); ['bc', 'bo'].forEach(k => { if (P.has(k)) { c.strokeStyle = st[k]; c.stroke(P.get(k)); } });
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(cx, cy, Rs, 0, 7); c.stroke();
        ['fc', 'fo'].forEach(k => { if (P.has(k)) { c.strokeStyle = st[k]; c.stroke(P.get(k)); } });
        c.font = `${Math.round(10 * DPR())}px ui-monospace, monospace`; c.textAlign = 'center'; c.textBaseline = 'middle';
        E.forEach((e, n) => { const v = mv(M, e), [x, y] = scr(sc(v, 1.16)); c.fillStyle = v[2] > 0 ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.3)'; c.fillText(['1', 'i', 'j'][n], x, y); });
        // the pin: fixed on the screen, standing on the sphere, r sphere radii long
        const q = api.get(), b0 = scr(P0), t = scr(sc(P0, 1 + r)), h = r < 1e-9 ? null : hand(q);
        c.strokeStyle = '#fff'; c.lineWidth = 2 * DPR(); c.beginPath(); c.moveTo(b0[0], b0[1]); c.lineTo(t[0], t[1]); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(b0[0], b0[1], 2.5 * DPR(), 0, 7); c.fill();
        c.fillStyle = h === null ? '#fff' : h ? '#19e0ff' : '#ff5a1f'; c.strokeStyle = '#fff'; c.lineWidth = 1.5 * DPR();
        c.beginPath(); c.arc(t[0], t[1], 4.5 * DPR(), 0, 7); c.fill(); c.stroke();
        if (tip) { c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(tip, t[0] + 8 * DPR(), t[1] - 2 * DPR()); } },
    };
    api.roll = (dx, dy) => { const l = Math.hypot(dx, dy); if (!l) return; M = ortho(mm(rot([dy, dx, 0], l / (0.25 * cv.clientWidth)), M)); input(); };
    let d = null;
    cv.addEventListener('pointerdown', e => { d = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); e.stopPropagation(); });
    cv.addEventListener('pointermove', e => { if (!d) return; const dx = e.clientX - d[0], dy = e.clientY - d[1]; d = [e.clientX, e.clientY]; api.roll(dx, dy); });
    const up = () => { d = null; o.onRelease?.(api.get()); }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { d = null; });
    if (!fixed) cv.addEventListener('wheel', e => { e.preventDefault(); r = Math.max(rMin, Math.min(rMax, Math.round((r - Math.sign(e.deltaY) * rStep) * 100) / 100)); input(); }, { passive: false });
    return api;
  }
  g.SphereSetter = { mount, dirOf };
})(typeof window !== 'undefined' ? window : globalThis);
