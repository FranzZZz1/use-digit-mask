import { extractDigits } from '../extractDigits';

import { DEFAULT_DIAL_PLANS } from './defaultPlans';
import { dialPlanToCandidate } from './dialPlanToCandidate';
import { type DialPlan, type PhoneMaskCandidate, type PhoneMaskResult } from './types';

export const E164_MASK = '+###############';

const FALLBACK: PhoneMaskResult = {
  mask: E164_MASK,
  cc: null,
  id: null,
  prefix: '',
  candidates: [],
};

export function selectPhoneMask(rawDigits: string, plans: DialPlan[] = DEFAULT_DIAL_PLANS): PhoneMaskResult {
  const digits = extractDigits(rawDigits);
  if (!digits) return FALLBACK;

  const candidates: PhoneMaskCandidate[] = plans.flatMap((plan) => {
    const planId = plan.id ?? plan.cc;

    const main: PhoneMaskCandidate[] =
      digits.startsWith(plan.cc) || plan.cc.startsWith(digits) ? [dialPlanToCandidate(plan)] : [];

    const alts: PhoneMaskCandidate[] = (plan.altPrefixes ?? [])
      .map((altPrefix) => {
        const sign = altPrefix.startsWith('+') ? '+' : '';
        const prefixDigits = extractDigits(altPrefix);
        return {
          id: planId,
          cc: plan.cc,
          prefix: altPrefix,
          prefixDigits,
          mask: `${sign}${'#'.repeat(prefixDigits.length)} ${plan.pattern}`,
          label: plan.label,
        };
      })
      .filter((c) => digits.startsWith(c.prefixDigits) || c.prefixDigits.startsWith(digits));

    return [...main, ...alts];
  });

  if (candidates.length === 0) return FALLBACK;

  const matched = candidates.filter((c) => digits.startsWith(c.prefixDigits));
  const best =
    matched.length > 0
      ? matched.reduce((a, b) => (b.prefixDigits.length > a.prefixDigits.length ? b : a))
      : candidates[0];

  if (!best) return FALLBACK;

  return {
    mask: best.mask,
    cc: best.cc,
    id: best.id,
    prefix: best.prefix,
    candidates: candidates.length > 1 ? candidates : [],
  };
}
