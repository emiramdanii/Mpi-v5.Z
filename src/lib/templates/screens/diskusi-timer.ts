// ═══════════════════════════════════════════════════════════════
// DISKUSI-TIMER — Discussion page with countdown timer
// Header + large timer display + group cards + panduan
// ═══════════════════════════════════════════════════════════════

import type { DiskusiTimerSlots } from '../engine/slot-types';

export function generateDiskusiTimerContent(data: DiskusiTimerSlots): string {
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

  const durasiMin = Math.floor(data.durasi / 60);
  const durasiSec = data.durasi % 60;
  const initialDisplay = String(durasiMin).padStart(2, '0') + ':' + String(durasiSec).padStart(2, '0');

  const groupsHTML = data.groups && data.groups.length
    ? data.groups.map((g, idx) => `
        <div class="card fadein" style="border-left:4px solid ${esc(g.color)};display:flex;align-items:center;gap:14px;animation-delay:${idx * 0.08}s">
          <div style="width:42px;height:42px;border-radius:50%;background:${esc(g.color)}22;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:${esc(g.color)};flex-shrink:0">
            👥
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:.92rem">${esc(g.nama)}</div>
            <div class="sub">${esc(g.anggota)} anggota</div>
          </div>
          <span class="badge" style="background:${esc(g.color)}22;color:${esc(g.color)}">Grup ${idx + 1}</span>
        </div>
      `).join('\n')
    : '';

  const panduanHTML = data.panduan && data.panduan.length
    ? data.panduan.map((p, idx) => `
        <div class="fadein" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;animation-delay:${idx * 0.06}s">
          <span style="min-width:26px;height:26px;border-radius:50%;background:var(--y)22;color:var(--y);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:900;flex-shrink:0">${idx + 1}</span>
          <span style="font-size:.88rem;line-height:1.6">${esc(p)}</span>
        </div>
      `).join('\n')
    : '';

  return `
<style>
  .diskusi-timer-wrap{display:flex;flex-direction:column;align-items:center;margin:20px 0;}
  .diskusi-timer-display{font-family:'Fredoka One',cursive;font-size:4.5rem;letter-spacing:4px;color:var(--y);text-shadow:0 0 30px rgba(249,193,46,.3);transition:all .3s;line-height:1;}
  .diskusi-timer-display.running{animation:countdownPulse 1s ease-in-out infinite;}
  .diskusi-timer-display.warning{color:var(--r);text-shadow:0 0 30px rgba(255,107,107,.4);}
  .diskusi-timer-ring{position:relative;width:180px;height:180px;margin-bottom:16px;}
  .diskusi-timer-ring svg{transform:rotate(-90deg);}
  .diskusi-timer-ring circle{fill:none;stroke-width:6;}
  .diskusi-timer-ring .ring-bg{stroke:rgba(255,255,255,.06);}
  .diskusi-timer-ring .ring-fg{stroke:var(--y);stroke-linecap:round;transition:stroke-dashoffset .5s ease,stroke .3s;}
  .diskusi-timer-ring .ring-fg.warning{stroke:var(--r);}
  .diskusi-timer-label{font-size:.82rem;color:var(--muted);font-weight:700;margin-top:4px;}
  .diskusi-timer-btns{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;justify-content:center;}
  .diskusi-groups-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin:16px 0;}
  .diskusi-panduan-box{background:var(--card);border:1px solid var(--border);border-radius:var(--rad);padding:18px;margin-top:16px;}
  @media(max-width:640px){
    .diskusi-timer-display{font-size:3rem;}
    .diskusi-timer-ring{width:140px;height:140px;}
    .diskusi-groups-grid{grid-template-columns:1fr;}
  }
</style>

<div class="fadein" style="text-align:center;margin-bottom:6px">
  <div style="font-size:2.2rem;margin-bottom:6px">💬</div>
  <h2 class="h2">${esc(data.judul)}</h2>
  <p class="sub mt8" style="max-width:560px;margin-left:auto;margin-right:auto">${esc(data.prompt)}</p>
</div>

<div class="diskusi-timer-wrap fadein">
  <div class="diskusi-timer-ring">
    <svg viewBox="0 0 180 180" width="100%" height="100%">
      <circle class="ring-bg" cx="90" cy="90" r="80"/>
      <circle id="timerRing" class="ring-fg" cx="90" cy="90" r="80"
        stroke-dasharray="502.65"
        stroke-dashoffset="0"/>
    </svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div id="timerDisplay" class="diskusi-timer-display">${initialDisplay}</div>
      <div id="timerLabel" class="diskusi-timer-label">Siap memulai</div>
    </div>
  </div>
  <div class="diskusi-timer-btns">
    <button class="btn btn-y" onclick="startTimer()" id="btnStart">▶ Mulai</button>
    <button class="btn btn-ghost" onclick="pauseTimer()" id="btnPause" style="display:none">⏸ Jeda</button>
    <button class="btn btn-ghost" onclick="resetTimer()" id="btnReset">↺ Reset</button>
  </div>
</div>

${groupsHTML ? `
<div style="margin-top:10px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
    <span style="font-size:1.1rem">👥</span>
    <span style="font-weight:800;font-size:.95rem">Kelompok Diskusi</span>
    <span class="badge" style="background:var(--c)22;color:var(--c)">${data.groups.length} grup</span>
  </div>
  <div class="diskusi-groups-grid">${groupsHTML}</div>
</div>
` : ''}

${panduanHTML ? `
<div class="diskusi-panduan-box fadein">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
    <span style="font-size:1.1rem">📌</span>
    <span style="font-weight:800;font-size:.95rem">Panduan Diskusi</span>
  </div>
  ${panduanHTML}
</div>
` : ''}

<script>
(function(){
  var CIRCUMFERENCE = 2 * Math.PI * 80;
  var totalSeconds = ${data.durasi};
  var timeLeft = totalSeconds;
  var timerInterval = null;
  var isRunning = false;

  function pad2(n){ return n < 10 ? '0' + n : '' + n; }

  function updateTimerDisplay(){
    var m = Math.floor(timeLeft / 60);
    var s = timeLeft % 60;
    var display = document.getElementById('timerDisplay');
    var label = document.getElementById('timerLabel');
    var ring = document.getElementById('timerRing');
    if(display) display.textContent = pad2(m) + ':' + pad2(s);

    var progress = totalSeconds > 0 ? (1 - timeLeft / totalSeconds) : 0;
    var offset = CIRCUMFERENCE * progress;
    if(ring) ring.setAttribute('stroke-dashoffset', offset);

    var isWarning = timeLeft <= 30 && timeLeft > 0;
    if(display){
      display.classList.toggle('warning', isWarning);
      display.classList.toggle('running', isRunning);
    }
    if(ring) ring.classList.toggle('warning', isWarning);
    if(label){
      if(timeLeft <= 0) label.textContent = 'Waktu habis!';
      else if(isRunning) label.textContent = 'Sedang berjalan...';
      else label.textContent = 'Siap memulai';
    }
  }

  window.startTimer = function(){
    if(isRunning) return;
    if(timeLeft <= 0){ timeLeft = totalSeconds; }
    isRunning = true;
    document.getElementById('btnStart').style.display = 'none';
    document.getElementById('btnPause').style.display = '';
    timerInterval = setInterval(function(){
      timeLeft--;
      updateTimerDisplay();
      if(timeLeft <= 0){
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        document.getElementById('btnStart').style.display = '';
        document.getElementById('btnStart').textContent = '↺ Ulang';
        document.getElementById('btnPause').style.display = 'none';
        if(typeof SFX !== 'undefined' && SFX.buzz) SFX.buzz();
      }
    }, 1000);
    updateTimerDisplay();
  };

  window.pauseTimer = function(){
    if(!isRunning) return;
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    document.getElementById('btnStart').style.display = '';
    document.getElementById('btnStart').textContent = '▶ Lanjut';
    document.getElementById('btnPause').style.display = 'none';
    updateTimerDisplay();
  };

  window.resetTimer = function(){
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    timeLeft = totalSeconds;
    document.getElementById('btnStart').style.display = '';
    document.getElementById('btnStart').textContent = '▶ Mulai';
    document.getElementById('btnPause').style.display = 'none';
    updateTimerDisplay();
  };

  updateTimerDisplay();
})();
</script>
`;
}
