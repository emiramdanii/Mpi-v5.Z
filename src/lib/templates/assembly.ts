// ═══════════════════════════════════════════════════════════════
// ASSEMBLY — Combines base engine + per-page templates into
// a complete standalone HTML file for export or preview.
//
// This is the core of Phase 4: Export = merge base CSS + per-page
// templates + JS engine → 1 HTML file.
// ═══════════════════════════════════════════════════════════════

import type { NavConfig } from '@/components/canva/types';
import type { SfxTheme } from '@/store/authoring/types';
import { generateBaseCSS, generateNavbarCSS, type CssVars } from './engine/base-css';
import { generateBaseJS } from './engine/base-js';
import { generateNavbarHTML, generateHeadHTML, generateSkipLink, generateConfettiWrap } from './engine/navbar-html';

// ── Screen template imports ──────────────────────────────────
import { generateCoverContent } from './screens/cover';
import type { CoverSlots } from './engine/slot-types';
import { generateDokumenContent } from './screens/dokumen';
import type { DokumenSlots } from './engine/slot-types';
import { generateTujuanContent } from './screens/tujuan';
import type { TujuanSlots } from './engine/slot-types';
import { generateReviewContent } from './screens/review';
import type { ReviewSlots } from './engine/slot-types';
import { generateMateriTabIconsContent } from './screens/materi-tabicons';
import type { MateriTabIconsSlots } from './engine/slot-types';
import { generateMateriAccordionContent } from './screens/materi-accordion';
import type { MateriAccordionSlots } from './engine/slot-types';
import { generateDiskusiTimerContent } from './screens/diskusi-timer';
import type { DiskusiTimerSlots } from './engine/slot-types';
import { generateSortirGameContent } from './screens/sortir-game';
import type { SortirGameSlots } from './engine/slot-types';
import { generateRodaGameContent } from './screens/roda-game';
import type { RodaGameSlots } from './engine/slot-types';
import { generateHubunganKonsepContent } from './screens/hubungan-konsep';
import type { HubunganKonsepSlots } from './engine/slot-types';
import { generateFlashcardContent } from './screens/flashcard';
import type { FlashcardSlots } from './engine/slot-types';
import { generateHasilContent } from './screens/hasil';
import type { HasilSlots } from './engine/slot-types';
import { generateRefleksiContent } from './screens/refleksi';
import type { RefleksiSlots } from './engine/slot-types';
import { generatePenutupContent } from './screens/penutup';
import type { PenutupSlots } from './engine/slot-types';
import { generateSkenarioContent } from './screens/skenario';
import type { SkenarioSlots } from './engine/slot-types';
import { generateKuisContent } from './screens/kuis';
import type { KuisSlots } from './engine/slot-types';
import { generateGameContent } from './screens/game';
import type { GameSlots } from './engine/slot-types';

// ── Page definition ──────────────────────────────────────────

export type ScreenType =
  | 'cover'
  | 'dokumen'
  | 'tujuan'
  | 'review'
  | 'materi-tabicons'
  | 'materi-accordion'
  | 'diskusi-timer'
  | 'sortir-game'
  | 'roda-game'
  | 'hubungan-konsep'
  | 'flashcard'
  | 'hasil'
  | 'refleksi'
  | 'penutup'
  | 'skenario'
  | 'kuis'
  | 'game'
  | 'hero';

export interface AssemblyPage {
  /** Unique screen ID (e.g., "s-cover", "s-materi1") */
  screenId: string;
  /** Screen template type */
  type: ScreenType;
  /** Display label */
  label: string;
  /** Slot data for this template */
  slots: Record<string, unknown>;
  /** Navigation config override (optional) */
  navConfig?: Partial<NavConfig>;
  /** Whether to show navbar on this page (default: true for non-cover) */
  showNavbar?: boolean;
  /** Progress percentage override */
  progressPct?: number;
}

export interface AssemblyOptions {
  /** Document title */
  title: string;
  /** CSS variable overrides */
  cssVars?: CssVars;
  /** SFX theme */
  sfxTheme?: SfxTheme;
  /** SFX volume (0-1) */
  sfxVolume?: number;
  /** Default navbar config */
  navConfig?: Partial<NavConfig>;
  /** namaBab for navbar display */
  namaBab?: string;
  /** Enable scoring */
  enableScoring?: boolean;
  /** Enable confetti */
  enableConfetti?: boolean;
}

// ── Screen ID generator ─────────────────────────────────────

const SCREEN_ID_MAP: Record<ScreenType, string> = {
  'cover': 's-cover',
  'dokumen': 's-cp',
  'tujuan': 's-tujuan',
  'review': 's-review',
  'materi-tabicons': 's-materi',
  'materi-accordion': 's-materi2',
  'diskusi-timer': 's-diskusi',
  'sortir-game': 's-sortir',
  'roda-game': 's-roda',
  'hubungan-konsep': 's-konsep',
  'flashcard': 's-flashcard',
  'hasil': 's-hasil',
  'refleksi': 's-refleksi',
  'penutup': 's-penutup',
  'skenario': 's-sk',
  'kuis': 's-kuis',
  'game': 's-game',
  'hero': 's-hero',
};

/**
 * Get the default screen ID for a template type.
 */
export function getDefaultScreenId(type: ScreenType, index: number = 0): string {
  if (index === 0) return SCREEN_ID_MAP[type] || `s-${type}`;
  return `${SCREEN_ID_MAP[type] || `s-${type}`}${index + 1}`;
}

// ── Content generator dispatcher ─────────────────────────────

function generateScreenContent(type: ScreenType, slots: Record<string, unknown>): string {
  switch (type) {
    case 'cover':
      return generateCoverContent(slots as CoverSlots);
    case 'dokumen':
      return generateDokumenContent(slots as DokumenSlots);
    case 'tujuan':
      return generateTujuanContent(slots as TujuanSlots);
    case 'review':
      return generateReviewContent(slots as ReviewSlots);
    case 'materi-tabicons':
      return generateMateriTabIconsContent(slots as MateriTabIconsSlots);
    case 'materi-accordion':
      return generateMateriAccordionContent(slots as MateriAccordionSlots);
    case 'diskusi-timer':
      return generateDiskusiTimerContent(slots as DiskusiTimerSlots);
    case 'sortir-game':
      return generateSortirGameContent(slots as SortirGameSlots);
    case 'roda-game':
      return generateRodaGameContent(slots as RodaGameSlots);
    case 'hubungan-konsep':
      return generateHubunganKonsepContent(slots as HubunganKonsepSlots);
    case 'flashcard':
      return generateFlashcardContent(slots as FlashcardSlots);
    case 'hasil':
      return generateHasilContent(slots as HasilSlots);
    case 'refleksi':
      return generateRefleksiContent(slots as RefleksiSlots);
    case 'penutup':
      return generatePenutupContent(slots as PenutupSlots);
    case 'skenario':
      return generateSkenarioContent(slots as SkenarioSlots);
    case 'kuis':
      return generateKuisContent(slots as KuisSlots);
    case 'game':
      return generateGameContent(slots as GameSlots);
    default:
      return `<div class="main" style="text-align:center;padding:40px"><div style="font-size:2rem;margin-bottom:8px">📄</div>Template "${type}" belum tersedia</div>`;
  }
}

// ── Main assembly function ───────────────────────────────────

/**
 * Assemble a complete standalone HTML file from a list of pages.
 *
 * This is the core of the template system:
 * 1. Takes a list of AssemblyPage definitions (type + slot data)
 * 2. Generates the base CSS + navbar CSS
 * 3. Generates each screen's content from its template
 * 4. Wraps each in a screen div with navbar (if applicable)
 * 5. Generates the base JS (navigation, scoring, SFX, confetti)
 * 6. Combines everything into a single HTML file
 *
 * The output is a COMPLETE standalone HTML file that can be:
 * - Opened directly in a browser
 * - Used as a student-facing learning media
 * - Embedded in an iframe for preview
 */
export function assembleHtml(pages: AssemblyPage[], options: AssemblyOptions): string {
  const {
    title,
    cssVars,
    sfxTheme = 'default',
    sfxVolume = 0.6,
    navConfig = {},
    namaBab = 'Media Pembelajaran',
    enableScoring = true,
    enableConfetti = true,
  } = options;

  // Build screen order list
  const activeScreens = pages.map(p => p.screenId);

  // Generate CSS
  const baseCSS = generateBaseCSS(cssVars);
  const navbarCSS = generateNavbarCSS({ showNavbar: true, showPrevNext: true, showScore: true, showProgress: true, navbarStyle: 'colorful', navbarPosition: 'top', navButtonStyle: 'pill', ...navConfig });

  // Generate each screen's HTML
  const screenHTMLs = pages.map((page, idx) => {
    const isActive = idx === 0;
    const showNav = page.showNavbar !== undefined ? page.showNavbar : page.type !== 'cover';
    const progress = page.progressPct !== undefined
      ? page.progressPct
      : Math.round(((idx + 1) / pages.length) * 100);

    const content = generateScreenContent(page.type, page.slots);
    const navbar = showNav ? generateNavbarHTML({
      namaBab,
      progressPct: progress,
      navConfig: { ...navConfig, ...page.navConfig },
      screenId: page.screenId,
    }) : '';

    return `<!-- ═══ ${page.label} (${page.type}) ═══ -->
<div class="screen${isActive ? ' active' : ''}" id="${page.screenId}">
  ${navbar}
  ${content}
</div>`;
  });

  // Generate JS
  const baseJS = generateBaseJS({
    activeScreens,
    sfxTheme,
    sfxVolume,
    enableScoring,
    enableConfetti,
  });

  // Assemble the complete HTML
  return `<!DOCTYPE html>
<html lang="id">
${generateHeadHTML(title)}
<body>
${generateConfettiWrap()}
${generateSkipLink()}
${screenHTMLs.join('\n\n')}
<script>
${baseJS}
</script>
</body>
</html>`;
}

/**
 * Assemble a single page for iframe preview (no navigation, no full document).
 * Returns a standalone HTML for just one screen.
 */
export function assembleSinglePage(
  page: AssemblyPage,
  options: AssemblyOptions,
): string {
  const { cssVars, sfxTheme = 'default', sfxVolume = 0.6, namaBab = 'Media', enableScoring = true, enableConfetti = true } = options;

  const baseCSS = generateBaseCSS(cssVars);
  const content = generateScreenContent(page.type, page.slots);

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${page.label}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap" rel="stylesheet">
<style>${baseCSS}
html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: auto; }
.screen { min-height: 100vh !important; display: flex !important; flex-direction: column; }
</style>
</head>
<body>
<div class="screen active" id="${page.screenId}">
  ${content}
</div>
<script>
${generateBaseJS({ activeScreens: [page.screenId], sfxTheme, sfxVolume, enableScoring, enableConfetti })}
</script>
</body>
</html>`;
}
