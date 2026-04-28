// ═══════════════════════════════════════════════════════════════
// LIVEVIEW.JS — Split-View Live Preview v4.1 (Robust Rewrite)
// Berisi:
//   AT_SPLITVIEW  — live preview berdampingan dengan editor
//   Preview patch, init code, MutationObserver, keyboard shortcuts
//
// Editor modules (AT_UNDO, AT_SK_EDITOR, AT_FUNGSI_EDITOR,
// AT_JSON_IO, accordion helpers) are in liveview-editors.js
//
// v4.0 Improvements:
//   - FORCE refresh on every scheduleRefresh (no hash skip)
//   - Faster initial render (60ms), then 200ms debounce
//   - MutationObserver fallback: catches form changes not via markDirty
//   - Accordion max-height auto-recalculation after render
//   - Better error recovery with visible error state
//   - Sync indicator always visible with status
//   - Auto-open split view on first meaningful edit
//   - Smart loading state management
//   - Character counter in header
// ═══════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════════
   AT_SPLITVIEW — Live preview di sebelah editor  v4.0
   Single entry point: scheduleRefresh() → debounced refresh()
   ══════════════════════════════════════════════════════════════ */
window.AT_SPLITVIEW = {
  active: false,
  _device: "mobile",
  _debounceTimer: null,
  _lastHTML: "",
  _hasContent: false,
  _splitWidth: 440,
  _minWidth: 280,
  _maxWidth: 800,
  _isResizing: false,
  _resizeStartX: 0,
  _resizeStartWidth: 0,
  _refreshCount: 0,
  _autoOpened: false,
  _syncTimer: null,
  _buildCount: 0,
  _errorRetries: 0,
  _savedPreviewState: null,

  /* ── Toggle split view ─────────────────────────────────── */
  toggle() {
    this.active = !this.active;
    const app  = document.getElementById("app");
    const btn  = document.getElementById("btnSplitToggle");
    const pane = document.getElementById("split-pane");
    if (!app) return;

    if (this.active) {
      app.classList.add("split-active");
      app.style.setProperty('--split-width', this._splitWidth + 'px');
      if (pane) pane.style.display = "flex";
      if (btn)  btn.classList.add("active");
      this._initResizeHandle();
      this.refresh();
    } else {
      app.classList.remove("split-active", "resizing");
      if (pane) pane.style.display = "none";
      if (btn)  btn.classList.remove("active");
      const loading = document.getElementById("splitLoading");
      if (loading) loading.style.display = "none";
      // Reset auto-open flag so split can re-open when returning to content panels
      this._autoOpened = false;
    }
  },

  setDevice(d) {
    this._device = d;
    document.querySelectorAll(".split-device-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.device === d);
    });
    this.refresh();
  },

  /* ── Single entry point: dipanggil dari unified markDirty ── */
  scheduleRefresh() {
    if (!this.active) {
      // Auto-open on first meaningful edit (screen > 900px)
      // NOTE: Also handled in liveview_enhancements.js AT_NAV.go patch
      if (!this._autoOpened && this._hasEnoughContent() && window.innerWidth > 900) {
        this._autoOpened = true;
        this.toggle();
      }
      return;
    }
    clearTimeout(this._debounceTimer);
    // First render fast (120ms), then steady debounce (350ms) — reduced flicker
    const delay = this._buildCount < 2 ? 120 : 350;
    this._debounceTimer = setTimeout(() => this.refresh(), delay);
  },

  /* ── Force refresh — always rebuild, used for manual refresh ── */
  forceRefresh() {
    this._lastHTML = "";
    this.refresh();
  },

  _hasEnoughContent() {
    const S = AT_STATE;
    return !!(S.meta.judulPertemuan || S.cp.capaianFase || S.tp.length || S.kuis.length || (S.modules||[]).length || (S.skenario||[]).length);
  },

  /* ── Build & render preview ke iframe ───────────────────── */
  refresh() {
    if (!this.active) return;

    const frame = document.getElementById("split-frame");
    const loading = document.getElementById("splitLoading");
    const emptyState = document.getElementById("splitEmptyState");
    if (!frame) return;

    this._showSyncPulse();

    try {
      if (!window.AT_PREVIEW || !window.AT_PREVIEW.buildStudentHTML) {
        console.warn("AT_PREVIEW not ready, retrying in 500ms...");
        this._hideSyncPulse();
        setTimeout(() => this.refresh(), 500);
        return;
      }

      const html = AT_PREVIEW.buildStudentHTML(AT_STATE);
      this._buildCount++;
      this._hasContent = true;
      this._errorRetries = 0;
      this._updateCharCount(html);

      // ── ANTI-FLICKER: skip refresh if HTML hasn't changed ──
      if (html === this._lastHTML) {
        // Content unchanged — just navigate if needed, don't rewrite srcdoc
        this._hideSyncPulse();
        return;
      }

      this._lastHTML = html;
      if (loading) loading.style.display = "flex";

      // ── Hide iframe during srcdoc write to prevent white flash ──
      frame.style.visibility = 'hidden';

      // ── Aggressive anti-flicker: kill ALL animations + transitions ──
      const antiFlicker = `<style>
*{animation:none!important;transition:none!important;}
.screen,.mat-page,.kp,.card,.btn-y,.h2{opacity:1!important;}
@keyframes fi{from{opacity:1;transform:none}to{opacity:1;transform:none}}
</style>`;
      const navScript = `<script>(function(){
  window.addEventListener('message',function(e){
    if(e.data&&e.data.goPage){var fn=window.go;if(fn)fn(e.data.goPage);}
    if(e.data&&e.data.restoreState){
      var rs=e.data.restoreState;
      setTimeout(function(){
        if(rs.matPage!=null&&typeof window.goMatP==='function')goMatP(rs.matPage);
        if(rs.modPage!=null&&typeof window.goModP==='function')goModP(rs.modPage);
        if(rs.ftTab!=null&&typeof window.swFt==='function')swFt(rs.ftTab);
        if(rs.scrollTop>0)window.scrollTo(0,rs.scrollTop);
      },150);
    }
  });
  var _og=window.go;
  window.go=function(id){if(_og)_og(id);_rs();};
  var _gm=window.goMatP;if(_gm){window.goMatP=function(i){_gm(i);setTimeout(_rs,80);};}
  var _mn=window.matNav;if(_mn){window.matNav=function(d){_mn(d);setTimeout(_rs,80);};}
  var _gmp=window.goModP;if(_gmp){window.goModP=function(i){_gmp(i);setTimeout(_rs,80);};}
  var _mdn=window.modNav;if(_mdn){window.modNav=function(d){_mdn(d);setTimeout(_rs,80);};}
  var _sf=window.swFt;if(_sf){window.swFt=function(i){_sf(i);setTimeout(_rs,80);};}
  function _rs(){
    var s={};
    var as=document.querySelector('.screen.active');
    if(as)s.page=as.id;
    if(typeof _matP!=='undefined')s.matPage=_matP;
    if(typeof _modP!=='undefined')s.modPage=_modP;
    if(typeof curFt!=='undefined')s.ftTab=curFt;
    s.scrollTop=window.scrollY||document.documentElement.scrollTop;
    try{window.parent.postMessage({previewState:s},'*');}catch(e){}
  }
  window.addEventListener('scroll',function(){
    try{var st=window.scrollY||document.documentElement.scrollTop;
    if(st>5)window.parent.postMessage({previewScroll:st},'*');
    }catch(e){}
  });
  setTimeout(_rs,400);
})();<\/script>`;
      frame.srcdoc = html.replace("</body>", antiFlicker + navScript + "</body>");
      frame.style.display = "block";
      if (emptyState) emptyState.style.display = "none";

      // Remove old listeners to prevent stacking
      frame.onload = null;
      frame.addEventListener("load", () => {
        // Make iframe visible again after content loads
        frame.style.visibility = 'visible';
        setTimeout(() => {
          this._navigateFrame();
          // Restore preview state (materi page, module page, fungsi tab, scroll)
          if (this._savedPreviewState) {
            try {
              frame.contentWindow.postMessage({ restoreState: this._savedPreviewState }, "*");
            } catch(e) {}
          }
          this._hideSyncPulse();
          if (loading) loading.style.display = "none";
        }, 80);
      }, { once: true });

      // Safety timeout — make visible after 4s max even if load event missed
      setTimeout(() => {
        frame.style.visibility = 'visible';
        if (loading) loading.style.display = "none";
      }, 4000);

    } catch(e) {
      this._errorRetries++;
      this._hideSyncPulse();
      console.error("Live preview error:", e);

      // Show error in iframe
      frame.srcdoc = `<body style="padding:24px;color:#f87171;font-family:'Plus Jakarta Sans',sans-serif;background:#0e1c2f;margin:0"><div style="max-width:300px"><div style="font-size:1.4rem;margin-bottom:8px">&#9888;&#65039;</div><div style="font-size:.85rem;font-weight:700;margin-bottom:6px">Preview Error</div><pre style="font-size:.72rem;white-space:pre-wrap;color:rgba(248,113,113,.7);line-height:1.5;margin:0">${e.message}</pre><button onclick="window.parent.postMessage({action:'retry'},'*')" style="margin-top:12px;padding:6px 14px;border-radius:6px;border:1px solid rgba(248,113,113,.3);background:rgba(248,113,113,.1);color:#f87171;font-size:.72rem;font-weight:700;cursor:pointer">Coba Lagi</button></div></body>`;
      if (loading) loading.style.display = "none";
      frame.style.display = "block";
      if (emptyState) emptyState.style.display = "none";
    }
  },

  /* ── Character count display ─────────────────────────────── */
  _updateCharCount(html) {
    const el = document.getElementById("splitCharCount");
    if (el) {
      const chars = html.length;
      el.textContent = chars > 1000 ? (chars / 1000).toFixed(1) + 'k' : chars;
    }
  },

  /* ── Sync pulse indicator ─────────────────────────────── */
  _showSyncPulse() {
    const dot = document.getElementById("syncDot");
    const label = document.getElementById("syncLabel");
    if (!dot) return;
    clearTimeout(this._syncTimer);
    dot.style.background = 'var(--y)';
    dot.style.transform = 'scale(1.3)';
    if (label) { label.textContent = 'Sinkron...'; label.style.color = 'var(--y)'; }
    this._syncTimer = setTimeout(() => this._hideSyncPulse(), 1500);
  },

  _hideSyncPulse() {
    const dot = document.getElementById("syncDot");
    const label = document.getElementById("syncLabel");
    if (!dot) return;
    dot.style.background = 'var(--g)';
    dot.style.transform = 'scale(1)';
    if (label) { label.textContent = 'Tersinkron'; label.style.color = 'var(--muted)'; }
  },

  _navigateFrame() {
    const frame = document.getElementById("split-frame");
    const pageId = document.getElementById("splitPageSelect")?.value || "sc";
    try {
      frame?.contentWindow?.postMessage({ goPage: pageId }, "*");
    } catch(e) {}
  },

  goPage(pageId) {
    const sel = document.getElementById("splitPageSelect");
    if (sel && pageId) sel.value = pageId;
    this._navigateFrame();
    // Also directly postMessage with the explicit pageId (not from dropdown)
    // This ensures navigation works even if dropdown doesn't have the option
    const frame = document.getElementById("split-frame");
    try {
      if (frame && frame.contentWindow && pageId) {
        frame.contentWindow.postMessage({ goPage: pageId }, "*");
      }
    } catch(e) {}
  },

  /* ── Resizable Split Pane ─────────────────────────────────── */
  _initResizeHandle() {
    const handle = document.getElementById("split-resize-handle");
    if (!handle || handle._bound) return;
    handle._bound = true;
    handle.addEventListener("mousedown", (e) => this._startResize(e));
    handle.addEventListener("touchstart", (e) => this._startResize(e), { passive: false });
  },

  _startResize(e) {
    e.preventDefault();
    this._isResizing = true;
    this._resizeStartX = e.touches ? e.touches[0].clientX : e.clientX;
    this._resizeStartWidth = this._splitWidth;
    const app = document.getElementById("app");
    const handle = document.getElementById("split-resize-handle");
    if (app) app.classList.add("resizing");
    if (handle) handle.classList.add("active");
    document.addEventListener("mousemove", this._onResizeMove);
    document.addEventListener("touchmove", this._onResizeMove, { passive: false });
    document.addEventListener("mouseup", this._onResizeEnd);
    document.addEventListener("touchend", this._onResizeEnd);
  },

  _onResizeMove: (e) => {
    const sv = window.AT_SPLITVIEW;
    if (!sv._isResizing) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = sv._resizeStartX - clientX;
    const newWidth = Math.min(sv._maxWidth, Math.max(sv._minWidth, sv._resizeStartWidth + diff));
    sv._splitWidth = Math.round(newWidth);
    const app = document.getElementById("app");
    if (app) app.style.setProperty('--split-width', sv._splitWidth + 'px');
  },

  _onResizeEnd: () => {
    const sv = window.AT_SPLITVIEW;
    if (!sv._isResizing) return;
    sv._isResizing = false;
    const app = document.getElementById("app");
    const handle = document.getElementById("split-resize-handle");
    if (app) app.classList.remove("resizing");
    if (handle) handle.classList.remove("active");
    document.removeEventListener("mousemove", sv._onResizeMove);
    document.removeEventListener("touchmove", sv._onResizeMove);
    document.removeEventListener("mouseup", sv._onResizeEnd);
    document.removeEventListener("touchend", sv._onResizeEnd);
  }
};

/* ══════════════════════════════════════════════════════════════
   PREVIEW PATCH — pakai AT_STATE.fungsi jika ada override
   ══════════════════════════════════════════════════════════════ */
const _origBuild = AT_PREVIEW.buildStudentHTML.bind(AT_PREVIEW);
AT_PREVIEW.buildStudentHTML = function(S) {
  const patchedS = Object.assign({}, S);
  if (S.fungsi && S.fungsi.length) {
    const origFungsi = PRESETS.fungsi;
    PRESETS.fungsi = S.fungsi;
    const html = _origBuild(patchedS);
    PRESETS.fungsi = origFungsi;
    return html;
  }
  return _origBuild(patchedS);
};

/* ══════════════════════════════════════════════════════════════
   HELPER: Undo/Redo buttons di sidebar
   ══════════════════════════════════════════════════════════════ */
function _injectUndoButtons() {
  const sb = document.querySelector(".sidebar-bottom");
  if (!sb || document.getElementById("undoBtn")) return;
  const row = document.createElement("div");
  row.style.cssText = "display:flex;gap:6px;margin-bottom:6px";
  row.innerHTML = [
    `<button id="undoBtn" class="sidebar-bottom-btn" style="flex:1;opacity:.5" disabled onclick="AT_UNDO.undo()" title="Ctrl+Z">Undo</button>`,
    `<button id="redoBtn" class="sidebar-bottom-btn" style="flex:1;opacity:.5" disabled onclick="AT_UNDO.redo()" title="Ctrl+Y">Redo</button>`
  ].join("");
  sb.insertBefore(row, sb.firstChild);
}

/* ══════════════════════════════════════════════════════════════
   HELPER: Close modals on overlay click
   ══════════════════════════════════════════════════════════════ */
function _initModalClose() {
  ["skDetailModal","fungsiModal"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", e => {
      if (e.target === el) {
        el.classList.remove("show");
        if (id === "skDetailModal") AT_SK_EDITOR.close();
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   HELPER: MutationObserver fallback for form changes
   Catches any form input/change not covered by markDirty
   ══════════════════════════════════════════════════════════════ */
let _mutationObserver = null;
function _initMutationObserver() {
  if (_mutationObserver) return;

  const contentEl = document.getElementById("content");
  if (!contentEl) return;

  // Lightweight fallback: only catches DOM mutations NOT triggered by markDirty.
  // This is a safety net for edge cases; markDirty → scheduleRefresh handles normal flow.
  let _lastMutCheck = 0;
  _mutationObserver = new MutationObserver((mutations) => {
    if (!AT_SPLITVIEW.active) return;
    // Throttle: max once per 500ms to avoid duplicate refreshes
    const now = Date.now();
    if (now - _lastMutCheck < 500) return;
    _lastMutCheck = now;
    // Only act if dirty but no pending debounce timer (means markDirty didn't fire)
    if (!AT_STATE.dirty) return;
    if (AT_SPLITVIEW._debounceTimer) return; // Already scheduled by markDirty
    // Fallback: schedule refresh for changes that bypass markDirty
    clearTimeout(AT_SPLITVIEW._debounceTimer);
    AT_SPLITVIEW._debounceTimer = setTimeout(() => AT_SPLITVIEW.refresh(), 500);
  });

  _mutationObserver.observe(contentEl, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['value', 'checked', 'selected']
  });
}

/* ══════════════════════════════════════════════════════════════
   HELPER: Recalc accordion when tab/panel changes
   NOTE: switchKontenTab patch moved to liveview_enhancements.js
   to prevent double-patching.
   ══════════════════════════════════════════════════════════════ */
function _patchAccordionToggle() {
  const origToggle = window.toggleAccordion;
  if (!origToggle) return;
  window.toggleAccordion = function(headerEl) {
    origToggle(headerEl);
    _recalcAfterRender();
  };
}

/* ══════════════════════════════════════════════════════════════
   INIT — Semua inisialisasi di satu tempat
   NOTE: AT_NAV.go, switchKontenTab, auto-open logic
   are ALL handled in liveview_enhancements.js to prevent double-patching.
   This file only handles: markDirty hook, undo, MutationObserver,
   keyboard shortcuts, and iframe message listener.
   ══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  _injectUndoButtons();
  _initModalClose();
  _patchAccordionToggle();
  // NOTE: _patchSwitchKontenTab() moved to liveview_enhancements.js
  AT_UNDO.init();
  _initMutationObserver();

  // Add fungsi to AT_STATE if missing
  if (!AT_STATE.fungsi) AT_STATE.fungsi = null;

  // ── UNIFIED markDirty hook ──────────────────────────────────
  // Satu patch saja: dirty state + undo + scheduleRefresh + recalc accordion
  const _baseMarkDirty = AT_EDITOR.markDirty.bind(AT_EDITOR);
  AT_EDITOR.markDirty = function() {
    _baseMarkDirty();            // Original: sets dirty + dirtyDot
    AT_UNDO.push();               // Undo snapshot
    AT_SPLITVIEW.scheduleRefresh(); // Preview refresh (debounced)
    _recalcAfterRender();          // Fix accordion heights
  };

  // Undo buttons hover effect
  document.querySelectorAll("#undoBtn,#redoBtn").forEach(b => {
    b.addEventListener("mouseenter", () => b.style.opacity = b.disabled ? ".5" : "1");
    b.addEventListener("mouseleave", () => b.style.opacity = b.disabled ? ".5" : "1");
  });

  // ── Keyboard Shortcuts ──
  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      AT_SPLITVIEW.toggle();
    }
    if (mod && e.shiftKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      if (AT_SPLITVIEW.active) {
        AT_SPLITVIEW.forceRefresh();
        AT_UTIL.toast("Preview di-refresh", "ok");
      }
    }
  });

  // Listen for retry messages & preview state from iframe
  window.addEventListener("message", (e) => {
    if (e.data && e.data.action === "retry") {
      AT_SPLITVIEW.forceRefresh();
    }
    // Track preview internal state (page, sub-page, scroll)
    if (e.data && e.data.previewState) {
      AT_SPLITVIEW._savedPreviewState = e.data.previewState;
    }
    if (e.data && e.data.previewScroll) {
      AT_SPLITVIEW._savedPreviewState = AT_SPLITVIEW._savedPreviewState || {};
      AT_SPLITVIEW._savedPreviewState.scrollTop = e.data.previewScroll;
    }
  });

  // NOTE: Auto-open, AT_NAV.go patch, switchKontenTab patch
  // ALL handled in liveview_enhancements.js (loaded after this file)

  console.log("liveview.js v4.2 loaded — markDirty hook, undo, MutationObserver, keyboard shortcuts");
});
