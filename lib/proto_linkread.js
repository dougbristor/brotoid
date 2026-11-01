// proto_linkread.js: the link reading both deciders share (fable 10-30; moved out of proto_voicepick.js so the voice decider and the
// level decider read one instrument, not two copies). One instrument, three outputs: { cls: fast | slow | unknown, mbps, source, bytes };
// unknown is an answer.
export const LINE_MBPS = 25;           // provisional (voicepick SPEC): 76 MB in about 24 s

// D1: from what the page has already fetched. Same-origin entries of 50 KB or more; cache hits (transferSize 0) and opaque entries
// carry no transferSize and drop out. Bytes over the union of their [responseStart, responseEnd] spans, so files that came down
// side by side are not counted as slower than they were. Under 300 KB sampled says nothing. responseStart, not requestStart
// (brotbot F3, 10-30): the wait for the first byte is not bandwidth, the L1 rule applied to D1; from requestStart a fast link with
// a 170 ms first byte read slow.
// D2: saveData is slow whatever was measured; then the timing; then effectiveType (2g, 3g: slow); then downlink, which Chromium
// caps at 10 Mbps, so it can say slow (under 10) and never fast: a capped 10 is unknown.
export function classify({ entries = [], conn = null, origin = '' } = {}) {
  if (conn?.saveData) return { cls: 'slow', mbps: null, source: 'saveData', bytes: 0 };
  const E = entries.filter(e => { try { return new URL(e.name).origin === origin; } catch { return false; } })
    .filter(e => e.transferSize >= 50e3 && e.responseStart > 0 && e.responseEnd > e.responseStart);
  let bytes = 0; for (const e of E) bytes += e.transferSize;
  if (bytes >= 300e3) { const iv = E.map(e => [e.responseStart, e.responseEnd]).sort((a, b) => a[0] - b[0]); let span = 0, a = -1, b = -1;
    for (const [s, t] of iv) { if (s > b) { if (b > a) span += b - a; a = s; b = t; } else b = Math.max(b, t); } if (b > a) span += b - a;
    const mbps = bytes * 8 / (span / 1000) / 1e6; return { cls: mbps >= LINE_MBPS ? 'fast' : 'slow', mbps, source: 'timing', bytes }; }
  if (conn && /2g|3g/.test(conn.effectiveType || '')) return { cls: 'slow', mbps: conn.downlink ?? null, source: 'effectiveType', bytes };
  if (conn && conn.downlink != null && conn.downlink < Math.min(LINE_MBPS, 10)) return { cls: 'slow', mbps: conn.downlink, source: 'downlink', bytes };
  return { cls: 'unknown', mbps: null, source: conn ? 'downlink-capped' : 'none', bytes };
}
export const reading = () => classify({ entries: performance.getEntriesByType('resource'), conn: navigator.connection || null, origin: location.origin });

// the rate of one probe from its raw timings. 'first' (brotbot 10-30, level SPEC L1): the clock starts at the first chunk and counts
// the bytes after it, so the wait before the first byte is not read as bandwidth. 'start' is the old way (clock from before fetch),
// kept only so a test can show the two disagree: 256 KB = 2.1 Mb, so 'start' reads any link with more than ~84 ms to its first byte
// as below 25 Mbps, however fast it then delivers.
export function rateOf(raw, mode = 'first') {
  if (!raw.got) return 0;
  if (mode === 'start') return raw.got * 8 / ((raw.tEnd - raw.t0) / 1000) / 1e6;
  const s = (raw.tEnd - raw.tFirst) / 1000, b = raw.got - raw.firstBytes;
  return s > 0.001 && b > 0 ? b * 8 / s / 1e6 : Infinity;    // everything in the first chunk: no time to measure, the link kept up
}

// D4 / L1: one Range probe of at most `bytes`, at a press and never before. A server that ignores Range (8088 does: 200, the whole
// file) is cut off at `bytes` by the reader: only bytes up to the cut are counted (brotbot F5, 10-30: the chunk that crossed it was
// counted whole, up to the whole 533 KB file, so the same link read 13.4 or 26.1). What came past the cut is `over`, and `ranged` says
// whether the server honoured Range. The crossing chunk's time still holds its overrun, so a cut reading leans slow, never fast.
// A probe that runs out of time reads slow from what it got. Returns the reading plus its raw timings and the first-byte wait.
export async function probe(url, bytes = 262144, ms = 4000) {
  const ac = new AbortController(), raw = { t0: performance.now(), tFirst: 0, tEnd: 0, got: 0, firstBytes: 0, over: 0, ranged: null };
  const to = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { headers: { Range: `bytes=0-${bytes - 1}` }, cache: 'no-store', signal: ac.signal }), rd = r.body.getReader(); raw.ranged = r.status === 206;
    while (raw.got < bytes) { const { done, value } = await rd.read(); if (done) break; const n = Math.min(value.byteLength, bytes - raw.got); raw.over += value.byteLength - n;
      if (!raw.got) { raw.tFirst = performance.now(); raw.firstBytes = n; } raw.got += n; }
    rd.cancel().catch(() => {}); ac.abort(); } catch {}
  clearTimeout(to); raw.tEnd = performance.now();
  const mbps = rateOf(raw);
  return { cls: raw.got >= bytes * 0.9 && mbps >= LINE_MBPS ? 'fast' : 'slow', mbps, source: 'probe', bytes: raw.got, ttfb: raw.tFirst ? raw.tFirst - raw.t0 : null, raw };
}
