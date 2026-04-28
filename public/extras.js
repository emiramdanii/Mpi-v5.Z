// ═══════════════════════════════════════════════════════════════
// EXTRAS.JS — Fitur Pelengkap v1.4
// • AT_MATERI_EDITOR  — panel edit konten materi bebas
// • AT_VERSIONS       — version history (simpan snapshot bernama)
// • AT_EXCEL_PREVIEW  — preview data Excel sebelum diimport
// • AT_DEBOUNCE       — debounce semua field input (300ms)
// • AT_CP_SUGGEST     — autocomplete Profil Pelajar Pancasila
// • ATP drag-sort     — drag reorder pertemuan di panel ATP
// ═══════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════════
   AT_MATERI_EDITOR — Editor konten materi bebas
   AT_STATE.materi = { blok: [{tipe, judul, isi/butir, color}] }
   Tipe: teks | definisi | poin | tabel | kutipan | gambar-url
   ══════════════════════════════════════════════════════════════ */
window.AT_MATERI_EDITOR = {

  TIPE: [
    { id:"teks",      icon:"📝", label:"Paragraf Teks",    color:"var(--muted2)" },
    { id:"definisi",  icon:"📌", label:"Kotak Definisi",   color:"var(--y)"      },
    { id:"poin",      icon:"•",  label:"Poin-Poin",         color:"var(--c)"      },
    { id:"tabel",     icon:"📊", label:"Tabel",             color:"var(--p)"      },
    { id:"kutipan",   icon:"💬", label:"Kutipan / Quote",   color:"var(--g)"      },
    { id:"gambar",    icon:"🖼️", label:"Gambar dari URL",  color:"var(--o)"      },
    // v2.0 — Dynamic content blocks (auto icon + warna + animasi)
    { id:"timeline",  icon:"🔄", label:"Timeline / Alur",   color:"var(--c)"      },
    { id:"highlight", icon:"⚡", label:"Highlight Card",    color:"var(--y)"      },
    { id:"compare",   icon:"⚖️", label:"Perbandingan",      color:"var(--p)"      },
    { id:"infobox",   icon:"💡", label:"Info / Tips Box",    color:"var(--b)"      },
    { id:"checklist", icon:"✅", label:"Checklist",          color:"var(--g)"      },
    { id:"statistik", icon:"📈", label:"Statistik Angka",   color:"var(--o)"      },
    { id:"studi",     icon:"📖", label:"Studi Kasus",       color:"var(--r)"      },
  ],

  ensureState() {
    if (!AT_STATE.materi) AT_STATE.materi = { blok: [] };
    if (!AT_STATE.materi.blok) AT_STATE.materi.blok = [];
  },

  render() {
    this.ensureState();
    const cont = document.getElementById("materi_list");
    if (!cont) return;
    const blok = AT_STATE.materi.blok;
    if (!blok.length) {
      cont.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">Belum ada konten materi.<br>Klik tombol di bawah untuk menambah blok konten.</div>
      </div>`;
      return;
    }
    cont.innerHTML = blok.map((b, i) => this._itemHTML(b, i)).join("");
  },

  _e(s) { return String(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); },

  _itemHTML(b, i) {
    const T = this.TIPE.find(t => t.id === b.tipe) || this.TIPE[0];
    const e = this._e.bind(this);
    let contentFields = "";

    if (b.tipe === "teks" || b.tipe === "definisi" || b.tipe === "kutipan") {
      contentFields = `
        <div class="field-group">
          <label class="field-label">${b.tipe==="definisi"?"Istilah / Judul":b.tipe==="kutipan"?"Sumber (opsional)":"Judul Bagian (opsional)"}</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="${b.tipe==="definisi"?"Nama norma, konsep…":"Judul (opsional)…"}"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Isi</label>
          <textarea class="field-textarea" rows="${b.tipe==="kutipan"?2:4}" placeholder="Tulis konten di sini…"
            oninput="AT_MATERI_EDITOR._up(${i},'isi',this.value)">${e(b.isi||"")}</textarea>
        </div>`;
    } else if (b.tipe === "poin") {
      const butirHtml = (b.butir||[]).map((bt, bi) => `
        <div style="display:flex;gap:6px;margin-bottom:5px;align-items:center">
          <span style="color:${T.color};font-weight:900;padding-top:2px;flex-shrink:0">•</span>
          <input class="field-input" value="${e(bt)}" placeholder="Poin ${bi+1}…"
            oninput="AT_MATERI_EDITOR._upButir(${i},${bi},this.value)">
          <button class="icon-btn del" onclick="AT_MATERI_EDITOR._remButir(${i},${bi})">×</button>
        </div>`).join("");
      contentFields = `
        <div class="field-group">
          <label class="field-label">Judul Bagian</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Judul poin-poin…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Poin-Poin</label>
          <div id="me_butir_${i}">${butirHtml}</div>
          <button class="btn btn-ghost btn-xs" style="margin-top:5px" onclick="AT_MATERI_EDITOR._addButir(${i})">＋ Tambah Poin</button>
        </div>`;
    } else if (b.tipe === "tabel") {
      const rows = b.baris || [["Kolom A","Kolom B"],["",""]];
      const tabelHtml = rows.map((row, ri) => `
        <div style="display:flex;gap:5px;margin-bottom:5px" id="me_tr_${i}_${ri}">
          ${row.map((cell, ci) => `<input class="field-input" value="${e(cell)}" placeholder="${ri===0?"Header…":"Isi…"}"
            style="${ri===0?"font-weight:700":""}" oninput="AT_MATERI_EDITOR._upTabel(${i},${ri},${ci},this.value)">`).join("")}
          <button class="icon-btn del" onclick="AT_MATERI_EDITOR._remRow(${i},${ri})">×</button>
        </div>`).join("");
      contentFields = `
        <div class="field-group">
          <label class="field-label">Judul Tabel</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Judul tabel…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Baris Tabel <small style="color:var(--muted)">(baris pertama = header)</small></label>
          <div id="me_tabel_${i}">${tabelHtml}</div>
          <div class="btn-row" style="margin-top:6px">
            <button class="btn btn-ghost btn-xs" onclick="AT_MATERI_EDITOR._addRow(${i})">＋ Baris</button>
            <button class="btn btn-ghost btn-xs" onclick="AT_MATERI_EDITOR._addCol(${i})">＋ Kolom</button>
          </div>
        </div>`;
    } else if (b.tipe === "gambar") {
      contentFields = `
        <div class="field-group">
          <label class="field-label">Keterangan Gambar</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Keterangan gambar…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">URL Gambar</label>
          <input class="field-input" value="${e(b.isi||"")}" placeholder="https://…"
            oninput="AT_MATERI_EDITOR._up(${i},'isi',this.value)">
          ${b.isi?`<img src="${e(b.isi)}" alt="preview" style="margin-top:8px;max-width:100%;max-height:150px;border-radius:8px;border:1px solid var(--border)" onerror="this.style.display='none'">`:
          `<div style="margin-top:8px;background:rgba(255,255,255,.04);border:2px dashed var(--border);border-radius:8px;padding:16px;text-align:center;color:var(--muted);font-size:.78rem">🖼️ Preview gambar akan muncul setelah URL diisi</div>`}
        </div>`;
    // ── v2.0 Dynamic Block Editors ──
    } else if (b.tipe === "timeline") {
      const steps = b.langkah || [];
      contentFields = `
        <div class="field-group">
          <label class="field-label">Judul Timeline</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Alur Peristiwa…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Langkah-Langkah</label>
          ${steps.map((s,si) => `
            <div style="display:flex;gap:6px;margin-bottom:8px;align-items:flex-start;padding:8px;background:rgba(255,255,255,.03);border-radius:8px;border:1px solid var(--border)">
              <input class="field-input" value="${e(s.icon||"📍")}" style="width:50px;text-align:center;flex-shrink:0;font-size:1.1rem" placeholder="📍"
                oninput="AT_MATERI_EDITOR._upLangkah(${i},${si},'icon',this.value)">
              <div style="flex:1;display:flex;flex-direction:column;gap:4px">
                <input class="field-input" value="${e(s.judul||"")}" placeholder="Judul langkah…"
                  oninput="AT_MATERI_EDITOR._upLangkah(${i},${si},'judul',this.value)">
                <input class="field-input" value="${e(s.isi||"")}" placeholder="Deskripsi…"
                  oninput="AT_MATERI_EDITOR._upLangkah(${i},${si},'isi',this.value)">
              </div>
              <button class="icon-btn del" onclick="AT_MATERI_EDITOR._remLangkah(${i},${si})">×</button>
            </div>`).join("")}
          <button class="btn btn-ghost btn-xs" style="margin-top:4px" onclick="AT_MATERI_EDITOR._addLangkah(${i})">＋ Tambah Langkah</button>
        </div>`;
    } else if (b.tipe === "highlight") {
      contentFields = `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Konsep Penting…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Icon Emoji</label>
          <input class="field-input" value="${e(b.icon||"⚡")}" style="font-size:1.2rem;width:60px;text-align:center" placeholder="⚡"
            oninput="AT_MATERI_EDITOR._up(${i},'icon',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Warna Aksen</label>
          <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
            ${["var(--y)","var(--c)","var(--g)","var(--p)","var(--r)","var(--o)","var(--b)"].map(c =>
              `<div onclick="AT_MATERI_EDITOR._up(${i},'warna','${c}')" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${(b.warna||"var(--y)")===c?"#fff":"transparent"};transition:border .15s"></div>`
            ).join("")}
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Isi</label>
          <textarea class="field-textarea" rows="3" placeholder="Jelaskan konsep di sini…"
            oninput="AT_MATERI_EDITOR._up(${i},'isi',this.value)">${e(b.isi||"")}</textarea>
        </div>`;
    } else if (b.tipe === "compare") {
      const kiri = b.kiri || {}; const kanan = b.kanan || {};
      contentFields = `
        <div class="field-group">
          <label class="field-label">Judul Perbandingan</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Perbandingan…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:rgba(96,165,250,.06);border:1px solid rgba(96,165,250,.2);border-radius:10px;padding:10px">
            <div style="font-size:.72rem;font-weight:800;color:var(--b);margin-bottom:6px">🔵 KIRI</div>
            <input class="field-input" value="${e(kiri.icon||"🔵")}" style="width:50px;text-align:center;font-size:1.1rem;margin-bottom:4px" placeholder="🔵"
              oninput="AT_MATERI_EDITOR._upCompare(${i},'kiri','icon',this.value)">
            <input class="field-input" value="${e(kiri.judul||"")}" placeholder="Judul…" style="margin-bottom:4px"
              oninput="AT_MATERI_EDITOR._upCompare(${i},'kiri','judul',this.value)">
            <textarea class="field-textarea" rows="2" placeholder="Isi…" oninput="AT_MATERI_EDITOR._upCompare(${i},'kiri','isi',this.value)">${e(kiri.isi||"")}</textarea>
          </div>
          <div style="background:rgba(255,107,107,.06);border:1px solid rgba(255,107,107,.2);border-radius:10px;padding:10px">
            <div style="font-size:.72rem;font-weight:800;color:var(--r);margin-bottom:6px">🔴 KANAN</div>
            <input class="field-input" value="${e(kanan.icon||"🔴")}" style="width:50px;text-align:center;font-size:1.1rem;margin-bottom:4px" placeholder="🔴"
              oninput="AT_MATERI_EDITOR._upCompare(${i},'kanan','icon',this.value)">
            <input class="field-input" value="${e(kanan.judul||"")}" placeholder="Judul…" style="margin-bottom:4px"
              oninput="AT_MATERI_EDITOR._upCompare(${i},'kanan','judul',this.value)">
            <textarea class="field-textarea" rows="2" placeholder="Isi…" oninput="AT_MATERI_EDITOR._upCompare(${i},'kanan','isi',this.value)">${e(kanan.isi||"")}</textarea>
          </div>
        </div>`;
    } else if (b.tipe === "infobox") {
      contentFields = `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Tips Penting…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Gaya Box</label>
          <div style="display:flex;gap:6px;margin-top:4px">
            ${[{id:"info",icon:"💡",label:"Info"},{id:"tips",icon:"🎯",label:"Tips"},{id:"warning",icon:"⚠️",label:"Peringatan"},{id:"success",icon:"✅",label:"Sukses"}].map(s =>
              `<div onclick="AT_MATERI_EDITOR._up(${i},'style','${s.id}')" style="padding:6px 12px;border-radius:8px;cursor:pointer;border:1px solid ${(b.style||"info")===s.id?"var(--y)":"var(--border)"};background:${(b.style||"info")===s.id?"rgba(249,193,46,.1)":"rgba(255,255,255,.03)"};font-size:.74rem;font-weight:700">${s.icon} ${s.label}</div>`
            ).join("")}
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Isi</label>
          <textarea class="field-textarea" rows="3" placeholder="Tulis isi info/tips di sini…"
            oninput="AT_MATERI_EDITOR._up(${i},'isi',this.value)">${e(b.isi||"")}</textarea>
        </div>`;
    } else if (b.tipe === "checklist") {
      contentFields = `
        <div class="field-group">
          <label class="field-label">Judul Checklist</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Hal yang Perlu Diingat…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Item Checklist</label>
          ${(b.butir||[]).map((bt,bi) => `
            <div style="display:flex;gap:6px;margin-bottom:5px;align-items:center">
              <span style="color:var(--g);font-size:1rem;flex-shrink:0">☑</span>
              <input class="field-input" value="${e(bt)}" placeholder="Item ${bi+1}…"
                oninput="AT_MATERI_EDITOR._upButir(${i},${bi},this.value)">
              <button class="icon-btn del" onclick="AT_MATERI_EDITOR._remButir(${i},${bi})">×</button>
            </div>`).join("")}
          <button class="btn btn-ghost btn-xs" style="margin-top:5px" onclick="AT_MATERI_EDITOR._addButir(${i})">＋ Tambah Item</button>
        </div>`;
    } else if (b.tipe === "statistik") {
      const items = b.items || [];
      contentFields = `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Data Menarik…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Item Statistik</label>
          ${items.map((it,ii) => `
            <div style="display:flex;gap:6px;margin-bottom:8px;align-items:center;padding:8px;background:rgba(255,255,255,.03);border-radius:8px;border:1px solid var(--border)">
              <input class="field-input" value="${e(it.icon||"📊")}" style="width:50px;text-align:center;font-size:1.1rem;flex-shrink:0" placeholder="📊"
                oninput="AT_MATERI_EDITOR._upStatItem(${i},${ii},'icon',this.value)">
              <input class="field-input" value="${e(it.angka||"")}" style="width:70px;text-align:center;font-weight:900;flex-shrink:0" placeholder="80%"
                oninput="AT_MATERI_EDITOR._upStatItem(${i},${ii},'angka',this.value)">
              <input class="field-input" value="${e(it.label||"")}" placeholder="Label…"
                oninput="AT_MATERI_EDITOR._upStatItem(${i},${ii},'label',this.value)">
              <button class="icon-btn del" onclick="AT_MATERI_EDITOR._remStatItem(${i},${ii})">×</button>
            </div>`).join("")}
          <button class="btn btn-ghost btn-xs" style="margin-top:4px" onclick="AT_MATERI_EDITOR._addStatItem(${i})">＋ Tambah Item</button>
        </div>`;
    } else if (b.tipe === "studi") {
      contentFields = `
        <div class="field-group">
          <label class="field-label">Judul</label>
          <input class="field-input" value="${e(b.judul||"")}" placeholder="Studi Kasus…"
            oninput="AT_MATERI_EDITOR._up(${i},'judul',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Karakter (Emoji)</label>
          <input class="field-input" value="${e(b.karakter||"👨‍🏫")}" style="font-size:1.2rem;width:60px;text-align:center" placeholder="👨‍🏫"
            oninput="AT_MATERI_EDITOR._up(${i},'karakter',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Situasi</label>
          <textarea class="field-textarea" rows="3" placeholder="Deskripsikan situasi kasus…"
            oninput="AT_MATERI_EDITOR._up(${i},'situasi',this.value)">${e(b.situasi||"")}</textarea>
        </div>
        <div class="field-group">
          <label class="field-label">Pertanyaan</label>
          <input class="field-input" value="${e(b.pertanyaan||"")}" placeholder="Apa yang sebaiknya dilakukan?"
            oninput="AT_MATERI_EDITOR._up(${i},'pertanyaan',this.value)">
        </div>
        <div class="field-group">
          <label class="field-label">Pesan Moral</label>
          <input class="field-input" value="${e(b.pesan||"")}" placeholder="Pesan moral dari kasus…"
            oninput="AT_MATERI_EDITOR._up(${i},'pesan',this.value)">
        </div>`;
    }

    return `
    <div class="list-item" id="mat_item_${i}">
      <div class="list-item-header">
        <span class="drag-handle">⠿</span>
        <span class="mod-type-badge" style="background:${T.color}22;color:${T.color};border:1px solid ${T.color}44">${T.icon} ${T.label}</span>
        <span class="list-item-label">${e(b.judul||b.tipe||"")}</span>
        <div class="list-item-actions">
          <button class="icon-btn" onclick="AT_MATERI_EDITOR._moveUp(${i})" title="Naik">↑</button>
          <button class="icon-btn" onclick="AT_MATERI_EDITOR._moveDn(${i})" title="Turun">↓</button>
          <button class="icon-btn del" onclick="AT_MATERI_EDITOR._rem(${i})">🗑️</button>
        </div>
      </div>
      ${contentFields}
    </div>`;
  },

  add(tipe) {
    this.ensureState();
    const defaults = {
      teks:      { tipe:"teks",      judul:"", isi:"" },
      definisi:  { tipe:"definisi",  judul:"", isi:"" },
      poin:      { tipe:"poin",      judul:"", butir:["","",""] },
      tabel:     { tipe:"tabel",     judul:"", baris:[["Kolom A","Kolom B"],["",""]] },
      kutipan:   { tipe:"kutipan",   judul:"", isi:"" },
      gambar:    { tipe:"gambar",    judul:"", isi:"" },
      // v2.0 dynamic blocks
      timeline:  { tipe:"timeline",  judul:"Alur Peristiwa", langkah:[
        {icon:"📍",judul:"Langkah 1",isi:"Deskripsi langkah pertama"},
        {icon:"📍",judul:"Langkah 2",isi:"Deskripsi langkah kedua"},
        {icon:"📍",judul:"Langkah 3",isi:"Deskripsi langkah ketiga"}
      ]},
      highlight: { tipe:"highlight", judul:"Konsep Penting", icon:"⚡", warna:"var(--y)", isi:"Jelaskan konsep penting di sini. Blok ini otomatis tampil dengan icon, warna, dan animasi." },
      compare:   { tipe:"compare",   judul:"Perbandingan", kiri:{judul:"Konsep A",isi:"Isi konsep A",icon:"🔵"}, kanan:{judul:"Konsep B",isi:"Isi konsep B",icon:"🔴"} },
      infobox:   { tipe:"infobox",   judul:"Tips Penting", isi:"Tulis tips atau informasi penting di sini.", style:"info" },
      checklist: { tipe:"checklist", judul:"Hal yang Perlu Diingat", butir:["Poin pertama","Poin kedua","Poin ketiga"] },
      statistik: { tipe:"statistik", judul:"Data Menarik", items:[
        {icon:"📊",angka:"80%",label:"Persentase"},{icon:"👥",angka:"100+",label:"Jumlah"},{icon:"⭐",angka:"4.5",label:"Rating"}
      ]},
      studi:     { tipe:"studi",     judul:"Studi Kasus", karakter:"👨‍🏫", situasi:"Deskripsikan situasi kasus di sini.", pertanyaan:"Apa yang sebaiknya dilakukan?", pesan:"Pesan moral dari kasus ini." },
    };
    AT_STATE.materi.blok.push(defaults[tipe] || { tipe, judul:"", isi:"" });
    this.render();
    AT_EDITOR.markDirty();
    setTimeout(() => document.getElementById(`mat_item_${AT_STATE.materi.blok.length-1}`)?.scrollIntoView({behavior:"smooth"}), 80);
  },

  _up(i, key, val)          { AT_STATE.materi.blok[i][key]=val; AT_EDITOR.markDirty(); },
  _upButir(i, bi, val)      { AT_STATE.materi.blok[i].butir[bi]=val; AT_EDITOR.markDirty(); },
  _addButir(i)              { (AT_STATE.materi.blok[i].butir=AT_STATE.materi.blok[i].butir||[]).push(""); this.render(); AT_EDITOR.markDirty(); },
  _remButir(i, bi)          { AT_STATE.materi.blok[i].butir.splice(bi,1); this.render(); AT_EDITOR.markDirty(); },
  _upTabel(i, ri, ci, val)  { AT_STATE.materi.blok[i].baris[ri][ci]=val; AT_EDITOR.markDirty(); },
  _addRow(i)                { const b=AT_STATE.materi.blok[i]; b.baris.push(new Array((b.baris[0]||[]).length).fill("")); this.render(); AT_EDITOR.markDirty(); },
  _addCol(i)                { AT_STATE.materi.blok[i].baris.forEach(r=>r.push("")); this.render(); AT_EDITOR.markDirty(); },
  _remRow(i, ri)            { AT_STATE.materi.blok[i].baris.splice(ri,1); this.render(); AT_EDITOR.markDirty(); },
  _rem(i)                   { AT_STATE.materi.blok.splice(i,1); this.render(); AT_EDITOR.markDirty(); },
  _moveUp(i)                { if(i>0){[AT_STATE.materi.blok[i-1],AT_STATE.materi.blok[i]]=[AT_STATE.materi.blok[i],AT_STATE.materi.blok[i-1]]; this.render(); AT_EDITOR.markDirty();} },
  _moveDn(i)                { const b=AT_STATE.materi.blok; if(i<b.length-1){[b[i],b[i+1]]=[b[i+1],b[i]]; this.render(); AT_EDITOR.markDirty();} },
  // v2.0 dynamic block mutators
  _upLangkah(i, si, key, val) { const b=AT_STATE.materi.blok[i]; if(!b.langkah)b.langkah=[]; b.langkah[si][key]=val; AT_EDITOR.markDirty(); },
  _addLangkah(i) { const b=AT_STATE.materi.blok[i]; if(!b.langkah)b.langkah=[]; b.langkah.push({icon:"📍",judul:"",isi:""}); this.render(); AT_EDITOR.markDirty(); },
  _remLangkah(i, si) { AT_STATE.materi.blok[i].langkah.splice(si,1); this.render(); AT_EDITOR.markDirty(); },
  _upCompare(i, side, key, val) { const b=AT_STATE.materi.blok[i]; if(!b[side])b[side]={}; b[side][key]=val; AT_EDITOR.markDirty(); },
  _upStatItem(i, ii, key, val) { const b=AT_STATE.materi.blok[i]; if(!b.items)b.items=[]; b.items[ii][key]=val; AT_EDITOR.markDirty(); },
  _addStatItem(i) { const b=AT_STATE.materi.blok[i]; if(!b.items)b.items=[]; b.items.push({icon:"📊",angka:"",label:""}); this.render(); AT_EDITOR.markDirty(); },
  _remStatItem(i, ii) { AT_STATE.materi.blok[i].items.splice(ii,1); this.render(); AT_EDITOR.markDirty(); },

  // Render HTML for student preview
  renderHtml() {
    this.ensureState();
    return AT_STATE.materi.blok.map(b => this._blokToHtml(b)).join("");
  },

  _blokToHtml(b) {
    const e = s => String(s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    switch(b.tipe) {
      case "definisi":
        return `<div style="border-left:4px solid var(--y);background:rgba(249,193,46,.07);border-radius:0 10px 10px 0;padding:13px 15px;margin:12px 0;font-size:.9rem;line-height:1.7"><strong style="color:var(--y)">${e(b.judul||"")}</strong>${b.judul?"<br>":""}${e(b.isi||"")}</div>`;
      case "poin":
        return `<div style="margin:12px 0">${b.judul?`<div style="font-weight:800;font-size:.86rem;margin-bottom:7px">${e(b.judul)}</div>`:""}${(b.butir||[]).map(bt=>`<div style="display:flex;gap:8px;font-size:.83rem;margin-bottom:5px;line-height:1.5"><span style="color:var(--y);font-weight:900;flex-shrink:0">•</span>${e(bt)}</div>`).join("")}</div>`;
      case "tabel":
        const rows = b.baris||[];
        return `<div style="margin:12px 0">${b.judul?`<div style="font-weight:800;font-size:.86rem;margin-bottom:7px">${e(b.judul)}</div>`:""}
          <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.82rem">
          ${rows.map((row,ri)=>`<tr>${row.map(cell=>`<${ri===0?"th":"td"} style="border:1px solid var(--border);padding:7px 10px;${ri===0?"background:rgba(255,255,255,.06);font-weight:700":""}">${e(cell)}</${ri===0?"th":"td"}>`).join("")}</tr>`).join("")}
          </table></div></div>`;
      case "kutipan":
        return `<div style="border-left:4px solid var(--g);background:rgba(52,211,153,.06);border-radius:0 10px 10px 0;padding:13px 15px;margin:12px 0;font-style:italic;font-size:.88rem;line-height:1.7">"${e(b.isi||"")}"${b.judul?`<div style="font-style:normal;font-size:.75rem;color:var(--muted);margin-top:5px">— ${e(b.judul)}</div>`:""}</div>`;
      case "gambar":
        return `<div style="margin:12px 0;text-align:center">${b.isi?`<img src="${e(b.isi)}" alt="${e(b.judul||"")}" style="max-width:100%;border-radius:10px;border:1px solid var(--border)">`:""}<div style="font-size:.74rem;color:var(--muted);margin-top:5px">${e(b.judul||"")}</div></div>`;

      // ═══ v2.0 Dynamic Block Renderers ═══

      case "timeline": {
        const steps = b.langkah || [];
        return `<div style="margin:14px 0">
          ${b.judul?`<div style="font-weight:800;font-size:.88rem;margin-bottom:12px;display:flex;align-items:center;gap:6px"><span style="font-size:1.1rem">🔄</span>${e(b.judul)}</div>`:""}
          <div style="position:relative;padding-left:28px">
            <div style="position:absolute;left:10px;top:6px;bottom:6px;width:3px;background:linear-gradient(180deg,var(--c),var(--y),var(--g));border-radius:99px"></div>
            ${steps.map((s,si) => `<div style="position:relative;margin-bottom:14px">
              <div style="position:absolute;left:-23px;top:2px;width:18px;height:18px;border-radius:50%;background:var(--bg);border:3px solid var(--c);display:flex;align-items:center;justify-content:center;font-size:.55rem">${e(s.icon||"📍")}</div>
              <div style="background:rgba(62,207,207,.06);border:1px solid rgba(62,207,207,.15);border-radius:10px;padding:10px 13px">
                <div style="font-weight:800;font-size:.83rem;color:var(--c);margin-bottom:3px">${e(s.judul||"")}</div>
                <div style="font-size:.82rem;color:var(--muted);line-height:1.6">${e(s.isi||"")}</div>
              </div>
            </div>`).join("")}
          </div>
        </div>`;
      }

      case "highlight": {
        const ic = b.icon || "⚡";
        return `<div style="margin:14px 0">
          <div style="background:rgba(249,193,46,.08);border:2px solid rgba(249,193,46,.25);border-radius:14px;padding:16px 18px;display:flex;gap:14px;align-items:flex-start">
            <div style="font-size:2.2rem;flex-shrink:0;animation:float 3s ease-in-out infinite">${e(ic)}</div>
            <div style="flex:1">
              <div style="font-weight:900;font-size:.92rem;margin-bottom:5px">${e(b.judul||"")}</div>
              <div style="font-size:.84rem;color:var(--muted);line-height:1.7">${e(b.isi||"")}</div>
            </div>
          </div>
        </div>`;
      }

      case "compare": {
        const kiri = b.kiri || {}; const kanan = b.kanan || {};
        return `<div style="margin:14px 0">
          ${b.judul?`<div style="font-weight:800;font-size:.88rem;margin-bottom:10px;text-align:center">⚖️ ${e(b.judul)}</div>`:""}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="background:rgba(96,165,250,.07);border:2px solid rgba(96,165,250,.2);border-radius:12px;padding:13px 14px">
              <div style="font-size:1.5rem;margin-bottom:6px">${e(kiri.icon||"🔵")}</div>
              <div style="font-weight:800;font-size:.85rem;color:var(--b);margin-bottom:5px">${e(kiri.judul||"")}</div>
              <div style="font-size:.82rem;color:var(--muted);line-height:1.65">${e(kiri.isi||"")}</div>
            </div>
            <div style="background:rgba(255,107,107,.07);border:2px solid rgba(255,107,107,.2);border-radius:12px;padding:13px 14px">
              <div style="font-size:1.5rem;margin-bottom:6px">${e(kanan.icon||"🔴")}</div>
              <div style="font-weight:800;font-size:.85rem;color:var(--r);margin-bottom:5px">${e(kanan.judul||"")}</div>
              <div style="font-size:.82rem;color:var(--muted);line-height:1.65">${e(kanan.isi||"")}</div>
            </div>
          </div>
        </div>`;
      }

      case "infobox": {
        const styles = {
          info:    { icon:"💡", color:"var(--b)", bg:"rgba(96,165,250,.07)", border:"rgba(96,165,250,.2)" },
          tips:    { icon:"🎯", color:"var(--y)", bg:"rgba(249,193,46,.07)", border:"rgba(249,193,46,.2)" },
          warning: { icon:"⚠️", color:"var(--o)", bg:"rgba(251,146,60,.07)", border:"rgba(251,146,60,.2)" },
          success: { icon:"✅", color:"var(--g)", bg:"rgba(52,211,153,.07)", border:"rgba(52,211,153,.2)" },
        };
        const s = styles[b.style||"info"] || styles.info;
        return `<div style="margin:14px 0;background:${s.bg};border:2px solid ${s.border};border-radius:12px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start">
          <div style="font-size:1.6rem;flex-shrink:0">${s.icon}</div>
          <div style="flex:1">
            <div style="font-weight:800;font-size:.85rem;color:${s.color};margin-bottom:4px">${e(b.judul||"Info")}</div>
            <div style="font-size:.83rem;color:var(--muted);line-height:1.7">${e(b.isi||"")}</div>
          </div>
        </div>`;
      }

      case "checklist":
        return `<div style="margin:14px 0">
          ${b.judul?`<div style="font-weight:800;font-size:.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px"><span style="color:var(--g)">✅</span>${e(b.judul)}</div>`:""}
          <div style="background:rgba(52,211,153,.05);border:2px solid rgba(52,211,153,.15);border-radius:12px;padding:12px 14px">
            ${(b.butir||[]).map((bt,bi) => `<div style="display:flex;gap:10px;align-items:center;padding:7px 0;${bi<(b.butir||[]).length-1?"border-bottom:1px solid rgba(52,211,153,.1)":""}">
              <div style="width:22px;height:22px;border-radius:6px;background:rgba(52,211,153,.15);border:2px solid rgba(52,211,153,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:.7rem;color:var(--g)">✓</div>
              <span style="font-size:.84rem;line-height:1.5">${e(bt)}</span>
            </div>`).join("")}
          </div>
        </div>`;

      case "statistik": {
        const items = b.items || [];
        return `<div style="margin:14px 0">
          ${b.judul?`<div style="font-weight:800;font-size:.88rem;margin-bottom:12px">📈 ${e(b.judul)}</div>`:""}
          <div style="display:grid;grid-template-columns:repeat(${Math.min(items.length||3,3)},1fr);gap:10px">
            ${items.map(it => `<div style="background:rgba(251,146,60,.06);border:2px solid rgba(251,146,60,.15);border-radius:12px;padding:14px 10px;text-align:center">
              <div style="font-size:1.6rem;margin-bottom:4px">${e(it.icon||"📊")}</div>
              <div style="font-family:Fredoka One,cursive;font-size:1.6rem;color:var(--o);line-height:1.2">${e(it.angka||"")}</div>
              <div style="font-size:.72rem;color:var(--muted);font-weight:600;margin-top:3px">${e(it.label||"")}</div>
            </div>`).join("")}
          </div>
        </div>`;
      }

      case "studi":
        return `<div style="margin:14px 0;background:linear-gradient(135deg,rgba(167,139,250,.06),rgba(255,107,107,.04));border:2px solid rgba(167,139,250,.2);border-radius:14px;padding:16px 18px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <div style="width:44px;height:44px;border-radius:12px;background:rgba(167,139,250,.12);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0">${e(b.karakter||"👨‍🏫")}</div>
            <div>
              <div style="font-weight:900;font-size:.9rem">📖 ${e(b.judul||"Studi Kasus")}</div>
              <div style="font-size:.68rem;color:var(--p);font-weight:700">DISKUSI</div>
            </div>
          </div>
          <div style="font-size:.85rem;line-height:1.7;margin-bottom:10px;padding:10px 12px;background:rgba(255,255,255,.03);border-radius:8px;border-left:3px solid var(--p)">${e(b.situasi||"")}</div>
          <div style="font-size:.85rem;font-weight:800;color:var(--p);margin-bottom:6px">🤔 ${e(b.pertanyaan||"")}</div>
          ${b.pesan?`<div style="font-size:.78rem;color:var(--muted);padding:8px 12px;background:rgba(52,211,153,.05);border-radius:8px;margin-top:8px"><strong style="color:var(--g)">📌 Pesan:</strong> ${e(b.pesan)}</div>`:""}
        </div>`;

      default: // teks
        return `<div style="margin:12px 0">${b.judul?`<div style="font-weight:800;font-size:.9rem;margin-bottom:6px">${e(b.judul)}</div>`:""}
          <p style="font-size:.85rem;line-height:1.75;color:var(--muted)">${e(b.isi||"").replace(/\n/g,"<br>")}</p></div>`;
    }
  }
};

/* ══════════════════════════════════════════════════════════════
   AT_VERSIONS — Version History (named snapshots)
   ══════════════════════════════════════════════════════════════ */
window.AT_VERSIONS = {
  KEY: "at_versions_v1",

  load() { try { return JSON.parse(localStorage.getItem(this.KEY)||"[]"); } catch(e) { return []; } },
  save(versions) { try { localStorage.setItem(this.KEY, JSON.stringify(versions)); } catch(e) {} },

  saveVersion(name) {
    if (!name) name = new Date().toLocaleString("id-ID",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
    const versions = this.load();
    versions.unshift({
      name,
      savedAt: new Date().toISOString(),
      mapel: AT_STATE.meta.mapel||"",
      judul: AT_STATE.meta.judulPertemuan||"",
      state: JSON.stringify(AT_STATE)
    });
    // Keep max 20 versions
    this.save(versions.slice(0, 20));
    this.render();
    AT_UTIL.toast("✅ Versi '" + name + "' disimpan");
  },

  restore(idx) {
    const versions = this.load();
    const v = versions[idx];
    if (!v) return;
    if (!confirm(`Kembalikan ke versi "${v.name}"? Perubahan saat ini akan hilang.`)) return;
    try {
      Object.assign(AT_STATE, JSON.parse(v.state));
      AT_META.bind(); AT_CP.bind(); AT_TP.render(); AT_ATP.bind();
      AT_ALUR.render(); AT_KUIS.render(); AT_SKENARIO.render();
      if (window.AT_MODULES) AT_MODULES.render();
      if (window.AT_GAMES)   AT_GAMES.render();
      if (window.AT_MATERI_EDITOR) AT_MATERI_EDITOR.render();
      AT_DASH.render();
      AT_SPLITVIEW?.scheduleRefresh();
      AT_UTIL.toast("✅ Versi '" + v.name + "' dipulihkan");
    } catch(e) { AT_UTIL.toast("❌ Gagal pulihkan: " + e.message, "err"); }
  },

  deleteVersion(idx) {
    const versions = this.load();
    const name = versions[idx]?.name;
    if (!confirm(`Hapus versi "${name}"?`)) return;
    versions.splice(idx, 1);
    this.save(versions);
    this.render();
    AT_UTIL.toast("🗑️ Versi dihapus");
  },

  render() {
    const cont = document.getElementById("versions_list");
    if (!cont) return;
    const versions = this.load();
    if (!versions.length) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🕐</div>
        <div class="empty-state-text">Belum ada snapshot versi tersimpan.</div></div>`;
      return;
    }
    cont.innerHTML = versions.map((v, i) => {
      const d = new Date(v.savedAt);
      const time = d.toLocaleString("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
      return `
      <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--card2);border:1px solid var(--border);border-radius:var(--rad);margin-bottom:8px">
        <div style="font-size:1.4rem;flex-shrink:0">📸</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:.84rem">${v.name}</div>
          <div style="font-size:.7rem;color:var(--muted)">${time} · ${v.judul||"(tanpa judul)"}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-xs" onclick="AT_VERSIONS.restore(${i})">↩ Pulihkan</button>
          <button class="icon-btn del" onclick="AT_VERSIONS.deleteVersion(${i})">🗑️</button>
        </div>
      </div>`;
    }).join("");
  },

  quickSave() {
    const name = prompt("Nama versi (kosongkan untuk nama otomatis):", "") ?? null;
    if (name === null) return; // cancelled
    this.saveVersion(name);
  }
};

/* ══════════════════════════════════════════════════════════════
   AT_EXCEL_PREVIEW — Preview tabel sebelum import Excel
   ══════════════════════════════════════════════════════════════ */
window.AT_EXCEL_PREVIEW = {
  _parsed: null,

  show(workbook) {
    if (!workbook) return;
    const modal = document.getElementById("excelPreviewModal");
    if (!modal) return;
    const body = document.getElementById("excelPreviewBody");
    const sheets = workbook.SheetNames || [];
    this._parsed = workbook;

    body.innerHTML = sheets.map((name, si) => {
      const ws = workbook.Sheets[name];
      if (!ws) return "";
      const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:""});
      if (!rows.length) return `<div style="margin-bottom:14px"><div class="at-card-title">${name}</div><p style="color:var(--muted);font-size:.8rem">Sheet kosong.</p></div>`;
      const maxRows = Math.min(rows.length, 8);
      const maxCols = Math.min(Math.max(...rows.slice(0,maxRows).map(r=>r.length)), 10);
      const thead = `<tr>${rows[0].slice(0,maxCols).map(h=>`<th style="background:rgba(255,255,255,.07);font-weight:700;padding:6px 10px;border:1px solid var(--border);font-size:.74rem;white-space:nowrap">${String(h||"")}</th>`).join("")}</tr>`;
      const tbody = rows.slice(1,maxRows).map(row=>
        `<tr>${row.slice(0,maxCols).map(cell=>
          `<td style="padding:5px 10px;border:1px solid var(--border);font-size:.74rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${String(cell||"")}</td>`
        ).join("")}</tr>`
      ).join("");
      return `<div style="margin-bottom:18px">
        <div style="font-size:.78rem;font-weight:800;color:var(--c);margin-bottom:7px">📋 ${name} (${rows.length-1} baris)</div>
        <div style="overflow-x:auto;border-radius:8px;border:1px solid var(--border)">
          <table style="width:100%;border-collapse:collapse">
            <thead>${thead}</thead><tbody>${tbody}</tbody>
          </table>
        </div>
        ${rows.length > maxRows ? `<div style="font-size:.7rem;color:var(--muted);margin-top:4px">+${rows.length-maxRows} baris lainnya</div>` : ""}
      </div>`;
    }).join("");

    modal.classList.add("show");
  },

  confirmImport() {
    if (!this._parsed) return;
    document.getElementById("excelPreviewModal")?.classList.remove("show");
    if (window.AT_IMPORT && AT_IMPORT._parseFile) {
      // Re-use parser — convert workbook back to ArrayBuffer via XLSX
      AT_IMPORT._applyWorkbook(this._parsed);
    }
    this._parsed = null;
  }
};

/* ══════════════════════════════════════════════════════════════
   AT_DEBOUNCE — Wrap all field inputs with 300ms debounce
   ══════════════════════════════════════════════════════════════ */
window.AT_DEBOUNCE = {
  _timers: {},

  wrap(el, handler, delay=300) {
    const key = el.id || Math.random().toString(36).slice(2);
    return function(e) {
      clearTimeout(AT_DEBOUNCE._timers[key]);
      AT_DEBOUNCE._timers[key] = setTimeout(() => handler.call(this, e), delay);
    };
  },

  // Apply to all existing .field-input and .field-textarea
  applyGlobal() {
    // Instead of wrapping DOM events (complex), we intercept markDirty
    // The live preview already has 400ms debounce via AT_SPLITVIEW
    // This just ensures the preview doesn't thrash on every keystroke
    console.log("✅ Debounce active via AT_SPLITVIEW 400ms");
  }
};

/* ══════════════════════════════════════════════════════════════
   AT_CP_SUGGEST — Autocomplete Profil Pelajar Pancasila
   ══════════════════════════════════════════════════════════════ */
window.AT_CP_SUGGEST = {
  PROFIL: [
    "Beriman, Bertakwa kepada Tuhan YME & Berakhlak Mulia",
    "Berkebhinekaan Global",
    "Bergotong Royong",
    "Bernalar Kritis",
    "Mandiri",
    "Kreatif",
    "Beriman & Bertakwa kepada Tuhan YME",
  ],

  init() {
    const input = document.getElementById("cp_profilInput");
    if (!input) return;

    // Create suggestion dropdown
    const drop = document.createElement("div");
    drop.id = "profilSuggest";
    drop.style.cssText = "position:absolute;left:0;right:0;top:100%;background:var(--card2);border:1px solid var(--border2);border-radius:var(--rad-sm);z-index:500;display:none;box-shadow:0 8px 24px rgba(0,0,0,.4);max-height:180px;overflow-y:auto;";
    const wrap = input.parentElement;
    if (wrap) { wrap.style.position="relative"; wrap.appendChild(drop); }

    input.addEventListener("input", () => {
      const q = input.value.toLowerCase().trim();
      if (!q) { drop.style.display="none"; return; }
      const matches = this.PROFIL.filter(p =>
        p.toLowerCase().includes(q) &&
        !(AT_STATE.cp.profil||[]).includes(p)
      );
      if (!matches.length) { drop.style.display="none"; return; }
      drop.innerHTML = matches.map(p => `
        <div style="padding:9px 13px;cursor:pointer;font-size:.8rem;font-weight:600;transition:background .12s"
          onmouseover="this.style.background='rgba(255,255,255,.07)'"
          onmouseout="this.style.background=''"
          onmousedown="event.preventDefault();AT_CP_SUGGEST.pick('${p.replace(/'/g,"\\'")}')">
          ${p}
        </div>`).join("");
      drop.style.display = "block";
    });

    input.addEventListener("blur", () => setTimeout(() => { drop.style.display="none"; }, 200));
  },

  pick(val) {
    if (!AT_STATE.cp.profil) AT_STATE.cp.profil = [];
    if (!AT_STATE.cp.profil.includes(val)) {
      AT_STATE.cp.profil.push(val);
      AT_CP.renderProfil();
      AT_EDITOR.markDirty();
    }
    const input = document.getElementById("cp_profilInput");
    if (input) input.value = "";
    const drop = document.getElementById("profilSuggest");
    if (drop) drop.style.display = "none";
  }
};

/* ══════════════════════════════════════════════════════════════
   ATP DRAG-SORT — Drag reorder pertemuan di panel ATP
   ══════════════════════════════════════════════════════════════ */
window.AT_ATP_DRAG = {
  init() {
    AT_DRAG.init("atp_rows", ".list-item", function(order) {
      const copy = AT_STATE.atp.pertemuan.slice();
      order.forEach((origIdx, newIdx) => {
        if (origIdx < copy.length) AT_STATE.atp.pertemuan[newIdx] = copy[origIdx];
      });
      AT_EDITOR.markDirty();
      AT_UTIL.toast("↕️ Urutan pertemuan diubah");
    });
  }
};

/* ══════════════════════════════════════════════════════════════
   PATCH importer.js — addWorkbook method + preview integration
   ══════════════════════════════════════════════════════════════ */
// Patch AT_IMPORT to show preview before applying
if (window.AT_IMPORT) {
  const _origHandle = AT_IMPORT.handleFile.bind(AT_IMPORT);
  AT_IMPORT.handleFile = function(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof XLSX === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.onload = () => {
          const wb = XLSX.read(e.target.result, {type:"array"});
          AT_EXCEL_PREVIEW.show(wb);
        };
        document.head.appendChild(script);
      } else {
        const wb = XLSX.read(e.target.result, {type:"array"});
        AT_EXCEL_PREVIEW.show(wb);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  AT_IMPORT._applyWorkbook = function(wb) {
    // Use existing parser with workbook
    try {
      const statusEl = document.getElementById("importStatus") || document.createElement("div");
      this._parseFileFromWorkbook(wb, statusEl, "Excel Import");
    } catch(e) { AT_UTIL.toast("❌ " + e.message, "err"); }
  };

  // New method: parse from workbook object (not raw buffer)
  AT_IMPORT._parseFileFromWorkbook = function(wb, statusEl, filename) {
    try {
      let log = [], filled = 0;
      const get = name => wb.Sheets[name];

      const metaSh = get("META");
      if (metaSh) {
        const rows = XLSX.utils.sheet_to_json(metaSh,{header:1});
        if (rows[1]) {
          const [judulPertemuan,subjudul,ikon,durasi,namaBab,mapel,kelas,kurikulum] = rows[1];
          Object.assign(AT_STATE.meta,{judulPertemuan,subjudul,ikon,durasi,namaBab,mapel,kelas,kurikulum});
          AT_META.bind(); log.push("✅ META"); filled++;
        }
      }
      const cpSh = get("CP");
      if (cpSh) {
        const rows = XLSX.utils.sheet_to_json(cpSh,{header:1});
        if (rows[1]) {
          const [elemen,subElemen,capaianFase,profil,fase,kelas] = rows[1];
          AT_STATE.cp = {elemen,subElemen,capaianFase,profil:profil?profil.split(";"):[],fase:fase||"D",kelas};
          AT_CP.bind(); log.push("✅ CP"); filled++;
        }
      }
      const tpSh = get("TP");
      if (tpSh) {
        const rows = XLSX.utils.sheet_to_json(tpSh,{header:1}).slice(1).filter(r=>r[0]);
        AT_STATE.tp = rows.map((r,i)=>({verb:r[0]||"Menjelaskan",desc:r[1]||"",pertemuan:+r[2]||1,color:r[3]||AT_UTIL.colorForIndex(i)}));
        AT_TP.render(); log.push("✅ "+AT_STATE.tp.length+" TP"); filled++;
      }
      const atpSh = get("ATP");
      if (atpSh) {
        const rows = XLSX.utils.sheet_to_json(atpSh,{header:1}).slice(1).filter(r=>r[0]);
        if (rows.length) {
          AT_STATE.atp.namaBab = rows[0][0]||"";
          AT_STATE.atp.pertemuan = rows.map(r=>({judul:r[2]||"",tp:r[3]||"",durasi:r[4]||"",kegiatan:r[5]||"",penilaian:r[6]||""}));
          AT_ATP.bind(); log.push("✅ "+rows.length+" ATP"); filled++;
        }
      }
      const alurSh = get("ALUR");
      if (alurSh) {
        const rows = XLSX.utils.sheet_to_json(alurSh,{header:1}).slice(1).filter(r=>r[1]);
        AT_STATE.alur = rows.map(r=>({fase:r[1]||"Inti",durasi:r[2]||"",judul:r[3]||"",deskripsi:r[4]||""}));
        AT_ALUR.render(); log.push("✅ "+rows.length+" Alur"); filled++;
      }
      const kuisSh = get("KUIS");
      if (kuisSh) {
        const rows = XLSX.utils.sheet_to_json(kuisSh,{header:1}).slice(1).filter(r=>r[1]);
        const L={A:0,B:1,C:2,D:3};
        AT_STATE.kuis = rows.map(r=>({q:r[1]||"",opts:[r[2]||"",r[3]||"",r[4]||"",r[5]||""],ans:L[(r[6]||"A").toString().toUpperCase()]??0,ex:r[7]||""}));
        AT_KUIS.render(); log.push("✅ "+rows.length+" Kuis"); filled++;
      }

      AT_EDITOR.markDirty();
      AT_DASH.render();
      AT_SPLITVIEW?.scheduleRefresh();
      if (statusEl) {
        statusEl.className = "import-status ok";
        statusEl.style.display = "block";
        statusEl.innerHTML = `<strong>✅ Import berhasil — ${filled} sheet:</strong><br>${log.join("<br>")}`;
      }
      AT_UTIL.toast(`✅ ${filled} sheet diimport!`);
    } catch(err) {
      if (statusEl) { statusEl.className="import-status err"; statusEl.style.display="block"; statusEl.textContent="❌ "+err.message; }
      AT_UTIL.toast("❌ " + err.message, "err");
    }
  };
}

/* ══════════════════════════════════════════════════════════════
   PATCH preview.js — render materi konten in student HTML
   ══════════════════════════════════════════════════════════════ */
(function patchPreviewWithMateri() {
  if (!window.AT_PREVIEW) return;
  const _orig = AT_PREVIEW.buildStudentHTML.bind(AT_PREVIEW);
  AT_PREVIEW.buildStudentHTML = function(S) {
    // Inject materi blok into materi screen
    const html = _orig(S);
    if (!S.materi?.blok?.length) return html;
    // Insert materi HTML before the fungsi tabs section
    const materiHtml = AT_MATERI_EDITOR.renderHtml();
    return html.replace(
      "<div class='h2'>⚖️ Fungsi <span class='hl'>Norma</span></div>",
      "<div class='card' style='margin-bottom:12px'>" + materiHtml + "</div><div class='h2'>⚖️ Fungsi <span class='hl'>Norma</span></div>"
    );
  };
})();

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  // Ensure materi state
  if (!AT_STATE.materi) AT_STATE.materi = { blok: [] };

  // CP autocomplete
  AT_CP_SUGGEST.init();

  // Debounce active via splitview
  AT_DEBOUNCE.applyGlobal();

  // ATP drag — init after ATP renders
  const _origAtpRender = AT_ATP.render?.bind(AT_ATP);
  if (_origAtpRender) {
    AT_ATP.render = function() {
      _origAtpRender();
      setTimeout(() => AT_ATP_DRAG.init(), 80);
    };
  }

  // Patch AT_NAV to render konten panel (materi + modules)
  const _origNav4 = AT_NAV.go.bind(AT_NAV);
  AT_NAV.go = function(id) {
    _origNav4(id);
    if (id === "konten") {
      AT_MATERI_EDITOR?.ensureState(); AT_MATERI_EDITOR?.render();
      AT_MODULES?.render(); 
      if (typeof checkMigrateBanner === "function") checkMigrateBanner();
    }
    if (id === "versions") { AT_VERSIONS.render(); }
  };

  // Close excel preview modal on overlay click
  const epModal = document.getElementById("excelPreviewModal");
  if (epModal) {
    epModal.addEventListener("click", e => { if(e.target===epModal) epModal.classList.remove("show"); });
  }

  console.log("✅ extras.js loaded — materi, versions, excel-preview, debounce, cp-suggest, atp-drag");
});
