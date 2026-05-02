// ═══════════════════════════════════════════════════════════════
// GAME — Game launcher screen template
// Shows available games as cards with play buttons
// ═══════════════════════════════════════════════════════════════

import type { GameSlots } from '../engine/slot-types';

function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const GAME_TYPE_ICONS: Record<string, string> = {
  truefalse: '✅❌',
  memory: '🧠',
  matching: '🔗',
  roda: '🎡',
  sorting: '📂',
  spinwheel: '🎯',
  teambuzzer: '🔔',
  wordsearch: '🔍',
  flashcard: '🃏',
};

export function generateGameContent(data: GameSlots): string {
  return `
<style>
.game-header{padding:20px 24px 12px;background:linear-gradient(135deg,rgba(62,207,207,.12),rgba(167,139,250,.06))}
.game-icon{width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;background:rgba(62,207,207,.12);flex-shrink:0}
.game-card{border-radius:var(--rad);padding:18px;border:1px solid rgba(255,255,255,.07);background:var(--card);margin-bottom:12px;cursor:pointer;transition:all .2s}
.game-card:hover{background:rgba(255,255,255,.06);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.3)}
.play-badge{padding:6px 14px;border-radius:99px;font-size:.78rem;font-weight:900;display:inline-flex;align-items:center;gap:4px;transition:all .2s}
.game-card:hover .play-badge{transform:scale(1.05)}
.game-big-icon{font-size:2.4rem;filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))}
</style>

<div class="game-header">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="game-icon">🎮</div>
    <div style="flex:1">
      <span class="chip-sc" style="background:rgba(62,207,207,.15);color:var(--c)">🎮 Game</span>
      <h2 class="h2" style="margin-top:2px">${esc(data.judul || 'Game')}<br><span class="hl">${esc(data.subjudul || 'Interaktif')}</span></h2>
      <div class="sub">${data.games.length} game tersedia</div>
    </div>
    <div style="padding:8px 14px;border-radius:10px;font-size:13px;font-weight:bold;background:rgba(62,207,207,.12);color:var(--c);border:1px solid rgba(62,207,207,.2)">🏆 0</div>
  </div>
</div>

<div style="padding:16px 20px;overflow-y:auto;max-height:calc(100vh - 140px)">
  ${data.games.length > 0 ? data.games.map((g, i) => {
    const cols = ['#3ecfcf', '#a78bfa', '#f9c12e', '#34d399', '#ff6b6b'];
    const col = g.color || cols[i % cols.length];
    const icon = g.icon || GAME_TYPE_ICONS[g.type] || '🎮';
    const difficulties = ['Mudah', 'Sedang', 'Sulit'];
    const diff = difficulties[i % 3];
    const diffColors: Record<string, string> = { Mudah: '#34d399', Sedang: '#f9c12e', Sulit: '#ff6b6b' };

    return `<div class="game-card fadein" style="animation-delay:${i * .08}s">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div class="game-big-icon">${icon}</div>
        <div style="flex:1">
          <div style="font-size:.95rem;font-weight:900;color:#fff">${esc(g.title)}</div>
          <div style="font-size:.75rem;color:var(--muted);margin-top:2px">${esc(g.type)}</div>
        </div>
        <span class="play-badge" style="background:${col}15;color:${col};border:1px solid ${col}25">▶ Main</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="chip" style="background:${diffColors[diff]}10;color:${diffColors[diff]};border:1px solid ${diffColors[diff]}20;font-size:9px">📊 ${diff}</span>
        <span class="chip" style="background:${col}10;color:${col};border:1px solid ${col}20;font-size:9px">👥 2+ pemain</span>
        <span class="chip" style="background:${col}10;color:${col};border:1px solid ${col}20;font-size:9px">⏱ 5-10 menit</span>
      </div>
    </div>`;
  }).join('') : `
  <div style="text-align:center;color:var(--muted);padding:40px">
    <div style="font-size:2rem;margin-bottom:8px">🎮</div>
    Tambah game di panel Konten → Modul
  </div>`}
</div>`;
}
