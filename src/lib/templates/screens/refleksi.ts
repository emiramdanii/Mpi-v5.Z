// ═══════════════════════════════════════════════════════════════
// REFLEKSI SCREEN — Standalone reflection page
// Generates inner content HTML (no wrapper/navbar)
// ═══════════════════════════════════════════════════════════════

import type { RefleksiSlots } from '../engine/slot-types';

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
 * Generate standalone reflection page content.
 * Features: header with icon, reflection prompt cards with colored borders,
 * textareas for student input, closing message, save button.
 */
export function generateRefleksiContent(data: RefleksiSlots): string {
  const prompts = data.prompts || [];

  return `
<style>
.rf-wrap{display:flex;flex-direction:column;align-items:center;padding:20px 16px;max-width:560px;margin:0 auto}
.rf-header{text-align:center;margin-bottom:20px}
.rf-header-icon{font-size:2.6rem;margin-bottom:8px;animation:float 3s ease-in-out infinite}
.rf-header-sub{color:var(--muted);font-size:.82rem;line-height:1.5;margin-top:4px;max-width:380px;margin-left:auto;margin-right:auto}

/* Reflection prompt cards */
.rf-prompts{width:100%;margin-top:14px}
.rf-prompt{border-radius:12px;padding:14px 16px;border:1px solid rgba(255,255,255,.08);margin-bottom:10px;background:var(--card);position:relative;overflow:hidden;transition:all .2s}
.rf-prompt:hover{border-color:rgba(255,255,255,.15);background:rgba(255,255,255,.05)}
.rf-prompt-border{position:absolute;left:0;top:0;bottom:0;width:4px}
.rf-prompt-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.rf-prompt-icon{font-size:1.2rem}
.rf-prompt-label{font-size:.82rem;font-weight:800;color:var(--text)}
.rf-prompt textarea{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-family:'Nunito',sans-serif;font-size:.84rem;resize:vertical;min-height:64px;line-height:1.5;transition:border-color .2s}
.rf-prompt textarea:focus{outline:none;border-color:var(--c);box-shadow:0 0 0 3px rgba(62,207,207,.1)}
.rf-prompt textarea::placeholder{color:var(--muted);opacity:.7}
.rf-char-count{font-size:.66rem;color:var(--muted);text-align:right;margin-top:3px}

/* Closing */
.rf-closing{margin-top:20px;padding:18px 22px;background:linear-gradient(135deg,rgba(249,193,46,.06),rgba(52,211,153,.06));border:1px solid rgba(249,193,46,.15);border-radius:var(--rad);text-align:center;width:100%}
.rf-closing-icon{font-size:1.6rem;margin-bottom:6px}
.rf-closing-text{font-size:.88rem;font-weight:600;line-height:1.6;color:var(--text)}

/* Save button */
.rf-save-wrap{margin-top:20px;margin-bottom:20px}

/* Toast */
.rf-toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(80px);background:var(--g);color:#0e1c2f;padding:12px 24px;border-radius:99px;font-weight:800;font-size:.86rem;box-shadow:0 8px 24px rgba(52,211,153,.3);transition:transform .4s cubic-bezier(.4,0,.2,1);z-index:9000;pointer-events:none}
.rf-toast.show{transform:translateX(-50%) translateY(0)}
</style>

<div class="rf-wrap fadein">
  <!-- Header -->
  <div class="rf-header">
    <div class="rf-header-icon">💭</div>
    <h2 class="h2"><span class="hl">${esc(data.judul || 'Refleksi Pembelajaran')}</span></h2>
    ${data.subjudul ? `<p class="rf-header-sub">${esc(data.subjudul)}</p>` : '<p class="rf-header-sub">Luangkan waktu untuk merenungkan apa yang telah kamu pelajari hari ini.</p>'}
  </div>

  <!-- Reflection prompts -->
  <div class="rf-prompts">
    ${prompts.length > 0 ? prompts.map((p, i) => {
      const warna = p.warna || 'var(--y)';
      return `
    <div class="rf-prompt refl-item fadein" style="animation-delay:${i * .08}s">
      <div class="rf-prompt-border" style="background:${warna}"></div>
      <div class="rf-prompt-header">
        <span class="rf-prompt-icon">${p.icon || '✍️'}</span>
        <span class="rf-prompt-label" style="color:${warna}">${esc(p.label)}</span>
      </div>
      <textarea
        id="rf-text-${i}"
        placeholder="${esc(p.placeholder || 'Tuliskan jawabanmu...')}"
        rows="3"
        maxlength="500"
        oninput="updateCharCount(${i})"
      ></textarea>
      <div class="rf-char-count" id="rf-count-${i}">0/500</div>
    </div>`;
    }).join('') : `
    <div class="rf-prompt refl-item">
      <div class="rf-prompt-border" style="background:var(--c)"></div>
      <div class="rf-prompt-header">
        <span class="rf-prompt-icon">✍️</span>
        <span class="rf-prompt-label" style="color:var(--c)">Refleksi Umum</span>
      </div>
      <textarea placeholder="Apa yang paling berkesan dari pembelajaran hari ini?" rows="3" maxlength="500"></textarea>
    </div>`}
  </div>

  <!-- Closing message -->
  ${data.closingMessage ? `
  <div class="rf-closing fadein" style="animation-delay:${(prompts.length || 1) * .08 + .1}s">
    <div class="rf-closing-icon">🌟</div>
    <div class="rf-closing-text">${esc(data.closingMessage)}</div>
  </div>` : `
  <div class="rf-closing fadein" style="animation-delay:${(prompts.length || 1) * .08 + .1}s">
    <div class="rf-closing-icon">🌟</div>
    <div class="rf-closing-text">Setiap refleksi yang kamu tulis adalah langkah untuk menjadi lebih baik. Teruslah belajar dan bertumbuh!</div>
  </div>`}

  <!-- Save button -->
  <div class="rf-save-wrap">
    <button class="btn btn-g glow" onclick="saveRefleksi()">✅ Simpan Refleksi</button>
  </div>
</div>

<!-- Toast notification -->
<div class="rf-toast" id="rf-toast">✅ Refleksi berhasil disimpan!</div>

<script>
(function(){
  window.updateCharCount = function(idx) {
    var ta = document.getElementById('rf-text-' + idx);
    var counter = document.getElementById('rf-count-' + idx);
    if (ta && counter) {
      counter.textContent = ta.value.length + '/500';
    }
  };

  window.saveRefleksi = function() {
    // Show toast
    var toast = document.getElementById('rf-toast');
    if (toast) {
      toast.classList.add('show');
      if (typeof SFX !== 'undefined' && SFX.complete) SFX.complete();
      setTimeout(function(){ toast.classList.remove('show'); }, 2500);
    }
    // Add score for reflection
    if (typeof addScore === 'function') addScore(5);
  };
})();
</script>`;
}
