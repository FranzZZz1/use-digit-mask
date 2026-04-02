export type AltPrefix = {
  digits: string;
  hasPlus: boolean;
};

export type DialPlan = {
  cc: string;
  pattern: string;
  label?: string;
  altPrefixes?: AltPrefix[];
};

export const MOCK_DIAL_PLANS: DialPlan[] = [
  { cc: '1', pattern: '(###) ###-####', label: 'US / Canada' },
  {
    cc: '7',
    pattern: '(###) ###-##-##',
    label: 'Russia',
    altPrefixes: [{ digits: '8', hasPlus: false }],
  },
  { cc: '44', pattern: '#### ######', label: 'UK' },
  { cc: '49', pattern: '(###) ########', label: 'Germany' },
  { cc: '86', pattern: '(##) ###-##-##', label: 'China' },
  { cc: '380', pattern: '(##) ###-##-##', label: 'Ukraine' },
];

export const E164_MASK = '+###############';

const FALLBACK = { mask: E164_MASK, cc: null, prefix: '+' } as const;

export type PhoneMaskCandidate = {
  mask: string;
  cc: string;
  prefix: string;
  prefixDigits: string;
  label?: string;
};

export type PhoneMaskResult = {
  mask: string;
  cc: string | null;
  prefix: string;
  candidates: PhoneMaskCandidate[];
};

const extractDigits = (str: string) => str.replace(/\D/g, '');

export function selectPhoneMask(rawDigits: string, plans: DialPlan[] = MOCK_DIAL_PLANS): PhoneMaskResult {
  const digits = extractDigits(rawDigits);
  if (!digits) return { ...FALLBACK, candidates: [] };

  const candidates: PhoneMaskCandidate[] = plans.flatMap((plan) => {
    const main: PhoneMaskCandidate[] =
      digits.startsWith(plan.cc) || plan.cc.startsWith(digits)
        ? [
            {
              cc: plan.cc,
              prefix: `+${plan.cc}`,
              prefixDigits: plan.cc,
              mask: `+${'#'.repeat(plan.cc.length)} ${plan.pattern}`,
              label: plan.label,
            },
          ]
        : [];

    const alts: PhoneMaskCandidate[] = (plan.altPrefixes ?? [])
      .filter((alt) => digits.startsWith(alt.digits) || alt.digits.startsWith(digits))
      .map((alt) => {
        const plusSign = alt.hasPlus ? '+' : '';
        const prefix = `${plusSign}${alt.digits}`;
        return {
          cc: plan.cc,
          prefix,
          prefixDigits: extractDigits(prefix),
          mask: `${plusSign}${'#'.repeat(alt.digits.length)} ${plan.pattern}`,
          label: plan.label,
        };
      });

    return [...main, ...alts];
  });

  if (candidates.length === 0) return { ...FALLBACK, candidates: [] };

  const matched = candidates.filter((c) => digits.startsWith(c.prefixDigits));
  const best =
    matched.length > 0
      ? matched.reduce((a, b) => (b.prefixDigits.length > a.prefixDigits.length ? b : a))
      : candidates[0];

  if (!best) return { ...FALLBACK, candidates: [] };

  return {
    mask: best.mask,
    cc: best.cc,
    prefix: best.prefix,
    candidates: candidates.length > 1 ? candidates : [],
  };
}
