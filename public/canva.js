// ═══════════════════════════════════════════════════════════════
// CANVA.JS — Integrasi Desain Canva
// Strategi 1 + 4: PNG Background + Design Token
//
// Fitur:
//   - Upload PNG/JPG dari Canva
//   - Ekstrak palet warna dominan via Canvas API (tanpa library)
//   - Mapping warna ke CSS variable (--y, --c, --g, --r, dst)
//   - Apply background ke halaman yang dipilih
//   - Inject ke student HTML via buildStudentHTML patch
//   - Simpan/restore ke AT_STATE
// ═══════════════════════════════════════════════════════════════

window.AT_CANVA = {

  // ── State ───────────────────────────────────────────────────
  _state() {
    if (!AT_STATE.canva) {
      AT_STATE.canva = {
        imageDataUrl: null,   // base64 PNG
        palette: [],          // array hex string diekstrak
        mapping: {            // var → hex
          '--y': null,
          '--c': null,
          '--g': null,
          '--r': null,
          '--bg': null,
          '--card': null,
        },
        pages: ['sc'],        // halaman yang pakai background
        applied: false,
        backgroundMode: 'cover',  // cover | contain | pattern
        opacity: 0.18,            // overlay opacity
      };
    }
    return AT_STATE.canva;
  },

  // ── Token definitions ────────────────────────────────────────
  TOKEN_DEFS: [
    { var: '--y',    label: 'Aksen Utama',  desc: 'Tombol, highlight' },
    { var: '--c',    label: 'Aksen Kedua',  desc: 'Chip, link' },
    { var: '--g',    label: 'Sukses',       desc: 'Jawaban benar' },
    { var: '--r',    label: 'Bahaya',       desc: 'Jawaban salah' },
    { var: '--bg',   label: 'Background',   desc: 'Latar halaman' },
    { var: '--card', label: 'Kartu',        desc: 'Latar kartu' },
  ],

  // ── Handle file upload ───────────────────────────────────────
  handleFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      AT_UTIL.toast('⚠️ File terlalu besar. Maks 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this._state().imageDataUrl = dataUrl;
      this._state().applied = false;
      this._showPreview(dataUrl);
      this._extractPalette(dataUrl);
      AT_EDITOR.markDirty?.();
    };
    reader.readAsDataURL(file);

    // Drag-drop UX
    this._setupDragDrop();
  },

  // ── Show preview thumbnail ───────────────────────────────────
  _showPreview(dataUrl) {
    const wrap = document.getElementById('canvaPreviewWrap');
    const img  = document.getElementById('canvaPreviewImg');
    const assign = document.getElementById('canvaPageAssign');
    if (!wrap || !img) return;
    img.src = dataUrl;
    wrap.classList.add('show');
    if (assign) assign.style.display = '';
    this._updateBadge();
  },

  _updateBadge() {
    const badge = document.getElementById('canvaPreviewBadge');
    if (!badge) return;
    const s = this._state();
    if (s.applied) {
      badge.textContent = '✅ Diterapkan ke ' + s.pages.length + ' halaman';
    } else {
      badge.textContent = '⚠️ Belum diterapkan';
    }
  },

  // ── Extract palette via Canvas API ──────────────────────────
  _extractPalette(dataUrl) {
    const img = new Image();
    img.onload = () => {
      const palette = this._kmeans(img, 8);
      this._state().palette = palette;
      this._renderTokenUI(palette);
      this._autoMap(palette);
      document.getElementById('canvaTokensSection').style.display = '';
    };
    img.src = dataUrl;
  },

  // K-means color extraction via Canvas
  _kmeans(imgEl, k) {
    const canvas = document.createElement('canvas');
    // Scale down for performance
    const MAX = 120;
    const scale = Math.min(MAX / imgEl.width, MAX / imgEl.height, 1);
    canvas.width  = Math.round(imgEl.width  * scale);
    canvas.height = Math.round(imgEl.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if (a < 128) continue;           // skip transparent
      if (r > 240 && g > 240 && b > 240) continue; // skip near-white
      if (r < 15  && g < 15  && b < 15)  continue; // skip near-black
      pixels.push([r, g, b]);
    }
    if (!pixels.length) return ['#f5c842','#3ecfcf','#34d399','#ff6b6b','#a78bfa','#fb923c'];

    // Init centroids: spread across pixels
    let centroids = [];
    const step = Math.floor(pixels.length / k);
    for (let i = 0; i < k; i++) {
      centroids.push([...pixels[i * step]]);
    }

    // Iterate 12 times
    for (let iter = 0; iter < 12; iter++) {
      const clusters = Array.from({length: k}, () => []);
      for (const px of pixels) {
        let best = 0, bestDist = Infinity;
        for (let j = 0; j < k; j++) {
          const d = this._dist(px, centroids[j]);
          if (d < bestDist) { bestDist = d; best = j; }
        }
        clusters[best].push(px);
      }
      // Recompute centroids
      let changed = false;
      for (let j = 0; j < k; j++) {
        if (!clusters[j].length) continue;
        const avg = [0,0,0];
        for (const p of clusters[j]) { avg[0]+=p[0]; avg[1]+=p[1]; avg[2]+=p[2]; }
        const n = clusters[j].length;
        const newC = [Math.round(avg[0]/n), Math.round(avg[1]/n), Math.round(avg[2]/n)];
        if (this._dist(newC, centroids[j]) > 2) changed = true;
        centroids[j] = newC;
      }
      if (!changed) break;
    }

    // Sort by saturation (vivid first), deduplicate similar
    const hexes = centroids
      .map(c => ({ hex: this._toHex(c), s: this._saturation(c), l: this._lightness(c) }))
      .sort((a,b) => b.s - a.s)
      .filter((c, i, arr) => {
        // Remove if too similar to a previous one
        return !arr.slice(0, i).some(prev => this._hexDist(c.hex, prev.hex) < 30);
      })
      .map(c => c.hex);

    return hexes.slice(0, k);
  },

  _dist([r1,g1,b1], [r2,g2,b2]) {
    return (r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2;
  },
  _toHex([r,g,b]) {
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
  },
  _hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  },
  _saturation([r,g,b]) {
    const max = Math.max(r,g,b)/255, min = Math.min(r,g,b)/255;
    return max === 0 ? 0 : (max-min)/max;
  },
  _lightness([r,g,b]) {
    return (Math.max(r,g,b)+Math.min(r,g,b)) / 510;
  },
  _hexDist(h1, h2) {
    const [r1,g1,b1] = this._hexToRgb(h1);
    const [r2,g2,b2] = this._hexToRgb(h2);
    return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2);
  },

  // ── Auto-map palette to CSS vars ────────────────────────────
  _autoMap(palette) {
    if (!palette.length) return;
    const s = this._state();

    // Heuristic: most vivid → --y, second vivid → --c, etc.
    const sorted = [...palette].sort((a,b) => {
      const sa = this._saturation(this._hexToRgb(a));
      const sb = this._saturation(this._hexToRgb(b));
      return sb - sa;
    });

    s.mapping['--y']    = sorted[0] || null;
    s.mapping['--c']    = sorted[1] || null;
    s.mapping['--g']    = sorted[2] || null;
    s.mapping['--r']    = sorted[3] || null;

    // Darkest → bg, second darkest → card
    const byLight = [...palette].sort((a,b) => {
      const la = this._lightness(this._hexToRgb(a));
      const lb = this._lightness(this._hexToRgb(b));
      return la - lb;
    });
    s.mapping['--bg']   = byLight[0] || null;
    s.mapping['--card'] = byLight[1] || null;

    this._renderMappingRows();
  },

  // ── Render palette strip + mapping UI ───────────────────────
  _renderTokenUI(palette) {
    const strip = document.getElementById('canvaPaletteStrip');
    if (!strip) return;
    strip.innerHTML = palette.map((hex, i) => `
      <div class="canva-palette-dot"
           style="background:${hex}"
           title="${hex}"
           data-hex="${hex}"
           data-i="${i}"
           onclick="AT_CANVA._onDotClick('${hex}', this)">
      </div>
    `).join('');
  },

  _renderMappingRows() {
    const wrap = document.getElementById('canvaMappingRows');
    if (!wrap) return;
    const s = this._state();
    const palette = s.palette;

    wrap.innerHTML = this.TOKEN_DEFS.map(def => {
      const currentHex = s.mapping[def.var] || '#888888';
      const options = palette.map((hex, i) =>
        `<option value="${hex}" ${s.mapping[def.var]===hex?'selected':''}>${hex}</option>`
      ).join('');
      return `
        <div class="canva-mapping-row">
          <div class="canva-mapping-var">${def.var}</div>
          <div class="canva-mapping-swatch" style="background:${currentHex}"
               id="mswatch_${def.var.replace('--','')}"></div>
          <select class="canva-mapping-select"
            onchange="AT_CANVA._onMappingChange('${def.var}', this.value)">
            <option value="">— tidak dipetakan —</option>
            ${options}
          </select>
          <span style="font-size:.65rem;color:var(--muted);flex-shrink:0">${def.label}</span>
        </div>
      `;
    }).join('');
  },

  _onDotClick(hex, el) {
    document.querySelectorAll('.canva-palette-dot').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
    // Simpan untuk drop ke token berikutnya
    this._selectedHex = hex;
    AT_UTIL.toast('🎨 ' + hex + ' dipilih — pilih variabel di bawah untuk memetakan');
  },

  _onMappingChange(varName, hex) {
    const s = this._state();
    s.mapping[varName] = hex || null;
    s.applied = false;
    // Update swatch preview
    const sw = document.getElementById('mswatch_' + varName.replace('--',''));
    if (sw) sw.style.background = hex || '#888';
    this._updateStatus(false);
  },

  _updateStatus(applied) {
    const el = document.getElementById('canvaStatus');
    if (!el) return;
    if (applied) {
      el.className = 'canva-status applied';
      el.textContent = '✅ Token diterapkan — preview diperbarui';
    } else {
      el.className = 'canva-status pending';
      el.textContent = '⚠️ Ada perubahan — klik Terapkan untuk update preview';
    }
  },

  // ── Page toggle ──────────────────────────────────────────────
  togglePage(pageId, label) {
    const s = this._state();
    const cb = label.querySelector('input[type=checkbox]');
    const checked = cb ? cb.checked : !s.pages.includes(pageId);
    if (checked) {
      if (!s.pages.includes(pageId)) s.pages.push(pageId);
      label.classList.add('checked');
    } else {
      s.pages = s.pages.filter(p => p !== pageId);
      label.classList.remove('checked');
    }
    s.applied = false;
    this._updateStatus(false);
    AT_EDITOR.markDirty?.();
  },

  // ── Apply: inject CSS token + background ke student preview ─
  apply() {
    const s = this._state();
    if (!s.imageDataUrl) {
      AT_UTIL.toast('⚠️ Upload PNG Canva terlebih dahulu');
      return;
    }
    s.applied = true;
    this._updateBadge();
    this._updateStatus(true);
    AT_EDITOR.markDirty?.();
    // Trigger live preview refresh
    AT_SPLITVIEW.refresh?.();
    AT_UTIL.toast('✅ Desain Canva diterapkan!');
  },

  // ── Reset to default ─────────────────────────────────────────
  reset() {
    const s = this._state();
    s.mapping = { '--y':null,'--c':null,'--g':null,'--r':null,'--bg':null,'--card':null };
    s.applied = false;
    this._renderMappingRows();
    this._updateStatus(false);
    AT_EDITOR.markDirty?.();
    AT_SPLITVIEW.refresh?.();
    AT_UTIL.toast('↩️ Token direset ke default');
  },

  // ── Remove image ─────────────────────────────────────────────
  remove() {
    const s = this._state();
    s.imageDataUrl = null;
    s.palette = [];
    s.mapping = { '--y':null,'--c':null,'--g':null,'--r':null,'--bg':null,'--card':null };
    s.applied = false;
    s.pages = ['sc'];
    document.getElementById('canvaPreviewWrap')?.classList.remove('show');
    document.getElementById('canvaPageAssign').style.display = 'none';
    document.getElementById('canvaTokensSection').style.display = 'none';
    document.getElementById('canvaFileInput').value = '';
    AT_EDITOR.markDirty?.();
    AT_SPLITVIEW.refresh?.();
    AT_UTIL.toast('🗑️ Desain Canva dihapus');
  },

  // ── Re-extract palette ───────────────────────────────────────
  reExtract() {
    const s = this._state();
    if (!s.imageDataUrl) return;
    this._extractPalette(s.imageDataUrl);
    AT_UTIL.toast('🔄 Mengekstrak warna ulang…');
  },

  // ── Drag-drop setup ──────────────────────────────────────────
  _setupDragDrop() {
    const zone = document.getElementById('canvaUploadZone');
    if (!zone || zone._ddSetup) return;
    zone._ddSetup = true;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) this.handleFile(file);
    });
  },

  // ── Restore from saved state (saat load proyek) ──────────────
  restore() {
    const s = this._state();
    if (!s.imageDataUrl) return;
    this._showPreview(s.imageDataUrl);
    if (s.palette?.length) {
      this._renderTokenUI(s.palette);
      this._renderMappingRows();
      document.getElementById('canvaTokensSection').style.display = '';
    }
    // Restore page checkboxes
    (s.pages || ['sc']).forEach(pageId => {
      const cb = document.querySelector(`input[value="${pageId}"]`);
      if (cb) {
        cb.checked = true;
        cb.closest('.canva-page-item')?.classList.add('checked');
      }
    });
    this._updateStatus(s.applied);
    this._updateBadge();
  },

  // ── Build CSS injection string for student HTML ──────────────
  buildCSS() {
    const s = this._state();
    if (!s.imageDataUrl || !s.applied) return '';

    const lines = [':root {'];
    // Token overrides
    for (const [varName, hex] of Object.entries(s.mapping)) {
      if (hex) {
        lines.push(`  ${varName}: ${hex};`);
        // Also adjust lighter/darker variants
        if (varName === '--bg') {
          lines.push(`  --bg2: ${this._adjustLight(hex, 0.04)};`);
          lines.push(`  --bg3: ${this._adjustLight(hex, 0.07)};`);
        }
        if (varName === '--card') {
          lines.push(`  --card2: ${this._adjustLight(hex, 0.03)};`);
        }
      }
    }
    lines.push('}');

    // Background per-page
    const pages = s.pages || ['sc'];
    const pageCSS = pages.map(pageId => `
#${pageId} {
  background-image: url('${s.imageDataUrl}') !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}
#${pageId}::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(14,28,47,${s.opacity ?? 0.18});
  pointer-events: none;
  z-index: 0;
}
#${pageId} > * {
  position: relative;
  z-index: 1;
}
    `).join('\n');

    return lines.join('\n') + '\n' + pageCSS;
  },

  // Lighten/darken hex by delta (0..1)
  _adjustLight(hex, delta) {
    const [r,g,b] = this._hexToRgb(hex);
    const adj = v => Math.min(255, Math.max(0, Math.round(v + delta * 255)));
    return this._toHex([adj(r), adj(g), adj(b)]);
  },
};

// ── Drag-drop init ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  AT_CANVA._setupDragDrop();
  // Restore kalau ada saved state
  setTimeout(() => AT_CANVA.restore(), 200);
});

// ── Patch buildStudentHTML — inject Canva CSS + background ────
(function() {
  function doPatch() {
    const _prev = AT_PREVIEW.buildStudentHTML.bind(AT_PREVIEW);
    AT_PREVIEW.buildStudentHTML = function(S) {
      let html = _prev(S);
      try {
        const canvaCSS = AT_CANVA.buildCSS();
        if (canvaCSS && html.includes('</head>')) {
          html = html.replace(
            '</head>',
            `<style id="at-canva-css">${canvaCSS}</style></head>`
          );
        }
      } catch(e) { console.warn('AT_CANVA patch error:', e); }
      return html;
    };
    console.log('✅ AT_CANVA buildStudentHTML patch installed');
  }
  if (window.AT_PREVIEW) doPatch();
  else document.addEventListener('DOMContentLoaded', doPatch);
})();
