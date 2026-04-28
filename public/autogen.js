// ═══════════════════════════════════════════════════════════════
// AUTOGEN.JS — Auto-Generate Konten dari Materi (Non-AI) v1.5
// Lebih cerdas: pola kalimat, kata relasi, variasi soal,
// bloom taxonomy per level, skenario kontekstual
// ═══════════════════════════════════════════════════════════════

window.AT_AUTOGEN = {

  /* ── BLOOM TAXONOMY ──────────────────────────────────────── */
  BLOOM: {
    C1:{ verbs:["Menyebutkan","Mendefinisikan","Mengidentifikasi","Menuliskan","Mengurutkan"], label:"Mengingat",
         pattern: (topik) => `${topik} beserta ciri dan karakteristiknya` },
    C2:{ verbs:["Menjelaskan","Mendeskripsikan","Merangkum","Mengklasifikasikan","Membedakan"], label:"Memahami",
         pattern: (topik) => `konsep ${topik} dan kaitannya dalam kehidupan sehari-hari` },
    C3:{ verbs:["Menerapkan","Menggunakan","Mendemonstrasikan","Memberikan contoh","Menyelesaikan"], label:"Menerapkan",
         pattern: (topik) => `${topik} dalam situasi nyata di lingkungan sekitar` },
    C4:{ verbs:["Menganalisis","Membandingkan","Menguraikan","Membedakan","Menguji"], label:"Menganalisis",
         pattern: (topik, topik2) => `keterkaitan antara ${topik} dan ${topik2||"aspek kehidupan"} serta dampaknya` },
    C5:{ verbs:["Mengevaluasi","Menilai","Memilih","Mengkritisi","Mempertimbangkan"], label:"Mengevaluasi",
         pattern: (topik) => `pentingnya ${topik} dan akibat jika tidak diterapkan dalam masyarakat` },
    C6:{ verbs:["Merancang","Membuat","Menyusun","Mengembangkan","Menciptakan"], label:"Mencipta",
         pattern: (topik) => `rencana/solusi penerapan ${topik} di lingkungan sekolah atau masyarakat` },
  },

  STOP: new Set("yang adalah dari untuk dalam dengan oleh pada tidak dapat akan lebih setiap atau dan juga serta telah sudah hanya agar itu ini sebagai karena kepada terhadap bahwa secara maupun namun jika maka sehingga ketika sangat sebuah suatu pula setelah sebelum antara melalui selain tersebut mereka kita kami dia ia ada bisa harus".split(" ")),

  /* ── PARSE MATERI ─────────────────────────────────────────── */
  parse(text) {
    const sentences = text.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>10);
    const words = text.toLowerCase().match(/\b[a-zA-ZÀ-ÿ]{4,}\b/g)||[];
    const freq = {};
    words.forEach(w=>{ if(!this.STOP.has(w)) freq[w]=(freq[w]||0)+1; });
    const topWords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([w])=>w);
    const topPhrases = this._extractPhrases(text, topWords);

    // Definisi: kalimat dengan pola "X adalah/merupakan/yaitu/ialah Y"
    const DEF_PAT = /([A-Za-zÀ-ÿ\s]{3,40})\s+(adalah|merupakan|yaitu|ialah|didefinisikan sebagai|diartikan sebagai)\s+([^.!?]{10,150})/gi;
    const definitions = [];
    let m;
    while ((m = DEF_PAT.exec(text)) !== null) {
      definitions.push({ subjek: m[1].trim(), predikat: m[2], deskripsi: m[3].trim() });
    }

    // Enumerasi: "terdiri dari", "meliputi", "antara lain", "yaitu", diikuti list
    const ENUM_PAT = /(terdiri dari|meliputi|antara lain|yaitu|diantaranya)[^.]{0,10}([A-Za-zÀ-ÿ,\s()dan]+)\./gi;
    const enumerations = [];
    while ((m = ENUM_PAT.exec(text)) !== null) {
      const items = m[2].split(/,|dan/).map(s=>s.trim()).filter(s=>s.length>1&&s.length<40);
      if (items.length>=2) enumerations.push({ intro: m[1], items });
    }

    // Fungsi/manfaat: "berfungsi", "berperan", "berguna", "bertujuan"
    const FUNC_PAT = /([A-Za-zÀ-ÿ\s]{3,30})\s+(berfungsi|berperan|berguna|bertujuan)\s+([^.!?]{10,120})/gi;
    const functions = [];
    while ((m = FUNC_PAT.exec(text)) !== null) {
      functions.push({ subjek: m[1].trim(), fungsi: m[3].trim() });
    }

    // Penyebab/akibat: "karena", "sehingga", "akibat", "menyebabkan"
    const CAUSE_PAT = /([^.]{10,60})\s+(karena|sehingga|akibat|menyebabkan|mengakibatkan)\s+([^.!?]{10,100})/gi;
    const causes = [];
    while ((m = CAUSE_PAT.exec(text)) !== null) {
      causes.push({ sebab: m[1].trim(), akibat: m[3].trim() });
    }

    return { sentences, topWords, topPhrases, definitions, enumerations, functions, causes, freq };
  },

  _extractPhrases(text, topWords) {
    // Bigrams dari topWords yang sering muncul berdampingan
    const phrases = [];
    for (let i=0; i<topWords.length-1; i++) {
      const pat = new RegExp(topWords[i]+'\\s+'+topWords[i+1],'gi');
      if (pat.test(text)) phrases.push(topWords[i]+' '+topWords[i+1]);
    }
    return phrases.slice(0,8);
  },

  /* ── GENERATE CP ─────────────────────────────────────────── */
  genCP(text, meta={}) {
    const { topWords, definitions, enumerations } = this.parse(text);
    const mainTopik = definitions[0]?.subjek || topPhrases?.[0] || topWords[0] || "materi";
    const topikList = topWords.slice(0,5).join(", ");

    // Build capaian from definitions
    let capaian = "";
    if (definitions.length >= 2) {
      capaian = `Peserta didik mampu memahami dan menjelaskan ${definitions[0].subjek.toLowerCase()} ${definitions[0].deskripsi.slice(0,80)}. Peserta didik dapat mengidentifikasi ${definitions.slice(1,3).map(d=>d.subjek.toLowerCase()).join(" dan ")} serta menganalisis kaitannya dalam kehidupan bermasyarakat. Peserta didik menunjukkan perilaku yang sesuai dengan nilai-nilai ${topikList}.`;
    } else if (enumerations.length) {
      const items = enumerations[0].items.slice(0,4).join(", ");
      capaian = `Peserta didik mampu memahami konsep ${mainTopik} yang ${enumerations[0].intro} ${items}. Peserta didik dapat menganalisis peran ${topikList} dalam kehidupan sehari-hari dan menerapkannya sebagai warga negara yang baik.`;
    } else {
      capaian = `Peserta didik mampu memahami, mengidentifikasi, dan menganalisis ${topikList} dalam konteks kehidupan bermasyarakat, berbangsa, dan bernegara, serta menunjukkan sikap dan perilaku yang sesuai.`;
    }

    return {
      elemen: meta.elemen || (topWords[0]?.charAt(0).toUpperCase()+topWords[0]?.slice(1)) || "Elemen Utama",
      subElemen: meta.subElemen || `Pemahaman ${topWords.slice(0,2).join(" dan ")}`,
      capaianFase: capaian,
      profil: ["Beriman, Bertakwa kepada Tuhan YME & Berakhlak Mulia","Bernalar Kritis","Bergotong Royong","Mandiri"],
      fase: meta.fase||"D", kelas: meta.kelas||"VII"
    };
  },

  /* ── GENERATE TP ─────────────────────────────────────────── */
  genTP(text, opts={}) {
    const { topWords, definitions, enumerations, functions } = this.parse(text);
    const levels = opts.levels || ["C1","C2","C3","C4"];
    const pertemuan = opts.pertemuan || 1;
    const maxTP = opts.maxTP || 5;
    const tps = [];

    const getTopik = (offset=0) => {
      if (definitions[offset]) return definitions[offset].subjek.toLowerCase();
      if (topWords[offset]) return topWords[offset];
      return "materi";
    };

    levels.slice(0, maxTP).forEach((lv, i) => {
      const BL = this.BLOOM[lv];
      if (!BL) return;
      const verb = BL.verbs[i % BL.verbs.length];
      let desc = "";

      if (lv==="C1") {
        desc = definitions[0]
          ? `${definitions[0].subjek.toLowerCase()} (${definitions[0].deskripsi.slice(0,60).trim()})`
          : BL.pattern(getTopik(0));
      } else if (lv==="C2") {
        desc = enumerations[0]
          ? `${enumerations[0].items.slice(0,3).join(", ")} beserta ciri dan contohnya masing-masing`
          : BL.pattern(getTopik(1));
      } else if (lv==="C3") {
        desc = functions[0]
          ? `fungsi ${functions[0].subjek.toLowerCase()} yaitu ${functions[0].fungsi.slice(0,50)}`
          : BL.pattern(getTopik(2));
      } else if (lv==="C4") {
        desc = BL.pattern(getTopik(0), getTopik(1));
      } else {
        desc = BL.pattern(getTopik(i%topWords.length));
      }

      tps.push({
        verb, desc: desc.charAt(0).toUpperCase()+desc.slice(1),
        pertemuan, color: AT_UTIL.colorForIndex(i)
      });
    });
    return tps;
  },

  /* ── GENERATE ATP ────────────────────────────────────────── */
  genATP(tps, meta={}) {
    const byPert = {};
    tps.forEach(tp => {
      const p = tp.pertemuan||1;
      if (!byPert[p]) byPert[p]=[];
      byPert[p].push(tp);
    });
    const pertemuan = Object.keys(byPert).sort((a,b)=>+a-+b).map((p,i) => {
      const list = byPert[p];
      const verbList = list.map(t=>t.verb).join("/");
      return {
        judul: `Pertemuan ${p}: ${list[0].desc.slice(0,35)}…`,
        tp: list.map((t,j)=>`TP ${j+1} — ${t.verb} ${t.desc.slice(0,40)}`).join(" · "),
        durasi: meta.durasi||"2 × 40 menit",
        kegiatan: this._genKegiatan(list),
        penilaian: +p===Object.keys(byPert).length
          ? "Kuis + Refleksi + Portofolio"
          : +p===1 ? "Observasi + Asesmen Diagnostik"
          : "Diskusi + Presentasi Kelompok"
      };
    });
    return { namaBab: meta.namaBab||`Bab: ${meta.topik||"Materi"}`, jumlahPertemuan:pertemuan.length, pertemuan };
  },

  _genKegiatan(tps) {
    const steps = ["Apersepsi & motivasi (pertanyaan pemantik)"];
    tps.forEach(tp => {
      const v = tp.verb.toLowerCase();
      if (/menyebutkan|mendefinisikan|menjelaskan/.test(v)) steps.push(`Pemaparan konsep: ${tp.desc.slice(0,30)}`);
      else if (/mengidentifikasi|mengklasifikasikan/.test(v)) steps.push(`Eksplorasi & identifikasi bersama`);
      else if (/menganalisis|membandingkan/.test(v)) steps.push(`Diskusi kelompok: analisis kasus`);
      else if (/menerapkan|memberikan contoh/.test(v)) steps.push(`Latihan & penerapan kontekstual`);
      else if (/mengevaluasi|menilai/.test(v)) steps.push(`Evaluasi dan presentasi`);
      else steps.push(`Aktivitas: ${tp.verb.toLowerCase()}`);
    });
    steps.push("Simpulan & refleksi bersama");
    return steps.join(" → ");
  },

  /* ── GENERATE ALUR ───────────────────────────────────────── */
  genAlur(tps, meta={}) {
    const total = meta.totalMenit||80;
    const pend  = Math.round(total*0.15);
    const pntp  = Math.round(total*0.70/Math.max(tps.length,1));
    const penut = total - pend - pntp*tps.length;
    const langkah = [];
    langkah.push({
      fase:"Pendahuluan", durasi:`${pend} menit`,
      judul:"Apersepsi, Motivasi & Diagnostik",
      deskripsi:`Guru membuka pembelajaran, mengecek kehadiran, menyampaikan tujuan pembelajaran, dan memberikan pertanyaan pemantik untuk mengaktifkan pengetahuan awal siswa tentang ${tps[0]?.desc?.split(" ").slice(0,4).join(" ")||"materi"}.`
    });
    tps.forEach((tp,i) => {
      langkah.push({
        fase:"Inti", durasi:`${pntp} menit`,
        judul:`${tp.verb}: ${tp.desc.slice(0,35)}`,
        deskripsi: this._deskripsiBerdasarkanBloom(tp)
      });
    });
    langkah.push({
      fase:"Penutup", durasi:`${Math.max(penut,10)} menit`,
      judul:"Simpulan, Refleksi & Tindak Lanjut",
      deskripsi:"Guru bersama siswa merangkum materi, siswa mengisi lembar refleksi singkat (3 hal dipelajari, 2 hal menarik, 1 pertanyaan), guru memberikan tindak lanjut dan informasi pertemuan berikutnya."
    });
    return langkah;
  },

  _deskripsiBerdasarkanBloom(tp) {
    const v = tp.verb.toLowerCase();
    const topik = tp.desc.slice(0,50);
    if (/menyebutkan|mendefinisikan/.test(v))
      return `Guru menjelaskan ${topik}. Siswa membaca, mencatat, dan menjawab pertanyaan lisan secara bergantian. Teknik: Think-Pair-Share.`;
    if (/menjelaskan|mendeskripsikan/.test(v))
      return `Guru memaparkan ${topik} dengan media visual. Siswa menyusun mind map sederhana. Tanya jawab klasikal untuk mengecek pemahaman.`;
    if (/mengidentifikasi|mengklasifikasikan/.test(v))
      return `Siswa mengidentifikasi ${topik} dari kartu/gambar yang disediakan guru. Diskusi pasangan, lalu presentasi singkat (2 menit/pasang).`;
    if (/menganalisis|membandingkan/.test(v))
      return `Diskusi kelompok (4-5 siswa): menganalisis ${topik} dari studi kasus. Setiap kelompok membuat poster mini lalu gallery walk.`;
    if (/menerapkan|memberikan contoh/.test(v))
      return `Siswa secara mandiri/berpasangan mencari contoh ${topik} dari kehidupan sehari-hari dan menuliskan di lembar kerja. Guru memantau dan memberi scaffolding.`;
    if (/mengevaluasi|menilai/.test(v))
      return `Siswa mengevaluasi ${topik} menggunakan rubrik sederhana. Presentasi kelompok dan saling memberikan umpan balik (peer assessment).`;
    return `Kegiatan pembelajaran tentang ${topik}. Guru memfasilitasi, siswa aktif melalui diskusi dan latihan terstruktur.`;
  },

  /* ── GENERATE KUIS (lebih cerdas) ───────────────────────── */
  genKuis(text, jumlah=10) {
    const { sentences, definitions, enumerations, functions, causes, topWords } = this.parse(text);
    const soal = [];

    // POLA 1: Dari kalimat definisi → soal pengertian
    definitions.forEach(def => {
      if (soal.length >= jumlah) return;
      const wrong = this._makeWrongOpts(def.deskripsi, topWords, 3);
      if (wrong.length < 3) return;
      const opts = this._shuffle([def.deskripsi.slice(0,90)+".", ...wrong]);
      const ans  = opts.findIndex(o => def.deskripsi.startsWith(o.slice(0,-1)||o));
      soal.push({
        q: `Apa yang dimaksud dengan "${def.subjek}"?`,
        opts: opts.map(o=>o.length>90?o.slice(0,90)+"…":o),
        ans: ans >= 0 ? ans : 0,
        ex: `${def.subjek} ${def.predikat} ${def.deskripsi.slice(0,100)}.`
      });
    });

    // POLA 2: Dari enumerasi → soal mana yang termasuk
    enumerations.forEach(en => {
      if (soal.length >= jumlah) return;
      const items = en.items.filter(i=>i.length>2);
      if (items.length < 2) return;
      // Soal "manakah yang termasuk…"
      const correctItem = items[0];
      const wrongItems = topWords.filter(w=>!items.some(it=>it.toLowerCase().includes(w))).slice(0,3).map(w=>w.charAt(0).toUpperCase()+w.slice(1));
      if (wrongItems.length < 3) return;
      const opts = this._shuffle([correctItem, ...wrongItems.slice(0,3)]);
      soal.push({
        q: `Manakah yang ${en.intro} bagian dari materi yang dipelajari?`,
        opts, ans: opts.indexOf(correctItem),
        ex: `Berdasarkan materi, yang ${en.intro}: ${items.slice(0,4).join(", ")}.`
      });
    });

    // POLA 3: Dari fungsi → soal tujuan/manfaat
    functions.forEach(fn => {
      if (soal.length >= jumlah) return;
      const correctFungsi = fn.fungsi.slice(0,80);
      const wrongFungsi = topWords.filter(w=>!fn.fungsi.toLowerCase().includes(w)).slice(0,3)
        .map(w=>`sebagai bentuk ${w} dalam kehidupan bermasyarakat`);
      if (wrongFungsi.length < 3) return;
      const opts = this._shuffle([correctFungsi, ...wrongFungsi]);
      soal.push({
        q: `Apa fungsi/peran dari "${fn.subjek}"?`,
        opts: opts.map(o=>o.length>90?o.slice(0,90)+"…":o),
        ans: opts.indexOf(correctFungsi),
        ex: `${fn.subjek} berfungsi ${fn.fungsi.slice(0,100)}.`
      });
    });

    // POLA 4: Dari sebab-akibat → soal hubungan
    causes.slice(0,2).forEach(ca => {
      if (soal.length >= jumlah) return;
      const wrong = topWords.slice(0,3).map(w=>`${ca.sebab.slice(0,30)} dapat ${w}`);
      if (wrong.length < 3) return;
      const correct = ca.akibat.slice(0,80);
      const opts = this._shuffle([correct, ...wrong]);
      soal.push({
        q: `Apa yang terjadi jika ${ca.sebab.toLowerCase().slice(0,60)}?`,
        opts: opts.map(o=>o.length>90?o.slice(0,90)+"…":o),
        ans: opts.indexOf(correct),
        ex: `Berdasarkan materi: ${ca.sebab} ${ca.akibat}.`
      });
    });

    // POLA 5: Soal aplikasi kontekstual dari topWords
    const KONTEKS = [
      "di lingkungan sekolah","di lingkungan keluarga","di lingkungan masyarakat","dalam kehidupan berbangsa dan bernegara"
    ];
    for (let i=0; i<4 && soal.length<jumlah; i++) {
      const topik = topWords[i]||"konsep";
      const konteks = KONTEKS[i%4];
      const kalimatBenang = sentences.find(s=>s.toLowerCase().includes(topik));
      if (!kalimatBenang) continue;
      const correct = `${topik.charAt(0).toUpperCase()+topik.slice(1)} diterapkan ${konteks} dengan mematuhi aturan yang berlaku`;
      const wrongs  = [
        `${topik.charAt(0).toUpperCase()+topik.slice(1)} diabaikan karena dianggap tidak penting`,
        `${topik.charAt(0).toUpperCase()+topik.slice(1)} hanya berlaku untuk kelompok tertentu saja`,
        `${topik.charAt(0).toUpperCase()+topik.slice(1)} tidak berhubungan dengan kehidupan sehari-hari`
      ];
      const opts = this._shuffle([correct, ...wrongs]);
      soal.push({
        q: `Bagaimana penerapan ${topik} ${konteks} yang paling tepat?`,
        opts, ans: opts.indexOf(correct),
        ex: `Penerapan ${topik} ${konteks} harus sesuai dengan aturan dan nilai yang berlaku.`
      });
    }

    // POLA 6: Isi jika masih kurang — soal umum bermakna
    while (soal.length < jumlah && topWords.length >= 2) {
      const w1 = topWords[soal.length%topWords.length];
      const w2 = topWords[(soal.length+1)%topWords.length];
      const correct = `${w1.charAt(0).toUpperCase()+w1.slice(1)} dan ${w2} saling berkaitan dalam membentuk tatanan kehidupan yang harmonis`;
      const wrongs = [
        `${w1.charAt(0).toUpperCase()+w1.slice(1)} dan ${w2} tidak memiliki hubungan satu sama lain`,
        `${w2.charAt(0).toUpperCase()+w2.slice(1)} lebih penting daripada ${w1} dalam segala hal`,
        `${w1.charAt(0).toUpperCase()+w1.slice(1)} bertentangan dengan ${w2} dalam penerapannya`
      ];
      const opts = this._shuffle([correct,...wrongs]);
      soal.push({
        q: `Bagaimana hubungan antara ${w1} dan ${w2} dalam materi yang dipelajari?`,
        opts, ans: opts.indexOf(correct),
        ex: `${w1} dan ${w2} memiliki keterkaitan erat dalam membentuk kehidupan bermasyarakat yang baik.`
      });
    }

    return soal.slice(0, jumlah);
  },

  _makeWrongOpts(correct, topWords, count) {
    const wrongs = [];
    const correctWords = correct.toLowerCase().split(/\s+/);
    topWords.forEach(w => {
      if (wrongs.length >= count) return;
      if (correctWords.includes(w)) return;
      // Build plausible-sounding wrong answer by mixing topwords
      const wrong = `${w.charAt(0).toUpperCase()+w.slice(1)} yang berfungsi sebagai pedoman dan pengatur kehidupan manusia secara umum`;
      if (wrong !== correct.slice(0,wrong.length)) wrongs.push(wrong.slice(0,90));
    });
    return wrongs;
  },

  _shuffle(arr) { return arr.slice().sort(()=>Math.random()-.5); },

  /* ── GENERATE FLASHCARD ──────────────────────────────────── */
  genFlashcard(text) {
    const { definitions, enumerations, functions, topWords } = this.parse(text);
    const kartu = [];

    // Dari definisi
    definitions.slice(0,6).forEach(def => {
      kartu.push({
        depan: def.subjek,
        belakang: `${def.predikat.charAt(0).toUpperCase()+def.predikat.slice(1)} ${def.deskripsi.slice(0,120)}`,
        hint: `Kata kunci: ${def.subjek.split(/\s+/)[0]}`
      });
    });

    // Dari enumerasi
    enumerations.slice(0,2).forEach(en => {
      kartu.push({
        depan: `Apa saja yang ${en.intro}?`,
        belakang: en.items.slice(0,6).join(", "),
        hint: `Ada ${en.items.length} item`
      });
    });

    // Dari fungsi
    functions.slice(0,3).forEach(fn => {
      kartu.push({
        depan: `Apa fungsi ${fn.subjek}?`,
        belakang: fn.fungsi.slice(0,120),
        hint: `Subjek: ${fn.subjek.split(/\s+/)[0]}`
      });
    });

    // Fallback dari topwords
    if (kartu.length < 4) {
      topWords.slice(0,5).forEach(w => {
        if (kartu.find(k=>k.depan.toLowerCase().includes(w))) return;
        kartu.push({ depan: w.charAt(0).toUpperCase()+w.slice(1), belakang:"(Isi definisi di sini)", hint:"" });
      });
    }

    return kartu.slice(0,12);
  },

  /* ── GENERATE SKENARIO ───────────────────────────────────── */
  genSkenario(text, meta={}) {
    const { topWords, definitions, functions } = this.parse(text);
    const topik = definitions[0]?.subjek || topWords[0] || "topik";
    const topik2 = definitions[1]?.subjek || topWords[1] || "aspek lain";
    const fungsi = functions[0]?.fungsi || `mengatur kehidupan bersama`;

    // Generate 2 chapters kontekstual
    const LATAR = [
      {bg:"sbg-kampung", lokasi:"kampung", emoji:"😟", color:"#e87070", pants:"#4a6a9a"},
      {bg:"sbg-kelas",   lokasi:"sekolah", emoji:"🤔", color:"#4a7a9a", pants:"#2d4a7a"},
      {bg:"sbg-pasar",   lokasi:"pasar",   emoji:"😐", color:"#e8a030", pants:"#3a5a7a"},
    ];
    const L0 = LATAR[0], L1 = LATAR[1];

    return {
      type:"skenario", title:`🎭 Skenario: ${topik.charAt(0).toUpperCase()+topik.slice(1)} dalam Kehidupan`,
      chapters:[
        {
          id:1, title:`📍 Situasi 1 — Di ${L0.lokasi.charAt(0).toUpperCase()+L0.lokasi.slice(1)}`,
          bg:L0.bg, charEmoji:L0.emoji, charColor:L0.color, charPants:L0.pants,
          choicePrompt:"Apa yang akan kamu lakukan?",
          setup:[
            {speaker:"NARRATOR", text:`Di ${L0.lokasi}, terjadi situasi yang berkaitan dengan ${topik}. Semua orang menunggu keputusanmu.`},
            {speaker:"TOKOH A 😤", text:`"Kita tidak bisa mengabaikan ${topik} di sini! Ini menyangkut kepentingan bersama."`},
            {speaker:"TOKOH B 🤷", text:`"Tapi apa yang harus kita lakukan? Ada banyak pilihan yang bisa diambil."`},
          ],
          choices:[
            {icon:"🤝", label:`Musyawarahkan bersama`, detail:`Ajak semua pihak duduk bersama dan cari solusi adil`,
             good:true, pts:20, level:"good",
             norma:`Penerapan ${topik}: ${fungsi.slice(0,50)}`,
             resultTitle:"Pilihan Terbaik! 🌟",
             resultBody:`Musyawarah adalah cara terbaik. ${topik.charAt(0).toUpperCase()+topik.slice(1)} berfungsi ${fungsi.slice(0,60)}.`,
             consequences:[
               {icon:"✅", text:`Semua pihak merasa dihargai dan masalah terselesaikan secara adil`},
               {icon:"✅", text:`Nilai ${topik} terwujud melalui dialog dan kesepakatan bersama`}
             ]},
            {icon:"🤐", label:`Diam dan tidak peduli`, detail:`Membiarkan masalah berlanjut tanpa tindakan`,
             good:false, pts:3, level:"bad",
             norma:`Mengabaikan ${topik}`,
             resultTitle:"Kurang Tepat ⚠️",
             resultBody:`Sikap tidak peduli bertentangan dengan nilai ${topik} yang ${fungsi.slice(0,50)}.`,
             consequences:[
               {icon:"❌", text:`Masalah semakin membesar dan merugikan banyak pihak`},
               {icon:"💡", text:`${topik.charAt(0).toUpperCase()+topik.slice(1)} mengharuskan kita untuk aktif berpartisipasi`}
             ]},
          ]
        },
        {
          id:2, title:`📍 Situasi 2 — Di ${L1.lokasi.charAt(0).toUpperCase()+L1.lokasi.slice(1)}`,
          bg:L1.bg, charEmoji:L1.emoji, charColor:L1.color, charPants:L1.pants,
          choicePrompt:"Bagaimana sikapmu?",
          setup:[
            {speaker:"NARRATOR", text:`Di ${L1.lokasi}, kamu menghadapi situasi yang menguji pemahamanmu tentang ${topik2}.`},
            {speaker:"GURU/PEMIMPIN 👨‍🏫", text:`"Kita semua perlu memahami dan menerapkan ${topik2} dalam kehidupan kita sehari-hari."`},
          ],
          choices:[
            {icon:"📚", label:`Pelajari dan terapkan`, detail:`Aktif belajar dan menerapkan ${topik2} dalam tindakan nyata`,
             good:true, pts:20, level:"good",
             norma:`Kesadaran akan ${topik2}`,
             resultTitle:"Pilihan Bijak! 👍",
             resultBody:`Dengan memahami dan menerapkan ${topik2}, kamu berkontribusi pada kehidupan yang lebih baik.`,
             consequences:[
               {icon:"✅", text:`Kamu menjadi contoh positif bagi orang-orang di sekitarmu`},
               {icon:"✅", text:`${topik2.charAt(0).toUpperCase()+topik2.slice(1)} dapat dirasakan manfaatnya oleh semua pihak`}
             ]},
            {icon:"😴", label:`Abaikan, tidak relevan`, detail:`Merasa ${topik2} tidak penting untukmu`,
             good:false, pts:0, level:"bad",
             norma:`Melalaikan ${topik2}`,
             resultTitle:"Perlu Diperbaiki ⚠️",
             resultBody:`Mengabaikan ${topik2} dapat berdampak negatif pada diri sendiri dan lingkungan sekitar.`,
             consequences:[
               {icon:"❌", text:`Perilaku yang tidak sesuai dapat mengganggu keharmonisan bersama`},
               {icon:"💡", text:`Setiap orang bertanggung jawab untuk menerapkan ${topik2} dalam kehidupan`}
             ]},
          ]
        }
      ]
    };
  },

  /* ── GENERATE GAME MATCHING ──────────────────────────────── */
  genMatching(text) {
    const { definitions, enumerations } = this.parse(text);
    const pasangan = [];

    definitions.slice(0,6).forEach(def => {
      pasangan.push({ kiri: def.subjek, kanan: def.deskripsi.slice(0,60) });
    });
    enumerations.slice(0,2).forEach(en => {
      en.items.slice(0,2).forEach(item => {
        pasangan.push({ kiri: item, kanan: `${en.intro.charAt(0).toUpperCase()+en.intro.slice(1)} dari materi` });
      });
    });

    if (pasangan.length < 3) return null;
    return {
      type:"matching", title:"Pasangkan Istilah & Definisi",
      instruksi:"Klik item kiri lalu klik pasangannya di kanan.",
      pasangan: pasangan.slice(0,8)
    };
  },

  /* ── GENERATE GAME TRUE/FALSE ────────────────────────────── */
  genTrueFalse(text) {
    const { definitions, functions, causes, topWords } = this.parse(text);
    const pernyataan = [];

    // Benar dari definisi
    definitions.slice(0,3).forEach(def => {
      pernyataan.push({
        teks: `${def.subjek} ${def.predikat} ${def.deskripsi.slice(0,80)}.`,
        jawaban: true,
        penjelasan: `Benar! ${def.subjek} ${def.predikat} ${def.deskripsi.slice(0,80)}.`
      });
    });

    // Salah — balik definisi
    definitions.slice(0,2).forEach((def, i) => {
      const altTopik = topWords.find(w=>!def.subjek.toLowerCase().includes(w))||"hal lain";
      pernyataan.push({
        teks: `${def.subjek} ${def.predikat} ${altTopik} yang tidak berkaitan dengan materi.`,
        jawaban: false,
        penjelasan: `Salah! ${def.subjek} ${def.predikat} ${def.deskripsi.slice(0,60)}, bukan yang disebutkan.`
      });
    });

    // Dari fungsi
    functions.slice(0,2).forEach(fn => {
      pernyataan.push({
        teks: `${fn.subjek.charAt(0).toUpperCase()+fn.subjek.slice(1)} berfungsi ${fn.fungsi.slice(0,60)}.`,
        jawaban: true,
        penjelasan: `Benar! ${fn.subjek} memang berfungsi ${fn.fungsi.slice(0,80)}.`
      });
    });

    if (pernyataan.length < 4) return null;
    return {
      type:"truefalse", title:"Benar atau Salah?",
      instruksi:"Tentukan apakah pernyataan berikut benar atau salah!",
      pernyataan: this._shuffle(pernyataan).slice(0,8)
    };
  },

  /* ── parse() dengan cache — dipanggil sekali per teks ───── */
  // Cache dikelola dari luar (AG controller di index.html).
  // Fungsi-fungsi gen* sudah menerima `text` langsung, tapi juga
  // bisa dipanggil dengan hasil parse yang sudah ada via _useParsed.
  _useParsed: null,   // {text, result} — diisi AG.runStep sebelum memanggil gen*

  _getParsed(text) {
    if (this._useParsed && this._useParsed.text === text) return this._useParsed.result;
    const result = this.parse(text);
    this._useParsed = { text, result };
    return result;
  }

};

console.log("✅ autogen.js v2.0 loaded — wizard-only, parse cache via _getParsed()");
