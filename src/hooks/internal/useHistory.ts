import { useCallback, useRef, useState } from 'react';

type HistoryEntry = { digits: string };

export type UseHistoryOptions = {
  /** Ref holding the current raw digits. Read before each mutation, updated after. */
  digitsRawRef: { current: string };
  /** Max number of digit slots in the mask — used to clamp before equality check. */
  maxDigits: number;
  /** Maximum number of undo/redo steps kept in memory. */
  historyLimit: number;
  /**
   * The core apply-digits function: mutates `digitsRawRef`, updates rendered state,
   * fires `onChange`. Called directly by `undo`/`redo` — no history side-effects.
   */
  applyCore: (digits: string, caretDigitsOnLeft: number) => void;
};

export type UseHistoryResult = {
  /**
   * Must be called with `nextDigits` **before** each mutation to snapshot the
   * current state into the undo stack. No-op when the value wouldn't change.
   */
  push: (nextDigits: string) => void;
  /** Clears both stacks. Call when value is reset externally (programmatic reset, mask change). */
  clear: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export function useHistory({ digitsRawRef, maxDigits, historyLimit, applyCore }: UseHistoryOptions): UseHistoryResult {
  const undoStackRef = useRef<HistoryEntry[]>([]);
  const redoStackRef = useRef<HistoryEntry[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const push = useCallback(
    (nextDigits: string) => {
      // Skip if the value won't actually change after clamping
      if (nextDigits.slice(0, maxDigits) === digitsRawRef.current) return;
      const nextStack = [...undoStackRef.current, { digits: digitsRawRef.current }];
      undoStackRef.current = nextStack.length > historyLimit ? nextStack.slice(-historyLimit) : nextStack;
      redoStackRef.current = [];
      setCanUndo(true);
      setCanRedo(false);
    },
    [digitsRawRef, historyLimit, maxDigits],
  );

  const clear = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const entry = undoStackRef.current[undoStackRef.current.length - 1];
    redoStackRef.current = [...redoStackRef.current, { digits: digitsRawRef.current }];
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    applyCore(entry.digits, entry.digits.length);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  }, [applyCore, digitsRawRef]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const entry = redoStackRef.current[redoStackRef.current.length - 1];
    undoStackRef.current = [...undoStackRef.current, { digits: digitsRawRef.current }];
    redoStackRef.current = redoStackRef.current.slice(0, -1);
    applyCore(entry.digits, entry.digits.length);
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
  }, [applyCore, digitsRawRef]);

  return { push, clear, undo, redo, canUndo, canRedo };
}
