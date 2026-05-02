// ═══════════════════════════════════════════════════════════════
// CANVA STORE — Background / Palette / Nav Slice
// ═══════════════════════════════════════════════════════════════

import { toast } from 'sonner';
import type { CanvaState, NavConfig } from './types';
import { extractColorPalette } from '@/lib/color-palette';

type Set = (partial: Partial<CanvaState> | ((state: CanvaState) => Partial<CanvaState>)) => void;
type Get = () => CanvaState;

export function createBackgroundSlice(_set: Set, get: Get) {
  return {
    setBgColor: (hex: string) => {
      const { pages, currentPageIndex } = get();
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...newPages[currentPageIndex], bgColor: hex };
      _set({ pages: newPages });
    },

    setBgImage: (dataUrl: string) => {
      const { pages, currentPageIndex } = get();
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...newPages[currentPageIndex], bgDataUrl: dataUrl };
      _set({ pages: newPages });
      // Auto-extract color palette from image
      get().extractAndSetPalette(dataUrl);
      toast.success('Background diterapkan');
    },

    setOverlay: (val: number) => {
      const { pages, currentPageIndex } = get();
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...newPages[currentPageIndex], overlay: val };
      _set({ pages: newPages });
    },

    extractAndSetPalette: async (dataUrl: string) => {
      const palette = await extractColorPalette(dataUrl);
      if (palette.colors.length === 0) return;
      const { pages, currentPageIndex } = get();
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...newPages[currentPageIndex], colorPalette: palette };
      _set({ pages: newPages });
      toast.success('Palet warna diekstrak dari gambar');
    },

    setPaletteMapping: (key: string, colorIdx: number) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page || !page.colorPalette) return;
      const newPalette = { ...page.colorPalette };
      newPalette.mapping = { ...newPalette.mapping };
      if (colorIdx >= 0 && colorIdx < newPalette.colors.length) {
        newPalette.mapping[key] = newPalette.colors[colorIdx];
      }
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...page, colorPalette: newPalette };
      _set({ pages: newPages });
    },

    updateNavConfig: (updates: Partial<NavConfig>) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const newPages = [...pages];
      newPages[currentPageIndex] = {
        ...page,
        navConfig: { ...page.navConfig, ...updates },
      };
      _set({ pages: newPages });
    },

    updateTemplateData: (key: string, value: unknown) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      const newPages = [...pages];
      newPages[currentPageIndex] = {
        ...page,
        templateData: { ...page.templateData, [key]: value },
      };
      _set({ pages: newPages });
    },
  };
}
