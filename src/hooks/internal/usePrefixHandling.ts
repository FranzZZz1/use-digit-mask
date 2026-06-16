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
      const prefixDigits = maskMeta.visiblePrefixDigits;
      if (!prefixDigits) return digits;
      return digits.startsWith(prefixDigits) ? digits.slice(prefixDigits.length) : digits;
    },
    [maskMeta.visiblePrefixDigits],
  );

  const startsWithAllowedPrefix = useCallback(
    (digits: string) => allowedPrefixesDigits.some((pd) => pd && digits.startsWith(pd)),
    [allowedPrefixesDigits],
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
      if (maskMeta.prefixLength > 0) {
        const fromAllowed = allowedPrefixes.find((prefix) => rawInput.startsWith(prefix));
        if (fromAllowed) return fromAllowed;
      }
      return rawInput.startsWith(maskMeta.visiblePrefix) ? maskMeta.visiblePrefix.replace(/\D+$/, '') : '';
    },
    [allowedPrefixes, maskMeta.prefixLength, maskMeta.visiblePrefix],
  );

  return { allowedPrefixesDigits, stripVisiblePrefix, startsWithAllowedPrefix, stripAllowedPrefix, getVisiblePrefix };
}
