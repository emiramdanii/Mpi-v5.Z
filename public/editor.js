// ═══════════════════════════════════════════════════════════════
// EDITOR.JS — Panel rendering, form binding, live state sync
// Authoring Tool v1.0
// ═══════════════════════════════════════════════════════════════

/* ── NAVIGATION ─────────────────────────────────────────────── */
window.AT_NAV = {
  current: "dashboard",
  go(id) {
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const panel = document.getElementById("p-" + id);
    const nav = document.querySelector(`.nav-item[data-panel="${id}"]`);
    if (panel) panel.classList.add("active");
    if (nav) nav.classList.add("active");
    this.current = id;
    const titles = {
      dashboard: "Dashboard", dokumen: "Dokumen",
      konten: "Konten Pembelajaran", canva: "Canva Editor",
      autogen: "Auto-Generate",
      import: "Import / Export", projects: "Kelola Proyek",
      versions: "Riwayat Versi", preview: "Live Preview",
    };
    document.getElementById("headerTitle").innerHTML =
      (titles[id] || id) + `<span>/ ${AT_STATE.meta.judulPertemuan || "Proyek Baru"}</span>`;
    if (id === "preview") {
      // Open split view instead of separate panel
      if (!AT_SPLITVIEW.active) AT_SPLITVIEW.toggle();
      return;
    }
    if (id === "dashboard") AT_DASH.render();
  }
};

/* ── SIDEBAR TOGGLE ─────────────────────────────────────────── */
let sidebarOpen = true;
window.toggleSidebar = function () {
  sidebarOpen = !sidebarOpen;
  document.getElementById("sidebar").classList.toggle("collapsed", !sidebarOpen);
  document.getElementById("main").classList.toggle("expanded", !sidebarOpen);
  document.getElementById("sidebarToggle").textContent = sidebarOpen ? "☰" : "▶";
};

/* ── DASHBOARD ──────────────────────────────────────────────── */
window.AT_DASH = {
  render() {
    const S = AT_STATE;
    const completeness = AT_EDITOR.calcCompleteness();
    document.getElementById("dashProgress").style.width = completeness + "%";
    document.getElementById("dashProgressNum").textContent = completeness + "%";

    // Quick stat chips
    const stats = [
      { label: "TP", val: S.tp.length, icon: "🎯", color: "var(--y)" },
      { label: "ATP Pertemuan", val: S.atp.pertemuan.length, icon: "📅", color: "var(--c)" },
      { label: "Alur Langkah", val: S.alur.length, icon: "📋", color: "var(--p)" },
      { label: "Soal Kuis", val: S.kuis.length, icon: "❓", color: "var(--g)" },
      { label: "Modul", val: (S.modules||[]).length, icon: "🧩", color: "var(--p)" },
      { label: "Game", val: (S.games||[]).length, icon: "🎮", color: "var(--o)" },
      { label: "Materi Blok", val: (S.materi?.blok||[]).length, icon: "📝", color: "var(--b)" },
    ];
    document.getElementById("dashStats").innerHTML = stats.map(s => `
      <div style="background:var(--card2);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
        <div style="font-size:1.4rem">${s.icon}</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;color:${s.color};margin:4px 0">${s.val}</div>
        <div style="font-size:.68rem;color:var(--muted);font-weight:600">${s.label}</div>
      </div>
    `).join("");

    // Checklist
    const checks = [
      { label: "Identitas media diisi", done: !!(S.meta.judulPertemuan && S.meta.kelas) },
      { label: "Capaian Pembelajaran", done: !!S.cp.capaianFase },
      { label: "Tujuan Pembelajaran (min 1)", done: S.tp.length > 0 },
      { label: "ATP / Pertemuan (min 1)", done: S.atp.pertemuan.length > 0 },
      { label: "Alur Pembelajaran (min 3)", done: S.alur.length >= 3 },
      { label: "Kuis (min 5 soal)", done: S.kuis.length >= 5 },
      { label: "Modul konten (min 1)", done: (S.modules||[]).length > 0 },
    ];
    document.getElementById("dashChecklist").innerHTML = checks.map(c => `
      <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:.8rem">
        <span style="color:${c.done ? "var(--g)" : "var(--muted)"};font-size:1rem">${c.done ? "✅" : "○"}</span>
        <span style="color:${c.done ? "var(--text)" : "var(--muted)"}">${c.label}</span>
      </div>
    `).join("");
  }
};

/* ── COMPLETENESS CALCULATOR ─────────────────────────────────── */
window.AT_EDITOR = {
  calcCompleteness() {
    const S = AT_STATE;
    let pts = 0, max = 0;
    const check = (val, w = 1) => { max += w; if (val) pts += w; };
    check(S.meta.judulPertemuan, 2);
    check(S.meta.kelas);
    check(S.cp.capaianFase, 2);
    check(S.tp.length > 0, 2);
    check(S.atp.pertemuan.length > 0, 2);
    check(S.alur.length >= 3, 2);
    check(S.kuis.length >= 5, 2);
    check((S.modules||[]).length > 0, 1);
    return Math.round((pts / max) * 100);
  },

  markDirty() {
    AT_STATE.dirty = true;
    document.getElementById("dirtyDot").style.opacity = "1";
  }
};

/* ── META PANEL ─────────────────────────────────────────────── */
window.AT_META = {
  bind() {
    const S = AT_STATE.meta;
    const fields = ["judulPertemuan", "subjudul", "ikon", "durasi", "namaBab", "mapel", "kelas", "kurikulum"];
    fields.forEach(f => {
      const el = document.getElementById("m_" + f);
      if (!el) return;
      el.value = S[f] || "";
      el.addEventListener("input", () => { S[f] = el.value; AT_EDITOR.markDirty(); });
    });
  },

  applyPreset(id) {
    const p = PRESETS.meta[id];
    if (!p) return;
    Object.assign(AT_STATE.meta, p);
    this.bind();
    AT_UTIL.toast("✅ Preset meta diterapkan: " + p.label);
  }
};

/* ── CP PANEL ───────────────────────────────────────────────── */
window.AT_CP = {
  bind() {
    const S = AT_STATE.cp;
    ["elemen", "subElemen", "capaianFase"].forEach(f => {
      const el = document.getElementById("cp_" + f);
      if (!el) return;
      el.value = S[f] || "";
      el.addEventListener("input", () => { S[f] = el.value; AT_EDITOR.markDirty(); });
    });
    this.renderProfil();
  },

  renderProfil() {
    const wrap = document.getElementById("cp_profilWrap");
    if (!wrap) return;
    const tags = (AT_STATE.cp.profil || []);
    wrap.innerHTML = tags.map((t, i) =>
      `<div class="tag-item">${t}<button onclick="AT_CP.removeProfil(${i})">×</button></div>`
    ).join("") + `<input class="tag-input" id="cp_profilInput" placeholder="Tambah profil…" onkeydown="AT_CP.addProfilKey(event)">`;
  },

  addProfilKey(e) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const val = e.target.value.trim();
    if (!val) return;
    if (!AT_STATE.cp.profil) AT_STATE.cp.profil = [];
    AT_STATE.cp.profil.push(val);
    e.target.value = "";
    this.renderProfil();
    AT_EDITOR.markDirty();
  },

  removeProfil(i) {
    AT_STATE.cp.profil.splice(i, 1);
    this.renderProfil();
    AT_EDITOR.markDirty();
  },

  applyPreset(id) {
    const p = PRESETS.cp[id];
    if (!p) return;
    AT_STATE.cp = AT_UTIL.deepClone(p);
    this.bind();
    AT_UTIL.toast("✅ Preset CP diterapkan: " + p.label);
  }
};

/* ── TP PANEL ───────────────────────────────────────────────── */
window.AT_TP = {
  render() {
    const cont = document.getElementById("tp_list");
    if (!cont) return;
    const list = AT_STATE.tp;
    if (!list.length) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🎯</div><div class="empty-state-text">Belum ada Tujuan Pembelajaran.<br>Klik "+ Tambah TP" atau pilih preset.</div></div>`;
      return;
    }
    cont.innerHTML = list.map((tp, i) => this._itemHTML(tp, i)).join("");
  },

  _itemHTML(tp, i) {
    const col = tp.color || AT_UTIL.colorForIndex(i);
    const verbs = AT_UTIL.verbOptions.map(v => `<option${v === tp.verb ? " selected" : ""}>${v}</option>`).join("");
    return `
    <div class="list-item" id="tp_item_${i}">
      <div class="list-item-header">
        <span class="drag-handle" title="Seret untuk urut ulang">⠿</span>
        <div class="list-item-num" style="background:${col}22;color:${col}">${i + 1}</div>
        <span class="list-item-label">Tujuan Pembelajaran ${i + 1}</span>
        <div class="list-item-actions">
          <button class="list-item-del btn-icon" onclick="AT_TP.delete(${i})" title="Hapus">🗑️</button>
        </div>
      </div>
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Kata Kerja Operasional</label>
          <select class="field-select" onchange="AT_TP.update(${i},'verb',this.value)">${verbs}</select>
        </div>
        <div class="field-group">
          <label class="field-label">Pertemuan ke-</label>
          <input class="field-input" type="number" min="1" max="10" value="${tp.pertemuan || 1}" onchange="AT_TP.update(${i},'pertemuan',+this.value)">
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Deskripsi</label>
        <textarea class="field-textarea" rows="2" oninput="AT_TP.update(${i},'desc',this.value)">${tp.desc || ""}</textarea>
      </div>
      <div class="field-group">
        <label class="field-label">Warna Aksen</label>
        <div style="display:flex;gap:7px;flex-wrap:wrap">
          ${["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"].map(c =>
            `<div onclick="AT_TP.update(${i},'color','${c}')" style="width:22px;height:22px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${tp.color===c?'#fff':'transparent'};transition:border .15s"></div>`
          ).join("")}
        </div>
      </div>
    </div>`;
  },

  add() {
    AT_STATE.tp.push({ verb: "Menjelaskan", desc: "", pertemuan: 1, color: AT_UTIL.colorForIndex(AT_STATE.tp.length) });
    this.render();
    AT_EDITOR.markDirty();
  },

  delete(i) {
    AT_STATE.tp.splice(i, 1);
    this.render();
    AT_EDITOR.markDirty();
  },

  update(i, key, val) {
    AT_STATE.tp[i][key] = val;
    AT_EDITOR.markDirty();
    if (key === "color") this.render();
  },

  applyPreset(id) {
    const p = PRESETS.tp[id];
    if (!p) return;
    AT_STATE.tp = AT_UTIL.deepClone(p.items);
    this.render();
    AT_UTIL.toast("✅ Preset TP diterapkan: " + p.label);
    AT_EDITOR.markDirty();
  }
};

/* ── ATP PANEL ──────────────────────────────────────────────── */
window.AT_ATP = {
  bind() {
    const S = AT_STATE.atp;
    const nb = document.getElementById("atp_namaBab");
    if (nb) { nb.value = S.namaBab || ""; nb.addEventListener("input", () => { S.namaBab = nb.value; AT_EDITOR.markDirty(); }); }
    this.render();
  },

  render() {
    const cont = document.getElementById("atp_rows");
    if (!cont) return;
    const rows = AT_STATE.atp.pertemuan;
    if (!rows.length) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">Belum ada pertemuan. Klik "+ Tambah Pertemuan".</div></div>`;
      return;
    }
    cont.innerHTML = rows.map((r, i) => `
      <div class="list-item" id="atp_row_${i}">
        <div class="list-item-header">
          <div class="list-item-num" style="background:rgba(245,200,66,.15);color:var(--y)">P${i + 1}</div>
          <span class="list-item-label">Pertemuan ${i + 1}</span>
          <div class="list-item-actions">
            <button class="list-item-del btn-icon" onclick="AT_ATP.delete(${i})">🗑️</button>
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Judul Pertemuan</label>
            <input class="field-input" value="${r.judul || ""}" oninput="AT_ATP.update(${i},'judul',this.value)" placeholder="Hakikat Norma">
          </div>
          <div class="field-group">
            <label class="field-label">Durasi</label>
            <input class="field-input" value="${r.durasi || ""}" oninput="AT_ATP.update(${i},'durasi',this.value)" placeholder="2×40 menit">
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">TP yang Dicapai</label>
          <input class="field-input" value="${r.tp || ""}" oninput="AT_ATP.update(${i},'tp',this.value)" placeholder="TP 1 — Menjelaskan pengertian norma">
        </div>
        <div class="field-group">
          <label class="field-label">Kegiatan Pembelajaran</label>
          <textarea class="field-textarea" rows="2" oninput="AT_ATP.update(${i},'kegiatan',this.value)">${r.kegiatan || ""}</textarea>
        </div>
        <div class="field-group">
          <label class="field-label">Penilaian</label>
          <input class="field-input" value="${r.penilaian || ""}" oninput="AT_ATP.update(${i},'penilaian',this.value)" placeholder="Observasi + Pemantik">
        </div>
      </div>
    `).join("");
  },

  add() {
    AT_STATE.atp.pertemuan.push({ judul: "", tp: "", durasi: "2×40 menit", kegiatan: "", penilaian: "" });
    this.render();
    AT_EDITOR.markDirty();
  },

  delete(i) { AT_STATE.atp.pertemuan.splice(i, 1); this.render(); AT_EDITOR.markDirty(); },
  update(i, k, v) { AT_STATE.atp.pertemuan[i][k] = v; AT_EDITOR.markDirty(); },

  applyPreset(id) {
    const p = PRESETS.atp[id];
    if (!p) return;
    AT_STATE.atp = AT_UTIL.deepClone(p);
    this.bind();
    AT_UTIL.toast("✅ Preset ATP diterapkan: " + p.label);
    AT_EDITOR.markDirty();
  }
};

/* ── ALUR PANEL ─────────────────────────────────────────────── */
window.AT_ALUR = {
  render() {
    const cont = document.getElementById("alur_list");
    if (!cont) return;
    const steps = AT_STATE.alur;
    if (!steps.length) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">Belum ada langkah. Klik "+ Tambah Langkah".</div></div>`;
      return;
    }
    const faseColors = { "Pendahuluan": "var(--y)", "Inti": "var(--c)", "Penutup": "var(--g)" };
    cont.innerHTML = steps.map((s, i) => {
      const col = faseColors[s.fase] || "var(--p)";
      return `
      <div class="list-item" id="alur_step_${i}">
        <div class="list-item-header">
          <span class="drag-handle">⠿</span>
          <div class="list-item-num" style="background:${col}22;color:${col}">${i + 1}</div>
          <span class="list-item-label">${s.judul || "Langkah " + (i + 1)}</span>
          <div class="list-item-actions">
            <button class="list-item-del btn-icon" onclick="AT_ALUR.delete(${i})">🗑️</button>
          </div>
        </div>
        <div class="field-row-3">
          <div class="field-group">
            <label class="field-label">Fase</label>
            <select class="field-select" onchange="AT_ALUR.update(${i},'fase',this.value)">
              ${["Pendahuluan","Inti","Penutup"].map(f=>`<option${f===s.fase?" selected":""}>${f}</option>`).join("")}
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Durasi</label>
            <input class="field-input" value="${s.durasi || ""}" oninput="AT_ALUR.update(${i},'durasi',this.value)" placeholder="10 menit">
          </div>
          <div class="field-group">
            <label class="field-label">Nama Kegiatan</label>
            <input class="field-input" value="${s.judul || ""}" oninput="AT_ALUR.update(${i},'judul',this.value)" placeholder="Apersepsi">
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">Deskripsi Kegiatan</label>
          <textarea class="field-textarea" rows="2" oninput="AT_ALUR.update(${i},'deskripsi',this.value)">${s.deskripsi || ""}</textarea>
        </div>
      </div>`;
    }).join("");
  },

  add() {
    AT_STATE.alur.push({ fase: "Inti", durasi: "15 menit", judul: "", deskripsi: "" });
    this.render();
    AT_EDITOR.markDirty();
  },

  delete(i) { AT_STATE.alur.splice(i, 1); this.render(); AT_EDITOR.markDirty(); },
  update(i, k, v) { AT_STATE.alur[i][k] = v; AT_EDITOR.markDirty(); },

  applyPreset(id) {
    const p = PRESETS.alur[id];
    if (!p) return;
    AT_STATE.alur = AT_UTIL.deepClone(p.steps);
    this.render();
    AT_UTIL.toast("✅ Preset Alur diterapkan: " + p.label);
    AT_EDITOR.markDirty();
  }
};

/* ── KUIS PANEL ─────────────────────────────────────────────── */
window.AT_KUIS = {
  render() {
    const cont = document.getElementById("kuis_list");
    if (!cont) return;
    const soal = AT_STATE.kuis;
    if (!soal.length) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❓</div><div class="empty-state-text">Belum ada soal. Klik "+ Tambah Soal".</div></div>`;
      return;
    }
    cont.innerHTML = soal.map((s, i) => this._itemHTML(s, i)).join("");
  },

  _itemHTML(s, i) {
    const opts = s.opts || ["", "", "", ""];
    const letters = ["A", "B", "C", "D"];
    return `
    <div class="kuis-item" id="kuis_item_${i}">
      <div class="list-item-header">
        <div class="list-item-num" style="background:rgba(56,217,217,.15);color:var(--c)">${i + 1}</div>
        <span class="list-item-label">Soal ${i + 1}</span>
        <div class="list-item-actions">
          <button class="list-item-del btn-icon" onclick="AT_KUIS.delete(${i})">🗑️</button>
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Pertanyaan</label>
        <textarea class="field-textarea" rows="2" oninput="AT_KUIS.update(${i},'q',this.value)">${s.q || ""}</textarea>
      </div>
      <label class="field-label" style="margin-bottom:6px">Pilihan Jawaban (pilih yang benar)</label>
      <div class="kuis-opts-grid">
        ${opts.map((o, j) => `
          <label class="kuis-opt-label">
            <input type="radio" name="kuis_ans_${i}" value="${j}" ${s.ans === j ? "checked" : ""} onchange="AT_KUIS.update(${i},'ans',${j})">
            <span style="font-weight:700;color:var(--c)">${letters[j]}.</span>
            <input style="background:none;border:none;outline:none;color:var(--text);font-size:.78rem;flex:1;font-family:'Plus Jakarta Sans',sans-serif" 
              value="${o}" placeholder="Opsi ${letters[j]}" oninput="AT_KUIS.updateOpt(${i},${j},this.value)">
          </label>
        `).join("")}
      </div>
      <div class="field-group">
        <label class="field-label">Penjelasan / Feedback</label>
        <input class="field-input" value="${s.ex || ""}" oninput="AT_KUIS.update(${i},'ex',this.value)" placeholder="Mengapa jawaban ini benar?">
      </div>
    </div>`;
  },

  add() {
    AT_STATE.kuis.push({ q: "", opts: ["", "", "", ""], ans: 0, ex: "" });
    this.render();
    AT_EDITOR.markDirty();
    setTimeout(() => document.getElementById(`kuis_item_${AT_STATE.kuis.length - 1}`)?.scrollIntoView({ behavior: "smooth" }), 100);
  },

  delete(i) { AT_STATE.kuis.splice(i, 1); this.render(); AT_EDITOR.markDirty(); },

  update(i, k, v) { AT_STATE.kuis[i][k] = v; AT_EDITOR.markDirty(); },

  updateOpt(i, j, v) {
    if (!AT_STATE.kuis[i].opts) AT_STATE.kuis[i].opts = ["", "", "", ""];
    AT_STATE.kuis[i].opts[j] = v;
    AT_EDITOR.markDirty();
  },

  applyPreset(id) {
    const p = PRESETS.kuis[id];
    if (!p) return;
    AT_STATE.kuis = AT_UTIL.deepClone(p.soal);
    this.render();
    AT_UTIL.toast("✅ Preset Kuis diterapkan: " + p.label);
    AT_EDITOR.markDirty();
  }
};

/* ── SKENARIO PANEL ─────────────────────────────────────────── */
window.AT_SKENARIO = {
  render() {
    const cont = document.getElementById("sk_list");
    if (!cont) return;
    const chapters = AT_STATE.skenario;
    if (!chapters.length) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🎭</div><div class="empty-state-text">Belum ada skenario. Pilih preset atau tambah manual.</div></div>`;
      return;
    }
    cont.innerHTML = chapters.map((ch, i) => `
      <div class="list-item" id="sk_ch_${i}">
        <div class="list-item-header">
          <div class="list-item-num" style="background:rgba(251,146,60,.15);color:var(--o)">${i + 1}</div>
          <span class="list-item-label">${ch.title || "Skenario " + (i + 1)}</span>
          <div class="list-item-actions">
            <button class="list-item-del btn-icon" onclick="AT_SKENARIO.delete(${i})">🗑️</button>
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Judul Skenario</label>
            <input class="field-input" value="${ch.title || ""}" oninput="AT_SKENARIO.update(${i},'title',this.value)" placeholder="🏘️ Perselisihan di Kampung">
          </div>
          <div class="field-group">
            <label class="field-label">Background Scene</label>
            <select class="field-select" onchange="AT_SKENARIO.update(${i},'bg',this.value)">
              ${["sbg-kampung","sbg-pasar","sbg-masjid","sbg-kelas"].map(b=>
                `<option value="${b}"${ch.bg===b?" selected":""}>${b.replace("sbg-","")}</option>`
              ).join("")}
            </select>
          </div>
        </div>
        <div style="font-size:.74rem;color:var(--muted);margin-top:4px">
          ${ch.choices?.length || 0} pilihan · ${ch.setup?.length || 0} dialog setup
          <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="AT_SKENARIO.openDetail(${i})">Edit Detail ↗</button>
        </div>
      </div>
    `).join("");
  },

  delete(i) { AT_STATE.skenario.splice(i, 1); this.render(); AT_EDITOR.markDirty(); },
  update(i, k, v) { AT_STATE.skenario[i][k] = v; AT_EDITOR.markDirty(); },

  openDetail(i) {
    AT_UTIL.toast("💡 Edit detail skenario di panel lengkap (fitur v1.1)", "info");
  },

  applyPreset(id) {
    const p = PRESETS.skenario[id];
    if (!p) return;
    AT_STATE.skenario = AT_UTIL.deepClone(p.chapters);
    this.render();
    AT_UTIL.toast("✅ Preset Skenario diterapkan: " + p.label);
    AT_EDITOR.markDirty();
  }
};

/* ── GLOBAL HELPERS (Accordion, Tabs, Presets) ───────────────── */
window.toggleAccordion = function(headerEl) {
  const section = headerEl.closest('.acc-section');
  if (!section) return;
  const isOpen = section.classList.contains('open');
  // Close all siblings
  section.parentElement.querySelectorAll('.acc-section').forEach(s => {
    s.classList.remove('open');
    const body = s.querySelector('.acc-body');
    if (body) body.style.maxHeight = '0';
  });
  // Toggle current
  if (!isOpen) {
    section.classList.add('open');
    const body = section.querySelector('.acc-body');
    if (body) body.style.maxHeight = body.scrollHeight + 40 + 'px';
  }
};

window.switchKontenTab = function(tabId, btnEl) {
  // Deactivate all tabs
  document.querySelectorAll('.konten-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.konten-tab-panel').forEach(p => p.classList.remove('active'));
  // Activate target
  const panel = document.getElementById(tabId);
  if (panel) panel.classList.add('active');
  if (btnEl) btnEl.classList.add('active');
};

window.checkMigrateBanner = function() {
  const banner = document.getElementById('migrateBanner');
  if (!banner) return;
  const hasOldSk = (AT_STATE.skenario || []).length > 0;
  const hasModules = (AT_STATE.modules || []).length > 0;
  banner.style.display = (hasOldSk && !hasModules) ? 'flex' : 'none';
};

window.applyFullPreset = function(presetKey) {
  const mapping = {
    'hakikat-norma': { meta: 'hakikat-norma', cp: 'ppkn-smp-bab3', tp: 'bab3-full', atp: 'bab3-3pertemuan', alur: 'hakikat-norma-80menit', skenario: 'norma-3-skenario', kuis: 'norma-10-soal' },
    'macam-norma': { meta: 'macam-norma', cp: 'ppkn-smp-bab3', tp: 'bab3-full', atp: 'bab3-3pertemuan', alur: 'hakikat-norma-80menit', skenario: 'norma-3-skenario', kuis: 'norma-10-soal' },
    'blank': { meta: 'blank', cp: 'blank', tp: 'blank', atp: 'blank', alur: 'blank', skenario: 'blank', kuis: 'blank' }
  };
  const preset = mapping[presetKey];
  if (!preset) { AT_UTIL.toast('Preset tidak ditemukan', 'err'); return; }
  if (PRESETS.meta[preset.meta]) Object.assign(AT_STATE.meta, AT_UTIL.deepClone(PRESETS.meta[preset.meta]));
  if (PRESETS.cp[preset.cp]) AT_STATE.cp = AT_UTIL.deepClone(PRESETS.cp[preset.cp]);
  if (PRESETS.tp[preset.tp]) AT_STATE.tp = AT_UTIL.deepClone(PRESETS.tp[preset.tp].items);
  if (PRESETS.atp[preset.atp]) AT_STATE.atp = AT_UTIL.deepClone(PRESETS.atp[preset.atp]);
  if (PRESETS.alur[preset.alur]) AT_STATE.alur = AT_UTIL.deepClone(PRESETS.alur[preset.alur].steps);
  if (PRESETS.skenario[preset.skenario]) AT_STATE.skenario = AT_UTIL.deepClone(PRESETS.skenario[preset.skenario].chapters);
  if (PRESETS.kuis[preset.kuis]) AT_STATE.kuis = AT_UTIL.deepClone(PRESETS.kuis[preset.kuis].soal);
  // Rebind all
  AT_META.bind(); AT_CP.bind(); AT_TP.render();
  AT_ATP.bind(); AT_ALUR.render(); AT_KUIS.render();
  AT_SKENARIO.render();
  if (window.AT_MODULES) AT_MODULES.render();
  if (window.AT_GAMES) AT_GAMES.render();
  if (window.AT_MATERI_EDITOR) AT_MATERI_EDITOR.render();
  AT_DASH.render();
  AT_UNDO.push();
  AT_UTIL.toast('Preset diterapkan: ' + presetKey);
};

/* ── GLOBAL SAVE ─────────────────────────────────────────────── */
window.saveAll = function () {
  const ok = AT_STORAGE.save(AT_STATE);
  AT_STATE.dirty = false;
  document.getElementById("dirtyDot").style.opacity = "0";
  AT_UTIL.toast(ok ? "✅ Tersimpan ke browser" : "❌ Gagal menyimpan", ok ? "ok" : "err");
  AT_DASH.render();
};

/* ── AUTO-SAVE ───────────────────────────────────────────────── */
let _autoSaveTimer;
function scheduleAutoSave() {
  clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(() => {
    if (AT_STATE.dirty) saveAll();
  }, 8000);
}
document.addEventListener("input", scheduleAutoSave);

/* ── INIT ────────────────────────────────────────────────────── */
window.AT_EDITOR_INIT = function () {
  // Load from storage
  const saved = AT_STORAGE.load();
  if (saved) {
    Object.assign(AT_STATE, saved);
    AT_UTIL.toast("📂 Data tersimpan dimuat");
  }

  // Nav click
  document.querySelectorAll(".nav-item[data-panel]").forEach(el => {
    el.addEventListener("click", () => AT_NAV.go(el.dataset.panel));
  });

  // Header buttons
  document.getElementById("btnSave")?.addEventListener("click", saveAll);
  document.getElementById("btnExport")?.addEventListener("click", () => AT_NAV.go("import"));

  // Init new module states
  if (!AT_STATE.games) AT_STATE.games = [];
  if (!AT_STATE.modules) AT_STATE.modules = [];
  if (!AT_STATE.materi) AT_STATE.materi = { blok: [] };

  // Bind all panels
  AT_META.bind();
  AT_CP.bind();
  AT_TP.render();
  AT_ATP.bind();
  AT_ALUR.render();
  AT_KUIS.render();
  AT_SKENARIO.render();

  // Render konten panels on init
  if (window.AT_MATERI_EDITOR) AT_MATERI_EDITOR.render();
  if (window.AT_MODULES) AT_MODULES.render();
  if (typeof checkMigrateBanner === 'function') checkMigrateBanner();

  // Open first accordion by default
  setTimeout(() => {
    const firstAcc = document.querySelector('.acc-section');
    if (firstAcc) {
      firstAcc.classList.add('open');
      const body = firstAcc.querySelector('.acc-body');
      if (body) body.style.maxHeight = body.scrollHeight + 40 + 'px';
    }
  }, 100);

  // Start on dashboard
  AT_NAV.go("dashboard");
  AT_DASH.render();
};

console.log("✅ editor.js loaded");
