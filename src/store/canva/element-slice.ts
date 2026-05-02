// ═══════════════════════════════════════════════════════════════
// CANVA STORE — Element Slice (Element operations)
// ═══════════════════════════════════════════════════════════════

import { toast } from 'sonner';
import type { CanvaState } from './types';
import { createElId, GAME_TYPES, ELEM_TYPES } from './types';
import type { CanvaElement } from './types';
import { useAuthoringStore } from '@/store/authoring-store';

type Set = (partial: Partial<CanvaState> | ((state: CanvaState) => Partial<CanvaState>)) => void;
type Get = () => CanvaState;

export function createElementSlice(_set: Set, get: Get) {
  return {
    addElement: (type: string, x?: number, y?: number) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const typeInfo = ELEM_TYPES.find(t => t.id === type);
      const el: CanvaElement = {
        id: createElId(),
        type,
        icon: typeInfo?.icon || '',
        label: typeInfo?.name || type,
        x: x ?? 5,
        y: y ?? 10,
        w: 40,
        h: 30,
        opacity: 100,
      };
      if (type === 'teks') { el.text = 'Judul Halaman'; el.fontSize = 24; el.h = 15; }
      if (type === 'shape') { el.color = 'rgba(255,255,255,.1)'; el.radius = 8; el.h = 20; }
      if (type === 'kuis') {
        el.w = 55; el.h = 65;
        el.icon = '❓'; el.label = 'Kuis Interaktif';
      }
      if (type === 'game') {
        el.w = 45; el.h = 60;
        el.icon = '🎮';
        const modules = useAuthoringStore.getState().modules;
        const gameIdx = modules.findIndex((m: Record<string, unknown>) => GAME_TYPES.includes(m.type as string));
        if (gameIdx >= 0) {
          el.dataIdx = gameIdx;
          el.label = 'Game: ' + (modules[gameIdx].title as string || modules[gameIdx].type as string);
        } else {
          el.label = 'Game Interaktif';
        }
      }
      const newPages = [...pages];
      newPages[currentPageIndex] = {
        ...page,
        elements: [...page.elements, el],
      };
      get()._pushHistory();
      _set({ pages: newPages, selectedElId: el.id });
      toast.success(`${typeInfo?.name || type} ditambahkan`);
    },

    addKuisElement: (idx: number) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const el: CanvaElement = {
        id: createElId(),
        type: 'kuis',
        icon: '❓',
        label: 'Kuis #' + (idx + 1),
        dataIdx: idx,
        x: 5, y: 5, w: 45, h: 40,
        opacity: 100,
      };
      const newPages = [...pages];
      newPages[currentPageIndex] = {
        ...page,
        elements: [...page.elements, el],
      };
      _set({ pages: newPages, selectedElId: el.id });
    },

    addGameElement: (idx: number) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const el: CanvaElement = {
        id: createElId(),
        type: 'game',
        icon: '🎮',
        label: 'Game #' + (idx + 1),
        dataIdx: idx,
        x: 55, y: 5, w: 40, h: 40,
        opacity: 100,
      };
      const newPages = [...pages];
      newPages[currentPageIndex] = {
        ...page,
        elements: [...page.elements, el],
      };
      _set({ pages: newPages, selectedElId: el.id });
    },

    selectElement: (elId: string | null) => _set({ selectedElId: elId }),

    updateElement: (elId: string, props: Partial<CanvaElement>) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const newPages = [...pages];
      newPages[currentPageIndex] = {
        ...page,
        elements: page.elements.map(el =>
          el.id === elId ? { ...el, ...props } : el
        ),
      };
      _set({ pages: newPages });
    },

    deleteElement: (elId: string) => {
      const { pages, currentPageIndex, selectedElId } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      get()._pushHistory();
      const newPages = [...pages];
      newPages[currentPageIndex] = {
        ...page,
        elements: page.elements.filter(e => e.id !== elId),
      };
      _set({
        pages: newPages,
        selectedElId: selectedElId === elId ? null : selectedElId,
      });
    },

    deleteSelected: () => {
      const { selectedElId, deleteElement } = get();
      if (selectedElId) {
        deleteElement(selectedElId);
        toast.success('Elemen dihapus');
      }
    },

    moveElementZ: (elId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const idx = page.elements.findIndex(e => e.id === elId);
      if (idx === -1) return;
      get()._pushHistory();
      const els = [...page.elements];
      const el = els[idx];
      els.splice(idx, 1);
      let newIdx = idx;
      if (direction === 'up') newIdx = Math.min(els.length, idx + 1);
      else if (direction === 'down') newIdx = Math.max(0, idx - 1);
      else if (direction === 'top') newIdx = els.length;
      else if (direction === 'bottom') newIdx = 0;
      els.splice(newIdx, 0, el);
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...page, elements: els };
      _set({ pages: newPages });
    },

    toggleElementVisibility: (elId: string) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const newPages = [...pages];
      newPages[currentPageIndex] = {
        ...page,
        elements: page.elements.map(el =>
          el.id === elId ? { ...el, hidden: !el.hidden } : el
        ),
      };
      _set({ pages: newPages });
    },

    saveTextContent: (elId: string, text: string) => {
      get().updateElement(elId, { text });
    },
  };
}
