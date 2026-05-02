# 📋 PROGRESS.MD — Authoring Tool v1.0
> **Dokumen handoff untuk sesi chat berikutnya.**  
> Baca file ini sebelum melanjutkan pengembangan agar konteks tidak hilang.

---

## 🗂️ STRUKTUR FILE (7 file, sinkron)

```
authoring-tool/
├── index.html       ← Shell UI: sidebar, header, semua panel HTML
├── style.css        ← Semua CSS: tokens, layout, komponen, responsive
├── data.js          ← PRESETS library + AT_STATE + AT_STORAGE + AT_UTIL
├── editor.js        ← Panel render & form binding (META, CP, TP, ATP, Alur, Kuis, Sk)
├── importer.js      ← Excel import/export, CP/ATP parser, AT_PROJECTS, AT_EXPORT
├── preview.js       ← Live preview renderer → full student-facing HTML
├── animations.js    ← AT_ANIM, AT_DRAG (sort), AT_TOUR, AT_SHORTCUTS, AT_VALIDATE
└── PROGRESS.md      ← File ini
```

**Load order** (wajib urut): `data.js → editor.js → importer.js → preview.js → animations.js`

---

## ✅ FITUR YANG SUDAH SELESAI (v1.0)

### Panel Editor
- [x] **Dashboard** — progress bar, stat chips, checklist kelengkapan, quick-apply preset
- [x] **Identitas Media (META)** — form lengkap + 3 preset (Hakikat Norma, Macam Norma, Kosong)
- [x] **Capaian Pembelajaran (CP)** — form elemen/sub-elemen/fase + tag input Profil Pelajar Pancasila + 2 preset
- [x] **Tujuan Pembelajaran (TP)** — tambah/hapus/edit, selector verb Bloom, color picker, drag-sort
- [x] **ATP (Alur Tujuan Pembelajaran)** — per-pertemuan: judul, TP dicapai, kegiatan, penilaian + 2 preset
- [x] **Alur Pembelajaran** — langkah pendahuluan/inti/penutup + durasi + drag-sort + 2 preset
- [x] **Skenario Interaktif** — apply preset 3-skenario, list view, info judul/bg/choices
- [x] **Editor Kuis** — tambah/hapus/edit soal PG, 4 opsi + radio jawaban + feedback + preset 10 soal

### Import / Export
- [x] **Import Excel (.xlsx)** — multi-sheet parse (META, CP, TP, ATP, ALUR, KUIS) — isi semua tab sekaligus
- [x] **Download Template Excel** — via SheetJS, 6 sheet terisi data dari state aktif
- [x] **Download Panduan (.txt)** — schema + contoh isian
- [x] **Generate TP dari CP** — regex Bloom verb extractor dari paste teks
- [x] **Generate Alur dari ATP** — keyword classifier (pendahuluan/inti/penutup) + durasi parser
- [x] **Export HTML** — student-facing file lengkap dengan embedded state JSON
- [x] **Export JSON** — raw AT_STATE untuk backup/transfer
- [x] **Cetak Dokumen Admin** — CP, TP, ATP, Alur dalam format tabel siap print/PDF

### Preview
- [x] **Live Preview** — iframe srcdoc di-generate dari AT_STATE setiap kali panel dibuka
- [x] **3 Device Mode** — Mobile (390px), Tablet (768px), Desktop (100%)
- [x] **Full student flow** — Cover → CP/TP/ATP tabs → Skenario interaktif → Materi+Fungsi → Kuis → Hasil+Refleksi

### Animasi & UX
- [x] **Ripple effect** — semua tombol dan card
- [x] **scoreFlash** — floating "+N" particle
- [x] **Drag-sort** — TP, Alur, Kuis bisa diurutkan ulang dengan drag
- [x] **Panel slide-in** — transisi antar panel
- [x] **countUp** — animasi angka di dashboard
- [x] **Onboarding Tour** — 6-step guided tour untuk user baru
- [x] **Keyboard Shortcuts** — Ctrl+S, Ctrl+P, Ctrl+/, Escape
- [x] **Skeleton loader** — shimmer placeholder saat konten belum muncul
- [x] **Field validation** — shake + highlight merah jika required field kosong
- [x] **Auto-save** — setiap 8 detik jika ada perubahan (dirty state)
- [x] **Dirty dot** — indikator kuning di header jika ada perubahan belum disimpan
- [x] **beforeunload guard** — warning sebelum tutup tab jika ada unsaved changes

### Proyek
- [x] **Multi-project** — simpan/muat/hapus beberapa proyek di localStorage
- [x] **Full preset** — 1 klik terapkan semua tab (Meta + CP + TP + ATP + Alur + Kuis + Skenario)

---

## 🚧 BELUM SELESAI / TODO — Updated v1.5

### Selesai ✅
- [x] **Skenario Detail Editor** — ✅ selesai di liveview.js — form edit per-chapter: dialog setup (speaker + text) + choices (icon, label, detail, pts, level, consequences). Saat ini hanya list view + apply preset.
- [x] **Drag-sort ATP** — ✅ selesai di extras.js (AT_ATP_DRAG)
- [x] **Undo/Redo** — ✅ selesai di liveview.js (AT_UNDO)
- [x] **Field debounce** — ✅ aktif via AT_SPLITVIEW 400ms debounce

### Medium Priority
- [x] **Import JSON** — ✅ selesai di liveview.js (AT_JSON_IO)
- [x] **Preview Sync** — ✅ selesai di liveview.js (AT_SPLITVIEW + sync dot)
- [x] **Materi Konten Editor** — ✅ selesai di extras.js (AT_MATERI_EDITOR, 6 tipe blok)
- [ ] **Game Tim Editor** — form edit soal TEAM_SOAL untuk kuis kelompok di student view
- [x] **Fungsi Norma Editor** — ✅ selesai di liveview.js (AT_FUNGSI_EDITOR)
- [x] **CP Profil Suggestions** — ✅ selesai di extras.js (AT_CP_SUGGEST)
- [x] **Excel Import Preview** — ✅ selesai di extras.js (AT_EXCEL_PREVIEW + modal)

### Low Priority
- [ ] **Cloud Sync** — simpan ke Google Drive / Firebase (butuh backend/auth)
- [ ] **Collaborative Edit** — multi-guru edit proyek yang sama
- [x] **Version History** — ✅ selesai di extras.js (AT_VERSIONS)
- [ ] **Theme Switcher** — light mode
- [ ] **AI Generate via Claude API** — integrasi langsung ke Anthropic API untuk generate konten (bukan hanya regex)
- [ ] **QR Code Export** — generate QR link ke media HTML yang di-host
- [ ] **Accessibility** — aria-labels, focus trap di modal, keyboard nav list items

---

## 🔧 CARA UPGRADE DI SESI BERIKUTNYA

### Pola yang Dipakai
Setiap fitur baru mengikuti pola ini agar tetap sinkron:

```
1. data.js      → Tambah PRESET atau field baru di AT_STATE
2. editor.js    → Tambah panel render + form bind
3. index.html   → Tambah nav-item + panel div
4. importer.js  → Tambah parsing kolom Excel jika ada data baru
5. preview.js   → Update _generate() agar pakai data baru
6. animations.js → Tambah AT_ANIM / drag init jika ada list baru
7. style.css    → Tambah CSS jika perlu komponen baru
```

### Skenario Detail Editor (v1.1 Priority)
Untuk membuat form edit per-chapter skenario:

```js
// Di editor.js — tambah fungsi ini:
AT_SKENARIO.openDetail = function(chapterIdx) {
  // Buka modal dengan form:
  // - setup[]: speaker + text (tambah/hapus/edit)
  // - choices[]: icon, label, detail, pts, level (good/mid/bad), resultTitle, resultBody
  // - consequences[] per choice: icon + text
  // Bind ke AT_STATE.skenario[chapterIdx]
};
```

```html
<!-- Di index.html — tambah modal: -->
<div class="modal-overlay" id="skDetailModal">
  <div class="modal-box" id="skDetailBox">
    <!-- form dinamis -->
  </div>
</div>
```

### Menambah Preset Baru
```js
// Di data.js — tambah ke object yang sesuai:
PRESETS.tp["bab1-pancasila"] = {
  id: "bab1-pancasila",
  label: "Bab 1 – Pancasila Dasar Negara",
  items: [
    { verb: "Menjelaskan", desc: "...", pertemuan: 1, color: "var(--y)" },
    // ...
  ]
};

// Di index.html — tambah preset-card di panel TP:
<div class="preset-card" onclick="AT_TP.applyPreset('bab1-pancasila')">
  ...
</div>
```

### Menambah Panel Baru
```html
<!-- 1. Tambah nav-item di sidebar (index.html): -->
<div class="nav-item" data-panel="newpanel">
  <span class="nav-icon">🆕</span> Panel Baru
</div>

<!-- 2. Tambah panel div: -->
<div class="panel" id="p-newpanel">
  <div class="panel-header">...</div>
  <!-- konten -->
</div>
```

```js
// 3. Tambah ke AT_NAV titles (editor.js):
const titles = {
  // ...existing...
  newpanel: "Panel Baru",
};
```

---

## 🏗️ ARSITEKTUR DATA

### AT_STATE (state global, disimpan ke localStorage)
```js
AT_STATE = {
  meta:    { judulPertemuan, subjudul, ikon, durasi, namaBab, mapel, kelas, kurikulum },
  cp:      { elemen, subElemen, capaianFase, profil[], fase, kelas },
  tp:      [{ verb, desc, pertemuan, color }],
  atp:     { namaBab, jumlahPertemuan, pertemuan[{ judul, tp, durasi, kegiatan, penilaian }] },
  alur:    [{ fase, durasi, judul, deskripsi }],
  skenario:[{ id, title, bg, charEmoji, charColor, charPants, setup[], choicePrompt, choices[] }],
  kuis:    [{ q, opts[], ans, ex }],
  guruPw:  "guru123",
  dirty:   false,
}
```

### Excel Sheet Schema
| Sheet | Kolom |
|-------|-------|
| META  | judulPertemuan, subjudul, ikon, durasi, namaBab, mapel, kelas, kurikulum |
| CP    | elemen, subElemen, capaianFase, profil (semicolon-sep), fase, kelas |
| TP    | verb, desc, pertemuan, color |
| ATP   | namaBab, no, judul, tp, durasi, kegiatan, penilaian |
| ALUR  | no, fase, durasi, judul, deskripsi |
| KUIS  | no, soal, optA, optB, optC, optD, jawaban (A/B/C/D), penjelasan |

---

## 🐛 KNOWN ISSUES

| Issue | Lokasi | Workaround |
|-------|--------|------------|
| Skenario drag-sort belum ada | sk_list | Hapus + tambah ulang manual |
| Generate TP hanya pakai regex, bisa meleset | importer.js `parseCP()` | Edit hasil di panel TP |
| Excel download butuh koneksi internet (SheetJS CDN) | importer.js | Download template .txt tersedia offline |
| Preview tidak hot-reload | preview.js | Buka panel Preview untuk refresh |
| Tour overlay tidak scroll ke target | animations.js `AT_TOUR._render()` | Posisi box dikira absolut viewport |

---

## 📦 DEPENDENCIES EKSTERNAL

| Library | URL | Dipakai di |
|---------|-----|------------|
| Google Fonts (Plus Jakarta Sans, Space Grotesk, Fraunces) | fonts.googleapis.com | style.css |
| Google Fonts (Nunito, Fredoka One) | fonts.googleapis.com | preview.js (student view) |
| SheetJS (xlsx) | cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js | importer.js (lazy load) |

Semua dependency di-load secara lazy (hanya saat dibutuhkan), kecuali Google Fonts di style.css.

---

## 🗓️ CHANGELOG

### v1.6 (index rebuilt + games-in-modules + dashboard fix + preview routing fix)
- **Fix: index.html rusak** — restored dari backup, kemudian dibangun ulang secara aman blok per blok
- **Fix: nextAfterMateri is not defined** — variabel JS build-time tidak bisa dipakai di student browser. Fix: gunakan `go(nextAfterMat())` langsung di HTML, `nextAfterMat()` di-inject sebagai script via `navChainJs`
- **Fix: Dashboard stats** — sekarang tampilkan Modul (🧩), Game (🎮), Materi Blok (📝) selain TP/ATP/Alur/Kuis
- **Fix: Game tidak bisa ditambah ke Modul** — `AT_MODULES.showPicker()` sekarang menampilkan SEMUA tipe modul + semua tipe game. `AT_MODULES.addGame(typeId)` menambah game sebagai modul dengan flag `_isGame:true`. `renderModuleHtml` dan `_buildEditorForm` mendelegasi ke `AT_GAMES` untuk modul game.
- **Fix: Sidebar terlalu panjang** — wrap dalam `#sidebar-nav` dengan `overflow-y:auto`. Nav dikelompok ulang: Proyek | 📐 Dokumen | 📚 Konten | ⚡ Tools (13 item, lebih ramping)
- **Baru: Panel Materi, Games, Autogen, Versions** ditambahkan ke index.html dengan konten lengkap
- **Baru: modals** — ModulePicker, ModuleEditor, GamePicker, GameEditor, SkDetailModal, FungsiModal, ExcelPreviewModal
- **Baru: Split-view button** di header, dirty-dot indicator
- **Semua script tags** — load order benar: data→editor→modules→games→autogen→importer→preview→animations→extras→liveview

### v1.5 (autogen improved + drag fix + sidebar scroll + skenario multi-chapter)
- **Fix: Drag reorder benar** — AT_DRAG ditulis ulang. Root cause: data-orig-idx di-stamp setelah DOM berubah. Fix: stamp sebelum drag, pakai `placeholder.replaceWith(dragEl)`, baca final DOM order untuk newOrder.
- **Fix: Sidebar scroll** — 17 nav-item tidak bisa discroll. Fix: wrap dalam `#sidebar-nav` dengan `flex:1; overflow-y:auto`.
- **Fix: Preview modules+games tidak muncul** — `nextAfterMateri` JS var tidak bisa diinterpolasi ke HTML string. Fix: inject `navChainJs` sebagai script ke student HTML (`HAS_MODS`, `HAS_GAMES`, `nextAfterMat()`).
- **Improve: autogen.js ditulis ulang total** (v1.5, 682 baris):
  - Parse lebih cerdas: definisi regex, enumerasi, fungsi, sebab-akibat
  - 6 pola soal kuis: dari definisi, enumerasi, fungsi, kausalitas, aplikasi kontekstual, relasi topik
  - Generate game Matching dari definisi + game TrueFalse dari definisi/fungsi
  - Skenario 2-chapter kontekstual dengan dialog dan choices yang relevan materi
  - Flashcard dari definisi + enumerasi + fungsi
  - Apply section tambah checkbox: Game Pasangkan + Game Benar/Salah
- **Modules.js**: tambah `_delChapter()` + `_addChapter()` — skenario dalam 1 modul bisa punya banyak chapter (multi-skenario).
- **autogen.js** dikembalikan (hilang di session sebelumnya).

### v1.4 (materi editor + excel preview + versions + ATP drag + debounce + CP suggest)
- **Baru: Panel "Editor Materi"** — 6 tipe blok konten: Paragraf Teks, Kotak Definisi (highlight kuning), Poin-Poin, Tabel (tambah/hapus baris+kolom), Kutipan/Quote, Gambar dari URL (dengan preview inline). Semua dirender di halaman Materi siswa.
- **Baru: `extras.js`** — File fitur pelengkap (602 baris):
  - `AT_MATERI_EDITOR` — editor + renderer blok konten materi
  - `AT_VERSIONS` — version history bernama (max 20 snapshot), simpan/pulihkan/hapus
  - `AT_EXCEL_PREVIEW` — preview tabel data Excel sebelum diimport (modal preview per sheet)
  - `AT_CP_SUGGEST` — autocomplete dropdown Profil Pelajar Pancasila saat mengetik
  - `AT_DEBOUNCE` — aktif via AT_SPLITVIEW 400ms (tidak re-render tiap keystroke)
  - `AT_ATP_DRAG` — drag reorder pertemuan di panel ATP
- **Baru: Panel "Riwayat Versi"** — snapshot bernama, restore satu klik, max 20 versi.
- **Fix: Excel Import** — sekarang tampilkan modal preview tabel sebelum apply, lalu konfirmasi.
- **Fix: Preview.js** — render modules screen + games screen jika ada di AT_STATE.
- **Fix: Materi konten** tampil di halaman Materi siswa (di atas tab Fungsi Norma).
- **File baru**: `extras.js` (total 12 file).

### v1.3 (live editor + skenario detail + undo/redo)
- **Baru: `liveview.js`** — 5 sistem baru dalam 1 file:
  1. **AT_SPLITVIEW** — tombol "⚡ Live" di header membuka split-view: editor kiri, preview kanan, auto-refresh 400ms debounce setiap perubahan state.
  2. **AT_SK_EDITOR** — Skenario Detail Editor lengkap: edit judul, latar, karakter, dialog setup (speaker+text tambah/hapus), choices (icon, label, level, poin, result, norma), konsekuensi per choice.
  3. **AT_FUNGSI_EDITOR** — Edit tab Fungsi Norma: icon, label, warna, deskripsi, contoh (multi-line), pertanyaan diskusi. Data tersimpan di AT_STATE.fungsi.
  4. **AT_UNDO** — Undo/Redo history stack (30 langkah), Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z. Tombol ↩/↪ di sidebar bottom.
  5. **AT_JSON_IO** — Import state dari file .json + export JSON. Input file di panel Import.
- **Fix: Preview tidak putih** — preview.js ditulis ulang total dengan array.join() (zero nested template literals). Syntax check 100% clean.
- **Fix: Drag smooth** — pointer events API, spring animation release, placeholder animated.
- **Skenario openDetail** stub selesai — klik "Edit Detail ↗" di card skenario sekarang membuka modal editor lengkap.
- **Fungsi Norma** bisa diedit via tombol "⚖️ Edit Fungsi Norma" di panel Skenario.
- **File baru**: `liveview.js` (total 11 file).

### v1.2 (games + autogen + smooth drag)
- **Baru: `games.js`** — 6 tipe game interaktif lengkap dengan editor & HTML renderer:
  Benar/Salah (feedback langsung), Sortir/Klasifikasi (drag drop), Roda Putar (SVG spin wheel),
  Memory Match (balik kartu), Kuis Tim/Buzzer (skor tim real-time), Word Search (grid huruf auto-gen).
- **Baru: `autogen.js`** — Auto-generate Non-AI dari teks materi: TP (per level Bloom C1-C6),
  CP (elemen+capaian), ATP (per pertemuan), Alur Pembelajaran, Kuis PG, Flashcard, Skenario template.
  Panel "Auto-Generate" dengan preview sebelum diterapkan, checkbox pilih konten yang mau di-apply.
- **Fix: Drag smooth** — Ganti HTML5 dragstart/dragover dengan Pointer Events API + CSS transform.
  Animasi elemen mengikuti kursor dengan cubic-bezier, placeholder animated, release dengan spring transition.
- **Baru: Panel Games & AutoGen** di sidebar + modals editor lengkap.
- **Export HTML** — Screen `s-games` ditambahkan, semua 6 game berfungsi dalam 1 file HTML standalone.
- **File baru**: `games.js`, `autogen.js` (total 10 file).
- **Struktur file** (10 file, ~306KB):
  index.html (shell), style.css (semua CSS), data.js (state+presets),
  editor.js (panel editor), modules.js (9 modul), games.js (6 game),
  autogen.js (auto-gen), importer.js (import/export), preview.js (live preview), animations.js (UX).

### v1.1 (modul fleksibel)
- **Baru: Sistem Modul Pembelajaran Fleksibel** — Panel "Modul Pembelajaran" baru menggantikan skenario hardcoded. Guru bisa menyusun urutan konten bebas dari 9 tipe modul: Skenario Interaktif, Video Embed, Infografis/Kartu Konsep, Flashcard Bolak-balik, Studi Kasus, Debat & Polling, Timeline, Game Pasangkan, Materi Teks.
- **Baru: Editor Detail per Modul** — Modal editor lengkap untuk setiap tipe, dengan form nested (dialog setup, choices + consequences, kartu, pasangan, butir poin, pertanyaan, dsb.)
- **Baru: Module Type Picker** — Modal grid untuk memilih tipe modul baru, dengan deskripsi singkat tiap tipe.
- **Baru: `modules.js`** — File baru khusus modul (9 tipe × 3 fungsi: defaultData, editorHtml, renderModuleHtml untuk export).
- **Export HTML** — `buildHtml()` sekarang menyertakan screen `s-modules` yang merender semua modul secara berurutan.
- **Migrasi** — Skenario lama di `AT_STATE.skenario` bisa dipindah ke sistem modul baru 1 klik.
- **File baru**: `modules.js` (sistem modul), CSS baru di `style.css` (mod-card, icon-btn, sub-item, mod-picker-grid, dll).

### v1.0.1 (bugfix)
- **Fix: Download HTML hanya tampil halaman judul** — buildHtml() di importer.js sebelumnya hanya generate cover statis. Sekarang full HTML interaktif: Cover → CP/TP/ATP → Skenario → Materi+Fungsi → Kuis → Hasil+Confetti. Skenario & Kuis otomatis fallback ke preset default jika state kosong.

### v1.0 (sesi pertama)
- Init project dari `pertemuan1-hakikat-norma__7_.html` (media PPKn yang sudah ada)
- 7 file dibuat: index.html, style.css, data.js, editor.js, importer.js, preview.js, animations.js
- Semua preset dari media asli dipindah ke `data.js` (PRESETS library)
- Import Excel multi-sheet (6 sheet, isi semua tab sekaligus)
- Generate TP dari paste teks CP (Bloom verb extractor)
- Generate Alur dari paste teks ATP (fase classifier)
- Live preview dengan 3 device mode
- Drag-sort untuk TP, Alur, Kuis
- Onboarding tour 6 langkah
- Multi-project localStorage

---

## 💡 PROMPT UNTUK SESI BERIKUTNYA

Salin prompt ini di awal sesi baru:

```
Saya sedang mengembangkan Authoring Tool untuk media pembelajaran PPKn.
Strukturnya 7 file sinkron: index.html, style.css, data.js, editor.js,
importer.js, preview.js, animations.js.

Baca PROGRESS.md terlampir untuk konteks lengkap.

Tugas sesi ini: [TULIS TUGAS DI SINI]
- Contoh: "Tambah Skenario Detail Editor (modal form edit chapter)"
- Contoh: "Tambah panel Materi Konten (edit teks materi, definisi, nc-grid)"
- Contoh: "Perbaiki generate TP agar lebih akurat"

Jangan skip kode. Jangan ubah struktur file yang sudah ada kecuali perlu.
Gunakan pola yang sama: tambah preset di data.js, render di editor.js,
HTML di index.html, parsing di importer.js, preview di preview.js.
```
