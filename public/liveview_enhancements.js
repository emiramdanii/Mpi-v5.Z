// ═══════════════════════════════════════════════════════════════
// LIVEVIEW_ENHANCEMENTS.JS v5.0 — Lean & Efficient
// ═══════════════════════════════════════════════════════════════
// Berisi:
//   AT_LAYOUT     — layout picker dengan injeksi CSS ke student HTML
//
// Yang dihapus (v4.0 → v5.0):
//   - AT_LIVE_SYNC — REDUNDAN, sudah di-handle oleh unified markDirty
//   - AT_PAGE_SYNC — no-op, tidak diperlukan
//   - Polling 1.5s — boros & tidak perlu
//   - markDirty patch ke-3 — sudah di-handle di liveview.js
//   - Double debounce — hanya 1 debounce 300ms di AT_SPLITVIEW
//
// Arsitektur sinkronisasi (sederhana):
//   Form change → markDirty() → scheduleRefresh() → refresh() [300ms]
// ═══════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════════
   AT_LAYOUT — Layout picker + injeksi CSS ke student HTML
   ══════════════════════════════════════════════════════════════ */
window.AT_LAYOUT = {

  LAYOUTS: [
    { id: 'classic',   name: 'Klasik',     desc: 'Nav atas + kartu konten',       icon: '📱', preview: 'classic' },
    { id: 'fullwidth', name: 'Full Width', desc: 'Konten lebar penuh',           icon: '🖥️', preview: 'fullwidth' },
    { id: 'card-grid', name: 'Card Grid',  desc: 'Grid dua kolom responsif',    icon: '🃏', preview: 'grid' },
    { id: 'magazine',  name: 'Majalah',    desc: 'Hero besar + highlight',       icon: '📰', preview: 'magazine' },
    { id: 'minimal',   name: 'Minimal',    desc: 'Bersih, fokus konten',        icon: '✨', preview: 'minimal' },
    { id: 'dark-hero', name: 'Dark Hero',  desc: 'Dramatis dengan aksen neon',   icon: '🌑', preview: 'dark-hero' }
  ],

  PAGES: [
    { id: 'sc',    label: '🏠 Cover' },
    { id: 'scp',   label: '📋 Dokumen' },
    { id: 'smat',  label: '📝 Materi' },
    { id: 'smods', label: '🧩 Modul' },
    { id: 'skuis', label: '❓ Kuis' },
    { id: 'shas',  label: '📊 Hasil' },
  ],

  _pickerOpen: false,

  _getState() {
    if (!AT_STATE.layout) {
      AT_STATE.layout = { global: 'classic', usePerPage: false };
      this.PAGES.forEach(p => { AT_STATE.layout['page_' + p.id] = 'classic'; });
    }
    return AT_STATE.layout;
  },

  togglePicker() {
    this._pickerOpen = !this._pickerOpen;
    const panel = document.getElementById('layoutPickerPanel');
    panel?.classList.toggle('show', this._pickerOpen);
    if (this._pickerOpen) {
      this._render();
      setTimeout(() => {
        document.addEventListener('click', this._handleOutside.bind(this), { once: true });
      }, 50);
    }
  },

  closePicker() {
    this._pickerOpen = false;
    document.getElementById('layoutPickerPanel')?.classList.remove('show');
  },

  _handleOutside(e) {
    const panel = document.getElementById('layoutPickerPanel');
    if (panel?.contains(e.target)) {
      setTimeout(() => {
        document.addEventListener('click', this._handleOutside.bind(this), { once: true });
      }, 50);
      return;
    }
    this.closePicker();
  },

  _render() {
    const state = this._getState();
    const grid  = document.getElementById('layoutPickerGrid');
    const pages = document.getElementById('layoutPageToggles');
    if (!grid) return;

    grid.innerHTML = this.LAYOUTS.map(l => `
      <div class="layout-card ${state.global === l.id ? 'active' : ''}"
           onclick="AT_LAYOUT._pick('${l.id}')"
           id="lcard_${l.id}">
        <div class="layout-card-preview">${this._thumb(l.preview)}</div>
        <div class="layout-card-name">${l.icon} ${l.name}</div>
        <div class="layout-card-desc">${l.desc}</div>
      </div>
    `).join('');

    if (pages) {
      const perPageChecked = state.usePerPage;
      pages.innerHTML = `
        <label style="display:flex;align-items:center;gap:7px;font-size:.74rem;cursor:pointer;grid-column:1/-1;margin-bottom:6px;color:var(--text)">
          <input type="checkbox" ${perPageChecked ? 'checked' : ''}
            onchange="AT_LAYOUT._togglePerPage(this.checked)">
          Atur layout berbeda per-halaman
        </label>
        ${perPageChecked ? this.PAGES.map(p => `
          <div style="display:flex;align-items:center;justify-content:space-between;
            padding:6px 8px;background:var(--card2);border:1px solid var(--border);
            border-radius:8px;gap:6px">
            <span style="font-size:.72rem;font-weight:600;white-space:nowrap">${p.label}</span>
            <select style="font-size:.68rem;padding:3px 6px;border-radius:6px;
              border:1px solid var(--border);background:var(--bg3);color:var(--text);
              cursor:pointer;flex-shrink:0"
              onchange="AT_LAYOUT._setPage('${p.id}',this.value)">
              ${this.LAYOUTS.map(l =>
                `<option value="${l.id}" ${(state['page_'+p.id]||'classic')===l.id?'selected':''}>${l.icon} ${l.name}</option>`
              ).join('')}
            </select>
          </div>
        `).join('') : ''}
      `;
    }
  },

  _thumb(type) {
    const bar = (w, accent) =>
      `<div style="height:3px;border-radius:3px;margin-bottom:3px;width:${w}%;background:${accent?'rgba(245,200,66,.5)':'rgba(255,255,255,.12)'}"></div>`;
    const thumbs = {
      'classic': `<div style="position:absolute;inset:0;display:flex"><div style="width:100%;display:flex;flex-direction:column;padding:5px 6px"><div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px;margin-bottom:4px"></div>${bar(60,true)}${bar(85)}${bar(70)}</div></div>`,
      'fullwidth': `<div style="position:absolute;inset:0;padding:5px 8px;display:flex;flex-direction:column"><div style="height:5px;border-radius:3px;margin-bottom:5px;background:linear-gradient(90deg,rgba(245,200,66,.5),rgba(56,217,217,.3));width:100%"></div>${bar(85)}${bar(70)}${bar(90)}</div>`,
      'grid': `<div style="position:absolute;inset:0;padding:5px;display:grid;grid-template-columns:1fr 1fr;gap:3px">${['rgba(245,200,66,.12)','rgba(56,217,217,.1)','rgba(167,139,250,.1)','rgba(52,211,153,.1)'].map(c=>`<div style="border-radius:4px;background:${c};border:1px solid rgba(255,255,255,.06)"></div>`).join('')}</div>`,
      'magazine': `<div style="position:absolute;inset:0;padding:4px;display:grid;grid-template-columns:1.6fr 1fr;gap:3px"><div style="border-radius:4px;background:rgba(56,217,217,.15);border:1px solid rgba(56,217,217,.2)"></div><div style="display:flex;flex-direction:column;gap:3px"><div style="flex:1;border-radius:4px;background:rgba(255,255,255,.06)"></div><div style="flex:1;border-radius:4px;background:rgba(255,255,255,.06)"></div></div></div>`,
      'minimal': `<div style="position:absolute;inset:0;padding:6px 10px;display:flex;flex-direction:column;gap:3px;background:rgba(255,255,255,.02)"><div style="height:4px;border-radius:3px;width:45%;background:rgba(255,255,255,.25)"></div>${bar(80)}${bar(65)}${bar(75)}</div>`,
      'dark-hero': `<div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(245,200,66,.18),rgba(56,217,217,.12));display:flex;align-items:center;padding:6px"><div style="flex:1"><div style="height:6px;border-radius:3px;background:rgba(245,200,66,.6);width:75%;margin-bottom:4px"></div><div style="height:3px;border-radius:3px;background:rgba(255,255,255,.2);width:55%"></div></div><div style="font-size:1.4rem;opacity:.7">✨</div></div>`
    };
    return thumbs[type] || thumbs['classic'];
  },

  _pick(id) {
    const state = this._getState();
    state.global = id;
    document.querySelectorAll('.layout-card').forEach(c => c.classList.remove('active'));
    document.getElementById('lcard_' + id)?.classList.add('active');
    AT_EDITOR.markDirty();
  },

  _togglePerPage(checked) {
    this._getState().usePerPage = checked;
    this._render();
    AT_EDITOR.markDirty();
  },

  _setPage(pageId, val) {
    this._getState()['page_' + pageId] = val;
    AT_EDITOR.markDirty();
  },

  apply() {
    const state  = this._getState();
    const layout = this.LAYOUTS.find(l => l.id === state.global);
    this.closePicker();
    AT_UTIL.toast('Layout: ' + (layout?.name || state.global) + ' diterapkan');
    AT_EDITOR.markDirty();
    AT_SPLITVIEW.refresh?.();
  },

  getForPage(pageId) {
    const state = this._getState();
    if (!state.usePerPage) return state.global;
    return state['page_' + pageId] || state.global;
  },

  getCSS(layoutId) {
    const base = `/* AT Layout: ${layoutId} */\n`;
    const map = {
      'classic': base + `/* Klasik — default */`,
      'fullwidth': base + `.card { max-width: 100% !important; border-radius: 12px !important; } .screen > div { padding: 12px 16px !important; } nav.nav { border-radius: 0 !important; }`,
      'card-grid': base + `#smat .card, #smods .card { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; } #smat .card > *, #smods .card > * { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; padding: 10px; }`,
      'magazine': base + `#sc { background: linear-gradient(160deg, #0a1628 0%, #0e2040 40%, #071420 100%) !important; } #sc > div { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 20px !important; align-items: center !important; text-align: left !important; padding: 24px !important; } #sc > div > :last-child { display: none; } .card { border-left: 3px solid var(--y) !important; border-radius: 0 12px 12px 0 !important; }`,
      'minimal': base + `body { background: #f7f8fc !important; color: #1a2332 !important; } .screen { background: #f7f8fc !important; } nav.nav { background: #fff !important; border-bottom: 1px solid #e5e7eb !important; box-shadow: 0 1px 4px rgba(0,0,0,.06) !important; } nav.nav .nav-logo, nav.nav span { color: #1a2332 !important; } nav.nav .nav-bar { background: #e5e7eb !important; } .card { background: #fff !important; color: #1a2332 !important; border: 1px solid #e5e7eb !important; box-shadow: 0 2px 8px rgba(0,0,0,.06) !important; border-radius: 14px !important; } .h2 { color: #1a2332 !important; } .sub, p { color: #64748b !important; } :root { --muted: #94a3b8; --bg: #f7f8fc; --bg2: #eef0f5; --card: #fff; --border: #e5e7eb; }`,
      'dark-hero': base + `#sc { background: linear-gradient(135deg, #06091a 0%, #0d1535 50%, #040810 100%) !important; } #sc > div > div:first-child { font-size: 4.5rem !important; filter: drop-shadow(0 0 20px rgba(245,200,66,.4)); } #sc .btn-y { box-shadow: 0 0 20px rgba(245,200,66,.3), 0 0 40px rgba(245,200,66,.15) !important; } nav.nav { background: rgba(6,9,26,.98) !important; border-bottom: 1px solid rgba(245,200,66,.15) !important; } .card { border: 1px solid rgba(245,200,66,.08) !important; background: rgba(13,21,53,.8) !important; } .h2 .hl { text-shadow: 0 0 20px currentColor; } :root { --y: #ffd700; }`
    };
    return map[layoutId] || map['classic'];
  }
};

/* ══════════════════════════════════════════════════════════════
   Patch buildStudentHTML — inject layout CSS
   ══════════════════════════════════════════════════════════════ */
(function() {
  function doPatch() {
    const _prev = AT_PREVIEW.buildStudentHTML.bind(AT_PREVIEW);
    AT_PREVIEW.buildStudentHTML = function(S) {
      let html = _prev(S);
      try {
        const layoutId = AT_LAYOUT._getState().global;
        if (layoutId && layoutId !== 'classic') {
          const css = AT_LAYOUT.getCSS(layoutId);
          if (html.includes('</head>')) {
            html = html.replace('</head>', `<style id="at-layout-css">${css}</style></head>`);
          }
        }
      } catch(e) { /* silent */ }
      return html;
    };
  }
  if (window.AT_PREVIEW) {
    doPatch();
  } else {
    document.addEventListener('DOMContentLoaded', doPatch);
  }
})();

/* ══════════════════════════════════════════════════════════════
   INIT — Hanya layout, tidak ada sync/polling
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Init layout state dari saved data
  AT_LAYOUT._getState();

  // Auto-open split view pada first load
  if (!sessionStorage.getItem('splitViewOpened')) {
    setTimeout(() => {
      if (!AT_SPLITVIEW.active) {
        AT_SPLITVIEW.toggle();
      }
      sessionStorage.setItem('splitViewOpened', '1');
    }, 600);
  }

  console.log('liveview_enhancements.js v5.0 — lean mode, layout-only');
});
