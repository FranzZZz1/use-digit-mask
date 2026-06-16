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

import { clamp } from '../utils/clamp';
import { extractDigits } from '../utils/extractDigits';
import { fillSlots } from '../utils/fillSlots';

import { resolveNamedMask } from './internal/applyBlocks';
import { resolveBypassMask, resolveBypassMaskExit, stripMaskFormatting } from './internal/bypassMask';
import { resolveChange } from './internal/resolveChange';
import { resolvePaste } from './internal/resolvePaste';
import { useBlocksNormalize } from './internal/useBlocksNormalize';
import { useCaretManager } from './internal/useCaretManager';
import { useCaretPositions } from './internal/useCaretPositions';
import { useHistory } from './internal/useHistory';
import { useMaskMeta } from './internal/useMaskMeta';
import { usePrefixHandling } from './internal/usePrefixHandling';
import { type ParsedValues, type UseMaskProps } from './types';

const useIsomorphicLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

const MASK_PLACEHOLDER_CHAR = '_';

const EMPTY_PREFIX_ALIASES: string[] = [];

const isMobile = () => typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const createCleanDigitsExtractor = (stripFn: (digits: string) => string) => (str: string) =>
  stripFn(extractDigits(str));

export function useMask({
  value,
  onChange,
  onComplete,
  mask,
  prefixAliases,
  allowedPrefixes,
  placeholderChar = MASK_PLACEHOLDER_CHAR,
  normalize: normalizeProp,
  blocks,
  activateOnFocus = false,
  deactivateOnEmptyBlur = false,
  trimMaskTail = false,
  ghostChar,
  alwaysActive = false,
  historyLimit = 100,
  pasteStripPrefix = 'overflow',
  overwrite = false,
  inputMode,
  bypassMask = false,
}: UseMaskProps) {
  const resolvedPrefixAliases = prefixAliases ?? allowedPrefixes ?? EMPTY_PREFIX_ALIASES;

  const inputRef = useRef<HTMLInputElement>(null);
  const isMaskActiveRef = useRef(alwaysActive);
  const prevAlwaysActiveRef = useRef(alwaysActive);
  const digitsRawRef = useRef<string>('');
  const isApplyingCoreRef = useRef(false);

  const caret = useCaretManager(inputRef);

  const rawMaskString = typeof mask === 'function' ? mask(digitsRawRef.current) : mask;
  const [resolvedMaskString, groupOrder, blockDigitStarts] = useMemo(() => {
    if (blocks == null || Array.isArray(blocks)) return [rawMaskString, [] as string[], [] as number[]] as const;
    const {
      resolvedMask,
      groupOrder: namedGroupOrder,
      blockDigitStarts: bds,
    } = resolveNamedMask(rawMaskString, Object.keys(blocks as Record<string, unknown>));
    return [resolvedMask, namedGroupOrder, bds] as const;
  }, [rawMaskString, blocks]);

  const maskMeta = useMaskMeta(resolvedMaskString);

  const { normalize, computeBlockValues, computeNamedBlockValues } = useBlocksNormalize(
    blocks,
    groupOrder,
    blockDigitStarts,
    maskMeta,
    normalizeProp,
  );

  const { allowedPrefixesDigits, stripVisiblePrefix, startsWithAllowedPrefix, stripAllowedPrefix, getVisiblePrefix } =
    usePrefixHandling(resolvedPrefixAliases, maskMeta);

  const { getCaretPosAfterDigits, getPrevCaretPos, getNextCaretPos, getPrevGroupBoundary, getNextGroupBoundary } =
    useCaretPositions(maskMeta);

  const extractFormattedDigits = useMemo(() => createCleanDigitsExtractor(stripVisiblePrefix), [stripVisiblePrefix]);

  const renderSlots = useCallback(
    (cleanDigits: string) => {
      const digits = cleanDigits.slice(0, maskMeta.maxDigits);
      let text = fillSlots(maskMeta.chars, digits, placeholderChar);

      if (trimMaskTail) {
        if (digits.length === 0) {
          text = isMaskActiveRef.current ? maskMeta.visiblePrefix : '';
        } else if (digits.length < maskMeta.maxDigits) {
          const lastSlotIdx = maskMeta.digitSlotIndexes[digits.length - 1];
          if (lastSlotIdx != null) text = text.slice(0, lastSlotIdx + 1);
        }

        if (placeholderChar) text = text.split(placeholderChar).join('');
      }

      return { text, digits };
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

  const renderGhost = useCallback(
    (digits: string): string =>
      fillSlots(maskMeta.chars, digits.slice(0, maskMeta.maxDigits), ghostChar ?? placeholderChar),
    [ghostChar, maskMeta.chars, maskMeta.maxDigits, placeholderChar],
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

  // Lazy-инициализация: на маунте сразу форматируем внешний value, чтобы
  // SSR/первая отрисовка показывали значение, а не пустую строку.
  // normalize применяем и здесь (симметрично эффекту), иначе SSR-разметка и
  // первый клиентский рендер с normalize расходились бы.
  const [rootValue, setRootValue] = useState<string>(() => {
    const initialValue = value || '';
    if (resolveBypassMask(bypassMask, initialValue)) return initialValue;
    const init = extractFormattedDigits(initialValue);
    return renderText(normalize && init ? normalize(init) : init);
  });

  const rootValueRef = useRef(rootValue);
  rootValueRef.current = rootValue;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const prevIsMaskCompletedRef = useRef(false);

  const getParsedValues = useCallback(
    (formattedParam?: string): ParsedValues => {
      const formattedWithPrefix = formattedParam ?? rootValueRef.current;

      if (resolveBypassMask(bypassMask, formattedWithPrefix)) {
        return {
          prefix: '',
          rawWithPrefix: formattedWithPrefix,
          rawWithoutPrefix: formattedWithPrefix,
          formattedWithPrefix,
          formattedWithoutPrefix: formattedWithPrefix,
          formattedWithoutPlaceholderChars: formattedWithPrefix,
          isMaskCompleted: false,
          blockValues: [],
          namedBlockValues: {},
        };
      }

      const actualPrefix = getVisiblePrefix(formattedWithPrefix);

      const literalPrefix = formattedWithPrefix.startsWith(maskMeta.visiblePrefix) ? maskMeta.visiblePrefix : '';

      const formattedWithoutPrefixRaw = formattedWithPrefix.slice(maskMeta.prefixLength);
      const formattedWithoutPrefix = formattedWithoutPrefixRaw.replace(/^\s+/, '');

      const digitsOnly = extractDigits(formattedWithPrefix);

      const rawWithoutPrefix = stripVisiblePrefix(digitsOnly);
      const rawWithPrefix = actualPrefix + rawWithoutPrefix;

      const formattedWithoutPlaceholderChars = (() => {
        if (rawWithoutPrefix.length === 0) return literalPrefix;
        if (rawWithoutPrefix.length >= maskMeta.maxDigits) return formattedWithPrefix;
        const lastFilledSlot = maskMeta.digitSlotIndexes[rawWithoutPrefix.length - 1];
        return lastFilledSlot != null ? formattedWithPrefix.slice(0, lastFilledSlot + 1) : literalPrefix;
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
        blockValues: computeBlockValues(rawWithoutPrefix),
        namedBlockValues: computeNamedBlockValues ? computeNamedBlockValues(rawWithoutPrefix) : {},
      };
    },
    [
      bypassMask,
      computeBlockValues,
      computeNamedBlockValues,
      getVisiblePrefix,
      maskMeta.digitSlotIndexes,
      maskMeta.maxDigits,
      maskMeta.prefixLength,
      maskMeta.visiblePrefix,
      placeholderChar,
      stripVisiblePrefix,
      trimMaskTail,
    ],
  );

  const applyDigitsCore = useCallback(
    (nextDigits: string, caretDigitsOnLeft?: number) => {
      const clampedDigits = nextDigits.slice(0, maskMeta.maxDigits);

      const willBeEmpty = clampedDigits.length === 0;
      if (willBeEmpty && !alwaysActive) {
        isMaskActiveRef.current = false;
      }

      digitsRawRef.current = clampedDigits;

      const nextText = renderText(clampedDigits);
      const valueChanged = nextText !== rootValueRef.current;

      if (valueChanged) {
        setRootValue(nextText);
      }

      if (typeof caretDigitsOnLeft === 'number') {
        let pos: number;
        if (!willBeEmpty) {
          pos = getCaretPosAfterDigits(caretDigitsOnLeft);
        } else if (alwaysActive) {
          pos = maskMeta.prefixLength;
        } else {
          pos = 0;
        }
        caret.setCaret(pos);
        caret.pendingDigitsRef.current = willBeEmpty ? null : caretDigitsOnLeft;
      }

      if (valueChanged) {
        // При alwaysActive с пустым значением отправляем '' в onChange.
        const reportText = alwaysActive && willBeEmpty ? '' : nextText;
        // Следующий вызов layoutEffect - ответ на наш собственный onChange,
        // а не внешнее изменение value. Это предотвращает ложный historyClear().
        isApplyingCoreRef.current = true;
        const parsed = getParsedValues(reportText);
        onChangeRef.current(reportText, parsed);
        if (parsed.isMaskCompleted && !prevIsMaskCompletedRef.current) {
          onCompleteRef.current?.(parsed);
        }
        prevIsMaskCompletedRef.current = parsed.isMaskCompleted;
      }
    },
    [
      alwaysActive,
      caret,
      getCaretPosAfterDigits,
      getParsedValues,
      maskMeta.maxDigits,
      maskMeta.prefixLength,
      renderText,
    ],
  );

  const {
    push: historyPush,
    clear: historyClear,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory({
    digitsRawRef,
    maxDigits: maskMeta.maxDigits,
    historyLimit,
    applyCore: applyDigitsCore,
  });

  const applyDigits = useCallback(
    (nextDigits: string, caretDigitsOnLeft?: number) => {
      historyPush(nextDigits);
      applyDigitsCore(nextDigits, caretDigitsOnLeft);
    },
    [historyPush, applyDigitsCore],
  );

  useIsomorphicLayoutEffect(() => {
    const wasApplyingCore = isApplyingCoreRef.current;
    isApplyingCoreRef.current = false;

    const external = value || '';

    if (resolveBypassMask(bypassMask, external)) {
      if (external !== rootValueRef.current) setRootValue(external);
      return;
    }

    const rawCleaned = extractFormattedDigits(external);

    const cleaned = normalize && !wasApplyingCore && rawCleaned ? normalize(rawCleaned) : rawCleaned;

    const alwaysActiveChanged = prevAlwaysActiveRef.current !== alwaysActive;
    if (alwaysActiveChanged) {
      prevAlwaysActiveRef.current = alwaysActive;
      if (cleaned.length === 0) {
        isMaskActiveRef.current = alwaysActive;
      }
    }

    const nextText = renderText(cleaned);

    const stateInSync = nextText === rootValueRef.current && cleaned === digitsRawRef.current;

    if (!stateInSync) {
      if (wasApplyingCore && cleaned !== digitsRawRef.current) {
        // applyDigitsCore уже обновил digitsRawRef, но parent ещё не закоммитил
        // новый value prop - cleaned вычислен по старому значению.
        // Пропускаем, чтобы не испортить состояние и не сбросить историю.
        // Корректный layoutEffect придёт, когда parent закоммитит обновление.
        return;
      }

      // Внешнее изменение value (сброс, смена маски, данные с сервера) -
      // очищаем историю, чтобы Ctrl+Z не откатывал к устаревшему состоянию.
      // Если wasApplyingCore - это наш собственный onChange, историю не трогаем.
      if (!wasApplyingCore && cleaned !== digitsRawRef.current) {
        historyClear();
      }

      digitsRawRef.current = cleaned;
      if (nextText !== rootValueRef.current) setRootValue(nextText);

      // Синхронизируем ref и при необходимости стреляем onComplete.
      // wasApplyingCore означает, что это коррекция после mask-switch (applyDigitsCore
      // использовал старую маску, layout-эффект перерендерил с новой) — в этом случае
      // onComplete должен сработать, если маска только что стала завершённой.
      const correctedParsed = getParsedValues(nextText);
      if (wasApplyingCore && correctedParsed.isMaskCompleted && !prevIsMaskCompletedRef.current) {
        onCompleteRef.current?.(correctedParsed);
      }
      prevIsMaskCompletedRef.current = correctedParsed.isMaskCompleted;

      if (cleaned.length === 0) {
        caret.pendingDigitsRef.current = null;
      } else {
        const logicalPos = caret.pendingDigitsRef.current;
        const caretDigits = logicalPos != null ? Math.min(logicalPos, cleaned.length) : cleaned.length;
        caret.setCaret(getCaretPosAfterDigits(caretDigits));
        caret.pendingDigitsRef.current = null;
      }
    }

    // Если внешнее value отличается от отформатированного результата (например, пришло с бэка
    // без маски либо выставлено через lazy-init), уведомляем родителя - независимо от того,
    // совпало ли уже локальное состояние. Иначе на маунте с неформатированным value
    // родительский state расходится с отображаемым.
    // onChange намеренно не в deps - эффект стреляет только при смене value/маски,
    // и к тому моменту onChange в замыкании уже актуален.
    // При alwaysActive с пустым value не уведомляем: маска отображает шаблон, но
    // value родителя остаётся '' - расхождение намеренное, иначе будет бесконечный цикл.
    if (nextText !== external && !(alwaysActive && cleaned.length === 0)) {
      onChangeRef.current(nextText, getParsedValues(nextText));
    }

    // rootValue намеренно исключён: эффект реагирует только на внешний value / смену маски.
  }, [
    value,
    bypassMask,
    extractFormattedDigits,
    normalize,
    renderText,
    caret,
    getCaretPosAfterDigits,
    getParsedValues,
    alwaysActive,
    historyClear,
  ]);

  useEffect(
    () => () => {
      caret.cleanup();
    },
    [caret],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      if (resolveBypassMask(bypassMask, input)) {
        const wasBypassed = resolveBypassMask(bypassMask, rootValueRef.current);
        if (wasBypassed) {
          setRootValue(input);
          onChangeRef.current(input, getParsedValues(input));
          return;
        }

        const { value: nextValue, caretPos } = stripMaskFormatting(
          rootValueRef.current,
          input,
          digitsRawRef.current,
          maskMeta.prefixLength,
        );
        setRootValue(nextValue);
        caret.setCaret(caretPos);
        onChangeRef.current(nextValue, getParsedValues(nextValue));
        return;
      }

      const cursor = e.target.selectionStart ?? input.length;

      const exitsBypassWithCursorInPrefix = maskMeta.prefixLength > 0 && cursor <= maskMeta.prefixLength;
      const exitsBypassNeverActivated = !isMaskActiveRef.current && digitsRawRef.current === '';

      if (
        resolveBypassMask(bypassMask, rootValueRef.current) &&
        (exitsBypassWithCursorInPrefix || exitsBypassNeverActivated)
      ) {
        const { digits, caretDigitsOnLeft } = resolveBypassMaskExit(input, cursor, maskMeta.maxDigits, normalize);
        if (digits.length > 0) isMaskActiveRef.current = true;
        applyDigits(digits, caretDigitsOnLeft);
        return;
      }

      const result = resolveChange({
        input,
        cursor,
        isMaskActive: isMaskActiveRef.current,
        prevDigits: digitsRawRef.current,
        maskMeta,
        allowedPrefixesDigits,
        stripVisiblePrefix,
        stripAllowedPrefix,
        startsWithAllowedPrefix,
        normalize,
        pasteStripPrefix,
        overwrite,
      });

      if (result.kind === 'clear') {
        applyDigits('', 0);
        return;
      }

      if (result.kind === 'activate-prefix') {
        isMaskActiveRef.current = true;
        setRootValue(formatDigits('').text);
        caret.setCaret(maskMeta.prefixLength);
        return;
      }

      if (result.kind === 'ignore') {
        e.target.value = rootValueRef.current;
        caret.setCaret(getCaretPosAfterDigits(result.caretDigitsOnLeft ?? digitsRawRef.current.length));
        return;
      }

      isMaskActiveRef.current = true;
      applyDigits(result.digits, result.caretDigitsOnLeft);
    },
    [
      allowedPrefixesDigits,
      applyDigits,
      caret,
      bypassMask,
      formatDigits,
      getCaretPosAfterDigits,
      getParsedValues,
      maskMeta,
      normalize,
      overwrite,
      pasteStripPrefix,
      startsWithAllowedPrefix,
      stripAllowedPrefix,
      stripVisiblePrefix,
    ],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      const pastedText = e.clipboardData.getData('text');
      if (resolveBypassMask(bypassMask, rootValueRef.current) || resolveBypassMask(bypassMask, pastedText)) return;

      e.preventDefault();

      const selectionStart = e.currentTarget.selectionStart ?? maskMeta.prefixLength;
      const selectionEnd = e.currentTarget.selectionEnd ?? selectionStart;

      const leftDigitsStart = extractFormattedDigits(rootValueRef.current.slice(0, selectionStart)).length;
      const leftDigitsEnd = extractFormattedDigits(rootValueRef.current.slice(0, selectionEnd)).length;

      const result = resolvePaste({
        pasted: pastedText,
        prevDigits: digitsRawRef.current,
        leftDigitsStart,
        leftDigitsEnd,
        isMaskActive: isMaskActiveRef.current,
        maskMeta,
        allowedPrefixes: resolvedPrefixAliases,
        allowedPrefixesDigits,
        stripAllowedPrefix,
        startsWithAllowedPrefix,
        normalize,
        pasteStripPrefix,
        overwrite,
      });

      if (result.kind === 'activate-prefix') {
        historyPush('');
        isMaskActiveRef.current = true;
        digitsRawRef.current = '';
        const { text } = formatDigits('');
        setRootValue(text);
        caret.setCaret(maskMeta.prefixLength);
        onChangeRef.current(text, getParsedValues(text));
        return;
      }

      if (result.kind === 'ignore') return;

      isMaskActiveRef.current = true;
      applyDigits(result.digits, result.caretDigitsOnLeft);
    },
    [
      resolvedPrefixAliases,
      allowedPrefixesDigits,
      applyDigits,
      caret,
      bypassMask,
      extractFormattedDigits,
      formatDigits,
      getParsedValues,
      historyPush,
      maskMeta,
      normalize,
      overwrite,
      pasteStripPrefix,
      startsWithAllowedPrefix,
      stripAllowedPrefix,
    ],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (resolveBypassMask(bypassMask, rootValueRef.current)) return;

      const { key } = e;
      const selectionStart = e.currentTarget.selectionStart ?? maskMeta.prefixLength;
      const selectionEnd = e.currentTarget.selectionEnd ?? selectionStart;
      const prev = digitsRawRef.current;

      const leftStart = extractFormattedDigits(rootValueRef.current.slice(0, selectionStart)).length;
      const leftEnd = extractFormattedDigits(rootValueRef.current.slice(0, selectionEnd)).length;

      if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (e.code === 'KeyY' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      if (key === 'Backspace') {
        e.preventDefault();

        if (leftStart !== leftEnd) {
          const next = prev.slice(0, leftStart) + prev.slice(leftEnd);
          applyDigits(next, leftStart);
          return;
        }

        if (leftStart === 0) {
          if (prev.length === 0 && isMaskActiveRef.current && !alwaysActive) {
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
            if (isMaskActiveRef.current && prev.length === 0 && !alwaysActive) {
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

      const getSelectionAnchorAndFocus = () => {
        if (selectionStart === selectionEnd) return { anchor: selectionStart, focus: selectionEnd };
        if (e.currentTarget.selectionDirection === 'backward') {
          return { anchor: selectionEnd, focus: selectionStart };
        }
        return { anchor: selectionStart, focus: selectionEnd };
      };

      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        e.preventDefault();
        const isLeft = key === 'ArrowLeft';
        const isWordJump = e.ctrlKey || e.metaKey || e.altKey;
        const maxCaretPos = getCaretPosAfterDigits(prev.length);

        if (e.shiftKey) {
          const { anchor, focus } = getSelectionAnchorAndFocus();
          const currentPos = clamp(focus, maskMeta.prefixLength, maskMeta.maskLength);
          let nextFocus: number;
          if (isWordJump) {
            nextFocus = isLeft
              ? Math.max(getPrevGroupBoundary(currentPos), maskMeta.prefixLength)
              : Math.min(getNextGroupBoundary(currentPos), maxCaretPos);
          } else {
            nextFocus = isLeft ? getPrevCaretPos(currentPos) : getNextCaretPos(currentPos);
          }
          caret.setSelection(anchor, nextFocus);
          return;
        }

        if (isWordJump) {
          const currentPos = clamp(selectionStart, maskMeta.prefixLength, maskMeta.maskLength);
          const pos = isLeft
            ? Math.max(getPrevGroupBoundary(currentPos), maskMeta.prefixLength)
            : Math.min(getNextGroupBoundary(currentPos), maxCaretPos);
          caret.setCaret(pos);
          return;
        }

        const selectionPos = isLeft ? selectionStart : selectionEnd;
        const currentPos = clamp(selectionPos, maskMeta.prefixLength, maskMeta.maskLength);
        const nextPos = isLeft ? getPrevCaretPos(currentPos) : getNextCaretPos(currentPos);
        caret.setCaret(nextPos);
        return;
      }

      if (key === 'ArrowUp' || key === 'Home') {
        e.preventDefault();
        const pos = maskMeta.prefixLength;
        if (e.shiftKey) {
          const { anchor } = getSelectionAnchorAndFocus();
          caret.setSelection(anchor, pos);
          return;
        }
        caret.setCaret(pos);
        return;
      }

      if (key === 'ArrowDown' || key === 'End') {
        e.preventDefault();
        const pos = getCaretPosAfterDigits(prev.length);
        if (e.shiftKey) {
          const { anchor } = getSelectionAnchorAndFocus();
          caret.setSelection(anchor, pos);
          return;
        }
        caret.setCaret(pos);
      }
    },
    [
      alwaysActive,
      applyDigits,
      caret,
      bypassMask,
      extractFormattedDigits,
      getCaretPosAfterDigits,
      getNextCaretPos,
      getPrevCaretPos,
      getNextGroupBoundary,
      getPrevGroupBoundary,
      maskMeta.maskLength,
      maskMeta.prefixLength,
      redo,
      undo,
    ],
  );

  const handleClick = useCallback(
    (e: MouseEvent<HTMLInputElement>) => {
      if (resolveBypassMask(bypassMask, rootValueRef.current)) return;

      const start = e.currentTarget.selectionStart ?? 0;
      const end = e.currentTarget.selectionEnd ?? start;
      if (start !== end) return;

      if (start < maskMeta.prefixLength) {
        e.preventDefault();
        caret.setCaret(maskMeta.prefixLength);
      }
    },
    [caret, bypassMask, maskMeta.prefixLength],
  );

  const onFocus = useCallback(() => {
    if (resolveBypassMask(bypassMask, rootValueRef.current)) return;
    if (!activateOnFocus) return;

    if (!isMaskActiveRef.current) {
      isMaskActiveRef.current = true;
      setRootValue(renderSlots(digitsRawRef.current).text);
    }

    // В пустом поле ставим каретку после префикса, чтобы пользователь не попал
    // внутрь литеральных символов. В заполненном поле браузер сам сохраняет
    // позицию клика.
    if (digitsRawRef.current.length === 0) {
      caret.setCaret(maskMeta.prefixLength);
    }
  }, [activateOnFocus, caret, bypassMask, renderSlots, maskMeta.prefixLength]);

  const onBlur = useCallback(() => {
    if (resolveBypassMask(bypassMask, rootValueRef.current)) return;
    if (!deactivateOnEmptyBlur || alwaysActive) return;

    if (digitsRawRef.current.length === 0) {
      isMaskActiveRef.current = false;
      setRootValue('');
    }
  }, [alwaysActive, deactivateOnEmptyBlur, bypassMask]);

  const onMouseDown = useCallback(
    (e: MouseEvent<HTMLInputElement>) => {
      if (resolveBypassMask(bypassMask, rootValueRef.current)) return;
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
          if (process.env.NODE_ENV !== 'production') console.error(error);
        }
      }
      caret.setCaret(maskMeta.prefixLength);
    },
    [activateOnFocus, caret, bypassMask, formatDigits, maskMeta.prefixLength],
  );

  const ghostValue = useMemo(() => {
    if (resolveBypassMask(bypassMask, rootValue)) return '';
    if (alwaysActive && digitsRawRef.current.length === 0 && !trimMaskTail) return '';
    const ghost = renderGhost(digitsRawRef.current);
    return ' '.repeat(rootValue.length) + ghost.slice(rootValue.length);
  }, [bypassMask, alwaysActive, trimMaskTail, rootValue, renderGhost]);

  const resolvedInputMode = inputMode ?? (resolveBypassMask(bypassMask, rootValue) ? 'text' : 'numeric');

  const props = useMemo(
    () => ({
      value: rootValue,
      ref: inputRef,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
      onClick: handleClick,
      onFocus,
      onBlur,
      onMouseDown,
      inputMode: resolvedInputMode,
    }),
    [handleChange, handleClick, handleKeyDown, handlePaste, onBlur, onFocus, onMouseDown, resolvedInputMode, rootValue],
  );

  const api = useMemo(
    () => ({
      formatDigits,
      getParsedValues,
      undo,
      redo,
      canUndo,
      canRedo,
    }),
    [formatDigits, getParsedValues, undo, redo, canUndo, canRedo],
  );

  return { props, api, ghostValue } as const;
}
