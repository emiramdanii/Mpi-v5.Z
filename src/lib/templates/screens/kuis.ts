// ═══════════════════════════════════════════════════════════════
// KUIS — Quiz screen template with interactive multiple choice
// ═══════════════════════════════════════════════════════════════

import type { KuisSlots } from '../engine/slot-types';

function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function generateKuisContent(data: KuisSlots): string {
  const soalJS = JSON.stringify(data.soal.map(s => ({
    q: s.q,
    opts: s.opts || ['', '', '', ''],
    ans: s.ans,
    ex: s.ex,
  })));
  const letters = ['A', 'B', 'C', 'D'];

  return `
<style>
.kuis-header{padding:20px 24px 12px;background:linear-gradient(135deg,rgba(249,193,46,.12),rgba(62,207,207,.06))}
.kuis-icon{width:50px;height:50px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;background:rgba(249,193,46,.12);flex-shrink:0}
.kuis-progress{height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:12px}
.kuis-progress-fill{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;transition:width .4s}
.kuis-puzzle{display:flex;gap:5px;margin-top:8px}
.kuis-dot{width:22px;height:5px;border-radius:99px;background:rgba(255,255,255,.1);transition:background .3s}
.kuis-dot.done{background:var(--g)}
.kuis-dot.cur{background:var(--y)}
.kuis-dot.wrong{background:var(--r)}
.score-badge{padding:8px 14px;border-radius:10px;font-size:13px;font-weight:bold;background:rgba(249,193,46,.12);color:var(--y);border:1px solid rgba(249,193,46,.2)}
</style>

<div class="kuis-header">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="kuis-icon">❓</div>
    <div style="flex:1">
      <span class="chip-sc" style="background:rgba(249,193,46,.15);color:var(--y)">❓ Kuis</span>
      <h2 class="h2" style="margin-top:2px">${esc(data.judul || 'Kuis')}<br><span class="hl">${esc(data.subjudul || 'Pengetahuan')}</span></h2>
      <div class="sub">${data.soal.length} soal · Pilihan Ganda</div>
    </div>
    <div class="score-badge" id="kuisScoreBadge">⭐ 0</div>
  </div>
  <div class="kuis-progress"><div class="kuis-progress-fill" id="kuisProgressFill" style="width:0%"></div></div>
  <div class="kuis-puzzle" id="kuisPuzzle">
    ${data.soal.slice(0, 15).map((_, i) => `<div class="kuis-dot${i === 0 ? ' cur' : ''}" id="kdot-${i}"></div>`).join('')}
  </div>
</div>

<div style="padding:16px 20px;overflow-y:auto;max-height:calc(100vh - 180px)" id="kuisContainer"></div>

<div class="btn-row btn-center" style="padding:0 20px 16px">
  <button class="btn btn-y" id="btnKuisSubmit" onclick="submitKuis()" style="display:none">Lihat Hasil 📊</button>
</div>

<script>
(function(){
  var KUIS_SOAL = ${soalJS};
  var kuisScore = 0;
  var answered = 0;
  var total = KUIS_SOAL.length;
  var container = document.getElementById('kuisContainer');
  var letters = ${JSON.stringify(letters)};

  function renderSoal() {
    container.innerHTML = KUIS_SOAL.map(function(soal, si) {
      return '<div class="q-card fadein" style="animation-delay:' + (si * .06) + 's" id="qcard-' + si + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
          '<span style="font-family:\'Fredoka One\',cursive;font-size:1.1rem;color:var(--y)">' + (si + 1) + '</span>' +
          '<span class="badge" style="background:rgba(62,207,207,.12);color:var(--c)">10 poin</span>' +
        '</div>' +
        '<div class="q-text">' + escH(soal.q) + '</div>' +
        '<div class="q-opts" id="qopts-' + si + '">' +
          soal.opts.filter(function(o){return o && o.trim()}).map(function(opt, oi) {
            return '<div class="q-opt" onclick="answerKuis(' + si + ',' + oi + ')" id="qopt-' + si + '-' + oi + '">' +
              '<span style="width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:900;background:rgba(249,193,46,.12);color:var(--y);flex-shrink:0">' + letters[oi] + '</span>' +
              '<span>' + escH(opt) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div id="qfb-' + si + '"></div>' +
      '</div>';
    }).join('');
  }

  window.answerKuis = function(si, oi) {
    var soal = KUIS_SOAL[si];
    var optsEl = document.getElementById('qopts-' + si);
    if (!optsEl || optsEl.dataset.answered) return;
    optsEl.dataset.answered = '1';
    answered++;

    var isCorrect = oi === soal.ans;

    // Mark all opts
    soal.opts.filter(function(o){return o && o.trim()}).forEach(function(opt, idx) {
      var el = document.getElementById('qopt-' + si + '-' + idx);
      if (!el) return;
      el.classList.add('dis');
      if (idx === soal.ans) el.classList.add(isCorrect ? 'ok' : 'shok');
      if (idx === oi && !isCorrect) el.classList.add('no');
    });

    // Feedback
    var fbEl = document.getElementById('qfb-' + si);
    if (fbEl) {
      fbEl.innerHTML = '<div class="q-fb ' + (isCorrect ? 'ok' : 'no') + '">' +
        (isCorrect ? '✅ Benar! ' : '❌ Salah. ') + escH(soal.ex || '') + '</div>';
    }

    // Score
    if (isCorrect) {
      kuisScore += 10;
      if (typeof SFX !== 'undefined' && SFX.correct) SFX.correct();
    } else {
      if (typeof SFX !== 'undefined' && SFX.wrong) SFX.wrong();
    }

    // Update dots
    var dot = document.getElementById('kdot-' + si);
    if (dot) dot.className = 'kuis-dot ' + (isCorrect ? 'done' : 'wrong');
    var nextDot = document.getElementById('kdot-' + (si + 1));
    if (nextDot && !nextDot.classList.contains('done') && !nextDot.classList.contains('wrong')) nextDot.classList.add('cur');

    // Update progress
    var pct = Math.round((answered / total) * 100);
    var fill = document.getElementById('kuisProgressFill');
    if (fill) fill.style.width = pct + '%';
    var badge = document.getElementById('kuisScoreBadge');
    if (badge) badge.textContent = '⭐ ' + kuisScore;

    // Show submit button when all answered
    if (answered >= total) {
      var btn = document.getElementById('btnKuisSubmit');
      if (btn) btn.style.display = 'inline-flex';
      if (typeof addScore === 'function') addScore(kuisScore);
    }
  };

  window.submitKuis = function() {
    if (typeof goScreen === 'function') goScreen('s-hasil');
  };

  function escH(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  renderSoal();
})();
</script>`;
}
