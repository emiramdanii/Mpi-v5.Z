// ═══════════════════════════════════════════════════════════════
// HASIL SCREEN — Results / score page
// Generates inner content HTML (no wrapper/navbar)
// ═══════════════════════════════════════════════════════════════

import type { HasilSlots } from '../engine/slot-types';

// ── HTML entity escape helper ──────────────────────────────────
function esc(str: string | number | null | undefined): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate results/score page content.
 * Features: trophy animation, conic-gradient score circle, level badge,
 * reflection prompts, action buttons with confetti.
 */
export function generateHasilContent(data: HasilSlots): string {
  const prompts = data.reflectionPrompts || [];

  return `
<style>
.hs-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;padding:28px 16px;max-width:540px;margin:0 auto;min-height:calc(100vh - 60px)}
.hs-topbar{position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,var(--g),var(--y),var(--c));border-radius:0 0 4px 4px}
.hs-trophy{font-size:3.4rem;margin-bottom:8px;animation:float 3s ease-in-out infinite;filter:drop-shadow(0 4px 20px rgba(52,211,153,.45))}
.hs-title{font-family:'Fredoka One',cursive;font-size:clamp(1.4rem,4vw,2rem);color:var(--g);margin-bottom:18px}

/* Score circle with conic-gradient */
.hs-circle{width:148px;height:148px;border-radius:50%;background:conic-gradient(var(--g) 0%,var(--g) 0%,rgba(255,255,255,.06) 0% 100%);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;position:relative;transition:background .8s ease}
.hs-circle::before{content:'';position:absolute;inset:10px;border-radius:50%;background:var(--bg2)}
.hs-circle-glow{position:absolute;inset:-6px;border-radius:50%;background:radial-gradient(circle,rgba(52,211,153,.15),transparent 70%);pointer-events:none}
.hs-score{position:relative;z-index:1;text-align:center}
.hs-score-num{font-family:'Fredoka One',cursive;font-size:2.2rem;color:var(--g);line-height:1}
.hs-score-lbl{font-size:.7rem;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-top:2px}

/* Level badge */
.hs-level{padding:10px 24px;border-radius:12px;font-weight:800;font-size:.92rem;margin:8px auto 20px;display:inline-flex;align-items:center;gap:6px;animation:bounceIn .6s ease both}
.hs-level.sb{background:rgba(52,211,153,.12);color:var(--g);border:2px solid rgba(52,211,153,.3)}
.hs-level.bk{background:rgba(249,193,46,.12);color:var(--y);border:2px solid rgba(249,193,46,.3)}
.hs-level.ck{background:rgba(251,146,60,.12);color:var(--o);border:2px solid rgba(251,146,60,.3)}
.hs-level.pb{background:rgba(255,107,107,.12);color:var(--r);border:2px solid rgba(255,107,107,.3)}

/* Stars row */
.hs-stars{display:flex;gap:4px;justify-content:center;margin-bottom:12px}
.hs-star{font-size:1.6rem;opacity:.2;transition:all .3s}
.hs-star.on{opacity:1;filter:drop-shadow(0 2px 6px rgba(249,193,46,.5))}

/* Reflection */
.hs-refl-title{font-size:.82rem;font-weight:800;color:var(--c);margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em}

/* Action buttons */
.hs-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:18px}
</style>

<div class="hs-wrap fadein">
  <div class="hs-topbar"></div>

  <!-- Trophy -->
  <div class="hs-trophy">🏆</div>

  <!-- Title -->
  <h1 class="hs-title"><span class="hl">${esc(data.judul || 'Hasil Belajar')}</span></h1>

  <!-- Score circle -->
  <div class="hs-circle" id="hs-circle">
    <div class="hs-circle-glow"></div>
    <div class="hs-score">
      <div class="hs-score-num" id="hs-score-num">0%</div>
      <div class="hs-score-lbl">Skor</div>
    </div>
  </div>

  <!-- Stars -->
  <div class="hs-stars" id="hs-stars">
    <span class="hs-star">⭐</span>
    <span class="hs-star">⭐</span>
    <span class="hs-star">⭐</span>
    <span class="hs-star">⭐</span>
    <span class="hs-star">⭐</span>
  </div>

  <!-- Level badge -->
  <div class="hs-level sb" id="hs-level">🌟 Sangat Baik</div>

  ${data.showReflection && prompts.length > 0 ? `
  <!-- Reflection prompts -->
  <div style="width:100%;max-width:420px;text-align:left;margin-top:8px">
    <div class="hs-refl-title">💭 Refleksi Pembelajaran</div>
    ${prompts.map((p, i) => `
    <div class="refl-item fadein" style="animation-delay:${i * .08}s">
      <label>${p.icon || '✍️'} ${esc(p.label)}</label>
      <textarea placeholder="${esc(p.placeholder || 'Tuliskan jawabanmu...')}" rows="2"></textarea>
    </div>`).join('')}
  </div>` : ''}

  <!-- Action buttons -->
  <div class="hs-actions">
    <button class="btn btn-g" onclick="launchConfetti()">🎉 Selesai!</button>
    <button class="btn btn-ghost" onclick="goScreen('s-cover')">↩ Ulangi</button>
  </div>
</div>

<script>
(function(){
  function calculateHasil() {
    var pct = typeof score !== 'undefined' && score > 0 ? score : 0;
    // Map score to 0-100 percentage (assuming max ~100 from games/kuis)
    var maxScore = 100;
    var pctVal = Math.min(100, Math.round((pct / maxScore) * 100));

    // Animate circle
    var circle = document.getElementById('hs-circle');
    if (circle) {
      circle.style.background = 'conic-gradient(var(--g) 0%,var(--g) ' + pctVal + '%,rgba(255,255,255,.06) ' + pctVal + '% 100%)';
    }

    // Score number
    var numEl = document.getElementById('hs-score-num');
    if (numEl) numEl.textContent = pctVal + '%';

    // Level badge
    var levelEl = document.getElementById('hs-level');
    if (levelEl) {
      var level, cls, icon;
      if (pctVal >= 85) { level = 'Sangat Baik'; cls = 'sb'; icon = '🌟'; }
      else if (pctVal >= 70) { level = 'Baik'; cls = 'bk'; icon = '✨'; }
      else if (pctVal >= 50) { level = 'Cukup'; cls = 'ck'; icon = '💪'; }
      else { level = 'Perlu Belajar'; cls = 'pb'; icon = '📚'; }
      levelEl.className = 'hs-level ' + cls;
      levelEl.innerHTML = icon + ' ' + level;
    }

    // Stars
    var starCount = pctVal >= 85 ? 5 : pctVal >= 70 ? 4 : pctVal >= 50 ? 3 : pctVal >= 30 ? 2 : pctVal > 0 ? 1 : 0;
    var starsWrap = document.getElementById('hs-stars');
    if (starsWrap) {
      var stars = starsWrap.querySelectorAll('.hs-star');
      for (var i = 0; i < stars.length; i++) {
        if (i < starCount) {
          stars[i].classList.add('on');
          stars[i].style.animationDelay = (i * .15) + 's';
        } else {
          stars[i].classList.remove('on');
        }
      }
    }
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', calculateHasil);
  } else {
    calculateHasil();
  }
})();
</script>`;
}
