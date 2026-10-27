// glyph_grammar.js — atoms of ideas, devices and instruments as glyphs, and a grammar where ORDER and POSITION carry
// the relation between them (Doug, 10-08: "think of the glyphs that represent atoms of ideas|devices|instruments … think
// about order and position to define wrt|btw|...|normal|....").  v4, posed: the vocabulary is a proposal.
//
// KIND is a VIEW of an atom (Doug, 10-08: "one thing but different views of it"); the shape survives a blurred scan:
//   o idea (round: the claim)   s device (square: the thing built, a port each side)   t instrument (triangle: aimed)
//   #id names the atom, so one atom can be shown as idea, device or instrument in different sentences (o#size_ring …).
// STATE is the fill (Doug poses, instruments weigh): posed (dashed) load (half) holds (solid) folds (struck)
//   cnt = COULD NOT TELL (dotted grey, ?), never drawn like folds: an instrument has three outputs.
// COLOUR is the algebra, as the reel: .b Bristorian (orange)  .q quaternion (cyan)  none = neutral.
// * = carries a control (a planted fault that must fire).   =class = a FACE from instrument_faces.js (an instrument shows
//   its null on a dial, with one prong = reads z·z or two prongs = reads a·b; an idea or device shows the reading).
//
// POSITION round one glyph:  _x subscript = WITH RESPECT TO x   ^n superscript = rank / power
// POSITION between glyphs: left to right is the order of action, and the result LANDS ON THE RIGHT, as a Bristorian
// product lands on its right factor (an ANALOGY to the rule, not an identity).
//   A > B  or  A · B  or  A * B   acts on / times (order matters)     A ∴ B  or  A :. B   therefore (U+2234)
//   (* and :. are the keyboard forms, drawn as · and ∴. A * BEFORE a label is the control mark, o.b*(i); AFTER a
//    label or between spaces it is times. A dropped space can only give a parse error, never swap the two.)
//   A = B  equals (the chain on the left equals the atom on the right: o.b(i) * o.b(j) = o.b(+j))
//   The six spacing relations are typed as WORDS (Doug, 10-08, after a rookie absorption test: - / | ~ , and = mean
//   minus, divide, given, approximately, a list and equals to most writers, and a cold agent's i·j = +j read as
//   "j runs along j"). The drawn glyphs are unchanged. A bare - / | ~ , stops with a "did you mean", never a guess.
//   A join B  (touching)      A seam B  (overlapping)     A spread B  (apart)     A gap B  (odd vs even break)
//   A normal B  (at right angles, as a surface or flow-field normal)       A [X] B  X between A and B
//   A along B  (parallel: agrees)     A <> B  against (a control facing its subject)
//   A ~> B through (carried across a change: a trail)     A @ B  inside (B is A's scope, drawn round it)
// NOT is SCOPED and TWO-ENDED (Doug, 10-08):  ![ … ]!
//   - both ends are required: a NOT that has lost an end reads COULD NOT TELL, never the opposite (negates get dropped);
//   - CONCORD inside a scope: an inner not (!x, or a nested ![ ]!) restates the same NOT and never cancels it
//     ("two wrongs don't make a right");
//   - CANCELLATION across scopes: ![x]! · ![y]! ∴ … multiplies two NOTs, sign +, as (−1)(−1) = +1.
//   - CONCORD reaches WORDS too (Doug, 10-10: "![o(not to -c)]! === ![o(to -c)]! … the not inside only reinforces"):
//     a label inside a NOT that starts with not / don't / do not / no / never restates the NOT: it counts as an inner
//     not and never cancels. The words are KEPT as typed and read "[not to -c], one NOT", not "NOT [to -c]" (Doug, 10-10:
//     "NOT !(to -c)! is more ambiguous than !(not to -c)!"). Outside a NOT a label's words are just words.
//   - LOOSE forms, still two-ended (Doug, 10-10): !(words)! means ![o(words)]!, and bare words inside ![ … ]! that
//     are not a glyph sentence are one idea: ![not to -c]! reads NOT [to -c]. A half form (!(x  or  !(x)) still stops.
// STATEMENT TYPE (what the sentence does) is an optional prefix, drawn as a flow mark round the row:
//   claim: flow: constraint: friction: drag: catch: leak: ask: correction:
// Token:  [!]kind[.colour][=class][#id][:state][*][(label)][_frame][^rank]
// parse() throws on anything it does not know (an unknown glyph must never draw as a known one); an unbalanced NOT
// throws a NegScope error, which svg() and reading() turn into a visible COULD NOT TELL.

import { face, CLASSES, COL } from './instrument_faces.js';
export const FACES = [...Object.keys(CLASSES), 'imordial'];
export const KINDS = { o: 'idea', s: 'device', t: 'instrument', u: 'unit', h: 'hole' };
// A HOLE (Doug, 10-08: "?(missing word) … fills holes nicely"): a word the language does not have yet, typed ?(…) where
// the atom would go, or a bare ? for one with no name yet. Drawn as an empty socket (a dark pit inside a dashed rim),
// never like could-not-tell: COULD NOT TELL is an instrument's reading, a HOLE is the vocabulary's gap. Agents report
// their missing words by writing them in place; a census of the board (glyph_holes) counts them.
const HOLE = /^\?(?:\(([^)]*)\))?(?![\w(])/;
const holeTok = m => ({ neg: false, kind: 'h', label: (m[1] || '').trim(), colour: 'n', state: 'holds', face: '', id: '', control: false, frame: '', rank: '' });
// A UNIT atom (Doug, 10-08): i j k, or e<n> for rank n, each its own symbol, drawn as DICE SPOTS (i one, j two, k three);
// an inverted unit (−i) draws RINGS instead of spots. Typed bare and signed: i, -j, +k, e5, with .b/.q and :state.
// Past nine the die nests, a die of dice (see dice() below): e12 = 9 + 3. Every leaf spot counts one.
// No control mark on a unit, so i*j (no spaces) still reads i times j. Token:  [+-−](i|j|k|e<n>)[.b|.q][:state]
const UNIT = /^([+\-−])?(i|j|k|e([1-9]\d*))(?:\.(b|q))?(?::(posed|load|holds|folds|cnt))?(?![\w(.])/;
const unitTok = (m, unsigned = false) => ({ neg: false, kind: 'u', unit: m[3] ? +m[3] : 'ijk'.indexOf(m[2]) + 1, uname: m[2],
  sign: !unsigned && /[-−]/.test(m[1] || '') ? -1 : 1, plus: !unsigned && m[1] === '+', colour: m[4] || 'n', state: m[5] || 'holds',
  face: '', id: '', control: false, label: '', frame: '', rank: '' });
export const STATES = ['posed', 'load', 'holds', 'folds', 'cnt'];
export const COLOURS = { b: COL.b, q: COL.q, n: '#d6dce8' };
export const TYPES = {
  claim: 'something said', flow: 'knowledge moved', constraint: 'a limit that shapes where things can go',
  friction: 'resistance at one point: a stall', drag: 'a steady cost all along the way', catch: 'a control stopped something wrong',
  leak: 'something wrong got past a control', ask: 'a standing question', correction: 'a claim withdrawn, with its tell',
};
const GREY = '#8a8a93', RED = '#ff5470';
const REL = { '>': 'acts', '·': 'acts', '*': 'acts', '∴': 'therefore', '=': 'equals', '@': 'inside' };
const REL2 = { '~>': 'through', '<>': 'against', ':.': 'therefore' };
const WORD = /^(join|seam|spread|gap|along|normal)(?=\s)/;
// the v1–v4 symbol forms, kept only for the planted 'symbols' reader (it must fail the no-silent-misread checks)
const LEGACY = { '-': 'join', '~': 'seam', ',': 'spread', '/': 'gap', '|': 'normal', '=': 'along' };
// A rejection teaches (rookie mode is absorption): what a cold writer typed -> what to write. Checked in two phases so a
// two-mark rookie form ('=>') is caught before its first mark is taken as a relation ('=').
const HINT2 = [
  ['->', '"->" is not a relation: did you mean ">" (acts on)?'], ['=>', '"=>": did you mean ":." (therefore)?'],
  ['==', '"==": did you mean "=" (equals)?'], ['!=', '"!=": a NOT is two-ended: write ![A = B]!'],
  ['>>', '">>": did you mean ">" (acts on)?'], ['<-', '"<-": order is the meaning: write "B > A"'],
  ['||', '"||": did you mean "along" (parallel)?'], ['&&', '"&&": did you mean "join" (touching) or "seam" (overlapping)?'],
  ['_|_', '"_|_": did you mean "normal" (at right angles)?'], ['!(', 'a NOT is two-ended: write ![ … ]!'],
];
const HINT1 = [
  ['-', '"-" is not a relation (minus is not in the grammar): did you mean "join" (touching)?'],
  ['/', '"/" is not a relation (divide is not in the grammar): did you mean "gap" (an odd vs even break)?'],
  ['|', '"|" is not a relation ("given" is not in the grammar): did you mean "normal" (at right angles)?'],
  ['~', '"~" is not a relation (approximately is not in the grammar): did you mean "seam" (overlapping)?'],
  [',', '"," is not a relation (a list is not in the grammar): did you mean "spread" (apart)? Or write each pair'],
  ['⊥', '"⊥": did you mean "normal"?'], ['≈', '"≈": did you mean "seam" (overlapping)?'], ['+', '"+" is not in the grammar: did you mean "*" (times) or "join"?'],
  ['&', '"&": did you mean "join" (touching) or "seam" (overlapping)?'], ['¬', 'a NOT is two-ended: write ![ … ]!'],
  ['●', 'type the shape as a letter: o idea, s device, t instrument'], ['■', 'type the shape as a letter: o idea, s device, t instrument'],
  ['▲', 'type the shape as a letter: o idea, s device, t instrument'],
];
const HINTW = [
  [/^(idea|device|instrument)\b/, m => `"${m[1]}": type the kind as a letter: o idea, s device, t instrument`],
  [/^\.(?![bq]\b)(\w+)/, m => `".${m[1]}": the colour is .b (Bristorian, orange) or .q (quaternion, cyan)`],
  [/^:(?!\.)(\w+)/, m => `":${m[1]}": the state is :posed :load :holds :folds or :cnt (could not tell)`],
];
const hint = (s, phase, atStart) => {
  if (atStart && /^~(?!>)/.test(s)) return 'a NOT is two-ended: write ![ … ]!';
  for (const [k, msg] of phase === 2 ? HINT2 : HINT1) if (s.startsWith(k) && !(k === '~' && s.startsWith('~>'))) return msg;
  if (phase === 1) for (const [re, f] of HINTW) { const m = s.match(re); if (m) return f(m); }
  return null;
};
const TOK = /^(!)?(o|s|t)(?:\.(b|q))?(?:=([a-z]+))?(?:#([\w-]+))?(?::(posed|load|holds|folds|cnt))?(\*)?(?:\(([^)]*)\))?(?:_([^\s^>\-~,/|\[\]!·∴=@#]+))?(?:\^([^\s_>\-~,/|\[\]!·∴=@#]+))?/;
const negErr = msg => Object.assign(new Error(msg), { negScope: true });
const NOTWORD = /^(not|don['’]?t|do not|no|never)\s+/i;
// the loose forms (Doug, 10-10), rewritten to the strict ones before parsing; both ends must still be there.
// !( … )! is the one form to TYPE: its inside is a glyph sentence if it parses as one (a scope over that sentence), else
// words (one idea). Matched by bracket depth, so labels' own ( ) nest inside it. ![ … ]! stays the explicit form.
function loose(s) {
  let out = '', k = 0;
  while (k < s.length) {
    const at = s.indexOf('!(', k); if (at < 0) { out += s.slice(k); break; }
    let d = 0, e = -1; for (let q = at + 1; q < s.length; q++) { if (s[q] === '(') d++; else if (s[q] === ')' && !--d) { e = q; break; } }
    if (e < 0 || s[e + 1] !== '!') { out += s.slice(k, at + 2); k = at + 2; continue; } // a half form: left for the hint
    const inner = loose(s.slice(at + 2, e)).trim();
    let sentence = false; try { parse(`![${inner}]!`, { strict: true }); sentence = true; } catch (_) {} // tried INSIDE a NOT, so its own !o(x) is legal
    out += s.slice(k, at) + (sentence ? `![${inner}]!` : `![o(${inner})]!`); k = e + 2;
  }
  s = out;
  return s.replace(/!\[([^\[\]()]*?)\]!/g, (all, w) => {
    const t = w.trim(); if (!t) return all;
    try { parse(t, { strict: true }); return all; } catch (e) { return `![o(${t})]!`; } // a real sentence stays as it is
  });
}

// opts.oneEnded, opts.cancelInner and opts.symbols are PLANTED faults for the self-test (a reader that closes a lost end
// silently; a reader where an inner not cancels; a reader that still takes the v1–v4 symbols). The real reader uses none.
export function parse(src, { oneEnded = false, cancelInner = false, symbols = false, unsigned = false, numeral = false, holecnt = false, wordNot = false, strict = false } = {}) {
  const rel1 = symbols ? { ...REL, ...LEGACY } : REL;
  let s = src.trim(), type = 'claim';
  const tm = s.match(/^([a-z]{2,}):\s+/); if (tm && TYPES[tm[1]]) { type = tm[1]; s = s.slice(tm[0].length); } // 'o:posed(…)' is a token, not a type
  if (!strict) s = loose(s); // 'strict' is a PLANTED fault: the reader before 10-10, which refused the loose forms
  const items = [], scopes = []; let pendingRel = null, between = null, depth = 0, cur = null, sym = null;
  const take = tok => {
    if (cur) {
      tok.scope = cur.id; if (tok.neg) cur.inner++; tok.restated = tok.neg; tok.neg = true;
      const w = !wordNot && tok.label && tok.label.match(NOTWORD); // 'wordNot' is a PLANTED fault: leaves the word on
      if (w) { tok.core = tok.label.slice(w[0].length); tok.notWord = w[1]; cur.inner++; tok.restated = true; }
    }
    else if (tok.neg) { if (!oneEnded) throw negErr(`a NOT needs both ends, ![ … ]!: "${src}"`); scopes.push(cur = { id: scopes.length + 1, inner: 0 }); tok.scope = cur.id; tok.neg = true; cur = null; }
    return tok;
  };
  while (s.length) {
    let m;
    if (s.startsWith('![')) { depth++; if (depth === 1) scopes.push(cur = { id: scopes.length + 1, inner: 0 }); else cur.inner++; s = s.slice(2).trim(); continue; }
    if (s.startsWith(']!')) { if (!depth) { if (!oneEnded) throw negErr(`a NOT closes that never opened: "${src}"`); s = s.slice(2).trim(); continue; } depth--; if (!depth) cur = null; s = s.slice(2).trim(); continue; }
    if (s[0] === '[') {
      const close = s.indexOf(']'); if (close < 0) throw new Error(`unclosed [ in "${src}"`);
      between = take(parseToken(s.slice(1, close).trim(), src)); s = s.slice(close + 1).trim(); continue;
    }
    const atStart = !items.length && !pendingRel && !between, h2 = !symbols && hint(s, 2, atStart);
    if (h2) throw new Error(`${h2}: "${src}"`);
    const two = REL2[s.slice(0, 2)];
    if (two) { if (pendingRel) throw new Error(`two relations in a row in "${src}"`); pendingRel = two; sym = s.slice(0, 2); s = s.slice(2).trim(); continue; }
    if ((m = s.match(WORD))) { if (pendingRel) throw new Error(`two relations in a row in "${src}"`); pendingRel = m[1]; sym = m[1]; s = s.slice(m[0].length).trim(); continue; }
    if (rel1[s[0]]) { if (pendingRel) throw new Error(`two relations in a row in "${src}"`); pendingRel = rel1[s[0]]; sym = s[0]; s = s.slice(1).trim(); continue; }
    const hm = s.match(HOLE), um = hm || s.match(UNIT);
    if (!um) { const h1 = !symbols && hint(s, 1, atStart); if (h1) throw new Error(`${h1}: "${src}"`); }
    if (!um && !(m = s.match(TOK))) throw new Error(`unknown glyph at "${s.slice(0, 12)}" in "${src}"`);
    const raw = um ? um[0] : m[0], tok = take(hm ? (holecnt ? { ...holeTok(hm), kind: 'o', state: 'cnt' } : holeTok(hm)) : um ? { ...unitTok(um, unsigned), numeral } : parseToken(m[0], src)); s = s.slice(raw.length).trim();
    if (items.length) {
      if (between) items.push({ rel: 'between', mid: between, tok });
      else if (!pendingRel) throw new Error(`no relation before "${raw}" (write * for times) in "${src}"`);
      else items.push({ rel: pendingRel, sym, tok });
    } else { if (pendingRel || between) throw new Error(`sentence starts with a relation: "${src}"`); items.push({ rel: null, tok }); }
    pendingRel = null; between = null; sym = null;
  }
  if (depth && !oneEnded) throw negErr(`a NOT opened and never closed: "${src}"`);
  if (pendingRel || between) throw new Error(`sentence ends with a relation: "${src}"`);
  for (const sc of scopes) sc.sign = cancelInner ? (-1) ** (1 + sc.inner) : -1; // concord: always one NOT
  items.type = type; items.scopes = scopes; return items;
}
function parseToken(t, src) {
  const hm = t.match(HOLE); if (hm && hm[0].length === t.length) return holeTok(hm);
  const um = t.match(UNIT); if (um && um[0].length === t.length) return unitTok(um);
  const m = t.match(TOK); if (!m || m[0].length !== t.length) throw new Error(`unknown glyph "${t}" in "${src}"`);
  if (m[4] && !FACES.includes(m[4])) throw new Error(`unknown class "=${m[4]}" in "${src}"`);
  return { neg: !!m[1], kind: m[2], colour: m[3] || 'n', face: m[4] || '', id: m[5] || '', state: m[6] || 'holds', control: !!m[7], label: m[8] || '', frame: m[9] || '', rank: m[10] || '' };
}

// the sign of a product chain: the NOT scopes met before ∴, each counted ONCE (concord inside, cancellation across)
export function chainSign(items) {
  const cut = items.findIndex(it => it.rel === 'therefore' || it.rel === 'equals'), chain = cut < 0 ? items : items.slice(0, cut), seen = new Set();
  let sign = 1; for (const it of chain) for (const t of [it.tok, it.mid]) if (t && t.scope && !seen.has(t.scope)) { seen.add(t.scope); sign *= items.scopes.find(sc => sc.id === t.scope).sign; }
  return { sign, nots: seen.size };
}

// Plain words: the glyphs give the meaning, the words confirm it. `commute` is a planted fault (ignores order).
const uName = t => `${t.sign < 0 ? '−' : t.plus ? '+' : ''}${t.uname}`;
const name = t => t.notWord ? t.label : t.kind === 'h' ? `${t.neg ? '¬' : ''}[missing word${t.label ? ': ' + t.label : ''}]` : t.kind === 'u' ? `${t.neg ? '¬' : ''}${uName(t)}` : `${t.neg ? '¬' : ''}${t.label || (t.face ? t.face + ' ' : '') + KINDS[t.kind]}${t.id ? ' #' + t.id : ''}${t.rank ? '^' + t.rank : ''}${t.frame ? ' (wrt ' + t.frame + ')' : ''}`;
const stateWord = { posed: 'posed', load: 'under load', holds: 'holds', folds: 'folds', cnt: 'could not tell' };
export function read(items, { commute = false } = {}) {
  const out = [];
  items.forEach((it, k) => {
    if (!k) return; const a = items[k - 1].tok, b = it.tok;
    let [L, R] = [a, b]; if (commute && it.rel === 'acts' && name(b) < name(a)) [L, R] = [b, a];
    const words = {
      acts: () => `${name(L)} acts on ${name(R)}; the result lands on ${name(R)}`,
      therefore: () => `${name(a)}; therefore ${name(b)}`,
      equals: () => `${items[k - 1].rel === 'acts' ? 'the product' : name(a)} equals ${name(b)}`,
      join: () => `${name(a)} meets ${name(b)} (join)`, seam: () => `${name(a)} overlaps ${name(b)} (seam)`,
      spread: () => `${name(a)} and ${name(b)} are apart (spread)`, gap: () => `${name(a)} and ${name(b)} differ odd vs even (gap)`,
      normal: () => `${name(b)} is normal to ${name(a)}: at right angles, a new direction`,
      between: () => `${name(it.mid)} lies between ${name(a)} and ${name(b)}`,
      along: () => `${name(a)} runs along ${name(b)} (parallel: agrees)`,
      against: () => `${name(a)} is set against ${name(b)} (a control facing its subject)`,
      through: () => `${name(a)} is carried through to ${name(b)} (a trail across a change)`,
      inside: () => `${name(a)} lies inside ${name(b)} (its scope)`,
    };
    out.push(words[it.rel]());
  });
  const all = items.flatMap(it => [it.tok, it.mid].filter(Boolean));
  const scopes = (items.scopes || []).map(sc => {
    const ts = all.filter(t => t.scope === sc.id), list = ts.map(t => name({ ...t, neg: false })).join(', ');
    const own = ts.some(t => t.notWord), more = sc.inner - ts.filter(t => t.notWord).length;
    return (own ? `[${list}], one NOT${sc.sign > 0 ? ' (CANCELLED)' : ''}` : `NOT [${list}]`)
      + (more > 0 || (!own && sc.inner) ? ` (an inner not restates the same NOT${sc.sign > 0 ? ', and here CANCELLED it' : ''})` : '');
  });
  const cs = chainSign(items), signW = cs.nots >= 2 || items.some(it => it.rel === 'therefore' || it.rel === 'equals') && cs.nots ? [`across scopes ${cs.nots} NOT${cs.nots > 1 ? 's' : ''} multiply: sign ${cs.sign > 0 ? '+' : '−'}`] : [];
  const states = all.filter(t => t.state !== 'holds' || t.control).map(t => `${name(t)}: ${stateWord[t.state]}${t.control ? ', carries a control' : ''}`);
  const head = items.type && items.type !== 'claim' ? `${items.type.toUpperCase()} (${TYPES[items.type]}): ` : '';
  return head + [...scopes, ...(items.length === 1 ? [name(items[0].tok)] : out), ...signW, ...states].join('. ') + '.';
}
// a reading that never throws a NOT error at the reader: a lost end is COULD NOT TELL
export function reading(src, opts = {}) {
  try { return read(parse(src, opts), opts); } catch (e) { if (e.negScope) return `could not tell: ${e.message}`; throw e; }
}

// ---- drawing (SVG string; no DOM needed, so Node can test it too) ----
const R = 15, RF = 22, PITCH = { acts: 54, therefore: 60, equals: 56, join: 2 * R, seam: 2 * R - 12, spread: 84, gap: 58, between: 104, along: 58, against: 74, through: 100 };
// dice layouts on a 3x3 grid (u, v in -1..1); past nine the rank is written as a numeral
const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]] };
PIPS[5] = [...PIPS[4], [0, 0]]; PIPS[6] = [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]; PIPS[7] = [...PIPS[6], [0, 0]];
PIPS[8] = [...PIPS[6], [0, -1], [0, 1]]; PIPS[9] = [...PIPS[8], [0, 0]];
// Past nine the die NESTS (Doug, 10-08: "fractal index"): each outer spot is a whole die. Full outer spots count one
// unit each (9, then 81, …) and the last is a small die of the remainder: e12 = 9 + 3, e23 = 9 + 9 + 5, e82 = 81 + 1.
// The same rule at every scale, so every LEAF spot counts one: a rank-n unit draws exactly n leaf spots (or n rings).
// s = the radius the die is drawn in (R for a whole unit); spots at 0.43 s, spot radius 0.21 s, as on the plain die.
export function dice(n, x, y, s, c, ring) {
  if (n <= 9) return PIPS[n].map(([u, v]) => ring
    ? `<circle class="ring" cx="${(x + u * .43 * s).toFixed(2)}" cy="${(y + v * .43 * s).toFixed(2)}" r="${(.187 * s).toFixed(2)}" fill="none" stroke="${c}" stroke-width="${(.107 * s).toFixed(2)}"/>`
    : `<circle class="pip" cx="${(x + u * .43 * s).toFixed(2)}" cy="${(y + v * .43 * s).toFixed(2)}" r="${(.207 * s).toFixed(2)}" fill="${c}"/>`).join('');
  let unit = 9; while (unit * 9 < n) unit *= 9;
  const q = Math.floor((n - 1) / unit), rem = n - q * unit, L = PIPS[q + 1];
  // cells as big as their layout allows (two cells take about half the disc each): a gap between cells, all inside the rim
  const near = Math.min(...L.flatMap((a, i) => L.slice(i + 1).map(b => Math.hypot(a[0] - b[0], a[1] - b[1])))), far = Math.max(...L.map(([u, v]) => Math.hypot(u, v)));
  const d = .9 * s / (far + .45 * near), cr = .45 * near * d;
  return L.map(([u, v], k) => { const cx = x + u * d, cy = y + v * d;
    return `<circle class="cell" cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${cr.toFixed(2)}" fill="${c}" fill-opacity=".22"/>` + dice(k < q ? unit : rem, cx, cy, cr, c, ring); }).join('');
}
const big = t => t.face || (t.kind === 'u' && t.unit > 9 && !t.numeral);
function unitGlyph(t, x, y) {
  const cnt = t.state === 'cnt', c = cnt ? GREY : COLOURS[t.colour], op = t.state === 'folds' ? 0.45 : 1, R = big(t) ? RF : 15;
  const dash = t.state === 'posed' ? ' stroke-dasharray="4 3"' : cnt ? ' stroke-dasharray="1.5 3"' : '';
  let g = `<g opacity="${op}"><circle cx="${x}" cy="${y}" r="${R}" fill="${c}" fill-opacity="${t.state === 'holds' ? .16 : 0}" stroke="${c}" stroke-width="2"${dash}/>`;
  if (!t.numeral || t.unit <= 9) g += dice(t.unit, x, y, R, c, t.sign < 0);
  // the planted 'numeral' reader writes the rank past nine as a numeral (the v1 drawing): it must fail the leaf count
  else g += `<text x="${x}" y="${y + 5}" class="sup" text-anchor="middle" fill="${c}"${t.sign < 0 ? ` stroke="${c}" stroke-width=".6" fill-opacity="0"` : ''}>${t.unit}</text>`;
  if (t.state === 'load') g += `<path d="M${x - R} ${y + R + 4}h${2 * R}" stroke="${c}" stroke-width="3"/>`;
  if (t.state === 'folds') g += `<path d="M${x - R - 3} ${y + R + 3}L${x + R + 3} ${y - R - 3}" stroke="${RED}" stroke-width="2.5"/>`;
  g += '</g>';
  if (cnt) g += `<text x="${x - R - 4}" y="${y - R + 4}" class="sup" fill="${GREY}">?</text>`;
  return g;
}
// a hole: a dark pit in a dashed rim, its name in italics under it (no '?' corner mark: that is could-not-tell's)
function holeGlyph(t, x, y, labDy = 0) {
  return `<g class="hole"><circle cx="${x}" cy="${y}" r="${R}" fill="#050608" stroke="#d6dce8" stroke-width="2" stroke-dasharray="6 3"/>`
    + `<path d="M${x - R + 5} ${y - 3}A${R - 5} ${R - 5} 0 0 1 ${x + R - 5} ${y - 3}" fill="none" stroke="#000" stroke-width="5" opacity=".9"/></g>`
    + (t.label ? `<text x="${x}" y="${y + R + 17 + labDy}" class="lab" text-anchor="middle" font-style="italic">${esc(t.label)}</text>` : '');
}
function glyph(t, x, y, labDy = 0) {
  if (t.kind === 'h') return holeGlyph(t, x, y, labDy);
  if (t.kind === 'u') return unitGlyph(t, x, y);
  const cnt = t.state === 'cnt', c = cnt ? GREY : COLOURS[t.colour];
  const dash = t.state === 'posed' ? ' stroke-dasharray="4 3"' : cnt ? ' stroke-dasharray="1.5 3"' : '';
  const fill = t.state === 'holds' ? c : 'none', op = t.state === 'folds' ? 0.45 : 1;
  if (t.face) return faced(t, x, y, c, dash, op, labDy);
  const id = `h${Math.random().toString(36).slice(2, 8)}`;
  let shape, clip;
  if (t.kind === 'o') shape = `<circle cx="${x}" cy="${y}" r="${R}"`;
  else if (t.kind === 's') shape = `<rect x="${x - R + 1}" y="${y - R + 1}" width="${2 * R - 2}" height="${2 * R - 2}" rx="3"`;
  else shape = `<path d="M${x - R} ${y - R + 1} L${x + R + 2} ${y} L${x - R} ${y + R - 1} Z"`;
  let g = `<g opacity="${op}">`;
  if (t.state === 'load') { clip = `<clipPath id="${id}"><rect x="${x - R - 2}" y="${y}" width="${2 * R + 6}" height="${R + 2}"/></clipPath>`; g += clip + `${shape} fill="${c}" clip-path="url(#${id})"/>`; }
  g += `${shape} fill="${fill}" fill-opacity="${t.state === 'holds' ? 0.85 : 0}" stroke="${c}" stroke-width="2"${dash}/>`;
  if (t.kind === 's') g += `<path d="M${x - R - 5} ${y}h5M${x + R} ${y}h5" stroke="${c}" stroke-width="2"/>`;
  if (t.state === 'folds') g += `<path d="M${x - R - 3} ${y + R + 3}L${x + R + 3} ${y - R - 3}" stroke="${RED}" stroke-width="2.5"/>`;
  g += '</g>';
  if (cnt) g += `<text x="${x - 4}" y="${y + 5}" class="sup" fill="${GREY}">?</text>`;
  return g + decor(t, x, y, c, labDy, 0, R);
}
// a glyph with a face: ideas and devices show the READING; an instrument shows its NULL on a dial, with a probe whose
// prongs say what it reads (one: z·z; two: a·b)
function faced(t, x, y, c, dash, op, labDy) {
  const r = RF, cnt = t.state === 'cnt', alg = cnt ? 'n' : t.colour, solid = t.state === 'holds' ? .16 : 0;
  let g = `<g opacity="${op}">`;
  if (t.kind === 's') g += `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" rx="3" fill="${c}" fill-opacity="${solid}" stroke="${c}" stroke-width="2"${dash}/>`;
  else g += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" fill-opacity="${solid}" stroke="${c}" stroke-width="2"${dash}/>`;
  if (t.kind === 't') {
    const pair = (CLASSES[t.face] || {}).operands === 'pair', tip = dy => `<path d="M${x + r - 1} ${y + dy - 4} L${x + r + 11} ${y + dy} L${x + r - 1} ${y + dy + 4}" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/>`;
    g += pair ? tip(-5) + tip(5) : tip(0);
    g += face(t.face, 'n', x, y, r * .78);
  } else g += face(t.face, alg, x, y, r * .78);
  if (t.state === 'load') g += `<path d="M${x - r} ${y + r + 4}h${2 * r}" stroke="${c}" stroke-width="3"/>`;
  if (t.state === 'folds') g += `<path d="M${x - r - 3} ${y + r + 3}L${x + r + 3} ${y - r - 3}" stroke="${RED}" stroke-width="2.5"/>`;
  g += '</g>';
  if (cnt) g += `<text x="${x - r - 2}" y="${y - r + 4}" class="sup" fill="${GREY}">?</text>`;
  return g + decor(t, x, y, c, labDy + (r - R), t.kind === 't' ? 12 : 0, r);
}
function decor(t, x, y, c, labDy, dx, r) {
  let g = '';
  if (t.control) g += `<circle cx="${x + r + 1 + dx}" cy="${y - r - 1}" r="4.5" fill="#14161c" stroke="#ffe066" stroke-width="1.6"/><circle cx="${x + r + 1 + dx}" cy="${y - r - 1}" r="1.4" fill="#ffe066"/>`;
  if (t.frame) g += `<text x="${x + r + 3 + dx}" y="${y + r + 4}" class="sub" fill="${c}">${esc(t.frame)}</text>`;
  if (t.rank) g += `<text x="${x + r + 6 + dx}" y="${y - r + 2}" class="sup" fill="${c}">${esc(t.rank)}</text>`;
  if (t.label) g += `<text x="${x}" y="${y + r + 17 + labDy - (r - R)}" class="lab" text-anchor="middle">${esc(t.label)}</text>`;
  if (t.id) g += `<text x="${x}" y="${y + r + 29 + labDy - (r - R)}" class="lab" text-anchor="middle" fill="${GREY}" style="fill:${GREY}">#${esc(t.id)}</text>`;
  return g;
}
// approximate label width at 11px (no DOM): spacing grows so labels never collide or clip
const lw = t => Math.max((t.label || '').length, t.id ? t.id.length + 1 : 0) * 5.9;
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

// the statement type, drawn as a flow mark round the row (x0..x1 = the row's extent, y = its centre line)
function typeMark(type, x0, x1, y, top, bot) {
  const c = '#7c8496', w = `stroke="${c}" stroke-width="1.4" fill="none"`, chip = `<text x="4" y="12" class="sup" fill="#9aa3b5">${type.toUpperCase()}</text>`;
  const mid = (x0 + x1) / 2, B = bot + 4;
  switch (type) {
    case 'claim': return '';
    case 'flow': return chip + `<path d="M${x0} ${B}H${x1 + 10}" ${w}/><path d="M${x1 + 4} ${B - 5}l7 5l-7 5" ${w}/>`;
    case 'constraint': return chip + `<path d="M${x0 - 6} ${top - 4}H${x1 + 6}M${x0 - 6} ${B}H${x1 + 6}" stroke="${c}" stroke-width="3"/>`;
    case 'friction': return chip + `<path d="M${x0} ${B}H${mid - 14}l5 -8l5 8l5 -8l5 8l5 -8 l4 8H${x1}" ${w}/>`;
    case 'drag': return chip + [0, 1, 2].map(n => `<path d="M${x0 - 8} ${y - 8 + 8 * n}h-${18 + 6 * (n % 2)}" ${w} stroke-dasharray="3 3"/>`).join('') + `<path d="M${x0} ${B}H${x1}" ${w}/>`;
    case 'catch': return chip + `<path d="M${x0} ${B}H${x1}" ${w}/>` + [0, 1, 2, 3].map(n => `<path d="M${x1 + 12 + 5 * n} ${top}V${B}" stroke="#ffe066" stroke-width="1.2"/>`).join('') + [0, 1, 2, 3].map(n => `<path d="M${x1 + 10} ${top + (B - top) * n / 3}h20" stroke="#ffe066" stroke-width="1.2"/>`).join('');
    case 'leak': return chip + `<path d="M${x0 - 6} ${top - 4}H${x1 + 6}M${x0 - 6} ${B}H${mid - 8}M${mid + 8} ${B}H${x1 + 6}" stroke="${c}" stroke-width="3"/><circle cx="${mid}" cy="${B + 9}" r="3.5" fill="${RED}"/>`;
    case 'ask': return chip + `<path d="M${x0} ${B}H${x1}" ${w} stroke-dasharray="4 4"/><text x="${x1 + 14}" y="${y + 6}" class="sup" fill="#9aa3b5" style="font-size:18px">?</text>`;
    case 'correction': return chip + `<path d="M${x1} ${B}H${x0}" ${w}/><path d="M${x0 + 7} ${B - 5}l-7 5l7 5" ${w}/>`;
  }
  return '';
}
// could not tell: a sentence whose NOT lost an end is drawn as an unknown, never as the opposite
function cntBox(msg, height) {
  return `<svg class="gs" viewBox="0 0 330 ${height}" width="330" height="${height}" role="img" aria-label="${esc(msg)}"><rect x="6" y="${height / 2 - 26}" width="318" height="52" rx="8" fill="none" stroke="${GREY}" stroke-dasharray="1.5 3"/><text x="22" y="${height / 2 + 7}" class="sup" fill="${GREY}" style="font-size:20px">?</text><text x="44" y="${height / 2 - 2}" class="lab">could not tell</text><text x="44" y="${height / 2 + 13}" class="lab">a NOT has lost an end: ![ … ]!</text></svg>`;
}

export function svg(src, { height = 118, tight = false, ...opts } = {}) {
  let items; try { items = parse(src, opts); } catch (e) { if (e.negScope) return cntBox(e.message, height); throw e; }
  if (items.some(it => it.tok.face || (it.mid && it.mid.face))) height += 14;
  if (items.scopes.length) height += 14;
  if (items.some(it => it.tok.id || (it.mid && it.mid.id))) height += 12;
  if (items.type !== 'claim') height += 10;
  const seamPad = items.some(it => it.rel === 'seam') ? 12 : 0; height += seamPad; // the seam's right label sits 13 lower: room BELOW the row
  let x = Math.max(R + 14, lw(items[0].tok) / 2 + 6) + (items.type === 'drag' ? 34 : 0), base = x, y = height - 46 - seamPad, body = '', maxX = 0, minX = x;
  const at = new Map(); // token -> [x, y, r] for the scope bars
  const put = (t, gx, gy, labDy = 0) => { at.set(t, [gx, gy, big(t) ? RF : R]); return glyph(t, gx, gy, labDy); };
  items.forEach((it, k) => {
    if (!k) { body += put(it.tok, x, y); maxX = x; return; }
    const ax = base;
    if (it.rel === 'inside') {
      const pt = items[k - 1].tok, r = big(pt) ? RF : R, xr = ax + r + (pt.kind === 't' && pt.face ? 24 : 12), c = COLOURS[it.tok.colour];
      body += `<rect x="${ax - r - 12}" y="${y - r - 14}" width="${xr - ax + r + 12}" height="${2 * r + 40}" rx="12" fill="${c}" fill-opacity=".05" stroke="${c}" stroke-width="1.4" stroke-dasharray="6 4"/>`
        + `<text x="${ax - r - 8}" y="${y - r - 18}" class="lab" fill="${c}">${esc(name(it.tok))}</text>`;
      return;
    }
    if (it.rel === 'normal') {
      const ny = y - 58; body += `<path d="M${ax} ${y - R - 2}V${ny + R + 2}" stroke="#7c8496" stroke-width="1.5"/><path d="M${ax} ${y - R - 2}h7v-7" fill="none" stroke="#7c8496" stroke-width="1"/>`;
      body += put(it.tok, ax, ny); return;
    }
    const prev = items[k - 1].tok, wide = (big(prev) ? RF - R : 0) + (big(it.tok) ? RF - R : 0)
      + (it.rel === 'seam' || it.rel === 'join' ? 0 : Math.max(0, (lw(prev) + lw(it.tok)) / 2 + 10 - PITCH[it.rel]));
    const nx = ax + PITCH[it.rel] + wide + (prev.kind === 't' && prev.face && it.rel !== 'seam' && it.rel !== 'join' ? 12 : 0);
    if (it.rel === 'acts') body += it.sym === '·' || it.sym === '*' ? `<circle cx="${(ax + nx) / 2}" cy="${y}" r="3" fill="#9aa3b5"/>` : `<path d="M${ax + R + 10} ${y - 6}l7 6l-7 6" fill="none" stroke="#7c8496" stroke-width="1.6"/>`;
    if (it.rel === 'therefore') { const gx = (ax + nx) / 2; body += [[0, -6], [-6, 5], [6, 5]].map(([dx, dy]) => `<circle cx="${gx + dx}" cy="${y + dy}" r="2.6" fill="#ffe066"/>`).join(''); }
    if (it.rel === 'equals') { const gx = (ax + nx) / 2; body += `<path d="M${gx - 7} ${y - 4}h14M${gx - 7} ${y + 4}h14" stroke="#ffe066" stroke-width="2.6"/>`; }
    if (it.rel === 'along') body += `<path d="M${ax + R + 6} ${y - 4}H${nx - R - 6}M${ax + R + 6} ${y + 4}H${nx - R - 6}" stroke="#9aa3b5" stroke-width="1.6"/>`;
    if (it.rel === 'against') { const gx = (ax + nx) / 2; body += `<path d="M${ax + R + 6} ${y}H${gx - 6}M${gx - 6} ${y - 10}V${y + 10}M${gx + 6} ${y - 10}V${y + 10}M${gx + 6} ${y}H${nx - R - 6}" stroke="#ffe066" stroke-width="1.8" fill="none"/>`; }
    if (it.rel === 'through') { const pt = { ...items[k - 1].tok, label: '', id: '', control: false, frame: '', rank: '' };
      [.28, .5, .72].forEach((u, n) => { body += `<g opacity="${[.38, .24, .12][n]}">${glyph(pt, ax + (nx - ax) * u, y)}</g>`; });
      body += `<path d="M${ax + R + 4} ${y + R + 6}Q${(ax + nx) / 2} ${y + R + 18} ${nx - R - 4} ${y + R + 6}" stroke="#7c8496" stroke-width="1" stroke-dasharray="2 4" fill="none"/>`; }
    if (it.rel === 'spread') body += `<path d="M${ax + R + 6} ${y}H${nx - R - 6}" stroke="#5e6678" stroke-width="1.2" stroke-dasharray="2 5"/>`;
    if (it.rel === 'gap') { const gx = (ax + nx) / 2; body += `<path d="M${gx} ${y - 22}l-5 8l10 8l-10 8l10 8l-5 6" fill="none" stroke="${RED}" stroke-width="1.6"/>`; }
    if (it.rel === 'between') {
      const mx = (ax + nx) / 2; body += `<path d="M${ax} ${y + R + 22}v5H${nx}v-5" fill="none" stroke="#7c8496" stroke-width="1.2"/>`;
      body += put(it.mid, mx, y - 34);
    }
    body += it.rel === 'seam' ? `<g opacity=".8" style="mix-blend-mode:screen">${put(it.tok, nx, y, 13)}</g>` : put(it.tok, nx, y);
    base = nx; maxX = Math.max(maxX, nx);
  });
  // NOT scopes: one red bar over everything in the scope, NOT at the open end, a tick at the close; restated inner
  // nots are red dots ON the bar (the same NOT again, not a second one)
  for (const sc of items.scopes) {
    const toks = [...at.keys()].filter(t => t.scope === sc.id); if (!toks.length) continue;
    const xs = toks.map(t => at.get(t)), x0 = Math.min(...xs.map(([gx, , r]) => gx - r - 5)), x1 = Math.max(...xs.map(([gx, , r]) => gx + r + 5)), top = Math.min(...xs.map(([, gy, r]) => gy - r)) - 11;
    body += `<path d="M${x0} ${top + 7}V${top}H${x1}V${top + 7}" stroke="${RED}" stroke-width="3.2" fill="none" stroke-linejoin="round"/><text x="${x0}" y="${top - 5}" class="sup" fill="${RED}">NOT</text>`;
    for (const t of toks) if (t.restated) { const [gx] = at.get(t); body += `<circle cx="${gx}" cy="${top}" r="4" fill="#14161c" stroke="${RED}" stroke-width="2"/>`; }
  }
  const tops = [...at.values()].map(([, gy, r]) => gy - r), bots = [...at.values()].map(([, gy, r]) => gy + r);
  body = typeMark(items.type, minX - R, maxX + R, y, Math.min(...tops), Math.max(...bots)) + body;
  const cs = chainSign(items); if (cs.nots >= 2) body += `<text x="${maxX + R + 10}" y="${y - R - 6}" class="sup" fill="#ffe066" style="font-size:17px">${cs.sign > 0 ? '+' : '−'}</text>`;
  const w = Math.max(maxX + R + (items.type === 'catch' ? 70 : 46), maxX + lw(items[items.length - 1].tok) / 2 + 12);
  let vb = [0, 0, w, height];
  // tight (for text: glyph_md.js): crop the frame to what is drawn, so a glyph in a line of words is not mostly margin
  if (tight) {
    const toks = [...at.entries()], rels = new Set(items.map(it => it.rel)), any = f => toks.some(([t]) => f(t));
    const left = Math.min(...toks.map(([t, [gx, , r]]) => gx - Math.max(r + (t.kind === 's' ? 6 : 0), lw(t) / 2))) - 6;
    const right = Math.max(...toks.map(([t, [gx, , r]]) => gx + Math.max(r + (t.kind === 's' ? 6 : 0) + (t.kind === 't' && t.face ? 12 : 0) + (t.frame || t.rank || t.control ? 14 : 0), lw(t) / 2))) + (cs.nots >= 2 ? 22 : 6);
    const top = Math.min(...tops) - 8 - (items.scopes.length ? 22 : 0) - (rels.has('inside') ? 26 : 0) - (any(t => t.state === 'cnt') ? 4 : 0);
    const bot = Math.max(...bots) + 6 + (any(t => t.label) ? 18 : 0) + (any(t => t.id) ? 12 : 0) + (rels.has('seam') && any(t => t.label) ? 13 : 0)
      + (rels.has('between') ? 16 : 0) + (rels.has('through') ? 14 : 0) + (any(t => t.frame) ? 6 : 0) + (items.type !== 'claim' ? 16 : 0) + (any(t => t.state === 'load') ? 6 : 0);
    const x0 = items.type !== 'claim' ? 0 : Math.max(0, left), x1 = items.type !== 'claim' ? w : right;
    vb = [x0, top, x1 - x0, bot - top].map(v => Math.round(v)); // may start above 0: the frame follows the drawing
  }
  return `<svg class="gs" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}" role="img" aria-label="${esc(read(items))}">${body}</svg>`;
}

// Self-test. Plants: 'commute' (a reader that ignores order) must fail the order checks; 'oneended' (closes a lost NOT
// end silently) must fail the dropped-end checks; 'cancel' (an inner not cancels) must fail the concord check;
// 'symbols' (the v1–v4 reader that took - / | ~ , = as spacing relations) must fail the no-silent-misread checks;
// 'unsigned' (a reader that drops a unit's sign, the dropped negate again) must fail the ring and sign checks;
// 'numeral' (writes a rank past nine as a numeral) must fail the leaf-count checks; 'holecnt' (draws a missing word
// as could-not-tell) must fail the hole checks; 'wordnot' (a not inside a NOT stays as text) must fail word concord;
// 'strict' (refuses the loose forms) must fail the loose-form check.
export function selfTest({ sabotage = null } = {}) {
  const rows = [], ok = (name, pass, detail = '') => rows.push({ name, pass, detail });
  const P = { oneEnded: sabotage === 'oneended', cancelInner: sabotage === 'cancel' }, rd = s => reading(s, P);
  const pairs = [['o.b(i) > o.b(j)', 'o.b(j) > o.b(i)'], ['t*(norm) > o.q(Q)', 'o.q(Q) > t*(norm)'], ['s(z²) > o.b(B)', 'o.b(B) > s(z²)']];
  for (const [a, b] of pairs) { const ra = read(parse(a), { commute: sabotage === 'commute' }), rb = read(parse(b), { commute: sabotage === 'commute' }); ok(`order carries meaning: "${a}" vs "${b}"`, ra !== rb, ra); }
  for (const bad of ['x(nope)', 'o > > o', 'o(a) o(b)', '> o', 'o.z(a)', 't=nope', 'nonsense: o']) { let threw = false; try { parse(bad); } catch (e) { threw = true; } ok(`rejects "${bad}"`, threw); }
  const rels = ['o join o', 'o seam o', 'o spread o', 'o gap o', 'o normal o', 'o [s] o', 'o > o', 'o · o', 'o ∴ o', 'o = o', 'o along o', 'o <> o', 'o ~> o', 'o @ o.b(scope)', '![o(x)]! > o', ...Object.keys(TYPES).map(t => `${t}: o > o`)];
  for (const r of rels) { let pass = true; try { svg(r); read(parse(r)); } catch (e) { pass = false; } ok(`draws "${r}"`, pass); }
  const a = 't=size > o.b:folds(hand)', b2 = 't=size > o.b:cnt(hand)';
  ok('could-not-tell differs from folds (words and picture)', read(parse(a)) !== read(parse(b2)) && svg(a) !== svg(b2), read(parse(b2)));
  const p1 = svg('t=size'), p2 = svg('t=order');
  ok('probe prongs follow the operands (size: one, order: two)', (p1.match(/L[^"]*L[^"]*" fill/g) || []).length < (p2.match(/L[^"]*L[^"]*" fill/g) || []).length);
  // NOT: two-ended, concord inside, cancellation across
  for (const lost of ['![o(x) > o(y)', 'o(x) > o(y)]!', '!o(x) > o(y)']) ok(`a NOT that lost an end reads could not tell: "${lost}"`, rd(lost).startsWith('could not tell'), rd(lost).slice(0, 60));
  const neg = rd('![o.b(j) > o.b(i)]!'); ok('a whole NOT reads NOT first and differs from the positive', neg.startsWith('NOT') && neg !== rd('o.b(j) > o.b(i)'), neg.slice(0, 60));
  let s1; try { s1 = chainSign(parse('![!o(x)]! ∴ o(r)', P)).sign; } catch (e) { s1 = 0; }
  ok('concord: an inner not restates the NOT, it does not cancel it (two wrongs don\'t make a right)', s1 === -1, `sign ${s1}`);
  const s2 = chainSign(parse('![o(x)]! · ![o(y)]! ∴ o(x·y)')).sign, s3 = chainSign(parse('![o(x)]! · o(y) ∴ o(x·y)')).sign;
  ok('across scopes NOTs multiply: two give +, one gives −', s2 === 1 && s3 === -1, `${s2}, ${s3}`);
  // keyboard forms: * is times between atoms but the control mark inside one; :. is therefore
  const k1 = parse('o(x) * o(y) :. o(xy)'), k2 = parse('o*(x) * o(y)');
  ok('keyboard * = times and :. = therefore, read like · and ∴', k1[1].rel === 'acts' && k1[2].rel === 'therefore' && reading('o(x) * o(y)') === reading('o(x) · o(y)'), reading('o(x) * o(y) :. o(xy)').slice(0, 60));
  ok('* before a label is the control mark, after it is times', k2[0].tok.control && k2[1].rel === 'acts' && !k2[1].tok.control);
  let thr = false; try { parse('o* o'); } catch (e) { thr = true; } ok('a dropped space ("o* o") is an error, not a silent swap', thr);
  // rookie absorption (10-08): a mark with an everyday maths meaning must never be read silently as a spacing relation.
  // Each either reads the maths meaning (= is equals) or stops with a hint naming the word to write.
  const P2 = { symbols: sabotage === 'symbols' };
  const eq = (() => { try { return reading('o.b(i) * o.b(j) = o.b(+j)', P2); } catch (e) { return 'threw'; } })();
  ok('"=" is equals: i·j = +j reads "the product equals +j"', eq.includes('the product equals +j'), eq.slice(0, 70));
  for (const [s, word] of [['o(x) - o(y)', 'join'], ['o(x) / o(y)', 'gap'], ['o(x) | o(y)', 'normal'], ['o(x) ~ o(y)', 'seam'], ['o(a) , o(b)', 'spread']]) {
    let msg = ''; try { parse(s, P2); } catch (e) { msg = e.message; }
    ok(`no silent misread: "${s}" stops with a hint to write "${word}"`, msg.includes(`did you mean "${word}"`), msg.slice(0, 70) || 'parsed silently');
  }
  for (const [s, want] of [['o(x) -> o(y)', '">"'], ['o(x) => o(y)', '":."'], ['o.B(i)', '.b'], ['o:hold(x)', ':holds'], ['idea(x) > o', 'o idea'], ['o(i)o(j)', 'write *'], ['o(x) != o(y)', '![A = B]!']]) {
    let msg = ''; try { parse(s); } catch (e) { msg = e.message; }
    ok(`a rejection teaches: "${s}" names ${want}`, msg.includes(want), msg.slice(0, 70) || 'parsed');
  }
  ok('"~>" (through) survives the "~" hint', (() => { try { return parse('o ~> o')[1].rel === 'through'; } catch (e) { return false; } })());
  ok('= cuts the sign chain like ∴: ![x]! * ![y]! = o(xy) is +', chainSign(parse('![o(x)]! * ![o(y)]! = o(xy)')).sign === 1);
  // units (Doug, 10-08): dice spots for i j k e<n>, rings for an inverted unit. Plant 'unsigned' drops the sign.
  const P3 = { unsigned: sabotage === 'unsigned' }, cnt = (src, cls) => (svg(src, P3).match(new RegExp(`class="${cls}"`, 'g')) || []).length;
  ok('units draw their rank as dice spots: i 1, j 2, k 3, e5 5', cnt('i.b', 'pip') === 1 && cnt('j.b', 'pip') === 2 && cnt('k.b', 'pip') === 3 && cnt('e5.b', 'pip') === 5);
  ok('an inverted unit draws rings, not spots: −k is 3 rings', cnt('-k.b', 'ring') === 3 && cnt('-k.b', 'pip') === 0 && cnt('−k.b', 'ring') === 3, `${cnt('-k.b', 'ring')} rings, ${cnt('-k.b', 'pip')} spots`);
  const ur = reading('j.b * i.b = -i.b', P3);
  ok('a unit sentence reads with its sign: j·i = −i', ur.includes('the product equals −i'), ur.slice(0, 70));
  const P4 = { numeral: sabotage === 'numeral' }, leaves = (src, cls) => (svg(src, P4).match(new RegExp(`class="${cls}"`, 'g')) || []).length;
  ok('past nine the die nests, and every leaf spot counts one: e12 12, e23 23, e81 81, e82 82', [12, 23, 81, 82].every(n => leaves(`e${n}.b`, 'pip') === n), [12, 23, 81, 82].map(n => leaves(`e${n}.b`, 'pip')).join(' '));
  ok('a nested die keeps its outer spots: e12 has 2 cells (9 + 3), e23 3 (9 + 9 + 5), e82 2 (81 + 1)', leaves('e12', 'cell') === 2 + 0 && leaves('e23', 'cell') === 3 && leaves('e82', 'cell') === 2 + 9);
  ok('an inverted nested die is all rings: −e23 is 23 rings, 0 spots', leaves('-e23.b', 'ring') === 23 && leaves('-e23.b', 'pip') === 0);
  ok('i*j with no spaces is i times j (no control mark on a unit)', (() => { try { const u = parse('i*j'); return u.length === 2 && u[1].rel === 'acts'; } catch (e) { return false; } })());
  ok('a unit does not swallow a word: "idea(x)" still hints, "j" is not "join"', (() => { try { parse('idea(x)'); return false; } catch (e) { return e.message.includes('o idea'); } })()
    && (() => { try { return parse('i join j')[1].rel === 'join'; } catch (e) { return false; } })());
  // concord on words + loose forms (Doug, 10-10). Plants: 'wordnot' (the not stays as label text) and 'cancel' must fail
  // the first; 'strict' (no loose forms) must fail the second.
  const P6 = { cancelInner: sabotage === 'cancel', wordNot: sabotage === 'wordnot', strict: sabotage === 'strict' };
  const wr = s => { try { const it = parse(s, P6); return { r: read(it), sign: chainSign(it).sign, lab: it[0].tok.core ?? it[0].tok.label }; } catch (e) { return { r: 'threw ' + e.message, sign: 0, lab: '' }; } };
  const wa = wr('![o(not to -c)]!'), wb = wr('![o(to -c)]!');
  ok('concord on a word: ![o(not to -c)]! is the same NOT as ![o(to -c)]!, and keeps the words as typed', wa.sign === -1 && wa.sign === wb.sign && wa.lab === wb.lab && wa.r.startsWith('[not to -c], one NOT.') && !wa.r.includes('¬not') && !wa.r.includes('CANCELLED'), wa.r.slice(0, 80));
  const lz = ['!(to -c)!', '![to -c]!', '![not to "-c"]!'].map(s => wr(s));
  ok('loose forms: !(to -c)!, ![to -c]! read NOT [to -c]; ![not to "-c"]! reads [not to "-c"], one NOT', lz.every((x, k) => x.sign === -1 && x.r.startsWith(k === 2 ? '[not to "-c"], one NOT' : 'NOT [to -c]')), lz.map(x => x.r.slice(0, 30)).join(' | '));
  ok('outside a NOT a not is a word: o(not to -c) reads "not to -c", no NOT', (() => { try { return reading('o(not to -c)') === 'not to -c.'; } catch (e) { return false; } })());
  ok('a half loose form still stops: "!(x" and "!(x)" name the two-ended NOT', ['!(x', '!(x)'].every(s => { try { parse(s); return false; } catch (e) { return e.message.includes('![ … ]!'); } }));
  ok('a real sentence inside a NOT is not swallowed as words', (() => { try { const it = parse('![o(a) > o(b)]!'); return it.length === 2 && it[1].rel === 'acts'; } catch (e) { return false; } })());
  ok('!( … )! scopes a whole sentence too: !(o(a) > !o(b))! reads exactly as ![o(a) > !o(b)]!', (() => { try { return read(parse('!(o(a) > !o(b))!', P6)) === read(parse('![o(a) > !o(b)]!')); } catch (e) { return false; } })());
  // holes (Doug, 10-08): a missing word, never drawn or read as could-not-tell
  const P5 = { holecnt: sabotage === 'holecnt' };
  const hr = (() => { try { return reading('o.b(B) seam ?(word for a reign\'s islands)', P5); } catch (e) { return 'threw ' + e.message; } })();
  ok('a hole reads as a missing word, with its name', hr.includes("[missing word: word for a reign's islands]"), hr.slice(0, 80));
  const hs = svg('?(x)', P5), cs2 = svg('o:cnt(x)');
  ok('a hole is not drawn as could-not-tell (a socket, no ? mark)', hs.includes('class="hole"') && !/>\?<\/text>/.test(hs) && hs !== cs2);
  ok('a bare ? is an unnamed hole, and ? before a word is not a hole', (() => { try { return parse('o > ?')[1].tok.kind === 'h' && parse('?(a) > o')[0].tok.label === 'a'; } catch (e) { return false; } })()
    && (() => { try { parse('?x'); return false; } catch (e) { return true; } })());
  const ids = parse('o#size_ring(claim) > s#size_ring(gxt) > t=size#size_ring');
  ok('one atom, three views: the same #id as idea, device and instrument', ids.every(it => it.tok.id === 'size_ring') && new Set(ids.map(it => it.tok.kind)).size === 3);
  return { pass: rows.every(r => r.pass), rows };
}
