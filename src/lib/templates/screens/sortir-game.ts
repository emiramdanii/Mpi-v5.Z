// ═══════════════════════════════════════════════════════════════
// SORTIR-GAME — Sorting game with click-to-assign pattern
// Category zones + draggable items + check + score
// ═══════════════════════════════════════════════════════════════

import type { SortirGameSlots } from '../engine/slot-types';

export function generateSortirGameContent(data: SortirGameSlots): string {
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

  const kategoriDataJS = JSON.stringify(
    data.kategori.map(k => ({ label: k.label, color: k.color, id: k.id }))
  );
  const itemsDataJS = JSON.stringify(
    data.items.map(it => ({ teks: it.teks, kategori: it.kategori }))
  );

  const kategoriZonesHTML = data.kategori.map(k => `
    <div class="sortir-zone" data-zone-id="${esc(k.id)}" onclick="selectZone('${esc(k.id)}')" style="background:${esc(k.color)}0d;border:2px dashed ${esc(k.color)}44;border-radius:14px;padding:16px;min-height:100px;cursor:pointer;transition:all .25s;flex:1;min-width:140px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="width:12px;height:12px;border-radius:50%;background:${esc(k.color)};flex-shrink:0"></span>
        <span style="font-weight:800;font-size:.88rem;color:${esc(k.color)}">${esc(k.label)}</span>
      </div>
      <div class="sortir-zone-items" data-zone-items="${esc(k.id)}" style="display:flex;flex-direction:column;gap:6px;min-height:40px">
        <div class="sortir-zone-placeholder sub" style="font-size:.78rem;text-align:center;padding:8px;opacity:.5">Letakkan item di sini</div>
      </div>
    </div>
  `).join('\n');

  const itemsPoolHTML = data.items.map((it, idx) => `
    <button class="sortir-item-btn" data-item-idx="${idx}" onclick="selectItem(${idx})" style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;background:var(--card);border:2px solid var(--border);cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif;font-size:.85rem;font-weight:700;color:var(--text);text-align:left;width:100%;line-height:1.4">
      <span style="width:22px;height:22px;border-radius:6px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:900;flex-shrink:0">${idx + 1}</span>
      <span style="flex:1">${esc(it.teks)}</span>
      <span class="sortir-item-badge" data-item-badge="${idx}" style="display:none;font-size:.68rem;font-weight:800;padding:2px 8px;border-radius:99px;background:var(--c)22;color:var(--c);white-space:nowrap"></span>
    </button>
  `).join('\n');

  return `
<style>
  .sortir-header{text-align:center;margin-bottom:20px;}
  .sortir-pool{display:flex;flex-direction:column;gap:8px;margin:16px 0;}
  .sortir-zones{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0;}
  .sortir-item-btn:hover{border-color:var(--c);background:rgba(62,207,207,.06);}
  .sortir-item-btn.selected{border-color:var(--y);background:rgba(249,193,46,.08);box-shadow:0 0 0 3px rgba(249,193,46,.15);}
  .sortir-item-btn.assigned{opacity:.4;pointer-events:none;border-style:dashed;}
  .sortir-item-btn.correct{border-color:var(--g)!important;background:rgba(52,211,153,.1)!important;opacity:1!important;}
  .sortir-item-btn.wrong{border-color:var(--r)!important;background:rgba(255,107,107,.1)!important;opacity:1!important;}
  .sortir-zone.highlight{border-color:var(--y)!important;background:rgba(249,193,46,.06)!important;box-shadow:0 0 0 3px rgba(249,193,46,.12);}
  .sortir-zone-item{display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.06);font-size:.82rem;font-weight:700;cursor:pointer;transition:all .2s;}
  .sortir-zone-item:hover{background:rgba(255,255,255,.12);}
  .sortir-zone-item.correct{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.3);}
  .sortir-zone-item.wrong{background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.3);}
  .sortir-score-bar{display:flex;align-items:center;justify-content:center;gap:16px;padding:14px;background:var(--card);border:1px solid var(--border);border-radius:var(--rad);margin-top:16px;}
  .sortir-score-num{font-family:'Fredoka One',cursive;font-size:1.8rem;color:var(--y);}
  .sortir-instruction{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(249,193,46,.06);border:1px solid rgba(249,193,46,.15);border-radius:10px;font-size:.82rem;font-weight:700;color:var(--y);margin-bottom:14px;}
  .sortir-check-result{text-align:center;margin-top:12px;font-weight:800;font-size:.92rem;padding:12px;border-radius:10px;display:none;}
  .sortir-check-result.show{display:block;animation:fadeIn .4s ease;}
  .sortir-check-result.perfect{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g);}
  .sortir-check-result.partial{background:rgba(249,193,46,.1);border:1px solid rgba(249,193,46,.3);color:var(--y);}
  @media(max-width:640px){
    .sortir-zones{flex-direction:column;}
  }
</style>

<div class="sortir-header fadein">
  <div style="font-size:2rem;margin-bottom:4px">🧩</div>
  <h2 class="h2">${esc(data.judul)}</h2>
  <p class="sub mt8">${esc(data.instruksi)}</p>
</div>

<div class="sortir-instruction fadein">
  <span>👆</span>
  <span>Klik item, lalu klik kategori untuk menempatkannya</span>
</div>

<div class="sortir-zones fadein">
  ${kategoriZonesHTML}
</div>

<div style="margin-top:8px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <span style="font-size:1rem">📦</span>
    <span style="font-weight:800;font-size:.9rem">Item yang Belum Dikelompokkan</span>
    <span class="badge" id="remainingBadge" style="background:var(--o)22;color:var(--o)">${data.items.length}</span>
  </div>
  <div class="sortir-pool" id="itemPool">
    ${itemsPoolHTML}
  </div>
</div>

<div class="btn-row btn-center fadein">
  <button class="btn btn-y" onclick="checkSortirAnswers()" id="btnCheck">✓ Periksa Jawaban</button>
  <button class="btn btn-ghost" onclick="resetSortir()" id="btnReset">↺ Ulang</button>
</div>

<div class="sortir-score-bar fadein" id="scoreBar" style="display:none">
  <div>
    <div class="sub" style="font-size:.75rem">Skor</div>
    <div class="sortir-score-num" id="scoreDisplay">0</div>
  </div>
  <div>
    <div class="sub" style="font-size:.75rem">Benar</div>
    <div style="font-weight:800;font-size:1.1rem;color:var(--g)" id="correctCount">0</div>
  </div>
  <div>
    <div class="sub" style="font-size:.75rem">Salah</div>
    <div style="font-weight:800;font-size:1.1rem;color:var(--r)" id="wrongCount">0</div>
  </div>
</div>

<div class="sortir-check-result" id="checkResult"></div>

<script>
(function(){
  var kategori = ${kategoriDataJS};
  var items = ${itemsDataJS};
  var assignments = {};
  var selectedItem = null;
  var checked = false;

  for(var i = 0; i < items.length; i++) assignments[i] = null;

  window.selectItem = function(idx){
    if(checked) return;
    if(assignments[idx] !== null) return;
    var prev = document.querySelector('.sortir-item-btn.selected');
    if(prev) prev.classList.remove('selected');
    if(selectedItem === idx){ selectedItem = null; return; }
    selectedItem = idx;
    var btn = document.querySelector('[data-item-idx="' + idx + '"]');
    if(btn) btn.classList.add('selected');
    document.querySelectorAll('.sortir-zone').forEach(function(z){ z.classList.add('highlight'); });
  };

  window.selectZone = function(zoneId){
    if(checked) return;
    if(selectedItem === null) return;
    assignments[selectedItem] = zoneId;

    var btn = document.querySelector('[data-item-idx="' + selectedItem + '"]');
    if(btn){
      btn.classList.remove('selected');
      btn.classList.add('assigned');
    }
    var badge = document.querySelector('[data-item-badge="' + selectedItem + '"]');
    var kat = kategori.find(function(k){ return k.id === zoneId; });
    if(badge && kat){
      badge.textContent = kat.label;
      badge.style.background = kat.color + '22';
      badge.style.color = kat.color;
      badge.style.display = '';
    }

    var zoneItems = document.querySelector('[data-zone-items="' + zoneId + '"]');
    if(zoneItems){
      var ph = zoneItems.querySelector('.sortir-zone-placeholder');
      if(ph) ph.remove();
      var chip = document.createElement('div');
      chip.className = 'sortir-zone-item';
      chip.setAttribute('data-zone-item-idx', selectedItem);
      chip.innerHTML = '<span style="font-size:.7rem;color:var(--muted);margin-right:2px">' + (selectedItem + 1) + '</span>' + escJS(items[selectedItem].teks) + ' <span style="margin-left:auto;font-size:.72rem;opacity:.5" onclick="removeFromZone(event,' + selectedItem + ')">✕</span>';
      chip.onclick = function(e){ if(e.target.textContent !== '✕') removeFromZone(e, selectedItem); };
      zoneItems.appendChild(chip);
    }

    selectedItem = null;
    document.querySelectorAll('.sortir-zone').forEach(function(z){ z.classList.remove('highlight'); });
    updateRemaining();
  };

  window.removeFromZone = function(e, idx){
    if(checked) return;
    e.stopPropagation();
    var zoneId = assignments[idx];
    if(zoneId === null) return;
    assignments[idx] = null;

    var btn = document.querySelector('[data-item-idx="' + idx + '"]');
    if(btn) btn.classList.remove('assigned');

    var badge = document.querySelector('[data-item-badge="' + idx + '"]');
    if(badge){ badge.style.display = 'none'; badge.textContent = ''; }

    var chip = document.querySelector('[data-zone-item-idx="' + idx + '"]');
    if(chip) chip.remove();

    var zoneItems = document.querySelector('[data-zone-items="' + zoneId + '"]');
    if(zoneItems && !zoneItems.querySelector('.sortir-zone-item')){
      var ph = document.createElement('div');
      ph.className = 'sortir-zone-placeholder sub';
      ph.style.cssText = 'font-size:.78rem;text-align:center;padding:8px;opacity:.5';
      ph.textContent = 'Letakkan item di sini';
      zoneItems.appendChild(ph);
    }
    updateRemaining();
  };

  function updateRemaining(){
    var rem = 0;
    for(var i = 0; i < items.length; i++) if(assignments[i] === null) rem++;
    var b = document.getElementById('remainingBadge');
    if(b) b.textContent = rem;
  }

  window.checkSortirAnswers = function(){
    var unassigned = 0;
    for(var i = 0; i < items.length; i++) if(assignments[i] === null) unassigned++;
    if(unassigned > 0){ alert('Masih ada ' + unassigned + ' item yang belum dikelompokkan!'); return; }

    checked = true;
    var correct = 0;
    var wrong = 0;

    for(var i = 0; i < items.length; i++){
      var isCorrect = assignments[i] === items[i].kategori;
      if(isCorrect) correct++; else wrong++;
      var btn = document.querySelector('[data-item-idx="' + i + '"]');
      if(btn) btn.classList.add(isCorrect ? 'correct' : 'wrong');
      var chip = document.querySelector('[data-zone-item-idx="' + i + '"]');
      if(chip) chip.classList.add(isCorrect ? 'correct' : 'wrong');
    }

    var scorePct = Math.round((correct / items.length) * 100);
    addScore(correct * 10);
    setScore(correct * 10);

    var scoreBar = document.getElementById('scoreBar');
    if(scoreBar) scoreBar.style.display = '';
    var sd = document.getElementById('scoreDisplay');
    if(sd) sd.textContent = scorePct + '%';
    var cc = document.getElementById('correctCount');
    if(cc) cc.textContent = correct;
    var wc = document.getElementById('wrongCount');
    if(wc) wc.textContent = wrong;

    var result = document.getElementById('checkResult');
    if(result){
      result.classList.add('show');
      if(correct === items.length){
        result.classList.add('perfect');
        result.innerHTML = '🎉 Sempurna! Semua jawaban benar!';
        launchConfetti();
        if(typeof SFX !== 'undefined' && SFX.complete) SFX.complete();
      } else {
        result.classList.add('partial');
        result.innerHTML = '👍 ' + correct + ' dari ' + items.length + ' benar. Coba lagi!';
        if(typeof SFX !== 'undefined' && SFX.buzz) SFX.buzz();
      }
    }

    document.getElementById('btnCheck').style.display = 'none';
  };

  window.resetSortir = function(){
    checked = false;
    selectedItem = null;
    for(var i = 0; i < items.length; i++) assignments[i] = null;

    document.querySelectorAll('.sortir-item-btn').forEach(function(btn){
      btn.classList.remove('selected','assigned','correct','wrong');
    });
    document.querySelectorAll('[data-item-badge]').forEach(function(b){
      b.style.display = 'none'; b.textContent = '';
    });
    document.querySelectorAll('.sortir-zone-item').forEach(function(c){ c.remove(); });
    document.querySelectorAll('.sortir-zone-items').forEach(function(zone){
      var ph = document.createElement('div');
      ph.className = 'sortir-zone-placeholder sub';
      ph.style.cssText = 'font-size:.78rem;text-align:center;padding:8px;opacity:.5';
      ph.textContent = 'Letakkan item di sini';
      zone.appendChild(ph);
    });

    var scoreBar = document.getElementById('scoreBar');
    if(scoreBar) scoreBar.style.display = 'none';
    var result = document.getElementById('checkResult');
    if(result){ result.classList.remove('show','perfect','partial'); result.innerHTML = ''; }
    document.getElementById('btnCheck').style.display = '';
    updateRemaining();
  };

  function escJS(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
})();
</script>
`;
}
