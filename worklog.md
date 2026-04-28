---
Task ID: 1
Agent: main
Task: Improve live view function for authoring-tool-v3

Work Log:
- Analyzed all files: liveview.js, editor.js, index.html, liveview_enhancements.js, preview.js, data.js
- Identified root causes of live view not responding:
  1. Missing HTML elements: syncDot, syncLabel, splitCharCount referenced in JS but not in HTML
  2. Hash comparison skip: refresh() skipped rebuild when hash matched, causing stale preview
  3. No MutationObserver fallback for form changes not captured by markDirty()
  4. Accordion max-height not recalculated after dynamic content changes
  5. markDirty hook only called scheduleRefresh, didn't recalc accordions

- Added sync indicator elements to index.html split header:
  - splitSyncIndicator container with syncDot, syncLabel, splitCharCount

- Rewrote liveview.js v4.0 with major improvements:
  1. REMOVED hash comparison skip — every scheduleRefresh now forces a rebuild
  2. Added forceRefresh() method for manual refresh
  3. Faster debounce: 60ms for first 5 builds, then 200ms
  4. Added MutationObserver fallback to catch form changes
  5. Added _recalcAllAccordions() and _recalcAfterRender() for accordion height fix
  6. Patched toggleAccordion and switchKontenTab to recalc after changes
  7. markDirty hook now also calls _recalcAfterRender()
  8. Added periodic integrity check (every 2s) to ensure refresh is scheduled
  9. Better error recovery with retry capability
  10. Added AT_PREVIEW readiness check before building

- Copied all updated files to /home/z/my-project/public/

Stage Summary:
- Live view v4.0: Robust, always-refresh architecture
- All form changes now reliably trigger preview updates
- Accordion heights auto-recalculate after content changes
- Sync indicator properly visible in split pane header
