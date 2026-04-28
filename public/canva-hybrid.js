// ═══════════════════════════════════════════════════════════════
// CANVA-HYBRID.JS — Canva-Hybrid System v2.0
// Authoring Tool v3 — Dual-Mode Pages, Asset Gallery,
// ATP Shortcut Dock, Drag-and-Drop Editor, Visual Customization,
// Template Presets (Gradient BG, Layout Templates, Color Themes)
// ═══════════════════════════════════════════════════════════════

(function () {
  "use strict";

  // ─────────────────────────────────────────────────────────────
  //  CONSTANTS
  // ─────────────────────────────────────────────────────────────

  const COLOR_PRESETS = [
    "#FF5F6D", "#F5C842", "#34D399", "#38D9D9",
    "#A78BFA", "#60A5FA", "#FB923C", "#FFFFFF"
  ];

  const OVERLAY_ELEMENT_TYPES = [
    { id: "navbar",  icon: " ",          label: "Navbar",       defaultLabel: "" },
    { id: "quiz-btn", icon: "\u{1F9EA}", label: "Tombol Kuis", defaultLabel: "Kuis" },
    { id: "nav-home", icon: "\u{1F3E0}", label: "Home",        defaultLabel: "Home" },
    { id: "nav-next", icon: "\u2192",     label: "Next",        defaultLabel: "Lanjut" },
    { id: "nav-back", icon: "\u2190",     label: "Back",        defaultLabel: "Kembali" },
    { id: "menu-btn", icon: "\u2630",     label: "Menu",        defaultLabel: "Menu" },
  ];

  const SIZE_MAP = {
    small:  { w: 44,  h: 44,  fs: ".75rem" },
    medium: { w: 64,  h: 64,  fs: ".88rem" },
    large:  { w: 88,  h: 88,  fs: "1rem"   },
  };

  const MAX_ASSET_SIZE   = 2 * 1024 * 1024;   // 2 MB per asset
  const WARN_TOTAL_SIZE  = 5 * 1024 * 1024;   // 5 MB total warning

  // ═══════════════════════════════════════════════════════════════
  //  PRESET SYSTEM — Gradient Backgrounds, Layout Templates,
  //  Color Themes for Canva-Hybrid
  // ═══════════════════════════════════════════════════════════════

  const GRADIENT_PRESETS = [
    // ── Educational / Clean ──
    { id: "edu-blue",     name: "Pendidikan Biru",    cat: "pendidikan",
      gradient: ["#0f2027","#203a43","#2c5364"], angle: 135, aspect: "16:9", badge: "\u{1F4DA}" },
    { id: "edu-teal",     name: "Akademik Teal",      cat: "pendidikan",
      gradient: ["#134e5e","#71b280"], angle: 135, aspect: "16:9", badge: "\u{1F393}" },
    { id: "edu-mint",     name: "Segar Mint",         cat: "pendidikan",
      gradient: ["#0b8793","#360033"], angle: 160, aspect: "9:16", badge: "\u{1F331}" },
    { id: "edu-navy",     name: "Navy Tegas",         cat: "pendidikan",
      gradient: ["#1a1a2e","#16213e","#0f3460"], angle: 180, aspect: "16:9", badge: "\u{1F30A}" },
    // ── Warm / Energetic ──
    { id: "warm-sunset",  name: "Senja Hangat",       cat: "energik",
      gradient: ["#f12711","#f5af19"], angle: 90, aspect: "16:9", badge: "\u{1F305}" },
    { id: "warm-coral",   name: "Koral Ceria",        cat: "energik",
      gradient: ["#ff9a9e","#fecfef"], angle: 135, aspect: "16:9", badge: "\u{1F338}" },
    { id: "warm-gold",    name: "Emas Klasik",        cat: "energik",
      gradient: ["#f7971e","#ffd200"], angle: 90, aspect: "4:3", badge: "\u{1F31F}" },
    { id: "warm-peach",   name: "Peach Lembut",       cat: "energik",
      gradient: ["#ee9ca7","#ffdde1"], angle: 120, aspect: "16:9", badge: "\u{1F351}" },
    // ── Cool / Professional ──
    { id: "cool-purple",  name: "Ungu Futuristik",    cat: "profesional",
      gradient: ["#667eea","#764ba2"], angle: 135, aspect: "16:9", badge: "\u{1F30C}" },
    { id: "cool-dark",    name: "Gelap Elegan",       cat: "profesional",
      gradient: ["#0c0c1d","#1a1a3e","#2d2d6b"], angle: 180, aspect: "16:9", badge: "\u{1F311}" },
    { id: "cool-slate",   name: "Slate Modern",       cat: "profesional",
      gradient: ["#2c3e50","#4ca1af"], angle: 135, aspect: "4:3", badge: "\u{1F4F0}" },
    { id: "cool-aurora",  name: "Aurora Borealis",    cat: "profesional",
      gradient: ["#00c6ff","#0072ff"], angle: 135, aspect: "9:16", badge: "\u{2728}" },
    // ── Fun / Playful ──
    { id: "fun-rainbow",  name: "Pelangi Fun",        cat: "fun",
      gradient: ["#fc466b","#3f5efb"], angle: 135, aspect: "16:9", badge: "\u{1F308}" },
    { id: "fun-grape",    name: "Anggur Manis",       cat: "fun",
      gradient: ["#8e2de2","#4a00e0"], angle: 135, aspect: "16:9", badge: "\u{1F347}" },
    { id: "fun-ocean",    name: "Lautan Dalam",       cat: "fun",
      gradient: ["#005c97","#363795"], angle: 135, aspect: "9:16", badge: "\u{1F41A}" },
    { id: "fun-candy",    name: "Permen Pastel",      cat: "fun",
      gradient: ["#a18cd1","#fbc2eb"], angle: 135, aspect: "16:9", badge: "\u{1F36C}" },
    // ── Minimal / Clean ──
    { id: "min-white",    name: "Putih Bersih",       cat: "minimal",
      gradient: ["#e0eafc","#cfdef3"], angle: 135, aspect: "16:9", badge: "\u{1F7E2}" },
    { id: "min-cream",    name: "Krim Hangat",        cat: "minimal",
      gradient: ["#fff1eb","#ace0f9"], angle: 135, aspect: "4:3", badge: "\u{1F3E3}" },
    { id: "min-gray",     name: "Abu Netral",         cat: "minimal",
      gradient: ["#2b5876","#4e4376"], angle: 135, aspect: "16:9", badge: "\u{2699}\uFE0F" },
    { id: "min-green",    name: "Hijau Alam",         cat: "minimal",
      gradient: ["#11998e","#38ef7d"], angle: 135, aspect: "16:9", badge: "\u{1F33F}" },
  ];

  const LAYOUT_PRESETS = [
    { id: "nav-basic",    name: "Navigasi Dasar",     icon: "\u{1F3A8}", desc: "Navbar + Home, Kembali, Lanjut — posisi standar",
      overlays: [
        { type:"navbar", x:0,  y:0,  label:"", shape:"pill", color:"#FFFFFF", opacity:100, size:"medium" },
        { type:"nav-home", x:8,  y:8,  icon:"\u{1F3E0}", label:"Home",    shape:"pill", color:"#FFFFFF", opacity:90, size:"small" },
        { type:"nav-back", x:22, y:92, icon:"\u2190",     label:"Kembali", shape:"pill", color:"#F5C842", opacity:95, size:"small" },
        { type:"nav-next", x:78, y:92, icon:"\u2192",     label:"Lanjut",  shape:"pill", color:"#F5C842", opacity:95, size:"small" },
      ]},
    { id: "nav-centered", name: "Tengah Simetris",    icon: "\u2795", desc: "Kembali + Lanjut di tengah bawah",
      overlays: [
        { type:"nav-home", x:50, y:5,  icon:"\u{1F3E0}", label:"Home",    shape:"pill", color:"#FFFFFF", opacity:85, size:"small" },
        { type:"nav-back", x:35, y:92, icon:"\u2190",     label:"Kembali", shape:"pill", color:"#38D9D9", opacity:95, size:"medium" },
        { type:"nav-next", x:65, y:92, icon:"\u2192",     label:"Lanjut",  shape:"pill", color:"#38D9D9", opacity:95, size:"medium" },
      ]},
    { id: "quiz-layout",  name: "Layout Kuis",        icon: "\u{1F9EA}", desc: "Navbar + Tombol Kuis besar di tengah + navigasi",
      overlays: [
        { type:"navbar", x:0,  y:0,  label:"", shape:"pill", color:"#FFFFFF", opacity:100, size:"medium" },
        { type:"quiz-btn", x:50, y:45, icon:"\u{1F9EA}", label:"Mulai Kuis", shape:"rounded", color:"#F5C842", opacity:100, size:"large", customW:140, customH:60, customFs:"1rem" },
        { type:"nav-back", x:25, y:92, icon:"\u2190",     label:"Kembali", shape:"pill", color:"#FFFFFF", opacity:90, size:"small" },
      ]},
    { id: "menu-corner",  name: "Menu Pojok",         icon: "\u2630", desc: "Menu di pojok kanan atas + navigasi bawah",
      overlays: [
        { type:"menu-btn", x:92, y:6,  icon:"\u2630",    label:"Menu",    shape:"rect", color:"#FFFFFF", opacity:90, size:"medium", customW:50, customH:40 },
        { type:"nav-back", x:22, y:92, icon:"\u2190",     label:"Kembali", shape:"pill", color:"#A78BFA", opacity:95, size:"small" },
        { type:"nav-next", x:78, y:92, icon:"\u2192",     label:"Lanjut",  shape:"pill", color:"#A78BFA", opacity:95, size:"small" },
      ]},
    { id: "game-play",    name: "Layout Game",         icon: "\u{1F3AE}", desc: "Navbar + Tombol Kuis + Home berjajar atas",
      overlays: [
        { type:"navbar", x:0,  y:0,  label:"", shape:"pill", color:"#FFFFFF", opacity:100, size:"medium" },
        { type:"nav-home", x:15, y:8,  icon:"\u{1F3E0}", label:"Home",    shape:"pill", color:"#FB923C", opacity:95, size:"small" },
        { type:"menu-btn", x:50, y:8,  icon:"\u2630",    label:"Menu",    shape:"pill", color:"#FB923C", opacity:95, size:"small" },
        { type:"quiz-btn", x:50, y:85, icon:"\u{1F9EA}", label:"Main!",   shape:"rounded", color:"#34D399", opacity:100, size:"large", customW:120, customH:52 },
        { type:"nav-back", x:85, y:8,  icon:"\u2190",     label:"Keluar",  shape:"pill", color:"#FF5F6D", opacity:95, size:"small" },
      ]},
    { id: "full-nav",     name: "Navigasi Penuh",      icon: "\u{1F5FA}", desc: "Navbar + semua tombol navigasi + kuis + menu",
      overlays: [
        { type:"navbar", x:0,  y:0, label:"", shape:"pill", color:"#FFFFFF", opacity:100, size:"medium" },
        { type:"nav-home", x:12, y:8, icon:"\u{1F3E0}", label:"Home",    shape:"pill", color:"#FFFFFF", opacity:90, size:"small" },
        { type:"menu-btn", x:88, y:8, icon:"\u2630",    label:"Menu",    shape:"pill", color:"#FFFFFF", opacity:90, size:"small" },
        { type:"quiz-btn", x:50, y:45, icon:"\u{1F9EA}", label:"Kuis",    shape:"rounded", color:"#F5C842", opacity:100, size:"large", customW:100, customH:50 },
        { type:"nav-back", x:25, y:92, icon:"\u2190",     label:"Kembali", shape:"pill", color:"#38D9D9", opacity:95, size:"small" },
        { type:"nav-next", x:75, y:92, icon:"\u2192",     label:"Lanjut",  shape:"pill", color:"#38D9D9", opacity:95, size:"small" },
      ]},
    { id: "empty-canvas", name: "Kanvas Kosong",       icon: "\u{1F3A8}", desc: "Tidak ada overlay — mulai dari nol",
      overlays: [] },
    { id: "hero-cover",   name: "Hero / Cover",        icon: "\u{1F3AC}", desc: "Tombol besar Mulai Belajar di tengah",
      overlays: [
        { type:"navbar", x:0,  y:0,  label:"", shape:"pill", color:"#FFFFFF", opacity:100, size:"medium" },
        { type:"quiz-btn", x:50, y:55, icon:"\u{1F680}", label:"Mulai Belajar", shape:"rounded", color:"#F5C842", opacity:100, size:"large", customW:180, customH:64, customFs:"1.1rem" },
        { type:"menu-btn", x:50, y:92, icon:"\u2630",    label:"Daftar Isi", shape:"pill", color:"#FFFFFF", opacity:85, size:"small" },
      ]},
  ];

  // ── FULL PRESETS (one-click = gradient + layout) ──
  const FULL_PRESETS = [
    { id: "cover-edu",     name: "Cover Pendidikan",   gradient: "edu-navy",    layout: "hero-cover" },
    { id: "cover-warm",    name: "Cover Hangat",        gradient: "warm-sunset",  layout: "hero-cover" },
    { id: "cover-dark",    name: "Cover Elegan",        gradient: "cool-dark",    layout: "hero-cover" },
    { id: "cover-pastel",  name: "Cover Pastel",        gradient: "fun-candy",    layout: "hero-cover" },
    { id: "cover-aurora",  name: "Cover Aurora",        gradient: "cool-aurora",  layout: "hero-cover" },
    { id: "materi-nav",    name: "Materi + Nav",        gradient: "edu-blue",     layout: "nav-basic" },
    { id: "materi-teal",   name: "Materi Teal",         gradient: "edu-teal",     layout: "nav-centered" },
    { id: "materi-green",  name: "Materi Hijau",        gradient: "min-green",    layout: "nav-basic" },
    { id: "kuis-navy",     name: "Kuis Navy",           gradient: "edu-navy",     layout: "quiz-layout" },
    { id: "kuis-purple",   name: "Kuis Ungu",           gradient: "cool-purple",  layout: "quiz-layout" },
    { id: "kuis-mint",     name: "Kuis Mint",           gradient: "edu-mint",     layout: "quiz-layout" },
    { id: "kuis-coral",    name: "Kuis Koral",          gradient: "warm-coral",   layout: "quiz-layout" },
    { id: "game-sunset",   name: "Game Senja",          gradient: "warm-gold",    layout: "game-play" },
    { id: "game-ocean",    name: "Game Lautan",         gradient: "fun-ocean",    layout: "game-play" },
    { id: "game-neon",     name: "Game Neon",           gradient: "fun-rainbow",  layout: "game-play" },
    { id: "all-nav",       name: "Semua Tombol",        gradient: "cool-slate",   layout: "full-nav" },
    { id: "menu-corner",   name: "Menu Pojok",          gradient: "warm-coral",   layout: "menu-corner" },
    { id: "blank-canvas",  name: "Kosong (Manual)",     gradient: null,          layout: "empty-canvas" },
  ];

  const COLOR_THEME_PRESETS = [
    { id: "tema-pkn",      name: "PPKn Klasik",   icon: "\u{1F3DB}", colors: ["#F5C842","#38D9D9","#A78BFA","#34D399","#FF5F6D"] },
    { id: "tema-warm",     name: "Hangat Cerah",   icon: "\u{1F31E}", colors: ["#FF6B6B","#FFA07A","#FFD93D","#6BCB77","#4D96FF"] },
    { id: "tema-cool",     name: "Dingin Tenang",  icon: "\u{1F30A}", colors: ["#0f3460","#16213e","#533483","#e94560","#1a1a2e"] },
    { id: "tema-nature",   name: "Alam Segar",     icon: "\u{1F333}", colors: ["#11998e","#38ef7d","#56ab2f","#a8e063","#f7ff00"] },
    { id: "tema-pastel",   name: "Pastel Lembut",  icon: "\u{1F308}", colors: ["#a18cd1","#fbc2eb","#fad0c4","#ff9a9e","#f6d365"] },
    { id: "tema-neon",     name: "Neon Kilat",     icon: "\u26A1",     colors: ["#00ff88","#00d4ff","#ff00ff","#ffff00","#ff3366"] },
    { id: "tema-earth",    name: "Bumi Alami",     icon: "\u{1F30D}", colors: ["#8B4513","#D2691E","#DEB887","#2E8B57","#4682B4"] },
    { id: "tema-monochrome", name:"Monokrom",       icon: "\u{1F3A8}", colors: ["#ffffff","#c0c0c0","#808080","#404040","#000000"] },
  ];

  // ═══════════════════════════════════════════════════════════════
  //  PHASE 2 — AT_CANVA_ASSETS  (Asset Gallery)
  // ═══════════════════════════════════════════════════════════════

  window.AT_CANVA_ASSETS = {
    _assets: [],

    /** Ensure state is initialized */
    _ensure() {
      if (!AT_STATE.canvaAssets) AT_STATE.canvaAssets = [];
      this._assets = AT_STATE.canvaAssets;
    },

    getAll() {
      this._ensure();
      return this._assets;
    },

    getById(id) {
      return this._assets.find(a => a.id === id) || null;
    },

    /** Upload image file, return asset object or null */
    upload(file) {
      if (!file) return null;
      if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
        AT_UTIL.toast("Format tidak didukung. Gunakan PNG/JPG/WebP.", "err");
        return null;
      }
      if (file.size > MAX_ASSET_SIZE) {
        AT_UTIL.toast("File terlalu besar (max 2 MB).", "err");
        return null;
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const img = new Image();
          img.onload = () => {
            const asset = {
              id: AT_UTIL.uid(),
              name: file.name.replace(/\.[^.]+$/, ""),
              dataUrl: dataUrl,
              width: img.width,
              height: img.height,
              aspectRatio: +(img.width / Math.max(1, img.height)).toFixed(3),
              thumbUrl: AT_CANVA._generateThumb(img, 200),
            };
            this._ensure();
            this._assets.push(asset);
            AT_EDITOR.markDirty();
            AT_UTIL.toast("\u2705 Asset \"" + asset.name + "\" diunggah");
            resolve(asset);
          };
          img.onerror = () => {
            AT_UTIL.toast("Gagal memuat gambar.", "err");
            resolve(null);
          };
          img.src = dataUrl;
        };
        reader.onerror = () => {
          AT_UTIL.toast("Gagal membaca file.", "err");
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    },

    remove(id) {
      this._ensure();
      const idx = this._assets.findIndex(a => a.id === id);
      if (idx < 0) return;
      const name = this._assets[idx].name;
      this._assets.splice(idx, 1);

      // Clean up any pages referencing this asset
      const cm = AT_STATE.canvaMode;
      if (cm && cm.pages) {
        Object.values(cm.pages).forEach(pg => {
          if (pg && pg.assetId === id) pg.assetId = null;
        });
      }

      AT_EDITOR.markDirty();
      AT_UTIL.toast("\u{1F5D1}\uFE0F Asset \"" + name + "\" dihapus");
    },

    /** Estimate total size in bytes */
    totalSize() {
      this._ensure();
      let total = 0;
      this._assets.forEach(a => {
        if (a.dataUrl) {
          // dataUrl = "data:<mime>;base64,<data>" → length * 0.75 ≈ bytes
          const comma = a.dataUrl.indexOf(",");
          if (comma >= 0) total += Math.round((a.dataUrl.length - comma - 1) * 0.75);
        }
      });
      return total;
    },

    /** Format bytes to human readable */
    formatBytes(b) {
      if (b < 1024) return b + " B";
      if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
      return (b / 1048576).toFixed(2) + " MB";
    },
  };

  // ═══════════════════════════════════════════════════════════════
  //  AT_CANVA_PRESETS — Preset Manager (Gradient BG + Layout + Theme)
  // ═══════════════════════════════════════════════════════════════

  window.AT_CANVA_PRESETS = {

    /** Generate gradient dataURL from preset using Canvas API */
    generateGradient(presetId) {
      const p = GRADIENT_PRESETS.find(g => g.id === presetId);
      if (!p) return null;

      try {
        // Parse aspect ratio to determine canvas dimensions
        const aspectParts = p.aspect.split(":");
        const arW = +(aspectParts[0] || 16);
        const arH = +(aspectParts[1] || 9);
        const w = 800;
        const h = Math.round(w * (arH / Math.max(1, arW)));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        // Calculate gradient line from angle
        const angleRad = (p.angle || 135) * Math.PI / 180;
        const cx = w / 2;
        const cy = h / 2;
        const len = Math.sqrt(w * w + h * h) / 2;
        const x1 = cx - Math.cos(angleRad) * len;
        const y1 = cy - Math.sin(angleRad) * len;
        const x2 = cx + Math.cos(angleRad) * len;
        const y2 = cy + Math.sin(angleRad) * len;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        const colors = p.gradient;
        colors.forEach((c, i) => {
          grad.addColorStop(i / Math.max(1, colors.length - 1), c);
        });

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Optional: add subtle noise texture for richness
        ctx.globalAlpha = 0.03;
        for (let i = 0; i < 3000; i++) {
          const nx = Math.random() * w;
          const ny = Math.random() * h;
          ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
          ctx.fillRect(nx, ny, 1, 1);
        }
        ctx.globalAlpha = 1;

        return canvas.toDataURL("image/png");
      } catch (e) {
        console.warn("Gradient generation failed:", e);
        return null;
      }
    },

    /** Generate thumbnail for gradient preset */
    _gradientThumb(presetId) {
      const p = GRADIENT_PRESETS.find(g => g.id === presetId);
      if (!p) return "";
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 120;
        const ctx = canvas.getContext("2d");
        const angleRad = (p.angle || 135) * Math.PI / 180;
        const len = Math.sqrt(200 * 200 + 120 * 120) / 2;
        const cx = 100, cy = 60;
        const grad = ctx.createLinearGradient(
          cx - Math.cos(angleRad) * len, cy - Math.sin(angleRad) * len,
          cx + Math.cos(angleRad) * len, cy + Math.sin(angleRad) * len
        );
        p.gradient.forEach((c, i) => grad.addColorStop(i / Math.max(1, p.gradient.length - 1), c));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 200, 120);
        return canvas.toDataURL("image/jpeg", 0.8);
      } catch (e) { return ""; }
    },

    /** Apply gradient as asset and set it for a page */
    applyGradient(pageId, presetId) {
      const dataUrl = this.generateGradient(presetId);
      if (!dataUrl) { AT_UTIL.toast("Gagal generate gradient", "err"); return; }

      const preset = GRADIENT_PRESETS.find(g => g.id === presetId);
      const aspectParts = (preset && preset.aspect.split(":")) || ["16","9"];
      const arW = +(aspectParts[0] || 16);
      const arH = +(aspectParts[1] || 9);

      const asset = {
        id: AT_UTIL.uid(),
        name: "Gradient: " + (preset ? preset.name : presetId),
        dataUrl: dataUrl,
        width: 800,
        height: Math.round(800 * (arH / Math.max(1, arW))),
        aspectRatio: +(arW / Math.max(1, arH)).toFixed(3),
        thumbUrl: this._gradientThumb(presetId),
        _preset: true,
      };

      AT_CANVA_ASSETS._ensure();
      AT_CANVA_ASSETS._assets.push(asset);

      // Set as background for page
      if (!AT_STATE.canvaMode) AT_STATE.canvaMode = { global: "generic", pages: {} };
      if (!AT_STATE.canvaMode.pages[pageId]) AT_STATE.canvaMode.pages[pageId] = {};
      AT_STATE.canvaMode.pages[pageId].assetId = asset.id;
      AT_STATE.canvaMode.pages[pageId]._mode = "canva";
      AT_STATE.canvaMode.pages[pageId].mode = "canva";

      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
      AT_CANVA._updateModeToggleUI();
      AT_UTIL.toast("\u{1F3A8} Gradient \"" + (preset ? preset.name : presetId) + "\" diterapkan");
    },

    /** Apply layout preset overlays to a page */
    applyLayout(pageId, layoutId) {
      const layout = LAYOUT_PRESETS.find(l => l.id === layoutId);
      if (!layout) return;

      // Deep clone overlays so edits don't mutate preset
      const overlays = JSON.parse(JSON.stringify(layout.overlays));

      // Set page to canva mode if not already
      if (!AT_STATE.canvaMode) AT_STATE.canvaMode = { global: "generic", pages: {} };
      if (!AT_STATE.canvaMode.pages[pageId]) AT_STATE.canvaMode.pages[pageId] = {};
      if (AT_CANVA.getMode(pageId) !== "canva") {
        AT_STATE.canvaMode.pages[pageId]._mode = "canva";
        AT_STATE.canvaMode.pages[pageId].mode = "canva";
        AT_CANVA._updateModeToggleUI();
      }

      // Set overlays
      if (!AT_STATE.canvaOverlays) AT_STATE.canvaOverlays = {};
      AT_STATE.canvaOverlays[pageId] = overlays;

      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
      // Update whichever panel is active
      if (document.getElementById('canvaPanelContent') && AT_NAV.current === 'canva') {
        AT_CANVA._renderCanvaPanel();
      } else {
        AT_CANVA.renderEditor(pageId);
      }
      AT_UTIL.toast("\u2705 Layout \"" + layout.name + "\" diterapkan (" + overlays.length + " elemen)");
    },

    /** Apply color theme to all overlay elements on a page */
    applyColorTheme(pageId, themeId) {
      const theme = COLOR_THEME_PRESETS.find(t => t.id === themeId);
      if (!theme) return;

      const overlays = AT_CANVA.getOverlays(pageId);
      if (!overlays.length) {
        AT_UTIL.toast("Tidak ada elemen overlay di halaman ini", "err");
        return;
      }

      overlays.forEach((el, i) => {
        const color = theme.colors[i % theme.colors.length];
        el.color = color;
      });

      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
      // Update whichever panel is active
      if (document.getElementById('canvaPanelContent') && AT_NAV.current === 'canva') {
        AT_CANVA._renderCanvaPanel();
      } else {
        AT_CANVA.renderEditor(pageId);
      }
      AT_UTIL.toast("\u{1F3A8} Tema \"" + theme.name + "\" diterapkan");
    },

    /** Quick-apply: gradient + layout in one click */
    applyFullPreset(pageId, gradientId, layoutId) {
      this.applyGradient(pageId, gradientId);
      setTimeout(() => {
        this.applyLayout(pageId, layoutId);
      }, 50);
    },

    /** Get all presets by category */
    getGradientsByCategory() {
      const cats = {};
      GRADIENT_PRESETS.forEach(g => {
        if (!cats[g.cat]) cats[g.cat] = [];
        cats[g.cat].push(g);
      });
      return cats;
    },

    getAllGradients() { return GRADIENT_PRESETS; },
    getAllLayouts() { return LAYOUT_PRESETS; },
    getAllThemes() { return COLOR_THEME_PRESETS; },
  };

  // ═══════════════════════════════════════════════════════════════
  //  PHASE 3 — AT_CANVA_DOCK  (ATP Shortcut Dock)
  // ═══════════════════════════════════════════════════════════════

  window.AT_CANVA_DOCK = {
    _active: -1,

    render() {
      const dock = document.getElementById("atpDock");
      if (!dock) return;

      const pertemuan = (AT_STATE.atp && AT_STATE.atp.pertemuan) || [];
      const tp = AT_STATE.tp || [];

      if (!pertemuan.length) {
        dock.innerHTML = "";
        dock.style.display = "none";
        return;
      }

      dock.style.display = "flex";

      const tpColors = ["var(--y)", "var(--c)", "var(--p)", "var(--g)", "var(--r)", "var(--o)", "var(--b)"];

      let html = "";
      pertemuan.forEach((p, i) => {
        const color = tpColors[i % tpColors.length];
        // Find related TPs for this pertemuan
        const relatedTPs = tp.filter(t => t.pertemuan === i + 1);
        const tpSubtitle = relatedTPs.length
          ? relatedTPs.map(t => (t.verb || "") + " " + (t.desc || "").slice(0, 30)).join("; ").slice(0, 60)
          : (p.tp || "").slice(0, 60);

        const isActive = this._active === i;
        html += "<div class=\"atp-dock-item" + (isActive ? " active" : "") + "\" "
          + "style=\"--dock-color:" + color + "\" "
          + "onclick=\"AT_CANVA_DOCK._navigateTo(" + i + ")\" "
          + "title=\"" + AT_CANVA._esc(p.judul || "Pertemuan " + (i + 1)) + "\">"
          + "<div class=\"atp-dock-badge\" style=\"background:" + color + "\">P" + (i + 1) + "</div>"
          + "<div class=\"atp-dock-info\">"
          + "<div class=\"atp-dock-title\">" + AT_CANVA._esc(p.judul || "Pertemuan " + (i + 1)) + "</div>"
          + "<div class=\"atp-dock-sub\">" + AT_CANVA._esc(tpSubtitle) + "</div>"
          + "</div>"
          + "</div>";
      });

      dock.innerHTML = html;
    },

    updateFromATP() {
      this.render();
    },

    /** Navigate editor and preview to a pertemuan */
    _navigateTo(idx) {
      this._active = idx;
      this.render();

      // Navigate to Dokumen panel and open ATP accordion
      AT_NAV.go("dokumen");
      setTimeout(() => {
        // Find and open the ATP accordion
        const accHeaders = document.querySelectorAll(".acc-header");
        accHeaders.forEach(header => {
          const titleEl = header.querySelector(".acc-title");
          if (titleEl && titleEl.textContent.trim() === "Alur Tujuan Pembelajaran") {
            const section = header.closest(".acc-section");
            if (section && !section.classList.contains("open")) {
              toggleAccordion(header);
            }
          }
        });

        // Scroll to the pertemuan row
        const row = document.getElementById("atp_row_" + idx);
        if (row) {
          row.scrollIntoView({ behavior: "smooth", block: "center" });
          row.style.background = "rgba(249,200,66,.08)";
          setTimeout(() => { row.style.background = ""; }, 1500);
        }
      }, 200);

      // Sync preview to document page
      if (AT_SPLITVIEW && AT_SPLITVIEW.active) {
        AT_SPLITVIEW.navigateToPage("scp", { tab: "katp" });
      }
    },
  };

  // ═══════════════════════════════════════════════════════════════
  //  PHASE 1+4+5 — AT_CANVA  (Main Controller)
  // ═══════════════════════════════════════════════════════════════

  window.AT_CANVA = {

    // ── Selected overlay element in editor ──
    _selectedOverlay: null,  // { pageId, idx }
    _dragState: null,        // pointer drag state

    // ───────────────────────────────────────────────────────────
    //  INIT
    // ───────────────────────────────────────────────────────────

    init() {
      // Ensure state
      if (!AT_STATE.canvaMode) {
        AT_STATE.canvaMode = { global: "generic", pages: {} };
      }
      if (!AT_STATE.canvaOverlays) {
        AT_STATE.canvaOverlays = {};
      }

      this._injectCSS();
      this._injectModals();
      this._injectDock();
      this._injectModeToggle();
      this._renderCanvaPanel();
      this._patchPreviewBuilder();
    },

    // ───────────────────────────────────────────────────────────
    //  MODE MANAGEMENT
    // ───────────────────────────────────────────────────────────

    toggleMode(pageId, mode) {
      if (!AT_STATE.canvaMode) AT_STATE.canvaMode = { global: "generic", pages: {} };
      if (!mode) {
        // Toggle
        const cur = this.getMode(pageId);
        mode = cur === "generic" ? "canva" : "generic";
      }
      AT_STATE.canvaMode.pages[pageId] = mode;
      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
      this._updateModeToggleUI();
      AT_UTIL.toast(mode === "canva" ? "\u{1F3A8} Canva mode aktif" : "\u{1F4DD} Generic mode aktif");
    },

    getMode(pageId) {
      if (!AT_STATE.canvaMode) return "generic";
      return AT_STATE.canvaMode.pages[pageId] || AT_STATE.canvaMode.global || "generic";
    },

    getAsset(pageId) {
      if (!AT_STATE.canvaMode || !AT_STATE.canvaMode.pages) return null;
      const pg = AT_STATE.canvaMode.pages[pageId];
      if (!pg || !pg.assetId) return null;
      return AT_CANVA_ASSETS.getById(pg.assetId);
    },

    /** Get the full page config for a page in Canva mode */
    getPageConfig(pageId) {
      if (!AT_STATE.canvaMode || !AT_STATE.canvaMode.pages) return null;
      const pg = AT_STATE.canvaMode.pages[pageId];
      if (!pg || this.getMode(pageId) !== "canva") return null;
      return pg;
    },

    getOverlays(pageId) {
      if (!AT_STATE.canvaOverlays) AT_STATE.canvaOverlays = {};
      return AT_STATE.canvaOverlays[pageId] || [];
    },

    addOverlay(pageId, element) {
      if (!AT_STATE.canvaOverlays) AT_STATE.canvaOverlays = {};
      if (!AT_STATE.canvaOverlays[pageId]) AT_STATE.canvaOverlays[pageId] = [];
      AT_STATE.canvaOverlays[pageId].push(element);
      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
    },

    removeOverlay(pageId, idx) {
      if (!AT_STATE.canvaOverlays || !AT_STATE.canvaOverlays[pageId]) return;
      AT_STATE.canvaOverlays[pageId].splice(idx, 1);
      this._selectedOverlay = null;
      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
      this.renderEditor();
    },

    updateOverlay(pageId, idx, props) {
      const overlays = this.getOverlays(pageId);
      if (!overlays[idx]) return;
      Object.assign(overlays[idx], props);
      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
    },

    // ───────────────────────────────────────────────────────────
    //  CSS INJECTION
    // ───────────────────────────────────────────────────────────

    _injectCSS() {
      if (document.getElementById("canvaHybridCSS")) return;
      const style = document.createElement("style");
      style.id = "canvaHybridCSS";
      style.textContent = /* css */ `
/* ── Canva Mode Toggle ── */
.canva-mode-toggle {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; margin: 0 0 12px 0;
  background: var(--card2, #1a2338); border: 1px solid var(--border, rgba(255,255,255,.1));
  border-radius: var(--rad-sm, 9px);
}
.canva-mode-toggle-label {
  font-size: .78rem; font-weight: 700; color: var(--muted);
  white-space: nowrap;
}
.canva-mode-toggle-switch {
  position: relative; width: 44px; height: 24px;
  background: rgba(255,255,255,.1); border-radius: 99px;
  cursor: pointer; transition: background .25s; flex-shrink: 0;
}
.canva-mode-toggle-switch.active { background: var(--y, #f5c842); }
.canva-mode-toggle-switch::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; transition: transform .25s;
  box-shadow: 0 1px 4px rgba(0,0,0,.3);
}
.canva-mode-toggle-switch.active::after { transform: translateX(20px); }
.canva-mode-badge {
  font-size: .68rem; font-weight: 800; padding: 2px 8px;
  border-radius: 99px; white-space: nowrap;
}
.canva-mode-badge.generic { background: rgba(56,217,217,.15); color: var(--c); }
.canva-mode-badge.canva { background: rgba(167,139,250,.15); color: var(--p); }
.canva-mode-page-select {
  flex: 1; background: rgba(255,255,255,.06); color: var(--text);
  border: 1px solid var(--border); border-radius: var(--rad-sm);
  padding: 5px 8px; font-size: .76rem; font-family: inherit;
  outline: none; cursor: pointer;
}
.canva-mode-page-select:focus { border-color: var(--y); }

/* ── ATP Dock ── */
#atpDock {
  display: none; position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 999; background: rgba(8,12,20,.95);
  backdrop-filter: blur(14px); border-top: 1px solid var(--border);
  padding: 8px 12px; gap: 8px; overflow-x: auto;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.15) transparent;
}
#atpDock::-webkit-scrollbar { height: 4px; }
#atpDock::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 99px; }
.atp-dock-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px; border-radius: var(--rad-sm);
  background: rgba(255,255,255,.04); border: 1px solid var(--border);
  cursor: pointer; transition: all .18s; flex-shrink: 0;
  min-width: 0; max-width: 200px;
}
.atp-dock-item:hover {
  background: rgba(255,255,255,.08); border-color: var(--dock-color, var(--y));
  transform: translateY(-1px);
}
.atp-dock-item.active {
  background: rgba(249,200,66,.08); border-color: var(--y);
  box-shadow: 0 0 12px rgba(249,200,66,.15);
}
.atp-dock-badge {
  font-size: .65rem; font-weight: 900; color: #0e1c2f;
  padding: 2px 6px; border-radius: 4px; flex-shrink: 0;
  letter-spacing: .03em;
}
.atp-dock-info { min-width: 0; overflow: hidden; }
.atp-dock-title {
  font-size: .72rem; font-weight: 700; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.atp-dock-sub {
  font-size: .62rem; color: var(--muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-top: 1px;
}

/* ── Canva Gallery Modal ── */
.canva-gallery-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px; margin-top: 12px;
}
.canva-gallery-card {
  position: relative; background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rad-sm); overflow: hidden; cursor: pointer;
  transition: all .18s;
}
.canva-gallery-card:hover { border-color: var(--y); transform: translateY(-2px); }
.canva-gallery-card.selected { border-color: var(--y); box-shadow: 0 0 0 2px rgba(249,200,66,.3); }
.canva-gallery-thumb {
  width: 100%; aspect-ratio: 16/10; object-fit: cover; display: block;
  background: var(--bg2);
}
.canva-gallery-info {
  padding: 6px 8px; font-size: .7rem; color: var(--muted); font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.canva-gallery-dims {
  font-size: .6rem; color: var(--muted); opacity: .7; padding: 0 8px 6px;
}
.canva-gallery-del {
  position: absolute; top: 4px; right: 4px;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,0,0,.7); color: #fff; border: none;
  font-size: .7rem; cursor: pointer; display: flex;
  align-items: center; justify-content: center; opacity: 0;
  transition: opacity .15s;
}
.canva-gallery-card:hover .canva-gallery-del { opacity: 1; }
.canva-gallery-upload-zone {
  border: 2px dashed var(--border); border-radius: var(--rad);
  padding: 28px; text-align: center; cursor: pointer;
  transition: all .2s; margin-bottom: 12px;
}
.canva-gallery-upload-zone:hover {
  border-color: var(--y); background: rgba(249,200,66,.04);
}

/* ── Canva Overlay Editor Panel ── */
.canva-editor-panel { padding: 0; }
.canva-canvas-wrap {
  position: relative; width: 100%; aspect-ratio: 9/16;
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: var(--rad-sm); overflow: hidden; margin-bottom: 12px;
  max-height: 420px;
}
.canva-canvas-bg {
  position: absolute; inset: 0; object-fit: contain;
  width: 100%; height: 100%; pointer-events: none;
}
.canva-canvas-bg.cover { object-fit: cover; }
.canva-overlay-el {
  position: absolute; cursor: grab; user-select: none;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-family: 'Nunito', sans-serif;
  transition: box-shadow .15s, transform .15s; touch-action: none;
  border: 1px solid rgba(255,255,255,.12);
  box-shadow: 0 2px 8px rgba(0,0,0,.25);
  backdrop-filter: blur(4px);
  text-shadow: 0 1px 2px rgba(0,0,0,.15);
  letter-spacing: .01em;
}
.canva-overlay-el:hover { box-shadow: 0 4px 16px rgba(0,0,0,.35); transform: translate(-50%,-50%) scale(1.06); }
.canva-overlay-el.selected { box-shadow: 0 0 0 3px var(--y), 0 0 16px rgba(249,200,66,.35); }
.canva-overlay-el.dragging { cursor: grabbing; opacity: .9; z-index: 10; }

/* ── Overlay Element Styling ── */
.canva-el-pill    { border-radius: 99px; }
.canva-el-rounded { border-radius: 14px; }
.canva-el-rect    { border-radius: 6px; }

/* ── Customization Panel ── */
.canva-custom-panel {
  background: var(--card2); border: 1px solid var(--border);
  border-radius: var(--rad-sm); padding: 12px; margin-top: 12px;
}
.canva-custom-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.canva-custom-label {
  font-size: .72rem; font-weight: 700; color: var(--muted);
  min-width: 65px; flex-shrink: 0;
}
.canva-custom-colors {
  display: flex; gap: 6px; flex-wrap: wrap;
}
.canva-color-swatch {
  width: 26px; height: 26px; border-radius: 50%; cursor: pointer;
  border: 2px solid transparent; transition: border .15s, transform .15s;
  flex-shrink: 0;
}
.canva-color-swatch:hover { transform: scale(1.15); }
.canva-color-swatch.active { border-color: #fff; transform: scale(1.15); }
.canva-color-input {
  width: 32px; height: 26px; border: 1px solid var(--border);
  border-radius: 6px; cursor: pointer; background: none; padding: 1px;
}
.canva-shape-btn {
  padding: 4px 10px; font-size: .68rem; font-weight: 700;
  background: rgba(255,255,255,.06); color: var(--muted);
  border: 1px solid var(--border); border-radius: 6px;
  cursor: pointer; transition: all .15s;
}
.canva-shape-btn:hover, .canva-shape-btn.active {
  background: rgba(255,255,255,.12); color: var(--text);
  border-color: var(--y);
}
.canva-size-btn {
  padding: 4px 10px; font-size: .68rem; font-weight: 700;
  background: rgba(255,255,255,.06); color: var(--muted);
  border: 1px solid var(--border); border-radius: 6px;
  cursor: pointer; transition: all .15s;
}
.canva-size-btn:hover, .canva-size-btn.active {
  background: rgba(255,255,255,.12); color: var(--text);
  border-color: var(--y);
}
.canva-opacity-slider {
  flex: 1; accent-color: var(--y);
}
.canva-opacity-val {
  font-size: .72rem; font-weight: 700; color: var(--text);
  min-width: 32px; text-align: right;
}
.canva-add-row {
  display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;
}
.canva-add-btn {
  padding: 6px 12px; font-size: .72rem; font-weight: 700;
  background: rgba(255,255,255,.06); color: var(--muted);
  border: 1px solid var(--border); border-radius: 8px;
  cursor: pointer; transition: all .15s;
}
.canva-add-btn:hover {
  background: rgba(249,200,66,.1); color: var(--y);
  border-color: var(--y); transform: translateY(-1px);
}
.canva-display-select {
  background: rgba(255,255,255,.06); color: var(--text);
  border: 1px solid var(--border); border-radius: 6px;
  padding: 5px 8px; font-size: .72rem; font-family: inherit;
  outline: none; cursor: pointer;
}
.canva-display-select:focus { border-color: var(--y); }

/* ── Canva Guide Banner ── */
.canva-guide-banner {
  background: linear-gradient(135deg, rgba(249,200,66,.08), rgba(167,139,250,.08));
  border: 1px solid rgba(249,200,66,.15);
  border-radius: var(--rad-sm, 9px);
  padding: 12px 16px; margin-bottom: 16px;
}
.canva-guide-title {
  font-size: .82rem; font-weight: 800; color: var(--y);
  margin-bottom: 8px;
}
.canva-guide-steps {
  display: flex; gap: 6px; flex-wrap: wrap;
}
.canva-guide-step {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 99px;
  font-size: .7rem; font-weight: 700; color: var(--muted);
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
}
.canva-guide-step.active {
  color: var(--y); border-color: rgba(249,200,66,.3);
  background: rgba(249,200,66,.08);
}
.canva-guide-step.done {
  color: var(--g); border-color: rgba(52,211,153,.3);
  background: rgba(52,211,153,.08);
}
.canva-guide-num {
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .6rem; font-weight: 900; flex-shrink: 0;
  background: rgba(255,255,255,.08); color: var(--muted);
}
.canva-guide-step.active .canva-guide-num { background: var(--y); color: #0e1c2f; }
.canva-guide-step.done .canva-guide-num { background: var(--g); color: #0e1c2f; }

/* ── Step Headers ── */
.canva-step-header {
  display: flex; align-items: center; gap: 8px;
  font-size: .88rem; font-weight: 800; color: var(--text);
}
.canva-step-badge {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .72rem; font-weight: 900; flex-shrink: 0;
  background: var(--y); color: #0e1c2f;
}

/* ── Background actions ── */
.canva-bg-actions {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 10px;
}
.canva-current-asset {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; background: rgba(255,255,255,.04);
  border: 1px solid var(--border); border-radius: var(--rad-sm);
}

/* ── Panel Toggle ── */
.canva-panel-toggle-wrap {
  display: flex; align-items: center; gap: 8px;
}

/* ── Responsive dock spacing ── */
body.has-atp-dock #main { padding-bottom: 72px; }
body.has-atp-dock #split-pane { padding-bottom: 72px; }

/* ── Empty state for gallery ── */
.canva-empty-state {
  text-align: center; padding: 32px 16px; color: var(--muted);
  font-size: .82rem;
}
.canva-empty-state-icon { font-size: 2.2rem; margin-bottom: 8px; }

/* ── Preset Browser ── */
.canva-preset-section {
  background: var(--card2, #1a2338); border: 1px solid var(--border);
  border-radius: var(--rad-sm); padding: 12px; margin-top: 16px;
}
.canva-preset-title {
  font-size: .82rem; font-weight: 800; color: var(--y);
  margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.canva-preset-tabs {
  display: flex; gap: 4px; margin-bottom: 12px;
  border-bottom: 1px solid var(--border); padding-bottom: 8px;
}
.canva-preset-tab {
  padding: 5px 12px; font-size: .7rem; font-weight: 700;
  background: none; color: var(--muted); border: none;
  cursor: pointer; border-radius: 6px 6px 0 0;
  transition: all .15s; border-bottom: 2px solid transparent;
}
.canva-preset-tab:hover { color: var(--text); background: rgba(255,255,255,.04); }
.canva-preset-tab.active {
  color: var(--y); border-bottom-color: var(--y);
  background: rgba(249,200,66,.06);
}
.canva-preset-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px; margin-bottom: 8px;
}
.canva-preset-card {
  position: relative; background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rad-sm); overflow: hidden; cursor: pointer;
  transition: all .18s;
}
.canva-preset-card:hover {
  border-color: var(--y); transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,.3);
}
.canva-preset-thumb {
  width: 100%; aspect-ratio: 5/3; display: block;
  background: var(--bg2);
}
.canva-preset-thumb img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.canva-preset-icon {
  width: 100%; aspect-ratio: 5/3; display: flex;
  align-items: center; justify-content: center;
  font-size: 1.8rem; background: rgba(255,255,255,.04);
  border-bottom: 1px solid var(--border);
}
.canva-preset-theme-swatches {
  display: flex; gap: 4px; justify-content: center;
  padding: 12px 8px; background: rgba(255,255,255,.03);
  border-bottom: 1px solid var(--border);
}
.canva-preset-info {
  padding: 5px 8px; font-size: .68rem; font-weight: 700; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.canva-preset-meta {
  padding: 0 8px 6px; font-size: .58rem; color: var(--muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Simplified Canva Panel ── */
.canva-top-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; margin-bottom: 12px;
  background: var(--card2, #1a2338); border: 1px solid var(--border);
  border-radius: var(--rad-sm, 9px); flex-wrap: wrap;
}
.canva-top-bar .field-select {
  flex: 1; min-width: 120px;
}
.canva-full-preset-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px; margin-top: 10px;
}
.canva-full-preset-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--rad-sm); overflow: hidden; cursor: pointer;
  transition: all .2s;
}
.canva-full-preset-card:hover {
  border-color: var(--y); transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,.3);
}
.canva-full-preset-card.active {
  border-color: var(--y); box-shadow: 0 0 0 2px rgba(249,200,66,.4);
}
.canva-full-preset-thumb {
  width: 100%; aspect-ratio: 9/10; display: block;
  background: var(--bg2);
}
.canva-full-preset-thumb img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.canva-full-preset-name {
  padding: 4px 6px; font-size: .6rem; font-weight: 700; color: var(--text);
  text-align: center; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; line-height: 1.3;
}
.canva-canvas-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
}

/* ── App-style overlay buttons (mirrors real app btn/navbar) ── */
.canva-app-btn {
  position: absolute; cursor: grab; user-select: none;
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  padding: 9px 20px; border-radius: 99px;
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: .85rem;
  border: none; transition: box-shadow .15s, opacity .15s; touch-action: none;
  text-shadow: none; backdrop-filter: none; letter-spacing: .01em;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
}
.canva-app-btn:hover { box-shadow: 0 6px 16px rgba(0,0,0,.35); }
.canva-app-btn.selected { box-shadow: 0 0 0 3px var(--y), 0 0 16px rgba(249,200,66,.4); }
.canva-app-btn.dragging { cursor: grabbing; opacity: .85; z-index: 10; }
.canva-app-btn.canva-el-rounded { border-radius: 14px; }
.canva-app-btn.canva-el-rect { border-radius: 6px; }

/* ── App-style navbar overlay ── */
.canva-app-navbar {
  position: absolute; top: 0; left: 0; right: 0;
  background: rgba(14,28,47,.96); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,.1);
  padding: 10px 16px; display: flex; align-items: center; gap: 10px;
  cursor: grab; user-select: none; touch-action: none; z-index: 5;
  height: 48px; box-sizing: border-box;
}
.canva-app-navbar .canva-nav-logo {
  font-family: 'Fredoka One', cursive; font-size: .85rem; color: var(--y, #f5c842);
  flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.canva-app-navbar .canva-nav-bar {
  width: 60px; height: 4px; background: rgba(255,255,255,.08);
  border-radius: 99px; overflow: hidden; flex-shrink: 0;
}
.canva-app-navbar .canva-nav-fill {
  height: 100%; width: 0%; background: linear-gradient(90deg, var(--y, #f5c842), var(--c, #38d9d9));
  border-radius: 99px;
}
.canva-app-navbar.selected {
  box-shadow: inset 0 0 0 2px var(--y), 0 0 12px rgba(249,200,66,.25);
}
.canva-app-navbar.dragging { cursor: grabbing; opacity: .85; z-index: 10; }

/* ── Element palette (add buttons) ── */
.canva-el-palette {
  display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; align-items: center;
}
.canva-el-palette-item {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 99px;
  font-family: 'Nunito', sans-serif; font-weight: 800; font-size: .72rem;
  border: none; cursor: pointer; transition: all .15s;
  box-shadow: 0 2px 6px rgba(0,0,0,.2);
}
.canva-el-palette-item:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.3); }
.canva-el-palette-sep {
  width: 1px; height: 24px; background: var(--border); margin: 0 4px; flex-shrink: 0;
}
`;
      document.head.appendChild(style);
    },

    // ───────────────────────────────────────────────────────────
    //  DOM INJECTION — Modals
    // ───────────────────────────────────────────────────────────

    _injectModals() {
      if (document.getElementById("canvaGalleryModal")) return;

      // Gallery Modal
      const galleryModal = document.createElement("div");
      galleryModal.className = "modal-overlay";
      galleryModal.id = "canvaGalleryModal";
      galleryModal.innerHTML = `
        <div class="modal-box" style="max-width:680px">
          <div class="modal-header">
            <div class="modal-title">\u{1F5BC}\uFE0F Galeri Asset Canva</div>
            <button class="icon-btn" onclick="document.getElementById('canvaGalleryModal').classList.remove('show')">\u2715</button>
          </div>
          <div class="modal-desc">Unggah gambar PNG/JPG sebagai background halaman. Max 2 MB per file, total 5 MB.</div>
          <div id="canvaGallerySize" style="font-size:.7rem;color:var(--muted);margin-bottom:8px"></div>
          <div class="canva-gallery-upload-zone" id="canvaUploadZone" onclick="document.getElementById('canvaFileInput').click()">
            <div style="font-size:1.6rem;margin-bottom:6px">\u{1F4E4}</div>
            <div style="font-size:.82rem;font-weight:700;color:var(--text)">Klik atau drag file gambar ke sini</div>
            <div style="font-size:.7rem;color:var(--muted);margin-top:3px">PNG / JPG / WebP \u2022 Max 2 MB</div>
          </div>
          <input type="file" id="canvaFileInput" accept="image/png,image/jpeg,image/webp" style="display:none">
          <div id="canvaGalleryGrid" class="canva-gallery-grid"></div>
        </div>
      `;
      document.body.appendChild(galleryModal);

      // Click overlay to close
      galleryModal.addEventListener("click", (e) => {
        if (e.target === galleryModal) galleryModal.classList.remove("show");
      });

      // File input change
      document.getElementById("canvaFileInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          AT_CANVA_ASSETS.upload(file).then(() => {
            this._renderGallery();
            this._updateModeToggleUI();
          });
        }
        e.target.value = "";
      });

      // Drag and drop on upload zone
      const zone = document.getElementById("canvaUploadZone");
      zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.style.borderColor = "var(--y)"; });
      zone.addEventListener("dragleave", () => { zone.style.borderColor = ""; });
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.style.borderColor = "";
        const file = e.dataTransfer.files[0];
        if (file) {
          AT_CANVA_ASSETS.upload(file).then(() => {
            this._renderGallery();
            this._updateModeToggleUI();
          });
        }
      });
    },

    // ───────────────────────────────────────────────────────────
    //  DOM INJECTION — Dock
    // ───────────────────────────────────────────────────────────

    _injectDock() {
      if (document.getElementById("atpDock")) return;
      const dock = document.createElement("div");
      dock.id = "atpDock";
      document.body.appendChild(dock);

      // Add body class when dock is visible
      const observer = new MutationObserver(() => {
        const hasItems = dock.children.length > 0;
        document.body.classList.toggle("has-atp-dock", hasItems);
      });
      observer.observe(dock, { childList: true });
    },

    // ───────────────────────────────────────────────────────────
    //  DOM INJECTION — Mode Toggle (inside Konten panel)
    // ───────────────────────────────────────────────────────────

    _injectModeToggle() {
      const kontenPanel = document.getElementById("p-konten");
      if (!kontenPanel || document.getElementById("canvaModeToggle")) return;

      // Insert after konten-tabs
      const tabs = kontenPanel.querySelector(".konten-tabs");
      if (!tabs) return;

      const toggleWrap = document.createElement("div");
      toggleWrap.id = "canvaModeToggle";
      toggleWrap.className = "canva-mode-toggle";
      toggleWrap.innerHTML = `
        <span class="canva-mode-toggle-label">Mode:</span>
        <select class="canva-mode-page-select" id="canvaPageSelect" onchange="AT_CANVA._updateModeToggleUI()">
          <option value="smat">Materi</option>
          <option value="scp">Dokumen</option>
          <option value="ssk">Skenario</option>
          <option value="skuis">Kuis</option>
        </select>
        <div class="canva-mode-toggle-switch" id="canvaModeSwitch" onclick="AT_CANVA._onToggleSwitch()"></div>
        <span class="canva-mode-badge generic" id="canvaModeBadge">Generic</span>
        <button class="btn btn-y btn-sm" style="margin-left:auto" onclick="AT_NAV.go('canva')" title="Buka Canva Editor">\u{1F3A8} Buka Editor</button>
      `;
      tabs.parentNode.insertBefore(toggleWrap, tabs.nextSibling);

      this._updateModeToggleUI();
    },

    _updateModeToggleUI() {
      const sw = document.getElementById("canvaModeSwitch");
      const badge = document.getElementById("canvaModeBadge");
      const select = document.getElementById("canvaPageSelect");
      if (!sw || !badge || !select) return;

      const pageId = select.value;
      const mode = this.getMode(pageId);
      const isCanva = mode === "canva";

      sw.classList.toggle("active", isCanva);
      badge.textContent = isCanva ? "Canva" : "Generic";
      badge.className = "canva-mode-badge " + mode;

      // Also refresh the Canva panel if visible
      if (AT_NAV.current === "canva") {
        this._renderCanvaPanel();
      }
    },

    _onToggleSwitch() {
      const select = document.getElementById("canvaPageSelect");
      const pageId = select ? select.value : "smat";
      this.toggleMode(pageId);
    },

    // ───────────────────────────────────────────────────────────
    //  DEDICATED CANVA PANEL (p-canva)
    // ───────────────────────────────────────────────────────────

    _currentPageId: "smat",
    _lastAppliedPreset: null,

    _applyFullPresetUI(pageId, presetId) {
      const preset = FULL_PRESETS.find(p => p.id === presetId);
      if (!preset) return;

      this._lastAppliedPreset = presetId;

      // Apply gradient if preset has one
      if (preset.gradient) {
        AT_CANVA_PRESETS.applyGradient(pageId, preset.gradient);
      }

      // Apply layout after a short delay (let gradient apply first)
      setTimeout(() => {
        AT_CANVA_PRESETS.applyLayout(pageId, preset.layout);
        // Re-render panel
        setTimeout(() => {
          this._renderCanvaPanel();
          const presetName = preset.name;
          AT_UTIL.toast("\u2705 Preset \"" + presetName + "\" diterapkan!");
        }, 80);
      }, 60);
    },

    _quickUpdateProp(pageId, idx, prop, value) {
      this.updateOverlay(pageId, idx, { [prop]: value });
      // Lightweight refresh - just re-render panel
      setTimeout(() => this._renderCanvaPanel(), 30);
    },

    _renderCanvaPanel() {
      const container = document.getElementById("canvaPanelContent");
      if (!container) return;

      const pageId = this._currentPageId;
      const mode = this.getMode(pageId);
      const isCanva = mode === "canva";
      const overlays = this.getOverlays(pageId);
      const asset = this.getAsset(pageId);
      let html = "";

      // ── TOP BAR: Page select + mode toggle ──
      html += "<div class=\"canva-top-bar\">";
      html += "<select class=\"field-select\" onchange=\"AT_CANVA._currentPageId=this.value;AT_CANVA._renderCanvaPanel()\">";
      const pageLabels = { smat: "Materi", scp: "Dokumen", ssk: "Skenario", skuis: "Kuis" };
      Object.keys(pageLabels).forEach(pid => {
        html += "<option value=\"" + pid + "\"" + (pageId === pid ? " selected" : "") + ">" + pageLabels[pid] + "</option>";
      });
      html += "</select>";
      html += "<div style=\"display:flex;align-items:center;gap:6px\">";
      html += "<span style=\"font-size:.68rem;font-weight:700;color:var(--c)\">Generic</span>";
      html += "<div class=\"canva-mode-toggle-switch" + (isCanva ? " active" : "") + "\" onclick=\"AT_CANVA.toggleMode('" + pageId + "');AT_CANVA._renderCanvaPanel()\"></div>";
      html += "<span style=\"font-size:.68rem;font-weight:700;color:var(--p)\">Canva</span>";
      html += "</div>";
      if (isCanva) {
        html += "<button class=\"btn btn-y btn-sm\" style=\"margin-left:auto;font-size:.68rem\" onclick=\"AT_CANVA._openGallery()\">\u{1F5BC} Upload BG</button>";
      }
      html += "</div>";

      // ── If not canva, show activate message ──
      if (!isCanva) {
        html += "<div class=\"at-card\" style=\"text-align:center;padding:40px 20px\">";
        html += "<div style=\"font-size:3rem;margin-bottom:12px\">\u{1F3A8}</div>";
        html += "<div style=\"font-size:.92rem;font-weight:700;color:var(--text);margin-bottom:6px\">Aktifkan Mode Canva</div>";
        html += "<div style=\"font-size:.78rem;color:var(--muted);line-height:1.6\">Nyalakan toggle di atas untuk mulai desain slide dengan<br>background gambar dan tombol interaktif dari app.</div>";
        html += "</div>";
        container.innerHTML = html;
        return;
      }

      // ── PRESET SIAP PAKAI (one-click = background + tombol app) ──
      html += "<div class=\"at-card\">";
      html += "<div class=\"canva-canvas-header\"><div class=\"at-card-title\">\u{26A1} Preset Siap Pakai</div>";
      html += "<div style=\"font-size:.66rem;color:var(--muted)\">Klik = background + elemen app jadi</div></div>";
      html += "<div class=\"canva-full-preset-grid\">";
      FULL_PRESETS.forEach(p => {
        const thumb = p.gradient ? AT_CANVA_PRESETS._gradientThumb(p.gradient) : "";
        const isActive = this._lastAppliedPreset === p.id;
        html += "<div class=\"canva-full-preset-card" + (isActive ? " active" : "") + "\" onclick=\"AT_CANVA._applyFullPresetUI('" + pageId + "','" + p.id + "')\">";
        if (thumb) {
          html += "<div class=\"canva-full-preset-thumb\"><img src=\"" + thumb + "\" alt=\"\" loading=\"lazy\"></div>";
        } else {
          html += "<div class=\"canva-full-preset-thumb\" style=\"display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:var(--muted)\">\u{1F3A8}</div>";
        }
        html += "<div class=\"canva-full-preset-name\">" + this._esc(p.name) + "</div>";
        html += "</div>";
      });
      html += "</div>";

      // Color theme quick row
      html += "<div style=\"margin-top:10px;display:flex;gap:4px;flex-wrap:wrap\">";
      COLOR_THEME_PRESETS.forEach(t => {
        const dots = t.colors.slice(0,3).map(c => "<span style=\"width:8px;height:8px;border-radius:50%;background:" + c + ";display:inline-block\"></span>").join("");
        html += "<div style=\"display:flex;align-items:center;gap:3px;padding:3px 8px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:99px;cursor:pointer;font-size:.58rem;font-weight:700;color:var(--muted);transition:all .15s\" "
          + "onclick=\"AT_CANVA_PRESETS.applyColorTheme('" + pageId + "','" + t.id + "');setTimeout(()=>AT_CANVA._renderCanvaPanel(),60)\" "
          + "onmouseover=\"this.style.borderColor='var(--y)'\" onmouseout=\"this.style.borderColor='var(--border)'\">"
          + dots + " " + this._esc(t.name) + "</div>";
      });
      html += "</div>";

      html += "</div>";

      // ── CANVAS with drag & drop ──
      const config = this.getPageConfig(pageId);
      const displayMode = (config && config.display) || "contain";
      const manualHeight = (config && config.manualHeight) || 600;

      html += "<div class=\"at-card\">";
      html += "<div class=\"canva-canvas-header\">";
      html += "<div class=\"at-card-title\">\u{1F4CB} Canvas</div>";
      if (asset) {
        html += "<div style=\"font-size:.66rem;color:var(--g)\">\u2705 " + overlays.length + " elemen \u2022 geser untuk atur posisi</div>";
      } else {
        html += "<div style=\"font-size:.66rem;color:var(--muted)\">Pilih preset atau upload background</div>";
      }
      html += "</div>";

      // Canvas wrapper
      html += "<div class=\"canva-canvas-wrap\" id=\"canvaPanelCanvasWrap\" style=\"";
      if (displayMode === "manual") html += "height:" + manualHeight + "px;aspect-ratio:auto;";
      html += "\">";

      if (asset) {
        html += "<img class=\"canva-canvas-bg " + (displayMode === "cover" ? "cover" : "") + "\" src=\"" + asset.dataUrl + "\" alt=\"bg\">";
      } else {
        html += "<div style=\"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.82rem;text-align:center;padding:20px\">\u{1F3A8}<br>Pilih preset atau upload background PNG</div>";
      }

      overlays.forEach((el, idx) => {
        html += this._renderOverlayElement(el, idx, pageId);
      });
      html += "</div>";

      // ── ELEMENT PALETTE: app-style buttons to add ──
      html += "<div style=\"font-size:.72rem;font-weight:700;color:var(--muted);margin-top:12px\">\u{1F4A1} Tambah Elemen (style app asli)</div>";
      html += "<div class=\"canva-el-palette\">";

      // Navbar
      html += "<div class=\"canva-el-palette-item\" style=\"background:rgba(14,28,47,.96);color:var(--y);font-family:'Fredoka One',cursive\" onclick=\"AT_CANVA._addOverlayElement('" + pageId + "','navbar');setTimeout(()=>AT_CANVA._renderCanvaPanel(),80)\" title=\"Navbar (bar atas seperti app)\">Navbar</div>";
      html += "<div class=\"canva-el-palette-sep\"></div>";

      // Buttons styled like real app buttons
      OVERLAY_ELEMENT_TYPES.forEach(t => {
        if (t.id === "navbar") return;
        const bg = t.id === "quiz-btn" ? "#F5C842" : t.id === "nav-home" ? "#FFFFFF" : t.id === "nav-next" ? "#F5C842" : t.id === "nav-back" ? "#F5C842" : t.id === "menu-btn" ? "#FFFFFF" : "#F5C842";
        const txt = this._getTextColor(bg);
        html += "<div class=\"canva-el-palette-item\" style=\"background:" + bg + ";color:" + txt + "\" onclick=\"AT_CANVA._addOverlayElement('" + pageId + "','" + t.id + "');setTimeout(()=>AT_CANVA._renderCanvaPanel(),80)\" title=\"" + this._esc(t.label) + "\">" + t.icon + " " + t.label + "</div>";
      });

      if (overlays.length > 0) {
        html += "<div class=\"canva-el-palette-sep\"></div>";
        html += "<div class=\"canva-el-palette-item\" style=\"background:rgba(255,107,107,.15);color:var(--r);margin-left:auto\" onclick=\"AT_STATE.canvaOverlays['" + pageId + "']=[];AT_CANVA._selectedOverlay=null;AT_EDITOR.markDirty();AT_CANVA._renderCanvaPanel();AT_UTIL.toast('Semua elemen dihapus')\">\u{1F5D1} Kosongkan</div>";
      }

      html += "</div>";

      // ── SELECTED ELEMENT QUICK EDIT ──
      if (this._selectedOverlay && this._selectedOverlay.pageId === pageId) {
        const selEl = overlays[this._selectedOverlay.idx];
        if (selEl) {
          const idx = this._selectedOverlay.idx;
          const isNavbar = selEl.type === "navbar";

          html += "<div class=\"canva-custom-panel\" style=\"margin-top:12px\">";
          html += "<div style=\"font-size:.76rem;font-weight:800;color:var(--y);margin-bottom:8px\">\u{1F527} Edit: " + this._esc(selEl.type === "navbar" ? "Navbar" : (selEl.label || selEl.type)) + "</div>";

          // Label
          html += "<div class=\"canva-custom-row\">";
          html += "<span class=\"canva-custom-label\">" + (isNavbar ? "Judul" : "Label") + "</span>";
          html += "<input class=\"field-input\" value=\"" + this._esc(selEl.label || "") + "\" oninput=\"AT_CANVA._quickUpdateProp('" + pageId + "'," + idx + ",'label',this.value)\" style=\"flex:1\">";
          if (!isNavbar) {
            html += "<span class=\"canva-custom-label\" style=\"min-width:auto\">Icon</span>";
            html += "<input class=\"field-input\" value=\"" + this._esc(selEl.icon || "") + "\" maxlength=\"4\" oninput=\"AT_CANVA._quickUpdateProp('" + pageId + "'," + idx + ",'icon',this.value)\" style=\"width:50px\">";
          }
          html += "</div>";

          if (!isNavbar) {
            // Color row
            html += "<div class=\"canva-custom-row\">";
            html += "<span class=\"canva-custom-label\">Warna</span>";
            html += "<div class=\"canva-custom-colors\">";
            COLOR_PRESETS.forEach(c => {
              const active = (selEl.color || "#F5C842").toUpperCase() === c.toUpperCase();
              html += "<div class=\"canva-color-swatch" + (active ? " active" : "") + "\" style=\"background:" + c + ";border-color:" + (active ? "#fff" : c + "44") + "\" onclick=\"AT_CANVA._quickUpdateProp('" + pageId + "'," + idx + ",'color','" + c + "')\"></div>";
            });
            html += "<input class=\"canva-color-input\" type=\"color\" value=\"" + (selEl.color || "#F5C842") + "\" onchange=\"AT_CANVA._quickUpdateProp('" + pageId + "'," + idx + ",'color',this.value)\">";
            html += "</div></div>";

            // Shape + Size row
            html += "<div class=\"canva-custom-row\">";
            html += "<span class=\"canva-custom-label\">Bentuk</span>";
            ["pill", "rounded", "rect"].forEach(s => {
              const active = (selEl.shape || "pill") === s;
              const label = s === "rect" ? "Kotak" : s === "rounded" ? "Rounded" : "Pill";
              html += "<button class=\"canva-shape-btn" + (active ? " active" : "") + "\" onclick=\"AT_CANVA._quickUpdateProp('" + pageId + "'," + idx + ",'shape','" + s + "')\">" + label + "</button>";
            });
            html += "<span style=\"margin-left:auto;font-size:.66rem;color:var(--muted)\">X:" + (selEl.x||50).toFixed(0) + " Y:" + (selEl.y||50).toFixed(0) + "</span>";
            html += "</div>";
          } else {
            html += "<div class=\"canva-custom-row\">";
            html += "<span class=\"canva-custom-label\">Posisi Y</span>";
            html += "<span style=\"font-size:.72rem;color:var(--text)\">Top: " + (selEl.y != null ? selEl.y : 0).toFixed(0) + "%</span>";
            html += "</div>";
          }

          // Delete
          html += "<div style=\"margin-top:8px\">";
          html += "<button class=\"btn btn-ghost btn-sm\" style=\"color:var(--r)\" onclick=\"AT_CANVA.removeOverlay('" + pageId + "'," + idx + ");AT_UTIL.toast('Elemen dihapus')\">\u{1F5D1} Hapus</button>";
          html += "</div>";
          html += "</div>";
        }
      }

      html += "</div>";

      container.innerHTML = html;

      // Init drag for canvas
      this._initOverlayDrag(pageId);
    },

    // ───────────────────────────────────────────────────────────
    //  GALLERY
    // ───────────────────────────────────────────────────────────

    _openGallery() {
      const modal = document.getElementById("canvaGalleryModal");
      if (!modal) return;
      this._renderGallery();
      modal.classList.add("show");
    },

    _renderGallery() {
      const grid = document.getElementById("canvaGalleryGrid");
      const sizeEl = document.getElementById("canvaGallerySize");
      if (!grid) return;

      const assets = AT_CANVA_ASSETS.getAll();
      const totalSize = AT_CANVA_ASSETS.totalSize();

      if (sizeEl) {
        const color = totalSize > WARN_TOTAL_SIZE ? "var(--r)" : "var(--muted)";
        sizeEl.innerHTML = "<span style=\"color:" + color + "\">" + AT_CANVA_ASSETS.formatBytes(totalSize) + "</span> total dari " + assets.length + " asset" + (totalSize > WARN_TOTAL_SIZE ? " \u26A0\uFE0F Mendekati batas!" : "");
      }

      if (!assets.length) {
        grid.innerHTML = "<div class=\"canva-empty-state\" style=\"grid-column:1/-1\"><div class=\"canva-empty-state-icon\">\u{1F4F7}</div>Belum ada asset. Unggah gambar pertama Anda.</div>";
        return;
      }

      const pageId = (document.getElementById("canvaPageSelect") || {}).value || "smat";
      const config = this.getPageConfig(pageId);

      grid.innerHTML = assets.map(a => {
        const selected = config && config.assetId === a.id;
        return "<div class=\"canva-gallery-card" + (selected ? " selected" : "") + "\" onclick=\"AT_CANVA._selectAsset('" + a.id + "')\">"
          + "<img class=\"canva-gallery-thumb\" src=\"" + a.thumbUrl + "\" alt=\"" + this._esc(a.name) + "\" loading=\"lazy\">"
          + "<div class=\"canva-gallery-info\">" + this._esc(a.name) + "</div>"
          + "<div class=\"canva-gallery-dims\">" + a.width + "\u00D7" + a.height + " \u2022 " + a.aspectRatio + "</div>"
          + "<button class=\"canva-gallery-del\" onclick=\"event.stopPropagation();AT_CANVA._deleteAsset('" + a.id + "')\" title=\"Hapus\">\u{1F5D1}\uFE0F</button>"
          + "</div>";
      }).join("");
    },

    _selectAsset(assetId) {
      const select = document.getElementById("canvaPageSelect");
      const pageId = select ? select.value : "smat";
      if (!AT_STATE.canvaMode) AT_STATE.canvaMode = { global: "generic", pages: {} };
      if (!AT_STATE.canvaMode.pages[pageId]) {
        AT_STATE.canvaMode.pages[pageId] = {};
      }
      AT_STATE.canvaMode.pages[pageId].assetId = assetId;
      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
      this._renderGallery();
      AT_UTIL.toast("\u2705 Asset dipilih untuk halaman");
    },

    _deleteAsset(assetId) {
      if (!confirm("Hapus asset ini?")) return;
      AT_CANVA_ASSETS.remove(assetId);
      this._renderGallery();
      this._updateModeToggleUI();
    },

    // ───────────────────────────────────────────────────────────
    //  OVERLAY EDITOR (Phase 4 + Phase 5)
    // ───────────────────────────────────────────────────────────

    _openOverlayEditor() {
      const select = document.getElementById("canvaPageSelect");
      const pageId = select ? select.value : "smat";
      this._showOverlayEditor(pageId);
    },

    _showOverlayEditor(pageId) {
      // Re-use modEditorModal or create a new panel
      const kontenPanel = document.getElementById("p-konten");
      let editorPanel = document.getElementById("canvaOverlayEditorPanel");

      if (editorPanel) {
        editorPanel.style.display = "block";
      } else {
        editorPanel = document.createElement("div");
        editorPanel.id = "canvaOverlayEditorPanel";
        editorPanel.style.cssText = "display:block;margin-top:16px;";
        kontenPanel.querySelector(".konten-tab-panel.active").appendChild(editorPanel);
      }

      this.renderEditor(pageId);
    },

    renderEditor(pageId) {
      const panel = document.getElementById("canvaOverlayEditorPanel");
      if (!panel) return;

      if (!pageId) {
        const select = document.getElementById("canvaPageSelect");
        pageId = select ? select.value : "smat";
      }

      const config = this.getPageConfig(pageId);
      const overlays = this.getOverlays(pageId);
      const asset = this.getAsset(pageId);
      const isCanva = this.getMode(pageId) === "canva";

      if (!isCanva) {
        panel.innerHTML = "<div class=\"at-card\" style=\"text-align:center;padding:20px;color:var(--muted)\">"
          + "<div style=\"font-size:1.4rem;margin-bottom:6px\">\u{1F3A8}</div>"
          + "Aktifkan Canva mode untuk halaman ini terlebih dahulu."
          + "</div>";
        return;
      }

      const displayMode = (config && config.display) || "contain";
      const manualHeight = (config && config.manualHeight) || 600;

      let html = "<div class=\"at-card canva-editor-panel\">";
      html += "<div class=\"at-card-title\" style=\"color:var(--p)\">\u{1F3A8} Canva Overlay Editor</div>";
      html += "<div style=\"font-size:.74rem;color:var(--muted);margin-bottom:10px\">Halaman: <strong style=\"color:var(--text)\">" + pageId + "</strong></div>";

      // Asset selector (inline)
      html += "<div class=\"field-row\" style=\"margin-bottom:10px\">";
      html += "<div class=\"field-group\">";
      html += "<label class=\"field-label\">Background Asset</label>";
      html += "<select class=\"field-select\" onchange=\"AT_CANVA._changePageAsset('" + pageId + "',this.value)\">";
      html += "<option value=\"\">-- Pilih Asset --</option>";
      AT_CANVA_ASSETS.getAll().forEach(a => {
        const sel = config && config.assetId === a.id ? " selected" : "";
        html += "<option value=\"" + a.id + "\"" + sel + ">" + this._esc(a.name) + " (" + a.width + "\u00D7" + a.height + ")</option>";
      });
      html += "</select></div>";
      html += "<div class=\"field-group\">";
      html += "<label class=\"field-label\">Tampilan</label>";
      html += "<select class=\"field-select\" onchange=\"AT_CANVA._changePageDisplay('" + pageId + "',this.value)\" style=\"width:auto\">";
      ["contain", "cover", "manual"].forEach(d => {
        html += "<option value=\"" + d + "\"" + (displayMode === d ? " selected" : "") + ">" + d + "</option>";
      });
      html += "</select></div>";
      if (displayMode === "manual") {
        html += "<div class=\"field-group\" style=\"flex:0 0 100px\">";
        html += "<label class=\"field-label\">Tinggi (px)</label>";
        html += "<input class=\"field-input\" type=\"number\" value=\"" + manualHeight + "\" min=\"200\" max=\"2000\" onchange=\"AT_CANVA._changeManualHeight('" + pageId + "',+this.value)\" style=\"width:80px\">";
        html += "</div>";
      }
      html += "</div>";

      // Canvas area
      html += "<div class=\"canva-canvas-wrap\" id=\"canvaCanvasWrap\" style=\"";
      if (displayMode === "manual") html += "height:" + manualHeight + "px;aspect-ratio:auto;";
      html += "\">";

      if (asset) {
        html += "<img class=\"canva-canvas-bg " + (displayMode === "cover" ? "cover" : "") + "\" src=\"" + asset.dataUrl + "\" alt=\"background\">";
      } else {
        html += "<div style=\"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:.82rem;text-align:center;padding:20px\">\u{1F4F7}<br>Pilih asset background</div>";
      }

      // Render overlay elements
      overlays.forEach((el, idx) => {
        html += this._renderOverlayElement(el, idx, pageId);
      });

      html += "</div>";

      // Add element buttons
      html += "<div style=\"font-size:.72rem;font-weight:700;color:var(--muted);margin-bottom:6px\">+ Tambah Elemen Overlay</div>";
      html += "<div class=\"canva-add-row\">";
      OVERLAY_ELEMENT_TYPES.forEach(t => {
        html += "<button class=\"canva-add-btn\" onclick=\"AT_CANVA._addOverlayElement('" + pageId + "','" + t.id + "')\">" + t.icon + " " + t.label + "</button>";
      });
      html += "</div>";

      // ── PRESET BROWSER ──
      html += this._renderPresetBrowser(pageId);

      // Customization panel for selected element
      if (this._selectedOverlay && this._selectedOverlay.pageId === pageId) {
        const selEl = overlays[this._selectedOverlay.idx];
        if (selEl) {
          html += this._renderCustomizationPanel(selEl, this._selectedOverlay.idx, pageId);
        }
      }

      html += "</div>";
      panel.innerHTML = html;

      // Initialize drag handlers for overlay elements
      this._initOverlayDrag(pageId);
    },

    _renderOverlayElement(el, idx, pageId) {
      const selectedClass = (this._selectedOverlay && this._selectedOverlay.pageId === pageId && this._selectedOverlay.idx === idx) ? " selected" : "";
      const navLabel = el.label || (AT_STATE.m && AT_STATE.m.namaBab) || "PPKn Kelas VII";

      // ── NAVBAR type: full-width top bar (like real app navbar) ──
      if (el.type === "navbar") {
        return "<div class=\"canva-app-navbar canva-overlay-el" + selectedClass + "\" "
          + "data-idx=\"" + idx + "\" data-page=\"" + pageId + "\" "
          + "style=\"left:0;top:" + (el.y != null ? el.y : 0) + "%;transform:none;\">"
          + "<div class=\"canva-nav-logo\">" + this._esc(navLabel) + "</div>"
          + "<div class=\"canva-nav-bar\"><div class=\"canva-nav-fill\"></div></div>"
          + "</div>";
      }

      // ── BUTTON types: styled like real app .btn ──
      const size = SIZE_MAP[el.size] || SIZE_MAP.medium;
      const shapeClass = el.shape === "rounded" ? " canva-el-rounded" : el.shape === "rect" ? " canva-el-rect" : "";
      const textColor = this._getTextColor(el.color || "#F5C842");
      const isLarge = el.size === "large" || el.customW > 80;
      const padH = isLarge ? 16 : 10;
      const padV = isLarge ? 10 : 7;
      const fs = el.customFs || (isLarge ? ".92rem" : size.fs);

      return "<div class=\"canva-app-btn" + shapeClass + selectedClass + "\" "
        + "data-idx=\"" + idx + "\" data-page=\"" + pageId + "\" "
        + "style=\""
        + "left:" + (el.x || 50) + "%;"
        + "top:" + (el.y || 50) + "%;"
        + "padding:" + padV + "px " + padH + "px;"
        + "font-size:" + fs + ";"
        + "background:" + (el.color || "#F5C842") + ";"
        + "color:" + textColor + ";"
        + "opacity:" + ((el.opacity != null ? el.opacity : 100) / 100) + ";"
        + "\">"
        + "<span>" + (el.icon || "") + "</span> <span>" + this._esc(el.label || "Btn") + "</span>"
        + "</div>";
    },

    _getTextColor(bg) {
      if (!bg) return "#0e1c2f";
      // Simple luminance check
      const hex = bg.replace("#", "");
      if (hex.length !== 6) return "#0e1c2f";
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum > 0.55 ? "#0e1c2f" : "#ffffff";
    },

    _renderCustomizationPanel(el, idx, pageId) {
      let html = "<div class=\"canva-custom-panel\">";
      html += "<div style=\"font-size:.76rem;font-weight:800;color:var(--y);margin-bottom:10px\">\u{1F527} Kustomisasi Elemen #" + (idx + 1) + "</div>";

      // Label
      html += "<div class=\"canva-custom-row\">";
      html += "<span class=\"canva-custom-label\">Label</span>";
      html += "<input class=\"field-input\" value=\"" + this._esc(el.label || "") + "\" oninput=\"AT_CANVA._updateOvProp('" + pageId + "'," + idx + ",'label',this.value)\" style=\"flex:1\">";
      html += "</div>";

      // Icon
      html += "<div class=\"canva-custom-row\">";
      html += "<span class=\"canva-custom-label\">Icon</span>";
      html += "<input class=\"field-input\" value=\"" + this._esc(el.icon || "") + "\" maxlength=\"4\" oninput=\"AT_CANVA._updateOvProp('" + pageId + "'," + idx + ",'icon',this.value)\" style=\"width:60px\">";
      html += "</div>";

      // Color
      html += "<div class=\"canva-custom-row\">";
      html += "<span class=\"canva-custom-label\">Warna</span>";
      html += "<div class=\"canva-custom-colors\">";
      COLOR_PRESETS.forEach(c => {
        const active = (el.color || "#F5C842").toUpperCase() === c.toUpperCase();
        html += "<div class=\"canva-color-swatch" + (active ? " active" : "") + "\" style=\"background:" + c + ";border-color:" + (active ? "#fff" : c + "44") + "\" onclick=\"AT_CANVA._updateOvProp('" + pageId + "'," + idx + ",'color','" + c + "');AT_CANVA.renderEditor('" + pageId + "')\"></div>";
      });
      html += "<input class=\"canva-color-input\" type=\"color\" value=\"" + (el.color || "#F5C842") + "\" onchange=\"AT_CANVA._updateOvProp('" + pageId + "'," + idx + ",'color',this.value);AT_CANVA.renderEditor('" + pageId + "')\">";
      html += "</div></div>";

      // Shape
      html += "<div class=\"canva-custom-row\">";
      html += "<span class=\"canva-custom-label\">Bentuk</span>";
      ["pill", "rounded", "rectangle"].forEach(s => {
        const active = (el.shape || "pill") === s;
        html += "<button class=\"canva-shape-btn" + (active ? " active" : "") + "\" onclick=\"AT_CANVA._updateOvProp('" + pageId + "'," + idx + ",'shape','" + s + "');AT_CANVA.renderEditor('" + pageId + "')\">" + s + "</button>";
      });
      html += "</div>";

      // Size
      html += "<div class=\"canva-custom-row\">";
      html += "<span class=\"canva-custom-label\">Ukuran</span>";
      ["small", "medium", "large"].forEach(s => {
        const active = (el.size || "medium") === s;
        html += "<button class=\"canva-size-btn" + (active ? " active" : "") + "\" onclick=\"AT_CANVA._updateOvProp('" + pageId + "'," + idx + ",'size','" + s + "');AT_CANVA.renderEditor('" + pageId + "')\">" + s + "</button>";
      });
      html += "</div>";

      // Custom size
      html += "<div class=\"canva-custom-row\">";
      html += "<span class=\"canva-custom-label\">Custom</span>";
      html += "<input class=\"field-input\" type=\"number\" value=\"" + (el.customW || 64) + "\" min=\"20\" max=\"300\" placeholder=\"W\" oninput=\"AT_CANVA._updateOvProp('" + pageId + "'," + idx + ",'customW',+this.value);AT_CANVA.renderEditor('" + pageId + "')\" style=\"width:60px\">";
      html += "<span style=\"color:var(--muted);font-size:.7rem\">\u00D7</span>";
      html += "<input class=\"field-input\" type=\"number\" value=\"" + (el.customH || 64) + "\" min=\"20\" max=\"300\" placeholder=\"H\" oninput=\"AT_CANVA._updateOvProp('" + pageId + "'," + idx + ",'customH',+this.value);AT_CANVA.renderEditor('" + pageId + "')\" style=\"width:60px\">";
      html += "<span style=\"color:var(--muted);font-size:.7rem\">px</span>";
      html += "</div>";

      // Opacity
      html += "<div class=\"canva-custom-row\">";
      html += "<span class=\"canva-custom-label\">Opacity</span>";
      html += "<input class=\"canva-opacity-slider\" type=\"range\" min=\"0\" max=\"100\" value=\"" + (el.opacity != null ? el.opacity : 100) + "\" oninput=\"AT_CANVA._updateOvProp('" + pageId + "'," + idx + ",'opacity',+this.value);AT_CANVA.renderEditor('" + pageId + "')\">";
      html += "<span class=\"canva-opacity-val\">" + (el.opacity != null ? el.opacity : 100) + "%</span>";
      html += "</div>";

      // Position (read-only display)
      html += "<div class=\"canva-custom-row\">";
      html += "<span class=\"canva-custom-label\">Posisi</span>";
      html += "<span style=\"font-size:.72rem;color:var(--text)\">X: " + (el.x || 50).toFixed(1) + "% &nbsp; Y: " + (el.y || 50).toFixed(1) + "%</span>";
      html += "</div>";

      // Delete
      html += "<div style=\"margin-top:10px\">";
      html += "<button class=\"btn btn-ghost btn-sm\" style=\"color:var(--r);border-color:var(--r)\" onclick=\"AT_CANVA.removeOverlay('" + pageId + "'," + idx + ");AT_UTIL.toast('Element dihapus')\">\u{1F5D1}\uFE0F Hapus Elemen</button>";
      html += "</div>";

      html += "</div>";
      return html;
    },

    // ── Overlay CRUD helpers ──

    // ───────────────────────────────────────────────────────────
    //  PRESET BROWSER UI
    // ───────────────────────────────────────────────────────────

    _renderPresetBrowser(pageId) {
      let html = "<div class=\"canva-preset-section\" style=\"margin-top:16px\">";
      html += "<div class=\"canva-preset-title\">\u{1F4C1} Template Preset</div>";

      // ── Tab switcher ──
      html += "<div class=\"canva-preset-tabs\">";
      html += "<button class=\"canva-preset-tab active\" onclick=\"AT_CANVA._switchPresetTab(this,'gradients')\">\u{1F3A8} Background</button>";
      html += "<button class=\"canva-preset-tab\" onclick=\"AT_CANVA._switchPresetTab(this,'layouts')\">\u{1F3AF} Layout</button>";
      html += "<button class=\"canva-preset-tab\" onclick=\"AT_CANVA._switchPresetTab(this,'themes')\">\u{1F30A} Tema Warna</button>";
      html += "</div>";

      // ── Gradient presets panel ──
      html += "<div class=\"canva-preset-panel\" id=\"presetPanelGradients\">";
      const cats = AT_CANVA_PRESETS.getGradientsByCategory();
      const catLabels = { pendidikan: "\u{1F393} Pendidikan", energik: "\u{1F525} Energik", profesional: "\u{1F4BC} Profesional", fun: "\u{1F389} Fun", minimal: "\u2795 Minimal" };
      Object.keys(cats).forEach(cat => {
        html += "<div style=\"font-size:.7rem;font-weight:700;color:var(--muted);margin:10px 0 6px;text-transform:uppercase;letter-spacing:.05em\">" + (catLabels[cat] || cat) + "</div>";
        html += "<div class=\"canva-preset-grid\">";
        cats[cat].forEach(g => {
          const thumb = AT_CANVA_PRESETS._gradientThumb(g.id);
          html += "<div class=\"canva-preset-card\" onclick=\"AT_CANVA_PRESETS.applyGradient('" + pageId + "','" + g.id + "');AT_CANVA.renderEditor('" + pageId + "')\" title=\"" + this._esc(g.name) + " (" + g.aspect + ")\">"
            + "<div class=\"canva-preset-thumb\"><img src=\"" + thumb + "\" alt=\"\" loading=\"lazy\"></div>"
            + "<div class=\"canva-preset-info\">" + g.badge + " " + this._esc(g.name) + "</div>"
            + "<div class=\"canva-preset-meta\">" + g.aspect + " \u2022 " + g.gradient.length + " warna</div>"
            + "</div>";
        });
        html += "</div>";
      });
      html += "</div>";

      // ── Layout presets panel ──
      html += "<div class=\"canva-preset-panel\" id=\"presetPanelLayouts\" style=\"display:none\">";
      html += "<div class=\"canva-preset-grid\">";
      LAYOUT_PRESETS.forEach(l => {
        const count = l.overlays.length;
        html += "<div class=\"canva-preset-card canva-preset-layout\" onclick=\"AT_CANVA_PRESETS.applyLayout('" + pageId + "','" + l.id + "')\" title=\"" + this._esc(l.desc) + "\">"
          + "<div class=\"canva-preset-icon\">" + l.icon + "</div>"
          + "<div class=\"canva-preset-info\">" + this._esc(l.name) + "</div>"
          + "<div class=\"canva-preset-meta\">" + this._esc(l.desc) + " (" + count + " elemen)</div>"
          + "</div>";
      });
      html += "</div>";
      html += "</div>";

      // ── Color theme presets panel ──
      html += "<div class=\"canva-preset-panel\" id=\"presetPanelThemes\" style=\"display:none\">";
      html += "<div class=\"canva-preset-grid\">";
      COLOR_THEME_PRESETS.forEach(t => {
        const swatches = t.colors.map(c => "<div style=\"width:16px;height:16px;border-radius:50%;background:" + c + ";border:1px solid rgba(255,255,255,.15)\"></div>").join("");
        html += "<div class=\"canva-preset-card canva-preset-theme\" onclick=\"AT_CANVA_PRESETS.applyColorTheme('" + pageId + "','" + t.id + "')\" title=\"" + this._esc(t.name) + "\">"
          + "<div class=\"canva-preset-theme-swatches\">" + swatches + "</div>"
          + "<div class=\"canva-preset-info\">" + t.icon + " " + this._esc(t.name) + "</div>"
          + "<div class=\"canva-preset-meta\">" + t.colors.length + " warna</div>"
          + "</div>";
      });
      html += "</div>";
      html += "</div>";

      html += "</div>";
      return html;
    },

    _switchPresetTab(btn, tabId) {
      const tabs = btn.parentElement.querySelectorAll(".canva-preset-tab");
      tabs.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");

      const section = btn.closest(".canva-preset-section");
      if (!section) return;
      section.querySelectorAll(".canva-preset-panel").forEach(p => p.style.display = "none");

      const map = { gradients: "Gradients", layouts: "Layouts", themes: "Themes" };
      const target = document.getElementById("presetPanel" + map[tabId]);
      if (target) target.style.display = "block";
    },

    // ── Overlay CRUD helpers ──

    _addOverlayElement(pageId, typeId) {
      const typeDef = OVERLAY_ELEMENT_TYPES.find(t => t.id === typeId);
      if (!typeDef) return;

      // Navbar: special defaults (full-width top bar)
      if (typeId === "navbar") {
        const navLabel = (AT_STATE.m && AT_STATE.m.namaBab) || "";
        const element = {
          type: "navbar",
          x: 0,
          y: 0,
          label: navLabel,
          icon: "",
          opacity: 100,
        };
        this.addOverlay(pageId, element);
        this._selectedOverlay = { pageId, idx: this.getOverlays(pageId).length - 1 };
        this._renderCanvaPanel();
        AT_UTIL.toast("\u2705 Navbar ditambahkan");
        return;
      }

      const element = {
        type: typeId,
        x: 50,
        y: 50,
        label: typeDef.defaultLabel,
        shape: "pill",
        color: "#F5C842",
        opacity: 100,
        size: "medium",
        icon: typeDef.icon,
        customW: SIZE_MAP.medium.w,
        customH: SIZE_MAP.medium.h,
        customFs: SIZE_MAP.medium.fs,
      };
      this.addOverlay(pageId, element);
      this._selectedOverlay = { pageId, idx: this.getOverlays(pageId).length - 1 };
      this._renderCanvaPanel();
      AT_UTIL.toast("\u2705 Elemen \"" + typeDef.label + "\" ditambahkan");
    },

    _updateOvProp(pageId, idx, key, value) {
      this.updateOverlay(pageId, idx, { [key]: value });
    },

    _changePageAsset(pageId, assetId) {
      if (!AT_STATE.canvaMode) AT_STATE.canvaMode = { global: "generic", pages: {} };
      if (!AT_STATE.canvaMode.pages[pageId]) AT_STATE.canvaMode.pages[pageId] = {};
      AT_STATE.canvaMode.pages[pageId].assetId = assetId || null;
      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
      this.renderEditor(pageId);
    },

    _changePageDisplay(pageId, mode) {
      if (!AT_STATE.canvaMode) AT_STATE.canvaMode = { global: "generic", pages: {} };
      if (!AT_STATE.canvaMode.pages[pageId]) AT_STATE.canvaMode.pages[pageId] = {};
      AT_STATE.canvaMode.pages[pageId].display = mode;
      AT_EDITOR.markDirty();
      AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
      this.renderEditor(pageId);
    },

    _changeManualHeight(pageId, h) {
      if (!AT_STATE.canvaMode) AT_STATE.canvaMode = { global: "generic", pages: {} };
      if (!AT_STATE.canvaMode.pages[pageId]) AT_STATE.canvaMode.pages[pageId] = {};
      AT_STATE.canvaMode.pages[pageId].manualHeight = Math.max(200, Math.min(2000, h));
      AT_EDITOR.markDirty();
      this.renderEditor(pageId);
    },

    // ───────────────────────────────────────────────────────────
    //  DRAG SYSTEM (Pointer Events)
    // ───────────────────────────────────────────────────────────

    _initOverlayDrag(pageId) {
      // Try both canvas IDs (panel canvas and overlay editor canvas)
      const canvas = document.getElementById("canvaPanelCanvasWrap") || document.getElementById("canvaCanvasWrap");
      if (!canvas) return;

      // Remove old listeners by cloning
      const newCanvas = canvas.cloneNode(true);
      canvas.parentNode.replaceChild(newCanvas, canvas);

      newCanvas.addEventListener("pointerdown", (e) => {
        const el = e.target.closest(".canva-overlay-el, .canva-app-btn, .canva-app-navbar");
        if (!el) {
          this._selectedOverlay = null;
          newCanvas.querySelectorAll(".selected").forEach(s => s.classList.remove("selected"));
          return;
        }

        const idx = +el.dataset.idx;
        this._selectedOverlay = { pageId, idx };

        // Visual selection only — no re-render during drag
        newCanvas.querySelectorAll(".selected").forEach(s => s.classList.remove("selected"));
        el.classList.add("selected");

        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        el.classList.add("dragging");

        const rect = newCanvas.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const overlay = this.getOverlays(pageId)[idx];
        const startPctX = overlay.x || 50;
        const startPctY = overlay.y || 50;

        const onMove = (ev) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          const pctX = Math.max(0, Math.min(100, startPctX + (dx / rect.width) * 100));
          const pctY = Math.max(0, Math.min(100, startPctY + (dy / rect.height) * 100));
          el.style.left = pctX + "%";
          el.style.top = pctY + "%";
        };

        const onUp = (ev) => {
          el.classList.remove("dragging");
          newCanvas.removeEventListener("pointermove", onMove);
          newCanvas.removeEventListener("pointerup", onUp);

          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          const pctX = Math.max(0, Math.min(100, startPctX + (dx / rect.width) * 100));
          const pctY = Math.max(0, Math.min(100, startPctY + (dy / rect.height) * 100));

          this.updateOverlay(pageId, idx, { x: Math.round(pctX * 10) / 10, y: Math.round(pctY * 10) / 10 });
          // Full re-render only after drag ends
          this._renderCanvaPanel();
        };

        newCanvas.addEventListener("pointermove", onMove);
        newCanvas.addEventListener("pointerup", onUp);
      });
    },

    // ───────────────────────────────────────────────────────────
    //  THUMBNAIL GENERATOR
    // ───────────────────────────────────────────────────────────

    _generateThumb(img, maxDim) {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxDim / Math.max(1, img.width), maxDim / Math.max(1, img.height), 1);
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.7);
      } catch (e) {
        return img.src;
      }
    },

    // ───────────────────────────────────────────────────────────
    //  UTILITY
    // ───────────────────────────────────────────────────────────

    _esc(str) {
      const d = document.createElement("div");
      d.textContent = str || "";
      return d.innerHTML;
    },

    // ───────────────────────────────────────────────────────────
    //  PATCH PREVIEW — inject Canva rendering into student HTML
    // ───────────────────────────────────────────────────────────

    _patchPreviewBuilder() {
      if (!window.AT_PREVIEW || !AT_PREVIEW.buildStudentHTML) return;

      const origBuild = AT_PREVIEW.buildStudentHTML.bind(AT_PREVIEW);
      AT_PREVIEW.buildStudentHTML = function (S) {
        const html = origBuild(S);

        // If no canva mode pages, return as-is
        if (!S.canvaMode || !S.canvaMode.pages) return html;

        const canvaPages = Object.entries(S.canvaMode.pages).filter(([_, cfg]) => cfg && cfg._mode === "canva");
        if (!canvaPages.length) return html;

        // Build Canva CSS and JS to inject
        const canvaCSS = AT_CANVA._buildStudentCSS(S);
        const canvaJS = AT_CANVA._buildStudentJS(S);

        // Inject before </body>
        return html.replace("</body>", canvaCSS + canvaJS + "</body>");
      };
    },

    /** Build CSS for student HTML (Canva mode) */
    _buildStudentCSS(S) {
      return "<style>"
        + ".canva-page-bg{position:absolute;inset:0;z-index:0;pointer-events:none;}"
        + ".canva-page-bg img{width:100%;height:100%;}"
        + ".canva-page-bg.contain img{object-fit:contain;}"
        + ".canva-page-bg.cover img{object-fit:cover;}"
        + ".canva-page-bg.manual img{object-fit:contain;}"
        /* App-style buttons in student output */
        + ".canva-s-btn{position:absolute;z-index:10;display:inline-flex;align-items:center;justify-content:center;gap:5px;"
        + "padding:9px 20px;border-radius:99px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.85rem;"
        + "cursor:pointer;user-select:none;border:none;box-shadow:0 2px 8px rgba(0,0,0,.2);"
        + "transition:transform .15s,box-shadow .15s;letter-spacing:.01em;}"
        + ".canva-s-btn:hover{transform:translate(-50%,-50%) translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.35);}"
        + ".canva-s-btn:active{transform:translate(-50%,-50%) scale(.96);}"
        + ".canva-s-btn.canva-el-rounded{border-radius:14px;}"
        + ".canva-s-btn.canva-el-rect{border-radius:6px;}"
        /* Navbar in student output */
        + ".canva-s-navbar{position:absolute;top:0;left:0;right:0;z-index:10;"
        + "background:rgba(14,28,47,.96);backdrop-filter:blur(12px);"
        + "border-bottom:1px solid rgba(255,255,255,.1);"
        + "padding:10px 16px;display:flex;align-items:center;gap:10px;height:48px;box-sizing:border-box;}"
        + ".canva-s-navbar .canva-s-nav-logo{font-family:'Fredoka One',cursive;font-size:.85rem;color:#f5c842;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}"
        + ".canva-s-navbar .canva-s-nav-bar{width:60px;height:4px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;flex-shrink:0;}"
        + ".canva-s-navbar .canva-s-nav-fill{height:100%;width:0%;background:linear-gradient(90deg,#f5c842,#38d9d9);border-radius:99px;}"
        + "</style>";
    },

    /** Build JS for student HTML (Canva mode) */
    _buildStudentJS(S) {
      const canvaConfig = {};
      if (S.canvaMode && S.canvaMode.pages) {
        Object.entries(S.canvaMode.pages).forEach(([pageId, cfg]) => {
          if (cfg && cfg.assetId) {
            const asset = AT_CANVA_ASSETS.getById(cfg.assetId);
            if (asset) {
              canvaConfig[pageId] = {
                dataUrl: asset.dataUrl,
                display: cfg.display || "contain",
                manualHeight: cfg.manualHeight || 600,
              };
            }
          }
        });
      }

      const overlaysData = S.canvaOverlays || {};
      const configJson = JSON.stringify(canvaConfig).replace(/<\/script/gi, "<\\/script");
      const overlaysJson = JSON.stringify(overlaysData).replace(/<\/script/gi, "<\\/script");

      return "<script>"
        + "(function(){"
        + "var CC=" + configJson + ",OV=" + overlaysJson + ";"
        + "function applyCanva(pageId){"
        + "var cfg=CC[pageId];if(!cfg)return;"
        + "var screen=document.getElementById(pageId);if(!screen)return;"
        + "screen.style.position='relative';screen.style.overflow='hidden';"
        + "var bgDiv=screen.querySelector('.canva-page-bg');"
        + "if(!bgDiv){bgDiv=document.createElement('div');bgDiv.className='canva-page-bg '+(cfg.display||'contain');screen.insertBefore(bgDiv,screen.firstChild);}"
        + "bgDiv.className='canva-page-bg '+(cfg.display||'contain');"
        + "if(cfg.display==='manual'){bgDiv.style.height=cfg.manualHeight+'px';}"
        + "bgDiv.innerHTML='<img src=\"'+cfg.dataUrl+'\" alt=\"bg\">';"
        + "var overlays=OV[pageId]||[];"
        + "overlays.forEach(function(el,i){"
        + "var btn=document.createElement('div');"
        + "btn.className='canva-overlay-btn canva-el-'+(el.shape||'pill');"
        + "btn.style.left=(el.x||50)+'%';btn.style.top=(el.y||50)+'%';"
        + "btn.style.transform='translate(-50%,-50%)';"
        + "btn.style.width=(el.customW||64)+'px';btn.style.height=(el.customH||64)+'px';"
        + "btn.style.fontSize=(el.customFs||'.88rem');"
        + "btn.style.background=el.color||'#F5C842';"
        + "btn.style.opacity=((el.opacity!=null?el.opacity:100)/100);"
        + "var lum=((parseInt((el.color||'#F5C842').slice(1,3),16)*.299+parseInt((el.color||'#F5C842').slice(3,5),16)*.587+parseInt((el.color||'#F5C842').slice(5,7),16)*.114)/255);"
        + "btn.style.color=lum>.55?'#0e1c2f':'#fff';"
        + "btn.textContent=(el.icon||'')+' '+(el.label||'');"
        + "if(el.type==='nav-next'){btn.onclick=function(){if(window.go)go('skuis');};}"
        + "else if(el.type==='nav-back'){btn.onclick=function(){if(window.go)go('sc');};}"
        + "else if(el.type==='nav-home'){btn.onclick=function(){if(window.go)go('sc');};}"
        + "else if(el.type==='menu-btn'){btn.onclick=function(){if(window.go)go('scp');};}"
        + "else if(el.type==='quiz-btn'){btn.onclick=function(){if(window.go)go('skuis');};}"
        + "screen.appendChild(btn);"
        + "});"
        + "}"
        + "function initCanva(){"
        + "var active=document.querySelector('.screen.active');"
        + "if(active)applyCanva(active.id);"
        + "}"
        + "var origGo=window.go;"
        + "if(origGo){window.go=function(id){origGo(id);setTimeout(applyCanva,100);};}"
        + "setTimeout(initCanva,300);"
        + "})();"
        + "<\\/script>";
    },

    // ───────────────────────────────────────────────────────────
    //  RENDER DOCK (called from outside)
    // ───────────────────────────────────────────────────────────

    renderDock() {
      AT_CANVA_DOCK.render();
    },

    // ───────────────────────────────────────────────────────────
    //  COLOR EXTRACTION (optional dominant color from asset)
    // ───────────────────────────────────────────────────────────

    _extractDominantColor(assetId) {
      const asset = AT_CANVA_ASSETS.getById(assetId);
      if (!asset || !asset.thumbUrl) return null;

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // We need a sync approach — use thumb
        img.onload = () => {
          canvas.width = 1;
          canvas.height = 1;
          ctx.drawImage(img, 0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          const hex = "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
          // Update CSS custom property
          document.documentElement.style.setProperty("--canva-dominant", hex);
          AT_UTIL.toast("\u{1F3A8} Warna dominan: " + hex);
        };
        img.src = asset.thumbUrl;
      } catch (e) {
        // Canvas may be tainted
      }
    },

    // ───────────────────────────────────────────────────────────
    //  PERSISTENCE HOOK
    // ───────────────────────────────────────────────────────────
    // The canvaMode.pages entries need a _mode field for the 
    // student renderer to detect canva pages.

    _ensurePageMode(pageId) {
      if (!AT_STATE.canvaMode) AT_STATE.canvaMode = { global: "generic", pages: {} };
      const pages = AT_STATE.canvaMode.pages;
      if (!pages[pageId]) pages[pageId] = {};
      // When toggling, also set _mode for student renderer
      pages[pageId]._mode = pages[pageId]._mode || AT_STATE.canvaMode.global || "generic";
    },
  };

  // ── Override toggleMode to also set _mode ──
  const _origToggleMode = window.AT_CANVA.toggleMode.bind(window.AT_CANVA);
  window.AT_CANVA.toggleMode = function (pageId, mode) {
    if (!AT_STATE.canvaMode) AT_STATE.canvaMode = { global: "generic", pages: {} };
    if (!mode) {
      const cur = this.getMode(pageId);
      mode = cur === "generic" ? "canva" : "generic";
    }
    if (!AT_STATE.canvaMode.pages[pageId]) {
      AT_STATE.canvaMode.pages[pageId] = {};
    }
    AT_STATE.canvaMode.pages[pageId]._mode = mode;
    AT_STATE.canvaMode.pages[pageId].mode = mode;
    AT_EDITOR.markDirty();
    AT_SPLITVIEW && AT_SPLITVIEW.scheduleRefresh && AT_SPLITVIEW.scheduleRefresh();
    this._updateModeToggleUI();
    AT_UTIL.toast(mode === "canva" ? "\u{1F3A8} Canva mode aktif" : "\u{1F4DD} Generic mode aktif");
  };

  // ── Override getMode to check both mode and _mode fields ──
  const _origGetMode = window.AT_CANVA.getMode.bind(window.AT_CANVA);
  window.AT_CANVA.getMode = function (pageId) {
    if (!AT_STATE.canvaMode) return "generic";
    const pg = AT_STATE.canvaMode.pages[pageId];
    if (pg) return pg._mode || pg.mode || AT_STATE.canvaMode.global || "generic";
    return AT_STATE.canvaMode.global || "generic";
  };

  // ── Override getPageConfig to also return _mode ──
  const _origGetPageConfig = window.AT_CANVA.getPageConfig.bind(window.AT_CANVA);
  window.AT_CANVA.getPageConfig = function (pageId) {
    if (!AT_STATE.canvaMode || !AT_STATE.canvaMode.pages) return null;
    const pg = AT_STATE.canvaMode.pages[pageId];
    if (!pg || this.getMode(pageId) !== "canva") return null;
    return pg;
  };

  // ═══════════════════════════════════════════════════════════════
  //  PATCHED student JS — use _mode from canvaMode config
  // ═══════════════════════════════════════════════════════════════
  // Re-patch the preview builder to use _mode correctly
  const _rePatch = () => {
    if (!window.AT_PREVIEW || !AT_PREVIEW.buildStudentHTML) return;

    // Get current buildStudentHTML (might already be patched)
    const currentBuild = AT_PREVIEW.buildStudentHTML;

    // Only re-patch if not already our version
    if (currentBuild._canvaPatched) return;

    AT_PREVIEW.buildStudentHTML = function (S) {
      const html = currentBuild(S);

      if (!S.canvaMode || !S.canvaMode.pages) return html;

      // Check if any page has canva _mode
      const canvaPages = Object.entries(S.canvaMode.pages)
        .filter(([_, cfg]) => cfg && (cfg._mode === "canva" || cfg.mode === "canva"));

      if (!canvaPages.length) return html;

      const canvaCSS = AT_CANVA._buildStudentCSS(S);
      const canvaJS = AT_CANVA._buildStudentJSPatched(S);

      return html.replace("</body>", canvaCSS + canvaJS + "</body>");
    };
    AT_PREVIEW.buildStudentHTML._canvaPatched = true;
  };

  // Updated student JS builder that checks _mode
  window.AT_CANVA._buildStudentJSPatched = function (S) {
    const canvaConfig = {};
    if (S.canvaMode && S.canvaMode.pages) {
      Object.entries(S.canvaMode.pages).forEach(([pageId, cfg]) => {
        const mode = cfg._mode || cfg.mode;
        if (mode === "canva" && cfg.assetId) {
          const asset = AT_CANVA_ASSETS.getById(cfg.assetId);
          if (asset) {
            canvaConfig[pageId] = {
              dataUrl: asset.dataUrl,
              display: cfg.display || "contain",
              manualHeight: cfg.manualHeight || 600,
            };
          }
        }
      });
    }

    const overlaysData = S.canvaOverlays || {};
    const configJson = JSON.stringify(canvaConfig).replace(/<\/script/gi, "<\\/script");
    const overlaysJson = JSON.stringify(overlaysData).replace(/<\/script/gi, "<\\/script");

    return "<script>"
      + "(function(){"
      + "var CC=" + configJson + ",OV=" + overlaysJson + ";"
      + "function applyCanva(pageId){"
      + "var cfg=CC[pageId];if(!cfg)return;"
      + "var screen=document.getElementById(pageId);if(!screen)return;"
      + "screen.style.position='relative';screen.style.overflow='hidden';"
      + "var bgDiv=screen.querySelector('.canva-page-bg');"
      + "if(!bgDiv){bgDiv=document.createElement('div');bgDiv.className='canva-page-bg '+(cfg.display||'contain');screen.insertBefore(bgDiv,screen.firstChild);}"
      + "bgDiv.className='canva-page-bg '+(cfg.display||'contain');"
      + "if(cfg.display==='manual'){bgDiv.style.height=cfg.manualHeight+'px';}"
      + "bgDiv.innerHTML='<img src=\"'+cfg.dataUrl+'\" alt=\"bg\">';"
      + "var overlays=OV[pageId]||[];"
      + "overlays.forEach(function(el,i){"
      // ── NAVBAR type: render as app navbar ──
      + "if(el.type==='navbar'){"
      + "var nav=document.createElement('div');"
      + "nav.className='canva-s-navbar';"
      + "nav.style.top=(el.y||0)+'%';"
      + "nav.innerHTML='<div class=\"canva-s-nav-logo\">'+(el.label||'PPKn Kelas VII')+'</div>'"
      + "+'<div class=\"canva-s-nav-bar\"><div class=\"canva-s-nav-fill\"></div></div>';"
      + "screen.appendChild(nav);"
      + "return;"
      + "}"
      // ── BUTTON types: render as app-style buttons ──
      + "var btn=document.createElement('div');"
      + "btn.className='canva-s-btn canva-el-'+(el.shape||'pill');"
      + "btn.style.left=(el.x||50)+'%';btn.style.top=(el.y||50)+'%';"
      + "btn.style.transform='translate(-50%,-50%)';"
      + "btn.style.background=el.color||'#F5C842';"
      + "btn.style.opacity=((el.opacity!=null?el.opacity:100)/100);"
      + "var c=el.color||'#F5C842',ch=c.replace('#','');"
      + "if(ch.length===6){var r=parseInt(ch.slice(0,2),16),g=parseInt(ch.slice(2,4),16),b=parseInt(ch.slice(4,6),16),l=(.299*r+.587*g+.114*b)/255;btn.style.color=l>.55?'#0e1c2f':'#fff';}"
      + "btn.textContent=(el.icon||'')+' '+(el.label||'');"
      + "if(el.type==='nav-next')btn.onclick=function(){if(window.go)go('skuis');};"
      + "else if(el.type==='nav-back')btn.onclick=function(){if(window.go)go('sc');};"
      + "else if(el.type==='nav-home')btn.onclick=function(){if(window.go)go('sc');};"
      + "else if(el.type==='menu-btn')btn.onclick=function(){if(window.go)go('scp');};"
      + "else if(el.type==='quiz-btn')btn.onclick=function(){if(window.go)go('skuis');};"
      + "screen.appendChild(btn);"
      + "});"
      + "}"
      + "var origGo=window.go;"
      + "if(origGo){window.go=function(id){origGo(id);setTimeout(function(){var a=document.querySelector('.screen.active');if(a)applyCanva(a.id);},120);};}"
      + "setTimeout(function(){var a=document.querySelector('.screen.active');if(a)applyCanva(a.id);},400);"
      + "window.addEventListener('message',function(e){"
      + "if(e.data&&e.data.goPage){setTimeout(function(){applyCanva(e.data.goPage);},150);}"
      + "});"
      + "})();"
      + "<\\/script>";
  };

  // ═══════════════════════════════════════════════════════════════
  //  AUTO-INIT on DOMContentLoaded
  // ═══════════════════════════════════════════════════════════════

  document.addEventListener("DOMContentLoaded", () => {
    // Wait for core systems to initialize
    setTimeout(() => {
      // Ensure AT_UTIL is available
      if (!window.AT_UTIL) {
        console.warn("Canva-Hybrid: AT_UTIL not ready, deferring init...");
        setTimeout(() => {
          window.AT_CANVA.init();
          _rePatch();
          AT_CANVA_DOCK.render();
        }, 500);
        return;
      }

      window.AT_CANVA.init();
      _rePatch();

      // Initial dock render
      AT_CANVA_DOCK.render();

      // Listen for ATP changes to update dock
      const origATPUpdate = window.AT_ATP && AT_ATP.update;
      if (origATPUpdate) {
        const _atpUpdate = AT_ATP.update.bind(AT_ATP);
        AT_ATP.update = function (i, k, v) {
          _atpUpdate(i, k, v);
          setTimeout(() => AT_CANVA_DOCK.render(), 50);
        };
      }

      const origATPAdd = window.AT_ATP && AT_ATP.add;
      if (origATPAdd) {
        const _atpAdd = AT_ATP.add.bind(AT_ATP);
        AT_ATP.add = function () {
          _atpAdd();
          setTimeout(() => AT_CANVA_DOCK.render(), 50);
        };
      }

      const origATPDelete = window.AT_ATP && AT_ATP.delete;
      if (origATPDelete) {
        const _atpDel = AT_ATP.delete.bind(AT_ATP);
        AT_ATP.delete = function (i) {
          _atpDel(i);
          setTimeout(() => AT_CANVA_DOCK.render(), 50);
        };
      }

      // Listen for TP changes too (for dock subtitle)
      const origTPRender = window.AT_TP && AT_TP.render;
      if (origTPRender) {
        const _tpRender = AT_TP.render.bind(AT_TP);
        AT_TP.render = function () {
          _tpRender();
          setTimeout(() => AT_CANVA_DOCK.render(), 50);
        };
      }

      console.log("\u2705 canva-hybrid.js loaded — Canva-Hybrid System v1.0 ready");
    }, 100);
  });

})();
