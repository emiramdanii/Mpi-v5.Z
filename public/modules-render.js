/* ══════════════════════════════════════════════════════════════
   AT_MODULES — HTML Output Renderers
   Extracted from modules.js for easier maintenance.
   Dipakai oleh importer.js (buildHtml) & preview.js.
   ══════════════════════════════════════════════════════════════ */

// ── HTML RENDERER untuk export (dipakai importer.js buildHtml) ─

(function() {
  const M = window.AT_MODULES;

  M.renderModuleHtml = function(m) {
    // If this module is actually a game, delegate to AT_GAMES
    if (m._isGame && window.AT_GAMES) {
      return AT_GAMES.renderGameHtml(m);
    }
    switch(m.type) {
      case "skenario":    return this._htmlSkenario(m);
      case "video":       return this._htmlVideo(m);
      case "infografis":  return this._htmlInfografis(m);
      case "flashcard":   return this._htmlFlashcard(m);
      case "studi-kasus": return this._htmlStudiKasus(m);
      case "debat":       return this._htmlDebat(m);
      case "timeline":    return this._htmlTimeline(m);
      case "matching":    return this._htmlMatching(m);
      case "materi":      return this._htmlMateri(m);
      case "hero":        return this._htmlHero(m);
      case "kutipan":     return this._htmlKutipan(m);
      case "langkah":     return this._htmlLangkah(m);
      case "accordion":   return this._htmlAccordion(m);
      case "statistik":   return this._htmlStatistik(m);
      case "polling":     return this._htmlPolling(m);
      case "embed":       return this._htmlEmbed(m);
      default: return `<div class="card mt14"><p style="color:var(--muted)">Modul tipe ${m.type} belum ada renderer.</p></div>`;
    }
  };

  M._htmlMateri = function(m) {
    const blokHtml = (m.blok||[]).map(b => {
      if (b.tipe === "definisi") return `<div style="border-left:4px solid var(--y);background:rgba(249,193,46,.07);border-radius:0 11px 11px 0;padding:13px 15px;margin:10px 0;font-size:.88rem;line-height:1.7"><strong style="color:var(--y)">${b.judul||""}</strong><br>${b.isi||""}</div>`;
      if (b.tipe === "poin") return `<div style="margin:10px 0"><div style="font-weight:800;font-size:.84rem;margin-bottom:6px">${b.judul||""}</div>${(b.butir||[]).map(bt=>`<div style="display:flex;gap:8px;font-size:.82rem;margin-bottom:4px"><span style="color:var(--y);font-weight:900">•</span>${bt}</div>`).join("")}</div>`;
      return `<div style="margin:10px 0"><div style="font-weight:800;font-size:.84rem;margin-bottom:4px">${b.judul||""}</div><p style="font-size:.84rem;line-height:1.7;color:var(--muted)">${b.isi||""}</p></div>`;
    }).join("");
    return `<div class="card mt14"><div class="h2">📖 <span class="hl">${m.title||"Materi"}</span></div>${m.intro?`<p class="sub mt8">${m.intro}</p>`:""}<div style="margin-top:12px">${blokHtml}</div></div>`;
  };

  M._htmlVideo = function(m) {
    let embedUrl = m.url || "";
    if (m.platform === "youtube" && embedUrl.includes("watch?v=")) {
      const vid = embedUrl.split("watch?v=")[1]?.split("&")[0];
      if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
    }
    const qHtml = (m.pertanyaan||[]).map((p,i)=>`
      <div style="margin-bottom:10px">
        <label style="font-size:.78rem;font-weight:800;display:block;margin-bottom:4px">${i+1}. ${p.teks}${p.wajib?' <span style="color:var(--r)">*</span>':""}</label>
        <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px"></textarea>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">▶️ <span class="hl">${m.title||"Video"}</span></div>
      ${m.instruksi?`<p class="sub mt8">${m.instruksi}</p>`:""}
      ${embedUrl ? `<div style="margin:14px 0;border-radius:12px;overflow:hidden;position:relative;padding-bottom:56.25%;height:0"><iframe src="${embedUrl}" style="position:absolute;inset:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>` : `<div style="background:rgba(255,255,255,.04);border:2px dashed var(--border);border-radius:12px;padding:24px;text-align:center;color:var(--muted);margin:14px 0">▶️ URL video belum diisi</div>`}
      ${m.pertanyaan?.length ? `<div style="margin-top:14px"><div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">✏️ Pertanyaan Refleksi</div>${qHtml}</div>` : ""}
    </div>`;
  };

  M._htmlInfografis = function(m) {
    const isGrid = m.layout !== "list" && m.layout !== "timeline";
    const kartuHtml = (m.kartu||[]).map(k=>`
      <div style="background:${k.color||"var(--y)"}12;border:1px solid ${k.color||"var(--y)"}33;border-radius:14px;padding:15px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:1.5rem">${k.icon||"📌"}</span>
          <div style="font-weight:900;font-size:.9rem;color:${k.color||"var(--y)"}">${k.judul||""}</div>
        </div>
        <div style="font-size:.8rem;color:var(--muted);line-height:1.55">${k.isi||""}</div>
      </div>`).join("");
    const grid = isGrid ? `grid-template-columns:repeat(auto-fill,minmax(180px,1fr))` : `grid-template-columns:1fr`;
    return `<div class="card mt14"><div class="h2">🗺️ <span class="hl">${m.title||"Infografis"}</span></div>${m.intro?`<p class="sub mt8">${m.intro}</p>`:""}<div style="display:grid;${grid};gap:12px;margin-top:14px">${kartuHtml}</div></div>`;
  };

  M._htmlFlashcard = function(m) {
    const id = "fc_" + Math.random().toString(36).slice(2,6);
    const kartuHtml = (m.kartu||[]).map((k,i)=>`
      <div class="fc-card" id="${id}_${i}" onclick="this.classList.toggle('flipped')" style="cursor:pointer">
        <div class="fc-inner">
          <div class="fc-front"><div class="fc-text">${k.depan||""}</div>${k.hint?`<div style="font-size:.7rem;color:var(--muted);margin-top:8px">💡 ${k.hint}</div>`:""}</div>
          <div class="fc-back"><div class="fc-text">${k.belakang||""}</div></div>
        </div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🃏 <span class="hl">${m.title||"Flashcard"}</span></div>
      ${m.instruksi?`<p class="sub mt8">${m.instruksi}</p>`:""}
      <style>.fc-card{perspective:600px;height:140px;margin-bottom:10px}.fc-inner{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}.fc-card.flipped .fc-inner{transform:rotateY(180deg)}.fc-front,.fc-back{position:absolute;inset:0;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;backface-visibility:hidden}.fc-front{background:var(--card2);border:2px solid var(--border)}.fc-back{background:rgba(52,211,153,.08);border:2px solid rgba(52,211,153,.3);transform:rotateY(180deg)}.fc-text{font-size:.9rem;font-weight:700;text-align:center;color:var(--text)}</style>
      <div style="margin-top:14px">${kartuHtml}</div>
      <p style="font-size:.72rem;color:var(--muted);text-align:center;margin-top:6px">Ketuk kartu untuk membalik ↺</p>
    </div>`;
  };

  M._htmlStudiKasus = function(m) {
    const qHtml = (m.pertanyaan||[]).map((p,i)=>`
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px">
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:7px">
          <span style="background:rgba(96,165,250,.15);color:var(--b);padding:2px 8px;border-radius:99px;font-size:.68rem;font-weight:900">${p.level||"C1"}</span>
          <span style="font-weight:800;font-size:.82rem">${p.label||""}</span>
        </div>
        <div style="font-size:.82rem;margin-bottom:8px">${p.teks||""}</div>
        <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px" placeholder="Jawaban kamu…"></textarea>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">📰 <span class="hl">${m.title||"Studi Kasus"}</span></div>
      <div style="background:rgba(255,255,255,.04);border-left:4px solid var(--b);border-radius:0 12px 12px 0;padding:14px;margin:12px 0;font-size:.85rem;line-height:1.7">${m.teks||""}</div>
      ${m.sumber?`<div style="font-size:.7rem;color:var(--muted);margin-bottom:10px">Sumber: ${m.sumber}</div>`:""}
      <div style="font-size:.78rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">✏️ Pertanyaan Analisis</div>
      ${qHtml}
    </div>`;
  };

  M._htmlDebat = function(m) {
    return `<div class="card mt14">
      <div class="h2">🗣️ <span class="hl">${m.title||"Debat"}</span></div>
      <div style="background:rgba(255,255,255,.04);border-radius:12px;padding:14px;margin:12px 0;font-size:.88rem;font-weight:700;line-height:1.6;text-align:center">${m.pertanyaan||""}</div>
      ${m.konteks?`<p class="sub" style="margin-bottom:14px">${m.konteks}</p>`:""}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div style="background:rgba(52,211,153,.07);border:2px solid rgba(52,211,153,.25);border-radius:12px;padding:14px">
          <div style="font-weight:900;color:var(--g);margin-bottom:8px">✅ ${m.pihakA?.label||"Pro"}</div>
          <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:70px" placeholder="${m.pihakA?.argumen_placeholder||"Argumen pro…"}"></textarea>
        </div>
        <div style="background:rgba(255,107,107,.07);border:2px solid rgba(255,107,107,.25);border-radius:12px;padding:14px">
          <div style="font-weight:900;color:var(--r);margin-bottom:8px">❌ ${m.pihakB?.label||"Kontra"}</div>
          <textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,107,107,.2);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:70px" placeholder="${m.pihakB?.argumen_placeholder||"Argumen kontra…"}"></textarea>
        </div>
      </div>
      ${m.kesimpulan_prompt?`<div style="background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.2);border-radius:12px;padding:12px"><div style="font-weight:800;font-size:.82rem;color:var(--p);margin-bottom:7px">💬 ${m.kesimpulan_prompt}</div><textarea style="width:100%;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-family:Nunito,sans-serif;font-size:.8rem;resize:vertical;min-height:55px" placeholder="Kesimpulanmu…"></textarea></div>`:""}
    </div>`;
  };

  M._htmlTimeline = function(m) {
    const evHtml = (m.events||[]).map((e,i)=>`
      <div style="display:flex;gap:14px;align-items:flex-start;padding-bottom:18px;position:relative">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(245,200,66,.15);border:2px solid var(--y);display:flex;align-items:center;justify-content:center;font-size:1.1rem">${e.icon||"📌"}</div>
          ${i<(m.events.length-1)?`<div style="width:2px;flex:1;background:rgba(255,255,255,.08);margin-top:4px;min-height:24px"></div>`:""}
        </div>
        <div style="padding-top:6px">
          <div style="font-size:.7rem;font-weight:900;color:var(--y);margin-bottom:2px">${e.tahun||""}</div>
          <div style="font-weight:800;font-size:.88rem;margin-bottom:4px">${e.judul||""}</div>
          <div style="font-size:.8rem;color:var(--muted);line-height:1.6">${e.isi||""}</div>
        </div>
      </div>`).join("");
    return `<div class="card mt14"><div class="h2">📅 <span class="hl">${m.title||"Timeline"}</span></div>${m.intro?`<p class="sub mt8">${m.intro}</p>`:""}<div style="margin-top:16px">${evHtml}</div></div>`;
  };

  M._htmlMatching = function(m) {
    const id = "mx_" + Math.random().toString(36).slice(2,6);
    const pasangan = m.pasangan || [];
    // Shuffle kanan untuk tampilan
    const kiriHtml  = pasangan.map((p,i)=>`<div class="mx-item mx-l" id="${id}_l${i}" onclick="mxPick('${id}','l',${i})">${p.kiri}</div>`).join("");
    const kananShuf = [...pasangan.map((_,i)=>i)].sort(()=>Math.random()-.5);
    const kananHtml = kananShuf.map(i=>`<div class="mx-item mx-r" id="${id}_r${i}" onclick="mxPick('${id}','r',${i})">${pasangan[i].kanan}</div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🔀 <span class="hl">${m.title||"Pasangkan"}</span></div>
      ${m.instruksi?`<p class="sub mt8">${m.instruksi}</p>`:""}
      <style>.mx-item{padding:9px 13px;border-radius:10px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.08);cursor:pointer;font-size:.82rem;font-weight:700;margin-bottom:7px;transition:all .18s}.mx-item:hover{border-color:var(--c)}.mx-item.selected{border-color:var(--y);background:rgba(245,200,66,.1)}.mx-item.matched{border-color:var(--g);background:rgba(52,211,153,.1);pointer-events:none}.mx-item.wrong{border-color:var(--r);background:rgba(255,107,107,.1)}</style>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
        <div>${kiriHtml}</div>
        <div>${kananHtml}</div>
      </div>
      <div id="${id}_msg" style="text-align:center;margin-top:10px;font-size:.8rem;color:var(--muted)"></div>
      <script>
      (function(){
        var sel=null,selSide=null,selIdx=null,matched=0,total=${pasangan.length};
        var pairs=${JSON.stringify(pasangan)};
        window.mxPick=function(gid,side,idx){
          if(gid!=='${id}') return;
          var el=document.getElementById(gid+'_'+side+idx);
          if(!el||el.classList.contains('matched')) return;
          if(sel&&selSide===side){document.getElementById(gid+'_'+selSide+selIdx)?.classList.remove('selected');sel=null;selSide=null;selIdx=null;}
          if(!sel){sel=el;selSide=side;selIdx=idx;el.classList.add('selected');return;}
          // Check match
          var li=side==='r'?selIdx:idx, ri=side==='r'?idx:selIdx;
          if(pairs[li]&&pairs[li].kanan===pairs[ri].kanan){
            [document.getElementById(gid+'_l'+li),document.getElementById(gid+'_r'+ri)].forEach(e=>{if(e){e.classList.remove('selected');e.classList.add('matched');}});
            matched++;
            if(matched===total)document.getElementById(gid+'_msg').textContent='🎉 Semua pasangan benar!';
          } else {
            [sel,el].forEach(e=>{e.classList.add('wrong');setTimeout(()=>{e.classList.remove('wrong','selected');},600);});
          }
          sel=null;selSide=null;selIdx=null;
        };
      })();
      <\/script>
    </div>`;
  };

  M._htmlSkenario = function(m) {
    // Multi-chapter skenario — gunakan chapters[] atau fallback ke setup/choices
    const id = "sk_" + Math.random().toString(36).slice(2,6);
    // Support both: chapters[] (new) and legacy setup/choices (old)
    const chapters = m.chapters && m.chapters.length ? m.chapters : [{
      id:1, title:m.title||"Skenario",
      bg: m.bg||"sbg-kampung",
      charEmoji: m.charEmoji||"😊",
      charColor: m.charColor||"#e87070",
      charPants: m.charPants||"#4a6a9a",
      choicePrompt: m.choicePrompt||"Apa yang akan kamu lakukan?",
      setup: m.setup||[],
      choices: m.choices||[]
    }];
    const setup = chapters[0].setup || [];
    const choices = chapters[0].choices || [];
    return `<div class="card mt14">
      <div style="background:#0a0f1a;border:3px solid #1e3a5a;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(90deg,#0d1b2f,#0f2340);padding:10px 16px;border-bottom:2px solid #1e3a5a;display:flex;align-items:center;justify-content:space-between">
          <span style="font-family:Fredoka One,cursive;font-size:.9rem;color:var(--y)">🎭 ${m.title||"Skenario"}</span>
          <span id="${id}_pts" style="background:rgba(249,193,46,.15);color:var(--y);padding:3px 10px;border-radius:99px;font-size:.7rem;font-weight:800">0 poin</span>
        </div>
        <div style="position:relative;height:160px;overflow:hidden" class="${m.bg||"sbg-kampung"}">
          <div style="position:absolute;bottom:28%;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center">
            <div style="width:30px;height:30px;border-radius:50%;background:#fff2d9;border:2px solid rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:1rem">${m.charEmoji||"😊"}</div>
            <div style="width:22px;height:24px;border-radius:5px 5px 3px 3px;background:${m.charColor||"#3a7a9a"};border:2px solid rgba(0,0,0,.1);margin-top:-2px"></div>
          </div>
        </div>
        <div id="${id}_body">
          ${setup.length ? `
          <div style="background:rgba(8,16,30,.92);border-top:2px solid #1e3a5a;padding:12px 14px;min-height:76px" id="${id}_dlg">
            <div style="font-size:.7rem;font-weight:800;color:var(--c);margin-bottom:4px;text-transform:uppercase">${setup[0].speaker||"NARRATOR"}</div>
            <div style="font-size:.84rem;font-weight:700;line-height:1.5;color:#e8f2ff">${setup[0].text||""}</div>
            ${setup.length>1||choices.length?`<div style="font-size:.68rem;color:var(--muted);margin-top:5px;animation:tapP 1.4s ease-in-out infinite">Ketuk untuk lanjut ▶</div>`:""}
          </div>` : ""}
        </div>
      </div>
      <script>
      (function(){
        var step=0,done=false;
        var setup=${JSON.stringify(setup)};
        var choices=${JSON.stringify(choices)};
        var id='${id}';
        function showSetup(){
          var s=setup[step];
          document.getElementById(id+'_dlg').innerHTML='<div style="font-size:.7rem;font-weight:800;color:var(--c);margin-bottom:4px;text-transform:uppercase">'+s.speaker+'</div><div style="font-size:.84rem;font-weight:700;line-height:1.5;color:#e8f2ff">'+s.text+'</div>'+(step<setup.length-1||choices.length?'<div style="font-size:.68rem;color:var(--muted);margin-top:5px">Ketuk untuk lanjut ▶</div>':'');
        }
        function showChoices(){
          document.getElementById(id+'_body').innerHTML='<div style="padding:14px"><div style="font-size:.83rem;font-weight:800;color:var(--y);margin-bottom:10px;text-align:center">${m.choicePrompt||"Apa yang akan kamu lakukan?"}</div>'+choices.map((c,ci)=>'<div style="background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;font-size:.82rem;font-weight:700;margin-bottom:8px" onclick="skPick'+id+'('+ci+')">'+c.icon+' <div><div>'+c.label+'</div><div style="font-size:.72rem;color:var(--muted);font-weight:600">'+c.detail+'</div></div></div>').join('')+'</div>';
        }
        function tap(){if(done)return;step++;if(step<setup.length)showSetup();else if(choices.length)showChoices();}
        document.getElementById(id+'_body').addEventListener('click',tap);
        window['skPick'+id]=function(ci){
          done=true;
          var c=choices[ci];
          var icons={good:'🌟',mid:'🤔',bad:'⚠️'};
          document.getElementById(id+'_pts').textContent=(c.pts||0)+' poin';
          document.getElementById(id+'_body').innerHTML='<div style="padding:14px"><div style="border-radius:12px;padding:12px 14px;display:flex;gap:10px;margin-bottom:10px;background:rgba('+(c.level==='good'?'52,211,153':c.level==='bad'?'255,107,107':'249,193,46')+',.1);border:2px solid rgba('+(c.level==='good'?'52,211,153':c.level==='bad'?'255,107,107':'249,193,46')+',.3)"><span style="font-size:1.8rem">'+(icons[c.level]||'💡')+'</span><div><div style="font-weight:900;font-size:.88rem;color:var('+(c.level==='good'?'--g':c.level==='bad'?'--r':'--y')+')">'+(c.resultTitle||'')+'</div><div style="font-size:.79rem;color:var(--muted);line-height:1.5;margin-top:3px">'+(c.resultBody||'')+'</div></div></div>'+(c.norma?'<div style="font-size:.78rem;font-weight:700;color:var(--c);margin-bottom:8px">'+c.norma+'</div>':'')+(c.consequences||[]).map(k=>'<div style="display:flex;gap:8px;font-size:.79rem;margin-bottom:4px">'+k.icon+' '+k.text+'</div>').join('')+'</div>';
        };
      })();
      <\/script>
    </div>`;
  };

  // ── HERO BANNER renderer ─────────────────────────────────────
  M._htmlHero = function(m) {
    const gradients = {
      sunset:  "linear-gradient(135deg,#1a0533 0%,#6d1a3c 40%,#e8632a 100%)",
      ocean:   "linear-gradient(135deg,#0a1628 0%,#0e3d6e 50%,#0ea5e9 100%)",
      forest:  "linear-gradient(135deg,#0a1f0a 0%,#1a4d2e 50%,#22c55e 100%)",
      royal:   "linear-gradient(135deg,#0f0a2e 0%,#3b1f8c 50%,#a855f7 100%)",
      fire:    "linear-gradient(135deg,#1a0a00 0%,#7c2d12 50%,#f97316 100%)",
      aurora:  "linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 80%,#00b4db 100%)"
    };
    const bg = gradients[m.gradient] || gradients.sunset;
    const chipsHtml = (m.chips||[]).map(c=>
      `<span style="background:rgba(255,255,255,.15);backdrop-filter:blur(8px);color:#fff;padding:3px 11px;border-radius:99px;font-size:.7rem;font-weight:800;border:1px solid rgba(255,255,255,.2)">${c}</span>`
    ).join("");
    return `<div style="background:${bg};border-radius:18px;padding:32px 22px;text-align:center;margin-bottom:14px;position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(255,255,255,.1),transparent 70%);pointer-events:none"></div>
      ${chipsHtml ? `<div style="display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">${chipsHtml}</div>` : ""}
      <div style="font-size:3.2rem;margin-bottom:12px;animation:float 3s ease-in-out infinite">${m.ikon||"📚"}</div>
      <div style="font-family:Fredoka One,cursive;font-size:clamp(1.5rem,6vw,2.4rem);color:#fff;line-height:1.2;margin-bottom:10px;text-shadow:0 2px 20px rgba(0,0,0,.4)">${m.title||"Judul Bab"}</div>
      ${m.subjudul ? `<p style="color:rgba(255,255,255,.8);font-size:.88rem;line-height:1.6;max-width:400px;margin:0 auto 18px">${m.subjudul}</p>` : ""}
      ${m.cta ? `<div style="display:inline-flex;align-items:center;gap:7px;padding:10px 22px;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);border-radius:99px;font-weight:800;font-size:.85rem;color:#fff;cursor:default">${m.cta} →</div>` : ""}
    </div>`;
  };

  // ── KUTIPAN INSPIRATIF renderer ──────────────────────────────
  M._htmlKutipan = function(m) {
    const warna = m.warna || "var(--p)";
    if (m.style === "big") {
      return `<div style="padding:24px 18px;text-align:center;position:relative;margin-bottom:14px">
        <div style="font-size:5rem;line-height:1;color:${warna};opacity:.18;position:absolute;top:0;left:14px;font-family:Georgia,serif">"</div>
        <div style="font-family:Fredoka One,cursive;font-size:clamp(1.1rem,4vw,1.7rem);line-height:1.4;color:${warna};position:relative;z-index:1;margin:10px 0 18px">${m.teks||""}</div>
        <div style="width:40px;height:3px;background:${warna};border-radius:99px;margin:0 auto 12px"></div>
        ${m.sumber ? `<div style="font-weight:800;font-size:.85rem">${m.sumber}</div>` : ""}
        ${m.jabatan ? `<div style="font-size:.75rem;color:var(--muted);margin-top:3px">${m.jabatan}</div>` : ""}
      </div>`;
    }
    if (m.style === "minimal") {
      return `<div style="border-left:4px solid ${warna};padding:14px 16px;margin-bottom:14px;background:rgba(255,255,255,.02);border-radius:0 12px 12px 0">
        <div style="font-size:.9rem;line-height:1.7;font-style:italic;margin-bottom:8px">"${m.teks||""}"</div>
        ${m.sumber ? `<div style="font-size:.75rem;font-weight:800;color:${warna}">— ${m.sumber}${m.jabatan?` · ${m.jabatan}`:""}</div>` : ""}
      </div>`;
    }
    // card (default)
    return `<div style="background:${warna}10;border:2px solid ${warna}33;border-radius:16px;padding:20px 18px;text-align:center;margin-bottom:14px;position:relative">
      <div style="font-size:2.2rem;color:${warna};opacity:.3;position:absolute;top:10px;left:14px;font-family:Georgia,serif;line-height:1">"</div>
      <div style="font-size:.9rem;line-height:1.75;font-weight:600;margin:8px 0 16px;position:relative">"${m.teks||""}"</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:50%;background:${warna}22;border:2px solid ${warna}44;display:flex;align-items:center;justify-content:center;font-size:1rem">💬</div>
        <div style="text-align:left">
          ${m.sumber ? `<div style="font-weight:900;font-size:.84rem;color:${warna}">${m.sumber}</div>` : ""}
          ${m.jabatan ? `<div style="font-size:.72rem;color:var(--muted)">${m.jabatan}</div>` : ""}
        </div>
      </div>
    </div>`;
  };

  // ── LANGKAH-LANGKAH renderer ─────────────────────────────────
  M._htmlLangkah = function(m) {
    const steps = m.langkah || [];
    const stepsHtml = steps.map((l, i) => {
      const warna = l.warna || "var(--y)";
      if (m.style === "bubble") {
        return `<div style="display:flex;gap:14px;margin-bottom:16px;align-items:flex-start">
          <div style="width:44px;height:44px;border-radius:50%;background:${warna}20;border:2px solid ${warna}55;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">${l.icon||"✅"}</div>
          <div style="padding-top:4px"><div style="font-weight:800;font-size:.88rem;margin-bottom:3px;color:${warna}">${l.judul||""}</div><div style="font-size:.81rem;color:var(--muted);line-height:1.6">${l.isi||""}</div></div>
        </div>`;
      }
      if (m.style === "arrow") {
        return `<div style="background:${warna}09;border:1px solid ${warna}33;border-radius:12px;padding:13px 16px;margin-bottom:8px;display:flex;gap:12px;align-items:center">
          <div style="font-size:1.4rem;flex-shrink:0">${l.icon||"✅"}</div>
          <div style="flex:1"><div style="font-weight:800;font-size:.88rem;margin-bottom:2px;color:${warna}">${l.judul||""}</div><div style="font-size:.8rem;color:var(--muted);line-height:1.5">${l.isi||""}</div></div>
          ${i < steps.length-1 ? "" : ""}
        </div>`;
      }
      // numbered (default)
      return `<div style="display:flex;gap:13px;margin-bottom:16px;align-items:flex-start">
        <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center">
          <div style="width:34px;height:34px;border-radius:50%;background:${warna};color:#0e1c2f;display:flex;align-items:center;justify-content:center;font-family:Fredoka One,cursive;font-size:1rem;font-weight:900">${i+1}</div>
          ${i < steps.length-1 ? `<div style="width:2px;flex:1;min-height:20px;background:${warna}33;margin-top:3px"></div>` : ""}
        </div>
        <div style="padding-top:4px">
          <div style="font-weight:800;font-size:.88rem;margin-bottom:3px">${l.icon||""} ${l.judul||""}</div>
          <div style="font-size:.82rem;color:var(--muted);line-height:1.6">${l.isi||""}</div>
        </div>
      </div>`;
    }).join("");
    return `<div class="card mt14">
      <div class="h2">👣 <span class="hl">${m.title||"Langkah-Langkah"}</span></div>
      ${m.intro ? `<p class="sub" style="margin:7px 0 14px">${m.intro}</p>` : `<div style="margin-top:14px"></div>`}
      ${stepsHtml}
    </div>`;
  };

  // ── ACCORDION / FAQ renderer ─────────────────────────────────
  M._htmlAccordion = function(m) {
    const id = "acc_" + Math.random().toString(36).slice(2,6);
    const itemsHtml = (m.items||[]).map((it,ii) => `
      <div style="border:1px solid var(--border);border-radius:11px;margin-bottom:7px;overflow:hidden">
        <div onclick="accToggle('${id}',${ii})" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;background:rgba(255,255,255,.03);user-select:none">
          <span style="font-size:1.1rem;flex-shrink:0">${it.icon||"❓"}</span>
          <span style="font-weight:800;font-size:.87rem;flex:1">${it.judul||""}</span>
          <span id="${id}_arr${ii}" style="color:var(--muted);font-size:.75rem;transition:transform .25s">▼</span>
        </div>
        <div id="${id}_body${ii}" style="display:none;padding:12px 16px 14px;font-size:.83rem;line-height:1.7;color:var(--muted);border-top:1px solid var(--border)">${it.isi||""}</div>
      </div>`).join("");
    return `<div class="card mt14">
      <div class="h2">🗂️ <span class="hl">${m.title||"FAQ"}</span></div>
      ${m.intro ? `<p class="sub" style="margin:7px 0 14px">${m.intro}</p>` : `<div style="margin-top:12px"></div>`}
      ${itemsHtml}
      <script>(function(){
        window.accToggle=window.accToggle||function(gid,i){
          var b=document.getElementById(gid+'_body'+i);
          var a=document.getElementById(gid+'_arr'+i);
          if(!b)return;
          var open=b.style.display!=='none';
          b.style.display=open?'none':'block';
          if(a)a.style.transform=open?'':'rotate(-180deg)';
        };
      })();<\/script>
    </div>`;
  };

  // ── STATISTIK / ANGKA KUNCI renderer ─────────────────────────
  M._htmlPolling = function(m) {
    const isMultiple = m.tipe === "multiple";
    const opsiHtml = (m.opsi||[]).map((o, oi) => {
      const warna = o.warna || "var(--c)";
      return `
        <div class="polling-opsi" id="poll_opsi_${oi}"
          style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:2px solid ${warna}33;border-radius:12px;cursor:pointer;margin-bottom:8px;transition:all .18s;background:${warna}08"
          onclick="this.classList.toggle('selected');this.style.background='${warna}22';this.style.borderColor='${warna}'">
          <span style="font-size:1.3rem">${o.icon||"💬"}</span>
          <span style="font-size:.88rem;font-weight:700;flex:1">${o.teks||""}</span>
          <span style="width:20px;height:20px;border-radius:${isMultiple?"4px":"50%"};border:2px solid ${warna};display:inline-block;flex-shrink:0"></span>
        </div>`;
    }).join("");

    return `<div class="card mt14">
      <div class="h2">🗳️ <span class="hl">${m.title||"Polling"}</span></div>
      ${m.instruksi ? `<p class="sub mt8">${m.instruksi}</p>` : ""}
      <div style="margin-top:14px">${opsiHtml}</div>
      <div style="text-align:center;margin-top:12px">
        <button class="btn btn-y" style="pointer-events:none;opacity:.7">
          ${isMultiple ? "✅ Kirim Jawaban" : "🗳️ Pilih Salah Satu"}
        </button>
      </div>
      ${m.anonim ? `<div style="font-size:.71rem;color:var(--muted);text-align:center;margin-top:8px">🔒 Jawaban bersifat anonim</div>` : ""}
    </div>`;
  };

  M._htmlEmbed = function(m) {
    const url = m.url || "";
    const tinggi = m.tinggi || 420;
    const label  = m.label || "Buka di tab baru";

    if (!url) return `
      <div class="card mt14">
        <div class="h2">🔗 <span class="hl">${m.title||"Embed"}</span></div>
        <div style="padding:40px;text-align:center;background:rgba(255,255,255,.03);border-radius:12px;margin-top:14px;border:2px dashed rgba(255,255,255,.1)">
          <div style="font-size:2rem;margin-bottom:8px">🔗</div>
          <div style="color:var(--muted);font-size:.82rem">URL belum diisi — masukkan URL embed di editor.</div>
        </div>
      </div>`;

    return `<div class="card mt14">
      <div class="h2">🔗 <span class="hl">${m.title||"Konten Embedded"}</span></div>
      <div style="margin-top:12px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08)">
        <iframe src="${url}" width="100%" height="${tinggi}" frameborder="0" allowfullscreen
          style="display:block;border-radius:12px"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
        </iframe>
      </div>
      <div style="text-align:right;margin-top:8px">
        <a href="${url}" target="_blank" rel="noopener"
          style="font-size:.75rem;color:var(--c);text-decoration:none;display:inline-flex;align-items:center;gap:5px">
          ${label} ↗
        </a>
      </div>
    </div>`;
  };
})();

console.log("✅ modules-render.js loaded — HTML renderers attached");
