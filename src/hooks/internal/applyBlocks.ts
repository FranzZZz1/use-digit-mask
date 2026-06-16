import { type Block, type BlockConstraint, type NamedBlock } from '../types';

type DigitGroup = { readonly start: number; readonly length: number };

export function detectGroups(digitSlotIndexes: readonly number[]): readonly DigitGroup[] {
  if (digitSlotIndexes.length === 0) return [];
  const groups: DigitGroup[] = [];
  let groupStart = 0;
  let groupLength = 1;
  for (let i = 1; i < digitSlotIndexes.length; i += 1) {
    if (digitSlotIndexes[i] === digitSlotIndexes[i - 1] + 1) {
      groupLength += 1;
    } else {
      groups.push({ start: groupStart, length: groupLength });
      groupStart = i;
      groupLength = 1;
    }
  }
  groups.push({ start: groupStart, length: groupLength });
  return groups;
}

function makeGroupComputer(digitSlotIndexes: readonly number[]): {
  groups: readonly DigitGroup[];
  computeValues: (digits: string) => string[];
} {
  const groups = detectGroups(digitSlotIndexes);
  const computeValues = (digits: string) => groups.map((g) => digits.slice(g.start, g.start + g.length));
  return { groups, computeValues };
}

function clampGroup(result: string, group: DigitGroup, constraint: BlockConstraint): string {
  const groupDigits = result.slice(group.start, group.start + group.length);
  if (groupDigits.length !== group.length) return result;

  const value = parseInt(groupDigits, 10);
  if (Number.isNaN(value)) return result;

  const { min, max } = constraint;

  let clamped = value;
  if (min !== undefined && value < min) clamped = min;
  if (max !== undefined && value > max) clamped = max;
  if (clamped === value) return result;

  const clampedStr = String(clamped).padStart(group.length, '0');
  if (clampedStr.length > group.length) return result;

  return result.slice(0, group.start) + clampedStr + result.slice(group.start + group.length);
}

export function buildBlockValueComputer(digitSlotIndexes: readonly number[]): (digits: string) => string[] {
  return makeGroupComputer(digitSlotIndexes).computeValues;
}

export type BlocksNormalizeResult = {
  normalize: (digits: string) => string;
  computeValues: (digits: string) => string[];
  computeNamedValues: ((digits: string) => Record<string, string>) | null;
};

export function buildBlocksNormalize(
  blocks: readonly Block[],
  digitSlotIndexes: readonly number[],
): BlocksNormalizeResult {
  const { groups, computeValues } = makeGroupComputer(digitSlotIndexes);

  function singlePass(digits: string): string {
    let result = digits;
    for (let i = 0; i < groups.length && i < blocks.length; i += 1) {
      const block = blocks[i];
      if (block != null) {
        const constraint: BlockConstraint = typeof block === 'function' ? block(computeValues(result)) : block;
        result = clampGroup(result, groups[i], constraint);
      }
    }
    return result;
  }

  return {
    normalize: function applyBlocks(digits: string): string {
      let result = digits;
      for (let pass = 0; pass < groups.length; pass += 1) {
        const prev = result;
        result = singlePass(result);
        if (result === prev) break;
      }
      return result;
    },
    computeValues,
    computeNamedValues: null,
  };
}

export function resolveNamedMask(
  mask: string,
  blockKeys: string[],
): { resolvedMask: string; groupOrder: string[]; blockDigitStarts: number[] } {
  if (process.env.NODE_ENV !== 'production') {
    blockKeys.forEach((key) => {
      if (key.includes('#')) {
        throw new Error(
          `[use-digit-mask] Named block key "${key}" contains "#", which is reserved for digit slots. Use letters only (e.g. "DD", "MM", "YYYY").`,
        );
      }
    });
  }

  const sortedKeys = [...blockKeys].sort((a, b) => b.length - a.length);
  let resolvedMask = '';
  const groupOrder: string[] = [];
  const blockDigitStarts: number[] = [];
  let i = 0;
  let digitCount = 0;

  while (i < mask.length) {
    let matched = false;
    for (let k = 0; k < sortedKeys.length; k += 1) {
      const key = sortedKeys[k];
      if (mask.startsWith(key, i)) {
        blockDigitStarts.push(digitCount);
        resolvedMask += '#'.repeat(key.length);
        groupOrder.push(key);
        digitCount += key.length;
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      if (mask[i] === '#') digitCount += 1;
      resolvedMask += mask[i];
      i += 1;
    }
  }

  return { resolvedMask, groupOrder, blockDigitStarts };
}

export function buildNamedBlocksNormalize(
  blocks: Record<string, NamedBlock>,
  groupOrder: string[],
  blockDigitStarts: number[],
): BlocksNormalizeResult {
  const ranges = groupOrder.map((name, idx) => ({
    name,
    start: blockDigitStarts[idx] ?? 0,
    length: name.length,
  }));

  const computeNamedValues = (digits: string): Record<string, string> =>
    ranges.reduce<Record<string, string>>((acc, { name, start, length }) => {
      acc[name] = digits.slice(start, start + length);
      return acc;
    }, {});

  const computeValues = (digits: string): string[] =>
    ranges.map(({ start, length }) => digits.slice(start, start + length));

  function singlePass(digits: string): string {
    return ranges.reduce((result, { name, start, length }) => {
      const block = blocks[name];
      if (block == null) return result;
      const constraint: BlockConstraint = typeof block === 'function' ? block(computeNamedValues(result)) : block;
      return clampGroup(result, { start, length }, constraint);
    }, digits);
  }

  return {
    normalize: function applyNamedBlocks(digits: string): string {
      let result = digits;
      for (let pass = 0; pass < ranges.length; pass += 1) {
        const prev = result;
        result = singlePass(result);
        if (result === prev) break;
      }
      return result;
    },
    computeValues,
    computeNamedValues,
  };
}
