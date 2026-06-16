import { useEffect, useMemo, useRef, useState } from 'react';

import { useDebounced } from '@/shared/lib';

import { type BlockConstraintRecord } from './buildCode';

function detectLetterGroups(mask: string): string[] {
  const groups: string[] = [];
  const seen = new Set<string>();
  let i = 0;
  while (i < mask.length) {
    const ch = mask[i];
    if (/[a-zA-Z]/.test(ch)) {
      let j = i + 1;
      while (j < mask.length && mask[j] === ch) j += 1;
      const token = mask.slice(i, j);
      if (!seen.has(token)) {
        seen.add(token);
        groups.push(token);
      }
      i = j;
    } else {
      i += 1;
    }
  }
  return groups;
}

function groupFill(group: string, constraint: { min?: number; max?: number } | null): string {
  const len = group.length;
  if (constraint?.min !== undefined) return String(constraint.min).padStart(len, '0');
  return '0'.repeat(len);
}

type UseMaskGroupsResult = {
  letterGroups: string[];
  effectiveBlocks: BlockConstraintRecord | undefined;
  debouncedBlocks: BlockConstraintRecord | undefined;
  maskValue: string;
  setMaskValue: (v: string) => void;
};

export function useMaskGroups(mask: string, blocks: BlockConstraintRecord): UseMaskGroupsResult {
  const letterGroups = useMemo(() => detectLetterGroups(mask), [mask]);
  const effectiveBlocks = letterGroups.length > 0 ? blocks : undefined;
  const debouncedBlocks = useDebounced(effectiveBlocks, 400);

  const [maskValue, setMaskValue] = useState('');
  const prevGroupCountRef = useRef<number | null>(null);

  useEffect(() => {
    const count = letterGroups.length > 0 ? letterGroups.length : null;
    if (count === prevGroupCountRef.current) return;
    prevGroupCountRef.current = count;

    if (count === null) {
      setMaskValue('');
      return;
    }

    setMaskValue(letterGroups.map((g) => groupFill(g, effectiveBlocks?.[g] ?? null)).join(''));
  }, [letterGroups, effectiveBlocks]);

  return { letterGroups, effectiveBlocks, debouncedBlocks, maskValue, setMaskValue };
}
