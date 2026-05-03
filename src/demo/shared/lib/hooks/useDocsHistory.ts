import { create } from 'zustand';

export type DocsHistoryEntry = {
  fromPath: string;
  toPath: string;
  timestamp: number;
  scrollTo?: string;
  fromLabel?: string;
  sectionLabel?: string;
};

type DocsHistoryState = {
  stack: DocsHistoryEntry[];
  push: (entry: DocsHistoryEntry) => void;
  pop: () => DocsHistoryEntry | undefined;
  clear: () => void;
  current?: DocsHistoryEntry;
};

export const useDocsHistory = create<DocsHistoryState>((set, get) => ({
  stack: [],

  push: (entry) => {
    set((state) => ({
      stack: [...state.stack, entry],
      current: entry,
    }));
  },

  pop: () => {
    const { stack } = get();
    if (stack.length === 0) return undefined;

    const newStack = stack.slice(0, -1);
    const prev = newStack[newStack.length - 1];

    set({
      stack: newStack,
      current: prev,
    });

    return prev;
  },

  clear: () => {
    set({
      stack: [],
      current: undefined,
    });
  },
}));
