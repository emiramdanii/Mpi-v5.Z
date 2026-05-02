// ═══════════════════════════════════════════════════════════════
// TUJUAN — TP only display screen template
// A focused page showing only Tujuan Pembelajaran.
// Each TP as a colored card with verb, description, pertemuan badge.
// Visual: staggered fade-in, colored left borders.
// ═══════════════════════════════════════════════════════════════

import type { TujuanSlots } from '../engine/slot-types';

function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateTujuanContent(data: TujuanSlots): string {
  const tpCardsHtml = data.tp
    .map((tp, i) => {
      const num = i + 1;
      const delay = 0.1 + i * 0.08;
      return `
    <div class="tp-item fadein" style="border-left:3px solid ${esc(tp.color)};animation-delay:${delay}s">
      <div class="tp-num" style="background:${esc(tp.color)}22;color:${esc(tp.color)}">${num}</div>
      <div style="flex:1">
        <div class="tp-verb" style="color:${esc(tp.color)}">${esc(tp.verb)}</div>
        <div class="tp-desc">${esc(tp.desc)}</div>
        <span style="font-size:.68rem;font-weight:900;color:${esc(tp.color)};background:${esc(tp.color)}18;padding:2px 10px;border-radius:99px;display:inline-block;margin-top:5px">→ Pertemuan ${tp.pertemuan}</span>
      </div>
    </div>`;
    })
    .join('');

  return `
<div class="main">
  <!-- Header -->
  <span class="chip-sc" style="background:rgba(167,139,250,.15);color:var(--p)">🎯 Tujuan Pembelajaran</span>
  <h2 class="h2 fadein">${esc(data.judul)}<br><span class="hl">${esc(data.subjudul)}</span></h2>

  <!-- TP cards -->
  <div class="tp-list" style="margin-top:14px">
    ${tpCardsHtml}
  </div>

  <!-- Bottom info box -->
  <div style="background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:12px;padding:13px;margin-top:16px;font-size:.82rem;line-height:1.6">
    <strong style="color:var(--g)">💡 Tips:</strong> Pastikan kamu memahami setiap tujuan pembelajaran di atas sebelum melanjutkan ke materi. Setiap tujuan akan menjadi landasan penilaian di akhir pembelajaran.
  </div>
</div>`;
}
