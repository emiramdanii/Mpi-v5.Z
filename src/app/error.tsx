'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-200 p-8">
      <div className="max-w-md text-center space-y-5">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-amber-400">Terjadi Kesalahan</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Aplikasi mengalami error yang tidak terduga. Data yang sudah disimpan di
          localStorage seharusnya masih aman.
        </p>
        <pre className="text-xs text-red-400 bg-zinc-900 p-3 rounded-lg text-left overflow-auto max-h-32 border border-zinc-800">
          {error?.message || 'Unknown error'}
        </pre>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-lg transition-colors"
          >
            🔄 Coba Lagi
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    </div>
  );
}
