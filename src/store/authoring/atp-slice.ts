import type { AuthoringState, AtpState, AtpPertemuan } from './types';
import { _pushUndo } from './types';

export function createAtpSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    atp: { namaBab: '', jumlahPertemuan: 3, pertemuan: [] } as AtpState,

    updateAtpNamaBab: (value: string) => {
      const s = get();
      set({ ..._pushUndo(s), atp: { ...s.atp, namaBab: value }, dirty: true });
    },
    addAtpPertemuan: () => {
      const s = get();
      set({ ..._pushUndo(s), atp: {
        ...s.atp,
        pertemuan: [...s.atp.pertemuan, { judul: '', tp: '', durasi: '2\u00D740 menit', kegiatan: '', penilaian: '' } as AtpPertemuan],
      }, dirty: true });
    },
    deleteAtpPertemuan: (index: number) => {
      const s = get();
      set({ ..._pushUndo(s), atp: { ...s.atp, pertemuan: s.atp.pertemuan.filter((_, i) => i !== index) }, dirty: true });
    },
    updateAtpPertemuan: (index: number, key: keyof AtpPertemuan, value: string) => {
      const s = get();
      const newPertemuan = [...s.atp.pertemuan];
      newPertemuan[index] = { ...newPertemuan[index], [key]: value };
      set({ ..._pushUndo(s), atp: { ...s.atp, pertemuan: newPertemuan }, dirty: true });
    },
  };
}
