// ═══════════════════════════════════════════════════════════════
// CANVA STORE — Shared Types, Constants & Helper Functions
// ═══════════════════════════════════════════════════════════════

import {
  type CanvaPage,
  type CanvaElement,
  type LeftTab,
  type Tool,
  type Ratio,
  type PageTemplateType,
  type ColorPalette,
  type NavConfig,
  RATIOS,
  ELEM_TYPES,
  DEFAULT_NAV_CONFIG,
} from '@/components/canva/types';
import type { HtmlPageModule } from '@/lib/html-parser';

// Re-export for convenience
export {
  type CanvaPage,
  type CanvaElement,
  type LeftTab,
  type Tool,
  type Ratio,
  type PageTemplateType,
  type ColorPalette,
  type NavConfig,
  RATIOS,
  ELEM_TYPES,
  DEFAULT_NAV_CONFIG,
};
export type { HtmlPageModule };

// ── Helper functions ─────────────────────────────────────────

export function createPage(label: string, templateType: PageTemplateType = 'custom'): CanvaPage {
  return {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    label,
    bgDataUrl: null,
    bgColor: templateType === 'custom' ? '#1a1a2e' : '#0f172a',
    overlay: 20,
    elements: [],
    templateType,
    colorPalette: null,
    navConfig: { ...DEFAULT_NAV_CONFIG },
    templateData: {},
  };
}

export function createElId(): string {
  return 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

// ── Snapshot type for undo/redo ────────────────────────────────

export type Snapshot = {
  pages: CanvaPage[];
  currentPageIndex: number;
  ratioId: string;
};

// ── Constants ────────────────────────────────────────────────

export const MAX_HISTORY = 50;
export const CANVA_STORAGE_KEY = 'canva_state_v2';

export const GAME_TYPES = ['truefalse', 'memory', 'matching', 'roda', 'sorting', 'spinwheel', 'teambuzzer', 'wordsearch', 'flashcard'];
export const MATERI_MODULE_TYPES = ['materi', 'infografis', 'accordion', 'tab-icons', 'icon-explore', 'timeline', 'hero', 'kutipan', 'langkah', 'statistik', 'comparison', 'card-showcase', 'hotspot-image', 'polling', 'embed', 'video', 'studi-kasus', 'debat', 'flashcard'];

// ── CanvaState interface ─────────────────────────────────────

export interface CanvaState {
  // ── Persisted state ──────────────────────────────────────────
  pages: CanvaPage[];
  currentPageIndex: number;
  ratioId: string;

  // ── UI state ─────────────────────────────────────────────────
  zoom: number;
  tool: Tool;
  leftTab: LeftTab;
  selectedElId: string | null;
  rightPanelOpen: boolean;
  toggleRightPanel: () => void;

  // ── History (undo/redo) ─────────────────────────────────────
  _history: Snapshot[];
  _historyIdx: number;
  _skipHistory: boolean;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  _pushHistory: () => void;

  // ── Computed helpers ─────────────────────────────────────────
  currentPage: () => CanvaPage | undefined;
  currentRatio: () => Ratio;
  selectedElement: () => CanvaElement | undefined;

  // ── Actions: Page ────────────────────────────────────────────
  goPage: (idx: number) => void;
  addPage: () => void;
  addTemplatePage: (templateType: PageTemplateType) => void;
  duplicatePage: () => void;
  deletePage: () => void;
  setPageLabel: (label: string) => void;
  setTemplateType: (templateType: PageTemplateType) => void;
  reorderPage: (fromIndex: number, toIndex: number) => void;

  // ── Actions: Background ──────────────────────────────────────
  setBgColor: (hex: string) => void;
  setBgImage: (dataUrl: string) => void;
  setOverlay: (val: number) => void;

  // ── Actions: Color Palette ───────────────────────────────────
  extractAndSetPalette: (dataUrl: string) => void;
  setPaletteMapping: (key: string, colorIdx: number) => void;

  // ── Actions: Nav Config ──────────────────────────────────────
  updateNavConfig: (updates: Partial<NavConfig>) => void;

  // ── Actions: Template Data ───────────────────────────────────
  updateTemplateData: (key: string, value: unknown) => void;

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
  moveElementZ: (elId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;

  // ── Actions: Tool & UI ───────────────────────────────────────
  setTool: (tool: Tool) => void;
  setLeftTab: (tab: LeftTab) => void;
  setZoom: (zoom: number) => void;
  zoomDelta: (delta: number) => void;
  setRatio: (ratioId: string) => void;
  nudgeSelected: (dx: number, dy: number) => void;

  // ── Actions: Stage ───────────────────────────────────────────
  clearStage: () => void;

  // ── Actions: Auto Rakit ──────────────────────────────────────
  autoRakit: () => void;
  autoRakitFromTemplate: (templateId: string) => Promise<void>;

  // ── Actions: Persistence ─────────────────────────────────────
  saveToStorage: () => void;
  loadFromStorage: () => boolean;

  // ── HTML Import ──────────────────────────────────────────────
  importedHtmlModules: HtmlPageModule[];
  setImportedHtmlModules: (modules: HtmlPageModule[]) => void;
  addHtmlPageModule: (module: HtmlPageModule) => void;

  // ── Built-in Template Loading ────────────────────────────────
  builtinTemplateModules: Record<string, HtmlPageModule[]>;
  setBuiltinTemplateModules: (templateId: string, modules: HtmlPageModule[]) => void;
  addBuiltinTemplatePage: (templateId: string, screenIndex: number) => void;

  // ── Export helpers ───────────────────────────────────────────
  exportPageHTML: (pageIdx?: number) => string;
  exportSlideshowHTML: () => string;
}
