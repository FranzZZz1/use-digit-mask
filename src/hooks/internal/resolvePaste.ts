import { extractDigits } from '../../utils/extractDigits';
import { type PasteStripPrefix } from '../types';

import { type MaskMeta } from './useMaskMeta';

/**
 * Результат разбора onPaste-события.
 *
 * activate-prefix — вставлен только prefix (например '+7') в неактивное поле.
 *                   Активируем маску, тело остаётся пустым.
 * apply           — применить digits к маске начиная с leftDigitsStart.
 */
export type ResolvePasteResult =
  | { kind: 'activate-prefix' }
  | { kind: 'apply'; digits: string; caretDigitsOnLeft: number };

export type ResolvePasteOptions = {
  pasted: string;
  /** Тело маски до события (без prefix). */
  prevDigits: string;
  /** Количество body-цифр слева от начала выделения. */
  leftDigitsStart: number;
  /** Количество body-цифр слева от конца выделения. */
  leftDigitsEnd: number;
  isMaskActive: boolean;
  maskMeta: MaskMeta;
  allowedPrefixes: string[];
  allowedPrefixesDigits: string[];
  stripAllowedPrefix: (digits: string) => string;
  startsWithAllowedPrefix: (digits: string) => boolean;
  normalize?: (digits: string) => string;
  pasteStripPrefix?: PasteStripPrefix;
};

function isPrefixOnly(
  pasted: string,
  pastedDigitsRaw: string,
  maskMeta: MaskMeta,
  allowedPrefixes: string[],
  allowedPrefixesDigits: string[],
): boolean {
  const trimmed = pasted.trim();
  const visibleEq = maskMeta.visiblePrefix ? trimmed === maskMeta.visiblePrefix.trim() : false;
  const allowedEq = allowedPrefixes.some((prefix) => trimmed === prefix.trim());
  const digitsEq = allowedPrefixesDigits.some((pd) => pd && pastedDigitsRaw === pd);
  return visibleEq || allowedEq || digitsEq;
}

function shouldStripPrefix(opts: {
  pasted: string;
  pastedDigitsRaw: string;
  insertingAtStart: boolean;
  replacingAllDigits: boolean;
  isPrefixOnly: boolean;
  isMaskActive: boolean;
  maskMeta: MaskMeta;
  allowedPrefixes: string[];
  startsWithAllowedPrefix: (digits: string) => boolean;
  pasteStripPrefix: PasteStripPrefix;
}): boolean {
  const {
    pasted,
    pastedDigitsRaw,
    insertingAtStart,
    replacingAllDigits,
    isPrefixOnly: prefixOnly,
    isMaskActive,
    maskMeta,
    allowedPrefixes,
    startsWithAllowedPrefix,
    pasteStripPrefix,
  } = opts;

  const startsWithFormattedPrefix =
    (maskMeta.visiblePrefix.length > 0 && pasted.startsWith(maskMeta.visiblePrefix)) ||
    allowedPrefixes.some((prefix) => !/^\d/.test(prefix) && pasted.startsWith(prefix));

  const startsWithKnownPrefix = startsWithFormattedPrefix || startsWithAllowedPrefix(pastedDigitsRaw);

  const skipOnce = isMaskActive && prefixOnly;

  const lengthCondition =
    pasteStripPrefix === 'overflow'
      ? startsWithFormattedPrefix || pastedDigitsRaw.length > maskMeta.maxDigits
      : startsWithKnownPrefix || pastedDigitsRaw.length > maskMeta.maxDigits;

  return !skipOnce && insertingAtStart && replacingAllDigits && lengthCondition;
}

export function resolvePaste({
  pasted,
  prevDigits,
  leftDigitsStart,
  leftDigitsEnd,
  isMaskActive,
  maskMeta,
  allowedPrefixes,
  allowedPrefixesDigits,
  stripAllowedPrefix,
  startsWithAllowedPrefix,
  normalize,
  pasteStripPrefix = 'overflow',
}: ResolvePasteOptions): ResolvePasteResult {
  const norm = (d: string) => (normalize ? normalize(d) : d);
  const pastedDigitsRaw = extractDigits(pasted);

  const insertingAtStart = leftDigitsStart === 0;
  const replacingAllDigits = prevDigits.length === 0 || (insertingAtStart && leftDigitsEnd >= prevDigits.length);

  const prefixOnly = isPrefixOnly(pasted, pastedDigitsRaw, maskMeta, allowedPrefixes, allowedPrefixesDigits);

  if (maskMeta.prefixLength > 0 && insertingAtStart && replacingAllDigits && prefixOnly && !isMaskActive) {
    return { kind: 'activate-prefix' };
  }

  const strip = shouldStripPrefix({
    pasted,
    pastedDigitsRaw,
    insertingAtStart,
    replacingAllDigits,
    isPrefixOnly: prefixOnly,
    isMaskActive,
    maskMeta,
    allowedPrefixes,
    startsWithAllowedPrefix,
    pasteStripPrefix,
  });

  const strippedRaw = strip ? stripAllowedPrefix(pastedDigitsRaw) : pastedDigitsRaw;
  const insertDigits = norm(strippedRaw);

  const nextRaw = prevDigits.slice(0, leftDigitsStart) + insertDigits + prevDigits.slice(leftDigitsEnd);
  const digits = nextRaw.slice(0, maskMeta.maxDigits);
  const caretDigitsOnLeft = Math.min(leftDigitsStart + insertDigits.length, maskMeta.maxDigits);

  return { kind: 'apply', digits, caretDigitsOnLeft };
}
