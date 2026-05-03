import { create } from 'zustand';

import { type BackTo } from '@/shared/types';

type DocsUIState = {
  backTo: BackTo | null;
  setBackTo: (value: BackTo | null) => void;
};

export const useDocsUI = create<DocsUIState>((set) => ({
  backTo: null,

  setBackTo: (value) => {
    set({ backTo: value });
  },
}));
