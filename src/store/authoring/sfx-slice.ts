import type { AuthoringState, SfxConfig } from './types';
import { _pushUndo } from './types';

export function createSfxSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    sfxConfig: { theme: 'default', volume: 0.6 } as SfxConfig,

    updateSfxConfig: (key: keyof SfxConfig, value: unknown) => {
      const s = get();
      set({ ..._pushUndo(s), sfxConfig: { ...s.sfxConfig, [key]: value }, dirty: true });
    },
  };
}
