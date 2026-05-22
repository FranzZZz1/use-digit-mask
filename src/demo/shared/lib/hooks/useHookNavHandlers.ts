import { type MouseEvent, useMemo, useRef } from 'react';

import { useDocsNavigate } from '@/shared/lib';
import { HOOKS } from '@/widgets/docs-layout';

export function useHookNavHandlers(
  currentPath: string | undefined,
  onSamePath?: () => void,
): ((e: MouseEvent<HTMLAnchorElement>) => void)[] {
  const navigate = useDocsNavigate();

  const currentPathRef = useRef(currentPath);
  currentPathRef.current = currentPath;

  const onSamePathRef = useRef(onSamePath);
  onSamePathRef.current = onSamePath;

  return useMemo(
    () =>
      HOOKS.map(({ path, examplesPath }) => (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (currentPathRef.current === path || currentPathRef.current === examplesPath) {
          onSamePathRef.current?.();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate(path);
        }
      }),
    [navigate],
  );
}
