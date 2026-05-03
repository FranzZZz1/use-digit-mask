import { type RefObject, useCallback, useMemo, useRef } from 'react';

export type CaretManager = {
  setCaret: (pos: number) => void;
  cleanup: () => void;
  pendingDigitsRef: RefObject<number | null>;
};

export function useCaretManager(inputRef: RefObject<HTMLInputElement | null>): CaretManager {
  const rafIdRef = useRef<number | null>(null);
  const pendingDigitsRef = useRef<number | null>(null);

  const setCaret = useCallback(
    (pos: number) => {
      const el = inputRef.current;
      if (!el) return;

      if (typeof requestAnimationFrame !== 'undefined') {
        if (rafIdRef.current != null) {
          cancelAnimationFrame(rafIdRef.current);
        }

        rafIdRef.current = requestAnimationFrame(() => {
          try {
            if (!el.isConnected) return;
            const safePos = Math.max(0, Math.min(pos, el.value.length));
            el.setSelectionRange(safePos, safePos);
          } catch (e) {
            console.error(e);
          }
        });
      } else {
        try {
          const safePos = Math.max(0, Math.min(pos, el.value.length));
          el.setSelectionRange(safePos, safePos);
        } catch (e) {
          console.error(e);
        }
      }
    },
    [inputRef],
  );

  const cleanup = useCallback(() => {
    if (typeof cancelAnimationFrame !== 'undefined' && rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  return useMemo(
    () => ({
      setCaret,
      cleanup,
      pendingDigitsRef,
    }),
    [setCaret, cleanup],
  );
}
