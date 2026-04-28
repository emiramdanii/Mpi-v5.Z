'use client';

import { useCallback } from 'react';
import { useAuthoringStore } from '@/store/authoring-store';
import { generateExportHtml, generatePrintAdminHtml } from '@/lib/export-html';
import { toast } from 'sonner';

export default function ImportExport() {
  const exportJSON = useCallback(() => {
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
    toast.success('✅ JSON berhasil diekspor!');
  }, []);

  const exportStudentHtml = useCallback(() => {
    const s = useAuthoringStore.getState();
    try {
      const html = generateExportHtml({
        meta: s.meta, cp: s.cp, tp: s.tp, atp: s.atp, alur: s.alur,
        skenario: s.skenario, kuis: s.kuis, materi: s.materi,
        modules: s.modules, games: s.games,
      });
      const filename = (s.meta.judulPertemuan || 'media')
        .replace(/[^a-z0-9\-]/gi, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('✅ Media pembelajaran berhasil didownload!');
    } catch (err) {
      console.error('Export HTML failed:', err);
      toast.error('❌ Gagal mengexport HTML');
    }
  }, []);

  const cetakDokumenAdmin = useCallback(() => {
    const s = useAuthoringStore.getState();
    try {
      const html = generatePrintAdminHtml({
        meta: s.meta, cp: s.cp, tp: s.tp, atp: s.atp, alur: s.alur,
        skenario: s.skenario, kuis: s.kuis, materi: s.materi,
        modules: s.modules, games: s.games,
      });
      const win = window.open('', '_blank');
      if (!win) {
        toast.error('❌ Popup diblokir oleh browser');
        return;
      }
      win.document.write(html);
      win.document.close();
      win.print();
      toast.success('🖨️ Jendela cetak dibuka');
    } catch (err) {
      console.error('Print admin failed:', err);
      toast.error('❌ Gagal membuka jendela cetak');
    }
  }, []);

  const handleImportJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
        toast.success('✅ Data berhasil diimport!');
      } catch {
        toast.error('❌ Gagal membaca file JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <span>📥</span> Import / Export
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Export media pembelajaran untuk siswa, cetak dokumen admin, atau import data proyek.
        </p>
      </div>

      {/* ── Student Export ──────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-1 flex items-center gap-2">
          🎓 Export untuk Siswa
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Download file HTML standalone yang berisi media pembelajaran lengkap (cover, skenario, materi, kuis, hasil).
          Siswa bisa langsung membuka di browser tanpa koneksi internet.
        </p>
        <button
          onClick={exportStudentHtml}
          className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          📦 Export HTML untuk Siswa
        </button>
        <p className="text-[0.65rem] text-zinc-500 mt-2">
          File .html standalone — tidak perlu server, langsung buka di browser
        </p>
      </div>

      {/* ── Admin Print ─────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-1 flex items-center gap-2">
          🖨️ Cetak Dokumen Admin
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Buka jendela cetak dengan tabel CP, TP, ATP, dan Alur Pembelajaran untuk dokumentasi guru.
        </p>
        <button
          onClick={cetakDokumenAdmin}
          className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          🖨️ Cetak Dokumen Admin
        </button>
      </div>

      {/* ── JSON Import / Export ─────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Export JSON */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">📤 Export JSON</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Download semua data proyek sebagai file JSON untuk backup atau transfer antar perangkat.
          </p>
          <button
            onClick={exportJSON}
            className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm rounded-lg transition-colors"
          >
            📋 Export JSON
          </button>
        </div>

        {/* Import JSON */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">📥 Import JSON</h3>
          <p className="text-xs text-zinc-400 mb-4">
            Upload file JSON yang sebelumnya di-export untuk mengembalikan data proyek.
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

      {/* ── Info Section ─────────────────────────────────────── */}
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">💡 Tips</h4>
        <ul className="text-xs text-zinc-500 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">•</span>
            Gunakan <strong className="text-zinc-300">Export HTML untuk Siswa</strong> setelah semua konten selesai diedit. File akan berisi seluruh media pembelajaran dalam satu file.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">•</span>
            <strong className="text-zinc-300">Cetak Dokumen Admin</strong> berguna untuk bahan administrasi guru — berisi tabel CP, TP, ATP, dan Alur.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">•</span>
            <strong className="text-zinc-300">Export/Import JSON</strong> untuk backup data proyek atau pindah antar perangkat.
          </li>
        </ul>
      </div>
    </div>
  );
}
