// ═══════════════════════════════════════════════════════════════
// MODULES.JS — Sistem Modul Pembelajaran Fleksibel v1.1
// Tipe modul: skenario, video, infografis, flashcard,
//             studi-kasus, debat, timeline, matching, materi
// Authoring Tool v1.1
// ═══════════════════════════════════════════════════════════════

/* ══════════════════════════════════════════════════════════════
   REGISTRY TIPE MODUL
   Setiap tipe: id, label, icon, color, defaultData(), editorHtml(), previewHtml()
   ══════════════════════════════════════════════════════════════ */
window.MODULE_TYPES = {

  // ── 1. SKENARIO INTERAKTIF ──────────────────────────────────
  skenario: {
    id:"skenario", icon:"🎭", label:"Skenario Interaktif", color:"var(--o)",
    desc:"Cerita konflik dengan pilihan jawaban, feedback, dan poin. Cocok untuk nilai & etika.",
    defaultData() {
      return {
        type:"skenario",
        title:"🎭 Skenario Interaktif",
        // Multi-chapter: chapters[] menggantikan setup/choices tunggal
        chapters:[
          {
            id:1, title:"🏘️ Skenario 1", bg:"sbg-kampung",
            charEmoji:"😊", charColor:"#e87070", charPants:"#4a6a9a",
            choicePrompt:"Apa yang akan kamu lakukan?",
            setup:[
              { speaker:"NARRATOR", text:"Tuliskan narasi situasi di sini..." },
              { speaker:"TOKOH A", text:"Dialog tokoh di sini..." }
            ],
            choices:[
          { icon:"🤝", label:"Pilihan bijak", detail:"Deskripsi pilihan ini", good:true, pts:20,
            norma:"Fungsi norma terkait", level:"good",
            resultTitle:"Pilihan Terbaik! 🌟", resultBody:"Penjelasan mengapa ini benar.",
            consequences:[
              { icon:"✅", text:"Dampak positif pertama" },
              { icon:"✅", text:"Dampak positif kedua" }
            ]
          },
          { icon:"❌", label:"Pilihan kurang tepat", detail:"Deskripsi pilihan ini", good:false, pts:0,
            norma:"Norma yang dilanggar", level:"bad",
            resultTitle:"Pilihan Kurang Tepat ⚠️", resultBody:"Penjelasan mengapa ini kurang tepat.",
            consequences:[
              { icon:"❌", text:"Dampak negatif pertama" },
              { icon:"❌", text:"Dampak negatif kedua" }
            ]
          }
          ]
          }
        ]
      };
    }
  },

  // ── 2. VIDEO EMBED ──────────────────────────────────────────
  video: {
    id:"video", icon:"▶️", label:"Video Pembelajaran", color:"var(--r)",
    desc:"Embed video YouTube/Google Drive dengan pertanyaan refleksi sebelum/sesudah menonton.",
    defaultData() {
      return {
        type:"video", title:"Video Pembelajaran",
        url:"", platform:"youtube", // youtube | drive | url
        durasi:"5 menit",
        instruksi:"Tonton video berikut dengan seksama, lalu jawab pertanyaan di bawah.",
        pertanyaan:[
          { teks:"Apa pesan utama yang kamu tangkap dari video ini?", wajib:true },
          { teks:"Bagaimana kaitannya dengan materi hari ini?", wajib:false }
        ],
        showTranskrip:false, transkrip:""
      };
    }
  },

  // ── 3. INFOGRAFIS / MATERI KARTU ───────────────────────────
  infografis: {
    id:"infografis", icon:"🗺️", label:"Infografis / Kartu Konsep", color:"var(--c)",
    desc:"Kartu-kartu konsep berwarna yang menampilkan poin penting materi secara visual.",
    defaultData() {
      return {
        type:"infografis", title:"Peta Konsep",
        layout:"grid", // grid | list | timeline
        intro:"Pelajari kartu-kartu konsep berikut:",
        kartu:[
          { icon:"📌", judul:"Konsep 1", isi:"Penjelasan konsep pertama di sini.", color:"var(--y)" },
          { icon:"🔗", judul:"Konsep 2", isi:"Penjelasan konsep kedua di sini.", color:"var(--c)" },
          { icon:"💡", judul:"Konsep 3", isi:"Penjelasan konsep ketiga di sini.", color:"var(--p)" },
        ]
      };
    }
  },

  // ── 4. FLASHCARD ────────────────────────────────────────────
  flashcard: {
    id:"flashcard", icon:"🃏", label:"Flashcard Bolak-balik", color:"var(--p)",
    desc:"Kartu yang bisa dibalik — depan pertanyaan/istilah, belakang jawaban/definisi.",
    defaultData() {
      return {
        type:"flashcard", title:"Flashcard Kosakata",
        instruksi:"Klik kartu untuk membalik. Kuasai semua kartu sebelum lanjut!",
        kartu:[
          { depan:"Norma", belakang:"Aturan atau pedoman yang mengatur perilaku manusia dalam masyarakat.", hint:"" },
          { depan:"Sanksi", belakang:"Akibat atau hukuman yang diterima seseorang karena melanggar norma.", hint:"" },
          { depan:"Zoon Politikon", belakang:"Istilah dari Aristoteles yang berarti manusia adalah makhluk sosial.", hint:"Tokoh Yunani" }
        ]
      };
    }
  },

  // ── 5. STUDI KASUS ──────────────────────────────────────────
  "studi-kasus": {
    id:"studi-kasus", icon:"📰", label:"Studi Kasus", color:"var(--b)",
    desc:"Bacaan kasus nyata atau hipotetis dengan pertanyaan analisis berjenjang (LOTS→HOTS).",
    defaultData() {
      return {
        type:"studi-kasus", title:"Studi Kasus",
        teks:"Tuliskan narasi kasus di sini. Bisa berupa artikel, cerita pendek, atau kejadian nyata yang relevan dengan materi.",
        sumber:"", // contoh: "Kompas, 2024"
        pertanyaan:[
          { level:"C1", icon:"🔍", label:"Identifikasi", teks:"Apa permasalahan utama dalam kasus ini?" },
          { level:"C2", icon:"🔗", label:"Hubungkan", teks:"Apa kaitannya dengan materi yang sedang dipelajari?" },
          { level:"C4", icon:"⚖️", label:"Analisis", teks:"Mengapa hal ini bisa terjadi? Faktor apa yang berperan?" },
          { level:"C5", icon:"💡", label:"Evaluasi", teks:"Bagaimana menurutmu solusi terbaik untuk kasus ini?" }
        ]
      };
    }
  },

  // ── 6. DEBAT / POLLING ─────────────────────────────────────
  debat: {
    id:"debat", icon:"🗣️", label:"Debat & Polling", color:"var(--g)",
    desc:"Pertanyaan pro-kontra atau polling kelas. Siswa pilih posisi lalu tulis argumen.",
    defaultData() {
      return {
        type:"debat", title:"Debat Kelas",
        pertanyaan:"Apakah norma hukum lebih penting dari norma agama?",
        konteks:"Diskusikan dengan kelompokmu, lalu pilih posisimu dan tuliskan alasannya.",
        pihakA:{ label:"Pro / Setuju", icon:"✅", color:"var(--g)", argumen_placeholder:"Tuliskan argumen pro di sini..." },
        pihakB:{ label:"Kontra / Tidak Setuju", icon:"❌", color:"var(--r)", argumen_placeholder:"Tuliskan argumen kontra di sini..." },
        kesimpulan_prompt:"Setelah mendengar kedua pihak, apa kesimpulanmu?"
      };
    }
  },

  // ── 7. TIMELINE ─────────────────────────────────────────────
  timeline: {
    id:"timeline", icon:"📅", label:"Timeline / Urutan Waktu", color:"var(--y)",
    desc:"Menampilkan urutan peristiwa, sejarah, atau langkah-langkah secara kronologis.",
    defaultData() {
      return {
        type:"timeline", title:"Perjalanan Sejarah",
        intro:"Pelajari urutan peristiwa berikut:",
        events:[
          { tahun:"1945", judul:"Proklamasi Kemerdekaan", isi:"Indonesia merdeka dan mulai membentuk sistem hukum dan norma berbangsa.", icon:"🇮🇩" },
          { tahun:"1945", judul:"UUD 1945 Disahkan", isi:"Undang-Undang Dasar sebagai hukum tertinggi yang menjadi sumber norma hukum nasional.", icon:"📜" },
          { tahun:"1998", judul:"Era Reformasi", isi:"Perubahan besar dalam sistem hukum, kebebasan berpendapat, dan penguatan norma demokrasi.", icon:"🔄" }
        ]
      };
    }
  },

  // ── 8. MATCHING / PASANGKAN ────────────────────────────────
  matching: {
    id:"matching", icon:"🔀", label:"Game Pasangkan", color:"var(--g)",
    desc:"Siswa mencocokkan pasangan: istilah-definisi, gambar-label, soal-jawaban, dsb.",
    defaultData() {
      return {
        type:"matching", title:"Pasangkan Norma & Sanksinya",
        instruksi:"Klik item kiri lalu klik pasangannya di kanan.",
        pasangan:[
          { kiri:"Norma Agama",    kanan:"Dosa / hukuman ilahi" },
          { kiri:"Norma Kesusilaan", kanan:"Rasa malu / dikucilkan" },
          { kiri:"Norma Kesopanan", kanan:"Teguran / sindiran sosial" },
          { kiri:"Norma Hukum",   kanan:"Denda / penjara" }
        ]
      };
    }
  },

  // ── 9. MATERI TEKS ──────────────────────────────────────────
  materi: {
    id:"materi", icon:"📖", label:"Materi Teks", color:"var(--muted2)",
    desc:"Blok teks materi bebas dengan definisi, penjelasan, dan poin penting.",
    defaultData() {
      return {
        type:"materi", title:"Materi Pokok",
        intro:"",
        blok:[
          { tipe:"definisi", judul:"Pengertian", isi:"Tuliskan definisi atau pengertian utama di sini." },
          { tipe:"penjelasan", judul:"Penjelasan", isi:"Tuliskan uraian penjelasan materi di sini." },
          { tipe:"poin", judul:"Poin Penting", butir:["Poin pertama","Poin kedua","Poin ketiga"] }
        ]
      };
    }
  },

  // ── 10. HERO BANNER ─────────────────────────────────────────
  hero: {
    id:"hero", icon:"🖼️", label:"Hero Banner", color:"var(--y)",
    desc:"Halaman pembuka visual dengan judul besar, subjudul, ikon, dan gradient warna. Cocok sebagai pembuka bab.",
    defaultData() {
      return {
        type:"hero", title:"Judul Bab / Topik",
        subjudul:"Deskripsi singkat tentang topik yang akan dipelajari.",
        ikon:"📚",
        gradient:"sunset", // sunset | ocean | forest | royal | fire
        chips:["PPKn", "Kelas VII", "Kurikulum Merdeka"],
        cta:"Mulai Belajar"
      };
    }
  },

  // ── 11. KUTIPAN INSPIRATIF ───────────────────────────────────
  kutipan: {
    id:"kutipan", icon:"💬", label:"Kutipan Inspiratif", color:"var(--p)",
    desc:"Tampilkan kutipan tokoh, hadis, atau pepatah dengan desain visual yang elegan dan berkesan.",
    defaultData() {
      return {
        type:"kutipan", title:"Kutipan",
        teks:"Manusia adalah makhluk sosial yang tidak bisa hidup sendiri tanpa bantuan orang lain.",
        sumber:"Aristoteles",
        jabatan:"Filsuf Yunani",
        warna:"var(--p)",
        style:"card" // card | big | minimal
      };
    }
  },

  // ── 12. LANGKAH-LANGKAH ─────────────────────────────────────
  langkah: {
    id:"langkah", icon:"👣", label:"Langkah-Langkah", color:"var(--c)",
    desc:"Tampilkan prosedur, langkah-langkah, atau tahapan secara visual dengan nomor dan ikon yang menarik.",
    defaultData() {
      return {
        type:"langkah", title:"Langkah-Langkah",
        intro:"Ikuti tahapan berikut dengan seksama:",
        style:"numbered", // numbered | bubble | arrow
        langkah:[
          { icon:"🔍", judul:"Identifikasi", isi:"Kenali dan pahami situasi atau permasalahan yang ada.", warna:"var(--y)" },
          { icon:"🤔", judul:"Analisis", isi:"Pikirkan berbagai sudut pandang dan kemungkinan solusi.", warna:"var(--c)" },
          { icon:"⚖️", judul:"Evaluasi", isi:"Nilai setiap pilihan berdasarkan norma dan nilai yang berlaku.", warna:"var(--p)" },
          { icon:"✅", judul:"Tindakan", isi:"Ambil keputusan terbaik dan bertanggung jawab atas hasilnya.", warna:"var(--g)" }
        ]
      };
    }
  },

  // ── 13. ACCORDION / FAQ ─────────────────────────────────────
  accordion: {
    id:"accordion", icon:"🗂️", label:"Accordion / FAQ", color:"var(--o)",
    desc:"Konten lipat buka-tutup. Cocok untuk FAQ, rangkuman, atau materi dengan banyak poin yang bisa diexpand.",
    defaultData() {
      return {
        type:"accordion", title:"Pertanyaan Umum",
        intro:"Klik pertanyaan untuk melihat jawabannya.",
        items:[
          { judul:"Apa itu norma sosial?", isi:"Norma sosial adalah aturan tidak tertulis yang mengatur perilaku anggota masyarakat agar tercipta ketertiban dan keharmonisan dalam kehidupan bersama.", icon:"❓" },
          { judul:"Mengapa norma diperlukan?", isi:"Norma diperlukan karena manusia adalah makhluk sosial yang hidup berkelompok. Tanpa norma, kehidupan masyarakat akan kacau dan tidak teratur.", icon:"💡" },
          { judul:"Apa sanksi melanggar norma?", isi:"Sanksi bervariasi tergantung jenis normanya: dosa (norma agama), rasa malu/dikucilkan (norma kesusilaan/kesopanan), atau denda/penjara (norma hukum).", icon:"⚖️" }
        ]
      };
    }
  },

  // ── 14. STATISTIK / ANGKA KUNCI ─────────────────────────────
  statistik: {
    id:"statistik", icon:"📊", label:"Statistik & Angka Kunci", color:"var(--g)",
    desc:"Tampilkan data, angka, fakta menarik, atau statistik dengan visual yang menonjol dan mudah diingat.",
    defaultData() {
      return {
        type:"statistik", title:"Fakta & Angka",
        intro:"Tahukah kamu?",
        layout:"grid", // grid | row
        items:[
          { angka:"4", satuan:"Jenis", label:"Norma dalam masyarakat", icon:"⚖️", warna:"var(--y)" },
          { angka:"37+", satuan:"Pasal", label:"UUD 1945 mengatur hak & kewajiban", icon:"📜", warna:"var(--c)" },
          { angka:"100%", satuan:"", label:"Norma berlaku untuk semua warga", icon:"🌍", warna:"var(--g)" }
        ]
      };
    }
  },

  polling: {
    id:"polling", icon:"🗳️", label:"Polling / Voting", color:"var(--p)",
    desc:"Ajukan pertanyaan survei kepada siswa — pilih satu atau banyak opsi. Cocok untuk icebreaker atau refleksi.",
    defaultData() {
      return {
        type:"polling", title:"Polling Kelas",
        instruksi:"Pilih jawaban yang paling sesuai menurutmu!",
        tipe:"single", // single | multiple
        anonim: true,
        opsi:[
          { icon:"✅", teks:"Sangat Setuju",   warna:"var(--g)" },
          { icon:"🤔", teks:"Kurang Setuju",   warna:"var(--y)" },
          { icon:"❌", teks:"Tidak Setuju",     warna:"var(--r)" },
        ]
      };
    }
  },

  embed: {
    id:"embed", icon:"🔗", label:"Embed / iFrame", color:"var(--c)",
    desc:"Sisipkan Canva, Padlet, Google Slides, atau situs lain langsung dalam halaman pembelajaran.",
    defaultData() {
      return {
        type:"embed", title:"Konten Embedded",
        label:"Buka di tab baru",
        url:"", tinggi:420
      };
    }
  },

  // ── 17. TAB ICONS — Tab interaktif dengan emoji ───────────────
  "tab-icons": {
    id:"tab-icons", icon:"📑", label:"Tab Interaktif", color:"var(--c)",
    desc:"Tab navigasi dengan emoji icon. Klik tab untuk menampilkan konten berbeda. Cocok untuk menjelajahi sub-topik, fungsi, atau kategori.",
    defaultData() {
      return {
        type:"tab-icons", title:"Fungsi Norma",
        intro:"Klik tab untuk menjelajahi fungsi norma.",
        layout:"vertical", // vertical | horizontal | pills
        animasi:"fade-in", // fade-in | slide-up | zoom | bounce
        tabs:[
          { icon:"🗺️", judul:"Pedoman Tingkah Laku", warna:"var(--y)",
            isi:"Norma memberi petunjuk kepada setiap individu tentang cara bertindak yang baik dan benar dalam pergaulan sehari-hari.",
            poin:["Norma sopan santun mengajarkan kita untuk mengucapkan salam saat bertemu","Norma hukum lalu lintas memberi tahu kita harus berhenti saat lampu merah","Norma agama memandu kita untuk berdoa sebelum makan dan bekerja"],
            refleksi:"Sebutkan 1 norma yang selama ini menjadi panduan perilakumu di sekolah!" },
          { icon:"🤝", judul:"Menciptakan Ketertiban", warna:"var(--c)",
            isi:"Norma menciptakan ketertiban dalam masyarakat sehingga setiap anggota dapat hidup secara harmonis dan teratur.",
            poin:["Mengatur lalu lintas di jalan raya","Mengatur antrian di tempat umum","Mengatur tata tertib di sekolah"],
            refleksi:"Apa yang akan terjadi jika tidak ada norma di masyarakat?" },
          { icon:"🛡️", judul:"Melindungi Hak Warga", warna:"var(--g)",
            isi:"Norma melindungi hak-hak setiap warga agar tidak dirugikan oleh pihak lain.",
            poin:["Hak atas pendidikan dilindungi oleh norma hukum","Hak atas rasa aman dilindungi oleh norma sosial","Hak beribadah dilindungi oleh norma agama"],
            refleksi:"Ceritakan pengalamanmu saat hakmu dilindungi oleh sebuah norma!" },
          { icon:"💚", judul:"Memperkuat Solidaritas", warna:"var(--p)",
            isi:"Norma mempererat ikatan sosial antar anggota masyarakat melalui nilai-nilai kebersamaan dan gotong royong.",
            poin:["Gotong royong membersihkan lingkungan","Kerja bakti membangun fasilitas umum","Saling membantu saat ada warga yang terkena musibah"],
            refleksi:"Apa kontribusimu dalam memperkuat solidaritas di lingkunganmu?" },
          { icon:"⚖️", judul:"Mewujudkan Keadilan", warna:"var(--r)",
            isi:"Norma menjamin keadilan bagi semua anggota masyarakat tanpa memandang status, suku, atau agama.",
            poin:["Sanksi yang sama untuk pelanggaran yang sama","Perlindungan terhadap diskriminasi","Kesempatan yang merata untuk semua warga"],
            refleksi:"Menurutmu, apakah norma saat ini sudah cukup adil?" }
        ]
      };
    }
  },

  // ── 18. ICON EXPLORE — Grid ikon eksplorasi ───────────────────
  "icon-explore": {
    id:"icon-explore", icon:"🔍", label:"Eksplorasi Ikon", color:"var(--o)",
    desc:"Grid ikon besar yang bisa diklik untuk membuka detail. Cocok untuk menjelajahi konsep, karakteristik, atau jenis-jenis sesuatu.",
    defaultData() {
      return {
        type:"icon-explore", title:"Jenis-Jenis Norma",
        intro:"Klik ikon untuk mempelajari setiap jenis norma.",
        layout:"grid", // grid | carousel | wheel
        animasi:"zoom",
        items:[
          { icon:"🕌", judul:"Norma Agama", warna:"var(--y)",
            ringkasan:"Aturan yang bersumber dari ajaran agama",
            isi:"Norma agama adalah aturan yang bersumber dari kitab suci, dalil, atau ajaran agama. Norma ini mengatur hubungan manusia dengan Tuhan dan sesama manusia menurut keyakinan beragama.",
            contoh:["Sholat 5 waktu bagi umat Islam","Tidak berbohong dalam agama apapun","Berpuasa di bulan Ramadhan"],
            sanksi:"Dosa, siksa neraka, atau hukuman dari Tuhan" },
          { icon:"💎", judul:"Norma Kesusilaan", warna:"var(--c)",
            ringkasan:"Aturan yang berhubungan dengan hati nurani",
            isi:"Norma kesusilaan adalah aturan yang berhubungan dengan hati nurani manusia. Norma ini bersifat universal dan berlaku bagi semua orang tanpa memandang latar belakang.",
            contoh:["Tidak mencuri milik orang lain","Tidak berbuat kekerasan","Saling menghargai sesame manusia"],
            sanksi:"Rasa bersalah dan malu secara internal" },
          { icon:"😊", judul:"Norma Kesopanan", warna:"var(--g)",
            ringkasan:"Aturan tidak tertulis tentang sopan santun",
            isi:"Norma kesopanan adalah aturan tidak tertulis yang mengatur cara berperilaku sopan dan santun dalam pergaulan masyarakat sehari-hari. Berbeda-beda di setiap daerah.",
            contoh:["Mengucapkan salam saat bertemu","Menggunakan bahasa yang santun","Menundukkan badan saat melewati orang tua"],
            sanksi:"Dikucilkan dari masyarakat, mendapat teguran" },
          { icon:"⚖️", judul:"Norma Hukum", warna:"var(--r)",
            ringkasan:"Aturan tertulis yang dibuat oleh pemerintah",
            isi:"Norma hukum adalah aturan tertulis yang dibuat oleh lembaga resmi negara, bersifat memaksa, dan pelanggarannya diancam sanksi tegas. Bersumber dari UUD, undang-undang, dan peraturan.",
            contoh:["Berhenti saat lampu merah","Membayar pajak tepat waktu","Tidak mengemudi dalam keadaan mabuk"],
            sanksi:"Denda, penjara, atau hukuman sesuai undang-undang" }
        ]
      };
    }
  },

  // ── 19. COMPARISON — Perbandingan kategori ────────────────────
  comparison: {
    id:"comparison", icon:"⚖️", label:"Perbandingan", color:"var(--p)",
    desc:"Bandingkan 2-4 kategori berdampingan. Cocok untuk membandingkan jenis norma, bentuk pemerintahan, atau konsep berlawanan.",
    defaultData() {
      return {
        type:"comparison", title:"Perbandingan Jenis Norma",
        intro:"Bandingkan karakteristik setiap jenis norma berikut.",
        animasi:"slide-up",
        kolom:[
          { icon:"🕌", judul:"Norma Agama", warna:"var(--y)" },
          { icon:"💎", judul:"Norma Kesusilaan", warna:"var(--c)" },
          { icon:"😊", judul:"Norma Kesopanan", warna:"var(--g)" },
          { icon:"⚖️", judul:"Norma Hukum", warna:"var(--r)" }
        ],
        baris:[
          { label:"Sumber", icon:"📜",
            nilai:["Kitab suci & ajaran agama","Hati nurani manusia","Kebiasaan & adat istiadat","Peraturan perundang-undangan"] },
          { label:"Bentuk", icon:"📝",
            nilai:["Tertulis & lisan","Tidak tertulis","Tidak tertulis","Tertulis"] },
          { label:"Sanksi", icon:"⚠️",
            nilai:["Dosa / siksa akhirat","Rasa bersalah","Teguran / dikucilkan","Denda / penjara"] },
          { label:"Berlaku untuk", icon:"👥",
            nilai:["Penganut agama tertentu","Semua manusia","Masyarakat tertentu","Seluruh warga negara"] }
        ],
        tanya:"Dari keempat norma di atas, mana yang paling berpengaruh dalam kehidupanmu sehari-hari? Jelaskan alasannya."
      };
    }
  },

  // ── 20. CARD SHOWCASE — Card animasi showcase ──────────────────
  "card-showcase": {
    id:"card-showcase", icon:"🎭", label:"Card Showcase", color:"var(--y)",
    desc:"Card-card visual dengan hover effects dan animasi. Cocok untuk menampilkan profil tokoh, contoh kasus, atau galery konsep.",
    defaultData() {
      return {
        type:"card-showcase", title:"Tokoh Penting",
        intro:"Pelajari kontribusi tokoh-tokoh berikut terhadap perkembangan norma di Indonesia.",
        layout:"grid", // grid | list | masonry
        animasi:"fade-in",
        cards:[
          { icon:"🏛️", judul:"Ir. Soekarno", warna:"var(--y)",
            subtitle:"Proklamator & Bapak Bangsa",
            isi:"Ir. Soekarno adalah proklamator kemerdekaan Indonesia yang menegaskan pentingnya norma hukum dan norma sosial dalam kehidupan berbangsa melalui Pancasila dan UUD 1945.",
            tag:["Pancasila","UUD 1945","Kemerdekaan"] },
          { icon:"⚖️", judul:"Moh. Yamin", warna:"var(--c)",
            subtitle:"Perumus Dasar Negara",
            isi:"Mohammad Yamin merupakan salah satu perumus dasar negara yang berkontribusi dalam merumuskan norma konstitusional yang menjadi fondasi kehidupan berbangsa.",
            tag:["Konstitusi","Dasar Negara","Sejarah"] },
          { icon:"📖", judul:"Ki Hajar Dewantara", warna:"var(--g)",
            subtitle:"Bapak Pendidikan Indonesia",
            isi:"Ki Hajar Dewantara memperjuangkan pendidikan sebagai hak setiap warga negara dan menanamkan norma-norma pendidikan yang berlaku hingga saat ini.",
            tag:["Pendidikan","Taman Siswa","Perjuangan"] },
          { icon:"📜", judul:"Supomo", warna:"var(--p)",
            subtitle:"Perancang UUD 1945",
            isi:"Supomo adalah ahli hukum yang berperan besar dalam merancang UUD 1945 sebagai sumber norma hukum tertinggi yang mengatur kehidupan berbangsa dan bernegara.",
            tag:["Hukum","UUD 1945","Konstitusi"] }
        ]
      };
    }
  }
};
