// ═══════════════════════════════════════════════════════════════
// RODA-GAME — Wheel game with spin + question popup
// SVG wheel + spin animation + question overlay + score
// ═══════════════════════════════════════════════════════════════

import type { RodaGameSlots } from '../engine/slot-types';

export function generateRodaGameContent(data: RodaGameSlots): string {
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

  const segCount = data.segments.length;
  const segAngle = 360 / segCount;

  // Generate SVG paths for wheel segments
  function generateSegmentPaths(): string {
    let paths = '';
    const cx = 150, cy = 150, r = 140;
    for (let i = 0; i < segCount; i++) {
      const startAngle = (i * segAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = segAngle > 180 ? 1 : 0;

      paths += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z"
        fill="${esc(data.segments[i].color)}" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/>`;

      // Label text along the segment
      const midAngle = ((i * segAngle + segAngle / 2) - 90) * (Math.PI / 180);
      const labelR = r * 0.62;
      const lx = cx + labelR * Math.cos(midAngle);
      const ly = cy + labelR * Math.sin(midAngle);
      const rotation = i * segAngle + segAngle / 2;

      paths += `<text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}"
        transform="rotate(${rotation.toFixed(1)},${lx.toFixed(2)},${ly.toFixed(2)})"
        text-anchor="middle" dominant-baseline="central"
        fill="#fff" font-family="Nunito,sans-serif" font-weight="900" font-size="${segCount > 8 ? 8 : segCount > 5 ? 10 : 12}"
        style="text-shadow:0 1px 3px rgba(0,0,0,.5)">${esc(data.segments[i].label)}</text>`;
    }
    return paths;
  }

  const segmentPaths = generateSegmentPaths();
  const soalDataJS = JSON.stringify(data.soalPerSegment);
  const segmentsDataJS = JSON.stringify(data.segments.map(s => ({ label: s.label, color: s.color })));

  return `
<style>
  .roda-wrap{display:flex;flex-direction:column;align-items:center;margin:10px 0 20px;}
  .roda-container{position:relative;width:300px;height:300px;margin:0 auto;}
  .roda-svg{width:100%;height:100%;transition:transform 4s cubic-bezier(.17,.67,.12,.99);transform-origin:center;}
  .roda-pointer{position:absolute;top:-8px;left:50%;transform:translateX(-50%);z-index:10;font-size:1.6rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4));}
  .roda-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:var(--bg2);border:3px solid var(--y);display:flex;align-items:center;justify-content:center;font-size:1.2rem;z-index:5;box-shadow:0 0 15px rgba(249,193,46,.3);}
  .roda-spin-btn{margin-top:18px;}
  .roda-spins-left{font-size:.82rem;color:var(--muted);margin-top:8px;font-weight:700;}
  .roda-question-overlay{position:fixed;inset:0;background:rgba(10,20,35,.92);display:none;align-items:center;justify-content:center;z-index:500;animation:fadeIn .3s ease;}
  .roda-question-overlay.show{display:flex;}
  .roda-question-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:28px 24px;max-width:460px;width:90%;animation:bounceIn .5s ease both;position:relative;}
  .roda-question-seg-label{display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:99px;font-size:.76rem;font-weight:800;margin-bottom:14px;}
  .roda-question-text{font-size:1rem;font-weight:800;line-height:1.6;margin-bottom:18px;}
  .roda-question-opts{display:flex;flex-direction:column;gap:8px;}
  .roda-question-opt{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:10px;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.08);cursor:pointer;font-size:.88rem;font-weight:700;transition:all .18s;line-height:1.4;}
  .roda-question-opt:hover:not(.dis){border-color:var(--c);background:rgba(62,207,207,.06);}
  .roda-question-opt.ok{border-color:var(--g);background:rgba(52,211,153,.1);color:var(--g);}
  .roda-question-opt.no{border-color:var(--r);background:rgba(255,107,107,.1);color:var(--r);}
  .roda-question-opt.dis{cursor:default;pointer-events:none;}
  .roda-question-fb{margin-top:12px;padding:10px 14px;border-radius:10px;font-size:.84rem;font-weight:700;line-height:1.5;display:none;}
  .roda-question-fb.show{display:block;}
  .roda-question-fb.ok{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g);}
  .roda-question-fb.no{background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--r);}
  .roda-question-close{position:absolute;top:12px;right:14px;background:none;border:none;color:var(--muted);cursor:pointer;font-size:1.1rem;padding:4px;transition:color .2s;}
  .roda-question-close:hover{color:var(--text);}
  .roda-score-panel{display:flex;align-items:center;gap:20px;padding:14px 20px;background:var(--card);border:1px solid var(--border);border-radius:var(--rad);margin-top:16px;justify-content:center;}
  .roda-score-num{font-family:'Fredoka One',cursive;font-size:1.8rem;color:var(--y);}
  .roda-history{display:flex;gap:6px;flex-wrap:wrap;margin-top:14px;justify-content:center;}
  .roda-history-dot{width:14px;height:14px;border-radius:50%;transition:all .2s;position:relative;}
  .roda-history-dot.answered::after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.55rem;font-weight:900;color:#fff;}
  @media(max-width:640px){
    .roda-container{width:250px;height:250px;}
    .roda-question-card{padding:20px 16px;}
  }
</style>

<div class="fadein" style="text-align:center;margin-bottom:6px">
  <div style="font-size:2rem;margin-bottom:4px">🎡</div>
  <h2 class="h2">${esc(data.judul)}</h2>
  <p class="sub mt8">${esc(data.instruksi)}</p>
</div>

<div class="roda-wrap fadein">
  <div class="roda-container">
    <div class="roda-pointer">▼</div>
    <svg class="roda-svg" id="rodaWheel" viewBox="0 0 300 300">
      ${segmentPaths}
      <circle cx="150" cy="150" r="24" fill="var(--bg2)" stroke="var(--y)" stroke-width="3"/>
      <text x="150" y="150" text-anchor="middle" dominant-baseline="central" font-size="16" fill="var(--y)">🎯</text>
    </svg>
  </div>
  <button class="btn btn-y roda-spin-btn" onclick="spinWheel()" id="btnSpin">🎯 Putar Roda!</button>
  <div class="roda-spins-left" id="spinsLeft"></div>
</div>

<div class="roda-score-panel fadein" id="rodaScorePanel" style="display:none">
  <div>
    <div class="sub" style="font-size:.72rem">Skor</div>
    <div class="roda-score-num" id="rodaScore">0</div>
  </div>
  <div>
    <div class="sub" style="font-size:.72rem">Dijawab</div>
    <div style="font-weight:800;font-size:1.1rem;color:var(--c)" id="rodaAnswered">0</div>
  </div>
  <div>
    <div class="sub" style="font-size:.72rem">Benar</div>
    <div style="font-weight:800;font-size:1.1rem;color:var(--g)" id="rodaCorrect">0</div>
  </div>
</div>

<div class="roda-history fadein" id="rodaHistory">
  ${data.segments.map((s, i) => `<div class="roda-history-dot" data-history="${i}" style="background:${esc(s.color)}44" title="${esc(s.label)}"></div>`).join('')}
</div>

<div class="roda-question-overlay" id="questionOverlay">
  <div class="roda-question-card">
    <button class="roda-question-close" onclick="closeQuestion()" title="Tutup">✕</button>
    <div class="roda-question-seg-label" id="questionSegLabel"></div>
    <div class="roda-question-text" id="questionText"></div>
    <div class="roda-question-opts" id="questionOpts"></div>
    <div class="roda-question-fb" id="questionFb"></div>
    <div class="btn-row btn-center" style="margin-top:14px;display:none" id="questionNextBtn">
      <button class="btn btn-c btn-sm" onclick="closeQuestion()">Lanjut →</button>
    </div>
  </div>
</div>

<script>
(function(){
  var segments = ${segmentsDataJS};
  var soal = ${soalDataJS};
  var currentRotation = 0;
  var isSpinning = false;
  var totalScore = 0;
  var totalAnswered = 0;
  var totalCorrect = 0;
  var answeredSegments = {};

  function updateScoreDisplay(){
    var sp = document.getElementById('rodaScorePanel');
    if(sp) sp.style.display = totalAnswered > 0 ? '' : 'none';
    var s = document.getElementById('rodaScore');
    if(s) s.textContent = totalScore;
    var a = document.getElementById('rodaAnswered');
    if(a) a.textContent = totalAnswered;
    var c = document.getElementById('rodaCorrect');
    if(c) c.textContent = totalCorrect;
  }

  function updateHistory(){
    for(var i = 0; i < segments.length; i++){
      var dot = document.querySelector('[data-history="' + i + '"]');
      if(dot && answeredSegments[i]){
        dot.classList.add('answered');
        dot.style.background = segments[i].color;
      }
    }
  }

  window.spinWheel = function(){
    if(isSpinning) return;
    if(Object.keys(answeredSegments).length >= segments.length){ alert('Semua segmen sudah dijawab!'); return; }
    isSpinning = true;
    if(typeof SFX !== 'undefined' && SFX.spin) SFX.spin();

    var segAngle = 360 / segments.length;
    var extraSpins = 5 + Math.floor(Math.random() * 3);
    var targetSegIdx;
    do {
      targetSegIdx = Math.floor(Math.random() * segments.length);
    } while(answeredSegments[targetSegIdx]);

    var targetAngle = 360 - (targetSegIdx * segAngle + segAngle / 2);
    var newRotation = currentRotation + extraSpins * 360 + targetAngle;
    var wheel = document.getElementById('rodaWheel');
    if(wheel){
      wheel.style.transition = 'transform 4s cubic-bezier(.17,.67,.12,.99)';
      wheel.style.transform = 'rotate(' + newRotation + 'deg)';
    }
    currentRotation = newRotation;

    setTimeout(function(){
      isSpinning = false;
      showQuestion(targetSegIdx);
    }, 4200);
  };

  window.showQuestion = function(segIdx){
    var overlay = document.getElementById('questionOverlay');
    var segLabel = document.getElementById('questionSegLabel');
    var qText = document.getElementById('questionText');
    var qOpts = document.getElementById('questionOpts');
    var qFb = document.getElementById('questionFb');
    var nextBtn = document.getElementById('questionNextBtn');

    var seg = segments[segIdx];
    var q = soal[segIdx];
    if(!q) return;

    if(segLabel){
      segLabel.textContent = seg.label;
      segLabel.style.background = seg.color + '22';
      segLabel.style.color = seg.color;
    }
    if(qText) qText.textContent = q.q;
    if(qFb){ qFb.className = 'roda-question-fb'; qFb.textContent = ''; }
    if(nextBtn) nextBtn.style.display = 'none';

    if(qOpts){
      qOpts.innerHTML = '';
      var optLabels = ['A','B','C','D','E'];
      for(var i = 0; i < q.opts.length; i++){
        (function(optIdx){
          var optEl = document.createElement('div');
          optEl.className = 'roda-question-opt';
          optEl.innerHTML = '<span style="min-width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:900;flex-shrink:0">' + optLabels[optIdx] + '</span><span>' + escQ(q.opts[optIdx]) + '</span>';
          optEl.onclick = function(){ checkAnswer(segIdx, optIdx, q, seg); };
          qOpts.appendChild(optEl);
        })(i);
      }
    }

    if(overlay) overlay.classList.add('show');
    if(typeof SFX !== 'undefined' && SFX.popup) SFX.popup();
  };

  window.checkAnswer = function(segIdx, optIdx, q, seg){
    var qOpts = document.getElementById('questionOpts');
    var qFb = document.getElementById('questionFb');
    var nextBtn = document.getElementById('questionNextBtn');
    if(!qOpts) return;

    var opts = qOpts.querySelectorAll('.roda-question-opt');
    var isCorrect = optIdx === q.ans;

    opts.forEach(function(o, i){
      o.classList.add('dis');
      if(i === q.ans) o.classList.add('ok');
      if(i === optIdx && !isCorrect) o.classList.add('no');
    });

    if(isCorrect){
      totalScore += 10;
      totalCorrect++;
      if(qFb){ qFb.textContent = '🎉 Benar! Hebat!'; qFb.className = 'roda-question-fb show ok'; }
      if(typeof SFX !== 'undefined' && SFX.correct) SFX.correct();
    } else {
      if(qFb){ qFb.textContent = '❌ Kurang tepat. Jawaban yang benar: ' + q.opts[q.ans]; qFb.className = 'roda-question-fb show no'; }
      if(typeof SFX !== 'undefined' && SFX.wrong) SFX.wrong();
    }

    totalAnswered++;
    answeredSegments[segIdx] = true;
    addScore(isCorrect ? 10 : 0);
    updateScoreDisplay();
    updateHistory();
    if(nextBtn) nextBtn.style.display = '';

    if(Object.keys(answeredSegments).length >= segments.length){
      setTimeout(function(){
        if(totalCorrect === segments.length) launchConfetti();
      }, 800);
    }
  };

  window.closeQuestion = function(){
    var overlay = document.getElementById('questionOverlay');
    if(overlay) overlay.classList.remove('show');
  };

  function escQ(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  updateScoreDisplay();
})();
</script>
`;
}
