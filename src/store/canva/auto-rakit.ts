// ═══════════════════════════════════════════════════════════════
// CANVA STORE — Auto Rakit & Populate Template Elements
// Updated to use the new template system (Phase 2)
// ═══════════════════════════════════════════════════════════════

import { toast } from 'sonner';
import type { CanvaState } from './types';
import { createPage, createElId, GAME_TYPES, MATERI_MODULE_TYPES } from './types';
import type { CanvaPage } from './types';
import { useAuthoringStore } from '@/store/authoring-store';
import { loadTemplateModules, findTemplateById } from '@/lib/template-registry';
import type { HtmlPageModule } from '@/lib/html-parser';
import { autoBuildPages, type AutoBuildInput } from '@/lib/templates/auto-build';
import { autoBuildResultToCanvaPages } from '@/lib/templates/canva-bridge';

type Set = (partial: Partial<CanvaState> | ((state: CanvaState) => Partial<CanvaState>)) => void;
type Get = () => CanvaState;

// ── Helper: Populate template elements for backward compat ────

export function populateTemplateElements(page: CanvaPage) {
  if (page.templateType === 'custom') return;

  page.elements = [{
    id: createElId(),
    type: page.templateType === 'kuis' ? 'kuis' : page.templateType === 'game' ? 'game' : 'modul',
    icon: page.templateType === 'kuis' ? '❓' : page.templateType === 'game' ? '🎮' : '🧩',
    label: page.label,
    x: 0, y: 0, w: 100, h: 100,
    opacity: 100,
    dataIdx: -1,
  }];
}

export function createAutoRakitSlice(_set: Set, get: Get) {
  return {
    /**
     * Auto Rakit v2 — Uses the new template system with slot-based data binding.
     * Reads authoring data → selects appropriate templates → fills slots → generates pages.
     * The generated pages use the new screen templates (cover, dokumen, materi-tabicons, etc.)
     * which provide FULL visual fidelity matching the HTML reference templates.
     */
    autoRakit: () => {
      const authStore = useAuthoringStore.getState();

      // Build input from authoring store
      const input: AutoBuildInput = {
        meta: authStore.meta,
        cp: authStore.cp,
        tp: authStore.tp,
        atp: authStore.atp,
        alur: authStore.alur,
        kuis: authStore.kuis.filter(k => k.q.trim()),
        materi: authStore.materi,
        modules: authStore.modules,
        skenario: authStore.skenario,
        games: authStore.games,
        sfxConfig: authStore.sfxConfig,
      };

      // Run auto-build pipeline
      const result = autoBuildPages(input);

      // Convert to CanvaPage[]
      const newPages = autoBuildResultToCanvaPages(result);

      // If no pages were created (very unlikely), add at least one custom
      if (newPages.length === 0) {
        newPages.push(createPage('Halaman 1', 'custom'));
      }

      get()._pushHistory();
      _set({ pages: newPages, currentPageIndex: 0, selectedElId: null });
      toast.success(`Auto Rakit: ${newPages.length} halaman dibuat dari data authoring`);
    },

    /**
     * Auto Rakit from HTML Template (FULL VISUAL FIDELITY)
     * Loads the original HTML file and creates pages from each <screen> div.
     * This preserves ALL visual elements: animations, tabs, tables, games, etc.
     */
    autoRakitFromTemplate: async (templateId: string) => {
      const entry = findTemplateById(templateId);
      if (!entry) {
        toast.error(`Template "${templateId}" tidak ditemukan`);
        return;
      }

      toast.loading(`Memuat template "${entry.label}"...`, { id: 'template-load' });

      try {
        const modules = await loadTemplateModules(templateId);
        if (modules.length === 0) {
          toast.error(`Gagal memuat template — tidak ada screen ditemukan`, { id: 'template-load' });
          return;
        }

        // Also update the builtin cache in the store
        const currentBuiltin = { ...get().builtinTemplateModules };
        currentBuiltin[templateId] = modules;
        _set({ builtinTemplateModules: currentBuiltin });

        // Create canvas pages from each HTML screen module
        const newPages: CanvaPage[] = modules.map((mod) => {
          const page = createPage(mod.label, 'html-page');
          page.templateData = {
            htmlContent: mod.htmlContent,
            screenId: mod.screenId,
            templateId: templateId,
            templateLabel: entry.label,
          };
          page.bgColor = '#0e1c2f';
          return page;
        });

        if (newPages.length === 0) {
          newPages.push(createPage('Halaman 1', 'custom'));
        }

        get()._pushHistory();
        _set({ pages: newPages, currentPageIndex: 0, selectedElId: null });
        toast.success(`Template "${entry.label}": ${newPages.length} halaman dimuat dengan visual penuh`, { id: 'template-load' });
      } catch (err) {
        console.error('[autoRakitFromTemplate] Error:', err);
        toast.error(`Gagal memuat template: ${err instanceof Error ? err.message : String(err)}`, { id: 'template-load' });
      }
    },
  };
}
