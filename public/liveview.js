// ═══════════════════════════════════════════════════════════════
// LIVEVIEW.JS — Split-View Live Preview v4.0 (Robust Rewrite)
// Berisi:
//   AT_SPLITVIEW  — live preview berdampingan dengan editor
//   AT_UNDO       — undo/redo history (Ctrl+Z / Ctrl+Y)
//   AT_SK_EDITOR  — skenario detail editor (dialog + choices)
//   AT_FUNGSI_EDITOR — edit tab fungsi norma
//   AT_JSON_IO    — import/export JSON state
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
      // Auto-open on first meaningful edit
      if (!this._autoOpened && this._hasEnoughContent()) {
        this._autoOpened = true;
        this.toggle();
      }
      return;
    }
    clearTimeout(this._debounceTimer);
    // Fast first render (60ms), then normal debounce (200ms)
    const delay = this._buildCount < 5 ? 60 : 200;
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
    if (loading) loading.style.display = "flex";

    try {
      if (!window.AT_PREVIEW || !window.AT_PREVIEW.buildStudentHTML) {
        console.warn("AT_PREVIEW not ready, retrying in 500ms...");
        this._hideSyncPulse();
        setTimeout(() => this.refresh(), 500);
        return;
      }

      const html = AT_PREVIEW.buildStudentHTML(AT_STATE);
      this._buildCount++;
      this._lastHTML = html;
      this._hasContent = true;
      this._errorRetries = 0;
      this._updateCharCount(html);

      const pageId = document.getElementById("splitPageSelect")?.value || "sc";
      const navScript = `<script>window.addEventListener('message',function(e){if(e.data&&e.data.goPage){var fn=window.go;if(fn)fn(e.data.goPage);}});<\/script>`;
      frame.srcdoc = html.replace("</body>", navScript + "</body>");
      frame.style.display = "block";
      if (emptyState) emptyState.style.display = "none";

      frame.addEventListener("load", () => {
        setTimeout(() => {
          this._navigateFrame();
          this._hideSyncPulse();
          if (loading) loading.style.display = "none";
        }, 80);
      }, { once: true });

      // Safety timeout — hide loading after 4s max
      setTimeout(() => { if (loading) loading.style.display = "none"; }, 4000);

    } catch(e) {
      this._errorRetries++;
      this._hideSyncPulse();
      console.error("Live preview error:", e);

      // Show error in iframe
      frame.srcdoc = `
        <body style="padding:24px;color:#f87171;font-family:'Plus Jakarta Sans',sans-serif;background:#0e1c2f;margin:0">
          <div style="max-width:300px">
            <div style="font-size:1.4rem;margin-bottom:8px">&#9888;&#65039;</div>
            <div style="font-size:.85rem;font-weight:700;margin-bottom:6px">Preview Error</div>
            <pre style="font-size:.72rem;white-space:pre-wrap;color:rgba(248,113,113,.7);line-height:1.5;margin:0">${e.message}</pre>
            <button onclick="window.parent.postMessage({action:'retry'},'*')"
              style="margin-top:12px;padding:6px 14px;border-radius:6px;border:1px solid rgba(248,113,113,.3);
              background:rgba(248,113,113,.1);color:#f87171;font-size:.72rem;font-weight:700;cursor:pointer">
              Coba Lagi
            </button>
          </div>
        </body>`;
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
   AT_UNDO — Undo / Redo history stack
   ══════════════════════════════════════════════════════════════ */
window.AT_UNDO = {
  _stack: [],
  _pos: -1,
  _max: 30,
  _paused: false,

  push() {
    if (this._paused) return;
    const snap = JSON.stringify(AT_STATE);
    if (this._pos < this._stack.length - 1) {
      this._stack = this._stack.slice(0, this._pos + 1);
    }
    this._stack.push(snap);
    if (this._stack.length > this._max) this._stack.shift();
    this._pos = this._stack.length - 1;
    this._updateUI();
  },

  undo() {
    if (this._pos <= 0) { AT_UTIL.toast("Tidak ada yang bisa di-undo", "err"); return; }
    this._pos--;
    this._restore(this._stack[this._pos]);
    AT_UTIL.toast("Undo berhasil");
  },

  redo() {
    if (this._pos >= this._stack.length - 1) { AT_UTIL.toast("Tidak ada yang bisa di-redo", "err"); return; }
    this._pos++;
    this._restore(this._stack[this._pos]);
    AT_UTIL.toast("Redo berhasil");
  },

  _restore(snap) {
    this._paused = true;
    try {
      Object.assign(AT_STATE, JSON.parse(snap));
      AT_META.bind(); AT_CP.bind(); AT_TP.render();
      AT_ATP.bind(); AT_ALUR.render(); AT_KUIS.render();
      AT_SKENARIO.render();
      if (window.AT_MODULES) AT_MODULES.render();
      if (window.AT_GAMES) AT_GAMES.render();
      if (window.AT_MATERI_EDITOR) AT_MATERI_EDITOR.render();
      AT_DASH.render();
      _recalcAllAccordions();
      AT_SPLITVIEW.forceRefresh();
    } catch(e) { console.error("Undo restore error:", e); }
    this._paused = false;
    this._updateUI();
  },

  _updateUI() {
    const u = document.getElementById("undoBtn");
    const r = document.getElementById("redoBtn");
    if (u) u.disabled = this._pos <= 0;
    if (r) r.disabled = this._pos >= this._stack.length - 1;
  },

  init() {
    document.addEventListener("keydown", e => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); AT_UNDO.undo(); }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); AT_UNDO.redo(); }
    });
    this.push();
    this._updateUI();
  }
};

/* ══════════════════════════════════════════════════════════════
   ACCORDION AUTO-RECALC — Fix max-height after content changes
   ══════════════════════════════════════════════════════════════ */
function _recalcAllAccordions() {
  document.querySelectorAll('.acc-section.open').forEach(section => {
    const body = section.querySelector('.acc-body');
    if (body) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        body.style.maxHeight = body.scrollHeight + 40 + 'px';
      });
    }
  });
}

// Recalculate accordion heights after any render that might add content
function _recalcAfterRender() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      _recalcAllAccordions();
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   AT_SK_EDITOR — Skenario Detail Editor (full form)
   ══════════════════════════════════════════════════════════════ */
window.AT_SK_EDITOR = {
  _idx: null,
  _modIdx: null,
  _chIdx: null,

  open(i, chIdx) {
    this._idx = i;
    this._chIdx = (chIdx !== undefined) ? chIdx : null;

    let sk;
    if (this._chIdx !== null) {
      const m = AT_STATE.modules[i];
      sk = m?.chapters?.[chIdx];
    } else {
      sk = AT_STATE.skenario[i];
    }
    if (!sk) return;

    const modal = document.getElementById("skDetailModal");
    document.getElementById("skDetailTitle").textContent = "Edit: " + (sk.title || "Chapter " + ((chIdx??i)+1));
    document.getElementById("skDetailBody").innerHTML = this._buildForm(sk);
    modal?.classList.add("show");
  },

  close() {
    document.getElementById("skDetailModal")?.classList.remove("show");
    if (this._chIdx !== null && AT_MODULES) {
      AT_MODULES.openEditor(this._idx);
    } else {
      AT_SKENARIO.render();
    }
    _recalcAfterRender();
    AT_SPLITVIEW.scheduleRefresh();
    this._chIdx = null;
  },

  save() {
    this.close();
    AT_EDITOR.markDirty();
    AT_UTIL.toast("Skenario disimpan");
  },

  _e(s) { return String(s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); },

  _buildForm(sk) {
    const e = this._e.bind(this);
    const bgOpts = ["sbg-kampung","sbg-pasar","sbg-masjid","sbg-kelas"].map(b =>
      `<option value="${b}" ${sk.bg===b?"selected":""}>${b.replace("sbg-","")}</option>`
    ).join("");

    const setupHtml = (sk.setup||[]).map((s, si) => `
      <div class="sub-item" id="skd_s${si}">
        <div class="field-row">
          <div class="field-group" style="flex:0 0 130px">
            <label class="field-label">Speaker</label>
            <input class="field-input" value="${e(s.speaker)}" placeholder="NARRATOR"
              oninput="AT_SK_EDITOR._upSk('setup',${si},'speaker',this.value)">
          </div>
          <div class="field-group">
            <label class="field-label">Dialog</label>
            <textarea class="field-textarea" rows="2"
              oninput="AT_SK_EDITOR._upSk('setup',${si},'text',this.value)">${e(s.text)}</textarea>
          </div>
          <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px"
            onclick="AT_SK_EDITOR._rem('setup',${si})">x</button>
        </div>
      </div>`).join("");

    const choicesHtml = (sk.choices||[]).map((c, ci) => `
      <div class="sub-item" id="skd_c${ci}">
        <div class="field-row">
          <div class="field-group" style="flex:0 0 50px">
            <label class="field-label">Ikon</label>
            <input class="field-input" value="${e(c.icon)}" maxlength="4"
              oninput="AT_SK_EDITOR._upCh(${ci},'icon',this.value)">
          </div>
          <div class="field-group">
            <label class="field-label">Label Pilihan</label>
            <input class="field-input" value="${e(c.label)}" placeholder="Teks pilihan..."
              oninput="AT_SK_EDITOR._upCh(${ci},'label',this.value)">
          </div>
          <div class="field-group" style="flex:0 0 80px">
            <label class="field-label">Level</label>
            <select class="field-select" onchange="AT_SK_EDITOR._upCh(${ci},'level',this.value)">
              <option value="good" ${c.level==="good"?"selected":""}>Baik</option>
              <option value="mid"  ${c.level==="mid" ?"selected":""}>Sedang</option>
              <option value="bad"  ${c.level==="bad" ?"selected":""}>Buruk</option>
            </select>
          </div>
          <div class="field-group" style="flex:0 0 60px">
            <label class="field-label">Poin</label>
            <input class="field-input" type="number" min="0" max="30" value="${c.pts||0}"
              oninput="AT_SK_EDITOR._upCh(${ci},'pts',+this.value)">
          </div>
          <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px"
            onclick="AT_SK_EDITOR._rem('choices',${ci})">x</button>
        </div>
        <input class="field-input" value="${e(c.detail)}" placeholder="Deskripsi detail..." style="margin-top:5px"
          oninput="AT_SK_EDITOR._upCh(${ci},'detail',this.value)">
        <div class="field-row" style="margin-top:6px">
          <div class="field-group">
            <label class="field-label">Judul Hasil</label>
            <input class="field-input" value="${e(c.resultTitle)}" placeholder="Pilihan Terbaik!"
              oninput="AT_SK_EDITOR._upCh(${ci},'resultTitle',this.value)">
          </div>
          <div class="field-group">
            <label class="field-label">Kaitan Norma</label>
            <input class="field-input" value="${e(c.norma)}" placeholder="Fungsi norma terkait..."
              oninput="AT_SK_EDITOR._upCh(${ci},'norma',this.value)">
          </div>
        </div>
        <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Penjelasan hasil..."
          oninput="AT_SK_EDITOR._upCh(${ci},'resultBody',this.value)">${e(c.resultBody)}</textarea>
        <div style="margin-top:8px">
          <div class="at-card-title" style="font-size:.68rem;margin-bottom:6px">Konsekuensi</div>
          ${(c.consequences||[]).map((k,ki) => `
            <div style="display:flex;gap:6px;margin-bottom:5px;align-items:center">
              <input class="field-input" value="${e(k.icon)}" maxlength="4" style="width:44px;flex-shrink:0"
                oninput="AT_SK_EDITOR._upCons(${ci},${ki},'icon',this.value)">
              <input class="field-input" value="${e(k.text)}" placeholder="Teks konsekuensi..." style="flex:1"
                oninput="AT_SK_EDITOR._upCons(${ci},${ki},'text',this.value)">
              <button class="icon-btn del" onclick="AT_SK_EDITOR._remCons(${ci},${ki})">x</button>
            </div>`).join("")}
          <button class="btn btn-ghost btn-xs" style="margin-top:4px"
            onclick="AT_SK_EDITOR._addCons(${ci})">+ Konsekuensi</button>
        </div>
      </div>`).join("");

    return `
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Judul Skenario</label>
          <input class="field-input" value="${e(sk.title)}"
            oninput="AT_SK_EDITOR._upSkTop('title',this.value)">
        </div>
        <div class="field-group" style="flex:0 0 120px">
          <label class="field-label">Latar</label>
          <select class="field-select" onchange="AT_SK_EDITOR._upSkTop('bg',this.value)">${bgOpts}</select>
        </div>
        <div class="field-group" style="flex:0 0 70px">
          <label class="field-label">Karakter</label>
          <input class="field-input" value="${e(sk.charEmoji||"")}" maxlength="4"
            oninput="AT_SK_EDITOR._upSkTop('charEmoji',this.value)">
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Teks Prompt Pilihan</label>
        <input class="field-input" value="${e(sk.choicePrompt)}"
          oninput="AT_SK_EDITOR._upSkTop('choicePrompt',this.value)">
      </div>

      <div class="divider"></div>
      <div class="at-card-title">Dialog Setup</div>
      <div id="skd_setup">${setupHtml}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px"
        onclick="AT_SK_EDITOR._addSetup()">+ Tambah Dialog</button>

      <div class="divider"></div>
      <div class="at-card-title">Pilihan Jawaban</div>
      <div id="skd_choices">${choicesHtml}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px"
        onclick="AT_SK_EDITOR._addChoice()">+ Tambah Pilihan</button>
    `;
  },

  _sk() {
    if (this._chIdx !== null) {
      return AT_STATE.modules[this._idx]?.chapters?.[this._chIdx];
    }
    return AT_STATE.skenario[this._idx];
  },
  _upSkTop(key, val) { const sk = this._sk(); if (!sk) return; sk[key] = val; AT_EDITOR.markDirty(); },
  _upSk(arr, idx, key, val) { const sk = this._sk(); if (!sk || !sk[arr]) return; sk[arr][idx][key] = val; AT_EDITOR.markDirty(); },
  _upCh(ci, key, val) { const sk = this._sk(); if (!sk?.choices?.[ci]) return; sk.choices[ci][key] = val; AT_EDITOR.markDirty(); },
  _upCons(ci, ki, key, val) { const sk = this._sk(); if (!sk?.choices?.[ci]?.consequences?.[ki]) return; sk.choices[ci].consequences[ki][key] = val; AT_EDITOR.markDirty(); },
  _addCons(ci) { const sk = this._sk(); if (!sk?.choices?.[ci]) return; if (!sk.choices[ci].consequences) sk.choices[ci].consequences = []; sk.choices[ci].consequences.push({icon:"",text:""}); AT_EDITOR.markDirty(); this.open(this._idx, this._chIdx); },
  _remCons(ci, ki) { const sk = this._sk(); sk?.choices?.[ci]?.consequences?.splice(ki,1); AT_EDITOR.markDirty(); this.open(this._idx, this._chIdx); },
  _rem(arr, idx) { const sk = this._sk(); if (!sk || !sk[arr]) return; sk[arr].splice(idx,1); AT_EDITOR.markDirty(); this.open(this._idx, this._chIdx); },
  _addSetup() { const sk = this._sk(); if (!sk) return; if (!sk.setup) sk.setup = []; sk.setup.push({speaker:"NARRATOR",text:""}); AT_EDITOR.markDirty(); this.open(this._idx, this._chIdx); },
  _addChoice() { const sk = this._sk(); if (!sk) return; if (!sk.choices) sk.choices = []; sk.choices.push({icon:"",label:"",detail:"",good:false,pts:10,level:"mid",norma:"",resultTitle:"",resultBody:"",consequences:[{icon:"",text:""}]}); AT_EDITOR.markDirty(); this.open(this._idx, this._chIdx); }
};

// Patch AT_SKENARIO.openDetail to use AT_SK_EDITOR
AT_SKENARIO.openDetail = function(i) { AT_SK_EDITOR.open(i); };

/* ══════════════════════════════════════════════════════════════
   AT_FUNGSI_EDITOR — Edit tab Fungsi Norma
   ══════════════════════════════════════════════════════════════ */
window.AT_FUNGSI_EDITOR = {
  _getData() {
    if (!AT_STATE.fungsi) AT_STATE.fungsi = AT_UTIL.deepClone(PRESETS.fungsi);
    return AT_STATE.fungsi;
  },

  open() {
    const data = this._getData();
    const body = document.getElementById("fungsiEditorBody");
    if (!body) return;
    body.innerHTML = this._buildForm(data);
    document.getElementById("fungsiModal")?.classList.add("show");
  },

  save() {
    document.getElementById("fungsiModal")?.classList.remove("show");
    AT_EDITOR.markDirty();
    AT_UTIL.toast("Fungsi Norma disimpan");
  },

  _e(s) { return String(s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); },

  _buildForm(data) {
    const e = this._e.bind(this);
    const colorOpts = ["var(--y)","var(--c)","var(--r)","var(--g)","var(--p)","var(--o)"];
    return data.map((f, fi) => `
      <div class="sub-item" id="fn_${fi}">
        <div class="field-row">
          <div class="field-group" style="flex:0 0 54px">
            <label class="field-label">Ikon</label>
            <input class="field-input" value="${e(f.icon)}" maxlength="4"
              oninput="AT_FUNGSI_EDITOR._up(${fi},'icon',this.value)">
          </div>
          <div class="field-group">
            <label class="field-label">Label Tab</label>
            <input class="field-input" value="${e(f.label)}"
              oninput="AT_FUNGSI_EDITOR._up(${fi},'label',this.value)">
          </div>
          <div class="field-group" style="flex:0 0 120px">
            <label class="field-label">Warna</label>
            <div style="display:flex;gap:5px;align-items:center;margin-top:6px">
              ${colorOpts.map(c => `
                <div onclick="AT_FUNGSI_EDITOR._up(${fi},'color','${c}')"
                  style="width:18px;height:18px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${f.color===c?"#fff":"transparent"};transition:border .15s"></div>
              `).join("")}
            </div>
          </div>
          <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px"
            onclick="AT_FUNGSI_EDITOR._rem(${fi})">x</button>
        </div>
        <div class="field-group" style="margin-top:6px">
          <label class="field-label">Deskripsi</label>
          <textarea class="field-textarea" rows="2"
            oninput="AT_FUNGSI_EDITOR._up(${fi},'desc',this.value)">${e(f.desc)}</textarea>
        </div>
        <div class="field-group">
          <label class="field-label">Pertanyaan Diskusi</label>
          <input class="field-input" value="${e(f.tanya)}"
            oninput="AT_FUNGSI_EDITOR._up(${fi},'tanya',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Contoh (satu per baris)</label>
          <textarea class="field-textarea" rows="3"
            oninput="AT_FUNGSI_EDITOR._upContoh(${fi},this.value)">${(f.contoh||[]).join("\n")}</textarea>
        </div>
      </div>`).join("") +
      `<button class="btn btn-ghost btn-sm" style="margin-top:10px"
        onclick="AT_FUNGSI_EDITOR._add()">+ Tambah Fungsi</button>`;
  },

  _up(fi, key, val) { const data = this._getData(); if (!data[fi]) return; data[fi][key] = val; AT_EDITOR.markDirty(); },
  _upContoh(fi, val) { const data = this._getData(); if (!data[fi]) return; data[fi].contoh = val.split("\n").map(s => s.trim()).filter(Boolean); AT_EDITOR.markDirty(); },
  _rem(fi) { const data = this._getData(); data.splice(fi, 1); AT_EDITOR.markDirty(); this.open(); },
  _add() { const data = this._getData(); data.push({icon:"",label:"Fungsi Baru",color:"var(--y)",bg:"rgba(249,193,46,.06)",bc:"rgba(249,193,46,.25)",desc:"Deskripsi fungsi norma ini.",contoh:["Contoh pertama","Contoh kedua"],tanya:"Pertanyaan diskusi untuk siswa?"}); AT_EDITOR.markDirty(); this.open(); }
};

/* ══════════════════════════════════════════════════════════════
   AT_JSON_IO — Import / Export state JSON
   ══════════════════════════════════════════════════════════════ */
window.AT_JSON_IO = {
  importClick() { document.getElementById("jsonImportInput")?.click(); },

  handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.meta) throw new Error("Format tidak valid");
        Object.assign(AT_STATE, data);
        AT_META.bind(); AT_CP.bind(); AT_TP.render();
        AT_ATP.bind(); AT_ALUR.render(); AT_KUIS.render();
        AT_SKENARIO.render();
        if (window.AT_MODULES) AT_MODULES.render();
        if (window.AT_GAMES) AT_GAMES.render();
        if (window.AT_MATERI_EDITOR) AT_MATERI_EDITOR.render();
        AT_DASH.render();
        AT_UNDO.push();
        _recalcAllAccordions();
        AT_SPLITVIEW.forceRefresh();
        AT_UTIL.toast("State JSON berhasil dimuat: " + file.name);
      } catch(err) {
        AT_UTIL.toast("Gagal: " + err.message, "err");
      }
    };
    reader.readAsText(file);
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

  _mutationObserver = new MutationObserver((mutations) => {
    // Only trigger refresh if AT_SPLITVIEW is active and there are meaningful changes
    if (!AT_SPLITVIEW.active) return;
    if (!AT_STATE.dirty) return; // Only if there are actually pending changes

    // Reset debounce to ensure refresh happens
    clearTimeout(AT_SPLITVIEW._debounceTimer);
    AT_SPLITVIEW._debounceTimer = setTimeout(() => AT_SPLITVIEW.refresh(), 300);
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
   ══════════════════════════════════════════════════════════════ */
function _patchAccordionToggle() {
  const origToggle = window.toggleAccordion;
  if (!origToggle) return;
  window.toggleAccordion = function(headerEl) {
    origToggle(headerEl);
    _recalcAfterRender();
  };
}

function _patchSwitchKontenTab() {
  const origSwitch = window.switchKontenTab;
  if (!origSwitch) return;
  window.switchKontenTab = function(tabId, btnEl) {
    origSwitch(tabId, btnEl);
    _recalcAfterRender();
  };
}

/* ══════════════════════════════════════════════════════════════
   INIT — Semua inisialisasi di satu tempat
   ══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  _injectUndoButtons();
  _initModalClose();
  _patchAccordionToggle();
  _patchSwitchKontenTab();
  AT_UNDO.init();
  _initMutationObserver();

  // Add split-view refresh on panel change
  const _origNav = AT_NAV.go.bind(AT_NAV);
  AT_NAV.go = function(id) {
    _origNav(id);
    AT_SPLITVIEW.scheduleRefresh();
  };

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

  // Listen for retry messages from error iframe
  window.addEventListener("message", (e) => {
    if (e.data && e.data.action === "retry") {
      AT_SPLITVIEW.forceRefresh();
    }
  });

  // ── Periodic integrity check ─────────────────────────────
  // Every 2 seconds, if dirty and split active, ensure refresh is scheduled
  setInterval(() => {
    if (AT_SPLITVIEW.active && AT_STATE.dirty) {
      AT_SPLITVIEW.scheduleRefresh();
    }
  }, 2000);

  console.log("liveview.js v4.0 loaded — robust split-view, MutationObserver, accordion recalc");
});
