import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_DIAL_PLANS,
  type DialPlan,
  E164_MASK,
  type PhoneMaskCandidate,
  selectPhoneMask,
} from '../utils/dialPlans';
import { formatDigitsWithMask } from '../utils/formatDigitsWithMask';

import { type ParsedValues, useMask } from './useMask';

export type UsePhoneMaskProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, parsed: ParsedValues) => void;
  placeholderChar?: string;
  dialPlans?: DialPlan[];
  trimMaskTail?: boolean;
};

type ResolvedPlan = {
  mask: string;
  cc: string | null;
  id: string | null;
  prefix: string;
  /** Digit-only portion of `prefix`. Derived once, used in multiple places. */
  prefixDigits: string;
  candidates: PhoneMaskCandidate[];
};

const extractDigits = (str: string) => str.replace(/\D/g, '');

const EMPTY_PLAN: ResolvedPlan = {
  mask: E164_MASK,
  cc: null,
  id: null,
  prefix: '',
  prefixDigits: '',
  candidates: [],
};

/**
 * Pure resolver — the single source of truth for mask/prefix derivation.
 * Called both during render (useMemo) and inside onChange to avoid stale closures.
 */
function resolvePlan(digits: string, plans: DialPlan[], forcedId: string | null): ResolvedPlan {
  if (!digits) return EMPTY_PLAN;

  const result = selectPhoneMask(digits, plans);

  if (forcedId) {
    const forced = result.candidates.find((c) => c.id === forcedId);
    if (forced) return { ...forced, candidates: result.candidates };
  }

  return { ...result, prefixDigits: extractDigits(result.prefix) };
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
): ParsedValues {
  const totalSlots = (candidate.mask.match(/#/g) ?? []).length;

  let lastDigitIdx = -1;
  for (let i = 0; i < nextFormatted.length; i += 1) {
    if (/\d/.test(nextFormatted[i])) lastDigitIdx = i;
  }

  return {
    prefix: candidate.prefix,
    rawWithPrefix: nextDigits,
    rawWithoutPrefix: body,
    formattedWithPrefix: nextFormatted,
    formattedWithoutPrefix: nextFormatted.slice(candidate.prefix.length).replace(/^\s+/, ''),
    formattedWithoutPlaceholderChars: lastDigitIdx >= 0 ? nextFormatted.slice(0, lastDigitIdx + 1) : candidate.prefix,
    isMaskCompleted: nextDigits.length >= totalSlots,
  };
}

export function usePhoneMask({
  value,
  defaultValue = '',
  onChange,
  placeholderChar = '_',
  dialPlans = DEFAULT_DIAL_PLANS,
  trimMaskTail = false,
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

  const { props, api } = useMask({
    mask,
    value: sourceValue,
    placeholderChar,
    trimMaskTail,
    onChange: (next, parsed) => {
      // `prefix`/`prefixDigits` from the closure reflect the *previous* render.
      // Re-resolve from the new digits so ParsedValues are always current.
      const rawDigits = extractDigits(parsed.rawWithPrefix);
      const fresh = resolvePlan(rawDigits, dialPlans, forcedId);

      if (!isControlled) setLocalValue(next);
      onChange?.(next, {
        ...parsed,
        prefix: fresh.prefix,
        rawWithoutPrefix: rawDigits.startsWith(fresh.prefixDigits)
          ? rawDigits.slice(fresh.prefixDigits.length)
          : rawDigits,
      });
    },
  });

  const selectCandidate = useCallback(
    (candidate: PhoneMaskCandidate) => {
      setForcedId(candidate.id);

      const currentDigits = extractDigits(value ?? localValue);

      // Preserve the body digits; swap only the prefix.
      let body: string;
      if (currentDigits.startsWith(candidate.prefixDigits)) {
        body = currentDigits.slice(candidate.prefixDigits.length);
      } else if (currentDigits.startsWith(prefixDigits)) {
        body = currentDigits.slice(prefixDigits.length);
      } else {
        body = currentDigits;
      }

      const nextDigits = candidate.prefixDigits + body;
      const nextFormatted = formatDigitsWithMask(nextDigits, candidate.mask, placeholderChar);

      if (!isControlled) setLocalValue(nextFormatted);
      onChange?.(nextFormatted, buildCandidateParsedValues(candidate, nextDigits, body, nextFormatted));
    },
    [isControlled, localValue, onChange, placeholderChar, prefixDigits, value],
  );

  const selectPlan = useCallback(
    (plan: DialPlan) => {
      const hasPlus = plan.hasPlus !== false;
      selectCandidate({
        id: plan.id ?? plan.cc,
        cc: plan.cc,
        prefix: hasPlus ? `+${plan.cc}` : plan.cc,
        prefixDigits: plan.cc,
        mask: `${hasPlus ? '+' : ''}${'#'.repeat(plan.cc.length)} ${plan.pattern}`,
        label: plan.label,
      });
    },
    [selectCandidate],
  );

  useEffect(() => {
    if (digits.length === 0) setForcedId(null);
  }, [digits, dialPlans]);

  return { props, api, mask, cc, id, prefix, candidates, allPlans: dialPlans, selectCandidate, selectPlan } as const;
}
