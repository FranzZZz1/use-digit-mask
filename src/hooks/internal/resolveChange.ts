import { extractDigits } from '../../utils/extractDigits';
import { type PasteStripPrefix } from '../types';

import { applyNormalize } from './applyNormalize';
import { type MaskMeta } from './useMaskMeta';

/**
 * Результат разбора onChange-события.
 *
 * clear            — пользователь вырезал всё тело (оставил частичный/пустой prefix).
 * activate-prefix  — первый символ совпадает с allowed-префиксом -> активируем маску
 *                    без добавления цифры в тело.
 * ignore           — введённый символ не дал ни цифры, ни префикса (например,
 *                    выделили всё значение и нажали недопустимую букву) ->
 *                    откатить ввод, значение не меняется. caretDigitsOnLeft,
 *                    если задан, указывает, куда вернуть каретку (например, на
 *                    место выделения, а не в конец значения).
 * apply            — нормальный случай: применить digits к маске с позицией каретки.
 */
export type ResolveChangeResult =
  | { kind: 'clear' }
  | { kind: 'activate-prefix' }
  | { kind: 'ignore'; caretDigitsOnLeft?: number }
  | { kind: 'apply'; digits: string; caretDigitsOnLeft: number };

/**
 * Символ не является ни цифрой, ни литералом маски (например, буква) ->
 * пользователь набрал его поверх выделения, и это не валидный ввод.
 */
function isInvalidChar(char: string, maskLiteralChars: Set<string>): boolean {
  return char !== '' && !/\d/.test(char) && !maskLiteralChars.has(char);
}

export type ResolveChangeOptions = {
  input: string;
  cursor: number;
  isMaskActive: boolean;
  prevDigits: string;
  maskMeta: MaskMeta;
  allowedPrefixesDigits: string[];
  stripVisiblePrefix: (digits: string) => string;
  stripAllowedPrefix: (digits: string) => string;
  startsWithAllowedPrefix: (digits: string) => boolean;
  normalize?: (digits: string) => string;
  pasteStripPrefix?: PasteStripPrefix;
  overwrite?: boolean;
};

export function resolveChange({
  input,
  cursor,
  isMaskActive,
  prevDigits,
  maskMeta,
  allowedPrefixesDigits,
  stripVisiblePrefix,
  stripAllowedPrefix,
  startsWithAllowedPrefix,
  normalize,
  pasteStripPrefix = 'overflow',
  overwrite = false,
}: ResolveChangeOptions): ResolveChangeResult {
  const rawInputDigits = extractDigits(input);
  const maskLiteralChars = new Set(maskMeta.chars.filter((c) => c !== '#'));

  if (!isMaskActive && prevDigits.length === 0) {
    if (maskMeta.prefixLength > 0 && rawInputDigits.length === 1 && startsWithAllowedPrefix(rawInputDigits)) {
      return { kind: 'activate-prefix' };
    }

    const isOverflow = rawInputDigits.length > maskMeta.maxDigits;
    const shouldStrip = startsWithAllowedPrefix(rawInputDigits) && (pasteStripPrefix === 'always' || isOverflow);

    const stripped = shouldStrip ? stripAllowedPrefix(rawInputDigits) : rawInputDigits;
    const digits = applyNormalize(normalize, stripped).slice(0, maskMeta.maxDigits);

    const digitsBeforeCursor = extractDigits(input.slice(0, cursor)).length;
    const strippedOffset = rawInputDigits.length - stripped.length;
    const caretDigitsOnLeft = Math.max(0, Math.min(digits.length, digitsBeforeCursor - strippedOffset));
    return { kind: 'apply', digits, caretDigitsOnLeft };
  }

  if (maskMeta.prefixLength > 0 && cursor <= maskMeta.prefixLength) {
    if (maskMeta.visiblePrefix.startsWith(input)) {
      return { kind: 'clear' };
    }

    const typedChar = cursor > 0 ? (input[cursor - 1] ?? '') : '';
    const typedDigit = /^\d$/.test(typedChar) ? typedChar : '';
    const bodyDigits = extractDigits(input.slice(maskMeta.prefixLength + 1));
    const raw = (typedDigit + bodyDigits).slice(0, maskMeta.maxDigits);
    const combined = applyNormalize(normalize, raw);

    if (typedDigit === '' && rawInputDigits.length < prevDigits.length && isInvalidChar(typedChar, maskLiteralChars)) {
      return { kind: 'ignore', caretDigitsOnLeft: prevDigits.length - rawInputDigits.length };
    }

    if (combined === '' && input !== '') {
      return { kind: 'ignore' };
    }

    return { kind: 'apply', digits: combined, caretDigitsOnLeft: typedDigit.length };
  }

  const isFormattedInput = maskMeta.prefixLength > 0 && input.startsWith(maskMeta.visiblePrefix);
  const visiblePrefixDigit = maskMeta.visiblePrefixDigits;
  const visiblePrefixIsAllowed = visiblePrefixDigit !== '' && allowedPrefixesDigits.includes(visiblePrefixDigit);
  const doStripVisiblePrefix = isFormattedInput || visiblePrefixIsAllowed;
  const stripPrefix = (d: string) => (doStripVisiblePrefix ? stripVisiblePrefix(d) : d);

  const fullDigits = stripPrefix(rawInputDigits);

  if (fullDigits.length < prevDigits.length && cursor > 0 && isInvalidChar(input[cursor - 1] ?? '', maskLiteralChars)) {
    const digitsBeforeSelection = stripPrefix(extractDigits(input.slice(0, cursor - 1))).length;
    const removedDigits = prevDigits.length - fullDigits.length;
    return { kind: 'ignore', caretDigitsOnLeft: digitsBeforeSelection + removedDigits };
  }

  const digitsLeft = stripPrefix(extractDigits(input.slice(0, cursor))).length;

  const hasEmbeddedPrefix = maskMeta.prefixLength > 0 && input.includes(maskMeta.visiblePrefix, maskMeta.prefixLength);

  const strippedCandidate = stripAllowedPrefix(isFormattedInput ? fullDigits : rawInputDigits);

  const startsWithKnownPrefix = startsWithAllowedPrefix(rawInputDigits);
  const isPasteLike =
    fullDigits.length > maskMeta.maxDigits ||
    hasEmbeddedPrefix ||
    (pasteStripPrefix === 'always' && startsWithKnownPrefix);
  const cursorBeyondStripped = digitsLeft > strippedCandidate.length;
  const shouldStripPrefix = strippedCandidate !== fullDigits && isPasteLike && cursorBeyondStripped;

  const sourceDigits = shouldStripPrefix ? strippedCandidate : fullDigits;
  const finalDigits = applyNormalize(normalize, sourceDigits);

  if (finalDigits === '' && input !== '' && rawInputDigits.length > 0 && fullDigits === '') {
    return { kind: 'ignore' };
  }

  if (overwrite && fullDigits.length === prevDigits.length + 1) {
    const overwritePos = digitsLeft - 1;
    if (overwritePos >= 0 && overwritePos < prevDigits.length) {
      const replaced =
        prevDigits.slice(0, overwritePos) + fullDigits[overwritePos] + prevDigits.slice(overwritePos + 1);
      return { kind: 'apply', digits: applyNormalize(normalize, replaced), caretDigitsOnLeft: digitsLeft };
    }
  }

  return { kind: 'apply', digits: finalDigits, caretDigitsOnLeft: digitsLeft };
}
