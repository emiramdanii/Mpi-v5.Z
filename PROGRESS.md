# 📋 MPI v5.Z — Progress & Status Tracker
> Terakhir diperbarui: 2026-05-02 (sesi 6 — Phase 6 LENGKAP)

---

## ✅ Phase 1: Fondasi & Data Model — SELESAI
- [x] Setup Next.js 16 + TypeScript + Zustand 5
- [x] `authoring-store.ts` (~900 baris) — Meta, CP, TP, ATP, Alur, Kuis, Skenario, Modules, Materi, Games, Presets
- [x] `canva-store.ts` (~1020 baris) — Pages, Elements, Templates, Zoom, Selection, Layers, NavConfig, ColorPalette, Undo/Redo, Export, Auto-Rakit, Persistence
- [x] `types.ts` — CanvaPage, CanvaElement, NavConfig, ColorPalette, 9 PageTemplateType, TEMPLATE_TYPES, GRADIENT_PRESETS
- [x] Persistence: `at_state_v1` (authoring) + `canva_state_v2` (canva) di localStorage
- [x] Auto-save setiap 8 detik saat dirty + beforeunload guard

---

## ✅ Phase 2: UI Authoring Panels — SELESAI
- [x] Dashboard — kelengkapan checker, quick actions, preset picker
- [x] Dokumen — Meta, CP, TP, ATP, Alur editor
- [x] Konten — Materi blok editor (12 tipe), Module editor (27 tipe), Kuis PG editor, Skenario editor
- [x] AutoGenerate — AI-powered content generation
- [x] Projects — manajemen proyek
- [x] ImportExport — import Excel/JSON, export JSON
- [x] LivePreview — preview aplikasi siswa (full HTML export)
- [x] Riwayat — versi riwayat

---

## ✅ Phase 3: Canva Editor & Games — SELESAI
- [x] CanvaBuilder — visual page builder dengan drag/resize/drop
- [x] Toolbar — undo/redo, zoom, tool select, preview, export, clear
- [x] IconRail — 5 tab navigasi (templates, pages, elems, ratio, layers)
- [x] LeftPanel — template gallery, page list, element palette, ratio picker, layer list
- [x] Stage — canvas area dengan drag/resize/drop elements
- [x] RightPanel — background, color palette, nav config, element properties, template edit, layers
- [x] PageTemplate — 8 template types (cover, dokumen, materi, kuis, game, hasil, hero, skenario)
- [x] QuizWidget — kuis PG interaktif di canva
- [x] GameWidget — 9 game interaktif:
  - [x] TrueFalse — Benar/Salah
  - [x] Memory — Card matching
  - [x] Matching — Pasangkan
  - [x] Roda — Roda putar
  - [x] Sorting — Klasifikasi
  - [x] SpinWheel — Roda pertanyaan
  - [x] TeamBuzzer — Kuis tim
  - [x] WordSearch — Teka-teki kata
  - [x] Flashcard — Kartu bolak-balik
  - [x] GenericGameWidget — fallback untuk module types lain
- [x] StatusBar — posisi mouse, info halaman
- [x] Export HTML — exportPageHTML() + exportSlideshowHTML()
- [x] Auto Rakit — auto-generate halaman dari data authoring

---

## ✅ Bug Fix: "Menu Gak Bisa Ditekan" — SELESAI (4 root causes)
- [x] GuidedTour overlay blokir semua klik → Ditambah `onClick={dismissTour}` di backdrop
- [x] CanvaBuilder `h-screen w-screen` overflow → Diubah ke `h-full w-full`
- [x] Tidak ada sidebar toggle di mode Canva/Preview → Ditambah floating ☰ button
- [x] Export dropdown tidak auto-close → Ditambah useRef + click-outside handler
- **File yang dimodifikasi:**
  - `src/components/authoring/AuthoringTool.tsx` — onClick={dismissTour} di backdrop
  - `src/components/canva/CanvaBuilder.tsx` — h-full w-full
  - `src/components/authoring/AuthoringTool.tsx` — floating sidebar toggle button

---

## ✅ File Reorganization — SELESAI
- [x] Legacy JS (18 file) → `archive/legacy-public-js/`
- [x] Legacy CSS (9 file) → `archive/legacy-public-css/`
- [x] Legacy HTML → `archive/legacy-public-html/`
- [x] Legacy docs → `archive/legacy-public-docs/`
- [x] preview-app/ → `archive/preview-app/`
- [x] skills/ (49 folder AI) → `archive/skills/`
- [x] examples/ → `archive/examples/`
- [x] download/ → `archive/download/`
- [x] debug-canva.js → `archive/debug/`
- [x] agent-ctx/ → `archive/agent-ctx/`
- [x] mini-services/ → `archive/mini-services/`
- [x] nested authoring-tool-v3/ → `archive/nested-empty-authoring-v3/`
- [x] STRUKTUR.md — dokumentasi struktur project
- [x] Build verified ✅ berhasil setelah reorganisasi

---

## 📊 Phase 4: UX & Stabilitas — STATUS CHECK

### ✅ SUDAH SELESAI (sudah ada di kode sebelumnya):

#### 1. Undo/Redo — SUDAH ADA ✅
- **Authoring Store**: JSON string snapshot, `_undoHistory[]`, `_undoIdx`, `_pushUndo()`, max 50
  - Semua mutation actions memanggil `_pushUndo()` sebelum perubahan
  - `undo()` / `redo()` / `canUndo()` / `canRedo()` berfungsi
  - Keyboard shortcut: Ctrl+Z (undo), Ctrl+Y / Ctrl+Shift+Z (redo)
  - UI: Tombol undo/redo di header AuthoringTool.tsx
- **Canva Store**: Object snapshot (`{pages, currentPageIndex, ratioId}`), `_history[]`, `_historyIdx`, max 50
  - `_skipHistory` flag untuk mencegah recording saat undo/redo
  - Keyboard shortcut di CanvaBuilder.tsx: Ctrl+Z, Ctrl+Y
  - UI: Tombol undo/redo di Toolbar.tsx

#### 2. Error Boundary — SUDAH ADA ✅
- `PanelErrorBoundary` — React class component wrapping setiap panel di AuthoringTool.tsx
  - `getDerivedStateFromError` + `componentDidCatch`
  - UI error: emoji ⚠️, pesan error, tombol "🔄 Coba Lagi"
  - Digunakan di `renderPanel()` untuk SEMUA 9 panel
- `error.tsx` — Next.js page-level error boundary (amber-themed retry UI)
- `global-error.tsx` — Root layout error boundary (minimal inline HTML)

#### 3. Navbar Config — SUDAH ADA ✅
- `NavConfig` interface di `types.ts`: `showNavbar`, `showPrevNext`, `showScore`, `showProgress`, `navbarStyle`
- `DEFAULT_NAV_CONFIG` di `types.ts`: semua true, style='colorful'
- Setiap `CanvaPage` punya `navConfig` property
- `updateNavConfig()` action di canva-store
- **UI Editor di RightPanel.tsx**: Section "🧭 Navigasi" dengan:
  - Checkbox: Navbar, Prev/Next, Skor, Progress Bar
  - Dropdown: Style Navbar (🌈 Colorful, ☐ Minimal, 🔮 Glass)
- **Di export-html.ts**: Navbar lengkap dengan logo, progress bar, skor — sudah dirender di setiap screen

#### 4. Loading State — SUDAH ADA ✅
- `loading.tsx` — Skeleton loading page dengan animasi pulse
- CanvaBuilder lazy-load dengan `dynamic()` + custom loading UI (🎨 "Memuat Canva Editor...")
- Auto-save dirty indicator (titik kuning di header)

#### 5. Auto-Add Navbar di Generated Modules — SUDAH ADA ✅
- Di `export-html.ts`, navbar dirender di SETIAP screen:
  - Cover → tidak ada navbar (full-bleed)
  - CP/TP/ATP → navbar dengan progress 16%
  - Skenario → navbar dengan progress 33%
  - Modules → navbar dengan progress 45%
  - Materi → navbar dengan progress 55%
  - Kuis → navbar dengan progress 75%
  - Hasil → navbar dengan progress 100%
- Navbar mengandung: logo (namaBab), progress bar, skor ⭐
- `updateNavScore()` JS function mengupdate skor & progress secara real-time

---

### ✅ SELESAI DI SESI INI (sesi 3):

#### 1. Navbar di Canva Stage Preview — SUDAH ADA ✅
- `CanvaNavbarPreview` component sudah ada di Stage.tsx (lines 262-273, 446-484)
- Merender navbar saat `page.navConfig?.showNavbar === true`
- Mendukung 3 style: colorful (gradient), minimal (zinc), glass (blur)
- Menampilkan: logo, progress bar, skor ⭐, page indicator
- `exportPageHTML()` di canva-store sudah menggunakan `navConfig` untuk render navbar di export HTML

#### 2. Form Validation — SELESAI ✅
- **Dokumen.tsx**: Validasi added untuk:
  - `judulPertemuan` (required): red border + "⚠ Judul Pertemuan wajib diisi"
  - `capaianFase` (required): red border + "⚠ Capaian Pembelajaran belum diisi"
  - `tp` array kosong: "⚠ Tujuan Pembelajaran belum ditambahkan"
  - `desc` TP kosong: red border + "⚠ Deskripsi TP belum diisi"
  - `p.judul` ATP kosong: red border + "⚠ Judul pertemuan belum diisi"
  - `p.kegiatan` ATP kosong: red border + "⚠ Kegiatan pembelajaran belum diisi"
- **Konten.tsx**: Validasi added untuk:
  - Kuis `q` kosong: red border + "⚠ Pertanyaan belum diisi"
  - Kuis opsi kosong: aggregate warning "⚠ Ada opsi jawaban yang kosong"
  - Kuis `ans < 0`: "⚠ Jawaban benar belum dipilih"
  - Materi TeksEditor `isi` kosong: red border + "⚠ Isi paragraf belum diisi"
  - Materi DefinisiEditor `judul`/`isi` kosong: red border + warning
  - Materi PoinEditor butir kosong: red border + aggregate warning
  - Materi StudiEditor `situasi`/`pertanyaan` kosong: red border + warning
- Semua validasi non-intrusif (warning saja, tidak mencegah save)

#### 3. TrueFalse Game Export — SUDAH DIFIX ✅
- Bug yang tercatat sebelumnya SUDAH DIFIX dengan event delegation pattern
- Kode saat ini menggunakan `el.addEventListener('click', function(e){var btn=e.target.closest('.tf-btn')...})`
- Event listener di-bound ke container `el`, bukan ke individual buttons
- Saat `render()` mengganti `el.innerHTML`, event listener tetap aktif karena di container level
- Restart button (`el.__rs()`) juga sudah didefinisikan dan berfungsi

#### 4. Template Export — SUDAH LENGKAP ✅
- `renderTemplateExportHTML()` sudah punya implementasi untuk SEMUA 8 template types:
  - `cover` — Full cover page dengan icon, title, chips
  - `dokumen` — CP/TP/ATP sections dengan cards
  - `materi` — Materi blok rendering
  - `kuis` — Container div yang di-populate oleh inline JS
  - `game` — Container div yang di-populate oleh inline JS
  - `hasil` — Score circle, level, reflection areas
  - `skenario` — Chapter list with dialogue
  - `hero` — Hero banner with gradient options

#### 5. Export Game Tambahan — SELESAI ✅
- **Memory Game Export**: Inline JS di canva-store.ts
  - Grid kartu yang bisa di-flip (❓ → teks)
  - Match detection berdasarkan pairId + side
  - Move counter, pair counter, completion screen
  - Restart functionality
  - Responsive grid (2-4 kolom tergantung jumlah kartu)
- **Matching Game Export**: Inline JS di canva-store.ts
  - Two-column layout (kiri: original, kanan: shuffled)
  - Click kiri → select, click kanan → check match
  - Correct: green + strikethrough
  - Wrong: red flash 600ms
  - Completion screen + restart
- Event delegation pattern digunakan (sama seperti TrueFalse) untuk menghindari bug innerHTML

---

#### 6. Export Game Tambahan (5 game) — SELESAI ✅ (sesi 4)
- **Roda Putar Export**: Inline JS di canva-store.ts
  - SVG wheel dengan slice berwarna berdasarkan opsi
  - Animasi putar 2.5s cubic-bezier
  - Deteksi hasil berdasarkan rotasi + slice angle
  - Restart functionality
- **Sorting/Klasifikasi Export**: Inline JS di canva-store.ts
  - Kategori dengan border warna + drop zone
  - Item yang belum tersortir ditampilkan di atas
  - Tombol "+" per item per kategori
  - Validasi benar/salah saat klik drop
  - Wrong flash 500ms + completion screen
  - Event delegation pattern
- **SpinWheel/Roda Pertanyaan Export**: Inline JS di canva-store.ts
  - SVG wheel dengan nomor soal
  - Animasi putar 2.5s + tampilkan soal yang terpilih
  - Kategori + teks soal ditampilkan setelah berhenti
  - Restart functionality
- **TeamBuzzer/Kuis Tim Export**: Inline JS di canva-store.ts
  - Soal per soal dengan skor Tim A vs Tim B
  - Buzz button per tim → lalu pilih Benar/Salah
  - Jika salah, poin ke tim lawan
  - Poin konfigurabel per soal
  - Completion screen dengan pemenang
  - Event delegation pattern
- **WordSearch/Teka-Teki Kata Export**: Inline JS di canva-store.ts
  - Grid generation dengan placement algorithm (6 arah)
  - Ukuran grid konfigurabel (default 8x8)
  - Two-tap selection: pilih awal → pilih akhir → cek kata
  - Found words ditandai + strikethrough di word list
  - Completion screen + restart (regenerate grid)
  - Event delegation pattern
- **Flashcard Export**: Inline JS di canva-store.ts
  - Kartu depan/belakang dengan flip
  - Navigasi Sebelumnya/Selanjutnya
  - Indikator halaman (1/N)
  - Restart functionality
  - Event delegation pattern

---

### ✅ SELESAI DI SESI 5 (Phase 5: Polish & A11y):

#### 1. Enhanced Form Validation — SELESAI ✅
- **Skenario.tsx**: Validasi added untuk:
  - `title` bab kosong: red border + "⚠ Judul bab belum diisi"
  - `choicePrompt` kosong: red border + "⚠ Pertanyaan pilihan belum diisi"
  - `speaker` dialog kosong: red border + "⚠ Pembicara belum diisi"
  - `text` dialog kosong: red border + "⚠ Isi dialog belum diisi"
  - `label` pilihan kosong: red border + "⚠ Label pilihan belum diisi"
  - `norma` pilihan kosong: red border + "⚠ Teks norma belum diisi"
  - `resultTitle` pilihan kosong: red border + "⚠ Judul hasil belum diisi"
  - ChapterCard: inline badge "⚠ Belum berjudul" / "⚠ Belum ada pilihan"
- **Dashboard.tsx**: Cross-field validation summary ("📋 Kelengkapan Data"):
  - 7 pengecekan: judulPertemuan, capaianFase, TP, kuis, skenario, materi, modules
  - ✅ jika lengkap, ⚠ jika belum — amber card styling

#### 2. Export HTML Improvements — SELESAI ✅
- **Responsive/mobile CSS** (`@media max-width:640px` dan `380px`):
  - Navbar lebih compact di mobile
  - Main padding, font sizes, card padding disesuaikan
  - Cover icon/title lebih kecil
  - Quiz options, skenario scene, hasil circle responsive
  - Nav progress bar hidden di layar sangat kecil (< 380px)
- **Print-friendly CSS** (`@media print`):
  - Navbar, buttons, confetti disembunyikan saat print
  - Semua screen ditampilkan (page-break-after)
  - Background putih, shadow dihapus
  - Card dengan border abu-abu
  - Refleksi textarea border jelas
  - Quiz options terbaca jelas saat print
- Diterapkan di `export-html.ts` (student app) DAN `canva-store.ts` (canva page export)

#### 3. Accessibility (a11y) — SELESAI ✅
- **Stage.tsx**:
  - Canvas area: `role="application"` + `aria-label="Kanvas editor"`
  - Drop hint: `aria-hidden="true"`
  - StageElement: `role="button"`, `tabIndex={0}`, type-specific `aria-label`
  - Delete button: `aria-label="Hapus elemen {type}"`
  - Resize handles: `role="separator"` + `aria-label="Ubah ukuran {dir}"`
- **QuizWidget.tsx**:
  - Quiz container: `aria-label="Soal {n}"`
  - Options container: `role="radiogroup"`
  - Each option: `role="radio"` + `aria-checked` + `aria-label="Opsi {A/B/C/D}: {text}"`
- **GameWidget.tsx**:
  - Game container: `role="application"` + `aria-label="{game type}"`
  - TrueFalse: `aria-label="Pilih Benar/Salah"`
  - Flashcard nav: `aria-label="Kartu sebelumnya/selanjutnya"`
- **RightPanel.tsx**:
  - Nav config section: `aria-label="Konfigurasi navigasi"`
  - 4 checkboxes: `aria-label` untuk navbar, prev/next, skor, progress

---

### ✅ SELESAI DI SESI 6 (Phase 6: Sound, A11y, Performance):

#### 1. Sound Effects di Game Export — SELESAI ✅
- **Web Audio API SFX Engine** (tanpa file eksternal, semua programatis):
  - `getAC()` — Lazy AudioContext initializer dengan webkitAudioContext fallback
  - `playTone()` — Generates oscillator tones dengan frequency ramp & exponential gain decay
  - `SFX` object — 8 sound functions: `correct`, `wrong`, `click`, `flip`, `spin`, `buzz`, `complete`, `popup`
  - `toggleSfx()` — Toggle sound on/off, updates semua 🔊/🔇 button
  - `SFX_ON` variable — default true, bisa di-toggle per-session
- **Sound Toggle Button** 🔊/🔇 di setiap navbar (6 navbar di export-html.ts, 1 di canva-store.ts)
- **SFX Calls di Semua Interactive Elements**:
  - Kuis PG: `SFX.correct()`/`SFX.wrong()` saat jawab, `SFX.complete()` saat submit
  - Skenario: `SFX.correct()`/`SFX.wrong()` saat pilih, `SFX.complete()` saat selesai
  - Confetti: `SFX.complete()` saat launch
  - TrueFalse: correct/wrong per soal, complete saat selesai
  - Memory: correct saat match, wrong saat no-match, complete saat semua cocok
  - Matching: correct/wrong per pasangan, complete saat semua cocok
  - Roda: `SFX.spin()` saat putar, `SFX.popup()` saat hasil muncul
  - Sorting: correct/wrong per sort, complete saat semua tersortir
  - SpinWheel: spin/popup sama seperti Roda
  - TeamBuzzer: `SFX.buzz()` saat buzz, correct/wrong saat verdict, complete saat selesai
  - WordSearch: correct saat kata ditemukan, complete saat semua ditemukan
  - Flashcard: `SFX.flip()` saat kartu dibalik
- Diterapkan di `export-html.ts` DAN `canva-store.ts`
- Print CSS: `.sfx-toggle{display:none!important}`

#### 2. Advanced Accessibility — SELESAI ✅
- **Skip-to-Content Link**:
  - `<a href="#main-content" class="skip-link">Lompat ke Konten</a>` — visually hidden, visible on Tab focus
  - `id="main-content"` di `.main` div pertama (export-html.ts) dan `.slide` div (canva-store.ts)
- **High Contrast Mode**:
  - `HIGH_CONTRAST` variable + `toggleContrast()` function
  - Toggle button 🔲/🔶 di setiap navbar (setelah sfx toggle)
  - `body.high-contrast` CSS rules: black background, bright borders, brighter muted text
  - `SFX.click()` feedback saat toggle
- **Keyboard Navigation di Quiz & Skenario** (export-html.ts):
  - Quiz options (`.q-opt`): `role="button"`, `tabindex="0"`, `aria-label="Opsi X: text"`, `onkeydown` Enter/Space
  - Skenario choices (`.sk-choice`): `tabindex="0"`, `role="button"`, `aria-label`, `onkeydown` Enter/Space
- **ARIA Labels di GameWidget.tsx React Components**:
  - MemoryGame: 3-state aria-label (matched/flipped/face-down)
  - MatchingGame: `aria-label` + `aria-pressed` pada left buttons
  - RodaGame: `aria-label="Putar roda"`, `aria-live="polite"` pada result
  - SortingGame: `aria-label="Masukkan X ke Y"` pada sort buttons
  - SpinWheelGame: `aria-label="Putar roda pertanyaan"`, `aria-live="polite"` pada result
  - TeamBuzzerGame: aria-label pada buzz dan verdict buttons
  - WordSearchGame: `aria-label="Kolom X, Baris Y: letter"` pada grid cells
  - FlashcardGame: `aria-label="Bagian depan/belakang: text"` pada flip button
- Print CSS: `.contrast-toggle`, `.skip-link` hidden saat print

#### 3. Performance Optimization — SELESAI ✅
- **DOMContentLoaded Defer** (canva-store.ts):
  - Quiz & game initialization dibungkus `function initInteractive(){}`
  - `if(document.readyState==='complete'||...)initInteractive(); else document.addEventListener('DOMContentLoaded',initInteractive)`
  - Memastikan DOM fully parsed sebelum querySelectorAll
- **`loading="lazy"` pada iframes** (export-html.ts):
  - YouTube embed di `renderModVideo()` sekarang defer loading sampai near viewport
- **`will-change` CSS hints** untuk GPU acceleration (export-html.ts):
  - `.cover-icon` — `will-change:transform` (float animation)
  - `.sk-tap` — `will-change:opacity` (pulse animation)
  - `.conf` — `will-change:transform,opacity` (confetti animation)
- **Preconnect hints** untuk Google Fonts (export-html.ts):
  - `<link rel="preconnect" href="https://fonts.googleapis.com">`
  - `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
  - Early DNS/TCP/TLS handshake untuk faster font loading

---

### 🟡 POTENTIAL FUTURE WORK (opsional, tidak blocking):

#### 1. Service Worker untuk Offline Mode
- Cache export HTML untuk akses offline
- Background sync untuk auto-save

#### 2. Image Optimization di Export HTML
- Compress base64 images sebelum embed
- WebP conversion untuk ukuran lebih kecil

#### 3. Internationalization (i18n)
- Multi-bahasa support (Indonesia, English)
- RTL layout support

---

## 📁 Struktur File Utama (Saat Ini)

```
src/
├── store/
│   ├── authoring-store.ts    ← Store utama authoring (~900 baris)
│   └── canva-store.ts        ← Store canva builder (~1020 baris)
├── components/
│   ├── authoring/
│   │   ├── AuthoringTool.tsx  ← Layout utama + sidebar + tour
│   │   ├── PanelErrorBoundary.tsx  ← Error boundary per-panel
│   │   ├── Dashboard.tsx
│   │   ├── Dokumen.tsx
│   │   ├── Konten.tsx
│   │   ├── AutoGenerate.tsx
│   │   ├── Projects.tsx
│   │   ├── ImportExport.tsx
│   │   ├── Skenario.tsx
│   │   ├── ModuleEditorModal.tsx
│   │   ├── LivePreview.tsx
│   │   └── Riwayat.tsx
│   ├── canva/
│   │   ├── CanvaBuilder.tsx   ← Visual page builder
│   │   ├── Toolbar.tsx        ← Undo/redo, zoom, export
│   │   ├── IconRail.tsx       ← 5 tab navigasi
│   │   ├── LeftPanel.tsx      ← Templates, pages, elements
│   │   ├── Stage.tsx          ← Canvas area
│   │   ├── RightPanel.tsx     ← Background, nav config, props
│   │   ├── StatusBar.tsx      ← Mouse pos, page info
│   │   ├── PageTemplate.tsx   ← 8 template types
│   │   ├── QuizWidget.tsx     ← Kuis PG widget
│   │   ├── GameWidget.tsx     ← 9 game types
│   │   └── types.ts           ← CanvaPage, CanvaElement, dll
│   └── ui/                    ← shadcn/ui components
├── lib/
│   ├── export-html.ts         ← HTML generator untuk siswa export
│   ├── color-palette.ts       ← Extract warna dari gambar
│   ├── db.ts                  ← Prisma DB
│   └── utils.ts               ← Utility functions
├── hooks/
│   ├── use-mobile.ts
│   ├── use-toast.ts
│   └── use-drag-sort.ts
└── app/
    ├── page.tsx               ← Entry point (dynamic import AuthoringTool)
    ├── layout.tsx
    ├── loading.tsx             ← Skeleton loading
    ├── error.tsx               ← Page error boundary
    ├── global-error.tsx        ← Root error boundary
    └── globals.css
```

---

## 🔑 Konvensi & Catatan Penting

- **CSS Variables Norma**: `--nagama:#f9c12e`, `--nkesusilaan:#ff6b6b`, `--nkesopanan:#3ecfcf`, `--nhukum:#a78bfa`
- **Scoring**: Sortir=10pts, Roda=10pts, Diskusi=5pts, Kuis PG=10pts
- **Font**: Nunito (body) + Fredoka One (headings)
- **Aspect Ratio Default**: 16:9 landscape
- **Dark Theme**: zinc-950 background
- **Persistence Keys**: `at_state_v1` (authoring), `canva_state_v2` (canva)
- **React.lazy + Suspense** (bukan next/dynamic untuk game widgets — menghindari ChunkLoadError dengan Turbopack+Caddy)
- **Working Path**: `/home/z/my-project/authoring-tool-v3/`
