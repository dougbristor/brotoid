/* sites 10-28: the one top nav bar for bristorbrot.org (Doug: "a simple unified nav bar so people can navigate the site ... user collapsable").
   One script tag per page; it brings its own CSS, so assets/site.css (a stamped file) is untouched. The links are relative to this file,
   so the bar works at the site root, in a subfolder, or on a staging copy. A fold button (▲) shrinks the bar to a small tab (▼) and the
   choice is remembered in this browser; storage that is blocked just means the bar starts open each visit. */
(function () {
  var me = document.currentScript, root = me ? new URL('../', me.src).href : '/';
  var LINKS = [['Home', ''], ['The brot', '#body'], ['Bristorians', '#bristorians'], ['Algebra', 'algebra/'], ['Brotoid', 'brotoid/'], ['About', 'about/'], ['Taste', 'taste/'],
    ['GitHub', 'https://github.com/dougbristor/bristorbrot']];
  var KEY = 'topnav-folded', folded = false;
  try { folded = localStorage.getItem(KEY) === '1'; } catch (e) {}
  var here = location.pathname.replace(/index\.html$/, '');

  var css = document.createElement('style');
  css.textContent = [
    ':root { --tn-h: 42px; }',
    // --tn-off is the room the bar takes right now (0 when folded or absent): a page with its own sticky parts offsets them by it
    ':root { --tn-off: 0px; } html.tn-open { --tn-off: var(--tn-h); }',
    '#topnav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; height: var(--tn-h); display: flex; align-items: center; gap: 6px; padding: 0 8px 0 14px;',
    '  background: rgba(5,5,6,.92); border-bottom: 1px solid #23252d; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);',
    '  font: 12px/1 "JetBrains Mono", ui-monospace, monospace; text-transform: uppercase; letter-spacing: .08em; }',
    '#topnav .tn-brand { color: #eee9e0; font: 13px/1 "Archivo Black", Impact, sans-serif; letter-spacing: .04em; text-decoration: none; margin-right: 10px; white-space: nowrap; }',
    '#topnav .tn-links { display: flex; flex: 1; min-width: 0; gap: 2px; overflow-x: auto; scrollbar-width: none; }',
    '#topnav .tn-links::-webkit-scrollbar { display: none; }',
    '#topnav a.tn-l { color: #8a8a93; text-decoration: none; padding: 14px 9px; white-space: nowrap; border-bottom: 2px solid transparent; }',
    '#topnav a.tn-l:hover { color: #eee9e0; }',
    '#topnav a.tn-l[aria-current="page"] { color: #19e0ff; border-bottom-color: #ff5a1f; }',
    '#topnav button { background: none; border: 1px solid #23252d; color: #8a8a93; border-radius: 4px; width: 30px; height: 26px; cursor: pointer; font: 11px/1 system-ui, sans-serif; padding: 0; }',
    '#topnav button:hover { color: #eee9e0; border-color: #8a8a93; }',
    '#topnav.folded { left: auto; right: 10px; height: 26px; width: 38px; padding: 0; justify-content: center; border: 1px solid #23252d; border-top: 0; border-radius: 0 0 6px 6px; }',
    '#topnav.folded > :not(.tn-fold) { display: none; }',
    '#topnav.folded button { border: 0; width: 38px; height: 26px; }',
    'html.tn-open { scroll-padding-top: calc(var(--tn-h) + 8px); }',
    'html.tn-open body:not(.home) { padding-top: var(--tn-h); }',
    '@media (max-width: 560px) { #topnav .tn-brand { display: none; } #topnav { padding-left: 4px; } #topnav a.tn-l { padding: 14px 7px; } }',
    '@media print { #topnav { display: none; } html.tn-open body:not(.home) { padding-top: 0; } }'
  ].join('\n');
  document.head.appendChild(css);

  var bar = document.createElement('nav'); bar.id = 'topnav'; bar.setAttribute('aria-label', 'Site');
  var brand = document.createElement('a'); brand.className = 'tn-brand'; brand.href = root; brand.textContent = 'Bristorbrot';
  var ul = document.createElement('div'); ul.className = 'tn-links';
  LINKS.forEach(function (l) {
    var a = document.createElement('a'); a.className = 'tn-l'; a.textContent = l[0];
    var ext = /^https?:/.test(l[1]); a.href = ext ? l[1] : new URL(l[1], root).href; if (ext) a.rel = 'noopener';
    var path = ext ? null : new URL(l[1], root).pathname;
    if (path && !/#/.test(l[1]) && (path === here || (path !== new URL('./', root).pathname && here.indexOf(path) === 0))) a.setAttribute('aria-current', 'page');
    ul.appendChild(a);
  });
  var fold = document.createElement('button'); fold.type = 'button'; fold.className = 'tn-fold';
  function paint() { bar.classList.toggle('folded', folded); document.documentElement.classList.toggle('tn-open', !folded);
    fold.textContent = folded ? '▼' : '▲'; fold.title = fold.ariaLabel = folded ? 'Show the menu' : 'Fold the menu away'; fold.setAttribute('aria-expanded', String(!folded)); }
  fold.addEventListener('click', function () { folded = !folded; try { localStorage.setItem(KEY, folded ? '1' : '0'); } catch (e) {} paint(); });
  bar.append(brand, ul, fold); paint();
  (document.body ? Promise.resolve() : new Promise(function (r) { addEventListener('DOMContentLoaded', r, { once: true }); })).then(function () { document.body.prepend(bar); });
})();
