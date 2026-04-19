const MASK_DIGIT_SLOT = '#';

/**
 * Fills `digits` into `mask` slots, padding with `placeholderChar`.
 * Pure function — no hook dependency.
 */
export function formatDigitsWithMask(digits: string, mask: string, placeholderChar: string): string {
  const slots = [...mask].filter((c) => c === MASK_DIGIT_SLOT).length;
  const clamped = digits.slice(0, slots);
  let i = 0;
  // eslint-disable-next-line no-plusplus
  return [...mask].map((char) => (char === MASK_DIGIT_SLOT ? (clamped[i++] ?? placeholderChar) : char)).join('');
}
