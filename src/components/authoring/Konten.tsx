'use client';

import { useState, useRef } from 'react';
import { useAuthoringStore } from '@/store/authoring-store';

// ── Sub-tab type ─────────────────────────────────────────────────
type KontenTab = 'materi' | 'modules' | 'kuis';

// ── Materi Tab ───────────────────────────────────────────────────
function MateriTab() {
  const materi = useAuthoringStore((s) => s.materi);

  const blockTypes = [
    { id: 'teks', icon: '📝', label: 'Paragraf' },
    { id: 'definisi', icon: '📌', label: 'Definisi' },
    { id: 'poin', icon: '•', label: 'Poin-Poin' },
    { id: 'tabel', icon: '📊', label: 'Tabel' },
    { id: 'kutipan', icon: '💬', label: 'Kutipan' },
    { id: 'gambar', icon: '🖼️', label: 'Gambar URL' },
    { id: 'timeline', icon: '🔄', label: 'Timeline' },
    { id: 'highlight', icon: '⚡', label: 'Highlight' },
    { id: 'compare', icon: '⚖️', label: 'Perbandingan' },
    { id: 'infobox', icon: '💡', label: 'Info Box' },
    { id: 'checklist', icon: '✅', label: 'Checklist' },
    { id: 'statistik', icon: '📈', label: 'Statistik' },
    { id: 'studi', icon: '📖', label: 'Studi Kasus' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-xs text-zinc-500">{materi.blok.length} blok</div>

      {materi.blok.length === 0 ? (
        <div className="text-center py-8 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm text-zinc-500">Belum ada blok materi. Tambahkan blok di bawah.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {materi.blok.map((blok, i) => {
            const typeInfo = blockTypes.find((t) => t.id === blok.type);
            return (
              <div
                key={i}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
              >
                <span className="text-lg">{typeInfo?.icon || '📦'}</span>
                <span className="text-sm text-zinc-300 flex-1">{typeInfo?.label || blok.type}</span>
                <span className="text-xs text-zinc-600">#{i + 1}</span>
                <span className="text-xs text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded">soon</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Block Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-3">➕ Tambah Blok</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
          {blockTypes.map((t) => (
            <button
              key={t.id}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-2.5 text-center hover:border-zinc-600 transition-colors cursor-pointer"
              title={`${t.label} — editor segera hadir`}
            >
              <div className="text-lg mb-0.5">{t.icon}</div>
              <div className="text-[0.65rem] text-zinc-400">{t.label}</div>
            </button>
          ))}
        </div>
        <p className="text-[0.65rem] text-zinc-600 mt-2">* Editor blok akan tersedia segera</p>
      </div>
    </div>
  );
}

// ── Modules Tab ──────────────────────────────────────────────────
function ModulesTab() {
  const modules = useAuthoringStore((s) => s.modules);
  const games = useAuthoringStore((s) => s.games);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">{modules.length} modul · {games.length} game</span>
        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors">
          ＋ Tambah Modul / Game
        </button>
      </div>

      {modules.length === 0 && games.length === 0 ? (
        <div className="text-center py-8 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="text-3xl mb-2">🧩</div>
          <p className="text-sm text-zinc-500">Belum ada modul. Klik "+ Tambah Modul" atau pilih preset di bawah.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {modules.map((mod, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
            >
              <span className="text-lg">🧩</span>
              <span className="text-sm text-zinc-300 flex-1 truncate">{(mod as { type?: string }).type || `Modul ${i + 1}`}</span>
              <div className="flex gap-1">
                <button className="text-xs text-zinc-500 hover:text-zinc-300 px-1.5">👁️</button>
                <button className="text-xs text-zinc-500 hover:text-zinc-300 px-1.5">✏️</button>
                <button className="text-xs text-zinc-500 hover:text-red-400 px-1.5">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Module Types Reference */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-3">📚 Tipe Modul & Game Tersedia</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {[
            { icon: '🎭', label: 'Skenario' },
            { icon: '🎥', label: 'Video' },
            { icon: '🃏', label: 'Flashcard' },
            { icon: '📊', label: 'Infografis' },
            { icon: '📰', label: 'Studi Kasus' },
            { icon: '🔀', label: 'Matching' },
            { icon: '📅', label: 'Timeline' },
            { icon: '💡', label: 'Info Box' },
            { icon: '🗣️', label: 'Debat' },
            { icon: '📑', label: 'Accordion' },
            { icon: '📊', label: 'Statistik' },
            { icon: '🔗', label: 'Embed' },
          ].map((t) => (
            <div
              key={t.label}
              className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-2.5 text-center cursor-pointer hover:border-zinc-600 transition-colors"
              title={`${t.label} — editor segera hadir`}
            >
              <div className="text-lg mb-0.5">{t.icon}</div>
              <div className="text-[0.65rem] text-zinc-400">{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Kuis Tab (Fully Functional) ─────────────────────────────────
function KuisTab() {
  const kuis = useAuthoringStore((s) => s.kuis);
  const addKuis = useAuthoringStore((s) => s.addKuis);
  const deleteKuis = useAuthoringStore((s) => s.deleteKuis);
  const updateKuis = useAuthoringStore((s) => s.updateKuis);
  const updateKuisOpt = useAuthoringStore((s) => s.updateKuisOpt);
  const applyKuisPreset = useAuthoringStore((s) => s.applyKuisPreset);
  const listRef = useRef<HTMLDivElement>(null);
  const letters = ['A', 'B', 'C', 'D'];

  const handleAdd = () => {
    addKuis();
    setTimeout(() => {
      const el = listRef.current?.lastElementChild;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Preset Cards */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-zinc-200 mb-3">⚡ Preset Kuis</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
          <button
            onClick={() => applyKuisPreset('norma-10-soal')}
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <div className="text-xl mb-1">❓</div>
            <div className="text-xs font-semibold text-zinc-200">Norma – 10 Soal</div>
            <div className="text-[0.65rem] text-zinc-500">Siap pakai, bisa diedit</div>
          </button>
          <button
            onClick={() => applyKuisPreset('blank')}
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 text-center hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <div className="text-xl mb-1">📋</div>
            <div className="text-xs font-semibold text-zinc-200">Kosong</div>
            <div className="text-[0.65rem] text-zinc-500">Buat dari nol</div>
          </button>
        </div>
      </div>

      {/* Quiz List */}
      <div ref={listRef} className="space-y-4">
        {!kuis.length ? (
          <div className="text-center py-6 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="text-3xl mb-2">❓</div>
            <p className="text-sm text-zinc-500">Belum ada soal.</p>
          </div>
        ) : (
          kuis.map((soal, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-zinc-200">Soal {i + 1}</span>
                <button
                  onClick={() => deleteKuis(i)}
                  className="ml-auto text-zinc-500 hover:text-red-400 transition-colors text-sm"
                >
                  🗑️
                </button>
              </div>

              {/* Question */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Pertanyaan</label>
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors resize-none"
                  rows={2}
                  placeholder="Tulis pertanyaan…"
                  value={soal.q}
                  onChange={(e) => updateKuis(i, 'q', e.target.value)}
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Pilihan Jawaban (pilih yang benar)
                </label>
                <div className="space-y-2">
                  {letters.map((letter, j) => (
                    <label
                      key={j}
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                        soal.ans === j
                          ? 'bg-cyan-500/10 border border-cyan-500/30'
                          : 'bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`kuis_ans_${i}`}
                        checked={soal.ans === j}
                        onChange={() => updateKuis(i, 'ans', j)}
                        className="accent-cyan-400"
                      />
                      <span className="text-xs font-bold text-cyan-400 w-4">{letter}.</span>
                      <input
                        className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
                        placeholder={`Opsi ${letter}`}
                        value={soal.opts[j] || ''}
                        onChange={(e) => updateKuisOpt(i, j, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Penjelasan / Feedback</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
                  placeholder="Mengapa jawaban ini benar?"
                  value={soal.ex}
                  onChange={(e) => updateKuis(i, 'ex', e.target.value)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleAdd}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-lg transition-colors"
      >
        ＋ Tambah Soal
      </button>
    </div>
  );
}

// ── Main Konten Panel ───────────────────────────────────────────
export default function Konten() {
  const [activeTab, setActiveTab] = useState<KontenTab>('materi');

  const tabs: { id: KontenTab; icon: string; label: string }[] = [
    { id: 'materi', icon: '📝', label: 'Materi' },
    { id: 'modules', icon: '🧩', label: 'Modul & Game' },
    { id: 'kuis', icon: '❓', label: 'Evaluasi' },
  ];

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <span>📚</span> Konten Pembelajaran
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Materi, aktivitas/modul, dan evaluasi siswa dalam satu panel.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-zinc-700 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar">
        {activeTab === 'materi' && <MateriTab />}
        {activeTab === 'modules' && <ModulesTab />}
        {activeTab === 'kuis' && <KuisTab />}
      </div>
    </div>
  );
}
