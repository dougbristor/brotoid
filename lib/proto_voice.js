// proto_voice.js — the Brot voice for pageflow's captions (fable 2026-10-17). proto: the good name stays free.
// Doug 10-17: "add brot voice to the CC's. would need a quiet|off btn". The speech is caro's Speaking Brot engine
// (caro/web/speaking_brot: Piper in a worker, WORLD, the Bristorian orbit, the SonicSafe output chain), all in the browser.
// This file only queues lines, keeps a cache and plays the finished buffers; the engine's files are used unchanged.
//
// SPEC (tests: aicolab/tmp/fable_voice_test.mjs):
//   V1 off by default. Nothing downloads until the reader turns it on (first use about 45 MB: the 32 MB voice and its
//      engine; after that the browser's cache).
//   V2 lines are spoken in the order they are shown. say() resolves true when its line was heard to the end, false when
//      it was stopped, skipped or failed; it never rejects, so a beat can always go on.
//   V3 stop() silences at once (18 ms fade, as caro's player) and drops every queued line.
//   V4 prepare() renders a line ahead (the next beat's) without playing it; a line shown later plays from the cache.
//      One render at a time: a line being shown goes ahead of any line prepared for later.
//   V6 (Doug 10-19: "reduce digit use where we can ... the CC-txt can carry more than cc-say"): a number's trailing zeros are not
//      spoken, and a whole number left that way is a word: 0.000 is "zero", 2.000 is "two", 0.900 is "0.9". The caption keeps its digits.
//   V5 symbols are spoken as words (speakable()); the caption keeps its symbols. Any symbol with no word is dropped, never sent:
//      the engine refuses a line holding one ('Please write symbols as English words', proto_brotoid beat 7, 10-19).
//   V6 an engine that is missing, or a silent render, is reported through onError; captions carry on without voice.
//   V7 if the browser has not let audio start (no click on the page yet), a line is skipped, not waited on.
//   V8 say(text, { onStart }) calls onStart(seconds) the moment its audio starts, with the line's length (Doug 10-18: "allow a little pause for the voice to start
//      before the words highlight"; the caption's word run starts with the audio, not with the render).
const SETTINGS = { voice: 'warm', quality: 'fp16', rate: 1, pitch: -1, character: .55, seed: 7, pronunciation: 'lot', mode: 'brot' };

const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const fewerDigits = t => t.replace(/(?<![\d.])(\d+)\.(\d*[1-9])?0+(?!\d|\.\d)/g, (m, i, f) => f ? `${i}.${f}` : (+i <= 20 ? NUMW[+i] : i));
export function speakable(t) {
  return String(t || '').replace(/\*\*/g, '')
    .replace(/\bdet J\b/g, 'det jay').replace(/ℂ/g, 'C').replace(/\bB(\d)\b/g, 'B $1')
    .replace(/\s*≥\s*/g, ' at least ').replace(/\s*≤\s*/g, ' at most ')
    .replace(/\s+>\s+/g, ' greater than ').replace(/\s+<\s+/g, ' less than ').replace(/\s+=\s+/g, ' equals ')
    .replace(/\s+\+\s+/g, ' plus ').replace(/\s+−\s+/g, ' minus ').replace(/(^|\s)−(\d)/g, '$1minus $2').replace(/\s+[-–—]\s+/g, ', ')
    .replace(/[^]*/, fewerDigits)
    .replace(/\s*×\s*/g, ' times ').replace(/\s*÷\s*/g, ' divided by ').replace(/\s*·\s*/g, ' times ')
    .replace(/\s*→\s*/g, ' to ').replace(/\s*⇄\s*/g, ' and ').replace(/≈\s*/g, 'about ')
    .replace(/(\d)°/g, '$1 degrees').replace(/²/g, ' squared').replace(/³/g, ' cubed')
    .replace(/\|([^|]+)\|/g, 'the size of $1')
    .replace(/\s*[←⟵]\s*/g, ' becomes ').replace(/\s*↦\s*/g, ' goes to ').replace(/[①②③④⑤]/g, c => ' moment ' + ('①②③④⑤'.indexOf(c) + 1) + ',')
    .replace(/\s+\+\s*|\s*\+\s+/g, ' plus ').replace(/[\p{S}\p{C}]/gu, ' ').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
}

export async function createVoice({ base, onState, onError, onBlocked } = {}) {
  base = new URL(base || new URL('voice/', import.meta.url).href, location.href).href;
  if (!window.SonicSafe) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = base + 'safe_chain.js';
    s.onload = res; s.onerror = () => rej(Error('the voice engine is not at ' + base)); document.head.append(s); });
  const [{ BrowserRenderer }, { processFinal }] = await Promise.all([import(base + 'browser-client.js'), import(base + 'speech.js')]);
  // the AudioContext is made at the first play or resume, not here (Doug 10-20, Firefox: "An AudioContext was prevented from starting
  // automatically"): the page warms the voice at idle, before any press, and forming a line needs only processFinal's OfflineAudioContext
  const R = new BrowserRenderer(m => onState?.(m)); let ctx = null; const ac = () => ctx || (ctx = new AudioContext({ sampleRate: 44100 }));
  const cache = new Map();
  let gen = 0, tail = Promise.resolve(), cur = null;
  const log = [], ev = (e, t = '') => { log.push([Math.round(performance.now()), e, gen, String(t).slice(0, 40)]); if (log.length > 300) log.shift(); };   // the instrument's own record (tests read it)

  // one render at a time; a line being shown (urgent) goes ahead of lines prepared for later, in the order shown
  const jobs = []; let busy = false;
  function prepare(text, urgent = false) {
    const t = speakable(text); if (!t) return Promise.resolve(null);
    const have = cache.get(t);
    if (have) { const j = have.job; if (urgent && !j.urgent && !j.started) { jobs.splice(jobs.indexOf(j), 1); j.urgent = true; place(j); ev('bump', t); } return have.p; }
    let res, rej; const p = new Promise((a, b) => { res = a; rej = b; }), job = { t, res, rej, urgent, started: false };
    cache.set(t, { p, job }); p.catch(() => { if (cache.get(t)?.p === p) cache.delete(t); });
    if (cache.size > 40) { for (const [k, v] of cache) if (v.job.started || !jobs.includes(v.job)) { cache.delete(k); break; } }
    ev(urgent ? 'queue' : 'queue-ahead', t); place(job); pump(); return p;
  }
  function place(j) { if (!j.urgent) { jobs.push(j); return; } const k = jobs.findIndex(x => !x.urgent); k < 0 ? jobs.push(j) : jobs.splice(k, 0, j); }
  async function pump() {
    if (busy || !jobs.length) return; const job = jobs.shift(); busy = job.started = true; ev('render', job.t);
    try { const { samples, meta } = await R.request('render', job.t, SETTINGS);
      const buf = await processFinal(samples, meta.sampleRate); let pk = 0; for (const x of buf.getChannelData(0)) pk = Math.max(pk, Math.abs(x));
      if (!pk) throw Error('the voice came out silent'); ev('ready', job.t); job.res(buf); }
    catch (e) { job.rej(e); }
    finally { busy = false; pump(); }
  }
  function play(buf, g, onStart) {
    return new Promise(res => {
      // the browser holds the sound: the page shows the press that frees it
      if (g !== gen || !ctx || ctx.state !== 'running') { ev('skip-' + (ctx ? ctx.state : 'no-audio')); if (g === gen) try { onBlocked?.(); } catch {} return res(false); } ev('play', buf.duration.toFixed(2));
      const source = ctx.createBufferSource(), gain = ctx.createGain(); source.buffer = buf; source.connect(gain); gain.connect(ctx.destination);
      const me = { source, gain, res }; cur = me;
      // a line held mid-way (the browser suspended the sound) never ends: after its length + 2 s it frees the queue, so the lines after it are not stuck
      const guard = setTimeout(() => { if (cur !== me) return; cur = null; ev('stall', ctx.state); try { source.stop(); } catch {} if (ctx.state !== 'running') try { onBlocked?.(); } catch {} res(false); }, (buf.duration + 2) * 1000);
      source.onended = () => { clearTimeout(guard); ev('end'); source.disconnect(); gain.disconnect(); if (cur === me) cur = null; res(true); };
      source.start(); source.stop(ctx.currentTime + buf.duration + .01); try { onStart?.(buf.duration); } catch {}
    });
  }
  function say(text, { onStart } = {}) {
    const g = gen, p = prepare(text, true); ev('say', speakable(text));
    tail = tail.then(async () => {
      if (g !== gen) return false;
      try { await ac().resume(); } catch {}
      let buf; try { buf = await p; } catch (e) { ev('error', e.message); onError?.(e); return false; }
      if (g !== gen) ev('dropped', 'stopped while it rendered');
      return !!buf && g === gen && await play(buf, g, onStart);   // true only when the line was heard to its end
    });
    return tail;
  }
  function stop() {
    ev('stop'); gen++; tail = Promise.resolve();
    if (cur) { const { source, gain, res } = cur, t = ctx.currentTime; cur = null;
      gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(gain.gain.value, t); gain.gain.linearRampToValueAtTime(0, t + .018);
      try { source.stop(t + .02); } catch {} res(false); }
  }
  return { say, prepare, stop, log, speaking: () => !!cur, resume: () => ac().resume(), get ctx() { return ctx; },
    close: () => { stop(); R.reset(); ctx?.close(); } };
}
