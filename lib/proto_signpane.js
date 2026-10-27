// proto_signpane.js — the Sign as a pane (fable 2026-10-13): the glyph in play, drawn by the glyph grammar on the page and
// handed over as html, with the grammar's reading under it. In a frame or a window it keeps the last glyph shown, marked as
// past once nothing is in play, so it can be read at leisure; the inset in the corner stays the default (proto_panes.js P1).
const css = `
.sgn { box-sizing: border-box; padding: 12px; overflow: auto; background: #0d0e12; color: #e8e8ee; font: 12px ui-monospace, monospace; }
.sgn svg { display: block; max-width: 100%; height: auto; } .sgn svg .lab { font: 11px system-ui; fill: #aab2c3; } .sgn svg .sub, .sgn svg .sup { font: 700 11px system-ui; }
.sgn .nt { font: 700 12px system-ui; letter-spacing: .06em; text-transform: uppercase; color: #ffe14d; margin-bottom: 4px; }
.sgn .rd { font: 13px/1.4 ui-monospace, monospace; color: #b9bdc9; margin-top: 8px; }
.sgn .err { border: 1px solid #ff5470; color: #ff5470; border-radius: 6px; padding: 2px 6px; font: 12px system-ui; }
.sgn .empty, .sgn .past { color: #8a8a93; font-size: 11px; margin-bottom: 6px; } .sgn.was > :not(.past) { opacity: .55; }`;
export function mountPane(root) {
  if (!document.getElementById('sgn-css')) { const st = document.createElement('style'); st.id = 'sgn-css'; st.textContent = css; document.head.appendChild(st); }
  root.classList.add('sgn'); root.innerHTML = '<div class="empty">no glyph in play yet</div>';
  return { recv(m) { if (m?.type !== 'sign') return;
    if (m.html) { root.classList.remove('was'); root.innerHTML = m.html; }
    else if (root.querySelector('svg')) { root.classList.add('was'); if (!root.querySelector('.past')) root.insertAdjacentHTML('afterbegin', '<div class="past">last glyph shown (nothing in play now)</div>'); } } };
}
