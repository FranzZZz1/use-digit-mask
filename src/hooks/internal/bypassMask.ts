import { extractDigits } from '../../utils/extractDigits';
import { type UseMaskProps } from '../types';

import { applyNormalize } from './applyNormalize';

export function resolveBypassMask(bypassMask: UseMaskProps['bypassMask'], value: string): boolean {
  return typeof bypassMask === 'function' ? bypassMask(value) : Boolean(bypassMask);
}

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i += 1;
  return i;
}

function commonSuffixLength(a: string, b: string, maxLen: number): number {
  let i = 0;
  while (i < maxLen && a[a.length - 1 - i] === b[b.length - 1 - i]) i += 1;
  return i;
}

/**
 * Converts a mask-formatted value into its raw form when `bypassMask` switches
 * from `false` to `true` mid-edit: locates the user's edit (insertion/deletion)
 * relative to the previously formatted value, and re-applies it to the plain
 * digit string instead — dropping placeholders and mask literals.
 *
 * Also returns the caret position (within the returned raw value) right after
 * the inserted text, so the cursor stays where the user was typing instead of
 * jumping to the end.
 */
export function stripMaskFormatting(
  oldFormatted: string,
  newRaw: string,
  oldDigits: string,
  prefixLength: number,
): { value: string; caretPos: number } {
  const prefixLen = commonPrefixLength(oldFormatted, newRaw);
  const maxSuffixLen = Math.min(oldFormatted.length, newRaw.length) - prefixLen;
  const suffixLen = commonSuffixLength(oldFormatted, newRaw, maxSuffixLen);

  const inserted = newRaw.slice(prefixLen, newRaw.length - suffixLen);
  const digitsBefore =
    prefixLen <= prefixLength ? 0 : extractDigits(oldFormatted.slice(prefixLength, prefixLen)).length;
  const suffixStart = oldFormatted.length - suffixLen;
  const digitsAfter = extractDigits(oldFormatted.slice(Math.max(prefixLength, suffixStart))).length;

  const value = oldDigits.slice(0, digitsBefore) + inserted + oldDigits.slice(oldDigits.length - digitsAfter);
  return { value, caretPos: digitsBefore + inserted.length };
}

/**
 * Rebuilds the mask digit string when `bypassMask` switches from `true` back to
 * `false` mid-edit (e.g. the user deleted the trailing letter that triggered
 * email-mode): `input` at this point is raw text, not a mask-formatted string,
 * so it can't go through `resolveChange` - digits are extracted directly.
 */
export function resolveBypassMaskExit(
  input: string,
  cursor: number,
  maxDigits: number,
  normalize?: (digits: string) => string,
): { digits: string; caretDigitsOnLeft: number } {
  const rawDigits = extractDigits(input);
  const digits = applyNormalize(normalize, rawDigits).slice(0, maxDigits);
  const caretDigitsOnLeft = Math.min(extractDigits(input.slice(0, cursor)).length, digits.length);
  return { digits, caretDigitsOnLeft };
}
