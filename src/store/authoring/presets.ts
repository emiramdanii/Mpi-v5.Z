import type {
  MetaPreset, CpPreset, TpPreset, AtpPreset, AlurPreset,
  KuisPreset, MateriPreset, ModulePreset, SkenarioPreset, FullPresetMapping,
} from './types';

// ── Preset Data ──────────────────────────────────────────────────
export const PRESETS_META: Record<string, MetaPreset> = {
  'hakikat-norma': {
    id: 'hakikat-norma', label: 'Bab 3 – Pertemuan 1: Hakikat Norma',
    mapel: 'PPKn', kelas: 'VII', kurikulum: 'Kurikulum Merdeka',
    judulPertemuan: 'Pertemuan 1 – Hakikat Norma',
    subjudul: 'Mengapa manusia membutuhkan norma?',
    ikon: '\uD83E\uDDD1\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1', durasi: '2 \u00D7 40 menit', namaBab: 'Hakikat Norma',
  },
  'macam-norma': {
    id: 'macam-norma', label: 'Bab 3 – Pertemuan 2: Macam-Macam Norma',
    mapel: 'PPKn', kelas: 'VII', kurikulum: 'Kurikulum Merdeka',
    judulPertemuan: 'Pertemuan 2 – Macam-Macam Norma',
    subjudul: 'Apa saja jenis norma yang mengatur kehidupan kita?',
    ikon: '\uD83D\uDCDC', durasi: '2 \u00D7 40 menit', namaBab: 'Macam-Macam Norma',
  },
  blank: {
    id: 'blank', label: 'Kosong – Mulai dari Nol',
    mapel: '', kelas: '', kurikulum: 'Kurikulum Merdeka',
    judulPertemuan: '', subjudul: '', ikon: '\uD83D\uDCDA', durasi: '2 \u00D7 40 menit', namaBab: '',
  },
};

export const PRESETS_CP: Record<string, CpPreset> = {
  'ppkn-smp-bab3': {
    id: 'ppkn-smp-bab3',
    label: 'PPKn SMP – Bab 3: Patuh terhadap Norma',
    elemen: 'Pancasila',
    subElemen: 'Pemahaman norma dan nilai',
    capaianFase: 'Peserta didik mampu menganalisis pentingnya norma dalam kehidupan bermasyarakat, berbangsa, dan bernegara; serta menunjukkan perilaku patuh terhadap norma sebagai wujud kesadaran hukum.',
    profil: ['Beriman & Bertakwa kepada Tuhan YME', 'Berkebhinekaan Global', 'Bergotong Royong', 'Bernalar Kritis'],
    fase: 'D', kelas: 'VII',
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', elemen: '', subElemen: '', capaianFase: '', profil: [], fase: 'D', kelas: '' },
};

export const PRESETS_TP: Record<string, TpPreset> = {
  'bab3-full': {
    id: 'bab3-full', label: 'Bab 3 – 5 TP Lengkap',
    items: [
      { verb: 'Menjelaskan', desc: 'pengertian norma sebagai aturan yang mengikat warga masyarakat dan berfungsi sebagai pedoman tingkah laku dalam kehidupan bersama', pertemuan: 1, color: '#f9c82e' },
      { verb: 'Mengidentifikasi', desc: 'macam-macam norma (agama, kesusilaan, kesopanan, dan hukum) beserta sumber, sanksi, dan sifatnya masing-masing', pertemuan: 2, color: '#3ecfcf' },
      { verb: 'Menganalisis', desc: 'pentingnya patuh terhadap norma dan dampak pelanggaran norma bagi diri sendiri, masyarakat, serta kehidupan berbangsa dan bernegara', pertemuan: 2, color: '#a78bfa' },
      { verb: 'Memberikan contoh', desc: 'penerapan norma di lingkungan keluarga, sekolah, dan masyarakat dalam kehidupan sehari-hari', pertemuan: 3, color: '#34d399' },
      { verb: 'Menerapkan', desc: 'perilaku patuh terhadap norma sebagai wujud kesadaran hukum dan tanggung jawab sebagai warga negara yang baik', pertemuan: 3, color: '#ff6b6b' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', items: [] },
};

export const PRESETS_ATP: Record<string, AtpPreset> = {
  'bab3-3pertemuan': {
    id: 'bab3-3pertemuan', label: 'Bab 3 – 3 Pertemuan',
    namaBab: 'Bab 3 \u2014 Patuh terhadap Norma',
    jumlahPertemuan: 3,
    pertemuan: [
      { judul: 'Hakikat Norma', tp: 'TP 1 \u2014 Menjelaskan pengertian & fungsi norma', durasi: '2\u00D740 menit', kegiatan: 'Apersepsi skenario \u2192 Manusia makhluk sosial (Zoon Politikon) \u2192 Pengertian norma \u2192 Fungsi norma \u2192 Diskusi kelompok & kuis tim', penilaian: 'Observasi + Pemantik' },
      { judul: 'Macam-Macam Norma', tp: 'TP 2 & 3 \u2014 Mengidentifikasi 4 jenis norma + menganalisis sanksi & dampak pelanggaran', durasi: '2\u00D740 menit', kegiatan: '4 jenis norma (agama, kesusilaan, kesopanan, hukum) \u2192 sanksinya \u2192 Game Sortir Norma \u2192 Roda Norma \u2192 Diskusi kelompok', penilaian: 'Game + Presentasi' },
      { judul: 'Perilaku Patuh terhadap Norma', tp: 'TP 4 & 5 \u2014 Memberikan contoh penerapan + menerapkan perilaku patuh', durasi: '2\u00D740 menit', kegiatan: 'Penerapan norma di 4 lingkungan (keluarga, sekolah, masyarakat, negara) \u2192 Budaya patuh \u2192 Kuis 10 soal \u2192 Refleksi & portofolio', penilaian: 'Kuis + Portofolio' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', namaBab: '', jumlahPertemuan: 3, pertemuan: [] },
};

export const PRESETS_ALUR: Record<string, AlurPreset> = {
  'hakikat-norma-80menit': {
    id: 'hakikat-norma-80menit', label: 'Hakikat Norma \u2013 2\u00D740 menit',
    steps: [
      { fase: 'Pendahuluan', durasi: '10 menit', judul: 'Apersepsi & Motivasi', deskripsi: 'Guru menyapa, memeriksa kesiapan, menampilkan skenario konflik Kampung. Siswa memprediksi apa yang terjadi tanpa norma.' },
      { fase: 'Inti', durasi: '15 menit', judul: 'Skenario Interaktif', deskripsi: 'Siswa bermain 3 skenario konflik norma secara individual di perangkat masing-masing. Guru memantau dan mencatat respons.' },
      { fase: 'Inti', durasi: '20 menit', judul: 'Materi Konsep', deskripsi: 'Guru menjelaskan Zoon Politikon (Aristoteles), pengertian norma, sumber norma, dan pentingnya norma dalam kehidupan sosial.' },
      { fase: 'Inti', durasi: '20 menit', judul: 'Fungsi Norma & Diskusi', deskripsi: 'Eksplorasi 5 fungsi norma melalui tab interaktif. Siswa menulis jawaban refleksi di kolom diskusi masing-masing fungsi.' },
      { fase: 'Penutup', durasi: '15 menit', judul: 'Kuis Tim & Refleksi', deskripsi: 'Kuis tim 5 soal antar kelompok. Siswa mengisi refleksi akhir. Guru memberi umpan balik dan menutup pembelajaran.' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', steps: [] },
};

export const PRESETS_KUIS: Record<string, KuisPreset> = {
  'norma-10-soal': {
    id: 'norma-10-soal', label: 'Kuis Norma \u2013 10 Soal Pilihan Ganda',
    soal: [
      { q: 'Norma adalah aturan atau pedoman yang mengatur...', opts: ['Cara berpakaian di sekolah saja', 'Perilaku manusia dalam kehidupan bermasyarakat', 'Peraturan tentang pajak negara', 'Tata cara beribadah di tempat ibadah'], ans: 1, ex: 'Norma mengatur perilaku manusia secara umum dalam kehidupan sosial bersama.' },
      { q: 'Aristoteles menyebut manusia sebagai Zoon Politikon karena...', opts: ['Manusia adalah makhluk paling cerdas di bumi', 'Manusia selalu membutuhkan orang lain dalam hidupnya', 'Manusia bisa berpolitik dan memimpin negara', 'Manusia memiliki akal budi yang membedakan dari hewan'], ans: 1, ex: 'Zoon Politikon berarti makhluk sosial \u2014 manusia tidak bisa hidup sendiri tanpa bantuan orang lain.' },
      { q: 'Fungsi norma yang paling utama dalam masyarakat adalah...', opts: ['Memberikan sanksi bagi pelanggar', 'Mengatur dan menciptakan ketertiban bersama', 'Menghukum orang yang berbuat salah', 'Membatasi kebebasan setiap warga'], ans: 1, ex: 'Fungsi utama norma adalah menciptakan ketertiban agar kehidupan bersama berjalan dengan harmonis.' },
      { q: 'Norma yang bersumber dari keyakinan tentang perintah dan larangan Tuhan disebut norma...', opts: ['Hukum', 'Kesopanan', 'Kesusilaan', 'Agama'], ans: 3, ex: 'Norma agama bersumber dari wahyu Tuhan dan pedoman keagamaan masing-masing agama.' },
      { q: 'Pak Budi membuang sampah di sungai dan diabaikan oleh warga. Fungsi norma apa yang gagal?', opts: ['Pedoman tingkah laku', 'Memperkuat solidaritas', 'Melindungi hak warga', 'Menciptakan ketertiban'], ans: 3, ex: 'Norma seharusnya menjaga ketertiban lingkungan \u2014 membuang sampah sembarangan merusak ketertiban bersama.' },
      { q: 'Contoh norma kesopanan di sekolah adalah...', opts: ['Membayar iuran sekolah tepat waktu', 'Mengucap salam kepada guru saat berpapasan', 'Tidak mencuri barang milik teman', 'Berdoa sebelum memulai pelajaran'], ans: 1, ex: 'Mengucap salam adalah norma kesopanan yang mengatur etika pergaulan dan menghormati orang lain.' },
      { q: 'Norma yang pelanggarannya dikenai sanksi berupa hukuman dari negara disebut norma...', opts: ['Agama', 'Kesusilaan', 'Kesopanan', 'Hukum'], ans: 3, ex: 'Norma hukum punya sanksi tegas dari negara berupa denda, penjara, atau sanksi formal lainnya.' },
      { q: 'Ketika ada warga yang terkena musibah dan tetangga membantu gotong royong, ini menunjukkan fungsi norma sebagai...', opts: ['Pedoman tingkah laku', 'Penentu sanksi', 'Memperkuat solidaritas', 'Melindungi hak warga'], ans: 2, ex: 'Gotong royong adalah wujud norma yang memperkuat solidaritas dan rasa kebersamaan antaranggota masyarakat.' },
      { q: 'Jika seseorang melanggar norma agama, sanksi yang paling utama diterimanya adalah...', opts: ['Denda dari pemerintah', 'Penjara', 'Dikucilkan dari masyarakat', 'Dosa dan hukuman dari Tuhan'], ans: 3, ex: 'Sanksi norma agama bersifat spiritual \u2014 berupa dosa yang dipercaya akan dipertanggungjawabkan kepada Tuhan.' },
      { q: 'Tujuan utama mempelajari norma bagi siswa kelas VII adalah...', opts: ['Agar bisa menjadi hakim di masa depan', 'Agar paham cara menghindari hukuman', 'Agar dapat berperilaku sesuai aturan sebagai warga negara yang baik', 'Agar tahu sanksi yang akan diterima jika melanggar'], ans: 2, ex: 'Mempelajari norma bertujuan membentuk karakter warga negara yang baik, taat aturan, dan bertanggung jawab.' },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', soal: [] },
};

export const PRESETS_MATERI: Record<string, MateriPreset> = {
  'hakikat-norma-materi': {
    id: 'hakikat-norma-materi', label: 'Hakikat Norma – Materi Blok',
    blok: [
      { tipe: 'definisi', judul: 'Pengertian Norma', isi: 'Norma adalah aturan atau pedoman yang mengatur perilaku manusia dalam kehidupan bermasyarakat, berbangsa, dan bernegara. Norma bersifat mengikat dan memiliki sanksi bagi pelanggarnya.' },
      { tipe: 'poin', judul: 'Sumber Norma', butir: ['Adat istiadat dan kebiasaan masyarakat', 'Agama dan keyakinan spiritual', 'Nilai kesusilaan dan hati nurani', 'Peraturan perundang-undangan negara'] },
      { tipe: 'kutipan', judul: 'Zoon Politikon – Aristoteles', isi: 'Manusia adalah makhluk sosial (Zoon Politikon) yang selalu membutuhkan orang lain dan tidak bisa hidup sendiri. Karena itu, norma diperlukan untuk mengatur kehidupan bersama.' },
      { tipe: 'poin', judul: 'Fungsi Norma', butir: ['Sebagai pedoman tingkah laku', 'Menciptakan ketertiban dan ketentraman', 'Memperkuat solidaritas antarwarga', 'Melindungi hak dan kepentingan warga', 'Memberikan sanksi bagi pelanggar'] },
    ],
  },
  'macam-norma-materi': {
    id: 'macam-norma-materi', label: 'Macam-Macam Norma – Materi Blok',
    blok: [
      { tipe: 'definisi', judul: 'Macam-Macam Norma', isi: 'Norma dalam masyarakat terdiri dari empat jenis utama: norma agama, norma kesusilaan, norma kesopanan, dan norma hukum. Masing-masing memiliki sumber, sifat, dan sanksi yang berbeda.' },
      { tipe: 'tabel', judul: 'Perbandingan 4 Jenis Norma', baris: [['Jenis Norma', 'Sumber', 'Sanksi'], ['Norma Agama', 'Wahyu Tuhan / Kitab Suci', 'Dosa / Hukuman akhirat'], ['Norma Kesusilaan', 'Hati nurani / Suara batin', 'Rasa menyesal / Malu'], ['Norma Kesopanan', 'Kebiasaan masyarakat', 'Dicemooh / Dikucilkan'], ['Norma Hukum', 'Peraturan perundang-undangan', 'Denda / Penjara / Hukuman negara']] },
      { tipe: 'poin', judul: 'Norma Agama', butir: ['Bersumber dari wahyu Tuhan', 'Berlaku untuk pemeluk agama tertentu', 'Sanksi bersifat spiritual (dosa)', 'Contoh: Larangan mencuri, perintah beribadah'] },
      { tipe: 'poin', judul: 'Norma Hukum', butir: ['Bersumber dari peraturan perundang-undangan', 'Berlaku untuk semua warga negara', 'Sanksi tegas dari negara (denda, penjara)', 'Contoh: UUD 1945, KUHP, UU No. 1 Tahun 2023'] },
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', blok: [] },
};

export const PRESETS_MODULES: Record<string, ModulePreset> = {
  'hakikat-norma-modules': {
    id: 'hakikat-norma-modules', label: 'Hakikat Norma – Modules',
    modules: [
      {
        type: 'truefalse',
        title: 'Benar-Salah: Hakikat Norma',
        instruksi: 'Tentukan pernyataan berikut benar atau salah!',
        soal: [
          { teks: 'Norma hanya berlaku di lingkungan keluarga', benar: false },
          { teks: 'Aristoteles menyebut manusia sebagai Zoon Politikon', benar: true },
          { teks: 'Norma tidak memiliki sanksi bagi pelanggarnya', benar: false },
          { teks: 'Fungsi utama norma adalah menciptakan ketertiban', benar: true },
          { teks: 'Manusia bisa hidup sendiri tanpa norma', benar: false },
        ],
      } as unknown as Record<string, unknown>,
      {
        type: 'memory',
        title: 'Memory: Jenis Norma',
        pasangan: [
          { kiri: 'Norma Agama', kanan: 'Wahyu Tuhan' },
          { kiri: 'Norma Kesusilaan', kanan: 'Hati Nurani' },
          { kiri: 'Norma Kesopanan', kanan: 'Kebiasaan' },
          { kiri: 'Norma Hukum', kanan: 'Undang-Undang' },
        ],
      } as unknown as Record<string, unknown>,
      {
        type: 'infografis',
        title: 'Infografis: Sumber & Fungsi Norma',
        layout: 'grid',
        intro: 'Pelajari sumber dan fungsi norma melalui kartu interaktif!',
        kartu: [
          { icon: '\uD83D\uDCDC', judul: 'Adat Istiadat', isi: 'Kebiasaan turun-temurun yang menjadi pedoman masyarakat', warna: '#f9c82e' },
          { icon: '\uD83D\uDE4F', judul: 'Agama', isi: 'Wahyu Tuhan yang mengatur tata cara beribadah dan hubungan manusia dengan Tuhan', warna: '#3ecfcf' },
          { icon: '\uD83D\uDCAD', judul: 'Kesusilaan', isi: 'Hati nurani yang membedakan baik dan buruk', warna: '#a78bfa' },
          { icon: '\u2696\uFE0F', judul: 'Hukum', isi: 'Peraturan negara yang mengikat semua warga dengan sanksi tegas', warna: '#34d399' },
        ],
      } as unknown as Record<string, unknown>,
      {
        type: 'tab-icons',
        title: 'Tab Fungsi Norma',
        intro: 'Klik tiap tab untuk mempelajari fungsi norma!',
        layout: 'horizontal',
        animation: 'fade',
        tabs: [
          { icon: '\uD83D\uDDFA\uFE0F', judul: 'Pedoman', warna: '#f9c82e', isi: 'Norma memberi petunjuk tentang perilaku yang boleh dan tidak boleh dilakukan', poin: ['Menunjukkan jalan yang benar', 'Mengarahkan perilaku positif'], refleksi: 'Norma mana yang paling sering menjadi pedomanmu?' },
          { icon: '\uD83E\uDD1D', judul: 'Ketertiban', warna: '#3ecfcf', isi: 'Norma menciptakan ketertiban agar kehidupan bersama berjalan tertib', poin: ['Mencegah kekacauan', 'Mengatur hak dan kewajiban'], refleksi: 'Apa yang terjadi tanpa ketertiban?' },
          { icon: '\uD83D\uDEE1\uFE0F', judul: 'Perlindungan', warna: '#34d399', isi: 'Norma melindungi hak setiap warga dari perbuatan sewenang-wenang', poin: ['Menjamin keadilan', 'Melindungi yang lemah'], refleksi: 'Siapa yang terlindungi oleh norma?' },
          { icon: '\uD83D\uDC9A', judul: 'Solidaritas', warna: '#a78bfa', isi: 'Norma memperkuat rasa kebersamaan dan gotong royong', poin: ['Meningkatkan kepedulian', 'Mempererat hubungan sosial'], refleksi: 'Bagaimana norma memperkuat persatuan?' },
          { icon: '\u2696\uFE0F', judul: 'Keadilan', warna: '#ff6b6b', isi: 'Norma menegakkan keadilan agar tidak ada yang dirugikan', poin: ['Menjamin kesetaraan', 'Memberi sanksi yang adil'], refleksi: 'Mengapa keadilan penting dalam norma?' },
        ],
      } as unknown as Record<string, unknown>,
    ],
  },
  'macam-norma-modules': {
    id: 'macam-norma-modules', label: 'Macam-Macam Norma – Modules',
    modules: [
      {
        type: 'matching',
        title: 'Cocokkan: Jenis Norma & Sanksi',
        instruksi: 'Cocokkan jenis norma dengan sanksi yang tepat!',
        pasangan: [
          { kiri: 'Norma Agama', kanan: 'Dosa' },
          { kiri: 'Norma Kesusilaan', kanan: 'Menyesal' },
          { kiri: 'Norma Kesopanan', kanan: 'Dicemooh' },
          { kiri: 'Norma Hukum', kanan: 'Penjara' },
        ],
      } as unknown as Record<string, unknown>,
      {
        type: 'sorting',
        title: 'Sortir: Contoh Norma',
        instruksi: 'Kelompokkan contoh berikut ke jenis norma yang tepat!',
        kategori: [
          { label: 'Norma Agama', color: '#f9c82e', id: 'agama' },
          { label: 'Norma Kesopanan', color: '#3ecfcf', id: 'sopan' },
        ],
        items: [
          { teks: 'Berdoa sebelum makan', kategori: 'agama' },
          { teks: 'Mengucap salam kepada guru', kategori: 'sopan' },
          { teks: 'Beribadah di tempat ibadah', kategori: 'agama' },
          { teks: 'Menghormati orang yang lebih tua', kategori: 'sopan' },
        ],
      } as unknown as Record<string, unknown>,
      {
        type: 'infografis',
        title: 'Infografis: 4 Jenis Norma',
        layout: 'grid',
        intro: 'Kenali 4 jenis norma melalui kartu interaktif!',
        kartu: [
          { icon: '\uD83D\uDE4F', judul: 'Norma Agama', isi: 'Bersumber dari wahyu Tuhan. Sanksi: dosa. Berlaku untuk pemeluk agama.', warna: '#f9c82e' },
          { icon: '\uD83D\uDCAD', judul: 'Norma Kesusilaan', isi: 'Bersumber dari hati nurani. Sanksi: rasa menyesal. Berlaku universal.', warna: '#3ecfcf' },
          { icon: '\uD83E\uDD1D', judul: 'Norma Kesopanan', isi: 'Bersumber dari kebiasaan masyarakat. Sanksi: dicemooh. Berlaku lokal.', warna: '#a78bfa' },
          { icon: '\u2696\uFE0F', judul: 'Norma Hukum', isi: 'Bersumber dari UU. Sanksi: denda/penjara. Berlaku untuk semua warga negara.', warna: '#34d399' },
        ],
      } as unknown as Record<string, unknown>,
      {
        type: 'accordion',
        title: 'Accordion: Macam-Macam Norma',
        intro: 'Klik untuk membuka detail setiap jenis norma!',
        items: [
          { icon: '\uD83D\uDE4F', judul: 'Norma Agama', isi: 'Norma agama bersumber dari wahyu Tuhan dan kitab suci. Contoh: Larangan mencuri, perintah beribadah. Sanksi pelanggaran berupa dosa yang akan dipertanggungjawabkan di akhirat.' },
          { icon: '\uD83D\uDCAD', judul: 'Norma Kesusilaan', isi: 'Norma kesusilaan bersumber dari hati nurani manusia. Contoh: Tidak boleh berbohong, menghormati orang tua. Sanksi pelanggaran berupa rasa menyesal dan malu dari dalam hati.' },
          { icon: '\uD83E\uDD1D', judul: 'Norma Kesopanan', isi: 'Norma kesopanan bersumber dari kebiasaan masyarakat. Contoh: Mengucap salam, makan dengan tangan kanan. Sanksi pelanggaran berupa dicemooh atau dikucilkan masyarakat.' },
          { icon: '\u2696\uFE0F', judul: 'Norma Hukum', isi: 'Norma hukum bersumber dari peraturan perundang-undangan. Contoh: UUD 1945, KUHP. Sanksi pelanggaran berupa denda, penjara, atau hukuman negara lainnya.' },
        ],
      } as unknown as Record<string, unknown>,
    ],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', modules: [] },
};

export const PRESETS_SKENARIO: Record<string, SkenarioPreset> = {
  'hakikat-norma-skenario': {
    id: 'hakikat-norma-skenario', label: 'Hakikat Norma – Skenario',
    skenario: [
      {
        title: 'Menolak Ajakan Melanggar Norma',
        bg: 'sbg-kampung',
        charEmoji: '\uD83E\uDDD1',
        charColor: '#3ecfcf',
        charPants: '#2563eb',
        choicePrompt: 'Apa yang akan kamu lakukan?',
        setup: [
          { speaker: 'NARRATOR', text: 'Di sebuah kampung, kamu melihat temanmu mengajakmu untuk membuang sampah di sungai.' },
          { speaker: 'FRIEND', text: 'Ayo buang sampah di sungai saja, orang-orang juga pada begitu kok!' },
        ],
        choices: [
          {
            icon: '\uD83E\uDD1D', label: 'Tolak & Jelaskan', detail: 'Kamu menolak dan menjelaskan pentingnya menjaga kebersihan', good: true, pts: 10, level: 'good',
            norma: 'Norma kesopanan dan hukum', resultTitle: 'Pilihan Tepat!', resultBody: 'Kamu menolak ajakan melanggar norma dan menjaga kebersihan lingkungan.',
            consequences: [{ icon: '\u2705', text: 'Lingkungan tetap bersih' }, { icon: '\uD83E\uDD1D', text: 'Temanmu belajar tentang norma' }],
          },
          {
            icon: '\uD83D\uDDD1\uFE0F', label: 'Ikut Membuang', detail: 'Kamu ikut membuang sampah di sungai karena malas mencari tempat sampah', good: false, pts: 0, level: 'bad',
            norma: 'Melanggar norma hukum & kesopanan', resultTitle: 'Konsekuensi!', resultBody: 'Sungai menjadi kotor dan mencemari lingkungan. Kamu melanggar norma.',
            consequences: [{ icon: '\u26A0\uFE0F', text: 'Sungai tercemar' }, { icon: '\u274C', text: 'Melanggar norma hukum' }],
          },
        ],
      },
      {
        title: 'Menolak Bullying di Sekolah',
        bg: 'sbg-sekolah',
        charEmoji: '\uD83E\uDDD1',
        charColor: '#a78bfa',
        charPants: '#7c3aed',
        choicePrompt: 'Apa yang akan kamu lakukan?',
        setup: [
          { speaker: 'NARRATOR', text: 'Di sekolah, kamu melihat kelompok siswa mengganggu teman yang lebih kecil.' },
        ],
        choices: [
          {
            icon: '\uD83D\uDEE1\uFE0F', label: 'Melindungi & Melaporkan', detail: 'Kamu melindungi teman dan melaporkan ke guru', good: true, pts: 10, level: 'good',
            norma: 'Norma kesusilaan & kesopanan', resultTitle: 'Perilaku Patuh Norma!', resultBody: 'Kamu menunjukkan keberanian melindungi yang lemah \u2014 patuh terhadap norma kesusilaan.',
            consequences: [{ icon: '\u2705', text: 'Teman terlindungi' }, { icon: '\uD83D\uDCDA', text: 'Belajar tentang keberanian' }],
          },
          {
            icon: '\uD83D\uDE10', label: 'Diam Saja', detail: 'Kamu memilih diam agar tidak ikut terseret', good: false, pts: 3, level: 'mid',
            norma: 'Tidak melanggar tapi tidak melindungi', resultTitle: 'Netral...', resultBody: 'Kamu tidak melanggar norma, tapi juga tidak membantu. Norma kesusilaan mendorong kita untuk melindungi yang lemah.',
            consequences: [{ icon: '\u26A0\uFE0F', text: 'Teman tetap diganggu' }],
          },
        ],
      },
    ] as unknown as Record<string, unknown>[],
  },
  'macam-norma-skenario': {
    id: 'macam-norma-skenario', label: 'Macam-Macam Norma – Skenario',
    skenario: [
      {
        title: 'Mengidentifikasi Norma di Masyarakat',
        bg: 'sbg-kampung',
        charEmoji: '\uD83E\uDDD1',
        charColor: '#3ecfcf',
        charPants: '#2563eb',
        choicePrompt: 'Norma apa yang berlaku?',
        setup: [
          { speaker: 'NARRATOR', text: 'Di suatu pagi, kamu melihat warga mengadakan kerja bakti membersihkan desa.' },
        ],
        choices: [
          {
            icon: '\uD83E\uDD1D', label: 'Norma Kesopanan', detail: 'Ikut kerja bakti adalah bentuk norma kesopanan dan gotong royong', good: true, pts: 10, level: 'good',
            norma: 'Norma kesopanan', resultTitle: 'Benar!', resultBody: 'Kerja bakti adalah wujud norma kesopanan yang memperkuat solidaritas warga.',
            consequences: [{ icon: '\u2705', text: 'Desa menjadi bersih' }, { icon: '\uD83E\uDD1D', text: 'Solidaritas terjaga' }],
          },
          {
            icon: '\u2696\uFE0F', label: 'Norma Hukum', detail: 'Menganggap kerja bakti adalah kewajiban hukum', good: false, pts: 5, level: 'mid',
            norma: 'Bukan norma hukum', resultTitle: 'Kurang Tepat', resultBody: 'Kerja bakti lebih tepat termasuk norma kesopanan, bukan norma hukum yang sanksinya dari negara.',
            consequences: [{ icon: '\uD83D\uDCA1', text: 'Perlu membedakan jenis norma' }],
          },
        ],
      },
    ] as unknown as Record<string, unknown>[],
  },
  blank: { id: 'blank', label: 'Kosong – Isi Manual', skenario: [] },
};

// ── Full Preset Mapping ──────────────────────────────────────────
export const FULL_PRESET_MAP: Record<string, FullPresetMapping> = {
  'hakikat-norma': { meta: 'hakikat-norma', cp: 'ppkn-smp-bab3', tp: 'bab3-full', atp: 'bab3-3pertemuan', alur: 'hakikat-norma-80menit', kuis: 'norma-10-soal', materi: 'hakikat-norma-materi', modules: 'hakikat-norma-modules', skenario: 'hakikat-norma-skenario' },
  'macam-norma': { meta: 'macam-norma', cp: 'ppkn-smp-bab3', tp: 'bab3-full', atp: 'bab3-3pertemuan', alur: 'hakikat-norma-80menit', kuis: 'norma-10-soal', materi: 'macam-norma-materi', modules: 'macam-norma-modules', skenario: 'macam-norma-skenario' },
  blank: { meta: 'blank', cp: 'blank', tp: 'blank', atp: 'blank', alur: 'blank', kuis: 'blank', materi: 'blank', modules: 'blank', skenario: 'blank' },
};
