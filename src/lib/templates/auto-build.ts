// ═══════════════════════════════════════════════════════════════
// AUTO-BUILD — Converts authoring store data into AssemblyPage[]
// using the slot-based template system.
//
// This is Phase 2 of the plan:
//   User fills data (manual or AI auto-generate)
//   → System reads data → selects template → fills slots → generates pages
//   → Pages appear on Canva as completed pages
// ═══════════════════════════════════════════════════════════════

import type { AssemblyPage, ScreenType } from './assembly';
import type {
  CoverSlots, DokumenSlots, TujuanSlots, ReviewSlots,
  MateriTabIconsSlots, MateriAccordionSlots, DiskusiTimerSlots,
  SortirGameSlots, RodaGameSlots, HubunganKonsepSlots,
  FlashcardSlots, HasilSlots, RefleksiSlots, PenutupSlots,
  SkenarioSlots, KuisSlots, GameSlots, ChipSlot,
} from './engine/slot-types';
import type {
  MetaState, CpState, TpItem, AtpState, AlurItem,
  KuisItem, MateriState, SfxConfig,
} from '@/store/authoring/types';

// ── Input: Authoring Store State ─────────────────────────────

export interface AutoBuildInput {
  meta: MetaState;
  cp: CpState;
  tp: TpItem[];
  atp: AtpState;
  alur: AlurItem[];
  kuis: KuisItem[];
  materi: MateriState;
  modules: Array<Record<string, unknown>>;
  skenario: Array<Record<string, unknown>>;
  games: Array<Record<string, unknown>>;
  sfxConfig?: SfxConfig;
}

// ── Output: Assembly Configuration ───────────────────────────

export interface AutoBuildResult {
  pages: AssemblyPage[];
  title: string;
  namaBab: string;
  sfxTheme: string;
  sfxVolume: number;
}

// ── Helper: HTML escape ──────────────────────────────────────

function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s);
}

// ── Detect module types from store ───────────────────────────

function findModulesByType(modules: Array<Record<string, unknown>>, type: string): Array<Record<string, unknown>> {
  return modules.filter(m => String(m.type) === type);
}

function hasModuleType(modules: Array<Record<string, unknown>>, type: string): boolean {
  return findModulesByType(modules, type).length > 0;
}

// ── Slot builders: Convert store data → template slots ───────

function buildCoverSlots(data: AutoBuildInput): CoverSlots {
  const meta = data.meta;
  const chips: ChipSlot[] = [];
  if (data.tp.length > 0) chips.push({ icon: '📋', label: `TP ${data.tp.length}`, color: '#f9c82e' });
  if (data.skenario.length > 0) chips.push({ icon: '🎭', label: `${data.skenario.length} Skenario`, color: '#3ecfcf' });
  if (data.modules.length > 0) chips.push({ icon: '🎮', label: 'Game', color: '#34d399' });
  chips.push({ icon: '📝', label: 'Refleksi', color: '#a78bfa' });

  return {
    title: meta.judulPertemuan || 'Judul Pertemuan',
    subtitle: meta.subjudul || 'Subjudul / Deskripsi',
    icon: meta.ikon || '📚',
    mapel: meta.mapel || '',
    kelas: meta.kelas || '',
    durasi: meta.durasi || '2 × 40 menit',
    kurikulum: meta.kurikulum || 'Kurikulum Merdeka',
    fase: 'D',
    elemen: data.cp.elemen || 'Pancasila',
    chips,
  };
}

function buildDokumenSlots(data: AutoBuildInput): DokumenSlots {
  return {
    namaBab: data.meta.namaBab || data.meta.judulPertemuan || '',
    cp: {
      elemen: data.cp.elemen || '',
      subElemen: data.cp.subElemen || '',
      capaianFase: data.cp.capaianFase || '',
      profil: data.cp.profil || [],
      fase: data.cp.fase || 'D',
    },
    tp: data.tp.map(t => ({
      verb: t.verb,
      desc: t.desc,
      pertemuan: t.pertemuan,
      color: t.color,
    })),
    atp: {
      namaBab: data.atp.namaBab || '',
      pertemuan: (data.atp.pertemuan || []).map(p => ({
        judul: p.judul || '',
        tp: p.tp || '',
        durasi: p.durasi || '',
        kegiatan: p.kegiatan || '',
        penilaian: p.penilaian || '',
      })),
    },
    alur: data.alur.map(a => ({
      fase: a.fase,
      durasi: a.durasi,
      judul: a.judul,
      deskripsi: a.deskripsi,
    })),
  };
}

function buildSkenarioSlots(data: AutoBuildInput): SkenarioSlots {
  return {
    judul: 'Skenario Interaktif',
    chapters: data.skenario.map((ch: Record<string, unknown>) => ({
      title: String(ch.title || ''),
      bg: String(ch.bg || 'sbg-kampung'),
      charEmoji: String(ch.charEmoji || '🧑'),
      charColor: String(ch.charColor || '#3ecfcf'),
      charPants: String(ch.charPants || '#2563eb'),
      choicePrompt: String(ch.choicePrompt || 'Apa yang akan kamu lakukan?'),
      setup: (Array.isArray(ch.setup) ? ch.setup : []) as Array<{ speaker: string; text: string }>,
      choices: (Array.isArray(ch.choices) ? ch.choices : []) as Array<{
        icon: string; label: string; detail: string; good: boolean; pts: number;
        level: string; norma: string; resultTitle: string; resultBody: string;
        consequences: Array<{ icon: string; text: string }>;
      }>,
    })),
  };
}

function buildMateriTabIconsSlots(data: AutoBuildInput): MateriTabIconsSlots {
  const tabIconsModule = findModulesByType(data.modules, 'tab-icons')[0];
  const tabs = (Array.isArray(tabIconsModule?.tabs) ? tabIconsModule!.tabs : []) as Array<{
    icon: string; judul: string; warna: string; isi: string; poin: string[]; refleksi: string;
  }>;

  return {
    judul: 'Materi Pembelajaran',
    subjudul: `${data.materi.blok.length} blok · ${data.modules.length} modul`,
    blok: data.materi.blok.map(b => ({
      tipe: b.tipe || 'teks',
      judul: b.judul,
      isi: b.isi,
      icon: b.icon,
      warna: b.warna,
      butir: b.butir,
      baris: b.baris,
    })),
    tabs: tabs.map(t => ({
      icon: t.icon || '📌',
      judul: t.judul || '',
      warna: t.warna || '#f9c82e',
      isi: t.isi || '',
      poin: t.poin || [],
      refleksi: t.refleksi || '',
    })),
  };
}

function buildMateriAccordionSlots(data: AutoBuildInput): MateriAccordionSlots {
  const accordionModule = findModulesByType(data.modules, 'accordion')[0];
  const items = (Array.isArray(accordionModule?.items) ? accordionModule!.items : []) as Array<{
    icon: string; judul: string; isi: string; warna: string;
  }>;

  return {
    judul: 'Materi Pembelajaran',
    subjudul: `${data.materi.blok.length} blok · ${data.modules.length} modul`,
    blok: data.materi.blok.map(b => ({
      tipe: b.tipe || 'teks',
      judul: b.judul,
      isi: b.isi,
      icon: b.icon,
      warna: b.warna,
      butir: b.butir,
      baris: b.baris,
    })),
    items: items.map(it => ({
      icon: it.icon || '📌',
      judul: it.judul || '',
      isi: it.isi || '',
      warna: it.warna || '#a78bfa',
    })),
  };
}

function buildKuisSlots(data: AutoBuildInput): KuisSlots {
  return {
    judul: 'Kuis Pengetahuan',
    subjudul: `${data.kuis.length} soal · Jawab dan lihat penjelasannya`,
    soal: data.kuis.map(s => ({
      q: s.q,
      opts: s.opts || ['', '', '', ''],
      ans: s.ans,
      ex: s.ex,
    })),
  };
}

function buildHasilSlots(_data: AutoBuildInput): HasilSlots {
  return {
    judul: 'Hasil Belajar',
    showReflection: true,
    reflectionPrompts: [
      { icon: '💭', label: 'Apa yang paling kamu pelajari hari ini?', placeholder: 'Tuliskan refleksimu…' },
      { icon: '🌟', label: 'Bagaimana kamu akan menerapkannya?', placeholder: 'Rencana aksi nyata…' },
    ],
  };
}

function buildRefleksiSlots(_data: AutoBuildInput): RefleksiSlots {
  return {
    judul: 'Refleksi Pembelajaran',
    subjudul: 'Luangkan waktu sejenak untuk merenungkan pembelajaran hari ini',
    prompts: [
      { icon: '💭', label: 'Apa hal terpenting yang kamu pelajari?', placeholder: 'Tuliskan pemikiranmu…', warna: '#f9c82e' },
      { icon: '🔄', label: 'Bagaimana ini mengubah pemahamanmu?', placeholder: 'Ceritakan perubahan perspektifmu…', warna: '#3ecfcf' },
      { icon: '🌟', label: 'Apa yang akan kamu lakukan berbeda?', placeholder: 'Rencana aksi nyata…', warna: '#34d399' },
    ],
    closingMessage: 'Terima kasih sudah belajar hari ini! Teruslah bertanya dan mencari tahu.',
  };
}

function buildPenutupSlots(data: AutoBuildInput): PenutupSlots {
  return {
    judul: 'Penutup',
    subjudul: `Pertemuan ${data.meta.judulPertemuan || ''}`,
    summary: data.materi.blok.slice(0, 4).map(b => b.judul || b.tipe || '').filter(Boolean),
    nextSteps: [
      { icon: '📝', label: 'Kerjakan latihan di buku paket' },
      { icon: '🔍', label: 'Cari contoh norma di lingkunganmu' },
      { icon: '💬', label: 'Diskusikan dengan keluarga di rumah' },
    ],
    closingQuote: 'Norma bukan sekadar aturan, tapi panduan hidup bersama yang lebih baik.',
  };
}

function buildDiskusiTimerSlots(data: AutoBuildInput): DiskusiTimerSlots {
  return {
    judul: 'Diskusi Kelompok',
    prompt: 'Diskusikan pertanyaan berikut dalam kelompokmu!',
    durasi: 600, // 10 minutes
    groups: [
      { nama: 'Kelompok 1', color: '#f9c82e', anggota: 4 },
      { nama: 'Kelompok 2', color: '#3ecfcf', anggota: 4 },
      { nama: 'Kelompok 3', color: '#a78bfa', anggota: 4 },
      { nama: 'Kelompok 4', color: '#34d399', anggota: 4 },
    ],
    panduan: [
      'Dengarkan pendapat teman kelompokmu',
      'Catat poin-poin penting dari diskusi',
      'Siapkan perwakilan untuk presentasi',
      'Kaitkan dengan materi yang sudah dipelajari',
    ],
  };
}

function buildSortirGameSlots(data: AutoBuildInput): SortirGameSlots {
  const sortingModule = findModulesByType(data.modules, 'sorting')[0];
  const kategori = (Array.isArray(sortingModule?.kategori) ? sortingModule!.kategori : []) as Array<{
    label: string; color: string; id: string;
  }>;
  const items = (Array.isArray(sortingModule?.items) ? sortingModule!.items : []) as Array<{
    teks: string; kategori: string;
  }>;

  return {
    judul: 'Game Sortir Norma',
    instruksi: 'Kelompokkan contoh berikut ke jenis norma yang tepat!',
    kategori: kategori.length > 0 ? kategori : [
      { label: 'Norma Agama', color: '#f9c82e', id: 'agama' },
      { label: 'Norma Kesopanan', color: '#3ecfcf', id: 'sopan' },
    ],
    items: items.length > 0 ? items : [
      { teks: 'Berdoa sebelum makan', kategori: 'agama' },
      { teks: 'Mengucap salam kepada guru', kategori: 'sopan' },
    ],
  };
}

function buildRodaGameSlots(data: AutoBuildInput): RodaGameSlots {
  const kuisSoal = data.kuis.length > 0 ? data.kuis.slice(0, 6) : [];

  return {
    judul: 'Roda Norma',
    instruksi: 'Putar roda dan jawab pertanyaan!',
    segments: [
      { label: 'Agama', color: '#f9c82e' },
      { label: 'Kesusilaan', color: '#3ecfcf' },
      { label: 'Kesopanan', color: '#a78bfa' },
      { label: 'Hukum', color: '#34d399' },
    ],
    soalPerSegment: kuisSoal.map(s => ({
      q: s.q,
      opts: s.opts || ['', '', '', ''],
      ans: s.ans,
    })),
  };
}

function buildFlashcardSlots(data: AutoBuildInput): FlashcardSlots {
  const matchingModule = findModulesByType(data.modules, 'matching')[0];
  const pasangan = (Array.isArray(matchingModule?.pasangan) ? matchingModule!.pasangan : []) as Array<{
    kiri: string; kanan: string;
  }>;

  return {
    judul: 'Flashcard',
    instruksi: 'Klik kartu untuk melihat jawaban!',
    cards: pasangan.map(p => ({
      depan: p.kiri,
      belakang: p.kanan,
      icon: '📌',
      warna: '#a78bfa',
    })),
  };
}

function buildHubunganKonsepSlots(data: AutoBuildInput): HubunganKonsepSlots {
  return {
    judul: 'Hubungan Konsep Norma',
    centerLabel: 'Norma',
    centerIcon: '⚖️',
    nodes: [
      { label: 'Agama', icon: '🙏', color: '#f9c82e', deskripsi: 'Bersumber dari wahyu Tuhan' },
      { label: 'Kesusilaan', icon: '💭', color: '#3ecfcf', deskripsi: 'Bersumber dari hati nurani' },
      { label: 'Kesopanan', icon: '🤝', color: '#a78bfa', deskripsi: 'Bersumber dari kebiasaan masyarakat' },
      { label: 'Hukum', icon: '⚖️', color: '#34d399', deskripsi: 'Bersumber dari peraturan perundang-undangan' },
    ],
    connections: [
      { from: 0, to: 1, label: 'berbeda sumber' },
      { from: 0, to: 2, label: 'berbeda sumber' },
      { from: 0, to: 3, label: 'berbeda sumber' },
    ],
  };
}

function buildGameSlots(data: AutoBuildInput): GameSlots {
  const GAME_TYPES = ['truefalse', 'memory', 'matching', 'roda', 'sorting', 'spinwheel', 'teambuzzer', 'wordsearch', 'flashcard'];
  const GAME_ICONS: Record<string, string> = {
    truefalse: '✅', memory: '🧠', matching: '🔗', roda: '🎡',
    sorting: '📂', spinwheel: '🎯', teambuzzer: '🔔', wordsearch: '🔍', flashcard: '🃏',
  };
  const GAME_COLORS: Record<string, string> = {
    truefalse: '#f9c82e', memory: '#3ecfcf', matching: '#a78bfa', roda: '#f97316',
    sorting: '#34d399', spinwheel: '#f472b6', teambuzzer: '#ef4444', wordsearch: '#06b6d4', flashcard: '#8b5cf6',
  };

  const games = data.modules.filter(m => GAME_TYPES.includes(String(m.type)));

  return {
    judul: 'Game Interaktif',
    subjudul: `${games.length} game tersedia`,
    games: games.map(g => ({
      type: String(g.type),
      title: String(g.title || g.type),
      icon: GAME_ICONS[String(g.type)] || '🎮',
      color: GAME_COLORS[String(g.type)] || '#3ecfcf',
    })),
  };
}

// ── Template Selection Logic ─────────────────────────────────
// Determines which templates to use based on available data

export type MateriTemplateVariant = 'tabicons' | 'accordion' | 'generic';

function selectMateriTemplate(modules: Array<Record<string, unknown>>): ScreenType {
  if (hasModuleType(modules, 'tab-icons')) return 'materi-tabicons';
  if (hasModuleType(modules, 'accordion')) return 'materi-accordion';
  return 'materi-tabicons'; // default fallback
}

// ── Main auto-build function ─────────────────────────────────

/**
 * Auto-build: Convert authoring store data into a complete set of
 * AssemblyPage definitions that can be rendered on the Canvas or
 * exported as a single HTML file.
 *
 * Logic:
 * 1. Always start with Cover + Dokumen
 * 2. If skenario data exists → add Skenario page
 * 3. If materi or modules exist → add Materi page (auto-select variant)
 * 4. If sorting game exists → add Sortir Game page
 * 5. If roda game exists → add Roda Game page
 * 6. If flashcard/matching exists → add Flashcard page
 * 7. If discussion needed → add Diskusi+Timer page
 * 8. If kuis exists → add Kuis page
 * 9. If generic games exist → add Game launcher page
 * 10. Always add Hasil page
 * 11. Optionally add Refleksi page
 * 12. Optionally add Penutup page
 */
export function autoBuildPages(data: AutoBuildInput): AutoBuildResult {
  const pages: AssemblyPage[] = [];
  const meta = data.meta;

  // 1. Cover
  pages.push({
    screenId: 's-cover',
    type: 'cover',
    label: 'Cover',
    slots: buildCoverSlots(data),
    showNavbar: false,
    progressPct: 0,
  });

  // 2. Dokumen (CP/TP/ATP)
  if (data.cp.capaianFase || data.tp.length > 0 || data.atp.pertemuan.length > 0) {
    pages.push({
      screenId: 's-cp',
      type: 'dokumen',
      label: 'Dokumen Pembelajaran',
      slots: buildDokumenSlots(data),
      progressPct: 15,
    });
  }

  // 3. Skenario
  if (data.skenario.length > 0) {
    pages.push({
      screenId: 's-sk',
      type: 'skenario',
      label: 'Skenario Interaktif',
      slots: buildSkenarioSlots(data),
      progressPct: 30,
    });
  }

  // 4. Materi (auto-select variant)
  if (data.materi.blok.length > 0 || data.modules.length > 0) {
    const materiType = selectMateriTemplate(data.modules);
    const materiSlots = materiType === 'materi-accordion'
      ? buildMateriAccordionSlots(data)
      : buildMateriTabIconsSlots(data);

    pages.push({
      screenId: materiType === 'materi-accordion' ? 's-materi2' : 's-materi',
      type: materiType,
      label: 'Materi Pembelajaran',
      slots: materiSlots,
      progressPct: 45,
    });
  }

  // 5. Hubungan Konsep
  if (hasModuleType(data.modules, 'infografis')) {
    pages.push({
      screenId: 's-konsep',
      type: 'hubungan-konsep',
      label: 'Hubungan Konsep',
      slots: buildHubunganKonsepSlots(data),
      progressPct: 50,
    });
  }

  // 6. Diskusi + Timer
  if (data.materi.blok.length > 0 || data.modules.length > 0) {
    pages.push({
      screenId: 's-diskusi',
      type: 'diskusi-timer',
      label: 'Diskusi Kelompok',
      slots: buildDiskusiTimerSlots(data),
      progressPct: 55,
    });
  }

  // 7. Sortir Game
  if (hasModuleType(data.modules, 'sorting')) {
    pages.push({
      screenId: 's-sortir',
      type: 'sortir-game',
      label: 'Game Sortir',
      slots: buildSortirGameSlots(data),
      progressPct: 60,
    });
  }

  // 8. Roda Game
  if (hasModuleType(data.modules, 'roda') || hasModuleType(data.modules, 'spinwheel')) {
    pages.push({
      screenId: 's-roda',
      type: 'roda-game',
      label: 'Roda Game',
      slots: buildRodaGameSlots(data),
      progressPct: 65,
    });
  }

  // 9. Flashcard
  if (hasModuleType(data.modules, 'matching') || hasModuleType(data.modules, 'flashcard')) {
    pages.push({
      screenId: 's-flashcard',
      type: 'flashcard',
      label: 'Flashcard',
      slots: buildFlashcardSlots(data),
      progressPct: 70,
    });
  }

  // 10. Kuis
  if (data.kuis.length > 0) {
    pages.push({
      screenId: 's-kuis',
      type: 'kuis',
      label: 'Kuis Pengetahuan',
      slots: buildKuisSlots(data),
      progressPct: 75,
    });
  }

  // 11. Game Launcher
  const GAME_TYPES = ['truefalse', 'memory', 'matching', 'roda', 'sorting', 'spinwheel', 'teambuzzer', 'wordsearch', 'flashcard'];
  const hasGames = data.modules.some(m => GAME_TYPES.includes(String(m.type)));
  if (hasGames && !hasModuleType(data.modules, 'sorting') && !hasModuleType(data.modules, 'roda') && !hasModuleType(data.modules, 'matching')) {
    pages.push({
      screenId: 's-game',
      type: 'game',
      label: 'Game Interaktif',
      slots: buildGameSlots(data),
      progressPct: 80,
    });
  }

  // 12. Hasil
  pages.push({
    screenId: 's-hasil',
    type: 'hasil',
    label: 'Hasil Belajar',
    slots: buildHasilSlots(data),
    progressPct: 90,
  });

  // 13. Refleksi
  pages.push({
    screenId: 's-refleksi',
    type: 'refleksi',
    label: 'Refleksi',
    slots: buildRefleksiSlots(data),
    progressPct: 95,
  });

  // 14. Penutup
  pages.push({
    screenId: 's-penutup',
    type: 'penutup',
    label: 'Penutup',
    slots: buildPenutupSlots(data),
    showNavbar: true,
    progressPct: 100,
  });

  // Recalculate progress percentages based on actual page count
  pages.forEach((page, idx) => {
    page.progressPct = Math.round(((idx + 1) / pages.length) * 100);
  });

  return {
    pages,
    title: `${meta.judulPertemuan || 'Media Pembelajaran'} | ${meta.mapel || ''} ${meta.kelas || ''}`,
    namaBab: meta.namaBab || meta.judulPertemuan || 'Media',
    sfxTheme: data.sfxConfig?.theme || 'default',
    sfxVolume: data.sfxConfig?.volume || 0.6,
  };
}
