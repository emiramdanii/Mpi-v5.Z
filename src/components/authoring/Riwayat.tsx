'use client';

export default function Riwayat() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <span>🕐</span> Riwayat Versi
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Pantau perubahan dan kembalikan ke versi sebelumnya.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">🕐</div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">Riwayat Versi</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Fitur version control untuk proyek Anda akan segera tersedia. Anda bisa menyimpan snapshot dan kembali ke versi sebelumnya.
        </p>
      </div>
    </div>
  );
}
