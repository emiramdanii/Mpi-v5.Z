// ═══════════════════════════════════════════════════════════════
// ZUSTAND STORE — Canva Mode State Management
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand';
import {
  type CanvaPage,
  type CanvaElement,
  type LeftTab,
  type Tool,
  type Ratio,
  RATIOS,
  ELEM_TYPES,
} from '@/components/canva/types';

function createPage(label: string): CanvaPage {
  return {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    label,
    bgDataUrl: null,
    bgColor: '#1a1a2e',
    overlay: 20,
    elements: [],
  };
}

function createElId(): string {
  return 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

interface CanvaState {
  // ── Persisted state ──────────────────────────────────────────
  pages: CanvaPage[];
  currentPageIndex: number;
  ratioId: string;

  // ── UI state ─────────────────────────────────────────────────
  zoom: number;
  tool: Tool;
  leftTab: LeftTab;
  selectedElId: string | null;

  // ── Computed helpers ─────────────────────────────────────────
  currentPage: () => CanvaPage | undefined;
  currentRatio: () => Ratio;
  selectedElement: () => CanvaElement | undefined;

  // ── Actions: Page ────────────────────────────────────────────
  goPage: (idx: number) => void;
  addPage: () => void;
  duplicatePage: () => void;
  deletePage: () => void;
  setPageLabel: (label: string) => void;

  // ── Actions: Background ──────────────────────────────────────
  setBgColor: (hex: string) => void;
  setBgImage: (dataUrl: string) => void;
  setOverlay: (val: number) => void;

  // ── Actions: Element ─────────────────────────────────────────
  addElement: (type: string, x?: number, y?: number) => void;
  addKuisElement: (idx: number) => void;
  addGameElement: (idx: number) => void;
  selectElement: (elId: string | null) => void;
  updateElement: (elId: string, props: Partial<CanvaElement>) => void;
  deleteElement: (elId: string) => void;
  deleteSelected: () => void;
  toggleElementVisibility: (elId: string) => void;
  saveTextContent: (elId: string, text: string) => void;

  // ── Actions: Tool & UI ───────────────────────────────────────
  setTool: (tool: Tool) => void;
  setLeftTab: (tab: LeftTab) => void;
  setZoom: (zoom: number) => void;
  zoomDelta: (delta: number) => void;
  setRatio: (ratioId: string) => void;

  // ── Actions: Stage ───────────────────────────────────────────
  clearStage: () => void;

  // ── Export helpers ───────────────────────────────────────────
  exportPageHTML: (pageIdx?: number) => string;
}

export const useCanvaStore = create<CanvaState>((set, get) => ({
  // ── Initial state ────────────────────────────────────────────
  pages: [createPage('Halaman 1')],
  currentPageIndex: 0,
  ratioId: '16:9',
  zoom: 1.0,
  tool: 'select',
  leftTab: 'pages',
  selectedElId: null,

  // ── Computed ─────────────────────────────────────────────────
  currentPage: () => get().pages[get().currentPageIndex],
  currentRatio: () => RATIOS.find(r => r.id === get().ratioId) || RATIOS[0],
  selectedElement: () => {
    const page = get().pages[get().currentPageIndex];
    if (!page) return undefined;
    return page.elements.find(e => e.id === get().selectedElId);
  },

  // ── Page actions ─────────────────────────────────────────────
  goPage: (idx) => {
    const pages = get().pages;
    if (idx < 0 || idx >= pages.length) return;
    set({ currentPageIndex: idx, selectedElId: null });
  },

  addPage: () => {
    const pages = get().pages;
    const newPage = createPage('Halaman ' + (pages.length + 1));
    set({ pages: [...pages, newPage], currentPageIndex: pages.length, selectedElId: null });
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
    set({ pages: newPages, currentPageIndex: currentPageIndex + 1, selectedElId: null });
  },

  deletePage: () => {
    const { pages, currentPageIndex } = get();
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, i) => i !== currentPageIndex);
    set({
      pages: newPages,
      currentPageIndex: Math.max(0, currentPageIndex - 1),
      selectedElId: null,
    });
  },

  setPageLabel: (label) => {
    const { pages, currentPageIndex } = get();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], label };
    set({ pages: newPages });
  },

  // ── Background actions ───────────────────────────────────────
  setBgColor: (hex) => {
    const { pages, currentPageIndex } = get();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], bgColor: hex };
    set({ pages: newPages });
  },

  setBgImage: (dataUrl) => {
    const { pages, currentPageIndex } = get();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], bgDataUrl: dataUrl };
    set({ pages: newPages });
  },

  setOverlay: (val) => {
    const { pages, currentPageIndex } = get();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], overlay: val };
    set({ pages: newPages });
  },

  // ── Element actions ──────────────────────────────────────────
  addElement: (type, x, y) => {
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
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: [...page.elements, el],
    };
    set({ pages: newPages, selectedElId: el.id });
  },

  addKuisElement: (idx) => {
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
    set({ pages: newPages, selectedElId: el.id });
  },

  addGameElement: (idx) => {
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
    set({ pages: newPages, selectedElId: el.id });
  },

  selectElement: (elId) => set({ selectedElId: elId }),

  updateElement: (elId, props) => {
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
    set({ pages: newPages });
  },

  deleteElement: (elId) => {
    const { pages, currentPageIndex, selectedElId } = get();
    const page = pages[currentPageIndex];
    if (!page) return;
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...page,
      elements: page.elements.filter(e => e.id !== elId),
    };
    set({
      pages: newPages,
      selectedElId: selectedElId === elId ? null : selectedElId,
    });
  },

  deleteSelected: () => {
    const { selectedElId, deleteElement } = get();
    if (selectedElId) deleteElement(selectedElId);
  },

  toggleElementVisibility: (elId) => {
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
    set({ pages: newPages });
  },

  saveTextContent: (elId, text) => {
    get().updateElement(elId, { text });
  },

  // ── Tool & UI ────────────────────────────────────────────────
  setTool: (tool) => set({ tool }),
  setLeftTab: (tab) => set({ leftTab: tab }),
  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.25, zoom)) }),
  zoomDelta: (delta) => {
    const current = get().zoom;
    set({ zoom: Math.min(2, Math.max(0.25, current + delta)) });
  },
  setRatio: (ratioId) => set({ ratioId }),

  // ── Stage ────────────────────────────────────────────────────
  clearStage: () => {
    const { pages, currentPageIndex } = get();
    const newPages = [...pages];
    newPages[currentPageIndex] = { ...newPages[currentPageIndex], elements: [] };
    set({ pages: newPages, selectedElId: null });
  },

  // ── Export ───────────────────────────────────────────────────
  exportPageHTML: (pageIdx) => {
    const { pages, ratioId } = get();
    const idx = pageIdx ?? get().currentPageIndex;
    const page = pages[idx];
    if (!page) return '';
    const ratio = RATIOS.find(r => r.id === ratioId) || RATIOS[0];

    const bgStyle = page.bgDataUrl
      ? `background-image:url('${page.bgDataUrl}');background-size:cover;background-position:center`
      : `background:${page.bgColor || '#1a1a2e'}`;

    const elementsHTML = (page.elements || [])
      .filter(el => !el.hidden)
      .map(el => {
        const style = `position:absolute;left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;opacity:${(el.opacity || 100) / 100}`;
        if (el.type === 'teks') {
          return `<div style="${style}"><div style="font-size:${el.fontSize || 20}px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.5);padding:8px;line-height:1.4">${el.text || ''}</div></div>`;
        }
        if (el.type === 'shape') {
          return `<div style="${style}"><div style="width:100%;height:100%;background:${el.color || 'rgba(255,255,255,.15)'};border-radius:${el.radius || 8}px"></div></div>`;
        }
        return `<div style="${style};display:flex;align-items:center;justify-content:center"><div style="font-size:1.5rem">${el.icon || ''}</div></div>`;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${page.label}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0e0c15}
.slide{position:relative;width:${ratio.w}px;height:${ratio.h}px;overflow:hidden;${bgStyle}}</style></head>
<body><div class="slide">${elementsHTML}</div></body></html>`;
  },
}));
