import type { AuthoringState, KuisItem } from './types';
import { _pushUndo } from './types';

export function createKuisSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    kuis: [] as KuisItem[],

    addKuis: () => {
      const s = get();
      set({ ..._pushUndo(s), kuis: [...s.kuis, { q: '', opts: ['', '', '', ''], ans: 0, ex: '' }], dirty: true });
    },
    deleteKuis: (index: number) => {
      const s = get();
      set({ ..._pushUndo(s), kuis: s.kuis.filter((_, i) => i !== index), dirty: true });
    },
    updateKuis: (index: number, key: string, value: unknown) => {
      const s = get();
      const newKuis = [...s.kuis];
      newKuis[index] = { ...newKuis[index], [key]: value };
      set({ ..._pushUndo(s), kuis: newKuis, dirty: true });
    },
    updateKuisOpt: (index: number, optIndex: number, value: string) => {
      const s = get();
      const newKuis = [...s.kuis];
      const opts = [...(newKuis[index].opts || ['', '', '', ''])];
      opts[optIndex] = value;
      newKuis[index] = { ...newKuis[index], opts };
      set({ ..._pushUndo(s), kuis: newKuis, dirty: true });
    },
    reorderKuis: (fromIndex: number, toIndex: number) => {
      const s = get();
      const kuis = [...s.kuis];
      const [moved] = kuis.splice(fromIndex, 1);
      kuis.splice(toIndex, 0, moved);
      set({ ..._pushUndo(s), kuis, dirty: true });
    },
  };
}
