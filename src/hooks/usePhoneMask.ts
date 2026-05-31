import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_DIAL_PLANS,
  type DialPlan,
  dialPlanToCandidate,
  E164_MASK,
  type PhoneMaskCandidate,
  selectPhoneMask,
} from '../utils/dialPlans';
import { extractDigits } from '../utils/extractDigits';
import { formatDigitsWithMask } from '../utils/formatDigitsWithMask';

import { computeMaskMeta } from './internal/useMaskMeta';
import { type ParsedValues, type UseMaskProps } from './types';
import { useMask } from './useMask';

export type UsePhoneMaskProps = Omit<UseMaskProps, 'value' | 'mask'> & {
  value?: string;
  defaultValue?: string;
  dialPlans?: DialPlan[];
};

type ResolvedPlan = {
  mask: string;
  cc: string | null;
  id: string | null;
  prefix: string;
  prefixDigits: string;
  candidates: PhoneMaskCandidate[];
  parentPrefix?: string;
};

const EMPTY_PLAN: ResolvedPlan = {
  mask: E164_MASK,
  cc: null,
  id: null,
  prefix: '',
  prefixDigits: '',
  candidates: [],
};

function resolvePlan(digits: string, plans: DialPlan[], forcedId: string | null): ResolvedPlan {
  if (!digits) return EMPTY_PLAN;

  const result = selectPhoneMask(digits, plans);

  if (forcedId) {
    const forced = result.candidates.find((c) => c.id === forcedId);
    if (forced) return { ...forced, candidates: result.candidates };
  }

  return { ...result, prefixDigits: extractDigits(result.prefix) };
}

function isPhoneMaskCompleted(mask: string, allDigits: string): boolean {
  const meta = computeMaskMeta(mask);
  const slotDigits =
    meta.visiblePrefixDigits && allDigits.startsWith(meta.visiblePrefixDigits)
      ? allDigits.slice(meta.visiblePrefixDigits.length)
      : allDigits;
  return meta.maxDigits > 0 && slotDigits.length >= meta.maxDigits;
}

function patchParsedValues(parsed: ParsedValues, dialPlans: DialPlan[], forcedId: string | null): ParsedValues {
  const rawDigits = extractDigits(parsed.rawWithPrefix);
  const fresh = resolvePlan(rawDigits, dialPlans, forcedId);
  const body = rawDigits.startsWith(fresh.prefixDigits) ? rawDigits.slice(fresh.prefixDigits.length) : rawDigits;

  return {
    ...parsed,
    prefix: fresh.prefix,
    parentPrefix: fresh.parentPrefix,
    rawWithoutPrefix: body,
    isMaskCompleted: isPhoneMaskCompleted(fresh.mask, rawDigits),
  };
}

/**
 * Builds ParsedValues for a candidate switch (selectCandidate / selectPlan).
 * Uses only the data we already have — no useMask api dependency.
 */
function buildCandidateParsedValues(
  candidate: PhoneMaskCandidate,
  nextDigits: string,
  body: string,
  nextFormatted: string,
  parentPrefix: string | undefined,
): ParsedValues {
  let lastDigitIdx = -1;
  for (let i = 0; i < nextFormatted.length; i += 1) {
    if (/\d/.test(nextFormatted[i])) lastDigitIdx = i;
  }

  return {
    prefix: candidate.prefix,
    parentPrefix,
    rawWithPrefix: nextDigits,
    rawWithoutPrefix: body,
    formattedWithPrefix: nextFormatted,
    formattedWithoutPrefix: nextFormatted.slice(candidate.prefix.length).replace(/^\s+/, ''),
    formattedWithoutPlaceholderChars: lastDigitIdx >= 0 ? nextFormatted.slice(0, lastDigitIdx + 1) : candidate.prefix,
    isMaskCompleted: isPhoneMaskCompleted(candidate.mask, nextDigits),
  };
}

export function usePhoneMask({
  value,
  defaultValue = '',
  onChange,
  placeholderChar = '_',
  dialPlans = DEFAULT_DIAL_PLANS,
  trimMaskTail = false,
  ...rest
}: UsePhoneMaskProps) {
  const isControlled = value != null;
  const [localValue, setLocalValue] = useState(defaultValue);
  const [forcedId, setForcedId] = useState<string | null>(null);

  const sourceValue = isControlled ? value : localValue;
  const digits = useMemo(() => extractDigits(sourceValue), [sourceValue]);

  const { mask, cc, id, prefix, prefixDigits, candidates } = useMemo(
    () => resolvePlan(digits, dialPlans, forcedId),
    [digits, dialPlans, forcedId],
  );

  const { props, api, ghostValue } = useMask({
    ...rest,
    mask,
    value: sourceValue,
    placeholderChar,
    trimMaskTail,
    onChange: (next, parsed) => {
      // `prefix`/`prefixDigits` из замыкания отражают *предыдущий* рендер.
      // Резолвим заново по новым цифрам, чтобы ParsedValues были актуальны.
      if (!isControlled) setLocalValue(next);
      onChange?.(next, patchParsedValues(parsed, dialPlans, forcedId));
    },
  });

  const getParsedValues = useCallback(
    (formattedParam?: string): ParsedValues =>
      patchParsedValues(api.getParsedValues(formattedParam), dialPlans, forcedId),
    [api, dialPlans, forcedId],
  );

  const selectCandidate = useCallback(
    (candidate: PhoneMaskCandidate) => {
      setForcedId(candidate.id);

      const currentDigits = extractDigits(value ?? localValue);

      let body: string;
      if (currentDigits.startsWith(candidate.prefixDigits)) {
        body = currentDigits.slice(candidate.prefixDigits.length);
      } else if (prefixDigits && currentDigits.startsWith(prefixDigits)) {
        body = currentDigits.slice(prefixDigits.length);
      } else {
        body = '';
      }

      const nextDigits = candidate.prefixDigits + body;
      const nextFormatted = formatDigitsWithMask(nextDigits, candidate.mask, placeholderChar);

      if (!isControlled) setLocalValue(nextFormatted);
      onChange?.(
        nextFormatted,
        buildCandidateParsedValues(candidate, nextDigits, body, nextFormatted, candidate.parentPrefix),
      );
    },
    [isControlled, localValue, onChange, placeholderChar, prefixDigits, value],
  );

  const selectPlan = useCallback(
    (plan: DialPlan) => {
      selectCandidate(dialPlanToCandidate(plan));
    },
    [selectCandidate],
  );

  useEffect(() => {
    if (!forcedId) return;
    if (!digits) {
      setForcedId(null);
      return;
    }
    const { candidates: activeCandidates } = selectPhoneMask(digits, dialPlans);
    const stillValid = activeCandidates.some((c) => c.id === forcedId);
    if (!stillValid) setForcedId(null);
  }, [digits, dialPlans, forcedId]);

  return {
    props,
    api: { ...api, getParsedValues },
    ghostValue,
    mask,
    cc,
    id,
    prefix,
    candidates,
    allPlans: dialPlans,
    selectCandidate,
    selectPlan,
  } as const;
}
