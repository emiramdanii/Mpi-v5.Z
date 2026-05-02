// ═══════════════════════════════════════════════════════════════
// HTML TEMPLATE MODULES — Per-page HTML generators for droppable modules
// Each function generates a complete, rich HTML snippet for a specific page type
// These are used for: LeftPanel preview, canvas iframe rendering, and export
// ═══════════════════════════════════════════════════════════════

import type { PageTemplateType } from '@/components/canva/types';

// ── Module definition ─────────────────────────────────────────
export interface HtmlTemplateModule {
  id: string;
  templateType: PageTemplateType;
  icon: string;
  label: string;
  desc: string;
  color: string;
  category: 'paket' | 'halaman';
  /** Generate the HTML for this module type given authoring data */
  generateHTML: (data: TemplateModuleData) => string;
}

export interface TemplateModuleData {
  meta?: Record<string, unknown>;
  cp?: Record<string, unknown>;
  tp?: Array<Record<string, unknown>>;
  atp?: Record<string, unknown>;
  alur?: Array<Record<string, unknown>>;
  materi?: { blok: Array<Record<string, unknown>> };
  modules?: Array<Record<string, unknown>>;
  kuis?: Array<Record<string, unknown>>;
  skenario?: Array<Record<string, unknown>>;
  sfxConfig?: { theme: string; volume: number };
  colorPalette?: Record<string, string>;
}

// ── Color palette defaults ────────────────────────────────────
const Y = '#f9c12e';
const C = '#3ecfcf';
const G = '#34d399';
const R = '#ff6b6b';
const P = '#a78bfa';
const O = '#fb923c';

// ── Shared CSS base (upgraded to match reference visual style) ──
const BASE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
:root{--bg:#0e1c2f;--bg2:#13243a;--card:#182d45;--border:rgba(255,255,255,.09);--y:#f9c12e;--c:#3ecfcf;--r:#ff6b6b;--p:#a78bfa;--g:#34d399;--o:#fb923c;--text:#e8f2ff;--muted:#6e90b5;--rad:16px}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Nunito',sans-serif;color:var(--text);background:var(--bg);overflow:hidden}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(249,193,46,.2)}50%{box-shadow:0 0 20px rgba(249,193,46,.5)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes scoreGrow{from{stroke-dashoffset:264}to{stroke-dashoffset:var(--score-offset,264)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes tapP{0%,100%{opacity:1}50%{opacity:.3}}
.fadein{animation:fadeIn .5s ease both}
.float{animation:float 3s ease-in-out infinite}
.pulse{animation:pulse 2s ease-in-out infinite}
.glow{animation:glow 2s ease-in-out infinite}
.h2{font-family:'Fredoka One',cursive;font-size:1.6rem;line-height:1.2}
.h3{font-weight:800;font-size:1rem}
.sub{color:var(--muted);font-size:.86rem;line-height:1.6}
.chip-sc{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:99px;font-size:.72rem;font-weight:800;margin-bottom:10px}
.hl{color:var(--y)}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--rad);padding:20px;transition:all .2s;margin-bottom:10px}
.card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.15)}
.chip{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:99px;font-size:.74rem;font-weight:800}
.badge{padding:3px 10px;border-radius:99px;font-size:10px;font-weight:900;display:inline-flex;align-items:center;gap:3px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 24px;border-radius:99px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.9rem;border:none;cursor:pointer;transition:all .18s}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.3)}
.btn:active{transform:translateY(0)}
.btn-y{background:var(--y);color:#0e1c2f}
.btn-c{background:var(--c);color:#0e1c2f}
.btn-g{background:var(--g);color:#0e1c2f}
.btn-p{background:var(--p);color:#fff}
.btn-r{background:var(--r);color:#fff}
.btn-ghost{background:rgba(255,255,255,.08);color:var(--text);border:1px solid var(--border)}
.btn-sm{padding:7px 15px;font-size:.78rem}
.tab{padding:8px 18px;font-size:12px;font-weight:800;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all .2s}
.tab.active{color:var(--y);border-bottom-color:var(--y)}
.def-box{border-left:4px solid var(--y);background:rgba(249,193,46,.07);border-radius:0 11px 11px 0;padding:13px 15px;margin:13px 0;font-size:.91rem;line-height:1.7}
`;

// ══════════════════════════════════════════════════════════════
// COVER MODULE
// ══════════════════════════════════════════════════════════════
function generateCoverHTML(data: TemplateModuleData): string {
  const meta = data.meta || {};
  const title = String(meta.judulPertemuan || 'Judul Pertemuan');
  const subtitle = String(meta.subjudul || 'Subjudul / Deskripsi');
  const icon = String(meta.ikon || '📚');
  const mapel = String(meta.mapel || '');
  const kelas = String(meta.kelas || '');
  const durasi = String(meta.durasi || '80 menit');
  const kurikulum = String(meta.kurikulum || 'Kurikulum Merdeka');
  const fase = String((meta as Record<string, unknown>).fase || 'D');
  const elemen = String((meta as Record<string, unknown>).elemen || 'Pancasila');
  const pal = data.colorPalette || {};
  const tpItems = data.tp || [];

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${BASE_CSS}
body{display:flex;align-items:center;justify-content:center;min-height:100vh;
  background:radial-gradient(ellipse 90% 60% at 50% 0%,rgba(249,193,46,.18),transparent 60%),linear-gradient(180deg,#0e1c2f,#09121f)}
.cover-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:36px 18px;position:relative;z-index:2}
.cover-icon{font-size:4.5rem;animation:float 3s ease-in-out infinite;margin-bottom:16px;filter:drop-shadow(0 4px 16px rgba(0,0,0,.4))}
.cover-mapel{color:${pal['--c']||C};font-weight:800;font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
.cover-title{font-family:'Fredoka One',cursive;font-size:clamp(1.7rem,5.5vw,2.8rem);line-height:1.1;margin:10px 0 6px;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.5)}
.cover-chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:14px 0 26px}
.cover-info{margin-bottom:20px;padding:10px 16px;background:rgba(255,255,255,.05);border-radius:10px;font-size:.78rem;color:var(--muted)}
.start-btn{background:${pal['--y']||Y};color:#0e1c2f;padding:14px 36px;border-radius:99px;font-size:16px;font-weight:800;border:none;cursor:pointer;transition:all .15s;box-shadow:0 4px 16px rgba(249,193,46,.3);font-family:'Nunito',sans-serif}
.start-btn:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 8px 24px rgba(249,193,46,.4)}
.orb{position:absolute;border-radius:50%;animation:float 3s ease-in-out infinite;pointer-events:none}
</style></head><body>
<div class="orb" style="top:12%;left:6%;width:80px;height:80px;background:radial-gradient(circle,${pal['--y']||Y},transparent);opacity:.1;animation-delay:0s"></div>
<div class="orb" style="bottom:15%;right:8%;width:100px;height:100px;background:radial-gradient(circle,${pal['--c']||C},transparent);opacity:.08;animation-delay:1.5s"></div>
<div class="orb" style="top:35%;right:12%;width:60px;height:60px;background:radial-gradient(circle,${pal['--p']||P},transparent);opacity:.06;animation-delay:.8s"></div>
<div class="cover-wrap">
  <div class="cover-icon">${icon}</div>
  ${mapel ? `<div class="cover-mapel">${mapel}${kelas ? ' · Kelas ' + kelas : ''} · ${kurikulum}</div>` : ''}
  <h1 class="cover-title"><span class="hl">${escHtml(title)}</span></h1>
  <p class="sub" style="max-width:380px;margin:8px auto">${escHtml(subtitle)}</p>
  <div class="cover-chips">
    ${tpItems.length > 0 ? `<span class="chip" style="background:rgba(249,193,46,.15);color:${pal['--y']||Y}">📋 TP ${tpItems.length}</span>` : ''}
    ${(data.skenario || []).length > 0 ? `<span class="chip" style="background:rgba(62,207,207,.15);color:${pal['--c']||C}">🎭 ${Array.isArray(data.skenario) ? data.skenario.length : 0} Skenario</span>` : ''}
    ${(data.modules || []).length > 0 ? `<span class="chip" style="background:rgba(52,211,153,.15);color:${pal['--g']||G}">🎮 Game</span>` : ''}
    <span class="chip" style="background:rgba(167,139,250,.15);color:${pal['--p']||P}">📝 Refleksi</span>
  </div>
  <div class="cover-info">
    ⏱️ ${durasi} &nbsp;|&nbsp; 🎯 Fase ${fase} &nbsp;|&nbsp; 📚 Elemen: ${escHtml(elemen)}
  </div>
  <button class="start-btn" onclick="alert('Mulai belajar!')">▶ Mulai Pembelajaran</button>
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════
// DOKUMEN MODULE (CP/TP/ATP)
// ══════════════════════════════════════════════════════════════
function generateDokumenHTML(data: TemplateModuleData): string {
  const cp = data.cp || {};
  const tpItems = data.tp || [];
  const atp = data.atp || {};
  const alur = data.alur || [];
  const pal = data.colorPalette || {};
  const cpText = String((cp as Record<string, unknown>).capaianFase || 'Capaian pembelajaran belum diisi.');
  const profil = Array.isArray((cp as Record<string, unknown>).profil) ? (cp as Record<string, unknown>).profil as string[] : [];
  const pertemuan = Array.isArray((atp as Record<string, unknown>).pertemuan) ? (atp as Record<string, unknown>).pertemuan as Array<Record<string, unknown>> : [];

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${BASE_CSS}
body{background:linear-gradient(180deg,var(--bg),var(--bg2));min-height:100vh;padding:0}
.main{flex:1;padding:22px 16px;max-width:860px;width:100%;margin:0 auto}
.header-section{padding:20px 24px 12px;background:linear-gradient(135deg,${pal['--y']||Y}12,${pal['--c']||C}08,${pal['--p']||P}12)}
.header-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;background:${pal['--y']||Y}20;border:1px solid ${pal['--y']||Y}30;animation:glow 2s ease-in-out infinite}
.tabs{display:flex;gap:0;border-bottom:1px solid var(--border);margin-top:10px}
.content{padding:16px 20px;overflow-y:auto;max-height:calc(100vh - 140px)}
.tp-list{display:flex;flex-direction:column;gap:9px;margin-top:10px}
.tp-item{display:flex;align-items:flex-start;gap:12px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:12px 14px}
.tp-num{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:900;flex-shrink:0}
.tp-verb{font-weight:900;font-size:.86rem;margin-bottom:2px}
.tp-desc{color:var(--muted);font-size:.79rem;line-height:1.5}
.alur-steps{display:flex;flex-direction:column;gap:8px;margin:14px 0}
.alur-step{display:flex;gap:12px;align-items:flex-start;padding:11px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03)}
.alur-dur{font-size:.78rem;font-weight:900;min-width:44px;flex-shrink:0;margin-top:2px}
.alur-txt{font-size:.82rem;line-height:1.5}
.alur-txt strong{color:var(--text)}
.alur-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:4px}
</style>
<script>
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('[data-tab='+tab+']').classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p=>p.style.display='none');
  document.getElementById('panel-'+tab).style.display='block';
}
</script></head><body>
<div class="header-section">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="header-icon">📋</div>
    <div><span class="chip-sc" style="background:rgba(62,207,207,.15);color:${pal['--c']||C}">📋 Dokumen</span><h2 class="h2">Dokumen<br><span class="hl">Pembelajaran</span></h2><div class="sub">Capaian · Tujuan · Alur</div></div>
  </div>
  <div class="tabs">
    <div class="tab active" data-tab="cp" onclick="switchTab('cp')">🎯 Capaian</div>
    <div class="tab" data-tab="tp" onclick="switchTab('tp')">📌 Tujuan</div>
    <div class="tab" data-tab="atp" onclick="switchTab('atp')">📅 ATP</div>
  </div>
</div>
<div class="content">
  <div id="panel-cp" class="tab-panel">
    <span class="chip-sc" style="background:rgba(249,193,46,.15);color:${pal['--y']||Y}">🎯 Capaian Pembelajaran</span>
    <div class="def-box" style="border-color:${pal['--y']||Y};background:${pal['--y']||Y}0f;margin-top:10px">
      ${escHtml(cpText)}
    </div>
    ${profil.length > 0 ? `
    <div style="background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:12px;padding:13px;margin-top:14px;font-size:.82rem;line-height:1.6">
      <strong style="color:${pal['--g']||G}">🔗 Profil Pelajar Pancasila:</strong> ${profil.map(p => escHtml(p)).join(' · ')}
    </div>` : ''}
    ${alur.length > 0 ? `
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:14px;margin-top:12px;">
      <div style="font-size:.74rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">⏱️ Alur Kegiatan</div>
      <div class="alur-steps">
        ${alur.map((s, i) => {
          const dotColors = [pal['--p']||P, pal['--c']||C, pal['--y']||Y, pal['--o']||O, pal['--g']||G, pal['--r']||R];
          const col = dotColors[i % dotColors.length];
          return `<div class="alur-step">
            <div class="alur-dot" style="background:${col}"></div>
            <span class="alur-dur" style="color:${col}">${String(s.durasi||'')}</span>
            <span class="alur-txt"><strong>${escHtml(String(s.judul||''))}</strong>${s.deskripsi ? ' — ' + escHtml(String(s.deskripsi)) : ''}</span>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}
  </div>
  <div id="panel-tp" class="tab-panel" style="display:none">
    <span class="chip-sc" style="background:rgba(167,139,250,.15);color:${pal['--p']||P}">🎯 Tujuan Pembelajaran</span>
    <h2 class="h2" style="margin-top:4px">Yang Akan Kamu<br><span class="hl">Kuasai Hari Ini</span></h2>
    ${tpItems.length > 0 ? `<div class="tp-list">` + tpItems.map((tp, i) => {
      const cols = [pal['--y']||Y, pal['--c']||C, pal['--g']||G, pal['--p']||P, pal['--o']||O];
      const col = String(tp.color || cols[i % cols.length]);
      return `<div class="tp-item fadein" style="border-left:3px solid ${col};animation-delay:${i * .08}s">
        <div class="tp-num" style="background:${col}20;color:${col}">${i+1}</div>
        <div><div class="tp-verb" style="color:${col}">${escHtml(String(tp.verb||''))}</div><div class="tp-desc">${escHtml(String(tp.desc||''))}</div>
        ${tp.pertemuan ? `<span class="badge" style="background:${col}15;color:${col};margin-top:4px">→ Pertemuan ${String(tp.pertemuan)}</span>` : ''}</div>
      </div>`;
    }).join('') + `</div>` : '<div style="text-align:center;color:var(--muted);padding:40px"><div style="font-size:2rem;margin-bottom:8px">📌</div>Tambah TP di panel Dokumen</div>'}
  </div>
  <div id="panel-atp" class="tab-panel" style="display:none">
    <span class="chip-sc" style="background:rgba(251,146,60,.15);color:${pal['--o']||O}">📅 ATP</span>
    <h2 class="h2" style="margin-top:4px">Alur Tujuan<br><span class="hl">Pembelajaran</span></h2>
    ${pertemuan.length > 0 ? pertemuan.map((pt, i) => `
    <div class="card fadein" style="animation-delay:${i*.1}s">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span class="badge" style="background:${pal['--y']||Y}20;color:${pal['--y']||Y}">${i===0?'📍':'→'} Pertemuan ${i+1}</span>
        <span style="font-size:10px;color:var(--muted)">${String(pt.durasi||'')}</span>
        ${i===0?`<span class="badge" style="background:${pal['--g']||G}15;color:${pal['--g']||G};margin-left:auto">✅ Sekarang</span>`:''}
      </div>
      <div style="font-size:12px;font-weight:bold;color:#fff">${escHtml(String(pt.judul||''))}</div>
      ${pt.tp?`<div style="font-size:10px;margin-top:4px;color:${pal['--c']||C}">📚 ${escHtml(String(pt.tp))}</div>`:''}
      ${pt.kegiatan?`<div style="font-size:10px;color:var(--muted);margin-top:2px">${escHtml(String(pt.kegiatan))}</div>`:''}
      ${pt.penilaian?`<div style="font-size:10px;margin-top:2px;color:${pal['--g']||G}">📋 ${escHtml(String(pt.penilaian))}</div>`:''}
    </div>`).join('') : '<div style="text-align:center;color:var(--muted);padding:40px"><div style="font-size:2rem;margin-bottom:8px">📅</div>Tambah ATP di panel Dokumen</div>'}
  </div>
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════
// MATERI MODULE
// ══════════════════════════════════════════════════════════════
function generateMateriHTML(data: TemplateModuleData): string {
  const blok = data.materi?.blok || [];
  const modules = data.modules || [];
  const pal = data.colorPalette || {};

  // Render each block type with proper visual differentiation
  const blokHTML = blok.map((b, i) => {
    const tipe = String(b.tipe || 'teks');
    const judul = b.judul ? escHtml(String(b.judul)) : '';
    const isi = b.isi ? escHtml(String(b.isi)) : '';
    const butir = Array.isArray(b.butir) ? b.butir as string[] : [];
    const baris = Array.isArray(b.baris) ? b.baris as string[][] : [];
    const langkah = Array.isArray(b.langkah) ? b.langkah as Array<{ icon: string; judul: string; isi: string }> : [];
    const icon = b.icon ? String(b.icon) : '';
    const warna = b.warna ? String(b.warna) : '#f9c82e';
    const cols = [pal['--y']||Y, pal['--c']||C, pal['--g']||G, pal['--p']||P, pal['--r']||R];
    const col = cols[i % cols.length];

    switch (tipe) {
      case 'definisi':
        return `<div class="card fadein" style="border-left:4px solid ${warna};background:${warna}0d;animation-delay:${i*.1}s">
          ${judul ? `<div class="h3" style="color:${warna};margin-bottom:6px">📖 ${judul}</div>` : ''}
          ${isi ? `<div style="font-size:.82rem;color:var(--text);line-height:1.6">${isi}</div>` : ''}
        </div>`;

      case 'poin':
        return `<div class="card fadein" style="animation-delay:${i*.1}s">
          ${judul ? `<div class="h3" style="color:${col};margin-bottom:8px">${icon || '📌'} ${judul}</div>` : ''}
          ${butir.length > 0 ? butir.map(bi => `<div style="display:flex;gap:6px;align-items:start;font-size:.82rem;color:var(--text);line-height:1.5;margin-bottom:3px"><span style="color:${col};flex-shrink:0">→</span><span>${escHtml(bi)}</span></div>`).join('') : ''}
        </div>`;

      case 'tabel': {
        if (baris.length === 0) return `<div class="card fadein" style="animation-delay:${i*.1}s"><div class="h3" style="color:#a78bfa">📊 ${judul || 'Tabel'}</div><div class="sub">Data belum diisi</div></div>`;
        return `<div class="card fadein" style="animation-delay:${i*.1}s;overflow-x:auto">
          ${judul ? `<div class="h3" style="color:#a78bfa;margin-bottom:8px">${icon || '📊'} ${judul}</div>` : ''}
          <table style="width:100%;border-collapse:collapse;font-size:.78rem">${baris.map((row, ri) => `<tr>${row.map(cell => `<td style="padding:6px 8px;color:${ri === 0 ? '#f9c12e' : 'var(--text)'};font-weight:${ri === 0 ? '700' : '400'};border-bottom:1px solid rgba(255,255,255,.06);${ri === 0 ? 'background:rgba(255,255,255,.06)' : ''}">${escHtml(cell)}</td>`).join('')}</tr>`).join('')}</table>
        </div>`;
      }

      case 'kutipan':
        return `<div class="card fadein" style="border-left:4px solid #f9c12e;background:rgba(249,193,46,.06);animation-delay:${i*.1}s">
          ${isi ? `<div style="font-size:.88rem;color:var(--text);line-height:1.6;font-style:italic">"${isi}"</div>` : ''}
          ${judul ? `<div style="font-size:.78rem;color:#f9c12e;margin-top:6px;font-weight:700">— ${judul}</div>` : ''}
        </div>`;

      case 'highlight':
        return `<div class="card fadein" style="background:${warna}0d;border-color:${warna}30;animation-delay:${i*.1}s;display:flex;gap:10px;align-items:flex-start">
          <div style="font-size:1.6rem;flex-shrink:0">${icon || '💡'}</div>
          <div>${judul ? `<div class="h3" style="color:${warna};margin-bottom:4px">${judul}</div>` : ''}
          ${isi ? `<div style="font-size:.82rem;color:var(--text);line-height:1.55">${isi}</div>` : ''}</div>
        </div>`;

      case 'timeline':
        return `<div class="card fadein" style="animation-delay:${i*.1}s">
          ${judul ? `<div class="h3" style="color:#34d399;margin-bottom:8px">${icon || '🔄'} ${judul}</div>` : ''}
          ${langkah.length > 0 ? langkah.map((l, si) => `<div style="display:flex;gap:8px;align-items:start;margin-bottom:5px">
            <div style="min-width:22px;height:22px;border-radius:50%;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.35);color:#34d399;font-size:.68rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${l.icon || (si+1)}</div>
            <div><div style="font-size:.82rem;font-weight:700;color:var(--text)">${escHtml(l.judul)}</div>${l.isi ? `<div style="font-size:.72rem;color:var(--muted);line-height:1.4">${escHtml(l.isi)}</div>` : ''}</div>
          </div>`).join('') : ''}
        </div>`;

      case 'compare': {
        const kiri = (b.kiri as Record<string, string>) || {};
        const kanan = (b.kanan as Record<string, string>) || {};
        return `<div class="card fadein" style="animation-delay:${i*.1}s">
          ${judul ? `<div class="h3" style="color:#a78bfa;margin-bottom:8px">${icon || '⚖️'} ${judul}</div>` : ''}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div style="background:rgba(62,207,207,.08);border:1px solid rgba(62,207,207,.2);border-radius:8px;padding:8px">
              ${kiri.icon ? `<div style="font-size:1.2rem">${escHtml(kiri.icon)}</div>` : ''}
              ${kiri.judul ? `<div style="font-size:.78rem;font-weight:700;color:#3ecfcf;margin-bottom:3px">${escHtml(kiri.judul)}</div>` : ''}
              ${kiri.isi ? `<div style="font-size:.72rem;color:var(--text);line-height:1.4">${escHtml(kiri.isi)}</div>` : ''}
            </div>
            <div style="background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:8px;padding:8px">
              ${kanan.icon ? `<div style="font-size:1.2rem">${escHtml(kanan.icon)}</div>` : ''}
              ${kanan.judul ? `<div style="font-size:.78rem;font-weight:700;color:#a78bfa;margin-bottom:3px">${escHtml(kanan.judul)}</div>` : ''}
              ${kanan.isi ? `<div style="font-size:.72rem;color:var(--text);line-height:1.4">${escHtml(kanan.isi)}</div>` : ''}
            </div>
          </div>
        </div>`;
      }

      default:
        return `<div class="card fadein" style="animation-delay:${i*.1}s">
          ${judul ? `<div class="h3" style="color:${col};margin-bottom:4px">${icon ? icon + ' ' : ''}${judul}</div>` : ''}
          ${isi ? `<div style="font-size:.82rem;color:var(--text);line-height:1.55">${isi}</div>` : ''}
          ${butir.length > 0 ? butir.map(bi => `<div style="display:flex;gap:4px;font-size:.82rem;color:var(--text);line-height:1.5;margin-bottom:2px"><span style="color:${col}">•</span>${escHtml(bi)}</div>`).join('') : ''}
        </div>`;
    }
  }).join('');

  // Render modules with proper visual representation
  const modulesHTML = modules.slice(0, 6).map((m, i) => {
    const modCols = [pal['--y']||Y, pal['--c']||C, pal['--g']||G, pal['--p']||P, pal['--r']||R];
    const col = modCols[i % modCols.length];
    const modType = String(m.type || '');
    const modIcon = getModuleIcon(modType);
    const modTitle = escHtml(String(m.title || modType));
    const modIntro = escHtml(String(m.intro || m.instruksi || ''));

    // Render interactive module types with previews
    switch (modType) {
      case 'tab-icons': {
        const tabs = (Array.isArray(m.tabs) ? m.tabs : []) as Array<{ icon?: string; judul?: string; warna?: string }>;
        return `<div class="card fadein" style="background:${col}08;border-color:${col}20;animation-delay:${i*.08}s">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:1.3rem">${modIcon}</span><div class="h3" style="color:${col}">${modTitle}</div></div>
          ${modIntro ? `<div class="sub" style="margin-bottom:8px">${modIntro}</div>` : ''}
          <div style="display:flex;flex-wrap:wrap;gap:4px">${tabs.map(t => `<span class="badge" style="background:${t.warna || col}15;color:${t.warna || col}">${t.icon || '📌'} ${escHtml(t.judul || '')}</span>`).join('')}</div>
        </div>`;
      }
      case 'infografis': {
        const kartu = (Array.isArray(m.kartu) ? m.kartu : []) as Array<{ icon?: string; judul?: string; warna?: string }>;
        return `<div class="card fadein" style="background:${col}08;border-color:${col}20;animation-delay:${i*.08}s">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:1.3rem">${modIcon}</span><div class="h3" style="color:${col}">${modTitle}</div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${kartu.slice(0, 4).map(k => `<div style="text-align:center;padding:8px;background:${k.warna || col}0a;border-radius:8px"><div style="font-size:1.3rem">${k.icon || '📌'}</div><div style="font-size:.68rem;font-weight:700;color:${k.warna || col}">${escHtml(k.judul || '')}</div></div>`).join('')}</div>
        </div>`;
      }
      case 'accordion': {
        const items = (Array.isArray(m.items) ? m.items : []) as Array<{ icon?: string; judul?: string }>;
        return `<div class="card fadein" style="background:${col}08;border-color:${col}20;animation-delay:${i*.08}s">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:1.3rem">${modIcon}</span><div class="h3" style="color:${col}">${modTitle}</div></div>
          ${items.slice(0, 4).map(it => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:.78rem;color:var(--text)"><span>${it.icon || '📌'}</span>${escHtml(it.judul || '')}<span style="color:var(--muted);font-size:.6rem;margin-left:auto">▼</span></div>`).join('')}
        </div>`;
      }
      default:
        return `<div class="card fadein" style="background:${col}08;border-color:${col}20;animation-delay:${i*.08}s">
          <div style="display:flex;align-items:center;gap:8px"><span style="font-size:1.3rem">${modIcon}</span><div style="flex:1"><div style="font-size:.86rem;font-weight:700;color:var(--text)">${modTitle}</div><div style="font-size:.68rem;color:var(--muted)">${modType}</div></div><span class="badge" style="background:${col}15;color:${col}">▶</span></div>
          ${modIntro ? `<div style="font-size:.76rem;color:var(--muted);margin-top:6px;line-height:1.4">${modIntro}</div>` : ''}
        </div>`;
    }
  }).join('');

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${BASE_CSS}
body{background:linear-gradient(180deg,var(--bg),var(--bg2));min-height:100vh;padding:0}
.header{padding:20px 24px 12px;background:linear-gradient(135deg,${pal['--p']||P}12,${pal['--c']||C}08)}
.header-icon{width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;background:${pal['--p']||P}15;flex-shrink:0}
.content{padding:16px 20px;overflow-y:auto;max-height:calc(100vh - 90px)}
</style></head><body>
<div class="header">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="header-icon">📖</div>
    <div><span class="chip-sc" style="background:rgba(249,193,46,.15);color:${pal['--y']||Y}">📖 Materi</span><h2 class="h2">Materi<br><span class="hl">Pembelajaran</span></h2><div class="sub">${blok.length} blok · ${modules.length} modul</div></div>
  </div>
</div>
<div class="content">
  ${blokHTML}
  ${modules.length > 0 ? `<div style="font-size:12px;font-weight:bold;color:${pal['--c']||C};margin-top:12px;margin-bottom:8px">🧩 Modul Interaktif</div>${modulesHTML}` : ''}
  ${blok.length === 0 && modules.length === 0 ? '<div style="text-align:center;color:var(--muted);padding:40px"><div style="font-size:2rem;margin-bottom:8px">📝</div>Tambah materi di panel Konten</div>' : ''}
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════
// KUIS MODULE
// ══════════════════════════════════════════════════════════════
function generateKuisHTML(data: TemplateModuleData): string {
  const kuis = data.kuis || [];
  const pal = data.colorPalette || {};
  const letters = ['A', 'B', 'C', 'D'];

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${BASE_CSS}
body{background:linear-gradient(180deg,var(--bg),var(--bg2));min-height:100vh;padding:0}
.header{padding:20px 24px 12px;background:linear-gradient(135deg,${pal['--y']||Y}15,${pal['--c']||C}08)}
.header-icon{width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;background:${pal['--y']||Y}15;flex-shrink:0}
.content{padding:16px 20px;overflow-y:auto;max-height:calc(100vh - 140px)}
.q-card{border-radius:var(--rad);padding:18px;border:1px solid rgba(255,255,255,.07);background:var(--card);margin-bottom:14px;animation:fadeIn .5s ease both}
.q-num{font-family:'Fredoka One',cursive;font-size:1.1rem;color:${pal['--y']||Y}}
.opt-btn{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 16px;margin:6px 0;border-radius:12px;border:2px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:var(--text);font-size:.86rem;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif}
.opt-btn:hover{background:rgba(255,255,255,.1);border-color:var(--c);transform:translateX(4px)}
.opt-btn:active{transform:scale(.98)}
.opt-letter{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:900;background:${pal['--y']||Y}15;color:${pal['--y']||Y};flex-shrink:0;transition:all .2s}
.opt-btn:hover .opt-letter{background:${pal['--y']||Y}30;color:${pal['--y']||Y}}
.progress-bar{height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:12px}
.progress-fill{height:100%;background:linear-gradient(90deg,${pal['--y']||Y},${pal['--c']||C});border-radius:99px;transition:width .4s}
.score-badge{padding:8px 14px;border-radius:10px;font-size:13px;font-weight:bold;background:${pal['--y']||Y}15;color:${pal['--y']||Y};border:1px solid ${pal['--y']||Y}25}
.puzzle-dot{width:22px;height:5px;border-radius:99px;background:rgba(255,255,255,.1);transition:background .3s}
.puzzle-dot.done{background:var(--g)}
.puzzle-dot.cur{background:var(--y)}
</style></head><body>
<div class="header">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="header-icon">❓</div>
    <div style="flex:1"><span class="chip-sc" style="background:rgba(249,193,46,.15);color:${pal['--y']||Y}">❓ Kuis</span><h2 class="h2" style="margin-top:2px">Kuis<br><span class="hl">Pengetahuan</span></h2><div class="sub">${kuis.length} soal · Pilihan Ganda</div></div>
    <div class="score-badge">⭐ 0</div>
  </div>
  <div class="progress-bar"><div class="progress-fill" style="width:0%"></div></div>
  ${kuis.length > 0 ? `<div style="display:flex;gap:5px;margin-top:8px">${kuis.slice(0, 8).map((_, i) => `<div class="puzzle-dot${i===0?' cur':''}"></div>`).join('')}</div>` : ''}
</div>
<div class="content">
  ${kuis.length > 0 ? kuis.slice(0, 5).map((q, i) => `
  <div class="q-card" style="animation-delay:${i*.1}s">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span class="q-num">${i+1}</span>
      <span class="badge" style="background:${pal['--c']||C}15;color:${pal['--c']||C}">10 poin</span>
    </div>
    <div style="font-size:.92rem;font-weight:800;color:#fff;line-height:1.5;margin-bottom:14px">${escHtml(String(q.q))}</div>
    ${(Array.isArray(q.opts) ? q.opts as string[] : []).filter(o => o?.trim()).map((opt, oi) => `
    <button class="opt-btn" onclick="this.style.background='rgba(52,211,153,.15)';this.style.borderColor='rgba(52,211,153,.3)';this.querySelector('.opt-letter').style.background='rgba(52,211,153,.2)';this.querySelector('.opt-letter').style.color='var(--g)'">
      <span class="opt-letter">${letters[oi]}</span>
      <span>${escHtml(opt)}</span>
    </button>`).join('')}
  </div>`).join('') + (kuis.length > 5 ? `<div style="text-align:center;font-size:11px;color:var(--muted);padding:8px">+${kuis.length - 5} soal lagi...</div>` : '') : '<div style="text-align:center;color:var(--muted);padding:40px"><div style="font-size:2rem;margin-bottom:8px">❓</div>Tambah soal di panel Konten</div>'}
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════
// GAME MODULE
// ══════════════════════════════════════════════════════════════
function generateGameHTML(data: TemplateModuleData): string {
  const GAME_TYPES = ['truefalse','memory','matching','roda','sorting','spinwheel','teambuzzer','wordsearch','flashcard'];
  const games = (data.modules || []).filter(m => GAME_TYPES.includes(String(m.type)));
  const pal = data.colorPalette || {};

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${BASE_CSS}
body{background:linear-gradient(180deg,var(--bg),var(--bg2));min-height:100vh;padding:0}
.header{padding:20px 24px 12px;background:linear-gradient(135deg,${pal['--c']||C}15,${pal['--p']||P}08)}
.header-icon{width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;background:${pal['--c']||C}15;flex-shrink:0}
.game-card{border-radius:var(--rad);padding:18px;border:1px solid rgba(255,255,255,.07);background:var(--card);margin-bottom:12px;cursor:pointer;transition:all .2s}
.game-card:hover{background:rgba(255,255,255,.06);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.3)}
.play-badge{padding:6px 14px;border-radius:99px;font-size:.78rem;font-weight:900;display:inline-flex;align-items:center;gap:4px;transition:all .2s}
.game-card:hover .play-badge{transform:scale(1.05)}
.game-icon{font-size:2.4rem;filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))}
</style></head><body>
<div class="header">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="header-icon">🎮</div>
    <div style="flex:1"><span class="chip-sc" style="background:rgba(62,207,207,.15);color:${pal['--c']||C}">🎮 Game</span><h2 class="h2" style="margin-top:2px">Game<br><span class="hl">Interaktif</span></h2><div class="sub">${games.length} game tersedia</div></div>
    <div style="padding:8px 14px;border-radius:10px;font-size:13px;font-weight:bold;background:${pal['--c']||C}15;color:${pal['--c']||C};border:1px solid ${pal['--c']||C}25">🏆 0</div>
  </div>
</div>
<div style="padding:16px 20px;overflow-y:auto;max-height:calc(100vh - 120px)">
  ${games.length > 0 ? games.map((g, i) => {
    const gameColors = [pal['--c']||C, pal['--p']||P, pal['--y']||Y, pal['--g']||G, pal['--r']||R];
    const col = gameColors[i % gameColors.length];
    const difficulties = ['Mudah','Sedang','Sulit'];
    const diff = difficulties[i % 3];
    const diffColors: Record<string,string> = { Mudah: pal['--g']||G, Sedang: pal['--y']||Y, Sulit: pal['--r']||R };
    return `<div class="game-card fadein" style="animation-delay:${i*.08}s">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div class="game-icon">${getGameIcon(String(g.type))}</div>
        <div style="flex:1"><div style="font-size:.95rem;font-weight:900;color:#fff">${escHtml(String(g.title||g.type))}</div><div style="font-size:.75rem;color:var(--muted);margin-top:2px">${String(g.type)}</div></div>
        <span class="play-badge" style="background:${col}15;color:${col};border:1px solid ${col}25">▶ Main</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="chip" style="background:${diffColors[diff]}10;color:${diffColors[diff]};border:1px solid ${diffColors[diff]}20;font-size:9px">📊 ${diff}</span>
        <span class="chip" style="background:${col}10;color:${col};border:1px solid ${col}20;font-size:9px">👥 2+ pemain</span>
        <span class="chip" style="background:${col}10;color:${col};border:1px solid ${col}20;font-size:9px">⏱ 5-10 menit</span>
      </div>
    </div>`;
  }).join('') : '<div style="text-align:center;color:var(--muted);padding:40px"><div style="font-size:2rem;margin-bottom:8px">🎮</div>Tambah game di panel Konten → Modul</div>'}
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════
// HASIL MODULE
// ══════════════════════════════════════════════════════════════
function generateHasilHTML(data: TemplateModuleData): string {
  const pal = data.colorPalette || {};

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${BASE_CSS}
body{background:radial-gradient(ellipse at 50% 40%,rgba(52,211,153,.08),transparent 60%),var(--bg);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px}
.top-bar{position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,${pal['--g']||G},${pal['--y']||Y},${pal['--c']||C})}
.hasil-circle{width:148px;height:148px;border-radius:50%;background:conic-gradient(${pal['--g']||G} 0%,${pal['--g']||G} 0%,rgba(255,255,255,.06) 0% 100%);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;position:relative}
.hasil-circle::before{content:'';position:absolute;inset:10px;border-radius:50%;background:var(--bg2)}
.hasil-score{position:relative;z-index:1;text-align:center}
.hasil-score .num{font-family:'Fredoka One',cursive;font-size:2.1rem;color:${pal['--g']||G}}
.hasil-score .lbl{font-size:.7rem;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.level-badge{padding:10px 20px;border-radius:12px;text-align:center;font-weight:800;font-size:.92rem;margin:6px}
.reflect-box{border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,.08);margin-bottom:11px;width:100%;max-width:85%;text-align:left}
.reflect-box label{font-size:.79rem;font-weight:800;display:block;margin-bottom:6px}
.reflect-box textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:'Nunito',sans-serif;font-size:.82rem;resize:vertical;min-height:62px}
.reflect-box textarea:focus{outline:2px solid ${pal['--c']||C}}
.btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;justify-content:center}
</style></head><body>
<div class="top-bar"></div>
<div style="font-size:3.2rem;margin-bottom:10px;animation:float 3s ease-in-out infinite;filter:drop-shadow(0 4px 16px rgba(52,211,153,.4))">🏆</div>
<h1 style="font-family:'Fredoka One',cursive;font-size:clamp(20px,3.5%,32px);color:${pal['--g']||G};margin-bottom:20px">Hasil Belajar</h1>
<div class="hasil-circle">
  <div class="hasil-score"><span class="num">0%</span><br><span class="lbl">Skor</span></div>
</div>
<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:20px">
  ${[
    { label: 'Sangat Baik', min: 85, color: pal['--g']||G, icon: '🌟' },
    { label: 'Baik', min: 70, color: pal['--y']||Y, icon: '✨' },
    { label: 'Perlu Latihan', min: 0, color: pal['--r']||R, icon: '💪' },
  ].map(level => `
  <div class="level-badge" style="background:${level.color}10;border:2px solid ${level.color}25;color:${level.color}">
    <span style="font-size:1.4rem">${level.icon}</span><br>
    ${level.label}<br>
    <span style="font-size:.72rem;opacity:.7">≥${level.min}%</span>
  </div>`).join('')}
</div>
<div class="reflect-box">
  <label>💭 Apa yang paling kamu pelajari hari ini?</label>
  <textarea placeholder="Tuliskan refleksimu di sini…"></textarea>
</div>
<div class="reflect-box">
  <label>🌟 Bagaimana kamu akan menerapkannya?</label>
  <textarea placeholder="Tuliskan komitmenmu di sini…"></textarea>
</div>
<div class="btn-row">
  <button class="btn btn-y">🎉 Selesai!</button>
  <button class="btn btn-ghost">↩ Ulangi</button>
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════
// HERO MODULE
// ══════════════════════════════════════════════════════════════
function generateHeroHTML(data: TemplateModuleData): string {
  const meta = data.meta || {};
  const title = String(meta.judulPertemuan || 'Hero Banner');
  const subtitle = String(meta.subjudul || '');
  const icon = String(meta.ikon || '🚀');
  const pal = data.colorPalette || {};

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${BASE_CSS}
body{background:radial-gradient(ellipse 90% 60% at 50% 0%,${pal['--y']||Y}25,transparent 60%),linear-gradient(135deg,#0e1c2f,#13243a 50%,${pal['--p']||P}15,#0e1c2f);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px}
.glow-orb{position:absolute;top:20%;left:50%;transform:translateX(-50%);width:260px;height:260px;border-radius:50%;opacity:.15;background:radial-gradient(circle,${pal['--y']||Y},transparent);filter:blur(40px);pointer-events:none}
.hero-chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:16px 0}
</style></head><body>
<div class="glow-orb"></div>
<div style="position:relative;z-index:2">
  <div style="font-size:4rem;margin-bottom:16px;animation:float 3s ease-in-out infinite;filter:drop-shadow(0 4px 16px rgba(0,0,0,.4))">${icon}</div>
  <div class="hero-chips">
    <span class="chip" style="background:rgba(249,193,46,.15);color:${pal['--y']||Y}">✨ Featured</span>
    <span class="chip" style="background:rgba(62,207,207,.15);color:${pal['--c']||C}">📚 Pembelajaran</span>
  </div>
  <h1 style="font-family:'Fredoka One',cursive;font-size:clamp(1.7rem,5vw,2.8rem);color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.5);line-height:1.1;margin-bottom:10px">${escHtml(title)}</h1>
  ${subtitle ? `<p class="sub" style="max-width:420px;margin:0 auto 24px">${escHtml(subtitle)}</p>` : ''}
  <button class="btn btn-y" style="font-size:1rem;padding:14px 36px;box-shadow:0 4px 16px ${pal['--y']||Y}30">🚀 Mulai Sekarang</button>
</div>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════
// SKENARIO MODULE
// ══════════════════════════════════════════════════════════════
function generateSkenarioHTML(data: TemplateModuleData): string {
  const skenario = data.skenario || [];
  const pal = data.colorPalette || {};

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>${BASE_CSS}
body{background:linear-gradient(180deg,var(--bg),var(--bg2));min-height:100vh;padding:0}
.main{flex:1;padding:22px 16px;max-width:860px;width:100%;margin:0 auto}
.sk-shell{background:#0a0f1a;border:3px solid #1e3a5a;border-radius:16px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,.8);margin:12px 0}
.sk-hud{background:linear-gradient(90deg,#0d1b2f,#0f2340);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1e3a5a;gap:12px}
.sk-hud-title{font-family:'Fredoka One',cursive;font-size:.9rem;color:${pal['--y']||Y}}
.sk-hud-badges{display:flex;gap:6px}
.sk-badge{padding:3px 10px;border-radius:99px;font-size:.7rem;font-weight:800}
.sk-badge-score{background:rgba(249,193,46,.15);color:${pal['--y']||Y};border:1px solid rgba(249,193,46,.3)}
.sk-badge-choice{background:rgba(62,207,207,.15);color:${pal['--c']||C};border:1px solid rgba(62,207,207,.3)}
.sk-scene{position:relative;width:100%;min-height:120px;overflow:hidden;background:linear-gradient(180deg,rgba(62,207,207,.06),rgba(167,139,250,.06))}
.sk-dialogue{background:rgba(8,16,30,.92);border-top:2px solid #1e3a5a;padding:14px 16px;min-height:80px}
.sk-speaker{font-size:.72rem;font-weight:800;color:${pal['--c']||C};margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em}
.sk-text{font-size:.88rem;font-weight:700;line-height:1.6;color:var(--text)}
.sk-choices{padding:16px}
.sk-choice-prompt{font-size:.85rem;font-weight:800;color:${pal['--y']||Y};margin-bottom:12px;text-align:center}
.sk-choice-grid{display:flex;flex-direction:column;gap:9px}
.sk-choice{background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:12px;padding:13px 16px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px;font-size:.86rem;font-weight:700;line-height:1.5;font-family:'Nunito',sans-serif;color:var(--text)}
.sk-choice:hover{background:rgba(255,255,255,.1);border-color:${pal['--c']||C};transform:translateX(4px)}
.sk-choice .sk-ci{font-size:1.5rem;flex-shrink:0}
.sk-choice .sk-ct{flex:1}
.sk-progress{display:flex;gap:4px;padding:10px 16px;background:#060d18;border-top:1px solid #1e3a5a}
.sk-prog-dot{flex:1;height:4px;border-radius:99px;background:#1e3a5a;transition:all .3s}
.sk-prog-dot.done{background:var(--g)}
.sk-prog-dot.cur{background:var(--y);box-shadow:0 0 6px var(--y)}
</style></head><body>
<div class="main">
  <span class="chip-sc" style="background:rgba(167,139,250,.15);color:${pal['--p']||P}">🎭 Skenario</span>
  <h2 class="h2">Kamu yang<br><span class="hl">Memilih!</span></h2>
  <p class="sub" style="margin-top:8px">${skenario.length} tahap · Pilih jalanmu sendiri</p>
  ${skenario.length > 0 ? `
  <div class="sk-shell">
    <div class="sk-hud">
      <span class="sk-hud-title">🎭 Skenario</span>
      <div class="sk-hud-badges">
        <span class="sk-badge sk-badge-score">⭐ <span>0</span></span>
        <span class="sk-badge sk-badge-choice">Tahap <span>1</span>/${skenario.length}</span>
      </div>
    </div>
    <div class="sk-scene">
      <div class="sk-dialogue">
        <div class="sk-speaker">Narator</div>
        <div class="sk-text">${escHtml(String(skenario[0]?.teks || 'Memulai petualangan...'))}</div>
      </div>
    </div>
    ${Array.isArray(skenario[0]?.pilihan) ? `
    <div class="sk-choices">
      <div class="sk-choice-prompt">Apa yang akan kamu lakukan?</div>
      <div class="sk-choice-grid">
        ${(skenario[0]?.pilihan as Array<Record<string, string>>).map((p, i) => {
          const choiceIcons = ['🅰️','🅱️','🅲','🅳'];
          return `<button class="sk-choice" onclick="this.style.background='rgba(52,211,153,.1)';this.style.borderColor='rgba(52,211,153,.3)'">
            <span class="sk-ci">${choiceIcons[i] || '🔹'}</span>
            <div class="sk-ct">${escHtml(String(p.teks || p.label || `Pilihan ${i + 1}`))}</div>
          </button>`;
        }).join('')}
      </div>
    </div>` : ''}
    <div class="sk-progress">
      ${skenario.map((_, i) => `<div class="sk-prog-dot${i===0?' cur':''}"></div>`).join('')}
    </div>
  </div>` : '<div style="text-align:center;color:var(--muted);padding:40px"><div style="font-size:2rem;margin-bottom:8px">🎭</div>Tambah skenario di panel Konten</div>'}
</div>
</body></html>`;
}

// ── Utility Functions ─────────────────────────────────────────

function escHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getModuleIcon(type: string): string {
  const icons: Record<string, string> = {
    skenario: '🎭', video: '🎬', flashcard: '🃏', infografis: '📊',
    'studi-kasus': '📖', debat: '💬', timeline: '📅', matching: '🔗',
    materi: '📝', truefalse: '✅', memory: '🧠', roda: '🎡',
    hero: '🚀', kutipan: '💬', langkah: '👣', accordion: '🪗',
    statistik: '📊', polling: '📊', embed: '🔗', 'tab-icons': '📑',
    'icon-explore': '🔍', comparison: '⚖️', 'card-showcase': '🃏',
    'hotspot-image': '🖼️', sorting: '📂', spinwheel: '🎡',
    teambuzzer: '🔔', wordsearch: '🔤',
  };
  return icons[type] || '🧩';
}

function getGameIcon(type: string): string {
  const icons: Record<string, string> = {
    truefalse: '✅', memory: '🧠', matching: '🔗', roda: '🎡',
    sorting: '📂', spinwheel: '🎡', teambuzzer: '🔔',
    wordsearch: '🔤', flashcard: '🃏',
  };
  return icons[type] || '🎮';
}

// ══════════════════════════════════════════════════════════════
// MODULE REGISTRY — All available HTML template modules
// ══════════════════════════════════════════════════════════════

export const HTML_TEMPLATE_MODULES: HtmlTemplateModule[] = [
  // ── Paket (complete packages) ──
  {
    id: 'paket-lengkap',
    templateType: 'cover',
    icon: '📦',
    label: 'Paket Lengkap',
    desc: 'Cover + Dokumen + Materi + Kuis + Hasil',
    color: '#f9c12e',
    category: 'paket',
    generateHTML: () => '', // Auto-rakit handles this
  },
  // ── Per-Halaman modules ──
  {
    id: 'modul-cover',
    templateType: 'cover',
    icon: '🏠',
    label: 'Cover',
    desc: 'Halaman judul & pembuka',
    color: '#f9c12e',
    category: 'halaman',
    generateHTML: generateCoverHTML,
  },
  {
    id: 'modul-dokumen',
    templateType: 'dokumen',
    icon: '📋',
    label: 'Dokumen',
    desc: 'CP, TP, ATP',
    color: '#3ecfcf',
    category: 'halaman',
    generateHTML: generateDokumenHTML,
  },
  {
    id: 'modul-materi',
    templateType: 'materi',
    icon: '📝',
    label: 'Materi',
    desc: 'Konten pembelajaran',
    color: '#a78bfa',
    category: 'halaman',
    generateHTML: generateMateriHTML,
  },
  {
    id: 'modul-kuis',
    templateType: 'kuis',
    icon: '❓',
    label: 'Kuis',
    desc: 'Soal pilihan ganda',
    color: '#f5c842',
    category: 'halaman',
    generateHTML: generateKuisHTML,
  },
  {
    id: 'modul-game',
    templateType: 'game',
    icon: '🎮',
    label: 'Game',
    desc: 'Game interaktif',
    color: '#3ecfcf',
    category: 'halaman',
    generateHTML: generateGameHTML,
  },
  {
    id: 'modul-hasil',
    templateType: 'hasil',
    icon: '🏆',
    label: 'Hasil',
    desc: 'Skor & apresiasi',
    color: '#34d399',
    category: 'halaman',
    generateHTML: generateHasilHTML,
  },
  {
    id: 'modul-hero',
    templateType: 'hero',
    icon: '🚀',
    label: 'Hero',
    desc: 'Banner dengan gradient',
    color: '#fb923c',
    category: 'halaman',
    generateHTML: generateHeroHTML,
  },
  {
    id: 'modul-skenario',
    templateType: 'skenario',
    icon: '🎭',
    label: 'Skenario',
    desc: 'Cerita interaktif pilihan',
    color: '#f472b6',
    category: 'halaman',
    generateHTML: generateSkenarioHTML,
  },
];

/**
 * Generate HTML preview for a specific module type using authoring data
 */
export function generateModulePreviewHTML(moduleId: string, data: TemplateModuleData): string {
  const mod = HTML_TEMPLATE_MODULES.find(m => m.id === moduleId);
  if (!mod) return '<html><body style="background:#0f172a;color:#fff"><p>Module not found</p></body></html>';
  return mod.generateHTML(data);
}

/**
 * Get all modules grouped by category
 */
export function getModulesByCategory(): Record<string, HtmlTemplateModule[]> {
  const result: Record<string, HtmlTemplateModule[]> = {};
  for (const mod of HTML_TEMPLATE_MODULES) {
    if (!result[mod.category]) result[mod.category] = [];
    result[mod.category].push(mod);
  }
  return result;
}
