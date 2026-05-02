// ═══════════════════════════════════════════════════════════════
// CANVA STORE — Persistence Slice (Save/Load/HTML Import)
// ═══════════════════════════════════════════════════════════════

import { toast } from 'sonner';
import type { CanvaState } from './types';
import { CANVA_STORAGE_KEY, DEFAULT_NAV_CONFIG } from './types';
import type { CanvaPage, CanvaElement, HtmlPageModule } from './types';
import { createPage } from './types';

type Set = (partial: Partial<CanvaState> | ((state: CanvaState) => Partial<CanvaState>)) => void;
type Get = () => CanvaState;

export function createPersistenceSlice(_set: Set, get: Get) {
  return {
    importedHtmlModules: [] as HtmlPageModule[],

    saveToStorage: () => {
      try {
        const { pages, ratioId } = get();
        localStorage.setItem(CANVA_STORAGE_KEY, JSON.stringify({ pages, ratioId }));
      } catch {
        // Storage full or unavailable
      }
    },

    loadFromStorage: () => {
      try {
        const raw = localStorage.getItem(CANVA_STORAGE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (data.pages && Array.isArray(data.pages)) {
          // Ensure all pages have new fields (backward compat)
          const pages = data.pages.map((p: CanvaPage) => ({
            ...p,
            templateType: p.templateType || 'custom',
            colorPalette: p.colorPalette || null,
            navConfig: { ...DEFAULT_NAV_CONFIG, ...(p.navConfig || {}) },
            templateData: p.templateData || {},
            // Ensure elements have valid positions
            elements: (p.elements || []).map((el: CanvaElement) => ({
              ...el,
              opacity: el.opacity ?? 100,
              hidden: el.hidden ?? false,
            })),
          }));
          _set({
            pages,
            ratioId: data.ratioId || '16:9',
            currentPageIndex: 0,
            selectedElId: null,
            rightPanelOpen: true,
          });
          return true;
        }
        return false;
      } catch {
        // If data is corrupt, clear it
        try { localStorage.removeItem(CANVA_STORAGE_KEY); } catch {}
        return false;
      }
    },

    setImportedHtmlModules: (modules: HtmlPageModule[]) => _set({ importedHtmlModules: modules }),

    addHtmlPageModule: (module: HtmlPageModule) => {
      const pages = get().pages;
      const newPage = createPage(module.label || 'HTML Page', 'html-page');
      newPage.templateData = {
        htmlContent: module.htmlContent,
        screenId: module.screenId,
      };
      newPage.bgColor = '#0e1c2f';
      get()._pushHistory();
      _set({ pages: [...pages, newPage], currentPageIndex: pages.length, selectedElId: null });
      toast.success(`📄 ${module.label} ditambahkan`);
    },

    // ── Built-in Template Module Management ─────────────────────
    setBuiltinTemplateModules: (templateId: string, modules: HtmlPageModule[]) => {
      const currentBuiltin = { ...get().builtinTemplateModules };
      currentBuiltin[templateId] = modules;
      _set({ builtinTemplateModules: currentBuiltin });
    },

    addBuiltinTemplatePage: (templateId: string, screenIndex: number) => {
      const builtin = get().builtinTemplateModules;
      const modules = builtin[templateId];
      if (!modules || screenIndex >= modules.length) {
        toast.error('Screen tidak ditemukan dalam template');
        return;
      }
      const mod = modules[screenIndex];
      get().addHtmlPageModule(mod);
    },
  };
}
