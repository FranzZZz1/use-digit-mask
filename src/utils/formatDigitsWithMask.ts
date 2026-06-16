import { fillSlots } from './fillSlots';

const MASK_DIGIT_SLOT = '#';

/**
 * Fills `digits` into `mask` slots, padding with `placeholderChar`.
 * Pure function — no hook dependency.
 */
export function formatDigitsWithMask(digits: string, mask: string, placeholderChar: string): string {
  const chars = [...mask];
  const slots = chars.filter((c) => c === MASK_DIGIT_SLOT).length;
  return fillSlots(chars, digits.slice(0, slots), placeholderChar);
}
