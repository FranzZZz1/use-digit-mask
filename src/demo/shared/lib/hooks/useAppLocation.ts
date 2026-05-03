import { useLocation } from 'react-router-dom';

import { type DocsLocationState } from '@/shared/types';

export function useAppLocation<TState = DocsLocationState>() {
  return useLocation() as Omit<ReturnType<typeof useLocation>, 'state'> & {
    state: TState | undefined;
  };
}
