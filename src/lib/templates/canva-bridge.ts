// ═══════════════════════════════════════════════════════════════
// CANVA BRIDGE — Connects auto-build results to the Canva store
// Converts AutoBuildResult → CanvaPage[] for the canvas builder
// ═══════════════════════════════════════════════════════════════

import type { CanvaPage, PageTemplateType, NavConfig } from '@/components/canva/types';
import type { AutoBuildResult } from './auto-build';
import { getDefaultScreenId } from './assembly';
import { DEFAULT_NAV_CONFIG } from '@/components/canva/types';

/**
 * Convert auto-build result into CanvaPage[] for the canva store.
 * Each AssemblyPage becomes a CanvaPage with the template system.
 */
export function autoBuildResultToCanvaPages(result: AutoBuildResult): CanvaPage[] {
  return result.pages.map((page, index) => ({
    id: page.screenId,
    label: page.label,
    bgDataUrl: null,
    bgColor: '#0e1c2f',
    overlay: 0,
    elements: [], // Template pages don't use the element system
    templateType: mapScreenTypeToTemplateType(page.type),
    colorPalette: null,
    navConfig: {
      ...DEFAULT_NAV_CONFIG,
      showNavbar: page.showNavbar !== false,
    } as NavConfig,
    templateData: page.slots,
  }));
}

/**
 * Map the assembly ScreenType to the canva PageTemplateType.
 * Most map directly, some need conversion.
 */
function mapScreenTypeToTemplateType(type: string): PageTemplateType {
  const validTypes: PageTemplateType[] = [
    'cover', 'dokumen', 'tujuan', 'review', 'materi', 'materi-tabicons',
    'materi-accordion', 'diskusi-timer', 'sortir-game', 'roda-game',
    'hubungan-konsep', 'flashcard', 'kuis', 'game', 'skenario',
    'hasil', 'refleksi', 'penutup', 'hero', 'custom', 'html-page',
  ];

  if (validTypes.includes(type as PageTemplateType)) {
    return type as PageTemplateType;
  }

  // Fallback mapping
  const fallbackMap: Record<string, PageTemplateType> = {
    'materi-tabicons': 'materi-tabicons',
    'materi-accordion': 'materi-accordion',
    'diskusi-timer': 'diskusi-timer',
    'sortir-game': 'sortir-game',
    'roda-game': 'roda-game',
    'hubungan-konsep': 'hubungan-konsep',
    'flashcard': 'flashcard',
  };

  return fallbackMap[type] || 'custom';
}
