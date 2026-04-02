import { useCallback, useEffect, useMemo, useState } from 'react';

import { type DialPlan, MOCK_DIAL_PLANS, type PhoneMaskCandidate, selectPhoneMask } from '../utils/dialPlans';

import { type ParsedValues, useMask } from './useMask';

export type UsePhoneMaskProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, parsed: ParsedValues) => void;
  placeholderChar?: string;
  dialPlans?: DialPlan[];
  trimMaskTail?: boolean;
};

const extractDigits = (str: string) => str.replace(/\D/g, '');

export function usePhoneMask({
  value,
  defaultValue = '',
  onChange,
  placeholderChar = '_',
  dialPlans = MOCK_DIAL_PLANS,
  trimMaskTail = false,
}: UsePhoneMaskProps) {
  const isControlled = value != null;
  const [localValue, setLocalValue] = useState(defaultValue);
  const [forcedCC, setForcedCC] = useState<string | null>(null);

  const sourceValue = isControlled ? value : localValue;
  const digits = useMemo(() => sourceValue.replace(/\D/g, ''), [sourceValue]);

  const { mask, cc, prefix, candidates } = useMemo(() => {
    const result = selectPhoneMask(digits, dialPlans);

    if (forcedCC) {
      const forced = result.candidates.find((c) => c.cc === forcedCC);
      if (forced) return { ...forced, candidates: result.candidates };
    }

    return result;
  }, [digits, dialPlans, forcedCC]);

  const prefixDigits = useMemo(() => extractDigits(prefix), [prefix]);

  const { props, api } = useMask({
    mask,
    value: sourceValue,
    placeholderChar,
    trimMaskTail,
    onChange: (next, parsed) => {
      const rawDigits = extractDigits(parsed.rawWithPrefix);

      const enriched: ParsedValues = {
        ...parsed,
        prefix,
        rawWithoutPrefix: rawDigits.startsWith(prefixDigits) ? rawDigits.slice(prefixDigits.length) : rawDigits,
      };
      if (!isControlled) setLocalValue(next);
      onChange?.(next, enriched);
    },
  });

  const selectCandidate = useCallback(
    (candidate: PhoneMaskCandidate) => {
      setForcedCC(candidate.cc);

      const currentDigits = extractDigits(isControlled ? value : localValue);
      const oldPrefixDigits = prefixDigits;
      const newPrefixDigits = candidate.prefixDigits;

      let nextDigits: string;

      if (candidate.cc === cc) {
        const body = currentDigits.startsWith(oldPrefixDigits)
          ? currentDigits.slice(oldPrefixDigits.length)
          : currentDigits;
        nextDigits = newPrefixDigits + body;
      } else {
        nextDigits = currentDigits;
      }

      const { text: nextFormatted } = api.formatDigits(nextDigits);

      if (!isControlled) setLocalValue(nextFormatted);
      onChange?.(nextFormatted, api.getParsedValues(nextFormatted));
    },
    [api, cc, isControlled, localValue, onChange, prefixDigits, value],
  );

  useEffect(() => {
    if (digits.length === 0) setForcedCC(null);
  }, [digits, dialPlans]);

  return { props, api, mask, cc, prefix, candidates, selectCandidate } as const;
}
