import { type RefObject, useCallback, useMemo, useRef } from 'react';

import { clamp } from '../../utils/clamp';

export type CaretManager = {
  setCaret: (pos: number) => void;
  setSelection: (anchor: number, focus: number) => void;
  cleanup: () => void;
  pendingDigitsRef: RefObject<number | null>;
};

export function useCaretManager(inputRef: RefObject<HTMLInputElement | null>): CaretManager {
  const rafIdRef = useRef<number | null>(null);
  const pendingDigitsRef = useRef<number | null>(null);

  const setSelection = useCallback(
    (anchor: number, focus: number) => {
      const el = inputRef.current;
      if (!el) return;

      const apply = () => {
        try {
          if (!el.isConnected) return;
          const len = el.value.length;
          const safeAnchor = clamp(anchor, 0, len);
          const safeFocus = clamp(focus, 0, len);
          const start = Math.min(safeAnchor, safeFocus);
          const end = Math.max(safeAnchor, safeFocus);
          const direction = safeFocus >= safeAnchor ? 'forward' : 'backward';
          el.setSelectionRange(start, end, direction);
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') console.error(e);
        }
      };

      if (typeof requestAnimationFrame !== 'undefined') {
        if (rafIdRef.current != null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(apply);
      } else {
        apply();
      }
    },
    [inputRef],
  );

  const setCaret = useCallback(
    (pos: number) => {
      setSelection(pos, pos);
    },
    [setSelection],
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
      setSelection,
      cleanup,
      pendingDigitsRef,
    }),
    [setCaret, setSelection, cleanup],
  );
}
