// ═══════════════════════════════════════════════════════════════
// REVIEW — Review/recap page screen template
// Shows key points as visually rich cards for summarizing
// before kuis. Each item has icon, judul, isi, warna.
// ═══════════════════════════════════════════════════════════════

import type { ReviewSlots } from '../engine/slot-types';

function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateReviewContent(data: ReviewSlots): string {
  const reviewCardsHtml = data.items
    .map((item, i) => {
      const delay = 0.05 + i * 0.07;
      return `
    <div class="nc fadein" style="background:${esc(item.warna)}06;border-color:${esc(item.warna)}25;animation-delay:${delay}s">
      <div class="nc-head">
        <div class="nc-icon">${esc(item.icon)}</div>
        <div class="nc-title" style="color:${esc(item.warna)}">${esc(item.judul)}</div>
      </div>
      <div class="nc-body">${esc(item.isi)}</div>
    </div>`;
    })
    .join('');

  // Use grid for 2-column layout on wider screens
  const itemsCount = data.items.length;

  return `
<div class="main">
  <!-- Header -->
  <span class="chip-sc" style="background:rgba(249,193,46,.15);color:var(--y)">📝 Ringkasan</span>
  <h2 class="h2 fadein">${esc(data.judul)}<br><span class="hl">${esc(data.subjudul)}</span></h2>
  <p class="sub mt8 fadein" style="animation-delay:.1s">Pahami poin-poin penting berikut sebelum melanjutkan ke kuis!</p>

  <!-- Review cards grid -->
  <div class="nc-grid" style="grid-template-columns:${itemsCount <= 2 ? '1fr' : 'repeat(2,1fr)'};margin-top:16px">
    ${reviewCardsHtml}
  </div>

  <!-- Motivational box -->
  <div style="background:rgba(249,193,46,.07);border:1px solid rgba(249,193,46,.2);border-radius:12px;padding:14px;margin-top:16px;font-size:.84rem;line-height:1.6">
    💪 <strong style="color:var(--y)">Siap?</strong> Setelah memahami ringkasan di atas, kamu siap menghadapi tantangan berikutnya. Semangat!
  </div>
</div>`;
}
