'use client';

import { useAuthoringStore } from '@/store/authoring-store';

export default function Dashboard() {
  const meta = useAuthoringStore((s) => s.meta);
  const tp = useAuthoringStore((s) => s.tp);
  const atp = useAuthoringStore((s) => s.atp);
  const alur = useAuthoringStore((s) => s.alur);
  const kuis = useAuthoringStore((s) => s.kuis);
  const modules = useAuthoringStore((s) => s.modules);
  const games = useAuthoringStore((s) => s.games);
  const materi = useAuthoringStore((s) => s.materi);
  const calcCompleteness = useAuthoringStore((s) => s.calcCompleteness);
  const applyFullPreset = useAuthoringStore((s) => s.applyFullPreset);
  const setActivePanel = useAuthoringStore((s) => s.setActivePanel);
  const newProject = useAuthoringStore((s) => s.newProject);
  const saveToStorage = useAuthoringStore((s) => s.saveToStorage);

  const completeness = calcCompleteness();

  const stats = [
    { label: 'TP', val: tp.length, icon: '🎯', color: 'text-amber-400' },
    { label: 'ATP Pertemuan', val: atp.pertemuan.length, icon: '📅', color: 'text-cyan-400' },
    { label: 'Alur Langkah', val: alur.length, icon: '📋', color: 'text-purple-400' },
    { label: 'Soal Kuis', val: kuis.length, icon: '❓', color: 'text-emerald-400' },
    { label: 'Modul', val: modules.length, icon: '🧩', color: 'text-purple-400' },
    { label: 'Game', val: games.length, icon: '🎮', color: 'text-orange-400' },
    { label: 'Materi Blok', val: materi.blok.length, icon: '📝', color: 'text-sky-400' },
  ];

  const checks = [
    { label: 'Identitas media diisi', done: !!(meta.judulPertemuan && meta.kelas) },
    { label: 'Capaian Pembelajaran', done: !!useAuthoringStore.getState().cp.capaianFase },
    { label: 'Tujuan Pembelajaran (min 1)', done: tp.length > 0 },
    { label: 'ATP / Pertemuan (min 1)', done: atp.pertemuan.length > 0 },
    { label: 'Alur Pembelajaran (min 3)', done: alur.length >= 3 },
    { label: 'Kuis (min 5 soal)', done: kuis.length >= 5 },
    { label: 'Modul konten (min 1)', done: modules.length > 0 },
  ];

  const exportJSON = () => {
    const s = useAuthoringStore.getState();
    const data = {
      meta: s.meta, cp: s.cp, tp: s.tp, atp: s.atp, alur: s.alur,
      skenario: s.skenario, kuis: s.kuis, modules: s.modules,
      games: s.games, materi: s.materi,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `authoring-tool-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Panel Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Dashboard</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Kelola proyek, pantau kelengkapan, dan export media pembelajaran interaktif.
        </p>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-xl p-5 relative">
        <button
          onClick={(e) => { const el = e.currentTarget.closest('.relative'); if (el) el.style.display = 'none'; }}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 text-sm w-6 h-6 flex items-center justify-center rounded"
        >
          ✕
        </button>
        <div className="flex items-start gap-4">
          <div className="text-3xl">👋</div>
          <div className="flex-1">
            <h3 className="font-bold text-zinc-100 text-base">Selamat Datang di Authoring Tool v3!</h3>
            <p className="text-xs text-zinc-400 mt-1">Buat media pembelajaran interaktif dengan mudah. Ikuti langkah-langkah berikut:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              {[
                { num: '1', text: 'Lengkapi Identitas' },
                { num: '2', text: 'Isi CP / TP / ATP' },
                { num: '3', text: 'Tambah Konten & Game' },
                { num: '4', text: 'Preview & Export' },
              ].map((step) => (
                <div key={step.num} className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {step.num}
                  </div>
                  <span className="text-xs text-zinc-300">{step.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-xl p-5">
        <h3 className="text-sm font-bold text-amber-400 mb-3">💡 Tips Cepat</h3>
        <div className="space-y-2">
          {[
            { icon: '⚡', text: '<strong>Live Preview Otomatis</strong> — Panel preview otomatis terbuka saat layar cukup lebar.' },
            { icon: '🔄', text: '<strong>Auto-Sync Navigasi</strong> — Saat pindah tab, preview otomatis menampilkan slide yang sesuai.' },
            { icon: '⌨️', text: '<strong>Ctrl+Z</strong> untuk Undo, <strong>Ctrl+Y</strong> untuk Redo.' },
            { icon: '📐', text: '<strong>Presets</strong> — Gunakan preset cepat di bawah untuk mengisi semua tab sekaligus.' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
              <span className="flex-shrink-0">{tip.icon}</span>
              <span dangerouslySetInnerHTML={{ __html: tip.text }} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: '✨', label: 'Proyek Baru', sub: 'Mulai dari nol', action: () => newProject() },
          { icon: '📥', label: 'Import JSON', sub: 'Upload data proyek', action: () => setActivePanel('import') },
          { icon: '⚡', label: 'Auto-Generate', sub: 'Paste teks, auto-fill', action: () => setActivePanel('autogen') },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center hover:border-zinc-700 hover:bg-zinc-900/80 transition-colors cursor-pointer"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-sm font-semibold text-zinc-200">{item.label}</div>
            <div className="text-xs text-zinc-500">{item.sub}</div>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-zinc-200 mb-3">📊 Kelengkapan Proyek</h3>
        <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completeness}%`,
              background: completeness === 100 ? '#34d399' : completeness >= 60 ? '#f9c82e' : '#ff6b6b',
            }}
          />
        </div>
        <div className="text-right text-xs text-zinc-500 mt-1.5">{completeness}% lengkap</div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center">
              <div className="text-xl mb-0.5">{s.icon}</div>
              <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
              <div className="text-[0.65rem] text-zinc-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-zinc-200 mb-3">✅ Checklist Kelengkapan</h3>
        <div className="space-y-0">
          {checks.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 py-2 border-b border-zinc-800/60 last:border-b-0 text-xs"
            >
              <span className={c.done ? 'text-emerald-400' : 'text-zinc-600'}>{c.done ? '✅' : '○'}</span>
              <span className={c.done ? 'text-zinc-200' : 'text-zinc-500'}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-zinc-200 mb-1">⚡ Preset Cepat</h3>
        <p className="text-xs text-zinc-400 mb-3">Klik preset untuk mengisi <em>semua</em> tab sekaligus dengan data contoh.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'hakikat-norma', icon: '🧑\u200D🤝\u200D🧑', label: 'Bab 3 – P1: Hakikat Norma', sub: 'PPKn Kelas VII' },
            { key: 'macam-norma', icon: '📜', label: 'Bab 3 – P2: Macam Norma', sub: 'PPKn Kelas VII' },
            { key: 'blank', icon: '📋', label: 'Proyek Kosong', sub: 'Isi semua manual' },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => applyFullPreset(p.key)}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center hover:border-zinc-600 transition-colors cursor-pointer"
            >
              <div className="text-xl mb-1">{p.icon}</div>
              <div className="text-xs font-semibold text-zinc-200">{p.label}</div>
              <div className="text-[0.65rem] text-zinc-500">{p.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-zinc-200 mb-3">📤 Export</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActivePanel('canva')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-colors"
          >
            🎨 Buka Canva Editor
          </button>
          <button
            onClick={exportJSON}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
          >
            📋 Export JSON
          </button>
          <button
            onClick={saveToStorage}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
          >
            🖨️ Simpan ke Browser
          </button>
        </div>
      </div>
    </div>
  );
}
