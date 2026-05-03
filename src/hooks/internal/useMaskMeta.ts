import { useMemo } from 'react';

import { extractDigits } from '../../utils/extractDigits';

const MASK_DIGIT_SLOT = '#';

export type MaskMeta = {
  chars: string[];
  digitSlotIndexes: number[];
  maxDigits: number;
  prefixLength: number;
  visiblePrefix: string;
  visiblePrefixDigits: string;
  maskLength: number;
};

export function useMaskMeta(mask: string): MaskMeta {
  return useMemo(() => {
    const chars = [...mask];
    const digitSlotIndexes: number[] = [];
    let prefixLength = 0;
    let metDigit = false;

    chars.forEach((char, idx) => {
      if (char === MASK_DIGIT_SLOT) {
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
}
