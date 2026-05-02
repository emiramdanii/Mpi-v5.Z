// ═══════════════════════════════════════════════════════════════
// MATERI-TABICONS — Materi with interactive tab-icons module
// Generates a materi page with:
//   1. Blok section (definisi, poin, tabel, kutipan, highlight)
//   2. Tab-icons section: each tab has icon, judul, warna, isi,
//      poin[], refleksi. Uses ftab-row + ftab pattern.
// ═══════════════════════════════════════════════════════════════

import type { MateriTabIconsSlots } from '../engine/slot-types';

function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate HTML for a single blok element based on its tipe.
 */
function renderBlok(blok: MateriTabIconsSlots['blok'][number]): string {
  const warna = blok.warna || 'var(--y)';

  switch (blok.tipe) {
    case 'definisi':
      return `<div class="def-box" style="border-color:${esc(warna)};background:${esc(warna)}0d">
        ${blok.judul ? `<strong style="color:${esc(warna)}">${esc(blok.judul)}</strong><br>` : ''}
        ${esc(blok.isi || '')}
      </div>`;

    case 'poin':
      return `<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:14px;margin:10px 0">
        ${blok.judul ? `<div class="h3" style="margin-bottom:8px">${blok.icon ? `${esc(blok.icon)} ` : ''}${esc(blok.judul)}</div>` : ''}
        ${(blok.butir || []).map((b) => `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:5px;font-size:.84rem;line-height:1.5"><span style="color:${esc(warna)};font-weight:900;flex-shrink:0">•</span><span>${esc(b)}</span></div>`).join('')}
      </div>`;

    case 'tabel': {
      if (!blok.baris || blok.baris.length === 0) return '';
      const headerRow = blok.baris[0];
      const bodyRows = blok.baris.slice(1);
      return `<div style="overflow-x:auto;margin:10px 0">
        <table style="width:100%;border-collapse:collapse;font-size:.82rem">
          <thead>
            <tr>${headerRow.map((h) => `<th style="background:var(--card);border:1px solid var(--border);padding:9px 12px;text-align:left;font-weight:800;color:${esc(warna)}">${esc(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${bodyRows.map((row) => `<tr>${row.map((cell) => `<td style="border:1px solid var(--border);padding:8px 12px;color:var(--text)">${esc(cell)}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    }

    case 'kutipan':
      return `<div style="border-left:4px solid ${esc(warna)};background:${esc(warna)}0a;border-radius:0 12px 12px 0;padding:14px 16px;margin:10px 0;font-style:italic;font-size:.9rem;line-height:1.7">
        "${esc(blok.isi || '')}"
        ${blok.judul ? `<div style="font-style:normal;font-weight:800;font-size:.78rem;color:var(--muted);margin-top:6px">— ${esc(blok.judul)}</div>` : ''}
      </div>`;

    case 'highlight':
      return `<div style="background:${esc(warna)}0d;border:1px solid ${esc(warna)}30;border-radius:12px;padding:14px;margin:10px 0;font-size:.86rem;line-height:1.6">
        ${blok.icon ? `<span style="font-size:1.3rem;margin-right:6px">${esc(blok.icon)}</span>` : ''}
        ${blok.judul ? `<strong style="color:${esc(warna)}">${esc(blok.judul)}</strong> ` : ''}
        ${esc(blok.isi || '')}
      </div>`;

    default:
      // Fallback: generic block
      return `<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:14px;margin:10px 0">
        ${blok.judul ? `<div class="h3" style="margin-bottom:6px">${esc(blok.judul)}</div>` : ''}
        ${blok.isi ? `<div style="font-size:.86rem;line-height:1.6;color:var(--muted)">${esc(blok.isi)}</div>` : ''}
      </div>`;
  }
}

export function generateMateriTabIconsContent(data: MateriTabIconsSlots): string {
  // ── Blok section ────────────────────────────────────────────
  const bloksHtml = data.blok.map((b) => renderBlok(b)).join('\n');

  // ── Tab-icons section ───────────────────────────────────────
  // Build ftab-row buttons
  const ftabBtnsHtml = data.tabs
    .map((tab, i) => {
      const isActive = i === 0;
      return `<div class="ftab${isActive ? ' active' : ''}" onclick="switchFtabMateri(${i})" data-ftab-idx="${i}" style="${isActive ? `background:${esc(tab.warna)};color:#0e1c2f;border-color:transparent` : ''}">${esc(tab.icon)} ${esc(tab.judul)}</div>`;
    })
    .join('\n      ');

  // Build each tab's content panel
  const ftabPanelsHtml = data.tabs
    .map((tab, i) => {
      const isActive = i === 0;
      const poinHtml = (tab.poin || [])
        .map((p) => `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;font-size:.84rem;line-height:1.5"><span style="color:${esc(tab.warna)};font-weight:900;flex-shrink:0">•</span><span>${esc(p)}</span></div>`)
        .join('');

      const refleksiHtml = tab.refleksi
        ? `<div class="refl-item" style="border-color:${esc(tab.warna)}25;background:${esc(tab.warna)}06;margin-top:12px">
            <label style="color:${esc(tab.warna)}">💭 ${esc(tab.refleksi)}</label>
            <textarea placeholder="Tuliskan jawabanmu di sini…"></textarea>
          </div>`
        : '';

      return `<div class="ftab-panel-materi" data-ftab-panel="${i}" style="${isActive ? '' : 'display:none'}">
        <div style="background:${esc(tab.warna)}06;border:1px solid ${esc(tab.warna)}20;border-radius:14px;padding:16px;animation:fadeIn .3s ease">
          ${tab.isi ? `<div style="font-size:.88rem;line-height:1.7;margin-bottom:12px">${esc(tab.isi)}</div>` : ''}
          ${poinHtml ? `<div style="margin-top:8px">${poinHtml}</div>` : ''}
        </div>
        ${refleksiHtml}
      </div>`;
    })
    .join('\n');

  // ── Inline script for tab switching ─────────────────────────
  const switchScript = `
<script>
function switchFtabMateri(idx) {
  var row = document.querySelector('[data-ftab-row="materi"]');
  if (!row) return;
  row.querySelectorAll('.ftab').forEach(function(btn) {
    btn.classList.remove('active');
    btn.style.background = 'rgba(255,255,255,.04)';
    btn.style.color = 'var(--muted)';
    btn.style.borderColor = 'var(--border)';
  });
  var clicked = row.querySelector('[data-ftab-idx="' + idx + '"]');
  if (clicked) {
    clicked.classList.add('active');
    var panelColor = clicked.getAttribute('data-tab-color') || 'var(--y)';
    clicked.style.background = panelColor;
    clicked.style.color = '#0e1c2f';
    clicked.style.borderColor = 'transparent';
    clicked.classList.add('read');
  }
  document.querySelectorAll('.ftab-panel-materi').forEach(function(panel) {
    panel.style.display = 'none';
  });
  var target = document.querySelector('[data-ftab-panel="' + idx + '"]');
  if (target) target.style.display = 'block';
}
</script>`;

  // Add data-tab-color to each ftab button for JS to read
  const ftabBtnsWithColor = data.tabs
    .map((tab, i) => {
      const isActive = i === 0;
      return `<div class="ftab${isActive ? ' active' : ''}" onclick="switchFtabMateri(${i})" data-ftab-idx="${i}" data-tab-color="${esc(tab.warna)}" style="${isActive ? `background:${esc(tab.warna)};color:#0e1c2f;border-color:transparent` : ''}">${esc(tab.icon)} ${esc(tab.judul)}</div>`;
    })
    .join('\n      ');

  // ── Assemble full content ───────────────────────────────────
  return `
<div class="main">
  <!-- Header -->
  <span class="chip-sc" style="background:rgba(249,193,46,.15);color:var(--y)">📖 Materi Pembelajaran</span>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;margin-top:8px">
    <div style="width:50px;height:50px;border-radius:13px;background:rgba(249,193,46,.15);display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0">📖</div>
    <div>
      <h2 class="h2">${esc(data.judul)}<br><span class="hl">${esc(data.subjudul)}</span></h2>
    </div>
  </div>

  <!-- Blok section -->
  ${bloksHtml}

  <!-- Tab-icons section -->
  ${data.tabs.length > 0 ? `
  <div class="card" style="margin-top:16px">
    <div class="h2" style="margin-bottom:4px">🔍 <span class="hl">Jelajahi</span> Lebih Dalam</div>
    <p class="sub" style="margin-bottom:4px">Klik setiap tab untuk menjelajahi materi secara interaktif.</p>

    <!-- Tab row -->
    <div class="ftab-row" data-ftab-row="materi">
      ${ftabBtnsWithColor}
    </div>

    <!-- Tab content panels -->
    ${ftabPanelsHtml}
  </div>` : ''}

  <!-- Bottom action buttons -->
  <div class="btn-row btn-center mt20">
    <button class="btn btn-y" onclick="goScreen('s-kuis')">Mulai Kuis ❓</button>
    <button class="btn btn-ghost" onclick="goScreen('s-cp')">← Kembali</button>
  </div>
</div>

${data.tabs.length > 0 ? switchScript : ''}`;
}
