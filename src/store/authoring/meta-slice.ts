import type { AuthoringState, MetaState } from './types';
import { _pushUndo } from './types';

export function createMetaSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    meta: {
      judulPertemuan: '', subjudul: '', ikon: '\uD83D\uDCDA', durasi: '',
      namaBab: '', mapel: '', kelas: '', kurikulum: '',
    } as MetaState,

    updateMeta: (key: keyof MetaState, value: string) => {
      const s = get();
      set({ ..._pushUndo(s), meta: { ...s.meta, [key]: value }, dirty: true });
    },
  };
}
