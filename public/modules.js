/* ══════════════════════════════════════════════════════════════
   AT_MODULES — Controller utama panel Modul Pembelajaran
   ══════════════════════════════════════════════════════════════ */
window.AT_MODULES = {

  // AT_STATE.modules = [{ type, ...data }]
  // Inisialisasi state jika belum ada
  ensureState() {
    if (!AT_STATE.modules) AT_STATE.modules = [];
  },

  // ── RENDER DAFTAR MODUL ─────────────────────────────────────
  render() {
    this.ensureState();
    const cont = document.getElementById("mod_list");
    if (!cont) return;
    const mods = AT_STATE.modules;

    if (!mods.length) {
      cont.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🧩</div>
          <div class="empty-state-text">Belum ada modul.<br>Klik "+ Tambah Modul" atau pilih preset di bawah.</div>
        </div>`;
      return;
    }

    cont.innerHTML = mods.map((m, i) => {
      const T = MODULE_TYPES[m.type] || { icon:"📦", label:m.type, color:"var(--muted)" };
      return `
      <div class="mod-card" id="mod_card_${i}" draggable="true" data-idx="${i}">
        <div class="mod-card-header">
          <span class="drag-handle" title="Drag untuk urutkan">⠿</span>
          <span class="mod-type-badge" style="background:${T.color}22;color:${T.color};border:1px solid ${T.color}44">
            ${T.icon} ${T.label}
          </span>
          <span class="mod-card-title">${m.title || "(tanpa judul)"}</span>
          <div class="mod-card-actions">
            <button class="icon-btn" onclick="AT_MODULES.moveUp(${i})" title="Naik">↑</button>
            <button class="icon-btn" onclick="AT_MODULES.moveDown(${i})" title="Turun">↓</button>
            <button class="icon-btn edit" onclick="AT_MODULES.openEditor(${i})" title="Edit">✏️</button>
            <button class="icon-btn del" onclick="AT_MODULES.delete(${i})" title="Hapus">🗑️</button>
          </div>
        </div>
        <div class="mod-card-preview">${this._miniPreview(m)}</div>
      </div>`;
    }).join("");

    this._initDrag(cont);
  },

  // ── DRAG-DROP REORDER ────────────────────────────────────────
  _dragSrc: null,

  _initDrag(cont) {
    let dragSrcIdx = null;

    cont.querySelectorAll(".mod-card").forEach(card => {
      card.addEventListener("dragstart", e => {
        dragSrcIdx = +card.dataset.idx;
        card.style.opacity = "0.4";
        e.dataTransfer.effectAllowed = "move";
      });

      card.addEventListener("dragend", () => {
        card.style.opacity = "";
        cont.querySelectorAll(".mod-card").forEach(c => c.classList.remove("drag-over"));
      });

      card.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        cont.querySelectorAll(".mod-card").forEach(c => c.classList.remove("drag-over"));
        card.classList.add("drag-over");
      });

      card.addEventListener("dragleave", () => {
        card.classList.remove("drag-over");
      });

      card.addEventListener("drop", e => {
        e.preventDefault();
        const destIdx = +card.dataset.idx;
        if (dragSrcIdx === null || dragSrcIdx === destIdx) return;
        // Reorder state array
        const mods = AT_STATE.modules;
        const [moved] = mods.splice(dragSrcIdx, 1);
        mods.splice(destIdx, 0, moved);
        dragSrcIdx = null;
        AT_EDITOR.markDirty();
        AT_SPLITVIEW?.scheduleRefresh?.();
        this.render();
        AT_UTIL.toast("↕️ Urutan modul diperbarui");
      });
    });
  },

  _miniPreview(m) {
    if (m._isGame && window.AT_GAMES) return AT_GAMES._preview(m);

    // Helper: potong URL agar tidak overflow card
    const shortUrl = u => {
      if (!u) return '<em style="color:var(--r)">URL belum diisi</em>';
      try { const p = new URL(u); return p.hostname + (p.pathname.length > 20 ? p.pathname.slice(0,20)+"…" : p.pathname); }
      catch { return u.slice(0,40) + (u.length>40?"…":""); }
    };
    // Helper: preview teks singkat
    const tx = (t, n=55) => t ? (t.length>n ? t.slice(0,n)+"…" : t) : "";

    switch(m.type) {
      case "skenario":    return `<span>🎬 ${(m.chapters||[]).length} chapter · ${(m.chapters||[]).reduce((s,c)=>s+(c.choices?.length||0),0)} pilihan total</span>`;
      case "video":       return `<span>🔗 ${shortUrl(m.url)} · ${m.durasi||"durasi?"} · ${m.pertanyaan?.length||0} pertanyaan refleksi</span>`;
      case "infografis":  return `<span>🃏 ${m.kartu?.length||0} kartu · Layout: ${m.layout||"grid"}${m.intro?" · "+tx(m.intro,30):""}</span>`;
      case "flashcard":   return `<span>🃏 ${m.kartu?.length||0} kartu${m.kartu?.length ? " · "+tx(m.kartu[0]?.depan,35) : " — tambah kartu dulu"}</span>`;
      case "studi-kasus": return `<span>📰 ${m.pertanyaan?.length||0} pertanyaan${m.sumber?" · "+tx(m.sumber,30):" · sumber belum diisi"}</span>`;
      case "debat":       return `<span>🗣️ ${tx(m.pertanyaan,60)||"mosi belum diisi"} · ${m.pihakA?.label||"Pro"} vs ${m.pihakB?.label||"Kontra"}</span>`;
      case "timeline":    return `<span>📅 ${m.events?.length||0} peristiwa${m.events?.length ? " · "+tx(m.events[0]?.judul,30) : ""}</span>`;
      case "matching":    return `<span>🔀 ${m.pasangan?.length||0} pasangan${m.pasangan?.length ? " · "+tx(m.pasangan[0]?.kiri,25)+" ↔ "+tx(m.pasangan[0]?.kanan,25) : ""}</span>`;
      case "materi":      return `<span>📖 ${m.blok?.length||0} blok${m.blok?.length ? " · "+m.blok.map(b=>b.tipe||"?").join(", ").slice(0,40) : " — tambah blok konten"}</span>`;
      case "hero":        return `<span>🖼️ Tema: ${m.gradient||"sunset"}${m.chips?.length?" · "+m.chips.slice(0,3).join(", "):""}</span>`;
      case "kutipan":     return `<span>💬 "${tx(m.teks,50)}" ${m.sumber?"— "+tx(m.sumber,25):""}</span>`;
      case "langkah":     return `<span>👣 ${m.langkah?.length||0} langkah · Gaya: ${m.style||"numbered"}${m.langkah?.length?" · "+tx(m.langkah[0]?.judul,30):""}</span>`;
      case "accordion":   return `<span>🗂️ ${m.items?.length||0} item${m.items?.length?" · "+tx(m.items[0]?.judul,35):""}</span>`;
      case "statistik":   return `<span>📊 ${m.items?.length||0} data · ${m.layout||"grid"}${m.items?.length?" · "+m.items.slice(0,2).map(it=>it.angka+" "+it.satuan).join(", "):""}</span>`;
      case "polling":     return `<span>📊 ${m.opsi?.length||0} opsi${m.opsi?.length?" · "+tx(m.opsi[0]?.teks,40):""}</span>`;
      case "embed":       return `<span>🔗 ${shortUrl(m.url)}${m.tinggi?" · tinggi "+m.tinggi+"px":""}</span>`;
      default:            return `<span style="color:var(--muted)">${m.type}</span>`;
    }
  },

  // ── TAMBAH MODUL BARU ────────────────────────────────────────
  add(typeId) {
    this.ensureState();
    const T = MODULE_TYPES[typeId];
    if (!T) return;
    const data = T.defaultData();
    AT_STATE.modules.push(data);
    this.render();
    AT_EDITOR.markDirty();
    AT_UTIL.toast(`✅ Modul "${T.label}" ditambahkan`);
    // Langsung buka editor modul baru
    setTimeout(() => this.openEditor(AT_STATE.modules.length - 1), 200);
    document.getElementById("modPickerModal").classList.remove("show");
  },

  delete(i) {
    const name = AT_STATE.modules[i]?.title || "modul";
    if (!confirm(`Hapus "${name}"?`)) return;
    AT_STATE.modules.splice(i, 1);
    this.render();
    AT_EDITOR.markDirty();
    AT_UTIL.toast("🗑️ Modul dihapus");
  },

  moveUp(i) {
    if (i === 0) return;
    [AT_STATE.modules[i-1], AT_STATE.modules[i]] = [AT_STATE.modules[i], AT_STATE.modules[i-1]];
    this.render();
    AT_EDITOR.markDirty();
  },

  moveDown(i) {
    const mods = AT_STATE.modules;
    if (i >= mods.length - 1) return;
    [mods[i], mods[i+1]] = [mods[i+1], mods[i]];
    this.render();
    AT_EDITOR.markDirty();
  },

  // ── MODAL PICKER (bertab: Modul | Game) ─────────────────────
  _pickerTab: "modul",

  showPicker() {
    const modal = document.getElementById("modPickerModal");
    if (!modal) return;
    this._renderPickerTab(this._pickerTab);
    modal.classList.add("show");
  },

  _renderPickerTab(tab) {
    this._pickerTab = tab;
    const grid   = document.getElementById("modPickerGrid");
    const tabMod = document.getElementById("modPickerTabMod");
    const tabGame= document.getElementById("modPickerTabGame");
    if (!grid) return;

    if (tabMod)  tabMod.classList.toggle("active",  tab === "modul");
    if (tabGame) tabGame.classList.toggle("active", tab === "game");

    if (tab === "modul") {
      grid.innerHTML = Object.values(MODULE_TYPES).map(T => `
        <div class="mod-type-card" onclick="AT_MODULES.add('${T.id}')">
          <div class="mod-type-card-icon">${T.icon}</div>
          <div class="mod-type-card-label">${T.label}</div>
          <div class="mod-type-card-desc">${T.desc}</div>
        </div>`).join("");
    } else {
      grid.innerHTML = window.GAME_TYPES
        ? Object.values(GAME_TYPES).map(T => `
            <div class="mod-type-card" onclick="AT_MODULES.addGame('${T.id}')">
              <div class="mod-type-card-icon">${T.icon}</div>
              <div class="mod-type-card-label">${T.label}</div>
              <div class="mod-type-card-desc">${T.desc}</div>
            </div>`).join("")
        : `<div style="color:var(--muted);padding:20px;grid-column:1/-1;text-align:center">Game belum tersedia.</div>`;
    }
  },

  // Add a game as a module block
  addGame(typeId) {
    if (!window.GAME_TYPES || !GAME_TYPES[typeId]) return;
    this.ensureState();
    const T = GAME_TYPES[typeId];
    const gameData = T.defaultData();
    // Wrap game data with type marker for renderer
    AT_STATE.modules.push(Object.assign({ _isGame: true }, gameData));
    this.render();
    AT_UTIL.toast('✅ Game ditambahkan ke Modul: ' + T.label);
    document.getElementById("modPickerModal")?.classList.remove("show");
    // Open editor for the new game
    const newIdx = AT_STATE.modules.length - 1;
    setTimeout(() => this.openEditor(newIdx), 200);
  },

  hidePicker() {
    document.getElementById("modPickerModal")?.classList.remove("show");
  },

  // ── EDITOR MODAL (detail per modul) ──────────────────────────
  _editIdx: null,

  openEditor(i) {
    this._editIdx = i;
    const m = AT_STATE.modules[i];
    if (!m) return;
    const T = MODULE_TYPES[m.type];
    const modal = document.getElementById("modEditorModal");
    const title = document.getElementById("modEditorTitle");
    const body  = document.getElementById("modEditorBody");
    if (!modal || !body) return;

    title.textContent = `${T?.icon||""} Edit: ${T?.label||m.type}`;
    body.innerHTML = this._buildEditorForm(m, i);
    modal.classList.add("show");

    // Bind all inputs
    this._bindEditorForm(m, i);

    // Render live preview pane immediately
    setTimeout(() => this.refreshPreview(), 50);
  },

  closeEditor() {
    document.getElementById("modEditorModal")?.classList.remove("show");
    this._editIdx = null;
    this.render();
  },

  // ── FORM BUILDER BY TYPE ─────────────────────────────────────
  _buildEditorForm(m, idx) {
    const i = idx;
    // If this is a game module, use AT_GAMES editor
    if (m._isGame && window.AT_GAMES) {
      // Store game index mapping
      AT_GAMES._editIdx = idx;
      AT_GAMES._editFromModule = true;
      return AT_GAMES._buildForm(m, idx);
    }
    switch(m.type) {

      // ── SKENARIO (multi-chapter) ──
      case "skenario": {
        const chs = m.chapters || [];
        const chaptersHtml = chs.map((ch,ci) => `
          <div class="sub-item" id="skm_ch${ci}">
            <div class="list-item-header">
              <span class="drag-handle">⠿</span>
              <div class="list-item-num" style="background:rgba(251,146,60,.15);color:var(--o)">${ci+1}</div>
              <span class="list-item-label">${ch.title||"Skenario "+(ci+1)}</span>
              <div class="list-item-actions">
                <button class="icon-btn edit" onclick="AT_SK_EDITOR.open(${idx},${ci})">✏️</button>
                <button class="icon-btn del" onclick="AT_MODULES._delChapter(${idx},${ci})">🗑️</button>
              </div>
            </div>
            <div style="font-size:.73rem;color:var(--muted);padding:0 0 4px 4px">
              Latar: ${ch.bg||"-"} · ${ch.setup?.length||0} dialog · ${ch.choices?.length||0} pilihan
            </div>
          </div>`).join("");

        return `
        <div class="field-group"><label class="field-label">Judul Modul Skenario</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}"></div>
        <div class="divider"></div>
        <div class="at-card-title">🎭 Daftar Chapter / Skenario</div>
        <div id="skm_chapters">${chaptersHtml || '<div class="empty-state" style="padding:16px"><div class="empty-state-text">Belum ada chapter.</div></div>'}</div>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn btn-y btn-sm" onclick="AT_MODULES._addChapter(${idx})">＋ Tambah Chapter</button>
        </div>`;
      }
      // ── VIDEO ──
      case "video": return `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">URL Video</label>
          <input class="field-input" id="me_url" value="${esc(m.url||"")}" placeholder="https://youtube.com/watch?v=...">
          <div style="font-size:.71rem;color:var(--muted);margin-top:4px">YouTube: paste link biasa. Google Drive: link share. URL lain: link langsung.</div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Platform</label>
            <select class="field-select" id="me_platform">
              <option value="youtube"${m.platform==="youtube"?" selected":""}>YouTube</option>
              <option value="drive"${m.platform==="drive"?" selected":""}>Google Drive</option>
              <option value="url"${m.platform==="url"?" selected":""}>URL Langsung</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Durasi</label>
            <input class="field-input" id="me_durasi" value="${esc(m.durasi||"")}" placeholder="5 menit">
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Instruksi untuk Siswa</label>
          <textarea class="field-textarea" id="me_instruksi" rows="2">${esc(m.instruksi||"")}</textarea>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">❓ Pertanyaan Refleksi</div>
        <div id="me_pertanyaanList">${(m.pertanyaan||[]).map((p,pi)=>`
          <div class="sub-item" id="me_prt_${pi}">
            <input class="field-input" value="${esc(p.teks||"")}" placeholder="Pertanyaan refleksi…" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'teks',this.value)">
            <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
              <label style="font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:5px">
                <input type="checkbox" ${p.wajib?"checked":""} onchange="AT_MODULES._updateDeep('pertanyaan',${pi},'wajib',this.checked)"> Wajib dijawab
              </label>
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('pertanyaan',${pi})">🗑️</button>
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('pertanyaan',{teks:'',wajib:false})">＋ Tambah Pertanyaan</button>
      `;

      // ── INFOGRAFIS ──
      case "infografis": return `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Layout</label>
            <select class="field-select" id="me_layout">
              <option value="grid"${m.layout==="grid"?" selected":""}>Grid (kotak-kotak)</option>
              <option value="list"${m.layout==="list"?" selected":""}>List (berurutan)</option>
              <option value="timeline"${m.layout==="timeline"?" selected":""}>Timeline</option>
            </select>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Teks Intro</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🃏 Kartu Konsep</div>
        <div id="me_kartuList">${(m.kartu||[]).map((k,ki)=>`
          <div class="sub-item" id="me_kartu_${ki}">
            <div class="field-row" style="margin-bottom:6px">
              <input class="field-input" value="${esc(k.icon||"📌")}" maxlength="4" style="width:52px;flex-shrink:0" placeholder="🎯" oninput="AT_MODULES._updateDeep('kartu',${ki},'icon',this.value)">
              <input class="field-input" value="${esc(k.judul||"")}" placeholder="Judul kartu" oninput="AT_MODULES._updateDeep('kartu',${ki},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('kartu',${ki})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="2" placeholder="Isi kartu…" oninput="AT_MODULES._updateDeep('kartu',${ki},'isi',this.value)">${esc(k.isi||"")}</textarea>
            <div style="display:flex;gap:6px;margin-top:5px;align-items:center">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>
                `<div onclick="AT_MODULES._updateDeep('kartu',${ki},'color','${col}')" style="width:18px;height:18px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${k.color===col?"#fff":"transparent"}"></div>`
              ).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('kartu',{icon:'📌',judul:'',isi:'',color:'var(--y)'})">＋ Tambah Kartu</button>
      `;

      // ── FLASHCARD ──
      case "flashcard": return `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Instruksi</label>
          <input class="field-input" id="me_instruksi" value="${esc(m.instruksi||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🃏 Kartu (Depan ↔ Belakang)</div>
        <div id="me_kartuList">${(m.kartu||[]).map((k,ki)=>`
          <div class="sub-item" id="me_kartu_${ki}">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">Depan (pertanyaan/istilah)</label>
                <input class="field-input" value="${esc(k.depan||"")}" oninput="AT_MODULES._updateDeep('kartu',${ki},'depan',this.value)">
              </div>
              <div class="field-group">
                <label class="field-label">Belakang (jawaban/definisi)</label>
                <input class="field-input" value="${esc(k.belakang||"")}" oninput="AT_MODULES._updateDeep('kartu',${ki},'belakang',this.value)">
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('kartu',${ki})">🗑️</button>
            </div>
            <input class="field-input" value="${esc(k.hint||"")}" placeholder="Hint (opsional)…" style="margin-top:5px" oninput="AT_MODULES._updateDeep('kartu',${ki},'hint',this.value)">
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('kartu',{depan:'',belakang:'',hint:''})">＋ Tambah Kartu</button>
      `;

      // ── STUDI KASUS ──
      case "studi-kasus": return `
        <div class="field-group">
          <label class="field-label">Judul Kasus</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Narasi / Teks Kasus</label>
          <textarea class="field-textarea" id="me_teks" rows="6">${esc(m.teks||"")}</textarea>
        </div>
        <div class="field-group">
          <label class="field-label">Sumber (opsional)</label>
          <input class="field-input" id="me_sumber" value="${esc(m.sumber||"")}" placeholder="Kompas, 2024">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">❓ Pertanyaan Analisis</div>
        <div id="me_pertanyaanList">${(m.pertanyaan||[]).map((p,pi)=>`
          <div class="sub-item" id="me_prt_${pi}">
            <div class="field-row">
              <div class="field-group" style="flex:0 0 80px">
                <label class="field-label">Level</label>
                <select class="field-select" onchange="AT_MODULES._updateDeep('pertanyaan',${pi},'level',this.value)">
                  ${["C1","C2","C3","C4","C5","C6"].map(l=>`<option value="${l}"${p.level===l?" selected":""}>${l}</option>`).join("")}
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Label</label>
                <input class="field-input" value="${esc(p.label||"")}" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'label',this.value)">
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('pertanyaan',${pi})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'teks',this.value)">${esc(p.teks||"")}</textarea>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('pertanyaan',{level:'C1',icon:'🔍',label:'',teks:''})">＋ Tambah Pertanyaan</button>
      `;

      // ── DEBAT ──
      case "debat": return `
        <div class="field-group">
          <label class="field-label">Judul Debat</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Pertanyaan Debat / Mosi</label>
          <textarea class="field-textarea" id="me_pertanyaan" rows="2">${esc(m.pertanyaan||"")}</textarea>
        </div>
        <div class="field-group">
          <label class="field-label">Konteks / Latar Belakang</label>
          <textarea class="field-textarea" id="me_konteks" rows="2">${esc(m.konteks||"")}</textarea>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Label Pihak Pro ✅</label>
            <input class="field-input" id="me_labelA" value="${esc(m.pihakA?.label||"Pro / Setuju")}">
          </div>
          <div class="field-group">
            <label class="field-label">Label Pihak Kontra ❌</label>
            <input class="field-input" id="me_labelB" value="${esc(m.pihakB?.label||"Kontra / Tidak Setuju")}">
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Prompt Kesimpulan</label>
          <input class="field-input" id="me_kesimpulan" value="${esc(m.kesimpulan_prompt||"")}">
        </div>
      `;

      // ── TIMELINE ──
      case "timeline": return `
        <div class="field-group">
          <label class="field-label">Judul Timeline</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Teks Intro</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">📅 Peristiwa / Event</div>
        <div id="me_eventList">${(m.events||[]).map((e,ei)=>`
          <div class="sub-item" id="me_ev_${ei}">
            <div class="field-row">
              ${AT_MODULES.emojiBtn(e.icon||"📌", `AT_MODULES._updateDeep('events',${ei},'icon',v)`)}
              <input class="field-input" value="${esc(e.tahun||"")}" placeholder="Tahun/Tanggal" style="width:110px;flex-shrink:0" oninput="AT_MODULES._updateDeep('events',${ei},'tahun',this.value)">
              <input class="field-input" value="${esc(e.judul||"")}" placeholder="Judul peristiwa" oninput="AT_MODULES._updateDeep('events',${ei},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('events',${ei})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Deskripsi peristiwa…" oninput="AT_MODULES._updateDeep('events',${ei},'isi',this.value)">${esc(e.isi||"")}</textarea>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('events',{icon:'📌',tahun:'',judul:'',isi:''})">＋ Tambah Peristiwa</button>
      `;

      // ── MATCHING ──
      case "matching": return `
        <div class="field-group">
          <label class="field-label">Judul Game</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Instruksi</label>
          <input class="field-input" id="me_instruksi" value="${esc(m.instruksi||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🔀 Pasangan (Kiri ↔ Kanan)</div>
        <div id="me_pasanganList">${(m.pasangan||[]).map((p,pi)=>`
          <div class="sub-item" id="me_pas_${pi}">
            <div class="field-row">
              <input class="field-input" value="${esc(p.kiri||"")}" placeholder="Kiri (istilah/soal)" oninput="AT_MODULES._updateDeep('pasangan',${pi},'kiri',this.value)">
              <span style="color:var(--muted);padding:0 4px;align-self:center">↔</span>
              <input class="field-input" value="${esc(p.kanan||"")}" placeholder="Kanan (definisi/jawaban)" oninput="AT_MODULES._updateDeep('pasangan',${pi},'kanan',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('pasangan',${pi})">🗑️</button>
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('pasangan',{kiri:'',kanan:''})">＋ Tambah Pasangan</button>
      `;

      // ── MATERI ──
      case "materi": return `
        <div class="field-group">
          <label class="field-label">Judul Materi</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Teks Pembuka (opsional)</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">📦 Blok Konten</div>
        <div id="me_blokList">${(m.blok||[]).map((b,bi)=>this._blokEditorRow(b,bi)).join("")}</div>
        <div class="btn-row" style="margin-top:8px">
          <button class="btn btn-ghost btn-sm" onclick="AT_MODULES._addDeep('blok',{tipe:'penjelasan',judul:'',isi:''})">＋ Penjelasan</button>
          <button class="btn btn-ghost btn-sm" onclick="AT_MODULES._addDeep('blok',{tipe:'definisi',judul:'',isi:''})">＋ Definisi</button>
          <button class="btn btn-ghost btn-sm" onclick="AT_MODULES._addDeep('blok',{tipe:'poin',judul:'',butir:['']})">＋ Poin-Poin</button>
        </div>
      `;

      // ── HERO BANNER ──
      case "hero": {
        const gradOpts = ["sunset","ocean","forest","royal","fire","aurora"].map(g=>
          `<option value="${g}"${m.gradient===g?" selected":""}>${g}</option>`).join("");
        return `
        <div class="field-group">
          <label class="field-label">Judul Utama</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Subjudul / Deskripsi</label>
          <textarea class="field-textarea" rows="2" id="me_teks">${esc(m.subjudul||"")}</textarea>
        </div>
        <div class="field-row">
          <div class="field-group" style="flex:0 0 80px">
            <label class="field-label">Ikon/Emoji</label>
            <input class="field-input" id="me_ikon" value="${esc(m.ikon||"📚")}" maxlength="4" placeholder="📚">
          </div>
          <div class="field-group">
            <label class="field-label">Tema Warna</label>
            <select class="field-select" id="me_gradient">${gradOpts}</select>
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Label CTA (tombol, biarkan kosong jika tidak mau)</label>
          <input class="field-input" id="me_cta" value="${esc(m.cta||"")}" placeholder="Mulai Belajar">
        </div>
        <div class="field-group">
          <label class="field-label">Chips / Badge (pisahkan dengan koma)</label>
          <input class="field-input" id="me_chips" value="${esc((m.chips||[]).join(", "))}" placeholder="PPKn, Kelas VII, 2×40 menit">
        </div>`;
      }

      // ── KUTIPAN ──
      case "kutipan": {
        const styleOpts = ["card","big","minimal"].map(s=>
          `<option value="${s}"${m.style===s?" selected":""}>${s}</option>`).join("");
        const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(col=>
          `<div onclick="AT_MODULES._upField('warna','${col}')" style="width:22px;height:22px;border-radius:50%;background:${col};cursor:pointer;border:3px solid ${(m.warna||"var(--p)")===col?"#fff":"transparent"};transition:border .15s;flex-shrink:0"></div>`
        ).join("");
        return `
        <div class="field-group">
          <label class="field-label">Teks Kutipan</label>
          <textarea class="field-textarea" rows="3" id="me_teks">${esc(m.teks||"")}</textarea>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Sumber / Nama Tokoh</label>
            <input class="field-input" id="me_sumber" value="${esc(m.sumber||"")}">
          </div>
          <div class="field-group">
            <label class="field-label">Jabatan / Keterangan</label>
            <input class="field-input" id="me_jabatan" value="${esc(m.jabatan||"")}">
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Gaya Tampilan</label>
            <select class="field-select" id="me_style">${styleOpts}</select>
          </div>
          <div class="field-group">
            <label class="field-label">Warna Aksen</label>
            <div style="display:flex;gap:7px;align-items:center;margin-top:8px">${colorOpts}</div>
          </div>
        </div>`;
      }

      // ── LANGKAH ──
      case "langkah": {
        const styleOpts = ["numbered","bubble","arrow"].map(s=>
          `<option value="${s}"${m.style===s?" selected":""}>${s}</option>`).join("");
        const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
        return `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Teks Intro</label>
            <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
          </div>
          <div class="field-group" style="flex:0 0 150px">
            <label class="field-label">Gaya</label>
            <select class="field-select" id="me_style">${styleOpts}</select>
          </div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">👣 Daftar Langkah</div>
        <div id="me_langkahList">${(m.langkah||[]).map((l,li)=>`
          <div class="sub-item" id="me_lk_${li}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(l.icon||"✅", `AT_MODULES._updateDeep('langkah',${li},'icon',v)`)}
              <input class="field-input" value="${esc(l.judul||"")}" placeholder="Judul langkah" oninput="AT_MODULES._updateDeep('langkah',${li},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('langkah',${li})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="2" placeholder="Penjelasan langkah…" oninput="AT_MODULES._updateDeep('langkah',${li},'isi',this.value)">${esc(l.isi||"")}</textarea>
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('langkah',${li},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(l.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('langkah',{icon:'✅',judul:'',isi:'',warna:'var(--y)'})">＋ Tambah Langkah</button>`;
      }

      // ── ACCORDION ──
      case "accordion": return `
        <div class="field-group">
          <label class="field-label">Judul Section</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Teks Intro (opsional)</label>
          <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🗂️ Item Accordion</div>
        <div id="me_accordionList">${(m.items||[]).map((it,ii)=>`
          <div class="sub-item" id="me_acc_${ii}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(it.icon||"❓", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
              <input class="field-input" value="${esc(it.judul||"")}" placeholder="Pertanyaan / Judul" oninput="AT_MODULES._updateDeep('items',${ii},'judul',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
            </div>
            <textarea class="field-textarea" rows="3" placeholder="Isi / Jawaban…" oninput="AT_MODULES._updateDeep('items',${ii},'isi',this.value)">${esc(it.isi||"")}</textarea>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('items',{icon:'❓',judul:'',isi:''})">＋ Tambah Item</button>
      `;

      // ── STATISTIK ──
      case "statistik": {
        const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
        return `
        <div class="field-group">
          <label class="field-label">Judul Section</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Teks Pembuka</label>
            <input class="field-input" id="me_intro" value="${esc(m.intro||"")}">
          </div>
          <div class="field-group" style="flex:0 0 130px">
            <label class="field-label">Layout</label>
            <select class="field-select" id="me_layout">
              <option value="grid"${m.layout==="grid"?" selected":""}>Grid</option>
              <option value="row"${m.layout==="row"?" selected":""}>Baris</option>
            </select>
          </div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">📊 Data / Angka</div>
        <div id="me_statList">${(m.items||[]).map((it,ii)=>`
          <div class="sub-item" id="me_st_${ii}">
            <div class="field-row" style="margin-bottom:5px">
              ${AT_MODULES.emojiBtn(it.icon||"📊", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
              <input class="field-input" value="${esc(it.angka||"")}" placeholder="Angka (mis: 4)" style="width:80px;flex-shrink:0;font-weight:800" oninput="AT_MODULES._updateDeep('items',${ii},'angka',this.value)">
              <input class="field-input" value="${esc(it.satuan||"")}" placeholder="Satuan" style="width:90px;flex-shrink:0" oninput="AT_MODULES._updateDeep('items',${ii},'satuan',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
            </div>
            <div class="field-row">
              <input class="field-input" value="${esc(it.label||"")}" placeholder="Label/deskripsi angka" oninput="AT_MODULES._updateDeep('items',${ii},'label',this.value)">
            </div>
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('items',${ii},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(it.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('items',{icon:'📊',angka:'',satuan:'',label:'',warna:'var(--y)'})">＋ Tambah Data</button>`;
      }

      // ── POLLING ──
      case "polling": {
        const colorOpts = ["var(--g)","var(--y)","var(--r)","var(--c)","var(--p)","var(--o)"];
        return `
        <div class="field-group">
          <label class="field-label">Pertanyaan Polling</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">Instruksi untuk Siswa</label>
          <input class="field-input" id="me_instruksi" value="${esc(m.instruksi||"")}">
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Tipe Jawaban</label>
            <select class="field-select" id="me_tipe">
              <option value="single"${m.tipe==="single"?" selected":""}>Pilih Satu (single)</option>
              <option value="multiple"${m.tipe==="multiple"?" selected":""}>Boleh Pilih Banyak (multiple)</option>
            </select>
          </div>
          <div class="field-group" style="flex:0 0 160px">
            <label class="field-label">Mode</label>
            <label style="display:flex;align-items:center;gap:8px;margin-top:10px;font-size:.8rem">
              <input type="checkbox" id="me_anonim" ${m.anonim?"checked":""} onchange="AT_STATE.modules[AT_MODULES._editIdx].anonim=this.checked;AT_EDITOR.markDirty()"> Jawaban anonim
            </label>
          </div>
        </div>
        <div class="divider"></div>
        <div class="at-card-title">🗳️ Opsi Pilihan</div>
        <div id="me_opsiList">${(m.opsi||[]).map((o,oi)=>`
          <div class="sub-item" id="me_opsi_${oi}">
            <div class="field-row">
              ${AT_MODULES.emojiBtn(o.icon||"✅", `AT_MODULES._updateDeep('opsi',${oi},'icon',v)`)}
              <input class="field-input" value="${esc(o.teks||"")}" placeholder="Teks opsi…" oninput="AT_MODULES._updateDeep('opsi',${oi},'teks',this.value)">
              <button class="icon-btn del" onclick="AT_MODULES._removeDeep('opsi',${oi})">🗑️</button>
            </div>
            <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
              <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
              ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('opsi',${oi},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(o.warna||"var(--g)")===col?"#fff":"transparent"}"></div>`).join("")}
            </div>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="AT_MODULES._addDeep('opsi',{icon:'💬',teks:'',warna:'var(--c)'})">＋ Tambah Opsi</button>`;
      }

      // ── EMBED / iFRAME ──
      case "embed": return `
        <div class="field-group">
          <label class="field-label">Judul / Nama Konten</label>
          <input class="field-input" id="me_title" value="${esc(m.title||"")}">
        </div>
        <div class="field-group">
          <label class="field-label">URL Embed</label>
          <input class="field-input" id="me_url" value="${esc(m.url||"")}" placeholder="https://www.canva.com/design/…/view atau Google Slides share link">
          <div style="font-size:.71rem;color:var(--muted);margin-top:4px">
            💡 Canva: klik Share → Embed → salin link. Google Slides: File → Publish → Embed → salin src. Padlet: Share → Embed.
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Tinggi Frame (px)</label>
            <input class="field-input" id="me_tinggi" type="number" value="${m.tinggi||420}" min="200" max="900" style="width:120px">
          </div>
          <div class="field-group">
            <label class="field-label">Label Tombol Buka</label>
            <input class="field-input" id="me_label" value="${esc(m.label||"Buka di tab baru")}" placeholder="Buka di tab baru">
          </div>
        </div>`;

      default: return `<p style="color:var(--muted)">Tipe modul "${m.type}" belum ada editor khusus.</p>`;
    }
  },

  _blokEditorRow(b, bi) {
    if (b.tipe === "poin") {
      return `
      <div class="sub-item" id="me_blok_${bi}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span class="chip chip-p" style="font-size:.68rem">POIN</span>
          <input class="field-input" value="${esc(b.judul||"")}" placeholder="Judul bagian poin" style="flex:1" oninput="AT_MODULES._updateDeep('blok',${bi},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('blok',${bi})">🗑️</button>
        </div>
        <div id="me_butir_${bi}">${(b.butir||[]).map((bt,bti)=>`
          <div style="display:flex;gap:6px;margin-bottom:5px">
            <span style="color:var(--y);font-weight:900;padding-top:6px">•</span>
            <input class="field-input" value="${esc(bt)}" placeholder="Poin…" oninput="AT_MODULES._updateButir(${bi},${bti},this.value)">
            <button class="icon-btn del" onclick="AT_MODULES._removeButir(${bi},${bti})">×</button>
          </div>`).join("")}
        </div>
        <button class="btn btn-ghost btn-xs" style="margin-top:4px" onclick="AT_MODULES._addButir(${bi})">＋ Poin</button>
      </div>`;
    }
    const warna = b.tipe === "definisi" ? "chip-y" : "chip-muted";
    return `
    <div class="sub-item" id="me_blok_${bi}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span class="chip ${warna}" style="font-size:.68rem">${b.tipe.toUpperCase()}</span>
        <input class="field-input" value="${esc(b.judul||"")}" placeholder="Judul bagian" style="flex:1" oninput="AT_MODULES._updateDeep('blok',${bi},'judul',this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeDeep('blok',${bi})">🗑️</button>
      </div>
      <textarea class="field-textarea" rows="3" placeholder="Isi konten…" oninput="AT_MODULES._updateDeep('blok',${bi},'isi',this.value)">${esc(b.isi||"")}</textarea>
    </div>`;
  },

  // ── HELPERS UPDATE NESTED ─────────────────────────────────────
  _updateDeep(key, idx, field, val) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m || !m[key]) return;
    m[key][idx][field] = val;
    AT_EDITOR.markDirty();
  },

  // Tambah item ke array nested — patch hanya container list, bukan re-render modal
  _addDeep(key, item) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m) return;
    if (!m[key]) m[key] = [];
    m[key].push(item);
    AT_EDITOR.markDirty();
    this._patchList(key, m);
  },

  // Hapus item dari array nested — patch container list
  _removeDeep(key, idx) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m || !m[key]) return;
    m[key].splice(idx, 1);
    AT_EDITOR.markDirty();
    this._patchList(key, m);
  },

  // Poin butir helpers — patch hanya sub-container butir
  _addButir(blokIdx) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m?.blok?.[blokIdx]) return;
    if (!m.blok[blokIdx].butir) m.blok[blokIdx].butir = [];
    m.blok[blokIdx].butir.push("");
    AT_EDITOR.markDirty();
    // Patch hanya sub-list butir dalam blok ini
    const cont = document.getElementById(`me_butir_${blokIdx}`);
    if (cont) {
      const b = m.blok[blokIdx];
      cont.innerHTML = this._butirItems(blokIdx, b.butir);
    }
  },
  _removeButir(blokIdx, butirIdx) {
    const m = AT_STATE.modules[this._editIdx];
    m?.blok?.[blokIdx]?.butir?.splice(butirIdx, 1);
    AT_EDITOR.markDirty();
    const cont = document.getElementById(`me_butir_${blokIdx}`);
    if (cont) {
      const b = m.blok[blokIdx];
      cont.innerHTML = this._butirItems(blokIdx, b.butir);
    }
  },
  _updateButir(blokIdx, butirIdx, val) {
    const m = AT_STATE.modules[this._editIdx];
    if (m?.blok?.[blokIdx]?.butir) m.blok[blokIdx].butir[butirIdx] = val;
    AT_EDITOR.markDirty();
  },

  // ── PATCH: rebuild hanya container list tertentu tanpa tutup modal ──
  _patchList(key, m) {
    const listIdMap = {
      kartu:      ["me_kartuList",      () => (m.kartu||[]).map((k,ki)    => this._kartuRow(m.type, k, ki)).join("")],
      pasangan:   ["me_pasanganList",   () => (m.pasangan||[]).map((p,pi) => this._pasanganRow(p, pi)).join("")],
      pertanyaan: ["me_pertanyaanList", () => (m.pertanyaan||[]).map((p,pi)=>this._pertanyaanRow(m.type, p, pi)).join("")],
      events:     ["me_eventList",      () => (m.events||[]).map((e,ei)   => this._eventRow(e, ei)).join("")],
      items:      [m.type==="accordion" ? "me_accordionList" : "me_statList",
                                        () => m.type==="accordion"
                                              ? (m.items||[]).map((it,ii) => this._accordionRow(it, ii)).join("")
                                              : (m.items||[]).map((it,ii) => this._statRow(it, ii)).join("")],
      langkah:    ["me_langkahList",    () => (m.langkah||[]).map((l,li) => this._langkahRow(l, li)).join("")],
      blok:       ["me_blokList",       () => (m.blok||[]).map((b,bi)    => this._blokEditorRow(b, bi)).join("")],
      opsi:       ["me_opsiList",       () => {
                    const colorOpts = ["var(--g)","var(--y)","var(--r)","var(--c)","var(--p)","var(--o)"];
                    return (m.opsi||[]).map((o,oi)=>`
                      <div class="sub-item" id="me_opsi_${oi}">
                        <div class="field-row">
                          ${AT_MODULES.emojiBtn(o.icon||"✅", `AT_MODULES._updateDeep('opsi',${oi},'icon',v)`)}
                          <input class="field-input" value="${esc(o.teks||"")}" placeholder="Teks opsi…" oninput="AT_MODULES._updateDeep('opsi',${oi},'teks',this.value)">
                          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('opsi',${oi})">🗑️</button>
                        </div>
                        <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
                          <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
                          ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('opsi',${oi},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(o.warna||"var(--g)")===col?"#fff":"transparent"}"></div>`).join("")}
                        </div>
                      </div>`).join("");
                  }],
      chapters:   ["skm_chapters",      () => (m.chapters||[]).map((ch,ci) => this._chapterRow(m, ci, ch)).join("")
                                              || '<div class="empty-state" style="padding:16px"><div class="empty-state-text">Belum ada chapter.</div></div>'],
    };
    const entry = listIdMap[key];
    if (!entry) { this.openEditor(this._editIdx); return; } // fallback
    const [listId, buildFn] = entry;
    const cont = document.getElementById(listId);
    if (!cont) { this.openEditor(this._editIdx); return; }
    cont.innerHTML = buildFn();
  },

  // ── MINI ROW BUILDERS (dipakai _patchList) ────────────────────
  _kartuRow(type, k, ki) {
    if (type === "flashcard") return `
      <div class="sub-item" id="me_kartu_${ki}">
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Depan</label>
            <input class="field-input" value="${esc(k.depan||"")}" oninput="AT_MODULES._updateDeep('kartu',${ki},'depan',this.value)">
          </div>
          <div class="field-group">
            <label class="field-label">Belakang</label>
            <input class="field-input" value="${esc(k.belakang||"")}" oninput="AT_MODULES._updateDeep('kartu',${ki},'belakang',this.value)">
          </div>
          <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('kartu',${ki})">🗑️</button>
        </div>
        <input class="field-input" value="${esc(k.hint||"")}" placeholder="Hint (opsional)…" style="margin-top:5px" oninput="AT_MODULES._updateDeep('kartu',${ki},'hint',this.value)">
      </div>`;
    // infografis kartu
    const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
    return `
      <div class="sub-item" id="me_kartu_${ki}">
        <div class="field-row" style="margin-bottom:6px">
          ${AT_MODULES.emojiBtn(k.icon||"📌", `AT_MODULES._updateDeep('kartu',${ki},'icon',v)`)}
          <input class="field-input" value="${esc(k.judul||"")}" placeholder="Judul kartu" oninput="AT_MODULES._updateDeep('kartu',${ki},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('kartu',${ki})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('kartu',${ki},'isi',this.value)">${esc(k.isi||"")}</textarea>
        <div style="display:flex;gap:6px;margin-top:5px;align-items:center">
          <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
          ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('kartu',${ki},'color','${col}')" style="width:18px;height:18px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${k.color===col?"#fff":"transparent"}"></div>`).join("")}
        </div>
      </div>`;
  },

  _pasanganRow(p, pi) {
    return `
      <div class="sub-item" id="me_pas_${pi}">
        <div class="field-row">
          <input class="field-input" value="${esc(p.kiri||"")}" placeholder="Kiri" oninput="AT_MODULES._updateDeep('pasangan',${pi},'kiri',this.value)">
          <span style="color:var(--muted);padding:0 4px;align-self:center">↔</span>
          <input class="field-input" value="${esc(p.kanan||"")}" placeholder="Kanan" oninput="AT_MODULES._updateDeep('pasangan',${pi},'kanan',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('pasangan',${pi})">🗑️</button>
        </div>
      </div>`;
  },

  _pertanyaanRow(type, p, pi) {
    if (type === "studi-kasus") return `
      <div class="sub-item" id="me_prt_${pi}">
        <div class="field-row">
          <div class="field-group" style="flex:0 0 80px">
            <label class="field-label">Level</label>
            <select class="field-select" onchange="AT_MODULES._updateDeep('pertanyaan',${pi},'level',this.value)">
              ${["C1","C2","C3","C4","C5","C6"].map(l=>`<option value="${l}"${p.level===l?" selected":""}>${l}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Label</label>
            <input class="field-input" value="${esc(p.label||"")}" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'label',this.value)">
          </div>
          <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('pertanyaan',${pi})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'teks',this.value)">${esc(p.teks||"")}</textarea>
      </div>`;
    // video
    return `
      <div class="sub-item" id="me_prt_${pi}">
        <input class="field-input" value="${esc(p.teks||"")}" placeholder="Pertanyaan refleksi…" oninput="AT_MODULES._updateDeep('pertanyaan',${pi},'teks',this.value)">
        <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
          <label style="font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:5px">
            <input type="checkbox" ${p.wajib?"checked":""} onchange="AT_MODULES._updateDeep('pertanyaan',${pi},'wajib',this.checked)"> Wajib
          </label>
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('pertanyaan',${pi})">🗑️</button>
        </div>
      </div>`;
  },

  _eventRow(e, ei) {
    return `
      <div class="sub-item" id="me_ev_${ei}">
        <div class="field-row">
          ${AT_MODULES.emojiBtn(e.icon||"📌", `AT_MODULES._updateDeep('events',${ei},'icon',v)`)}
          <input class="field-input" value="${esc(e.tahun||"")}" placeholder="Tahun" style="width:110px;flex-shrink:0" oninput="AT_MODULES._updateDeep('events',${ei},'tahun',this.value)">
          <input class="field-input" value="${esc(e.judul||"")}" placeholder="Judul" oninput="AT_MODULES._updateDeep('events',${ei},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('events',${ei})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="2" style="margin-top:5px" oninput="AT_MODULES._updateDeep('events',${ei},'isi',this.value)">${esc(e.isi||"")}</textarea>
      </div>`;
  },

  _accordionRow(it, ii) {
    return `
      <div class="sub-item" id="me_acc_${ii}">
        <div class="field-row" style="margin-bottom:5px">
          ${AT_MODULES.emojiBtn(it.icon||"❓", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
          <input class="field-input" value="${esc(it.judul||"")}" placeholder="Pertanyaan / Judul" oninput="AT_MODULES._updateDeep('items',${ii},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="3" oninput="AT_MODULES._updateDeep('items',${ii},'isi',this.value)">${esc(it.isi||"")}</textarea>
      </div>`;
  },

  _statRow(it, ii) {
    const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
    return `
      <div class="sub-item" id="me_st_${ii}">
        <div class="field-row" style="margin-bottom:5px">
          ${AT_MODULES.emojiBtn(it.icon||"📊", `AT_MODULES._updateDeep('items',${ii},'icon',v)`)}
          <input class="field-input" value="${esc(it.angka||"")}" placeholder="Angka" style="width:80px;flex-shrink:0;font-weight:800" oninput="AT_MODULES._updateDeep('items',${ii},'angka',this.value)">
          <input class="field-input" value="${esc(it.satuan||"")}" placeholder="Satuan" style="width:90px;flex-shrink:0" oninput="AT_MODULES._updateDeep('items',${ii},'satuan',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('items',${ii})">🗑️</button>
        </div>
        <input class="field-input" value="${esc(it.label||"")}" placeholder="Label/deskripsi" oninput="AT_MODULES._updateDeep('items',${ii},'label',this.value)">
        <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
          <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
          ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('items',${ii},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(it.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
        </div>
      </div>`;
  },

  _langkahRow(l, li) {
    const colorOpts = ["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"];
    return `
      <div class="sub-item" id="me_lk_${li}">
        <div class="field-row" style="margin-bottom:5px">
          ${AT_MODULES.emojiBtn(l.icon||"✅", `AT_MODULES._updateDeep('langkah',${li},'icon',v)`)}
          <input class="field-input" value="${esc(l.judul||"")}" placeholder="Judul langkah" oninput="AT_MODULES._updateDeep('langkah',${li},'judul',this.value)">
          <button class="icon-btn del" onclick="AT_MODULES._removeDeep('langkah',${li})">🗑️</button>
        </div>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('langkah',${li},'isi',this.value)">${esc(l.isi||"")}</textarea>
        <div style="display:flex;gap:5px;align-items:center;margin-top:5px">
          <span style="font-size:.71rem;color:var(--muted)">Warna:</span>
          ${colorOpts.map(col=>`<div onclick="AT_MODULES._updateDeep('langkah',${li},'warna','${col}')" style="width:16px;height:16px;border-radius:50%;background:${col};cursor:pointer;border:2px solid ${(l.warna||"var(--y)")===col?"#fff":"transparent"}"></div>`).join("")}
        </div>
      </div>`;
  },

  _chapterRow(m, ci, ch) {
    const idx = AT_STATE.modules.indexOf(m);
    return `
      <div class="sub-item" id="skm_ch${ci}">
        <div class="list-item-header">
          <span class="drag-handle">⠿</span>
          <div class="list-item-num" style="background:rgba(251,146,60,.15);color:var(--o)">${ci+1}</div>
          <span class="list-item-label">${ch.title||"Skenario "+(ci+1)}</span>
          <div class="list-item-actions">
            <button class="icon-btn edit" onclick="AT_SK_EDITOR.open(${idx},${ci})">✏️</button>
            <button class="icon-btn del" onclick="AT_MODULES._delChapter(${idx},${ci})">🗑️</button>
          </div>
        </div>
        <div style="font-size:.73rem;color:var(--muted);padding:0 0 4px 4px">
          Latar: ${ch.bg||"-"} · ${ch.setup?.length||0} dialog · ${ch.choices?.length||0} pilihan
        </div>
      </div>`;
  },

  _butirItems(blokIdx, butir) {
    return (butir||[]).map((bt,bti)=>`
      <div style="display:flex;gap:6px;margin-bottom:5px">
        <span style="color:var(--y);font-weight:900;padding-top:6px">•</span>
        <input class="field-input" value="${esc(bt)}" placeholder="Poin…" oninput="AT_MODULES._updateButir(${blokIdx},${bti},this.value)">
        <button class="icon-btn del" onclick="AT_MODULES._removeButir(${blokIdx},${bti})">×</button>
      </div>`).join("");
  },

  // Skenario-specific helpers
  _addSetup() {
    this._addDeep("setup", { speaker:"NARRATOR", text:"" });
  },
  _addChoice() {
    this._addDeep("choices", {
      icon:"💡", label:"", detail:"", good:false, pts:10,
      norma:"", level:"mid", resultTitle:"", resultBody:"",
      consequences:[{ icon:"💡", text:"" }]
    });
  },

  // ── BIND top-level fields (title, bg, dsb.) ──────────────────
  // ── BIND FIELDS — hanya field yang relevan per tipe ──────────
  _bindEditorForm(m, idx) {
    // Helper bind: mencari element, kalau tidak ada langsung skip (tidak spam null checks)
    const bind = (id, key, transform) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        m[key] = transform ? transform(el.value) : el.value;
        this._notifyChange();
      });
    };

    // Field universal — ada di hampir semua tipe
    bind("me_title", "title");
    bind("me_intro", "intro");
    bind("me_instruksi", "instruksi");

    // Per-tipe — hanya bind yang relevan
    switch (m.type) {
      case "skenario":
        bind("me_bg",           "bg");
        bind("me_charEmoji",    "charEmoji");
        bind("me_choicePrompt", "choicePrompt");
        break;

      case "video":
        bind("me_url",      "url");
        bind("me_platform", "platform");
        bind("me_durasi",   "durasi");
        break;

      case "infografis":
        bind("me_layout", "layout");
        break;

      case "studi-kasus":
        bind("me_teks",   "teks");
        bind("me_sumber", "sumber");
        break;

      case "debat":
        bind("me_pertanyaan", "pertanyaan");
        bind("me_konteks",    "konteks");
        bind("me_kesimpulan", "kesimpulan_prompt");
        // Pihak A & B punya struktur nested — bind manual
        const elA = document.getElementById("me_labelA");
        const elB = document.getElementById("me_labelB");
        if (elA) elA.addEventListener("input", () => {
          if (!m.pihakA) m.pihakA = {};
          m.pihakA.label = elA.value;
          AT_EDITOR.markDirty();
        });
        if (elB) elB.addEventListener("input", () => {
          if (!m.pihakB) m.pihakB = {};
          m.pihakB.label = elB.value;
          AT_EDITOR.markDirty();
        });
        break;

      case "timeline":
        // events dikelola via _addDeep/_updateDeep
        break;

      case "materi":
        // blok dikelola via _addDeep/_updateDeep
        break;

      case "hero":
        bind("me_ikon",     "ikon");
        bind("me_gradient", "gradient");
        bind("me_cta",      "cta");
        bind("me_chips",    "chips", v => v.split(",").map(s=>s.trim()).filter(Boolean));
        break;

      case "kutipan":
        bind("me_teks",    "teks");
        bind("me_sumber",  "sumber");
        bind("me_jabatan", "jabatan");
        bind("me_style",   "style");
        break;

      case "langkah":
        bind("me_style", "style");
        break;

      case "accordion":
      case "statistik":
        bind("me_layout", "layout");
        break;

      case "polling":
        bind("me_tipe",    "tipe");
        bind("me_anonim",  "anonim");
        break;

      case "embed":
        bind("me_url",    "url");
        bind("me_tinggi", "tinggi", v => +v || 400);
        bind("me_label",  "label");
        break;
    }
  },

  // Helper for direct field update (used by color pickers)
  _upField(key, val) {
    const i = this._editIdx;
    if (i === null || i === undefined) return;
    const m = AT_STATE.modules[i];
    if (!m) return;
    m[key] = val;
    AT_EDITOR.markDirty();
    // Re-render color pickers in editor
    this.openEditor(i);
  },

  // ── CHAPTER MANAGEMENT ──────────────────────────────────────
  _delChapter(modIdx, chIdx) {
    const m = AT_STATE.modules[modIdx];
    if (!m?.chapters) return;
    if (!confirm(`Hapus chapter "${m.chapters[chIdx]?.title}"?`)) return;
    m.chapters.splice(chIdx, 1);
    AT_EDITOR.markDirty();
    this.openEditor(modIdx);
  },

  _addChapter(modIdx) {
    const m = AT_STATE.modules[modIdx];
    if (!m) return;
    if (!m.chapters) m.chapters = [];
    const newCh = {
      id: m.chapters.length + 1,
      title: `🎭 Skenario ${m.chapters.length + 1}`,
      bg: "sbg-kampung",
      charEmoji: "😊", charColor: "#e87070", charPants: "#4a6a9a",
      choicePrompt: "Apa yang akan kamu lakukan?",
      setup: [
        { speaker: "NARRATOR", text: "Tuliskan narasi situasi di sini..." },
        { speaker: "TOKOH", text: "Dialog tokoh di sini..." }
      ],
      choices: [
        { icon:"🤝", label:"Pilihan bijak", detail:"Deskripsi pilihan", good:true, pts:20,
          norma:"Fungsi norma terkait", level:"good",
          resultTitle:"Pilihan Terbaik! 🌟", resultBody:"Penjelasan mengapa benar.",
          consequences:[{icon:"✅",text:"Dampak positif"}]
        },
        { icon:"❌", label:"Pilihan kurang tepat", detail:"Deskripsi pilihan", good:false, pts:0,
          norma:"Norma yang dilanggar", level:"bad",
          resultTitle:"Perlu Diperbaiki ⚠️", resultBody:"Penjelasan mengapa kurang tepat.",
          consequences:[{icon:"❌",text:"Dampak negatif"}]
        }
      ]
    };
    m.chapters.push(newCh);
    AT_EDITOR.markDirty();
    this.openEditor(modIdx);
    AT_UTIL.toast("✅ Chapter baru ditambahkan");
  },

  // ── APPLY PRESET (migrate old AT_STATE.skenario → modules) ───
  migrateFromSkenario() {
    this.ensureState();
    const old = AT_STATE.skenario || [];
    if (!old.length) { AT_UTIL.toast("⚠️ Tidak ada skenario lama untuk dimigrasi","err"); return; }
    old.forEach(ch => {
      const newMod = Object.assign({ type:"skenario" }, ch);
      AT_STATE.modules.push(newMod);
    });
    AT_STATE.skenario = [];
    this.render();
    AT_EDITOR.markDirty();
    AT_UTIL.toast(`✅ ${old.length} skenario dipindah ke sistem Modul baru`);
  },

  // ── HTML RENDERER untuk export (dipakai importer.js buildHtml) ─
  renderModuleHtml(m) {
    // If this module is actually a game, delegate to AT_GAMES
    if (m._isGame && window.AT_GAMES) {
      return AT_GAMES.renderGameHtml(m);
    }
    switch(m.type) {
      case "skenario":    return this._htmlSkenario(m);
      case "video":       return this._htmlVideo(m);
      case "infografis":  return this._htmlInfografis(m);
      case "flashcard":   return this._htmlFlashcard(m);
      case "studi-kasus": return this._htmlStudiKasus(m);
      case "debat":       return this._htmlDebat(m);
      case "timeline":    return this._htmlTimeline(m);
      case "matching":    return this._htmlMatching(m);
      case "materi":      return this._htmlMateri(m);
      case "hero":        return this._htmlHero(m);
      case "kutipan":     return this._htmlKutipan(m);
      case "langkah":     return this._htmlLangkah(m);
      case "accordion":   return this._htmlAccordion(m);
      case "statistik":   return this._htmlStatistik(m);
      case "polling":     return this._htmlPolling(m);
      case "embed":       return this._htmlEmbed(m);
      default: return `<div class="card mt14"><p style="color:var(--muted)">Modul tipe ${m.type} belum ada renderer.</p></div>`;
    }
  },

  _htmlMateri(m) {
    const blokHtml = (m.blok||[]).map(b => {
      if (b.tipe === "definisi") return `<div style="border-left:4px solid var(--y);background:rgba(249,193,46,.07);border-radius:0 11px 11px 0;padding:13px 15px;margin:10px 0;font-size:.88rem;line-height:1.7"><strong style="color:var(--y)">${b.judul||""}</strong><br>${b.isi||""}</div>`;
      if (b.tipe === "poin") return `<div style="margin:10px 0"><div style="font-weight:800;font-size:.84rem;margin-bottom:6px">${b.judul||""}</div>${(b.butir||[]).map(bt=>`<div style="display:flex;gap:8px;font-size:.82rem;margin-bottom:4px"><span style="color:var(--y);font-weight:900">•</span>${bt}</div>`).join("")}</div>`;
      return `<div style="margin:10px 0"><div style="font-weight:800;font-size:.84rem;margin-bottom:4px">${b.judul||""}</div><p style="font-size:.84rem;line-height:1.7;color:var(--muted)">${b.isi||""}</p></div>`;
    }).join("");
    return `<div class="card mt14"><div class="h2">📖 <span class="hl">${m.title||"Materi"}</span></div>${m.intro?`<p class="sub mt8">${m.intro}</p>`:""}<div style="margin-top:12px">${blokHtml}</div></div>`;
  },

  _htmlVideo(m) {
    let embedUrl = m.url || "";
    if (m.platform === "youtube" && embedUrl.includes("watch?v=")) {
      const vid = embedUrl.split("watch?v=")[1]?.split("&")[0];
      if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
    }
    const qHtml = (m.pertanyaan||[]).map((p,i)=>`
      <div style="margin-bottom:10px">
        <label style="font-size:.78rem;font-weight:800;display:block;margin-bottom:4px">${i+1}. ${p.teks}${p.wajib?' <span style="color:var(--r)">*</span>':""}</label>
        <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px"></textarea>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">▶️ <span class="hl">${m.title||"Video"}</span></div>
      ${m.instruksi?`<p class="sub mt8">${m.instruksi}</p>`:""}
      ${embedUrl ? `<div style="margin:14px 0;border-radius:12px;overflow:hidden;position:relative;padding-bottom:56.25%;height:0"><iframe src="${embedUrl}" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>` : `<div style="background:rgba(255,255,255,.04);border:2px dashed var(--border);border-radius:12px;padding:24px;text-align:center;color:var(--muted);margin:14px 0">▶️ URL video belum diisi</div>`}
      ${m.pertanyaan?.length ? `<div style="margin-top:14px"><div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">✏️ Pertanyaan Refleksi</div>${qHtml}</div>` : ""}
    </div>`;
  },

  _htmlInfografis(m) {
    const isGrid = m.layout !== "list" && m.layout !== "timeline";
    const kartuHtml = (m.kartu||[]).map(k=>`
      <div style="background:${k.color||"var(--y)"}12;border:1px solid ${k.color||"var(--y)"}33;border-radius:14px;padding:15px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:1.5rem">${k.icon||"📌"}</span>
          <div style="font-weight:900;font-size:.9rem;color:${k.color||"var(--y)"}">${k.judul||""}</div>
        </div>
        <div style="font-size:.8rem;color:var(--muted);line-height:1.55">${k.isi||""}</div>
      </div>`).join("");
    const grid = isGrid ? `grid-template-columns:repeat(auto-fill,minmax(180px,1fr))` : `grid-template-columns:1fr`;
    return `<div class="card mt14"><div class="h2">🗺️ <span class="hl">${m.title||"Infografis"}</span></div>${m.intro?`<p class="sub mt8">${m.intro}</p>`:""}<div style="display:grid;${grid};gap:12px;margin-top:14px">${kartuHtml}</div></div>`;
  },

  _htmlFlashcard(m) {
    const id = "fc_" + Math.random().toString(36).slice(2,6);
    const kartuHtml = (m.kartu||[]).map((k,i)=>`
      <div class="fc-card" id="${id}_${i}" onclick="this.classList.toggle('flipped')" style="cursor:pointer">
        <div class="fc-inner">
          <div class="fc-front"><div class="fc-text">${k.depan||""}</div>${k.hint?`<div style="font-size:.7rem;color:var(--muted);margin-top:8px">💡 ${k.hint}</div>`:""}</div>
          <div class="fc-back"><div class="fc-text">${k.belakang||""}</div></div>
        </div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🃏 <span class="hl">${m.title||"Flashcard"}</span></div>
      ${m.instruksi?`<p class="sub mt8">${m.instruksi}</p>`:""}
      <style>.fc-card{perspective:600px;height:140px;margin-bottom:10px}.fc-inner{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}.fc-card.flipped .fc-inner{transform:rotateY(180deg)}.fc-front,.fc-back{position:absolute;inset:0;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;backface-visibility:hidden}.fc-front{background:var(--card2);border:2px solid var(--border)}.fc-back{background:rgba(52,211,153,.08);border:2px solid rgba(52,211,153,.3);transform:rotateY(180deg)}.fc-text{font-size:.9rem;font-weight:700;text-align:center;color:var(--text)}</style>
      <div style="margin-top:14px">${kartuHtml}</div>
      <p style="font-size:.72rem;color:var(--muted);text-align:center;margin-top:6px">Ketuk kartu untuk membalik ↺</p>
    </div>`;
  },

  _htmlStudiKasus(m) {
    const qHtml = (m.pertanyaan||[]).map((p,i)=>`
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px">
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:7px">
          <span style="background:rgba(96,165,250,.15);color:var(--b);padding:2px 8px;border-radius:99px;font-size:.68rem;font-weight:900">${p.level||"C1"}</span>
          <span style="font-weight:800;font-size:.82rem">${p.label||""}</span>
        </div>
        <div style="font-size:.82rem;margin-bottom:8px">${p.teks||""}</div>
        <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px" placeholder="Jawaban kamu…"></textarea>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">📰 <span class="hl">${m.title||"Studi Kasus"}</span></div>
      <div style="background:rgba(255,255,255,.04);border-left:4px solid var(--b);border-radius:0 12px 12px 0;padding:14px;margin:12px 0;font-size:.85rem;line-height:1.7">${m.teks||""}</div>
      ${m.sumber?`<div style="font-size:.7rem;color:var(--muted);margin-bottom:10px">Sumber: ${m.sumber}</div>`:""}
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">✏️ Pertanyaan Analisis</div>
      ${qHtml}
    </div>`;
  },

  _htmlDebat(m) {
    return `<div class="card mt14">
      <div class="h2">🗣️ <span class="hl">${m.title||"Debat"}</span></div>
      <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;margin:12px 0;font-size:.88rem;font-weight:700;line-height:1.6;text-align:center">${m.pertanyaan||""}</div>
      ${m.konteks?`<p class="sub" style="margin-bottom:14px">${m.konteks}</p>`:""}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div style="background:rgba(52,211,153,.07);border:2px solid rgba(52,211,153,.25);border-radius:12px;padding:14px">
          <div style="font-weight:900;color:var(--g);margin-bottom:8px">✅ ${m.pihakA?.label||"Pro"}</div>
          <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:70px" placeholder="${m.pihakA?.argumen_placeholder||"Argumen pro…"}"></textarea>
        </div>
        <div style="background:rgba(255,107,107,.07);border:2px solid rgba(255,107,107,.25);border-radius:12px;padding:14px">
          <div style="font-weight:900;color:var(--r);margin-bottom:8px">❌ ${m.pihakB?.label||"Kontra"}</div>
          <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,107,107,.2);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:70px" placeholder="${m.pihakB?.argumen_placeholder||"Argumen kontra…"}"></textarea>
        </div>
      </div>
      ${m.kesimpulan_prompt?`<div style="background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.2);border-radius:12px;padding:12px"><div style="font-weight:800;font-size:.82rem;color:var(--p);margin-bottom:7px">💬 ${m.kesimpulan_prompt}</div><textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px" placeholder="Kesimpulanmu…"></textarea></div>`:""}
    </div>`;
  },

  _htmlTimeline(m) {
    const evHtml = (m.events||[]).map((e,i)=>`
      <div style="display:flex;gap:14px;align-items:flex-start;padding-bottom:18px;position:relative">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(245,200,66,.15);border:2px solid var(--y);display:flex;align-items:center;justify-content:center;font-size:1.1rem">${e.icon||"📌"}</div>
          ${i<(m.events.length-1)?`<div style="width:2px;flex:1;background:rgba(255,255,255,.08);margin-top:4px;min-height:24px"></div>`:""}
        </div>
        <div style="padding-top:6px">
          <div style="font-size:.7rem;font-weight:900;color:var(--y);margin-bottom:2px">${e.tahun||""}</div>
          <div style="font-weight:800;font-size:.88rem;margin-bottom:4px">${e.judul||""}</div>
          <div style="font-size:.8rem;color:var(--muted);line-height:1.6">${e.isi||""}</div>
        </div>
      </div>`).join("");
    return `<div class="card mt14"><div class="h2">📅 <span class="hl">${m.title||"Timeline"}</span></div>${m.intro?`<p class="sub mt8">${m.intro}</p>`:""}<div style="margin-top:16px">${evHtml}</div></div>`;
  },

  _htmlMatching(m) {
    const id = "mx_" + Math.random().toString(36).slice(2,6);
    const pasangan = m.pasangan || [];
    // Shuffle kanan untuk tampilan
    const kiriHtml  = pasangan.map((p,i)=>`<div class="mx-item mx-l" id="${id}_l${i}" onclick="mxPick('${id}','l',${i})">${p.kiri}</div>`).join("");
    const kananShuf = [...pasangan.map((_,i)=>i)].sort(()=>Math.random()-.5);
    const kananHtml = kananShuf.map(i=>`<div class="mx-item mx-r" id="${id}_r${i}" onclick="mxPick('${id}','r',${i})">${pasangan[i].kanan}</div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🔀 <span class="hl">${m.title||"Pasangkan"}</span></div>
      ${m.instruksi?`<p class="sub mt8">${m.instruksi}</p>`:""}
      <style>.mx-item{padding:9px 13px;border-radius:10px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.08);cursor:pointer;font-size:.82rem;font-weight:700;margin-bottom:7px;transition:all .18s}.mx-item:hover{border-color:var(--c)}.mx-item.selected{border-color:var(--y);background:rgba(245,200,66,.1)}.mx-item.matched{border-color:var(--g);background:rgba(52,211,153,.1);pointer-events:none}.mx-item.wrong{border-color:var(--r);background:rgba(255,107,107,.1)}</style>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
        <div>${kiriHtml}</div>
        <div>${kananHtml}</div>
      </div>
      <div id="${id}_msg" style="text-align:center;margin-top:10px;font-size:.8rem;color:var(--muted)"></div>
      <script>
      (function(){
        var sel=null,selSide=null,selIdx=null,matched=0,total=${pasangan.length};
        var pairs=${JSON.stringify(pasangan)};
        window.mxPick=function(gid,side,idx){
          if(gid!=='${id}') return;
          var el=document.getElementById(gid+'_'+side+idx);
          if(!el||el.classList.contains('matched')) return;
          if(sel&&selSide===side){document.getElementById(gid+'_'+selSide+selIdx)?.classList.remove('selected');sel=null;selSide=null;selIdx=null;}
          if(!sel){sel=el;selSide=side;selIdx=idx;el.classList.add('selected');return;}
          // Check match
          var li=side==='r'?selIdx:idx, ri=side==='r'?idx:selIdx;
          if(pairs[li]&&pairs[li].kanan===pairs[ri].kanan){
            [document.getElementById(gid+'_l'+li),document.getElementById(gid+'_r'+ri)].forEach(e=>{if(e){e.classList.remove('selected');e.classList.add('matched');}});
            matched++;
            if(matched===total)document.getElementById(gid+'_msg').textContent='🎉 Semua pasangan benar!';
          } else {
            [sel,el].forEach(e=>{e.classList.add('wrong');setTimeout(()=>{e.classList.remove('wrong','selected');},600);});
          }
          sel=null;selSide=null;selIdx=null;
        };
      })();
      <\/script>
    </div>`;
  },

  _htmlSkenario(m) {
    // Multi-chapter skenario — gunakan chapters[] atau fallback ke setup/choices
    const id = "sk_" + Math.random().toString(36).slice(2,6);
    // Support both: chapters[] (new) and legacy setup/choices (old)
    const chapters = m.chapters && m.chapters.length ? m.chapters : [{
      id:1, title:m.title||"Skenario",
      bg: m.bg||"sbg-kampung",
      charEmoji: m.charEmoji||"😊",
      charColor: m.charColor||"#e87070",
      charPants: m.charPants||"#4a6a9a",
      choicePrompt: m.choicePrompt||"Apa yang akan kamu lakukan?",
      setup: m.setup||[],
      choices: m.choices||[]
    }];
    const setup = chapters[0].setup || [];
    const choices = chapters[0].choices || [];
    return `<div class="card mt14">
      <div style="background:#0a0f1a;border:3px solid #1e3a5a;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(90deg,#0d1b2f,#0f2340);padding:10px 16px;border-bottom:2px solid #1e3a5a;display:flex;align-items:center;justify-content:space-between">
          <span style="font-family:Fredoka One,cursive;font-size:.9rem;color:var(--y)">🎭 ${m.title||"Skenario"}</span>
          <span id="${id}_pts" style="background:rgba(249,193,46,.15);color:var(--y);padding:3px 10px;border-radius:99px;font-size:.7rem;font-weight:800">0 poin</span>
        </div>
        <div style="position:relative;height:160px;overflow:hidden" class="${m.bg||"sbg-kampung"}">
          <div style="position:absolute;bottom:28%;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center">
            <div style="width:30px;height:30px;border-radius:50%;background:#fff2d9;border:2px solid rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:1rem">${m.charEmoji||"😊"}</div>
            <div style="width:22px;height:24px;border-radius:5px 5px 3px 3px;background:${m.charColor||"#3a7a9a"};border:2px solid rgba(0,0,0,.1);margin-top:-2px"></div>
          </div>
        </div>
        <div id="${id}_body">
          ${setup.length ? `
          <div style="background:rgba(8,16,30,.92);border-top:2px solid #1e3a5a;padding:12px 14px;min-height:76px" id="${id}_dlg">
            <div style="font-size:.7rem;font-weight:800;color:var(--c);margin-bottom:4px;text-transform:uppercase">${setup[0].speaker||"NARRATOR"}</div>
            <div style="font-size:.84rem;font-weight:700;line-height:1.5;color:#e8f2ff">${setup[0].text||""}</div>
            ${setup.length>1||choices.length?`<div style="font-size:.68rem;color:var(--muted);margin-top:5px;animation:tapP 1.4s ease-in-out infinite">Ketuk untuk lanjut ▶</div>`:""}
          </div>` : ""}
        </div>
      </div>
      <script>
      (function(){
        var step=0,done=false;
        var setup=${JSON.stringify(setup)};
        var choices=${JSON.stringify(choices)};
        var id='${id}';
        function showSetup(){
          var s=setup[step];
          document.getElementById(id+'_dlg').innerHTML='<div style="font-size:.7rem;font-weight:800;color:var(--c);margin-bottom:4px;text-transform:uppercase">'+s.speaker+'</div><div style="font-size:.84rem;font-weight:700;line-height:1.5;color:#e8f2ff">'+s.text+'</div>'+(step<setup.length-1||choices.length?'<div style="font-size:.68rem;color:var(--muted);margin-top:5px">Ketuk untuk lanjut ▶</div>':'');
        }
        function showChoices(){
          document.getElementById(id+'_body').innerHTML='<div style="padding:14px"><div style="font-size:.83rem;font-weight:800;color:var(--y);margin-bottom:10px;text-align:center">${m.choicePrompt||"Apa yang akan kamu lakukan?"}</div>'+choices.map((c,ci)=>'<div style="background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;font-size:.82rem;font-weight:700;margin-bottom:8px" onclick="skPick'+id+'('+ci+')">'+c.icon+' <div><div>'+c.label+'</div><div style="font-size:.72rem;color:var(--muted);font-weight:600">'+c.detail+'</div></div></div>').join('')+'</div>';
        }
        function tap(){if(done)return;step++;if(step<setup.length)showSetup();else if(choices.length)showChoices();}
        document.getElementById(id+'_body').addEventListener('click',tap);
        window['skPick'+id]=function(ci){
          done=true;
          var c=choices[ci];
          var icons={good:'🌟',mid:'🤔',bad:'⚠️'};
          document.getElementById(id+'_pts').textContent=(c.pts||0)+' poin';
          document.getElementById(id+'_body').innerHTML='<div style="padding:14px"><div style="border-radius:12px;padding:12px 14px;display:flex;gap:10px;margin-bottom:10px;background:rgba('+(c.level==='good'?'52,211,153':c.level==='bad'?'255,107,107':'249,193,46')+',.1);border:2px solid rgba('+(c.level==='good'?'52,211,153':c.level==='bad'?'255,107,107':'249,193,46')+',.3)"><span style="font-size:1.8rem">'+(icons[c.level]||'💡')+'</span><div><div style="font-weight:900;font-size:.88rem;color:var('+(c.level==='good'?'--g':c.level==='bad'?'--r':'--y')+')">'+(c.resultTitle||'')+'</div><div style="font-size:.79rem;color:var(--muted);line-height:1.5;margin-top:3px">'+(c.resultBody||'')+'</div></div></div>'+(c.norma?'<div style="font-size:.78rem;font-weight:700;color:var(--c);margin-bottom:8px">'+c.norma+'</div>':'')+(c.consequences||[]).map(k=>'<div style="display:flex;gap:8px;font-size:.79rem;margin-bottom:4px">'+k.icon+' '+k.text+'</div>').join('')+'</div>';
        };
      })();
      <\/script>
    </div>`;
  },

  // ── HERO BANNER renderer ─────────────────────────────────────
  _htmlHero(m) {
    const gradients = {
      sunset:  "linear-gradient(135deg,#1a0533 0%,#6d1a3c 40%,#e8632a 100%)",
      ocean:   "linear-gradient(135deg,#0a1628 0%,#0e3d6e 50%,#0ea5e9 100%)",
      forest:  "linear-gradient(135deg,#0a1f0a 0%,#1a4d2e 50%,#22c55e 100%)",
      royal:   "linear-gradient(135deg,#0f0a2e 0%,#3b1f8c 50%,#a855f7 100%)",
      fire:    "linear-gradient(135deg,#1a0a00 0%,#7c2d12 50%,#f97316 100%)",
      aurora:  "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 80%,#00b4db 100%)"
    };
    const bg = gradients[m.gradient] || gradients.sunset;
    const chipsHtml = (m.chips||[]).map(c=>
      `<span style="background:rgba(255,255,255,.15);backdrop-filter:blur(8px);color:#fff;padding:3px 11px;border-radius:99px;font-size:.7rem;font-weight:800;border:1px solid rgba(255,255,255,.2)">${c}</span>`
    ).join("");
    return `<div style="background:${bg};border-radius:18px;padding:32px 22px;text-align:center;margin-bottom:14px;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(255,255,255,.1),transparent 70%);pointer-events:none"></div>
      ${chipsHtml ? `<div style="display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">${chipsHtml}</div>` : ""}
      <div style="font-size:3.2rem;margin-bottom:12px;animation:float 3s ease-in-out infinite">${m.ikon||"📚"}</div>
      <div style="font-family:Fredoka One,cursive;font-size:clamp(1.5rem,6vw,2.4rem);color:#fff;line-height:1.2;margin-bottom:10px;text-shadow:0 2px 20px rgba(0,0,0,.4)">${m.title||"Judul Bab"}</div>
      ${m.subjudul ? `<p style="color:rgba(255,255,255,.8);font-size:.88rem;line-height:1.6;max-width:400px;margin:0 auto 18px">${m.subjudul}</p>` : ""}
      ${m.cta ? `<div style="display:inline-flex;align-items:center;gap:7px;padding:10px 22px;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);border-radius:99px;font-weight:800;font-size:.85rem;color:#fff;cursor:default">${m.cta} →</div>` : ""}
    </div>`;
  },

  // ── KUTIPAN INSPIRATIF renderer ──────────────────────────────
  _htmlKutipan(m) {
    const warna = m.warna || "var(--p)";
    if (m.style === "big") {
      return `<div style="padding:24px 18px;text-align:center;position:relative;margin-bottom:14px">
        <div style="font-size:5rem;line-height:1;color:${warna};opacity:.18;position:absolute;top:0;left:14px;font-family:Georgia,serif">"</div>
        <div style="font-family:Fredoka One,cursive;font-size:clamp(1.1rem,4vw,1.7rem);line-height:1.4;color:${warna};position:relative;z-index:1;margin:10px 0 18px">${m.teks||""}</div>
        <div style="width:40px;height:3px;background:${warna};border-radius:99px;margin:0 auto 12px"></div>
        ${m.sumber ? `<div style="font-weight:800;font-size:.85rem">${m.sumber}</div>` : ""}
        ${m.jabatan ? `<div style="font-size:.75rem;color:var(--muted);margin-top:3px">${m.jabatan}</div>` : ""}
      </div>`;
    }
    if (m.style === "minimal") {
      return `<div style="border-left:4px solid ${warna};padding:14px 16px;margin-bottom:14px;background:rgba(255,255,255,.02);border-radius:0 12px 12px 0">
        <div style="font-size:.9rem;line-height:1.7;font-style:italic;margin-bottom:8px">"${m.teks||""}"</div>
        ${m.sumber ? `<div style="font-size:.75rem;font-weight:800;color:${warna}">— ${m.sumber}${m.jabatan?` · ${m.jabatan}`:""}</div>` : ""}
      </div>`;
    }
    // card (default)
    return `<div style="background:${warna}10;border:2px solid ${warna}33;border-radius:16px;padding:20px 18px;text-align:center;margin-bottom:14px;position:relative">
      <div style="font-size:2.2rem;color:${warna};opacity:.3;position:absolute;top:10px;left:14px;font-family:Georgia,serif;line-height:1">"</div>
      <div style="font-size:.9rem;line-height:1.75;font-weight:600;margin:8px 0 16px;position:relative">"${m.teks||""}"</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:50%;background:${warna}22;border:2px solid ${warna}44;display:flex;align-items:center;justify-content:center;font-size:1rem">💬</div>
        <div style="text-align:left">
          ${m.sumber ? `<div style="font-weight:900;font-size:.84rem;color:${warna}">${m.sumber}</div>` : ""}
          ${m.jabatan ? `<div style="font-size:.72rem;color:var(--muted)">${m.jabatan}</div>` : ""}
        </div>
      </div>
    </div>`;
  },

  // ── LANGKAH-LANGKAH renderer ─────────────────────────────────
  _htmlLangkah(m) {
    const steps = m.langkah || [];
    const stepsHtml = steps.map((l, i) => {
      const warna = l.warna || "var(--y)";
      if (m.style === "bubble") {
        return `<div style="display:flex;gap:14px;margin-bottom:16px;align-items:flex-start">
          <div style="width:44px;height:44px;border-radius:50%;background:${warna}20;border:2px solid ${warna}55;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">${l.icon||"✅"}</div>
          <div style="padding-top:4px"><div style="font-weight:800;font-size:.88rem;margin-bottom:3px;color:${warna}">${l.judul||""}</div><div style="font-size:.81rem;color:var(--muted);line-height:1.6">${l.isi||""}</div></div>
        </div>`;
      }
      if (m.style === "arrow") {
        return `<div style="background:${warna}09;border:1px solid ${warna}33;border-radius:12px;padding:13px 16px;margin-bottom:8px;display:flex;gap:12px;align-items:center">
          <div style="font-size:1.4rem;flex-shrink:0">${l.icon||"✅"}</div>
          <div style="flex:1"><div style="font-weight:800;font-size:.88rem;margin-bottom:2px;color:${warna}">${l.judul||""}</div><div style="font-size:.8rem;color:var(--muted);line-height:1.5">${l.isi||""}</div></div>
          ${i < steps.length-1 ? "" : ""}
        </div>`;
      }
      // numbered (default)
      return `<div style="display:flex;gap:13px;margin-bottom:16px;align-items:flex-start">
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center">
          <div style="width:34px;height:34px;border-radius:50%;background:${warna};color:#0e1c2f;display:flex;align-items:center;justify-content:center;font-family:Fredoka One,cursive;font-size:1rem;font-weight:900">${i+1}</div>
          ${i < steps.length-1 ? `<div style="width:2px;flex:1;min-height:20px;background:${warna}33;margin-top:3px"></div>` : ""}
        </div>
        <div style="padding-top:4px">
          <div style="font-weight:800;font-size:.88rem;margin-bottom:3px">${l.icon||""} ${l.judul||""}</div>
          <div style="font-size:.82rem;color:var(--muted);line-height:1.6">${l.isi||""}</div>
        </div>
      </div>`;
    }).join("");
    return `<div class="card mt14">
      <div class="h2">👣 <span class="hl">${m.title||"Langkah-Langkah"}</span></div>
      ${m.intro ? `<p class="sub" style="margin:7px 0 14px">${m.intro}</p>` : `<div style="margin-top:14px"></div>`}
      ${stepsHtml}
    </div>`;
  },

  // ── ACCORDION / FAQ renderer ─────────────────────────────────
  _htmlAccordion(m) {
    const id = "acc_" + Math.random().toString(36).slice(2,6);
    const itemsHtml = (m.items||[]).map((it,ii) => `
      <div style="border:1px solid var(--border);border-radius:11px;margin-bottom:7px;overflow:hidden">
        <div onclick="accToggle('${id}',${ii})" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;background:rgba(255,255,255,.03);user-select:none">
          <span style="font-size:1.1rem;flex-shrink:0">${it.icon||"❓"}</span>
          <span style="font-weight:800;font-size:.87rem;flex:1">${it.judul||""}</span>
          <span id="${id}_arr${ii}" style="color:var(--muted);font-size:.75rem;transition:transform .25s">▼</span>
        </div>
        <div id="${id}_body${ii}" style="display:none;padding:12px 16px 14px;font-size:.83rem;line-height:1.7;color:var(--muted);border-top:1px solid var(--border)">${it.isi||""}</div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🗂️ <span class="hl">${m.title||"FAQ"}</span></div>
      ${m.intro ? `<p class="sub" style="margin:7px 0 14px">${m.intro}</p>` : `<div style="margin-top:12px"></div>`}
      ${itemsHtml}
      <script>(function(){
        window.accToggle=window.accToggle||function(gid,i){
          var b=document.getElementById(gid+'_body'+i);
          var a=document.getElementById(gid+'_arr'+i);
          if(!b)return;
          var open=b.style.display!=='none';
          b.style.display=open?'none':'block';
          if(a)a.style.transform=open?'':'rotate(-180deg)';
        };
      })();<\/script>
    </div>`;
  },

  // ── STATISTIK / ANGKA KUNCI renderer ─────────────────────────
  _htmlPolling(m) {
    const isMultiple = m.tipe === "multiple";
    const opsiHtml = (m.opsi||[]).map((o, oi) => {
      const warna = o.warna || "var(--c)";
      return `
        <div class="polling-opsi" id="poll_opsi_${oi}"
          style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:2px solid ${warna}33;border-radius:12px;cursor:pointer;margin-bottom:8px;transition:all .18s;background:${warna}08"
          onclick="this.classList.toggle('selected');this.style.background='${warna}22';this.style.borderColor='${warna}'">
          <span style="font-size:1.3rem">${o.icon||"💬"}</span>
          <span style="font-size:.88rem;font-weight:700;flex:1">${o.teks||""}</span>
          <span style="width:20px;height:20px;border-radius:${isMultiple?"4px":"50%"};border:2px solid ${warna};display:inline-block;flex-shrink:0"></span>
        </div>`;
    }).join("");

    return `<div class="card mt14">
      <div class="h2">🗳️ <span class="hl">${m.title||"Polling"}</span></div>
      ${m.instruksi ? `<p class="sub mt8">${m.instruksi}</p>` : ""}
      <div style="margin-top:14px">${opsiHtml}</div>
      <div style="text-align:center;margin-top:12px">
        <button class="btn btn-y" style="pointer-events:none;opacity:.7">
          ${isMultiple ? "✅ Kirim Jawaban" : "🗳️ Pilih Salah Satu"}
        </button>
      </div>
      ${m.anonim ? `<div style="font-size:.71rem;color:var(--muted);text-align:center;margin-top:8px">🔒 Jawaban bersifat anonim</div>` : ""}
    </div>`;
  },

  _htmlEmbed(m) {
    const url = m.url || "";
    const tinggi = m.tinggi || 420;
    const label  = m.label || "Buka di tab baru";

    if (!url) return `
      <div class="card mt14">
        <div class="h2">🔗 <span class="hl">${m.title||"Embed"}</span></div>
        <div style="padding:40px;text-align:center;background:rgba(255,255,255,.03);border-radius:12px;margin-top:14px;border:2px dashed rgba(255,255,255,.1)">
          <div style="font-size:2rem;margin-bottom:8px">🔗</div>
          <div style="color:var(--muted);font-size:.82rem">URL belum diisi — masukkan URL embed di editor.</div>
        </div>
      </div>`;

    return `<div class="card mt14">
      <div class="h2">🔗 <span class="hl">${m.title||"Konten Embedded"}</span></div>
      <div style="margin-top:12px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08)">
        <iframe src="${url}" width="100%" height="${tinggi}" frameborder="0" allowfullscreen
          style="display:block;border-radius:12px"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
        </iframe>
      </div>
      <div style="text-align:right;margin-top:8px">
        <a href="${url}" target="_blank" rel="noopener"
          style="font-size:.75rem;color:var(--c);text-decoration:none;display:inline-flex;align-items:center;gap:5px">
          ${label} ↗
        </a>
      </div>
    </div>`;
  },

  // ── LIVE PREVIEW ─────────────────────────────────────────────
  _previewVisible: true,

  togglePreviewPanel() {
    const modal = document.getElementById("modEditorModal");
    const btn   = document.getElementById("modPreviewToggle");
    if (!modal) return;
    this._previewVisible = !this._previewVisible;
    modal.classList.toggle("preview-hidden", !this._previewVisible);
    if (btn) {
      btn.style.background = this._previewVisible ? "var(--c)" : "";
      btn.style.color      = this._previewVisible ? "#000" : "";
    }
  },

  refreshPreview() {
    const pane   = document.getElementById("modEditorPreview");
    const status = document.getElementById("modPreviewStatus");
    if (!pane || this._editIdx === null) return;
    const m = AT_STATE.modules[this._editIdx];
    if (!m) return;
    try {
      pane.innerHTML = this.renderModuleHtml(m);
      if (status) status.textContent = "· live";
    } catch(e) {
      pane.innerHTML = `<div style="color:var(--r);font-size:.75rem;padding:8px">Preview error: ${e.message}</div>`;
    }
  },

  _notifyChange() {
    AT_EDITOR.markDirty?.();
    AT_SPLITVIEW?.scheduleRefresh?.();
    if (this._previewVisible) this.refreshPreview();
    const card = document.getElementById("mod_card_" + this._editIdx);
    if (card) {
      const m = AT_STATE.modules[this._editIdx];
      if (m) card.querySelector(".mod-card-preview").innerHTML = this._miniPreview(m);
    }
  },

  // ── EMOJI PICKER ─────────────────────────────────────────────
  _EMOJI: {
    "Umum":     ["📚","📖","📝","✏️","🖊️","📌","📍","🔖","💡","🎯","⭐","🌟","✅","❌","⚠️","❓","❗","🔑","🏆","🎖️","💎","🔥","⚡","🌈","🎨","🎭","🎬","🎤","🎵","🎶"],
    "Alam":     ["🌱","🌿","🍃","🌲","🌳","🌴","🌵","🌺","🌸","🌼","🌻","🍀","🍁","🍂","☀️","🌙","⭐","🌊","🏔️","🌋","🌍","🌞","🌦️","❄️","🌬️","💧","🦋","🐾","🦜","🌺"],
    "Sains":    ["🔬","🧬","🧪","⚗️","🔭","🧲","⚙️","🔋","💻","📡","🛰️","🚀","🧠","💊","🩺","⚖️","📐","📏","🧮","🔢","➕","➗","🧩","🔴","🟡","🟢","🔵","⚪","🟣","🟠"],
    "Sosial":   ["👥","🤝","💬","🗣️","📢","🏫","🏛️","🕌","⛪","🗺️","🌐","🗳️","📜","📋","🏠","🎓","👨‍🎓","👩‍🎓","👩‍🏫","👨‍🏫","👮","💼","🤲","🫂","👨‍👩‍👧","🏙️","🌉","✈️","🚂","🚌"],
    "Ekspresi": ["😊","😄","🤔","😮","🤩","🥳","😎","🤓","💪","👍","✌️","🙌","👏","🤜","🙏","❤️","💛","💚","💙","💜","🧡","💫","✨","🌟","💥","🎉","🎊","🥁","🎺","🎸"],
    "Objek":    ["🎒","📦","🗃️","📂","🗂️","💾","📱","⌨️","🖥️","📺","📷","🔦","💡","🔌","🔧","🔨","⚒️","🛠️","🎁","🎀","🪄","🧸","🏺","🛡️","🗡️","🔮","🪬","🧿","🎐","🪁"],
  },

  _emojiTarget: null,
  _emojiActiveCat: "Umum",

  showEmojiPicker(triggerEl, currentVal, onSelect) {
    document.getElementById("at-emoji-picker")?.remove();
    const picker = document.createElement("div");
    picker.id    = "at-emoji-picker";
    picker.className = "emoji-picker-popup show";
    const cats   = Object.keys(this._EMOJI);
    const activeCat = this._emojiActiveCat || cats[0];
    picker.innerHTML = `
      <input class="emoji-picker-search" placeholder="🔍 Cari emoji…" id="ep-search" oninput="AT_MODULES._filterEmoji(this.value)">
      <div class="emoji-picker-cats" id="ep-cats">
        ${cats.map(c => `<button class="${c===activeCat?"active":""}" onclick="AT_MODULES._switchEmojiCat('${c}')">${c}</button>`).join("")}
      </div>
      <div class="emoji-picker-grid" id="ep-grid">
        ${(this._EMOJI[activeCat]||[]).map(em => `<button onclick="AT_MODULES._selectEmoji('${em}')">${em}</button>`).join("")}
      </div>`;
    document.body.appendChild(picker);
    const rect = triggerEl.getBoundingClientRect();
    picker.style.position = "fixed";
    picker.style.top  = Math.min(rect.bottom + 4, window.innerHeight - 290) + "px";
    picker.style.left = Math.min(rect.left, window.innerWidth - 296) + "px";
    this._emojiTarget = { onSelect };
    setTimeout(() => {
      document.addEventListener("click", AT_MODULES._closeEmojiOnOutside, { once: true });
    }, 60);
  },

  _closeEmojiOnOutside(e) {
    const p = document.getElementById("at-emoji-picker");
    if (p && !p.contains(e.target)) p.remove();
  },

  _switchEmojiCat(cat) {
    this._emojiActiveCat = cat;
    document.querySelectorAll("#ep-cats button").forEach(b => b.classList.toggle("active", b.textContent === cat));
    const grid = document.getElementById("ep-grid");
    if (grid) grid.innerHTML = (this._EMOJI[cat]||[]).map(em => `<button onclick="AT_MODULES._selectEmoji('${em}')">${em}</button>`).join("");
  },

  _filterEmoji(q) {
    const grid = document.getElementById("ep-grid");
    if (!grid) return;
    const all = Object.values(this._EMOJI).flat();
    const res = q ? all.filter(e => e.includes(q)).slice(0, 64) : this._EMOJI[this._emojiActiveCat||"Umum"];
    grid.innerHTML = (res||[]).map(em => `<button onclick="AT_MODULES._selectEmoji('${em}')">${em}</button>`).join("");
  },

  _selectEmoji(em) {
    if (this._emojiTarget?.onSelect) this._emojiTarget.onSelect(em);
    document.getElementById("at-emoji-picker")?.remove();
  },

  emojiBtn(currentVal, onSelectExpr, extraStyle) {
    return `<button type="button" class="emoji-trigger-btn" style="font-size:1.4rem;line-height:1;padding:4px 10px;border:1px solid var(--border);border-radius:8px;cursor:pointer;background:var(--bg2);min-width:46px;transition:background .15s;${extraStyle||""}"
      onclick="AT_MODULES.showEmojiPicker(this, '', v => { ${onSelectExpr}; AT_MODULES._notifyChange(); })"
    >${currentVal||"📌"}</button>`;
  },

  // ── ANIMASI PICKER ────────────────────────────────────────────
  _ANIMATIONS: [
    { id:"",         label:"Tidak ada" },
    { id:"fade-in",  label:"✨ Fade in" },
    { id:"slide-up", label:"⬆️ Slide up" },
    { id:"bounce",   label:"🏀 Bounce" },
    { id:"zoom",     label:"🔍 Zoom in" },
    { id:"flip",     label:"🔄 Flip" },
    { id:"shake",    label:"📳 Shake" },
    { id:"pulse",    label:"💓 Pulse" },
    { id:"glow",     label:"💫 Glow" },
  ],

  renderAnimPicker(m, field) {
    const cur = m[field] || "";
    return `<div style="margin-top:6px">
      <label class="field-label">Animasi Masuk</label>
      <div class="anim-picker" id="animPicker_${field}">
        ${this._ANIMATIONS.map(a =>
          `<button class="anim-chip${a.id===cur?" active":""}"
            onclick="AT_MODULES._setAnim('${field}','${a.id}',this)">${a.label}</button>`
        ).join("")}
      </div>
    </div>`;
  },

  _setAnim(field, animId, btn) {
    const m = AT_STATE.modules[this._editIdx];
    if (!m) return;
    m[field] = animId;
    btn.closest(".anim-picker")?.querySelectorAll(".anim-chip")
      .forEach(b => b.classList.toggle("active", b === btn));
    this._notifyChange();
  },

};

/* ── SKENARIO SETUP ROW HELPER (dipakai _buildEditorForm) ──── */
function setupRow(s, si) {
  return `<div class="sub-item" id="me_setup_${si}">
    <div class="field-row">
      <div class="field-group" style="flex:0 0 140px">
        <label class="field-label">Speaker</label>
        <input class="field-input" value="${esc(s.speaker||"")}" placeholder="NARRATOR" oninput="AT_MODULES._updateDeep('setup',${si},'speaker',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Dialog</label>
        <textarea class="field-textarea" rows="2" oninput="AT_MODULES._updateDeep('setup',${si},'text',this.value)">${esc(s.text||"")}</textarea>
      </div>
      <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('setup',${si})">🗑️</button>
    </div>
  </div>`;
}

function choiceRow(c, ci) {
  return `<div class="sub-item" id="me_choice_${ci}">
    <div class="field-row">
      <div class="field-group" style="flex:0 0 52px">
        <label class="field-label">Ikon</label>
        <input class="field-input" value="${esc(c.icon||"💡")}" maxlength="4" oninput="AT_MODULES._updateDeep('choices',${ci},'icon',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Label Pilihan</label>
        <input class="field-input" value="${esc(c.label||"")}" placeholder="Teks pilihan…" oninput="AT_MODULES._updateDeep('choices',${ci},'label',this.value)">
      </div>
      <div class="field-group" style="flex:0 0 80px">
        <label class="field-label">Level</label>
        <select class="field-select" onchange="AT_MODULES._updateDeep('choices',${ci},'level',this.value)">
          <option value="good"${c.level==="good"?" selected":""}>✅ Baik</option>
          <option value="mid"${c.level==="mid"?" selected":""}>🤔 Sedang</option>
          <option value="bad"${c.level==="bad"?" selected":""}>⚠️ Buruk</option>
        </select>
      </div>
      <div class="field-group" style="flex:0 0 60px">
        <label class="field-label">Poin</label>
        <input class="field-input" type="number" min="0" max="30" value="${c.pts||0}" oninput="AT_MODULES._updateDeep('choices',${ci},'pts',+this.value)">
      </div>
      <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_MODULES._removeDeep('choices',${ci})">🗑️</button>
    </div>
    <input class="field-input" value="${esc(c.detail||"")}" placeholder="Deskripsi detail pilihan…" style="margin-top:5px" oninput="AT_MODULES._updateDeep('choices',${ci},'detail',this.value)">
    <div class="field-row" style="margin-top:6px">
      <div class="field-group">
        <label class="field-label">Judul Hasil</label>
        <input class="field-input" value="${esc(c.resultTitle||"")}" placeholder="Pilihan Terbaik! 🌟" oninput="AT_MODULES._updateDeep('choices',${ci},'resultTitle',this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Kaitan Norma</label>
        <input class="field-input" value="${esc(c.norma||"")}" placeholder="Fungsi norma yang terkait" oninput="AT_MODULES._updateDeep('choices',${ci},'norma',this.value)">
      </div>
    </div>
    <textarea class="field-textarea" rows="2" style="margin-top:5px" placeholder="Penjelasan hasil pilihan ini…" oninput="AT_MODULES._updateDeep('choices',${ci},'resultBody',this.value)">${esc(c.resultBody||"")}</textarea>
  </div>`;
}

/* ── ESC HELPER ─────────────────────────────────────────────── */
function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* ── TAMBAH KE AT_STATE ──────────────────────────────────────── */
// Pastikan AT_STATE.modules ada
document.addEventListener("DOMContentLoaded", () => {
  if (!AT_STATE.modules) AT_STATE.modules = [];

  // Update AT_NAV titles
  if (AT_NAV?.go) {
    const origGo = AT_NAV.go.bind(AT_NAV);
    AT_NAV.go = function(id) {
      origGo(id);
      if (id === "modules") {
        AT_MODULES.ensureState();
        AT_MODULES.render();
      }
    };
    // Patch titles
    AT_NAV._titles = AT_NAV._titles || {};
    AT_NAV._titles["modules"] = "Modul Pembelajaran";
  }

  // Tutup modal dengan klik overlay
  ["modPickerModal","modEditorModal"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", e => { if (e.target === el) { el.classList.remove("show"); if (id==="modEditorModal") AT_MODULES.closeEditor(); } });
  });
});

console.log("✅ modules.js loaded — 9 tipe modul siap");
