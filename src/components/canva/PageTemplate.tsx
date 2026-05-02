'use client';

import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { useCanvaStore } from '@/store/canva-store';
import { useAuthoringStore } from '@/store/authoring-store';
import type { CanvaPage, ColorPalette } from './types';
import { getPaletteColor } from '@/lib/color-palette';
import { handleIframeMessage, sendDataToIframe } from '@/lib/template-edit-bridge';
import type { TemplateColors } from '@/lib/template-edit-bridge';
import QuizWidget from './QuizWidget';
import GameWidget from './GameWidget';

// ═══════════════════════════════════════════════════════════════
// PAGE TEMPLATE — Iframe-based rendering for full visual fidelity
// Canvas shows exactly what export produces: animations, buttons, inputs, layout
// Now with inline edit bridge support via postMessage
// ═══════════════════════════════════════════════════════════════

interface PageTemplateProps {
  page: CanvaPage;
  isSelected: boolean;
  onEditField: (key: string, value: string) => void;
}

export default function PageTemplate({ page, isSelected, onEditField }: PageTemplateProps) {
  // For html-page type, render the stored HTML content directly
  if (page.templateType === 'html-page') {
    return <HtmlPageIframeRenderer htmlContent={String(page.templateData?.htmlContent || '')} />;
  }
  
  // For all other template types, render via export HTML in iframe
  return <ExportIframeRenderer />;
}

// ── Iframe renderer using exportPageHTML() for full fidelity ──
function ExportIframeRenderer() {
  const currentPageIndex = useCanvaStore(s => s.currentPageIndex);
  const pages = useCanvaStore(s => s.pages);
  const updateTemplateData = useCanvaStore(s => s.updateTemplateData);
  const page = pages[currentPageIndex];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  
  // Memoize the HTML generation - only regenerate when page data changes
  const templateDataStr = JSON.stringify(page?.templateData);
  const navConfigStr = JSON.stringify(page?.navConfig);
  const htmlContent = useMemo(() => {
    try {
      return useCanvaStore.getState().exportPageHTML(currentPageIndex);
    } catch {
      return '<html><body style="background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif"><div>Memuat template...</div></body></html>';
    }
  }, [
    currentPageIndex,
    page?.templateType,
    page?.bgColor,
    page?.bgDataUrl,
    page?.colorPalette,
    templateDataStr,
    navConfigStr,
  ]);

  // ── Listen for iframe messages (edit bridge) ─────────────────
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Only handle messages from our iframe
      if (!iframeRef.current) return;
      try {
        const iframeOrigin = new URL(iframeRef.current.srcdoc ? 'about:srcdoc' : iframeRef.current.src).origin;
        // srcdoc iframes have origin "null" — accept all for srcdoc
        if (iframeRef.current.srcdoc && event.origin !== 'null' && event.origin !== window.location.origin) return;
      } catch {
        // If URL parsing fails, still handle the message
      }

      handleIframeMessage(
        event,
        (key: string, value: unknown) => {
          updateTemplateData(key, value);
        },
        (key: string, _currentValue: string) => {
          // Color click handler — could open a color picker in the future
          // For now, just log it
          console.log('[EditBridge] Color field clicked:', key);
        }
      );
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [updateTemplateData]);

  // ── Send data to iframe when it loads or template data changes ──
  useEffect(() => {
    if (!iframeRef.current || !iframeReady) return;

    // Extract colors from templateData._colors if present
    const colors = (page?.templateData?._colors as TemplateColors) || undefined;

    // Extract font from templateData._font if present
    const font = (page?.templateData?._font as string) || undefined;

    // Send a small delay to ensure iframe's bridge script is initialized
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        sendDataToIframe(iframeRef.current, page?.templateData || {}, colors, font);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [iframeReady, page?.templateData, page?.templateData?._colors, page?.templateData?._font]);

  // ── Handle iframe load ──────────────────────────────────────
  const handleIframeLoad = useCallback(() => {
    setIframeReady(true);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={htmlContent}
      className="absolute inset-0 w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
      title="Template Preview"
      style={{ pointerEvents: 'auto' }}
      onLoad={handleIframeLoad}
    />
  );
}

// ── Iframe renderer for html-page type (imported HTML) ──
function HtmlPageIframeRenderer({ htmlContent }: { htmlContent: string }) {
  if (!htmlContent) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/25">
        <span className="text-3xl mb-2">📄</span>
        <span className="text-[9px]">Konten HTML belum dimuat</span>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={htmlContent}
      className="absolute inset-0 w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
      title="Imported HTML Page"
      style={{ pointerEvents: 'auto' }}
    />
  );
}

// ── Legacy helpers (kept for reference / potential future use) ──
function getModuleIcon(type: string): string {
  const icons: Record<string, string> = {
    skenario: '🎭', video: '🎬', flashcard: '🃏', infografis: '📊',
    'studi-kasus': '📖', debat: '💬', timeline: '📅', matching: '🔗',
    materi: '📝', truefalse: '✅', memory: '🧠', roda: '🎡',
    hero: '🚀', kutipan: '💬', langkah: '👣', accordion: '🪗',
    statistik: '📊', polling: '📊', embed: '🔗', 'tab-icons': '📑',
    'icon-explore': '🔍', comparison: '⚖️', 'card-showcase': '🃏',
    'hotspot-image': '🖼️', sorting: '📂', spinwheel: '🎡',
    teambuzzer: '🔔', wordsearch: '🔤',
  };
  return icons[type] || '🧩';
}

function getGameIcon(type: string): string {
  const icons: Record<string, string> = {
    truefalse: '✅', memory: '🧠', matching: '🔗', roda: '🎡',
    sorting: '📂', spinwheel: '🎡', teambuzzer: '🔔',
    wordsearch: '🔤', flashcard: '🃏',
  };
  return icons[type] || '🎮';
}

function getGameModuleIndex(game: Record<string, unknown> | undefined): number {
  if (!game) return -1;
  const modules = useAuthoringStore.getState().modules;
  return modules.findIndex((m: Record<string, unknown>) => m === game);
}
