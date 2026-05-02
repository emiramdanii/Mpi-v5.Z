'use client';

import { useState, useCallback } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import { useAuthoringStore } from '@/store/authoring-store';
import type { PageTemplateType } from './types';
import {
  EDITABLE_FIELDS_MAP,
  DEFAULT_COLORS,
  FONT_OPTIONS,
  type TemplateColors,
  type EditableFieldDef,
} from '@/lib/template-edit-bridge';
import { TEMPLATE_TYPES } from './types';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════
// TEMPLATE CUSTOMIZER — Rich template editor for RightPanel
// Type-specific editors, color pickers, font selectors, content fields
// All text in Indonesian (Bahasa Indonesia)
// ═══════════════════════════════════════════════════════════════

export default function TemplateCustomizer() {
  const {
    pages,
    currentPageIndex,
    updateTemplateData,
    setTemplateType,
  } = useCanvaStore();

  const page = pages[currentPageIndex];
  if (!page) return null;

  const templateType = page.templateType || 'custom';
  const isTemplateMode = templateType !== 'custom';
  const td = page.templateData || {};

  return (
    <div className="space-y-3">
      {/* ── Template Type Selector ──────────────────────────────── */}
      <Section title="🧩 Tipe Template">
        <select
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value as PageTemplateType)}
          className="w-full h-7 px-1.5 text-[10px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none"
        >
          {TEMPLATE_TYPES.map(t => (
            <option key={t.id} value={t.id}>{t.icon} {t.name} — {t.desc}</option>
          ))}
        </select>
      </Section>

      {/* ── Content Fields (type-specific) ──────────────────────── */}
      {isTemplateMode && (
        <Section title="📝 Konten Template">
          <ContentFields
            templateType={templateType as PageTemplateType}
            templateData={td}
            updateTemplateData={updateTemplateData}
          />
        </Section>
      )}

      {/* ── Color Theme ─────────────────────────────────────────── */}
      {isTemplateMode && (
        <Section title="🎨 Tema Warna">
          <ColorThemePicker
            templateData={td}
            updateTemplateData={updateTemplateData}
          />
        </Section>
      )}

      {/* ── Font Selection ──────────────────────────────────────── */}
      {isTemplateMode && (
        <Section title="🔤 Font">
          <FontSelector
            templateData={td}
            updateTemplateData={updateTemplateData}
          />
        </Section>
      )}

      {/* ── Sync from Authoring ─────────────────────────────────── */}
      {isTemplateMode && (
        <Section title="🔄 Sinkronisasi">
          <SyncFromAuthoring
            templateType={templateType as PageTemplateType}
            updateTemplateData={updateTemplateData}
          />
        </Section>
      )}

      {/* ── Quick Edit Hint ─────────────────────────────────────── */}
      {isTemplateMode && (
        <div className="px-1">
          <div className="text-[8px] text-zinc-500 p-2 rounded-lg bg-zinc-800/40">
            💡 Klik teks di canvas untuk mengedit langsung. Perubahan otomatis tersimpan.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section Wrapper ───────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border-b border-zinc-700/30">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full p-2 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
      >
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{title}</span>
        <span className="text-[8px] text-zinc-600">{collapsed ? '▸' : '▾'}</span>
      </button>
      {!collapsed && (
        <div className="px-2 pb-2">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Content Fields — Type-specific editors ─────────────────────

function ContentFields({
  templateType,
  templateData,
  updateTemplateData,
}: {
  templateType: PageTemplateType;
  templateData: Record<string, unknown>;
  updateTemplateData: (key: string, value: unknown) => void;
}) {
  const fields = EDITABLE_FIELDS_MAP[templateType] || [];

  if (fields.length === 0) {
    // Show contextual info for complex template types
    const infoMap: Record<string, string> = {
      dokumen: 'Data CP/TP/ATP diambil otomatis dari panel Dokumen. Gunakan tombol "Tarik dari Authoring" untuk memperbarui.',
      materi: 'Konten materi diambil dari panel Konten. Gunakan tombol "Tarik dari Authoring" untuk memperbarui.',
      kuis: 'Soal kuis diambil dari panel Konten. Gunakan tombol "Tarik dari Authoring" untuk memperbarui.',
      game: 'Data game diambil dari panel Konten. Gunakan tombol "Tarik dari Authoring" untuk memperbarui.',
      skenario: 'Data skenario diambil dari panel Konten. Gunakan tombol "Tarik dari Authoring" untuk memperbarui.',
      custom: 'Mode canvas bebas — tambahkan elemen manual.',
      'html-page': 'Konten HTML diimpor dari file. Tidak dapat diedit di sini.',
    };
    return (
      <div className="text-[9px] text-zinc-500 p-2 rounded-lg bg-zinc-800/40">
        {infoMap[templateType] || 'Template ini tidak memiliki field yang dapat diedit langsung.'}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {fields.map(field => (
        <FieldEditor
          key={field.key}
          field={field}
          value={templateData[field.key]}
          onChange={(value) => updateTemplateData(field.key, value)}
        />
      ))}
    </div>
  );
}

// ── Individual Field Editor ────────────────────────────────────

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: EditableFieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const strValue = value != null ? String(value) : '';

  switch (field.type) {
    case 'text':
      return (
        <div>
          <label className="text-[9px] text-zinc-500 block mb-0.5">{field.label}</label>
          <input
            type="text"
            value={strValue}
            placeholder={field.placeholder}
            onChange={e => onChange(e.target.value)}
            className="w-full h-6 px-1.5 text-[9px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none"
          />
        </div>
      );

    case 'textarea':
      return (
        <div>
          <label className="text-[9px] text-zinc-500 block mb-0.5">{field.label}</label>
          <textarea
            value={strValue}
            placeholder={field.placeholder}
            onChange={e => onChange(e.target.value)}
            className="w-full h-14 px-1.5 py-1 text-[9px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none resize-none"
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <label className="text-[9px] text-zinc-500 block mb-0.5">{field.label}</label>
          <select
            value={strValue}
            onChange={e => onChange(e.target.value)}
            className="w-full h-6 px-1 text-[9px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none"
          >
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    case 'toggle':
      return (
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
            className="accent-amber-500 w-3 h-3"
          />
          <span className="text-[9px] text-zinc-400">{field.label}</span>
        </label>
      );

    case 'color':
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-zinc-500 w-20">{field.label}</span>
          <input
            type="color"
            value={strValue?.startsWith('#') ? strValue : '#ffffff'}
            onChange={e => onChange(e.target.value)}
            className="flex-1 h-6 rounded border border-zinc-700 cursor-pointer bg-zinc-800"
          />
        </div>
      );

    default:
      return null;
  }
}

// ── Color Theme Picker ────────────────────────────────────────

function ColorThemePicker({
  templateData,
  updateTemplateData,
}: {
  templateData: Record<string, unknown>;
  updateTemplateData: (key: string, value: unknown) => void;
}) {
  const currentColors = (templateData._colors as TemplateColors) || { ...DEFAULT_COLORS };

  const updateColor = useCallback((key: keyof TemplateColors, value: string) => {
    const newColors = { ...currentColors, [key]: value };
    updateTemplateData('_colors', newColors);
  }, [currentColors, updateTemplateData]);

  // Color presets
  const presets: { name: string; colors: TemplateColors }[] = [
    { name: '🌟 Emas', colors: { primary: '#f9c82e', secondary: '#3ecfcf', accent: '#a78bfa' } },
    { name: '🌿 Alam', colors: { primary: '#34d399', secondary: '#06b6d4', accent: '#84cc16' } },
    { name: '🔥 Api', colors: { primary: '#f97316', secondary: '#ef4444', accent: '#fbbf24' } },
    { name: '🌊 Laut', colors: { primary: '#06b6d4', secondary: '#3b82f6', accent: '#8b5cf6' } },
    { name: '🌸 Sakura', colors: { primary: '#ec4899', secondary: '#f472b6', accent: '#a855f7' } },
    { name: '🖤 Gelap', colors: { primary: '#94a3b8', secondary: '#64748b', accent: '#475569' } },
  ];

  return (
    <div className="space-y-2">
      {/* Preset swatches */}
      <div className="grid grid-cols-3 gap-1">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => updateTemplateData('_colors', preset.colors)}
            className="flex items-center gap-1 p-1 rounded border border-zinc-700/50 hover:border-amber-500/30 bg-zinc-800/40 transition-colors"
          >
            <div className="flex gap-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: preset.colors.primary }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: preset.colors.secondary }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: preset.colors.accent }} />
            </div>
            <span className="text-[7px] text-zinc-400 truncate">{preset.name}</span>
          </button>
        ))}
      </div>

      {/* Individual color pickers */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-zinc-500 w-16">Primer</span>
          <input
            type="color"
            value={currentColors.primary}
            onChange={e => updateColor('primary', e.target.value)}
            className="flex-1 h-6 rounded border border-zinc-700 cursor-pointer bg-zinc-800"
          />
          <span className="text-[7px] text-zinc-600 w-12 text-right">{currentColors.primary}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-zinc-500 w-16">Sekunder</span>
          <input
            type="color"
            value={currentColors.secondary}
            onChange={e => updateColor('secondary', e.target.value)}
            className="flex-1 h-6 rounded border border-zinc-700 cursor-pointer bg-zinc-800"
          />
          <span className="text-[7px] text-zinc-600 w-12 text-right">{currentColors.secondary}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-zinc-500 w-16">Aksen</span>
          <input
            type="color"
            value={currentColors.accent}
            onChange={e => updateColor('accent', e.target.value)}
            className="flex-1 h-6 rounded border border-zinc-700 cursor-pointer bg-zinc-800"
          />
          <span className="text-[7px] text-zinc-600 w-12 text-right">{currentColors.accent}</span>
        </div>
      </div>
    </div>
  );
}

// ── Font Selector ──────────────────────────────────────────────

function FontSelector({
  templateData,
  updateTemplateData,
}: {
  templateData: Record<string, unknown>;
  updateTemplateData: (key: string, value: unknown) => void;
}) {
  const currentFont = (templateData._font as string) || "'Nunito', sans-serif";

  return (
    <div className="space-y-1">
      <select
        value={currentFont}
        onChange={e => updateTemplateData('_font', e.target.value)}
        className="w-full h-7 px-1.5 text-[10px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none"
      >
        {FONT_OPTIONS.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
      <div className="p-2 rounded bg-zinc-800/40 border border-zinc-700/30">
        <div
          className="text-[12px] text-zinc-300 text-center"
          style={{ fontFamily: currentFont }}
        >
          Contoh Teks Font
        </div>
        <div
          className="text-[9px] text-zinc-500 text-center mt-1"
          style={{ fontFamily: currentFont }}
        >
          0123456789 ABCDEFG abcdefg
        </div>
      </div>
    </div>
  );
}

// ── Sync from Authoring Store ──────────────────────────────────

function SyncFromAuthoring({
  templateType,
  updateTemplateData,
}: {
  templateType: PageTemplateType;
  updateTemplateData: (key: string, value: unknown) => void;
}) {
  const handleSync = useCallback(() => {
    const authStore = useAuthoringStore.getState();
    const meta = authStore.meta;

    switch (templateType) {
      case 'cover':
        updateTemplateData('title', meta.judulPertemuan || 'Judul Pertemuan');
        updateTemplateData('subtitle', meta.subjudul || 'Subjudul');
        updateTemplateData('icon', meta.ikon || '📚');
        updateTemplateData('mapel', meta.mapel || '');
        updateTemplateData('kelas', meta.kelas || '');
        updateTemplateData('namaBab', meta.namaBab || '');
        toast.success('Data cover disinkronkan dari authoring');
        break;

      case 'dokumen':
        updateTemplateData('cp', authStore.cp);
        updateTemplateData('tp', authStore.tp);
        updateTemplateData('atp', authStore.atp);
        toast.success('Data dokumen disinkronkan dari authoring');
        break;

      case 'materi':
        updateTemplateData('blok', authStore.materi.blok);
        updateTemplateData('modules', authStore.modules.filter((m: Record<string, unknown>) =>
          ['materi', 'infografis', 'accordion', 'tab-icons', 'icon-explore', 'timeline', 'hero', 'kutipan', 'langkah', 'statistik', 'comparison', 'card-showcase', 'hotspot-image', 'polling', 'embed', 'video', 'studi-kasus', 'debat', 'flashcard'].includes(m.type as string)
        ));
        toast.success('Data materi disinkronkan dari authoring');
        break;

      case 'kuis':
        updateTemplateData('kuis', authStore.kuis.filter(k => k.q.trim()));
        toast.success('Data kuis disinkronkan dari authoring');
        break;

      case 'game': {
        const GAME_TYPES = ['truefalse', 'memory', 'matching', 'roda', 'sorting', 'spinwheel', 'teambuzzer', 'wordsearch', 'flashcard'];
        updateTemplateData('games', authStore.modules.filter((m: Record<string, unknown>) =>
          GAME_TYPES.includes(m.type as string)
        ));
        toast.success('Data game disinkronkan dari authoring');
        break;
      }

      case 'hasil':
        updateTemplateData('totalKuis', authStore.kuis.filter(k => k.q.trim()).length);
        updateTemplateData('namaBab', meta.namaBab || '');
        toast.success('Data hasil disinkronkan dari authoring');
        break;

      case 'skenario':
        updateTemplateData('skenario', authStore.skenario);
        toast.success('Data skenario disinkronkan dari authoring');
        break;

      case 'hero': {
        const heroModules = authStore.modules.filter((m: Record<string, unknown>) => m.type === 'hero');
        const heroData = heroModules[0] as Record<string, unknown> | undefined;
        updateTemplateData('title', (heroData?.title as string) || meta.judulPertemuan || 'Hero Banner');
        updateTemplateData('subtitle', (heroData?.subjudul as string) || meta.subjudul || '');
        updateTemplateData('icon', (heroData?.icon as string) || meta.ikon || '🚀');
        updateTemplateData('gradient', (heroData?.gradient as string) || 'sunset');
        updateTemplateData('cta', (heroData?.cta as string) || '');
        toast.success('Data hero disinkronkan dari authoring');
        break;
      }

      default:
        toast.info('Tipe template ini tidak mendukung sinkronisasi otomatis');
    }
  }, [templateType, updateTemplateData]);

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleSync}
        className="w-full py-2 rounded-md text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
      >
        <span>📥</span>
        <span>Tarik dari Authoring</span>
      </button>
      <div className="text-[8px] text-zinc-600 text-center">
        Perbarui template dengan data terbaru dari panel authoring
      </div>
    </div>
  );
}
