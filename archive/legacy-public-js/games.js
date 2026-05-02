// ═══════════════════════════════════════════════════════════════
// GAMES.JS — 6 Tipe Game Pembelajaran + Editor + Renderer
// Authoring Tool v1.2
// Game: WordSearch, TrueFalse, Sorting, SpinWheel, TeamBuzzer, Memory
// ═══════════════════════════════════════════════════════════════

/* ── GAME REGISTRY ──────────────────────────────────────────── */
window.GAME_TYPES = {

  truefalse: {
    id:"truefalse", icon:"✅", label:"Benar atau Salah", color:"var(--g)",
    desc:"Siswa menilai pernyataan benar/salah, dapat poin & feedback langsung.",
    defaultData() {
      return {
        type:"truefalse", title:"Benar atau Salah?",
        instruksi:"Tentukan apakah pernyataan berikut benar atau salah!",
        pernyataan:[
          { teks:"Norma adalah aturan yang mengatur perilaku manusia dalam masyarakat.", jawaban:true,  penjelasan:"Benar! Norma adalah aturan/pedoman yang mengatur perilaku dalam kehidupan bermasyarakat." },
          { teks:"Pelanggaran norma agama hanya mendapat sanksi berupa denda dari pemerintah.", jawaban:false, penjelasan:"Salah! Sanksi norma agama bersifat spiritual, yaitu dosa yang dipertanggungjawabkan kepada Tuhan." },
          { teks:"Manusia disebut Zoon Politikon karena selalu membutuhkan orang lain.", jawaban:true,  penjelasan:"Benar! Aristoteles menyebut manusia sebagai makhluk sosial yang tidak bisa hidup sendiri." },
          { teks:"Norma hukum tidak memiliki sanksi yang tegas.", jawaban:false, penjelasan:"Salah! Norma hukum memiliki sanksi paling tegas, berupa denda, penjara, atau hukuman dari negara." },
        ]
      };
    }
  },

  sorting: {
    id:"sorting", icon:"🔢", label:"Urutkan / Klasifikasi", color:"var(--c)",
    desc:"Siswa mengurutkan atau mengklasifikasikan item ke kategori yang benar.",
    defaultData() {
      return {
        type:"sorting", title:"Klasifikasikan Norma",
        instruksi:"Seret setiap contoh ke kategori norma yang tepat!",
        kategori:[
          { label:"Norma Agama",     color:"var(--y)", id:"agama" },
          { label:"Norma Hukum",     color:"var(--r)", id:"hukum" },
          { label:"Norma Kesopanan", color:"var(--c)", id:"sopan" },
          { label:"Norma Kesusilaan",color:"var(--p)", id:"susila" },
        ],
        items:[
          { teks:"Berdoa sebelum makan",         kategori:"agama"  },
          { teks:"Membayar pajak",               kategori:"hukum"  },
          { teks:"Memberi salam kepada guru",    kategori:"sopan"  },
          { teks:"Tidak berbohong",              kategori:"susila" },
          { teks:"Sholat lima waktu",            kategori:"agama"  },
          { teks:"Tidak mencuri",                kategori:"hukum"  },
          { teks:"Antre dengan tertib",          kategori:"sopan"  },
          { teks:"Menolong orang yang kesulitan",kategori:"susila" },
        ]
      };
    }
  },

  spinwheel: {
    id:"spinwheel", icon:"🎡", label:"Roda Putar Pertanyaan", color:"var(--o)",
    desc:"Putar roda, pertanyaan random muncul. Cocok untuk review/diskusi kelas.",
    defaultData() {
      return {
        type:"spinwheel", title:"Roda Pengetahuan Norma",
        instruksi:"Putar roda! Jawab pertanyaan yang muncul.",
        soal:[
          { teks:"Sebutkan 4 macam norma yang ada di masyarakat!", kategori:"Hafalan" },
          { teks:"Apa yang dimaksud dengan sanksi norma hukum?", kategori:"Pemahaman" },
          { teks:"Berikan 1 contoh penerapan norma agama di kehidupan sehari-hari!", kategori:"Aplikasi" },
          { teks:"Mengapa manusia perlu norma dalam kehidupan bermasyarakat?", kategori:"Analisis" },
          { teks:"Apa perbedaan norma kesusilaan dan norma kesopanan?", kategori:"Analisis" },
          { teks:"Apa sanksi jika melanggar norma hukum?", kategori:"Hafalan" },
          { teks:"Siapa yang berwenang membuat norma hukum di Indonesia?", kategori:"Pemahaman" },
          { teks:"Berikan contoh konflik yang terjadi karena tidak adanya norma!", kategori:"Aplikasi" },
        ]
      };
    }
  },

  memory: {
    id:"memory", icon:"🧠", label:"Kartu Memori (Match)", color:"var(--p)",
    desc:"Balik dan cocokkan pasangan kartu. Melatih memori dan pemahaman konsep.",
    defaultData() {
      return {
        type:"memory", title:"Memory: Norma & Definisinya",
        instruksi:"Balik dua kartu. Cocokkan istilah dengan definisinya!",
        pasangan:[
          { a:"Norma",       b:"Aturan yang mengatur perilaku dalam masyarakat" },
          { a:"Sanksi",      b:"Akibat dari pelanggaran norma" },
          { a:"Agama",       b:"Norma yang bersumber dari wahyu Tuhan" },
          { a:"Hukum",       b:"Norma dengan sanksi paling tegas dari negara" },
          { a:"Kesusilaan",  b:"Norma yang bersumber dari hati nurani" },
          { a:"Kesopanan",   b:"Norma tentang tata krama pergaulan" },
        ]
      };
    }
  },

  teambuzzer: {
    id:"teambuzzer", icon:"🏆", label:"Kuis Tim / Buzzer", color:"var(--y)",
    desc:"Kuis cepat antar kelompok, skor real-time. Cocok untuk kompetisi kelas.",
    defaultData() {
      return {
        type:"teambuzzer", title:"Kuis Tim: Norma & Hukum",
        instruksi:"Dua tim bersaing menjawab soal. Tim yang pertama buzzer dapat kesempatan menjawab!",
        timA:"Tim Merah 🔴", timB:"Tim Biru 🔵",
        soal:[
          { teks:"Apa kepanjangan dari UUD?", jawaban:"Undang-Undang Dasar", poin:10 },
          { teks:"Siapa yang menyebut manusia sebagai Zoon Politikon?", jawaban:"Aristoteles", poin:10 },
          { teks:"Sebutkan 4 macam norma!", jawaban:"Agama, Kesusilaan, Kesopanan, Hukum", poin:20 },
          { teks:"Apa sanksi norma kesusilaan?", jawaban:"Rasa malu / dikucilkan masyarakat", poin:15 },
          { teks:"Apa fungsi norma dalam masyarakat? Sebutkan 2!", jawaban:"Pedoman tingkah laku, menciptakan ketertiban (dll.)", poin:20 },
        ]
      };
    }
  },

  wordsearch: {
    id:"wordsearch", icon:"🔍", label:"Teka-Teki Kata", color:"var(--b)",
    desc:"Cari kata tersembunyi dalam grid huruf. Kata berhubungan dengan materi.",
    defaultData() {
      return {
        type:"wordsearch", title:"Cari Kata: Istilah Norma",
        instruksi:"Temukan semua kata yang berhubungan dengan norma!",
        kata:["NORMA","SANKSI","HUKUM","AGAMA","SOSIAL","ATURAN","ETIKA","MORAL"],
        ukuran:10
      };
    }
  }
};

/* ══════════════════════════════════════════════════════════════
   AT_GAMES — Controller panel Game
   ══════════════════════════════════════════════════════════════ */
window.AT_GAMES = {

  ensureState() { if (!AT_STATE.games) AT_STATE.games = []; },

  render() {
    this.ensureState();
    const cont = document.getElementById("game_list");
    if (!cont) return;
    const games = AT_STATE.games;
    if (!games.length) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🎮</div>
        <div class="empty-state-text">Belum ada game. Klik "+ Tambah Game".</div></div>`;
      return;
    }
    cont.innerHTML = games.map((g, i) => {
      const T = GAME_TYPES[g.type] || { icon:"🎮", label:g.type, color:"var(--muted)" };
      return `<div class="mod-card" id="game_card_${i}">
        <div class="mod-card-header">
          <span class="drag-handle">⠿</span>
          <span class="mod-type-badge" style="background:${T.color}22;color:${T.color};border:1px solid ${T.color}44">${T.icon} ${T.label}</span>
          <span class="mod-card-title">${g.title||"(tanpa judul)"}</span>
          <div class="mod-card-actions">
            <button class="icon-btn" onclick="AT_GAMES.previewGame(${i})" title="Preview di Split View">👁️</button>
            <button class="icon-btn edit" onclick="AT_GAMES.openEditor(${i})">✏️</button>
            <button class="icon-btn del" onclick="AT_GAMES.delete(${i})">🗑️</button>
          </div>
        </div>
        <div class="mod-card-preview">${this._preview(g)}</div>
      </div>`;
    }).join("");
  },

  _preview(g) {
    const map = {
      truefalse:  `✅ ${g.pernyataan?.length||0} pernyataan`,
      sorting:    `🗂️ ${g.kategori?.length||0} kategori · ${g.items?.length||0} item`,
      spinwheel:  `🎡 ${g.soal?.length||0} soal di roda`,
      memory:     `🧠 ${g.pasangan?.length||0} pasangan kartu`,
      teambuzzer: `🏆 ${g.soal?.length||0} soal · ${g.timA||""} vs ${g.timB||""}`,
      wordsearch: `🔍 ${g.kata?.length||0} kata tersembunyi`,
    };
    return `<span>${map[g.type]||g.type}</span>`;
  },

  add(typeId) {
    this.ensureState();
    const T = GAME_TYPES[typeId];
    if (!T) return;
    AT_STATE.games.push(T.defaultData());
    this.render();
    AT_EDITOR.markDirty();
    document.getElementById("gamePickerModal")?.classList.remove("show");
    setTimeout(() => this.openEditor(AT_STATE.games.length - 1), 150);
  },

  delete(i) {
    if (!confirm(`Hapus game "${AT_STATE.games[i]?.title}"?`)) return;
    AT_STATE.games.splice(i, 1);
    this.render();
    AT_EDITOR.markDirty();
  },

  // ── PREVIEW GAME DI SPLIT VIEW ────────────────────────────────
  previewGame(idx) {
    // 1. Pastikan split view aktif
    if (!AT_SPLITVIEW.active) {
      AT_SPLITVIEW._autoOpened = true;
      AT_SPLITVIEW.toggle();
    }
    // 2. Navigasi ke screen game ke-idx (sgame_0, sgame_1, ...)
    const pageId = 'sgame_' + idx;
    const sel = document.getElementById('splitPageSelect');
    if (sel) sel.value = pageId;
    AT_SPLITVIEW._queueMessage({ goPage: pageId });
    AT_SPLITVIEW._sendToFrame({ goPage: pageId });
    // 3. Update sync indicator
    if (window.AT_PAGE_SYNC) {
      AT_PAGE_SYNC.markManualOverride();
      AT_PAGE_SYNC.updateSyncIndicator(pageId);
    }
  },

  showPicker() {
    const grid = document.getElementById("gamePickerGrid");
    if (!grid) return;
    grid.innerHTML = Object.values(GAME_TYPES).map(T => `
      <div class="mod-type-card" onclick="AT_GAMES.add('${T.id}')">
        <div class="mod-type-card-icon">${T.icon}</div>
        <div class="mod-type-card-label">${T.label}</div>
        <div class="mod-type-card-desc">${T.desc}</div>
      </div>`).join("");
    document.getElementById("gamePickerModal")?.classList.add("show");
  },

  _editIdx: null,
  openEditor(i) {
    this._editIdx = i;
    const g = AT_STATE.games[i];
    if (!g) return;
    const T = GAME_TYPES[g.type];
    const modal = document.getElementById("gameEditorModal");
    document.getElementById("gameEditorTitle").textContent = `${T?.icon||""} Edit: ${T?.label||g.type}`;
    document.getElementById("gameEditorBody").innerHTML = this._buildForm(g, i);
    this._bindForm(g);
    modal?.classList.add("show");
  },

  closeEditor() {
    document.getElementById("gameEditorModal")?.classList.remove("show");
    this._editIdx = null;
    this.render();
  },

  _bindForm(g) {
    const b = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", () => { g[key] = el.value; AT_EDITOR.markDirty(); });
    };
    b("ge_title","title"); b("ge_instruksi","instruksi");
    b("ge_timA","timA"); b("ge_timB","timB");
  },

  _updDeep(key, idx, field, val) {
    const g = AT_STATE.games[this._editIdx];
    if (g?.[key]?.[idx] !== undefined) { g[key][idx][field] = val; AT_EDITOR.markDirty(); }
  },
  _addDeep(key, item) {
    const g = AT_STATE.games[this._editIdx];
    if (!g) return;
    if (!g[key]) g[key] = [];
    g[key].push(item);
    AT_EDITOR.markDirty();
    this.openEditor(this._editIdx);
  },
  _remDeep(key, idx) {
    const g = AT_STATE.games[this._editIdx];
    g?.[key]?.splice(idx, 1);
    AT_EDITOR.markDirty();
    this.openEditor(this._editIdx);
  },

  _buildForm(g, idx) {
    const e = s => String(s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;");
    const titleField = `<div class="field-group"><label class="field-label">Judul Game</label>
      <input class="field-input" id="ge_title" value="${e(g.title)}"></div>`;
    const instr = `<div class="field-group"><label class="field-label">Instruksi</label>
      <input class="field-input" id="ge_instruksi" value="${e(g.instruksi||"")}"></div>`;

    switch (g.type) {

      case "truefalse": return titleField + instr + `
        <div class="divider"></div><div class="at-card-title">📋 Pernyataan</div>
        <div id="ge_list">${(g.pernyataan||[]).map((p,i)=>`
          <div class="sub-item">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">Pernyataan ${i+1}</label>
                <textarea class="field-textarea" rows="2" oninput="AT_GAMES._updDeep('pernyataan',${i},'teks',this.value)">${e(p.teks)}</textarea>
              </div>
              <div class="field-group" style="flex:0 0 100px">
                <label class="field-label">Jawaban</label>
                <select class="field-select" onchange="AT_GAMES._updDeep('pernyataan',${i},'jawaban',this.value==='true')">
                  <option value="true" ${p.jawaban?"selected":""}>✅ BENAR</option>
                  <option value="false" ${!p.jawaban?"selected":""}>❌ SALAH</option>
                </select>
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px" onclick="AT_GAMES._remDeep('pernyataan',${i})">🗑️</button>
            </div>
            <input class="field-input" value="${e(p.penjelasan)}" placeholder="Penjelasan/feedback…" style="margin-top:5px"
              oninput="AT_GAMES._updDeep('pernyataan',${i},'penjelasan',this.value)">
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('pernyataan',{teks:'',jawaban:true,penjelasan:''})">＋ Tambah Pernyataan</button>`;

      case "sorting": return titleField + instr + `
        <div class="divider"></div><div class="at-card-title">📂 Kategori</div>
        <div id="ge_kat">${(g.kategori||[]).map((k,i)=>`
          <div class="sub-item" style="display:flex;gap:8px;align-items:center">
            <input class="field-input" value="${e(k.label)}" placeholder="Label kategori"
              oninput="AT_GAMES._updDeep('kategori',${i},'label',this.value)" style="flex:1">
            <input class="field-input" value="${e(k.id)}" placeholder="ID (tanpa spasi)"
              oninput="AT_GAMES._updDeep('kategori',${i},'id',this.value)" style="width:100px;flex-shrink:0">
            <button class="icon-btn del" onclick="AT_GAMES._remDeep('kategori',${i})">🗑️</button>
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('kategori',{label:'',color:'var(--c)',id:Date.now().toString(36)})">＋ Kategori</button>
        <div class="divider"></div><div class="at-card-title">🃏 Item (dengan kategori tujuan)</div>
        <div id="ge_items">${(g.items||[]).map((item,i)=>`
          <div class="sub-item" style="display:flex;gap:8px;align-items:center">
            <input class="field-input" value="${e(item.teks)}" placeholder="Teks item…" style="flex:1"
              oninput="AT_GAMES._updDeep('items',${i},'teks',this.value)">
            <select class="field-select" style="width:130px;flex-shrink:0"
              onchange="AT_GAMES._updDeep('items',${i},'kategori',this.value)">
              ${(g.kategori||[]).map(k=>`<option value="${k.id}" ${item.kategori===k.id?"selected":""}>${k.label}</option>`).join("")}
            </select>
            <button class="icon-btn del" onclick="AT_GAMES._remDeep('items',${i})">🗑️</button>
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('items',{teks:'',kategori:''})">＋ Item</button>`;

      case "spinwheel": return titleField + instr + `
        <div class="divider"></div><div class="at-card-title">❓ Soal di Roda</div>
        <div id="ge_list">${(g.soal||[]).map((s,i)=>`
          <div class="sub-item">
            <div class="field-row">
              <div class="field-group">
                <textarea class="field-textarea" rows="2" placeholder="Teks pertanyaan…"
                  oninput="AT_GAMES._updDeep('soal',${i},'teks',this.value)">${e(s.teks)}</textarea>
              </div>
              <div class="field-group" style="flex:0 0 110px">
                <label class="field-label">Kategori</label>
                <input class="field-input" value="${e(s.kategori)}" placeholder="Hafalan…"
                  oninput="AT_GAMES._updDeep('soal',${i},'kategori',this.value)">
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px"
                onclick="AT_GAMES._remDeep('soal',${i})">🗑️</button>
            </div>
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('soal',{teks:'',kategori:'Umum'})">＋ Tambah Soal</button>`;

      case "memory": return titleField + instr + `
        <div class="divider"></div><div class="at-card-title">🃏 Pasangan Kartu (A ↔ B)</div>
        <div id="ge_list">${(g.pasangan||[]).map((p,i)=>`
          <div class="sub-item" style="display:flex;gap:8px;align-items:center">
            <input class="field-input" value="${e(p.a)}" placeholder="Kartu A (istilah)"
              oninput="AT_GAMES._updDeep('pasangan',${i},'a',this.value)" style="flex:1">
            <span style="color:var(--muted);padding:0 4px">↔</span>
            <input class="field-input" value="${e(p.b)}" placeholder="Kartu B (definisi)"
              oninput="AT_GAMES._updDeep('pasangan',${i},'b',this.value)" style="flex:2">
            <button class="icon-btn del" onclick="AT_GAMES._remDeep('pasangan',${i})">🗑️</button>
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('pasangan',{a:'',b:''})">＋ Pasangan</button>`;

      case "teambuzzer": return titleField + instr + `
        <div class="field-row">
          <div class="field-group"><label class="field-label">Nama Tim A</label>
            <input class="field-input" id="ge_timA" value="${e(g.timA||"Tim Merah 🔴")}"></div>
          <div class="field-group"><label class="field-label">Nama Tim B</label>
            <input class="field-input" id="ge_timB" value="${e(g.timB||"Tim Biru 🔵")}"></div>
        </div>
        <div class="divider"></div><div class="at-card-title">❓ Soal</div>
        <div id="ge_list">${(g.soal||[]).map((s,i)=>`
          <div class="sub-item">
            <div class="field-row">
              <div class="field-group">
                <textarea class="field-textarea" rows="2" placeholder="Pertanyaan…"
                  oninput="AT_GAMES._updDeep('soal',${i},'teks',this.value)">${e(s.teks)}</textarea>
              </div>
              <div class="field-group" style="flex:0 0 90px">
                <label class="field-label">Poin</label>
                <input class="field-input" type="number" min="5" max="50" value="${s.poin||10}"
                  oninput="AT_GAMES._updDeep('soal',${i},'poin',+this.value)">
              </div>
              <button class="icon-btn del" style="align-self:flex-end;margin-bottom:2px"
                onclick="AT_GAMES._remDeep('soal',${i})">🗑️</button>
            </div>
            <input class="field-input" value="${e(s.jawaban||"")}" placeholder="Kunci jawaban…" style="margin-top:5px"
              oninput="AT_GAMES._updDeep('soal',${i},'jawaban',this.value)">
          </div>`).join("")}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px"
          onclick="AT_GAMES._addDeep('soal',{teks:'',jawaban:'',poin:10})">＋ Tambah Soal</button>`;

      case "wordsearch": return titleField + instr + `
        <div class="field-group"><label class="field-label">Kata yang Disembunyikan (satu per baris, HURUF KAPITAL)</label>
          <textarea class="field-textarea" id="ge_kata" rows="8"
            oninput="AT_GAMES._syncKata(this.value)">${(g.kata||[]).join("\n")}</textarea>
          <div style="font-size:.71rem;color:var(--muted);margin-top:4px">Maksimal 10 kata, masing-masing maks 10 huruf. Grid akan digenerate otomatis.</div>
        </div>
        <div class="field-group"><label class="field-label">Ukuran Grid</label>
          <select class="field-select" id="ge_ukuran" onchange="AT_GAMES._syncUkuran(+this.value)">
            ${[8,10,12,15].map(n=>`<option value="${n}"${g.ukuran===n?" selected":""}>${n}×${n}</option>`).join("")}
          </select>
        </div>`;

      default: return `<p style="color:var(--muted)">Editor untuk tipe "${g.type}" belum tersedia.</p>`;
    }
  },

  _syncKata(val) {
    const g = AT_STATE.games[this._editIdx];
    if (!g) return;
    g.kata = val.split("\n").map(s=>s.trim().toUpperCase()).filter(Boolean).slice(0,10);
    AT_EDITOR.markDirty();
  },
  _syncUkuran(n) {
    const g = AT_STATE.games[this._editIdx];
    if (!g) return;
    g.ukuran = n;
    AT_EDITOR.markDirty();
  },

  applyPreset(typeId) {
    this.ensureState();
    const T = GAME_TYPES[typeId];
    if (!T) return;
    AT_STATE.games.push(T.defaultData());
    this.render();
    AT_EDITOR.markDirty();
    AT_UTIL.toast(`✅ Game "${T.label}" ditambahkan dengan data preset`);
  },

  /* ── HTML RENDERERS untuk export ──────────────────────────── */
  renderGameHtml(g) {
    switch(g.type) {
      case "truefalse":  return this._htmlTrueFalse(g);
      case "sorting":    return this._htmlSorting(g);
      case "spinwheel":  return this._htmlSpinWheel(g);
      case "memory":     return this._htmlMemory(g);
      case "teambuzzer": return this._htmlTeamBuzzer(g);
      case "wordsearch": return this._htmlWordSearch(g);
      default: return "";
    }
  },

  _htmlTrueFalse(g) {
    const id = "tf_" + Math.random().toString(36).slice(2,6);
    const items = (g.pernyataan||[]).map((p,i)=>`
      <div class="game-item" id="${id}_${i}">
        <div style="font-size:.88rem;font-weight:700;line-height:1.5;margin-bottom:10px">${i+1}. ${p.teks}</div>
        <div style="display:flex;gap:10px">
          <button class="tf-btn" id="${id}_t${i}" onclick="tfAns('${id}',${i},true,${p.jawaban})">✅ BENAR</button>
          <button class="tf-btn" id="${id}_f${i}" onclick="tfAns('${id}',${i},false,${p.jawaban})">❌ SALAH</button>
        </div>
        <div id="${id}_fb${i}" style="display:none;margin-top:8px;padding:8px 10px;border-radius:8px;font-size:.79rem;font-weight:700;line-height:1.5"></div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">✅ <span class="hl">${g.title||"Benar atau Salah"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <style>.tf-btn{flex:1;padding:10px;border-radius:10px;font-weight:800;font-size:.84rem;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:var(--text);cursor:pointer;transition:all .18s}.tf-btn:hover{transform:translateY(-1px)}.tf-btn.dis{pointer-events:none}.game-item{background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px}</style>
      <div style="margin-top:14px" id="${id}_cont">${items}</div>
      <div id="${id}_score" style="text-align:center;font-family:Fredoka One,cursive;font-size:1.4rem;color:var(--g);margin-top:12px;display:none"></div>
      <script>(function(){var sc=0,tot=${g.pernyataan?.length||0},ans=0;
      window.tfAns=function(gid,i,chosen,correct){
        if(gid!=='${id}')return;
        var ok=chosen===correct;if(ok)sc++;ans++;
        ['t','f'].forEach(s=>{var b=document.getElementById(gid+'_'+s+i);if(b){b.classList.add('dis');b.style.opacity='.5';}});
        var winner=document.getElementById(gid+'_'+(correct?'t':'f')+i);if(winner)winner.style.cssText+='border-color:var(--g);background:rgba(52,211,153,.12)';
        if(!ok){var loser=document.getElementById(gid+'_'+(correct?'f':'t')+i);if(loser)loser.style.cssText+='border-color:var(--r);background:rgba(255,107,107,.12)';}
        var fb=document.getElementById(gid+'_fb'+i);if(fb){fb.style.display='block';fb.style.cssText+='background:rgba('+(ok?'52,211,153':'255,107,107')+',.1);border:1px solid rgba('+(ok?'52,211,153':'255,107,107')+',.3);color:var('+(ok?'--g':'--r')+')';fb.textContent=(ok?'✅ Benar! ':'❌ Salah. ')+'${(g.pernyataan||[]).map(p=>p.penjelasan||"").join("|")}' .split('|')[i];}
        if(ans===tot){var sd=document.getElementById(gid+'_score');if(sd){sd.style.display='block';sd.textContent=sc+'/'+tot+' Benar — '+Math.round(sc/tot*100)+'%';}}
      };})();<\/script></div>`;
  },

  _htmlSorting(g) {
    const id = "st_" + Math.random().toString(36).slice(2,6);
    const items = [...(g.items||[])].sort(()=>Math.random()-.5);
    return `<div class="card mt14">
      <div class="h2">🔢 <span class="hl">${g.title||"Sortir"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <div style="margin:14px 0;display:flex;flex-wrap:wrap;gap:8px" id="${id}_pool">
        ${items.map((item,i)=>`<div class="sort-chip" id="${id}_chip${i}" draggable="true" data-kat="${item.kategori}"
          ondragstart="stDrag(event,'${id}',${i})">${item.teks}</div>`).join("")}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px" id="${id}_zones">
        ${(g.kategori||[]).map(k=>`
          <div class="sort-zone" id="${id}_zone_${k.id}" data-kat="${k.id}"
            style="border:2px dashed ${k.color}55;background:${k.color}0a;border-radius:12px;min-height:80px;padding:10px"
            ondragover="event.preventDefault()" ondrop="stDrop(event,'${id}','${k.id}')">
            <div style="font-size:.72rem;font-weight:900;color:${k.color};margin-bottom:6px">${k.label}</div>
          </div>`).join("")}
      </div>
      <div id="${id}_result" style="margin-top:10px;text-align:center;font-weight:800;font-size:.88rem;display:none"></div>
      <style>.sort-chip{padding:7px 13px;border-radius:99px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.12);font-size:.8rem;font-weight:700;cursor:grab;transition:all .18s;user-select:none}.sort-chip:hover{background:rgba(255,255,255,.14)}.sort-chip.placed{opacity:.5;pointer-events:none}</style>
      <script>(function(){var correct=0,total=${g.items?.length||0},answers=${JSON.stringify((g.items||[]).map(it=>it.kategori))};
      var chips=${JSON.stringify(items.map(it=>it.kategori))};
      var placed=0;
      window.stDrag=function(ev,gid,idx){if(gid!=='${id}')return;ev.dataTransfer.setData('text',gid+'|'+idx);};
      window.stDrop=function(ev,gid,kat){
        if(gid!=='${id}')return;ev.preventDefault();
        var [,idx]=ev.dataTransfer.getData('text').split('|');idx=+idx;
        var chip=document.getElementById(gid+'_chip'+idx);if(!chip||chip.classList.contains('placed'))return;
        var zone=document.getElementById(gid+'_zone_'+kat);if(!zone)return;
        chip.classList.add('placed');zone.appendChild(chip);placed++;
        var ok=chips[idx]===kat;
        chip.style.borderColor=ok?'var(--g)':'var(--r)';chip.style.background=ok?'rgba(52,211,153,.15)':'rgba(255,107,107,.15)';
        if(ok)correct++;
        if(placed===total){var r=document.getElementById(gid+'_result');if(r){r.style.display='block';r.style.color=correct===total?'var(--g)':'var(--y)';r.textContent=correct+'/'+total+' benar — '+(correct===total?'Sempurna! 🎉':'Coba lagi bagian yang merah!');}}
      };})();<\/script></div>`;
  },

  _htmlSpinWheel(g) {
    const id = "sw_" + Math.random().toString(36).slice(2,6);
    const soal = g.soal || [];
    const cols = ["#f5c842","#38d9d9","#ff5f6d","#a78bfa","#34d399","#fb923c","#60a5fa","#f472b6"];
    const n = soal.length || 1;
    const seg = 360 / n;
    const paths = soal.map((_,i) => {
      const a1 = i*seg, a2 = (i+1)*seg;
      const r = 130, cx = 150, cy = 150;
      const x1 = cx + r*Math.cos((a1-90)*Math.PI/180), y1 = cy + r*Math.sin((a1-90)*Math.PI/180);
      const x2 = cx + r*Math.cos((a2-90)*Math.PI/180), y2 = cy + r*Math.sin((a2-90)*Math.PI/180);
      const large = seg > 180 ? 1 : 0;
      const mid = (a1+a2)/2 - 90;
      const tx = cx + 85*Math.cos(mid*Math.PI/180), ty = cy + 85*Math.sin(mid*Math.PI/180);
      const label = soal[i].kategori || `Q${i+1}`;
      return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2}Z" fill="${cols[i%cols.length]}" stroke="#0e1c2f" stroke-width="2"/>
        <text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="#0e1c2f">${label.slice(0,8)}</text>`;
    }).join("");
    return `<div class="card mt14">
      <div class="h2">🎡 <span class="hl">${g.title||"Roda Putar"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <div style="display:flex;flex-direction:column;align-items:center;margin:16px 0">
        <div style="position:relative;width:300px;height:300px">
          <svg width="300" height="300" id="${id}_wheel" style="transition:transform 4s cubic-bezier(.17,.67,.12,.99)">
            ${paths}
            <circle cx="150" cy="150" r="18" fill="#0e1c2f" stroke="rgba(255,255,255,.2)" stroke-width="2"/>
            <text x="150" y="155" text-anchor="middle" font-size="12" fill="#f5c842" font-weight="900">GO</text>
          </svg>
          <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:1.8rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))">▼</div>
        </div>
        <button class="btn btn-y" style="margin-top:16px" onclick="${id}Spin()">🎡 Putar!</button>
      </div>
      <div id="${id}_result" style="display:none;background:var(--card2);border:2px solid var(--y);border-radius:14px;padding:16px;text-align:center;animation:fadeIn .4s ease">
        <div id="${id}_kat" style="font-size:.72rem;font-weight:900;color:var(--y);margin-bottom:6px;text-transform:uppercase"></div>
        <div id="${id}_q" style="font-size:.92rem;font-weight:700;line-height:1.6"></div>
        <textarea style="width:100%;margin-top:10px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:60px" placeholder="Jawaban siswa…"></textarea>
      </div>
      <script>(function(){var soal=${JSON.stringify(soal)};var n=soal.length;var cur=0;var spinning=false;
      window['${id}Spin']=function(){if(spinning||!n)return;spinning=true;
        var idx=Math.floor(Math.random()*n);cur=idx;
        var rot=1440+idx*(360/n);var wheel=document.getElementById('${id}_wheel');
        var prev=+(wheel.style.transform||'rotate(0deg)').replace(/[^0-9.-]/g,'')||0;
        wheel.style.transform='rotate('+(prev+rot)+'deg)';
        document.getElementById('${id}_result').style.display='none';
        setTimeout(()=>{var s=soal[idx];var rd=document.getElementById('${id}_result');
          document.getElementById('${id}_kat').textContent=s.kategori||'Pertanyaan';
          document.getElementById('${id}_q').textContent=s.teks;
          rd.style.display='block';spinning=false;},4100);
      };})();<\/script></div>`;
  },

  _htmlMemory(g) {
    const id = "mem_" + Math.random().toString(36).slice(2,6);
    const pairs = g.pasangan || [];
    const cards = [];
    pairs.forEach((p,i) => { cards.push({txt:p.a,pair:i,side:"a"}); cards.push({txt:p.b,pair:i,side:"b"}); });
    cards.sort(()=>Math.random()-.5);
    const cardHtml = cards.map((c,i)=>`
      <div class="mem-card" id="${id}_${i}" data-pair="${c.pair}" data-side="${c.side}" onclick="memFlip('${id}',${i})">
        <div class="mem-inner"><div class="mem-back">?</div><div class="mem-front">${c.txt}</div></div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🧠 <span class="hl">${g.title||"Memory"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <style>.mem-card{cursor:pointer;perspective:500px;height:70px}.mem-inner{position:relative;width:100%;height:100%;transition:transform .45s;transform-style:preserve-3d}.mem-card.flip .mem-inner{transform:rotateY(180deg)}.mem-card.matched .mem-inner{transform:rotateY(180deg)}.mem-front,.mem-back{position:absolute;inset:0;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:8px;backface-visibility:hidden;text-align:center;font-size:.78rem;font-weight:700;line-height:1.3}.mem-back{background:var(--card2);border:2px solid var(--border);color:var(--muted);font-size:1.2rem}.mem-front{background:rgba(167,139,250,.12);border:2px solid rgba(167,139,250,.3);color:var(--text);transform:rotateY(180deg)}.mem-card.matched .mem-front{border-color:var(--g);background:rgba(52,211,153,.1)}</style>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px">${cardHtml}</div>
      <div id="${id}_info" style="text-align:center;margin-top:10px;font-size:.8rem;color:var(--muted)">0 / ${pairs.length} pasangan ditemukan</div>
      <script>(function(){var sel=null,selIdx=null,lock=false,found=0,total=${pairs.length};
      var data=${JSON.stringify(cards.map(c=>({pair:c.pair})))};
      window.memFlip=function(gid,i){if(gid!=='${id}'||lock)return;
        var el=document.getElementById(gid+'_'+i);
        if(!el||el.classList.contains('matched')||el.classList.contains('flip'))return;
        el.classList.add('flip');
        if(sel===null){sel=el;selIdx=i;return;}
        lock=true;
        if(data[selIdx].pair===data[i].pair&&selIdx!==i){
          found++;[sel,el].forEach(e=>e.classList.add('matched'));
          document.getElementById(gid+'_info').textContent=found+'/'+total+' pasangan ditemukan'+(found===total?' — Selesai! 🎉':'');
          sel=null;selIdx=null;lock=false;
        } else {
          setTimeout(()=>{[sel,el].forEach(e=>e.classList.remove('flip'));sel=null;selIdx=null;lock=false;},900);
        }
      };})();<\/script></div>`;
  },

  _htmlTeamBuzzer(g) {
    const id = "tb_" + Math.random().toString(36).slice(2,6);
    const soal = g.soal||[];
    return `<div class="card mt14">
      <div class="h2">🏆 <span class="hl">${g.title||"Kuis Tim"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <div id="${id}_scoreboard" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0">
        <div style="background:rgba(255,95,109,.1);border:2px solid rgba(255,95,109,.3);border-radius:12px;padding:14px;text-align:center">
          <div style="font-weight:800;font-size:.88rem;margin-bottom:6px">${g.timA||"Tim A"}</div>
          <div id="${id}_sA" style="font-family:Fredoka One,cursive;font-size:2rem;color:var(--r)">0</div>
        </div>
        <div style="background:rgba(96,165,250,.1);border:2px solid rgba(96,165,250,.3);border-radius:12px;padding:14px;text-align:center">
          <div style="font-weight:800;font-size:.88rem;margin-bottom:6px">${g.timB||"Tim B"}</div>
          <div id="${id}_sB" style="font-family:Fredoka One,cursive;font-size:2rem;color:var(--b)">0</div>
        </div>
      </div>
      <div id="${id}_q" style="background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;font-size:.9rem;font-weight:700;min-height:60px;display:flex;align-items:center;justify-content:center">Klik "Soal Berikutnya" untuk mulai</div>
      <div id="${id}_ans" style="display:none;margin-top:8px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:10px;padding:10px;font-size:.82rem;color:var(--g);font-weight:700"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
        <button class="btn btn-r btn-sm" onclick="${id}Poin('A')">+${soal[0]?.poin||10} ${g.timA||"Tim A"}</button>
        <button class="btn btn-b btn-sm" onclick="${id}Poin('B')">+${soal[0]?.poin||10} ${g.timB||"Tim B"}</button>
      </div>
      <div class="btn-row btn-center" style="margin-top:10px">
        <button class="btn btn-ghost btn-sm" onclick="${id}Next()">Soal Berikutnya →</button>
        <button class="btn btn-ghost btn-sm" onclick="${id}ShowAns()">Lihat Jawaban</button>
      </div>
      <script>(function(){var soal=${JSON.stringify(soal)};var cur=-1,sA=0,sB=0;
      window['${id}Next']=function(){cur++;if(cur>=soal.length){cur=soal.length-1;AT_UTIL?.toast('Semua soal sudah selesai!');}
        var s=soal[cur]||{teks:'Semua soal selesai!',poin:0,jawaban:''};
        document.getElementById('${id}_q').textContent=(cur+1)+'. '+s.teks;
        document.getElementById('${id}_ans').style.display='none';
        var bA=document.querySelector('#${id}_scoreboard~div .btn-r');
        var bB=document.querySelector('#${id}_scoreboard~div .btn-b');
        if(bA)bA.textContent='+'+(s.poin||10)+' ${g.timA||"Tim A"}';
        if(bB)bB.textContent='+'+(s.poin||10)+' ${g.timB||"Tim B"}';
      };
      window['${id}ShowAns']=function(){if(cur<0||cur>=soal.length)return;var a=document.getElementById('${id}_ans');a.style.display='block';a.textContent='✅ Jawaban: '+(soal[cur].jawaban||'-');};
      window['${id}Poin']=function(t){if(cur<0||cur>=soal.length)return;var p=soal[cur].poin||10;
        if(t==='A'){sA+=p;document.getElementById('${id}_sA').textContent=sA;}
        else{sB+=p;document.getElementById('${id}_sB').textContent=sB;}
      };})();<\/script></div>`;
  },

  _htmlWordSearch(g) {
    const id = "ws_" + Math.random().toString(36).slice(2,6);
    const kata = (g.kata||[]).map(k=>k.toUpperCase()).slice(0,10);
    const size = g.ukuran || 10;
    // Build grid with words placed
    const grid = Array.from({length:size},()=>Array(size).fill(""));
    const placed = [];
    const dirs = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];
    kata.forEach(word => {
      let tries = 0;
      while (tries++ < 200) {
        const [dr,dc] = dirs[Math.floor(Math.random()*dirs.length)];
        const r = Math.floor(Math.random()*size);
        const c = Math.floor(Math.random()*size);
        const cells = [];
        let ok = true;
        for (let i=0;i<word.length;i++) {
          const nr=r+dr*i, nc=c+dc*i;
          if (nr<0||nr>=size||nc<0||nc>=size||
             (grid[nr][nc] && grid[nr][nc]!==word[i])) { ok=false; break; }
          cells.push([nr,nc]);
        }
        if (ok) {
          cells.forEach(([nr,nc],i)=>grid[nr][nc]=word[i]);
          placed.push({word, cells});
          break;
        }
      }
    });
    // Fill empties
    const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    grid.forEach(row=>row.forEach((_,j,arr)=>{ if(!arr[j]) arr[j]=abc[Math.floor(Math.random()*26)]; }));
    const gridHtml = grid.map((row,r)=>
      `<div style="display:flex">${row.map((ch,c)=>
        `<div class="ws-cell" id="${id}_${r}_${c}" onclick="wsClick('${id}',${r},${c})">${ch}</div>`
      ).join("")}</div>`
    ).join("");
    const solutionMap = {};
    placed.forEach(({word,cells})=>cells.forEach(([r,c])=>{ if(!solutionMap[`${r},${c}`]) solutionMap[`${r},${c}`]=word; }));
    return `<div class="card mt14">
      <div class="h2">🔍 <span class="hl">${g.title||"Word Search"}</span></div>
      ${g.instruksi?`<p class="sub mt8">${g.instruksi}</p>`:""}
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0">${kata.map(k=>`<span id="${id}_w_${k}" class="chip chip-muted">${k}</span>`).join("")}</div>
      <style>.ws-cell{width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:700;cursor:pointer;border-radius:5px;transition:all .15s;border:1px solid transparent;user-select:none}.ws-cell:hover{background:rgba(245,200,66,.15)}.ws-cell.sel{background:rgba(245,200,66,.25);border-color:var(--y)}.ws-cell.found{background:rgba(52,211,153,.2);border-color:var(--g);color:var(--g);pointer-events:none}</style>
      <div style="overflow-x:auto;margin:10px 0"><div style="display:inline-block">${gridHtml}</div></div>
      <div id="${id}_msg" style="text-align:center;font-size:.82rem;font-weight:700;color:var(--muted);margin-top:8px">0 / ${kata.length} kata ditemukan</div>
      <script>(function(){
        var solution=${JSON.stringify(solutionMap)};
        var kata=${JSON.stringify(kata)};var found=new Set();
        var sel=[],selStart=null;
        window.wsClick=function(gid,r,c){if(gid!=='${id}')return;
          var key=r+','+c;var el=document.getElementById(gid+'_'+r+'_'+c);
          if(!el||el.classList.contains('found'))return;
          if(sel.length===0){sel=[[r,c]];selStart=[r,c];el.classList.add('sel');}
          else{
            sel.push([r,c]);el.classList.add('sel');
            // Check if selection spells a word
            var word=sel.map(([rr,cc])=>document.getElementById(gid+'_'+rr+'_'+cc)?.textContent||'').join('');
            var wordRev=[...word].reverse().join('');
            var match=kata.find(k=>k===word||k===wordRev);
            if(match){
              found.add(match);
              sel.forEach(([rr,cc])=>{var ce=document.getElementById(gid+'_'+rr+'_'+cc);if(ce){ce.classList.remove('sel');ce.classList.add('found');}});
              var wspan=document.getElementById(gid+'_w_'+match);if(wspan)wspan.style.cssText='background:rgba(52,211,153,.15);color:var(--g);border:1px solid rgba(52,211,153,.3);text-decoration:line-through';
              document.getElementById(gid+'_msg').textContent=found.size+'/'+kata.length+' kata ditemukan'+(found.size===kata.length?' — Semua ditemukan! 🎉':'');
              sel=[];selStart=null;
            } else if(sel.length>12){
              sel.forEach(([rr,cc])=>document.getElementById(gid+'_'+rr+'_'+cc)?.classList.remove('sel'));
              sel=[];selStart=null;
            }
          }
        };
      })();<\/script></div>`;
  },
};

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  if (!AT_STATE.games) AT_STATE.games = [];
  ["gamePickerModal","gameEditorModal"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", e => {
      if (e.target === el) {
        el.classList.remove("show");
        if (id === "gameEditorModal") AT_GAMES.closeEditor();
      }
    });
  });
});

console.log("✅ games.js loaded — 6 tipe game siap");
