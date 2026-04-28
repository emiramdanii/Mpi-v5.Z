'use client';

import { useRef } from 'react';
import { useCanvaStore } from '@/store/canva-store';

export default function RightPanel() {
  const {
    pages,
    currentPageIndex,
    selectedElId,
    setBgColor,
    setBgImage,
    setOverlay,
    updateElement,
    deleteSelected,
  } = useCanvaStore();

  const page = pages[currentPageIndex];
  const selectedEl = page?.elements.find(e => e.id === selectedElId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) setBgImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-44 min-w-[170px] flex flex-col bg-zinc-900/60 border-l border-zinc-700/50 overflow-y-auto custom-scrollbar">
      {/* Background section */}
      <div className="p-2 border-b border-zinc-700/30">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">🖼️ Background</div>

        {/* Upload area */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-lg border border-dashed border-zinc-700 hover:border-amber-500/30 bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors flex flex-col items-center gap-1"
        >
          <span className="text-lg">📤</span>
          <span className="text-[10px] font-bold text-zinc-400">Upload PNG Canva</span>
          <span className="text-[8px] text-zinc-500">PNG · JPG · WEBP</span>
        </button>

        {/* Preview thumbnail */}
        {page?.bgDataUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700/30">
            <img src={page.bgDataUrl} alt="BG Preview" className="w-full h-16 object-cover" />
          </div>
        )}

        {/* Overlay slider */}
        <div className="mt-3">
          <label className="text-[10px] text-zinc-500 block mb-1">Overlay gelap</label>
          <input
            type="range"
            min={0}
            max={60}
            value={page?.overlay || 20}
            onChange={e => setOverlay(parseInt(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* BG Color */}
        <div className="mt-3">
          <label className="text-[10px] text-zinc-500 block mb-1">Warna BG</label>
          <input
            type="color"
            value={page?.bgColor || '#1a1a2e'}
            onChange={e => setBgColor(e.target.value)}
            className="w-full h-7 rounded-md border border-zinc-700 cursor-pointer bg-zinc-800"
          />
        </div>
      </div>

      {/* Element properties */}
      {selectedEl && (
        <div className="p-2 border-b border-zinc-700/30">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">⚙️ Properti Elemen</div>
          <PropInput label="X" value={Math.round(selectedEl.x)} onChange={v => updateElement(selectedEl.id, { x: v })} />
          <PropInput label="Y" value={Math.round(selectedEl.y)} onChange={v => updateElement(selectedEl.id, { y: v })} />
          <PropInput label="Lebar" value={Math.round(selectedEl.w)} onChange={v => updateElement(selectedEl.id, { w: v })} />
          <PropInput label="Tinggi" value={Math.round(selectedEl.h)} onChange={v => updateElement(selectedEl.id, { h: v })} />
          <PropInput label="Opacity" value={selectedEl.opacity || 100} min={0} max={100} onChange={v => updateElement(selectedEl.id, { opacity: v })} />
          <button
            onClick={deleteSelected}
            className="w-full mt-2 py-1.5 rounded-md text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            🗑 Hapus Elemen
          </button>
        </div>
      )}

      {/* Layers (mini) */}
      <div className="p-2 flex-1">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">🔲 Layer</div>
        <LayerMiniList />
      </div>
    </div>
  );
}

function PropInput({ label, value, min, max, onChange }: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-[10px] text-zinc-500 w-10">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 h-6 px-1.5 text-[10px] text-zinc-200 bg-zinc-800 border border-zinc-700/50 rounded focus:border-amber-500/50 focus:outline-none"
      />
    </div>
  );
}

function LayerMiniList() {
  const { pages, currentPageIndex, selectedElId, selectElement, toggleElementVisibility } = useCanvaStore();
  const page = pages[currentPageIndex];
  if (!page) return null;

  const elements = [...page.elements].reverse();

  return (
    <div className="space-y-0.5">
      {elements.length === 0 && (
        <div className="text-[9px] text-zinc-600 text-center py-2">Kosong</div>
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
            className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer transition-colors ${
              isActive ? 'bg-amber-500/15 text-amber-300' : 'text-zinc-500 hover:bg-zinc-800/40'
            }`}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[el.type] || '#888' }} />
            <span className="text-[9px] flex-1 truncate">{el.icon} {el.label || el.type}</span>
            <button
              onClick={e => { e.stopPropagation(); toggleElementVisibility(el.id); }}
              className="text-[9px] opacity-60 hover:opacity-100"
            >
              👁
            </button>
          </div>
        );
      })}
    </div>
  );
}
