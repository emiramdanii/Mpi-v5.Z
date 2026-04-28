'use client';

export default function AutoGenerate() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <span>⚡</span> Auto-Generate
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Paste teks materi sekali → generate bertahap per section.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-2">Fitur ini akan segera tersedia</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Auto-Generate akan membantu Anda membuat dokumen, konten, kuis, dan game secara otomatis dari teks materi yang dipaste.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">📝 Materi</span>
          <span className="text-zinc-600">→</span>
          <span className="inline-flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">📋 Dokumen</span>
          <span className="text-zinc-600">→</span>
          <span className="inline-flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">❓ Kuis</span>
          <span className="text-zinc-600">→</span>
          <span className="inline-flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded">🎮 Game</span>
        </div>
      </div>
    </div>
  );
}
