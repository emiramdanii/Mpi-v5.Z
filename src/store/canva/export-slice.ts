// ═══════════════════════════════════════════════════════════════
// CANVA STORE — Export Slice (Page/Slideshow HTML Export)
// ═══════════════════════════════════════════════════════════════

import type { CanvaState, CanvaPage } from './types';
import { RATIOS } from './types';
import { useAuthoringStore } from '@/store/authoring-store';
import { getBridgeInjectHTML } from '@/lib/template-edit-bridge';
import { autoBuildPages, type AutoBuildInput } from '@/lib/templates/auto-build';
import { assembleHtml, type AssemblyPage, type ScreenType } from '@/lib/templates/assembly';
import type { NavConfig } from '@/components/canva/types';

type Set = (partial: Partial<CanvaState> | ((state: CanvaState) => Partial<CanvaState>)) => void;
type Get = () => CanvaState;

// ── Helper: Render template-specific HTML for export ──────────

function renderTemplateExportHTML(page: CanvaPage): string | null {
  const td = page.templateData;
  const esc = (s: unknown) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  switch (page.templateType) {
    // ── 1. COVER ──────────────────────────────────────────────────
    case 'cover': {
      const title = esc(td.title);
      const subtitle = esc(td.subtitle);
      const icon = td.icon || '📚';
      const mapel = esc(td.mapel);
      const kelas = esc(td.kelas);
      return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px">
        <div data-edit="icon" data-edit-type="text" style="font-size:64px;margin-bottom:16px">${icon}</div>
        <div data-edit="title" data-edit-type="text" data-edit-placeholder="Judul Pertemuan" style="font-size:32px;font-weight:900;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.5);margin-bottom:8px">${title}</div>
        <div data-edit="subtitle" data-edit-type="text" data-edit-placeholder="Subjudul" style="font-size:16px;color:rgba(255,255,255,.7);margin-bottom:20px">${subtitle}</div>
        ${mapel ? `<div data-edit="mapel" data-edit-type="text" style="display:inline-block;padding:6px 16px;border-radius:20px;background:rgba(249,200,46,.2);border:1px solid rgba(249,200,46,.3);color:#f9c82e;font-size:13px;font-weight:700">${mapel} ${kelas ? '• Kelas ' + kelas : ''}</div>` : ''}
      </div>`;
    }

    // ── 2. DOKUMEN ────────────────────────────────────────────────
    case 'dokumen': {
      const cp = (td.cp as Record<string, unknown>) || {};
      const tp = (td.tp as Array<Record<string, unknown>>) || [];
      const atp = (td.atp as Record<string, unknown>) || {};

      // CP section
      const cpElemen = esc(cp.elemen);
      const cpSubElemen = esc(cp.subElemen);
      const cpCapaian = esc(cp.capaianFase);
      const profilArr = (cp.profil as string[]) || [];

      const profilChips = profilArr.length > 0
        ? profilArr.map(p => `<span style="display:inline-block;padding:3px 10px;border-radius:12px;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);color:#a78bfa;font-size:10px;font-weight:600;margin:2px">${esc(p)}</span>`).join('')
        : '';

      // TP list
      const tpItems = tp.map((t, i) => {
        const verb = esc(t.verb);
        const desc = esc(t.desc);
        const color = (t.color as string) || '#f9c82e';
        const pertemuan = t.pertemuan != null ? String(t.pertemuan) : '';
        return `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px">
          <span style="min-width:22px;height:22px;border-radius:50%;background:${color};color:#000;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center">${i + 1}</span>
          <div style="flex:1"><span style="color:${color};font-weight:700;font-size:12px">${verb}</span> <span style="color:#e8f2ff;font-size:12px">${desc}</span>
          ${pertemuan ? `<span style="display:inline-block;margin-left:6px;padding:1px 6px;border-radius:8px;background:rgba(255,255,255,.08);font-size:9px;color:#6e90b5">Pert. ${esc(pertemuan)}</span>` : ''}
          </div>
        </div>`;
      }).join('');

      // ATP section
      const atpNama = esc(atp.namaBab);
      const atpPertemuan = (atp.pertemuan as Array<Record<string, unknown>>) || [];

      const atpCards = atpPertemuan.map((pt, i) => {
        const judul = esc(pt.judul);
        const tpRef = esc(pt.tp);
        const durasi = esc(pt.durasi);
        const kegiatan = esc(pt.kegiatan);
        const penilaian = esc(pt.penilaian);
        return `<div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px;margin-bottom:6px">
          <div style="font-size:13px;font-weight:700;color:#3ecfcf;margin-bottom:4px">Pertemuan ${i + 1}: ${judul}</div>
          ${durasi ? `<div style="font-size:10px;color:#6e90b5;margin-bottom:2px">⏱ ${durasi} menit</div>` : ''}
          ${tpRef ? `<div style="font-size:10px;color:#f9c82e;margin-bottom:2px">TP: ${tpRef}</div>` : ''}
          ${kegiatan ? `<div style="font-size:11px;color:#e8f2ff;line-height:1.4">${kegiatan}</div>` : ''}
          ${penilaian ? `<div style="font-size:10px;color:#34d399;margin-top:4px">📝 Penilaian: ${penilaian}</div>` : ''}
        </div>`;
      }).join('');

      return `<div style="position:absolute;inset:0;padding:32px;overflow-y:auto;font-family:'Nunito',sans-serif">
        <div style="font-size:22px;font-weight:900;color:#e8f2ff;margin-bottom:16px">📋 Dokumen Pembelajaran</div>

        <!-- CP Section -->
        <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px;margin-bottom:12px">
          <div style="font-size:14px;font-weight:800;color:#f9c82e;margin-bottom:8px">Capaian Pembelajaran (CP)</div>
          ${cpElemen ? `<div style="margin-bottom:4px"><span style="font-size:10px;color:#6e90b5;font-weight:600">Elemen:</span> <span style="font-size:12px;color:#e8f2ff">${cpElemen}</span></div>` : ''}
          ${cpSubElemen ? `<div style="margin-bottom:4px"><span style="font-size:10px;color:#6e90b5;font-weight:600">Sub-Elemen:</span> <span style="font-size:12px;color:#e8f2ff">${cpSubElemen}</span></div>` : ''}
          ${cpCapaian ? `<div style="margin-bottom:4px"><span style="font-size:10px;color:#6e90b5;font-weight:600">Capaian Fase:</span> <span style="font-size:12px;color:#e8f2ff;line-height:1.4">${cpCapaian}</span></div>` : ''}
          ${profilChips ? `<div style="margin-top:8px"><span style="font-size:10px;color:#6e90b5;font-weight:600">Profil Pelajar Pancasila:</span><div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:2px">${profilChips}</div></div>` : ''}
        </div>

        <!-- TP Section -->
        ${tp.length > 0 ? `<div style="margin-bottom:12px">
          <div style="font-size:14px;font-weight:800;color:#3ecfcf;margin-bottom:8px">Tujuan Pembelajaran (TP)</div>
          ${tpItems}
        </div>` : ''}

        <!-- ATP Section -->
        ${atpPertemuan.length > 0 ? `<div>
          <div style="font-size:14px;font-weight:800;color:#a78bfa;margin-bottom:8px">Alur Tujuan Pembelajaran (ATP)${atpNama ? ' — ' + atpNama : ''}</div>
          ${atpCards}
        </div>` : ''}
      </div>`;
    }

    // ── 3. MATERI ─────────────────────────────────────────────────
    case 'materi': {
      const blok = (td.blok as Array<Record<string, unknown>>) || [];
      const modules = (td.modules as Array<Record<string, unknown>>) || [];

      const blokHTML = blok.map(b => {
        const tipe = (b.tipe as string) || 'teks';
        const judul = esc(b.judul);
        const isi = esc(b.isi);
        const butir = (b.butir as string[]) || [];
        const baris = (b.baris as string[][]) || [];
        const langkah = (b.langkah as Array<{ icon: string; judul: string; isi: string }>) || [];
        const icon = (b.icon as string) || '';
        const warna = (b.warna as string) || '#f9c82e';
        const style = (b.style as string) || 'info';

        switch (tipe) {
          case 'teks':
            return `<div style="margin-bottom:10px">
              ${judul ? `<div style="font-size:14px;font-weight:700;color:#e8f2ff;margin-bottom:6px">${icon ? icon + ' ' : ''}${judul}</div>` : ''}
              ${isi ? `<div style="font-size:12px;color:rgba(232,242,255,.85);line-height:1.65">${isi}</div>` : ''}
            </div>`;

          case 'definisi':
            return `<div style="background:${warna}0d;border-left:4px solid ${warna};border-radius:0 10px 10px 0;padding:14px 16px;margin-bottom:10px">
              ${judul ? `<div style="font-size:14px;font-weight:800;color:${warna};margin-bottom:6px">${icon ? icon + ' ' : ''}📖 ${judul}</div>` : ''}
              ${isi ? `<div style="font-size:12px;color:#e8f2ff;line-height:1.65">${isi}</div>` : ''}
            </div>`;

          case 'poin': {
            const poinIcon = icon || '📌';
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px">
              ${judul ? `<div style="font-size:14px;font-weight:800;color:#3ecfcf;margin-bottom:8px">${poinIcon} ${judul}</div>` : ''}
              ${butir.length > 0 ? `<div style="display:flex;flex-direction:column;gap:4px">${butir.map(bi => `<div style="display:flex;gap:8px;align-items:flex-start;font-size:12px;color:#e8f2ff;line-height:1.55"><span style="color:#3ecfcf;flex-shrink:0;margin-top:1px">→</span><span>${esc(bi)}</span></div>`).join('')}</div>` : ''}
              ${!butir.length && isi ? `<div style="font-size:12px;color:#e8f2ff;line-height:1.55">${isi}</div>` : ''}
            </div>`;
          }

          case 'tabel': {
            const hasRows = baris.length > 0;
            if (!hasRows) {
              return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px">
                ${judul ? `<div style="font-size:14px;font-weight:800;color:#a78bfa;margin-bottom:8px">${icon ? icon + ' ' : '📊 '}${judul}</div>` : ''}
                <div style="font-size:12px;color:#6e90b5">Data tabel belum diisi</div>
              </div>`;
            }
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px;overflow-x:auto">
              ${judul ? `<div style="font-size:14px;font-weight:800;color:#a78bfa;margin-bottom:10px">${icon ? icon + ' ' : '📊 '}${judul}</div>` : ''}
              <table style="width:100%;border-collapse:collapse;font-size:11px">${baris.map((row, ri) => `<tr>${row.map((cell, ci) => `<td style="padding:8px 10px;color:${ri === 0 ? '#f9c82e' : '#e8f2ff'};font-weight:${ri === 0 ? '700' : '400'};border-bottom:1px solid rgba(255,255,255,.06);${ri === 0 ? 'background:rgba(255,255,255,.06)' : ''};white-space:nowrap">${esc(cell)}</td>`).join('')}</tr>`).join('')}</table>
            </div>`;
          }

          case 'kutipan':
            return `<div style="background:rgba(249,200,46,.06);border-left:4px solid #f9c82e;border-radius:0 10px 10px 0;padding:14px 16px;margin-bottom:10px">
              ${isi ? `<div style="font-size:13px;color:#e8f2ff;line-height:1.6;font-style:italic">"${isi}"</div>` : ''}
              ${judul ? `<div style="font-size:11px;color:#f9c82e;margin-top:8px;font-weight:700">— ${judul}</div>` : ''}
            </div>`;

          case 'highlight':
            return `<div style="background:${warna}0d;border:1px solid ${warna}30;border-radius:10px;padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start">
              <div style="font-size:28px;flex-shrink:0;line-height:1">${icon || '💡'}</div>
              <div>${judul ? `<div style="font-size:14px;font-weight:800;color:${warna};margin-bottom:4px">${judul}</div>` : ''}
              ${isi ? `<div style="font-size:12px;color:#e8f2ff;line-height:1.55">${isi}</div>` : ''}</div>
            </div>`;

          case 'timeline': {
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px">
              ${judul ? `<div style="font-size:14px;font-weight:800;color:#34d399;margin-bottom:10px">${icon ? icon + ' ' : '🔄 '}${judul}</div>` : ''}
              ${langkah.length > 0 ? langkah.map((l, si) => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:${si < langkah.length - 1 ? '8px' : '0'};padding-left:4px">
                <div style="min-width:26px;height:26px;border-radius:50%;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.35);color:#34d399;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${l.icon || (si + 1)}</div>
                <div><div style="font-size:12px;font-weight:700;color:#e8f2ff">${esc(l.judul)}</div>${l.isi ? `<div style="font-size:11px;color:#6e90b5;line-height:1.45;margin-top:1px">${esc(l.isi)}</div>` : ''}</div>
              </div>`).join('') : ''}
            </div>`;
          }

          case 'compare': {
            const kiri = (b.kiri as Record<string, string>) || {};
            const kanan = (b.kanan as Record<string, string>) || {};
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px">
              ${judul ? `<div style="font-size:14px;font-weight:800;color:#a78bfa;margin-bottom:10px">${icon ? icon + ' ' : '⚖️ '}${judul}</div>` : ''}
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                <div style="background:rgba(62,207,207,.08);border:1px solid rgba(62,207,207,.2);border-radius:8px;padding:10px">
                  ${kiri.icon ? `<div style="font-size:20px;margin-bottom:4px">${esc(kiri.icon)}</div>` : ''}
                  ${kiri.judul ? `<div style="font-size:12px;font-weight:700;color:#3ecfcf;margin-bottom:4px">${esc(kiri.judul)}</div>` : ''}
                  ${kiri.isi ? `<div style="font-size:11px;color:#e8f2ff;line-height:1.45">${esc(kiri.isi)}</div>` : ''}
                </div>
                <div style="background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:8px;padding:10px">
                  ${kanan.icon ? `<div style="font-size:20px;margin-bottom:4px">${esc(kanan.icon)}</div>` : ''}
                  ${kanan.judul ? `<div style="font-size:12px;font-weight:700;color:#a78bfa;margin-bottom:4px">${esc(kanan.judul)}</div>` : ''}
                  ${kanan.isi ? `<div style="font-size:11px;color:#e8f2ff;line-height:1.45">${esc(kanan.isi)}</div>` : ''}
                </div>
              </div>
            </div>`;
          }

          case 'infobox': {
            const styleMap: Record<string, { bg: string; border: string; color: string; iconEmoji: string }> = {
              info: { bg: 'rgba(96,165,250,.08)', border: 'rgba(96,165,250,.25)', color: '#60a5fa', iconEmoji: 'ℹ️' },
              tips: { bg: 'rgba(249,200,46,.08)', border: 'rgba(249,200,46,.25)', color: '#f9c82e', iconEmoji: '💡' },
              warning: { bg: 'rgba(251,146,60,.08)', border: 'rgba(251,146,60,.25)', color: '#fb923c', iconEmoji: '⚠️' },
              success: { bg: 'rgba(52,211,153,.08)', border: 'rgba(52,211,153,.25)', color: '#34d399', iconEmoji: '✅' },
            };
            const s = styleMap[style] || styleMap.info;
            return `<div style="background:${s.bg};border:1px solid ${s.border};border-radius:10px;padding:14px;margin-bottom:10px;display:flex;gap:10px;align-items:flex-start">
              <div style="font-size:20px;flex-shrink:0">${s.iconEmoji}</div>
              <div>${judul ? `<div style="font-size:13px;font-weight:700;color:${s.color};margin-bottom:4px">${judul}</div>` : ''}
              ${isi ? `<div style="font-size:12px;color:#e8f2ff;line-height:1.55">${isi}</div>` : ''}</div>
            </div>`;
          }

          case 'checklist':
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px">
              ${judul ? `<div style="font-size:14px;font-weight:800;color:#34d399;margin-bottom:8px">${icon ? icon + ' ' : '✅ '}${judul}</div>` : ''}
              ${butir.length > 0 ? butir.map(bi => `<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:4px"><div style="width:16px;height:16px;border-radius:4px;border:2px solid rgba(52,211,153,.4);flex-shrink:0;margin-top:2px"></div><span style="font-size:12px;color:#e8f2ff;line-height:1.5">${esc(bi)}</span></div>`).join('') : ''}
            </div>`;

          case 'statistik': {
            const items = (b.items as Array<{ icon?: string; angka?: string; satuan?: string; label?: string; warna?: string; judul?: string; isi?: string }>) || [];
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px">
              ${judul ? `<div style="font-size:14px;font-weight:800;color:#fb923c;margin-bottom:10px">${icon ? icon + ' ' : '📊 '}${judul}</div>` : ''}
              ${items.length > 0 ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px">${items.map(it => `<div style="text-align:center;padding:10px;background:rgba(255,255,255,.04);border-radius:8px;border:1px solid rgba(255,255,255,.06)">
                <div style="font-size:20px;margin-bottom:4px">${it.icon || '📊'}</div>
                <div style="font-size:18px;font-weight:900;color:${it.warna || '#3ecfcf'}">${esc(it.angka || '')}</div>
                ${it.satuan ? `<div style="font-size:9px;color:#6e90b5">${esc(it.satuan)}</div>` : ''}
                <div style="font-size:10px;color:#e8f2ff;margin-top:2px">${esc(it.label || '')}</div>
              </div>`).join('')}</div>` : ''}
            </div>`;
          }

          case 'studi': {
            const karakter = (b.karakter as string) || '🧑';
            const situasi = esc(b.situasi);
            const pertanyaan = esc(b.pertanyaan);
            const pesan = esc(b.pesan);
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px">
              ${judul ? `<div style="font-size:14px;font-weight:800;color:#f87171;margin-bottom:8px">📖 ${judul}</div>` : ''}
              <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px">
                <div style="font-size:32px;flex-shrink:0">${karakter}</div>
                <div style="font-size:12px;color:#e8f2ff;line-height:1.55">${situasi}</div>
              </div>
              ${pertanyaan ? `<div style="background:rgba(249,200,46,.08);border:1px dashed rgba(249,200,46,.25);border-radius:8px;padding:10px;margin-top:6px;font-size:12px;color:#f9c82e">💭 ${pertanyaan}</div>` : ''}
              ${pesan ? `<div style="background:rgba(52,211,153,.06);border-radius:8px;padding:10px;margin-top:6px;font-size:11px;color:#34d399">💡 ${pesan}</div>` : ''}
            </div>`;
          }

          default:
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;margin-bottom:8px">
              ${judul ? `<div style="font-size:14px;font-weight:700;color:#e8f2ff;margin-bottom:4px">${icon ? icon + ' ' : ''}${judul}</div>` : ''}
              ${isi ? `<div style="font-size:12px;color:#e8f2ff;line-height:1.5">${isi}</div>` : ''}
            </div>`;
        }
      }).join('');

      // ── Module rendering (tab-icons, infografis, accordion, etc.) ──
      const modulesHTML = modules.map((mod, mi) => {
        const modType = (mod.type as string) || '';
        const modTitle = esc(mod.title || modType);
        const modIntro = esc(mod.intro || mod.instruksi || '');

        switch (modType) {
          case 'tab-icons': {
            const tabs = (mod.tabs as Array<{ icon?: string; judul?: string; warna?: string; isi?: string; poin?: string[]; refleksi?: string }>) || [];
            const tabId = 'modtab_' + mi;
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px">
              ${modTitle ? `<div style="font-size:15px;font-weight:800;color:#e8f2ff;margin-bottom:4px">⚖️ ${modTitle}</div>` : ''}
              ${modIntro ? `<div style="font-size:11px;color:#6e90b5;margin-bottom:12px">${modIntro}</div>` : ''}
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">${tabs.map((t, ti) => `<button onclick="document.querySelectorAll('.${tabId}_panel').forEach(p=>p.style.display='none');document.getElementById('${tabId}_${ti}').style.display='block';document.querySelectorAll('.${tabId}_tab').forEach(b=>b.style.background='rgba(255,255,255,.06)');this.style.background='${t.warna || '#f9c82e'}20'" class="${tabId}_tab" style="padding:6px 14px;border-radius:20px;border:1px solid ${t.warna || '#f9c82e'}30;background:${ti === 0 ? (t.warna || '#f9c82e') + '20' : 'rgba(255,255,255,.06)'};color:${t.warna || '#f9c82e'};font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s">${t.icon || '📌'} ${esc(t.judul || 'Tab ' + (ti + 1))}</button>`).join('')}</div>
              ${tabs.map((t, ti) => `<div id="${tabId}_${ti}" class="${tabId}_panel" style="display:${ti === 0 ? 'block' : 'none'};background:${t.warna || '#f9c82e'}08;border:1px solid ${t.warna || '#f9c82e'}20;border-radius:10px;padding:14px">
                ${t.isi ? `<div style="font-size:12px;color:#e8f2ff;line-height:1.6;margin-bottom:8px">${esc(t.isi)}</div>` : ''}
                ${t.poin && t.poin.length > 0 ? `<div style="display:flex;flex-direction:column;gap:4px">${t.poin.map(p => `<div style="display:flex;gap:6px;align-items:flex-start;font-size:11px;color:#e8f2ff;line-height:1.5"><span style="color:${t.warna || '#f9c82e'};flex-shrink:0">→</span><span>${esc(p)}</span></div>`).join('')}</div>` : ''}
                ${t.refleksi ? `<div style="margin-top:8px;padding:8px 10px;border-radius:6px;background:${t.warna || '#f9c82e'}0a;border:1px dashed ${t.warna || '#f9c82e'}20;font-size:10px;color:${t.warna || '#f9c82e'};font-style:italic">💭 ${esc(t.refleksi)}</div>` : ''}
              </div>`).join('')}
            </div>`;
          }

          case 'infografis': {
            const kartu = (mod.kartu as Array<{ icon?: string; judul?: string; isi?: string; warna?: string }>) || [];
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px">
              ${modTitle ? `<div style="font-size:15px;font-weight:800;color:#e8f2ff;margin-bottom:4px">📊 ${modTitle}</div>` : ''}
              ${modIntro ? `<div style="font-size:11px;color:#6e90b5;margin-bottom:12px">${modIntro}</div>` : ''}
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">${kartu.map(k => `<div style="background:${k.warna || '#3ecfcf'}0a;border:1px solid ${k.warna || '#3ecfcf'}25;border-radius:10px;padding:14px;text-align:center;cursor:pointer;transition:transform .2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:28px;margin-bottom:6px">${k.icon || '📌'}</div>
                <div style="font-size:12px;font-weight:800;color:${k.warna || '#3ecfcf'};margin-bottom:4px">${esc(k.judul || '')}</div>
                <div style="font-size:10px;color:rgba(232,242,255,.7);line-height:1.45">${esc(k.isi || '')}</div>
              </div>`).join('')}</div>
            </div>`;
          }

          case 'accordion': {
            const items = (mod.items as Array<{ icon?: string; judul?: string; isi?: string }>) || [];
            const accId = 'acc_' + mi;
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px">
              ${modTitle ? `<div style="font-size:15px;font-weight:800;color:#e8f2ff;margin-bottom:4px">🗂️ ${modTitle}</div>` : ''}
              ${modIntro ? `<div style="font-size:11px;color:#6e90b5;margin-bottom:12px">${modIntro}</div>` : ''}
              <div style="display:flex;flex-direction:column;gap:6px">${items.map((it, ii) => `<div style="border:1px solid rgba(255,255,255,.08);border-radius:8px;overflow:hidden">
                <button onclick="const d=document.getElementById('${accId}_${ii}');const isHidden=d.style.display==='none';d.style.display=isHidden?'block':'none';this.querySelector('.acc-arrow').style.transform=isHidden?'rotate(180deg)':'none'" style="width:100%;display:flex;align-items:center;gap:8px;padding:10px 12px;background:rgba(255,255,255,.04);border:none;color:#e8f2ff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;text-align:left">
                  <span>${it.icon || '📌'}</span>
                  <span style="flex:1">${esc(it.judul || 'Item ' + (ii + 1))}</span>
                  <span class="acc-arrow" style="transition:transform .2s;font-size:10px">▼</span>
                </button>
                <div id="${accId}_${ii}" style="display:none;padding:10px 12px;font-size:11px;color:rgba(232,242,255,.8);line-height:1.55;border-top:1px solid rgba(255,255,255,.06)">${esc(it.isi || '')}</div>
              </div>`).join('')}</div>
            </div>`;
          }

          case 'card-showcase':
          case 'icon-explore': {
            const kartu = (mod.kartu as Array<{ icon?: string; judul?: string; isi?: string; warna?: string }>) || [];
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px">
              ${modTitle ? `<div style="font-size:15px;font-weight:800;color:#e8f2ff;margin-bottom:4px">🃏 ${modTitle}</div>` : ''}
              ${modIntro ? `<div style="font-size:11px;color:#6e90b5;margin-bottom:12px">${modIntro}</div>` : ''}
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${kartu.map(k => `<div style="background:${k.warna || '#a78bfa'}0a;border:1px solid ${k.warna || '#a78bfa'}25;border-radius:10px;padding:12px;cursor:pointer;transition:transform .2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                <div style="font-size:24px;margin-bottom:4px">${k.icon || '📌'}</div>
                <div style="font-size:11px;font-weight:800;color:${k.warna || '#a78bfa'};margin-bottom:3px">${esc(k.judul || '')}</div>
                <div style="font-size:10px;color:rgba(232,242,255,.7);line-height:1.4">${esc(k.isi || '')}</div>
              </div>`).join('')}</div>
            </div>`;
          }

          case 'comparison': {
            const kolom = (mod.kolom as Array<{ judul?: string; warna?: string; poin?: string[] }>) || [];
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:12px">
              ${modTitle ? `<div style="font-size:15px;font-weight:800;color:#e8f2ff;margin-bottom:4px">⚖️ ${modTitle}</div>` : ''}
              <div style="display:grid;grid-template-columns:repeat(${kolom.length || 2},1fr);gap:8px">${kolom.map(k => `<div style="background:${k.warna || '#3ecfcf'}08;border:1px solid ${k.warna || '#3ecfcf'}20;border-radius:8px;padding:10px">
                <div style="font-size:12px;font-weight:700;color:${k.warna || '#3ecfcf'};margin-bottom:6px">${esc(k.judul || '')}</div>
                ${k.poin && k.poin.length > 0 ? k.poin.map(p => `<div style="font-size:11px;color:#e8f2ff;line-height:1.4;margin-bottom:2px">• ${esc(p)}</div>`).join('') : ''}
              </div>`).join('')}</div>
            </div>`;
          }

          default:
            // Generic module card for unknown types
            return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="font-size:18px">🧩</span>
                <div style="font-size:13px;font-weight:700;color:#3ecfcf">${modTitle}</div>
                <span style="font-size:9px;padding:2px 8px;border-radius:10px;background:rgba(62,207,207,.12);color:#3ecfcf">${modType}</span>
              </div>
              ${modIntro ? `<div style="font-size:11px;color:#6e90b5;line-height:1.45">${modIntro}</div>` : ''}
            </div>`;
        }
      }).join('');

      const hasContent = blok.length > 0 || modules.length > 0;

      return `<div style="position:absolute;inset:0;padding:24px 28px;overflow-y:auto;font-family:'Nunito',sans-serif">
        <div data-edit="title" data-edit-type="text" style="font-size:20px;font-weight:900;color:#e8f2ff;margin-bottom:4px">📖 Materi Pembelajaran</div>
        <div style="font-size:11px;color:#6e90b5;margin-bottom:16px">${blok.length} blok · ${modules.length} modul interaktif</div>
        ${blokHTML}
        ${modules.length > 0 ? `<div style="font-size:12px;font-weight:700;color:#3ecfcf;margin:14px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08)">🧩 Modul Interaktif</div>${modulesHTML}` : ''}
        ${!hasContent ? '<div style="font-size:13px;color:#6e90b5;text-align:center;padding:40px"><div style="font-size:2rem;margin-bottom:8px">📝</div>Tambah materi di panel Konten</div>' : ''}
      </div>`;
    }

    // ── 4. KUIS ───────────────────────────────────────────────────
    case 'kuis': {
      // Return a container div that the existing JS in exportPageHTML will find and render
      return `<div id="quiz_template" style="position:absolute;inset:0;background:rgba(245,200,66,.05);border:1px solid rgba(245,200,66,.15);border-radius:8px;padding:10px;overflow:hidden;display:flex;flex-direction:column"></div>`;
    }

    // ── 5. GAME ───────────────────────────────────────────────────
    case 'game': {
      // Return a container div that the existing JS in exportPageHTML will find and render
      const games = (td.games as Array<Record<string, unknown>>) || [];
      const gameIdx = games.length > 0 ? 0 : -1;
      return `<div id="game_template" data-game-idx="${gameIdx}" style="position:absolute;inset:0;background:rgba(56,217,217,.05);border:1px solid rgba(56,217,217,.15);border-radius:8px;overflow:hidden;display:flex;flex-direction:column"></div>`;
    }

    // ── 6. HASIL ──────────────────────────────────────────────────
    case 'hasil': {
      const totalKuis = (td.totalKuis as number) || 0;
      const namaBab = esc(td.namaBab);
      return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;font-family:'Nunito',sans-serif">
        <div style="font-size:48px;margin-bottom:16px">🏆</div>
        <div style="width:120px;height:120px;border-radius:50%;border:4px solid rgba(52,211,153,.4);display:flex;align-items:center;justify-content:center;margin-bottom:12px;background:rgba(52,211,153,.08)">
          <div style="font-size:36px;font-weight:900;color:#34d399" id="hasil-score">0%</div>
        </div>
        <div style="font-size:11px;font-weight:700;padding:4px 14px;border-radius:12px;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);color:#34d399;margin-bottom:12px">Level: —</div>
        <div data-edit="title" data-edit-type="text" style="font-size:22px;font-weight:900;color:#e8f2ff;margin-bottom:4px">Hasil Belajar</div>
        ${namaBab ? `<div data-edit="namaBab" data-edit-type="text" style="font-size:13px;color:#6e90b5;margin-bottom:12px">${namaBab}</div>` : ''}
        <div style="font-size:13px;color:rgba(255,255,255,.6);margin-bottom:16px">${totalKuis > 0 ? totalKuis + ' soal kuis telah diselesaikan' : 'Terima kasih telah belajar!'}</div>
        <div style="width:100%;max-width:400px">
          <div style="font-size:12px;color:#6e90b5;margin-bottom:6px;font-weight:600">📝 Refleksi Pembelajaran</div>
          <textarea placeholder="Apa yang paling kamu pahami?" style="width:100%;height:44px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#e8f2ff;font-size:11px;padding:8px;resize:none;font-family:inherit"></textarea>
          <textarea placeholder="Apa yang masih membingungkan?" style="width:100%;height:44px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#e8f2ff;font-size:11px;padding:8px;resize:none;margin-top:4px;font-family:inherit"></textarea>
        </div>
      </div>`;
    }

    // ── 7. SKENARIO ───────────────────────────────────────────────
    case 'skenario': {
      const skenario = (td.skenario as Array<Record<string, unknown>>) || [];

      const chapterList = skenario.map((ch, i) => {
        const title = esc(ch.title);
        const charEmoji = (ch.charEmoji as string) || '🧑';
        const choices = (ch.choices as Array<Record<string, unknown>>) || [];
        return `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px">
          <div style="min-width:36px;height:36px;border-radius:10px;background:rgba(167,139,250,.15);border:1px solid rgba(167,139,250,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${charEmoji}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:#a78bfa;margin-bottom:2px">Bab ${i + 1}: ${title}</div>
            <div style="font-size:11px;color:#6e90b5">${choices.length} pilihan keputusan</div>
          </div>
        </div>`;
      }).join('');

      return `<div style="position:absolute;inset:0;padding:32px;overflow-y:auto;font-family:'Nunito',sans-serif">
        <div data-edit="title" data-edit-type="text" style="font-size:22px;font-weight:900;color:#e8f2ff;margin-bottom:16px">🎭 Skenario Interaktif</div>
        ${skenario.length > 0 ? `<div style="margin-bottom:16px">${chapterList}</div>` : '<div style="font-size:13px;color:#6e90b5;margin-bottom:16px">Belum ada skenario</div>'}
        <div style="background:rgba(249,200,46,.08);border:1px solid rgba(249,200,46,.2);border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:16px;margin-bottom:6px">🎮</div>
          <div style="font-size:13px;font-weight:700;color:#f9c82e;margin-bottom:4px">Mainkan melalui Preview Aplikasi</div>
          <div style="font-size:11px;color:#6e90b5">Skenario interaktif hanya dapat dimainkan dalam mode Preview</div>
        </div>
      </div>`;
    }

    // ── 8. HERO ───────────────────────────────────────────────────
    case 'hero': {
      const title = esc(td.title);
      const subtitle = esc(td.subtitle);
      const icon = td.icon || '🚀';
      const gradient = (td.gradient as string) || 'sunset';
      const cta = esc(td.cta);

      const gradientMap: Record<string, string> = {
        sunset: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 30%,#0f3460 60%,#533483 100%)',
        ocean: 'linear-gradient(135deg,#0c1220 0%,#0a2540 30%,#0d4a6b 60%,#1a7a8a 100%)',
        forest: 'linear-gradient(135deg,#0a1a0a 0%,#0d2818 30%,#1a4a2e 60%,#2d6a4f 100%)',
        fire: 'linear-gradient(135deg,#1a0a0a 0%,#2d1810 30%,#4a2010 60%,#6a3020 100%)',
        cosmic: 'linear-gradient(135deg,#0a0a1a 0%,#1a0a2e 30%,#2e1065 60%,#4a1d96 100%)',
      };
      const bgGradient = gradientMap[gradient] || gradientMap.sunset;

      return `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:48px;background:${bgGradient};font-family:'Nunito',sans-serif">
        <div data-edit="icon" data-edit-type="text" style="font-size:72px;margin-bottom:20px;filter:drop-shadow(0 4px 20px rgba(0,0,0,.5))">${icon}</div>
        <div data-edit="title" data-edit-type="text" data-edit-placeholder="Judul Hero" style="font-size:36px;font-weight:900;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.6);margin-bottom:10px;max-width:80%;line-height:1.2">${title}</div>
        ${subtitle ? `<div data-edit="subtitle" data-edit-type="text" data-edit-placeholder="Subjudul" style="font-size:16px;color:rgba(255,255,255,.7);margin-bottom:24px;max-width:70%;line-height:1.4">${subtitle}</div>` : ''}
        ${cta ? `<div data-edit="cta" data-edit-type="text" data-edit-placeholder="Tombol CTA" style="padding:10px 28px;border-radius:24px;background:rgba(249,200,46,.25);border:1px solid rgba(249,200,46,.4);color:#f9c82e;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s">${cta}</div>` : ''}
      </div>`;
    }

    default:
      return null; // Fall back to element-based rendering
  }
}

// ── Export Slice ──────────────────────────────────────────────

export function createExportSlice(_set: Set, get: Get) {
  return {
    exportPageHTML: (pageIdx?: number) => {
      const { pages, ratioId } = get();
      const idx = pageIdx ?? get().currentPageIndex;
      const page = pages[idx];
      if (!page) return '';
      const ratio = RATIOS.find(r => r.id === ratioId) || RATIOS[0];

      const bgStyle = page.bgDataUrl
        ? `background-image:url('${page.bgDataUrl}');background-size:cover;background-position:center`
        : `background:${page.bgColor || '#1a1a2e'}`;

      // CSS variables from color palette
      const paletteCSS = page.colorPalette?.mapping
        ? Object.entries(page.colorPalette.mapping).map(([k, v]) => `${k}:${v}`).join(';')
        : '';

      // Get quiz data from authoring store for interactive export
      const allKuis = useAuthoringStore.getState().kuis.filter(k => k.q.trim());
      const allModules = useAuthoringStore.getState().modules;
      const kuisJSON = JSON.stringify(allKuis).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
      const modulesJSON = JSON.stringify(allModules).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

      // Template-specific HTML
      const templateBody = renderTemplateExportHTML(page);

      // Navbar HTML based on NavConfig
      const ncDefaults = { showNavbar: true, showPrevNext: true, showScore: true, showProgress: true, navbarStyle: 'colorful', navbarPosition: 'top' as const, navButtonStyle: 'pill' as const };
      const nc = page.navConfig || ncDefaults;
      const ncFull = { ...ncDefaults, ...nc };
      const navLabel = ((page.templateData?.title as string) || page.label || 'Media').replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
      const navProgressPct = pages.length > 1 ? Math.round(((idx + 1) / pages.length) * 100) : 100;
      const isBottom = ncFull.navbarPosition === 'bottom';
      const borderDir = isBottom ? 'border-top' : 'border-bottom';
      const navPos = isBottom ? 'bottom:0' : 'top:0';
      const navStyleMap: Record<string, string> = {
        colorful: `background:linear-gradient(90deg,rgba(146,64,14,.8),rgba(22,78,99,.6),rgba(88,28,135,.8));${borderDir}:1px solid rgba(245,158,11,.2)`,
        minimal: `background:rgba(24,24,27,.9);${borderDir}:1px solid rgba(63,63,70,.3)`,
        glass: `background:rgba(255,255,255,.05);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);${borderDir}:1px solid rgba(255,255,255,.1)`,
        pill: `background:rgba(24,24,27,.8);border-radius:99px;margin:0 8px;border:1px solid rgba(63,63,70,.3)`,
        rounded: `background:rgba(24,24,27,.8);border-radius:12px;margin:0 8px;border:1px solid rgba(63,63,70,.3)`,
        floating: `background:rgba(24,24,27,.6);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:12px;margin:0 16px;border:1px solid rgba(255,255,255,.1);box-shadow:0 4px 12px rgba(0,0,0,.3)`,
      };
      // Nav button styles
      const btnStyleMap: Record<string, string> = {
        circle: `width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;padding:0`,
        pill: `padding:4px 14px;border-radius:99px;font-size:11px;font-weight:800`,
        arrow: `padding:4px 10px;border-radius:6px;font-size:16px;font-weight:900`,
        icon: `padding:4px 10px;border-radius:8px;font-size:14px`,
      };
      const prevLabel = ncFull.navButtonStyle === 'icon' ? '⬅' : ncFull.navButtonStyle === 'arrow' ? '←' : '◀ Prev';
      const nextLabel = ncFull.navButtonStyle === 'icon' ? '➡' : ncFull.navButtonStyle === 'arrow' ? '→' : 'Next ▶';
      const navBtnStyle = btnStyleMap[ncFull.navButtonStyle] || btnStyleMap.pill;
      const prevBtnHTML = ncFull.showPrevNext ? `<button onclick="goPrev()" style="${navBtnStyle};background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:#e8f2ff;cursor:pointer;transition:all .15s" onmouseover="this.style.background='rgba(255,255,255,.15)'" onmouseout="this.style.background='rgba(255,255,255,.08)'">${prevLabel}</button>` : '';
      const nextBtnHTML = ncFull.showPrevNext ? `<button onclick="goNext()" style="${navBtnStyle};background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:#e8f2ff;cursor:pointer;transition:all .15s" onmouseover="this.style.background='rgba(255,255,255,.15)'" onmouseout="this.style.background='rgba(255,255,255,.08)'">${nextLabel}</button>` : '';
      const navbarHTML = ncFull.showNavbar ? `<nav style="${navStyleMap[ncFull.navbarStyle] || navStyleMap.colorful};padding:8px 14px;display:flex;align-items:center;gap:8px;position:absolute;${navPos};left:0;right:0;z-index:200"><span style="font-size:12px;font-weight:900;color:#fbbf24;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis">${navLabel}</span><button class="sfx-toggle" onclick="toggleSfx()" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 4px" title="Suara on/off">\ud83d\udd0a</button><button class="contrast-toggle" onclick="toggleContrast()" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 4px" title="Kontras tinggi">\ud83d\udd32</button>${ncFull.showProgress ? `<div style="flex:1;height:4px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden"><div style="height:100%;width:${navProgressPct}%;background:linear-gradient(90deg,#fbbf24,#22d3ee);border-radius:99px;transition:width .5s"></div></div>` : ''}${ncFull.showScore ? `<span style="font-size:10px;font-weight:800;color:#fbbf24;white-space:nowrap">0 ⭐</span>` : ''}${prevBtnHTML}${nextBtnHTML}</nav>` : '';

      const elementsHTML = templateBody || (page.elements || [])
        .filter(el => !el.hidden)
        .map((el, i) => {
          const style = `position:absolute;left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;opacity:${(el.opacity || 100) / 100}`;
          if (el.type === 'teks') {
            return `<div style="${style}"><div style="font-size:${el.fontSize || 20}px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.5);padding:8px;line-height:1.4">${el.text || ''}</div></div>`;
          }
          if (el.type === 'shape') {
            return `<div style="${style}"><div style="width:100%;height:100%;background:${el.color || 'rgba(255,255,255,.15)'};border-radius:${el.radius || 8}px"></div></div>`;
          }
          if (el.type === 'kuis') {
            const elId = 'quiz_' + i;
            return `<div id="${elId}" style="${style};background:rgba(245,200,66,.08);border:1px solid rgba(245,200,66,.2);border-radius:8px;padding:10px;overflow:hidden;display:flex;flex-direction:column"></div>`;
          }
          if (el.type === 'game') {
            const elId = 'game_' + i;
            const gameIdx = el.dataIdx;
            return `<div id="${elId}" data-game-idx="${gameIdx}" style="${style};background:rgba(56,217,217,.08);border:1px solid rgba(56,217,217,.2);border-radius:8px;overflow:hidden;display:flex;flex-direction:column"></div>`;
          }
          return `<div style="${style};display:flex;align-items:center;justify-content:center"><div style="font-size:1.5rem">${el.icon || ''}</div></div>`;
        })
        .join('\n    ');

      return `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${page.label}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0e0c15}
.slide{position:relative;width:${ratio.w}px;height:${ratio.h}px;overflow:hidden;${bgStyle}${paletteCSS ? ';' + paletteCSS : ''}}
.qbar{height:3px;background:rgba(245,200,66,.2);border-radius:2px;overflow:hidden;margin-bottom:6px}.qbar-fill{height:100%;background:#f5c842;transition:width .4s ease}
.qhead{display:flex;justify-content:space-between;font-size:10px;color:#f5c842;margin-bottom:4px}
.qq{font-size:13px;font-weight:700;color:#f5c842;margin-bottom:6px;line-height:1.3}
.qopt{display:block;width:100%;text-align:left;padding:6px 8px;margin:2px 0;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:rgba(245,200,66,.9);font-size:11px;cursor:pointer;transition:all .2s}
.qopt:hover{background:rgba(255,255,255,.1)}.qopt.correct{background:rgba(52,211,153,.2);border-color:rgba(52,211,153,.4);color:#6ee7b7}
.qopt.wrong{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.4);color:#fca5a5}.qopt.disabled{opacity:.3;cursor:default}
.qex{font-size:10px;color:#60a5fa;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);border-radius:6px;padding:4px 8px;margin-top:4px}
.qresult{text-align:center;padding:12px}.qresult .score{font-size:28px;font-weight:900}.qresult .level{font-size:11px;margin-top:2px}
.qresult button{margin-top:8px;padding:6px 16px;border:1px solid rgba(245,200,66,.3);border-radius:8px;background:rgba(245,200,66,.2);color:#f5c842;font-size:11px;font-weight:700;cursor:pointer}
.qresult button:hover{background:rgba(245,200,66,.4)}
body.high-contrast{background:#000!important}body.high-contrast .card{background:#111!important;border-color:rgba(255,255,255,.3)!important}body.high-contrast .sub,body.high-contrast .q-text,body.high-contrast [class*=muted]{color:#ccc!important}body.high-contrast .btn{font-weight:900}body.high-contrast .q-opt,body.high-contrast .qopt{border-color:rgba(255,255,255,.3)!important}body.high-contrast .def-box{background:rgba(255,255,255,.08)!important;border-left-color:#fff!important}body.high-contrast .navbar{background:rgba(0,0,0,.98)!important}
@media(max-width:640px){.slide{width:100%!important;height:auto!important;min-height:100vh}.navbar{padding:4px 8px;gap:4px}}
@media print{.navbar{display:none!important}.sfx-toggle{display:none!important}.contrast-toggle{display:none!important}.skip-link{display:none!important}.slide{width:100%!important;height:auto!important;min-height:auto;page-break-after:always}*{text-shadow:none!important;box-shadow:none!important}body{background:#fff}}
</style></head>
<body><a href="#main-content" class="skip-link" style="position:absolute;top:-100px;left:0;background:var(--y,#fbbf24);color:#0e1c2f;padding:8px 16px;font-weight:800;font-size:.9rem;z-index:9999;transition:top .2s" onfocus="this.style.top='0'" onblur="this.style.top='-100px'">Lompat ke Konten</a><div class="slide" id="main-content">${navbarHTML}${elementsHTML}</div>
<script>
const KUIS_DATA=${kuisJSON};
const MODULES_DATA=${modulesJSON};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
var _ac=null;var SFX_ON=${useAuthoringStore.getState().sfxConfig?.theme === 'none' ? 'false' : 'true'};
function getAC(){if(!_ac)try{_ac=new(window.AudioContext||window.webkitAudioContext)}catch(e){}return _ac}
function playTone(freq,dur,type,vol,ramp){
  if(!SFX_ON)return;var ac=getAC();if(!ac)return;
  var o=ac.createOscillator(),g=ac.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(freq,ac.currentTime);
  if(ramp)o.frequency.linearRampToValueAtTime(ramp,ac.currentTime+dur);
  g.gain.setValueAtTime(vol||.15,ac.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+dur);
  o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+dur);
}
${(() => {
  const cfg = useAuthoringStore.getState().sfxConfig || { theme: 'default', volume: 0.6 };
  const volMul = cfg.volume / 0.15;
  const v = (base: number) => +(base * volMul).toFixed(3);
  switch (cfg.theme) {
    case 'none': return 'var SFX={correct:function(){},wrong:function(){},click:function(){},flip:function(){},spin:function(){},buzz:function(){},complete:function(){},popup:function(){}};';
    case 'soft': return `var SFX={correct:function(){playTone(440,.15,'sine',${v(.08)},520);setTimeout(function(){playTone(520,.2,'sine',${v(.06)},580)},150)},wrong:function(){playTone(280,.2,'sine',${v(.05)},200)},click:function(){playTone(600,.05,'sine',${v(.04)})},flip:function(){playTone(400,.08,'sine',${v(.05)},550)},spin:function(){playTone(350,.04,'sine',${v(.03)},700)},buzz:function(){playTone(160,.25,'sine',${v(.06)},120)},complete:function(){playTone(440,.15,'sine',${v(.08)},520);setTimeout(function(){playTone(520,.15,'sine',${v(.06)},580)},150);setTimeout(function(){playTone(580,.3,'sine',${v(.08)},660)},300)},popup:function(){playTone(350,.1,'sine',${v(.05)},700)}};`;
    case 'retro': return `var SFX={correct:function(){playTone(880,.06,'square',${v(.07)},1100);setTimeout(function(){playTone(1100,.08,'square',${v(.06)},1320)},80)},wrong:function(){playTone(220,.12,'square',${v(.06)},110)},click:function(){playTone(1000,.03,'square',${v(.04)})},flip:function(){playTone(660,.05,'square',${v(.06)},990)},spin:function(){playTone(550,.04,'square',${v(.04)},1100)},buzz:function(){playTone(150,.15,'square',${v(.08)},80)},complete:function(){playTone(880,.08,'square',${v(.07)},1100);setTimeout(function(){playTone(1100,.08,'square',${v(.06)},1320)},100);setTimeout(function(){playTone(1320,.2,'square',${v(.07)},1760)},200)},popup:function(){playTone(550,.06,'square',${v(.05)},1100)}};`;
    case 'nature': return `var SFX={correct:function(){playTone(392,.12,'triangle',${v(.09)},523);setTimeout(function(){playTone(523,.18,'triangle',${v(.07)},659)},120)},wrong:function(){playTone(247,.2,'triangle',${v(.06)},185)},click:function(){playTone(784,.04,'triangle',${v(.05)})},flip:function(){playTone(523,.07,'triangle',${v(.06)},784)},spin:function(){playTone(440,.04,'triangle',${v(.04)},880)},buzz:function(){playTone(196,.22,'triangle',${v(.07)},147)},complete:function(){playTone(392,.12,'triangle',${v(.09)},523);setTimeout(function(){playTone(523,.12,'triangle',${v(.07)},659)},120);setTimeout(function(){playTone(659,.28,'triangle',${v(.09)},784)},240)},popup:function(){playTone(440,.09,'triangle',${v(.06)},880)}};`;
    default: return `var SFX={correct:function(){playTone(523,.1,'sine',${v(.12)},659);setTimeout(function(){playTone(659,.15,'sine',${v(.1)},784)},100)},wrong:function(){playTone(330,.15,'sawtooth',${v(.08)},220)},click:function(){playTone(800,.04,'sine',${v(.06)})},flip:function(){playTone(600,.06,'triangle',${v(.08)},900)},spin:function(){playTone(440,.03,'sine',${v(.04)},880)},buzz:function(){playTone(200,.2,'sawtooth',${v(.1)},150)},complete:function(){playTone(523,.12,'sine',${v(.12)},659);setTimeout(function(){playTone(659,.12,'sine',${v(.1)},784)},120);setTimeout(function(){playTone(784,.25,'sine',${v(.12)},1047)},240)},popup:function(){playTone(440,.08,'sine',${v(.08)},880)}};`;
  }
})()}
function toggleSfx(){
  SFX_ON=!SFX_ON;
  document.querySelectorAll('.sfx-toggle').forEach(function(b){b.textContent=SFX_ON?'\ud83d\udd0a':'\ud83d\udd07'});
  if(SFX_ON)SFX.click();
}
var HIGH_CONTRAST=false;
function toggleContrast(){
  HIGH_CONTRAST=!HIGH_CONTRAST;
  document.body.classList.toggle('high-contrast',HIGH_CONTRAST);
  document.querySelectorAll('.contrast-toggle').forEach(function(b){b.textContent=HIGH_CONTRAST?'\ud83d\udf36':'\ud83d\udd32'});
  SFX.click();
}
var TOTAL_PAGES=${pages.length};
var CURRENT_PAGE=${idx};
function goPrev(){if(typeof prevSlide==='function'){prevSlide()}else if(CURRENT_PAGE>0){CURRENT_PAGE--;showPage(CURRENT_PAGE)}}
function goNext(){if(typeof nextSlide==='function'){nextSlide()}else if(CURRENT_PAGE<TOTAL_PAGES-1){CURRENT_PAGE++;showPage(CURRENT_PAGE)}}
function showPage(n){CURRENT_PAGE=n;if(typeof showSlide==='function'){showSlide(n)}else{SFX.click();}}
function initInteractive(){
document.querySelectorAll('[id^=quiz_]').forEach(function(el){
  var soal=KUIS_DATA.filter(function(k){return k.q.trim()});
  if(!soal.length){el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(245,200,66,.5);font-size:12px">❓ Belum ada soal</div>';return}
  var cur=0,score=0,answered=false,selected=-1;
  var letters=['A','B','C','D'];
  function render(){
    if(cur>=soal.length){
      SFX.complete();var pct=Math.round(score/soal.length*100);
      var lvl=pct>=85?'Sangat Baik':pct>=70?'Baik':'Perlu Latihan';
      var col=pct>=85?'#34d399':pct>=70?'#f5c842':'#f87171';
      el.innerHTML='<div class="qresult"><div class="score" style="color:'+col+'">'+pct+'%</div><div class="level" style="color:'+col+'">'+lvl+'</div><div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:2px">Skor: '+score+' dari '+soal.length+'</div><button onclick="this.parentNode.parentNode.__restart()">Ulangi Kuis</button></div>';
      return;
    }
    var q=soal[cur];
    var h='<div class="qbar"><div class="qbar-fill" style="width:'+((cur+1)/soal.length*100)+'%"></div></div>';
    h+='<div class="qhead"><span style="font-weight:700">Soal '+(cur+1)+'/'+soal.length+'</span><span>Skor: '+score+'</span></div>';
    h+='<div class="qq">'+esc(q.q)+'</div>';
    q.opts.forEach(function(o,oi){
      if(!o.trim())return;
      var cls='qopt';
      if(answered){
        if(oi===q.ans)cls+=' correct';
        else if(oi===selected)cls+=' wrong';
        else cls+=' disabled';
      }
      h+='<button class="'+cls+'" '+(answered?'disabled':'')+' data-oi="'+oi+'"><b style="color:rgba(245,200,66,.8);margin-right:4px">'+letters[oi]+'.</b>'+esc(o)+(answered&&oi===q.ans?' ✅':'')+(answered&&oi===selected&&oi!==q.ans?' ❌':'')+'</button>';
    });
    if(answered&&q.ex)h+='<div class="qex">💡 '+esc(q.ex)+'</div>';
    el.innerHTML=h;
    el.querySelectorAll('.qopt:not(.disabled)').forEach(function(btn){
      btn.addEventListener('click',function(){
        if(answered)return;
        selected=parseInt(this.getAttribute('data-oi'));
        answered=true;
        if(selected===q.ans)score++;if(selected===q.ans)SFX.correct();else SFX.wrong();
        render();
        setTimeout(function(){cur++;answered=false;selected=-1;render()},1500);
      });
    });
  }
  el.__restart=function(){cur=0;score=0;answered=false;selected=-1;render()};
  render();
});
document.querySelectorAll('[id^=game_]').forEach(function(el){
  var gi=parseInt(el.getAttribute('data-game-idx'));
  var mod=(!isNaN(gi)&&gi>=0&&gi<MODULES_DATA.length)?MODULES_DATA[gi]:null;
  if(!mod){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">🎮</span><span style="margin-top:4px">Belum ada game</span></div>';return}
  var t=mod.type;
  var title=mod.title||t;
  if(t==='truefalse'){
    var soal=(mod.soal||[]).filter(function(s){return s.teks});
    if(!soal.length){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">✅</span><span style="margin-top:4px">Belum ada soal True/False</span></div>';return}
    var ci=0,sc=0,ans=false,sel=null;
    function render(){
      if(ci>=soal.length){SFX.complete();var p=soal.length?Math.round(sc/soal.length*100):0;el.innerHTML='<div class="qresult"><div class="score" style="color:#3ecfcf">'+p+'%</div><div class="level" style="color:#3ecfcf">'+sc+'/'+soal.length+' benar</div><button onclick="this.parentNode.parentNode.__rs()">Ulangi</button></div>';return}
      var q=soal[ci];var benar=q.benar===true||q.benar==='true'||q.benar===1;
      var h='<div class="qhead"><span style="font-weight:700;color:#3ecfcf">Soal '+(ci+1)+'/'+soal.length+'</span><span style="color:#3ecfcf">Skor: '+sc+'</span></div>';
      h+='<div class="qq" style="color:#e0f2fe">'+esc(q.teks)+'</div>';
      h+='<div style="display:flex;gap:8px;margin-top:8px">';
      h+='<button class="tf-btn" style="flex:1;padding:10px;border-radius:8px;border:1px solid rgba(52,211,153,.3);background:rgba(52,211,153,.15);color:#6ee7b7;font-size:13px;font-weight:700;cursor:pointer;'+(ans?(benar?'':'opacity:.3'):'')+'" '+(ans?'disabled':'')+' data-v="true">✅ Benar</button>';
      h+='<button class="tf-btn" style="flex:1;padding:10px;border-radius:8px;border:1px solid rgba(239,68,68,.3);background:rgba(239,68,68,.15);color:#fca5a5;font-size:13px;font-weight:700;cursor:pointer;'+(ans?(!benar?'':'opacity:.3'):'')+'" '+(ans?'disabled':'')+' data-v="false">❌ Salah</button></div>';
      el.innerHTML=h;
    }
    el.addEventListener('click',function(e){var btn=e.target.closest&&e.target.closest('.tf-btn');if(!btn||ans)return;sel=btn.getAttribute('data-v')==='true';ans=true;var q=soal[ci];var benar=q.benar===true||q.benar==='true'||q.benar===1;if(sel===benar)sc++;if(sel===benar)SFX.correct();else SFX.wrong();render();setTimeout(function(){ci++;ans=false;sel=null;render()},1200)});
    el.__rs=function(){ci=0;sc=0;ans=false;sel=null;render()};render();
  } else if(t==='memory'){
    var pasangan=(mod.pasangan||[]).filter(function(p){return p.kiri||p.kanan});
    if(!pasangan.length){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">🧠</span><span style="margin-top:4px">Belum ada pasangan</span></div>';return}
    var memCards=[];
    pasangan.forEach(function(p,i){
      memCards.push({id:i*2,text:p.kiri||('?'+(i+1)),pairId:i,side:'left'});
      memCards.push({id:i*2+1,text:p.kanan||('?'+(i+1)),pairId:i,side:'right'});
    });
    for(var mi=memCards.length-1;mi>0;mi--){var mj=Math.floor(Math.random()*(mi+1));var mtmp=memCards[mi];memCards[mi]=memCards[mj];memCards[mj]=mtmp}
    var memFlipped=[];var memMatched={};var memMoves=0;var memDone=false;
    function renderMem(){
      if(memDone){
        el.innerHTML='<div class="qresult"><div style="font-size:28px">🎉</div><div class="score" style="color:#3ecfcf">Selesai!</div><div class="level" style="color:rgba(56,217,217,.6)">'+memMoves+' langkah</div><button onclick="this.parentNode.parentNode.__rs()">Ulangi</button></div>';
        return;
      }
      var mcols=memCards.length<=4?2:memCards.length<=8?3:4;
      var mMatchCount=Object.keys(memMatched).length/2;
      var mh='<div class="qhead"><span style="font-weight:700;color:#3ecfcf">🧠 Memory</span><span style="color:#3ecfcf">Langkah: '+memMoves+' | '+mMatchCount+'/'+pasangan.length+'</span></div>';
      mh+='<div style="display:grid;grid-template-columns:repeat('+mcols+',1fr);gap:4px;flex:1;min-height:0;overflow:auto">';
      memCards.forEach(function(card){
        var isF=memFlipped.indexOf(card.id)>=0;
        var isM=memMatched[card.id];
        var mBg=isM?'rgba(52,211,153,.2)':isF?'rgba(56,217,217,.3)':'rgba(255,255,255,.1)';
        var mBdr=isM?'rgba(52,211,153,.4)':isF?'rgba(56,217,217,.4)':'rgba(255,255,255,.1)';
        var mCur=isM||isF?'default':'pointer';
        var mScale=isM?';transform:scale(.95)':'';
        mh+='<button class="mem-card" data-card-id="'+card.id+'" style="display:flex;align-items:center;justify-content:center;padding:4px;border-radius:8px;border:1px solid '+mBdr+';background:'+mBg+';cursor:'+mCur+';font-size:9px;color:#a5f3fc;font-weight:500;text-align:center;line-height:1.2;min-height:28px;transition:all .3s'+mScale+'">';
        mh+=(isF||isM)?esc(card.text):'❓';
        mh+='</button>';
      });
      mh+='</div>';
      el.innerHTML=mh;
    }
    el.addEventListener('click',function(e){
      var btn=e.target.closest&&e.target.closest('.mem-card');
      if(!btn||memDone)return;
      var cid=parseInt(btn.getAttribute('data-card-id'));
      if(memMatched[cid])return;
      if(memFlipped.indexOf(cid)>=0)return;
      if(memFlipped.length>=2)return;
      memFlipped.push(cid);
      if(memFlipped.length===2){
        memMoves++;
        var mc1=memCards.find(function(c){return c.id===memFlipped[0]});
        var mc2=memCards.find(function(c){return c.id===memFlipped[1]});
        if(mc1&&mc2&&mc1.pairId===mc2.pairId&&mc1.side!==mc2.side){
          memMatched[memFlipped[0]]=true;SFX.correct();
          memMatched[memFlipped[1]]=true;
          memFlipped=[];
          if(Object.keys(memMatched).length===memCards.length){memDone=true;SFX.complete()}
          renderMem();
        }else{
          SFX.wrong();renderMem();
          var mfl=memFlipped.slice();
          setTimeout(function(){memFlipped=[];renderMem()},800);
        }
      }else{renderMem()}
    });
    el.__rs=function(){memFlipped=[];memMatched={};memMoves=0;memDone=false;for(var ri=memCards.length-1;ri>0;ri--){var rj=Math.floor(Math.random()*(ri+1));var rt=memCards[ri];memCards[ri]=memCards[rj];memCards[rj]=rt}renderMem()};
    renderMem();
  } else if(t==='matching'){
    var mPairs=(mod.pasangan||[]).filter(function(p){return p.kiri||p.kanan});
    if(!mPairs.length){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">🔀</span><span style="margin-top:4px">Belum ada pasangan</span></div>';return}
    var rightItems=mPairs.map(function(p,i){return{idx:i,text:p.kanan||''}});
    for(var si=rightItems.length-1;si>0;si--){var sj=Math.floor(Math.random()*(si+1));var stmp=rightItems[si];rightItems[si]=rightItems[sj];rightItems[sj]=stmp}
    var selLeft=-1;var matchLeft={};var matchRight={};var wrongRight=-1;var matchDone=false;var matchLocked=false;
    function renderMatch(){
      if(matchDone){
        el.innerHTML='<div class="qresult"><div style="font-size:28px">🎉</div><div class="score" style="color:#3ecfcf">Semua Cocok!</div><button onclick="this.parentNode.parentNode.__rs()">Ulangi</button></div>';
        return;
      }
      var mth='<div class="qhead"><span style="font-weight:700;color:#3ecfcf">🔀 Pasangkan</span></div>';
      mth+='<div style="display:flex;gap:6px;flex:1;min-height:0;overflow:hidden">';
      mth+='<div style="flex:1;display:flex;flex-direction:column;gap:4px;overflow-y:auto">';
      mPairs.forEach(function(p,i){
        var isML=matchLeft[i];var isSL=selLeft===i;
        var lBg=isML?'rgba(52,211,153,.2)':isSL?'rgba(56,217,217,.3)':'rgba(255,255,255,.05)';
        var lBdr=isML?'1px solid rgba(52,211,153,.4)':isSL?'1px solid rgba(56,211,217,.5)':'1px solid rgba(255,255,255,.1)';
        var lCol=isML?'#6ee7b7':'#a5f3fc';
        var lTd=isML?'line-through':'none';
        var lOp=isML?'.6':'1';
        var lCur=isML?'default':'pointer';
        mth+='<button class="match-left" data-left-idx="'+i+'" style="padding:6px 8px;border-radius:6px;border:'+lBdr+';background:'+lBg+';color:'+lCol+';font-size:9px;text-align:left;cursor:'+lCur+';opacity:'+lOp+';text-decoration:'+lTd+';transition:all .2s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(p.kiri||'')+'</button>';
      });
      mth+='</div>';
      mth+='<div style="flex:1;display:flex;flex-direction:column;gap:4px;overflow-y:auto">';
      rightItems.forEach(function(r){
        var isMR=matchRight[r.idx];var isWR=wrongRight===r.idx;
        var rBg=isMR?'rgba(52,211,153,.2)':isWR?'rgba(239,68,68,.3)':'rgba(255,255,255,.05)';
        var rBdr=isMR?'1px solid rgba(52,211,153,.4)':isWR?'1px solid rgba(239,68,68,.4)':'1px solid rgba(255,255,255,.1)';
        var rCol=isMR?'#6ee7b7':isWR?'#fca5a5':'#a5f3fc';
        var rTd=isMR?'line-through':'none';
        var rOp=isMR?'.6':'1';
        var rCur=isMR?'default':'pointer';
        mth+='<button class="match-right" data-right-idx="'+r.idx+'" style="padding:6px 8px;border-radius:6px;border:'+rBdr+';background:'+rBg+';color:'+rCol+';font-size:9px;text-align:left;cursor:'+rCur+';opacity:'+rOp+';text-decoration:'+rTd+';transition:all .2s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(r.text)+'</button>';
      });
      mth+='</div></div>';
      el.innerHTML=mth;
    }
    el.addEventListener('click',function(e){
      if(matchDone||matchLocked)return;
      var lBtn=e.target.closest&&e.target.closest('.match-left');
      var rBtn=e.target.closest&&e.target.closest('.match-right');
      if(lBtn){
        var li=parseInt(lBtn.getAttribute('data-left-idx'));
        if(matchLeft[li])return;
        selLeft=li;wrongRight=-1;renderMatch();
      }else if(rBtn){
        if(selLeft<0)return;
        var ri=parseInt(rBtn.getAttribute('data-right-idx'));
        if(matchRight[ri])return;
        if(selLeft===ri){
          matchLeft[selLeft]=true;matchRight[ri]=true;selLeft=-1;wrongRight=-1;SFX.correct();
          if(Object.keys(matchLeft).length===mPairs.length){matchDone=true;SFX.complete()}
          renderMatch();
        }else{
          wrongRight=ri;SFX.wrong();selLeft=-1;matchLocked=true;renderMatch();
          setTimeout(function(){wrongRight=-1;matchLocked=false;renderMatch()},600);
        }
      }
    });
    el.__rs=function(){selLeft=-1;matchLeft={};matchRight={};wrongRight=-1;matchDone=false;matchLocked=false;for(var ri=rightItems.length-1;ri>0;ri--){var rj=Math.floor(Math.random()*(ri+1));var rt=rightItems[ri];rightItems[ri]=rightItems[rj];rightItems[rj]=rt}renderMatch()};
    renderMatch();
  } else if(t==='roda'){
    var rOpsi=(mod.opsi||[]).filter(function(o){return o&&String(o).trim()});
    if(rOpsi.length<2){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">🎡</span><span style="margin-top:4px">Butuh min. 2 opsi</span></div>';return}
    var rColors=['#f9c82e','#3ecfcf','#a78bfa','#34d399','#ff6b6b','#fb923c','#60a5fa','#f472b6'];
    var rRot=0,rSpinning=false,rResult=null;
    function buildWheelSVG(rot){
      var n=rOpsi.length;var slice=360/n;
      var svg='<svg width="160" height="160" viewBox="0 0 140 140" style="transition:transform 2.5s cubic-bezier(.17,.67,.12,.99);transform:rotate('+rot+'deg)">';
      for(var i=0;i<n;i++){
        var sa=i*slice,ea=(i+1)*slice;
        var sr=(sa-90)*Math.PI/180,er=(ea-90)*Math.PI/180;
        var x1=70+65*Math.cos(sr),y1=70+65*Math.sin(sr);
        var x2=70+65*Math.cos(er),y2=70+65*Math.sin(er);
        var la=ea-sa>180?1:0;
        svg+='<path d="M70,70 L'+x1.toFixed(1)+','+y1.toFixed(1)+' A65,65 0 '+la+',1 '+x2.toFixed(1)+','+y2.toFixed(1)+' Z" fill="'+rColors[i%rColors.length]+'" opacity="0.8"/>';
        var mr=((sa+ea)/2-90)*Math.PI/180;
        var tx=70+38*Math.cos(mr),ty=70+38*Math.sin(mr);
        svg+='<text x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="7" font-weight="bold" transform="rotate('+(sa+slice/2).toFixed(1)+','+tx.toFixed(1)+','+ty.toFixed(1)+')">'+esc(String(rOpsi[i]).substring(0,6))+'</text>';
      }
      svg+='<circle cx="70" cy="70" r="10" fill="#1a1a2e"/></svg>';
      return svg;
    }
    function renderRoda(){
      var h='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:6px">';
      h+='<div style="font-size:10px;font-weight:700;color:#3ecfcf;margin-bottom:4px">🎡 Roda Putar</div>';
      h+='<div style="position:relative">'+buildWheelSVG(rRot)+'<div style="position:absolute;top:-2px;left:50%;transform:translateX(-50%);font-size:14px">▼</div></div>';
      if(rResult)h+='<div style="font-size:12px;font-weight:700;color:#fbbf24;margin-top:6px">'+esc(rResult)+'</div>';
      h+='<button class="roda-spin-btn" style="margin-top:6px;padding:6px 16px;border-radius:8px;border:1px solid rgba(56,217,217,.3);background:rgba(56,217,217,.2);color:#a5f3fc;font-size:11px;font-weight:700;cursor:pointer'+(rSpinning?';opacity:.5;cursor:default':'')+'">'+(rSpinning?'Berputar...':'Putar!')+'</button>';
      h+='</div>';
      el.innerHTML=h;
    }
    el.addEventListener('click',function(e){
      var btn=e.target.closest&&e.target.closest('.roda-spin-btn');
      if(!btn||rSpinning)return;
      rSpinning=true;SFX.spin();rResult=null;
      var extra=Math.floor(Math.random()*360)+360*3;
      rRot+=extra;renderRoda();
      setTimeout(function(){
        rSpinning=false;
        var norm=rRot%360;var slice=360/rOpsi.length;
        var idx=Math.floor(((360-norm+slice/2)%360)/slice);
        rResult=rOpsi[Math.min(idx,rOpsi.length-1)];SFX.popup();
        renderRoda();
      },2600);
    });
    el.__rs=function(){rRot=0;rSpinning=false;rResult=null;renderRoda()};
    renderRoda();
  } else if(t==='sorting'){
    var sKategori=(mod.kategori||[]);
    var sItems=(mod.items||[]).filter(function(i){return i&&i.teks});
    if(!sItems.length||!sKategori.length){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">🔢</span><span style="margin-top:4px">Belum ada item/kategori</span></div>';return}
    var sSorted={},sWrong=null,sDone=false;
    function renderSort(){
      if(sDone){el.innerHTML='<div class="qresult"><div style="font-size:28px">🎉</div><div class="score" style="color:#3ecfcf">Semua Tersortir!</div><button onclick="this.parentNode.parentNode.__rs()">Ulangi</button></div>';return}
      var h='<div style="display:flex;flex-direction:column;height:100%;padding:6px;overflow:hidden">';
      h+='<div style="font-size:10px;font-weight:700;color:#3ecfcf;margin-bottom:4px">🔢 Klasifikasi</div>';
      var unsorted=sItems.filter(function(i){return !Object.values(sSorted).flat().includes(i.teks)});
      if(unsorted.length>0){
        h+='<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">';
        unsorted.forEach(function(i){h+='<span style="font-size:9px;padding:2px 6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:4px;color:#a5f3fc">'+esc(i.teks)+'</span>'});
        h+='</div>';
      }
      sKategori.forEach(function(cat){
        var cid=cat.id||cat.label;var cc=cat.color||'#3ecfcf';var si=sSorted[cid]||[];
        var isW=sWrong===cid;
        h+='<div style="border-radius:6px;border:1px solid '+(isW?'rgba(239,68,68,.4)':'rgba(255,255,255,.1)')+';background:'+(isW?'rgba(239,68,68,.15)':'rgba(255,255,255,.03)')+';padding:4px 6px;margin-bottom:4px;border-left:3px solid '+cc+';min-height:24px">';
        h+='<div style="font-size:9px;font-weight:700;color:'+cc+';margin-bottom:2px">'+esc(cat.label||'')+'</div>';
        if(si.length){h+='<div style="display:flex;flex-wrap:wrap;gap:2px">';si.forEach(function(t){h+='<span style="font-size:8px;padding:1px 5px;background:rgba(52,211,153,.2);border:1px solid rgba(52,211,153,.3);border-radius:3px;color:#6ee7b7">'+esc(t)+'</span>'});h+='</div>'}
        unsorted.forEach(function(i){h+='<button class="sort-drop" data-item="'+esc(i.teks)+'" data-cat="'+cid+'" style="font-size:7px;padding:1px 4px;border-radius:3px;border:1px dashed rgba(255,255,255,.15);background:rgba(255,255,255,.03);color:rgba(255,255,255,.4);cursor:pointer;margin:1px">+ '+esc(i.teks)+'</button>'});
        h+='</div>';
      });
      h+='</div>';
      el.innerHTML=h;
    }
    el.addEventListener('click',function(e){
      if(sDone)return;
      var btn=e.target.closest&&e.target.closest('.sort-drop');
      if(!btn)return;
      var itemText=btn.getAttribute('data-item');var catId=btn.getAttribute('data-cat');
      var correct=sItems.find(function(i){return i.teks===itemText});
      if(correct&&correct.kategori===catId){
        if(!sSorted[catId])sSorted[catId]=[];
        sSorted[catId].push(itemText);SFX.correct();
        sWrong=null;
        var totalSorted=Object.values(sSorted).flat().length;
        if(totalSorted===sItems.length){sDone=true;SFX.complete()}
        renderSort();
      }else{
        sWrong=catId;SFX.wrong();renderSort();
        setTimeout(function(){sWrong=null;renderSort()},500);
      }
    });
    el.__rs=function(){sSorted={};sWrong=null;sDone=false;renderSort()};
    renderSort();
  } else if(t==='spinwheel'){
    var swSoal=(mod.soal||[]).filter(function(s){return s&&s.teks});
    if(swSoal.length<2){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">🎡</span><span style="margin-top:4px">Butuh min. 2 soal</span></div>';return}
    var swColors=['#f9c82e','#3ecfcf','#a78bfa','#34d399','#ff6b6b','#fb923c','#60a5fa','#f472b6'];
    var swRot=0,swSpinning=false,swResult=null;
    function buildSpinSVG(rot){
      var n=swSoal.length;var slice=360/n;
      var svg='<svg width="160" height="160" viewBox="0 0 140 140" style="transition:transform 2.5s cubic-bezier(.17,.67,.12,.99);transform:rotate('+rot+'deg)">';
      for(var i=0;i<n;i++){
        var sa=i*slice,ea=(i+1)*slice;
        var sr=(sa-90)*Math.PI/180,er=(ea-90)*Math.PI/180;
        var x1=70+65*Math.cos(sr),y1=70+65*Math.sin(sr);
        var x2=70+65*Math.cos(er),y2=70+65*Math.sin(er);
        var la=ea-sa>180?1:0;
        svg+='<path d="M70,70 L'+x1.toFixed(1)+','+y1.toFixed(1)+' A65,65 0 '+la+',1 '+x2.toFixed(1)+','+y2.toFixed(1)+' Z" fill="'+swColors[i%swColors.length]+'" opacity="0.8"/>';
        var mr=((sa+ea)/2-90)*Math.PI/180;
        var tx=70+38*Math.cos(mr),ty=70+38*Math.sin(mr);
        svg+='<text x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="9" font-weight="bold">'+(i+1)+'</text>';
      }
      svg+='<circle cx="70" cy="70" r="10" fill="#1a1a2e"/></svg>';
      return svg;
    }
    function renderSpin(){
      var h='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:6px">';
      h+='<div style="font-size:10px;font-weight:700;color:#3ecfcf;margin-bottom:4px">🎡 Roda Pertanyaan</div>';
      h+='<div style="position:relative">'+buildSpinSVG(swRot)+'<div style="position:absolute;top:-2px;left:50%;transform:translateX(-50%);font-size:14px">▼</div></div>';
      if(swResult){
        h+='<div style="margin-top:6px;text-align:center;max-width:90%">';
        if(swResult.kategori)h+='<div style="font-size:9px;color:rgba(56,217,217,.6)">'+esc(swResult.kategori)+'</div>';
        h+='<div style="font-size:12px;font-weight:700;color:#fbbf24">'+esc(swResult.teks)+'</div>';
        h+='</div>';
      }
      h+='<button class="sw-spin-btn" style="margin-top:6px;padding:6px 16px;border-radius:8px;border:1px solid rgba(56,217,217,.3);background:rgba(56,217,217,.2);color:#a5f3fc;font-size:11px;font-weight:700;cursor:pointer'+(swSpinning?';opacity:.5;cursor:default':'')+'">'+(swSpinning?'Berputar...':'Putar!')+'</button>';
      h+='</div>';
      el.innerHTML=h;
    }
    el.addEventListener('click',function(e){
      var btn=e.target.closest&&e.target.closest('.sw-spin-btn');
      if(!btn||swSpinning)return;
      swSpinning=true;SFX.spin();swResult=null;
      var extra=Math.floor(Math.random()*360)+360*3;
      swRot+=extra;renderSpin();
      setTimeout(function(){
        swSpinning=false;
        var norm=swRot%360;var slice=360/swSoal.length;
        var idx=Math.floor(((360-norm+slice/2)%360)/slice);
        swResult=swSoal[Math.min(idx,swSoal.length-1)];SFX.popup();
        renderSpin();
      },2600);
    });
    el.__rs=function(){swRot=0;swSpinning=false;swResult=null;renderSpin()};
    renderSpin();
  } else if(t==='teambuzzer'){
    var tbSoal=(mod.soal||[]).filter(function(s){return s&&s.teks});
    var tbTimA=(mod.timA||'Tim A');
    var tbTimB=(mod.timB||'Tim B');
    if(!tbSoal.length){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">🏆</span><span style="margin-top:4px">Belum ada soal</span></div>';return}
    var tbQ=0,tbSA=0,tbSB=0,tbBuzz=null,tbCorrect=null,tbDone=false;
    function renderTB(){
      if(tbDone){
        var w=tbSA>tbSB?tbTimA:tbSB>tbSA?tbTimB:'Seri';
        el.innerHTML='<div class="qresult"><div style="font-size:28px">🏆</div><div class="score" style="color:#3ecfcf">'+esc(w)+' Menang!</div><div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:2px">'+esc(tbTimA)+': '+tbSA+' | '+esc(tbTimB)+': '+tbSB+'</div><button onclick="this.parentNode.parentNode.__rs()">Ulangi</button></div>';
        return;
      }
      var q=tbSoal[tbQ];var pts=q.poin||10;
      var h='<div style="display:flex;flex-direction:column;height:100%;padding:6px;overflow:hidden">';
      h+='<div style="display:flex;justify-content:space-between;font-size:10px;color:#3ecfcf;margin-bottom:4px"><span style="font-weight:700">Soal '+(tbQ+1)+'/'+tbSoal.length+'</span><span>+'+pts+' poin</span></div>';
      h+='<div style="font-size:12px;font-weight:700;color:#e0f2fe;flex:1;overflow-y:auto;margin-bottom:4px">'+esc(q.teks)+'</div>';
      h+='<div style="display:flex;gap:6px;margin-bottom:4px">';
      h+='<button class="tb-buzz" data-team="A" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(59,130,246,'+(tbBuzz?'0.2':'0.4')+');background:rgba(59,130,246,'+(tbBuzz==='A'?'0.3':'0.15')+');color:#93c5fd;font-size:11px;font-weight:700;cursor:'+(tbBuzz?'default':'pointer')+';'+(tbCorrect==='A'?'background:rgba(52,211,153,.3);border-color:rgba(52,211,153,.4);color:#6ee7b7':'')+'">'+esc(tbTimA)+' ('+tbSA+')</button>';
      h+='<button class="tb-buzz" data-team="B" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(251,146,60,'+(tbBuzz?'0.2':'0.4')+');background:rgba(251,146,60,'+(tbBuzz==='B'?'0.3':'0.15')+');color:#fdba74;font-size:11px;font-weight:700;cursor:'+(tbBuzz?'default':'pointer')+';'+(tbCorrect==='B'?'background:rgba(52,211,153,.3);border-color:rgba(52,211,153,.4);color:#6ee7b7':'')+'">'+esc(tbTimB)+' ('+tbSB+')</button>';
      h+='</div>';
      if(tbBuzz&&!tbCorrect){
        h+='<div style="display:flex;gap:6px">';
        h+='<button class="tb-verdict" data-v="benar" style="flex:1;padding:6px;border-radius:6px;border:1px solid rgba(52,211,153,.3);background:rgba(52,211,153,.15);color:#6ee7b7;font-size:10px;font-weight:700;cursor:pointer">Benar ('+tbBuzz+')</button>';
        h+='<button class="tb-verdict" data-v="salah" style="flex:1;padding:6px;border-radius:6px;border:1px solid rgba(239,68,68,.3);background:rgba(239,68,68,.15);color:#fca5a5;font-size:10px;font-weight:700;cursor:pointer">Salah ('+tbBuzz+')</button>';
        h+='</div>';
      }
      h+='</div>';
      el.innerHTML=h;
    }
    el.addEventListener('click',function(e){
      if(tbDone)return;
      var buzzBtn=e.target.closest&&e.target.closest('.tb-buzz');
      var verdictBtn=e.target.closest&&e.target.closest('.tb-verdict');
      if(buzzBtn&&!tbBuzz){
        tbBuzz=buzzBtn.getAttribute('data-team');SFX.buzz();renderTB();
      }else if(verdictBtn&&tbBuzz&&!tbCorrect){
        var v=verdictBtn.getAttribute('data-v');
        if(v==='benar'){
          var pts=tbSoal[tbQ].poin||10;
          if(tbBuzz==='A')tbSA+=pts;else tbSB+=pts;
          tbCorrect=tbBuzz;SFX.correct();renderTB();
          setTimeout(function(){
            if(tbQ+1<tbSoal.length){tbQ++;tbBuzz=null;tbCorrect=null;renderTB()}
            else{tbDone=true;SFX.complete();renderTB()}
          },1500);
        }else{
          var other=tbBuzz==='A'?'B':'A';
          var pts2=tbSoal[tbQ].poin||10;
          if(other==='A')tbSA+=pts2;else tbSB+=pts2;
          tbCorrect=other;SFX.wrong();renderTB();
          setTimeout(function(){
            if(tbQ+1<tbSoal.length){tbQ++;tbBuzz=null;tbCorrect=null;renderTB()}
            else{tbDone=true;SFX.complete();renderTB()}
          },1500);
        }
      }
    });
    el.__rs=function(){tbQ=0;tbSA=0;tbSB=0;tbBuzz=null;tbCorrect=null;tbDone=false;renderTB()};
    renderTB();
  } else if(t==='wordsearch'){
    var wsKata=(mod.kata||[]).filter(function(k){return k&&String(k).trim()});
    var wsSize=mod.ukuran||8;
    if(!wsKata.length){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">🔍</span><span style="margin-top:4px">Belum ada kata</span></div>';return}
    var wsGrid=[],wsFound={},wsSel=null,wsDone=false;
    function genWSGrid(){
      var g=[];for(var r=0;r<wsSize;r++){g[r]=[];for(var c=0;c<wsSize;c++)g[r][c]=''}
      var dirs=[[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1]];
      wsKata.forEach(function(word){word=String(word).toUpperCase();
        for(var att=0;att<80;att++){
          var d=dirs[Math.floor(Math.random()*dirs.length)];
          var sr=Math.floor(Math.random()*wsSize),sc=Math.floor(Math.random()*wsSize);
          var fits=true;
          for(var i=0;i<word.length;i++){var r2=sr+d[0]*i,c2=sc+d[1]*i;if(r2<0||r2>=wsSize||c2<0||c2>=wsSize){fits=false;break}if(g[r2][c2]!==''&&g[r2][c2]!==word[i]){fits=false;break}}
          if(fits){for(var i=0;i<word.length;i++)g[sr+d[0]*i][sc+d[1]*i]=word[i];break}
        }
      });
      for(var r=0;r<wsSize;r++)for(var c=0;c<wsSize;c++)if(g[r][c]==='')g[r][c]=String.fromCharCode(65+Math.floor(Math.random()*26));
      return g;
    }
    wsGrid=genWSGrid();
    function renderWS(){
      if(wsDone){el.innerHTML='<div class="qresult"><div style="font-size:28px">🎉</div><div class="score" style="color:#3ecfcf">Semua Ditemukan!</div><button onclick="this.parentNode.parentNode.__rs()">Ulangi</button></div>';return}
      var cs=Math.min(22,Math.floor((el.offsetWidth||300)/wsSize)-2);
      var h='<div style="display:flex;flex-direction:column;height:100%;padding:4px;overflow:hidden">';
      h+='<div style="font-size:10px;font-weight:700;color:#3ecfcf;margin-bottom:3px">🔍 Teka-Teki Kata</div>';
      h+='<div style="display:flex;gap:4px;flex:1;min-height:0;overflow:hidden">';
      h+='<div style="display:grid;grid-template-columns:repeat('+wsSize+','+cs+'px);gap:1px;flex-shrink:0">';
      for(var r=0;r<wsSize;r++)for(var c=0;c<wsSize;c++){
        var isSel=wsSel&&wsSel[0]===r&&wsSel[1]===c;
        var letter=wsGrid[r][c];
        var isFoundWord=false;wsKata.forEach(function(k){if(wsFound[String(k).toUpperCase()])isFoundWord=true});
        h+='<button class="ws-cell" data-r="'+r+'" data-c="'+c+'" style="width:'+cs+'px;height:'+cs+'px;font-size:'+(cs>16?9:7)+'px;border-radius:3px;border:none;font-weight:700;cursor:pointer;'+(isSel?'background:rgba(245,158,11,.4);color:#fde68a':'background:rgba(255,255,255,.05);color:rgba(255,255,255,.6)')+'">'+letter+'</button>';
      }
      h+='</div>';
      h+='<div style="flex:1;display:flex;flex-direction:column;gap:2px;min-width:50px;overflow-y:auto">';
      wsKata.forEach(function(k){
        var fk=String(k).toUpperCase();var f=wsFound[fk];
        h+='<span style="font-size:8px;padding:2px 5px;border-radius:3px;'+(f?'background:rgba(52,211,153,.2);color:#6ee7b7;text-decoration:line-through':'background:rgba(255,255,255,.05);color:rgba(255,255,255,.4)')+'">'+esc(k)+'</span>';
      });
      h+='</div></div></div>';
      el.innerHTML=h;
    }
    el.addEventListener('click',function(e){
      var btn=e.target.closest&&e.target.closest('.ws-cell');
      if(!btn||wsDone)return;
      var r=parseInt(btn.getAttribute('data-r')),c=parseInt(btn.getAttribute('data-c'));
      if(!wsSel){
        wsSel=[r,c];renderWS();
      }else{
        var sr=wsSel[0],sc=wsSel[1];
        var dr=r-sr,dc=c-sc;
        if(dr===0&&dc===0){wsSel=null;renderWS();return}
        var steps=Math.max(Math.abs(dr),Math.abs(dc));
        var stepR=dr===0?0:dr/Math.abs(dr)*(Math.abs(dr)/steps);
        var stepC=dc===0?0:dc/Math.abs(dc)*(Math.abs(dc)/steps);
        var word='';var valid=true;
        for(var i=0;i<=steps;i++){
          var cr=Math.round(sr+stepR*i),cc=Math.round(sc+stepC*i);
          if(cr<0||cr>=wsSize||cc<0||cc>=wsSize){valid=false;break}
          word+=wsGrid[cr][cc];
        }
        if(valid){
          var revWord=word.split('').reverse().join('');
          var foundWord=wsKata.find(function(k){var ku=String(k).toUpperCase();return(ku===word||ku===revWord)&&!wsFound[ku]});
          if(foundWord){wsFound[String(foundWord).toUpperCase()]=true;SFX.correct();if(Object.keys(wsFound).length===wsKata.length){wsDone=true;SFX.complete()}}
        }
        wsSel=null;renderWS();
      }
    });
    el.__rs=function(){wsFound={};wsSel=null;wsDone=false;wsGrid=genWSGrid();renderWS()};
    renderWS();
  } else if(t==='flashcard'){
    var fcKartu=(mod.kartu||[]).filter(function(k){return k&&(k.depan||k.belakang)});
    if(!fcKartu.length){el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(56,217,217,.5);font-size:12px"><span style="font-size:28px">🃏</span><span style="margin-top:4px">Belum ada kartu</span></div>';return}
    var fcIdx=0,fcFlipped=false;
    function renderFC(){
      var card=fcKartu[fcIdx];
      var h='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:8px">';
      h+='<div style="font-size:10px;font-weight:700;color:#3ecfcf;margin-bottom:6px">🃏 Flashcard '+(fcIdx+1)+'/'+fcKartu.length+'</div>';
      h+='<button class="fc-card" style="width:100%;flex:1;min-height:0;border-radius:10px;border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;padding:12px;cursor:pointer;transition:all .3s;background:'+(fcFlipped?'rgba(56,217,217,.15)':'rgba(255,255,255,.05)')+'">';
      h+='<span style="font-size:13px;font-weight:700;color:#a5f3fc;text-align:center">'+esc(fcFlipped?(card.belakang||''):(card.depan||''))+'</span>';
      h+='</button>';
      h+='<div style="display:flex;gap:6px;margin-top:6px;width:100%">';
      if(fcIdx>0)h+='<button class="fc-prev" style="flex:1;padding:6px;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#a5f3fc;font-size:10px;font-weight:700;cursor:pointer">← Sebelumnya</button>';
      if(fcIdx<fcKartu.length-1)h+='<button class="fc-next" style="flex:1;padding:6px;border-radius:6px;border:1px solid rgba(56,217,217,.3);background:rgba(56,217,217,.15);color:#a5f3fc;font-size:10px;font-weight:700;cursor:pointer">Selanjutnya →</button>';
      h+='</div></div>';
      el.innerHTML=h;
    }
    el.addEventListener('click',function(e){
      var card=e.target.closest&&e.target.closest('.fc-card');
      var prev=e.target.closest&&e.target.closest('.fc-prev');
      var next=e.target.closest&&e.target.closest('.fc-next');
      if(card){fcFlipped=!fcFlipped;SFX.flip();renderFC()}
      else if(prev&&fcIdx>0){fcIdx--;fcFlipped=false;renderFC()}
      else if(next&&fcIdx<fcKartu.length-1){fcIdx++;fcFlipped=false;renderFC()}
    });
    el.__rs=function(){fcIdx=0;fcFlipped=false;renderFC()};
    renderFC();
  } else {
    var icons={roda:'🎡',memory:'🧠',matching:'🔀',sorting:'🔢',spinwheel:'🎡',teambuzzer:'🏆',wordsearch:'🔍',flashcard:'🃏'};
    var labels={roda:'Roda Putar',memory:'Memory Match',matching:'Pasangkan',sorting:'Klasifikasi',spinwheel:'Roda Pertanyaan',teambuzzer:'Kuis Tim',wordsearch:'Teka-Teki Kata',flashcard:'Flashcard'};
    el.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%"><span style="font-size:28px">'+(icons[t]||'🎮')+'</span><div style="font-size:13px;font-weight:700;color:#3ecfcf;margin-top:4px">'+(labels[t]||title)+'</div><div style="font-size:10px;color:rgba(56,217,217,.5);margin-top:2px">'+(title||'Game Interaktif')+'</div></div>';
  }
});
}
if(document.readyState==='complete'||document.readyState==='interactive')initInteractive();
else document.addEventListener('DOMContentLoaded',initInteractive);
<\/script>${getBridgeInjectHTML()}</body></html>`;
    },

    exportSlideshowHTML: () => {
      const { pages } = get();
      const ratio = RATIOS.find(r => r.id === get().ratioId) || RATIOS[0];
      // Get nav config from first page for slideshow nav style
      const firstNavConfig = pages[0]?.navConfig || { showNavbar: true, showPrevNext: true, showScore: true, showProgress: true, navbarStyle: 'colorful', navbarPosition: 'top' as const, navButtonStyle: 'pill' as const };
      const navBtnStyle = firstNavConfig.navButtonStyle || 'pill';

      // Build nav button HTML based on style
      const btnStyleMap: Record<string, string> = {
        circle: `width:40px;height:40px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;padding:0`,
        pill: `padding:10px 24px;border-radius:99px;font-size:14px;font-weight:800`,
        arrow: `padding:10px 16px;border-radius:8px;font-size:20px;font-weight:900`,
        icon: `padding:10px 16px;border-radius:10px;font-size:18px`,
      };
      const prevLabel = navBtnStyle === 'icon' ? '⬅' : navBtnStyle === 'arrow' ? '←' : '◀ Prev';
      const nextLabel = navBtnStyle === 'icon' ? '➡' : navBtnStyle === 'arrow' ? '→' : 'Next ▶';
      const navBtnCSS = btnStyleMap[navBtnStyle as string] || btnStyleMap.pill;

      // Use each page's own export but strip the standalone wrapper
      const slidesHtml = pages.map((p, i) => {
        const fullHtml = get().exportPageHTML(i);
        // Extract just the slide content and its script
        const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/);
        const bodyContent = bodyMatch ? bodyMatch[1] : '';
        // Replace the slide div to support multi-slide display
        return bodyContent.replace(/<div class="slide"/, `<div class="slide" data-slide="${i}" style="display:${i === 0 ? 'block' : 'none'}"`);
      }).join('\n');

      // Collect all unique script content
      const firstPageScript = (() => {
        const fullHtml = get().exportPageHTML(0);
        const scriptMatch = fullHtml.match(/<script>([\s\S]*)<\/script>/);
        return scriptMatch ? scriptMatch[1] : '';
      })();

      return `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Canva Slideshow</title><link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0e0c15;font-family:'Nunito',sans-serif}
.slide{position:relative;width:${ratio.w}px;height:${ratio.h}px;overflow:hidden;${pages[0]?.bgDataUrl ? `background-image:url('${pages[0].bgDataUrl}');background-size:cover` : `background:${pages[0]?.bgColor || '#1a1a2e'}`}}
.slideshow-nav{position:fixed;bottom:20px;display:flex;gap:8px;z-index:999}
.slideshow-nav button{border:none;background:rgba(255,255,255,.1);color:#fff;cursor:pointer;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);transition:all .15s}
.slideshow-nav button:hover{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.2)}
.slideshow-nav button:disabled{opacity:.3;cursor:default}
.slide-num{position:fixed;top:20px;right:20px;color:rgba(255,255,255,.5);font-size:12px;z-index:999;font-weight:800}
</style></head>
<body>
${slidesHtml}
<div class="slideshow-nav">
  <button onclick="prevSlide()" id="btnPrev" style="${navBtnCSS}">${prevLabel}</button>
  <button onclick="nextSlide()" id="btnNext" style="${navBtnCSS}">${nextLabel}</button>
</div>
<div class="slide-num" id="slideNum">1/${pages.length}</div>
<script>
let cur=0;const total=${pages.length};const slides=document.querySelectorAll('.slide');
function showSlide(n){
  slides.forEach((s,i)=>s.style.display=i===n?'block':'none');
  document.getElementById('slideNum').textContent=(n+1)+'/'+total;
  document.getElementById('btnPrev').disabled=(n===0);
  document.getElementById('btnNext').disabled=(n===total-1);
  window.scrollTo(0,0);
}
function nextSlide(){if(cur<total-1){cur++;showSlide(cur);if(typeof SFX!=='undefined')SFX.click();}}
function prevSlide(){if(cur>0){cur--;showSlide(cur);if(typeof SFX!=='undefined')SFX.click();}}
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')nextSlide();if(e.key==='ArrowLeft')prevSlide()});
showSlide(0);
${firstPageScript}
<\/script></body></html>`;
    },

    // ── NEW: Template-Based Export (Phase 4) ─────────────────────
    // Uses the new assembly system to merge base CSS + per-page
    // templates + JS engine into a single HTML file.
    // Preview = Export because they use the same templates.
    exportTemplateHTML: () => {
      const authStore = useAuthoringStore.getState();

      // Build input from authoring store
      const input: AutoBuildInput = {
        meta: authStore.meta,
        cp: authStore.cp,
        tp: authStore.tp,
        atp: authStore.atp,
        alur: authStore.alur,
        kuis: authStore.kuis.filter(k => k.q.trim()),
        materi: authStore.materi,
        modules: authStore.modules,
        skenario: authStore.skenario,
        games: authStore.games,
        sfxConfig: authStore.sfxConfig,
      };

      // Run auto-build pipeline
      const result = autoBuildPages(input);

      // Assemble into complete HTML
      const html = assembleHtml(result.pages, {
        title: result.title,
        namaBab: result.namaBab,
        sfxTheme: result.sfxTheme as any,
        sfxVolume: result.sfxVolume,
      });

      return html;
    },
  };
}
