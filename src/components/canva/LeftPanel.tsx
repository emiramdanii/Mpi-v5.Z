'use client';

import { useCanvaStore } from '@/store/canva-store';
import type { LeftTab } from './types';

const TABS: { id: LeftTab; label: string }[] = [
  { id: 'pages', label: 'Halaman' },
  { id: 'elems', label: 'Elemen' },
  { id: 'ratio', label: 'Rasio' },
  { id: 'layers', label: 'Layer' },
];

export default function LeftPanel() {
  const { leftTab, setLeftTab } = useCanvaStore();

  return (
    <div className="w-52 min-w-[200px] flex flex-col bg-zinc-900/60 border-r border-zinc-700/50 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-700/50">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setLeftTab(tab.id)}
            className={`flex-1 px-1 py-1.5 text-[10px] font-semibold transition-colors ${
              leftTab === tab.id
                ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {leftTab === 'pages' && <PagesContent />}
        {leftTab === 'elems' && <ElementsContent />}
        {leftTab === 'ratio' && <RatioContent />}
        {leftTab === 'layers' && <LayersContent />}
      </div>
    </div>
  );
}

/* ── Pages Tab ──────────────────────────────────────────────── */

function PagesContent() {
  const { pages, currentPageIndex, goPage, addPage, duplicatePage, deletePage, ratioId } = useCanvaStore();
  const ratio = useCanvaStore(s => s.currentRatio());

  return (
    <div>
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Halaman</div>
      <div className="grid grid-cols-2 gap-1.5">
        {pages.map((p, i) => {
          const isActive = i === currentPageIndex;
          const bgStyle = p.bgDataUrl
            ? { backgroundImage: `url('${p.bgDataUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: p.bgColor || '#1a1a2e' };
          return (
            <button
              key={p.id}
              onClick={() => goPage(i)}
              className={`relative rounded-lg overflow-hidden transition-all ${
                isActive
                  ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-zinc-900'
                  : 'hover:ring-1 hover:ring-zinc-600'
              }`}
              style={{ ...bgStyle, aspectRatio: `${ratio.w}/${ratio.h}` }}
            >
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-1">
                <div className="text-[9px] font-bold text-white truncate">{p.label}</div>
                <div className="text-[8px] text-white/50">{p.elements.length}el</div>
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={addPage}
        className="w-full mt-2 py-1.5 rounded-lg border border-dashed border-zinc-700 text-[11px] text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
      >
        + Tambah Halaman
      </button>
      <div className="flex gap-1 mt-1.5">
        <button
          onClick={duplicatePage}
          className="flex-1 py-1 rounded text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          ⧉ Duplikat
        </button>
        <button
          onClick={() => {
            if (pages.length <= 1) return;
            if (confirm(`Hapus "${pages[currentPageIndex].label}"?`)) deletePage();
          }}
          className="flex-1 py-1 rounded text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          🗑 Hapus
        </button>
      </div>
    </div>
  );
}

/* ── Elements Tab ───────────────────────────────────────────── */

function ElementsContent() {
  const { addElement } = useCanvaStore();

  const handleDragStart = (e: React.DragEvent, typeId: string) => {
    e.dataTransfer.setData('elemType', typeId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div>
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Elemen Dasar</div>
      <div className="text-[9px] text-zinc-600 mb-2">Klik untuk tambah, atau seret ke canvas</div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { id: 'kuis', icon: '❓', name: 'Kuis', note: 'Soal pilihan ganda' },
          { id: 'game', icon: '🎮', name: 'Game', note: 'Game interaktif' },
          { id: 'materi', icon: '📝', name: 'Materi', note: 'Konten materi' },
          { id: 'modul', icon: '🧩', name: 'Modul', note: 'Modul aktivitas' },
          { id: 'teks', icon: '🔤', name: 'Teks', note: 'Teks bebas' },
          { id: 'shape', icon: '⬜', name: 'Shape', note: 'Kotak/warna' },
        ].map(t => (
          <button
            key={t.id}
            draggable
            onClick={() => addElement(t.id)}
            onDragStart={e => handleDragStart(e, t.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/30 hover:border-amber-500/20 transition-all group cursor-grab active:cursor-grabbing"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{t.icon}</span>
            <span className="text-[10px] font-bold text-zinc-300">{t.name}</span>
            <span className="text-[8px] text-zinc-500">{t.note}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Ratio Tab ──────────────────────────────────────────────── */

function RatioContent() {
  const { ratioId, setRatio } = useCanvaStore();

  return (
    <div>
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Rasio Halaman</div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { id: '16:9', name: '16:9', desc: 'Landscape PPT', w: 1280, h: 720 },
          { id: '9:16', name: '9:16', desc: 'Portrait HP', w: 720, h: 1280 },
          { id: '1:1', name: '1:1', desc: 'Square Post', w: 800, h: 800 },
          { id: 'A4', name: 'A4', desc: 'Dokumen LKS', w: 794, h: 1123 },
          { id: '4:3', name: '4:3', desc: 'Presentasi Lama', w: 1024, h: 768 },
        ].map(r => {
          const isActive = ratioId === r.id;
          const aspect = r.w / r.h;
          const tw = aspect >= 1 ? 56 : Math.round(56 * aspect);
          const th = aspect <= 1 ? 36 : Math.round(36 / aspect);
          return (
            <button
              key={r.id}
              onClick={() => setRatio(r.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-zinc-800/40 border-zinc-700/30 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <div
                className="rounded-sm border border-current/30"
                style={{ width: tw, height: th }}
              />
              <div className="text-[10px] font-bold">{r.name}</div>
              <div className="text-[8px] opacity-60">{r.desc}</div>
              <div className="text-[8px] opacity-40">{r.w}×{r.h}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Layers Tab ─────────────────────────────────────────────── */

function LayersContent() {
  const { pages, currentPageIndex, selectedElId, selectElement, toggleElementVisibility } = useCanvaStore();
  const page = pages[currentPageIndex];

  if (!page) return null;

  const elements = [...page.elements].reverse();

  return (
    <div>
      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
        Layer (atas = depan)
      </div>
      <div className="space-y-0.5">
        {elements.length === 0 && (
          <div className="text-[10px] text-zinc-600 text-center py-4">Belum ada elemen</div>
        )}
        {elements.map(el => {
          const colors: Record<string, string> = {
            kuis: '#f5c842', game: '#3ecfcf', materi: '#a78bfa',
            modul: '#34d399', teks: '#fff', shape: '#6366f1',
          };
          const isActive = el.id === selectedElId;
          return (
            <div
              key={el.id}
              onClick={() => selectElement(el.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                isActive ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: colors[el.type] || '#888' }}
              />
              <span className="text-[10px] font-medium flex-1 truncate">
                {el.icon} {el.label || el.type}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleElementVisibility(el.id); }}
                className={`text-[10px] ${el.hidden ? 'text-zinc-600' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                👁
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
