import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

export type Syntax = 'ts' | 'js';

type SyntaxContextValue = {
  syntax: Syntax;
  setSyntax: (s: Syntax) => void;
};

const SyntaxContext = createContext<SyntaxContextValue>({ syntax: 'ts', setSyntax: () => {} });

export function SyntaxProvider({ children }: { children: ReactNode }) {
  const [syntax, setSyntax] = useState<Syntax>(() => (localStorage.getItem('code-syntax') as Syntax) ?? 'ts');

  function handleSet(s: Syntax) {
    setSyntax(s);
    localStorage.setItem('code-syntax', s);
  }

  const value = useMemo(() => ({ syntax, setSyntax: handleSet }), [syntax]);

  return <SyntaxContext.Provider value={value}>{children}</SyntaxContext.Provider>;
}

export function useSyntax() {
  const { syntax, setSyntax } = useContext(SyntaxContext);
  return { syntax, setSyntax, isAlternative: syntax !== 'ts' };
}
