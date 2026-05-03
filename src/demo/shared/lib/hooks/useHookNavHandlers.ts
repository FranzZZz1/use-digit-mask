import { type MouseEvent, useMemo, useRef } from 'react';

import { useDocsNavigate } from '@/shared/lib';
import { HOOKS } from '@/widgets/docs-layout';

/**
 * Returns stable click handlers for hook navigation links.
 * Prevents default, scrolls to top when already on the same page,
 * otherwise navigates. Optionally calls `onSamePath` (e.g. to close a menu).
 */
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
      HOOKS.map(({ path }) => (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (currentPathRef.current === path) {
          onSamePathRef.current?.();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate(path);
        }
      }),
    [navigate],
  );
}
