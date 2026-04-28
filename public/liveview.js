// ═══════════════════════════════════════════════════════════════
// LIVEVIEW.JS — Split-View Live Preview v5.1 (Hard Block Typing)
// Berisi:
//   AT_SPLITVIEW  — live preview berdampingan dengan editor
//   Preview patch, init code, MutationObserver, keyboard shortcuts
//   Accordion sync with message queue
//   _recalcAfterRender helpers
//
// Editor modules (AT_UNDO, AT_SK_EDITOR, AT_FUNGSI_EDITOR,
// AT_JSON_IO, accordion helpers) are in liveview-editors.js
//
// v5.1 Hard Block Typing:
//   - CRITICAL FIX: refresh() has HARD BLOCK — rebuild impossible during typing
//   - No matter WHAT calls refresh(), it will NOT rebuild while _isTyping=true
//   - Typing detection moved to keydown CAPTURE phase (before any other handler)
//   - markDirty hook calls _startTyping() BEFORE scheduleRefresh()
//   - MutationObserver uses scheduleRefresh() (respects typing skip!)
//   - Opacity CSS transition replaces hard visibility:hidden flash
//   - State merge instead of overwrite (fixes CP/TP/ATP race condition)
//   - Debounced iframe state reports (250ms) prevent race condition
//   - Batch undo pushes during typing (avoid deep clone per keystroke)
//   - requestAnimationFrame gating for smooth rebuild timing
// ═══════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════════
   AT_SPLITVIEW — Live preview di sebelah editor  v4.6
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
  _rafPending: false,         // requestAnimationFrame gating flag

  // ── Typing Detection ──
  _isTyping: false,
  _typingTimer: null,
  _hasPendingRefresh: false,   // true when typing generated dirty state
  _forceNextRefresh: false,   // true when navigation action needs immediate rebuild

  // ── Message Queue: prevents race condition with iframe rebuild ──
  _pendingMessages: [],
  _iframeReady: false,

  /* ── Queue a message to iframe (safe even during rebuild) ── */
  _queueMessage(msg) {
    if (this._iframeReady) {
      this._sendToFrame(msg);
    } else {
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

  /* ── Detect active typing — defer ALL rebuilds until typing stops ── */
  _startTyping() {
    this._isTyping = true;
    this._forceNextRefresh = false;
    clearTimeout(this._typingTimer);
    this._typingTimer = setTimeout(() => {
      this._isTyping = false;
      // Typing ended — trigger final refresh if there were changes
      if (this._hasPendingRefresh && this.active) {
        this._hasPendingRefresh = false;
        this.scheduleRefresh();
      }
    }, 1200);
  },

  /* ── Show typing indicator in sync area ── */
  _showTypingIndicator() {
    const dot = document.getElementById("syncDot");
    const label = document.getElementById("syncLabel");
    if (!dot) return;
    dot.style.background = 'var(--muted)';
    dot.style.transform = 'scale(0.8)';
    dot.style.opacity = '0.5';
    if (label) { label.textContent = 'Mengetik...'; label.style.color = 'var(--muted)'; }
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

    // During active typing, DON'T schedule rebuild — just flag pending
    if (this._isTyping && !this._forceNextRefresh) {
      this._hasPendingRefresh = true;
      this._showTypingIndicator();
      return;
    }

    clearTimeout(this._debounceTimer);
    this._hasPendingRefresh = false;
    const delay = this._buildCount < 2 ? 120 : 300;
    // Use requestAnimationFrame to avoid mid-frame rendering
    this._debounceTimer = setTimeout(() => {
      if (this._rafPending) return;
      this._rafPending = true;
      requestAnimationFrame(() => {
        this._rafPending = false;
        this.refresh();
      });
    }, delay);
  },

  /* ── Force refresh — always rebuild ── */
  forceRefresh() {
    this._forceNextRefresh = true;
    this._isTyping = false;
    this._hasPendingRefresh = false;
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

    // ╔══════════════════════════════════════════════════════════╗
    // ║  HARD BLOCK: Tidak ada rebuild saat sedang mengetik!    ║
    // ║  Ini check TERAKHIR — tidak ada code path yang bisa      ║
    // ║  melewati ini selain forceNextRefresh=true.               ║
    // ╚══════════════════════════════════════════════════════════╝
    if (this._isTyping && !this._forceNextRefresh) {
      this._hasPendingRefresh = true;
      this._showTypingIndicator();
      return;  // ← REBUILD DIBATALKAN
    }

    // Clear flags
    this._debounceTimer = null;
    this._forceNextRefresh = false;
    this._hasPendingRefresh = false;

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
        if (this._pendingMessages.length > 0) {
          this._flushPendingMessages();
        } else {
          this._navigateFrame();
        }
        return;
      }

      // HTML changed — show sync pulse
      this._showSyncPulse();

      this._lastHTML = html;
      if (loading) loading.style.display = "flex";
      this._resetIframeState();
      // SMOOTH FADE: use opacity transition instead of hard visibility:hidden
      frame.style.transition = 'opacity 120ms ease';
      frame.style.opacity = '0';

      // ── Aggressive anti-flicker: kill ALL animations + transitions ──
      const antiFlicker = `<style>
*{animation:none!important;transition:none!important;}
.screen,.mat-page,.kp,.card,.btn-y,.h2{opacity:1!important;}
@keyframes fi{from{opacity:1;transform:none}to{opacity:1;transform:none}}
</style>`;

      // ── Navigation script injected into student HTML ──
      // Handles: goPage, restoreState, switchDocTab, scrollToEnd, scroll tracking
      // v4.6: patches kT() to track doc tab, includes docTab in state
      const navScript = `<script>(function(){
  var _curDocTab=null;
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
        if(rs.docTab&&typeof kT==='function'){
          var tabEl=null;
          document.querySelectorAll('.ktab').forEach(function(t){
            var oc=t.getAttribute('onclick')||'';
            if(oc.indexOf('"'+rs.docTab+'"')>=0||oc.indexOf("'"+rs.docTab+"'")>=0){tabEl=t;}
          });
          if(tabEl){kT(rs.docTab,tabEl);_curDocTab=rs.docTab;}
        }
        if(rs.scrollTop>0)window.scrollTo(0,rs.scrollTop);
      },150);
    }
    if(e.data&&e.data.switchDocTab){
      var tabId=e.data.switchDocTab;
      setTimeout(function(){
        var tabEl=null;
        document.querySelectorAll('.ktab').forEach(function(t){
          var oc=t.getAttribute('onclick')||'';
          if(oc.indexOf('"'+tabId+'"')>=0||oc.indexOf("'"+tabId+"'")>=0){tabEl=t;}
        });
        if(tabEl&&typeof kT==='function'){kT(tabId,tabEl);_curDocTab=tabId;}
        else if(typeof kT==='function'){
          var fakeEl={classList:{add:function(){},remove:function(){}}};
          try{kT(tabId,fakeEl);_curDocTab=tabId;}catch(ex){}
        }
        try{window.parent.postMessage({docTabSwitched:tabId},'*');}catch(ex){}
      },80);
    }
    if(e.data&&e.data.scrollToEnd){
      setTimeout(function(){window.scrollTo(0,document.body.scrollHeight);},100);
    }
  });
  var _rsTimer=null;
  function _rsDebounced(){
    clearTimeout(_rsTimer);
    // v5.0: Debounce state reports to prevent race condition
    // When multiple messages arrive quickly (goPage + switchDocTab),
    // only report state after the last one settles (250ms)
    _rsTimer=setTimeout(_rs,250);
  }
  var _og=window.go;
  window.go=function(id){if(_og)_og(id);_rsDebounced();};
  var _gm=window.goMatP;if(_gm){window.goMatP=function(i){_gm(i);_rsDebounced();};}
  var _mn=window.matNav;if(_mn){window.matNav=function(d){_mn(d);_rsDebounced();};}
  var _gmp=window.goModP;if(_gmp){window.goModP=function(i){_gmp(i);_rsDebounced();};}
  var _mdn=window.modNav;if(_mdn){window.modNav=function(d){_mdn(d);_rsDebounced();};}
  var _sf=window.swFt;if(_sf){window.swFt=function(i){_sf(i);_rsDebounced();};}
  var _okT=window.kT;
  if(_okT){window.kT=function(id,el){_okT(id,el);_curDocTab=id;_rsDebounced();};}
  function _rs(){
    var s={};
    var as=document.querySelector('.screen.active');
    if(as)s.page=as.id;
    if(typeof _matP!=='undefined')s.matPage=_matP;
    if(typeof _modP!=='undefined')s.modPage=_modP;
    if(typeof curFt!=='undefined')s.ftTab=curFt;
    if(_curDocTab)s.docTab=_curDocTab;
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
        // SMOOTH FADE IN: opacity 0→1 with CSS transition
        frame.style.opacity = '1';
        setTimeout(() => {
          // 1. Navigate to correct page + restore doc tab
          this._navigateFrame();
          // 2. Restore full saved state (matPage, modPage, ftTab, scroll, docTab)
          if (this._savedPreviewState) {
            try {
              frame.contentWindow.postMessage({ restoreState: this._savedPreviewState }, "*");
            } catch(e) {}
          }
          // 3. Flush queued messages (switchDocTab, scrollToEnd, etc.)
          this._flushPendingMessages();
          this._hideSyncPulse();
          if (loading) loading.style.display = "none";
        }, 80);
      }, { once: true });

      // Safety timeout
      setTimeout(() => {
        frame.style.opacity = '1';
        if (loading) loading.style.display = "none";
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

    const pages = [
      { id: 'sc',   label: '🏠 Cover' },
      { id: 'scp',  label: '📋 Dokumen' },
      { id: 'ssk',  label: '🎭 Skenario' },
      { id: 'smat', label: '📝 Materi' },
      { id: 'smods',label: '🧩 Modul' },
    ];
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
    // Reset any typing indicator styles
    dot.style.opacity = '1';
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
    dot.style.opacity = '1';
    if (label) { label.textContent = 'Tersinkron'; label.style.color = 'var(--muted)'; }
  },

  /* ── Navigate iframe to current page + restore doc tab ── */
  _navigateFrame() {
    const pageId = document.getElementById("splitPageSelect")?.value || "sc";
    this._sendToFrame({ goPage: pageId });

    // Restore doc tab if on document page and we have a saved tab
    if (pageId === 'scp' && this._savedPreviewState?.docTab) {
      this._sendToFrame({ switchDocTab: this._savedPreviewState.docTab });
    }
  },

  goPage(pageId) {
    const sel = document.getElementById("splitPageSelect");
    if (sel && pageId) sel.value = pageId;
    this._navigateFrame();
    this._sendToFrame({ goPage: pageId });
  },

  /* ── Navigate to specific page + optional sub-tab (queued) ── */
  navigateToPage(pageId, options) {
    options = options || {};
    const sel = document.getElementById("splitPageSelect");
    if (sel && pageId) sel.value = pageId;

    // Save doc tab to persisted state so it survives iframe rebuilds
    if (options.tab) {
      this._savedPreviewState = this._savedPreviewState || {};
      this._savedPreviewState.docTab = options.tab;
    }

    // Force immediate rebuild even during typing (user explicitly navigated)
    this._forceNextRefresh = true;
    this._isTyping = false;
    clearTimeout(this._typingTimer);

    // Send goPage first
    this._queueMessage({ goPage: pageId });

    // Queue sub-tab switch
    if (options.tab) {
      this._queueMessage({ switchDocTab: options.tab });
    }
    if (options.scrollEnd) {
      this._queueMessage({ scrollToEnd: true });
    }
    if (options.scrollTop > 0) {
      this._queueMessage({ restoreState: { scrollTop: options.scrollTop } });
    }

    // If iframe is ready, also send immediately for faster response
    if (this._iframeReady) {
      this._sendToFrame({ goPage: pageId });
      if (options.tab) {
        this._sendToFrame({ switchDocTab: options.tab });
      }
    }

    // Schedule a refresh to rebuild if content changed
    this.scheduleRefresh();
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
   v5.0: Now uses scheduleRefresh() to RESPECT typing skip!
   Previously called refresh() directly — this was the ROOT CAUSE
   of typing flicker even when _isTyping was true.
   ══════════════════════════════════════════════════════════════ */
let _mutationObserver = null;
function _initMutationObserver() {
  if (_mutationObserver) return;

  const contentEl = document.getElementById("content");
  if (!contentEl) return;

  let _lastMutCheck = 0;
  _mutationObserver = new MutationObserver((mutations) => {
    if (!AT_SPLITVIEW.active) return;
    // Respect typing state — don't trigger rebuild during typing
    if (AT_SPLITVIEW._isTyping) {
      AT_SPLITVIEW._hasPendingRefresh = true;
      AT_SPLITVIEW._showTypingIndicator();
      return;
    }
    const now = Date.now();
    if (now - _lastMutCheck < 800) return;
    _lastMutCheck = now;
    if (!AT_STATE.dirty) return;
    // Use scheduleRefresh instead of direct refresh() — respects all guards
    AT_SPLITVIEW.scheduleRefresh();
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
   Uses navigateToPage() which saves doc tab + force refresh.
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
        // navigateToPage saves doc tab + forces refresh (bypasses typing skip)
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
    // v5.1: Detect typing HERE — before scheduleRefresh!
    // This fixes the race condition where inline oninput fires before
    // the #content input listener (event bubbling order).
    AT_SPLITVIEW._startTyping();
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

  // ── Typing Detection: keydown CAPTURE phase (before ALL other handlers) ──
  // Using capture phase ensures _isTyping=true BEFORE any form handler runs.
  // This catches ALL keyboard input, including inputs not inside #content.
  document.addEventListener("keydown", (e) => {
    // Only for actual text input keys (not Ctrl, Alt, Shift, arrows, etc.)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      AT_SPLITVIEW._startTyping();
    }
  }, { capture: true, passive: true });

  // Fallback: input event on #content for paste/drag-drop/IME
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
    if (e.data && e.data.action === "retry") {
      AT_SPLITVIEW.forceRefresh();
    }
    // v5.0: MERGE preview state instead of OVERWRITE
    // Fixes CP/TP/ATP race condition where iframe sends state without docTab
    // during goPage, overwriting the docTab saved by navigateToPage()
    if (e.data && e.data.previewState) {
      const incoming = e.data.previewState;
      const existing = AT_SPLITVIEW._savedPreviewState || {};
      // Merge: incoming takes priority, but preserve docTab if iframe didn't report it
      if (incoming.docTab === undefined && existing.docTab) {
        incoming.docTab = existing.docTab;
      }
      // Preserve scrollTop if incoming doesn't have it
      if (incoming.scrollTop === undefined && existing.scrollTop) {
        incoming.scrollTop = existing.scrollTop;
      }
      AT_SPLITVIEW._savedPreviewState = incoming;
    }
    if (e.data && e.data.previewScroll) {
      AT_SPLITVIEW._savedPreviewState = AT_SPLITVIEW._savedPreviewState || {};
      AT_SPLITVIEW._savedPreviewState.scrollTop = e.data.previewScroll;
    }
    if (e.data && e.data.docTabSwitched) {
      // Doc tab changed in iframe — update saved state
      AT_SPLITVIEW._savedPreviewState = AT_SPLITVIEW._savedPreviewState || {};
      AT_SPLITVIEW._savedPreviewState.docTab = e.data.docTabSwitched;
    }
  });

  console.log("liveview.js v5.1 — hard block typing (refresh() unreachable during typing), keydown capture phase, state merge for CP/TP/ATP");
});
