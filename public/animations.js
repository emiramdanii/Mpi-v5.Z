// ═══════════════════════════════════════════════════════════════
// ANIMATIONS.JS — Micro-interactions, drag-sort, score flash,
//                 confetti, SFX, onboarding tour, skeleton loaders
// Authoring Tool v1.0
// ═══════════════════════════════════════════════════════════════

/* ── SCORE FLASH ─────────────────────────────────────────────── */
window.AT_ANIM = {

  /**
   * scoreFlash(pts, anchorEl?)
   * Shows a floating "+N" particle near anchorEl or top-right corner
   */
  scoreFlash(pts, anchorEl) {
    const el = document.createElement("div");
    el.textContent = (pts > 0 ? "+" : "") + pts;
    const col = pts > 0 ? "#34d399" : "#ff5f6d";
    el.style.cssText = `
      position:fixed;
      font-family:'Plus Jakarta Sans',sans-serif;
      font-weight:900;
      font-size:1.1rem;
      color:${col};
      text-shadow:0 0 12px ${col}80;
      pointer-events:none;
      z-index:9999;
      animation:atScoreFloat 1.1s cubic-bezier(.4,0,.2,1) forwards;
    `;
    // Position near anchor or default top-right
    if (anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      el.style.left = r.left + r.width / 2 - 20 + "px";
      el.style.top = r.top - 10 + "px";
    } else {
      el.style.right = "80px";
      el.style.top = "70px";
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  },

  /**
   * ripple(event, element?)
   * Material-style click ripple
   */
  ripple(e, el) {
    const target = el || e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;
    const rect = target.getBoundingClientRect();
    circle.style.cssText = `
      position:absolute;
      width:${diameter}px;height:${diameter}px;
      left:${e.clientX - rect.left - radius}px;
      top:${e.clientY - rect.top - radius}px;
      border-radius:50%;
      background:rgba(255,255,255,.2);
      transform:scale(0);
      animation:atRipple .55s linear;
      pointer-events:none;
    `;
    target.style.position = "relative";
    target.style.overflow = "hidden";
    target.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  },

  /**
   * shimmer(el)
   * Apply shimmer loading effect to an element
   */
  shimmer(el) {
    el.classList.add("at-shimmer");
  },
  unshimmer(el) {
    el.classList.remove("at-shimmer");
  },

  /**
   * countUp(el, target, duration?)
   * Animate a number from 0 to target
   */
  countUp(el, target, duration = 800) {
    if (!el) return;
    const start = performance.now();
    const from = parseInt(el.textContent) || 0;
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      el.textContent = Math.round(from + (target - from) * ease);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  },

  /**
   * progressBarAnimate(el, pct, duration?)
   */
  progressBarAnimate(el, pct, duration = 600) {
    if (!el) return;
    el.style.transition = `width ${duration}ms cubic-bezier(.4,0,.2,1)`;
    el.style.width = pct + "%";
  },

  /**
   * panelSlideIn(el, direction?)
   * direction: 'up' | 'right' | 'left'
   */
  panelSlideIn(el, direction = "up") {
    if (!el) return;
    const transforms = { up: "translateY(20px)", right: "translateX(20px)", left: "translateX(-20px)" };
    el.style.opacity = "0";
    el.style.transform = transforms[direction] || transforms.up;
    el.style.transition = "opacity .35s ease, transform .35s cubic-bezier(.4,0,.2,1)";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    });
  },

  /**
   * cardPop(el)
   * Quick scale pop for new cards
   */
  cardPop(el) {
    if (!el) return;
    el.style.animation = "none";
    el.style.transform = "scale(.92)";
    el.style.opacity = "0";
    el.style.transition = "transform .25s cubic-bezier(.34,1.56,.64,1), opacity .2s ease";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = "scale(1)";
        el.style.opacity = "1";
      });
    });
  },

  /**
   * shake(el) — error shake
   */
  shake(el) {
    if (!el) return;
    el.style.animation = "atShake .4s ease";
    el.addEventListener("animationend", () => el.style.animation = "", { once: true });
  },

  /**
   * pulse(el) — gentle attention pulse
   */
  pulse(el) {
    if (!el) return;
    el.style.animation = "atPulse .6s ease";
    el.addEventListener("animationend", () => el.style.animation = "", { once: true });
  },

  /**
   * Highlight a field briefly (e.g. after import fills it)
   */
  highlight(el) {
    if (!el) return;
    const orig = el.style.background;
    el.style.transition = "background .3s ease";
    el.style.background = "rgba(245,200,66,.15)";
    setTimeout(() => {
      el.style.background = orig;
    }, 800);
  },

};

/* ── INJECT GLOBAL KEYFRAMES ─────────────────────────────────── */
(function injectKeyframes() {
  if (document.getElementById("at-anim-styles")) return;
  const style = document.createElement("style");
  style.id = "at-anim-styles";
  style.textContent = `
    @keyframes atScoreFloat {
      0%   { opacity:1; transform:translateY(0) scale(1); }
      60%  { opacity:1; transform:translateY(-40px) scale(1.2); }
      100% { opacity:0; transform:translateY(-70px) scale(.8); }
    }
    @keyframes atRipple {
      to { transform:scale(4); opacity:0; }
    }
    @keyframes atShake {
      0%,100% { transform:translateX(0); }
      20%     { transform:translateX(-6px); }
      40%     { transform:translateX(6px); }
      60%     { transform:translateX(-4px); }
      80%     { transform:translateX(4px); }
    }
    @keyframes atPulse {
      0%,100% { transform:scale(1); }
      50%     { transform:scale(1.04); box-shadow:0 0 0 6px rgba(245,200,66,.15); }
    }
    @keyframes at-shimmer-move {
      0%   { background-position:-400px 0; }
      100% { background-position:400px 0; }
    }
    .at-shimmer {
      background: linear-gradient(90deg,
        rgba(255,255,255,.04) 25%,
        rgba(255,255,255,.09) 50%,
        rgba(255,255,255,.04) 75%
      );
      background-size:400px 100%;
      animation: at-shimmer-move 1.3s infinite linear;
      border-radius:8px;
      pointer-events:none;
    }
    @keyframes atFadeIn {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:none; }
    }
    @keyframes atBounceIn {
      0%   { transform:scale(0); opacity:0; }
      60%  { transform:scale(1.1); opacity:1; }
      100% { transform:scale(1); }
    }
    .at-bounce-in { animation: atBounceIn .4s cubic-bezier(.34,1.56,.64,1); }
    .at-fade-in   { animation: atFadeIn .35s ease; }
  `;
  document.head.appendChild(style);
})();

/* ── DRAG-SORT — pointer events, correct reorder ────────────── */
window.AT_DRAG = {
  init(containerId, itemSelector, onReorder) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let dragEl = null, placeholder = null, origOrder = [];

    const getItems = () => [...container.querySelectorAll(itemSelector)];

    // Stamp data-orig-idx on ALL items before drag
    function stamp() {
      getItems().forEach((el, i) => el.dataset.origIdx = i);
    }

    function onPointerDown(e) {
      if (!e.target.closest(".drag-handle")) return;
      e.preventDefault();
      dragEl = e.target.closest(itemSelector);
      if (!dragEl) return;

      // Stamp BEFORE any DOM changes
      stamp();
      origOrder = getItems().map(el => +el.dataset.origIdx);

      const rect = dragEl.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;

      // Create placeholder
      placeholder = document.createElement("div");
      placeholder.className = "drag-placeholder";
      placeholder.style.height = rect.height + "px";
      dragEl.after(placeholder);

      // Float element
      Object.assign(dragEl.style, {
        position: "fixed",
        top: rect.top + "px",
        left: rect.left + "px",
        width: rect.width + "px",
        zIndex: "9999",
        pointerEvents: "none",
        boxShadow: "0 20px 60px rgba(0,0,0,.55)",
        transform: "scale(1.02)",
        transition: "box-shadow .2s, transform .2s",
        opacity: ".95"
      });

      function onMove(e) {
        if (!dragEl) return;
        dragEl.style.top = (e.clientY - offsetY) + "px";

        // Find insertion point among siblings (excluding dragEl + placeholder)
        const siblings = getItems().filter(el => el !== dragEl);
        let inserted = false;
        for (const sib of siblings) {
          const box = sib.getBoundingClientRect();
          if (e.clientY < box.top + box.height / 2) {
            container.insertBefore(placeholder, sib);
            inserted = true;
            break;
          }
        }
        if (!inserted) container.appendChild(placeholder);
      }

      function onUp() {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.body.style.userSelect = "";
        if (!dragEl || !placeholder) return;

        const destRect = placeholder.getBoundingClientRect();
        dragEl.style.transition = "top .18s cubic-bezier(.4,0,.2,1), transform .18s, opacity .18s";
        dragEl.style.top = destRect.top + "px";
        dragEl.style.transform = "scale(1)";
        dragEl.style.opacity = "1";

        setTimeout(() => {
          // Restore element to normal flow at placeholder position
          ["position","top","left","width","zIndex","pointerEvents",
           "boxShadow","transform","opacity","transition"].forEach(k => dragEl.style[k] = "");

          placeholder.replaceWith(dragEl);
          placeholder = null;

          // Build newOrder: what orig index is now at each position?
          const finalItems = getItems();
          const newOrder = finalItems.map(el => +(el.dataset.origIdx ?? 0));

          if (onReorder && JSON.stringify(newOrder) !== JSON.stringify(origOrder)) {
            onReorder(newOrder);
          }
          dragEl = null;
        }, 200);
      }

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.body.style.userSelect = "none";
    }

    container.addEventListener("pointerdown", onPointerDown);
  },

  reorderArray(arr, newOrder) {
    const copy = arr.slice();
    newOrder.forEach((origIdx, newIdx) => {
      if (origIdx < copy.length) arr[newIdx] = copy[origIdx];
    });
  }
};

/* ── ONBOARDING TOUR ─────────────────────────────────────────── */
window.AT_TOUR = {
  _steps: [
    { target: "#sidebar",       title: "Sidebar Navigasi",     body: "Gunakan menu ini untuk berpindah antar panel editor. Klik ☰ untuk menyembunyikan." },
    { target: "#p-dashboard",   title: "Dashboard",            body: "Pantau kelengkapan proyek, terapkan preset cepat, dan ekspor media dari sini." },
    { target: ".nav-item[data-panel='meta']",   title: "Identitas Media",  body: "Mulai dari sini — isi judul, kelas, durasi, dan ikon cover." },
    { target: ".nav-item[data-panel='import']", title: "Import Excel",     body: "Upload .xlsx untuk mengisi SEMUA tab sekaligus! Download template dulu." },
    { target: ".nav-item[data-panel='generate']", title: "Generate AI",   body: "Paste teks CP atau ATP, tool akan otomatis mengekstrak TP dan Alur." },
    { target: ".nav-item[data-panel='preview']",  title: "Preview Media",  body: "Lihat tampilan akhir media seperti yang dilihat siswa, lalu download HTML." },
  ],
  _cur: 0,
  _overlay: null,
  _box: null,

  start() {
    if (this._overlay) return;
    this._cur = 0;
    this._overlay = document.createElement("div");
    this._overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.72);
      z-index:800;pointer-events:none;transition:all .3s;
    `;
    document.body.appendChild(this._overlay);
    this._box = document.createElement("div");
    this._box.style.cssText = `
      position:fixed;z-index:801;
      background:#141c2e;border:1px solid rgba(245,200,66,.3);
      border-radius:16px;padding:20px 22px;max-width:300px;
      box-shadow:0 16px 48px rgba(0,0,0,.7);
      animation:atBounceIn .4s cubic-bezier(.34,1.56,.64,1);
    `;
    document.body.appendChild(this._box);
    this._render();
  },

  _render() {
    const step = this._steps[this._cur];
    const total = this._steps.length;

    // Position box near target
    const target = document.querySelector(step.target);
    if (target) {
      const r = target.getBoundingClientRect();
      const boxW = 300, boxH = 160;
      let left = Math.min(r.right + 16, window.innerWidth - boxW - 16);
      let top  = Math.min(r.top, window.innerHeight - boxH - 16);
      if (left < 0) left = 16;
      if (top < 0) top = 16;
      this._box.style.left = left + "px";
      this._box.style.top  = top + "px";
    }

    this._box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:.9rem;color:#f5c842">${step.title}</div>
        <div style="font-size:.68rem;color:#5a7499;font-weight:700">${this._cur + 1}/${total}</div>
      </div>
      <div style="font-size:.8rem;line-height:1.65;color:#8faab8;margin-bottom:14px">${step.body}</div>
      <div style="display:flex;gap:6px">
        ${this._cur > 0 ? `<button onclick="AT_TOUR._prev()" style="flex:1;padding:7px;border-radius:99px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:#8faab8;font-size:.75rem;font-weight:700;cursor:pointer">← Kembali</button>` : ""}
        <button onclick="AT_TOUR._next()" style="flex:2;padding:7px;border-radius:99px;background:#f5c842;border:none;color:#0a0e18;font-size:.78rem;font-weight:800;cursor:pointer">
          ${this._cur < total - 1 ? "Lanjut →" : "Selesai ✅"}
        </button>
        <button onclick="AT_TOUR.end()" style="padding:7px 10px;border-radius:99px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:#5a7499;font-size:.75rem;cursor:pointer">Lewati</button>
      </div>
      <div style="display:flex;gap:4px;margin-top:10px;justify-content:center">
        ${Array.from({length:total},(_,i)=>
          `<div style="width:${i===this._cur?'18':'6'}px;height:5px;border-radius:99px;background:${i===this._cur?'#f5c842':'rgba(255,255,255,.12)'};transition:all .3s"></div>`
        ).join("")}
      </div>
    `;
  },

  _next() { if (this._cur < this._steps.length - 1) { this._cur++; this._render(); } else this.end(); },
  _prev() { if (this._cur > 0) { this._cur--; this._render(); } },

  end() {
    this._overlay?.remove(); this._box?.remove();
    this._overlay = null; this._box = null;
    localStorage.setItem("at_tour_done", "1");
    AT_UTIL.toast("✅ Tour selesai! Mulai buat media kamu.");
  },

  maybeStart() {
    if (!localStorage.getItem("at_tour_done")) {
      setTimeout(() => this.start(), 1200);
    }
  }
};

/* ── KEYBOARD SHORTCUTS OVERLAY ──────────────────────────────── */
window.AT_SHORTCUTS = {
  _visible: false,

  show() {
    if (this._visible) return;
    this._visible = true;
    const el = document.createElement("div");
    el.id = "at-shortcut-overlay";
    el.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);
      z-index:900;display:flex;align-items:center;justify-content:center;
      animation:atFadeIn .2s ease;
    `;
    el.innerHTML = `
      <div style="background:#141c2e;border:1px solid rgba(255,255,255,.1);border-radius:20px;
        padding:28px;max-width:460px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,.7)">
        <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1rem;color:#f5c842;margin-bottom:16px">
          ⌨️ Keyboard Shortcuts
        </div>
        ${[
          ["Ctrl / ⌘ + S", "Simpan semua"],
          ["Ctrl / ⌘ + P", "Preview media"],
          ["Ctrl / ⌘ + /", "Tampilkan shortcut ini"],
          ["Escape",        "Tutup overlay / modal"],
          ["Tab",           "Pindah antar field"],
        ].map(([k, v]) => `
          <div style="display:flex;align-items:center;justify-content:space-between;
            padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:.82rem">
            <span style="color:#8faab8">${v}</span>
            <kbd style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.13);
              border-radius:6px;padding:3px 10px;font-size:.72rem;font-weight:700;color:#e2ecff;font-family:monospace">${k}</kbd>
          </div>`).join("")}
        <button onclick="AT_SHORTCUTS.hide()" style="width:100%;margin-top:16px;padding:9px;
          border-radius:99px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
          color:#8faab8;font-weight:700;font-size:.8rem;cursor:pointer">Tutup</button>
      </div>`;
    el.addEventListener("click", (e) => { if (e.target === el) this.hide(); });
    document.body.appendChild(el);
  },

  hide() {
    this._visible = false;
    document.getElementById("at-shortcut-overlay")?.remove();
  }
};

/* ── SKELETON LOADER ─────────────────────────────────────────── */
window.AT_SKELETON = {
  /**
   * show(containerId, rows)
   * Inserts skeleton placeholder rows into container
   */
  show(containerId, rows = 3) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = Array.from({ length: rows }, () => `
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
        border-radius:14px;padding:16px;margin-bottom:10px">
        <div class="at-shimmer" style="height:14px;width:60%;border-radius:7px;margin-bottom:10px"></div>
        <div class="at-shimmer" style="height:10px;width:90%;border-radius:5px;margin-bottom:6px"></div>
        <div class="at-shimmer" style="height:10px;width:75%;border-radius:5px"></div>
      </div>`).join("");
  },

  hide(containerId) {
    // Content replacement handled by the actual render
  }
};

/* ── NOTIFICATION CENTER ─────────────────────────────────────── */
window.AT_NOTIFY = {
  _queue: [],
  _showing: false,

  push(msg, type = "ok", duration = 3000) {
    this._queue.push({ msg, type, duration });
    if (!this._showing) this._flush();
  },

  _flush() {
    if (!this._queue.length) { this._showing = false; return; }
    this._showing = true;
    const { msg, type, duration } = this._queue.shift();
    AT_UTIL.toast(msg, type);
    setTimeout(() => this._flush(), duration + 300);
  }
};

/* ── DIRTY-STATE BEACON ──────────────────────────────────────── */
window.AT_DIRTY = {
  _warned: false,

  init() {
    window.addEventListener("beforeunload", (e) => {
      if (AT_STATE.dirty) {
        e.preventDefault();
        e.returnValue = "Ada perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?";
      }
    });
  }
};

/* ── FIELD VALIDATION HELPERS ────────────────────────────────── */
window.AT_VALIDATE = {
  /**
   * required(fieldId) → bool
   * Shakes field if empty, returns false
   */
  required(fieldId) {
    const el = document.getElementById(fieldId);
    if (!el) return true;
    const val = el.value?.trim();
    if (!val) {
      AT_ANIM.shake(el);
      el.style.borderColor = "var(--r)";
      el.style.boxShadow = "0 0 0 2px rgba(255,95,109,.2)";
      setTimeout(() => {
        el.style.borderColor = "";
        el.style.boxShadow = "";
      }, 1800);
      return false;
    }
    return true;
  },

  /**
   * Validate the whole state before export
   * Returns { ok: bool, errors: string[] }
   */
  exportCheck() {
    const errors = [];
    if (!AT_STATE.meta.judulPertemuan) errors.push("Judul pertemuan belum diisi (panel Identitas)");
    if (!AT_STATE.meta.kelas) errors.push("Kelas belum diisi (panel Identitas)");
    if (!AT_STATE.cp.capaianFase) errors.push("Capaian Pembelajaran belum diisi (panel CP)");
    if (!AT_STATE.tp.length) errors.push("Belum ada Tujuan Pembelajaran (panel TP)");
    if (!AT_STATE.atp.pertemuan.length) errors.push("Belum ada pertemuan di ATP");
    return { ok: errors.length === 0, errors };
  }
};

/* ── ENHANCED SAVE WITH VALIDATION ──────────────────────────── */
const _originalSaveAll = window.saveAll;
window.saveAll = function () {
  // Animate the save button
  const btn = document.getElementById("btnSave");
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = "⏳ Menyimpan…";
    btn.disabled = true;
    setTimeout(() => {
      _originalSaveAll();
      btn.textContent = "✅ Tersimpan!";
      AT_ANIM.pulse(btn);
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
      }, 1500);
    }, 300);
  } else {
    _originalSaveAll();
  }
};

/* ── PANEL TRANSITION HOOK ───────────────────────────────────── */
const _originalGo = AT_NAV.go.bind(AT_NAV);
AT_NAV.go = function (id) {
  _originalGo(id);
  // Animate newly active panel
  const panel = document.getElementById("p-" + id);
  if (panel) AT_ANIM.panelSlideIn(panel);

  // Animate dashboard stats on visit
  if (id === "dashboard") {
    AT_DASH.render();
    setTimeout(() => {
      const fill = document.getElementById("dashProgress");
      if (fill) AT_ANIM.progressBarAnimate(fill, AT_EDITOR.calcCompleteness());
    }, 150);
  }

  // Animate list items on visit
  const listContainers = { tp: "tp_list", kuis: "kuis_list", alur: "alur_list", atp: "atp_rows", skenario: "sk_list" };
  if (listContainers[id]) {
    setTimeout(() => {
      const items = document.querySelectorAll(`#${listContainers[id]} .list-item, #${listContainers[id]} .kuis-item`);
      items.forEach((item, i) => {
        item.style.opacity = "0";
        item.style.transform = "translateY(10px)";
        item.style.transition = `opacity .25s ease ${i * 60}ms, transform .25s ease ${i * 60}ms`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            item.style.opacity = "1";
            item.style.transform = "none";
          });
        });
      });
    }, 50);
  }
};

/* ── DRAG SORT INIT FOR PANELS ───────────────────────────────── */
window.AT_INIT_DRAG = function () {
  // module list
  AT_DRAG.init("mod_list", ".mod-card", function(order) {
    if (!AT_STATE.modules) return;
    var copy = AT_STATE.modules.slice();
    order.forEach(function(origIdx, newIdx) {
      if (origIdx < copy.length) AT_STATE.modules[newIdx] = copy[origIdx];
    });
    AT_EDITOR.markDirty();
    AT_UTIL.toast("↕️ Urutan modul diubah");
  });
  // game list
  AT_DRAG.init("game_list", ".mod-card", function(order) {
    if (!AT_STATE.games) return;
    var copy = AT_STATE.games.slice();
    order.forEach(function(origIdx, newIdx) {
      if (origIdx < copy.length) AT_STATE.games[newIdx] = copy[origIdx];
    });
    AT_EDITOR.markDirty();
    AT_UTIL.toast("↕️ Urutan game diubah");
  });
  // TP list
  AT_DRAG.init("tp_list", ".list-item", (order) => {
    const copy = [...AT_STATE.tp];
    order.forEach((origIdx, newIdx) => {
      if (origIdx < copy.length) AT_STATE.tp[newIdx] = copy[origIdx];
    });
    AT_EDITOR.markDirty();
    AT_UTIL.toast("↕️ Urutan TP diubah");
  });

  // Alur list
  AT_DRAG.init("alur_list", ".list-item", (order) => {
    const copy = [...AT_STATE.alur];
    order.forEach((origIdx, newIdx) => {
      if (origIdx < copy.length) AT_STATE.alur[newIdx] = copy[origIdx];
    });
    AT_EDITOR.markDirty();
    AT_UTIL.toast("↕️ Urutan Alur diubah");
  });

  // Kuis list
  AT_DRAG.init("kuis_list", ".kuis-item", (order) => {
    const copy = [...AT_STATE.kuis];
    order.forEach((origIdx, newIdx) => {
      if (origIdx < copy.length) AT_STATE.kuis[newIdx] = copy[origIdx];
    });
    AT_EDITOR.markDirty();
    AT_UTIL.toast("↕️ Urutan Soal diubah");
  });
};

/* ── ENHANCED IMPORT: Highlight fields after fill ───────────── */
const _originalParseFile = AT_IMPORT._parseFile?.bind(AT_IMPORT);
if (_originalParseFile) {
  AT_IMPORT._parseFile = function (...args) {
    _originalParseFile(...args);
    // After short delay, highlight filled inputs
    setTimeout(() => {
      ["m_judulPertemuan","m_kelas","m_mapel","cp_elemen","cp_capaianFase"].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value) AT_ANIM.highlight(el);
      });
      AT_ANIM.scoreFlash(6);
    }, 800);
  };
}

/* ── BUTTON RIPPLE — auto-attach ─────────────────────────────── */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn, .preset-card, .nav-item");
  if (btn) AT_ANIM.ripple(e, btn);
});

/* ── KEYBOARD SHORTCUTS ──────────────────────────────────────── */
document.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key === "/") { e.preventDefault(); AT_SHORTCUTS.show(); }
  if (mod && e.key === "p") { e.preventDefault(); AT_NAV.go("preview"); }
  if (e.key === "Escape") { AT_SHORTCUTS.hide(); }
});

/* ── INIT SEQUENCE ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  AT_DIRTY.init();

  // Re-init drag sort after each render (TP, Alur, Kuis, Modules, Games)
  const _origRenderTP = AT_TP.render.bind(AT_TP);
  AT_TP.render = function() { _origRenderTP(); setTimeout(AT_INIT_DRAG, 80); };

  const _origRenderAlur = AT_ALUR.render.bind(AT_ALUR);
  AT_ALUR.render = function() { _origRenderAlur(); setTimeout(AT_INIT_DRAG, 80); };

  const _origRenderKuis = AT_KUIS.render.bind(AT_KUIS);
  AT_KUIS.render = function() { _origRenderKuis(); setTimeout(AT_INIT_DRAG, 80); };

  const _origModRender = AT_MODULES.render.bind(AT_MODULES);
  AT_MODULES.render = function() { _origModRender(); setTimeout(AT_INIT_DRAG, 80); };

  if (typeof AT_GAMES !== "undefined") {
    const _origGameRender = AT_GAMES.render.bind(AT_GAMES);
    AT_GAMES.render = function() { _origGameRender(); setTimeout(AT_INIT_DRAG, 80); };
  }

  // Sidebar shortcut button
  const sb = document.querySelector(".sidebar-bottom");
  if (sb) {
    const shortcutBtn = document.createElement("button");
    shortcutBtn.className = "sidebar-bottom-btn";
    shortcutBtn.innerHTML = "⌨️ Keyboard Shortcuts";
    shortcutBtn.addEventListener("click", () => AT_SHORTCUTS.show());
    sb.appendChild(shortcutBtn);

    const tourBtn = document.createElement("button");
    tourBtn.className = "sidebar-bottom-btn";
    tourBtn.innerHTML = "🧭 Mulai Tour";
    tourBtn.addEventListener("click", () => { localStorage.removeItem("at_tour_done"); AT_TOUR.start(); });
    sb.appendChild(tourBtn);
  }

  // Maybe start onboarding tour for new users
  setTimeout(() => AT_TOUR.maybeStart(), 1500);

  // Initial drag init
  setTimeout(AT_INIT_DRAG, 500);
});

console.log("✅ animations.js loaded — AT_ANIM, AT_DRAG, AT_TOUR, AT_SHORTCUTS ready");
