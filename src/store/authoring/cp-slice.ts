import type { AuthoringState, CpState } from './types';
import { _pushUndo } from './types';

export function createCpSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    cp: {
      elemen: '', subElemen: '', capaianFase: '', profil: [],
      fase: 'D', kelas: '',
    } as CpState,

    updateCp: (key: string, value: unknown) => {
      const s = get();
      set({ ..._pushUndo(s), cp: { ...s.cp, [key]: value }, dirty: true });
    },
    addProfil: (value: string) => {
      const s = get();
      set({ ..._pushUndo(s), cp: { ...s.cp, profil: [...s.cp.profil, value] }, dirty: true });
    },
    removeProfil: (index: number) => {
      const s = get();
      set({ ..._pushUndo(s), cp: { ...s.cp, profil: s.cp.profil.filter((_, i) => i !== index) }, dirty: true });
    },
  };
}
