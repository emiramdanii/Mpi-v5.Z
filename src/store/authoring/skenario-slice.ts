import type { AuthoringState } from './types';
import { _pushUndo } from './types';

export function createSkenarioSlice(
  set: (partial: Partial<AuthoringState>) => void,
  get: () => AuthoringState,
) {
  return {
    skenario: [] as Array<Record<string, unknown>>,

    setSkenario: (data: Array<Record<string, unknown>>) => {
      const s = get();
      set({ ..._pushUndo(s), skenario: data, dirty: true });
    },
    addSkenarioChapter: () => {
      const newChapter: Record<string, unknown> = {
        title: '',
        bg: 'sbg-kampung',
        charEmoji: '\uD83E\uDDD1',
        charColor: '#3ecfcf',
        charPants: '#2563eb',
        choicePrompt: 'Apa yang akan kamu lakukan?',
        setup: [{ speaker: 'NARRATOR', text: '' }],
        choices: [{
          icon: '\uD83E\uDD1D', label: '', detail: '', good: true, pts: 10, level: 'good',
          norma: '', resultTitle: '', resultBody: '',
          consequences: [{ icon: '\u2705', text: '' }],
        }],
      };
      const s = get();
      set({ ..._pushUndo(s), skenario: [...s.skenario, newChapter], dirty: true });
    },
    removeSkenarioChapter: (index: number) => {
      const s = get();
      set({ ..._pushUndo(s), skenario: s.skenario.filter((_, i) => i !== index), dirty: true });
    },
    updateSkenarioChapter: (index: number, key: string, value: unknown) => {
      const s = get();
      const next = [...s.skenario];
      next[index] = { ...next[index], [key]: value };
      set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
    addSkenarioSetup: (chapterIndex: number) => {
      const s = get();
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const setup = [...((chapter.setup as Array<Record<string, unknown>>) || []), { speaker: '', text: '' }];
      chapter.setup = setup;
      next[chapterIndex] = chapter;
      set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
    removeSkenarioSetup: (chapterIndex: number, setupIndex: number) => {
      const s = get();
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const setup = ((chapter.setup as Array<Record<string, unknown>>) || []).filter((_, i) => i !== setupIndex);
      chapter.setup = setup.length > 0 ? setup : [{ speaker: '', text: '' }];
      next[chapterIndex] = chapter;
      set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
    updateSkenarioSetup: (chapterIndex: number, setupIndex: number, key: string, value: unknown) => {
      const s = get();
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const setup = [...((chapter.setup as Array<Record<string, unknown>>) || [])];
      setup[setupIndex] = { ...setup[setupIndex], [key]: value };
      chapter.setup = setup;
      next[chapterIndex] = chapter;
      set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
    addSkenarioChoice: (chapterIndex: number) => {
      const s = get();
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || []), {
          icon: '\uD83E\uDD1D', label: '', detail: '', good: false, pts: 5, level: 'mid',
          norma: '', resultTitle: '', resultBody: '',
          consequences: [{ icon: '\u26A0\uFE0F', text: '' }],
        }];
        chapter.choices = choices;
        next[chapterIndex] = chapter;
        set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
    removeSkenarioChoice: (chapterIndex: number, choiceIndex: number) => {
      const s = get();
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = ((chapter.choices as Array<Record<string, unknown>>) || []).filter((_, i) => i !== choiceIndex);
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
    updateSkenarioChoice: (chapterIndex: number, choiceIndex: number, key: string, value: unknown) => {
      const s = get();
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || [])];
      choices[choiceIndex] = { ...choices[choiceIndex], [key]: value };
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
    addSkenarioConsequence: (chapterIndex: number, choiceIndex: number) => {
      const s = get();
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || [])];
      const choice = { ...choices[choiceIndex] };
        const consequences = [...((choice.consequences as Array<Record<string, unknown>>) || []), { icon: '\uD83D\uDCCC', text: '' }];
        choice.consequences = consequences;
        choices[choiceIndex] = choice;
        chapter.choices = choices;
        next[chapterIndex] = chapter;
        set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
    removeSkenarioConsequence: (chapterIndex: number, choiceIndex: number, consIndex: number) => {
      const s = get();
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || [])];
      const choice = { ...choices[choiceIndex] };
      const consequences = ((choice.consequences as Array<Record<string, unknown>>) || []).filter((_, i) => i !== consIndex);
      choice.consequences = consequences;
      choices[choiceIndex] = choice;
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
    updateSkenarioConsequence: (chapterIndex: number, choiceIndex: number, consIndex: number, key: string, value: unknown) => {
      const s = get();
      const next = [...s.skenario];
      const chapter = { ...next[chapterIndex] };
      const choices = [...((chapter.choices as Array<Record<string, unknown>>) || [])];
      const choice = { ...choices[choiceIndex] };
      const consequences = [...((choice.consequences as Array<Record<string, unknown>>) || [])];
      consequences[consIndex] = { ...consequences[consIndex], [key]: value };
      choice.consequences = consequences;
      choices[choiceIndex] = choice;
      chapter.choices = choices;
      next[chapterIndex] = chapter;
      set({ ..._pushUndo(s), skenario: next, dirty: true });
    },
  };
}
