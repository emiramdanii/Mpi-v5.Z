import type { AuthoringState, AlurItem } from './types';
import { _pushUndo } from './types';

export function createAlurSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    alur: [] as AlurItem[],

    addAlur: () => {
      const s = get();
      set({ ..._pushUndo(s), alur: [...s.alur, { fase: 'Inti', durasi: '15 menit', judul: '', deskripsi: '' }], dirty: true });
    },
    deleteAlur: (index: number) => {
      const s = get();
      set({ ..._pushUndo(s), alur: s.alur.filter((_, i) => i !== index), dirty: true });
    },
    updateAlur: (index: number, key: keyof AlurItem, value: string) => {
      const s = get();
      const newAlur = [...s.alur];
      newAlur[index] = { ...newAlur[index], [key]: value };
      set({ ..._pushUndo(s), alur: newAlur, dirty: true });
    },
    reorderAlur: (fromIndex: number, toIndex: number) => {
      const s = get();
      const alur = [...s.alur];
      const [moved] = alur.splice(fromIndex, 1);
      alur.splice(toIndex, 0, moved);
      set({ ..._pushUndo(s), alur, dirty: true });
    },
  };
}
