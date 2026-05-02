'use client';

import { create } from 'zustand';
import type { AuthoringState, PanelId } from './types';
import { createMetaSlice } from './meta-slice';
import { createCpSlice } from './cp-slice';
import { createTpSlice } from './tp-slice';
import { createAtpSlice } from './atp-slice';
import { createAlurSlice } from './alur-slice';
import { createKuisSlice } from './kuis-slice';
import { createMateriSlice } from './materi-slice';
import { createModuleSlice } from './module-slice';
import { createSkenarioSlice } from './skenario-slice';
import { createSfxSlice } from './sfx-slice';
import { createPresetActions } from './preset-actions';

// Re-export everything that consumers need
export type {
  PanelId,
  MetaState,
  CpState,
  TpItem,
  AtpPertemuan,
  AtpState,
  AlurItem,
  KuisItem,
  MateriBlok,
  MateriState,
  SfxTheme,
  SfxConfig,
} from './types';

export {
  VERB_OPTIONS,
  COLOR_OPTIONS,
} from './types';

export const useAuthoringStore = create<AuthoringState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────
  activePanel: 'dashboard' as PanelId,
  activePreset: null as string | null,
  dirty: false,
  guruPw: 'guru123',

  _undoHistory: [],
  _undoIdx: -1,

  // ── Undo/Redo ─────────────────────────────────────────────────
  undo: () => {
    const { _undoHistory, _undoIdx } = get();
    if (_undoIdx <= 0) return;
    const prevIdx = _undoIdx - 1;
    const snapshot = JSON.parse(_undoHistory[prevIdx]);
    set({
      ...snapshot,
      _undoIdx: prevIdx,
      dirty: true,
    });
  },
  redo: () => {
    const { _undoHistory, _undoIdx } = get();
    if (_undoIdx >= _undoHistory.length - 1) return;
    const nextIdx = _undoIdx + 1;
    const snapshot = JSON.parse(_undoHistory[nextIdx]);
    set({
      ...snapshot,
      _undoIdx: nextIdx,
      dirty: true,
    });
  },
  canUndo: () => get()._undoIdx > 0,
  canRedo: () => get()._undoIdx < get()._undoHistory.length - 1,

  // ── Navigation ─────────────────────────────────────────────────
  setActivePanel: (panel) => set({ activePanel: panel }),

  // ── Slices ─────────────────────────────────────────────────────
  ...createMetaSlice(set, get),
  ...createCpSlice(set, get),
  ...createTpSlice(set, get),
  ...createAtpSlice(set, get),
  ...createAlurSlice(set, get),
  ...createKuisSlice(set, get),
  ...createMateriSlice(set, get),
  ...createModuleSlice(set, get),
  ...createSkenarioSlice(set, get),
  ...createSfxSlice(set, get),
  ...createPresetActions(set, get),
}));
