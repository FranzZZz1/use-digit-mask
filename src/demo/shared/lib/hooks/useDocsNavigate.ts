import { type NavigateOptions as RRNavigateOptions, useLocation, useNavigate } from 'react-router-dom';

import { useDocsHistory } from '@/shared/lib';
import { type BackTo } from '@/shared/types';

type NavigateOptions = RRNavigateOptions & {
  scrollTo?: string;
  backTo?: BackTo;
};

export function useDocsNavigate() {
  const navigate = useNavigate();
  const location = useLocation();
  const history = useDocsHistory();

  return (to: string, options?: NavigateOptions) => {
    history.push({
      fromPath: location.pathname,
      toPath: to,
      scrollTo: options?.scrollTo,
      fromLabel: document.title,
      sectionLabel: options?.backTo?.hookLabel,
      timestamp: Date.now(),
    });

    navigate(to, {
      replace: options?.replace,
      state: {
        ...location.state,
        scrollTo: options?.scrollTo,
        backTo: options?.backTo ?? null,
      },
    });
  };
}
