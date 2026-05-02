'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import type { CanvaElement, CanvaPage, ResizeDir } from './types';
import QuizWidget from './QuizWidget';
import GameWidget from './GameWidget';
import PageTemplate from './PageTemplate';

// ── Animation styles for canvas templates ────────────────────
const CANVAS_ANIM_CSS = `
@keyframes ptFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes ptPulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes ptShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes ptFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes ptGlow{0%,100%{box-shadow:0 0 8px rgba(251,191,36,.2)}50%{box-shadow:0 0 20px rgba(251,191,36,.5)}}
.pt-float{animation:ptFloat 3s ease-in-out infinite}
.pt-pulse{animation:ptPulse 2s ease-in-out infinite}
.pt-fadein{animation:ptFadeIn .5s ease both}
.pt-glow{animation:ptGlow 2s ease-in-out infinite}
.pt-card{border-radius:12px;padding:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);transition:all .2s}
.pt-chip{display:inline-flex;align-items:center;gap:3px;padding:3px 10px;border-radius:99px;font-size:7px;font-weight:800}
.pt-tab{padding:5px 12px;font-size:8px;font-weight:800;cursor:pointer;color:rgba(255,255,255,.4);border-bottom:2px solid transparent;transition:all .2s}
.pt-tab.active{color:#fbbf24;border-bottom-color:#fbbf24}
.pt-badge{padding:2px 8px;border-radius:99px;font-size:7px;font-weight:900;display:inline-flex;align-items:center;gap:2px}
.pt-btn{display:inline-flex;align-items:center;gap:4px;padding:6px 16px;border-radius:99px;font-size:9px;font-weight:800;border:none;cursor:pointer;transition:all .15s}
.pt-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.3)}
`;

export default function Stage({ onMouseMove }: { onMouseMove: (x: number, y: number) => void }) {
  const {
    pages,
    currentPageIndex,
    ratioId,
    zoom,
    tool,
    selectedElId,
    selectElement,
    addElement,
    updateElement,
    updateTemplateData,
  } = useCanvaStore();

  const page = pages[currentPageIndex];
  const ratio = useCanvaStore(s => s.currentRatio());

  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [baseScale, setBaseScale] = useState(0.5);
  const [stageW, setStageW] = useState(ratio.w);
  const [stageH, setStageH] = useState(ratio.h);

  // Drag & resize state
  const dragState = useRef<{
    type: 'move' | 'resize';
    elId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW?: number;
    origH?: number;
    dir?: ResizeDir;
  } | null>(null);

  // Track mouse position
  const handleAreaMouseMove = useCallback((e: React.MouseEvent) => {
    if (!stageWrapRef.current) return;
    const rect = stageWrapRef.current.getBoundingClientRect();
    const scale = baseScale * zoom;
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);
    if (x >= 0 && y >= 0 && x <= stageW && y <= stageH) {
      onMouseMove(x, y);
    }

    if (!dragState.current || !canvasAreaRef.current) return;

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const dxPct = dx / scale / stageW * 100;
    const dyPct = dy / scale / stageH * 100;

    if (dragState.current.type === 'move') {
      const newX = Math.max(0, Math.min(90, dragState.current.origX + dxPct));
      const newY = Math.max(0, Math.min(90, dragState.current.origY + dyPct));
      updateElement(dragState.current.elId, { x: newX, y: newY });
    } else if (dragState.current.type === 'resize') {
      const dir = dragState.current.dir!;
      const orig = {
        x: dragState.current.origX,
        y: dragState.current.origY,
        w: dragState.current.origW!,
        h: dragState.current.origH!,
      };

      let newX = orig.x, newY = orig.y, newW = orig.w, newH = orig.h;

      if (dir.includes('r')) newW = Math.max(10, orig.w + dxPct);
      if (dir.includes('b')) newH = Math.max(8, orig.h + dyPct);
      if (dir.includes('l')) {
        newX = Math.min(orig.x + orig.w - 10, orig.x + dxPct);
        newW = Math.max(10, orig.w - dxPct);
      }
      if (dir.includes('t')) {
        newY = Math.min(orig.y + orig.h - 8, orig.y + dyPct);
        newH = Math.max(8, orig.h - dyPct);
      }

      updateElement(dragState.current.elId, { x: newX, y: newY, w: newW, h: newH });
    }
  }, [baseScale, zoom, stageW, stageH, updateElement, onMouseMove]);

  const handleMouseUp = useCallback(() => {
    dragState.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // ResizeObserver for responsive scaling
  useEffect(() => {
    const area = canvasAreaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(() => {
      const aW = (area.clientWidth || 800) - 24;
      const aH = (area.clientHeight || 500) - 24;
      const scaleW = aW / ratio.w;
      const scaleH = aH / ratio.h;
      setBaseScale(Math.min(scaleW, scaleH));
      setStageW(ratio.w);
      setStageH(ratio.h);
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [ratio]);

  // Handle drop from element panel
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const elType = e.dataTransfer.getData('elemType');
    if (!elType) return;
    const rect = stageWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = baseScale * zoom;
    const x = Math.max(2, Math.min(80, (e.clientX - rect.left) / scale / stageW * 100));
    const y = Math.max(2, Math.min(85, (e.clientY - rect.top) / scale / stageH * 100));
    addElement(elType, parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1)));
  }, [baseScale, zoom, stageW, stageH, addElement]);

  // Handle click on stage background
  const handleStageBgClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.id !== 'cm-stage-wrap' && target.id !== 'cm-stage-bg' && target.id !== 'cm-canvas-area' && target.id !== 'cm-stage-bg-overlay') return;

    if (tool === 'text') {
      const rect = stageWrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const scale = baseScale * zoom;
      const x = Math.max(2, Math.min(80, (e.clientX - rect.left) / scale / stageW * 100));
      const y = Math.max(2, Math.min(85, (e.clientY - rect.top) / scale / stageH * 100));
      addElement('teks', parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1)));
      useCanvaStore.getState().setTool('select');
      return;
    }

    selectElement(null);
  };

  // Handle template field edit
  const handleTemplateEdit = useCallback((key: string, value: string) => {
    updateTemplateData(key, value);
  }, [updateTemplateData]);

  const scale = baseScale * zoom;
  const isTemplateMode = page && page.templateType && page.templateType !== 'custom';

  if (!page) return null;

  return (
    <div
      ref={canvasAreaRef}
      role="application"
      aria-label="Kanvas editor"
      className="flex-1 bg-zinc-950 overflow-auto flex items-center justify-center"
      style={{ cursor: tool === 'text' ? 'text' : 'default' }}
      onMouseMove={handleAreaMouseMove}
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={handleDrop}
    >
      {/* Inject template animation CSS */}
      <style dangerouslySetInnerHTML={{ __html: CANVAS_ANIM_CSS }} />
      {/* Checkerboard pattern behind stage */}
      <div className="relative">
        <div
          ref={stageWrapRef}
          id="cm-stage-wrap"
          className="relative overflow-hidden shadow-2xl shadow-black/50"
          style={{
            width: stageW,
            height: stageH,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
          onMouseDown={handleStageBgClick}
        >
          {/* Background color */}
          <div
            id="cm-stage-bg"
            className="absolute inset-0"
            style={{ background: page.bgColor || '#1a1a2e' }}
          />

          {/* Background image */}
          {page.bgDataUrl && (
            <img
              src={page.bgDataUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Overlay */}
          <div
            id="cm-stage-bg-overlay"
            className="absolute inset-0 pointer-events-none"
            style={{ background: `rgba(14,28,47,${(page.overlay || 20) / 100})` }}
          />

          {/* Template Mode: Render full-page template */}
          {isTemplateMode && (
            <PageTemplate
              page={page}
              isSelected={true}
              onEditField={handleTemplateEdit}
            />
          )}

          {/* Custom Mode: Render individual elements */}
          {!isTemplateMode && (
            <div className="absolute inset-0">
              {page.elements.map(el => (
                <StageElement
                  key={el.id}
                  element={el}
                  isSelected={el.id === selectedElId}
                  onSelect={() => selectElement(el.id)}
                  onStartDrag={(startX, startY) => {
                    dragState.current = {
                      type: 'move',
                      elId: el.id,
                      startX,
                      startY,
                      origX: el.x,
                      origY: el.y,
                    };
                  }}
                  onStartResize={(dir, startX, startY) => {
                    dragState.current = {
                      type: 'resize',
                      elId: el.id,
                      startX,
                      startY,
                      origX: el.x,
                      origY: el.y,
                      origW: el.w,
                      origH: el.h,
                      dir,
                    };
                  }}
                />
              ))}
            </div>
          )}

          {/* Drop hint (visible when no elements and custom mode) */}
          {!isTemplateMode && page.elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" aria-hidden="true">
              <div className="text-zinc-600 text-sm mb-2">⬇ Seret elemen ke sini</div>
              <div className="text-zinc-700 text-xs">atau pilih Template dari panel kiri</div>
            </div>
          )}

          {/* Navbar preview (if enabled in NavConfig) */}
          {page.navConfig?.showNavbar && (
            <CanvaNavbarPreview page={page} pageIndex={currentPageIndex} totalPages={pages.length} />
          )}

          {/* Prev/Next buttons (if enabled in NavConfig) — clickable, style follows navButtonStyle */}
          {page.navConfig?.showPrevNext && (
            <NavButtonPair
              navButtonStyle={page.navConfig?.navButtonStyle || 'pill'}
              navbarPosition={page.navConfig?.navbarPosition || 'top'}
              currentPageIndex={currentPageIndex}
              totalPages={pages.length}
            />
          )}

          {/* Template mode badge */}
          {isTemplateMode && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 pointer-events-none z-30">
              Template: {page.templateType}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Stage Element (Custom Mode) ────────────────────────────── */

function StageElement({
  element,
  isSelected,
  onSelect,
  onStartDrag,
  onStartResize,
}: {
  element: CanvaElement;
  isSelected: boolean;
  onSelect: () => void;
  onStartDrag: (startX: number, startY: number) => void;
  onStartResize: (dir: ResizeDir, startX: number, startY: number) => void;
}) {
  const { updateElement, deleteElement, saveTextContent } = useCanvaStore();
  const textRef = useRef<HTMLDivElement>(null);
  const isInteractive = element.type === 'kuis' || element.type === 'game';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    if (!isInteractive || !isSelected) {
      onStartDrag(e.clientX, e.clientY);
    }
  };

  const handleBarMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isSelected) onSelect();
    onStartDrag(e.clientX, e.clientY);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, dir: ResizeDir) => {
    e.stopPropagation();
    e.preventDefault();
    onStartResize(dir, e.clientX, e.clientY);
  };

  const handleTextBlur = () => {
    if (textRef.current) {
      saveTextContent(element.id, textRef.current.textContent || '');
    }
  };

  // 8-direction resize handles
  const resizeHandles: { dir: ResizeDir; style: React.CSSProperties; cursor: string }[] = [
    { dir: 'tl', style: { top: -5, left: -5 }, cursor: 'nwse-resize' },
    { dir: 'tr', style: { top: -5, right: -5 }, cursor: 'nesw-resize' },
    { dir: 'bl', style: { bottom: -5, left: -5 }, cursor: 'nesw-resize' },
    { dir: 'br', style: { bottom: -5, right: -5 }, cursor: 'nwse-resize' },
    { dir: 'tm', style: { top: -5, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { dir: 'bm', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize' },
    { dir: 'l', style: { top: '50%', left: -5, transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
    { dir: 'r', style: { top: '50%', right: -5, transform: 'translateY(-50%)' }, cursor: 'ew-resize' },
  ];

  const ariaLabelMap: Record<string, string> = {
    kuis: 'Kuis interaktif - klik untuk memperbesar',
    game: 'Game interaktif - klik untuk memperbesar',
    teks: `Elemen teks: ${element.text || 'Ketik teks…'}`,
    shape: 'Elemen bentuk',
    materi: 'Materi pembelajaran',
    modul: 'Modul interaktif',
  };

  return (
    <div
      role="button"
      aria-label={ariaLabelMap[element.type] || `Elemen ${element.type}`}
      tabIndex={0}
      className={`absolute group ${isSelected ? 'ring-2 ring-amber-400 ring-offset-0 z-10' : 'z-0'} ${element.hidden ? 'hidden' : ''}`}
      style={{
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.w}%`,
        height: `${element.h}%`,
        opacity: (element.opacity ?? 100) / 100,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Handle bar — always draggable */}
      <div
        className={`absolute left-0 right-0 flex items-center justify-between px-1 rounded-t text-[9px] font-bold z-20 transition-all ${
          isSelected
            ? '-top-5 bg-amber-500/90 text-amber-950'
            : '-top-4 bg-black/60 text-white/80 opacity-0 group-hover:opacity-100'
        }`}
        onMouseDown={handleBarMouseDown}
      >
        <span className="truncate cursor-grab">{element.icon} {element.label || element.type}</span>
        {isSelected && (
          <button
            onClick={e => { e.stopPropagation(); deleteElement(element.id); }}
            aria-label={`Hapus elemen ${element.label || element.type}`}
            className="ml-1 hover:text-red-700 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Body */}
      <div className="w-full h-full overflow-hidden rounded-sm">
        {element.type === 'kuis' && (
          <QuizWidget dataIdx={element.dataIdx} compact />
        )}
        {element.type === 'game' && (
          <GameWidget dataIdx={element.dataIdx} compact />
        )}
        {element.type === 'materi' && (
          <div className="p-2 h-full bg-purple-500/10 rounded border border-purple-500/20">
            <span className="text-2xl">📝</span>
            <div className="text-[9px] text-purple-300/60 mt-1">Materi Pembelajaran</div>
          </div>
        )}
        {element.type === 'modul' && (
          <div className="flex flex-col items-center justify-center h-full bg-emerald-500/10 rounded border border-emerald-500/20 p-2">
            <span className="text-2xl">🧩</span>
            <span className="text-[10px] font-bold text-emerald-300 mt-1">Modul</span>
          </div>
        )}
        {element.type === 'teks' && (
          <div
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTextBlur}
            className="w-full h-full outline-none text-shadow-lg"
            style={{
              fontSize: `${element.fontSize || 20}px`,
              fontWeight: 700,
              color: element.textColor || '#ffffff',
              textShadow: '0 2px 8px rgba(0,0,0,.5)',
              lineHeight: 1.4,
              padding: 8,
            }}
          >
            {element.text || 'Ketik teks…'}
          </div>
        )}
        {element.type === 'shape' && (
          <div
            className="w-full h-full rounded-lg"
            style={{
              background: element.color || 'rgba(255,255,255,.15)',
              borderRadius: element.radius || 8,
            }}
          />
        )}
      </div>

      {/* Resize handles (8-direction) */}
      {isSelected && (
        <>
          {resizeHandles.map(h => (
            <div
              key={h.dir}
              role="separator"
              aria-label={`Ubah ukuran ${h.dir}`}
              onMouseDown={e => handleResizeMouseDown(e, h.dir)}
              className={`absolute w-2.5 h-2.5 bg-amber-400 border border-amber-600 rounded-sm z-30 cursor-${h.cursor}`}
              style={h.style}
            />
          ))}
        </>
      )}
    </div>
  );
}

/* ── Canva Navbar Preview ───────────────────────────────────── */

function CanvaNavbarPreview({ page, pageIndex, totalPages }: {
  page: CanvaPage;
  pageIndex: number;
  totalPages: number;
}) {
  const style = page.navConfig?.navbarStyle || 'colorful';
  const position = page.navConfig?.navbarPosition || 'top';
  const showProgress = page.navConfig?.showProgress ?? true;
  const showScore = page.navConfig?.showScore ?? true;
  const label = (page.templateData?.title as string) || page.label || 'Halaman';
  const progressPct = totalPages > 1 ? Math.round(((pageIndex + 1) / totalPages) * 100) : 100;

  const styleMap: Record<string, string> = {
    colorful: 'bg-gradient-to-r from-amber-900/80 via-cyan-900/60 to-purple-900/80 border-amber-500/20',
    minimal: 'bg-zinc-900/90 border-zinc-700/30',
    glass: 'bg-white/5 backdrop-blur-md border-white/10',
    pill: 'bg-zinc-800/80 rounded-full mx-2 border-zinc-600/30',
    rounded: 'bg-zinc-900/80 rounded-xl mx-2 border-zinc-600/30',
    floating: 'bg-zinc-900/60 backdrop-blur-lg rounded-xl mx-4 border-white/10 shadow-lg shadow-black/30',
  };

  const posClass = position === 'bottom'
    ? 'absolute bottom-0 left-0 right-0 border-t'
    : 'absolute top-0 left-0 right-0 border-b';

  return (
    <div className={`${posClass} z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 ${styleMap[style] || styleMap.colorful}`}>
      {/* Logo */}
      <div className="text-[9px] font-bold text-amber-300 truncate max-w-[120px]">{label}</div>

      {/* Progress bar */}
      {showProgress && (
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {/* Score */}
      {showScore && (
        <div className="text-[8px] font-bold text-amber-300 whitespace-nowrap">0 ⭐</div>
      )}

      {/* Page indicator */}
      <div className="text-[7px] text-white/30">{pageIndex + 1}/{totalPages}</div>
    </div>
  );
}

/* ── Nav Button Pair — renders Prev/Next in selected style ─── */

function NavButtonPair({
  navButtonStyle,
  navbarPosition,
  currentPageIndex,
  totalPages,
}: {
  navButtonStyle: 'circle' | 'pill' | 'arrow' | 'icon';
  navbarPosition: 'top' | 'bottom';
  currentPageIndex: number;
  totalPages: number;
}) {
  const isAtStart = currentPageIndex === 0;
  const isAtEnd = currentPageIndex === totalPages - 1;

  // Position: if navbar at top, buttons at bottom; if navbar at bottom, buttons at top
  const posClass = navbarPosition === 'bottom'
    ? 'absolute top-2 left-1/2 -translate-x-1/2'
    : 'absolute bottom-2 left-1/2 -translate-x-1/2';

  // Style variants for nav buttons
  const disabledBase = 'bg-black/20 text-white/20 border-white/5 cursor-default';
  const activeBase = 'bg-black/40 text-white/80 border-white/15 hover:bg-amber-500/30 hover:border-amber-400/50 cursor-pointer';

  if (navButtonStyle === 'circle') {
    return (
      <div className={`${posClass} flex gap-2 z-20`}>
        <button
          onClick={() => { if (!isAtStart) useCanvaStore.getState().goPage(currentPageIndex - 1); }}
          disabled={isAtStart}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${isAtStart ? disabledBase : activeBase}`}
          aria-label="Halaman sebelumnya"
        >◀</button>
        <button
          onClick={() => { if (!isAtEnd) useCanvaStore.getState().goPage(currentPageIndex + 1); }}
          disabled={isAtEnd}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${isAtEnd ? disabledBase : activeBase}`}
          aria-label="Halaman berikutnya"
        >▶</button>
      </div>
    );
  }

  if (navButtonStyle === 'pill') {
    return (
      <div className={`${posClass} flex gap-1.5 z-20`}>
        <button
          onClick={() => { if (!isAtStart) useCanvaStore.getState().goPage(currentPageIndex - 1); }}
          disabled={isAtStart}
          className={`px-3 py-0.5 rounded-full text-[8px] font-bold border transition-all ${isAtStart ? disabledBase : activeBase}`}
          aria-label="Halaman sebelumnya"
        >◀ Prev</button>
        <button
          onClick={() => { if (!isAtEnd) useCanvaStore.getState().goPage(currentPageIndex + 1); }}
          disabled={isAtEnd}
          className={`px-3 py-0.5 rounded-full text-[8px] font-bold border transition-all ${isAtEnd ? disabledBase : activeBase}`}
          aria-label="Halaman berikutnya"
        >Next ▶</button>
      </div>
    );
  }

  if (navButtonStyle === 'arrow') {
    return (
      <div className={`${posClass} flex gap-1 z-20`}>
        <button
          onClick={() => { if (!isAtStart) useCanvaStore.getState().goPage(currentPageIndex - 1); }}
          disabled={isAtStart}
          className={`px-2 py-0.5 rounded-md text-[12px] font-black border transition-all ${isAtStart ? disabledBase : activeBase}`}
          aria-label="Halaman sebelumnya"
        >←</button>
        <button
          onClick={() => { if (!isAtEnd) useCanvaStore.getState().goPage(currentPageIndex + 1); }}
          disabled={isAtEnd}
          className={`px-2 py-0.5 rounded-md text-[12px] font-black border transition-all ${isAtEnd ? disabledBase : activeBase}`}
          aria-label="Halaman berikutnya"
        >→</button>
      </div>
    );
  }

  // icon style — emoji arrows
  return (
    <div className={`${posClass} flex gap-1.5 z-20`}>
      <button
        onClick={() => { if (!isAtStart) useCanvaStore.getState().goPage(currentPageIndex - 1); }}
        disabled={isAtStart}
        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${isAtStart ? disabledBase : activeBase}`}
        aria-label="Halaman sebelumnya"
      >⬅</button>
      <button
        onClick={() => { if (!isAtEnd) useCanvaStore.getState().goPage(currentPageIndex + 1); }}
        disabled={isAtEnd}
        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${isAtEnd ? disabledBase : activeBase}`}
        aria-label="Halaman berikutnya"
      >➡</button>
    </div>
  );
}
