import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const MASK_CONFIG = {
  MASK_SLOT_DIGIT: '#',
  NON_DIGIT_REGEX: /\D/g,
  MASK_PLACEHOLDER_CHAR: '_',
} as const;

const { MASK_SLOT_DIGIT, NON_DIGIT_REGEX, MASK_PLACEHOLDER_CHAR } = MASK_CONFIG;

const useBrowserLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type ParsedValues = {
  prefix: string;
  rawWithPrefix: string;
  rawWithoutPrefix: string;
  formattedWithPrefix: string;
  formattedWithoutPrefix: string;
  formattedWithoutPlaceholderChars: string;
  isMaskCompleted: boolean;
};

export type UseMaskProps = {
  value: string;
  onChange: (value: string, parsed: ParsedValues) => void;
  mask: string;
  allowedPrefixes?: string[];
  placeholderChar?: string;
  normalize?: (digits: string) => string;
  activateOnFocus?: boolean;
  deactivateOnEmptyBlur?: boolean;
  trimMaskTail?: boolean;
};

const extractDigits = (str: string) => str.replace(NON_DIGIT_REGEX, '');

const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(max, num));

const createCleanDigitsExtractor = (stripFn: (digits: string) => string) => (str: string) =>
  stripFn(extractDigits(str));

type CaretManager = {
  queue: (pos: number) => void;
  setImmediate: (pos: number) => void;
  setImmediateWithRaf: (pos: number) => void;
  flush: () => void;
  cleanup: () => void;
  pendingDigitsRef: RefObject<number | null>;
};

function useCaretManager(inputRef: RefObject<HTMLInputElement | null>): CaretManager {
  const pendingRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingDigitsRef = useRef<number | null>(null);

  const setImmediate = useCallback(
    (pos: number) => {
      const el = inputRef.current;
      if (!el) return;
      try {
        if (!el.isConnected) return;
        el.setSelectionRange(pos, pos);
      } catch (error) {
        console.error(error);
      }
    },
    [inputRef],
  );

  const queue = useCallback((pos: number) => {
    pendingRef.current = pos;
  }, []);

  const flush = useCallback(() => {
    const pos = pendingRef.current;
    if (pos != null) {
      setImmediate(pos);
      pendingRef.current = null;
    }
  }, [setImmediate]);

  const cleanup = useCallback(() => {
    if (typeof cancelAnimationFrame !== 'undefined' && rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const setImmediateWithRaf = useCallback(
    (pos: number) => {
      if (typeof requestAnimationFrame !== 'undefined') {
        rafIdRef.current = requestAnimationFrame(() => {
          setImmediate(pos);
          rafIdRef.current = null;
        });
      } else {
        setImmediate(pos);
      }
    },
    [setImmediate],
  );

  return useMemo(
    () => ({ queue, setImmediate, setImmediateWithRaf, flush, cleanup, pendingDigitsRef }),
    [queue, setImmediate, setImmediateWithRaf, flush, cleanup],
  );
}

export function useMask({
  value,
  onChange,
  mask,
  allowedPrefixes = [],
  placeholderChar = MASK_PLACEHOLDER_CHAR,
  normalize,
  activateOnFocus = false,
  deactivateOnEmptyBlur = false,
  trimMaskTail = false,
}: UseMaskProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const isMaskActiveRef = useRef(false);
  const digitsRawRef = useRef<string>('');

  const caret = useCaretManager(inputRef);

  const [rootValue, setRootValue] = useState<string>('');

  const onCompositionStart = () => {
    isComposingRef.current = true;
  };

  const onCompositionEnd = () => {
    isComposingRef.current = false;
  };

  const maskMeta = useMemo(() => {
    const chars = [...mask];
    const digitSlotIndexes: number[] = [];
    let prefixLength = 0;
    let metDigit = false;

    chars.forEach((char, idx) => {
      if (char === MASK_SLOT_DIGIT) {
        digitSlotIndexes.push(idx);
        metDigit = true;
      } else if (!metDigit) {
        prefixLength += 1;
      }
    });

    const visiblePrefix = mask.slice(0, prefixLength);

    return {
      chars,
      digitSlotIndexes,
      maxDigits: digitSlotIndexes.length,
      prefixLength,
      visiblePrefix,
      visiblePrefixDigits: extractDigits(visiblePrefix),
      maskLength: mask.length,
    } as const;
  }, [mask]);

  const allowedPrefixesDigits = useMemo(() => {
    const base = allowedPrefixes.length > 0 ? allowedPrefixes : [maskMeta.visiblePrefix];
    return base.map((prefix) => extractDigits(prefix)).filter(Boolean);
  }, [allowedPrefixes, maskMeta.visiblePrefix]);

  const activationCharSet = useMemo(() => {
    const starters: string[] = [];
    if (maskMeta.visiblePrefix) starters.push(maskMeta.visiblePrefix.charAt(0));
    allowedPrefixes.forEach((prefix) => {
      const char = prefix.charAt(0);
      if (char) starters.push(char);
    });
    return new Set(starters);
  }, [allowedPrefixes, maskMeta.visiblePrefix]);

  const stripAllowedPrefix = useCallback(
    (digits: string) => {
      if (allowedPrefixesDigits.length === 0) return digits;
      const match = allowedPrefixesDigits.find((prefixDigits) => prefixDigits && digits.startsWith(prefixDigits));
      return match ? digits.slice(match.length) : digits;
    },
    [allowedPrefixesDigits],
  );

  const extractCleanDigits = useMemo(() => createCleanDigitsExtractor(stripAllowedPrefix), [stripAllowedPrefix]);

  const getVisiblePrefix = useCallback(
    (rawInput: string) => {
      const fromAllowed = allowedPrefixes.find((prefix) => rawInput.startsWith(prefix));
      if (fromAllowed) return fromAllowed;
      return rawInput.startsWith(maskMeta.visiblePrefix) ? maskMeta.visiblePrefix : '';
    },
    [allowedPrefixes, maskMeta.visiblePrefix],
  );

  const formatDigits = useCallback(
    (digitsRaw: string) => {
      const cleaned = (normalize ? normalize(extractDigits(digitsRaw)) : extractDigits(digitsRaw)).slice(
        0,
        maskMeta.maxDigits,
      );
      const outputChars: string[] = [...maskMeta.chars];

      let digitIndex = 0;
      for (let i = 0; i < maskMeta.chars.length; i += 1) {
        if (maskMeta.chars[i] === MASK_SLOT_DIGIT) {
          const digit = cleaned[digitIndex];
          outputChars[i] = digit ?? placeholderChar;
          digitIndex += 1;
        }
      }

      let text = outputChars.join('');

      if (trimMaskTail) {
        if (cleaned.length === 0) {
          text = isMaskActiveRef.current ? maskMeta.visiblePrefix : '';
        } else if (cleaned.length < maskMeta.maxDigits) {
          const lastSlotIdx = maskMeta.digitSlotIndexes[cleaned.length - 1];
          if (lastSlotIdx != null) text = text.slice(0, lastSlotIdx + 1);
        }

        if (placeholderChar) text = text.split(placeholderChar).join('');
      }

      return { text, digits: cleaned } as const;
    },
    [
      maskMeta.chars,
      maskMeta.digitSlotIndexes,
      maskMeta.maxDigits,
      maskMeta.visiblePrefix,
      normalize,
      placeholderChar,
      trimMaskTail,
    ],
  );

  const renderText = useCallback(
    (digits: string) => {
      if (digits.length === 0) {
        return isMaskActiveRef.current ? formatDigits('').text : '';
      }
      return formatDigits(digits).text;
    },
    [formatDigits],
  );

  const getCaretPosAfterDigits = useCallback(
    (count: number) => {
      if (count <= 0) return maskMeta.prefixLength;
      const clampedDigitIndex = clamp(count - 1, 0, Math.max(0, maskMeta.maxDigits - 1));
      const slotPosition = maskMeta.digitSlotIndexes[clampedDigitIndex];
      return slotPosition != null
        ? clamp(slotPosition + 1, maskMeta.prefixLength, maskMeta.maskLength)
        : maskMeta.prefixLength;
    },
    [maskMeta],
  );

  const allowedCaretPositions = useMemo(() => {
    const positionsList = [maskMeta.prefixLength, ...maskMeta.digitSlotIndexes.map((idx) => idx + 1)];
    return Array.from(new Set(positionsList)).sort((a, b) => a - b);
  }, [maskMeta.prefixLength, maskMeta.digitSlotIndexes]);

  const getPrevCaretPos = useCallback(
    (pos: number): number => {
      for (let i = allowedCaretPositions.length - 1; i >= 0; i -= 1) {
        const candidatePosition = allowedCaretPositions[i];
        if (candidatePosition !== undefined && candidatePosition < pos) return candidatePosition;
      }
      return allowedCaretPositions[0] ?? maskMeta.prefixLength;
    },
    [allowedCaretPositions, maskMeta.prefixLength],
  );

  const getNextCaretPos = useCallback(
    (pos: number): number => {
      for (let i = 0; i < allowedCaretPositions.length; i += 1) {
        const candidatePosition = allowedCaretPositions[i];
        if (candidatePosition !== undefined && candidatePosition > pos) return candidatePosition;
      }
      return allowedCaretPositions[allowedCaretPositions.length - 1] ?? maskMeta.maskLength;
    },
    [allowedCaretPositions, maskMeta.maskLength],
  );

  const getParsedValues = useCallback(
    (formattedParam?: string): ParsedValues => {
      const formattedWithPrefix = formattedParam ?? rootValue;
      const actualPrefix = getVisiblePrefix(formattedWithPrefix);

      const sliceStart = actualPrefix.length;
      const formattedWithoutPrefixRaw = formattedWithPrefix.slice(sliceStart);
      const formattedWithoutPrefix = formattedWithoutPrefixRaw.replace(/^\s+/, '');

      const digitsOnly = extractDigits(formattedWithPrefix);

      const rawWithoutPrefix = stripAllowedPrefix(digitsOnly);
      const rawWithPrefix = actualPrefix + rawWithoutPrefix;

      const formattedWithoutPlaceholderChars = (() => {
        if (rawWithoutPrefix.length === 0) return actualPrefix || '';
        if (rawWithoutPrefix.length >= maskMeta.maxDigits) return formattedWithPrefix;
        const lastFilledSlot = maskMeta.digitSlotIndexes[rawWithoutPrefix.length - 1];
        return lastFilledSlot != null ? formattedWithPrefix.slice(0, lastFilledSlot + 1) : actualPrefix || '';
      })();

      const hasPlaceholderChar = Boolean(placeholderChar && placeholderChar.length > 0);

      const completedByLength = rawWithoutPrefix.length === maskMeta.maxDigits;
      const completedByPlaceholder = hasPlaceholderChar
        ? !formattedWithPrefix.includes(placeholderChar)
        : completedByLength;

      const isMaskCompleted = trimMaskTail ? completedByLength : completedByPlaceholder;

      return {
        prefix: actualPrefix,
        rawWithPrefix,
        rawWithoutPrefix,
        formattedWithPrefix,
        formattedWithoutPrefix,
        formattedWithoutPlaceholderChars,
        isMaskCompleted,
      };
    },
    [
      getVisiblePrefix,
      maskMeta.digitSlotIndexes,
      maskMeta.maxDigits,
      placeholderChar,
      rootValue,
      stripAllowedPrefix,
      trimMaskTail,
    ],
  );

  useEffect(() => {
    const external = value || '';
    const digitsOnly = extractCleanDigits(external);
    const cleaned = normalize ? normalize(digitsOnly) : digitsOnly;

    const nextText = renderText(cleaned);

    if (nextText === rootValue) return;

    digitsRawRef.current = cleaned;
    setRootValue(nextText);

    if (cleaned.length === 0) {
      isMaskActiveRef.current = false;
      caret.pendingDigitsRef.current = null;
    } else {
      const logicalPos = caret.pendingDigitsRef.current;
      const caretDigits = logicalPos != null ? Math.min(logicalPos, cleaned.length) : cleaned.length;
      caret.queue(getCaretPosAfterDigits(caretDigits));
      caret.pendingDigitsRef.current = null;
    }

    // rootValue намеренно исключён: эффект реагирует только на внешний value,
    // добавление rootValue приведёт к лишним перезапускам после setRootValue внутри.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, extractCleanDigits, normalize, renderText, caret, getCaretPosAfterDigits]);

  useBrowserLayoutEffect(() => {
    caret.flush();
  });

  useEffect(
    () => () => {
      caret.cleanup();
    },
    [caret],
  );

  const applyDigits = useCallback(
    (nextDigits: string, caretDigitsOnLeft?: number) => {
      const clampedDigits = nextDigits.slice(0, maskMeta.maxDigits);
      const willBeEmpty = clampedDigits.length === 0;

      if (willBeEmpty) {
        isMaskActiveRef.current = false;
      }

      digitsRawRef.current = clampedDigits;
      const nextText = renderText(clampedDigits);
      setRootValue(nextText);

      if (typeof caretDigitsOnLeft === 'number') {
        caret.pendingDigitsRef.current = caretDigitsOnLeft;
        const pos = willBeEmpty ? 0 : getCaretPosAfterDigits(caretDigitsOnLeft);

        if (nextText === rootValue) {
          caret.setImmediateWithRaf(pos);
        }

        caret.queue(pos);
      }

      onChange(nextText, getParsedValues(nextText));
    },
    [caret, getCaretPosAfterDigits, getParsedValues, maskMeta.maxDigits, onChange, renderText, rootValue],
  );

  const handleOvertypeInsert = useCallback(
    (input: string, cursor: number, prev: string, digitsLeft: number) => {
      const inserted = extractCleanDigits(input.slice(0, cursor)).slice(-1);
      if (!inserted) {
        caret.queue(getCaretPosAfterDigits(digitsLeft));
        return;
      }
      const insertionIndex = clamp(digitsLeft - 1, 0, maskMeta.maxDigits - 1);
      const mergedDigits = (prev.slice(0, insertionIndex) + inserted + prev.slice(insertionIndex)).slice(
        0,
        maskMeta.maxDigits,
      );
      applyDigits(mergedDigits, insertionIndex + 1);
    },
    [applyDigits, caret, extractCleanDigits, getCaretPosAfterDigits, maskMeta.maxDigits],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (isComposingRef.current) return;

      const input = e.target.value;
      const cursor = e.target.selectionStart ?? input.length;

      const prev = digitsRawRef.current;

      if (!isMaskActiveRef.current && prev.length === 0) {
        const singleChar = input.length === 1 ? input : '';

        if (singleChar && activationCharSet.has(singleChar)) {
          isMaskActiveRef.current = true;
          const { text } = formatDigits('');
          setRootValue(text);
          caret.queue(maskMeta.prefixLength);
          return;
        }
      }

      const digitsLeft = extractCleanDigits(input.slice(0, cursor)).length;
      const fullDigits = extractCleanDigits(input);
      const normalized = normalize ? normalize(fullDigits) : fullDigits;

      if (normalized.length > maskMeta.maxDigits && cursor === input.length) {
        caret.queue(getCaretPosAfterDigits(prev.length));
        setRootValue(renderText(prev));
        return;
      }

      if (normalized.length > maskMeta.maxDigits && cursor !== input.length) {
        handleOvertypeInsert(input, cursor, prev, digitsLeft);
        return;
      }

      applyDigits(normalized, digitsLeft);
    },
    [
      activationCharSet,
      applyDigits,
      caret,
      extractCleanDigits,
      formatDigits,
      getCaretPosAfterDigits,
      handleOvertypeInsert,
      maskMeta.maxDigits,
      maskMeta.prefixLength,
      normalize,
      renderText,
    ],
  );

  const isPrefixOnlyPaste = useCallback(
    (pasted: string, pastedDigitsRaw: string): boolean => {
      const trimmed = pasted.trim();
      const visibleEq = maskMeta.visiblePrefix ? trimmed === maskMeta.visiblePrefix.trim() : false;
      const allowedEq = allowedPrefixes.some((prefix) => trimmed === prefix.trim());
      const digitsEq = allowedPrefixesDigits.some((prefixDigits) => prefixDigits && pastedDigitsRaw === prefixDigits);
      return visibleEq || allowedEq || digitsEq;
    },
    [allowedPrefixes, allowedPrefixesDigits, maskMeta.visiblePrefix],
  );

  const shouldStripPastedPrefix = useCallback(
    (
      pasted: string,
      pastedDigitsRaw: string,
      insertingAtStart: boolean,
      replacingAllDigits: boolean,
      isPrefixOnly: boolean,
    ): boolean => {
      const startsWithVisibleOrDigitsPrefix =
        allowedPrefixes.some((prefix) => pasted.startsWith(prefix)) ||
        (maskMeta.visiblePrefix ? pasted.startsWith(maskMeta.visiblePrefix) : false) ||
        allowedPrefixesDigits.some((digits) => digits && pastedDigitsRaw.startsWith(digits));

      const skipPrefixStripOnce = isMaskActiveRef.current && isPrefixOnly;

      return (
        !skipPrefixStripOnce &&
        insertingAtStart &&
        replacingAllDigits &&
        (startsWithVisibleOrDigitsPrefix || pastedDigitsRaw.length > maskMeta.maxDigits)
      );
    },
    [allowedPrefixes, allowedPrefixesDigits, maskMeta.maxDigits, maskMeta.visiblePrefix],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      const selectionStart = e.currentTarget.selectionStart ?? maskMeta.prefixLength;
      const selectionEnd = e.currentTarget.selectionEnd ?? selectionStart;

      const leftDigitsStart = extractCleanDigits(rootValue.slice(0, selectionStart)).length;
      const leftDigitsEnd = extractCleanDigits(rootValue.slice(0, selectionEnd)).length;

      const pasted = e.clipboardData.getData('text');
      const pastedDigitsRaw = extractDigits(pasted);

      const prev = digitsRawRef.current;

      const insertingAtStart = leftDigitsStart === 0;
      const replacingAllDigits = prev.length === 0 || (insertingAtStart && leftDigitsEnd >= prev.length);

      const prefixOnly = isPrefixOnlyPaste(pasted, pastedDigitsRaw);

      if (insertingAtStart && replacingAllDigits && prefixOnly && !isMaskActiveRef.current) {
        isMaskActiveRef.current = true;
        digitsRawRef.current = '';
        const { text } = formatDigits('');
        setRootValue(text);
        caret.queue(maskMeta.prefixLength);
        caret.setImmediate(maskMeta.prefixLength);
        onChange(text, getParsedValues(text));
        return;
      }

      const shouldStrip = shouldStripPastedPrefix(
        pasted,
        pastedDigitsRaw,
        insertingAtStart,
        replacingAllDigits,
        prefixOnly,
      );

      const insertDigitsRaw = shouldStrip ? stripAllowedPrefix(pastedDigitsRaw) : pastedDigitsRaw;
      const insertDigits = normalize ? normalize(insertDigitsRaw) : insertDigitsRaw;

      const nextRaw = prev.slice(0, leftDigitsStart) + insertDigits + prev.slice(leftDigitsEnd);
      const next = nextRaw.slice(0, maskMeta.maxDigits);
      const newLeft = Math.min(leftDigitsStart + insertDigits.length, maskMeta.maxDigits);

      applyDigits(next, newLeft);
    },
    [
      applyDigits,
      caret,
      extractCleanDigits,
      formatDigits,
      getParsedValues,
      isPrefixOnlyPaste,
      maskMeta.maxDigits,
      maskMeta.prefixLength,
      normalize,
      onChange,
      rootValue,
      shouldStripPastedPrefix,
      stripAllowedPrefix,
    ],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const { key } = e;
      const selectionStart = e.currentTarget.selectionStart ?? maskMeta.prefixLength;
      const selectionEnd = e.currentTarget.selectionEnd ?? selectionStart;
      const prev = digitsRawRef.current;

      const leftStart = extractCleanDigits(rootValue.slice(0, selectionStart)).length;
      const leftEnd = extractCleanDigits(rootValue.slice(0, selectionEnd)).length;

      if (key === 'Backspace') {
        e.preventDefault();
        if (leftStart !== leftEnd) {
          const next = prev.slice(0, leftStart) + prev.slice(leftEnd);
          applyDigits(next, leftStart);
        } else {
          if (leftStart === 0) {
            if (isMaskActiveRef.current) {
              isMaskActiveRef.current = false;
              applyDigits('');
              caret.queue(0);
              return;
            }
            return;
          }
          const deleteIndex = leftStart - 1;
          const next = prev.slice(0, deleteIndex) + prev.slice(deleteIndex + 1);
          applyDigits(next, deleteIndex);
        }
        return;
      }

      if (key === 'Delete') {
        e.preventDefault();
        if (leftStart !== leftEnd) {
          const next = prev.slice(0, leftStart) + prev.slice(leftEnd);
          applyDigits(next, leftStart);
        } else {
          if (leftStart >= prev.length) {
            if (isMaskActiveRef.current && prev.length === 0) {
              isMaskActiveRef.current = false;
              applyDigits('');
              caret.queue(0);
            }
            return;
          }
          const next = prev.slice(0, leftStart) + prev.slice(leftStart + 1);
          applyDigits(next, leftStart);
        }
        return;
      }

      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        e.preventDefault();
        const selectionPos = key === 'ArrowLeft' ? selectionStart : selectionEnd;
        const currentPos = clamp(selectionPos, maskMeta.prefixLength, maskMeta.maskLength);
        const nextPos = key === 'ArrowLeft' ? getPrevCaretPos(currentPos) : getNextCaretPos(currentPos);
        caret.queue(nextPos);
        caret.setImmediate(nextPos);
      }

      if (key === 'ArrowUp' || key === 'Home') {
        e.preventDefault();
        const pos = maskMeta.prefixLength;
        caret.queue(pos);
        caret.setImmediate(pos);
        return;
      }

      if (key === 'ArrowDown' || key === 'End') {
        e.preventDefault();
        const pos = getCaretPosAfterDigits(prev.length);
        caret.queue(pos);
        caret.setImmediate(pos);
      }
    },
    [
      applyDigits,
      caret,
      extractCleanDigits,
      getCaretPosAfterDigits,
      getNextCaretPos,
      getPrevCaretPos,
      maskMeta.maskLength,
      maskMeta.prefixLength,
      rootValue,
    ],
  );

  const handleClick = useCallback(
    (e: MouseEvent<HTMLInputElement>) => {
      const start = e.currentTarget.selectionStart ?? 0;
      const end = e.currentTarget.selectionEnd ?? start;
      if (start !== end) return;

      if (start < maskMeta.prefixLength) {
        e.preventDefault();
        caret.queue(maskMeta.prefixLength);
        caret.setImmediate(maskMeta.prefixLength);
      }
    },
    [caret, maskMeta.prefixLength],
  );

  const onFocus = useCallback(() => {
    if (!activateOnFocus) return;

    if (!isMaskActiveRef.current) {
      isMaskActiveRef.current = true;
      setRootValue(formatDigits(digitsRawRef.current).text);
    }

    const digitsLen = digitsRawRef.current.length;
    const pos = digitsLen > 0 ? getCaretPosAfterDigits(digitsLen) : maskMeta.prefixLength;
    caret.queue(pos);
    caret.setImmediate(pos);
  }, [activateOnFocus, caret, formatDigits, getCaretPosAfterDigits, maskMeta.prefixLength]);

  const onBlur = useCallback(() => {
    if (!deactivateOnEmptyBlur) return;

    if (digitsRawRef.current.length === 0) {
      isMaskActiveRef.current = false;
      setRootValue('');
    }
  }, [deactivateOnEmptyBlur]);

  const onMouseDown = useCallback(
    (e: MouseEvent<HTMLInputElement>) => {
      if (!activateOnFocus) return;

      if (digitsRawRef.current.length !== 0) return;

      e.preventDefault();

      if (!isMaskActiveRef.current) {
        isMaskActiveRef.current = true;
        setRootValue(formatDigits('').text);
      }

      const el = inputRef.current ?? (e.currentTarget as HTMLInputElement);
      try {
        el.focus({ preventScroll: true });
      } catch (error) {
        console.error(error);
      }

      caret.queue(maskMeta.prefixLength);
      caret.setImmediate(maskMeta.prefixLength);
    },
    [activateOnFocus, caret, formatDigits, maskMeta.prefixLength],
  );

  const props = {
    value: rootValue,
    ref: inputRef,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onPaste: handlePaste,
    onClick: handleClick,
    onFocus,
    onBlur,
    onMouseDown,
    onCompositionStart,
    onCompositionEnd,
  };

  const api = {
    formatDigits,
    getParsedValues,
  };

  return { props, api } as const;
}
