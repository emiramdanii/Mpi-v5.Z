import type { AuthoringState } from './types';
import { _pushUndo, deepClone, STORAGE_KEY } from './types';
import {
  PRESETS_META, PRESETS_CP, PRESETS_TP, PRESETS_ATP, PRESETS_ALUR,
  PRESETS_KUIS, PRESETS_MATERI, PRESETS_MODULES, PRESETS_SKENARIO,
  FULL_PRESET_MAP,
} from './presets';
import { toast } from 'sonner';

export function createPresetActions(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    applyFullPreset: (presetKey: string) => {
      const mapping = FULL_PRESET_MAP[presetKey];
      if (!mapping) { toast.error('Preset tidak ditemukan'); return; }

      const s = get();
      const mp = PRESETS_META[mapping.meta];
      const cp = PRESETS_CP[mapping.cp];
      const tp = PRESETS_TP[mapping.tp];
      const atp = PRESETS_ATP[mapping.atp];
      const alur = PRESETS_ALUR[mapping.alur];
      const kuis = PRESETS_KUIS[mapping.kuis];
      const materi = PRESETS_MATERI[mapping.materi];
      const modules = PRESETS_MODULES[mapping.modules];
      const skenario = PRESETS_SKENARIO[mapping.skenario];

      set({
        ..._pushUndo(s),
        activePreset: presetKey === 'blank' ? null : presetKey,
        meta: mp ? deepClone(mp) : s.meta,
        cp: cp ? deepClone(cp) : s.cp,
        tp: tp ? deepClone(tp.items) : [],
        atp: atp ? deepClone(atp) : s.atp,
        alur: alur ? deepClone(alur.steps) : [],
        kuis: kuis ? deepClone(kuis.soal) : [],
        skenario: skenario ? deepClone(skenario.skenario) : [],
        materi: materi ? { blok: deepClone(materi.blok) } : { blok: [] },
        modules: modules ? deepClone(modules.modules) : [],
        games: [],
        dirty: true,
      });
      if (presetKey === 'blank') {
        toast.success('\u2728 Proyek kosong dibuat');
      } else {
        toast.success(`\u26A1 Preset diterapkan: ${presetKey}`);
      }
    },

    applyKuisPreset: (presetKey: string) => {
      const p = PRESETS_KUIS[presetKey];
      if (!p) return;
      const s = get();
      set({ ..._pushUndo(s), kuis: deepClone(p.soal), dirty: true });
      toast.success(`\u2705 Preset Kuis diterapkan: ${p.label}`);
    },

    applyTpPreset: (presetKey: string) => {
      const p = PRESETS_TP[presetKey];
      if (!p) return;
      const s = get();
      set({ ..._pushUndo(s), tp: deepClone(p.items), dirty: true });
      toast.success(`\u2705 Preset TP diterapkan: ${p.label}`);
    },

    applyCpPreset: (presetKey: string) => {
      const p = PRESETS_CP[presetKey];
      if (!p) return;
      const s = get();
      set({ ..._pushUndo(s), cp: deepClone(p), dirty: true });
      toast.success(`\u2705 Preset CP diterapkan: ${p.label}`);
    },

    applyAtpPreset: (presetKey: string) => {
      const p = PRESETS_ATP[presetKey];
      if (!p) return;
      const s = get();
      set({ ..._pushUndo(s), atp: deepClone(p), dirty: true });
      toast.success(`\u2705 Preset ATP diterapkan: ${p.label}`);
    },

    applyAlurPreset: (presetKey: string) => {
      const p = PRESETS_ALUR[presetKey];
      if (!p) return;
      const s = get();
      set({ ..._pushUndo(s), alur: deepClone(p.steps), dirty: true });
      toast.success(`\u2705 Preset Alur diterapkan: ${p.label}`);
    },

    applyMetaPreset: (presetKey: string) => {
      const p = PRESETS_META[presetKey];
      if (!p) return;
      const s = get();
      set({ ..._pushUndo(s), meta: deepClone(p), dirty: true });
      toast.success(`\u2705 Preset meta diterapkan: ${p.label}`);
    },

    newProject: () => {
      const s = get();
      set({
        ..._pushUndo(s),
        activePreset: null,
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
        dirty: true,
        activePanel: 'dashboard',
      });
      toast.success('\u2728 Proyek baru dibuat');
    },

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
          sfxConfig: s.sfxConfig,
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
          activePreset: null,
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
          sfxConfig: data.sfxConfig || { theme: 'default', volume: 0.6 },
          guruPw: data.guruPw || 'guru123',
          _undoHistory: [],
          _undoIdx: -1,
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
  };
}
