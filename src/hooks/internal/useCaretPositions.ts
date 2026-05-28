import { useCallback, useMemo } from 'react';

import { type MaskMeta } from './useMaskMeta';

const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(max, num));

export function useCaretPositions(maskMeta: MaskMeta) {
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

  return { getCaretPosAfterDigits, allowedCaretPositions, getPrevCaretPos, getNextCaretPos };
}
