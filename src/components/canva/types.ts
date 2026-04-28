// ═══════════════════════════════════════════════════════════════
// TYPES — Canva Mode Visual Page Builder
// ═══════════════════════════════════════════════════════════════

export interface Ratio {
  id: string;
  name: string;
  desc: string;
  w: number;
  h: number;
}

export interface ElemType {
  id: string;
  icon: string;
  name: string;
  color: string;
}

export interface CanvaElement {
  id: string;
  type: string;
  icon?: string;
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  hidden?: boolean;
  // Teks-specific
  text?: string;
  fontSize?: number;
  // Shape-specific
  color?: string;
  radius?: number;
  // Data reference (kuis/game/modul)
  dataIdx?: number;
}

export interface CanvaPage {
  id: string;
  label: string;
  bgDataUrl: string | null;
  bgColor: string;
  overlay: number;
  elements: CanvaElement[];
}

export type LeftTab = 'pages' | 'elems' | 'ratio' | 'layers';
export type Tool = 'select' | 'text';
export type ResizeDir = 'tl' | 'tr' | 'bl' | 'br';

// ── Constants ──────────────────────────────────────────────────

export const RATIOS: Ratio[] = [
  { id: '16:9', name: '16:9', desc: 'Landscape PPT', w: 1280, h: 720 },
  { id: '9:16', name: '9:16', desc: 'Portrait HP', w: 720, h: 1280 },
  { id: '1:1', name: '1:1', desc: 'Square Post', w: 800, h: 800 },
  { id: 'A4', name: 'A4', desc: 'Dokumen LKS', w: 794, h: 1123 },
  { id: '4:3', name: '4:3', desc: 'Presentasi Lama', w: 1024, h: 768 },
];

export const ELEM_TYPES: ElemType[] = [
  { id: 'kuis', icon: '❓', name: 'Kuis', color: 'rgba(245,200,66,.4)' },
  { id: 'game', icon: '🎮', name: 'Game', color: 'rgba(56,217,217,.4)' },
  { id: 'materi', icon: '📝', name: 'Materi', color: 'rgba(167,139,250,.4)' },
  { id: 'modul', icon: '🧩', name: 'Modul', color: 'rgba(52,211,153,.4)' },
  { id: 'teks', icon: '🔤', name: 'Teks', color: 'rgba(255,255,255,.3)' },
  { id: 'shape', icon: '⬜', name: 'Shape', color: 'rgba(100,100,200,.3)' },
];

export const LAYER_COLORS: Record<string, string> = {
  kuis: '#f5c842',
  game: '#3ecfcf',
  materi: '#a78bfa',
  modul: '#34d399',
  teks: '#fff',
  shape: '#6366f1',
};
