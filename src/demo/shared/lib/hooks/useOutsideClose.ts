import { type RefObject, useEffect } from 'react';

/**
 * Closes a panel when the user presses Escape or clicks outside all provided refs.
 * Only attaches listeners while `isOpen` is true.
 */
export function useOutsideClose(isOpen: boolean, close: () => void, refs: RefObject<Element | null>[]): void {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideAny = refs.some((r) => r.current?.contains(target));
      if (!isInsideAny) close();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, close]);
}
