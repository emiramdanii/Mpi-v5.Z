// ═══════════════════════════════════════════════════════════════
// IMPORTER.JS — Excel import, CP/ATP doc parser, drag & drop, projects
// Authoring Tool v1.0
// ═══════════════════════════════════════════════════════════════

/* ── EXCEL IMPORT ────────────────────────────────────────────── */
window.AT_IMPORT = {

  // Download blank template as CSV zip instructions
  downloadTemplate() {
    // Generate multi-sheet guide as JSON-based CSV blob
    const sheets = EXCEL_SCHEMA.sheets;
    let content = "PANDUAN IMPORT AUTHORING TOOL v1.0\n";
    content += "=".repeat(60) + "\n\n";
    content += "Buat file Excel (.xlsx) dengan sheet-sheet berikut:\n\n";
    sheets.forEach(sh => {
      content += `[Sheet: ${sh.name}]\n`;
      content += sh.fields.join("\t") + "\n";
      content += "(isi data di baris berikutnya, satu baris per entri)\n\n";
    });
    content += "\nCONTOH DATA:\n\n";
    content += "[Sheet: META]\n";
    content += "judulPertemuan\tsubjudul\tikon\tdurasi\tnamaBab\tmapel\tkelas\tkurikulum\n";
    content += "Pertemuan 1 – Hakikat Norma\tMengapa manusia membutuhkan norma?\t🧑‍🤝‍🧑\t2 × 40 menit\tHakikat Norma\tPPKn\tVII\tKurikulum Merdeka\n\n";
    content += "[Sheet: TP]\n";
    content += "verb\tdesc\tpertemuan\tcolor\n";
    content += "Menjelaskan\tpengertian norma sebagai aturan yang mengikat\t1\tvar(--y)\n";
    content += "Mengidentifikasi\tmacam-macam norma (agama, kesusilaan, hukum)\t2\tvar(--c)\n\n";
    content += "[Sheet: ATP]\n";
    content += "namaBab\tno\tjudul\ttp\tdurasi\tkegiatan\tpenilaian\n";
    content += "Bab 3 Norma\t1\tHakikat Norma\tTP 1\t2×40 menit\tSkenario → Materi → Diskusi\tObservasi\n\n";
    content += "[Sheet: ALUR]\n";
    content += "no\tfase\tdurasi\tjudul\tdeskripsi\n";
    content += "1\tPendahuluan\t10 menit\tApersepsi\tGuru menyapa dan membuka dengan pertanyaan pemantik\n\n";
    content += "[Sheet: KUIS]\n";
    content += "no\tsoal\toptA\toptB\toptC\toptD\tjawaban\tpenjelasan\n";
    content += "1\tApa fungsi utama norma?\tMenghukum pelanggar\tMenciptakan ketertiban\tMembatasi kebebasan\tMenakuti warga\tB\tFungsi norma adalah menciptakan ketertiban bersama\n";

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "template_authoring_tool.txt";
    a.click(); URL.revokeObjectURL(url);
    AT_UTIL.toast("📥 Template panduan diunduh");
  },

  // Download as actual XLSX via SheetJS
  downloadExcel() {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => this._buildExcel();
    document.head.appendChild(script);
  },

  _buildExcel() {
    try {
      const wb = XLSX.utils.book_new();

      // META sheet
      const metaData = [
        EXCEL_SCHEMA.sheets[0].fields,
        [AT_STATE.meta.judulPertemuan,"","📚","2 × 40 menit","","PPKn","VII","Kurikulum Merdeka"]
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(metaData), "META");

      // TP sheet
      const tpHeader = EXCEL_SCHEMA.sheets[2].fields;
      const tpRows = AT_STATE.tp.length
        ? AT_STATE.tp.map(t => [t.verb, t.desc, t.pertemuan, t.color])
        : [["Menjelaskan","(deskripsi TP di sini)",1,"var(--y)"]];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([tpHeader, ...tpRows]), "TP");

      // ATP sheet
      const atpHeader = EXCEL_SCHEMA.sheets[3].fields;
      const atpRows = AT_STATE.atp.pertemuan.length
        ? AT_STATE.atp.pertemuan.map((p,i) => [AT_STATE.atp.namaBab, i+1, p.judul, p.tp, p.durasi, p.kegiatan, p.penilaian])
        : [["Nama Bab",1,"Judul Pertemuan","TP 1","2×40 menit","Kegiatan pembelajaran","Penilaian"]];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([atpHeader, ...atpRows]), "ATP");

      // ALUR sheet
      const alurHeader = EXCEL_SCHEMA.sheets[4].fields;
      const alurRows = AT_STATE.alur.length
        ? AT_STATE.alur.map((s,i) => [i+1, s.fase, s.durasi, s.judul, s.deskripsi])
        : [[1,"Pendahuluan","10 menit","Apersepsi","Deskripsi kegiatan"]];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([alurHeader, ...alurRows]), "ALUR");

      // KUIS sheet
      const kuisHeader = EXCEL_SCHEMA.sheets[5].fields;
      const kuisRows = AT_STATE.kuis.length
        ? AT_STATE.kuis.map((s,i)=>{ const L=["A","B","C","D"]; return [i+1,s.q,...(s.opts||["","","",""]),L[s.ans],s.ex]; })
        : [[1,"Pertanyaan soal","Opsi A","Opsi B","Opsi C","Opsi D","A","Penjelasan jawaban"]];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([kuisHeader, ...kuisRows]), "KUIS");

      // CP sheet
      const cpHeader = EXCEL_SCHEMA.sheets[1].fields;
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        cpHeader,
        [AT_STATE.cp.elemen, AT_STATE.cp.subElemen, AT_STATE.cp.capaianFase, (AT_STATE.cp.profil||[]).join(";"), AT_STATE.cp.fase, AT_STATE.cp.kelas]
      ]), "CP");

      XLSX.writeFile(wb, "template_authoring_tool.xlsx");
      AT_UTIL.toast("✅ Template Excel diunduh!");
    } catch(e) {
      AT_UTIL.toast("❌ Gagal buat Excel: " + e.message, "err");
    }
  },

  // Parse uploaded Excel — fills ALL tabs at once
  handleFile(file) {
    if (!file) return;
    const statusEl = document.getElementById("importStatus");
    statusEl.className = "import-status info";
    statusEl.style.display = "block";
    statusEl.textContent = "⏳ Membaca file…";

    const reader = new FileReader();
    reader.onload = (e) => {
      // Try to load SheetJS if not present
      if (typeof XLSX === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.onload = () => this._parseFile(e.target.result, statusEl, file.name);
        script.onerror = () => { statusEl.className = "import-status err"; statusEl.textContent = "❌ Gagal memuat library Excel. Cek koneksi internet."; };
        document.head.appendChild(script);
      } else {
        this._parseFile(e.target.result, statusEl, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  },

  _parseFile(buffer, statusEl, filename) {
    try {
      const wb = XLSX.read(buffer, { type: "array" });
      let log = [];
      let filled = 0;

      // META
      const metaSh = wb.Sheets["META"];
      if (metaSh) {
        const rows = XLSX.utils.sheet_to_json(metaSh, { header: 1 });
        if (rows[1]) {
          const [judulPertemuan, subjudul, ikon, durasi, namaBab, mapel, kelas, kurikulum] = rows[1];
          Object.assign(AT_STATE.meta, { judulPertemuan, subjudul, ikon, durasi, namaBab, mapel, kelas, kurikulum });
          AT_META.bind();
          log.push("✅ META diisi"); filled++;
        }
      }

      // CP
      const cpSh = wb.Sheets["CP"];
      if (cpSh) {
        const rows = XLSX.utils.sheet_to_json(cpSh, { header: 1 });
        if (rows[1]) {
          const [elemen, subElemen, capaianFase, profil, fase, kelas] = rows[1];
          AT_STATE.cp = { elemen, subElemen, capaianFase, profil: profil ? profil.split(";") : [], fase: fase||"D", kelas };
          AT_CP.bind();
          log.push("✅ CP diisi"); filled++;
        }
      }

      // TP
      const tpSh = wb.Sheets["TP"];
      if (tpSh) {
        const rows = XLSX.utils.sheet_to_json(tpSh, { header: 1 }).slice(1);
        AT_STATE.tp = rows.filter(r=>r[0]).map((r,i) => ({
          verb: r[0] || "Menjelaskan", desc: r[1] || "", pertemuan: +r[2] || 1,
          color: r[3] || AT_UTIL.colorForIndex(i)
        }));
        AT_TP.render();
        log.push(`✅ ${AT_STATE.tp.length} TP diisi`); filled++;
      }

      // ATP
      const atpSh = wb.Sheets["ATP"];
      if (atpSh) {
        const rows = XLSX.utils.sheet_to_json(atpSh, { header: 1 }).slice(1).filter(r=>r[0]);
        if (rows.length) {
          AT_STATE.atp.namaBab = rows[0][0] || "";
          AT_STATE.atp.pertemuan = rows.map(r => ({
            judul: r[2]||"", tp: r[3]||"", durasi: r[4]||"", kegiatan: r[5]||"", penilaian: r[6]||""
          }));
          AT_ATP.bind();
          log.push(`✅ ${rows.length} Pertemuan ATP diisi`); filled++;
        }
      }

      // ALUR
      const alurSh = wb.Sheets["ALUR"];
      if (alurSh) {
        const rows = XLSX.utils.sheet_to_json(alurSh, { header: 1 }).slice(1).filter(r=>r[1]);
        AT_STATE.alur = rows.map(r => ({
          fase: r[1]||"Inti", durasi: r[2]||"", judul: r[3]||"", deskripsi: r[4]||""
        }));
        AT_ALUR.render();
        log.push(`✅ ${rows.length} Langkah Alur diisi`); filled++;
      }

      // KUIS
      const kuisSh = wb.Sheets["KUIS"];
      if (kuisSh) {
        const rows = XLSX.utils.sheet_to_json(kuisSh, { header: 1 }).slice(1).filter(r=>r[1]);
        const letterToIdx = { A:0, B:1, C:2, D:3 };
        AT_STATE.kuis = rows.map(r => ({
          q: r[1]||"", opts: [r[2]||"",r[3]||"",r[4]||"",r[5]||""],
          ans: letterToIdx[(r[6]||"A").toString().toUpperCase()] ?? 0, ex: r[7]||""
        }));
        AT_KUIS.render();
        log.push(`✅ ${rows.length} Soal Kuis diisi`); filled++;
      }

      AT_EDITOR.markDirty();
      statusEl.className = "import-status ok";
      statusEl.innerHTML = `<strong>✅ Import "${filename}" berhasil — ${filled}/6 sheet diproses:</strong><br>${log.join("<br>")}`;
      AT_UTIL.toast(`✅ ${filled} sheet berhasil diimport!`);
      AT_DASH.render();
    } catch (err) {
      statusEl.className = "import-status err";
      statusEl.textContent = "❌ Gagal parse: " + err.message;
    }
  },

  // Parse CP text document (paste) → generate TP + Alur via pattern
  parseCP(text) {
    if (!text.trim()) { AT_UTIL.toast("⚠️ Teks CP kosong", "err"); return; }
    const result = document.getElementById("cpParseResult");
    result.className = "gen-result show";
    result.innerHTML = `<div class="ai-thinking"><span></span><span></span><span></span></div> Menganalisis dokumen CP…`;

    setTimeout(() => {
      // Extract TP from CP text via Bloom's verbs
      const bloomVerbs = ["menjelaskan","mengidentifikasi","menganalisis","memberikan contoh","menerapkan","mengevaluasi","membandingkan","menyimpulkan","mendeskripsikan","merancang","membuat","memahami","menyebutkan"];
      const sentences = text.split(/[.!?;]/).map(s => s.trim()).filter(s => s.length > 10);
      const tps = [];
      sentences.forEach(sent => {
        const lower = sent.toLowerCase();
        const verb = bloomVerbs.find(v => lower.includes(v));
        if (verb && tps.length < 6) {
          tps.push({
            verb: verb.charAt(0).toUpperCase() + verb.slice(1),
            desc: sent.replace(new RegExp(verb, "gi"), "").replace(/peserta didik\s+/i, "").trim().replace(/^\w/, c=>c.toLowerCase()),
            pertemuan: Math.ceil((tps.length + 1) / 2),
            color: AT_UTIL.colorForIndex(tps.length)
          });
        }
      });

      if (tps.length === 0) {
        // Fallback: extract from keywords
        const keywords = text.match(/\b(norma|hukum|pancasila|kewajiban|hak|nilai|perilaku)[^.]*\./gi) || [];
        keywords.slice(0, 4).forEach((kw, i) => {
          tps.push({ verb: "Menjelaskan", desc: kw.trim(), pertemuan: i+1, color: AT_UTIL.colorForIndex(i) });
        });
      }

      // Update state
      if (tps.length) {
        AT_STATE.tp = tps;
        AT_TP.render();
        AT_EDITOR.markDirty();
        result.className = "gen-result show";
        result.innerHTML = `
          <strong style="color:var(--g)">✅ ${tps.length} TP berhasil digenerate dari dokumen CP:</strong><br><br>
          ${tps.map((t,i)=>`<span style="color:var(--c)">${i+1}.</span> <strong>${t.verb}</strong> — ${t.desc.slice(0,80)}…`).join("<br>")}
          <br><br>
          <span style="color:var(--muted);font-size:.76rem">💡 TP sudah masuk ke panel Tujuan Pembelajaran. Silakan edit sesuai kebutuhan.</span>
        `;
        AT_UTIL.toast(`✅ ${tps.length} TP digenerate dari CP!`);
      } else {
        result.innerHTML = `<span style="color:var(--r)">⚠️ Tidak dapat mengenali pola TP dari teks ini. Coba paste teks CP yang lebih lengkap, atau isi TP secara manual.</span>`;
      }
    }, 800);
  },

  // Parse ATP text → generate Alur
  parseATP(text) {
    if (!text.trim()) { AT_UTIL.toast("⚠️ Teks ATP kosong", "err"); return; }
    const result = document.getElementById("atpParseResult");
    result.className = "gen-result show";
    result.innerHTML = `<div class="ai-thinking"><span></span><span></span><span></span></div> Menganalisis ATP…`;

    setTimeout(() => {
      const lines = text.split("\n").map(l=>l.trim()).filter(l=>l.length>5);
      const phases = ["Pendahuluan","Inti","Penutup"];
      const alur = [];
      let phaseIdx = 0;
      const keywords = { pendahuluan:["apersepsi","motivasi","salam","doa","absen","pembuka","orientasi"],
                         inti:["diskusi","materi","presentasi","eksplorasi","latihan","kuis","permainan","game","aktivitas","proyek","analisis"],
                         penutup:["refleksi","simpul","penutup","kesimpulan","tindak lanjut","PR","portofolio"] };
      lines.forEach((line, idx) => {
        const lower = line.toLowerCase();
        let fase = phases[1]; // default Inti
        if (keywords.pendahuluan.some(k=>lower.includes(k))) fase = "Pendahuluan";
        else if (keywords.penutup.some(k=>lower.includes(k))) fase = "Penutup";
        // Extract duration
        const durMatch = line.match(/(\d+)\s*menit/);
        const durasi = durMatch ? durMatch[0] : "15 menit";
        alur.push({ fase, durasi, judul: line.slice(0, 40), deskripsi: line });
      });

      if (alur.length) {
        AT_STATE.alur = alur.slice(0, 10);
        AT_ALUR.render();
        AT_EDITOR.markDirty();
        result.className = "gen-result show";
        result.innerHTML = `<strong style="color:var(--g)">✅ ${alur.length} Langkah Alur digenerate dari ATP:</strong><br><br>
          ${alur.slice(0,5).map(a=>`<span style="color:var(--y)">[${a.fase}]</span> ${a.judul}`).join("<br>")}
          ${alur.length > 5 ? `<br><span style="color:var(--muted)">… dan ${alur.length-5} langkah lainnya</span>` : ""}`;
        AT_UTIL.toast(`✅ ${alur.length} langkah alur digenerate!`);
      } else {
        result.innerHTML = `<span style="color:var(--r)">⚠️ Tidak dapat mengenali pola ATP. Coba format: satu kegiatan per baris.</span>`;
      }
    }, 700);
  },
};

/* ── DRAG & DROP FOR FILE ────────────────────────────────────── */
window.AT_DROPZONE = {
  init(zoneId, inputId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    zone.addEventListener("click", () => input.click());
    zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", e => {
      e.preventDefault();
      zone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) AT_IMPORT.handleFile(file);
    });
    input.addEventListener("change", () => {
      if (input.files[0]) AT_IMPORT.handleFile(input.files[0]);
    });
  }
};

/* ── PROJECTS ────────────────────────────────────────────────── */
window.AT_PROJECTS = {
  render() {
    const cont = document.getElementById("projects_list");
    if (!cont) return;
    const projects = AT_STORAGE.loadProjects();
    if (!projects.length) {
      cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📁</div><div class="empty-state-text">Belum ada proyek tersimpan.</div></div>`;
      return;
    }
    cont.innerHTML = projects.map((p, i) => `
      <div class="project-row" onclick="AT_PROJECTS.load(${i})">
        <div class="project-row-icon">${p.meta?.ikon || "📚"}</div>
        <div class="project-row-info">
          <div class="project-row-title">${p.meta?.judulPertemuan || "Proyek " + (i+1)}</div>
          <div class="project-row-meta">${p.meta?.mapel || ""} ${p.meta?.kelas || ""} · ${p.savedAt || ""}</div>
        </div>
        <div class="project-row-actions">
          <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();AT_PROJECTS.delete(${i})">🗑️</button>
        </div>
      </div>
    `).join("");
  },

  save() {
    const projects = AT_STORAGE.loadProjects();
    const snap = AT_UTIL.deepClone(AT_STATE);
    snap.savedAt = new Date().toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
    // Check duplicate by judulPertemuan
    const existing = projects.findIndex(p => p.meta?.judulPertemuan === AT_STATE.meta.judulPertemuan);
    if (existing >= 0) projects[existing] = snap;
    else projects.push(snap);
    AT_STORAGE.saveProjects(projects);
    this.render();
    AT_UTIL.toast("✅ Proyek disimpan!");
  },

  load(i) {
    const projects = AT_STORAGE.loadProjects();
    if (!projects[i]) return;
    Object.assign(AT_STATE, AT_UTIL.deepClone(projects[i]));
    AT_META.bind(); AT_CP.bind(); AT_TP.render(); AT_ATP.bind(); AT_ALUR.render(); AT_KUIS.render(); AT_SKENARIO.render();
    AT_UTIL.toast("✅ Proyek dimuat: " + AT_STATE.meta.judulPertemuan);
    AT_NAV.go("dashboard");
  },

  delete(i) {
    const projects = AT_STORAGE.loadProjects();
    projects.splice(i, 1);
    AT_STORAGE.saveProjects(projects);
    this.render();
    AT_UTIL.toast("🗑️ Proyek dihapus");
  },

  newProject() {
    if (AT_STATE.dirty && !confirm("Proyek saat ini belum disimpan. Lanjutkan?")) return;
    // Reset state
    Object.assign(AT_STATE, {
      meta:{ judulPertemuan:"", subjudul:"", ikon:"📚", durasi:"", namaBab:"", mapel:"", kelas:"", kurikulum:"" },
      cp:{ elemen:"", subElemen:"", capaianFase:"", profil:[], fase:"D", kelas:"" },
      tp:[], atp:{ namaBab:"", jumlahPertemuan:3, pertemuan:[] },
      alur:[], skenario:[], kuis:[], dirty:false
    });
    AT_META.bind(); AT_CP.bind(); AT_TP.render(); AT_ATP.bind(); AT_ALUR.render(); AT_KUIS.render(); AT_SKENARIO.render();
    AT_NAV.go("meta");
    AT_UTIL.toast("✨ Proyek baru dimulai");
  }
};

console.log("✅ importer.js loaded");
