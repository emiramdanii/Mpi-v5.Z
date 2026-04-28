// ═══════════════════════════════════════════════════════════════
// LIVEVIEW.JS — Split-View Live Preview + Missing Editors v1.3
// Berisi:
//   AT_SPLITVIEW  — live preview berdampingan dengan editor
//   AT_SK_EDITOR  — skenario detail editor (dialog + choices)
//   AT_FUNGSI_EDITOR — edit tab fungsi norma
//   AT_UNDO       — undo/redo history (Ctrl+Z / Ctrl+Y)
//   AT_JSON_IO    — import/export JSON state
// ═══════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════════
   AT_SPLITVIEW — Live preview di sebelah editor
   ══════════════════════════════════════════════════════════════ */
window.AT_SPLITVIEW = {
  active: false,
  _device: "mobile",
  _debounceTimer: null,
  _lastHTML: "",

  toggle() {
    this.active = !this.active;
    const app  = document.getElementById("app");
    const btn  = document.getElementById("btnSplitToggle");
    const pane = document.getElementById("split-pane");
    if (!app) return;

    if (this.active) {
      app.classList.add("split-active");
      if (pane) pane.style.display = "flex";
      if (btn)  btn.classList.add("active");
      this.refresh();
    } else {
      app.classList.remove("split-active");
      if (pane) pane.style.display = "none";
      if (btn)  btn.classList.remove("active");
    }
  },

  setDevice(d) {
    this._device = d;
    document.querySelectorAll("#split-pane .device-btn").forEach(b => {
      const isActive = b.dataset.device === d;
      b.style.background  = isActive ? "rgba(245,200,66,.15)" : "rgba(255,255,255,.04)";
      b.style.color       = isActive ? "var(--y)" : "var(--muted)";
      b.style.borderColor = isActive ? "rgba(245,200,66,.3)" : "var(--border)";
    });
    this.refresh();
  },

  // Called on any state change — debounced 400ms
  scheduleRefresh() {
    if (!this.active) return;
    const dot = document.getElementById("syncDot");
    if (dot) dot.classList.add("syncing");
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.refresh();
      if (dot) setTimeout(() => dot.classList.remove("syncing"), 300);
    }, 400);
  },

  refresh() {
    if (!this.active) return;
    const frame = document.getElementById("split-frame");
    if (!frame) return;
    try {
      const html = AT_PREVIEW.buildStudentHTML(AT_STATE);
      if (html === this._lastHTML) {
        // Even if HTML same, navigate to selected page
        this._navigateFrame();
        return;
      }
      this._lastHTML = html;
      const pageId = document.getElementById("splitPageSelect")?.value || "sc";
      // Inject auto-nav script into html before setting srcdoc
      const navScript = `<script>window.addEventListener('message',function(e){if(e.data&&e.data.goPage){var fn=window.go;if(fn)fn(e.data.goPage);}});<\/script>`;
      frame.srcdoc = html.replace("</body>", navScript + "</body>");
      // After load, navigate to selected page
      frame.addEventListener("load", () => {
        setTimeout(() => this._navigateFrame(), 80);
      }, { once: true });
    } catch(e) {
      frame.srcdoc = '<body style="padding:16px;color:red;font-family:sans-serif"><b>Error</b><pre style="font-size:.78rem;white-space:pre-wrap">' + e.message + "</pre></body>";
    }
  },

  _navigateFrame() {
    const frame = document.getElementById("split-frame");
    const pageId = document.getElementById("splitPageSelect")?.value || "sc";
    try {
      frame?.contentWindow?.postMessage({ goPage: pageId }, "*");
    } catch(e) {}
  },

  goPage(pageId) {
    // Update select if called programmatically
    const sel = document.getElementById("splitPageSelect");
    if (sel && pageId) sel.value = pageId;
    this._navigateFrame();
  }
};

// Hook into AT_EDITOR.markDirty to trigger live refresh
const _origMarkDirty = AT_EDITOR.markDirty.bind(AT_EDITOR);
AT_EDITOR.markDirty = function() {
  _origMarkDirty();
  AT_SPLITVIEW.scheduleRefresh();
};

/* ══════════════════════════════════════════════════════════════
   AT_UNDO — Undo / Redo history stack
   ══════════════════════════════════════════════════════════════ */
window.AT_UNDO = {
  _stack: [],
  _pos: -1,
  _max: 30,
  _paused: false,

  // Snapshot current state
  push() {
    if (this._paused) return;
    const snap = JSON.stringify(AT_STATE);
    // Prune future if we branched
    if (this._pos < this._stack.length - 1) {
      this._stack = this._stack.slice(0, this._pos + 1);
    }
    this._stack.push(snap);
    if (this._stack.length > this._max) this._stack.shift();
    this._pos = this._stack.length - 1;
    this._updateUI();
  },

  undo() {
    if (this._pos <= 0) { AT_UTIL.toast("⚠️ Tidak ada yang bisa di-undo", "err"); return; }
    this._pos--;
    this._restore(this._stack[this._pos]);
    AT_UTIL.toast("↩ Undo berhasil");
  },

  redo() {
    if (this._pos >= this._stack.length - 1) { AT_UTIL.toast("⚠️ Tidak ada yang bisa di-redo", "err"); return; }
    this._pos++;
    this._restore(this._stack[this._pos]);
    AT_UTIL.toast("↪ Redo berhasil");
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
      AT_DASH.render();
      AT_SPLITVIEW.scheduleRefresh();
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
    // Hook markDirty to auto-snapshot
    const _orig = AT_EDITOR.markDirty.bind(AT_EDITOR);
    AT_EDITOR.markDirty = function() {
      _orig();
      AT_UNDO.push();
    };
    // Keyboard
    document.addEventListener("keydown", e => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); AT_UNDO.undo(); }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); AT_UNDO.redo(); }
    });
    // Initial snapshot
    this.push();
    this._updateUI();
  }
};

/* ══════════════════════════════════════════════════════════════
   AT_SK_EDITOR — Skenario Detail Editor (full form)
   ══════════════════════════════════════════════════════════════ */
window.AT_SK_EDITOR = {
  _idx: null,

  _modIdx: null, _chIdx: null,

  open(i, chIdx) {
    // Can be called two ways:
    // 1. open(i) → skenario panel (AT_STATE.skenario[i])
    // 2. open(modIdx, chIdx) → module chapter (AT_STATE.modules[modIdx].chapters[chIdx])
    this._idx = i;
    this._chIdx = (chIdx !== undefined) ? chIdx : null;

    let sk;
    if (this._chIdx !== null) {
      // Module chapter mode
      const m = AT_STATE.modules[i];
      sk = m?.chapters?.[chIdx];
    } else {
      // Legacy skenario panel mode
      sk = AT_STATE.skenario[i];
    }
    if (!sk) return;

    const modal = document.getElementById("skDetailModal");
    document.getElementById("skDetailTitle").textContent = "🎭 Edit: " + (sk.title || "Chapter " + ((chIdx??i)+1));
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
    AT_SPLITVIEW.scheduleRefresh();
    this._chIdx = null;
  },

  save() {
    this.close();
    AT_EDITOR.markDirty();
    AT_UTIL.toast("✅ Skenario disimpan");
  },

  _e(s) { return String(s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); },

  _buildForm(sk) {
    const e = this._e.bind(this);
    const bgOpts = ["sbg-kampung","sbg-pasar","sbg-masjid","sbg-kelas"].map(b =>
      `<option value="${b}" ${sk.bg===b?"selected":""}>${b.replace("sbg-","")}</option>`
    ).join("");

    // Setup rows
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
            onclick="AT_SK_EDITOR._rem('setup',${si})">🗑️</button>
        </div>
      </div>`).join("");

    // Choice rows (collapsed - expand on click)
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
            <input class="field-input" value="${e(c.label)}" placeholder="Teks pilihan…"
              oninput="AT_SK_EDITOR._upCh(${ci},'label',this.value)">
          </div>
          <div class="field-group" style="flex:0 0 80px">
            <label class="field-label">Level</label>
            <select class="field-select" onchange="AT_SK_EDITOR._upCh(${ci},'level',this.value)">
              <option value="good" ${c.level==="good"?"selected":""}>✅ Baik</option>
              <option value="mid"  ${c.level==="mid" ?"selected":""}>🤔 Sedang</option>
              <option value="bad"  ${c.level==="bad" ?"selected":""}>⚠️ Buruk</option>
            </select>
          </div>
          <div class="field-group" style="flex:0 0 60px">
            <label class="field-label">Poin</label>
            <input class="field-input" type="number" min="0" max="30" value="${c.pts||0}"
              oninput="AT_SK_EDITOR._upCh(${ci},'pts',+this.value)">
          </div>
          <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px"
            onclick="AT_SK_EDITOR._rem('choices',${ci})">🗑️</button>
        </div>
        <input class="field-input" value="${e(c.detail)}" placeholder="Deskripsi detail…" style="margin-top:5px"
          oninput="AT_SK_EDITOR._upCh(${ci},'detail',this.value)">
        <div class="field-row" style="margin-top:6px">
          <div class="field-group">
            <label class="field-label">Judul Hasil</label>
            <input class="field-input" value="${e(c.resultTitle)}" placeholder="Pilihan Terbaik! 🌟"
              oninput="AT_SK_EDITOR._upCh(${ci},'resultTitle',this.value)">
          </div>
          <div class="field-group">
            <label class="field-label">Kaitan Norma</label>
            <input class="field-input" value="${e(c.norma)}" placeholder="Fungsi norma terkait…"
              oninput="AT_SK_EDITOR._upCh(${ci},'norma',this.value)">
          </div>
        </div>
        <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Penjelasan hasil…"
          oninput="AT_SK_EDITOR._upCh(${ci},'resultBody',this.value)">${e(c.resultBody)}</textarea>
        <div style="margin-top:8px">
          <div class="at-card-title" style="font-size:.68rem;margin-bottom:6px">📋 Konsekuensi</div>
          ${(c.consequences||[]).map((k,ki) => `
            <div style="display:flex;gap:6px;margin-bottom:5px;align-items:center">
              <input class="field-input" value="${e(k.icon)}" maxlength="4" style="width:44px;flex-shrink:0"
                oninput="AT_SK_EDITOR._upCons(${ci},${ki},'icon',this.value)">
              <input class="field-input" value="${e(k.text)}" placeholder="Teks konsekuensi…" style="flex:1"
                oninput="AT_SK_EDITOR._upCons(${ci},${ki},'text',this.value)">
              <button class="icon-btn del" onclick="AT_SK_EDITOR._remCons(${ci},${ki})">×</button>
            </div>`).join("")}
          <button class="btn btn-ghost btn-xs" style="margin-top:4px"
            onclick="AT_SK_EDITOR._addCons(${ci})">＋ Konsekuensi</button>
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
          <input class="field-input" value="${e(sk.charEmoji||"😊")}" maxlength="4"
            oninput="AT_SK_EDITOR._upSkTop('charEmoji',this.value)">
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Teks Prompt Pilihan</label>
        <input class="field-input" value="${e(sk.choicePrompt)}"
          oninput="AT_SK_EDITOR._upSkTop('choicePrompt',this.value)">
      </div>

      <div class="divider"></div>
      <div class="at-card-title">💬 Dialog Setup</div>
      <div id="skd_setup">${setupHtml}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px"
        onclick="AT_SK_EDITOR._addSetup()">＋ Tambah Dialog</button>

      <div class="divider"></div>
      <div class="at-card-title">🎯 Pilihan Jawaban</div>
      <div id="skd_choices">${choicesHtml}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:8px"
        onclick="AT_SK_EDITOR._addChoice()">＋ Tambah Pilihan</button>
    `;
  },

  _sk() {
    if (this._chIdx !== null) {
      return AT_STATE.modules[this._idx]?.chapters?.[this._chIdx];
    }
    return AT_STATE.skenario[this._idx];
  },

  _upSkTop(key, val) {
    const sk = this._sk(); if (!sk) return;
    sk[key] = val; AT_EDITOR.markDirty();
  },
  _upSk(arr, idx, key, val) {
    const sk = this._sk(); if (!sk || !sk[arr]) return;
    sk[arr][idx][key] = val; AT_EDITOR.markDirty();
  },
  _upCh(ci, key, val) {
    const sk = this._sk(); if (!sk?.choices?.[ci]) return;
    sk.choices[ci][key] = val; AT_EDITOR.markDirty();
  },
  _upCons(ci, ki, key, val) {
    const sk = this._sk();
    if (!sk?.choices?.[ci]?.consequences?.[ki]) return;
    sk.choices[ci].consequences[ki][key] = val; AT_EDITOR.markDirty();
  },
  _addCons(ci) {
    const sk = this._sk(); if (!sk?.choices?.[ci]) return;
    if (!sk.choices[ci].consequences) sk.choices[ci].consequences = [];
    sk.choices[ci].consequences.push({icon:"💡",text:""});
    AT_EDITOR.markDirty();
    this.open(this._idx);
  },
  _remCons(ci, ki) {
    const sk = this._sk();
    sk?.choices?.[ci]?.consequences?.splice(ki,1);
    AT_EDITOR.markDirty(); this.open(this._idx);
  },
  _rem(arr, idx) {
    const sk = this._sk(); if (!sk || !sk[arr]) return;
    sk[arr].splice(idx,1); AT_EDITOR.markDirty(); this.open(this._idx);
  },
  _addSetup() {
    const sk = this._sk(); if (!sk) return;
    if (!sk.setup) sk.setup = [];
    sk.setup.push({speaker:"NARRATOR",text:""});
    AT_EDITOR.markDirty(); this.open(this._idx);
  },
  _addChoice() {
    const sk = this._sk(); if (!sk) return;
    if (!sk.choices) sk.choices = [];
    sk.choices.push({icon:"💡",label:"",detail:"",good:false,pts:10,level:"mid",
      norma:"",resultTitle:"",resultBody:"",consequences:[{icon:"💡",text:""}]});
    AT_EDITOR.markDirty(); this.open(this._idx);
  }
};

// Patch AT_SKENARIO.openDetail to use AT_SK_EDITOR
AT_SKENARIO.openDetail = function(i) { AT_SK_EDITOR.open(i); };

/* ══════════════════════════════════════════════════════════════
   AT_FUNGSI_EDITOR — Edit tab Fungsi Norma
   ══════════════════════════════════════════════════════════════ */
window.AT_FUNGSI_EDITOR = {
  // Fungsi data lives in AT_STATE.fungsi (override PRESETS.fungsi)
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
    // Already bound via oninput — just close
    document.getElementById("fungsiModal")?.classList.remove("show");
    AT_EDITOR.markDirty();
    AT_SPLITVIEW.scheduleRefresh();
    AT_UTIL.toast("✅ Fungsi Norma disimpan");
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
            onclick="AT_FUNGSI_EDITOR._rem(${fi})">🗑️</button>
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
        onclick="AT_FUNGSI_EDITOR._add()">＋ Tambah Fungsi</button>`;
  },

  _up(fi, key, val) {
    const data = this._getData();
    if (!data[fi]) return;
    data[fi][key] = val;
    AT_EDITOR.markDirty();
  },
  _upContoh(fi, val) {
    const data = this._getData();
    if (!data[fi]) return;
    data[fi].contoh = val.split("\n").map(s => s.trim()).filter(Boolean);
    AT_EDITOR.markDirty();
  },
  _rem(fi) {
    const data = this._getData();
    data.splice(fi, 1);
    AT_EDITOR.markDirty(); this.open();
  },
  _add() {
    const data = this._getData();
    data.push({icon:"⭐",label:"Fungsi Baru",color:"var(--y)",
      bg:"rgba(249,193,46,.06)",bc:"rgba(249,193,46,.25)",
      desc:"Deskripsi fungsi norma ini.",
      contoh:["Contoh pertama","Contoh kedua"],
      tanya:"Pertanyaan diskusi untuk siswa?"});
    AT_EDITOR.markDirty(); this.open();
  }
};

/* ══════════════════════════════════════════════════════════════
   AT_JSON_IO — Import / Export state JSON
   ══════════════════════════════════════════════════════════════ */
window.AT_JSON_IO = {
  importClick() {
    document.getElementById("jsonImportInput")?.click();
  },

  handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.meta) throw new Error("Format tidak valid — file bukan state authoring tool");
        Object.assign(AT_STATE, data);
        AT_META.bind(); AT_CP.bind(); AT_TP.render();
        AT_ATP.bind(); AT_ALUR.render(); AT_KUIS.render();
        AT_SKENARIO.render();
        if (window.AT_MODULES) AT_MODULES.render();
        if (window.AT_GAMES) AT_GAMES.render();
        AT_DASH.render();
        AT_UNDO.push();
        AT_SPLITVIEW.scheduleRefresh();
        AT_UTIL.toast("✅ State JSON berhasil dimuat: " + file.name);
      } catch(err) {
        AT_UTIL.toast("❌ Gagal: " + err.message, "err");
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
  // Inject fungsi override into S before building
  const patchedS = Object.assign({}, S);
  if (S.fungsi && S.fungsi.length) {
    // preview.js reads from PRESETS.fungsi — override it temporarily
    const origFungsi = PRESETS.fungsi;
    PRESETS.fungsi = S.fungsi;
    const html = _origBuild(patchedS);
    PRESETS.fungsi = origFungsi;
    return html;
  }
  return _origBuild(patchedS);
};

/* ══════════════════════════════════════════════════════════════
   UNDO/REDO BUTTONS in sidebar bottom
   ══════════════════════════════════════════════════════════════ */
function _injectUndoButtons() {
  const sb = document.querySelector(".sidebar-bottom");
  if (!sb || document.getElementById("undoBtn")) return;

  const row = document.createElement("div");
  row.style.cssText = "display:flex;gap:6px;margin-bottom:6px";
  row.innerHTML = [
    `<button id="undoBtn" class="sidebar-bottom-btn" style="flex:1;opacity:.5" disabled onclick="AT_UNDO.undo()" title="Ctrl+Z">↩ Undo</button>`,
    `<button id="redoBtn" class="sidebar-bottom-btn" style="flex:1;opacity:.5" disabled onclick="AT_UNDO.redo()" title="Ctrl+Y">↪ Redo</button>`
  ].join("");
  sb.insertBefore(row, sb.firstChild);
}

/* ══════════════════════════════════════════════════════════════
   CLOSE MODALS on overlay click
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
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  _injectUndoButtons();
  _initModalClose();
  AT_UNDO.init();

  // Add split-view refresh on panel change
  const _origNav = AT_NAV.go.bind(AT_NAV);
  AT_NAV.go = function(id) {
    _origNav(id);
    AT_SPLITVIEW.scheduleRefresh();
  };

  // Add fungsi to AT_STATE if missing
  if (!AT_STATE.fungsi) AT_STATE.fungsi = null; // null = use PRESETS.fungsi

  // Undo buttons style
  const udBtns = document.querySelectorAll("#undoBtn,#redoBtn");
  udBtns.forEach(b => {
    b.addEventListener("mouseenter", () => b.style.opacity = b.disabled ? ".5" : "1");
    b.addEventListener("mouseleave", () => b.style.opacity = b.disabled ? ".5" : "1");
  });

  console.log("✅ liveview.js loaded — split-view, undo/redo, sk-editor, fungsi-editor, json-io ready");
});
