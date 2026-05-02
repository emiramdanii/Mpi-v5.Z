// ═══════════════════════════════════════════════════════════════
// SLOT TYPES — Data interfaces for template slot binding
// Each template has strongly-typed slot data that gets filled
// either from presets, auto-generate AI, or manual input.
// ═══════════════════════════════════════════════════════════════

// ── Common types ──────────────────────────────────────────────

export interface ChipSlot {
  icon?: string;
  label: string;
  color: string;
}

export interface ProfileRef {
  icon: string;
  judul: string;
  warna: string;
  isi: string;
  poin?: string[];
  refleksi?: string;
}

// ── Cover ─────────────────────────────────────────────────────

export interface CoverSlots {
  title: string;
  subtitle: string;
  icon: string;
  mapel: string;
  kelas: string;
  durasi: string;
  kurikulum: string;
  fase: string;
  elemen: string;
  chips: ChipSlot[];
  bgGradient?: string;
}

// ── Dokumen (CP/TP/ATP combined) ─────────────────────────────

export interface DokumenSlots {
  namaBab: string;
  cp: {
    elemen: string;
    subElemen: string;
    capaianFase: string;
    profil: string[];
    fase: string;
  };
  tp: Array<{
    verb: string;
    desc: string;
    pertemuan: number;
    color: string;
  }>;
  atp: {
    namaBab: string;
    pertemuan: Array<{
      judul: string;
      tp: string;
      durasi: string;
      kegiatan: string;
      penilaian: string;
    }>;
  };
  alur: Array<{
    fase: string;
    durasi: string;
    judul: string;
    deskripsi: string;
  }>;
}

// ── Tujuan (TP only) ─────────────────────────────────────────

export interface TujuanSlots {
  judul: string;
  subjudul: string;
  tp: Array<{
    verb: string;
    desc: string;
    pertemuan: number;
    color: string;
  }>;
}

// ── Review ────────────────────────────────────────────────────

export interface ReviewSlots {
  judul: string;
  subjudul: string;
  items: Array<{
    icon: string;
    judul: string;
    isi: string;
    warna: string;
  }>;
}

// ── Materi-TabIcons ──────────────────────────────────────────

export interface MateriTabIconsSlots {
  judul: string;
  subjudul: string;
  blok: Array<{
    tipe: string;
    judul?: string;
    isi?: string;
    icon?: string;
    warna?: string;
    butir?: string[];
    baris?: string[][];
  }>;
  tabs: ProfileRef[];
}

// ── Materi-Accordion ─────────────────────────────────────────

export interface MateriAccordionSlots {
  judul: string;
  subjudul: string;
  blok: Array<{
    tipe: string;
    judul?: string;
    isi?: string;
    icon?: string;
    warna?: string;
    butir?: string[];
    baris?: string[][];
  }>;
  items: Array<{
    icon: string;
    judul: string;
    isi: string;
    warna?: string;
  }>;
}

// ── Diskusi+Timer ────────────────────────────────────────────

export interface DiskusiTimerSlots {
  judul: string;
  prompt: string;
  durasi: number; // seconds
  groups: Array<{
    nama: string;
    color: string;
    anggota: number;
  }>;
  panduan: string[];
}

// ── Sortir Game ──────────────────────────────────────────────

export interface SortirGameSlots {
  judul: string;
  instruksi: string;
  kategori: Array<{
    label: string;
    color: string;
    id: string;
  }>;
  items: Array<{
    teks: string;
    kategori: string;
  }>;
}

// ── Roda Game ────────────────────────────────────────────────

export interface RodaGameSlots {
  judul: string;
  instruksi: string;
  segments: Array<{
    label: string;
    color: string;
  }>;
  soalPerSegment: Array<{
    q: string;
    opts: string[];
    ans: number;
  }>;
}

// ── Hubungan Konsep ──────────────────────────────────────────

export interface HubunganKonsepSlots {
  judul: string;
  centerLabel: string;
  centerIcon: string;
  nodes: Array<{
    label: string;
    icon: string;
    color: string;
    deskripsi: string;
  }>;
  connections: Array<{
    from: number;
    to: number;
    label: string;
  }>;
}

// ── Flashcard ────────────────────────────────────────────────

export interface FlashcardSlots {
  judul: string;
  instruksi: string;
  cards: Array<{
    depan: string;
    belakang: string;
    icon?: string;
    warna?: string;
  }>;
}

// ── Hasil ────────────────────────────────────────────────────

export interface HasilSlots {
  judul: string;
  showReflection: boolean;
  reflectionPrompts: Array<{
    icon: string;
    label: string;
    placeholder: string;
  }>;
}

// ── Refleksi ─────────────────────────────────────────────────

export interface RefleksiSlots {
  judul: string;
  subjudul: string;
  prompts: Array<{
    icon: string;
    label: string;
    placeholder: string;
    warna: string;
  }>;
  closingMessage: string;
}

// ── Penutup ──────────────────────────────────────────────────

export interface PenutupSlots {
  judul: string;
  subjudul: string;
  summary: string[];
  nextSteps: Array<{
    icon: string;
    label: string;
  }>;
  closingQuote: string;
}

// ── Skenario ─────────────────────────────────────────────────

export interface SkenarioSlots {
  judul: string;
  chapters: Array<{
    title: string;
    bg: string;
    charEmoji: string;
    charColor: string;
    charPants: string;
    choicePrompt: string;
    setup: Array<{
      speaker: string;
      text: string;
    }>;
    choices: Array<{
      icon: string;
      label: string;
      detail: string;
      good: boolean;
      pts: number;
      level: string;
      norma: string;
      resultTitle: string;
      resultBody: string;
      consequences: Array<{
        icon: string;
        text: string;
      }>;
    }>;
  }>;
}

// ── Kuis ─────────────────────────────────────────────────────

export interface KuisSlots {
  judul: string;
  subjudul: string;
  soal: Array<{
    q: string;
    opts: string[];
    ans: number;
    ex: string;
  }>;
}

// ── Hero Banner ──────────────────────────────────────────────

export interface HeroSlots {
  title: string;
  subtitle: string;
  icon: string;
  bgGradient: string;
  ctaLabel?: string;
  ctaTarget?: string;
}

// ── Game (generic) ───────────────────────────────────────────

export interface GameSlots {
  judul: string;
  subjudul: string;
  games: Array<{
    type: string;
    title: string;
    icon: string;
    color: string;
  }>;
}

// ── Union type for all slots ─────────────────────────────────

export type TemplateSlots =
  | CoverSlots
  | DokumenSlots
  | TujuanSlots
  | ReviewSlots
  | MateriTabIconsSlots
  | MateriAccordionSlots
  | DiskusiTimerSlots
  | SortirGameSlots
  | RodaGameSlots
  | HubunganKonsepSlots
  | FlashcardSlots
  | HasilSlots
  | RefleksiSlots
  | PenutupSlots
  | SkenarioSlots
  | KuisSlots
  | HeroSlots
  | GameSlots;
