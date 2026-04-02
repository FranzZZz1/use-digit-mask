export { useMask } from './hooks/useMask';
export { usePhoneMask } from './hooks/usePhoneMask';
export { selectPhoneMask, E164_MASK, MOCK_DIAL_PLANS } from './utils/dialPlans';

export type { UseMaskProps, ParsedValues } from './hooks/useMask';
export type { UsePhoneMaskProps } from './hooks/usePhoneMask';
export type { DialPlan, AltPrefix, PhoneMaskCandidate, PhoneMaskResult } from './utils/dialPlans';
