import { extractDigits } from '../../utils/extractDigits';
import { type PasteStripPrefix } from '../types';

import { type MaskMeta } from './useMaskMeta';

/**
 * Результат разбора onChange-события.
 *
 * clear            — пользователь вырезал всё тело (оставил частичный/пустой prefix).
 * activate-prefix  — первый символ совпадает с allowed-префиксом -> активируем маску
 *                    без добавления цифры в тело.
 * apply            — нормальный случай: применить digits к маске с позицией каретки.
 */
export type ResolveChangeResult =
  | { kind: 'clear' }
  | { kind: 'activate-prefix' }
  | { kind: 'apply'; digits: string; caretDigitsOnLeft: number };

export type ResolveChangeOptions = {
  input: string;
  cursor: number;
  isMaskActive: boolean;
  prevDigitsLength: number;
  maskMeta: MaskMeta;
  allowedPrefixesDigits: string[];
  stripVisiblePrefix: (digits: string) => string;
  stripAllowedPrefix: (digits: string) => string;
  startsWithAllowedPrefix: (digits: string) => boolean;
  normalize?: (digits: string) => string;
  pasteStripPrefix?: PasteStripPrefix;
};

export function resolveChange({
  input,
  cursor,
  isMaskActive,
  prevDigitsLength,
  maskMeta,
  allowedPrefixesDigits,
  stripVisiblePrefix,
  stripAllowedPrefix,
  startsWithAllowedPrefix,
  normalize,
  pasteStripPrefix = 'overflow',
}: ResolveChangeOptions): ResolveChangeResult {
  const rawInputDigits = extractDigits(input);
  const norm = (d: string) => (normalize ? normalize(d) : d);

  if (!isMaskActive && prevDigitsLength === 0) {
    if (maskMeta.prefixLength > 0 && rawInputDigits.length === 1 && startsWithAllowedPrefix(rawInputDigits)) {
      return { kind: 'activate-prefix' };
    }

    if (rawInputDigits.length === 1) {
      const digits = norm(rawInputDigits).slice(0, maskMeta.maxDigits);
      return { kind: 'apply', digits, caretDigitsOnLeft: digits.length };
    }
  }

  if (maskMeta.prefixLength > 0 && cursor <= maskMeta.prefixLength) {
    if (maskMeta.visiblePrefix.startsWith(input)) {
      return { kind: 'clear' };
    }

    const typedChar = cursor > 0 ? (input[cursor - 1] ?? '') : '';
    const typedDigit = /^\d$/.test(typedChar) ? typedChar : '';
    const bodyDigits = extractDigits(input.slice(maskMeta.prefixLength + 1));
    const combined = norm((typedDigit + bodyDigits).slice(0, maskMeta.maxDigits));

    return { kind: 'apply', digits: combined, caretDigitsOnLeft: typedDigit.length };
  }

  const isFormattedInput = maskMeta.prefixLength > 0 && input.startsWith(maskMeta.visiblePrefix);
  const visiblePrefixDigit = extractDigits(maskMeta.visiblePrefix);
  const visiblePrefixIsAllowed = visiblePrefixDigit !== '' && allowedPrefixesDigits.includes(visiblePrefixDigit);
  const doStripVisiblePrefix = isFormattedInput || visiblePrefixIsAllowed;
  const normalizeDigits = (d: string) => (doStripVisiblePrefix ? stripVisiblePrefix(d) : d);

  const fullDigits = normalizeDigits(rawInputDigits);
  const digitsLeft = normalizeDigits(extractDigits(input.slice(0, cursor))).length;

  const hasEmbeddedPrefix = maskMeta.prefixLength > 0 && input.includes(maskMeta.visiblePrefix, maskMeta.prefixLength);

  const strippedCandidate = stripAllowedPrefix(isFormattedInput ? fullDigits : rawInputDigits);

  const startsWithKnownPrefix = startsWithAllowedPrefix(rawInputDigits);
  const isPasteLike =
    fullDigits.length > maskMeta.maxDigits ||
    hasEmbeddedPrefix ||
    (pasteStripPrefix === 'always' && startsWithKnownPrefix);
  const cursorBeyondStripped = digitsLeft > strippedCandidate.length;
  const shouldStripPrefix = strippedCandidate !== fullDigits && isPasteLike && cursorBeyondStripped;

  const finalDigits = norm(shouldStripPrefix ? strippedCandidate : fullDigits);

  return { kind: 'apply', digits: finalDigits, caretDigitsOnLeft: digitsLeft };
}
