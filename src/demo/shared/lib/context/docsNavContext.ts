import { createContext, useContext } from 'react';

export type DocsNavContextValue = {
  hookLabel: string;
};

export const DocsNavContext = createContext<DocsNavContextValue>({ hookLabel: '' });

export function useDocsNav(): DocsNavContextValue {
  return useContext(DocsNavContext);
}
