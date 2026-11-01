// proto_voicepick.js — the voice decider and picker for pageflow (fable 2026-10-29). proto: the good name stays free.
// SPEC: fable/web/proto_voicepick/SPEC.md (D1-D12). Pageflow loads this only when a page asks (voice: { pick: true } or preload: 'auto').
// Doug 10-29 evening: "lets just settle for Brot only and hide option and loading of bright, that might come in so we are leaving the door
// open". So the voices on offer are a list, OFFER, and the first is the default: today ['brot']. One voice on offer: a fast link preloads it,
// a slow or unknown one loads it at the press with one plain line of its size and time, and no choice is shown. bright stays defined
// below but is never shown, probed or loaded unless a page offers it (voice: { offer: ['brot', 'bright'] }); then the choice returns,
// with the reader's pick or Brot preselected on a slow link (the 10-29 nudge).
// This file makes no sound and adds no audio path: the voice itself is proto_voice.js, through caro's engine and its SonicSafe chain.

export const ENGINE_MB = 13;           // the engine the first voice brings with it
export const VOICES = {
  brot: { key: 'brot', label: 'Brot', sub: 'warm, with the grain', mb: 32, model: 'en_GB-northern_english_male-medium-fp16weights.onnx',
    settings: { voice: 'warm', quality: 'fp16', mode: 'brot' } },
  bright: { key: 'bright', label: 'bright', sub: 'clear, Scottish', mb: 63, model: 'en_GB-alba-medium.onnx',
    settings: { voice: 'bright', quality: 'original', mode: 'plain' } } };
export const OFFER = ['brot'];         // the voices on offer, the default first; bright is hidden (Doug 10-29 evening)
const offered = o => (o || OFFER).filter(k => VOICES[k]);
const PICK_KEY = 'pageflow-voice-pick', CACHE = 'speaking-brot-assets-v1';
// a stored pick counts only while it is on offer: a reader who picked bright before it was hidden gets Brot
export const stored = offer => { try { const v = JSON.parse(localStorage.getItem(PICK_KEY)); return offered(offer).includes(v) ? v : null; } catch { return null; } };
export const store = k => { try { if (VOICES[k]) localStorage.setItem(PICK_KEY, JSON.stringify(k)); } catch {} };

// ---- the reading: one instrument, shared with the level decider (proto_linkread.js, 10-30). D1/D2 as before; the probe now times from
// its first chunk (brotbot 10-30), so the wait before the first byte is not read as bandwidth.
import { LINE_MBPS, classify, reading, probe as linkProbe } from './proto_linkread.js';
export { LINE_MBPS, classify, reading };
// D4: one Range probe of at most 256 KB of voice k's model, at the press and never before
export const probe = (base, k = 'brot', bytes = 262144, ms = 4000) => linkProbe(new URL('models/' + VOICES[k].model, base).href, bytes, ms);

// D5: which voices are already on this device (the engine's worker keeps each model in CacheStorage under its URL)
export async function onDevice(base, offer) { const out = { brot: false, bright: false };
  try { if (!(await caches.has(CACHE))) return out; const c = await caches.open(CACHE);
    for (const k of offered(offer)) out[k] = !!(await c.match(new URL('models/' + VOICES[k].model, base).href)); } catch {}
  return out; }
export const firstMB = (k, dev) => VOICES[k].mb + (dev.brot || dev.bright ? 0 : ENGINE_MB);
const fmtT = s => s < 90 ? Math.max(5, Math.round(s / 5) * 5) + ' s' : Math.round(s / 60) + ' min';
export const sizeText = (k, dev, rd) => dev[k] ? 'on this device' : `${firstMB(k, dev)} MB · ${rd?.mbps ? 'about ' + fmtT(firstMB(k, dev) * 8 / rd.mbps) : 'time unknown'}`;

// the decision. phase 'idle' (preload: 'auto', D8) never probes and never asks; phase 'press' (D3-D5) may probe once, then asks or not.
// With one voice on offer it never asks: a slow or unknown link loads it at the press, and the quiet line says its size and time (D4).
export async function decide({ base, phase = 'press', offer }) {
  const O = offered(offer), dev = await onDevice(base, O), st = stored(O), first = st || O[0];
  if (st && dev[st]) return { pick: st, ask: false, why: 'on this device', dev, rd: null };
  let rd = reading();
  if (phase === 'idle') return { pick: rd.cls === 'fast' ? first : null, ask: false, why: rd.cls, dev, rd };
  if (rd.cls === 'unknown' && !navigator.connection?.saveData) rd = await probe(base, first);
  if (rd.cls === 'fast' || O.length === 1) return { pick: first, ask: false, why: rd.cls, dev, rd };
  return { pick: null, ask: true, preselect: st || (O.includes('brot') ? 'brot' : O[0]), why: rd.cls, dev, rd };
}
// the quiet line beside the button while a voice loads (D3); on a link not read fast it is the download advisory (D4): one plain line
const timeOn = (k, d) => d.rd?.mbps ? `about ${fmtT(firstMB(k, d.dev || {}) * 8 / d.rd.mbps)} on this link` : 'the time on this link is not known';
export const loadingLine = (k, d) => d.dev?.[k] ? `${VOICES[k].label} voice · on this device · loading…`
  : d.rd && d.rd.cls !== 'fast' ? `the ${VOICES[k].label} voice downloads about ${firstMB(k, d.dev || {})} MB, ${timeOn(k, d)}`
  : `${VOICES[k].label} voice · ${firstMB(k, d.dev || {})} MB · loading…`;

// ---- the picker (D4, D6, D11): a radiogroup above the player. The preselected voice is checked and focused, so Enter takes it: the
// nudge. "captions only" keeps the voice off and downloads nothing. Esc and a click outside are "captions only" for a first choice,
// and "keep the current voice" for a switch. Resolves 'brot' | 'bright' | 'captions' | null (no change).
const CSS = `.pf-voicepick { position: fixed; left: 50%; transform: translateX(-50%); z-index: 60; width: min(420px, calc(100vw - 32px)); box-sizing: border-box;
  background: #0d0e12; color: #eee9e0; border: 1px solid #2c2f38; border-radius: 8px; padding: 12px; font: 13px/1.35 system-ui, sans-serif; box-shadow: 0 8px 30px #000a; }
.pf-voicepick h3 { margin: 0 0 4px; font-size: 13px; font-weight: 600; } .pf-voicepick .rd { margin: 0 0 10px; color: #9a9aa3; font-size: 12px; }
.pf-voicepick [role=radio] { display: block; width: 100%; min-height: 48px; margin: 0 0 6px; text-align: left; padding: 8px 10px; border-radius: 6px; cursor: pointer;
  background: #15171d; color: inherit; border: 1px solid #2c2f38; font: inherit; }
.pf-voicepick [role=radio][aria-checked=true] { outline: 2px solid #e0b53b; outline-offset: -2px; }
.pf-voicepick [role=radio] b { font-size: 14px; } .pf-voicepick small { color: #9a9aa3; margin-left: 6px; } .pf-voicepick .dl { display: block; color: #9a9aa3; font-size: 12px; margin-top: 2px; }
.pf-voicepick .cap { display: block; width: 100%; min-height: 44px; background: none; color: #9a9aa3; border: 1px dashed #2c2f38; border-radius: 6px; font: inherit; cursor: pointer; }`;
export function openPicker({ bar, dev, rd, preselect = 'brot', current = null, offer }) {
  if (!document.getElementById('pf-voicepick-css')) { const s = document.createElement('style'); s.id = 'pf-voicepick-css'; s.textContent = CSS; document.head.append(s); }
  document.querySelector('.pf-voicepick')?.remove();
  const box = document.createElement('div'); box.className = 'pf-voicepick'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Choose a voice');
  const sel = current || preselect, speed = rd?.mbps ? `Your link reads about ${rd.mbps < 10 ? rd.mbps.toFixed(1) : Math.round(rd.mbps)} Mbps.` : 'Your link speed is not known yet.';
  box.innerHTML = `<h3>${current ? 'Switch the voice' : 'Choose a voice'}</h3><p class="rd">${speed} The voice runs in your browser; it downloads once.</p>
    <div role="radiogroup" aria-label="Voice">${offered(offer).map(k => VOICES[k]).map(v => `<button type="button" role="radio" aria-checked="${v.key === sel}" data-voice="${v.key}"><b>${v.label}</b><small>${v.sub}</small><span class="dl">${sizeText(v.key, dev || {}, rd)}</span></button>`).join('')}</div>
    <button type="button" class="cap" data-voice="captions">${current ? 'Keep the current voice' : 'Captions only, no voice'}</button>`;
  const r = bar?.getBoundingClientRect(); box.style.bottom = Math.ceil(innerHeight - (r ? r.top : innerHeight - 70) + 8) + 'px';
  document.body.append(box);
  return new Promise(res => {
    const done = v => { removeEventListener('keydown', key, true); removeEventListener('pointerdown', out, true); box.remove(); res(v); };
    const radios = [...box.querySelectorAll('[role=radio]')];
    const key = e => { if (e.key === 'Escape') { e.preventDefault(); done(current ? null : 'captions'); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const i = radios.indexOf(document.activeElement), j = (i + (e.key === 'ArrowDown' ? 1 : radios.length - 1)) % radios.length;
        radios.forEach((b, n) => b.setAttribute('aria-checked', n === j)); radios[j].focus(); } };
    const out = e => { if (!box.contains(e.target)) done(current ? null : 'captions'); };
    box.addEventListener('click', e => { const b = e.target.closest('[data-voice]'); if (!b) return; const v = b.dataset.voice; done(v === 'captions' ? (current ? null : 'captions') : v === current ? null : v); });
    addEventListener('keydown', key, true); setTimeout(() => addEventListener('pointerdown', out, true), 0);
    (radios.find(b => b.dataset.voice === sel) || radios[0]).focus();
  });
}
