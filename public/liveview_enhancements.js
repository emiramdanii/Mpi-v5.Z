// ═══════════════════════════════════════════════════════════════
// LIVEVIEW_ENHANCEMENTS.JS v6.0 — Smart Auto-Sync + UX
// ═══════════════════════════════════════════════════════════════
// Berisi:
//   AT_PAGE_SYNC  — deteksi halaman pintar: editor panel → preview page
//   AT_LAYOUT     — layout picker dengan injeksi CSS ke student HTML
//
// v6.0 Fitur Baru:
//   - AT_PAGE_SYNC: auto-navigasi preview saat ganti panel/tab editor
//   - Auto-open split view pada layar lebar (>900px)
//   - Dashboard tooltip tentang Split View
//
// Arsitektur sinkronisasi:
//   Form change → markDirty() → scheduleRefresh() → refresh() [200ms]
//   Panel switch → AT_PAGE_SYNC.sync() → goPage() → refresh()
// ═══════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════════
   AT_PAGE_SYNC — Smart Auto-Sync: Editor ↔ Preview
   Setiap kali user berganti panel/tab di editor,
   halaman preview otomatis ikut berpindah.
   ══════════════════════════════════════════════════════════════ */
window.AT_PAGE_SYNC = {
  _userManualOverride: false,  // true jika user manual ganti page select
  _lastSyncedPanel: null,

  // Mapping: editor panel/konten-tab → preview page ID
  _MAP: {
    'dashboard':  'sc',       // Cover
    'dokumen':    'scp',      // Dokumen
    'konten':     'smat',     // Konten (default → sub-tab Materi, auto-detected below)
    'autogen':    'scp',      // Dokumen (auto-generate isi dokumen)
    'import':     'sc',       // Cover (import tidak punya halaman spesifik)
    'versions':   'sc',       // Cover
    'projects':   'sc',       // Cover
    // Konten sub-tabs:
    'konten-tab-materi':  'smat',   // Materi
    'konten-tab-modules': 'smods',  // Modul & Game
    'konten-tab-kuis':    'skuis',  // Evaluasi/Kuis
  },

  // Reverse map: pageId → editor tab/panel (untuk highlight indicator)
  _REVERSE_MAP: {
    'sc':    'dashboard',
    'scp':   'dokumen',
    'smat':  'konten-tab-materi',
    'smods': 'konten-tab-modules',
    'skuis': 'konten-tab-kuis',
    'shas':  'konten-tab-kuis',
    'ssk':   'konten-tab-materi',
    'sgame_0': 'konten-tab-modules',
  },

  // Dipanggil saat panel navigasi berubah
  syncFromPanel(panelId) {
    if (this._userManualOverride) {
      // Reset setelah 1 sync — biarkan manual override hanya 1x
      this._userManualOverride = false;
      return;
    }
    let pageId = this._MAP[panelId];

    // Smart detection: if panel is 'konten', find the currently active sub-tab
    if (panelId === 'konten') {
      const activeTab = document.querySelector('.konten-tab-panel.active');
      if (activeTab) {
        pageId = this._MAP[activeTab.id] || pageId;
      }
    }

    if (!pageId) return;
    this._lastSyncedPanel = panelId;
    AT_SPLITVIEW?.goPage(pageId);
  },

  // Dipanggil saat konten tab berubah (Materi / Modul / Kuis)
  syncFromTab(tabId) {
    if (this._userManualOverride) {
      this._userManualOverride = false;
      return;
    }
    const pageId = this._MAP[tabId];
    if (!pageId) return;
    this._lastSyncedPanel = tabId;
    AT_SPLITVIEW?.goPage(pageId);
  },

  // Dipanggil saat user manual ganti page select dropdown
  markManualOverride() {
    this._userManualOverride = true;
  },

  // Update visual sync indicator di split header
  updateSyncIndicator(pageId) {
    const label = document.getElementById('syncLabel');
    const dot = document.getElementById('syncDot');
    if (!label || !dot) return;

    const source = this._REVERSE_MAP[pageId];
    const sourceNames = {
      'dashboard': 'Dashboard',
      'dokumen': 'Dokumen',
      'konten-tab-materi': 'Materi',
      'konten-tab-modules': 'Modul & Game',
      'konten-tab-kuis': 'Evaluasi',
    };

    if (source && sourceNames[source]) {
      label.textContent = 'Auto: ' + sourceNames[source];
      label.style.color = 'var(--y)';
      dot.style.background = 'var(--y)';
      dot.style.transform = 'scale(1.3)';

      clearTimeout(this._indicatorTimer);
      this._indicatorTimer = setTimeout(() => {
        label.textContent = 'Tersinkron';
        label.style.color = 'var(--muted)';
        dot.style.background = 'var(--g)';
        dot.style.transform = 'scale(1)';
      }, 2000);
    }
  }
};

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
   DASHBOARD TIP — Injeksi tip Split View ke dashboard
   ══════════════════════════════════════════════════════════════ */
function _injectSplitViewTip() {
  const dashStats = document.getElementById('dashStats');
  if (!dashStats || document.getElementById('splitViewTip')) return;

  const tip = document.createElement('div');
  tip.id = 'splitViewTip';
  tip.style.cssText = 'grid-column:1/-1;background:linear-gradient(135deg,rgba(245,200,66,.06),rgba(56,217,217,.06));border:1px solid rgba(245,200,66,.15);border-radius:12px;padding:12px 16px;display:flex;align-items:center;gap:12px;font-size:.78rem;color:var(--muted2);line-height:1.6';
  tip.innerHTML = `
    <div style="flex-shrink:0;width:36px;height:36px;border-radius:10px;background:rgba(245,200,66,.12);display:flex;align-items:center;justify-content:center;font-size:1.1rem">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--y)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    </div>
    <div style="flex:1">
      <div style="font-weight:700;color:var(--text);margin-bottom:2px">Split View — Live Preview Real-Time</div>
      <div>Panel editor dan preview berdampingan. Preview otomatis berpindah mengikuti tab yang sedang Anda edit. Gunakan <kbd style="padding:1px 5px;border-radius:4px;background:rgba(255,255,255,.08);border:1px solid var(--border);font-size:.7rem;font-weight:700">Ctrl+Shift+L</kbd> untuk membuka/menutup.</div>
    </div>
  `;
  dashStats.parentNode.insertBefore(tip, dashStats.nextSibling);
}

/* ══════════════════════════════════════════════════════════════
   INIT — Single source of truth for:
     - Auto-open split view on wide screens
     - AT_NAV.go patch (close split for non-content, scheduleRefresh, sync)
     - switchKontenTab patch (recalc accordion, sync preview page)
     - Page select manual override
     - goPage sync indicator
     - Dashboard tip

   NOTE: All nav/tab patches consolidated HERE to prevent double-patching.
   liveview.js handles: markDirty hook, undo, MutationObserver, shortcuts.
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Init layout state dari saved data
  AT_LAYOUT._getState();

  // ── Auto-open split view pada layar lebar (>900px) ──
  // Single deduplicated auto-open: use a flag to prevent double-toggle
  let _autoOpenDone = false;
  function _autoOpenSplit() {
    if (_autoOpenDone || AT_SPLITVIEW.active) return;
    _autoOpenDone = true;
    // Check if there's enough content to preview
    const hasStateContent = AT_SPLITVIEW._hasEnoughContent();
    const hasSavedContent = !!(AT_STORAGE && AT_STORAGE.load());
    if (hasStateContent || hasSavedContent) {
      AT_SPLITVIEW.toggle();
    }
  }
  if (window.innerWidth > 900) {
    setTimeout(_autoOpenSplit, 800);
  }

  // ── Patch AT_NAV.go — SINGLE SOURCE ──
  // Handles: close split for non-content panels, scheduleRefresh, auto-sync
  const _origNavGo = AT_NAV.go.bind(AT_NAV);
  AT_NAV.go = function(id) {
    _origNavGo(id);
    // Close split view for non-content panels
    const closePanels = ['projects', 'import', 'versions'];
    if (closePanels.includes(id) && AT_SPLITVIEW.active) {
      AT_SPLITVIEW.toggle();
      return;
    }
    // Auto-open split view if not yet active and switching to content panel
    if (!AT_SPLITVIEW.active && !AT_SPLITVIEW._autoOpened) {
      if (AT_SPLITVIEW._hasEnoughContent() && window.innerWidth > 900) {
        AT_SPLITVIEW._autoOpened = true;
        AT_SPLITVIEW.toggle();
      }
    }
    // Schedule refresh for content panels
    if (AT_SPLITVIEW.active) {
      AT_SPLITVIEW.scheduleRefresh();
      // Auto-sync preview page ke editor panel
      setTimeout(() => AT_PAGE_SYNC.syncFromPanel(id), 150);
    }
  };

  // ── Patch switchKontenTab — SINGLE SOURCE ──
  // Handles: recalc accordion, auto-sync preview page
  const _origSwitchTab = window.switchKontenTab;
  window.switchKontenTab = function(tabId, btnEl) {
    _origSwitchTab(tabId, btnEl);
    _recalcAfterRender();
    // Auto-open split if not yet active
    if (!AT_SPLITVIEW.active && !AT_SPLITVIEW._autoOpened) {
      if (AT_SPLITVIEW._hasEnoughContent() && window.innerWidth > 900) {
        AT_SPLITVIEW._autoOpened = true;
        AT_SPLITVIEW.toggle();
      }
    }
    // Auto-sync preview page ke konten tab
    if (AT_SPLITVIEW.active) {
      setTimeout(() => AT_PAGE_SYNC.syncFromTab(tabId), 150);
    }
  };

  // ── Page select manual override detection ──
  const pageSelect = document.getElementById('splitPageSelect');
  if (pageSelect) {
    pageSelect.addEventListener('change', () => {
      AT_PAGE_SYNC.markManualOverride();
    });
  }

  // ── Patch goPage untuk update sync indicator ──
  const _origGoPage = AT_SPLITVIEW.goPage.bind(AT_SPLITVIEW);
  AT_SPLITVIEW.goPage = function(pageId) {
    _origGoPage(pageId);
    AT_PAGE_SYNC.updateSyncIndicator(pageId);
  };

  // ── Inject Split View tip di Dashboard ──
  _injectSplitViewTip();

  console.log('liveview_enhancements.js v6.1 — consolidated nav/tab patches, smart auto-sync, no double-patching');
});
