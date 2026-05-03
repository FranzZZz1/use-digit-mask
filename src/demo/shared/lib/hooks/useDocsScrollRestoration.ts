import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { type DocsLocationState } from '@/shared/types';

import { useDocsUI } from './useDocsUI';

export function useDocsScrollRestoration() {
  const location = useLocation() as {
    key: string;
    state?: DocsLocationState;
  };
  const setBackTo = useDocsUI((s) => s.setBackTo);

  useLayoutEffect(() => {
    const { scrollTo, backTo } = location.state ?? {};

    setBackTo(backTo ?? null);

    if (!scrollTo) {
      window.scrollTo(0, 0);
      return undefined;
    }

    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(scrollTo);
      if (!el) return;

      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps
}
