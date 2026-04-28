// ═══════════════════════════════════════════════════════════════
// LIVEVIEW.JS — Split-View Live Preview v4.5 (Typing Stability)
// Berisi:
//   AT_SPLITVIEW  — live preview berdampingan dengan editor
//   Preview patch, init code, MutationObserver, keyboard shortcuts
//   Accordion sync with message queue
//   _recalcAfterRender helpers
//
// Editor modules (AT_UNDO, AT_SK_EDITOR, AT_FUNGSI_EDITOR,
// AT_JSON_IO, accordion helpers) are in liveview-editors.js
//
// v4.5 Typing Stability:
//   - Typing-aware debounce: 800ms during typing, 300ms for clicks/navigation
//   - Skip loading overlay during typing (no visual flicker)
//   - Batch undo pushes during typing (avoid deep clone per keystroke)
//   - Fix MutationObserver fallback (clear _debounceTimer after fire)
//   - Move sync pulse after HTML comparison (reduce visual noise)
// ═══════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════════
   AT_SPLITVIEW — Live preview di sebelah editor  v4.5
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

  // ── Typing Detection: longer debounce during active typing ──
  _isTyping: false,
  _typingTimer: null,
  _typingDebounce: 800,
  _normalDebounce: 300,

  // ── Message Queue: prevents race condition with iframe rebuild ──
  _pendingMessages: [],    // queued messages to send after iframe loads
  _iframeReady: false,     // true after iframe.onload fires

  /* ── Queue a message to iframe (safe even during rebuild) ── */
  _queueMessage(msg) {
    if (this._iframeReady) {
      // Iframe already loaded, send immediately
      this._sendToFrame(msg);
    } else {
      // Queue for after next iframe load
      this._pendingMessages.push(msg);
    }
  },

  /* ── Send message directly to iframe ── */
  _sendToFrame(msg) {
    const frame = document.getElementById("split-frame");
    try {
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage(msg, "*");
      }
    } catch(e) {}
  },

  /* ── Flush all queued messages after iframe loads ── */
  _flushPendingMessages() {
    this._iframeReady = true;
    const msgs = this._pendingMessages.splice(0);
    msgs.forEach(msg => {
      setTimeout(() => this._sendToFrame(msg), 50);
    });
  },

  /* ── Reset queue when iframe starts rebuilding ── */
  _resetIframeState() {
    this._iframeReady = false;
    // Keep pending messages — they'll be flushed after new iframe loads
  },

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
      this._pendingMessages = [];
      this._iframeReady = false;
    }
  },

  setDevice(d) {
    this._device = d;
    document.querySelectorAll(".split-device-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.device === d);
    });
    this.refresh();
  },

  /* ── Detect active typing — use longer debounce ── */
  _startTyping() {
    this._isTyping = true;
    clearTimeout(this._typingTimer);
    this._typingTimer = setTimeout(() => {
      this._isTyping = false;
    }, 1500);
  },

  /* ── Single entry point: dipanggil dari unified markDirty ── */
  scheduleRefresh() {
    if (!this.active) {
      if (!this._autoOpened && this._hasEnoughContent() && window.innerWidth > 900) {
        this._autoOpened = true;
        this.toggle();
      }
      return;
    }
    clearTimeout(this._debounceTimer);
    // Typing mode = 800ms debounce, normal mode = 300ms
    const delay = this._buildCount < 2 ? 120 : (this._isTyping ? this._typingDebounce : this._normalDebounce);
    this._debounceTimer = setTimeout(() => this.refresh(), delay);
  },

  /* ── Force refresh — always rebuild ── */
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

    // Clear debounce flag — timer has fired, allow MutationObserver fallback
    this._debounceTimer = null;

    const frame = document.getElementById("split-frame");
    const loading = document.getElementById("splitLoading");
    const emptyState = document.getElementById("splitEmptyState");
    if (!frame) return;

    try {
      if (!window.AT_PREVIEW || !window.AT_PREVIEW.buildStudentHTML) {
        console.warn("AT_PREVIEW not ready, retrying in 500ms...");
        setTimeout(() => this.refresh(), 500);
        return;
      }

      const html = AT_PREVIEW.buildStudentHTML(AT_STATE);
      this._buildCount++;
      this._hasContent = true;
      this._errorRetries = 0;
      this._updateCharCount(html);
      this._updateDropdown();

      // ── ANTI-FLICKER: skip refresh if HTML hasn't changed ──
      if (html === this._lastHTML) {
        // Flush any pending messages even when HTML unchanged
        if (this._pendingMessages.length > 0) {
          this._flushPendingMessages();
        } else {
          this._navigateFrame();
        }
        return;
      }

      // HTML changed — show sync pulse ONLY now (not before comparison)
      this._showSyncPulse();

      this._lastHTML = html;

      // Skip loading overlay during typing to prevent visual flicker
      const isTypingRefresh = this._isTyping;
      if (!isTypingRefresh && loading) loading.style.display = "flex";
      this._resetIframeState();

      // Hide iframe during srcdoc write to prevent white flash
      // Skip during typing for smoother experience (anti-flicker CSS still applies)
      if (!isTypingRefresh) {
        frame.style.visibility = 'hidden';
      }

      // ── Aggressive anti-flicker: kill ALL animations + transitions ──
      const antiFlicker = `<style>
*{animation:none!important;transition:none!important;}
.screen,.mat-page,.kp,.card,.btn-y,.h2{opacity:1!important;}
@keyframes fi{from{opacity:1;transform:none}to{opacity:1;transform:none}}
</style>`;

      // ── Navigation script injected into student HTML ──
      // Handles: goPage, restoreState, switchDocTab, scrollToEnd, scroll tracking
      const navScript = `<script>(function(){
  window.addEventListener('message',function(e){
    if(e.data&&e.data.goPage){var fn=window.go;if(fn)fn(e.data.goPage);}
    if(e.data&&e.data.goModP!==undefined){var fn=window.goModP;if(fn)fn(e.data.goModP);}
    if(e.data&&e.data.goMatP!==undefined){var fn=window.goMatP;if(fn)fn(e.data.goMatP);}
    if(e.data&&e.data.restoreState){
      var rs=e.data.restoreState;
      setTimeout(function(){
        if(rs.matPage!=null&&typeof window.goMatP==='function')goMatP(rs.matPage);
        if(rs.modPage!=null&&typeof window.goModP==='function')goModP(rs.modPage);
        if(rs.ftTab!=null&&typeof window.swFt==='function')swFt(rs.ftTab);
        if(rs.scrollTop>0)window.scrollTo(0,rs.scrollTop);
      },150);
    }
    if(e.data&&e.data.switchDocTab){
      var tabId=e.data.switchDocTab;
      // Robust: try multiple methods to find and click the right tab
      setTimeout(function(){
        // Method 1: find .ktab with onclick containing the tabId
        var tabEl=null;
        document.querySelectorAll('.ktab').forEach(function(t){
          var oc=t.getAttribute('onclick')||'';
          if(oc.indexOf('"'+tabId+'"')>=0||oc.indexOf("'"+tabId+"'")>=0){tabEl=t;}
        });
        // Method 2: if not found, try calling kT directly
        if(tabEl&&typeof kT==='function'){kT(tabId,tabEl);}
        else if(typeof kT==='function'){
          // Fallback: kT function might work with just tabId
          var fakeEl={classList:{add:function(){},remove:function(){}}};
          try{kT(tabId,fakeEl);}catch(ex){}
        }
        // Acknowledge back to parent
        try{window.parent.postMessage({docTabSwitched:tabId},'*');}catch(ex){}
      },80);
    }
    if(e.data&&e.data.scrollToEnd){
      setTimeout(function(){window.scrollTo(0,document.body.scrollHeight);},100);
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
        if (!isTypingRefresh) frame.style.visibility = 'visible';
        setTimeout(() => {
          // 1. Navigate to correct page
          this._navigateFrame();
          // 2. Restore saved state
          if (this._savedPreviewState) {
            try {
              frame.contentWindow.postMessage({ restoreState: this._savedPreviewState }, "*");
            } catch(e) {}
          }
          // 3. Flush ALL queued messages (switchDocTab, scrollToEnd, etc.)
          this._flushPendingMessages();
          this._hideSyncPulse();
          if (loading) loading.style.display = "none";
        }, 80);
      }, { once: true });

      // Safety timeout
      setTimeout(() => {
        if (!isTypingRefresh) frame.style.visibility = 'visible';
        if (loading) loading.style.display = "none";
        // Force flush if onload was missed
        if (!this._iframeReady) this._flushPendingMessages();
      }, 4000);

    } catch(e) {
      this._errorRetries++;
      this._hideSyncPulse();
      console.error("Live preview error:", e);

      frame.srcdoc = `<body style="padding:24px;color:#f87171;font-family:'Plus Jakarta Sans',sans-serif;background:#0e1c2f;margin:0"><div style="max-width:300px"><div style="font-size:1.4rem;margin-bottom:8px">&#9888;&#65039;</div><div style="font-size:.85rem;font-weight:700;margin-bottom:6px">Preview Error</div><pre style="font-size:.72rem;white-space:pre-wrap;color:rgba(248,113,113,.7);line-height:1.5;margin:0">${e.message}</pre><button onclick="window.parent.postMessage({action:'retry'},'*')" style="margin-top:12px;padding:6px 14px;border-radius:6px;border:1px solid rgba(248,113,113,.3);background:rgba(248,113,113,.1);color:#f87171;font-size:.72rem;font-weight:700;cursor:pointer">Coba Lagi</button></div></body>`;
      if (loading) loading.style.display = "none";
      frame.style.display = "block";
      if (emptyState) emptyState.style.display = "none";
      this._iframeReady = false;
    }
  },

  /* ── Update page dropdown dynamically ───────────────────── */
  _updateDropdown() {
    const sel = document.getElementById('splitPageSelect');
    if (!sel) return;
    const curVal = sel.value;
    const gameCount = (AT_STATE.games || []).length;

    // Base pages (selalu ada)
    const pages = [
      { id: 'sc',   label: '🏠 Cover' },
      { id: 'scp',  label: '📋 Dokumen' },
      { id: 'ssk',  label: '🎭 Skenario' },
      { id: 'smat', label: '📝 Materi' },
      { id: 'smods',label: '🧩 Modul' },
    ];
    // Game pages (dinamis)
    for (let g = 0; g < gameCount; g++) {
      const gTitle = AT_STATE.games[g]?.title || '';
      pages.push({ id: 'sgame_' + g, label: '🎮 ' + (gTitle ? gTitle : 'Game ' + (g+1)) });
    }
    pages.push(
      { id: 'skuis', label: '❓ Kuis' },
      { id: 'shas',  label: '📊 Hasil' }
    );

    sel.innerHTML = pages.map(p =>
      `<option value="${p.id}">${p.label}</option>`
    ).join('');

    // Restore selected value jika masih valid
    const validIds = pages.map(p => p.id);
    if (validIds.includes(curVal)) {
      sel.value = curVal;
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
    this._sendToFrame({ goPage: pageId });
  },

  goPage(pageId) {
    const sel = document.getElementById("splitPageSelect");
    if (sel && pageId) sel.value = pageId;
    this._navigateFrame();
    // Also directly postMessage with explicit pageId
    this._sendToFrame({ goPage: pageId });
  },

  /* ── Navigate to specific page + optional sub-tab (queued) ── */
  navigateToPage(pageId, options) {
    // options: { tab: 'kcp', scrollEnd: true, scrollTop: 0 }
    options = options || {};
    const sel = document.getElementById("splitPageSelect");
    if (sel && pageId) sel.value = pageId;

    // Send goPage first
    this._queueMessage({ goPage: pageId });

    // Then queue sub-tab switch if specified
    if (options.tab) {
      this._queueMessage({ switchDocTab: options.tab });
    }
    if (options.scrollEnd) {
      this._queueMessage({ scrollToEnd: true });
    }
    if (options.scrollTop > 0) {
      this._queueMessage({ restoreState: { scrollTop: options.scrollTop } });
    }

    // If iframe is ready, also do immediate navigate for faster response
    if (this._iframeReady) {
      this._sendToFrame({ goPage: pageId });
    }
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
   Throttled 800ms, only acts if markDirty didn't fire
   ══════════════════════════════════════════════════════════════ */
let _mutationObserver = null;
function _initMutationObserver() {
  if (_mutationObserver) return;

  const contentEl = document.getElementById("content");
  if (!contentEl) return;

  let _lastMutCheck = 0;
  _mutationObserver = new MutationObserver((mutations) => {
    if (!AT_SPLITVIEW.active) return;
    const now = Date.now();
    if (now - _lastMutCheck < 800) return;
    _lastMutCheck = now;
    if (!AT_STATE.dirty) return;
    // Only act as fallback if no debounce is already scheduled
    if (AT_SPLITVIEW._debounceTimer) return;
    clearTimeout(AT_SPLITVIEW._debounceTimer);
    AT_SPLITVIEW._debounceTimer = setTimeout(() => AT_SPLITVIEW.refresh(), 800);
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
   ACCORDION → PREVIEW SYNC (with message queue)
   Maps accordion titles to preview pages and sub-tabs.
   Uses navigateToPage() which queues messages safely.
   ══════════════════════════════════════════════════════════════ */

const _ACCORDION_PREVIEW_MAP = {
  'Identitas Media':           { page: 'sc',   tab: null },
  'Capaian Pembelajaran':      { page: 'scp',  tab: 'kcp'  },
  'Tujuan Pembelajaran':       { page: 'scp',  tab: 'ktp'  },
  'Alur Tujuan Pembelajaran':  { page: 'scp',  tab: 'katp' },
  'Alur Kegiatan':             { page: 'scp',  tab: null,  scrollEnd: true },
};

function _patchAccordionToggle() {
  const origToggle = window.toggleAccordion;
  if (!origToggle) return;
  window.toggleAccordion = function(headerEl) {
    const wasOpen = headerEl.closest('.acc-section')?.classList.contains('open');
    origToggle(headerEl);
    _recalcAfterRender();

    // Auto-sync preview when accordion OPENS (not when closing)
    if (!wasOpen && AT_SPLITVIEW?.active) {
      const title = headerEl.querySelector('.acc-title')?.textContent?.trim();
      const mapping = title ? _ACCORDION_PREVIEW_MAP[title] : null;
      if (mapping) {
        // Use navigateToPage with message queue — safe during iframe rebuild
        AT_SPLITVIEW.navigateToPage(mapping.page, {
          tab: mapping.tab || null,
          scrollEnd: mapping.scrollEnd || false
        });
      }
    }
  };
}

/* ══════════════════════════════════════════════════════════════
   INIT — Single initialization point
   NOTE: AT_NAV.go, switchKontenTab, auto-open logic
   are ALL handled in liveview_enhancements.js to prevent double-patching.
   This file only handles: markDirty hook, undo, MutationObserver,
   keyboard shortcuts, accordion sync, iframe message listener.
   ══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  _injectUndoButtons();
  _initModalClose();
  _patchAccordionToggle();
  AT_UNDO.init();
  _initMutationObserver();

  // Add fungsi to AT_STATE if missing
  if (!AT_STATE.fungsi) AT_STATE.fungsi = null;

  // ── UNIFIED markDirty hook (with typing-optimized undo) ──────
  const _baseMarkDirty = AT_EDITOR.markDirty.bind(AT_EDITOR);
  let _undoBatchTimer = null;
  AT_EDITOR.markDirty = function() {
    _baseMarkDirty();
    // Batch undo pushes during typing to avoid expensive deep clone per keystroke
    if (AT_SPLITVIEW._isTyping) {
      clearTimeout(_undoBatchTimer);
      _undoBatchTimer = setTimeout(() => AT_UNDO.push(), 1500);
    } else {
      AT_UNDO.push();
    }
    AT_SPLITVIEW.scheduleRefresh();
    _recalcAfterRender();
  };

  // ── Typing Detection: listen for input events to activate longer debounce ──
  document.getElementById("content")?.addEventListener("input", () => {
    AT_SPLITVIEW._startTyping();
  }, { passive: true });

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

  // ── Listen for messages from iframe ──
  window.addEventListener("message", (e) => {
    // Retry button in error state
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
    // Doc tab switch acknowledgment (for debug)
    if (e.data && e.data.docTabSwitched) {
      // Successfully switched to sub-tab in iframe
    }
  });

  console.log("liveview.js v4.5 loaded — typing-aware debounce (800ms), batched undo, loading skip during typing, MutationObserver fix");
});
