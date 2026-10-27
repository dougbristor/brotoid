// fable 10-21: proto_brotoid S11's word list, read from brotdocs' notation.vocabulary_map (proto_dictionary D6: no hand-written list).
// A word is banned only if the map retires the WORD; a retired SENSE of a current word (crease's det J = 0 line, join's B2 locus)
// is not a word ban, and is listed apart so a check can look for the sense rather than the spelling.
// The map says it three ways: "`x` is retired", "renamed `x` → `y`", and "names it replaces: "x" (...)" (any case).
export const MAP_URL = (process.env.BASE || 'http://localhost:8190') + '/brotdocs/docs/notation_vocabulary_map.md';   // git 10-27: the origin from the environment, like spectest.mjs

export function retiredFromMap(md) {
  const secs = md.split(/\n## /).slice(1).map(s => [s.slice(0, s.indexOf('\n')).trim(), s]);
  const terms = new Set(secs.filter(([, s]) => /\n- \*\*ours\*\* —/.test(s)).map(([t]) => t.toLowerCase()));
  const words = new Set(), senses = [];
  for (const [term, s] of secs) {
    for (const m of s.matchAll(/`([^`]+)`\**\s+is retired/g)) words.add(m[1].toLowerCase());
    for (const m of s.matchAll(/renamed\s+\**`([^`]+)`\**\s*→\s*\**`([^`]+)`/g)) words.add(m[1].toLowerCase());
    const rep = s.match(/names it replaces:([\s\S]*?)\.\s/i);
    if (rep) for (const m of rep[1].matchAll(/"([^"]+)"/g)) { const w = m[1].toLowerCase(); if (terms.has(w)) senses.push({ word: w, now: term }); else words.add(w); }
    for (const m of s.matchAll(/^\s*\d+\.\s+[^\n]*· retired → `([^`]+)`/gm)) if (!senses.some(x => x.word === term.toLowerCase() && x.now === m[1])) senses.push({ word: term.toLowerCase(), now: m[1] });   // the history field (10-21)
    if (/earlier meaning is retired/.test(s) && !senses.some(x => x.word === term.toLowerCase())) senses.push({ word: term.toLowerCase(), now: (s.match(/earlier meaning is retired:[\s\S]*?which is now\s+`([^`]+)`/) || [])[1] || '' });
  }
  return { words: [...words].sort(), senses };
}

// One regex over a reader's text: each banned word, plural allowed, whole words only. Its edges are letters, digits and _, not \\b (brotbot jfpo:
// \\b does not break at _, so "brotoid_tear" was not caught). Use its source with the u flag.
export const bannedRx = words => new RegExp(words.map(w => `(?<![\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s-]+')}s?(?![\\p{L}\\p{N}])`).join('|'), 'giu');

// fable 10-22: S17's reading of the map, apart from the page's own: each term's standing, 'filed · coined', 'posed · coined', … (the label
// field's status, else filed, then its kind), and the map's one-word terms.
export function standingsFromMap(md) { const out = {};
  for (const s of md.split(/\n## /).slice(1)) { const term = s.slice(0, s.indexOf('\n')).trim().toLowerCase(), f = s.split(/\n- \*\*/).find(x => x.startsWith('label**'));
    const kind = f && (f.match(/\b(STANDARD|NARROWER|FALSE FRIEND|OVERLOADED|COINED)\b/) || [])[1]; if (!kind) continue;
    out[term] = `${((f.match(/\bstatus\s+(\w+)/i) || [])[1] || 'filed').toLowerCase()} · ${kind.toLowerCase()}`; }
  return out; }
export const mapTerms = md => md.split(/\n## /).slice(1).map(s => s.slice(0, s.indexOf('\n')).trim()).filter(t => /^[a-z][a-z-]*$/.test(t));
