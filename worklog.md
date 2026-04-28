# Worklog — 4 UX Improvements

**Date**: 2025-04-28
**Files modified**: `liveview.js`, `style.css`, `index.html`

---

## Feature 1: Auto-Open Split View on Wide Screens
**File**: `/home/z/my-project/authoring-tool-v3/liveview.js`
**Location**: End of `DOMContentLoaded` handler (lines 909–922)
**Changes**:
- Added auto-open logic that triggers on page load when `window.innerWidth > 900`
- Checks `AT_SPLITVIEW._autoOpened` flag to ensure it only happens once
- Uses 800ms delay before opening
- Checks both current `AT_STATE` content (via `_hasEnoughContent()`) and localStorage saved data (via `AT_STORAGE.load()`) to decide whether to open
- Updated version string to v4.1

## Feature 2: Enhanced Auto-Sync Navbar
**File**: `/home/z/my-project/authoring-tool-v3/liveview.js`
**Locations**:
- `AT_NAV.go` patch (lines 832–869): Enhanced `panelToPreview` mapping
- `_patchSwitchKontenTab` (lines 798–833): Enhanced konten tab sync

**Changes**:
- Added `autogen` → `sc` (cover) mapping
- Added `konten` panel → reads active konten tab (`konten-tab-materi` → `smat`, `konten-tab-modules` → `smods`, `konten-tab-kuis` → `skuis`) and navigates preview accordingly
- Added auto-close split view when navigating to `projects`, `import`, or `versions` panels
- Enhanced `_patchSwitchKontenTab` to also auto-open split view if not active but content exists
- Added `_navigateFrame()` call after changing page select for immediate navigation

## Feature 3: Restyling Visual Feedback
**File**: `/home/z/my-project/authoring-tool-v3/style.css`

### 3a: Live Preview Button (lines 1451–1531)
- Replaced basic `#btnSplitToggle` styles with enhanced pill-shaped button
- Added `::before` gradient overlay pseudo-element
- Yellow theme: background, border, shadow on hover/active states
- Active state: solid yellow background with dark text and prominent glow shadow
- Styled `.btn-split-icon` with rounded square container
- Styled `.btn-split-shortcut` with z-index layering

### 3b: Enhanced Form Card Hover (lines 1760–1787)
- Added hover effects for `.list-item`, `.kuis-item`, `.mod-card` — border highlight + subtle shadow
- Added hover for `.field-input`, `.field-textarea`, `.field-select` — border glow + background shift
- Added hover for `.acc-section`, `.preset-card`, `.at-card` — subtle border/shadow changes

### 3c: Modal 3D Shadow Pop-Out (lines 684–697)
- Changed `.modal-box` transform from `translateY(20px)` to `translateY(20px) scale(.96)`
- Changed transition to include `scale` with spring-like bezier curve `cubic-bezier(.34,1.56,.64,1)`
- Added deep 3D box-shadow: `0 24px 64px rgba(0,0,0,.5), 0 8px 24px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.05)`
- Updated show state to `translateY(0) scale(1)`

## Feature 4: Dashboard Tips Card
**Files**: 
- `/home/z/my-project/authoring-tool-v3/index.html` (lines 157–177)
- `/home/z/my-project/authoring-tool-v3/style.css` (lines 1865–1892)

**Changes**:
- Added "Tips Cepat" card HTML with 4 tips:
  1. Live Preview Otomatis
  2. Auto-Sync Navigasi
  3. Keyboard shortcuts (Ctrl+Shift+L, Ctrl+Z, Ctrl+Y)
  4. Seret Pemisah (drag resize handle)
- Card uses gradient background `linear-gradient(135deg, rgba(245,200,66,.04), rgba(56,217,217,.04))` with yellow border
- Styled `.tip-card`, `.tip-list`, `.tip-item`, `.tip-icon` with proper spacing and typography

---

## Deployment
All files copied to `/home/z/my-project/public/` via:
```bash
cp /home/z/my-project/authoring-tool-v3/*.html /home/z/my-project/authoring-tool-v3/*.css /home/z/my-project/authoring-tool-v3/*.js /home/z/my-project/public/
```
---
Task ID: 1
Agent: Main Agent
Task: Perbaiki Flickering, Auto-Sync, dan bug lainnya di Authoring Tool v3

Work Log:
- Membaca semua file sumber: index.html, style.css, editor.js, liveview.js, liveview_enhancements.js
- Mengidentifikasi 3 akar masalah utama:
  1. FLICKERING: srcdoc iframe di-replace setiap refresh tanpa cek perubahan HTML
  2. SYNC GANDA: liveview.js DAN liveview_enhancements.js keduanya patch AT_NAV.go dan switchKontenTab → konflik
  3. CSS ISSUE: #split-frame punya `transition: opacity .2s` menyebabkan flash

- Fix Flickering (liveview.js):
  - Tambah HTML comparison: skip refresh jika html === _lastHTML
  - Anti-flicker CSS agresif: *{animation:none!important;transition:none!important}
  - visibility:hidden saat srcdoc write, visible setelah iframe load
  - frame.onload = null sebelum addEventListener baru (prevent stacking)
  - Debounce dinaikkan: 250ms (dari 200ms) untuk kurangi frekuensi refresh
  - Auto-open split hanya pada layar >900px

- Fix Auto-Sync (liveview.js + liveview_enhancements.js):
  - Hapus semua sync logic dari liveview.js (_patchSwitchKontenTab + nav patch)
  - Sync eksklusif via AT_PAGE_SYNC di liveview_enhancements.js
  - Tambah delay 100ms pada sync untuk memastikan iframe siap
  - Perbaiki auto-open split: single flag _autoOpenDone mencegah double-toggle

- Fix CSS (style.css):
  - Hapus `transition: opacity .2s` dari #split-frame

Stage Summary:
- 3 file diubah: liveview.js, liveview_enhancements.js, style.css
- Semua file sudah di-sync ke /home/z/my-project/public/
- Flickering: diperbaiki via HTML skip + anti-flicker CSS + visibility hidden
- Auto-Sync: diperbaiki via single sync path (AT_PAGE_SYNC only)
- Auto-Open: diperbaiki via deduplication flag
---
Task ID: 1
Agent: Main Agent
Task: Split style.css dan file besar lainnya untuk maintenance lebih mudah

Work Log:
- Membaca semua source files (style.css 1898 baris, editor.js 665, liveview.js 918, dll)
- Menemukan bahwa folder css/ sudah berisi split files yang lengkap (tokens, layout, components, panels, modules, splitview)
- Verifikasi bahwa 6 css split files 100% identik dengan style.css (325 selector, 15 @keyframes, 4 @media blocks)
- Membuat css/wizard.css baru — memindahkan inline <style> dari index.html (accordion, tabs, autogen wizard)
- Update index.html: mengganti <link href=style.css> dengan 7 <link> ke css/ files terpisah
- Mengubah style.css menjadi aggregator ringan (36 baris) dengan @import untuk fallback
- Assess JS files: sudah cukup modular, modules.js (1945 baris) skip karena single cohesive object
- Sync semua file ke /home/z/my-project/public/

Stage Summary:
- CSS berhasil di-split dari 1 file 1898 baris menjadi 7 file modular
- index.html berkurang ~76 baris (inline style dihapus)
- style.css berubah dari 1898 baris menjadi 36 baris (aggregator)
- public/ sudah disync dengan perubahan terbaru
- Semua perubahan backward-compatible (style.css aggregator tersedia)

---
Task ID: 1
Agent: main
Task: Perbaiki flickering dan auto sync pada live preview authoring tool

Work Log:
- Membaca semua file sumber: liveview.js, liveview_enhancements.js, liveview-editors.js, preview.js, editor.js, index.html
- Identifikasi root cause: DOUBLE PATCHING pada AT_NAV.go dan switchKontenTab (di-patch di liveview.js DAN liveview_enhancements.js)
- Identifikasi redundant periodic integrity check (setInterval 2 detik) yang memicu refresh berulang
- Identifikasi duplicate auto-open split view logic di 2 file
- Identifikasi MutationObserver terlalu agresif (300ms tanpa throttle)

Stage Summary:
- Perbaikan di liveview.js v4.2: Hapus _patchSwitchKontenTab, hapus AT_NAV.go patch, hapus setInterval periodic check, hapus auto-open logic, throttle MutationObserver (500ms + skip jika debounce timer aktif), tingkatkan debounce dari 80ms/250ms ke 120ms/350ms
- Perbaikan di liveview_enhancements.js v6.1: Konsolidasi SEMUA patch (AT_NAV.go, switchKontenTab, auto-open) sebagai SINGLE SOURCE, hapus duplikasi
- Sync ke /home/z/my-project/public/

---
Task ID: 2
Agent: main
Task: Perbaiki halaman yang tidak sync ke live view

Work Log:
- Investigasi mapping panel→preview di AT_PAGE_SYNC._MAP
- Temukan: panel 'konten' sudah ada mapping ke 'smat', tapi ada bug lain
- Temukan BUG KRITIS: _autoOpened flag tidak direset saat split view ditutup → saat kembali ke panel konten, split tidak re-open
- Temukan: halaman Skenario (ssk) tidak ada di dropdown page select
- Temukan: goPage() hanya mengandalkan _navigateFrame() yang baca dari dropdown → gagal jika option tidak ada

Stage Summary:
- liveview.js: toggle() reset _autoOpened = false saat split ditutup
- liveview.js: goPage() sekarang juga kirim postMessage langsung dengan pageId (bukan hanya dari dropdown)
- liveview_enhancements.js: tambah 'konten': 'smat' mapping, smart detection active sub-tab
- liveview_enhancements.js: tambah ssk dan sgame_0 di _REVERSE_MAP
- index.html: tambah opsi Skenario (ssk) di dropdown page select
- Sync ke /home/z/my-project/public/
---
Task ID: 1
Agent: main
Task: Fix auto-sync for document section (Identitas sampai Alur Kegiatan)

Work Log:
- Analyzed AT_NAV.go patch chain (4 files: animations.js, modules.js, extras.js, liveview_enhancements.js)
- Identified root cause: accordion clicks in dokumen panel did NOT sync to preview
- Identified issue: refresh() early-returned when HTML unchanged, skipping navigation
- Identified issue: dropdown not pre-set before iframe onload
- Added _ACCORDION_PREVIEW_MAP mapping accordion titles to preview pages
- Enhanced toggleAccordion patch to sync preview on accordion open
- Added switchDocTab message handler in iframe navScript for sub-tab switching
- Added scrollToEnd message handler for Alur Kegiatan section
- Fixed refresh() to still navigate iframe even when HTML unchanged
- Enhanced AT_NAV.go patch to pre-set dropdown before scheduleRefresh
- Increased sync delay from 150ms to 200ms for better iframe load timing

Stage Summary:
- liveview.js v4.3: accordion sync, switchDocTab/scrollToEnd handlers, navigate on unchanged HTML
- liveview_enhancements.js v6.2: pre-set dropdown before refresh, improved timing
- Files synced to /home/z/my-project/public/

---
Task ID: 1
Agent: main
Task: Fase 1 — Stabilisasi Auto-Sync (Dokumen, Konten, Tools)

Work Log:
- Analisis mendalam terhadap semua file auto-sync (liveview.js, liveview_enhancements.js, editor.js, preview.js)
- Identifikasi ROOT CAUSE utama: race condition antara iframe rebuild dan message passing
  - switchDocTab/scrollToEnd dikirim via setTimeout(200ms) tapi bisa hilang saat iframe sedang rebuild
  - Jika HTML berubah bersamaan dengan accordion click, iframe di-rebuild dan pesan hilang
- Identifikasi masalah dedup: syncFromPanel tidak punya dedup, bisa dipanggil berkali-kali
- Identifikasi masalah konten detection: _getActiveKontenTab() tidak ada, hanya query sederhana

Perbaikan liveview.js v4.4:
- Tambah message queue system: _pendingMessages[] + _queueMessage() + _flushPendingMessages()
- Tambah _iframeReady flag: hanya kirim langsung jika iframe sudah siap
- Tambah _resetIframeState(): reset flag saat mulai rebuild, pending messages dipertahankan
- Tambah navigateToPage(pageId, options): queue goPage + switchDocTab + scrollToEnd secara atomik
- Perbaiki refresh(): flush pending messages setelah iframe.onload
- Perbaiki refresh() saat HTML unchanged: tetap flush pending messages
- Perbaiki switchDocTab handler di navScript: robust fallback, acknowledgment ke parent
- Safety timeout: force flush jika onload missed

Perbaikan liveview_enhancements.js v6.3:
- Dedup syncFromPanel: skip jika panel sama disync dalam 300ms terakhir
- Dedup syncFromTab: skip jika tab sama disync dalam 300ms terakhir
- Tambah _getActiveKontenTab(): reliable detection dengan 2 method fallback
- Tambah _tryAutoOpenSplit(): konsisten digunakan di semua navigation path
- Konsolidasi auto-open logic ke satu fungsi (sebelumnya ada 3 versi)
- autogen mapping tetap ke scp (Dokumen page) — konsisten karena autogen isi dokumen

Stage Summary:
- 2 file diubah: liveview.js v4.4, liveview_enhancements.js v6.3
- Root cause utama (race condition) diperbaiki via message queue
- Dedup sync mencegah multiple refresh berlebihan
- Semua section (Dokumen: 5 accordion, Konten: 3 tab, Tools: auto+import+versions) terverifikasi mapping-nya
- Files synced to /home/z/my-project/public/

---
Task ID: 1
Agent: Super Z (Main)
Task: Fix preview loading per-karakter saat mengetik form + complete Phase 1 stabilization

Work Log:
- Analyzed root cause: 350ms debounce too short for typing, AT_UNDO.push() expensive per keystroke, loading overlay flashes on every rebuild, _showSyncPulse() fires before HTML comparison, MutationObserver fallback broken
- Implemented typing-aware debounce: 800ms during typing, 300ms for navigation/clicks
- Added global input event listener on #content to detect typing mode
- Skip loading overlay during typing (no visual flicker)
- Skip visibility:hidden during typing (anti-flicker CSS in srcdoc handles it)
- Batch undo pushes during typing (1500ms delay, avoid deep clone per keystroke)
- Moved _showSyncPulse() after HTML comparison (only show when HTML actually changed)
- Fixed MutationObserver fallback: clear _debounceTimer at start of refresh()
- Increased MutationObserver throttle from 500ms to 800ms
- Version bumped liveview.js to v4.5
- Deployed to public/
- Updated PROGRESS_PENGEMBANGAN.md with MASALAH 12 and Phase 1 item 9

Stage Summary:
- liveview.js v4.5 deployed with typing stability improvements
- Phase 1 fully complete (9/9 items)
- Key improvement: typing now uses 800ms debounce + no loading overlay = smooth editing experience
---
Task ID: 2
Agent: Super Z (Main)
Task: Fix doc tab state lost on rebuild + preview flicker while typing

Work Log:
- Root cause 1: kT() in student HTML doesn't track which doc tab (CP/TP/ATP) is active → after iframe rebuild, always shows CP
- Root cause 2: Every keystroke triggers full iframe rebuild (srcdoc rewrite) → preview jumps/flickers
- Fix 1: Patch kT() in navScript to track _curDocTab variable and send it in _rs() state
- Fix 2: Add docTab to restoreState handler in navScript (restores doc tab on iframe load)
- Fix 3: _navigateFrame() now also sends switchDocTab from saved state when on scp page
- Fix 4: navigateToPage() saves tab to _savedPreviewState for persistence across rebuilds
- Fix 5: COMPLETE typing skip — scheduleRefresh() returns immediately during typing, shows "Mengetik..." indicator
- Fix 6: Final rebuild auto-triggered when typing timer expires (1200ms) if _hasPendingRefresh
- Fix 7: _forceNextRefresh flag — set by navigation actions to bypass typing skip
- Fix 8: AT_NAV.go patch sets _forceNextRefresh + clears typing state
- Fix 9: switchKontenTab patch sets _forceNextRefresh + clears typing state
- Fix 10: syncToEditor() clears typing state before navigating
- Fix 11: docTabSwitched message from iframe updates _savedPreviewState
- Version: liveview.js v4.6, liveview_enhancements.js v6.5

Stage Summary:
- Two critical UX issues fixed: doc tab persistence + typing stability
- During typing: iframe is NOT rebuilt at all (zero visual disruption)
- "Mengetik..." indicator shows while user types
- Preview updates ~1.5s after user stops typing (1200ms typing timer + 300ms debounce)
- Navigation actions (accordion, tab switch, panel switch) always force immediate refresh
- Doc tab (CP/TP/ATP) is now tracked, saved, and restored across all iframe rebuilds
---
Task ID: 1
Agent: Main Agent
Task: Fix typing flicker + CP/TP/ATP navigation bug — implement smooth hybrid rebuild

Work Log:
- Analyzed current liveview.js v4.6 architecture and identified two root causes
- Found MutationObserver was calling refresh() directly, bypassing scheduleRefresh() and typing skip — THIS was the root cause of typing flicker
- Found race condition in CP/TP/ATP: iframe's _rs() sent previewState without docTab immediately after goPage, overwriting parent's saved docTab
- Researched 5 alternative approaches: fix+opacity, double-buffer, event-driven targeted, diff-patch, streaming
- Implemented v5.0 Smooth Hybrid Rebuild approach with 4 fixes:
  1. MutationObserver now uses scheduleRefresh() and respects _isTyping flag
  2. State merge instead of overwrite in parent message handler (preserves docTab)
  3. Debounced _rs() in iframe navScript (250ms) to prevent premature state reports
  4. CSS opacity transition (120ms fade) replaces hard visibility:hidden flash
  5. requestAnimationFrame gating in scheduleRefresh for smooth timing
- Updated liveview_enhancements.js to v6.6 for compatibility
- Deployed both files to public/

Stage Summary:
- liveview.js v5.0 deployed with 4 major stability improvements
- liveview_enhancements.js v6.6 deployed (compatible with v5.0)
- Typing flicker: ROOT CAUSE fixed (MutationObserver bypass removed)
- CP/TP/ATP: Race condition fixed (state merge + debounced iframe reports)
- Visual: Smooth fade transition replaces hard flash
