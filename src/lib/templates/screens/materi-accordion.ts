// ═══════════════════════════════════════════════════════════════
// MATERI-ACCORDION — Materi page with accordion expand/collapse
// Renders blok section + interactive accordion items
// ═══════════════════════════════════════════════════════════════

import type { MateriAccordionSlots } from '../engine/slot-types';

export function generateMateriAccordionContent(data: MateriAccordionSlots): string {
  // ── Local HTML entity escaper ──
  function esc(str: string | number | null | undefined): string {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Blok renderer (shared pattern with materi-tabicons) ──
  function renderBlok(b: {
    tipe: string;
    judul?: string;
    isi?: string;
    icon?: string;
    warna?: string;
    butir?: string[];
    baris?: string[][];
  }): string {
    switch (b.tipe) {
      case 'definisi':
        return `<div class="def-box fadein">
          ${b.judul ? `<strong class="hl">${esc(b.judul)}</strong><br>` : ''}
          ${b.isi ? `<span>${esc(b.isi)}</span>` : ''}
        </div>`;

      case 'poin':
        return `<div class="card fadein">
          ${b.judul ? `<div class="h3" style="margin-bottom:10px">${b.icon ? esc(b.icon) + ' ' : ''}${esc(b.judul)}</div>` : ''}
          ${b.butir && b.butir.length ? `<ul style="padding-left:20px;line-height:1.9;font-size:.9rem">${b.butir.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
        </div>`;

      case 'tabel':
        if (!b.baris || b.baris.length === 0) return '';
        const headerRow = b.baris[0];
        const bodyRows = b.baris.slice(1);
        return `<div class="card fadein" style="overflow-x:auto">
          ${b.judul ? `<div class="h3" style="margin-bottom:10px">${esc(b.judul)}</div>` : ''}
          <table style="width:100%;border-collapse:collapse;font-size:.85rem">
            <thead><tr>${headerRow.map(h => `<th style="padding:10px 12px;background:rgba(249,193,46,.1);border:1px solid var(--border);text-align:left;font-weight:800;color:var(--y)">${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>${bodyRows.map(row => `<tr>${row.map(cell => `<td style="padding:9px 12px;border:1px solid var(--border)">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>`;

      case 'kutipan':
        return `<div class="card fadein" style="border-left:4px solid ${b.warna || 'var(--c)'};background:rgba(62,207,207,.06)">
          <div style="font-size:1.4rem;opacity:.5;margin-bottom:4px">❝</div>
          <div style="font-style:italic;font-size:.92rem;line-height:1.7">${esc(b.isi || '')}</div>
          ${b.judul ? `<div style="margin-top:8px;font-weight:800;font-size:.8rem;color:var(--muted)">— ${esc(b.judul)}</div>` : ''}
        </div>`;

      case 'highlight':
        return `<div class="card fadein" style="background:${b.warna ? b.warna + '18' : 'rgba(249,193,46,.08)'};border-color:${b.warna || 'var(--y)'}44">
          ${b.icon ? `<span style="font-size:1.4rem">${esc(b.icon)}</span>` : ''}
          ${b.judul ? `<div class="h3" style="margin:6px 0;color:${b.warna || 'var(--y)'}">${esc(b.judul)}</div>` : ''}
          ${b.isi ? `<div style="font-size:.9rem;line-height:1.7">${esc(b.isi)}</div>` : ''}
        </div>`;

      default:
        return b.isi ? `<div class="card fadein">${esc(b.isi)}</div>` : '';
    }
  }

  const blokHTML = data.blok && data.blok.length
    ? data.blok.map(renderBlok).join('\n')
    : '';

  const accordionHTML = data.items && data.items.length
    ? data.items.map((item, idx) => {
        const warna = item.warna || 'var(--c)';
        return `<div class="acc-item" style="border-radius:14px;overflow:hidden;margin-bottom:10px;border:1px solid var(--border);transition:all .25s">
          <div class="acc-header" onclick="toggleAccordion(this)" style="display:flex;align-items:center;gap:12px;padding:14px 18px;cursor:pointer;background:var(--card);transition:all .2s;user-select:none" role="button" tabindex="0" aria-expanded="false" aria-label="Toggle ${esc(item.judul)}">
            <span style="font-size:1.3rem;min-width:28px;text-align:center">${esc(item.icon)}</span>
            <span style="flex:1;font-weight:800;font-size:.95rem">${esc(item.judul)}</span>
            <span style="font-size:.7rem;font-weight:800;padding:3px 10px;border-radius:99px;background:${warna}22;color:${warna};white-space:nowrap">${esc(item.judul)}</span>
            <svg class="acc-chevron" style="width:18px;height:18px;transition:transform .3s;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="acc-body" style="max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease;padding:0 18px">
            <div style="padding:4px 0 16px;border-top:1px solid var(--border);font-size:.9rem;line-height:1.8;color:var(--text)">
              ${esc(item.isi)}
            </div>
          </div>
        </div>`;
      }).join('\n')
    : '';

  return `
<style>
  /* Accordion-specific styles */
  .acc-item.open .acc-body{max-height:800px;padding:0 18px;}
  .acc-item.open .acc-chevron{transform:rotate(180deg);}
  .acc-item.open .acc-header{background:rgba(255,255,255,.07);border-bottom:1px solid var(--border);}
  .acc-header:hover{background:rgba(255,255,255,.07);}
  .acc-header:focus{outline:2px solid var(--c);outline-offset:-2px;}
  .materi-acc-section-title{display:flex;align-items:center;gap:10px;margin:24px 0 14px;font-family:'Fredoka One',cursive;font-size:1.15rem;color:var(--y);}
  .materi-acc-section-title::after{content:'';flex:1;height:2px;background:linear-gradient(90deg,var(--y),transparent);border-radius:2px;}
</style>

<div class="fadein" style="margin-bottom:18px">
  <h2 class="h2">${esc(data.judul)}</h2>
  ${data.subjudul ? `<p class="sub mt8">${esc(data.subjudul)}</p>` : ''}
</div>

${blokHTML}

${accordionHTML ? `
<div class="materi-acc-section-title">
  <span>📋</span>
  <span>Pelajari Lebih Lanjut</span>
</div>
<div class="fadein">${accordionHTML}</div>
` : ''}
`;
}
