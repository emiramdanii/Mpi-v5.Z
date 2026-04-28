'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthoringStore } from '@/store/authoring-store';
import { generateExportHtml } from '@/lib/export-html';

// ── Screen definitions for navigation ────────────────────────────
const SCREEN_OPTIONS = [
  { id: 's-cover', label: '🎬 Cover' },
  { id: 's-cp', label: '📋 CP / TP / ATP' },
  { id: 's-sk', label: '🎭 Skenario' },
  { id: 's-materi', label: '📖 Materi & Fungsi' },
  { id: 's-kuis', label: '❓ Kuis' },
  { id: 's-hasil', label: '📊 Hasil' },
];

// ── Device mode options ──────────────────────────────────────────
const DEVICE_MODES = [
  { id: 'mobile' as const, label: '📱', width: 390 },
  { id: 'tablet' as const, label: '📋', width: 768 },
  { id: 'desktop' as const, label: '🖥️', width: 0 }, // 0 = 100%
];

type DeviceMode = 'mobile' | 'tablet' | 'desktop';

export default function LivePreview() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [activeScreen, setActiveScreen] = useState('s-cover');
  const [htmlContent, setHtmlContent] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to all relevant store slices
  const meta = useAuthoringStore((s) => s.meta);
  const cp = useAuthoringStore((s) => s.cp);
  const tp = useAuthoringStore((s) => s.tp);
  const atp = useAuthoringStore((s) => s.atp);
  const alur = useAuthoringStore((s) => s.alur);
  const skenario = useAuthoringStore((s) => s.skenario);
  const kuis = useAuthoringStore((s) => s.kuis);
  const materi = useAuthoringStore((s) => s.materi);
  const modules = useAuthoringStore((s) => s.modules);
  const games = useAuthoringStore((s) => s.games);
  const dirty = useAuthoringStore((s) => s.dirty);

  // Generate HTML with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const html = generateExportHtml({
          meta, cp, tp, atp, alur, skenario, kuis, materi, modules, games,
        });
        setHtmlContent(html);
      } catch (err) {
        console.error('Failed to generate preview HTML:', err);
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [meta, cp, tp, atp, alur, skenario, kuis, materi, modules, games]);

  // Inject navigation override script to jump to specific screen
  const srcdoc = useMemo(() => {
    if (!htmlContent) return '';
    // Inject a script that will navigate to the selected screen after load
    const navScript = `
<script>
  // Override goScreen to also update parent via postMessage
  (function(){
    var _origGo = window.goScreen;
    window.goScreen = function(id) {
      if (_origGo) _origGo(id);
      window.parent.postMessage({ type: 'screenChange', screen: id }, '*');
    };
    // Navigate to the selected screen after DOM ready
    document.addEventListener('DOMContentLoaded', function(){
      if (window.goScreen && '${activeScreen}') {
        goScreen('${activeScreen}');
      }
    });
    // If already loaded (e.g. re-navigated), run immediately
    if (document.readyState !== 'loading') {
      if (window.goScreen && '${activeScreen}') {
        goScreen('${activeScreen}');
      }
    }
  })();
<\/script>`;
    // Insert before closing </body> or </html>
    return htmlContent.replace('</body>', navScript + '\n</body>');
  }, [htmlContent, activeScreen]);

  // Listen for screen changes from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'screenChange' && e.data.screen) {
        setActiveScreen(e.data.screen);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const currentDevice = DEVICE_MODES.find((d) => d.id === deviceMode) || DEVICE_MODES[0];

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center gap-3">
        {/* Device mode buttons */}
        <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5">
          {DEVICE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setDeviceMode(mode.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                deviceMode === mode.id
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
              }`}
              title={mode.id.charAt(0).toUpperCase() + mode.id.slice(1)}
            >
              {mode.label}
              {mode.width > 0 && (
                <span className="ml-1 text-[0.6rem] opacity-60">{mode.width}px</span>
              )}
            </button>
          ))}
        </div>

        {/* Screen navigation */}
        <select
          value={activeScreen}
          onChange={(e) => setActiveScreen(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
        >
          {SCREEN_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Status indicators */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                dirty ? 'bg-amber-400' : 'bg-zinc-600'
              }`}
            />
            <span className="text-[0.65rem] text-zinc-500">
              {dirty ? 'Perubahan belum disimpan' : 'Tersimpan'}
            </span>
          </div>
          <span className="text-[0.65rem] text-zinc-600">
            Auto-refresh 500ms
          </span>
        </div>
      </div>

      {/* ── Preview Area ─────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-4 bg-zinc-950">
        <div
          className="rounded-xl overflow-hidden border-2 border-zinc-800 shadow-2xl transition-all duration-300"
          style={{
            width: currentDevice.width > 0 ? `${currentDevice.width}px` : '100%',
            maxWidth: currentDevice.width > 0 ? undefined : '100%',
            height: currentDevice.width > 0 ? 'min(720px, calc(100vh - 120px))' : 'calc(100vh - 120px)',
          }}
        >
          {htmlContent ? (
            <iframe
              srcDoc={srcdoc}
              className="w-full h-full border-0"
              title="Live Preview"
              sandbox="allow-scripts"
              key={activeScreen} // Force re-render on screen change
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <div className="text-center">
                <div className="text-3xl mb-3 animate-pulse">⏳</div>
                <div className="text-zinc-400 text-sm">Membuat preview...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
