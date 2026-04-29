'use client';

import { useCanvaStore } from '@/store/canva-store';
import type { LeftTab } from './types';

const RAIL_ITEMS: { id: LeftTab; icon: string; title: string; divider?: boolean }[] = [
  { id: 'templates', icon: '🧩', title: 'Template' },
  { id: 'pages', icon: '📄', title: 'Halaman', divider: true },
  { id: 'elems', icon: '📦', title: 'Elemen' },
  { id: 'ratio', icon: '📐', title: 'Rasio' },
  { id: 'layers', icon: '🔲', title: 'Layer', divider: true },
];

export default function IconRail() {
  const { leftTab, setLeftTab } = useCanvaStore();

  return (
    <div className="flex flex-col items-center gap-1 py-2 px-1 bg-zinc-900/60 border-r border-zinc-700/50">
      {RAIL_ITEMS.map((item, i) => (
        <div key={item.id}>
          {item.divider && <div className="w-8 h-px bg-zinc-700/50 mb-1" />}
          <button
            onClick={() => setLeftTab(item.id)}
            title={item.title}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all ${
              leftTab === item.id
                ? 'bg-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/10'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
            }`}
          >
            {item.icon}
          </button>
        </div>
      ))}
    </div>
  );
}
