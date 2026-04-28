'use client';

import { useCanvaStore } from '@/store/canva-store';

export default function Toolbar() {
  const {
    tool,
    setTool,
    zoom,
    zoomDelta,
    ratioId,
    clearStage,
    exportPageHTML,
    currentPageIndex,
    pages,
  } = useCanvaStore();

  const page = pages[currentPageIndex];
  const label = page?.label || 'Untitled';

  const handlePreview = () => {
    const html = exportPageHTML();
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  };

  const handleExport = () => {
    const html = exportPageHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canva-page-${currentPageIndex + 1}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSlideshow = () => {
    const allPages = pages.map((p, i) => exportPageHTML(i)).join('');
    const blob = new Blob([allPages], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canva-slideshow.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-700/50 text-xs">
      {/* Logo + Title */}
      <span className="text-sm">🎨</span>
      <span className="font-bold text-zinc-100 min-w-0 truncate max-w-[140px]">{label}</span>
      <div className="w-px h-5 bg-zinc-700 mx-1" />

      {/* Tool buttons */}
      <button
        onClick={() => setTool('select')}
        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
          tool === 'select'
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        ↖ Pilih
      </button>
      <button
        onClick={() => setTool('text')}
        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
          tool === 'text'
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        T Teks
      </button>
      <div className="w-px h-5 bg-zinc-700 mx-1" />

      {/* Action buttons */}
      <button onClick={handlePreview} title="Preview" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">👁</button>
      <button onClick={handleExport} title="Export HTML" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">📤</button>
      <button onClick={handleExportSlideshow} title="Export Slideshow" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">🎞</button>
      <button onClick={() => { if (confirm('Bersihkan semua elemen di halaman ini?')) clearStage(); }} title="Bersihkan" className="p-1.5 rounded hover:bg-zinc-800 text-red-400 hover:text-red-300 transition-colors">🗑</button>

      {/* Ratio badge */}
      <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold text-[10px] ml-1">{ratioId}</span>

      {/* Zoom controls */}
      <div className="flex items-center gap-1 ml-auto">
        <button onClick={() => zoomDelta(-0.1)} className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">−</button>
        <span className="text-zinc-400 text-[11px] font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => zoomDelta(0.1)} className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">+</button>
      </div>
    </div>
  );
}
