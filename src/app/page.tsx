'use client';

import dynamic from 'next/dynamic';

const CanvaBuilder = dynamic(() => import('@/components/canva/CanvaBuilder'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🎨</div>
        <div className="text-zinc-400 text-sm">Memuat Canva Editor...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <CanvaBuilder />;
}
