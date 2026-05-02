// ═══════════════════════════════════════════════════════════════
// PENUTUP SCREEN — Closing / wrap-up page
// Generates inner content HTML (no wrapper/navbar)
// ═══════════════════════════════════════════════════════════════

import type { PenutupSlots } from '../engine/slot-types';

// ── HTML entity escape helper ──────────────────────────────────
function esc(str: string | number | null | undefined): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate closing page content.
 * Features: header, key takeaways, next steps, closing quote,
 * warm gradient background, action buttons.
 */
export function generatePenutupContent(data: PenutupSlots): string {
  const summary = data.summary || [];
  const nextSteps = data.nextSteps || [];

  // Color cycle for summary bullets
  const bulletColors = ['var(--y)', 'var(--c)', 'var(--g)', 'var(--p)', 'var(--o)', 'var(--r)'];
  // Color cycle for next step cards
  const stepColors = ['var(--c)', 'var(--g)', 'var(--y)', 'var(--p)', 'var(--o)'];

  return `
<style>
.pt-wrap{display:flex;flex-direction:column;align-items:center;padding:24px 16px;max-width:600px;margin:0 auto;
  background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(249,193,46,.1),transparent 60%),
             radial-gradient(ellipse 60% 40% at 80% 100%,rgba(52,211,153,.06),transparent 50%)}
.pt-header{text-align:center;margin-bottom:22px}
.pt-header-icon{font-size:3rem;margin-bottom:6px;animation:float 3s ease-in-out infinite;filter:drop-shadow(0 4px 16px rgba(249,193,46,.4))}
.pt-header-sub{color:var(--muted);font-size:.82rem;line-height:1.5;margin-top:4px;max-width:380px;margin-left:auto;margin-right:auto}

/* Summary section */
.pt-section{width:100%;margin-bottom:18px}
.pt-section-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.pt-bullet{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-radius:10px;background:var(--card);border:1px solid var(--border);margin-bottom:8px;transition:all .2s}
.pt-bullet:hover{border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.05)}
.pt-bullet-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:6px}
.pt-bullet-text{font-size:.86rem;font-weight:600;line-height:1.5;color:var(--text)}

/* Next steps */
.pt-steps{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
.pt-step{padding:14px 12px;border-radius:12px;background:var(--card);border:1px solid var(--border);text-align:center;transition:all .2s;cursor:default}
.pt-step:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.2)}
.pt-step-icon{font-size:1.6rem;margin-bottom:6px}
.pt-step-label{font-size:.78rem;font-weight:700;line-height:1.4;color:var(--text)}

/* Closing quote */
.pt-quote{margin:20px 0;padding:20px 24px;background:linear-gradient(135deg,rgba(249,193,46,.07),rgba(167,139,250,.05));border-left:4px solid var(--y);border-radius:0 14px 14px 0;width:100%;position:relative}
.pt-quote-icon{font-size:1.4rem;position:absolute;top:12px;left:14px;opacity:.3}
.pt-quote-text{font-size:.92rem;font-weight:600;font-style:italic;line-height:1.65;color:var(--text);padding-left:24px}

/* Action buttons */
.pt-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px;margin-bottom:16px}

/* Sparkle particles */
.pt-sparkle{position:absolute;width:4px;height:4px;border-radius:50%;animation:float 3s ease-in-out infinite;pointer-events:none;opacity:.4}
</style>

<div class="pt-wrap fadein" style="position:relative">
  <!-- Decorative sparkles -->
  <div class="pt-sparkle" style="top:8%;left:12%;background:var(--y);animation-delay:0s"></div>
  <div class="pt-sparkle" style="top:20%;right:8%;background:var(--c);animation-delay:.8s;width:5px;height:5px"></div>
  <div class="pt-sparkle" style="bottom:30%;left:6%;background:var(--g);animation-delay:1.6s"></div>
  <div class="pt-sparkle" style="top:50%;right:4%;background:var(--p);animation-delay:2.2s;width:3px;height:3px"></div>

  <!-- Header -->
  <div class="pt-header">
    <div class="pt-header-icon">🎉</div>
    <h2 class="h2"><span class="hl">${esc(data.judul || 'Pembelajaran Selesai')}</span></h2>
    ${data.subjudul ? `<p class="pt-header-sub">${esc(data.subjudul)}</p>` : '<p class="pt-header-sub">Terima kasih sudah belajar hari ini! Kamu luar biasa! 🌟</p>'}
  </div>

  <!-- Summary section -->
  ${summary.length > 0 ? `
  <div class="pt-section">
    <div class="pt-section-title">📝 Ringkasan Pembelajaran</div>
    ${summary.map((item, i) => `
    <div class="pt-bullet fadein" style="animation-delay:${i * .06}s">
      <div class="pt-bullet-dot" style="background:${bulletColors[i % bulletColors.length]}"></div>
      <div class="pt-bullet-text">${esc(item)}</div>
    </div>`).join('')}
  </div>` : ''}

  <!-- Next steps -->
  ${nextSteps.length > 0 ? `
  <div class="pt-section">
    <div class="pt-section-title">🚀 Langkah Selanjutnya</div>
    <div class="pt-steps">
      ${nextSteps.map((step, i) => `
      <div class="pt-step fadein" style="animation-delay:${(summary.length + i) * .06}s;border-bottom:3px solid ${stepColors[i % stepColors.length]}">
        <div class="pt-step-icon">${step.icon || '📌'}</div>
        <div class="pt-step-label">${esc(step.label)}</div>
      </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- Closing quote -->
  ${data.closingQuote ? `
  <div class="pt-quote fadein" style="animation-delay:${(summary.length + nextSteps.length) * .06 + .1}s">
    <div class="pt-quote-icon">💬</div>
    <div class="pt-quote-text">${esc(data.closingQuote)}</div>
  </div>` : `
  <div class="pt-quote fadein" style="animation-delay:${(summary.length + nextSteps.length) * .06 + .1}s">
    <div class="pt-quote-icon">💬</div>
    <div class="pt-quote-text">Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia. — Nelson Mandela</div>
  </div>`}

  <!-- Action buttons -->
  <div class="pt-actions fadein" style="animation-delay:${(summary.length + nextSteps.length) * .06 + .2}s">
    <button class="btn btn-g" onclick="launchConfetti();goScreen('s-cover')">🏠 Kembali ke Awal</button>
    <button class="btn btn-y" onclick="goScreen('s-cover')">🔄 Ulangi Materi</button>
  </div>
</div>`;
}
