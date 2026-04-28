// ═══════════════════════════════════════════════════════════════
// DATA.JS — Preset data, state, & shared config
// Authoring Tool v1.0 | PPKn Media Pembelajaran
// ═══════════════════════════════════════════════════════════════

// ── PRESET LIBRARY ──────────────────────────────────────────────
window.PRESETS = {

  // ── META PRESETS ──
  meta: {
    "hakikat-norma": {
      id:"hakikat-norma", label:"Bab 3 – Pertemuan 1: Hakikat Norma",
      mapel:"PPKn", kelas:"VII", kurikulum:"Kurikulum Merdeka",
      judulPertemuan:"Pertemuan 1 – Hakikat Norma",
      subjudul:"Mengapa manusia membutuhkan norma?",
      ikon:"🧑‍🤝‍🧑", durasi:"2 × 40 menit", namaBab:"Hakikat Norma",
    },
    "macam-norma": {
      id:"macam-norma", label:"Bab 3 – Pertemuan 2: Macam-Macam Norma",
      mapel:"PPKn", kelas:"VII", kurikulum:"Kurikulum Merdeka",
      judulPertemuan:"Pertemuan 2 – Macam-Macam Norma",
      subjudul:"Apa saja jenis norma yang mengatur kehidupan kita?",
      ikon:"📜", durasi:"2 × 40 menit", namaBab:"Macam-Macam Norma",
    },
    "perilaku-patuh": {
      id:"perilaku-patuh", label:"Bab 3 – Pertemuan 3: Perilaku Patuh",
      mapel:"PPKn", kelas:"VII", kurikulum:"Kurikulum Merdeka",
      judulPertemuan:"Pertemuan 3 – Perilaku Patuh terhadap Norma",
      subjudul:"Bagaimana mewujudkan kepatuhan terhadap norma?",
      ikon:"🤝", durasi:"2 × 40 menit", namaBab:"Perilaku Patuh",
    },
    "blank": {
      id:"blank", label:"Kosong – Mulai dari Nol",
      mapel:"", kelas:"", kurikulum:"Kurikulum Merdeka",
      judulPertemuan:"", subjudul:"", ikon:"📚", durasi:"2 × 40 menit", namaBab:"",
    }
  },

  // ── CP PRESETS ──
  cp: {
    "ppkn-smp-bab3": {
      id:"ppkn-smp-bab3",
      label:"PPKn SMP – Bab 3: Patuh terhadap Norma",
      elemen:"Pancasila",
      subElemen:"Pemahaman norma dan nilai",
      capaianFase:"Peserta didik mampu menganalisis pentingnya norma dalam kehidupan bermasyarakat, berbangsa, dan bernegara; serta menunjukkan perilaku patuh terhadap norma sebagai wujud kesadaran hukum.",
      profil:["Beriman & Bertakwa kepada Tuhan YME","Berkebhinekaan Global","Bergotong Royong","Bernalar Kritis"],
      fase:"D", kelas:"VII"
    },
    "ppkn-smp-bab1": {
      id:"ppkn-smp-bab1",
      label:"PPKn SMP – Bab 1: Pancasila sebagai Dasar Negara",
      elemen:"Pancasila",
      subElemen:"Pemahaman nilai-nilai Pancasila",
      capaianFase:"Peserta didik mampu memahami Pancasila sebagai dasar negara dan ideologi bangsa serta menerapkan nilai-nilai Pancasila dalam kehidupan sehari-hari.",
      profil:["Beriman & Bertakwa kepada Tuhan YME","Berkebhinekaan Global","Bergotong Royong","Bernalar Kritis","Mandiri","Kreatif"],
      fase:"D", kelas:"VII"
    },
    "blank": { id:"blank", label:"Kosong – Isi Manual", elemen:"", subElemen:"", capaianFase:"", profil:[], fase:"D", kelas:"" }
  },

  // ── TP PRESETS ──
  tp: {
    "bab3-full": {
      id:"bab3-full", label:"Bab 3 – 5 TP Lengkap",
      items:[
        {verb:"Menjelaskan", desc:"pengertian norma sebagai aturan yang mengikat warga masyarakat dan berfungsi sebagai pedoman tingkah laku dalam kehidupan bersama", pertemuan:1, color:"var(--y)"},
        {verb:"Mengidentifikasi", desc:"macam-macam norma (agama, kesusilaan, kesopanan, dan hukum) beserta sumber, sanksi, dan sifatnya masing-masing", pertemuan:2, color:"var(--c)"},
        {verb:"Menganalisis", desc:"pentingnya patuh terhadap norma dan dampak pelanggaran norma bagi diri sendiri, masyarakat, serta kehidupan berbangsa dan bernegara", pertemuan:2, color:"var(--p)"},
        {verb:"Memberikan contoh", desc:"penerapan norma di lingkungan keluarga, sekolah, dan masyarakat dalam kehidupan sehari-hari", pertemuan:3, color:"var(--g)"},
        {verb:"Menerapkan", desc:"perilaku patuh terhadap norma sebagai wujud kesadaran hukum dan tanggung jawab sebagai warga negara yang baik", pertemuan:3, color:"var(--r)"},
      ]
    },
    "blank": { id:"blank", label:"Kosong – Isi Manual", items:[] }
  },

  // ── ATP PRESETS ──
  atp: {
    "bab3-3pertemuan": {
      id:"bab3-3pertemuan", label:"Bab 3 – 3 Pertemuan",
      namaBab:"Bab 3 — Patuh terhadap Norma",
      jumlahPertemuan:3,
      pertemuan:[
        {judul:"Hakikat Norma", tp:"TP 1 — Menjelaskan pengertian & fungsi norma", durasi:"2×40 menit",
         kegiatan:"Apersepsi skenario → Manusia makhluk sosial (Zoon Politikon) → Pengertian norma → Fungsi norma → Diskusi kelompok & kuis tim",
         penilaian:"Observasi + Pemantik"},
        {judul:"Macam-Macam Norma", tp:"TP 2 & 3 — Mengidentifikasi 4 jenis norma + menganalisis sanksi & dampak pelanggaran", durasi:"2×40 menit",
         kegiatan:"4 jenis norma (agama, kesusilaan, kesopanan, hukum) → sanksinya → Game Sortir Norma → Roda Norma → Diskusi kelompok",
         penilaian:"Game + Presentasi"},
        {judul:"Perilaku Patuh terhadap Norma", tp:"TP 4 & 5 — Memberikan contoh penerapan + menerapkan perilaku patuh", durasi:"2×40 menit",
         kegiatan:"Penerapan norma di 4 lingkungan (keluarga, sekolah, masyarakat, negara) → Budaya patuh → Kuis 10 soal → Refleksi & portofolio",
         penilaian:"Kuis + Portofolio"},
      ]
    },
    "blank": { id:"blank", label:"Kosong – Isi Manual", namaBab:"", jumlahPertemuan:3, pertemuan:[] }
  },

  // ── ALUR PEMBELAJARAN PRESETS ──
  alur: {
    "hakikat-norma-80menit": {
      id:"hakikat-norma-80menit", label:"Hakikat Norma – 2×40 menit",
      steps:[
        {fase:"Pendahuluan", durasi:"10 menit", judul:"Apersepsi & Motivasi", deskripsi:"Guru menyapa, memeriksa kesiapan, menampilkan skenario konflik Kampung. Siswa memprediksi apa yang terjadi tanpa norma."},
        {fase:"Inti", durasi:"15 menit", judul:"Skenario Interaktif", deskripsi:"Siswa bermain 3 skenario konflik norma secara individual di perangkat masing-masing. Guru memantau dan mencatat respons."},
        {fase:"Inti", durasi:"20 menit", judul:"Materi Konsep", deskripsi:"Guru menjelaskan Zoon Politikon (Aristoteles), pengertian norma, sumber norma, dan pentingnya norma dalam kehidupan sosial."},
        {fase:"Inti", durasi:"20 menit", judul:"Fungsi Norma & Diskusi", deskripsi:"Eksplorasi 5 fungsi norma melalui tab interaktif. Siswa menulis jawaban refleksi di kolom diskusi masing-masing fungsi."},
        {fase:"Penutup", durasi:"15 menit", judul:"Kuis Tim & Refleksi", deskripsi:"Kuis tim 5 soal antar kelompok. Siswa mengisi refleksi akhir. Guru memberi umpan balik dan menutup pembelajaran."},
      ]
    },
    "blank": { id:"blank", label:"Kosong – Isi Manual", steps:[] }
  },

  // ── SKENARIO PRESETS ──
  skenario: {
    "norma-3-skenario": {
      id:"norma-3-skenario", label:"Hakikat Norma – 3 Skenario Konflik",
      chapters:[
        {id:1,title:"🏘️ Perselisihan di Kampung",bg:"sbg-kampung",charEmoji:"😟",charColor:"#e87070",charPants:"#4a6a9a",
         setup:[
           {speaker:"NARRATOR",text:"Pak Joko baru saja membangun pagar setinggi 3 meter yang menghalangi jalan setapak yang sudah dipakai warga selama puluhan tahun."},
           {speaker:"WARGA 😤",text:'"Jalan itu milik kita bersama! Pak Joko tidak boleh menutupnya begitu saja!"'},
           {speaker:"PAK JOKO 😠",text:'"Tanah itu milik saya! Terserah saya mau bangun apa di sini."'},
           {speaker:"NARRATOR",text:"Kamu adalah Ketua RT yang dipercaya warga. Konflik ini perlu diselesaikan seadil mungkin."},
         ],
         choicePrompt:"Apa yang kamu lakukan sebagai Ketua RT?",
         choices:[
           {icon:"🤝",label:"Adakan musyawarah warga",detail:"Undang Pak Joko dan warga untuk duduk bersama mencari solusi yang adil",good:true,pts:20,norma:"Fungsi Norma: Mencegah Konflik & Mewujudkan Keadilan",level:"good",resultTitle:"Pilihan Terbaik! 🌟",resultBody:"Musyawarah adalah cara terbaik menyelesaikan konflik — inilah bukti norma berfungsi menciptakan ketertiban dan keadilan.",consequences:[{icon:"✅",text:"Konflik bisa diselesaikan tanpa kekerasan dan semua pihak merasa didengar"},{icon:"✅",text:"Norma adat dan hukum dapat diterapkan bersama untuk menemukan solusi adil"},{icon:"✅",text:"Hubungan antarwarga tetap terjaga — itulah fungsi norma sebagai pemersatu"}]},
           {icon:"⚖️",label:"Laporkan ke kelurahan",detail:"Bawa masalah ini ke aparat desa agar diselesaikan secara resmi",good:true,pts:17,norma:"Fungsi Norma Hukum: Perlindungan Hak",level:"good",resultTitle:"Langkah yang Tepat! 👍",resultBody:"Jalur hukum formal memastikan hak semua pihak terlindungi secara sah oleh negara.",consequences:[{icon:"✅",text:"Hak warga atas akses jalan dapat dilindungi secara hukum yang berlaku"},{icon:"✅",text:"Proses resmi memberi kepastian dan tidak bisa diabaikan oleh siapapun"},{icon:"💡",text:"Idealnya coba musyawarah dulu sebelum jalur hukum — lebih cepat dan akrab"}]},
           {icon:"😤",label:"Bela warga, paksa bongkar",detail:"Perintahkan warga untuk membongkar pagar secara paksa bersama-sama",good:false,pts:0,norma:"Melanggar Norma Hukum & Norma Kesopanan",level:"bad",resultTitle:"Pilihan Berbahaya! ⚠️",resultBody:"Tindakan main hakim sendiri justru melanggar norma — tidak ada masalah yang selesai dengan kekerasan.",consequences:[{icon:"❌",text:"Konflik semakin besar dan bisa berujung tindak pidana perusakan"},{icon:"❌",text:"Norma hukum dilanggar: pembongkaran paksa adalah tindakan melawan hukum"},{icon:"❌",text:"Fungsi norma sebagai penjaga ketertiban gagal karena kamu sendiri melanggarnya"}]},
         ]},
        {id:2,title:"🕌 Azan di Waktu Tidur",bg:"sbg-masjid",charEmoji:"😴",charColor:"#4a7a9a",charPants:"#2d4a7a",
         setup:[
           {speaker:"NARRATOR",text:"Subuh pukul 04.30. Suara azan berkumandang dari masjid depan rumah. Kamu baru tidur jam 02.00 karena tugas sekolah."},
           {speaker:"NARRATOR",text:"Tetanggamu, Pak Budi yang non-muslim, mengetuk pintu. Wajahnya terlihat kesal."},
           {speaker:"PAK BUDI 😤",text:'"Bisa minta tolong minta masjidnya kecilkan volume? Itu mengganggu tidur kami setiap subuh!"'},
           {speaker:"NARRATOR",text:"Kamu tahu azan adalah kewajiban agama, tapi kamu juga menghormati tetangga yang berbeda keyakinan."},
         ],
         choicePrompt:"Bagaimana kamu merespons?",
         choices:[
           {icon:"🤝",label:"Ajak bicara pengurus masjid",detail:"Sampaikan kekhawatiran Pak Budi kepada takmir masjid dengan sopan",good:true,pts:20,norma:"Fungsi Norma: Solidaritas & Keadilan",level:"good",resultTitle:"Pilihan Terbaik! 🌟",resultBody:"Menjembatani dua kebutuhan dengan dialog — inilah fungsi norma menjaga solidaritas antarwarga yang berbeda.",consequences:[{icon:"✅",text:"Hak beragama dan hak kenyamanan warga sama-sama dihormati dengan seimbang"},{icon:"✅",text:"Fungsi norma sebagai pemersatu terwujud: perbedaan bukan penghalang untuk hidup damai"},{icon:"✅",text:"Solusi bersama lebih langgeng dari sekadar memaksakan kehendak satu pihak"}]},
           {icon:"🙏",label:"Maklumi, ini norma agama",detail:"Jelaskan kepada Pak Budi bahwa azan adalah kewajiban agama yang harus dihormati",good:false,pts:7,norma:"Norma Kesopanan kurang terjaga",level:"mid",resultTitle:"Kurang Lengkap 🤔",resultBody:"Menjelaskan norma agama itu benar, tapi mengabaikan perasaan tetangga bukan sikap yang bijak.",consequences:[{icon:"🟡",text:"Pak Budi mungkin menerima penjelasanmu, tapi merasa tidak dihiraukan"},{icon:"⚠️",text:"Hubungan bertetangga bisa renggang jika kita hanya melihat dari satu sudut pandang"},{icon:"💡",text:"Norma yang baik melindungi SEMUA pihak — bukan hanya satu kelompok saja"}]},
           {icon:"📢",label:"Minta masjid matikan speaker",detail:"Langsung minta masjid mematikan pengeras suara agar Pak Budi tidak terganggu",good:false,pts:3,norma:"Melanggar Norma Agama & Kesopanan",level:"bad",resultTitle:"Kurang Tepat ⚠️",resultBody:"Meminta penghentian ibadah tanpa dialog adalah tindakan yang tidak menghormati kebebasan beragama.",consequences:[{icon:"❌",text:"Kebebasan beragama adalah hak yang dijamin UUD 1945 — tidak bisa begitu saja dibatasi"},{icon:"❌",text:"Norma agama dan norma hukum dilanggar sekaligus dengan permintaan sepihak ini"},{icon:"💡",text:"Solusi yang baik harus menghormati hak semua pihak — dialog adalah kuncinya"}]},
         ]},
        {id:3,title:"🛒 Antrian di Pasar",bg:"sbg-pasar",charEmoji:"😐",charColor:"#e8a030",charPants:"#3a5a7a",
         setup:[
           {speaker:"NARRATOR",text:"Kamu sedang membantu ibu berbelanja di pasar. Antrian kasir sangat panjang — kamu sudah 15 menit mengantri."},
           {speaker:"NARRATOR",text:"Tiba-tiba seorang ibu tua dengan barang belanjaan yang banyak terhenti di depanmu. Dia terlihat lelah dan kesakitan."},
           {speaker:"IBU TUA 😓",text:'"Maaf dik, kaki saya sakit sekali. Boleh saya numpang antri di sini? Saya tidak kuat lama berdiri."'},
           {speaker:"NARRATOR",text:"Di belakangmu ada 10 orang yang juga sudah lama mengantri. Mereka memperhatikanmu."},
         ],
         choicePrompt:"Apa yang kamu lakukan?",
         choices:[
           {icon:"😊",label:"Persilakan dengan senang hati",detail:"Persilakan ibu tua itu mengantri di depanmu karena ia membutuhkan bantuan",good:true,pts:20,norma:"Fungsi Norma: Solidaritas & Norma Kesopanan",level:"good",resultTitle:"Pilihan Terbaik! 🌟",resultBody:"Mengutamakan yang membutuhkan adalah wujud solidaritas — salah satu fungsi norma yang paling mulia.",consequences:[{icon:"✅",text:"Ibu tua mendapat pertolongan yang ia butuhkan dan merasa dihargai sepenuhnya"},{icon:"✅",text:"Kamu menunjukkan fungsi norma sebagai pemerkuat solidaritas dan kepedulian sosial"},{icon:"🌟",text:"Orang-orang di sekitarmu pun terinspirasi — kebaikan kecilmu berdampak besar"}]},
           {icon:"🤷",label:"Tanya pendapat yang antri",detail:"Tanya dulu kepada orang-orang di belakangmu apakah mereka keberatan",good:true,pts:15,norma:"Norma Kesopanan & Musyawarah",level:"good",resultTitle:"Langkah yang Bijak 👍",resultBody:"Melibatkan semua pihak dalam keputusan adalah bentuk musyawarah yang demokratis.",consequences:[{icon:"✅",text:"Kamu menghormati hak semua orang yang sudah mengantri lebih dulu"},{icon:"✅",text:"Keputusan bersama lebih adil dan tidak menimbulkan rasa iri atau keberatan"},{icon:"💡",text:"Meski memakan waktu, musyawarah adalah cara terbaik dalam banyak situasi"}]},
           {icon:"😑",label:"Tolak, aturan ya aturan",detail:"Jelaskan bahwa sistem antrian harus dihormati dan tidak boleh ada pengecualian",good:false,pts:2,norma:"Norma Kesopanan & Solidaritas dilanggar",level:"bad",resultTitle:"Kurang Berempati ⚠️",resultBody:"Menegakkan aturan itu penting, tapi mengabaikan kondisi darurat seseorang bukan sikap norma yang baik.",consequences:[{icon:"❌",text:"Ibu tua yang kesakitan tidak mendapat pertolongan yang sangat ia butuhkan"},{icon:"❌",text:"Norma solidaritas dan kesopanan dilanggar — kita seharusnya peduli kepada sesama"},{icon:"💡",text:"Norma bukan sekedar aturan kaku — tapi juga sarana mengungkapkan kepedulian"}]},
         ]}
      ]
    },
    "blank": { id:"blank", label:"Kosong – Isi Manual", chapters:[] }
  },

  // ── KUIS PRESETS ──
  kuis: {
    "norma-10-soal": {
      id:"norma-10-soal", label:"Kuis Norma – 10 Soal Pilihan Ganda",
      soal:[
        {q:"Norma adalah aturan atau pedoman yang mengatur...",opts:["Cara berpakaian di sekolah saja","Perilaku manusia dalam kehidupan bermasyarakat","Peraturan tentang pajak negara","Tata cara beribadah di tempat ibadah"],ans:1,ex:"Norma mengatur perilaku manusia secara umum dalam kehidupan sosial bersama."},
        {q:"Aristoteles menyebut manusia sebagai Zoon Politikon karena...",opts:["Manusia adalah makhluk paling cerdas di bumi","Manusia selalu membutuhkan orang lain dalam hidupnya","Manusia bisa berpolitik dan memimpin negara","Manusia memiliki akal budi yang membedakan dari hewan"],ans:1,ex:"Zoon Politikon berarti makhluk sosial — manusia tidak bisa hidup sendiri tanpa bantuan orang lain."},
        {q:"Fungsi norma yang paling utama dalam masyarakat adalah...",opts:["Memberikan sanksi bagi pelanggar","Mengatur dan menciptakan ketertiban bersama","Menghukum orang yang berbuat salah","Membatasi kebebasan setiap warga"],ans:1,ex:"Fungsi utama norma adalah menciptakan ketertiban agar kehidupan bersama berjalan dengan harmonis."},
        {q:"Norma yang bersumber dari keyakinan tentang perintah dan larangan Tuhan disebut norma...",opts:["Hukum","Kesopanan","Kesusilaan","Agama"],ans:3,ex:"Norma agama bersumber dari wahyu Tuhan dan pedoman keagamaan masing-masing agama."},
        {q:"Pak Budi membuang sampah di sungai dan diabaikan oleh warga. Fungsi norma apa yang gagal?",opts:["Pedoman tingkah laku","Memperkuat solidaritas","Melindungi hak warga","Menciptakan ketertiban"],ans:3,ex:"Norma seharusnya menjaga ketertiban lingkungan — membuang sampah sembarangan merusak ketertiban bersama."},
        {q:"Contoh norma kesopanan di sekolah adalah...",opts:["Membayar iuran sekolah tepat waktu","Mengucap salam kepada guru saat berpapasan","Tidak mencuri barang milik teman","Berdoa sebelum memulai pelajaran"],ans:1,ex:"Mengucap salam adalah norma kesopanan yang mengatur etika pergaulan dan menghormati orang lain."},
        {q:"Norma yang pelanggarannya dikenai sanksi berupa hukuman dari negara disebut norma...",opts:["Agama","Kesusilaan","Kesopanan","Hukum"],ans:3,ex:"Norma hukum punya sanksi tegas dari negara berupa denda, penjara, atau sanksi formal lainnya."},
        {q:"Ketika ada warga yang terkena musibah dan tetangga membantu gotong royong, ini menunjukkan fungsi norma sebagai...",opts:["Pedoman tingkah laku","Penentu sanksi","Memperkuat solidaritas","Melindungi hak warga"],ans:2,ex:"Gotong royong adalah wujud norma yang memperkuat solidaritas dan rasa kebersamaan antaranggota masyarakat."},
        {q:"Jika seseorang melanggar norma agama, sanksi yang paling utama diterimanya adalah...",opts:["Denda dari pemerintah","Penjara","Dikucilkan dari masyarakat","Dosa dan hukuman dari Tuhan"],ans:3,ex:"Sanksi norma agama bersifat spiritual — berupa dosa yang dipercaya akan dipertanggungjawabkan kepada Tuhan."},
        {q:"Tujuan utama mempelajari norma bagi siswa kelas VII adalah...",opts:["Agar bisa menjadi hakim di masa depan","Agar paham cara menghindari hukuman","Agar dapat berperilaku sesuai aturan sebagai warga negara yang baik","Agar tahu sanksi yang akan diterima jika melanggar"],ans:2,ex:"Mempelajari norma bertujuan membentuk karakter warga negara yang baik, taat aturan, dan bertanggung jawab."},
      ]
    },
    "blank": { id:"blank", label:"Kosong – Isi Manual", soal:[] }
  },

  // ── CONTENT TYPE REGISTRY ──
  contentTypes: [
    {id:"cover",icon:"🎬",label:"Cover / Halaman Depan",builtin:true},
    {id:"cp",icon:"📋",label:"CP, TP & ATP",builtin:true},
    {id:"skenario",icon:"🎭",label:"Skenario Interaktif",builtin:true},
    {id:"materi",icon:"📖",label:"Materi Konsep",builtin:true},
    {id:"fungsi",icon:"🗺️",label:"Fungsi Norma (Tab)",builtin:true},
    {id:"diskusi",icon:"💬",label:"Diskusi & Refleksi",builtin:true},
    {id:"kuis",icon:"❓",label:"Kuis Pilihan Ganda",builtin:true},
    {id:"teamgame",icon:"🏆",label:"Game Tim / Kelompok",builtin:true},
    {id:"hasil",icon:"📊",label:"Hasil & Sertifikat",builtin:true},
  ],

  // ── FUNGSI NORMA ──
  fungsi: [
    {icon:"🗺️",label:"Pedoman Tingkah Laku",color:"var(--y)",bg:"rgba(249,193,46,.06)",bc:"rgba(249,193,46,.25)",
     desc:"Norma memberi petunjuk kepada setiap individu tentang cara bertindak yang baik dan benar dalam pergaulan sehari-hari.",
     contoh:["Norma sopan santun mengajarkan kita untuk mengucapkan salam saat bertemu","Norma hukum lalu lintas memberi tahu kita harus berhenti saat lampu merah","Norma agama memandu kita untuk berdoa sebelum makan dan bekerja"],
     tanya:"Sebutkan 1 norma yang selama ini menjadi panduan perilakumu di sekolah!"},
    {icon:"🤝",label:"Menciptakan Ketertiban",color:"var(--c)",bg:"rgba(62,207,207,.06)",bc:"rgba(62,207,207,.25)",
     desc:"Norma mencegah kekacauan dan konflik. Dengan norma, setiap orang tahu apa yang boleh dan tidak boleh dilakukan sehingga kehidupan berjalan teratur.",
     contoh:["Norma antrian di kasir mencegah keributan dan memastikan semua dilayani adil","Peraturan sekolah membuat proses belajar-mengajar berlangsung kondusif","Aturan lalu lintas mencegah kecelakaan dan kemacetan di jalan raya"],
     tanya:"Bayangkan jika tidak ada aturan di kelasmu — apa yang akan terjadi dalam 1 jam pelajaran?"},
    {icon:"🛡️",label:"Melindungi Hak Warga",color:"var(--r)",bg:"rgba(255,107,107,.06)",bc:"rgba(255,107,107,.25)",
     desc:"Norma menjamin setiap anggota masyarakat mendapatkan hak-haknya dan diperlakukan secara adil tanpa diskriminasi.",
     contoh:["Hukum melindungi hak milik — orang tidak boleh mencuri barang orang lain","Norma agama melindungi hak beribadah setiap pemeluknya dari gangguan","Aturan sekolah melindungi setiap siswa dari perundungan (bullying)"],
     tanya:"Hak apa yang kamu rasakan paling terlindungi oleh norma di lingkunganmu?"},
    {icon:"💚",label:"Memperkuat Solidaritas",color:"var(--g)",bg:"rgba(52,211,153,.06)",bc:"rgba(52,211,153,.25)",
     desc:"Norma mempererat rasa kebersamaan, persatuan, dan kepedulian antaranggota masyarakat. Norma mengajarkan bahwa kita saling membutuhkan satu sama lain.",
     contoh:["Norma gotong royong mendorong warga saling membantu saat ada musibah","Norma saling menghormati memperkuat persatuan di tengah keberagaman","Tradisi saling mengunjungi saat Lebaran/Natal mempererat tali silaturahmi"],
     tanya:"Contoh kegiatan gotong royong apa yang masih ada di lingkunganmu saat ini?"},
    {icon:"⚖️",label:"Mewujudkan Keadilan",color:"var(--p)",bg:"rgba(167,139,250,.06)",bc:"rgba(167,139,250,.25)",
     desc:"Norma memastikan setiap orang diperlakukan setara dan adil. Tidak ada yang boleh mendapat perlakuan berbeda hanya karena kekayaan, jabatan, atau kekuasaan.",
     contoh:["Hukum berlaku sama untuk semua orang — kaya atau miskin, pejabat atau rakyat biasa","Norma antrian memastikan semua orang mendapat giliran yang sama tanpa pengecualian","Penilaian di sekolah menggunakan kriteria yang sama untuk semua siswa"],
     tanya:"Pernahkah kamu melihat ketidakadilan di sekitarmu? Norma apa yang seharusnya ditegakkan?"},
  ],

};

// ── LIVE STATE ──────────────────────────────────────────────────
window.AT_STATE = {
  // Current doc being edited
  activePreset: null,
  meta: { judulPertemuan:"", subjudul:"", ikon:"📚", durasi:"", namaBab:"", mapel:"", kelas:"", kurikulum:"" },
  cp: { elemen:"", subElemen:"", capaianFase:"", profil:[], fase:"D", kelas:"" },
  tp: [],      // [{verb, desc, pertemuan, color}]
  atp: { namaBab:"", jumlahPertemuan:3, pertemuan:[] },
  alur: [],    // [{fase, durasi, judul, deskripsi}]
  skenario: [],
  modules: [],   // [{type, ...data}] — sistem modul fleksibel v1.1
  games:   [],   // [{type, ...data}] — game interaktif v1.2
  kuis: [],
  contentTypes: [],
  guruPw: "guru123",
  dirty: false,
};

// ── EXCEL TEMPLATE SCHEMA ──────────────────────────────────────
// Columns for import: Sheet1=Meta, Sheet2=CP, Sheet3=TP, Sheet4=ATP, Sheet5=Alur, Sheet6=Kuis
window.EXCEL_SCHEMA = {
  sheets: [
    { name:"META", fields:["judulPertemuan","subjudul","ikon","durasi","namaBab","mapel","kelas","kurikulum"] },
    { name:"CP", fields:["elemen","subElemen","capaianFase","profil","fase","kelas"] },
    { name:"TP", fields:["verb","desc","pertemuan","color"] },
    { name:"ATP", fields:["namaBab","no","judul","tp","durasi","kegiatan","penilaian"] },
    { name:"ALUR", fields:["no","fase","durasi","judul","deskripsi"] },
    { name:"KUIS", fields:["no","soal","optA","optB","optC","optD","jawaban","penjelasan"] },
  ]
};

// ── STORAGE HELPERS ──────────────────────────────────────────────
window.AT_STORAGE = {
  KEY: "at_state_v1",
  save(data){ try{ localStorage.setItem(this.KEY, JSON.stringify(data)); return true; } catch(e){ return false; } },
  load(){ try{ const d=localStorage.getItem(this.KEY); return d?JSON.parse(d):null; } catch(e){ return null; } },
  clear(){ localStorage.removeItem(this.KEY); },
  saveProjects(projects){ try{ localStorage.setItem("at_projects_v1", JSON.stringify(projects)); } catch(e){} },
  loadProjects(){ try{ const d=localStorage.getItem("at_projects_v1"); return d?JSON.parse(d):[]; } catch(e){ return []; } },
};

// ── UTILITIES ──────────────────────────────────────────────────
window.AT_UTIL = {
  uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); },
  deepClone(obj){ return JSON.parse(JSON.stringify(obj)); },
  toast(msg,type="ok"){
    const el=document.getElementById("atToast");
    if(!el) return;
    el.textContent=msg;
    el.className="at-toast show "+(type==="err"?"err":"");
    clearTimeout(el._t);
    el._t=setTimeout(()=>el.classList.remove("show"),2800);
  },
  colorForIndex(i){ const cols=["var(--y)","var(--c)","var(--p)","var(--g)","var(--r)","var(--o)"]; return cols[i%cols.length]; },
  verbOptions:["Menjelaskan","Mengidentifikasi","Menganalisis","Memberikan contoh","Menerapkan","Mengevaluasi","Membandingkan","Menyimpulkan","Mendeskripsikan","Merancang","Membuat","Mempresentasikan"],
};

console.log("✅ data.js loaded — PRESETS & AT_STATE ready");
