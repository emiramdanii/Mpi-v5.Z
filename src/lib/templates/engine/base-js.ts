// ═══════════════════════════════════════════════════════════════
// BASE JS — Shared JavaScript engine used by ALL screen templates
// Navigation, scoring, confetti, SFX, screen transitions,
// contrast toggle, accessibility, etc.
// ═══════════════════════════════════════════════════════════════

import type { SfxTheme } from '@/store/authoring/types';

/**
 * Generate the base JavaScript engine.
 * This is the shared runtime that all exported HTML files need.
 */
export function generateBaseJS(options: {
  activeScreens: string[];
  sfxTheme?: SfxTheme;
  sfxVolume?: number;
  enableScoring?: boolean;
  enableConfetti?: boolean;
}): string {
  const {
    activeScreens,
    sfxTheme = 'default',
    sfxVolume = 0.6,
    enableScoring = true,
    enableConfetti = true,
  } = options;

  const activeScreensJS = JSON.stringify(activeScreens);

  return `
// ── SCREEN NAVIGATION ──────────────────────────────────────
var SCREENS = ${activeScreensJS};
var currentIdx = 0;
var score = 0;

function goScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  var el = document.getElementById(id);
  if (el) { el.classList.add('active'); currentIdx = SCREENS.indexOf(id); updateNav(); }
  window.scrollTo(0, 0);
}

function goNext() {
  if (currentIdx < SCREENS.length - 1) goScreen(SCREENS[currentIdx + 1]);
}

function goPrev() {
  if (currentIdx > 0) goScreen(SCREENS[currentIdx - 1]);
}

function updateNav() {
  var prog = ((currentIdx + 1) / SCREENS.length) * 100;
  document.querySelectorAll('.nav-prog-fill').forEach(function(el){ el.style.width = prog + '%'; });
  document.querySelectorAll('.nav-score').forEach(function(el){ el.textContent = score + ' ⭐'; });
  document.querySelectorAll('.nav-prev').forEach(function(el){ el.style.display = currentIdx > 0 ? 'flex' : 'none'; });
  document.querySelectorAll('.nav-next').forEach(function(el){ el.style.display = currentIdx < SCREENS.length - 1 ? 'flex' : 'none'; });
}

// ── TAB SWITCHING ───────────────────────────────────────────
function switchKtab(tabId, btn) {
  var card = btn.closest('.card') || btn.closest('.screen');
  if (!card) return;
  card.querySelectorAll('.ktab').forEach(function(t){ t.classList.remove('active'); });
  btn.classList.add('active');
  card.querySelectorAll('.ktab-content').forEach(function(c){ c.classList.remove('active'); });
  var panel = document.getElementById(tabId);
  if (panel) panel.classList.add('active');
}

function switchTab(tabGroup, tab) {
  var container = document.querySelector('[data-tab-group="' + tabGroup + '"]');
  if (!container) return;
  container.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  var activeTab = container.querySelector('[data-tab="' + tab + '"]');
  if (activeTab) activeTab.classList.add('active');
  container.querySelectorAll('.tab-panel').forEach(function(p){ p.style.display = 'none'; });
  var panel = document.getElementById('panel-' + tab);
  if (panel) panel.style.display = 'block';
}

// ── ACCORDION ───────────────────────────────────────────────
function toggleAccordion(header) {
  var item = header.parentElement;
  var wasOpen = item.classList.contains('open');
  // Close all siblings
  var parent = item.parentElement;
  if (parent) parent.querySelectorAll('.acc-item.open').forEach(function(i){ i.classList.remove('open'); });
  if (!wasOpen) item.classList.add('open');
}

// ── SCORING ─────────────────────────────────────────────────
${enableScoring ? `
function addScore(pts) {
  score += pts;
  updateNav();
  if (typeof SFX !== 'undefined' && SFX.correct) SFX.correct();
}

function setScore(val) {
  score = val;
  updateNav();
}
` : 'function addScore(){} function setScore(){}'}

// ── CONFETTI ────────────────────────────────────────────────
${enableConfetti ? `
function launchConfetti() {
  var wrap = document.getElementById('confWrap');
  if (!wrap) return;
  var colors = ['#f9c12e','#3ecfcf','#ff6b6b','#a78bfa','#34d399','#fb923c'];
  for (var i = 0; i < 60; i++) {
    var c = document.createElement('div');
    c.className = 'conf';
    c.style.left = Math.random() * 100 + '%';
    c.style.top = '-10px';
    c.style.width = (Math.random() * 8 + 4) + 'px';
    c.style.height = (Math.random() * 8 + 4) + 'px';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    c.style.animationDelay = (Math.random() * 1) + 's';
    wrap.appendChild(c);
  }
  setTimeout(function(){ wrap.innerHTML = ''; }, 5000);
}
` : 'function launchConfetti(){}'}

// ── AUDIO / SFX ─────────────────────────────────────────────
var sfxEnabled = ${sfxTheme === 'none' ? 'false' : 'true'};

function playTone(freq, dur, type, vol, freqEnd) {
  if (!sfxEnabled) return;
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + dur);
    gain.gain.setValueAtTime(Math.min(vol || 0.1, 0.3), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch(e) {}
}

${buildSfxThemeJS(sfxTheme, sfxVolume)}

function toggleSfx() {
  sfxEnabled = !sfxEnabled;
  document.querySelectorAll('.sfx-toggle').forEach(function(el){
    el.textContent = sfxEnabled ? '🔊' : '🔇';
  });
}

// ── CONTRAST TOGGLE ─────────────────────────────────────────
var highContrast = false;
function toggleContrast() {
  highContrast = !highContrast;
  document.body.classList.toggle('high-contrast', highContrast);
  document.querySelectorAll('.contrast-toggle').forEach(function(el){
    el.textContent = highContrast ? '🔲' : '🔳';
  });
}

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  updateNav();
});
`;
}

/**
 * Generate SFX theme JavaScript object.
 */
function buildSfxThemeJS(theme: string, vol: number): string {
  const v = (base: number) => +(base * vol).toFixed(3);
  switch (theme) {
    case 'none':
      return 'var SFX={correct:function(){},wrong:function(){},click:function(){},flip:function(){},spin:function(){},buzz:function(){},complete:function(){},popup:function(){}};';
    case 'soft':
      return `var SFX={
correct:function(){playTone(440,.15,'sine',${v(.08)},520);setTimeout(function(){playTone(520,.2,'sine',${v(.06)},580)},150)},
wrong:function(){playTone(280,.2,'sine',${v(.05)},200)},
click:function(){playTone(600,.05,'sine',${v(.04)})},
flip:function(){playTone(400,.08,'sine',${v(.05)},550)},
spin:function(){playTone(350,.04,'sine',${v(.03)},700)},
buzz:function(){playTone(160,.25,'sine',${v(.06)},120)},
complete:function(){playTone(440,.15,'sine',${v(.08)},520);setTimeout(function(){playTone(520,.15,'sine',${v(.06)},580)},150);setTimeout(function(){playTone(580,.3,'sine',${v(.08)},660)},300)},
popup:function(){playTone(350,.1,'sine',${v(.05)},700)}
};`;
    case 'retro':
      return `var SFX={
correct:function(){playTone(880,.06,'square',${v(.07)},1100);setTimeout(function(){playTone(1100,.08,'square',${v(.06)},1320)},80)},
wrong:function(){playTone(220,.12,'square',${v(.06)},110)},
click:function(){playTone(1000,.03,'square',${v(.04)})},
flip:function(){playTone(660,.05,'square',${v(.06)},990)},
spin:function(){playTone(550,.04,'square',${v(.04)},1100)},
buzz:function(){playTone(150,.15,'square',${v(.08)},80)},
complete:function(){playTone(880,.08,'square',${v(.07)},1100);setTimeout(function(){playTone(1100,.08,'square',${v(.06)},1320)},100);setTimeout(function(){playTone(1320,.2,'square',${v(.07)},1760)},200)},
popup:function(){playTone(550,.06,'square',${v(.05)},1100)}
};`;
    case 'nature':
      return `var SFX={
correct:function(){playTone(392,.12,'triangle',${v(.09)},523);setTimeout(function(){playTone(523,.18,'triangle',${v(.07)},659)},120)},
wrong:function(){playTone(247,.2,'triangle',${v(.06)},185)},
click:function(){playTone(784,.04,'triangle',${v(.05)})},
flip:function(){playTone(523,.07,'triangle',${v(.06)},784)},
spin:function(){playTone(440,.04,'triangle',${v(.04)},880)},
buzz:function(){playTone(196,.22,'triangle',${v(.07)},147)},
complete:function(){playTone(392,.12,'triangle',${v(.09)},523);setTimeout(function(){playTone(523,.12,'triangle',${v(.07)},659)},120);setTimeout(function(){playTone(659,.28,'triangle',${v(.09)},784)},240)},
popup:function(){playTone(440,.09,'triangle',${v(.06)},880)}
};`;
    default: // 'default'
      return `var SFX={
correct:function(){playTone(523,.1,'sine',${v(.12)},659);setTimeout(function(){playTone(659,.15,'sine',${v(.1)},784)},100)},
wrong:function(){playTone(330,.15,'sawtooth',${v(.08)},220)},
click:function(){playTone(800,.04,'sine',${v(.06)})},
flip:function(){playTone(600,.06,'triangle',${v(.08)},900)},
spin:function(){playTone(440,.03,'sine',${v(.04)},880)},
buzz:function(){playTone(200,.2,'sawtooth',${v(.1)},150)},
complete:function(){playTone(523,.12,'sine',${v(.12)},659);setTimeout(function(){playTone(659,.12,'sine',${v(.1)},784)},120);setTimeout(function(){playTone(784,.25,'sine',${v(.12)},1047)},240)},
popup:function(){playTone(440,.08,'sine',${v(.08)},880)}
};`;
  }
}
