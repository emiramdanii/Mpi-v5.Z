// ═══════════════════════════════════════════════════════════════
// CANVA STORE — Main Index (Combines all slices)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { toast } from 'sonner';
import type { CanvaState } from './types';
import { RATIOS, createPage } from './types';

import { createHistorySlice } from './history-slice';
import { createPageSlice } from './page-slice';
import { createElementSlice } from './element-slice';
import { createBackgroundSlice } from './background-slice';
import { createAutoRakitSlice } from './auto-rakit';
import { createExportSlice } from './export-slice';
import { createPersistenceSlice } from './persistence-slice';

export type { CanvaState } from './types';

export const useCanvaStore = create<CanvaState>((set, get) => ({
  // ── Initial state ────────────────────────────────────────────
  pages: [createPage('Halaman 1', 'custom')],
  currentPageIndex: 0,
  ratioId: '16:9',
  zoom: 1.0,
  tool: 'select',
  leftTab: 'templates',
  selectedElId: null,
  rightPanelOpen: true,
  builtinTemplateModules: {},

  // ── Computed ─────────────────────────────────────────────────
  currentPage: () => get().pages[get().currentPageIndex],
  currentRatio: () => RATIOS.find(r => r.id === get().ratioId) || RATIOS[0],
  selectedElement: () => {
    const page = get().pages[get().currentPageIndex];
    if (!page) return undefined;
    return page.elements.find(e => e.id === get().selectedElId);
  },

  // ── Tool & UI ────────────────────────────────────────────────
  setTool: (tool) => set({ tool }),
  setLeftTab: (tab) => set({ leftTab: tab }),
  toggleRightPanel: () => set(s => ({ rightPanelOpen: !s.rightPanelOpen })),

  nudgeSelected: (dx, dy) => {
    const { selectedElId, pages, currentPageIndex } = get();
    if (!selectedElId) return;
    const page = pages[currentPageIndex];
    if (!page) return;
    const el = page.elements.find(e => e.id === selectedElId);
    if (!el) return;
    const newX = Math.max(0, Math.min(95, el.x + dx));
    const newY = Math.max(0, Math.min(95, el.y + dy));
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: page.elements.map(e => e.id === selectedElId ? { ...e, x: newX, y: newY } : e),
    };
    set({ pages: newPages });
  },
  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.25, zoom)) }),
  zoomDelta: (delta) => {
    const current = get().zoom;
    set({ zoom: Math.min(2, Math.max(0.25, current + delta)) });
  },
  setRatio: (ratioId) => set({ ratioId }),

  // ── Stage ────────────────────────────────────────────────────
  clearStage: () => {
    const { pages, currentPageIndex } = get();
    if (pages[currentPageIndex].elements.length === 0) return;
    get()._pushHistory();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], elements: [] };
    set({ pages: newPages, selectedElId: null });
    toast.success('Stage dibersihkan');
  },

  // ── Slices ──────────────────────────────────────────────────
  ...createHistorySlice(set, get),
  ...createPageSlice(set, get),
  ...createElementSlice(set, get),
  ...createBackgroundSlice(set, get),
  ...createAutoRakitSlice(set, get),
  ...createExportSlice(set, get),
  ...createPersistenceSlice(set, get),
}));
