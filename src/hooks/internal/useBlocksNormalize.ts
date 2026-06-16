import { useMemo } from 'react';

import { type NamedBlock, type UseMaskProps } from '../types';

import { buildBlocksNormalize, buildBlockValueComputer, buildNamedBlocksNormalize } from './applyBlocks';
import { type MaskMeta } from './useMaskMeta';

type NormalizeProp = NonNullable<UseMaskProps['normalize']>;

export type BlocksNormalizeHookResult = {
  normalize: ((digits: string) => string) | undefined;
  computeBlockValues: (digits: string) => string[];
  computeNamedBlockValues: ((digits: string) => Record<string, string>) | null;
};

/**
 * Composes blocks clamping with the user's normalize (blocks run first).
 * Always returns computeBlockValues and computeNamedBlockValues for ParsedValues.
 * normalizeProp always receives positional blockValues as a second argument.
 */
export function useBlocksNormalize(
  blocks: UseMaskProps['blocks'],
  groupOrder: string[],
  blockDigitStarts: number[],
  maskMeta: MaskMeta,
  normalizeProp: NormalizeProp | undefined,
): BlocksNormalizeHookResult {
  return useMemo(() => {
    let built = null as ReturnType<typeof buildBlocksNormalize> | null;
    if (blocks) {
      if (Array.isArray(blocks)) {
        built = buildBlocksNormalize(blocks, maskMeta.digitSlotIndexes);
      } else {
        built = buildNamedBlocksNormalize(blocks as Record<string, NamedBlock>, groupOrder, blockDigitStarts);
      }
    }

    const computeBlockValues = built?.computeValues ?? buildBlockValueComputer(maskMeta.digitSlotIndexes);
    const computeNamedBlockValues = built?.computeNamedValues ?? null;

    const normalize =
      normalizeProp || built
        ? (d: string): string => {
            const afterBlocks = built ? built.normalize(d) : d;
            if (!normalizeProp) return afterBlocks;
            return normalizeProp(afterBlocks, computeBlockValues(afterBlocks));
          }
        : undefined;

    return { normalize, computeBlockValues, computeNamedBlockValues };
  }, [blocks, blockDigitStarts, groupOrder, maskMeta, normalizeProp]);
}
