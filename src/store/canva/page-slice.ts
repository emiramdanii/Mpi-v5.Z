// ═══════════════════════════════════════════════════════════════
// CANVA STORE — Page Slice (CRUD operations)
// ═══════════════════════════════════════════════════════════════

import { toast } from 'sonner';
import type { CanvaState } from './types';
import { createPage, createElId, GAME_TYPES, MATERI_MODULE_TYPES } from './types';
import type { CanvaPage, CanvaElement, PageTemplateType } from './types';
import { useAuthoringStore } from '@/store/authoring-store';
import { populateTemplateElements } from './auto-rakit';

type Set = (partial: Partial<CanvaState> | ((state: CanvaState) => Partial<CanvaState>)) => void;
type Get = () => CanvaState;

export function createPageSlice(_set: Set, get: Get) {
  return {
    goPage: (idx: number) => {
      const pages = get().pages;
      if (idx < 0 || idx >= pages.length) return;
      _set({ currentPageIndex: idx, selectedElId: null });
    },

    addPage: () => {
      const pages = get().pages;
      const newPage = createPage('Halaman ' + (pages.length + 1), 'custom');
      get()._pushHistory();
      _set({ pages: [...pages, newPage], currentPageIndex: pages.length, selectedElId: null });
      toast.success('Halaman baru ditambahkan');
    },

    addTemplatePage: (templateType: PageTemplateType) => {
      const pages = get().pages;
      const authStore = useAuthoringStore.getState();
      const meta = authStore.meta;

      // Generate page label based on template type
      const labelMap: Record<string, string> = {
        cover: 'Cover - ' + (meta.judulPertemuan || 'Halaman Judul'),
        dokumen: 'Dokumen CP/TP/ATP',
        materi: 'Materi Pembelajaran',
        kuis: 'Kuis Interaktif',
        game: 'Game Interaktif',
        hasil: 'Hasil & Apresiasi',
        hero: 'Hero Banner',
        skenario: 'Skenario Interaktif',
        custom: 'Halaman ' + (pages.length + 1),
        'html-page': 'HTML Page',
      };

      const newPage = createPage(labelMap[templateType] || 'Halaman ' + (pages.length + 1), templateType);

      // Pre-fill template data from authoring store
      switch (templateType) {
        case 'cover':
          newPage.templateData = {
            title: meta.judulPertemuan || 'Judul Pertemuan',
            subtitle: meta.subjudul || 'Subjudul',
            icon: meta.ikon || '📚',
            mapel: meta.mapel || '',
            kelas: meta.kelas || '',
            namaBab: meta.namaBab || '',
          };
          newPage.bgColor = '#0f172a';
          break;

        case 'dokumen':
          newPage.templateData = {
            cp: authStore.cp,
            tp: authStore.tp,
            atp: authStore.atp,
          };
          break;

        case 'materi':
          newPage.templateData = {
            blok: authStore.materi.blok,
            modules: authStore.modules.filter((m: Record<string, unknown>) =>
              MATERI_MODULE_TYPES.includes(m.type as string)
            ),
          };
          break;

        case 'kuis':
          newPage.templateData = {
            kuis: authStore.kuis.filter(k => k.q.trim()),
          };
          break;

        case 'game': {
          newPage.templateData = {
            games: authStore.modules.filter((m: Record<string, unknown>) =>
              GAME_TYPES.includes(m.type as string)
            ),
          };
          break;
        }

        case 'hasil':
          newPage.templateData = {
            totalKuis: authStore.kuis.filter(k => k.q.trim()).length,
            namaBab: meta.namaBab || '',
          };
          break;

        case 'skenario':
          newPage.templateData = {
            skenario: authStore.skenario,
          };
          break;

        case 'hero': {
          const heroModules = authStore.modules.filter((m: Record<string, unknown>) => m.type === 'hero');
          const heroData = heroModules[0] as Record<string, unknown> | undefined;
          newPage.templateData = {
            title: (heroData?.title as string) || meta.judulPertemuan || 'Hero Banner',
            subtitle: (heroData?.subjudul as string) || meta.subjudul || '',
            icon: (heroData?.icon as string) || meta.ikon || '🚀',
            gradient: (heroData?.gradient as string) || 'sunset',
            cta: (heroData?.cta as string) || '',
          };
          break;
        }
      }

      // Auto-fill elements for template (compatible with export)
      populateTemplateElements(newPage);

      get()._pushHistory();
      _set({ pages: [...pages, newPage], currentPageIndex: pages.length, selectedElId: null });
      toast.success(`${labelMap[templateType] || 'Halaman'} ditambahkan`);
    },

    duplicatePage: () => {
      const { pages, currentPageIndex } = get();
      const orig = pages[currentPageIndex];
      const clone: CanvaPage = JSON.parse(JSON.stringify(orig));
      clone.id = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      clone.label = orig.label + ' (Salinan)';
      clone.elements.forEach((el: CanvaElement) => {
        el.id = createElId();
      });
      const newPages = [...pages];
      newPages.splice(currentPageIndex + 1, 0, clone);
      get()._pushHistory();
      _set({ pages: newPages, currentPageIndex: currentPageIndex + 1, selectedElId: null });
      toast.success('Halaman diduplikat');
    },

    deletePage: () => {
      const { pages, currentPageIndex } = get();
      if (pages.length <= 1) { toast.warning('Minimal 1 halaman'); return; }
      get()._pushHistory();
      const newPages = pages.filter((_, i) => i !== currentPageIndex);
      _set({
        pages: newPages,
        currentPageIndex: Math.max(0, currentPageIndex - 1),
        selectedElId: null,
      });
      toast.success('Halaman dihapus');
    },

    setPageLabel: (label: string) => {
      const { pages, currentPageIndex } = get();
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...newPages[currentPageIndex], label };
      _set({ pages: newPages });
    },

    setTemplateType: (templateType: PageTemplateType) => {
      const { pages, currentPageIndex } = get();
      const page = pages[currentPageIndex];
      if (!page) return;
      get()._pushHistory();
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...page, templateType };
      _set({ pages: newPages, selectedElId: null });
    },

    reorderPage: (fromIndex: number, toIndex: number) => {
      const { pages, currentPageIndex } = get();
      if (fromIndex === toIndex) return;
      get()._pushHistory();
      const newPages = [...pages];
      const [moved] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, moved);
      // Adjust currentPageIndex if needed
      let newCurrentIdx = currentPageIndex;
      if (currentPageIndex === fromIndex) newCurrentIdx = toIndex;
      else if (fromIndex < currentPageIndex && toIndex >= currentPageIndex) newCurrentIdx = currentPageIndex - 1;
      else if (fromIndex > currentPageIndex && toIndex <= currentPageIndex) newCurrentIdx = currentPageIndex + 1;
      _set({ pages: newPages, currentPageIndex: newCurrentIdx, selectedElId: null });
    },
  };
}
