import { useCallback, useMemo } from 'react';

import { extractDigits } from '../../utils/extractDigits';

import { type MaskMeta } from './useMaskMeta';

export function usePrefixHandling(allowedPrefixes: string[], maskMeta: MaskMeta) {
  const allowedPrefixesDigits = useMemo(() => {
    const base = allowedPrefixes.length > 0 ? allowedPrefixes : [maskMeta.visiblePrefix];
    return base.map((prefix) => extractDigits(prefix)).filter(Boolean);
  }, [allowedPrefixes, maskMeta.visiblePrefix]);

  const stripAllowedPrefix = useCallback(
    (digits: string) => {
      if (allowedPrefixesDigits.length === 0) return digits;
      const match = allowedPrefixesDigits.find((prefixDigits) => prefixDigits && digits.startsWith(prefixDigits));
      return match ? digits.slice(match.length) : digits;
    },
    [allowedPrefixesDigits],
  );

  const getVisiblePrefix = useCallback(
    (rawInput: string) => {
      const fromAllowed = allowedPrefixes.find((prefix) => rawInput.startsWith(prefix));
      if (fromAllowed) return fromAllowed;
      return rawInput.startsWith(maskMeta.visiblePrefix) ? maskMeta.visiblePrefix : '';
    },
    [allowedPrefixes, maskMeta.visiblePrefix],
  );

  return { allowedPrefixesDigits, stripAllowedPrefix, getVisiblePrefix };
}
