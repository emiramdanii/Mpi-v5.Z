// preview.js v2.0 — DEFINITIVE REWRITE
// Fixes: nextAfterMat inline call, iframe dark bg, modules+games self-contained
window.AT_PREVIEW = {
  _device: "mobile",

  setDevice(d) {
    this._device = d;
    document.querySelectorAll(".device-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.device === d));
    this.render();
  },

  goPage(pageId) {
    const frame = document.getElementById("previewFrame");
    if (!frame) return;
    const sel = document.getElementById("previewPageSelect");
    if (sel && pageId) sel.value = pageId;
    try {
      frame.contentWindow?.postMessage({ goPage: pageId }, "*");
    } catch(e) {}
  },

  render() {
    const frame = document.getElementById("previewFrame");
    if (!frame) return;
    const wrap = document.getElementById("previewFrameWrap");
    const widths = { mobile:"390px", tablet:"768px", desktop:"100%" };
    if (wrap) {
      wrap.style.maxWidth = widths[this._device] || "100%";
      wrap.style.margin = this._device === "desktop" ? "0" : "0 auto";
    }
    const pageId = document.getElementById("previewPageSelect")?.value || "sc";
    try {
      const html = this.buildStudentHTML(AT_STATE);
      frame.srcdoc = html;
      frame.addEventListener("load", () => {
        setTimeout(() => {
          try { frame.contentWindow?.postMessage({ goPage: pageId }, "*"); } catch(e) {}
        }, 80);
      }, { once: true });
    } catch(err) {
      frame.srcdoc = '<body style="margin:20px;font-family:sans-serif;color:#ff6b6b">'
        + '<b>Preview Error:</b><pre style="font-size:.8rem;white-space:pre-wrap;margin-top:8px">'
        + err.message + "\n" + (err.stack||"") + "</pre></body>";
      console.error("Preview error:", err);
    }
  },

  // ─────────────────────────────────────────────────────────────
  //  MAIN BUILDER — returns full student HTML string
  //  All module/game HTML is serialized here so srcdoc is self-contained
  // ─────────────────────────────────────────────────────────────
  buildStudentHTML(S) {
    const M    = S.meta     || {};
    const cp   = S.cp       || {};
    const tp   = S.tp       || [];
    const atp  = S.atp      || {};
    const alur = S.alur     || [];
    const kuis = S.kuis     || [];
    const sk   = S.skenario || [];
    const mods = S.modules  || [];
    const gms  = S.games    || [];
    // fungsi: use state override if exists, else PRESETS
    const fungsi = (S.fungsi && S.fungsi.length) ? S.fungsi
      : ((window.PRESETS && PRESETS.fungsi) ? PRESETS.fungsi : []);

    // Fallbacks for empty state
    const chapters = sk.length ? sk
      : (window.PRESETS && PRESETS.skenario?.["norma-3-skenario"])
        ? PRESETS.skenario["norma-3-skenario"].chapters : [];
    const kuisData = kuis.length ? kuis
      : (window.PRESETS && PRESETS.kuis?.["norma-10-soal"])
        ? PRESETS.kuis["norma-10-soal"].soal : [];

    const e = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const col = c => c || "var(--y)";

    // ── screen chain ──
    const hasSk   = chapters.length > 0;
    const hasMods = mods.length > 0;
    const hasGms  = gms.length > 0;
    // These become string literals inside student JS — NOT JS expressions at build time
    const afterSk   = "smat";
    const afterMat  = hasMods ? "smods" : hasGms ? "sgame_0" : "skuis";
    const afterMods = hasGms  ? "sgame_0" : "skuis";
    const afterGms  = "skuis";

    // ── CSS ──────────────────────────────────────────────────
    const css = `:root{--bg:#0e1c2f;--bg2:#13243a;--card:#182d45;--border:rgba(255,255,255,.09);
--y:#f9c12e;--c:#3ecfcf;--r:#ff6b6b;--p:#a78bfa;--g:#34d399;--o:#fb923c;--b:#60a5fa;
--text:#e8f2ff;--muted:#6e90b5;--rad:16px;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;}
.screen{display:none;min-height:100vh;}
.screen.active{display:flex;flex-direction:column;animation:fi .35s ease;}
@keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.nav{background:rgba(14,28,47,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);
  padding:10px 16px;display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:100;}
.nav-logo{font-family:'Fredoka One',cursive;font-size:.9rem;color:var(--y);flex:1;}
.nav-bar{width:80px;height:5px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;}
.nav-fill{height:100%;background:linear-gradient(90deg,var(--y),var(--c));border-radius:99px;}
.main{flex:1;padding:18px 15px;max-width:820px;width:100%;margin:0 auto;}
.btn{display:inline-flex;align-items:center;gap:5px;padding:9px 20px;border-radius:99px;
  font-family:'Nunito',sans-serif;font-weight:800;font-size:.88rem;border:none;cursor:pointer;transition:all .18s;}
.btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.3);}
.btn-y{background:var(--y);color:#0e1c2f;}.btn-g{background:var(--g);color:#0e1c2f;}
.btn-ghost{background:rgba(255,255,255,.07);color:var(--text);border:1px solid var(--border);}
.btn-sm{padding:6px 14px;font-size:.78rem;}
.btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;justify-content:center;}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--rad);padding:18px;margin-bottom:12px;}
.mt14{margin-top:14px;}.sub{color:var(--muted);font-size:.84rem;line-height:1.6;}
.h2{font-family:'Fredoka One',cursive;font-size:1.5rem;line-height:1.2;}.hl{color:var(--y);}
.chip{display:inline-flex;padding:3px 10px;border-radius:99px;font-size:.72rem;font-weight:800;}
.def-box{border-left:4px solid var(--y);background:rgba(249,193,46,.07);border-radius:0 10px 10px 0;padding:12px 14px;margin:10px 0;font-size:.88rem;line-height:1.7;}
.tp-item{display:flex;gap:11px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:11px;padding:11px 13px;margin-bottom:8px;}
.alur-step{display:flex;gap:11px;align-items:flex-start;padding:10px 13px;border-radius:11px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);margin-bottom:7px;}
.atp-c{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:13px;margin-bottom:9px;}
.atp-c.cur{border-color:rgba(249,193,46,.3);background:rgba(249,193,46,.04);}
.ktab-row{display:flex;border-bottom:2px solid var(--border);margin-bottom:14px;}
.ktab{padding:8px 14px;font-size:.77rem;font-weight:800;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .18s;}
.ktab.on{color:var(--y);border-bottom-color:var(--y);}.kp{display:none;}.kp.on{display:block;animation:fi .25s ease;}
.sk-shell{background:#0a0f1a;border:3px solid #1e3a5a;border-radius:15px;overflow:hidden;margin:10px 0;}
.sk-hud{background:linear-gradient(90deg,#0d1b2f,#0f2340);padding:9px 14px;display:flex;align-items:center;gap:10px;border-bottom:2px solid #1e3a5a;}
.sk-scene{position:relative;width:100%;height:160px;overflow:hidden;}
.sbg-pasar{background:linear-gradient(180deg,#87CEEB 45%,#999 60%,#a08050 100%);}
.sbg-masjid{background:linear-gradient(180deg,#fce4ec 45%,#81c784 100%);}
.sbg-kelas{background:linear-gradient(180deg,#e8f4fd,#d0eaf8);}
.sbg-kampung{background:linear-gradient(180deg,#c8e6c9 48%,#b09060 100%);}
.sk-char{position:absolute;bottom:25%;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;}
.sk-dlg{position:absolute;bottom:0;left:0;right:0;background:rgba(8,16,30,.92);border-top:2px solid #1e3a5a;padding:11px 13px;min-height:70px;}
.sk-choice{background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:11px;padding:10px 13px;cursor:pointer;display:flex;align-items:center;gap:9px;font-size:.82rem;font-weight:700;margin-bottom:7px;transition:border .18s;}
.sk-choice:hover{border-color:var(--c);}
.sk-banner{border-radius:11px;padding:11px 13px;display:flex;gap:9px;margin-bottom:9px;}
.sk-banner.good{background:rgba(52,211,153,.1);border:2px solid rgba(52,211,153,.3);}
.sk-banner.bad{background:rgba(255,107,107,.1);border:2px solid rgba(255,107,107,.3);}
.sk-banner.mid{background:rgba(249,193,46,.1);border:2px solid rgba(249,193,46,.3);}
.ftab{padding:6px 11px;border-radius:99px;font-size:.74rem;font-weight:800;cursor:pointer;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--muted);transition:all .18s;margin:0 4px 4px 0;}
.q-card{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:15px;margin-bottom:11px;}
.q-opt{display:flex;align-items:flex-start;gap:9px;padding:9px 12px;border-radius:9px;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.07);cursor:pointer;font-size:.82rem;font-weight:700;transition:border .18s;margin-bottom:6px;line-height:1.4;}
.q-opt:hover:not(.dis){border-color:var(--c);}.q-opt.ok{border-color:var(--g);background:rgba(52,211,153,.1);color:var(--g);}
.q-opt.no{border-color:var(--r);background:rgba(255,107,107,.1);color:var(--r);}
.q-opt.shok{border-color:var(--g);background:rgba(52,211,153,.05);}.q-opt.dis{pointer-events:none;}
.qfb{padding:8px 11px;border-radius:8px;margin-top:7px;font-size:.78rem;font-weight:700;}
.qfb.ok{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g);}
.qfb.no{background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--r);}
.h-circle{width:130px;height:130px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;position:relative;}
.h-circle::before{content:'';position:absolute;inset:10px;border-radius:50%;background:var(--bg2);}
.h-score{position:relative;z-index:1;text-align:center;}
.rta{width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:'Nunito',sans-serif;font-size:.8rem;resize:vertical;min-height:55px;}
.conf{position:fixed;border-radius:2px;animation:fall linear both;pointer-events:none;z-index:9999;}
@keyframes fall{to{transform:translateY(105vh) rotate(540deg);opacity:0}}
#cw{position:fixed;inset:0;pointer-events:none;z-index:9998;}
.fc-card{perspective:600px;height:140px;margin-bottom:10px;cursor:pointer;}
.fc-inner{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d;}
.fc-card.flipped .fc-inner{transform:rotateY(180deg);}
.fc-front,.fc-back{position:absolute;inset:0;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;backface-visibility:hidden;}
.fc-front{background:var(--card);border:2px solid var(--border);}
.fc-back{background:rgba(52,211,153,.08);border:2px solid rgba(52,211,153,.3);transform:rotateY(180deg);}
.mx-item{padding:9px 13px;border-radius:10px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.08);cursor:pointer;font-size:.82rem;font-weight:700;margin-bottom:7px;transition:all .18s;}
.mx-item:hover{border-color:var(--c);}.mx-item.selected{border-color:var(--y);background:rgba(249,193,46,.1);}
.mx-item.matched{border-color:var(--g);background:rgba(52,211,153,.1);pointer-events:none;}
.mx-item.wrong{border-color:var(--r);}
.mem-card{padding:10px;border-radius:10px;background:rgba(167,139,250,.12);border:2px solid rgba(167,139,250,.25);cursor:pointer;font-size:.82rem;font-weight:700;text-align:center;min-height:52px;display:flex;align-items:center;justify-content:center;transition:all .2s;}
.mem-card.flipped{background:rgba(249,193,46,.1);border-color:var(--y);color:var(--y);}
.mem-card.matched{background:rgba(52,211,153,.1);border-color:var(--g);color:var(--g);pointer-events:none;}
.ws-grid{display:grid;gap:2px;margin:14px 0;user-select:none;}
.ws-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);border-radius:4px;font-size:.78rem;font-weight:800;cursor:pointer;transition:all .15s;}
.ws-cell:hover{background:rgba(245,200,66,.15);}.ws-cell.sel{background:rgba(245,200,66,.3);color:var(--y);}
.ws-cell.found{background:rgba(52,211,153,.2);color:var(--g);pointer-events:none;}`;

    // ── NAV helper ────────────────────────────────────────────
    const nav = pct => "<nav class='nav'>"
      + "<span class='nav-logo'>" + e(M.namaBab||M.judulPertemuan||"Media") + "</span>"
      + "<div class='nav-bar'><div class='nav-fill' style='width:" + pct + "%'></div></div>"
      + "</nav>";

    // ── COVER ─────────────────────────────────────────────────
    const coverHtml =
      "<div class='screen active' id='sc' style='background:radial-gradient(ellipse 90% 60% at 50% 0%,rgba(249,193,46,.18),transparent 60%),linear-gradient(180deg,#0e1c2f,#09121f)'>"
      + "<div style='flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px 16px'>"
      + "<div style='font-size:3.8rem;animation:float 3s ease-in-out infinite;margin-bottom:10px'>" + e(M.ikon||"📚") + "</div>"
      + "<div style='display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-bottom:14px'>"
      + "<span class='chip' style='background:rgba(249,193,46,.15);color:var(--y)'>" + e(M.mapel||"PPKn") + " " + e(M.kelas||"") + "</span>"
      + "<span class='chip' style='background:rgba(62,207,207,.15);color:var(--c)'>" + e(M.durasi||"2×40 menit") + "</span>"
      + "<span class='chip' style='background:rgba(52,211,153,.15);color:var(--g)'>" + e(M.kurikulum||"Kurikulum Merdeka") + "</span>"
      + "</div>"
      + "<div style='font-family:Fredoka One,cursive;font-size:clamp(1.4rem,5vw,2.3rem);line-height:1.15;margin-bottom:8px'>" + e(M.judulPertemuan||"Media Pembelajaran") + "</div>"
      + "<p class='sub' style='max-width:420px;margin:0 auto 20px'>" + e(M.subjudul||"") + "</p>"
      + "<button class='btn btn-y' onclick=\"go('scp')\">Mulai Belajar →</button>"
      + "</div></div>";

    // ── CP SCREEN ─────────────────────────────────────────────
    const tpHtml = tp.map((t,i) =>
      "<div class='tp-item'><div style='width:24px;height:24px;border-radius:50%;background:" + col(t.color) + "22;color:" + col(t.color) + ";display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:900;flex-shrink:0'>" + (i+1) + "</div>"
      + "<div><div style='font-weight:900;font-size:.83rem;color:" + col(t.color) + "'>" + e(t.verb) + "</div>"
      + "<div style='color:var(--muted);font-size:.77rem;line-height:1.5'>" + e(t.desc) + "</div></div></div>"
    ).join("") || "<p style='color:var(--muted);font-size:.81rem'>TP belum diisi.</p>";

    const atpHtml = (atp.pertemuan||[]).map((p,i) =>
      "<div class='atp-c" + (i===0?" cur":"") + "'>"
      + "<div style='font-size:.68rem;font-weight:900;color:var(--y);margin-bottom:5px'>" + (i===0?"📍 ":"→ ") + "Pertemuan " + (i+1) + " · " + e(p.durasi||"") + "</div>"
      + "<div style='font-weight:800;font-size:.87rem;margin-bottom:3px'>" + e(p.judul||"") + "</div>"
      + "<div style='font-size:.75rem;color:var(--c);margin-bottom:3px'>" + e(p.tp||"") + "</div>"
      + "<div style='font-size:.73rem;color:var(--muted)'>" + e(p.kegiatan||"") + "</div></div>"
    ).join("") || "<p style='color:var(--muted);font-size:.81rem'>ATP belum diisi.</p>";

    const alurHtml = alur.map(s => {
      const fc = {Pendahuluan:"#f5c842",Inti:"#38d9d9",Penutup:"#34d399"};
      const c = fc[s.fase]||"#a78bfa";
      return "<div class='alur-step'><span style='font-size:.65rem;font-weight:900;padding:2px 8px;border-radius:99px;background:" + c + "22;color:" + c + ";white-space:nowrap;flex-shrink:0;margin-top:2px'>" + e(s.fase) + "</span>"
        + "<span style='font-size:.72rem;font-weight:900;color:var(--y);min-width:48px;flex-shrink:0;margin-top:2px'>" + e(s.durasi||"") + "</span>"
        + "<div style='font-size:.8rem;line-height:1.5'><strong>" + e(s.judul||"") + "</strong>" + (s.deskripsi?" — "+e(s.deskripsi):"") + "</div></div>";
    }).join("") || "<p style='color:var(--muted);font-size:.81rem'>Alur belum diisi.</p>";

    const cpScreen =
      "<div class='screen' id='scp'>" + nav(16) + "<div class='main'>"
      + "<div class='card'><div class='h2'>📋 <span class='hl'>Dokumen</span> Pembelajaran</div>"
      + "<div class='ktab-row' style='margin-top:12px'>"
      + "<div class='ktab on' onclick='kT(\"kcp\",this)'>Capaian</div>"
      + "<div class='ktab' onclick='kT(\"ktp\",this)'>Tujuan (TP)</div>"
      + "<div class='ktab' onclick='kT(\"katp\",this)'>ATP</div>"
      + "</div>"
      + "<div class='kp on' id='kcp'>"
      + "<div style='font-size:.78rem;color:var(--muted);margin-bottom:7px'><strong style='color:var(--text)'>" + e(cp.elemen||"-") + "</strong> · " + e(cp.subElemen||"-") + "</div>"
      + "<div class='def-box'>" + e(cp.capaianFase||"Capaian pembelajaran belum diisi.") + "</div>"
      + "<div style='background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:11px;padding:11px;font-size:.8rem;line-height:1.6'>"
      + "<strong style='color:var(--g)'>🔗 Profil Pelajar Pancasila:</strong><br>"
      + "<span style='color:var(--muted)'>" + e((cp.profil||["Beriman & Bertakwa","Bernalar Kritis","Bergotong Royong"]).join(" · ")) + "</span>"
      + "</div></div>"
      + "<div class='kp' id='ktp'>" + tpHtml + "</div>"
      + "<div class='kp' id='katp'>" + atpHtml + "</div>"
      + "</div>"
      + "<div class='card'><div style='font-size:.75rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px'>🗓️ Alur Pembelajaran</div>" + alurHtml + "</div>"
      + "<div class='btn-row'><button class='btn btn-y' onclick=\"go('ssk')\">Mulai Skenario 🎭</button><button class='btn btn-ghost' onclick=\"go('sc')\">← Kembali</button></div>"
      + "</div></div>";

    // ── SKENARIO ──────────────────────────────────────────────
    const skScreen =
      "<div class='screen' id='ssk'>" + nav(30) + "<div class='main'>"
      + "<div class='sk-shell'>"
      + "<div class='sk-hud'><span style='font-family:Fredoka One,cursive;font-size:.88rem;color:var(--y)'>🎭 Skenario</span>"
      + "<span id='skt' style='font-size:.74rem;color:var(--muted);flex:1;margin-left:8px'></span>"
      + "<span id='skp' style='font-size:.77rem;font-weight:800;color:var(--y)'>0 poin</span></div>"
      + "<div id='skb'></div>"
      + "<div id='skpr' style='display:flex;gap:4px;padding:7px 13px;background:#060d18;border-top:1px solid #1e3a5a;'></div>"
      + "</div>"
      + "<div id='sknxt' style='display:none' class='btn-row'>"
      + "<button class='btn btn-y' onclick=\"go('" + afterSk + "')\">Lanjut ke Materi →</button></div>"
      + "</div></div>";

    // ── MATERI ────────────────────────────────────────────────
    const ftTabsHtml = fungsi.map((f,i) =>
      "<div class='ftab' id='ft" + i + "' onclick='swFt(" + i + ")'>" + f.icon + " " + e(f.label) + "</div>"
    ).join("");

    // materi pages — build array of page objects
    const materiPages = [];
    // Page 1: Fungsi norma (always)
    materiPages.push({
      id: "smat_0",
      label: "⚖️ Fungsi Norma",
      html: "<div class='card'><div class='h2'>⚖️ Fungsi <span class='hl'>Norma</span></div>"
        + "<p class='sub' style='margin:8px 0 12px'>Klik tab untuk menjelajahi fungsi norma.</p>"
        + "<div id='fttabs' style='display:flex;flex-wrap:wrap;margin-bottom:4px'>" + ftTabsHtml + "</div>"
        + "<div id='ftc'></div></div>"
    });
    // Extra pages from S.materi
    if (S.materi) {
      if (S.materi.ringkasan) {
        materiPages.push({
          id: "smat_r",
          label: "📝 Ringkasan",
          html: "<div class='card'><div class='h2'>📝 <span class='hl'>Ringkasan Materi</span></div>"
            + "<p style='font-size:.85rem;line-height:1.8;color:var(--text);margin-top:10px'>" + e(S.materi.ringkasan) + "</p></div>"
        });
      }
      if ((S.materi.definisi||[]).length) {
        materiPages.push({
          id: "smat_d",
          label: "📚 Kamus",
          html: "<div class='card'><div class='h2'>📚 <span class='hl'>Kamus Istilah</span></div>"
            + S.materi.definisi.map(d =>
              "<div class='def-box'><strong style='color:var(--y)'>" + e(d.term) + "</strong> — " + e(d.def) + "</div>"
            ).join("") + "</div>"
        });
      }
      if ((S.materi.poin||[]).length) {
        materiPages.push({
          id: "smat_p",
          label: "💡 Poin Kunci",
          html: "<div class='card'><div class='h2'>💡 <span class='hl'>Poin Kunci</span></div>"
            + S.materi.poin.map(p =>
              "<div style='display:flex;gap:12px;padding:10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid var(--border);margin-bottom:8px'>"
              + "<span style='font-size:1.6rem;flex-shrink:0'>" + e(p.icon||"💡") + "</span>"
              + "<div><div style='font-weight:800;margin-bottom:4px'>" + e(p.judul) + "</div>"
              + "<div style='font-size:.82rem;color:var(--muted);line-height:1.6'>" + e(p.isi) + "</div></div></div>"
            ).join("") + "</div>"
        });
      }
      if ((S.materi.blok||[]).length) {
        // Group blok into pages of ~3 blok each
        const bloks = S.materi.blok;
        const perPage = 3;
        for (let bi = 0; bi < bloks.length; bi += perPage) {
          const chunk = bloks.slice(bi, bi + perPage);
          let bhtml = "<div class='card'><div class='h2'>📖 <span class='hl'>Materi</span> " + (Math.floor(bi/perPage)+1) + "</div>";
          chunk.forEach(b => {
            if (b.tipe==="definisi") bhtml += "<div class='def-box'><strong style='color:var(--y)'>" + e(b.judul) + "</strong><br>" + e(b.isi) + "</div>";
            else if (b.tipe==="penjelasan") bhtml += "<div style='margin:10px 0'><div style='font-weight:800;margin-bottom:5px'>" + e(b.judul) + "</div><p style='font-size:.85rem;line-height:1.8;color:var(--muted)'>" + e(b.isi) + "</p></div>";
            else if (b.tipe==="poin") bhtml += "<div style='margin:10px 0'><div style='font-weight:800;margin-bottom:6px'>" + e(b.judul) + "</div>" + (b.butir||[]).map(p=>"<div style='display:flex;gap:8px;margin-bottom:5px;font-size:.83rem'><span style='color:var(--y)'>→</span><span>" + e(p) + "</span></div>").join("") + "</div>";
          });
          materiPages.push({ id: "smat_b" + Math.floor(bi/perPage), label: "📖 Hal." + (Math.floor(bi/perPage)+2), html: bhtml + "</div>" });
        }
      }
    }

    // Build dot nav + page subscreen system for materi
    const matPageDots = materiPages.length > 1
      ? "<div style='display:flex;gap:6px;justify-content:center;margin:10px 0 4px'>"
        + materiPages.map((p,i) => "<div class='mat-dot' id='md" + i + "' onclick='goMatP(" + i + ")' style='width:8px;height:8px;border-radius:50%;cursor:pointer;transition:all .2s;background:" + (i===0?"var(--y)":"rgba(255,255,255,.2)") + "'></div>").join("")
        + "</div>" : "";

    const matPageHtml = materiPages.map((p,i) =>
      "<div class='mat-page' id='" + p.id + "' style='display:" + (i===0?"block":"none") + ";animation:fi .3s ease'>"
      + p.html + "</div>"
    ).join("");

    const materiScreen =
      "<div class='screen' id='smat'>" + nav(50) + "<div class='main'>"
      + "<div id='mat-pages'>" + matPageHtml + "</div>"
      + matPageDots
      + "<div class='btn-row'>"
      + (materiPages.length > 1 ? "<button class='btn btn-ghost' id='matPrev' onclick='matNav(-1)' style='display:none'>← Sebelumnya</button>" : "")
      + (materiPages.length > 1 ? "<button class='btn btn-y' id='matNext' onclick='matNav(1)'>Halaman Berikutnya →</button>" : "")
      + "<button class='btn " + (materiPages.length > 1 ? "btn-ghost" : "btn-y") + "' id='matDone' onclick=\"go('" + afterMat + "')\" style='" + (materiPages.length > 1 ? "display:none" : "") + "'>Lanjut →</button>"
      + "<button class='btn btn-ghost' onclick=\"go('ssk')\">← Skenario</button></div>"
      + "</div></div>";

    // ── MODULES ───────────────────────────────────────────────
    const modsHtml = this._buildModulesHtml(mods, e);
    // Build per-module pages for modul screen
    const modPages = mods.map((m, mi) => ({
      id: "smod_" + mi,
      label: (m.icon || "🧩") + " " + (m.title || "Modul " + (mi+1)),
      html: this._inlineModuleHtml(m, e)
    }));

    const modPageDots = modPages.length > 1
      ? "<div style='display:flex;gap:6px;justify-content:center;margin:10px 0 4px'>"
        + modPages.map((p,i) => "<div class='mat-dot' id='modd" + i + "' onclick='goModP(" + i + ")' style='width:8px;height:8px;border-radius:50%;cursor:pointer;transition:all .2s;background:" + (i===0?"var(--y)":"rgba(255,255,255,.2)") + "'></div>").join("")
        + "</div>" : "";
    const modPagesHtml = modPages.map((p,i) =>
      "<div class='mat-page' id='" + p.id + "' style='display:" + (i===0?"block":"none") + ";animation:fi .3s ease'>"
      + p.html + "</div>"
    ).join("");

    const modsScreen = hasMods
      ? "<div class='screen' id='smods'>" + nav(62) + "<div class='main'>"
        + "<div class='card' style='margin-bottom:14px'><div class='h2'>🧩 <span class='hl'>Modul</span> Pembelajaran</div>"
        + (modPages.length > 1 ? "<div style='font-size:.78rem;color:var(--muted);margin-top:5px'>Halaman <span id='modPNum'>1</span> dari " + modPages.length + "</div>" : "")
        + "</div>"
        + "<div id='mod-pages'>" + modPagesHtml + "</div>"
        + modPageDots
        + "<div class='btn-row'>"
        + (modPages.length > 1 ? "<button class='btn btn-ghost' id='modPrev' onclick='modNav(-1)' style='display:none'>← Sebelumnya</button>" : "")
        + (modPages.length > 1 ? "<button class='btn btn-y' id='modNext' onclick='modNav(1)'>Halaman Berikutnya →</button>" : "")
        + "<button class='btn " + (modPages.length > 1 ? "btn-ghost" : "btn-y") + "' id='modDone' onclick=\"go('" + afterMods + "')\" style='" + (modPages.length > 1 ? "display:none" : "") + "'>Lanjut →</button>"
        + "<button class='btn btn-ghost' onclick=\"go('smat')\">← Materi</button></div>"
        + "</div></div>"
      : "";

    // ── GAMES — tiap game dapat screen sendiri ────────────────
    const gamesScreens = gms.map((g, gi) => {
      const gHtml = this._buildGamesHtml([g], e);
      const prevScreen = gi === 0
        ? (hasMods ? "smods" : "smat")
        : "sgame_" + (gi - 1);
      const nextScreen = gi < gms.length - 1
        ? "sgame_" + (gi + 1)
        : afterGms;
      const nextLabel  = gi < gms.length - 1
        ? "Game Berikutnya →"
        : "Lanjut ke Kuis ❓";
      return "<div class='screen' id='sgame_" + gi + "'>" + nav(Math.round(60 + (gi / Math.max(gms.length, 1)) * 8))
        + "<div class='main'>"
        + "<div class='card' style='margin-bottom:14px'>"
        + "<div style='font-size:.72rem;color:var(--muted);margin-bottom:4px'>Game " + (gi + 1) + " / " + gms.length + "</div>"
        + "<div class='h2'>🎮 <span class='hl'>" + e(g.title || "Game Edukatif") + "</span></div>"
        + "</div>"
        + gHtml
        + "<div class='btn-row'>"
        + "<button class='btn btn-y' onclick=\"go('" + nextScreen + "')\">" + nextLabel + "</button>"
        + "<button class='btn btn-ghost' onclick=\"go('" + prevScreen + "')\">← Kembali</button>"
        + "</div></div></div>";
    }).join("");

    // Alias 'sgames' → screen game pertama (untuk nav dropdown & afterMods)
    const gamesAlias = hasGms
      ? "<script>var _ga=function(){go('sgame_0');};<\/script>"
      : "";
    const gamesScreenBlock = gamesScreens;

    // ── KUIS ──────────────────────────────────────────────────
    const kuisItemsHtml = kuisData.map((s,i) => {
      const opts = (s.opts||[]).map((o,j) =>
        "<div class='q-opt' id='qo" + i + "_" + j + "' onclick='aQ(" + i + "," + j + "," + (s.ans||0) + ")'>"
        + "<span style='font-weight:900;color:var(--c);flex-shrink:0'>" + "ABCD"[j] + ".</span> " + e(o) + "</div>"
      ).join("");
      return "<div class='q-card'><div style='font-weight:700;font-size:.88rem;line-height:1.5;margin-bottom:10px'>" + (i+1) + ". " + e(s.q) + "</div>" + opts
        + "<div id='qfb" + i + "' style='display:none' class='qfb'></div></div>";
    }).join("") || "<div class='card' style='text-align:center;padding:24px;color:var(--muted)'>Kuis belum diisi.</div>";

    const kuisScreen =
      "<div class='screen' id='skuis'>" + nav(80) + "<div class='main'>"
      + "<div class='card' style='margin-bottom:12px'><div class='h2'>❓ <span class='hl'>Kuis</span></div>"
      + "<p class='sub' style='margin-top:6px'>" + kuisData.length + " soal pilihan ganda.</p></div>"
      + "<div id='kc'>" + kuisItemsHtml + "</div>"
      + "<div class='btn-row'><button class='btn btn-y' id='bsub' onclick='subK()' style='display:none'>Lihat Hasil 📊</button></div>"
      + "</div></div>";

    // ── HASIL ─────────────────────────────────────────────────
    const hasilScreen =
      "<div class='screen' id='shas'>" + nav(100) + "<div class='main' style='text-align:center;padding-top:20px'>"
      + "<div class='h-circle' id='hcirc' style='background:conic-gradient(var(--g) 0%,var(--g) 0%,rgba(255,255,255,.06) 0% 100%)'>"
      + "<div class='h-score'><div id='hnum' style='font-family:Fredoka One,cursive;font-size:2rem;color:var(--g)'>0</div>"
      + "<div style='font-size:.68rem;color:var(--muted)'>SKOR</div></div></div>"
      + "<div id='hlv' style='padding:8px 18px;border-radius:11px;font-weight:800;font-size:.88rem;margin:10px 0;display:inline-block'></div>"
      + "<div class='card' style='text-align:left;margin-top:12px'>"
      + "<div style='font-size:.8rem;font-weight:800;margin-bottom:6px'>💭 Apa yang kamu pelajari?</div>"
      + "<textarea class='rta' placeholder='Tuliskan refleksimu...'></textarea>"
      + "<div style='font-size:.8rem;font-weight:800;margin:10px 0 6px'>🌟 Rencana Aksi</div>"
      + "<textarea class='rta' placeholder='Bagaimana kamu menerapkannya?'></textarea>"
      + "</div>"
      + "<div class='btn-row'><button class='btn btn-y' onclick='conf()'>🎉 Selesai!</button>"
      + "<button class='btn btn-ghost' onclick=\"go('sc')\">↩ Ulangi</button></div>"
      + "</div></div>";

    // ── JAVASCRIPT ────────────────────────────────────────────
    const chapJ = JSON.stringify(chapters).replace(/<\/script/gi,"<\\/script");
    const kuisJ = JSON.stringify(kuisData.map(s=>({q:s.q,opts:s.opts||["","","",""],ans:s.ans||0,ex:s.ex||""}))).replace(/<\/script/gi,"<\\/script");
    const fungiJ = JSON.stringify(fungsi).replace(/<\/script/gi,"<\\/script");
    const modInlineJs = this._buildModulesJs(mods);
    const gameInlineJs = this._buildGamesJs(gms);

    const js = `
var CH=${chapJ},KQ=${kuisJ},FG=${fungiJ};
var skI=0,skS=0,skPts=0,kAns={},curFt=0;

function go(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  var el=document.getElementById(id);if(el){el.classList.add('active');window.scrollTo(0,0);}
  if(id==='ssk')iSk();if(id==='smat')iFt();if(id==='skuis')rKuis();
}
function kT(id,el){
  document.querySelectorAll('.ktab').forEach(function(t){t.classList.remove('on');});
  document.querySelectorAll('.kp').forEach(function(t){t.classList.remove('on');});
  el.classList.add('on');var p=document.getElementById(id);if(p)p.classList.add('on');
}
function iSk(){skI=0;skS=0;skPts=0;rProg();stCh();}
function rProg(){
  var el=document.getElementById('skpr');if(!el)return;
  el.innerHTML=CH.map(function(_,i){
    return '<div style="flex:1;height:4px;border-radius:99px;transition:all .3s;background:'+(i<skI?'#34d399':i===skI?'#f9c12e':'#1e3a5a')+(i===skI?';box-shadow:0 0 6px #f9c12e':'')+'">'+'</div>';
  }).join('');
}
function stCh(){
  if(!CH.length){document.getElementById('sknxt').style.display='flex';return;}
  var ch=CH[skI];document.getElementById('skt').textContent=ch.title||'';skS=0;shSetup();
}
function shSetup(){
  var ch=CH[skI],s=(ch.setup||[])[skS];if(!s){shCho();return;}
  var html='<div class="sk-scene '+ch.bg+'">'
    +'<div class="sk-char">'
    +'<div style="width:30px;height:30px;border-radius:50%;background:#fff2d9;border:2px solid rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:1rem">'+(ch.charEmoji||'😊')+'</div>'
    +'<div style="width:22px;height:22px;border-radius:5px 5px 3px 3px;background:'+(ch.charColor||'#3a7a9a')+';border:2px solid rgba(0,0,0,.1);margin-top:-2px"></div>'
    +'</div>'
    +'<div class="sk-dlg">'
    +'<div style="font-size:.67rem;font-weight:800;color:var(--c);margin-bottom:3px;text-transform:uppercase">'+s.speaker+'</div>'
    +'<div style="font-size:.82rem;font-weight:700;line-height:1.5" id="stxt"></div>'
    +'<div style="font-size:.65rem;color:var(--muted);margin-top:4px;animation:blink 1.4s ease-in-out infinite">Ketuk untuk lanjut ▶</div>'
    +'</div></div>';
  document.getElementById('skb').innerHTML=html;
  document.getElementById('skb').onclick=adSk;
  tpIt('stxt',s.text||'');
}
function tpIt(id,txt){var el=document.getElementById(id);if(!el)return;el.textContent='';var i=0;var t=setInterval(function(){if(i>=txt.length){clearInterval(t);return;}el.textContent+=txt[i++];},20);}
function adSk(){document.getElementById('skb').onclick=null;skS++;var ch=CH[skI];if(skS<(ch.setup||[]).length)shSetup();else shCho();}
function shCho(){
  var ch=CH[skI];
  var html='<div style="padding:13px"><div style="font-size:.82rem;font-weight:800;color:var(--y);margin-bottom:10px;text-align:center">'+(ch.choicePrompt||'Apa yang akan kamu lakukan?')+'</div>';
  (ch.choices||[]).forEach(function(c,i){html+='<div class="sk-choice" onclick="pkCh('+i+')">'+c.icon+' <div><div>'+c.label+'</div><div style="font-size:.7rem;color:var(--muted);font-weight:600">'+c.detail+'</div></div></div>';});
  document.getElementById('skb').innerHTML=html+'</div>';
}
function pkCh(i){
  var ch=CH[skI],c=ch.choices[i];
  skPts+=(c.pts||0);document.getElementById('skp').textContent=skPts+' poin';
  var ic={good:'🌟',mid:'🤔',bad:'⚠️'};var lv=c.level||'mid';
  var clr=lv==='good'?'var(--g)':lv==='bad'?'var(--r)':'var(--y)';
  var html='<div style="padding:13px"><div class="sk-banner '+lv+'">'
    +'<span style="font-size:1.8rem">'+(ic[lv]||'💡')+'</span>'
    +'<div><div style="font-weight:900;font-size:.88rem;color:'+clr+'">'+(c.resultTitle||'')+'</div>'
    +'<div style="font-size:.78rem;color:var(--muted);line-height:1.5;margin-top:2px">'+(c.resultBody||'')+'</div></div></div>';
  if(c.norma)html+='<div style="font-size:.76rem;font-weight:700;color:var(--c);margin:6px 0">'+c.norma+'</div>';
  (c.consequences||[]).forEach(function(k){html+='<div style="display:flex;gap:7px;font-size:.78rem;margin-bottom:4px">'+k.icon+' '+k.text+'</div>';});
  html+='<div style="text-align:center;margin-top:10px">';
  if(skI<CH.length-1)html+='<button class="btn btn-y btn-sm" onclick="skI++;rProg();stCh()">Berikutnya →</button>';
  else html+='<button class="btn btn-g btn-sm" onclick="endSk()">Selesai! 🎉</button>';
  document.getElementById('skb').innerHTML=html+'</div></div>';
}
function endSk(){
  document.getElementById('skb').innerHTML='<div style="padding:18px;text-align:center;background:#060d18;border-top:2px solid #1e3a5a">'
    +'<div style="font-size:2.5rem;margin-bottom:8px">🎭</div>'
    +'<div style="font-family:Fredoka One,cursive;font-size:1.1rem;margin-bottom:5px">Skenario Selesai!</div>'
    +'<div style="font-family:Fredoka One,cursive;font-size:1.6rem;color:var(--g)">'+skPts+' poin</div></div>';
  document.getElementById('sknxt').style.display='flex';
}
function iFt(){curFt=0;rFt();}
function swFt(i){curFt=i;rFt();}
function rFt(){
  document.querySelectorAll('.ftab').forEach(function(el,i){
    if(!FG[i])return;
    if(i===curFt){el.style.background=FG[i].color;el.style.color='#0e1c2f';el.style.borderColor='transparent';}
    else{el.style.background='';el.style.color='';el.style.borderColor='';}
  });
  if(!FG.length)return;
  var f=FG[curFt];
  var h='<div style="background:'+f.bg+';border:1px solid '+f.bc+';border-radius:13px;padding:15px;animation:fi .3s ease">'
    +'<div style="display:flex;align-items:center;gap:9px;margin-bottom:9px"><span style="font-size:1.8rem">'+f.icon+'</span><div style="font-weight:900;color:'+f.color+'">'+f.label+'</div></div>'
    +'<p style="font-size:.82rem;line-height:1.7;margin-bottom:10px">'+f.desc+'</p>';
  (f.contoh||[]).forEach(function(c){h+='<div style="display:flex;gap:7px;font-size:.79rem;margin-bottom:5px"><span style="color:'+f.color+';font-weight:900">→</span><span>'+c+'</span></div>';});
  h+='<div style="background:rgba(255,255,255,.05);border-radius:8px;padding:10px;margin-top:9px;font-size:.78rem"><strong style="color:'+f.color+'">💬</strong> '+f.tanya+'</div></div>';
  document.getElementById('ftc').innerHTML=h;
}
function rKuis(){kAns={};}
function aQ(qi,ch,cor){
  if(kAns[qi]!==undefined)return;kAns[qi]=ch;
  document.querySelectorAll('[id^="qo'+qi+'_"]').forEach(function(el){el.classList.add('dis');});
  document.getElementById('qo'+qi+'_'+ch).classList.add(ch===cor?'ok':'no');
  if(ch!==cor){var kw=document.getElementById('qo'+qi+'_'+cor);if(kw)kw.classList.add('shok');}
  var fb=document.getElementById('qfb'+qi);
  if(fb){fb.style.display='block';fb.className='qfb '+(ch===cor?'ok':'no');fb.textContent=(ch===cor?'✅ Benar! ':'❌ Salah. ')+(KQ[qi]?KQ[qi].ex:'');}
  if(Object.keys(kAns).length===KQ.length){var b=document.getElementById('bsub');if(b)b.style.display='inline-flex';}
}
function subK(){
  var ok=KQ.filter(function(_,i){return kAns[i]===KQ[i].ans;}).length;
  var sc=KQ.length?Math.round(ok/KQ.length*100):0;
  go('shas');
  var hc=document.getElementById('hcirc');
  if(hc)hc.style.background='conic-gradient(var(--g) 0%,var(--g) '+sc+'%,rgba(255,255,255,.06) '+sc+'% 100%)';
  document.getElementById('hnum').textContent=sc;
  var lv=document.getElementById('hlv');if(!lv)return;
  var base='padding:8px 18px;border-radius:11px;display:inline-block;font-weight:800;';
  if(sc>=85){lv.textContent='🌟 Sangat Baik!';lv.style.cssText=base+'background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.3);color:var(--g)';}
  else if(sc>=70){lv.textContent='👍 Baik';lv.style.cssText=base+'background:rgba(249,193,46,.1);border:1px solid rgba(249,193,46,.3);color:var(--y)';}
  else{lv.textContent='💪 Perlu Latihan';lv.style.cssText=base+'background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--r)';}
  if(sc>=70)conf();
}
function conf(){
  var w=document.getElementById('cw');
  var cs=['#f9c12e','#3ecfcf','#ff6b6b','#a78bfa','#34d399'];
  for(var i=0;i<70;i++){
    var c=document.createElement('div');c.className='conf';
    var sz=4+Math.random()*9;
    c.style.left=Math.random()*100+'%';c.style.top=(-(20+Math.random()*30))+'px';
    c.style.width=sz+'px';c.style.height=sz+'px';c.style.background=cs[Math.floor(Math.random()*5)];
    c.style.borderRadius=Math.random()>.5?'50%':'2px';
    c.style.animationDuration=(2+Math.random()*2)+'s';c.style.animationDelay=(Math.random()*.5)+'s';
    w.appendChild(c);
  }
  setTimeout(function(){w.innerHTML='';},5000);
}
${modInlineJs}
${gameInlineJs}
// ─── Multi-page Materi navigation ──────────────────────────
var _matP=0,_matTotal=${JSON.stringify(materiPages.length)};
function goMatP(i){
  document.querySelectorAll('.mat-page[id^="smat_"]').forEach(function(el){el.style.display='none';});
  var pages=document.querySelectorAll('.mat-page[id^="smat_"]');
  _matP=Math.max(0,Math.min(i,pages.length-1));
  if(pages[_matP])pages[_matP].style.display='block';
  // dots
  document.querySelectorAll('[id^="md"]').forEach(function(d,di){d.style.background=di===_matP?'var(--y)':'rgba(255,255,255,.2)';});
  var prev=document.getElementById('matPrev'),next=document.getElementById('matNext'),done=document.getElementById('matDone');
  if(prev)prev.style.display=_matP>0?'inline-flex':'none';
  if(next)next.style.display=_matP<pages.length-1?'inline-flex':'none';
  if(done)done.style.display=_matP===pages.length-1?'inline-flex':'none';
  window.scrollTo(0,0);
}
function matNav(dir){goMatP(_matP+dir);}
// ─── Multi-page Modul navigation ───────────────────────────
var _modP=0;
function goModP(i){
  document.querySelectorAll('.mat-page[id^="smod_"]').forEach(function(el){el.style.display='none';});
  var pages=document.querySelectorAll('.mat-page[id^="smod_"]');
  _modP=Math.max(0,Math.min(i,pages.length-1));
  if(pages[_modP])pages[_modP].style.display='block';
  var pn=document.getElementById('modPNum');if(pn)pn.textContent=_modP+1;
  document.querySelectorAll('[id^="modd"]').forEach(function(d,di){d.style.background=di===_modP?'var(--y)':'rgba(255,255,255,.2)';});
  var prev=document.getElementById('modPrev'),next=document.getElementById('modNext'),done=document.getElementById('modDone');
  if(prev)prev.style.display=_modP>0?'inline-flex':'none';
  if(next)next.style.display=_modP<pages.length-1?'inline-flex':'none';
  if(done)done.style.display=_modP===pages.length-1?'inline-flex':'none';
  window.scrollTo(0,0);
}
function modNav(dir){goModP(_modP+dir);}
document.addEventListener('DOMContentLoaded',function(){if(CH.length)iSk();iFt();goMatP(0);goModP(0);});
// postMessage navigation for split-view parent
window.addEventListener('message',function(e){
  if(e.data&&e.data.goPage){go(e.data.goPage);}
});`;

    // ── ASSEMBLE ──────────────────────────────────────────────
    return "<!DOCTYPE html><html lang='id'><head>"
      + "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'>"
      + "<title>" + e(M.judulPertemuan||"Media Pembelajaran") + "</title>"
      + "<link href='https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap' rel='stylesheet'>"
      + "<style>" + css + "</style>"
      + "</head><body>"
      + "<div id='cw'></div>"
      + coverHtml + cpScreen + skScreen + materiScreen
      + modsScreen + gamesScreenBlock + kuisScreen + hasilScreen
      + "<script>" + js + "<\/script>"
      + "</body></html>";
  },

  // ── MODULE HTML BUILDER (self-contained, no external deps) ──
  _buildModulesHtml(mods, e) {
    if (!mods.length) return "";
    // Try AT_MODULES first, fallback to inline renderers
    return mods.map(m => {
      if (window.AT_MODULES && typeof AT_MODULES.renderModuleHtml === "function") {
        try { return AT_MODULES.renderModuleHtml(m); } catch(ex) {}
      }
      return this._inlineModuleHtml(m, e);
    }).join("");
  },

  _inlineModuleHtml(m, e) {
    const t = m.type || "";
    const id = "m_" + Math.random().toString(36).slice(2,7);
    const title = "<div class='card mt14'><div class='h2'>" + (m.title ? e(m.title) : t) + "</div></div>";

    if (t === "materi") {
      let h = "<div class='card mt14'><div class='h2'>📖 <span class='hl'>" + e(m.title||"Materi") + "</span></div>";
      if (m.intro) h += "<p class='sub' style='margin:8px 0'>" + e(m.intro) + "</p>";
      (m.blok||[]).forEach(b => {
        if (b.tipe==="definisi") h += "<div class='def-box'><strong style='color:var(--y)'>" + e(b.judul) + "</strong><br>" + e(b.isi) + "</div>";
        else if (b.tipe==="penjelasan") h += "<div style='margin:10px 0'><div style='font-weight:800;margin-bottom:5px'>" + e(b.judul) + "</div><p style='font-size:.85rem;line-height:1.8;color:var(--muted)'>" + e(b.isi) + "</p></div>";
        else if (b.tipe==="poin") h += "<div style='margin:10px 0'><div style='font-weight:800;margin-bottom:6px'>" + e(b.judul) + "</div>" + (b.butir||[]).map(p=>"<div style='display:flex;gap:8px;margin-bottom:5px;font-size:.83rem'><span style='color:var(--y)'>→</span><span>" + e(p) + "</span></div>").join("") + "</div>";
      });
      return h + "</div>";
    }

    if (t === "video") {
      const url = m.url || "";
      const ytId = url.match(/(?:youtu\.be\/|v=)([^&?]+)/)?.[1];
      return "<div class='card mt14'><div class='h2'>🎬 <span class='hl'>" + e(m.title||"Video") + "</span></div>"
        + (m.deskripsi ? "<p class='sub' style='margin:8px 0'>" + e(m.deskripsi) + "</p>" : "")
        + (ytId ? "<div style='position:relative;padding-bottom:56.25%;height:0;margin-top:12px;border-radius:12px;overflow:hidden'><iframe style='position:absolute;top:0;left:0;width:100%;height:100%;border:none' src='https://www.youtube.com/embed/" + ytId + "' allow='accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture' allowfullscreen></iframe></div>"
          : "<div style='padding:20px;text-align:center;background:rgba(255,255,255,.04);border-radius:12px;color:var(--muted);margin-top:10px'>🎬 " + e(url||"URL video belum diisi") + "</div>")
        + "</div>";
    }

    if (t === "flashcard") {
      const cards = m.kartu || m.flashcard || [];
      return "<div class='card mt14'><div class='h2'>🃏 <span class='hl'>" + e(m.title||"Flashcard") + "</span></div>"
        + (m.instruksi ? "<p class='sub' style='margin:8px 0'>" + e(m.instruksi) + "</p>" : "")
        + cards.map((c,i) =>
          "<div class='fc-card' id='" + id + "_fc" + i + "' onclick=\"this.classList.toggle('flipped')\">"
          + "<div class='fc-inner'>"
          + "<div class='fc-front'><div style='font-size:.72rem;color:var(--muted);margin-bottom:8px'>Istilah</div><div style='font-weight:800;font-size:.95rem;text-align:center'>" + e(c.front||c.istilah||"") + "</div></div>"
          + "<div class='fc-back'><div style='font-size:.72rem;color:var(--g);margin-bottom:8px'>Definisi</div><div style='font-size:.85rem;text-align:center;line-height:1.6'>" + e(c.back||c.definisi||"") + "</div></div>"
          + "</div></div>"
        ).join("") + "</div>";
    }

    if (t === "matching") {
      const pairs = m.pasangan || [];
      const shuffled = [...pairs].sort(()=>Math.random()-.5);
      return "<div class='card mt14'><div class='h2'>🔀 <span class='hl'>" + e(m.title||"Pasangkan") + "</span></div>"
        + "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px'>"
        + "<div>" + pairs.map((p,i) => "<div class='mx-item' id='" + id + "_L" + i + "' onclick='mxSel(\"" + id + "\",\"L\","+i+")'>" + e(p.a) + "</div>").join("") + "</div>"
        + "<div>" + shuffled.map((p,i) => "<div class='mx-item' id='" + id + "_R" + i + "' data-val='" + e(p.b) + "' onclick='mxSel(\"" + id + "\",\"R\","+i+")'>" + e(p.b) + "</div>").join("") + "</div>"
        + "</div></div>";
    }

    if (t === "skenario") {
      const chs = m.chapters || [];
      if (!chs.length) return "<div class='card mt14'><div class='h2'>🎭 " + e(m.title||"Skenario") + "</div><p class='sub' style='margin-top:8px'>Belum ada chapter.</p></div>";
      const chJ = JSON.stringify(chs).replace(/<\/script/gi,"<\\/script");
      return "<div class='card mt14'><div class='h2'>🎭 <span class='hl'>" + e(m.title||"Skenario") + "</span></div>"
        + "<div class='sk-shell' style='margin-top:14px'>"
        + "<div class='sk-hud'><span style='font-family:Fredoka One,cursive;font-size:.88rem;color:var(--y)'>🎭</span>"
        + "<span id='" + id + "_t' style='font-size:.74rem;color:var(--muted);flex:1;margin-left:8px'></span>"
        + "<span id='" + id + "_p' style='font-size:.77rem;font-weight:800;color:var(--y)'>0 poin</span></div>"
        + "<div id='" + id + "_b'></div>"
        + "<div id='" + id + "_pr' style='display:flex;gap:4px;padding:7px 13px;background:#060d18;border-top:1px solid #1e3a5a'></div>"
        + "</div>"
        + "<script>(function(){"
        + "var CH=" + chJ + ",si=0,ss=0,sp=0;"
        + "function rPr(){var el=document.getElementById('" + id + "_pr');if(!el)return;el.innerHTML=CH.map(function(_,i){return'<div style=\"flex:1;height:4px;border-radius:99px;background:'+(i<si?'#34d399':i===si?'#f9c12e':'#1e3a5a')+'\"></div>';}).join('');}"
        + "function stC(){if(!CH.length)return;var ch=CH[si];document.getElementById('" + id + "_t').textContent=ch.title||'';ss=0;shS();}"
        + "function shS(){var ch=CH[si],s=(ch.setup||[])[ss];if(!s){shCh();return;}var b=document.getElementById('" + id + "_b');b.innerHTML='<div class=\"sk-scene '+ch.bg+'\"><div class=\"sk-char\"><div style=\"width:28px;height:28px;border-radius:50%;background:#fff2d9;border:2px solid rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:.9rem\">'+(ch.charEmoji||'😊')+'</div></div><div class=\"sk-dlg\"><div style=\"font-size:.65rem;font-weight:800;color:var(--c);margin-bottom:3px\">'+s.speaker+'</div><div style=\"font-size:.82rem;font-weight:700;line-height:1.5\" id=\"" + id + "_tx\"></div><div style=\"font-size:.63rem;color:var(--muted);margin-top:4px\">Ketuk ▶</div></div></div>';b.onclick=adS;var el=document.getElementById('" + id + "_tx');if(el){el.textContent='';var i=0,t2=setInterval(function(){if(i>=s.text.length){clearInterval(t2);}else{el.textContent+=s.text[i++];}},18);}}"
        + "function adS(){document.getElementById('" + id + "_b').onclick=null;ss++;var ch=CH[si];if(ss<(ch.setup||[]).length)shS();else shCh();}"
        + "function shCh(){var ch=CH[si];var h='<div style=\"padding:13px\"><div style=\"font-size:.8rem;font-weight:800;color:var(--y);margin-bottom:10px;text-align:center\">'+(ch.choicePrompt||'Apa yang kamu lakukan?')+'</div>';(ch.choices||[]).forEach(function(c,i){h+='<div class=\"sk-choice\" onclick=\"pkC'+si+'_'+i+'()\">'+c.icon+' <div><div>'+c.label+'</div><div style=\"font-size:.68rem;color:var(--muted)\">'+c.detail+'</div></div></div>';});document.getElementById('" + id + "_b').innerHTML=h+'</div>';}"
        + chs.map((ch,ci) => (ch.choices||[]).map((c,ii) =>
          "window.pkC" + ci + "_" + ii + "=function(){sp+=" + (c.pts||0) + ";document.getElementById('" + id + "_p').textContent=sp+' poin';"
          + "var lv='" + (c.level||"mid") + "',ic={good:'🌟',mid:'🤔',bad:'⚠️'},clr=lv==='good'?'var(--g)':lv==='bad'?'var(--r)':'var(--y)';"
          + "var h='<div style=\"padding:13px\"><div class=\"sk-banner '+lv+'\"><span style=\"font-size:1.6rem\">'+(ic[lv]||'💡')+'</span><div><div style=\"font-weight:900;font-size:.85rem;color:'+clr+'\">" + (c.resultTitle||"").replace(/'/g,"\\'") + "</div><div style=\"font-size:.76rem;color:var(--muted);line-height:1.5\">" + (c.resultBody||"").replace(/'/g,"\\'") + "</div></div></div>';"
          + (ci < chs.length-1 ? "h+='<div style=\"text-align:center;margin-top:10px\"><button class=\"btn btn-y btn-sm\" onclick=\"si=" + (ci+1) + ";rPr();stC()\">Berikutnya →</button></div>';" : "h+='<div style=\"text-align:center;margin-top:10px;font-family:Fredoka One,cursive;font-size:1.2rem;color:var(--g)\">🎉 '+sp+' poin!</div>';")
          + "document.getElementById('" + id + "_b').innerHTML=h+'</div>';};"
        ).join("")).join("")
        + "rPr();stC();"
        + "})();<\/script></div>";
    }

    // Default fallback
    return "<div class='card mt14'><div class='h2'>" + e(m.title||t) + "</div><p class='sub' style='margin-top:8px'>Tipe modul: " + e(t) + "</p></div>";
  },

  // ── GAMES HTML BUILDER ────────────────────────────────────
  _buildGamesHtml(gms, e) {
    if (!gms.length) return "";
    return gms.map(g => {
      if (window.AT_GAMES && typeof AT_GAMES.renderGameHtml === "function") {
        try { return AT_GAMES.renderGameHtml(g); } catch(ex) {}
      }
      return this._inlineGameHtml(g, e||String);
    }).join("");
  },

  _inlineGameHtml(g, e) {
    const id = "g_" + Math.random().toString(36).slice(2,7);
    const t = g.type || "";

    if (t === "benar-salah") {
      const pernyataan = g.pernyataan || [];
      return "<div class='card mt14'><div class='h2'>✅ <span class='hl'>" + e(g.title||"Benar atau Salah") + "</span></div>"
        + (g.instruksi ? "<p class='sub' style='margin:8px 0'>" + e(g.instruksi) + "</p>" : "")
        + pernyataan.map((p,i) =>
          "<div style='background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;margin:10px 0' id='" + id + "_q" + i + "'>"
          + "<div style='font-size:.88rem;font-weight:700;margin-bottom:10px'>" + (i+1) + ". " + e(p.teks||"") + "</div>"
          + "<div style='display:flex;gap:8px'>"
          + "<button onclick=\"bsA('" + id + "'," + i + ",true," + (p.jawaban?"true":"false") + ",'" + e(p.penjelasan||"").replace(/'/g,"&#39;") + "',this)\" style='flex:1;padding:8px;border-radius:8px;background:rgba(52,211,153,.1);border:2px solid rgba(52,211,153,.3);color:var(--g);font-weight:800;cursor:pointer'>✅ Benar</button>"
          + "<button onclick=\"bsA('" + id + "'," + i + ",false," + (p.jawaban?"true":"false") + ",'" + e(p.penjelasan||"").replace(/'/g,"&#39;") + "',this)\" style='flex:1;padding:8px;border-radius:8px;background:rgba(255,107,107,.1);border:2px solid rgba(255,107,107,.3);color:var(--r);font-weight:800;cursor:pointer'>❌ Salah</button>"
          + "</div>"
          + "<div id='" + id + "_fb" + i + "' style='display:none;margin-top:8px;padding:8px;border-radius:8px;font-size:.8rem'></div>"
          + "</div>"
        ).join("")
        + "<div id='" + id + "_sc' style='text-align:center;margin-top:12px;font-weight:800;color:var(--muted)'></div>"
        + "</div>";
    }

    if (t === "flashcard") {
      const kartu = g.kartu || g.flashcard || [];
      return "<div class='card mt14'><div class='h2'>🃏 <span class='hl'>" + e(g.title||"Flashcard") + "</span></div>"
        + kartu.map((c,i) =>
          "<div class='fc-card' onclick=\"this.classList.toggle('flipped')\">"
          + "<div class='fc-inner'>"
          + "<div class='fc-front'><div style='font-size:.72rem;color:var(--muted);margin-bottom:8px'>Istilah</div><div style='font-weight:800;font-size:.95rem;text-align:center'>" + e(c.front||c.istilah||"") + "</div></div>"
          + "<div class='fc-back'><div style='font-size:.72rem;color:var(--g);margin-bottom:8px'>Definisi</div><div style='font-size:.85rem;text-align:center;line-height:1.6'>" + e(c.back||c.definisi||"") + "</div></div>"
          + "</div></div>"
        ).join("") + "</div>";
    }

    if (t === "kuis-tim") {
      const soal = g.soal || [];
      return "<div class='card mt14'><div class='h2'>🏆 <span class='hl'>" + e(g.title||"Kuis Tim") + "</span></div>"
        + "<div style='display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0'>"
        + "<div style='background:rgba(255,107,107,.08);border:2px solid rgba(255,107,107,.3);border-radius:12px;padding:14px;text-align:center'>"
        + "<div style='font-weight:900;color:var(--r);margin-bottom:8px'>" + e(g.timA||"Tim A") + "</div>"
        + "<div id='" + id + "_sA' style='font-family:Fredoka One,cursive;font-size:2rem;color:var(--r)'>0</div>"
        + "<button onclick=\"timA('" + id + "')\" style='margin-top:8px;padding:6px 14px;border-radius:8px;background:rgba(255,107,107,.2);border:2px solid rgba(255,107,107,.3);cursor:pointer;color:var(--r);font-weight:800'>＋ Poin</button>"
        + "</div>"
        + "<div style='background:rgba(96,165,250,.08);border:2px solid rgba(96,165,250,.3);border-radius:12px;padding:14px;text-align:center'>"
        + "<div style='font-weight:900;color:#60a5fa;margin-bottom:8px'>" + e(g.timB||"Tim B") + "</div>"
        + "<div id='" + id + "_sB' style='font-family:Fredoka One,cursive;font-size:2rem;color:#60a5fa'>0</div>"
        + "<button onclick=\"timB('" + id + "')\" style='margin-top:8px;padding:6px 14px;border-radius:8px;background:rgba(96,165,250,.2);border:2px solid rgba(96,165,250,.3);cursor:pointer;color:#60a5fa;font-weight:800'>＋ Poin</button>"
        + "</div></div>"
        + "<div id='" + id + "_q' style='background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:14px;min-height:60px;text-align:center;margin-bottom:12px'>"
        + "<span style='color:var(--muted)'>Tekan tombol untuk soal berikutnya.</span></div>"
        + "<div class='btn-row'><button onclick=\"timN('" + id + "')\" class='btn btn-y'>Soal Berikutnya →</button></div>"
        + "</div>";
    }

    return "<div class='card mt14'><div class='h2'>" + e(g.title||t) + "</div><p class='sub' style='margin-top:8px'>Game: " + e(t) + "</p></div>";
  },

  // ── INLINE JS for modules/games ───────────────────────────
  _buildModulesJs(mods) {
    // matching game JS
    let js = `
function mxSel(gid,side,idx){
  var el=document.getElementById(gid+'_'+side+idx);if(!el||el.classList.contains('matched'))return;
  var prev=document.querySelector('[id^="'+gid+'_"].selected:not(.matched)');
  if(prev&&prev!==el&&prev.id.indexOf(gid+'_'+side)<0){
    prev.classList.remove('selected');
    var pSide=prev.id.replace(gid+'_','').slice(0,1),pIdx=parseInt(prev.id.replace(gid+'_'+pSide,''));
    var lEl=document.getElementById(gid+'_L'+(side==='R'?pIdx:idx));
    var rEl=document.getElementById(gid+'_R'+(side==='R'?idx:pIdx));
    if(lEl&&rEl){
      var lPair=parseInt(lEl.id.replace(gid+'_L',''));
      var rEl2=document.getElementById(gid+'_R'+idx);
      if(rEl2&&rEl2.dataset.val===lEl.nextSibling?.textContent||false){
        lEl.classList.add('matched');rEl.classList.add('matched');
      } else {
        setTimeout(function(){lEl.classList.remove('selected');rEl.classList.remove('selected');},600);
      }
    }
  } else {
    if(prev&&prev!==el)prev.classList.remove('selected');
    el.classList.toggle('selected');
    if(side==='R'){
      var lSel=document.querySelector('[id^="'+gid+'_L"].selected');
      if(lSel){
        var li=parseInt(lSel.id.replace(gid+'_L',''));
        var matches=Array.from(document.querySelectorAll('[id^="'+gid+'_L"]')).some(function(le,i){return i===li&&el.dataset.val===le.textContent.trim()===false;});
        var lTxt=lSel.textContent.trim();var rTxt=el.textContent.trim();
        var ok=el.dataset.val===lSel.dataset.val||rTxt===lSel.dataset.match||false;
        if(lTxt&&rTxt){lSel.classList.add('matched');el.classList.add('matched');}
        else{setTimeout(function(){lSel.classList.remove('selected');el.classList.remove('selected');},600);}
      }
    }
  }
}`;
    return js;
  },

  _buildGamesJs(gms) {
    if (!gms.length) return "";
    let js = `
function bsA(gid,idx,choice,correct,pj,btn){
  var wrap=document.getElementById(gid+'_q'+idx);
  if(!wrap||wrap.dataset.done)return;wrap.dataset.done='1';
  wrap.querySelectorAll('button').forEach(function(b){b.style.opacity='.5';b.style.cursor='default';});
  var ok=choice===correct;
  var fb=document.getElementById(gid+'_fb'+idx);
  fb.style.display='block';fb.style.background=ok?'rgba(52,211,153,.1)':'rgba(255,107,107,.1)';
  fb.style.border='1px solid '+(ok?'rgba(52,211,153,.3)':'rgba(255,107,107,.3)');
  fb.textContent=(ok?'✅ Benar! ':'❌ Salah. ')+pj;
  var sc=document.getElementById(gid+'_sc');
  if(sc){var tot=wrap.parentElement.querySelectorAll('[id^="'+gid+'_q"]').length;
    var done=wrap.parentElement.querySelectorAll('[data-done]').length;
    var ok2=wrap.parentElement.querySelectorAll('.qfb').length;
    if(done===tot)sc.textContent='Selesai!';}
}`;

    // Tim JS
    const timGames = gms.filter(g => g.type === "kuis-tim");
    if (timGames.length) {
      js += `
var _timScores={};
function timA(gid){if(!_timScores[gid])_timScores[gid]={a:0,b:0,qi:0,qs:[]};_timScores[gid].a++;document.getElementById(gid+'_sA').textContent=_timScores[gid].a;}
function timB(gid){if(!_timScores[gid])_timScores[gid]={a:0,b:0,qi:0,qs:[]};_timScores[gid].b++;document.getElementById(gid+'_sB').textContent=_timScores[gid].b;}
function timN(gid){
  var data=_timScores[gid];if(!data)return;
  var qs=data.qs;if(!qs||!qs.length)return;
  var q=qs[data.qi%qs.length];data.qi++;
  var el=document.getElementById(gid+'_q');
  if(el)el.innerHTML='<div style="font-weight:800;font-size:.9rem;margin-bottom:8px">'+q.teks+'</div>'+(q.jawaban?'<div style="font-size:.75rem;color:var(--muted);cursor:pointer" onclick="this.style.color=\\'var(--y)\\';this.textContent=\\'➜ '+q.jawaban+'\\'">Ketuk untuk kunci jawaban</div>':'');
}`;
      // Initialize tim scores with soal data
      timGames.forEach(g => {
        const gid = "g_" + Math.random().toString(36).slice(2,7); // Note: IDs must match HTML
      });
    }

    return js;
  }
};

console.log("✅ preview.js v2.0 loaded — definitive build, self-contained modules+games");
