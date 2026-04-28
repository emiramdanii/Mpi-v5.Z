# Dokumen Progress Pengembangan - Authoring Tool v3

> **Tanggal**: 28 April 2026
> **Proyek**: Authoring Tool Media Pembelajaran PPKn
> **Lokasi**: `/home/z/my-project/authoring-tool-v3/`
> **Deploy**: `/home/z/my-project/public/`

---

## Daftar Isi

1. [Ringkasan Proyek](#1-ringkasan-proyek)
2. [Struktur File Saat Ini](#2-struktur-file-saat-ini)
3. [Riwayat Pengembangan & Upgrade](#3-riwayat-pengembangan--upgrade)
4. [Fitur yang Sudah Selesai](#4-fitur-yang-sudah-selesai)
5. [Masalah yang Ditemukan & Penyelesaian](#5-masalah-yang-ditemukan--penyelesaian)
6. [Pekerjaan yang Belum Selesai](#6-pekerjaan-yang-belum-selesai)
7. [Rencana Pengembangan](#7-rencana-pengembangan)
8. [Arsitektur Teknis](#8-arsitektur-teknis)
9. [Cara Upgrade di Sesi Berikutnya](#9-cara-upgrade-di-sesi-berikutnya)

---

## 1. Ringkasan Proyek

Authoring Tool v3 adalah aplikasi web berbasis HTML/JS/CSS murni (tanpa framework/bundler) untuk membantu guru PPKn menyusun media pembelajaran interaktif. Aplikasi ini memiliki editor berdampingan dengan live preview real-time (split view), sistem modul pembelajaran fleksibel, 6 tipe game edukatif, import/export Excel, serta auto-generate konten dari teks materi.

Secara arsitektur, proyek ini sepenuhnya statis tanpa backend, menggunakan `localStorage` untuk persistensi data, dan iframe `srcdoc` untuk menampilkan preview siswa secara real-time. Semua state disimpan dalam satu objek global `AT_STATE` yang kemudian di-serialize ke HTML untuk ditampilkan di iframe preview.

---

## 2. Struktur File Saat Ini

### File Utama (16 file JS, 1 file HTML, 1 aggregator CSS)

```
authoring-tool-v3/
├── index.html                  (1200 baris) — Shell UI: sidebar, header, semua panel HTML
├── style.css                   (24 baris)   — Aggregator CSS (@import fallback)
├── css/                                     — CSS terpisah (modular)
│   ├── tokens.css             (54 baris)    — CSS variables, design tokens
│   ├── layout.css             (201 baris)   — Grid, flexbox, responsive
│   ├── components.css         (286 baris)   — Buttons, cards, forms, tags
│   ├── panels.css             (301 baris)   — Sidebar, header, panel styling
│   ├── modules.css            (268 baris)   — Module cards, editor forms
│   ├── splitview.css          (797 baris)   — Split view, preview pane
│   └── wizard.css             (77 baris)    — Accordion, tabs, autogen wizard
├── data.js                     (278 baris)   — PRESETS, AT_STATE, AT_STORAGE, AT_UTIL
├── editor.js                   (665 baris)   — Panel render, form binding, AT_NAV
├── liveview-editors.js         (406 baris)   — AT_UNDO, AT_SK_EDITOR, AT_FUNGSI_EDITOR, AT_JSON_IO
├── liveview.js                 (550 baris)   — AT_SPLITVIEW v4.3, MutationObserver, accordion sync
├── liveview_enhancements.js    (443 baris)   — AT_PAGE_SYNC v6.2, AT_LAYOUT, nav/tab patches
├── modules.js                 (1517 baris)   — 9 tipe modul pembelajaran
├── modules-render.js           (440 baris)   — Renderer modul untuk preview/export
├── module-types.js             (312 baris)   — Tipe-tipe modul & game definitions
├── games.js                    (710 baris)   — 6 tipe game edukatif
├── autogen.js                  (565 baris)   — Auto-generate konten dari teks materi
├── preview.js                  (874 baris)   — Build student HTML dari AT_STATE
├── animations.js               (763 baris)   — Animasi, drag-sort, tour, shortcuts
├── extras.js                   (598 baris)   — Materi editor, versions, Excel preview, CP suggest
├── exporter.js                 (696 baris)   — Export HTML & cetak dokumen admin
├── importer.js                 (408 baris)   — Import Excel multi-sheet, JSON import
└── PROGRESS.md                               — Dokumen handoff (versi lama)
```

**Total**: ~10.449 baris kode sumber (tanpa CSS terpisah), ~1.984 baris CSS terpisah.

### Urutan Load (wajib)

```
data.js → editor.js → liveview-editors.js → modules.js → games.js →
module-types.js → modules-render.js → autogen.js → importer.js →
preview.js → animations.js → extras.js → liveview.js → liveview_enhancements.js
```

> `liveview_enhancements.js` HARUS load terakhir karena berisi patch terhadap fungsi dari file sebelumnya.

---

## 3. Riwayat Pengembangan & Upgrade

### v1.0 — Fondasi Awal
- Inisialisasi proyek dari media PPKn yang sudah ada (`pertemuan1-hakikat-norma__7_.html`)
- 7 file pertama: index.html, style.css, data.js, editor.js, importer.js, preview.js, animations.js
- Semua preset dipindahkan ke `data.js` (PRESETS library)
- Import Excel multi-sheet (6 sheet untuk META, CP, TP, ATP, ALUR, KUIS)
- Generate TP dari paste teks CP (Bloom verb extractor via regex)
- Generate Alur dari paste teks ATP (fase classifier otomatis)
- Live preview dengan 3 device mode (Mobile 390px, Tablet 768px, Desktop 100%)
- Drag-sort untuk TP, Alur, Kuis menggunakan HTML5 Drag API
- Onboarding tour 6 langkah, keyboard shortcuts (Ctrl+S, Ctrl+P, Ctrl+/)
- Multi-project localStorage

### v1.1 — Sistem Modul Pembelajaran Fleksibel
- **File baru**: `modules.js` (9 tipe modul)
- Skenario hardcoded diganti dengan sistem modul fleksibel
- 9 tipe modul: Skenario Interaktif, Video Embed, Infografis, Flashcard, Studi Kasus, Debat & Polling, Timeline, Game Pasangkan, Materi Teks
- Editor detail per modul dengan modal form
- Module Type Picker (grid visual untuk pilih tipe modul baru)
- Migrasi skenario lama ke sistem modul baru (1 klik)

### v1.2 — Games & Auto-Generate
- **File baru**: `games.js`, `autogen.js`
- 6 tipe game interaktif: Benar/Salah, Sortir/Klasifikasi, Roda Putar (SVG), Memory Match, Kuis Tim/Buzzer, Word Search
- Auto-generate konten dari teks materi (non-AI): TP per level Bloom C1-C6, CP, ATP, Alur, Kuis PG, Flashcard, Skenario template
- Panel "Auto-Generate" dengan preview sebelum apply
- Export HTML: screen `s-games` untuk semua game
- Drag smooth: diganti ke Pointer Events API (animasi cubic-bezier)

### v1.3 — Live Editor, Skenario Detail, Undo/Redo
- **File baru**: `liveview.js` (5 sistem baru)
- **AT_SPLITVIEW**: tombol "Live" di header membuka split-view editor kiri + preview kanan
- **AT_SK_EDITOR**: Skenario Detail Editor (dialog setup, choices, consequences)
- **AT_FUNGSI_EDITOR**: Edit tab Fungsi Norma (icon, label, warna, deskripsi, contoh, pertanyaan diskusi)
- **AT_UNDO**: Undo/Redo history stack (30 langkah), tombol di sidebar
- **AT_JSON_IO**: Import/export state JSON
- Preview.js ditulis ulang total dengan `array.join()` (zero nested template literals)

### v1.4 — Materi Editor, Excel Preview, Versions
- **File baru**: `extras.js`
- **AT_MATERI_EDITOR**: 6 tipe blok konten: Paragraf Teks, Kotak Definisi, Poin-Poin, Tabel, Kutipan, Gambar URL
- **AT_VERSIONS**: Version history bernama (max 20 snapshot)
- **AT_EXCEL_PREVIEW**: Preview tabel data Excel sebelum import (modal per sheet)
- **AT_CP_SUGGEST**: Autocomplete Profil Pelajar Pancasila saat mengetik
- **AT_ATP_DRAG**: Drag reorder pertemuan di panel ATP
- **AT_DEBOUNCE**: Debounce 400ms untuk mencegah re-render tiap keystroke

### v1.5 — Autogen Rewrite, Drag Fix, Sidebar Scroll
- `autogen.js` ditulis ulang total (v1.5, 682 baris)
- Parse lebih cerdas: definisi, enumerasi, fungsi, sebab-akibat
- 6 pola soal kuis otomatis
- Generate game Matching dan TrueFalse dari definisi
- Skenario 2-chapter kontekstual
- Fix drag reorder (stamp data-orig-idx sebelum DOM berubah)
- Fix sidebar scroll (17 nav item dengan `overflow-y: auto`)

### v1.6 — Index Rebuilt, Games-in-Modules, Dashboard Fix
- `index.html` di-rebuilt total setelah rusak (blok per blok, aman)
- Fix `nextAfterMateri is not defined`: inject `navChainJs` sebagai script ke student HTML
- Dashboard stats menampilkan Modul, Game, Materi Blok
- Game bisa ditambah ke Modul via `AT_MODULES.showPicker()`
- Sidebar dikelompokkan ulang: Proyek | Dokumen | Konten | Tools
- Panel Materi, Games, Autogen, Versions ditambahkan ke index.html
- Modals: ModulePicker, ModuleEditor, GamePicker, GameEditor, SkDetailModal, FungsiModal, ExcelPreviewModal

### v2.0 — Live Preview Split View (Major Rewrite)
- **liveview.js v4.0**: Split-view live preview berdampingan dengan editor
- `AT_SPLITVIEW` sebagai single entry point: `scheduleRefresh()` → debounced `refresh()`
- Faster initial render (60ms), steady debounce 200ms
- MutationObserver fallback: menangkap perubahan form yang tidak via markDirty
- Auto-open split view pada layar lebar (>900px)
- Smart loading state, error recovery, character counter
- AT_UNDO, AT_SK_EDITOR, AT_FUNGSI_EDITOR diekstrak ke `liveview-editors.js`

### v3.0 — Auto-Sync, UX Enhancements, CSS Split
- **liveview.js v4.1-v4.3**: Enhanced auto-sync navbar, accordion sync
- **liveview_enhancements.js v6.0-v6.2**: Smart auto-sync, layout picker
- **AT_PAGE_SYNC**: deteksi halaman pintar, editor panel otomatis sync ke preview page
- **AT_LAYOUT**: 6 layout preset (Klasik, Full Width, Card Grid, Majalah, Minimal, Dark Hero)
- Visual feedback: sync pulse indicator, modal 3D shadow pop-out, hover effects
- Dashboard "Tips Cepat" card tentang live preview

---

## 4. Fitur yang Sudah Selesai

### Panel Editor
- Dashboard: progress bar, stat chips (TP, ATP, Alur, Kuis, Modul, Game, Materi Blok), checklist kelengkapan
- Identitas Media (META): form lengkap + preset (Hakikat Norma, Macam Norma, Kosong)
- Capaian Pembelajaran (CP): elemen/sub-elemen/fase + tag input Profil Pelajar Pancasila + autocomplete
- Tujuan Pembelajaran (TP): tambah/hapus/edit, selector verb Bloom, color picker, drag-sort
- ATP (Alur Tujuan Pembelajaran): per-pertemuan, judul, TP dicapai, kegiatan, penilaian + drag-sort
- Alur Pembelajaran: langkah pendahuluan/inti/penutup + durasi + drag-sort
- Skenario Interaktif: list view + detail editor (dialog setup, choices, consequences)
- Editor Kuis: soal PG 4 opsi + radio jawaban + feedback
- Editor Materi: 6 tipe blok (Paragraf, Definisi, Poin, Tabel, Kutipan, Gambar)
- Editor Fungsi Norma: icon, label, warna, deskripsi, contoh, pertanyaan diskusi
- Editor Modul: 9 tipe modul + 6 tipe game, form editor detail per modul
- Panel Games: editor + renderer untuk 6 tipe game

### Live Preview & Sync
- Split view real-time: editor kiri, preview kanan
- Auto-sync: navigasi editor otomatis mengubah halaman preview
- Accordion sync: klik accordion identitas/capaian/TP/alur langsung navigate preview
- Page select dropdown: manual override halaman preview
- Device mode: Mobile (390px), Tablet (768px), Desktop (100%)
- Resizable split pane (drag handle)
- Anti-flicker: skip refresh jika HTML tidak berubah, visibility hidden saat srcdoc write
- State persistence: restore scroll position, materi page, module page, fungsi tab saat rebuild
- Sub-tab sync: switchDocTab handler untuk tab CP/TP/ATP dalam preview
- Scroll sync: scrollToEnd handler untuk section Alur Kegiatan
- Debounce: 120ms first render, 350ms steady state
- MutationObserver throttled (500ms) sebagai fallback

### Import / Export
- Import Excel multi-sheet (.xlsx) via SheetJS
- Download Template Excel (data dari state aktif)
- Download Panduan (.txt) dengan schema + contoh
- Generate TP dari CP (Bloom verb regex extractor)
- Generate Alur dari ATP (keyword classifier)
- Excel preview modal: lihat tabel sebelum import
- Export HTML: student-facing file lengkap
- Export JSON: raw AT_STATE untuk backup
- Import JSON: muat state dari file .json
- Cetak Dokumen Admin: CP, TP, ATP, Alur dalam format tabel

### Animasi & UX
- Ripple effect pada tombol dan card
- scoreFlash: floating "+N" particle
- Drag-sort: TP, Alur, Kuis, ATP (Pointer Events API, cubic-bezier)
- Panel slide-in transition
- countUp animasi angka di dashboard
- Onboarding tour 6 langkah
- Keyboard shortcuts: Ctrl+Z, Ctrl+Y, Ctrl+Shift+L (toggle split), Ctrl+Shift+R (force refresh)
- Skeleton loader (shimmer placeholder)
- Field validation (shake + highlight merah)
- Auto-save setiap 8 detik jika ada perubahan
- Dirty dot indicator di header
- beforeunload guard
- Modal close on overlay click
- Form card hover effects
- Modal 3D shadow pop-out animation

### Sistem Lainnya
- Multi-project localStorage
- Version history bernama (max 20 snapshot)
- Full preset: 1 klik terapkan semua tab
- Auto-generate dari teks materi (6 pola kuis, game, skenario, flashcard)
- 6 tipe game edukatif
- 9 tipe modul pembelajaran
- 6 layout preset untuk preview
- Auto-open split view pada layar lebar
- Dashboard tip card tentang split view
- Undo/Redo (30 langkah)
- CP Profil Pelajar Pancasila autocomplete

---

## 5. Masalah yang Ditemukan & Penyelesaian

### MASALAH 1: Flickering pada Live Preview

| Detail | |
|--------|-|
| **Gejala** | iframe preview berkedip putih setiap kali konten di-refresh |
| **Root Cause** | 1. `srcdoc` iframe di-replace setiap refresh tanpa cek apakah HTML berubah; 2. CSS `transition: opacity .2s` pada `#split-frame`; 3. Double-patching menyebabkan refresh berulang |
| **Lokasi** | `liveview.js` lines 132-138, `css/splitview.css` |
| **Solusi** | 1. Skip refresh jika `html === _lastHTML`; 2. Hapus CSS transition pada split-frame; 3. Aggressive anti-flicker CSS: `*{animation:none!important;transition:none!important}` disisipkan ke student HTML saat srcdoc write; 4. `visibility:hidden` saat srcdoc write, `visible` setelah `iframe.onload`; 5. `frame.onload = null` sebelum addEventListener baru (mencegah stacking) |
| **Status** | Selesai (v4.0-v4.2) |

### MASALAH 2: Double-Patching Menyebabkan Konflik

| Detail | |
|--------|-|
| **Gejala** | Live preview tidak sinkron, flickering parah, halaman preview berpindah-pindah sendiri |
| **Root Cause** | `AT_NAV.go` dan `switchKontenTab` keduanya di-patch di `liveview.js` DAN `liveview_enhancements.js` — patch dieksekusi 2x per aksi navigasi |
| **Lokasi** | `liveview.js`, `liveview_enhancements.js` |
| **Solusi** | Konsolidasi SEMUA patch navigasi ke `liveview_enhancements.js` sebagai SINGLE SOURCE. Dari `liveview.js` dihapus: `_patchSwitchKontenTab`, `AT_NAV.go` patch, `setInterval` periodic check (2 detik), auto-open split logic. `liveview.js` hanya handle: markDirty hook, undo, MutationObserver, keyboard shortcuts, accordion sync. |
| **Status** | Selesai (v4.2 + v6.1) |

### MASALAH 3: Periodic Integrity Check Menyebabkan Refresh Berulang

| Detail | |
|--------|-|
| **Gejala** | Preview refresh sendiri setiap 2 detik meskipun tidak ada perubahan |
| **Root Cause** | `setInterval` di `liveview.js` yang memeriksa integritas state secara periodik |
| **Lokasi** | `liveview.js` (dihapus di v4.2) |
| **Solusi** | Hapus `setInterval` periodic check. Cukup gunakan `markDirty()` → `scheduleRefresh()` → debounced `refresh()` untuk alur normal, dan `MutationObserver` throttled (500ms) sebagai fallback. |
| **Status** | Selesai (v4.2) |

### MASALAH 4: CSS File Terlalu Panjang (1898 baris)

| Detail | |
|--------|-|
| **Gejala** | `style.css` satu file dengan 1898 baris sulit untuk di-maintain |
| **Root Cause** | Semua CSS (tokens, layout, komponen, panel, split view, modul, wizard) digabung dalam satu file |
| **Lokasi** | `style.css`, `css/` directory |
| **Solusi** | Split menjadi 7 file modular: `tokens.css` (54), `layout.css` (201), `components.css` (286), `panels.css` (301), `modules.css` (268), `splitview.css` (797), `wizard.css` (77). `style.css` diubah menjadi aggregator ringan (24 baris) dengan `@import` untuk fallback. Inline `<style>` dari `index.html` (accordion, tabs, wizard) dipindahkan ke `wizard.css`. |
| **Status** | Selesai |

### MASALAH 5: Halaman Tidak Sync ke Live View

| Detail | |
|--------|-|
| **Gejala** | Beberapa halaman (konten, skenario) tidak navigate ke preview saat diklik |
| **Root Cause** | 1. `_autoOpened` flag tidak direset saat split view ditutup; 2. `goPage()` hanya membaca dari dropdown yang tidak memiliki semua opsi; 3. Panel `konten` tidak ada di mapping `AT_PAGE_SYNC._MAP` |
| **Lokasi** | `liveview.js` `toggle()`, `liveview.js` `goPage()`, `liveview_enhancements.js` `_MAP` |
| **Solusi** | 1. `toggle()` reset `_autoOpened = false` saat split ditutup; 2. `goPage()` sekarang kirim `postMessage` langsung dengan pageId (bukan hanya dari dropdown); 3. Tambah `konten: 'smat'` mapping; 4. Tambah `ssk` dan `sgame_0` di `_REVERSE_MAP`; 5. Tambah opsi Skenario (ssk) di dropdown page select |
| **Status** | Selesai |

### MASALAH 6: Accordion Dokumen Tidak Sync ke Preview

| Detail | |
|--------|-|
| **Gejala** | Klik accordion di panel Dokumen (Identitas, Capaian, TP, Alur) tidak mengubah halaman preview |
| **Root Cause** | Tidak ada mapping antara accordion click dan preview page navigation |
| **Lokasi** | `liveview.js` `_patchAccordionToggle()` |
| **Solusi** | 1. Buat `_ACCORDION_PREVIEW_MAP` yang memetakan judul accordion ke preview page + sub-tab; 2. Patch `toggleAccordion` agar saat accordion dibuka, preview navigate ke halaman yang sesuai; 3. Tambah `switchDocTab` message handler di iframe navScript; 4. Tambah `scrollToEnd` message handler untuk Alur Kegiatan; 5. `refresh()` tetap navigate iframe meskipun HTML tidak berubah |
| **Status** | Selesai (v4.3 + v6.2) |

### MASALAH 7: MutationObserver Terlalu Agresif

| Detail | |
|--------|-|
| **Gejala** | MutationObserver memicu refresh berlebihan, bertabrakan dengan debounce markDirty |
| **Root Cause** | MutationObserver tidak memiliki throttle dan tidak cek apakah markDirty sudah mengatur debounce timer |
| **Lokasi** | `liveview.js` `_initMutationObserver()` |
| **Solusi** | 1. Throttle 500ms; 2. Skip jika `AT_STATE.dirty = false`; 3. Skip jika `AT_SPLITVIEW._debounceTimer` sudah aktif (markDirty sudah handle); 4. Hanya berfungsi sebagai fallback safety net |
| **Status** | Selesai (v4.2) |

### MASALAH 8: `module-types.js` Tidak Diload di index.html

| Detail | |
|--------|-|
| **Gejala** | Semua modul hilang — picker kosong, tambah modul gagal, render error, grid referensi kosong |
| **Root Cause** | File `module-types.js` berisi definisi 16 tipe modul (`window.MODULE_TYPES`) tetapi tidak ada `<script src="module-types.js">` di `index.html`. Akibatnya `MODULE_TYPES = undefined` dan seluruh sistem modul gagal. |
| **Lokasi** | `index.html` baris 724-728 (urutan script) |
| **Solusi** | Tambahkan `<script src="module-types.js">` di index.html sebelum `modules.js` agar MODULE_TYPES tersedia saat modules.js di-load |
| **Status** | Selesai |

### MASALAH 9: Fungsi `_htmlStatistik()` Tidak Ada

| Detail | |
|--------|-|
| **Gejala** | Tipe modul Statistik & Angka Kunci menyebabkan runtime error saat di-render (`TypeError: this._htmlStatistik is not a function`) |
| **Root Cause** | Tipe `statistik` terdaftar di `module-types.js` dan di-switch render di `modules-render.js`, tetapi fungsi renderernya tidak pernah ditulis. Comment di baris 380 mengatakan "STATISTIK / ANGKA KUNCI renderer" tapi isinya malah fungsi `_htmlPolling()`. |
| **Lokasi** | `modules-render.js` |
| **Solusi** | Buat fungsi `_htmlStatistik(m)` baru yang merender grid/row angka kunci dengan icon, angka, satuan, label, warna, dan hover animation |
| **Status** | Selesai |

### MASALAH 10: Dropdown Preview Tidak Sync ke Editor (One-Way Only)

| Detail | |
|--------|-|
| **Gejala** | Saat memilih halaman dari dropdown di live preview, halaman preview berubah tetapi form editor tidak ikut berpindah ke panel/tab yang sesuai |
| **Root Cause** | Handler `change` pada dropdown hanya memanggil `markManualOverride()` untuk mencegah auto-sync menimpa pilihan user, tetapi tidak ada mekanisme reverse sync ke editor. Selain itu, `markManualOverride()` bersifat one-shot (langsung reset setelah 1 panggilan) sehingga gagal men-suppress multi-sync call saat navigasi. |
| **Lokasi** | `liveview_enhancements.js` |
| **Solusi** | 1. Buat method `syncToEditor(pageId)` untuk reverse sync dari dropdown ke editor panel/tab; 2. Ubah `markManualOverride()` dari one-shot menjadi timeout 500ms agar suppress berlaku selama proses navigasi; 3. Update dropdown handler untuk memanggil `syncToEditor()` |
| **Status** | Selesai (v6.4) |

### MASALAH 11: Game Tidak Masuk ke Preview

| Detail | |
|--------|-|
| **Gejala** | Game screens (`sgame_0`, `sgame_1`, ...) tidak bisa diakses dari dropdown preview dan tidak ada cara klik dari editor untuk preview game tertentu |
| **Root Cause** | 1. Dropdown hanya punya opsi statis `sgame_0` — game lain tidak ada; 2. Tidak ada tombol preview per-game di editor; 3. PostMessage handler di iframe tidak menerima `goModP`/`goMatP` langsung; 4. Reverse map tidak handle `sgame_N` secara dinamis |
| **Lokasi** | `liveview.js`, `modules.js`, `games.js`, `liveview_enhancements.js`, `preview.js` |
| **Solusi** | 1. Tambah handler `goModP`/`goMatP` di postMessage iframe (`liveview.js` + `preview.js`); 2. Tambah tombol 👁️ preview di setiap modul card (`modules.js`) dan game card (`games.js`); 3. Buat method `_updateDropdown()` untuk dropdown dinamis berdasarkan jumlah game di state; 4. Tambah `previewMod(idx)` dan `previewGame(idx)` method; 5. Handle `sgame_N` secara dinamis di reverse sync |
| **Status** | Selesai (v6.4) |

---

## 6. Pekerjaan yang Belum Selesai

### Prioritas Tinggi

#### ~~6.1 Auto-Sync Dokumen Belum Sempurna~~ ✅ SELESAI
- **Status**: Selesai (v4.4 + v6.4)
- **Solusi**: Accordion sync dengan message queue (`_ACCORDION_PREVIEW_MAP`), `switchDocTab` handler di iframe, `scrollToEnd` handler untuk Alur Kegiatan. Semua accordion Dokumen (Identitas → Alur Kegiatan) sudah sync ke preview.

#### ~~6.2 Auto-Sync Konten Belum Dikerjakan~~ ✅ SELESAI
- **Status**: Selesai (v6.4)
- **Solusi**: Bidirectional sync — dropdown preview → editor panel/tab (`syncToEditor()`), konten sub-tab detection, game screen dynamic handling (`sgame_N`).

### Prioritas Sedang

#### 6.3 Game Tim Editor
- **Deskripsi**: Form edit soal TEAM_SOAL untuk kuis kelompok di student view belum tersedia.
- **Status**: Belum dimulai
- **File Terkait**: `games.js`

#### 6.4 Skenario Drag-Sort
- **Deskripsi**: Skenario belum bisa diurutkan ulang dengan drag.
- **Status**: Belum dimulai
- **File Terkait**: `animations.js` (AT_DRAG), `editor.js`

#### 6.5 Index.html Komentar/Struktur
- **Deskripsi**: `index.html` (1200 baris) butuh komentar section yang lebih jelas dan mungkin pemisahan HTML parsial.
- **Status**: Belum dimulai
- **File Terkait**: `index.html`

### Prioritas Rendah

#### 6.6 Cloud Sync
- Simpan ke Google Drive / Firebase (butuh backend/auth)

#### 6.7 Collaborative Edit
- Multi-guru edit proyek yang sama secara real-time

#### 6.8 Theme Switcher
- Light mode untuk editor

#### 6.9 AI Generate via Claude API
- Integrasi langsung ke Anthropic API untuk generate konten (bukan hanya regex)

#### 6.10 QR Code Export
- Generate QR link ke media HTML yang di-host

#### 6.11 Accessibility
- Aria-labels, focus trap di modal, keyboard navigation pada list items

---

## 7. Rencana Pengembangan

### ~~Fase 1: Stabilisasi Auto-Sync~~ ✅ SELESAI
1. ~~**Verifikasi & fix bagian Dokumen**: Pastikan semua accordion (Identitas sampai Alur Kegiatan) sync ke preview dengan benar~~ ✅
2. ~~**Verifikasi & fix bagian Konten**: Pastikan semua tab (Materi, Modul, Game, Kuis) sync ke preview dengan benar~~ ✅
3. ~~**Fix module-types.js tidak diload** — root cause modul hilang~~ ✅
4. ~~**Fix _htmlStatistik() missing** — renderer statistik tidak ada~~ ✅
5. ~~**Bidirectional sync** — dropdown preview → editor panel/tab~~ ✅
6. ~~**Click-to-preview per modul/game** — tombol 👁️ di setiap card~~ ✅
7. ~~**Dropdown dinamis** — game screens otomatis muncul sesuai jumlah game~~ ✅
8. ~~**PostMessage handler goModP/goMatP** — navigate sub-page dari editor~~ ✅

### Fase 2: Penyempurnaan UX (Selanjutnya)
1. **Smart navigation history**: Ingat halaman preview terakhir per panel editor
2. **Diff-based refresh**: Hanya update bagian HTML yang berubah (bukan full rebuild) untuk performa lebih baik
3. **Loading skeleton di preview**: Tampilkan skeleton yang lebih baik saat iframe sedang load
4. **Toast notification improvement**: Queue system untuk toast yang tidak overlap
5. **Responsive improvement**: Optimasi tampilan pada tablet dan mobile

### Fase 3: Fitur Baru
1. **Game Tim Editor**: Form edit soal untuk kuis kelompok
2. **Template Library**: Koleksi template siap pakai per topik/bab PPKn
3. **Collaboration-ready state**: Persiapan arsitektur untuk collaborative edit (conflict resolution, merge)
4. **Print-friendly export**: Cetak dengan format yang lebih baik
5. **Media asset management**: Upload/gambar untuk materi (bukan hanya URL)

### Fase 4: Ekspansi Platform
1. **Cloud sync**: Integrasi Google Drive atau Firebase
2. **AI integration**: Generate konten via Claude API (bukan hanya regex)
3. **QR Code export**: Generate QR link ke media yang di-host
4. **PWA support**: Installable app, offline capability

---

## 8. Arsitektur Teknis

### Data Flow

```
Form Input
    ↓
markDirty()
    ↓
AT_UNDO.push()          → snapshot state
AT_SPLITVIEW.scheduleRefresh()  → debounce 120ms/350ms
    ↓
refresh()
    ↓
AT_PREVIEW.buildStudentHTML(AT_STATE)   → generate HTML
    ↓
frame.srcdoc = html + antiFlicker CSS + navScript
    ↓
iframe.onload → _navigateFrame()  → postMessage({goPage: pageId})
```

### Sync Flow (Navigasi Editor)

```
AT_NAV.go(panelId)
    ↓
Patch di liveview_enhancements.js:
  1. Close split untuk non-content panels (projects, import, versions)
  2. Auto-open split jika belum aktif + layar > 900px + ada konten
  3. Pre-set dropdown value sebelum refresh
  4. scheduleRefresh()
  5. setTimeout(200ms) → AT_PAGE_SYNC.syncFromPanel(panelId)
    ↓
AT_PAGE_SYNC.syncFromPanel()
    ↓
AT_SPLITVIEW.goPage(pageId)
    ↓
Dropdown value update + postMessage ke iframe
```

### Sync Flow (Accordion Dokumen)

```
toggleAccordion(headerEl)
    ↓
Patch di liveview.js:
  1. Cek apakah accordion baru saja dibuka (bukan ditutup)
  2. Baca judul accordion dari .acc-title
  3. Lookup _ACCORDION_PREVIEW_MAP[judul]
  4. AT_SPLITVIEW.navigateToPage(mapping.page, {tab, scrollEnd})  [queued]
  5. Message queue memastikan pesan terkirim setelah iframe load
```

### Sync Flow (Reverse: Dropdown → Editor)

```
splitPageSelect.onchange
    ↓
AT_PAGE_SYNC.syncToEditor(pageId)
  1. markManualOverride() → suppress auto-sync 500ms
  2. Lookup _REVERSE_MAP[pageId] (dynamic: sgame_N → konten-tab-modules)
  3. If konten-tab-X → switchKontenTab() (navigasi ke tab konten)
  4. If panel → AT_NAV.go(panelId)
```

### Sync Flow (Click-to-Preview: Editor → Specific Module/Game)

```
Modul card 👁️ button → AT_MODULES.previewMod(idx)
  1. Auto-open split view if needed
  2. Navigate to smods screen
  3. goModP(idx) → jump to specific module sub-page

Game card 👁️ button → AT_GAMES.previewGame(idx)
  1. Auto-open split view if needed
  2. Navigate to sgame_N screen
```

### State Persistence

```
AT_STATE (global object)
    ↓ AT_STORAGE.save(AT_STATE)
localStorage key: "at_state_v1"
    ↓ AT_STORAGE.load()
Object.assign(AT_STATE, saved)
```

### Preview State Tracking

```
iframe student HTML
    ↓ postMessage({previewState: {page, matPage, modPage, ftTab, scrollTop}})
AT_SPLITVIEW._savedPreviewState
    ↓ (pada refresh)
frame.contentWindow.postMessage({restoreState: savedState})
```

### AT_STATE Structure

```
AT_STATE = {
  meta:    { judulPertemuan, subjudul, ikon, durasi, namaBab, mapel, kelas, kurikulum },
  cp:      { elemen, subElemen, capaianFase, profil[], fase, kelas },
  tp:      [{ verb, desc, pertemuan, color }],
  atp:     { namaBab, pertemuan[{ judul, tp, durasi, kegiatan, penilaian }] },
  alur:    [{ fase, durasi, judul, deskripsi }],
  skenario:[{ title, bg, setup[], choices[] }],
  kuis:    [{ q, opts[], ans, ex }],
  modules: [{ type, title, ... }],    // 9 tipe modul
  games:   [{ type, ... }],           // 6 tipe game
  materi:  { blok: [{ type, content }] }, // 6 tipe blok
  fungsi:  [{ icon, label, color, desc, contoh[], tanya }],
  layout:  { global, usePerPage, page_sc, page_scp, ... },
  guruPw:  "guru123",
  dirty:   false,
}
```

---

## 9. Cara Upgrade di Sesi Berikutnya

### Pola yang Dipakai

Setiap fitur baru mengikuti pola ini agar tetap sinkron:

```
1. data.js                    → Tambah PRESET atau field baru di AT_STATE
2. editor.js                  → Tambah panel render + form bind
3. index.html                 → Tambah nav-item + panel div + modal
4. importer.js                → Tambah parsing kolom Excel jika ada data baru
5. preview.js                 → Update buildStudentHTML() agar pakai data baru
6. liveview.js                → Tambah accordion sync jika panel Dokumen
7. liveview_enhancements.js   → Tambah mapping AT_PAGE_SYNC jika panel baru
8. animations.js              → Tambah AT_ANIM / drag init jika ada list baru
9. css/xxx.css                → Tambah CSS jika perlu komponen baru
10. Sync ke /home/z/my-project/public/
```

### Peringatan Penting

1. **Jangan patch fungsi yang sudah di-patch di `liveview_enhancements.js`**. File ini adalah single source untuk semua patch navigasi (AT_NAV.go, switchKontenTab, auto-open).
2. **`liveview_enhancements.js` HARUS load terakhir** karena berisi patch terhadap fungsi dari file sebelumnya.
3. **Selalu test setelah perubahan** dengan memastikan: (a) split view bisa toggle, (b) accordion dokumen sync ke preview, (c) konten tab sync ke preview, (d) tidak ada flickering.
4. **Selalu sync ke public/**: setiap perubahan file harus disalin ke `/home/z/my-project/public/`.
5. **Jangan skip kode**: setiap perubahan harus ditulis lengkap, bukan placeholder atau TODO.

---

* Dokumen ini dibuat otomatis berdasarkan analisis kode sumber dan worklog pengembangan.
* Terakhir diperbarui: 28 April 2026 (Fase 1 selesai — 8 item fix)
