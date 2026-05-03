import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { type Lang, type Translation } from '@/shared/i18n';

import { en } from '../translations/en';
import { ru } from '../translations/ru';

const STORAGE_KEY = 'udm-lang';
const TRANSLATIONS: Record<Lang, Translation> = { en, ru };

function getSavedLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    // ignore
  }
  return 'en';
}

type LangContextValue = {
  lang: Lang;
  t: Translation;
  setLang: (lang: Lang) => void;
};

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  t: en,
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getSavedLang);

  const handleSetLang = useCallback((next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, t: TRANSLATIONS[lang], setLang: handleSetLang }),
    [lang, handleSetLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
