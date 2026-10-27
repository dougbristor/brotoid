// copy_ref / v1
// codetree:copy_ref/v1 — see codetree/blocks/copy_ref/
//
// A copied reference names its page (Doug 10-21: "'fig 3: settings' means less than 'Page A: fig 3: settings'").
// One line, readable, then the link that reopens it:
//   page fable/proto_brotoid?v=gallery “BROT: one number, four readings” : Fig 3 · the hand over every direction q can point : q 0.9·(40°, 10°)
//   http://localhost:8088/fable/proto_brotoid/?v=gallery#fig-hand
// The page id is the served path (agent/page, as in the URL map), so a reader can find the page from the ref alone.
//
//   pageId(loc?)                                    'fable/proto_brotoid' (+ '?v=…' when the page has a view)
//   makeRef({ fig, title, id, settings }, env?)     the two-line ref; env = { loc, title } (defaults: location, document.title)
//   parseRef(text)                                  { page, view, pageTitle, fig, title, settings, url, id } or null
//   refButtons(root, { settings, label, tagCopies }) a 'ref' button on every figure[id]; tagCopies: a selection copied inside a
//                                                   figure gets its ref appended (off by default)

const SEP = ' : ';
const clean = s => String(s ?? '').replace(/\s+/g, ' ').trim();

/** Readable page id from a location: the served path without index.html or the trailing slash, plus the view query. */
export function pageId(loc = globalThis.location) {
  const p = decodeURIComponent(loc.pathname).replace(/\/index\.html?$/, '').replace(/^\/+|\/+$/g, '');
  const v = new URLSearchParams(loc.search).get('v');
  return (p || '(root)') + (v ? `?v=${v}` : '');
}

/** The ref: "page <id> “<title>” : <fig> · <title> : <settings>", then the link to the figure. */
export function makeRef({ fig = '', title = '', id = '', settings = '' } = {}, env = {}) {
  const loc = env.loc ?? globalThis.location, pt = clean(env.title ?? globalThis.document?.title);
  const head = `page ${pageId(loc)}` + (pt ? ` “${pt}”` : '');
  const what = [clean(fig), clean(title)].filter(Boolean).join(' · ');
  const url = loc.origin + loc.pathname + loc.search + (id ? '#' + id : '');
  return [[head, what, clean(settings)].filter(Boolean).join(SEP), url].join('\n');
}

/** Read a pasted ref back. null if it has no page id or no link (the two things a bare 'fig 3: settings' lacks). */
export function parseRef(text) {
  const lines = String(text).split('\n').map(s => s.trim()).filter(Boolean);
  const k = lines.findIndex(l => l.startsWith('page ')), url = lines.find(l => /^https?:\/\//.test(l));
  if (k < 0 || !url) return null;
  const [head, what = '', ...rest] = lines[k].slice(5).split(SEP), m = head.match(/^(\S+)(?: “(.*)”)?$/);
  if (!m) return null;
  const [page, view] = m[1].split('?v='), [fig, ...tt] = what.split(' · ');
  return { page, view: view ?? null, pageTitle: m[2] ?? '', fig: tt.length ? fig : '', title: tt.length ? tt.join(' · ') : fig,
    settings: rest.join(SEP), url, id: url.includes('#') ? url.slice(url.indexOf('#') + 1) : '' };
}

// a figure's shown number: its heading's .n, else the text of a link to it (fable's .fref anchors read "Fig N"), else none
function figLabel(f, root) {
  const n = f.querySelector('h2 .n, h3 .n, .n');
  if (n && clean(n.textContent)) return clean(n.textContent);
  const a = root.querySelector(`a[href="#${CSS.escape(f.id)}"]`);
  return a && /^fig/i.test(clean(a.textContent)) ? clean(a.textContent) : '';
}
function figTitle(f) {
  if (f.dataset.title) return f.dataset.title;
  const h = f.querySelector('h2, h3, figcaption'); if (!h) return '';
  const c = h.cloneNode(true); c.querySelectorAll('.n, button').forEach(e => e.remove()); return clean(c.textContent);
}

/** A 'ref' button on every figure[id] under root (skips figures that already have one). */
export function refButtons(root = document, { settings = () => '', label = figLabel, tagCopies = false, onCopy } = {}) {
  const refOf = f => makeRef({ fig: label(f, root), title: figTitle(f), id: f.id, settings: settings(f) });
  for (const f of root.querySelectorAll('figure[id]')) {
    if (f.querySelector('.copyref')) continue;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'copyref'; b.textContent = 'ref';
    b.title = 'copy a reference to this figure: page, figure, settings and link';
    b.addEventListener('click', async () => { const t = refOf(f); let ok = true; try { await navigator.clipboard.writeText(t); } catch (e) { ok = false; } onCopy?.(t, ok, f); });
    (f.querySelector('figcaption') ?? f).appendChild(b);
  }
  if (tagCopies) root.addEventListener('copy', e => { const s = getSelection(), f = s.anchorNode?.parentElement?.closest('figure[id]');
    if (!f || s.isCollapsed) return; e.clipboardData.setData('text/plain', s.toString() + '\n' + refOf(f)); e.preventDefault(); });
  return refOf;
}
