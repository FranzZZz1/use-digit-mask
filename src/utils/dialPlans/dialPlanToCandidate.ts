import { type DialPlan, type PhoneMaskCandidate } from './types';

export function dialPlanToCandidate(plan: DialPlan): PhoneMaskCandidate {
  const hasPlus = plan.hasPlus !== false;
  const prefixDigits = plan.cc;
  return {
    id: plan.id ?? plan.cc,
    cc: plan.cc,
    prefix: hasPlus ? `+${plan.cc}` : plan.cc,
    prefixDigits,
    mask: `${hasPlus ? '+' : ''}${'#'.repeat(plan.cc.length)} ${plan.pattern}`,
    label: plan.label,
  };
}
