import type { AuthoringState, TpItem } from './types';
import { _pushUndo, colorForIndex } from './types';

export function createTpSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    tp: [] as TpItem[],

    addTp: () => {
      const s = get();
      const newTp: TpItem = {
        verb: 'Menjelaskan', desc: '', pertemuan: 1,
        color: colorForIndex(s.tp.length),
      };
      set({ ..._pushUndo(s), tp: [...s.tp, newTp], dirty: true });
    },
    deleteTp: (index: number) => {
      const s = get();
      set({ ..._pushUndo(s), tp: s.tp.filter((_, i) => i !== index), dirty: true });
    },
    updateTp: (index: number, key: keyof TpItem, value: unknown) => {
      const s = get();
      const newTp = [...s.tp];
      newTp[index] = { ...newTp[index], [key]: value };
      set({ ..._pushUndo(s), tp: newTp, dirty: true });
    },
    reorderTp: (fromIndex: number, toIndex: number) => {
      const s = get();
      const tp = [...s.tp];
      const [moved] = tp.splice(fromIndex, 1);
      tp.splice(toIndex, 0, moved);
      set({ ..._pushUndo(s), tp, dirty: true });
    },
  };
}
