const MASK_DIGIT_SLOT = '#';

/**
 * Fills `digits` into the `#` slots of `chars`, padding remaining slots with `fillChar`.
 * Non-slot characters are copied through unchanged.
 */
export function fillSlots(chars: readonly string[], digits: string, fillChar: string): string {
  let result = '';
  let digitIndex = 0;
  for (let i = 0; i < chars.length; i += 1) {
    if (chars[i] === MASK_DIGIT_SLOT) {
      result += digits[digitIndex] ?? fillChar;
      digitIndex += 1;
    } else {
      result += chars[i];
    }
  }
  return result;
}
