// ═══════════════════════════════════════════════════════════════
// CANVA_MODE.JS — Visual Page Builder
// Gabungkan desain PNG Canva + elemen interaktif app
//
// Arsitektur:
//   AT_CANVA_MODE.pages[]  — array halaman (masing-masing punya bg + elements[])
//   AT_CANVA_MODE._sel     — elemen terpilih di stage
//   AT_CANVA_MODE._zoom    — zoom level (0.5–2.0)
//   AT_CANVA_MODE._ratio   — rasio aktif (16:9, 9:16, 1:1, A4)
// ═══════════════════════════════════════════════════════════════

window.AT_CANVA_MODE = {

  /* ── Rasio yang tersedia ─────────────────────────────────────── */
  RATIOS: [
    { id:'16:9',  name:'16:9',  desc:'Landscape PPT',  w:1280, h:720  },
    { id:'9:16',  name:'9:16',  desc:'Portrait HP',     w:720,  h:1280 },
    { id:'1:1',   name:'1:1',   desc:'Square Post',     w:800,  h:800  },
    { id:'A4',    name:'A4',    desc:'Dokumen LKS',     w:794,  h:1123 },
    { id:'4:3',   name:'4:3',   desc:'Presentasi Lama', w:1024, h:768  },
  ],

  /* ── Tipe elemen yang bisa ditambahkan ──────────────────────── */
  ELEM_TYPES: [
    { id:'kuis',   icon:'❓', name:'Kuis',   src:'AT_STATE.kuis',   color:'rgba(245,200,66,.4)' },
    { id:'game',   icon:'🎮', name:'Game',   src:'AT_STATE.games',  color:'rgba(56,217,217,.4)' },
    { id:'materi', icon:'📝', name:'Materi', src:'AT_STATE.materi', color:'rgba(167,139,250,.4)' },
    { id:'modul',  icon:'🧩', name:'Modul',  src:'AT_STATE.modules',color:'rgba(52,211,153,.4)' },
    { id:'teks',   icon:'🔤', name:'Teks',   src:null,              color:'rgba(255,255,255,.3)' },
    { id:'shape',  icon:'⬜', name:'Shape',  src:null,              color:'rgba(100,100,200,.3)' },
  ],

  /* ── Internal state ──────────────────────────────────────────── */
  _currentPage: 0,
  _sel: null,         // selected element ID on stage
  _zoom: 1.0,
  _ratio: '16:9',
  _tool: 'select',
  _leftTab: 'pages',
  _dragEl: null,      // element being dragged from panel
  _moveEl: null,      // element being moved on stage
  _resizeEl: null,
  _resizeDir: null,
  _moveStart: null,

  /* ── State getter (saved in AT_STATE) ────────────────────────── */
  _st() {
    if (!AT_STATE.canvaMode) {
      AT_STATE.canvaMode = {
        ratio: '16:9',
        pages: [this._newPage('Halaman 1')],
      };
    }
    return AT_STATE.canvaMode;
  },

  _newPage(label) {
    return {
      id: 'p_' + Date.now(),
      label,
      bgDataUrl: null,
      bgColor: '#1a1a2e',
      overlay: 20,
      elements: [],
    };
  },

  /* ── Init ────────────────────────────────────────────────────── */
  init() {
    // Sync ratio from state
    const st = this._st();
    this._ratio = st.ratio || '16:9';
    this._currentPage = 0;

    this._applyRatioToStage();
    this._renderLeftPanel();
    this._renderStage();
    this._renderLayerList();
    this._setupStageDnD();
    this._setupMouseEvents();
    this._updateStatusBar();
    console.log('✅ AT_CANVA_MODE init done');
  },

  /* ── Ratio ───────────────────────────────────────────────────── */
  setRatio(ratioId) {
    this._ratio = ratioId;
    this._st().ratio = ratioId;
    this._applyRatioToStage();
    this._renderLeftPanel();
    document.getElementById('cm-ratio-badge').textContent = ratioId;
    AT_EDITOR.markDirty?.();
  },

  _applyRatioToStage() {
    const r = this.RATIOS.find(r => r.id === this._ratio) || this.RATIOS[0];
    const wrap = document.getElementById('cm-stage-wrap');
    if (!wrap) return;

    // Scale to fit canvas area with padding
    const area = document.getElementById('cm-canvas-area');
    const aW = (area?.clientWidth  || 800) - 80;
    const aH = (area?.clientHeight || 600) - 80;
    const scaleW = aW / r.w;
    const scaleH = aH / r.h;
    this._baseScale = Math.min(scaleW, scaleH, 1);
    this._stageW = r.w;
    this._stageH = r.h;

    this._applyZoom();
    document.getElementById('cm-stage-size-label').textContent = `${r.w}×${r.h}`;
  },

  _applyZoom() {
    const wrap = document.getElementById('cm-stage-wrap');
    if (!wrap) return;
    const scale = (this._baseScale || 1) * this._zoom;
    wrap.style.width  = this._stageW + 'px';
    wrap.style.height = this._stageH + 'px';
    wrap.style.transform = `scale(${scale})`;
    document.getElementById('cm-zoom-label').textContent = Math.round(scale * 100) + '%';
  },

  zoom(delta) {
    this._zoom = Math.min(2, Math.max(0.25, this._zoom + delta));
    this._applyZoom();
  },

  /* ── Left panel tabs ─────────────────────────────────────────── */
  switchLeftTab(tab) {
    this._leftTab = tab;
    ['pages','elems','ratio','layers'].forEach(t => {
      document.getElementById('cmtab-' + t)?.classList.toggle('active', t === tab);
      document.getElementById('cmrail-' + t)?.classList.toggle('active', t === tab);
    });
    this._renderLeftPanel();
  },

  _renderLeftPanel() {
    const body = document.getElementById('cm-left-body');
    if (!body) return;
    switch(this._leftTab) {
      case 'pages':   body.innerHTML = this._buildPagesHTML(); break;
      case 'elems':   body.innerHTML = this._buildElemsHTML(); break;
      case 'ratio':   body.innerHTML = this._buildRatioHTML(); break;
      case 'layers':  this._renderLayerList(); break;
    }
    if (this._leftTab === 'elems') this._setupElemChipDnD();
  },

  /* ── Pages panel ─────────────────────────────────────────────── */
  _buildPagesHTML() {
    const pages = this._st().pages;
    const items = pages.map((p, i) => {
      const isActive = i === this._currentPage;
      const bgStyle = p.bgDataUrl
        ? `background:url('${p.bgDataUrl}') center/cover`
        : `background:${p.bgColor || '#1a1a2e'}`;
      return `
        <div class="cm-page-thumb ${isActive ? 'active' : ''}"
             onclick="AT_CANVA_MODE.goPage(${i})"
             style="${bgStyle};aspect-ratio:${this._getRatioNum()}">
          <div class="cm-page-thumb-label">${p.label}</div>
          <div style="position:absolute;top:3px;right:4px;font-size:.55rem;color:rgba(255,255,255,.5)">${p.elements.length}el</div>
        </div>`;
    }).join('');
    return `
      <div class="cm-section-label">Halaman</div>
      <div class="cm-page-strip">${items}</div>
      <div class="cm-page-add" onclick="AT_CANVA_MODE.addPage()" style="margin-top:8px">+ Tambah Halaman</div>
      <button class="btn btn-sm btn-ghost" style="width:100%;margin-top:6px;font-size:.7rem"
        onclick="AT_CANVA_MODE.duplicatePage()">⧉ Duplikat Halaman</button>
      <button class="btn btn-sm" style="width:100%;margin-top:4px;font-size:.7rem;background:rgba(255,107,107,.08);color:var(--r);border:1px solid rgba(255,107,107,.2)"
        onclick="AT_CANVA_MODE.deletePage()">🗑 Hapus Halaman</button>`;
  },

  _getRatioNum() {
    const r = this.RATIOS.find(r => r.id === this._ratio) || this.RATIOS[0];
    return r.w / r.h;
  },

  goPage(idx) {
    const pages = this._st().pages;
    if (idx < 0 || idx >= pages.length) return;
    this._currentPage = idx;
    this._sel = null;
    this._renderStage();
    this._renderLayerList();
    this._updateStatusBar();
    this._renderLeftPanel();
    document.getElementById('cm-page-title').textContent = pages[idx].label;
    document.getElementById('cm-el-props').style.display = 'none';
  },

  addPage() {
    const label = 'Halaman ' + (this._st().pages.length + 1);
    this._st().pages.push(this._newPage(label));
    this.goPage(this._st().pages.length - 1);
    AT_EDITOR.markDirty?.();
  },

  duplicatePage() {
    const pages = this._st().pages;
    const orig = pages[this._currentPage];
    const clone = JSON.parse(JSON.stringify(orig));
    clone.id = 'p_' + Date.now();
    clone.label = orig.label + ' (Salinan)';
    // Re-ID elements
    clone.elements.forEach(el => el.id = 'el_' + Date.now() + Math.random());
    pages.splice(this._currentPage + 1, 0, clone);
    this.goPage(this._currentPage + 1);
    AT_EDITOR.markDirty?.();
  },

  deletePage() {
    const pages = this._st().pages;
    if (pages.length <= 1) { AT_UTIL.toast('⚠️ Minimal 1 halaman'); return; }
    if (!confirm(`Hapus "${pages[this._currentPage].label}"?`)) return;
    pages.splice(this._currentPage, 1);
    this.goPage(Math.max(0, this._currentPage - 1));
    AT_EDITOR.markDirty?.();
  },

  /* ── Elements panel ──────────────────────────────────────────── */
  _buildElemsHTML() {
    const chips = this.ELEM_TYPES.map(t => {
      let srcNote = '';
      if (t.id === 'kuis') {
        const count = (AT_STATE.kuis||[]).length;
        srcNote = count + ' soal tersedia';
      } else if (t.id === 'game') {
        const count = (AT_STATE.games||[]).length;
        srcNote = count + ' game tersedia';
      } else if (t.id === 'modul') {
        const count = (AT_STATE.modules||[]).length;
        srcNote = count + ' modul tersedia';
      } else if (t.id === 'materi') {
        srcNote = AT_STATE.materi ? 'dari panel materi' : 'belum ada';
      } else {
        srcNote = 'klik untuk tambah';
      }
      return `
        <div class="cm-elem-chip" draggable="true"
             data-etype="${t.id}"
             onclick="AT_CANVA_MODE.addElemByType('${t.id}')">
          <span class="ce-icon">${t.icon}</span>
          <span class="ce-name">${t.name}</span>
          <span class="ce-src">${srcNote}</span>
        </div>`;
    }).join('');

    // Kuis sub-list
    const kuisItems = (AT_STATE.kuis||[]).slice(0,5).map((q,i) => `
      <div class="cm-elem-chip" style="grid-column:1/-1;flex-direction:row;gap:8px;text-align:left"
           onclick="AT_CANVA_MODE.addKuis(${i})">
        <span style="font-size:.8rem">❓</span>
        <div>
          <div style="font-size:.68rem;font-weight:700;color:var(--text)">${q.q?.substring(0,40)||'Soal '+i}…</div>
          <div style="font-size:.62rem;color:var(--muted)">${(q.opts||[]).length} pilihan</div>
        </div>
      </div>`).join('');

    const gameItems = (AT_STATE.games||[]).slice(0,5).map((g,i) => `
      <div class="cm-elem-chip" style="grid-column:1/-1;flex-direction:row;gap:8px;text-align:left"
           onclick="AT_CANVA_MODE.addGame(${i})">
        <span style="font-size:.8rem">🎮</span>
        <div>
          <div style="font-size:.68rem;font-weight:700;color:var(--text)">${g.judul||g.type||'Game '+i}</div>
          <div style="font-size:.62rem;color:var(--muted)">${g.type||'interaktif'}</div>
        </div>
      </div>`).join('');

    return `
      <div class="cm-section-label">Elemen Dasar</div>
      <div class="cm-elem-grid">${chips}</div>
      ${kuisItems ? `<div class="cm-section-label" style="margin-top:14px">Soal Kuis</div>
      <div class="cm-elem-grid">${kuisItems}</div>` : ''}
      ${gameItems ? `<div class="cm-section-label" style="margin-top:14px">Game</div>
      <div class="cm-elem-grid">${gameItems}</div>` : ''}
    `;
  },

  /* ── Ratio panel ─────────────────────────────────────────────── */
  _buildRatioHTML() {
    return `
      <div class="cm-section-label">Rasio Halaman</div>
      <div class="cm-ratio-grid">
        ${this.RATIOS.map(r => {
          const aspect = r.w / r.h;
          const tw = aspect >= 1 ? 64 : Math.round(64 * aspect);
          const th = aspect <= 1 ? 40 : Math.round(40 / aspect);
          return `
          <div class="cm-ratio-card ${this._ratio === r.id ? 'active' : ''}"
               onclick="AT_CANVA_MODE.setRatio('${r.id}')">
            <div class="cm-ratio-thumb" style="width:${tw}px;height:${th}px"></div>
            <div class="cm-ratio-name">${r.name}</div>
            <div class="cm-ratio-desc">${r.desc}</div>
            <div class="cm-ratio-desc" style="margin-top:1px;font-size:.58rem">${r.w}×${r.h}</div>
          </div>`;
        }).join('')}
      </div>
      <div class="cm-section-label" style="margin-top:14px">Custom Ukuran</div>
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center;font-size:.72rem">
        <input class="cm-prop-input" type="number" id="cmCustomW" placeholder="Lebar" value="${this._stageW||1280}">
        <span style="color:var(--muted)">×</span>
        <input class="cm-prop-input" type="number" id="cmCustomH" placeholder="Tinggi" value="${this._stageH||720}">
      </div>
      <button class="btn btn-sm btn-ghost" style="width:100%;margin-top:6px;font-size:.7rem"
        onclick="AT_CANVA_MODE.applyCustomSize()">✅ Terapkan Custom</button>
    `;
  },

  applyCustomSize() {
    const w = parseInt(document.getElementById('cmCustomW')?.value) || 1280;
    const h = parseInt(document.getElementById('cmCustomH')?.value) || 720;
    this._stageW = w;
    this._stageH = h;
    this._applyZoom();
    AT_UTIL.toast(`📐 Ukuran diterapkan: ${w}×${h}`);
  },

  /* ── Stage render ────────────────────────────────────────────── */
  _renderStage() {
    const page = this._st().pages[this._currentPage];
    if (!page) return;

    // BG
    const bgEl = document.getElementById('cm-stage-bg');
    if (bgEl) bgEl.style.background = page.bgColor || '#1a1a2e';

    const bgImg = document.getElementById('cm-stage-bg-img');
    if (bgImg) {
      bgImg.src = page.bgDataUrl || '';
      bgImg.style.display = page.bgDataUrl ? 'block' : 'none';
    }

    const overlay = document.getElementById('cm-stage-bg-overlay');
    if (overlay) overlay.style.background = `rgba(14,28,47,${(page.overlay||20)/100})`;

    // Elements
    const elContainer = document.getElementById('cm-stage-elements');
    if (!elContainer) return;
    elContainer.innerHTML = '';
    (page.elements || []).forEach(el => {
      elContainer.appendChild(this._buildElDOM(el));
    });
    document.getElementById('cm-el-count').textContent = (page.elements||[]).length + ' elemen';
  },

  /* ── Build element DOM ───────────────────────────────────────── */
  _buildElDOM(el) {
    const div = document.createElement('div');
    div.className = 'cm-el';
    div.id = 'cm-el-' + el.id;
    div.dataset.elid = el.id;
    div.dataset.type = el.type;
    div.style.cssText = `
      left:${el.x}%; top:${el.y}%;
      width:${el.w}%; height:${el.h}%;
      opacity:${(el.opacity||100)/100};
    `;
    if (el.id === this._sel) div.classList.add('cm-selected');

    // Handle bar
    const handle = document.createElement('div');
    handle.className = 'cm-el-handle';
    handle.innerHTML = `
      <span class="cm-el-handle-label">${el.icon||''} ${el.label||el.type}</span>
      <span class="cm-el-handle-del" onclick="AT_CANVA_MODE._deleteEl('${el.id}')">✕</span>`;

    // Body
    const body = document.createElement('div');
    body.className = 'cm-el-body';
    body.innerHTML = this._buildElBodyHTML(el);

    // Resize handles (only when selected)
    const resizeHandles = ['tl','tr','bl','br'].map(dir => {
      const rh = document.createElement('div');
      rh.className = `cm-resize-handle ${dir}`;
      rh.dataset.dir = dir;
      rh.style.display = el.id === this._sel ? '' : 'none';
      return rh;
    });

    div.appendChild(handle);
    div.appendChild(body);
    resizeHandles.forEach(r => div.appendChild(r));

    // Click to select
    div.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('cm-resize-handle')) {
        this._startResize(e, el.id, e.target.dataset.dir);
        return;
      }
      if (e.target.classList.contains('cm-el-handle-del')) return;
      this._startMove(e, el.id);
      this._selectEl(el.id);
    });

    return div;
  },

  /* ── Element body content ────────────────────────────────────── */
  _buildElBodyHTML(el) {
    switch(el.type) {
      case 'kuis': {
        const q = (AT_STATE.kuis||[])[el.dataIdx];
        if (!q) return '<div style="font-size:.7rem;color:rgba(255,255,255,.5)">Kuis tidak ditemukan</div>';
        const opts = (q.opts||[]).map((o, i) =>
          `<div class="cm-kuis-opt ${i === q.ans ? 'correct' : ''}">${String.fromCharCode(65+i)}. ${o}</div>`
        ).join('');
        return `<div class="cm-kuis-preview"><div class="cm-kuis-q">${q.q}</div>${opts}</div>`;
      }
      case 'game': {
        const g = (AT_STATE.games||[])[el.dataIdx];
        if (!g) return '<div style="font-size:.7rem;color:rgba(255,255,255,.5)">Game tidak ditemukan</div>';
        return `<div style="text-align:center;padding:8px">
          <div style="font-size:1.5rem">${g.icon||'🎮'}</div>
          <div style="font-size:.75rem;font-weight:700;color:#fff;margin-top:4px">${g.judul||g.type}</div>
          <div style="font-size:.62rem;color:rgba(255,255,255,.6)">${g.type||'game interaktif'}</div>
        </div>`;
      }
      case 'materi':
        return `<div style="font-size:.7rem;color:rgba(255,255,255,.8)">
          <div style="font-weight:700;margin-bottom:4px">${AT_STATE.materi?.ringkasan?.substring(0,60)||'Materi'}…</div>
        </div>`;
      case 'modul': {
        const m = (AT_STATE.modules||[])[el.dataIdx];
        if (!m) return '<div style="font-size:.7rem;color:rgba(255,255,255,.5)">Modul tidak ditemukan</div>';
        return `<div style="text-align:center;padding:6px">
          <div style="font-size:1.2rem">${m.icon||'🧩'}</div>
          <div style="font-size:.72rem;font-weight:700;color:#fff;margin-top:3px">${m.judul||m.type}</div>
        </div>`;
      }
      case 'teks':
        return `<div class="cm-teks-el" contenteditable="true"
          onblur="AT_CANVA_MODE._saveTeks('${el.id}',this.textContent)"
          style="font-size:${el.fontSize||16}px">${el.text||'Ketik teks di sini…'}</div>`;
      case 'shape':
        return `<div style="width:100%;height:100%;min-height:40px;background:${el.color||'rgba(255,255,255,.15)'};border-radius:${el.radius||8}px"></div>`;
      default:
        return `<div style="font-size:.72rem;color:rgba(255,255,255,.6)">${el.type}</div>`;
    }
  },

  /* ── Add elements ────────────────────────────────────────────── */
  addElemByType(type) {
    const page = this._st().pages[this._currentPage];
    if (!page) return;
    const el = {
      id: 'el_' + Date.now(),
      type,
      icon: this.ELEM_TYPES.find(t => t.id === type)?.icon || '',
      label: this.ELEM_TYPES.find(t => t.id === type)?.name || type,
      x: 5, y: 10, w: 40, h: 30,
      opacity: 100,
    };
    if (type === 'teks') { el.text = 'Judul Halaman'; el.fontSize = 24; el.h = 15; }
    if (type === 'shape') { el.color = 'rgba(255,255,255,.1)'; el.radius = 8; el.h = 20; }
    page.elements.push(el);
    this._renderStage();
    this._renderLayerList();
    this._selectEl(el.id);
    this._renderLeftPanel();
    AT_EDITOR.markDirty?.();
  },

  addKuis(idx) {
    const q = (AT_STATE.kuis||[])[idx];
    if (!q) { AT_UTIL.toast('⚠️ Kuis tidak ditemukan'); return; }
    const page = this._st().pages[this._currentPage];
    const el = {
      id: 'el_' + Date.now(),
      type: 'kuis',
      icon: '❓',
      label: 'Kuis: ' + (q.q||'').substring(0,20),
      dataIdx: idx,
      x: 5, y: 5, w: 45, h: 40,
      opacity: 100,
    };
    page.elements.push(el);
    this._renderStage();
    this._renderLayerList();
    this._selectEl(el.id);
    this._renderLeftPanel();
    AT_EDITOR.markDirty?.();
    AT_UTIL.toast('✅ Kuis ditambahkan ke halaman');
  },

  addGame(idx) {
    const g = (AT_STATE.games||[])[idx];
    if (!g) { AT_UTIL.toast('⚠️ Game tidak ditemukan'); return; }
    const page = this._st().pages[this._currentPage];
    const el = {
      id: 'el_' + Date.now(),
      type: 'game',
      icon: '🎮',
      label: g.judul||g.type||'Game',
      dataIdx: idx,
      x: 55, y: 5, w: 40, h: 40,
      opacity: 100,
    };
    page.elements.push(el);
    this._renderStage();
    this._renderLayerList();
    this._selectEl(el.id);
    this._renderLeftPanel();
    AT_EDITOR.markDirty?.();
    AT_UTIL.toast('✅ Game ditambahkan ke halaman');
  },

  /* ── Select element ──────────────────────────────────────────── */
  _selectEl(elId) {
    this._sel = elId;
    document.querySelectorAll('.cm-el').forEach(el => {
      const isSelected = el.dataset.elid === elId;
      el.classList.toggle('cm-selected', isSelected);
      el.querySelectorAll('.cm-resize-handle').forEach(rh => rh.style.display = isSelected ? '' : 'none');
    });
    document.querySelectorAll('.cm-layer-item').forEach(li => {
      li.classList.toggle('active', li.dataset.elid === elId);
    });
    const page = this._st().pages[this._currentPage];
    const elData = (page?.elements||[]).find(e => e.id === elId);
    if (elData) {
      document.getElementById('cm-el-props').style.display = '';
      document.getElementById('cmprop-x').value = Math.round(elData.x);
      document.getElementById('cmprop-y').value = Math.round(elData.y);
      document.getElementById('cmprop-w').value = Math.round(elData.w);
      document.getElementById('cmprop-h').value = Math.round(elData.h);
      document.getElementById('cmprop-op').value = elData.opacity||100;
    }
  },

  _deleteEl(elId) {
    const page = this._st().pages[this._currentPage];
    if (!page) return;
    page.elements = page.elements.filter(e => e.id !== elId);
    if (this._sel === elId) { this._sel = null; document.getElementById('cm-el-props').style.display = 'none'; }
    this._renderStage();
    this._renderLayerList();
    this._renderLeftPanel();
    AT_EDITOR.markDirty?.();
  },

  deleteSelected() { if (this._sel) this._deleteEl(this._sel); },

  /* ── Update element properties ───────────────────────────────── */
  updateElProp(prop, val) {
    if (!this._sel) return;
    const page = this._st().pages[this._currentPage];
    const el = (page?.elements||[]).find(e => e.id === this._sel);
    if (!el) return;
    el[prop] = parseFloat(val);
    const domEl = document.getElementById('cm-el-' + this._sel);
    if (domEl) {
      if (prop === 'x') domEl.style.left = val + '%';
      if (prop === 'y') domEl.style.top = val + '%';
      if (prop === 'w') domEl.style.width = val + '%';
      if (prop === 'h') domEl.style.height = val + '%';
      if (prop === 'opacity') domEl.style.opacity = val / 100;
    }
    AT_EDITOR.markDirty?.();
  },

  _saveTeks(elId, text) {
    const page = this._st().pages[this._currentPage];
    const el = (page?.elements||[]).find(e => e.id === elId);
    if (el) { el.text = text; AT_EDITOR.markDirty?.(); }
  },

  /* ── Drag & drop: panel chip → stage ────────────────────────── */
  _setupElemChipDnD() {
    document.querySelectorAll('.cm-elem-chip[draggable]').forEach(chip => {
      chip.addEventListener('dragstart', (e) => {
        this._dragEl = chip.dataset.etype;
        e.dataTransfer.effectAllowed = 'copy';
      });
    });
  },

  _setupStageDnD() {
    const wrap = document.getElementById('cm-stage-wrap');
    if (!wrap) return;

    wrap.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      wrap.classList.add('drag-over');
    });
    wrap.addEventListener('dragleave', () => wrap.classList.remove('drag-over'));
    wrap.addEventListener('drop', (e) => {
      e.preventDefault();
      wrap.classList.remove('drag-over');
      if (!this._dragEl) return;
      // Calculate drop position as % of stage
      const rect = wrap.getBoundingClientRect();
      const scale = (this._baseScale||1) * this._zoom;
      const x = ((e.clientX - rect.left) / scale / this._stageW * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / scale / this._stageH * 100).toFixed(1);
      const page = this._st().pages[this._currentPage];
      const el = {
        id: 'el_' + Date.now(),
        type: this._dragEl,
        icon: this.ELEM_TYPES.find(t => t.id === this._dragEl)?.icon || '',
        label: this.ELEM_TYPES.find(t => t.id === this._dragEl)?.name || this._dragEl,
        x: parseFloat(x), y: parseFloat(y),
        w: 40, h: 30, opacity: 100,
      };
      if (this._dragEl === 'teks')  { el.text = 'Teks Baru'; el.fontSize = 20; el.h = 12; }
      if (this._dragEl === 'shape') { el.color = 'rgba(255,255,255,.1)'; el.radius = 8; el.h = 15; }
      page.elements.push(el);
      this._dragEl = null;
      this._renderStage();
      this._renderLayerList();
      this._selectEl(el.id);
      this._renderLeftPanel();
      AT_EDITOR.markDirty?.();
      AT_UTIL.toast('✅ Elemen ditambahkan');
    });
  },

  /* ── Mouse events: move + resize on stage ────────────────────── */
  _setupMouseEvents() {
    const area = document.getElementById('cm-canvas-area');
    if (!area) return;

    // Track mouse position for status bar
    area.addEventListener('mousemove', (e) => {
      const wrap = document.getElementById('cm-stage-wrap');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const scale = (this._baseScale||1) * this._zoom;
      const x = Math.round((e.clientX - rect.left) / scale);
      const y = Math.round((e.clientY - rect.top) / scale);
      const posEl = document.getElementById('cm-pos-display');
      if (posEl && x >= 0 && y >= 0 && x <= this._stageW && y <= this._stageH) {
        posEl.textContent = `x:${x} y:${y}`;
      }

      // Handle move
      if (this._moveEl) {
        const dx = e.clientX - this._moveStart.x;
        const dy = e.clientY - this._moveStart.y;
        const newX = this._moveStart.elX + (dx / scale / this._stageW * 100);
        const newY = this._moveStart.elY + (dy / scale / this._stageH * 100);
        const el = this._getElData(this._moveEl);
        if (el) {
          el.x = Math.max(0, Math.min(90, newX));
          el.y = Math.max(0, Math.min(90, newY));
          const domEl = document.getElementById('cm-el-' + this._moveEl);
          if (domEl) {
            domEl.style.left = el.x + '%';
            domEl.style.top  = el.y + '%';
          }
          document.getElementById('cmprop-x').value = Math.round(el.x);
          document.getElementById('cmprop-y').value = Math.round(el.y);
        }
      }

      // Handle resize
      if (this._resizeEl) {
        const dx = e.clientX - this._moveStart.x;
        const dy = e.clientY - this._moveStart.y;
        const el = this._getElData(this._resizeEl);
        const domEl = document.getElementById('cm-el-' + this._resizeEl);
        if (!el || !domEl) return;
        const dxPct = dx / scale / this._stageW * 100;
        const dyPct = dy / scale / this._stageH * 100;
        const dir = this._resizeDir;
        if (dir.includes('r')) el.w = Math.max(10, this._moveStart.elW + dxPct);
        if (dir.includes('b')) el.h = Math.max(8,  this._moveStart.elH + dyPct);
        if (dir.includes('l')) {
          el.x = Math.min(this._moveStart.elX + this._moveStart.elW - 10, this._moveStart.elX + dxPct);
          el.w = Math.max(10, this._moveStart.elW - dxPct);
        }
        if (dir.includes('t')) {
          el.y = Math.min(this._moveStart.elY + this._moveStart.elH - 8, this._moveStart.elY + dyPct);
          el.h = Math.max(8, this._moveStart.elH - dyPct);
        }
        domEl.style.left   = el.x + '%';
        domEl.style.top    = el.y + '%';
        domEl.style.width  = el.w + '%';
        domEl.style.height = el.h + '%';
        ['cmprop-x','cmprop-y','cmprop-w','cmprop-h'].forEach((id, i) => {
          const vals = [el.x,el.y,el.w,el.h];
          const inp = document.getElementById(id);
          if (inp) inp.value = Math.round(vals[i]);
        });
      }
    });

    document.addEventListener('mouseup', () => {
      if (this._moveEl || this._resizeEl) AT_EDITOR.markDirty?.();
      this._moveEl = null;
      this._resizeEl = null;
      this._moveStart = null;
    });

    // Click on canvas bg → deselect
    area.addEventListener('mousedown', (e) => {
      if (e.target === area || e.target.id === 'cm-stage-wrap'
          || e.target.id === 'cm-stage-bg' || e.target.id === 'cm-stage-bg-overlay') {
        this._sel = null;
        document.querySelectorAll('.cm-el').forEach(el => {
          el.classList.remove('cm-selected');
          el.querySelectorAll('.cm-resize-handle').forEach(rh => rh.style.display = 'none');
        });
        document.getElementById('cm-el-props').style.display = 'none';
        document.querySelectorAll('.cm-layer-item').forEach(li => li.classList.remove('active'));
      }
    });
  },

  _startMove(e, elId) {
    e.preventDefault();
    this._moveEl = elId;
    const el = this._getElData(elId);
    if (!el) return;
    this._moveStart = { x: e.clientX, y: e.clientY, elX: el.x, elY: el.y };
  },

  _startResize(e, elId, dir) {
    e.preventDefault();
    e.stopPropagation();
    this._resizeEl = elId;
    this._resizeDir = dir;
    const el = this._getElData(elId);
    if (!el) return;
    this._moveStart = { x: e.clientX, y: e.clientY, elX: el.x, elY: el.y, elW: el.w, elH: el.h };
  },

  _getElData(elId) {
    const page = this._st().pages[this._currentPage];
    return (page?.elements||[]).find(e => e.id === elId);
  },

  /* ── Background upload ───────────────────────────────────────── */
  handleBgUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const page = this._st().pages[this._currentPage];
      page.bgDataUrl = e.target.result;
      const img = document.getElementById('cm-stage-bg-img');
      if (img) { img.src = e.target.result; img.style.display = 'block'; }
      const preview = document.getElementById('cmBgPreview');
      if (preview) { preview.src = e.target.result; preview.classList.add('show'); }
      this._renderLeftPanel();
      AT_EDITOR.markDirty?.();
      AT_UTIL.toast('✅ Background Canva diterapkan');
    };
    reader.readAsDataURL(file);
  },

  setOverlay(val) {
    const page = this._st().pages[this._currentPage];
    if (page) page.overlay = parseInt(val);
    const ov = document.getElementById('cm-stage-bg-overlay');
    if (ov) ov.style.background = `rgba(14,28,47,${val/100})`;
  },

  setBgColor(hex) {
    const page = this._st().pages[this._currentPage];
    if (page) page.bgColor = hex;
    const bg = document.getElementById('cm-stage-bg');
    if (bg) bg.style.background = hex;
  },

  /* ── Layer list ──────────────────────────────────────────────── */
  _renderLayerList() {
    const page = this._st().pages[this._currentPage];
    const list = document.getElementById('cm-layer-list');
    if (!list || !page) return;
    const colors = { kuis:'#f5c842', game:'#3ecfcf', materi:'#a78bfa', modul:'#34d399', teks:'#fff', shape:'#6366f1' };
    list.innerHTML = [...(page.elements||[])].reverse().map(el => `
      <div class="cm-layer-item ${el.id === this._sel ? 'active' : ''}"
           data-elid="${el.id}"
           onclick="AT_CANVA_MODE._selectEl('${el.id}')">
        <div class="cm-layer-dot" style="background:${colors[el.type]||'#888'}"></div>
        <span class="cm-layer-name">${el.icon||''} ${el.label||el.type}</span>
        <span class="cm-layer-vis" onclick="event.stopPropagation();AT_CANVA_MODE._toggleElVis('${el.id}')">👁</span>
      </div>`).join('');

    // Also update in left panel if layers tab active
    if (this._leftTab === 'layers') {
      const body = document.getElementById('cm-left-body');
      if (body) body.innerHTML = '<div class="cm-section-label">Layer (atas = depan)</div>' + list.outerHTML;
    }
  },

  _toggleElVis(elId) {
    const el = this._getElData(elId);
    if (!el) return;
    el.hidden = !el.hidden;
    const domEl = document.getElementById('cm-el-' + elId);
    if (domEl) domEl.style.display = el.hidden ? 'none' : '';
    AT_EDITOR.markDirty?.();
  },

  /* ── Tool ────────────────────────────────────────────────────── */
  setTool(tool) {
    this._tool = tool;
    ['select','text'].forEach(t => {
      document.getElementById('cmtool-' + t)?.classList.toggle('active', t === tool);
    });
  },

  /* ── Status bar ──────────────────────────────────────────────── */
  _updateStatusBar() {
    const st = this._st();
    const page = st.pages[this._currentPage];
    document.getElementById('cm-page-count').textContent =
      `${this._currentPage + 1}/${st.pages.length} halaman`;
    document.getElementById('cm-el-count').textContent =
      `${(page?.elements||[]).length} elemen`;
  },

  /* ── Clear stage ─────────────────────────────────────────────── */
  clearStage() {
    if (!confirm('Bersihkan semua elemen di halaman ini?')) return;
    const page = this._st().pages[this._currentPage];
    if (page) page.elements = [];
    this._sel = null;
    this._renderStage();
    this._renderLayerList();
    this._renderLeftPanel();
    document.getElementById('cm-el-props').style.display = 'none';
    AT_EDITOR.markDirty?.();
  },

  /* ── Preview page ────────────────────────────────────────────── */
  previewCurrent() {
    const html = this.exportPageHTML(this._currentPage);
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  },

  /* ── Export page as interactive HTML ────────────────────────── */
  exportPage() {
    const html = this.exportPageHTML(this._currentPage);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canva-page-${this._currentPage + 1}.html`;
    a.click();
    URL.revokeObjectURL(url);
    AT_UTIL.toast('✅ Halaman diekspor sebagai HTML interaktif');
  },

  exportPageHTML(pageIdx) {
    const page = this._st().pages[pageIdx];
    const r = this.RATIOS.find(r => r.id === this._ratio) || this.RATIOS[0];

    const bgStyle = page.bgDataUrl
      ? `background-image:url('${page.bgDataUrl}');background-size:cover;background-position:center`
      : `background:${page.bgColor||'#1a1a2e'}`;

    const elementsHTML = (page.elements||[]).map(el => {
      if (el.hidden) return '';
      const style = `position:absolute;left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;opacity:${(el.opacity||100)/100}`;
      let body = '';

      if (el.type === 'kuis') {
        const q = (AT_STATE.kuis||[])[el.dataIdx];
        if (q) {
          const opts = (q.opts||[]).map((o,i) => `
            <div class="opt" onclick="checkAns(this,${i},${q.ans})" style="padding:6px 10px;border-radius:6px;margin:4px 0;background:rgba(255,255,255,.1);cursor:pointer;font-size:.8rem;color:#fff;transition:all .2s">
              ${String.fromCharCode(65+i)}. ${o}
            </div>`).join('');
          body = `<div style="padding:12px">
            <div style="font-size:.85rem;font-weight:700;color:#fff;margin-bottom:8px">${q.q}</div>
            ${opts}
            ${q.ex ? `<div id="ex_${el.id}" style="display:none;margin-top:8px;padding:8px;border-radius:6px;background:rgba(52,211,153,.15);font-size:.75rem;color:#6ee7b7">${q.ex}</div>` : ''}
          </div>
          <script>
          function checkAns(el,i,ans){
            document.querySelectorAll('.opt').forEach(o=>o.style.background='rgba(255,255,255,.1)');
            el.style.background=i===ans?'rgba(52,211,153,.3)':'rgba(255,107,107,.3)';
            var ex=document.getElementById('ex_${el.id}');if(ex)ex.style.display='';
          }
          <\/script>`;
        }
      } else if (el.type === 'game') {
        const g = (AT_STATE.games||[])[el.dataIdx];
        if (g) {
          try {
            body = AT_GAMES?.renderGameHtml(g) || `<div style="padding:12px;text-align:center;color:#fff">${g.icon||'🎮'} ${g.judul||'Game'}</div>`;
          } catch(ex) {
            body = `<div style="padding:12px;text-align:center;color:#fff">${g.icon||'🎮'} ${g.judul||'Game'}</div>`;
          }
        }
      } else if (el.type === 'teks') {
        body = `<div style="font-size:${el.fontSize||20}px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.5);padding:8px;line-height:1.4">${el.text||''}</div>`;
      } else if (el.type === 'materi') {
        body = `<div style="padding:12px;color:#fff;font-size:.8rem;line-height:1.6">${AT_STATE.materi?.ringkasan||'Materi'}</div>`;
      } else if (el.type === 'shape') {
        body = `<div style="width:100%;height:100%;background:${el.color||'rgba(255,255,255,.1)'};border-radius:${el.radius||8}px"></div>`;
      }

      return `<div style="${style};border-radius:8px;overflow:hidden;background:rgba(255,255,255,.08);backdrop-filter:blur(8px)">${body}</div>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${page.label}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,sans-serif}
    body{width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:#000}
    .stage{
      position:relative;
      width:${r.w}px;height:${r.h}px;
      ${bgStyle};
      overflow:hidden;
      transform-origin:top left;
    }
    .overlay{position:absolute;inset:0;background:rgba(14,28,47,${(page.overlay||20)/100})}
    @media(max-width:${r.w}px){
      .stage{transform:scale(calc(100vw / ${r.w}))}
    }
  </style>
</head>
<body>
  <div class="stage">
    <div class="overlay"></div>
    ${elementsHTML}
  </div>
</body>
</html>`;
  },

  /* ── Export semua halaman sebagai slideshow HTML ─────────────── */
  exportSlideshow() {
    const pages = this._st().pages;
    const slides = pages.map((p, i) => this.exportPageHTML(i)).join('\n<!-- SLIDE -->\n');
    // Simple slideshow wrapper
    const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><title>Slideshow Canva Mode</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#000;overflow:hidden}
  .slide-container{position:relative;width:100vw;height:100vh}
  .slide{display:none;position:absolute;inset:0}
  .slide.active{display:block}
  .nav-btn{position:fixed;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.15);border:none;color:#fff;font-size:1.5rem;padding:12px 16px;cursor:pointer;border-radius:8px;z-index:999;transition:background .15s}
  .nav-btn:hover{background:rgba(255,255,255,.3)}
  #prev{left:12px}
  #next{right:12px}
  .slide-num{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.5);font-size:.75rem;font-family:sans-serif}
</style>
</head>
<body>
  ${pages.map((p,i) => `
  <div class="slide ${i===0?'active':''}">
    <iframe src="data:text/html;charset=utf-8,${encodeURIComponent(this.exportPageHTML(i))}"
      style="width:100%;height:100%;border:none"></iframe>
  </div>`).join('')}
  <button class="nav-btn" id="prev" onclick="prevSlide()">‹</button>
  <button class="nav-btn" id="next" onclick="nextSlide()">›</button>
  <div class="slide-num" id="slide-num">1 / ${pages.length}</div>
  <script>
    var cur=0,total=${pages.length};
    function showSlide(n){
      document.querySelectorAll('.slide').forEach((s,i)=>s.classList.toggle('active',i===n));
      document.getElementById('slide-num').textContent=(n+1)+' / '+total;
    }
    function nextSlide(){cur=(cur+1)%total;showSlide(cur)}
    function prevSlide(){cur=(cur-1+total)%total;showSlide(cur)}
    document.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'||e.key===' ')nextSlide();
      if(e.key==='ArrowLeft')prevSlide();
    });
  <\/script>
</body></html>`;

    const blob = new Blob([html], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'canva-slideshow.html'; a.click();
    URL.revokeObjectURL(url);
    AT_UTIL.toast('✅ Slideshow diekspor! ('+pages.length+' halaman)');
  },
};

/* ── Register: init when canva panel becomes active ─────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Use MutationObserver to detect when p-canva becomes visible
  const panel = document.getElementById('p-canva');
  if (panel) {
    let _inited = false;
    const observer = new MutationObserver(() => {
      if (panel.classList.contains('active')) {
        document.body.classList.add('canva-mode-active');
        if (!_inited) {
          _inited = true;
          setTimeout(() => AT_CANVA_MODE.init(), 80);
        }
      } else {
        document.body.classList.remove('canva-mode-active');
      }
    });
    observer.observe(panel, { attributes: true, attributeFilter: ['class'] });

    // Also listen for direct NAV calls as fallback
    const origGo = AT_NAV.go.bind(AT_NAV);
    AT_NAV.go = function(id) {
      origGo(id);
      if (id === 'canva' && panel.classList.contains('active')) {
        _inited = false; // allow re-init on revisit
        AT_CANVA_MODE.init();
        _inited = true;
      }
    };
  }

  // Map canva panel to AT_NAV._panelToPage
  if (AT_NAV._panelToPage) AT_NAV._panelToPage['canva'] = 'sc';
});
