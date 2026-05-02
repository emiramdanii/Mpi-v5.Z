// ═══════════════════════════════════════════════════════════════
// TEMPLATE REGISTRY v2 — Registry for all template types
// Supports both built-in HTML templates AND the new slot-based
// template system from /lib/templates/screens/
// ═══════════════════════════════════════════════════════════════

import type { PageTemplateType } from '@/components/canva/types';
import type { ScreenType, AssemblyPage } from '@/lib/templates/assembly';
import { parseHtmlScreens, type HtmlPageModule } from '@/lib/html-parser';

// ── Template entry (for HTML file-based templates) ───────────

export interface TemplateEntry {
  id: string;
  label: string;
  desc: string;
  icon: string;
  color: string;
  presetKeys: string[];
  url: string;
  mapel: string;
  kelas: string;
  bab: string;
  tags: string[];
}

// ── Slot-based template info ─────────────────────────────────

export interface SlotTemplateInfo {
  id: ScreenType;
  icon: string;
  name: string;
  desc: string;
  color: string;
  category: 'utama' | 'konten' | 'interaktif' | 'penutup';
  /** Which screen ID this template uses by default */
  defaultScreenId: string;
  /** Whether this template requires specific data to render */
  requiredSlots: string[];
}

// ── All slot-based templates ─────────────────────────────────

export const SLOT_TEMPLATES: SlotTemplateInfo[] = [
  { id: 'cover',            icon: '🏠', name: 'Cover',            desc: 'Halaman judul & pembuka',            color: '#f9c82e', category: 'utama',      defaultScreenId: 's-cover',    requiredSlots: ['title'] },
  { id: 'dokumen',          icon: '📋', name: 'Dokumen',          desc: 'CP, TP, ATP (gabungan tab)',         color: '#3ecfcf', category: 'utama',      defaultScreenId: 's-cp',       requiredSlots: ['cp'] },
  { id: 'tujuan',           icon: '🎯', name: 'Tujuan',           desc: 'Tujuan Pembelajaran (TP saja)',      color: '#a78bfa', category: 'utama',      defaultScreenId: 's-tujuan',   requiredSlots: ['tp'] },
  { id: 'review',           icon: '🔄', name: 'Review',           desc: 'Ringkasan / ulasan materi',          color: '#06b6d4', category: 'konten',     defaultScreenId: 's-review',   requiredSlots: ['items'] },
  { id: 'materi-tabicons',  icon: '🗂️', name: 'Materi Tab-Icons', desc: 'Materi + tab interaktif (Fungsi)',    color: '#f59e0b', category: 'konten',     defaultScreenId: 's-materi',   requiredSlots: ['blok', 'tabs'] },
  { id: 'materi-accordion', icon: '📋', name: 'Materi Accordion', desc: 'Materi + accordion (Macam-Macam)',   color: '#8b5cf6', category: 'konten',     defaultScreenId: 's-materi2',  requiredSlots: ['blok', 'items'] },
  { id: 'diskusi-timer',    icon: '💬', name: 'Diskusi+Timer',    desc: 'Diskusi kelompok + hitung mundur',   color: '#14b8a6', category: 'interaktif', defaultScreenId: 's-diskusi',  requiredSlots: ['prompt', 'durasi'] },
  { id: 'sortir-game',      icon: '📂', name: 'Sortir Game',      desc: 'Kelompokkan kartu ke kategori',      color: '#3ecfcf', category: 'interaktif', defaultScreenId: 's-sortir',   requiredSlots: ['kategori', 'items'] },
  { id: 'roda-game',        icon: '🎡', name: 'Roda Game',        desc: 'Putar roda + jawab soal',            color: '#f97316', category: 'interaktif', defaultScreenId: 's-roda',     requiredSlots: ['segments'] },
  { id: 'hubungan-konsep',  icon: '🔗', name: 'Hubungan Konsep',  desc: 'Peta konsep & hubungan',             color: '#ec4899', category: 'konten',     defaultScreenId: 's-konsep',   requiredSlots: ['nodes'] },
  { id: 'flashcard',        icon: '🃏', name: 'Flashcard',        desc: 'Kartu balik (depan-belakang)',        color: '#8b5cf6', category: 'interaktif', defaultScreenId: 's-flashcard', requiredSlots: ['cards'] },
  { id: 'kuis',             icon: '❓', name: 'Kuis',             desc: 'Soal pilihan ganda',                 color: '#f5c842', category: 'interaktif', defaultScreenId: 's-kuis',     requiredSlots: ['soal'] },
  { id: 'game',             icon: '🎮', name: 'Game',             desc: 'Game interaktif (launcher)',          color: '#3ecfcf', category: 'interaktif', defaultScreenId: 's-game',     requiredSlots: ['games'] },
  { id: 'skenario',         icon: '🎭', name: 'Skenario',         desc: 'Cerita interaktif pilihan',          color: '#f472b6', category: 'interaktif', defaultScreenId: 's-sk',       requiredSlots: ['chapters'] },
  { id: 'hasil',            icon: '🏆', name: 'Hasil',            desc: 'Skor & apresiasi',                   color: '#34d399', category: 'penutup',    defaultScreenId: 's-hasil',    requiredSlots: ['judul'] },
  { id: 'refleksi',         icon: '💭', name: 'Refleksi',         desc: 'Refleksi mandiri siswa',             color: '#a78bfa', category: 'penutup',    defaultScreenId: 's-refleksi', requiredSlots: ['prompts'] },
  { id: 'penutup',          icon: '🏁', name: 'Penutup',          desc: 'Halaman penutup & langkah selanjutnya', color: '#06b6d4', category: 'penutup', defaultScreenId: 's-penutup',  requiredSlots: ['judul'] },
];

// ── Built-in HTML templates (legacy, from /public/templates/) ──

export const BUILTIN_TEMPLATES: TemplateEntry[] = [
  {
    id: 'hakikat-norma',
    label: 'Pertemuan 1: Hakikat Norma',
    desc: 'Manusia sebagai makhluk sosial, pengertian norma, sumber norma, dan 5 fungsi norma',
    icon: '🤝',
    color: '#3ecfcf',
    presetKeys: ['hakikat-norma'],
    url: '/templates/hakikat-norma.html',
    mapel: 'PPKn',
    kelas: 'VII',
    bab: 'Bab 3 – Patuh terhadap Norma',
    tags: ['norma', 'hakikat', 'fungsi', 'zoon politikon', 'sumber norma'],
  },
  {
    id: 'macam-norma',
    label: 'Pertemuan 2: Macam-Macam Norma (v3)',
    desc: '4 jenis norma (agama, kesusilaan, kesopanan, hukum) + tabel perbandingan + game sortir + roda norma',
    icon: '🗂️',
    color: '#f9c12e',
    presetKeys: ['macam-norma'],
    url: '/templates/macam-norma.html',
    mapel: 'PPKn',
    kelas: 'VII',
    bab: 'Bab 3 – Patuh terhadap Norma',
    tags: ['norma', 'macam-macam', 'agama', 'kesusilaan', 'kesopanan', 'hukum', 'sanksi', 'game'],
  },
  {
    id: 'macam-norma-v2',
    label: 'Pertemuan 2: Macam-Macam Norma (v2)',
    desc: 'Versi alternatif — 4 jenis norma dengan perbandingan tabel dan diskusi kelompok',
    icon: '📋',
    color: '#a78bfa',
    presetKeys: ['macam-norma'],
    url: '/templates/macam-norma-v2.html',
    mapel: 'PPKn',
    kelas: 'VII',
    bab: 'Bab 3 – Patuh terhadap Norma',
    tags: ['norma', 'macam-macam', 'tabel', 'perbandingan', 'diskusi'],
  },
];

// ── Preset → Template mapping ────────────────────────────────
// Maps a preset key to the recommended sequence of screen templates

export interface PresetPageMapping {
  screenId: string;
  type: ScreenType;
  label: string;
  slotSource: string; // which part of the preset provides slot data
}

export const PRESET_TEMPLATE_MAP: Record<string, PresetPageMapping[]> = {
  'hakikat-norma': [
    { screenId: 's-cover',    type: 'cover',           label: 'Cover',              slotSource: 'meta' },
    { screenId: 's-cp',       type: 'dokumen',         label: 'Dokumen Pembelajaran', slotSource: 'cp+tp+atp+alur' },
    { screenId: 's-sk',       type: 'skenario',        label: 'Skenario Interaktif', slotSource: 'skenario' },
    { screenId: 's-materi',   type: 'materi-tabicons', label: 'Materi: Hakikat Norma', slotSource: 'materi+modules(tab-icons)' },
    { screenId: 's-diskusi',  type: 'diskusi-timer',   label: 'Diskusi Kelompok',   slotSource: 'modules' },
    { screenId: 's-kuis',     type: 'kuis',            label: 'Kuis Pengetahuan',   slotSource: 'kuis' },
    { screenId: 's-hasil',    type: 'hasil',           label: 'Hasil Belajar',      slotSource: 'meta' },
    { screenId: 's-refleksi', type: 'refleksi',        label: 'Refleksi',           slotSource: 'meta' },
  ],
  'macam-norma': [
    { screenId: 's-cover',    type: 'cover',            label: 'Cover',               slotSource: 'meta' },
    { screenId: 's-cp',       type: 'dokumen',          label: 'Dokumen Pembelajaran', slotSource: 'cp+tp+atp+alur' },
    { screenId: 's-sk',       type: 'skenario',         label: 'Skenario Interaktif',  slotSource: 'skenario' },
    { screenId: 's-materi',   type: 'materi-accordion', label: 'Materi: Macam-Macam Norma', slotSource: 'materi+modules(accordion)' },
    { screenId: 's-sortir',   type: 'sortir-game',      label: 'Game Sortir Norma',    slotSource: 'modules(sorting)' },
    { screenId: 's-roda',     type: 'roda-game',        label: 'Roda Norma',           slotSource: 'modules(roda)' },
    { screenId: 's-kuis',     type: 'kuis',             label: 'Kuis Pengetahuan',     slotSource: 'kuis' },
    { screenId: 's-hasil',    type: 'hasil',            label: 'Hasil Belajar',        slotSource: 'meta' },
    { screenId: 's-penutup',  type: 'penutup',          label: 'Penutup',              slotSource: 'meta' },
  ],
  blank: [
    { screenId: 's-cover', type: 'cover', label: 'Cover', slotSource: 'meta' },
    { screenId: 's-cp',    type: 'dokumen', label: 'Dokumen Pembelajaran', slotSource: 'cp+tp+atp+alur' },
    { screenId: 's-hasil', type: 'hasil', label: 'Hasil Belajar', slotSource: 'meta' },
  ],
};

// ── Lookup helpers ───────────────────────────────────────────

export function findSlotTemplate(id: ScreenType): SlotTemplateInfo | undefined {
  return SLOT_TEMPLATES.find(t => t.id === id);
}

export function findTemplatesForPreset(presetKey: string): TemplateEntry[] {
  return BUILTIN_TEMPLATES.filter(t => t.presetKeys.includes(presetKey));
}

export function findTemplateById(id: string): TemplateEntry | undefined {
  return BUILTIN_TEMPLATES.find(t => t.id === id);
}

export function getPresetPageMappings(presetKey: string): PresetPageMapping[] {
  return PRESET_TEMPLATE_MAP[presetKey] || PRESET_TEMPLATE_MAP.blank;
}

export function getAllTemplateIds(): string[] {
  return BUILTIN_TEMPLATES.map(t => t.id);
}

export function getSlotTemplateIds(): ScreenType[] {
  return SLOT_TEMPLATES.map(t => t.id);
}

// ── Template loading (HTML file-based) ──────────────────────

const templateCache = new Map<string, HtmlPageModule[]>();

export async function loadTemplateModules(templateId: string): Promise<HtmlPageModule[]> {
  if (templateCache.has(templateId)) {
    return templateCache.get(templateId)!;
  }

  const entry = findTemplateById(templateId);
  if (!entry) {
    console.warn(`[TemplateRegistry] Template "${templateId}" not found in registry`);
    return [];
  }

  try {
    const response = await fetch(entry.url);
    if (!response.ok) {
      console.warn(`[TemplateRegistry] Failed to fetch ${entry.url}: ${response.status}`);
      return [];
    }
    const htmlText = await response.text();
    const modules = parseHtmlScreens(htmlText);

    if (modules.length === 0) {
      console.warn(`[TemplateRegistry] No screens found in ${entry.url}`);
      return [];
    }

    templateCache.set(templateId, modules);
    console.log(`[TemplateRegistry] Loaded ${modules.length} screens from "${entry.label}"`);

    return modules;
  } catch (err) {
    console.error(`[TemplateRegistry] Error loading template "${templateId}":`, err);
    return [];
  }
}

export async function loadAllTemplateModules(): Promise<{
  templateId: string;
  entry: TemplateEntry;
  modules: HtmlPageModule[];
}[]> {
  const results = await Promise.all(
    BUILTIN_TEMPLATES.map(async (entry) => {
      const modules = await loadTemplateModules(entry.id);
      return { templateId: entry.id, entry, modules };
    })
  );
  return results.filter(r => r.modules.length > 0);
}

export async function loadTemplateForPreset(presetKey: string): Promise<HtmlPageModule[]> {
  const templates = findTemplatesForPreset(presetKey);
  if (templates.length === 0) return [];
  return loadTemplateModules(templates[0].id);
}

export function clearTemplateCache(): void {
  templateCache.clear();
}

// ── Custom Template Registry ─────────────────────────────────

let customTemplates: TemplateEntry[] = [];
const CUSTOM_TEMPLATES_KEY = 'mpi_custom_templates';

export function registerCustomTemplate(entry: Omit<TemplateEntry, 'presetKeys'>): TemplateEntry {
  const fullEntry: TemplateEntry = { ...entry, presetKeys: [] };
  customTemplates.push(fullEntry);
  saveCustomTemplates();
  return fullEntry;
}

export function getCustomTemplates(): TemplateEntry[] {
  if (customTemplates.length === 0) {
    loadCustomTemplatesFromStorage();
  }
  return customTemplates;
}

export function removeCustomTemplate(id: string): void {
  customTemplates = customTemplates.filter(t => t.id !== id);
  templateCache.delete(id);
  saveCustomTemplates();
}

export function findTemplateByIdExtended(id: string): TemplateEntry | undefined {
  return findTemplateById(id) || customTemplates.find(t => t.id === id);
}

export function importHtmlAsTemplate(
  htmlText: string,
  fileName: string,
): { entry: TemplateEntry; modules: HtmlPageModule[] } | null {
  const modules = parseHtmlScreens(htmlText);
  if (modules.length === 0) return null;

  const cleanId = fileName
    .replace(/\.html?$/i, '')
    .replace(/[^a-z0-9_-]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

  const entry = registerCustomTemplate({
    id: `custom-${cleanId}-${Date.now().toString(36)}`,
    label: fileName.replace(/\.html?$/i, ''),
    desc: `${modules.length} halaman — diimport dari file`,
    icon: modules[0]?.icon || '📄',
    color: '#06b6d4',
    url: '',
    mapel: '',
    kelas: '',
    bab: '',
    tags: ['custom', 'imported'],
  });

  templateCache.set(entry.id, modules);
  return { entry, modules };
}

// ── Persistence ──────────────────────────────────────────────

function saveCustomTemplates(): void {
  try {
    const metadata = customTemplates.map(t => ({
      id: t.id, label: t.label, desc: t.desc, icon: t.icon,
      color: t.color, mapel: t.mapel, kelas: t.kelas, bab: t.bab, tags: t.tags,
    }));
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(metadata));
  } catch { /* storage full */ }
}

function loadCustomTemplatesFromStorage(): void {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return;
    customTemplates = data.map((d: Partial<TemplateEntry>) => ({
      id: d.id || '', label: d.label || 'Custom Template', desc: d.desc || '',
      icon: d.icon || '📄', color: d.color || '#06b6d4', presetKeys: [],
      url: '', mapel: d.mapel || '', kelas: d.kelas || '', bab: d.bab || '',
      tags: d.tags || ['custom'],
    }));
  } catch { customTemplates = []; }
}
