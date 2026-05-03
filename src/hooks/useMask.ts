import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { extractDigits } from '../utils/extractDigits';

import { useCaretManager } from './internal/useCaretManager';
import { useMaskMeta } from './internal/useMaskMeta';
import { usePrefixHandling } from './internal/usePrefixHandling';

const useIsomorphicLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

const MASK_CONFIG = {
  MASK_SLOT_DIGIT: '#',
  MASK_PLACEHOLDER_CHAR: '_',
} as const;

const { MASK_SLOT_DIGIT, MASK_PLACEHOLDER_CHAR } = MASK_CONFIG;

const isMobile = () => typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * Parsed representation of the current mask input value.
 *
 * @remarks
 * When used via `useMask` directly, `prefix` is the literal mask prefix —
 * everything before the first `#` slot (e.g. `'+7 ('` for mask `'+7 (###)...'`).
 *
 * When used via `usePhoneMask`, `prefix` is overridden with the resolved
 * phone-plan prefix (e.g. `'+7'`, `'+44'`, `'8'`) and may differ from the mask literal.
 */
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

const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(max, num));

const createCleanDigitsExtractor = (stripFn: (digits: string) => string) => (str: string) =>
  stripFn(extractDigits(str));

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

  const maskMeta = useMaskMeta(mask);

  const { allowedPrefixesDigits, stripAllowedPrefix, getVisiblePrefix } = usePrefixHandling(allowedPrefixes, maskMeta);

  const shouldActivate = useCallback(
    (digits: string) =>
      allowedPrefixes.some((prefix) => {
        const prefixDigits = extractDigits(prefix);
        return digits.startsWith(prefixDigits);
      }),
    [allowedPrefixes],
  );

  const extractCleanDigits = useMemo(() => createCleanDigitsExtractor(stripAllowedPrefix), [stripAllowedPrefix]);

  const renderSlots = useCallback(
    (cleanDigits: string) => {
      const digits = cleanDigits.slice(0, maskMeta.maxDigits);
      const outputChars: string[] = [...maskMeta.chars];

      let digitIndex = 0;
      for (let i = 0; i < maskMeta.chars.length; i += 1) {
        if (maskMeta.chars[i] === MASK_SLOT_DIGIT) {
          const digit = digits[digitIndex];
          outputChars[i] = digit ?? placeholderChar;
          digitIndex += 1;
        }
      }

      let text = outputChars.join('');

      if (trimMaskTail) {
        if (digits.length === 0) {
          text = isMaskActiveRef.current ? maskMeta.visiblePrefix : '';
        } else if (digits.length < maskMeta.maxDigits) {
          const lastSlotIdx = maskMeta.digitSlotIndexes[digits.length - 1];
          if (lastSlotIdx != null) text = text.slice(0, lastSlotIdx + 1);
        }

        if (placeholderChar) text = text.split(placeholderChar).join('');
      }

      return { text, digits } as const;
    },
    [
      maskMeta.chars,
      maskMeta.digitSlotIndexes,
      maskMeta.maxDigits,
      maskMeta.visiblePrefix,
      placeholderChar,
      trimMaskTail,
    ],
  );

  const formatDigits = useCallback(
    (digitsRaw: string) => {
      const extracted = extractDigits(digitsRaw);
      const normalized = normalize ? normalize(extracted) : extracted;
      return renderSlots(normalized);
    },
    [normalize, renderSlots],
  );

  const renderText = useCallback(
    (digits: string) => {
      if (digits.length === 0) {
        return isMaskActiveRef.current ? renderSlots('').text : '';
      }
      return renderSlots(digits).text;
    },
    [renderSlots],
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
        ? formattedWithPrefix.length > 0 && !formattedWithPrefix.includes(placeholderChar)
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

  useIsomorphicLayoutEffect(() => {
    const external = value || '';
    const cleaned = extractCleanDigits(external);

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
      caret.setCaret(getCaretPosAfterDigits(caretDigits));
      caret.pendingDigitsRef.current = null;
    }

    // rootValue намеренно исключён: эффект реагирует только на внешний value / смену маски.
  }, [value, extractCleanDigits, renderText, caret, getCaretPosAfterDigits]);

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
      const valueChanged = nextText !== rootValue;

      if (valueChanged) {
        setRootValue(nextText);
      }

      if (typeof caretDigitsOnLeft === 'number') {
        const pos = willBeEmpty ? 0 : getCaretPosAfterDigits(caretDigitsOnLeft);
        caret.setCaret(pos);
        caret.pendingDigitsRef.current = willBeEmpty ? null : caretDigitsOnLeft;
      }

      if (valueChanged) {
        onChange(nextText, getParsedValues(nextText));
      }
    },
    [caret, getCaretPosAfterDigits, getParsedValues, maskMeta.maxDigits, onChange, renderText, rootValue],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (isComposingRef.current) return;

      const input = e.target.value;
      const fullDigits = extractCleanDigits(input);

      if (!isMaskActiveRef.current && digitsRawRef.current.length === 0) {
        const rawDigits = extractDigits(input);
        const firstChar = rawDigits.charAt(0);

        if (rawDigits.length === 1 && shouldActivate(firstChar)) {
          isMaskActiveRef.current = true;
          setRootValue(formatDigits('').text);
          caret.setCaret(maskMeta.prefixLength);
          return;
        }
      }

      const cursor = e.target.selectionStart ?? input.length;
      const digitsLeft = extractCleanDigits(input.slice(0, cursor)).length;

      const normalized = normalize ? normalize(fullDigits) : fullDigits;
      applyDigits(normalized, digitsLeft);
    },
    [applyDigits, caret, extractCleanDigits, formatDigits, maskMeta.prefixLength, normalize, shouldActivate],
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
        caret.setCaret(maskMeta.prefixLength);
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

      const strippedRaw = shouldStrip ? stripAllowedPrefix(pastedDigitsRaw) : pastedDigitsRaw;
      const insertDigits = normalize ? normalize(strippedRaw) : strippedRaw;

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
          return;
        }

        if (leftStart === 0) {
          if (isMaskActiveRef.current) {
            isMaskActiveRef.current = false;
            applyDigits('');
            caret.setCaret(0);
          }
          return;
        }

        const deleteIndex = leftStart - 1;
        const next = prev.slice(0, deleteIndex) + prev.slice(deleteIndex + 1);

        applyDigits(next, deleteIndex);
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
              caret.setCaret(0);
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
        caret.setCaret(nextPos);
      }

      if (key === 'ArrowUp' || key === 'Home') {
        e.preventDefault();
        const pos = maskMeta.prefixLength;
        caret.setCaret(pos);
        return;
      }

      if (key === 'ArrowDown' || key === 'End') {
        e.preventDefault();
        const pos = getCaretPosAfterDigits(prev.length);
        caret.setCaret(pos);
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
        caret.setCaret(maskMeta.prefixLength);
      }
    },
    [caret, maskMeta.prefixLength],
  );

  const onFocus = useCallback(() => {
    if (!activateOnFocus) return;

    if (!isMaskActiveRef.current) {
      isMaskActiveRef.current = true;
      setRootValue(renderSlots(digitsRawRef.current).text);
    }

    const digitsLen = digitsRawRef.current.length;
    const pos = digitsLen > 0 ? getCaretPosAfterDigits(digitsLen) : maskMeta.prefixLength;
    caret.setCaret(pos);
  }, [activateOnFocus, caret, renderSlots, getCaretPosAfterDigits, maskMeta.prefixLength]);

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
      if (!isMobile()) {
        e.preventDefault();
      }
      if (!isMaskActiveRef.current) {
        isMaskActiveRef.current = true;
        setRootValue(formatDigits('').text);
      }
      const el = inputRef.current ?? (e.currentTarget as HTMLInputElement);
      if (!isMobile()) {
        try {
          el.focus({ preventScroll: true });
        } catch (error) {
          console.error(error);
        }
      }
      caret.setCaret(maskMeta.prefixLength);
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
