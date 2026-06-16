import { type PropDef } from './useMaskDef';

const bool = { kind: 'boolean' as const };
const str = (placeholder?: string, maxLength?: number) => ({ kind: 'string' as const, placeholder, maxLength });
const select = { kind: 'select' as const };

export const USE_PHONE_MASK_PARAMS: PropDef[] = [
  { name: 'value', type: 'string' },
  { name: 'defaultValue', type: 'string', default: '""' },
  { name: 'onChange', type: '(value: string, parsed: ParsedValues) => void' },
  { name: 'placeholderChar', type: 'string', default: '"_"', control: str('_', 1) },
  { name: 'dialPlans', type: 'DialPlan[]', default: 'DEFAULT_DIAL_PLANS' },
  { name: 'country', type: 'DefaultCountryId | string', control: select },
  { name: 'trimMaskTail', type: 'boolean', default: 'false', control: bool },
  { name: 'ghostChar', type: 'string', default: 'placeholderChar', control: str('·', 1) },
];

export const USE_PHONE_MASK_RETURN_VALUES: PropDef[] = [
  { name: 'ghostValue', type: 'string' },
  { name: 'props', type: 'ComponentPropsWithRef<"input">' },
  { name: 'api', type: '{ formatDigits, getParsedValues }' },
  { name: 'mask', type: 'string' },
  { name: 'cc', type: 'string | null' },
  { name: 'id', type: 'string | null' },
  { name: 'prefix', type: 'string' },
  { name: 'candidates', type: 'PhoneMaskCandidate[]' },
  { name: 'allPlans', type: 'DialPlan[]' },
  { name: 'selectCandidate', type: '(candidate: PhoneMaskCandidate) => void' },
  { name: 'selectPlan', type: '(plan: DialPlan) => void' },
];

export const PHONE_MASK_CANDIDATE_FIELDS: PropDef[] = [
  { name: 'id', type: 'string', required: true },
  { name: 'mask', type: 'string', required: true },
  { name: 'cc', type: 'string', required: true },
  { name: 'prefix', type: 'string', required: true },
  { name: 'prefixDigits', type: 'string', required: true },
  { name: 'label', type: 'string' },
];

export const DIAL_PLAN_FIELDS: PropDef[] = [
  { name: 'cc', type: 'string', required: true },
  { name: 'pattern', type: 'string', required: true },
  { name: 'id', type: 'string' },
  { name: 'label', type: 'string' },
  { name: 'hasPlus', type: 'boolean', default: 'true' },
  { name: 'altPrefixes', type: 'string[]' },
];
