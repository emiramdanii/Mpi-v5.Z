// ═══════════════════════════════════════════════════════════════
// BASE CSS — Shared CSS engine used by ALL screen templates
// This is the single source of truth for styling.
// Extracted from the original export-html.ts + html-template-modules.ts
// ═══════════════════════════════════════════════════════════════

import type { NavConfig } from '@/components/canva/types';

export interface CssVars {
  '--bg'?: string;
  '--bg2'?: string;
  '--card'?: string;
  '--border'?: string;
  '--y'?: string;
  '--c'?: string;
  '--r'?: string;
  '--p'?: string;
  '--g'?: string;
  '--o'?: string;
  '--text'?: string;
  '--muted'?: string;
  '--rad'?: string;
}

const DEFAULT_VARS: Required<CssVars> = {
  '--bg': '#0e1c2f',
  '--bg2': '#13243a',
  '--card': '#182d45',
  '--border': 'rgba(255,255,255,.09)',
  '--y': '#f9c12e',
  '--c': '#3ecfcf',
  '--r': '#ff6b6b',
  '--p': '#a78bfa',
  '--g': '#34d399',
  '--o': '#fb923c',
  '--text': '#e8f2ff',
  '--muted': '#6e90b5',
  '--rad': '16px',
};

/**
 * Generate the base CSS with optional color overrides.
 * This includes: CSS variables, reset, typography, cards, buttons,
 * chips, badges, animations, navbar, responsive, print, and accessibility.
 */
export function generateBaseCSS(vars?: CssVars): string {
  const v = { ...DEFAULT_VARS, ...vars };

  return `:root{--bg:${v['--bg']};--bg2:${v['--bg2']};--card:${v['--card']};--border:${v['--border']};
  --y:${v['--y']};--c:${v['--c']};--r:${v['--r']};--p:${v['--p']};--g:${v['--g']};--o:${v['--o']};
  --text:${v['--text']};--muted:${v['--muted']};--rad:${v['--rad']};}
*{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;}

/* ── Screen visibility ── */
.screen{display:none;min-height:100vh;animation:fadeIn .4s ease;}
.screen.active{display:flex;flex-direction:column;}

/* ── Animations ── */
@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.6;}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(249,193,46,.2);}50%{box-shadow:0 0 20px rgba(249,193,46,.5);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes scoreGrow{from{stroke-dashoffset:264;}to{stroke-dashoffset:var(--score-offset,264);}}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
@keyframes tapP{0%,100%{opacity:1;}50%{opacity:.3;}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes bounceIn{0%{transform:scale(.3);opacity:0;}50%{transform:scale(1.05);}70%{transform:scale(.9);}100%{transform:scale(1);opacity:1;}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0;}to{transform:translateY(0);opacity:1;}}
@keyframes confFall{to{transform:translateY(110vh) rotate(720deg);opacity:0;}}
@keyframes countdownPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}
.fadein{animation:fadeIn .5s ease both;}
.float{animation:float 3s ease-in-out infinite;}
.pulse{animation:pulse 2s ease-in-out infinite;}
.glow{animation:glow 2s ease-in-out infinite;}
.bounce{animation:bounceIn .6s ease both;}

/* ── Typography ── */
.h2{font-family:'Fredoka One',cursive;font-size:1.6rem;line-height:1.2;}
.h3{font-weight:800;font-size:1rem;}
.sub{color:var(--muted);font-size:.86rem;line-height:1.6;}
.hl{color:var(--y);}

/* ── Cards ── */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--rad);padding:20px;transition:all .2s;margin-bottom:10px;}
.card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.15);}

/* ── Chips & Badges ── */
.chip{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:99px;font-size:.74rem;font-weight:800;}
.chip-sc{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:99px;font-size:.72rem;font-weight:800;margin-bottom:10px;}
.badge{padding:3px 10px;border-radius:99px;font-size:10px;font-weight:900;display:inline-flex;align-items:center;gap:3px;}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 24px;border-radius:99px;
  font-family:'Nunito',sans-serif;font-weight:800;font-size:.9rem;border:none;cursor:pointer;transition:all .18s;}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.3);}
.btn:active{transform:translateY(0);}
.btn-y{background:var(--y);color:#0e1c2f;}
.btn-c{background:var(--c);color:#0e1c2f;}
.btn-g{background:var(--g);color:#0e1c2f;}
.btn-p{background:var(--p);color:#fff;}
.btn-r{background:var(--r);color:#fff;}
.btn-ghost{background:rgba(255,255,255,.08);color:var(--text);border:1px solid var(--border);}
.btn-sm{padding:7px 15px;font-size:.78rem;}
.btn-row{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px;}
.btn-center{justify-content:center;}

/* ── Tabs ── */
.tab{padding:8px 18px;font-size:12px;font-weight:800;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all .2s;}
.tab.active{color:var(--y);border-bottom-color:var(--y);}
.ktab-row{display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:16px;}
.ktab{padding:9px 16px;font-size:.78rem;font-weight:800;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .2s;}
.ktab.active{color:var(--y);border-bottom-color:var(--y);}
.ktab-content{display:none;animation:fadeIn .3s ease;}
.ktab-content.active{display:block;}
.ftab-row{display:flex;gap:6px;margin:12px 0;flex-wrap:wrap;}
.ftab{padding:6px 12px;border-radius:99px;font-size:.76rem;font-weight:800;cursor:pointer;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--muted);transition:all .2s;}

/* ── Definition box ── */
.def-box{border-left:4px solid var(--y);background:rgba(249,193,46,.07);border-radius:0 11px 11px 0;padding:13px 15px;margin:13px 0;font-size:.91rem;line-height:1.7;}

/* ── Content area ── */
.main{flex:1;padding:22px 16px;max-width:860px;width:100%;margin:0 auto;}
.mt8{margin-top:8px;}.mt14{margin-top:14px;}.mt20{margin-top:20px;}

/* ── Confetti ── */
.conf{position:fixed;border-radius:2px;animation:confFall linear both;pointer-events:none;z-index:9999;will-change:transform,opacity;}
#confWrap{position:fixed;inset:0;pointer-events:none;z-index:9998;}

/* ── Hasil circle ── */
.hasil-circle{width:140px;height:140px;border-radius:50%;background:conic-gradient(var(--g) 0%,var(--g) var(--prog,0%),rgba(255,255,255,.06) var(--prog,0%) 100%);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;position:relative;}
.hasil-circle::before{content:'';position:absolute;inset:10px;border-radius:50%;background:var(--bg2);}
.hasil-score{position:relative;z-index:1;text-align:center;}

/* ── Refleksi ── */
.refl-item{border-radius:12px;padding:12px;border:1px solid rgba(255,255,255,.08);margin-bottom:10px;}
.refl-item label{font-size:.78rem;font-weight:800;display:block;margin-bottom:5px;}
.refl-item textarea{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:'Nunito',sans-serif;font-size:.8rem;resize:vertical;min-height:58px;}
.refl-item textarea:focus{outline:2px solid var(--c);}

/* ── Skenario ── */
.sk-shell{background:#0a0f1a;border:3px solid #1e3a5a;border-radius:16px;overflow:hidden;margin:12px 0;}
.sk-hud{background:linear-gradient(90deg,#0d1b2f,#0f2340);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1e3a5a;gap:12px;}
.sk-hud-title{font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--y);}
.sk-badge{padding:3px 10px;border-radius:99px;font-size:.7rem;font-weight:800;}
.sk-scene{position:relative;width:100%;height:180px;overflow:hidden;}
.sk-char{position:absolute;bottom:28%;display:flex;flex-direction:column;align-items:center;}
.sk-head{width:32px;height:32px;border-radius:50%;border:2px solid rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem;}
.sk-body{width:24px;height:26px;border-radius:5px 5px 3px 3px;border:2px solid rgba(0,0,0,.1);margin-top:-2px;}
.sk-legs{display:flex;gap:3px;margin-top:1px;}
.sk-leg{width:8px;height:16px;border-radius:0 0 4px 4px;border:1px solid rgba(0,0,0,.1);}
.sk-dialogue{position:absolute;bottom:0;left:0;right:0;background:rgba(8,16,30,.92);border-top:2px solid #1e3a5a;padding:12px 14px;min-height:76px;}
.sk-speaker{font-size:.7rem;font-weight:800;color:var(--c);margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em;}
.sk-text{font-size:.85rem;font-weight:700;line-height:1.5;color:#e8f2ff;}
.sk-tap{font-size:.68rem;color:var(--muted);margin-top:5px;animation:tapP 1.4s ease-in-out infinite;will-change:opacity}
.sk-choices{padding:14px;}
.sk-choice-prompt{font-size:.83rem;font-weight:800;color:var(--y);margin-bottom:10px;text-align:center;}
.sk-choice{background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:10px;font-size:.83rem;font-weight:700;margin-bottom:8px;}
.sk-choice:hover{background:rgba(255,255,255,.1);border-color:var(--c);}
.sk-result{padding:14px;}
.sk-result-banner{border-radius:12px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;}
.sk-result-banner.good{background:rgba(52,211,153,.1);border:2px solid rgba(52,211,153,.3);}
.sk-result-banner.bad{background:rgba(255,107,107,.1);border:2px solid rgba(255,107,107,.3);}
.sk-result-banner.mid{background:rgba(249,193,46,.1);border:2px solid rgba(249,193,46,.3);}
.sk-result-title{font-weight:900;font-size:.92rem;margin-bottom:3px;}
.sk-result-body{font-size:.8rem;line-height:1.5;color:var(--muted);}
.sk-result-banner.good .sk-result-title{color:var(--g);}
.sk-result-banner.bad .sk-result-title{color:var(--r);}
.sk-result-banner.mid .sk-result-title{color:var(--y);}
.sbg-pasar{background:linear-gradient(180deg,#87CEEB 0%,#b0d4f0 45%,#999 60%,#a08050 100%);}
.sbg-masjid{background:linear-gradient(180deg,#fce4ec 0%,#f8d7e3 45%,#81c784 100%);}
.sbg-kelas{background:linear-gradient(180deg,#e8f4fd,#d0eaf8 100%);}
.sbg-kampung{background:linear-gradient(180deg,#c8e6c9 0%,#81c784 48%,#b09060 100%);}
.sbg-hutan{background:linear-gradient(180deg,#a8d5ba 0%,#2d6a4f 48%,#1a3a2a 100%);}
.sbg-pantai{background:linear-gradient(180deg,#87ceeb 0%,#4ea8de 40%,#f2cc8f 75%,#deb887 100%);}

/* ── Kuis ── */
.q-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px;}
.q-text{font-weight:700;font-size:.9rem;line-height:1.5;margin-bottom:12px;}
.q-opts{display:flex;flex-direction:column;gap:7px;}
.q-opt{display:flex;align-items:flex-start;gap:10px;padding:10px 13px;border-radius:10px;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.07);cursor:pointer;font-size:.83rem;font-weight:700;transition:all .18s;line-height:1.4;}
.q-opt:hover:not(.dis){border-color:var(--c);background:rgba(62,207,207,.06);}
.q-opt.ok{border-color:var(--g);background:rgba(52,211,153,.1);color:var(--g);}
.q-opt.no{border-color:var(--r);background:rgba(255,107,107,.1);color:var(--r);}
.q-opt.shok{border-color:var(--g);background:rgba(52,211,153,.05);}
.q-opt.dis{cursor:default;pointer-events:none;}
.q-fb{padding:9px 12px;border-radius:9px;margin-top:8px;font-size:.79rem;font-weight:700;line-height:1.5;}
.q-fb.ok{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g);}
.q-fb.no{background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--r);}

/* ── Responsive / Mobile ── */
@media(max-width:640px){
  .navbar{padding:6px 10px;gap:6px}
  .nav-logo{font-size:.75rem;max-width:80px}
  .main{padding:14px 10px}
  .h2{font-size:1.2rem}
  .card{padding:14px;border-radius:12px}
  .cover-icon{font-size:3rem}
  .cover-title{font-size:1.3rem!important}
  .cover-chips{gap:4px}
  .chip{font-size:.65rem;padding:2px 8px}
  .btn{padding:8px 16px;font-size:.82rem}
  .q-opt{padding:8px 10px;font-size:.78rem}
  .sk-scene{height:140px}
  .sk-dialogue{padding:8px 10px}
  .sk-text{font-size:.78rem}
  .hasil-circle{width:100px;height:100px}
  .hasil-score div:first-child{font-size:1.5rem!important}
  .atp-p-card{padding:10px}
  .tp-item{padding:8px 10px}
  .alur-step{padding:8px 10px}
}
@media(max-width:380px){
  .nav-prog{display:none}
  .main{padding:10px 6px}
  .h2{font-size:1.05rem}
}

/* ── High Contrast Mode ── */
body.high-contrast{background:#000!important}
body.high-contrast .card{background:#111!important;border-color:rgba(255,255,255,.3)!important}
body.high-contrast .sub,body.high-contrast .q-text,body.high-contrast [class*=muted]{color:#ccc!important}
body.high-contrast .btn{font-weight:900}
body.high-contrast .q-opt{border-color:rgba(255,255,255,.3)!important}
body.high-contrast .def-box{background:rgba(255,255,255,.08)!important;border-left-color:#fff!important}
body.high-contrast .navbar{background:rgba(0,0,0,.98)!important}

/* ── Print-friendly ── */
@media print{
  .contrast-toggle,.skip-link,.sfx-toggle,.navbar,.btn,.btn-row,.sk-tap,#confWrap{display:none!important}
  .screen{display:block!important;min-height:auto;page-break-after:always}
  .screen.active{display:block!important}
  body{background:#fff;color:#1a1a2e}
  .card{border:1px solid #e5e7eb;background:#f9fafb}
  .h2,.hl{color:#92400e}
  .sub,.q-text{color:#4b5563}
  *{text-shadow:none!important;box-shadow:none!important}
  .hasil-circle{border:3px solid #34d399;background:transparent}
  .hasil-circle::before{background:#fff}
  .refl-item textarea{border:1px solid #d1d5db;background:#fff;color:#1a1a2e}
  .q-opt{border:1px solid #d1d5db;background:#f9fafb;color:#374151}
  .q-opt.ok{background:#ecfdf5;border-color:#6ee7b7}
  .q-opt.no{background:#fef2f2;border-color:#fca5a5}
}`;
}

/**
 * Generate navbar CSS based on the nav configuration.
 */
export function generateNavbarCSS(config: NavConfig): string {
  const pos = config.navbarPosition === 'bottom' ? 'bottom:0' : 'top:0';
  return `.navbar{background:rgba(14,28,47,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);
  padding:10px 18px;display:flex;align-items:center;gap:10px;position:sticky;${pos};z-index:200;}
.nav-logo{font-family:'Fredoka One',cursive;font-size:.95rem;color:var(--y);white-space:nowrap;}
.nav-prog{flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin:0 8px;}
.nav-prog-fill{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;transition:width .5s;}
.nav-score{font-size:.8rem;font-weight:800;color:var(--y);white-space:nowrap;}
.nav-prev,.nav-next{background:rgba(255,255,255,.08);border:1px solid var(--border);color:var(--text);width:28px;height:28px;border-radius:50%;display:none;align-items:center;justify-content:center;cursor:pointer;font-size:.85rem;font-weight:900;padding:0;transition:all .15s;}
.nav-prev:hover,.nav-next:hover{background:rgba(255,255,255,.15);border-color:var(--c);}
${config.navbarStyle === 'glass' ? `.navbar{background:rgba(14,28,47,.75);backdrop-filter:blur(20px);}` : ''}
${config.navbarStyle === 'pill' ? `.navbar{border-radius:0 0 16px 16px;margin:0 8px;border:1px solid var(--border);border-top:none;}` : ''}
${config.navbarStyle === 'floating' ? `.navbar{border-radius:99px;margin:8px 12px;border:1px solid var(--border);position:fixed;left:0;right:0;}` : ''}`;
}
