'use client';

import { create } from 'zustand';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────
export type PanelId = 'dashboard' | 'dokumen' | 'konten' | 'canva' | 'autogen' | 'projects' | 'import' | 'versions';

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
  type: string;
  data?: Record<string, unknown>;
}

export interface MateriState {
  blok: MateriBlok[];
}

// ── Preset Types ─────────────────────────────────────────────────
interface MetaPreset {
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

interface CpPreset {
  id: string;
  label: string;
  elemen: string;
  subElemen: string;
  capaianFase: string;
  profil: string[];
  fase: string;
  kelas: string;
}

interface TpPreset {
  id: string;
  label: string;
  items: TpItem[];
}

interface AtpPreset {
  id: string;
  label: string;
  namaBab: string;
  jumlahPertemuan: number;
  pertemuan: AtpPertemuan[];
}

interface AlurPreset {
  id: string;
  label: string;
  steps: AlurItem[];
}

interface KuisPreset {
  id: string;
  label: string;
  soal: KuisItem[];
}

// ── Preset Data ──────────────────────────────────────────────────
const PRESETS_META: Record<string, MetaPreset> = {
  'hakikat-norma': {
    id: 'hakikat-norma', label: 'Bab 3 – Pertemuan 1: Hakikat Norma',
    mapel: 'PPKn', kelas: 'VII', kurikulum: 'Kurikulum Merdeka',
    judulPertemuan: 'Pertemuan 1 – Hakikat Norma',
    subjudul: 'Mengapa manusia membutuhkan norma?',
    ikon: '\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1', durasi: '2 \u00D7 40 menit', namaBab: 'Hakikat Norma',
  },
  'macam-norma': {
    id: 'macam-norma', label: 'Bab 3 – Pertemuan 2: Macam-Macam Norma',
    mapel: 'PPKn', kelas: 'VII', kurikulum: 'Kurikulum Merdeka',
    judulPertemuan: 'Pertemuan 2 – Macam-Macam Norma',
    subjudul: 'Apa saja jenis norma yang mengatur kehidupan kita?',
    ikon: '\uD83D\uDCDC', durasi: '2 \u00D7 40 menit', namaBab: 'Macam-Macam Norma',
  },
  blank: {
    id: 'blank', label: 'Kosong – Mulai dari Nol',
    mapel: '', kelas: '', kurikulum: 'Kurikulum Merdeka',
    judulPertemuan: '', subjudul: '', ikon: '\uD83D\uDCDA', durasi: '2 \u00D7 40 menit', namaBab: '',
  },
};

const PRESETS_CP: Record<string, CpPreset> = {
  'ppkn-smp-bab3': {
    id: 'ppkn-smp-bab3',
    label: 'PPKn SMP – Bab 3: Patuh terhadap Norma',
    elemen: 'Pancasila',
    subElemen: 'Pemahaman norma dan nilai',
    capaianFase: 'Peserta didik mampu menganalisis pentingnya norma dalam kehidupan bermasyarakat, berbangsa, dan bernegara; serta menunjukkan perilaku patuh terhadap norma sebagai wujud kesadaran hukum.',
    profil: ['Beriman & Bertakwa kepada Tuhan YME', 'Berkebhinekaan Global', 'Bergotong Royong', 'Bernalar Kritis'],
    fase: 'D', kelas: 'VII',
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', elemen: '', subElemen: '', capaianFase: '', profil: [], fase: 'D', kelas: '' },
};

const PRESETS_TP: Record<string, TpPreset> = {
  'bab3-full': {
    id: 'bab3-full', label: 'Bab 3 – 5 TP Lengkap',
    items: [
      { verb: 'Menjelaskan', desc: 'pengertian norma sebagai aturan yang mengikat warga masyarakat dan berfungsi sebagai pedoman tingkah laku dalam kehidupan bersama', pertemuan: 1, color: '#f9c82e' },
      { verb: 'Mengidentifikasi', desc: 'macam-macam norma (agama, kesusilaan, kesopanan, dan hukum) beserta sumber, sanksi, dan sifatnya masing-masing', pertemuan: 2, color: '#3ecfcf' },
      { verb: 'Menganalisis', desc: 'pentingnya patuh terhadap norma dan dampak pelanggaran norma bagi diri sendiri, masyarakat, serta kehidupan berbangsa dan bernegara', pertemuan: 2, color: '#a78bfa' },
      { verb: 'Memberikan contoh', desc: 'penerapan norma di lingkungan keluarga, sekolah, dan masyarakat dalam kehidupan sehari-hari', pertemuan: 3, color: '#34d399' },
      { verb: 'Menerapkan', desc: 'perilaku patuh terhadap norma sebagai wujud kesadaran hukum dan tanggung jawab sebagai warga negara yang baik', pertemuan: 3, color: '#ff6b6b' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', items: [] },
};

const PRESETS_ATP: Record<string, AtpPreset> = {
  'bab3-3pertemuan': {
    id: 'bab3-3pertemuan', label: 'Bab 3 – 3 Pertemuan',
    namaBab: 'Bab 3 \u2014 Patuh terhadap Norma',
    jumlahPertemuan: 3,
    pertemuan: [
      { judul: 'Hakikat Norma', tp: 'TP 1 \u2014 Menjelaskan pengertian & fungsi norma', durasi: '2\u00D740 menit', kegiatan: 'Apersepsi skenario \u2192 Manusia makhluk sosial (Zoon Politikon) \u2192 Pengertian norma \u2192 Fungsi norma \u2192 Diskusi kelompok & kuis tim', penilaian: 'Observasi + Pemantik' },
      { judul: 'Macam-Macam Norma', tp: 'TP 2 & 3 \u2014 Mengidentifikasi 4 jenis norma + menganalisis sanksi & dampak pelanggaran', durasi: '2\u00D740 menit', kegiatan: '4 jenis norma (agama, kesusilaan, kesopanan, hukum) \u2192 sanksinya \u2192 Game Sortir Norma \u2192 Roda Norma \u2192 Diskusi kelompok', penilaian: 'Game + Presentasi' },
      { judul: 'Perilaku Patuh terhadap Norma', tp: 'TP 4 & 5 \u2014 Memberikan contoh penerapan + menerapkan perilaku patuh', durasi: '2\u00D740 menit', kegiatan: 'Penerapan norma di 4 lingkungan (keluarga, sekolah, masyarakat, negara) \u2192 Budaya patuh \u2192 Kuis 10 soal \u2192 Refleksi & portofolio', penilaian: 'Kuis + Portofolio' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', namaBab: '', jumlahPertemuan: 3, pertemuan: [] },
};

const PRESETS_ALUR: Record<string, AlurPreset> = {
  'hakikat-norma-80menit': {
    id: 'hakikat-norma-80menit', label: 'Hakikat Norma \u2013 2\u00D740 menit',
    steps: [
      { fase: 'Pendahuluan', durasi: '10 menit', judul: 'Apersepsi & Motivasi', deskripsi: 'Guru menyapa, memeriksa kesiapan, menampilkan skenario konflik Kampung. Siswa memprediksi apa yang terjadi tanpa norma.' },
      { fase: 'Inti', durasi: '15 menit', judul: 'Skenario Interaktif', deskripsi: 'Siswa bermain 3 skenario konflik norma secara individual di perangkat masing-masing. Guru memantau dan mencatat respons.' },
      { fase: 'Inti', durasi: '20 menit', judul: 'Materi Konsep', deskripsi: 'Guru menjelaskan Zoon Politikon (Aristoteles), pengertian norma, sumber norma, dan pentingnya norma dalam kehidupan sosial.' },
      { fase: 'Inti', durasi: '20 menit', judul: 'Fungsi Norma & Diskusi', deskripsi: 'Eksplorasi 5 fungsi norma melalui tab interaktif. Siswa menulis jawaban refleksi di kolom diskusi masing-masing fungsi.' },
      { fase: 'Penutup', durasi: '15 menit', judul: 'Kuis Tim & Refleksi', deskripsi: 'Kuis tim 5 soal antar kelompok. Siswa mengisi refleksi akhir. Guru memberi umpan balik dan menutup pembelajaran.' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', steps: [] },
};

const PRESETS_KUIS: Record<string, KuisPreset> = {
  'norma-10-soal': {
    id: 'norma-10-soal', label: 'Kuis Norma \u2013 10 Soal Pilihan Ganda',
    soal: [
      { q: 'Norma adalah aturan atau pedoman yang mengatur...', opts: ['Cara berpakaian di sekolah saja', 'Perilaku manusia dalam kehidupan bermasyarakat', 'Peraturan tentang pajak negara', 'Tata cara beribadah di tempat ibadah'], ans: 1, ex: 'Norma mengatur perilaku manusia secara umum dalam kehidupan sosial bersama.' },
      { q: 'Aristoteles menyebut manusia sebagai Zoon Politikon karena...', opts: ['Manusia adalah makhluk paling cerdas di bumi', 'Manusia selalu membutuhkan orang lain dalam hidupnya', 'Manusia bisa berpolitik dan memimpin negara', 'Manusia memiliki akal budi yang membedakan dari hewan'], ans: 1, ex: 'Zoon Politikon berarti makhluk sosial \u2014 manusia tidak bisa hidup sendiri tanpa bantuan orang lain.' },
      { q: 'Fungsi norma yang paling utama dalam masyarakat adalah...', opts: ['Memberikan sanksi bagi pelanggar', 'Mengatur dan menciptakan ketertiban bersama', 'Menghukum orang yang berbuat salah', 'Membatasi kebebasan setiap warga'], ans: 1, ex: 'Fungsi utama norma adalah menciptakan ketertiban agar kehidupan bersama berjalan dengan harmonis.' },
      { q: 'Norma yang bersumber dari keyakinan tentang perintah dan larangan Tuhan disebut norma...', opts: ['Hukum', 'Kesopanan', 'Kesusilaan', 'Agama'], ans: 3, ex: 'Norma agama bersumber dari wahyu Tuhan dan pedoman keagamaan masing-masing agama.' },
      { q: 'Pak Budi membuang sampah di sungai dan diabaikan oleh warga. Fungsi norma apa yang gagal?', opts: ['Pedoman tingkah laku', 'Memperkuat solidaritas', 'Melindungi hak warga', 'Menciptakan ketertiban'], ans: 3, ex: 'Norma seharusnya menjaga ketertiban lingkungan \u2014 membuang sampah sembarangan merusak ketertiban bersama.' },
      { q: 'Contoh norma kesopanan di sekolah adalah...', opts: ['Membayar iuran sekolah tepat waktu', 'Mengucap salam kepada guru saat berpapasan', 'Tidak mencuri barang milik teman', 'Berdoa sebelum memulai pelajaran'], ans: 1, ex: 'Mengucap salam adalah norma kesopanan yang mengatur etika pergaulan dan menghormati orang lain.' },
      { q: 'Norma yang pelanggarannya dikenai sanksi berupa hukuman dari negara disebut norma...', opts: ['Agama', 'Kesusilaan', 'Kesopanan', 'Hukum'], ans: 3, ex: 'Norma hukum punya sanksi tegas dari negara berupa denda, penjara, atau sanksi formal lainnya.' },
      { q: 'Ketika ada warga yang terkena musibah dan tetangga membantu gotong royong, ini menunjukkan fungsi norma sebagai...', opts: ['Pedoman tingkah laku', 'Penentu sanksi', 'Memperkuat solidaritas', 'Melindungi hak warga'], ans: 2, ex: 'Gotong royong adalah wujud norma yang memperkuat solidaritas dan rasa kebersamaan antaranggota masyarakat.' },
      { q: 'Jika seseorang melanggar norma agama, sanksi yang paling utama diterimanya adalah...', opts: ['Denda dari pemerintah', 'Penjara', 'Dikucilkan dari masyarakat', 'Dosa dan hukuman dari Tuhan'], ans: 3, ex: 'Sanksi norma agama bersifat spiritual \u2014 berupa dosa yang dipercaya akan dipertanggungjawabkan kepada Tuhan.' },
      { q: 'Tujuan utama mempelajari norma bagi siswa kelas VII adalah...', opts: ['Agar bisa menjadi hakim di masa depan', 'Agar paham cara menghindari hukuman', 'Agar dapat berperilaku sesuai aturan sebagai warga negara yang baik', 'Agar tahu sanksi yang akan diterima jika melanggar'], ans: 2, ex: 'Mempelajari norma bertujuan membentuk karakter warga negara yang baik, taat aturan, dan bertanggung jawab.' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', soal: [] },
};

// ── Full Preset Mapping ──────────────────────────────────────────
const FULL_PRESET_MAP: Record<string, { meta: string; cp: string; tp: string; atp: string; alur: string; kuis: string }> = {
  'hakikat-norma': { meta: 'hakikat-norma', cp: 'ppkn-smp-bab3', tp: 'bab3-full', atp: 'bab3-3pertemuan', alur: 'hakikat-norma-80menit', kuis: 'norma-10-soal' },
  'macam-norma': { meta: 'macam-norma', cp: 'ppkn-smp-bab3', tp: 'bab3-full', atp: 'bab3-3pertemuan', alur: 'hakikat-norma-80menit', kuis: 'norma-10-soal' },
  blank: { meta: 'blank', cp: 'blank', tp: 'blank', atp: 'blank', alur: 'blank', kuis: 'blank' },
};

// ── Verb options ─────────────────────────────────────────────────
export const VERB_OPTIONS = [
  'Menjelaskan', 'Mengidentifikasi', 'Menganalisis', 'Memberikan contoh',
  'Menerapkan', 'Mengevaluasi', 'Membandingkan', 'Menyimpulkan',
  'Mendeskripsikan', 'Merancang', 'Membuat', 'Mempresentasikan',
];

const COLOR_OPTIONS = ['#f9c82e', '#3ecfcf', '#a78bfa', '#34d399', '#ff6b6b', '#fb923c'];

function colorForIndex(i: number): string {
  return COLOR_OPTIONS[i % COLOR_OPTIONS.length];
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const STORAGE_KEY = 'at_state_v1';

// ── Store Interface ──────────────────────────────────────────────
interface AuthoringState {
  // Navigation
  activePanel: PanelId;

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

  // System
  dirty: boolean;
  guruPw: string;

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

  // ATP actions
  updateAtpNamaBab: (value: string) => void;
  addAtpPertemuan: () => void;
  deleteAtpPertemuan: (index: number) => void;
  updateAtpPertemuan: (index: number, key: keyof AtpPertemuan, value: string) => void;

  // Alur actions
  addAlur: () => void;
  deleteAlur: (index: number) => void;
  updateAlur: (index: number, key: keyof AlurItem, value: string) => void;

  // Kuis actions
  addKuis: () => void;
  deleteKuis: (index: number) => void;
  updateKuis: (index: number, key: string, value: unknown) => void;
  updateKuisOpt: (index: number, optIndex: number, value: string) => void;

  // Skenario actions
  setSkenario: (data: Array<Record<string, unknown>>) => void;

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

// ── Create Store ─────────────────────────────────────────────────
export const useAuthoringStore = create<AuthoringState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────
  activePanel: 'dashboard' as PanelId,

  meta: {
    judulPertemuan: '', subjudul: '', ikon: '\uD83D\uDCDA', durasi: '',
    namaBab: '', mapel: '', kelas: '', kurikulum: '',
  },
  cp: {
    elemen: '', subElemen: '', capaianFase: '', profil: [],
    fase: 'D', kelas: '',
  },
  tp: [],
  atp: { namaBab: '', jumlahPertemuan: 3, pertemuan: [] },
  alur: [],
  skenario: [],
  kuis: [],
  modules: [],
  games: [],
  materi: { blok: [] },

  dirty: false,
  guruPw: 'guru123',

  // ── Navigation ─────────────────────────────────────────────────
  setActivePanel: (panel) => set({ activePanel: panel }),

  // ── Meta ───────────────────────────────────────────────────────
  updateMeta: (key, value) => {
    set((s) => ({ meta: { ...s.meta, [key]: value }, dirty: true }));
  },

  // ── CP ─────────────────────────────────────────────────────────
  updateCp: (key, value) => {
    set((s) => ({ cp: { ...s.cp, [key]: value }, dirty: true }));
  },
  addProfil: (value) => {
    set((s) => ({ cp: { ...s.cp, profil: [...s.cp.profil, value] }, dirty: true }));
  },
  removeProfil: (index) => {
    set((s) => ({
      cp: { ...s.cp, profil: s.cp.profil.filter((_, i) => i !== index) },
      dirty: true,
    }));
  },

  // ── TP ─────────────────────────────────────────────────────────
  addTp: () => {
    const { tp } = get();
    const newTp: TpItem = {
      verb: 'Menjelaskan', desc: '', pertemuan: 1,
      color: colorForIndex(tp.length),
    };
    set({ tp: [...tp, newTp], dirty: true });
  },
  deleteTp: (index) => {
    set((s) => ({ tp: s.tp.filter((_, i) => i !== index), dirty: true }));
  },
  updateTp: (index, key, value) => {
    set((s) => {
      const newTp = [...s.tp];
      newTp[index] = { ...newTp[index], [key]: value };
      return { tp: newTp, dirty: true };
    });
  },

  // ── ATP ────────────────────────────────────────────────────────
  updateAtpNamaBab: (value) => {
    set((s) => ({ atp: { ...s.atp, namaBab: value }, dirty: true }));
  },
  addAtpPertemuan: () => {
    set((s) => ({
      atp: {
        ...s.atp,
        pertemuan: [...s.atp.pertemuan, { judul: '', tp: '', durasi: '2\u00D740 menit', kegiatan: '', penilaian: '' }],
      },
      dirty: true,
    }));
  },
  deleteAtpPertemuan: (index) => {
    set((s) => ({
      atp: { ...s.atp, pertemuan: s.atp.pertemuan.filter((_, i) => i !== index) },
      dirty: true,
    }));
  },
  updateAtpPertemuan: (index, key, value) => {
    set((s) => {
      const newPertemuan = [...s.atp.pertemuan];
      newPertemuan[index] = { ...newPertemuan[index], [key]: value };
      return { atp: { ...s.atp, pertemuan: newPertemuan }, dirty: true };
    });
  },

  // ── Alur ───────────────────────────────────────────────────────
  addAlur: () => {
    set((s) => ({
      alur: [...s.alur, { fase: 'Inti', durasi: '15 menit', judul: '', deskripsi: '' }],
      dirty: true,
    }));
  },
  deleteAlur: (index) => {
    set((s) => ({ alur: s.alur.filter((_, i) => i !== index), dirty: true }));
  },
  updateAlur: (index, key, value) => {
    set((s) => {
      const newAlur = [...s.alur];
      newAlur[index] = { ...newAlur[index], [key]: value };
      return { alur: newAlur, dirty: true };
    });
  },

  // ── Kuis ───────────────────────────────────────────────────────
  addKuis: () => {
    set((s) => ({
      kuis: [...s.kuis, { q: '', opts: ['', '', '', ''], ans: 0, ex: '' }],
      dirty: true,
    }));
  },
  deleteKuis: (index) => {
    set((s) => ({ kuis: s.kuis.filter((_, i) => i !== index), dirty: true }));
  },
  updateKuis: (index, key, value) => {
    set((s) => {
      const newKuis = [...s.kuis];
      newKuis[index] = { ...newKuis[index], [key]: value };
      return { kuis: newKuis, dirty: true };
    });
  },
  updateKuisOpt: (index, optIndex, value) => {
    set((s) => {
      const newKuis = [...s.kuis];
      const opts = [...(newKuis[index].opts || ['', '', '', ''])];
      opts[optIndex] = value;
      newKuis[index] = { ...newKuis[index], opts };
      return { kuis: newKuis, dirty: true };
    });
  },

  // ── Skenario ───────────────────────────────────────────────────
  setSkenario: (data) => set({ skenario: data, dirty: true }),

  // ── System ─────────────────────────────────────────────────────
  markDirty: () => set({ dirty: true }),
  markClean: () => set({ dirty: false }),

  saveToStorage: () => {
    try {
      const s = get();
      const data = {
        meta: s.meta, cp: s.cp, tp: s.tp, atp: s.atp, alur: s.alur,
        skenario: s.skenario, kuis: s.kuis, modules: s.modules,
        games: s.games, materi: s.materi, guruPw: s.guruPw,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      set({ dirty: false });
      toast.success('\u2705 Tersimpan ke browser');
      return true;
    } catch {
      toast.error('\u274C Gagal menyimpan');
      return false;
    }
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      set({
        meta: data.meta || get().meta,
        cp: data.cp || get().cp,
        tp: data.tp || [],
        atp: data.atp || get().atp,
        alur: data.alur || [],
        skenario: data.skenario || [],
        kuis: data.kuis || [],
        modules: data.modules || [],
        games: data.games || [],
        materi: data.materi || { blok: [] },
        guruPw: data.guruPw || 'guru123',
        dirty: false,
      });
      toast.info('\uD83D\uDCC2 Data tersimpan dimuat');
      return true;
    } catch {
      return false;
    }
  },

  // ── Completeness ───────────────────────────────────────────────
  calcCompleteness: () => {
    const s = get();
    let pts = 0;
    let max = 0;
    const check = (val: boolean, w = 1) => { max += w; if (val) pts += w; };
    check(!!s.meta.judulPertemuan, 2);
    check(!!s.meta.kelas);
    check(!!s.cp.capaianFase, 2);
    check(s.tp.length > 0, 2);
    check(s.atp.pertemuan.length > 0, 2);
    check(s.alur.length >= 3, 2);
    check(s.kuis.length >= 5, 2);
    check(s.modules.length > 0, 1);
    return Math.round((pts / max) * 100);
  },

  // ── Full Preset ────────────────────────────────────────────────
  applyFullPreset: (presetKey) => {
    const mapping = FULL_PRESET_MAP[presetKey];
    if (!mapping) { toast.error('Preset tidak ditemukan'); return; }

    const mp = PRESETS_META[mapping.meta];
    const cp = PRESETS_CP[mapping.cp];
    const tp = PRESETS_TP[mapping.tp];
    const atp = PRESETS_ATP[mapping.atp];
    const alur = PRESETS_ALUR[mapping.alur];
    const kuis = PRESETS_KUIS[mapping.kuis];

    set({
      meta: mp ? deepClone(mp) : get().meta,
      cp: cp ? deepClone(cp) : get().cp,
      tp: tp ? deepClone(tp.items) : [],
      atp: atp ? deepClone(atp) : get().atp,
      alur: alur ? deepClone(alur.steps) : [],
      kuis: kuis ? deepClone(kuis.soal) : [],
      dirty: true,
    });
    toast.success(`\u26A1 Preset diterapkan: ${presetKey}`);
  },

  applyKuisPreset: (presetKey) => {
    const p = PRESETS_KUIS[presetKey];
    if (!p) return;
    set({ kuis: deepClone(p.soal), dirty: true });
    toast.success(`\u2705 Preset Kuis diterapkan: ${p.label}`);
  },

  applyTpPreset: (presetKey) => {
    const p = PRESETS_TP[presetKey];
    if (!p) return;
    set({ tp: deepClone(p.items), dirty: true });
    toast.success(`\u2705 Preset TP diterapkan: ${p.label}`);
  },

  applyCpPreset: (presetKey) => {
    const p = PRESETS_CP[presetKey];
    if (!p) return;
    set({ cp: deepClone(p), dirty: true });
    toast.success(`\u2705 Preset CP diterapkan: ${p.label}`);
  },

  applyAtpPreset: (presetKey) => {
    const p = PRESETS_ATP[presetKey];
    if (!p) return;
    set({ atp: deepClone(p), dirty: true });
    toast.success(`\u2705 Preset ATP diterapkan: ${p.label}`);
  },

  applyAlurPreset: (presetKey) => {
    const p = PRESETS_ALUR[presetKey];
    if (!p) return;
    set({ alur: deepClone(p.steps), dirty: true });
    toast.success(`\u2705 Preset Alur diterapkan: ${p.label}`);
  },

  applyMetaPreset: (presetKey) => {
    const p = PRESETS_META[presetKey];
    if (!p) return;
    set({ meta: deepClone(p), dirty: true });
    toast.success(`\u2705 Preset meta diterapkan: ${p.label}`);
  },

  newProject: () => {
    set({
      meta: { judulPertemuan: '', subjudul: '', ikon: '\uD83D\uDCDA', durasi: '', namaBab: '', mapel: '', kelas: '', kurikulum: '' },
      cp: { elemen: '', subElemen: '', capaianFase: '', profil: [], fase: 'D', kelas: '' },
      tp: [],
      atp: { namaBab: '', jumlahPertemuan: 3, pertemuan: [] },
      alur: [],
      skenario: [],
      kuis: [],
      modules: [],
      games: [],
      materi: { blok: [] },
      dirty: false,
      activePanel: 'dashboard',
    });
    toast.success('\u2728 Proyek baru dibuat');
  },
}));

export { VERB_OPTIONS, COLOR_OPTIONS };
