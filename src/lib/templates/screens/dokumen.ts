// ═══════════════════════════════════════════════════════════════
// DOKUMEN — CP/TP/ATP combined tab view screen template
// Generates inner HTML for a CP/TP/ATP screen with 3 tabs:
//   Tab 1 (Capaian): elemen, subElemen, capaianFase definition box,
//                     profil chips, alur timeline
//   Tab 2 (Tujuan):  TP items with colored verb badges
//   Tab 3 (ATP):     pertemuan cards with judul, tp, kegiatan, penilaian
// Includes "Mulai Pembelajaran →" button at bottom.
// ═══════════════════════════════════════════════════════════════

import type { DokumenSlots } from '../engine/slot-types';

function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateDokumenContent(data: DokumenSlots): string {
  // ── Tab 1: Capaian ──────────────────────────────────────────
  const profilChipsHtml = data.cp.profil
    .map((p) => `<span style="color:var(--muted)">${esc(p)}</span>`)
    .join(' · ');

  const alurStepsHtml = data.alur
    .map((step, i) => {
      const colors = ['var(--p)', 'var(--c)', 'var(--y)', 'var(--o)', 'var(--g)', 'var(--r)'];
      const c = colors[i % colors.length];
      return `<div class="alur-step">
        <span class="alur-jp" style="background:${c}22;color:${c}">${esc(step.fase)}</span>
        <span class="alur-dur" style="color:${c}">${esc(step.durasi)}</span>
        <div class="alur-txt"><strong>${esc(step.judul)}</strong> — ${esc(step.deskripsi)}</div>
      </div>`;
    })
    .join('');

  const capaianTabHtml = `
    <div style="font-size:.8rem;color:var(--muted);line-height:1.7;margin-bottom:10px">
      <strong style="color:var(--text)">Elemen:</strong> ${esc(data.cp.elemen)} ·
      <strong style="color:var(--text)">Sub-Elemen:</strong> ${esc(data.cp.subElemen)}
    </div>
    <div class="def-box">${esc(data.cp.capaianFase)}</div>
    <div style="background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:12px;padding:12px;font-size:.82rem;line-height:1.6">
      <strong style="color:var(--g)">🔗 Profil Pelajar Pancasila:</strong><br>
      ${profilChipsHtml}
    </div>
    ${data.alur.length > 0 ? `
    <div style="margin-top:14px">
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">🗓️ Alur Pembelajaran</div>
      <div class="alur-steps">${alurStepsHtml}</div>
    </div>` : ''}
  `;

  // ── Tab 2: Tujuan Pembelajaran ──────────────────────────────
  const tpItemsHtml = data.tp
    .map((tp, i) => {
      const num = i + 1;
      return `<div class="tp-full-item" style="border-color:${esc(tp.color)}44;background:${esc(tp.color)}0a">
        <div class="tp-full-num" style="background:${esc(tp.color)}22;color:${esc(tp.color)}">${num}</div>
        <div>
          <div class="tp-full-verb" style="color:${esc(tp.color)}">${esc(tp.verb)}</div>
          <div class="tp-full-desc">${esc(tp.desc)}</div>
          <span style="font-size:.68rem;font-weight:900;color:${esc(tp.color)};background:${esc(tp.color)}18;padding:1px 8px;border-radius:99px;display:inline-block;margin-top:4px">→ Pertemuan ${tp.pertemuan}</span>
        </div>
      </div>`;
    })
    .join('');

  const tujuanTabHtml = tpItemsHtml;

  // ── Tab 3: ATP ──────────────────────────────────────────────
  const atpCardsHtml = data.atp.pertemuan
    .map((p, i) => {
      const isFirst = i === 0;
      return `<div class="atp-p-card${isFirst ? ' active-p' : ''}">
        <div class="atp-p-head">
          <span class="atp-p-badge" style="background:rgba(245,200,66,.2);color:#f5c842">📍 Pertemuan ${i + 1}</span>
          <span style="font-size:.72rem;color:#5a7499">${esc(p.durasi)}</span>
          ${isFirst ? '<span style="margin-left:auto;font-size:.72rem;font-weight:800;color:#34d399">✅ Sekarang</span>' : ''}
        </div>
        <div class="atp-p-title">${esc(p.judul)}</div>
        <div class="atp-p-tp">📚 ${esc(p.tp)}</div>
        <div class="atp-p-kegiatan">${esc(p.kegiatan)}</div>
        <span class="atp-p-penilaian">📋 ${esc(p.penilaian)}</span>
      </div>`;
    })
    .join('');

  const atpTabHtml = `
    <div class="atp-pertemuan-grid">${atpCardsHtml}</div>
  `;

  // ── Assemble the full content ───────────────────────────────
  return `
<div class="main">
  <!-- Document header card with tabs -->
  <div class="card">
    <div class="h2">📋 <span class="hl">Dokumen</span> Pembelajaran</div>
    <div class="ktab-row">
      <div class="ktab active" onclick="switchKtab('kcp',this)">Capaian</div>
      <div class="ktab" onclick="switchKtab('ktp',this)">Tujuan Pembelajaran</div>
      <div class="ktab" onclick="switchKtab('katp',this)">ATP</div>
    </div>

    <!-- Tab 1: Capaian -->
    <div class="ktab-content active" id="kcp">
      ${capaianTabHtml}
    </div>

    <!-- Tab 2: Tujuan Pembelajaran -->
    <div class="ktab-content" id="ktp">
      ${tujuanTabHtml}
    </div>

    <!-- Tab 3: ATP -->
    <div class="ktab-content" id="katp">
      ${atpTabHtml}
    </div>
  </div>

  <!-- Bottom action buttons -->
  <div class="btn-row btn-center">
    <button class="btn btn-y" onclick="goScreen('s-materi')">Mulai Pembelajaran →</button>
    <button class="btn btn-ghost" onclick="goScreen('s-cover')">← Kembali</button>
  </div>
</div>`;
}
