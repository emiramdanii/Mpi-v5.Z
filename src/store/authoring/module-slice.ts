import type { AuthoringState } from './types';
import { _pushUndo } from './types';

export function createModuleSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    modules: [] as Array<Record<string, unknown>>,
    games: [] as Array<Record<string, unknown>>,

    addModule: (typeId: string) => {
      const defaults: Record<string, Record<string, unknown>> = {
        skenario: { type: 'skenario', title: '', chapters: [] },
        video: { type: 'video', title: '', url: '', platform: 'youtube', durasi: '', instruksi: '', pertanyaan: [] },
        flashcard: { type: 'flashcard', title: '', instruksi: '', kartu: [] },
        infografis: { type: 'infografis', title: '', layout: 'grid', intro: '', kartu: [] },
        'studi-kasus': { type: 'studi-kasus', title: '', teks: '', sumber: '', pertanyaan: [] },
        debat: { type: 'debat', title: '', pertanyaan: '', konteks: '', pihakA: { label: 'Pro / Setuju' }, pihakB: { label: 'Kontra / Tidak Setuju' } },
        timeline: { type: 'timeline', title: '', intro: '', events: [] },
        matching: { type: 'matching', title: '', instruksi: '', pasangan: [] },
        materi: { type: 'materi', title: '', intro: '', blok: [] },
        truefalse: { type: 'truefalse', title: '', instruksi: '', soal: [] },
        memory: { type: 'memory', title: '', pasangan: [] },
        roda: { type: 'roda', title: '', opsi: [] },
        hero: { type: 'hero', title: '', subjudul: '', icon: '\uD83D\uDE80', gradient: 'sunset', cta: '', chips: '' },
        kutipan: { type: 'kutipan', quote: '', source: '', title: '', display: 'card', accent: '#f9c82e' },
        langkah: { type: 'langkah', title: '', intro: '', style: 'numbered', steps: [{ icon: '\uD83D\uDCCC', judul: '', isi: '', color: '#3ecfcf' }] },
        accordion: { type: 'accordion', title: '', intro: '', items: [{ icon: '\uD83D\uDCCC', judul: '', isi: '' }] },
        statistik: { type: 'statistik', title: '', intro: '', layout: 'grid', items: [{ icon: '\uD83D\uDCCA', angka: '', satuan: '', label: '', color: '#3ecfcf' }] },
        polling: { type: 'polling', title: '', instruksi: '', tipe: 'single', anonymous: false, opsi: [{ icon: '', teks: '', warna: '#3ecfcf' }] },
        embed: { type: 'embed', title: '', url: '', height: 400, label: 'Buka di tab baru' },
        'tab-icons': { type: 'tab-icons', title: '', intro: '', layout: 'horizontal', animation: 'fade', tabs: [{ icon: '', judul: '', warna: '#3ecfcf', isi: '', poin: [], refleksi: '' }] },
        'icon-explore': { type: 'icon-explore', title: '', intro: '', layout: 'grid', animation: 'fade', items: [{ icon: '', judul: '', warna: '#3ecfcf', ringkasan: '', isi: '', contoh: [], sanksi: '' }] },
        comparison: { type: 'comparison', title: '', intro: '', animation: 'fade', kolom: [{ icon: '', judul: '', warna: '#3ecfcf' }, { icon: '', judul: '', warna: '#a78bfa' }], baris: [{ label: '', icon: '', nilai: ['', ''] }], tanya: '' },
        'card-showcase': { type: 'card-showcase', title: '', intro: '', layout: 'grid', animation: 'fade', cards: [{ icon: '', judul: '', subtitle: '', isi: '', tag: [], warna: '#3ecfcf' }] },
        'hotspot-image': { type: 'hotspot-image', title: '', intro: '', imageUrl: '', height: 300, mode: 'tooltip', animation: 'fade', hotspots: [{ x: 50, y: 50, icon: '\uD83D\uDCCC', judul: '', warna: '#f9c82e', isi: '' }] },
        sorting: { type: 'sorting', title: '', instruksi: '', kategori: [{ label: 'Kategori 1', color: '#3ecfcf', id: 'cat1' }, { label: 'Kategori 2', color: '#a78bfa', id: 'cat2' }], items: [{ teks: '', kategori: 'cat1' }] },
        spinwheel: { type: 'spinwheel', title: '', instruksi: '', soal: [{ teks: '', kategori: '' }] },
        teambuzzer: { type: 'teambuzzer', title: '', instruksi: '', timA: 'Tim A', timB: 'Tim B', soal: [{ teks: '', jawaban: '', poin: 10 }] },
        wordsearch: { type: 'wordsearch', title: '', instruksi: '', kata: [], ukuran: 10 },
      };
      const base = defaults[typeId] || { type: typeId, title: '' };
      const s = get();
      set({ ..._pushUndo(s), modules: [...s.modules, { ...base }], dirty: true });
    },
    removeModule: (index: number) => {
      const s = get();
      set({ ..._pushUndo(s), modules: s.modules.filter((_, i) => i !== index), dirty: true });
    },
    updateModuleField: (index: number, key: string, value: unknown) => {
      const s = get();
      const modules = [...s.modules];
      modules[index] = { ...modules[index], [key]: value };
      set({ ..._pushUndo(s), modules, dirty: true });
    },
    moveModule: (fromIndex: number, toIndex: number) => {
      const s = get();
      const modules = [...s.modules];
      const [moved] = modules.splice(fromIndex, 1);
      modules.splice(toIndex, 0, moved);
      set({ ..._pushUndo(s), modules, dirty: true });
    },
    addModuleItem: (moduleIndex: number, arrayKey: string, defaultItem: Record<string, unknown>) => {
      const s = get();
      const modules = [...s.modules];
      const mod = { ...modules[moduleIndex] };
      const arr = [...((mod[arrayKey] as unknown[]) || [])];
      arr.push(defaultItem);
      (mod as Record<string, unknown>)[arrayKey] = arr;
      modules[moduleIndex] = mod;
      set({ ..._pushUndo(s), modules, dirty: true });
    },
    removeModuleItem: (moduleIndex: number, arrayKey: string, itemIndex: number) => {
      const s = get();
      const modules = [...s.modules];
      const mod = { ...modules[moduleIndex] };
      const arr = ((mod[arrayKey] as unknown[]) || []).filter((_, i) => i !== itemIndex);
      (mod as Record<string, unknown>)[arrayKey] = arr;
      modules[moduleIndex] = mod;
      set({ ..._pushUndo(s), modules, dirty: true });
    },
    updateModuleItem: (moduleIndex: number, arrayKey: string, itemIndex: number, key: string, value: unknown) => {
      const s = get();
      const modules = [...s.modules];
      const mod = { ...modules[moduleIndex] };
      const arr = [...((mod[arrayKey] as Record<string, unknown>[]) || [])];
      arr[itemIndex] = { ...arr[itemIndex], [key]: value };
      (mod as Record<string, unknown>)[arrayKey] = arr;
      modules[moduleIndex] = mod;
      set({ ..._pushUndo(s), modules, dirty: true });
    },
  };
}
