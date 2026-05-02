import type { AuthoringState, MateriState, MateriBlok } from './types';
import { _pushUndo } from './types';

export function createMateriSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    materi: { blok: [] } as MateriState,

    addMateriBlok: (tipe: string) => {
      const base: MateriBlok = { tipe };
      switch (tipe) {
        case 'teks':      base.judul = ''; base.isi = ''; break;
        case 'definisi':  base.judul = ''; base.isi = ''; break;
        case 'poin':      base.judul = ''; base.butir = ['']; break;
        case 'tabel':     base.judul = ''; base.baris = [['', ''], ['', '']]; break;
        case 'kutipan':   base.judul = ''; base.isi = ''; break;
        case 'gambar':    base.judul = ''; base.isi = ''; break;
        case 'timeline':  base.judul = ''; base.langkah = [{ icon: '\uD83D\uDCCC', judul: '', isi: '' }]; break;
        case 'highlight': base.judul = ''; base.icon = '\u26A1'; base.warna = '#f9c82e'; base.isi = ''; break;
        case 'compare':   base.judul = ''; base.kiri = { icon: '', judul: '', isi: '' }; base.kanan = { icon: '', judul: '', isi: '' }; break;
        case 'infobox':   base.judul = ''; base.style = 'info'; base.isi = ''; break;
        case 'checklist': base.judul = ''; base.butir = ['']; break;
        case 'statistik': base.judul = ''; base.items = [{ icon: '\uD83D\uDCCA', angka: '', label: '', warna: '#3ecfcf' }]; break;
        case 'studi':     base.judul = ''; base.karakter = '\uD83E\uDDD1'; base.situasi = ''; base.pertanyaan = ''; base.pesan = ''; break;
      }
      const s = get();
      set({ ..._pushUndo(s), materi: { blok: [...s.materi.blok, base] }, dirty: true });
    },
    removeMateriBlok: (index: number) => {
      const s = get();
      set({ ..._pushUndo(s), materi: { blok: s.materi.blok.filter((_, i) => i !== index) }, dirty: true });
    },
    updateMateriBlok: (index: number, key: string, value: unknown) => {
      const s = get();
      const blok = [...s.materi.blok];
      blok[index] = { ...blok[index], [key]: value };
      set({ ..._pushUndo(s), materi: { blok }, dirty: true });
    },
    moveMateriBlok: (fromIndex: number, toIndex: number) => {
      const s = get();
      const blok = [...s.materi.blok];
      const [moved] = blok.splice(fromIndex, 1);
      blok.splice(toIndex, 0, moved);
      set({ ..._pushUndo(s), materi: { blok }, dirty: true });
    },
  };
}
