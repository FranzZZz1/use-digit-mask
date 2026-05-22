import { useCallback, useMemo } from 'react';

import { extractDigits } from '../../utils/extractDigits';

import { type MaskMeta } from './useMaskMeta';

export function usePrefixHandling(allowedPrefixes: string[], maskMeta: MaskMeta) {
  const allowedPrefixesDigits = useMemo(
    () => allowedPrefixes.map((prefix) => extractDigits(prefix)).filter(Boolean),
    [allowedPrefixes],
  );

  const stripVisiblePrefix = useCallback(
    (digits: string) => {
      const prefixDigits = extractDigits(maskMeta.visiblePrefix);
      if (!prefixDigits) return digits;
      return digits.startsWith(prefixDigits) ? digits.slice(prefixDigits.length) : digits;
    },
    [maskMeta.visiblePrefix],
  );

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

  return { allowedPrefixesDigits, stripVisiblePrefix, stripAllowedPrefix, getVisiblePrefix };
}
