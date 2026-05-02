// ── Types ────────────────────────────────────────────────────────
export type PanelId = 'dashboard' | 'dokumen' | 'konten' | 'canva' | 'autogen' | 'projects' | 'import' | 'preview' | 'versions';

export interface MetaState {
  judulPertemuan: string;
  subjudul: string;
  ikon: string;
  durasi: string;
  namaBab: string;
  mapel: string;
  kelas: string;
  kurikulum: string;
}

export interface CpState {
  elemen: string;
  subElemen: string;
  capaianFase: string;
  profil: string[];
  fase: string;
  kelas: string;
}

export interface TpItem {
  verb: string;
  desc: string;
  pertemuan: number;
  color: string;
}

export interface AtpPertemuan {
  judul: string;
  tp: string;
  durasi: string;
  kegiatan: string;
  penilaian: string;
}

export interface AtpState {
  namaBab: string;
  jumlahPertemuan: number;
  pertemuan: AtpPertemuan[];
}

export interface AlurItem {
  fase: string;
  durasi: string;
  judul: string;
  deskripsi: string;
}

export interface KuisItem {
  q: string;
  opts: string[];
  ans: number;
  ex: string;
}

export interface MateriBlok {
  tipe: string;
  judul?: string;
  isi?: string;
  icon?: string;
  warna?: string;
  butir?: string[];
  baris?: string[][];
  langkah?: Array<{ icon: string; judul: string; isi: string }>;
  kiri?: { icon?: string; judul?: string; isi?: string };
  kanan?: { icon?: string; judul?: string; isi?: string };
  items?: Array<{ icon?: string; angka?: string; satuan?: string; label?: string; warna?: string; judul?: string; isi?: string }>;
  style?: string;
  karakter?: string;
  situasi?: string;
  pertanyaan?: string;
  pesan?: string;
}

export interface MateriState {
  blok: MateriBlok[];
}

// ── SFX Theme Types ─────────────────────────────────────────────────
export type SfxTheme = 'default' | 'soft' | 'retro' | 'nature' | 'none';

export interface SfxConfig {
  theme: SfxTheme;
  volume: number; // 0-1
}

// ── Preset Types ─────────────────────────────────────────────────
export interface MetaPreset {
  id: string;
  label: string;
  mapel: string;
  kelas: string;
  kurikulum: string;
  judulPertemuan: string;
  subjudul: string;
  ikon: string;
  durasi: string;
  namaBab: string;
}

export interface CpPreset {
  id: string;
  label: string;
  elemen: string;
  subElemen: string;
  capaianFase: string;
  profil: string[];
  fase: string;
  kelas: string;
}

export interface TpPreset {
  id: string;
  label: string;
  items: TpItem[];
}

export interface AtpPreset {
  id: string;
  label: string;
  namaBab: string;
  jumlahPertemuan: number;
  pertemuan: AtpPertemuan[];
}

export interface AlurPreset {
  id: string;
  label: string;
  steps: AlurItem[];
}

export interface KuisPreset {
  id: string;
  label: string;
  soal: KuisItem[];
}

export interface MateriPreset {
  id: string;
  label: string;
  blok: MateriBlok[];
}

export interface ModulePreset {
  id: string;
  label: string;
  modules: Record<string, unknown>[];
}

export interface SkenarioPreset {
  id: string;
  label: string;
  skenario: Record<string, unknown>[];
}

// ── Full Preset Map Type ─────────────────────────────────────────
export interface FullPresetMapping {
  meta: string;
  cp: string;
  tp: string;
  atp: string;
  alur: string;
  kuis: string;
  materi: string;
  modules: string;
  skenario: string;
}

// ── Verb options ─────────────────────────────────────────────────
export const VERB_OPTIONS = [
  'Menjelaskan', 'Mengidentifikasi', 'Menganalisis', 'Memberikan contoh',
  'Menerapkan', 'Mengevaluasi', 'Membandingkan', 'Menyimpulkan',
  'Mendeskripsikan', 'Merancang', 'Membuat', 'Mempresentasikan',
];

export const COLOR_OPTIONS = ['#f9c82e', '#3ecfcf', '#a78bfa', '#34d399', '#ff6b6b', '#fb923c'];

// ── Helper Functions ─────────────────────────────────────────────
export function colorForIndex(i: number): string {
  return COLOR_OPTIONS[i % COLOR_OPTIONS.length];
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const STORAGE_KEY = 'at_state_v1';

// ── Undo/Redo helpers ───────────────────────────────────────────
export const UNDO_MAX = 50;

export interface AuthoringState {
  // Navigation
  activePanel: PanelId;

  // Mode tracking
  activePreset: string | null;

  // Data
  meta: MetaState;
  cp: CpState;
  tp: TpItem[];
  atp: AtpState;
  alur: AlurItem[];
  skenario: Array<Record<string, unknown>>;
  kuis: KuisItem[];
  modules: Array<Record<string, unknown>>;
  games: Array<Record<string, unknown>>;
  materi: MateriState;

  // Sound Effects Config
  sfxConfig: SfxConfig;

  // System
  dirty: boolean;
  guruPw: string;

  // Undo/Redo
  _undoHistory: string[];
  _undoIdx: number;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Navigation actions
  setActivePanel: (panel: PanelId) => void;

  // Meta actions
  updateMeta: (key: keyof MetaState, value: string) => void;

  // CP actions
  updateCp: (key: string, value: unknown) => void;
  addProfil: (value: string) => void;
  removeProfil: (index: number) => void;

  // TP actions
  addTp: () => void;
  deleteTp: (index: number) => void;
  updateTp: (index: number, key: keyof TpItem, value: unknown) => void;
  reorderTp: (fromIndex: number, toIndex: number) => void;

  // ATP actions
  updateAtpNamaBab: (value: string) => void;
  addAtpPertemuan: () => void;
  deleteAtpPertemuan: (index: number) => void;
  updateAtpPertemuan: (index: number, key: keyof AtpPertemuan, value: string) => void;

  // Alur actions
  addAlur: () => void;
  deleteAlur: (index: number) => void;
  updateAlur: (index: number, key: keyof AlurItem, value: string) => void;
  reorderAlur: (fromIndex: number, toIndex: number) => void;

  // Kuis actions
  addKuis: () => void;
  deleteKuis: (index: number) => void;
  updateKuis: (index: number, key: string, value: unknown) => void;
  updateKuisOpt: (index: number, optIndex: number, value: string) => void;
  reorderKuis: (fromIndex: number, toIndex: number) => void;

  // Materi block actions
  addMateriBlok: (tipe: string) => void;
  removeMateriBlok: (index: number) => void;
  updateMateriBlok: (index: number, key: string, value: unknown) => void;
  moveMateriBlok: (fromIndex: number, toIndex: number) => void;

  // Module actions
  addModule: (typeId: string) => void;
  removeModule: (index: number) => void;
  updateModuleField: (index: number, key: string, value: unknown) => void;
  moveModule: (fromIndex: number, toIndex: number) => void;
  addModuleItem: (moduleIndex: number, arrayKey: string, defaultItem: Record<string, unknown>) => void;
  removeModuleItem: (moduleIndex: number, arrayKey: string, itemIndex: number) => void;
  updateModuleItem: (moduleIndex: number, arrayKey: string, itemIndex: number, key: string, value: unknown) => void;

  // Skenario actions
  setSkenario: (data: Array<Record<string, unknown>>) => void;
  addSkenarioChapter: () => void;
  removeSkenarioChapter: (index: number) => void;
  updateSkenarioChapter: (index: number, key: string, value: unknown) => void;
  addSkenarioSetup: (chapterIndex: number) => void;
  removeSkenarioSetup: (chapterIndex: number, setupIndex: number) => void;
  updateSkenarioSetup: (chapterIndex: number, setupIndex: number, key: string, value: unknown) => void;
  addSkenarioChoice: (chapterIndex: number) => void;
  removeSkenarioChoice: (chapterIndex: number, choiceIndex: number) => void;
  updateSkenarioChoice: (chapterIndex: number, choiceIndex: number, key: string, value: unknown) => void;
  addSkenarioConsequence: (chapterIndex: number, choiceIndex: number) => void;
  removeSkenarioConsequence: (chapterIndex: number, choiceIndex: number, consIndex: number) => void;
  updateSkenarioConsequence: (chapterIndex: number, choiceIndex: number, consIndex: number, key: string, value: unknown) => void;

  // SFX actions
  updateSfxConfig: (key: keyof SfxConfig, value: unknown) => void;

  // System actions
  markDirty: () => void;
  markClean: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => boolean;

  // Completeness
  calcCompleteness: () => number;

  // Presets
  applyFullPreset: (presetKey: string) => void;
  applyKuisPreset: (presetKey: string) => void;
  applyTpPreset: (presetKey: string) => void;
  applyCpPreset: (presetKey: string) => void;
  applyAtpPreset: (presetKey: string) => void;
  applyAlurPreset: (presetKey: string) => void;
  applyMetaPreset: (presetKey: string) => void;
  newProject: () => void;
}

export function _captureSnapshot(s: AuthoringState) {
  return JSON.stringify({
    meta: s.meta, cp: s.cp, tp: s.tp, atp: s.atp, alur: s.alur,
    skenario: s.skenario, kuis: s.kuis, modules: s.modules,
    games: s.games, materi: s.materi, sfxConfig: s.sfxConfig,
  });
}

export function _pushUndo(s: AuthoringState): { _undoHistory: string[]; _undoIdx: number } {
  const hist = [...s._undoHistory.slice(0, s._undoIdx + 1), _captureSnapshot(s)];
  if (hist.length > UNDO_MAX) hist.shift();
  return { _undoHistory: hist, _undoIdx: hist.length - 1 };
}
