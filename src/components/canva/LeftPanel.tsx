'use client';

import { useState, useRef, useMemo } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import { useAuthoringStore } from '@/store/authoring-store';
import type { LeftTab, PageTemplateType } from './types';
import { TEMPLATE_TYPES, GRADIENT_PRESETS } from './types';
import { parseHtmlScreens, type HtmlPageModule } from '@/lib/html-parser';
import { HTML_TEMPLATE_MODULES, generateModulePreviewHTML, type TemplateModuleData } from '@/lib/html-template-modules';
import { BUILTIN_TEMPLATES, loadTemplateModules, getCustomTemplates, importHtmlAsTemplate, removeCustomTemplate, type TemplateEntry } from '@/lib/template-registry';

const TABS: { id: LeftTab; label: string; icon: string }[] = [
  { id: 'templates', label: 'Template', icon: '🧩' },
  { id: 'pages', label: 'Halaman', icon: '📄' },
  { id: 'elems', label: 'Elemen', icon: '📦' },
  { id: 'ratio', label: 'Rasio', icon: '📐' },
  { id: 'layers', label: 'Layer', icon: '🔲' },
];

export default function LeftPanel() {
  const { leftTab, setLeftTab, rightPanelOpen, toggleRightPanel } = useCanvaStore();

  return (
    <div className="w-56 min-w-[220px] flex flex-col bg-zinc-900/60 border-r border-zinc-700/50 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-700/50 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setLeftTab(tab.id)}
            className={`flex-1 px-1 py-1.5 text-[9px] font-semibold transition-colors whitespace-nowrap ${
              leftTab === tab.id
                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {leftTab === 'templates' && <TemplatesContent />}
        {leftTab === 'pages' && <PagesContent />}
        {leftTab === 'elems' && <ElementsContent />}
        {leftTab === 'ratio' && <RatioContent />}
        {leftTab === 'layers' && <LayersContent />}
      </div>

      {/* Bottom: Right Panel toggle */}
      <div className="p-2 border-t border-zinc-700/30">
        <button
          onClick={toggleRightPanel}
          className={`w-full py-1.5 rounded-lg text-[9px] font-bold transition-colors flex items-center justify-center gap-1.5 ${
            rightPanelOpen
              ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
          }`}
        >
          {rightPanelOpen ? '◂ Sembunyikan Panel Kanan' : '▸ Tampilkan Panel Kanan'}
        </button>
      </div>
    </div>
  );
}

/* ── Templates Tab (Puzzle-like page assembler) ──────────────── */

function TemplatesContent() {
  const { addTemplatePage, autoRakit, importedHtmlModules, setImportedHtmlModules, addHtmlPageModule } = useCanvaStore();
  const authStore = useAuthoringStore();
  const meta = authStore.meta;
  const kuis = authStore.kuis.filter(k => k.q.trim());
  const GAME_TYPES = ['truefalse','memory','matching','roda','sorting','spinwheel','teambuzzer','wordsearch','flashcard'];
  const games = authStore.modules.filter((m: Record<string, unknown>) => GAME_TYPES.includes(m.type as string));
  const materiModules = authStore.modules.filter((m: Record<string, unknown>) =>
    ['materi', 'infografis', 'accordion', 'tab-icons', 'icon-explore', 'timeline', 'hero'].includes(m.type as string)
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleHtmlImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const modules = parseHtmlScreens(text);
      if (modules.length === 0) {
        alert('Tidak ditemukan section <div class="screen"> di file HTML ini.');
      } else {
        setImportedHtmlModules(modules);
      }
    } catch (err) {
      alert('Gagal membaca file: ' + (err instanceof Error ? err.message : String(err)));
    }
    setImporting(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Build template module data from authoring store
  const templateModuleData: TemplateModuleData = useMemo(() => ({
    meta: authStore.meta as Record<string, unknown>,
    cp: authStore.cp as Record<string, unknown>,
    tp: authStore.tp as Array<Record<string, unknown>>,
    atp: authStore.atp as Record<string, unknown>,
    alur: authStore.alur as Array<Record<string, unknown>>,
    materi: authStore.materi as { blok: Array<Record<string, unknown>> },
    modules: authStore.modules as Array<Record<string, unknown>>,
    kuis: authStore.kuis.filter(k => k.q.trim()) as Array<Record<string, unknown>>,
    skenario: authStore.skenario as Array<Record<string, unknown>>,
    sfxConfig: authStore.sfxConfig || { theme: 'default', volume: 0.6 },
  }), [authStore.meta, authStore.cp, authStore.tp, authStore.atp, authStore.alur, authStore.materi, authStore.modules, authStore.kuis, authStore.skenario]);

  const categories = [
    { key: 'utama', label: '🏠 Halaman Utama' },
    { key: 'konten', label: '📝 Konten' },
    { key: 'interaktif', label: '🎮 Interaktif' },
    { key: 'penutup', label: '🏆 Penutup' },
  ] as const;

  const moduleCategories = [
    { key: 'paket', label: '📦 Paket Lengkap' },
    { key: 'halaman', label: '📄 Per Halaman' },
  ] as const;

  return (
    <div>
      {/* ── Built-in HTML Templates (FULL VISUAL FIDELITY) ── */}
      <div className="mb-3">
        <div className="text-[9px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">📚 Template Media (Visual Penuh)</div>
        <div className="text-[8px] text-zinc-500 mb-2">Klik untuk memuat semua halaman dari template HTML — visual 100% sama dengan aslinya!</div>
        {BUILTIN_TEMPLATES.map(t => (
          <BuiltinTemplateCard key={t.id} template={t} />
        ))}
        {/* Custom user templates */}
        {getCustomTemplates().length > 0 && (
          <>
            <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider mb-1 mt-2">📁 Template Saya</div>
            {getCustomTemplates().map(t => (
              <BuiltinTemplateCard key={t.id} template={t} isCustom />
            ))}
          </>
        )}
      </div>

      {/* ── Import HTML Section ── */}
      <div className="mb-3">
        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">📥 Import HTML</div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm"
          onChange={handleHtmlImport}
          className="hidden"
          id="html-file-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-sky-500/20 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 hover:from-cyan-500/30 hover:to-sky-500/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {importing ? (
            <>⏳ Membaca...</>
          ) : (
            <><span className="text-sm">📄</span> Import File HTML</>
          )}
        </button>

        {/* Show imported modules */}
        {importedHtmlModules.length > 0 && (
          <div className="mt-2 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
            <div className="text-[8px] text-zinc-500 mb-1">
              {importedHtmlModules.length} halaman ditemukan — klik untuk menambahkan ke canvas:
            </div>
            {/* Save as Template button */}
            <button
              onClick={() => {
                // Register the imported modules as a custom template
                const { registerCustomTemplate } = require('@/lib/template-registry');
                const entry = registerCustomTemplate({
                  id: `custom-import-${Date.now().toString(36)}`,
                  label: `Import ${new Date().toLocaleDateString('id-ID')}`,
                  desc: `${importedHtmlModules.length} halaman — diimport dari file`,
                  icon: importedHtmlModules[0]?.icon || '📄',
                  color: '#06b6d4',
                  url: '',
                  mapel: '',
                  kelas: '',
                  bab: '',
                  tags: ['custom', 'imported'],
                });
                // Cache the parsed modules
                useCanvaStore.getState().setBuiltinTemplateModules(entry.id, importedHtmlModules);
              }}
              className="w-full py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all mb-1 flex items-center justify-center gap-1"
            >
              💾 Simpan sebagai Template
            </button>
            {importedHtmlModules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => addHtmlPageModule(mod)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-zinc-800/60 hover:bg-cyan-500/10 border border-zinc-700/30 hover:border-cyan-500/20 transition-all text-left group cursor-pointer active:scale-[0.98]"
              >
                <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">{mod.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-zinc-200 truncate">{mod.label}</div>
                  <div className="text-[8px] text-zinc-500 truncate">{mod.screenId}</div>
                </div>
                <span className="text-[8px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">+ Tambah</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Auto Rakit Button */}
      <button
        onClick={autoRakit}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-teal-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300 hover:from-amber-500/30 hover:to-teal-500/30 transition-all mb-3 flex items-center justify-center gap-1.5"
      >
        <span className="text-sm">⚡</span> Auto Rakit Halaman
      </button>

      {/* Data status */}
      <div className="text-[8px] text-zinc-500 mb-3 p-2 rounded-lg bg-zinc-800/40">
        <div className="font-bold text-zinc-400 mb-1">📦 Data Tersedia:</div>
        <div className="flex flex-wrap gap-1">
          {importedHtmlModules.length > 0 && <span className="px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400">📄 {importedHtmlModules.length} HTML</span>}
          {kuis.length > 0 && <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-400">❓ {kuis.length} soal</span>}
          {games.length > 0 && <span className="px-1 py-0.5 rounded bg-teal-500/10 text-teal-400">🎮 {games.length} game</span>}
          {materiModules.length > 0 && <span className="px-1 py-0.5 rounded bg-purple-500/10 text-purple-400">📝 {materiModules.length} materi</span>}
          {authStore.skenario.length > 0 && <span className="px-1 py-0.5 rounded bg-pink-500/10 text-pink-400">🎭 skenario</span>}
          {kuis.length === 0 && games.length === 0 && materiModules.length === 0 && importedHtmlModules.length === 0 && (
            <span className="text-zinc-600">Belum ada data — isi di panel lain dulu</span>
          )}
        </div>
      </div>

      {/* ── HTML Module Cards (with mini iframe preview) ── */}
      {moduleCategories.map(cat => {
        const mods = HTML_TEMPLATE_MODULES.filter(m => m.category === cat.key);
        if (mods.length === 0) return null;
        return (
          <div key={cat.key} className="mb-3">
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{cat.label}</div>
            {cat.key === 'paket' ? (
              /* Paket Lengkap card — uses Auto Rakit */
              <button
                onClick={autoRakit}
                className="w-full p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-teal-500/10 border border-amber-500/20 hover:border-amber-400/40 transition-all group cursor-pointer active:scale-[0.97]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📦</span>
                  <div className="text-left">
                    <div className="text-[11px] font-black text-amber-300">Paket Lengkap</div>
                    <div className="text-[8px] text-zinc-500">Cover + Dokumen + Materi + Kuis + Hasil</div>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px]">🏠 Cover</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[8px]">📋 Dokumen</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[8px]">📝 Materi</span>
                  <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[8px]">🎮 Game</span>
                  <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 text-[8px]">❓ Kuis</span>
                  <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[8px]">🏆 Hasil</span>
                </div>
              </button>
            ) : (
              /* Per-Halaman modules with mini iframe preview */
              <div className="space-y-1.5">
                {mods.filter(m => m.id !== 'paket-lengkap').map(mod => (
                  <HtmlModuleCard
                    key={mod.id}
                    module={mod}
                    data={templateModuleData}
                    onAdd={() => addTemplatePage(mod.templateType)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Legacy Template categories (simplified) */}
      <div className="mb-3">
        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">🧩 Template Cepat</div>
        <div className="grid grid-cols-2 gap-1">
          {TEMPLATE_TYPES.filter(t => t.id !== 'custom' && t.id !== 'html-page').map(t => (
            <button
              key={t.id}
              onClick={() => addTemplatePage(t.id)}
              className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/20 hover:border-amber-500/20 transition-all group cursor-pointer active:scale-95"
            >
              <span className="text-base group-hover:scale-110 transition-transform">{t.icon}</span>
              <span className="text-[9px] font-bold text-zinc-300">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gradient Presets */}
      <div className="mb-3">
        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">🎨 Gradient Background</div>
        <div className="grid grid-cols-5 gap-1">
          {GRADIENT_PRESETS.map(g => (
            <button
              key={g.id}
              onClick={() => {
                useCanvaStore.getState().setBgColor(g.css);
                toastGradient(g.name);
              }}
              className="w-8 h-8 rounded-lg border border-zinc-700/30 hover:border-white/30 transition-all hover:scale-110"
              style={{ background: g.css }}
              title={g.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function toastGradient(name: string) {
  const el = document.createElement('div');
  el.textContent = `🎨 Gradient "${name}" diterapkan`;
  el.className = 'fixed bottom-4 right-4 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-bold z-50 shadow-lg border border-zinc-700';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

/* ── Built-in Template Card (Full Visual Fidelity) ─────────── */

function BuiltinTemplateCard({ template, isCustom }: { template: TemplateEntry; isCustom?: boolean }) {
  const { autoRakitFromTemplate, builtinTemplateModules, addBuiltinTemplatePage } = useCanvaStore();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [screens, setScreens] = useState<HtmlPageModule[]>([]);

  // Check if already loaded
  const cached = builtinTemplateModules[template.id];
  const isLoaded = cached && cached.length > 0;

  const handleLoadAll = async () => {
    setLoading(true);
    try {
      await autoRakitFromTemplate(template.id);
      // After loading, also update local screens for the expand view
      const modules = await loadTemplateModules(template.id);
      setScreens(modules);
      setExpanded(true);
    } catch {
      // Error handled by autoRakitFromTemplate toast
    }
    setLoading(false);
  };

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    // Load screens if not cached yet
    if (!isLoaded && screens.length === 0) {
      const modules = await loadTemplateModules(template.id);
      setScreens(modules);
    } else if (isLoaded) {
      setScreens(cached);
    }
    setExpanded(true);
  };

  return (
    <div className="rounded-lg bg-gradient-to-br from-amber-500/5 to-cyan-500/5 border border-amber-500/20 hover:border-amber-400/30 transition-all overflow-hidden mb-1.5">
      {/* Main card */}
      <div className="flex items-center gap-2.5 p-2">
        <span className="text-2xl flex-shrink-0">{template.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-black text-amber-300">{template.label}</div>
          <div className="text-[8px] text-zinc-500 leading-relaxed">{template.desc}</div>
          <div className="flex gap-1 mt-1 flex-wrap">
            <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[7px]">{template.mapel} {template.kelas}</span>
            <span className="px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[7px]">{template.bab}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-1 px-2 pb-1.5">
        <button
          onClick={handleLoadAll}
          disabled={loading}
          className="flex-1 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-[9px] font-bold text-amber-300 hover:bg-amber-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
        >
          {loading ? '⏳ Memuat...' : '⚡ Muat Semua Halaman'}
        </button>
        <button
          onClick={handleExpand}
          className="px-2 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/30 text-[9px] text-zinc-400 hover:text-zinc-200 transition-all"
        >
          {expanded ? '▴' : '▾'} {screens.length > 0 || isLoaded ? `(${(isLoaded ? cached.length : screens.length)} halaman)` : ''}
        </button>
        {isCustom && (
          <button
            onClick={() => { removeCustomTemplate(template.id); }}
            className="px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[9px] text-red-400 hover:bg-red-500/20 transition-all"
            title="Hapus template"
          >
            ✕
          </button>
        )}
      </div>

      {/* Expanded screen list */}
      {expanded && screens.length > 0 && (
        <div className="px-2 pb-2 space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar">
          {screens.map((screen, idx) => (
            <button
              key={screen.id}
              onClick={() => addBuiltinTemplatePage(template.id, idx)}
              className="w-full flex items-center gap-2 p-1.5 rounded-lg bg-zinc-800/40 hover:bg-cyan-500/10 border border-zinc-700/20 hover:border-cyan-500/20 transition-all text-left group cursor-pointer"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">{screen.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-bold text-zinc-300 truncate">{screen.label}</div>
                <div className="text-[7px] text-zinc-500">{screen.screenId}</div>
              </div>
              <span className="text-[7px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">+ Tambah</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── HTML Module Card (with mini iframe preview) ─────────────── */

function HtmlModuleCard({
  module,
  data,
  onAdd,
}: {
  module: import('@/lib/html-template-modules').HtmlTemplateModule;
  data: import('@/lib/html-template-modules').TemplateModuleData;
  onAdd: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

  // Generate mini preview HTML for this module
  const previewHTML = useMemo(() => {
    try {
      return generateModulePreviewHTML(module.id, data);
    } catch {
      return '';
    }
  }, [module.id, data]);

  return (
    <div
      className="rounded-lg bg-zinc-800/60 border border-zinc-700/30 hover:border-amber-500/20 transition-all overflow-hidden group"
    >
      {/* Main card — click to add */}
      <button
        onClick={onAdd}
        className="w-full flex items-center gap-2.5 p-2 text-left cursor-pointer active:scale-[0.98] transition-transform"
      >
        <span className="text-xl group-hover:scale-110 transition-transform flex-shrink-0">{module.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold text-zinc-200">{module.label}</div>
          <div className="text-[8px] text-zinc-500">{module.desc}</div>
        </div>
        <span className="text-[8px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold flex-shrink-0">+ Tambah</span>
      </button>

      {/* Preview toggle */}
      <div className="px-2 pb-1.5 flex items-center gap-1">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-[8px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
        >
          <span style={{ transform: showPreview ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .15s', display: 'inline-block' }}>▸</span>
          {showPreview ? 'Sembunyikan Preview' : 'Lihat Preview'}
        </button>
        <div className="flex-1" />
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: module.color, opacity: 0.6 }}
        />
      </div>

      {/* Mini iframe preview */}
      {showPreview && previewHTML && (
        <div className="px-2 pb-2">
          <div className="rounded-lg overflow-hidden border border-zinc-700/40" style={{ aspectRatio: '16/9' }}>
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title={`Preview ${module.label}`}
              style={{ pointerEvents: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Pages Tab ──────────────────────────────────────────────── */

function PagesContent() {
  const { pages, currentPageIndex, goPage, addPage, duplicatePage, deletePage, ratioId, reorderPage, setTemplateType } = useCanvaStore();
  const ratio = useCanvaStore(s => s.currentRatio());
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const templateBadge: Record<string, { icon: string; color: string }> = {
    cover: { icon: '🏠', color: '#f9c82e' },
    dokumen: { icon: '📋', color: '#3ecfcf' },
    materi: { icon: '📝', color: '#a78bfa' },
    kuis: { icon: '❓', color: '#f5c842' },
    game: { icon: '🎮', color: '#3ecfcf' },
    hasil: { icon: '🏆', color: '#34d399' },
    hero: { icon: '🚀', color: '#fb923c' },
    skenario: { icon: '🎭', color: '#f472b6' },
    custom: { icon: '⬜', color: '#6366f1' },
    'html-page': { icon: '📄', color: '#06b6d4' },
  };

  return (
    <div>
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Halaman</div>
      <div className="grid grid-cols-2 gap-1.5">
        {pages.map((p, i) => {
          const isActive = i === currentPageIndex;
          const badge = templateBadge[p.templateType || 'custom'] || templateBadge.custom;
          const bgStyle = p.bgDataUrl
            ? { backgroundImage: `url('${p.bgDataUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : p.bgColor?.includes('gradient')
              ? { background: p.bgColor }
              : { background: p.bgColor || '#1a1a2e' };
          return (
            <button
              key={p.id}
              onClick={() => goPage(i)}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIdx !== null && dragIdx !== i) {
                  reorderPage(dragIdx, i);
                }
                setDragIdx(null);
              }}
              onDragEnd={() => setDragIdx(null)}
              className={`relative rounded-lg overflow-hidden transition-all ${
                isActive
                  ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-zinc-900'
                  : 'hover:ring-1 hover:ring-zinc-600'
              }`}
              style={{ ...bgStyle, aspectRatio: `${ratio.w}/${ratio.h}` }}
            >
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-1">
                {/* Template badge */}
                <div className="absolute top-0.5 right-0.5 text-[8px]">{badge.icon}</div>
                <div className="text-[8px] font-bold text-white truncate">{p.label}</div>
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => addPage()}
        className="w-full mt-2 py-1.5 rounded-lg border border-dashed border-zinc-700 text-[11px] text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
      >
        + Halaman Kosong
      </button>
      <div className="flex gap-1 mt-1.5">
        <button
          onClick={duplicatePage}
          className="flex-1 py-1 rounded text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          Duplikat
        </button>
        <button
          onClick={() => {
            if (pages.length <= 1) return;
            if (confirm(`Hapus "${pages[currentPageIndex].label}"?`)) deletePage();
          }}
          className="flex-1 py-1 rounded text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

/* ── Elements Tab ───────────────────────────────────────────── */

function ElementsContent() {
  const { addElement, pages, currentPageIndex } = useCanvaStore();
  const page = pages[currentPageIndex];

  // If template mode, suggest switching to custom
  if (page?.templateType && page.templateType !== 'custom') {
    return (
      <div>
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Elemen</div>
        <div className="text-[9px] text-zinc-600 mb-2 p-2 rounded-lg bg-zinc-800/40">
          Halaman ini menggunakan template. Elemen bebas hanya tersedia untuk halaman <b className="text-zinc-400">Kosong</b>.
        </div>
        <button
          onClick={() => useCanvaStore.getState().setTemplateType('custom')}
          className="w-full py-1.5 rounded-lg border border-amber-500/30 text-[10px] font-bold text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          Ubah ke Mode Kosong
        </button>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, typeId: string) => {
    e.dataTransfer.setData('elemType', typeId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div>
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Elemen Dasar</div>
      <div className="text-[9px] text-zinc-600 mb-2">Klik untuk tambah, atau seret ke canvas</div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { id: 'kuis', icon: '❓', name: 'Kuis', note: 'Soal pilihan ganda' },
          { id: 'game', icon: '🎮', name: 'Game', note: 'Game interaktif' },
          { id: 'materi', icon: '📝', name: 'Materi', note: 'Konten materi' },
          { id: 'modul', icon: '🧩', name: 'Modul', note: 'Modul aktivitas' },
          { id: 'teks', icon: '🔤', name: 'Teks', note: 'Teks bebas' },
          { id: 'shape', icon: '⬜', name: 'Shape', note: 'Kotak/warna' },
        ].map(t => (
          <button
            key={t.id}
            draggable
            onClick={() => addElement(t.id)}
            onDragStart={e => handleDragStart(e, t.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/30 hover:border-amber-500/20 transition-all group cursor-grab active:cursor-grabbing"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{t.icon}</span>
            <span className="text-[10px] font-bold text-zinc-300">{t.name}</span>
            <span className="text-[8px] text-zinc-500">{t.note}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Ratio Tab ──────────────────────────────────────────────── */

function RatioContent() {
  const { ratioId, setRatio } = useCanvaStore();

  return (
    <div>
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Rasio Halaman</div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { id: '16:9', name: '16:9', desc: 'Landscape PPT', w: 1280, h: 720 },
          { id: '9:16', name: '9:16', desc: 'Portrait HP', w: 720, h: 1280 },
          { id: '1:1', name: '1:1', desc: 'Square Post', w: 800, h: 800 },
          { id: 'A4', name: 'A4', desc: 'Dokumen LKS', w: 794, h: 1123 },
          { id: '4:3', name: '4:3', desc: 'Presentasi Lama', w: 1024, h: 768 },
        ].map(r => {
          const isActive = ratioId === r.id;
          const aspect = r.w / r.h;
          const tw = aspect >= 1 ? 56 : Math.round(56 * aspect);
          const th = aspect <= 1 ? 36 : Math.round(36 / aspect);
          return (
            <button
              key={r.id}
              onClick={() => setRatio(r.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <div
                className="rounded-sm border border-current/30"
                style={{ width: tw, height: th }}
              />
              <div className="text-[10px] font-bold">{r.name}</div>
              <div className="text-[8px] opacity-60">{r.desc}</div>
              <div className="text-[8px] opacity-40">{r.w}×{r.h}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Layers Tab ─────────────────────────────────────────────── */

function LayersContent() {
  const { pages, currentPageIndex, selectedElId, selectElement, toggleElementVisibility, moveElementZ } = useCanvaStore();
  const page = pages[currentPageIndex];

  if (!page) return null;

  // For template pages, show template info instead
  if (page.templateType && page.templateType !== 'custom') {
    return (
      <div>
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Info Template</div>
        <div className="p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/30">
          <div className="text-[10px] font-bold text-amber-400 mb-1">
            {page.templateType === 'cover' ? '🏠 Cover' :
             page.templateType === 'dokumen' ? '📋 Dokumen' :
             page.templateType === 'materi' ? '📝 Materi' :
             page.templateType === 'kuis' ? '❓ Kuis' :
             page.templateType === 'game' ? '🎮 Game' :
             page.templateType === 'hasil' ? '🏆 Hasil' :
             page.templateType === 'hero' ? '🚀 Hero' :
             page.templateType === 'skenario' ? '🎭 Skenario' :
             '🧩 Template'}
          </div>
          <div className="text-[8px] text-zinc-500">
            Template mengisi halaman secara otomatis dari data authoring. Edit teks langsung di canvas.
          </div>
        </div>
      </div>
    );
  }

  const elements = [...page.elements].reverse();

  return (
    <div>
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
        Layer (atas = depan)
      </div>
      <div className="space-y-0.5">
        {elements.length === 0 && (
          <div className="text-[10px] text-zinc-600 text-center py-4">Belum ada elemen</div>
        )}
        {elements.map(el => {
          const colors: Record<string, string> = {
            kuis: '#f5c842', game: '#3ecfcf', materi: '#a78bfa',
            modul: '#34d399', teks: '#fff', shape: '#6366f1',
          };
          const isActive = el.id === selectedElId;
          return (
            <div
              key={el.id}
              onClick={() => selectElement(el.id)}
              className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md cursor-pointer transition-colors ${
                isActive ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: colors[el.type] || '#888' }}
              />
              <span className="text-[10px] font-medium flex-1 truncate">
                {el.icon} {el.label || el.type}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); moveElementZ(el.id, 'up'); }}
                className="text-[9px] text-zinc-500 hover:text-zinc-200 px-0.5"
                title="Naik ke atas"
              >
                ↑
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); moveElementZ(el.id, 'down'); }}
                className="text-[9px] text-zinc-500 hover:text-zinc-200 px-0.5"
                title="Turun ke bawah"
              >
                ↓
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleElementVisibility(el.id); }}
                className={`text-[9px] ${el.hidden ? 'text-zinc-700' : 'text-zinc-500 hover:text-zinc-200'}`}
                title={el.hidden ? 'Tampilkan' : 'Sembunyikan'}
              >
                👁
              </button>
            </div>
          );
        })}
      </div>
      {selectedElId && (
        <div className="flex gap-1 mt-2 pt-2 border-t border-zinc-700/30">
          <button
            onClick={() => moveElementZ(selectedElId, 'top')}
            className="flex-1 py-1 rounded text-[9px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            ↑ Ke paling atas
          </button>
          <button
            onClick={() => moveElementZ(selectedElId, 'bottom')}
            className="flex-1 py-1 rounded text-[9px] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            ↓ Ke paling bawah
          </button>
        </div>
      )}
    </div>
  );
}
