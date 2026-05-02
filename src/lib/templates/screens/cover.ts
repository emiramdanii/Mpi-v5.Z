// ═══════════════════════════════════════════════════════════════
// COVER — Cover page screen template
// Generates the inner HTML for a Cover screen with floating icon,
// title, subtitle, info chips, TP count badge, and start button.
// Background: radial gradient with animated orbs.
// ═══════════════════════════════════════════════════════════════

import type { CoverSlots } from '../engine/slot-types';

function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateCoverContent(data: CoverSlots): string {
  const bgGradient = data.bgGradient || 'radial-gradient(ellipse 90% 60% at 50% 0%,rgba(249,193,46,.18),transparent 60%),linear-gradient(180deg,#0e1c2f,#09121f)';

  // Build chip HTML from data.chips
  const chipsHtml = data.chips
    .map((c) => {
      const iconHtml = c.icon ? `${esc(c.icon)} ` : '';
      return `<span class="chip" style="background:${esc(c.color)}22;color:${esc(c.color)}">${iconHtml}${esc(c.label)}</span>`;
    })
    .join('\n      ');

  // Build info chips for mapel, kelas, durasi
  const infoChips: string[] = [];
  if (data.mapel) infoChips.push(`<span class="chip" style="background:rgba(249,193,46,.15);color:var(--y)">📚 ${esc(data.mapel)}</span>`);
  if (data.kelas) infoChips.push(`<span class="chip" style="background:rgba(62,207,207,.15);color:var(--c)">🎓 ${esc(data.kelas)}</span>`);
  if (data.durasi) infoChips.push(`<span class="chip" style="background:rgba(52,211,153,.15);color:var(--g)">⏱️ ${esc(data.durasi)}</span>`);
  if (data.kurikulum) infoChips.push(`<span class="chip" style="background:rgba(167,139,250,.15);color:var(--p)">📖 ${esc(data.kurikulum)}</span>`);

  return `
<div style="background:${esc(bgGradient)};flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:36px 18px;position:relative;overflow:hidden">

  <!-- Animated background orbs -->
  <div style="position:absolute;top:-40px;left:-30px;width:180px;height:180px;border-radius:50%;background:rgba(249,193,46,.06);filter:blur(60px);animation:float 6s ease-in-out infinite;pointer-events:none"></div>
  <div style="position:absolute;bottom:10%;right:-20px;width:140px;height:140px;border-radius:50%;background:rgba(62,207,207,.06);filter:blur(50px);animation:float 8s ease-in-out infinite 1s;pointer-events:none"></div>
  <div style="position:absolute;top:35%;left:60%;width:100px;height:100px;border-radius:50%;background:rgba(167,139,250,.05);filter:blur(40px);animation:float 7s ease-in-out infinite 2s;pointer-events:none"></div>

  <!-- Floating icon -->
  <div class="cover-icon fadein" style="font-size:4.5rem;animation:float 3s ease-in-out infinite">${esc(data.icon || '📜')}</div>

  <!-- Info line -->
  <div class="fadein" style="color:var(--c);font-weight:800;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;margin-top:10px;animation-delay:.1s">
    ${esc(data.fase ? `${data.fase} · ` : '')}${esc(data.elemen || '')}
  </div>

  <!-- Title -->
  <div class="cover-title fadein" style="font-family:'Fredoka One',cursive;font-size:clamp(1.7rem,5.5vw,2.8rem);line-height:1.1;margin:10px 0 6px;animation-delay:.2s">
    ${esc(data.title)}
  </div>

  <!-- Subtitle -->
  <p class="sub fadein" style="max-width:480px;margin:0 auto 20px;animation-delay:.3s">${esc(data.subtitle)}</p>

  <!-- Chips -->
  <div class="cover-chips fadein" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;animation-delay:.4s">
    ${infoChips.join('\n    ')}
  </div>

  <!-- Feature chips from data -->
  ${data.chips.length > 0 ? `
  <div class="cover-chips fadein" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:24px;animation-delay:.5s">
    ${chipsHtml}
  </div>` : ''}

  <!-- Start button -->
  <button class="btn btn-y glow fadein" onclick="goScreen('s-cp')" style="animation-delay:.6s">
    ▶ Mulai Belajar
  </button>
</div>`;
}
