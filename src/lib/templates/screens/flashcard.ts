// ═══════════════════════════════════════════════════════════════
// FLASHCARD SCREEN — Card-flip learning game
// Generates inner content HTML (no wrapper/navbar)
// ═══════════════════════════════════════════════════════════════

import type { FlashcardSlots } from '../engine/slot-types';

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
 * Generate flashcard game content.
 * Features: card stack, 3D flip animation, prev/next navigation,
 * progress indicator, score tracking.
 */
export function generateFlashcardContent(data: FlashcardSlots): string {
  const cards = data.cards || [];
  const total = cards.length;

  return `
<style>
.fc-wrap{display:flex;flex-direction:column;align-items:center;padding:20px 16px;max-width:520px;margin:0 auto}
.fc-header{text-align:center;margin-bottom:20px}
.fc-header-icon{font-size:2.4rem;margin-bottom:6px;animation:float 3s ease-in-out infinite}
.fc-instruksi{color:var(--muted);font-size:.82rem;line-height:1.5;margin-top:6px;max-width:360px;margin-left:auto;margin-right:auto}

/* Card stack */
.fc-stack{position:relative;width:100%;max-width:380px;height:240px;perspective:1000px;margin-bottom:18px}
.fc-card{position:absolute;inset:0;cursor:pointer;transition:transform .6s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d;border-radius:var(--rad)}
.fc-card.flipped{transform:rotateY(180deg)}
.fc-face{position:absolute;inset:0;backface-visibility:hidden;border-radius:var(--rad);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;border:2px solid var(--border)}
.fc-front{background:linear-gradient(135deg,var(--card),var(--bg2))}
.fc-back{background:linear-gradient(135deg,rgba(52,211,153,.08),rgba(62,207,207,.08));border-color:rgba(52,211,153,.2);transform:rotateY(180deg)}
.fc-face-icon{font-size:2.6rem;margin-bottom:10px;filter:drop-shadow(0 2px 8px rgba(0,0,0,.3))}
.fc-face-text{font-size:1.05rem;font-weight:700;line-height:1.5;color:var(--text)}
.fc-back .fc-face-text{color:var(--g)}
.fc-label{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-top:8px;opacity:.5}
.fc-tap-hint{font-size:.72rem;color:var(--muted);margin-top:6px;animation:tapP 1.4s ease-in-out infinite}

/* Progress */
.fc-progress{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.fc-counter{font-family:'Fredoka One',cursive;font-size:1.1rem;color:var(--y)}
.fc-bar{flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;max-width:200px}
.fc-bar-fill{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;transition:width .4s}
.fc-score-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:99px;font-size:.74rem;font-weight:800;background:rgba(52,211,153,.12);color:var(--g)}

/* Navigation */
.fc-nav{display:flex;gap:10px;align-items:center}
.fc-dots{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;max-width:260px;margin:10px 0}
.fc-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.12);transition:all .2s}
.fc-dot.cur{background:var(--y);transform:scale(1.3)}
.fc-dot.seen{background:var(--g)}
.fc-dot.wrong{background:var(--r)}
</style>

<div class="fc-wrap fadein">
  <!-- Header -->
  <div class="fc-header">
    <div class="fc-header-icon">🃏</div>
    <h2 class="h2"><span class="hl">${esc(data.judul || 'Flashcard')}</span></h2>
    <p class="fc-instruksi">${esc(data.instruksi || 'Klik kartu untuk membalik. Pelajari setiap kartu!')}</p>
  </div>

  <!-- Progress bar -->
  <div class="fc-progress">
    <span class="fc-counter" id="fc-counter">1/${total}</span>
    <div class="fc-bar"><div class="fc-bar-fill" id="fc-bar-fill" style="width:${total > 0 ? (1 / total * 100) : 0}%"></div></div>
    <span class="fc-score-chip" id="fc-score-chip">⭐ 0</span>
  </div>

  <!-- Card stack -->
  <div class="fc-stack" id="fc-stack">
    ${cards.length > 0 ? cards.map((card, i) => {
      const icon = card.icon || '📌';
      const warna = card.warna || 'var(--y)';
      return `
    <div class="fc-card${i === 0 ? '' : ' fc-hidden'}" id="fc-card-${i}" data-idx="${i}" onclick="flipCard(${i})" style="z-index:${total - i};${i !== 0 ? 'transform:scale(.92) translateY(8px);opacity:0;pointer-events:none' : ''}">
      <div class="fc-face fc-front" style="border-color:${warna}30">
        <div class="fc-face-icon">${icon}</div>
        <div class="fc-face-text">${esc(card.depan)}</div>
        <div class="fc-label">Depan</div>
        <div class="fc-tap-hint">👆 Ketuk untuk membalik</div>
      </div>
      <div class="fc-face fc-back">
        <div class="fc-face-icon">✅</div>
        <div class="fc-face-text">${esc(card.belakang)}</div>
        <div class="fc-label">Belakang</div>
      </div>
    </div>`;
    }).join('') : `
    <div class="fc-card" style="z-index:1">
      <div class="fc-face fc-front">
        <div class="fc-face-icon">📭</div>
        <div class="fc-face-text">Belum ada kartu</div>
      </div>
    </div>`}
  </div>

  <!-- Dots -->
  <div class="fc-dots" id="fc-dots">
    ${cards.map((_, i) => `<div class="fc-dot${i === 0 ? ' cur' : ''}" id="fc-dot-${i}"></div>`).join('')}
  </div>

  <!-- Navigation -->
  <div class="fc-nav">
    <button class="btn btn-ghost btn-sm" id="fc-prev" onclick="prevCard()" disabled style="opacity:.4">← Sebelumnya</button>
    <button class="btn btn-y btn-sm" id="fc-next" onclick="nextCard()">Selanjutnya →</button>
  </div>

  <!-- Action buttons -->
  <div class="btn-row btn-center mt20">
    <button class="btn btn-g" onclick="markKnown()">✅ Sudah Paham</button>
    <button class="btn btn-r btn-sm" onclick="markRepeat()">🔄 Ulangi</button>
  </div>
</div>

<script>
(function(){
  var cards = ${JSON.stringify(cards)};
  var total = cards.length;
  var idx = 0;
  var flipped = false;
  var score = 0;
  var known = {};

  function updateUI() {
    // Counter
    var counter = document.getElementById('fc-counter');
    if (counter) counter.textContent = (idx + 1) + '/' + total;

    // Progress bar
    var bar = document.getElementById('fc-bar-fill');
    if (bar) bar.style.width = (total > 0 ? ((idx + 1) / total * 100) : 0) + '%';

    // Score chip
    var chip = document.getElementById('fc-score-chip');
    if (chip) chip.textContent = '\u2B50 ' + score;

    // Dots
    for (var i = 0; i < total; i++) {
      var dot = document.getElementById('fc-dot-' + i);
      if (dot) {
        dot.className = 'fc-dot';
        if (i === idx) dot.className += ' cur';
        else if (known[i]) dot.className += ' seen';
      }
    }

    // Prev/Next buttons
    var prev = document.getElementById('fc-prev');
    var next = document.getElementById('fc-next');
    if (prev) { prev.disabled = idx === 0; prev.style.opacity = idx === 0 ? '.4' : '1'; }
    if (next) { next.disabled = idx >= total - 1; next.style.opacity = idx >= total - 1 ? '.4' : '1'; }
  }

  window.flipCard = function(i) {
    if (i !== idx) return;
    var card = document.getElementById('fc-card-' + i);
    if (!card) return;
    flipped = !flipped;
    if (flipped) {
      card.classList.add('flipped');
      if (typeof SFX !== 'undefined' && SFX.flip) SFX.flip();
    } else {
      card.classList.remove('flipped');
    }
  };

  window.nextCard = function() {
    if (idx >= total - 1) return;
    var oldCard = document.getElementById('fc-card-' + idx);
    if (oldCard) { oldCard.style.transform = 'scale(.88) translateX(-120%)'; oldCard.style.opacity = '0'; oldCard.style.pointerEvents = 'none'; }
    idx++;
    flipped = false;
    var newCard = document.getElementById('fc-card-' + idx);
    if (newCard) { newCard.style.transform = ''; newCard.style.opacity = '1'; newCard.style.pointerEvents = ''; newCard.classList.remove('flipped'); }
    if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
    updateUI();
  };

  window.prevCard = function() {
    if (idx <= 0) return;
    var oldCard = document.getElementById('fc-card-' + idx);
    if (oldCard) { oldCard.style.transform = 'scale(.92) translateY(8px)'; oldCard.style.opacity = '0'; oldCard.style.pointerEvents = 'none'; }
    idx--;
    flipped = false;
    var newCard = document.getElementById('fc-card-' + idx);
    if (newCard) { newCard.style.transform = ''; newCard.style.opacity = '1'; newCard.style.pointerEvents = ''; newCard.classList.remove('flipped'); }
    if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
    updateUI();
  };

  window.markKnown = function() {
    if (idx < total && !known[idx]) {
      known[idx] = true;
      score += 10;
      addScore(10);
      if (typeof SFX !== 'undefined' && SFX.correct) SFX.correct();
      var dot = document.getElementById('fc-dot-' + idx);
      if (dot) dot.className = 'fc-dot seen';
    }
    if (idx < total - 1) { nextCard(); }
    updateUI();
  };

  window.markRepeat = function() {
    if (typeof SFX !== 'undefined' && SFX.flip) SFX.flip();
    var card = document.getElementById('fc-card-' + idx);
    if (card) card.classList.remove('flipped');
    flipped = false;
  };
})();
</script>`;
}
