# Task: Split canva-store.ts into Modular Slices

## Task ID: canva-store-modularization

## Summary

Successfully split the massive `canva-store.ts` (2062 lines) into 8 modular slice files under `src/store/canva/`, plus a main `index.ts` that combines them. The original file was converted to a thin re-export wrapper. All existing imports throughout the project (`useCanvaStore` from `@/store/canva-store`) remain fully functional.

## Files Created

| File | Purpose | Lines (approx) |
|------|---------|-----------------|
| `store/canva/types.ts` | Shared types (CanvaState, Snapshot), constants (MAX_HISTORY, CANVA_STORAGE_KEY, GAME_TYPES, MATERI_MODULE_TYPES), helper functions (createPage, createElId) | ~150 |
| `store/canva/history-slice.ts` | Undo/redo operations (_pushHistory, undo, redo, canUndo, canRedo) | ~55 |
| `store/canva/page-slice.ts` | Page CRUD (goPage, addPage, addTemplatePage, duplicatePage, deletePage, setPageLabel, setTemplateType, reorderPage) | ~180 |
| `store/canva/element-slice.ts` | Element operations (addElement, addKuisElement, addGameElement, selectElement, updateElement, deleteElement, deleteSelected, toggleElementVisibility, saveTextContent, moveElementZ) | ~170 |
| `store/canva/background-slice.ts` | Background/palette/nav (setBgColor, setBgImage, setOverlay, extractAndSetPalette, setPaletteMapping, updateNavConfig, updateTemplateData) | ~80 |
| `store/canva/auto-rakit.ts` | autoRakit() function and populateTemplateElements() helper | ~140 |
| `store/canva/export-slice.ts` | exportPageHTML(), renderTemplateExportHTML(), exportSlideshowHTML(), and ALL game rendering inline JS | ~1160 |
| `store/canva/persistence-slice.ts` | saveToStorage, loadFromStorage, setImportedHtmlModules, addHtmlPageModule | ~75 |
| `store/canva/index.ts` | Main store file combining all slices into one Zustand store | ~90 |

## File Modified

- `src/store/canva-store.ts` → Now a 3-line re-export wrapper:
  ```typescript
  export { useCanvaStore } from './canva';
  export type { CanvaState } from './canva';
  ```

## Architecture Pattern

Each slice file exports a factory function that takes `(set, get)` and returns a partial state object:
```typescript
export function createXxxSlice(_set: Set, get: Get) {
  return { action1: () => { ... }, action2: () => { ... } };
}
```

The `index.ts` combines them using object spread:
```typescript
export const useCanvaStore = create<CanvaState>((set, get) => ({
  ...initialState,
  ...computedHelpers,
  ...createHistorySlice(set, get),
  ...createPageSlice(set, get),
  ...createElementSlice(set, get),
  ...createBackgroundSlice(set, get),
  ...createAutoRakitSlice(set, get),
  ...createExportSlice(set, get),
  ...createPersistenceSlice(set, get),
}));
```

## TypeScript Check Results

- **0 errors** in `src/store/canva/` files
- **0 errors** in `src/store/canva-store.ts`
- Pre-existing errors in other files (LeftPanel.tsx, etc.) are unchanged — not introduced by this refactoring
- Fixed 2 issues found during refactoring:
  1. `ncFull` object literal had properties specified more than once (TS2783) → Refactored to use `ncDefaults` pattern
  2. `firstNavConfig` had an unnecessary `as Record<string, unknown>` cast → Removed by properly typing with `as const`
  3. `updateNavConfig` parameter was typed as `Record<string, unknown>` → Fixed to `Partial<NavConfig>`

## Backward Compatibility

All 9 files importing `useCanvaStore` from `@/store/canva-store` continue to work without changes:
- RightPanel.tsx, IconRail.tsx, CanvaBuilder.tsx, PageTemplate.tsx, StatusBar.tsx, Stage.tsx, Toolbar.tsx, TemplateCustomizer.tsx, LeftPanel.tsx
