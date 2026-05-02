// ═══════════════════════════════════════════════════════════════
// TEMPLATE EDIT BRIDGE — Iframe ↔ Parent communication for inline editing
// Injects a script into exported HTML that makes [data-edit] elements
// contentEditable, shows hover/click indicators, and sends changes
// back to the parent via postMessage.
// ═══════════════════════════════════════════════════════════════

import type { PageTemplateType } from '@/components/canva/types';

// ── Editable Fields Map — per template type ────────────────────
// Defines which fields are editable and their labels (Indonesian)

export interface EditableFieldDef {
  key: string;
  label: string;
  type: 'text' | 'color' | 'select' | 'textarea' | 'toggle';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const EDITABLE_FIELDS_MAP: Record<PageTemplateType, EditableFieldDef[]> = {
  cover: [
    { key: 'title', label: 'Judul Pertemuan', type: 'text', placeholder: 'Masukkan judul...' },
    { key: 'subtitle', label: 'Subjudul', type: 'text', placeholder: 'Masukkan subjudul...' },
    { key: 'icon', label: 'Ikon', type: 'text', placeholder: '📚' },
    { key: 'mapel', label: 'Mata Pelajaran', type: 'text', placeholder: 'Contoh: PPKn' },
    { key: 'kelas', label: 'Kelas', type: 'text', placeholder: 'Contoh: VII' },
    { key: 'namaBab', label: 'Nama Bab', type: 'text', placeholder: 'Contoh: Bab 3' },
  ],
  dokumen: [
    // CP/TP/ATP are complex objects — sync from authoring instead
  ],
  materi: [
    // Blok data is complex — edited via authoring sync
  ],
  kuis: [
    // Kuis data is complex — edited via authoring sync
  ],
  game: [
    // Game data is complex — edited via authoring sync
  ],
  hasil: [
    { key: 'namaBab', label: 'Nama Bab', type: 'text', placeholder: 'Nama bab...' },
  ],
  hero: [
    { key: 'title', label: 'Judul Hero', type: 'text', placeholder: 'Masukkan judul...' },
    { key: 'subtitle', label: 'Subjudul', type: 'text', placeholder: 'Masukkan subjudul...' },
    { key: 'icon', label: 'Ikon', type: 'text', placeholder: '🚀' },
    { key: 'gradient', label: 'Gradient', type: 'select', options: [
      { value: 'sunset', label: '🌅 Sunset' },
      { value: 'ocean', label: '🌊 Ocean' },
      { value: 'forest', label: '🌲 Forest' },
      { value: 'fire', label: '🔥 Fire' },
      { value: 'cosmic', label: '🌌 Cosmic' },
    ]},
    { key: 'cta', label: 'Tombol CTA', type: 'text', placeholder: 'Mulai Belajar' },
  ],
  skenario: [
    // Skenario data is complex — edited via authoring sync
  ],
  custom: [],
  'html-page': [],
};

// ── Color customizations ───────────────────────────────────────
export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
}

export const DEFAULT_COLORS: TemplateColors = {
  primary: '#f9c82e',
  secondary: '#3ecfcf',
  accent: '#a78bfa',
};

// ── Font options ───────────────────────────────────────────────
export const FONT_OPTIONS = [
  { value: "'Nunito', sans-serif", label: 'Nunito' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: "'Lato', sans-serif", label: 'Lato' },
  { value: "system-ui, sans-serif", label: 'System Default' },
];

// ── INJECT_SCRIPT — The JavaScript injected into iframe HTML ───
// This script:
// 1. Finds all [data-edit] elements
// 2. Makes them contentEditable on focus
// 3. Shows hover outlines and cursor indicators
// 4. On blur, sends the new content via postMessage

export const INJECT_SCRIPT = `
<script data-edit-bridge>
(function() {
  'use strict';

  // Check if already injected to avoid double-injection
  if (window.__editBridgeActive) return;
  window.__editBridgeActive = true;

  var EDIT_OUTLINE_COLOR = 'rgba(249,200,46,0.6)';
  var EDIT_OUTLINE_WIDTH = '2px';
  var EDIT_CURSOR = 'text';

  // Create style element for editable indicators
  var style = document.createElement('style');
  style.textContent = [
    '[data-edit]:hover {',
    '  outline: ' + EDIT_OUTLINE_WIDTH + ' dashed ' + EDIT_OUTLINE_COLOR + ';',
    '  outline-offset: 2px;',
    '  cursor: ' + EDIT_CURSOR + ';',
    '  transition: outline 0.15s ease;',
    '}',
    '[data-edit][contenteditable="true"] {',
    '  outline: ' + EDIT_OUTLINE_WIDTH + ' solid ' + EDIT_OUTLINE_COLOR + ';',
    '  outline-offset: 2px;',
    '  background: rgba(249,200,46,0.05);',
    '}',
    '[data-edit]:empty::before {',
    '  content: attr(data-edit-placeholder);',
    '  color: rgba(255,255,255,0.2);',
    '  font-style: italic;',
    '}',
    '[data-edit-type="color"] {',
    '  cursor: pointer !important;',
    '}',
  ].join('\\n');
  document.head.appendChild(style);

  // Process all [data-edit] elements
  function setupEditableElements() {
    var els = document.querySelectorAll('[data-edit]');
    els.forEach(function(el) {
      var editKey = el.getAttribute('data-edit');
      var editType = el.getAttribute('data-edit-type') || 'text';

      // Skip color type (handled differently)
      if (editType === 'color') {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          // Send click event to parent to open color picker
          window.parent.postMessage({
            type: 'template-edit',
            action: 'color-click',
            key: editKey,
            currentValue: el.style.backgroundColor || el.style.color || '',
          }, '*');
        });
        return;
      }

      // Text editing
      el.setAttribute('contenteditable', 'false');

      el.addEventListener('mouseenter', function() {
        el.style.cursor = EDIT_CURSOR;
      });

      el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        el.setAttribute('contenteditable', 'true');
        el.focus();

        // Select all text for easy replacement
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });

      el.addEventListener('blur', function() {
        el.setAttribute('contenteditable', 'false');
        var newValue = el.innerText || el.textContent || '';

        // Send change to parent
        window.parent.postMessage({
          type: 'template-edit',
          action: 'update',
          key: editKey,
          value: newValue,
        }, '*');
      });

      // Handle Enter key — prevent new lines in single-line fields
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && editType === 'text') {
          e.preventDefault();
          el.blur();
        }
        // Escape to cancel editing
        if (e.key === 'Escape') {
          el.blur();
        }
      });

      // Prevent click from propagating to interactive elements below
      el.addEventListener('mousedown', function(e) {
        e.stopPropagation();
      });
    });
  }

  // Listen for data updates from parent
  window.addEventListener('message', function(event) {
    var data = event.data;
    if (!data || data.type !== 'template-data') return;

    // Apply incoming data to [data-edit] elements
    if (data.templateData) {
      Object.keys(data.templateData).forEach(function(key) {
        var el = document.querySelector('[data-edit="' + key + '"]');
        if (el) {
          var editType = el.getAttribute('data-edit-type') || 'text';
          if (editType === 'color') {
            // Apply color to element
            var colorTarget = el.getAttribute('data-color-target') || 'color';
            if (colorTarget === 'background') {
              el.style.backgroundColor = data.templateData[key];
            } else {
              el.style.color = data.templateData[key];
            }
          } else {
            el.innerText = String(data.templateData[key] || '');
          }
        }
      });
    }

    // Apply color overrides
    if (data.colors) {
      applyColorOverrides(data.colors);
    }

    // Apply font override
    if (data.font) {
      document.querySelector('.slide').style.fontFamily = data.font;
    }
  });

  // Apply color overrides via CSS variables
  function applyColorOverrides(colors) {
    var slide = document.querySelector('.slide');
    if (!slide) return;

    if (colors.primary) {
      slide.style.setProperty('--y', colors.primary);
    }
    if (colors.secondary) {
      slide.style.setProperty('--c', colors.secondary);
    }
    if (colors.accent) {
      slide.style.setProperty('--accent', colors.accent);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEditableElements);
  } else {
    setupEditableElements();
  }
})();
</script>
`;

// ── handleIframeMessage — Parse and route messages from iframe ──

export function handleIframeMessage(
  event: MessageEvent,
  updateTemplateData: (key: string, value: unknown) => void,
  onColorClick?: (key: string, currentValue: string) => void,
): void {
  const data = event.data;
  if (!data || data.type !== 'template-edit') return;

  switch (data.action) {
    case 'update':
      if (data.key && data.value !== undefined) {
        updateTemplateData(data.key, data.value);
      }
      break;

    case 'color-click':
      if (data.key && onColorClick) {
        onColorClick(data.key, data.currentValue);
      }
      break;
  }
}

// ── sendDataToIframe — Push initial data to iframe via postMessage ──

export function sendDataToIframe(
  iframe: HTMLIFrameElement,
  templateData: Record<string, unknown>,
  colors?: TemplateColors,
  font?: string,
): void {
  if (!iframe.contentWindow) return;

  // Only send simple string/number fields for inline editing
  const simpleData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(templateData)) {
    if (typeof value === 'string' || typeof value === 'number') {
      simpleData[key] = value;
    }
  }

  iframe.contentWindow.postMessage({
    type: 'template-data',
    templateData: simpleData,
    colors: colors || null,
    font: font || null,
  }, '*');
}

// ── getBridgeInjectHTML — Returns the script tag HTML to inject ──

export function getBridgeInjectHTML(): string {
  return INJECT_SCRIPT;
}
