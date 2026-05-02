# MPI v5.Z — Struktur Project

> Authoring tool untuk modul PPKn/Pendidikan Pancasila
> Stack: Next.js 16 + React 19 + TypeScript + Zustand + Tailwind CSS 4 + shadcn/ui

---

## Struktur Folder Aktif

```
authoring-tool-v3/
├── src/                          ← SOURCE CODE UTAMA
│   ├── app/                      ← Next.js App Router
│   │   ├── page.tsx              → Entry point (load AuthoringTool)
│   │   ├── layout.tsx            → Root layout (fonts, Toaster)
│   │   ├── globals.css           → Global styles + Tailwind
│   │   ├── api/route.ts          → API route
│   │   ├── loading.tsx           → Loading fallback
│   │   ├── error.tsx             → Error boundary
│   │   └── global-error.tsx      → Global error boundary
│   │
│   ├── components/
│   │   ├── authoring/            ← Panel-panel authoring tool
│   │   │   ├── AuthoringTool.tsx  → Komponen utama (sidebar + panel switcher)
│   │   │   ├── Dashboard.tsx      → Panel dashboard
│   │   │   ├── Dokumen.tsx        → Panel pengaturan dokumen
│   │   │   ├── Konten.tsx         → Panel konten modul (drag-sort)
│   │   │   ├── Skenario.tsx       → Panel skenario pembelajaran
│   │   │   ├── ModuleEditorModal.tsx → Modal edit modul
│   │   │   ├── AutoGenerate.tsx   → Panel auto-generate modul
│   │   │   ├── Projects.tsx       → Panel manajemen proyek
│   │   │   ├── ImportExport.tsx   → Panel import/export (JSON, HTML, Excel)
│   │   │   ├── Riwayat.tsx        → Panel riwayat
│   │   │   └── LivePreview.tsx    → Panel live preview HTML
│   │   │
│   │   ├── canva/                ← Canva mode components
│   │   │   ├── CanvaBuilder.tsx   → Layout utama canva (3-panel)
│   │   │   ├── Toolbar.tsx        → Toolbar atas (zoom, mode, export)
│   │   │   ├── StatusBar.tsx      → Status bar bawah
│   │   │   ├── IconRail.tsx       → Rail ikon kiri (tab selector)
│   │   │   ├── LeftPanel.tsx      → Panel kiri (module list)
│   │   │   ├── Stage.tsx          → Area tengah (preview canvas)
│   │   │   ├── RightPanel.tsx     → Panel kanan (properti)
│   │   │   ├── QuizWidget.tsx     → Widget kuis di canva
│   │   │   ├── GameWidget.tsx     → Widget game di canva
│   │   │   ├── PageTemplate.tsx   → Template halaman canva
│   │   │   └── types.ts           → Tipe canva (LeftTab, dll)
│   │   │
│   │   └── ui/                   ← shadcn/ui components (32 file)
│   │       ├── button.tsx, tabs.tsx, dialog.tsx, ... (standar)
│   │       └── ... (hanya ~5 yang dipakai bisnis: tabs, scroll-area, badge, sonner, dialog)
│   │
│   ├── store/                    ← Zustand state management
│   │   ├── authoring-store.ts    → Store utama authoring (proyek, modul, skenario)
│   │   └── canva-store.ts        → Store canva mode (zoom, selection, layers)
│   │
│   ├── lib/                      ← Utility & business logic
│   │   ├── export-html.ts        → Generator HTML export (pipeline utama)
│   │   ├── color-palette.ts      → Palet warna norma PPKn
│   │   ├── db.ts                 → Prisma DB client (untuk penggunaan future)
│   │   └── utils.ts              → cn() helper (clsx + tailwind-merge)
│   │
│   └── hooks/                    ← Custom React hooks
│       ├── use-mobile.ts         → Deteksi viewport mobile
│       ├── use-toast.ts          → Toast notification hook
│       └── use-drag-sort.ts      → Drag & sort hook (dnd-kit)
│
├── prisma/                       ← Database schema
│   └── schema.prisma             → Prisma schema (belum digunakan aktif)
│
├── db/                           ← SQLite database
│   └── custom.db                 → Database file
│
├── public/                       ← Static assets (kosong setelah cleanup)
│
├── .zscripts/                    ← Dev helper scripts
│   ├── dev.sh                    → Dev server script
│   ├── build.sh                  → Build script
│   ├── start.sh                  → Production start script
│   ├── dev.pid                   → PID file dev server
│   ├── mini-services-*.sh        → Mini services scripts
│   └── ...
│
├── archive/                      ← FILE LEGACY (tidak dipakai app)
│   ├── legacy-public-js/         → 18 file JS vanilla lama (sebelum migrasi React)
│   ├── legacy-public-css/        → 9 file CSS lama
│   ├── legacy-public-html/       → index.html vanilla lama
│   ├── legacy-public-docs/       → PROGRESS.md, PROGRESS_PENGEMBANGAN.md
│   ├── preview-app/              → Wrapper Next.js lama (iframe ke vanilla app)
│   ├── examples/                 → Contoh websocket
│   ├── download/                 → Screenshot & dev docs
│   ├── skills/                   → 49 folder AI skills (bukan bagian project)
│   ├── debug/                    → debug-canva.js (Playwright test lama)
│   ├── agent-ctx/                → AI agent context
│   ├── nested-empty-authoring-v3/ → Folder kosong (nested duplicate)
│   ├── mini-services/            → Folder kosong (.gitkeep)
│   └── worklog.md                → Log development lama
│
├── .env                          ← Environment variables
├── .gitignore                    ← Git ignore rules
├── Caddyfile                     ← Reverse proxy config (untuk production)
├── package.json                  ← Dependencies & scripts
├── package-lock.json             ← Dependency lock
├── bun.lock                      ← Bun lock
├── next.config.ts                ← Next.js config
├── tsconfig.json                 ← TypeScript config
├── tailwind.config.ts            ← Tailwind config
├── postcss.config.mjs            ← PostCSS config
├── eslint.config.mjs             ← ESLint config
├── components.json               ← shadcn/ui config
└── README.md                     ← Project readme
```

---

## Arsitektur Aplikasi

### Alur Data Utama
```
User → AuthoringTool.tsx (panel switcher)
  ├── Dashboard    → Overview proyek
  ├── Dokumen      → Setting dokumen (judul, kelas, warna)
  ├── Konten       → Tambah/edit/hapus modul (drag-sort)
  ├── Skenario     → Buat skenario pembelajaran
  ├── AutoGenerate → Generate modul otomatis via AI
  ├── Projects     → Save/load proyek
  ├── ImportExport → Import JSON/Excel, Export HTML/JSON
  ├── Riwayat      → Riwayat perubahan
  └── LivePreview  → Preview real-time HTML
       └── export-html.ts → generateNewExportHTML()
            → Download .html file (single-file, no dependencies)
```

### State Management (Zustand)
- **authoring-store**: Proyek, modul list, skenario, active panel
- **canva-store**: Zoom, selection, layers, mode (canva vs preview)

### Pipeline Export
```
Store data → export-html.ts → Single HTML file
  (embedded CSS + JS, no external dependencies)
```

---

## Warna Norma PPKn
| Norma | CSS Variable | Hex |
|-------|-------------|-----|
| Agama | --nagama | #f9c12e |
| Kesusilaan | --nkesusilaan | #ff6b6b |
| Kesopanan | --nkesopanan | #3ecfcf |
| Hukum | --nhukum | #a78bfa |

---

## Cara Menjalankan

```bash
# Development
npm run dev          # → http://localhost:3000

# Production
npm run build
npm run start

# Database (future)
npm run db:push
npm run db:generate
```

---

## Catatan Penting

- **Folder `archive/`** berisi file legacy yang SUDAH TIDAK DIPAKAI oleh Next.js app
- Semua file legacy berasal dari era vanilla HTML/JS sebelum migrasi ke React
- File di archive aman untuk dihapus jika sudah yakin tidak diperlukan lagi
- **Build verified** setelah reorganisasi: semua file aktif berfungsi dengan benar
