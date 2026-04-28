'use client';

import { useAuthoringStore } from '@/store/authoring-store';

export default function ImportExport() {
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

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const store = useAuthoringStore.getState();
        useAuthoringStore.setState({
          meta: data.meta || store.meta,
          cp: data.cp || store.cp,
          tp: data.tp || [],
          atp: data.atp || store.atp,
          alur: data.alur || [],
          skenario: data.skenario || [],
          kuis: data.kuis || [],
          modules: data.modules || [],
          games: data.games || [],
          materi: data.materi || { blok: [] },
          dirty: true,
        });
        store.setActivePanel('dashboard');
      } catch {
        alert('Gagal membaca file JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <span>📥</span> Import / Export
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Import dan export data proyek dalam format JSON.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Export */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">📤 Export</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Download semua data proyek sebagai file JSON untuk backup atau transfer.
          </p>
          <button
            onClick={exportJSON}
            className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-colors"
          >
            📋 Export JSON
          </button>
        </div>

        {/* Import */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">📥 Import</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Upload file JSON yang sebelumnya di-export untuk mengembalikan data.
          </p>
          <label className="block w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm rounded-lg transition-colors text-center cursor-pointer">
            📂 Pilih File JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Download Template */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">📊 Download Template Excel</h3>
        <p className="text-xs text-zinc-400 mb-4">
          Template multi-sheet (META, CP, TP, ATP, ALUR, KUIS) untuk import batch.
        </p>
        <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors opacity-50 cursor-not-allowed">
          📥 Template Excel (segera hadir)
        </button>
      </div>
    </div>
  );
}
