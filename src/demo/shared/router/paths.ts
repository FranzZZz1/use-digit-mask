export function buildSectionLink(page: string, section: string): string {
  return `${page}#${section}`;
}

export const SECTION_IDS = {
  overview: 'overview',
  parameters: 'parameters',
  returnValue: 'return-value',
  parsedValues: 'parsed-values',
  dialPlan: 'dial-plan',
  phoneMaskCandidate: 'phone-mask-candidate',
  customization: 'customization',
  radixExample: 'radix-example',
  home: {
    useMask: 'use-mask',
    usePhoneMask: 'use-phone-mask',
    useCountrySelect: 'use-country-select',
  },
} as const;

export const SEGMENTS = {
  useMask: 'use-mask',
  usePhoneMask: 'use-phone-mask',
  useCountrySelect: 'use-country-select',
} as const;

export const PATHS = {
  home: '/',
  docs: '/docs',
  useMask: `/docs/${SEGMENTS.useMask}`,
  usePhoneMask: `/docs/${SEGMENTS.usePhoneMask}`,
  useCountrySelect: `/docs/${SEGMENTS.useCountrySelect}`,
} as const;

export const TYPE_LINKS: Record<string, string> = {
  ParsedValues: buildSectionLink(PATHS.useMask, SECTION_IDS.parsedValues),
  DialPlan: buildSectionLink(PATHS.usePhoneMask, SECTION_IDS.dialPlan),
  PhoneMaskCandidate: buildSectionLink(PATHS.usePhoneMask, SECTION_IDS.phoneMaskCandidate),
};
