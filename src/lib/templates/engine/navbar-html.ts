// ═══════════════════════════════════════════════════════════════
// NAVBAR HTML — Generates the navigation bar HTML snippet
// Used by every screen template (except Cover)
// ═══════════════════════════════════════════════════════════════

import type { NavConfig } from '@/components/canva/types';
import { DEFAULT_NAV_CONFIG } from '@/components/canva/types';

/**
 * Generate the navbar HTML for a screen.
 * The navbar includes: logo/title, SFX toggle, contrast toggle,
 * progress bar, score display, and prev/next buttons.
 */
export function generateNavbarHTML(options: {
  namaBab: string;
  progressPct: number;
  navConfig?: Partial<NavConfig>;
  screenId?: string;
}): string {
  const cfg: NavConfig = { ...DEFAULT_NAV_CONFIG, ...options.navConfig };
  const { namaBab, progressPct } = options;

  if (!cfg.showNavbar) return '';

  const sfxBtn = `<button class="sfx-toggle" onclick="toggleSfx()" style="background:none;border:none;cursor:pointer;font-size:1rem;padding:0 4px" title="Suara on/off">🔊</button>`;
  const contrastBtn = `<button class="contrast-toggle" onclick="toggleContrast()" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 4px" title="Kontras tinggi">🔲</button>`;
  const progBar = cfg.showProgress
    ? `<div class="nav-prog"><div class="nav-prog-fill" style="width:${progressPct}%"></div></div>`
    : '';
  const scoreEl = cfg.showScore
    ? `<span class="nav-score">${cfg.showScore ? '0 ⭐' : ''}</span>`
    : '';
  const prevBtn = cfg.showPrevNext
    ? `<button class="nav-prev" onclick="goPrev()" title="Halaman sebelumnya">←</button>`
    : '';
  const nextBtn = cfg.showPrevNext
    ? `<button class="nav-next" onclick="goNext()" title="Halaman berikutnya">→</button>`
    : '';

  return `<nav class="navbar">
    <span class="nav-logo">${esc(namaBab || 'Media')}</span>
    ${sfxBtn}${contrastBtn}
    ${progBar}
    ${scoreEl}
    ${prevBtn}${nextBtn}
  </nav>`;
}

/**
 * Generate the head section with font imports.
 */
export function generateHeadHTML(title: string, extraCSS?: string): string {
  return `<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap" rel="stylesheet">
${extraCSS ? `<style>${extraCSS}</style>` : ''}
</head>`;
}

/**
 * Generate the skip-to-content link for accessibility.
 */
export function generateSkipLink(): string {
  return `<a href="#main-content" class="skip-link" style="position:absolute;top:-100px;left:0;background:var(--y);color:#0e1c2f;padding:8px 16px;font-weight:800;font-size:.9rem;z-index:9999;transition:top .2s" onfocus="this.style.top='0'" onblur="this.style.top='-100px'">Lompat ke Konten</a>`;
}

/**
 * Generate the confetti wrapper div.
 */
export function generateConfettiWrap(): string {
  return `<div id="confWrap"></div>`;
}

// ── Utility ─────────────────────────────────────────────────

function esc(str: string | number | null | undefined): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
