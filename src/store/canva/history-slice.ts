// ═══════════════════════════════════════════════════════════════
// CANVA STORE — History Slice (Undo/Redo)
// ═══════════════════════════════════════════════════════════════

import { toast } from 'sonner';
import type { CanvaState, Snapshot } from './types';
import { MAX_HISTORY } from './types';

type Set = (partial: Partial<CanvaState> | ((state: CanvaState) => Partial<CanvaState>)) => void;
type Get = () => CanvaState;

export function createHistorySlice(_set: Set, get: Get) {
  return {
    _history: [] as Snapshot[],
    _historyIdx: -1,
    _skipHistory: false,

    _pushHistory: () => {
      const { pages, currentPageIndex, ratioId, _history, _historyIdx, _skipHistory } = get();
      if (_skipHistory) return;
      const snapshot: Snapshot = { pages: JSON.parse(JSON.stringify(pages)), currentPageIndex, ratioId };
      const newHistory = _history.slice(0, _historyIdx + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      _set({ _history: newHistory, _historyIdx: newHistory.length - 1 });
    },

    undo: () => {
      const { _history, _historyIdx } = get();
      if (_historyIdx <= 0) return;
      const prev = _history[_historyIdx - 1];
      if (!prev) return;
      _set({
        ...JSON.parse(JSON.stringify(prev)),
        _historyIdx: _historyIdx - 1,
        _skipHistory: true,
        selectedElId: null,
      });
      _set({ _skipHistory: false });
      toast.info('Undo');
    },

    redo: () => {
      const { _history, _historyIdx } = get();
      if (_historyIdx >= _history.length - 1) return;
      const next = _history[_historyIdx + 1];
      if (!next) return;
      _set({
        ...JSON.parse(JSON.stringify(next)),
        _historyIdx: _historyIdx + 1,
        _skipHistory: true,
        selectedElId: null,
      });
      _set({ _skipHistory: false });
      toast.info('Redo');
    },

    canUndo: () => get()._historyIdx > 0,
    canRedo: () => get()._historyIdx < get()._history.length - 1,
  };
}
