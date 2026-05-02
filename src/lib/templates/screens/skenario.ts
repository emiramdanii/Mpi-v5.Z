// ═══════════════════════════════════════════════════════════════
// SKENARIO SCREEN — Interactive scenario / branching story
// Generates inner content HTML (no wrapper/navbar)
// ═══════════════════════════════════════════════════════════════

import type { SkenarioSlots } from '../engine/slot-types';

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
 * Generate interactive scenario content.
 * Features: chapter-based story, character with emoji head, dialogue system,
 * choice selection, result banners, progress dots.
 * Full inline JS drives the interaction flow.
 */
export function generateSkenarioContent(data: SkenarioSlots): string {
  const chapters = data.chapters || [];
  const totalChapters = chapters.length;

  return `
<style>
.sk-wrap{max-width:600px;margin:0 auto;padding:12px 14px}
.sk-title-bar{text-align:center;margin-bottom:10px}
.sk-title-bar h2{font-family:'Fredoka One',cursive;font-size:1.2rem;color:var(--y);margin-bottom:2px}
.sk-title-bar .sub{font-size:.76rem}

/* Progress dots */
.sk-prog{display:flex;gap:6px;justify-content:center;margin:8px 0 12px}
.sk-prog-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.1);transition:all .3s}
.sk-prog-dot.cur{background:var(--y);transform:scale(1.3);box-shadow:0 0 8px rgba(249,193,46,.4)}
.sk-prog-dot.done{background:var(--g)}
.sk-prog-dot.done-bad{background:var(--r)}
</style>

<div class="sk-wrap fadein">
  <!-- Title -->
  <div class="sk-title-bar">
    <h2><span class="hl">${esc(data.judul || 'Skenario Interaktif')}</span></h2>
    <div class="sub">Pilih jalanmu sendiri · ${totalChapters} tahap</div>
  </div>

  <!-- Progress dots -->
  <div class="sk-prog" id="sk-prog">
    ${chapters.map((_, i) => `<div class="sk-prog-dot${i === 0 ? ' cur' : ''}" id="sk-prog-${i}"></div>`).join('')}
  </div>

  <!-- Shell -->
  <div class="sk-shell" id="sk-shell">
    <!-- HUD -->
    <div class="sk-hud">
      <span class="sk-hud-title" id="sk-hud-title">🎭 Skenario</span>
      <div style="display:flex;gap:6px;align-items:center">
        <span class="sk-badge" style="background:rgba(249,193,46,.15);color:var(--y)" id="sk-hud-badge">Tahap 1/${totalChapters}</span>
        <span class="sk-badge" style="background:rgba(52,211,153,.15);color:var(--g)" id="sk-hud-score">⭐ 0</span>
      </div>
    </div>

    <!-- Scene (dynamically filled by JS) -->
    <div class="sk-scene" id="sk-scene">
      <!-- Character will be placed here -->
      <div class="sk-char" id="sk-char" style="left:20%">
        <div class="sk-head" id="sk-head">😊</div>
        <div class="sk-body" id="sk-body" style="background:var(--y)"></div>
        <div class="sk-legs">
          <div class="sk-leg" id="sk-leg-l" style="background:var(--y)"></div>
          <div class="sk-leg" id="sk-leg-r" style="background:var(--y)"></div>
        </div>
      </div>

      <!-- Dialogue overlay -->
      <div class="sk-dialogue" id="sk-dialogue">
        <div class="sk-speaker" id="sk-speaker">NARATOR</div>
        <div class="sk-text" id="sk-text">Memulai petualangan...</div>
        <div class="sk-tap" id="sk-tap">👆 Ketuk untuk lanjut</div>
      </div>
    </div>

    <!-- Choices area -->
    <div class="sk-choices" id="sk-choices" style="display:none">
      <div class="sk-choice-prompt" id="sk-choice-prompt">Apa yang akan kamu lakukan?</div>
      <div id="sk-choice-list"></div>
    </div>

    <!-- Result area -->
    <div class="sk-result" id="sk-result" style="display:none">
      <div class="sk-result-banner" id="sk-result-banner">
        <div style="font-size:1.4rem;flex-shrink:0" id="sk-result-icon">✅</div>
        <div>
          <div class="sk-result-title" id="sk-result-title">Hasil</div>
          <div class="sk-result-body" id="sk-result-body">Konsekuensi dari pilihanmu.</div>
        </div>
      </div>
      <!-- Consequences -->
      <div id="sk-consequences"></div>
      <!-- Norma badge -->
      <div id="sk-norma" style="margin-top:8px"></div>
      <!-- Next button -->
      <div style="text-align:center;margin-top:12px">
        <button class="btn btn-y btn-sm" id="sk-next-btn" onclick="nextChapter()">Lanjut →</button>
      </div>
    </div>

    <!-- Body area for extra content -->
    <div id="sk-body-area" style="padding:14px;display:none"></div>
  </div>
</div>

<script>
(function(){
  // ── Data ──────────────────────────────────────────────────
  var DATA = ${JSON.stringify(data)};
  var chapters = DATA.chapters || [];
  var total = chapters.length;
  var chIdx = 0;
  var setupIdx = 0;
  var phase = 'setup'; // setup | choices | result
  var skScore = 0;
  var setupTimer = null;

  // ── Helpers ───────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }
  function escH(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // ── Init ──────────────────────────────────────────────────
  window.initSkenario = function() {
    if (total > 0) showChapter(0);
  };

  // ── Show chapter ──────────────────────────────────────────
  window.showChapter = function(idx) {
    if (idx >= total) return;
    chIdx = idx;
    var ch = chapters[idx];
    setupIdx = 0;
    phase = 'setup';

    // Update HUD
    var hudTitle = $('sk-hud-title');
    if (hudTitle) hudTitle.textContent = ch.title || ('Tahap ' + (idx + 1));
    var hudBadge = $('sk-hud-badge');
    if (hudBadge) hudBadge.textContent = 'Tahap ' + (idx + 1) + '/' + total;
    var hudScore = $('sk-hud-score');
    if (hudScore) hudScore.textContent = '\u2B50 ' + skScore;

    // Update progress dots
    for (var i = 0; i < total; i++) {
      var dot = $('sk-prog-' + i);
      if (dot) {
        dot.className = 'sk-prog-dot';
        if (i === idx) dot.className += ' cur';
      }
    }

    // Update scene background
    var scene = $('sk-scene');
    if (scene) {
      var bgMap = {
        'pasar': 'sbg-pasar',
        'masjid': 'sbg-masjid',
        'kelas': 'sbg-kelas',
        'kampung': 'sbg-kampung',
        'hutan': 'sbg-hutan',
        'pantai': 'sbg-pantai'
      };
      // Remove old bg classes
      scene.className = 'sk-scene';
      var bgClass = bgMap[ch.bg] || '';
      if (bgClass) scene.classList.add(bgClass);
      else if (ch.bg) scene.style.background = ch.bg;
    }

    // Update character
    var head = $('sk-head');
    if (head) head.textContent = ch.charEmoji || '😊';
    var body = $('sk-body');
    if (body) body.style.background = ch.charColor || 'var(--y)';
    var legL = $('sk-leg-l');
    var legR = $('sk-leg-r');
    if (legL) legL.style.background = ch.charPants || ch.charColor || 'var(--y)';
    if (legR) legR.style.background = ch.charPants || ch.charColor || 'var(--y)';

    // Hide choices and result, show dialogue
    showSetup();
  };

  // ── Show setup dialogues ──────────────────────────────────
  window.showSetup = function() {
    var ch = chapters[chIdx];
    if (!ch) return;
    phase = 'setup';

    $('sk-choices') && ($('sk-choices').style.display = 'none');
    $('sk-result') && ($('sk-result').style.display = 'none');
    $('sk-dialogue') && ($('sk-dialogue').style.display = '');
    $('sk-body-area') && ($('sk-body-area').style.display = 'none');

    // Show current setup dialogue
    var setup = ch.setup || [];
    if (setupIdx < setup.length) {
      var s = setup[setupIdx];
      $('sk-speaker') && ($('sk-speaker').textContent = (s.speaker || 'NARATOR').toUpperCase());
      $('sk-text') && ($('sk-text').textContent = s.text || '...');
      $('sk-tap') && ($('sk-tap').style.display = '');
    } else {
      // Setup done, show choices
      showChoices();
    }
  };

  // Tap on dialogue area
  document.addEventListener('DOMContentLoaded', function() {
    var dialogue = $('sk-dialogue');
    if (dialogue) {
      dialogue.addEventListener('click', function() {
        if (phase !== 'setup') return;
        var ch = chapters[chIdx];
        var setup = ch ? (ch.setup || []) : [];
        setupIdx++;
        if (setupIdx < setup.length) {
          showSetup();
          if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
        } else {
          showChoices();
        }
      });
    }
    // Auto init
    initSkenario();
  });

  // ── Show choices ──────────────────────────────────────────
  window.showChoices = function() {
    var ch = chapters[chIdx];
    if (!ch) return;
    phase = 'choices';

    $('sk-dialogue') && ($('sk-dialogue').style.display = 'none');
    $('sk-result') && ($('sk-result').style.display = 'none');
    $('sk-choices') && ($('sk-choices').style.display = '');
    $('sk-body-area') && ($('sk-body-area').style.display = 'none');

    // Choice prompt
    var promptEl = $('sk-choice-prompt');
    if (promptEl) promptEl.textContent = ch.choicePrompt || 'Apa yang akan kamu lakukan?';

    // Render choices
    var choiceList = $('sk-choice-list');
    if (choiceList) {
      var choices = ch.choices || [];
      choiceList.innerHTML = choices.map(function(c, i) {
        return '<div class="sk-choice fadein" style="animation-delay:' + (i * .08) + 's" onclick="selectChoice(' + i + ')">' +
          '<span style="font-size:1.2rem;flex-shrink:0">' + (c.icon || '🔘') + '</span>' +
          '<div style="flex:1">' +
            '<div style="font-size:.86rem;font-weight:700;color:var(--text)">' + escH(c.label) + '</div>' +
            '<div style="font-size:.74rem;color:var(--muted);margin-top:2px">' + escH(c.detail) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  };

  // ── Select choice ─────────────────────────────────────────
  window.selectChoice = function(choiceIdx) {
    var ch = chapters[chIdx];
    if (!ch) return;
    var choice = (ch.choices || [])[choiceIdx];
    if (!choice) return;
    phase = 'result';

    // Score
    var pts = choice.pts || 0;
    skScore += pts;
    if (typeof addScore === 'function') addScore(pts);

    // Update HUD score
    var hudScore = $('sk-hud-score');
    if (hudScore) hudScore.textContent = '\u2B50 ' + skScore;

    // Update progress dot
    var dot = $('sk-prog-' + chIdx);
    if (dot) {
      dot.className = 'sk-prog-dot';
      if (choice.good) dot.className += ' done';
      else dot.className += ' done-bad';
    }

    // Show result
    showResult(choice);

    // SFX
    if (choice.good) {
      if (typeof SFX !== 'undefined' && SFX.correct) SFX.correct();
    } else {
      if (typeof SFX !== 'undefined' && SFX.wrong) SFX.wrong();
    }
  };

  // ── Show result ───────────────────────────────────────────
  window.showResult = function(choice) {
    $('sk-choices') && ($('sk-choices').style.display = 'none');
    $('sk-dialogue') && ($('sk-dialogue').style.display = 'none');
    $('sk-result') && ($('sk-result').style.display = '');
    $('sk-body-area') && ($('sk-body-area').style.display = 'none');

    // Banner type
    var bannerType = choice.good ? 'good' : (choice.level === 'mid' ? 'mid' : 'bad');
    var bannerIcon = choice.good ? '✅' : (choice.level === 'mid' ? '⚠️' : '❌');

    var banner = $('sk-result-banner');
    if (banner) {
      banner.className = 'sk-result-banner ' + bannerType;
    }

    var resultIcon = $('sk-result-icon');
    if (resultIcon) resultIcon.textContent = bannerIcon;

    var resultTitle = $('sk-result-title');
    if (resultTitle) resultTitle.textContent = choice.resultTitle || (choice.good ? 'Pilihan Baik!' : 'Coba Lagi!');

    var resultBody = $('sk-result-body');
    if (resultBody) resultBody.textContent = choice.resultBody || '';

    // Consequences
    var consEl = $('sk-consequences');
    if (consEl) {
      var cons = choice.consequences || [];
      consEl.innerHTML = cons.map(function(c) {
        return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;font-size:.8rem;color:var(--text)">' +
          '<span>' + (c.icon || '📌') + '</span>' +
          '<span>' + escH(c.text) + '</span>' +
        '</div>';
      }).join('');
    }

    // Norma badge
    var normaEl = $('sk-norma');
    if (normaEl && choice.norma) {
      normaEl.innerHTML = '<div class="def-box" style="font-size:.8rem;margin-top:8px;border-color:var(--c);background:rgba(62,207,207,.06)">' +
        '<strong style="color:var(--c)">📜 Nilai/Norma:</strong> ' + escH(choice.norma) +
      '</div>';
    } else if (normaEl) {
      normaEl.innerHTML = '';
    }

    // Hide next button on last chapter
    var nextBtn = $('sk-next-btn');
    if (nextBtn) {
      if (chIdx >= total - 1) {
        nextBtn.textContent = '🏁 Lihat Hasil';
        nextBtn.onclick = function() { if (typeof goScreen === 'function') goScreen('s-hasil'); };
      } else {
        nextBtn.textContent = 'Lanjut \u2192';
        nextBtn.onclick = function() { nextChapter(); };
      }
    }
  };

  // ── Next chapter ──────────────────────────────────────────
  window.nextChapter = function() {
    if (chIdx < total - 1) {
      showChapter(chIdx + 1);
      if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
    } else {
      // Go to hasil screen
      if (typeof goScreen === 'function') goScreen('s-hasil');
    }
  };

})();
</script>`;
}
