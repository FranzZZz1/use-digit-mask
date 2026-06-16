export function buildSectionLink(page: string, section: string): string {
  return `${page}#${section}`;
}

export const SECTION_IDS = {
  overview: 'overview',
  parameters: 'parameters',
  returnValue: 'return-value',
  parsedValues: 'parsed-values',
  recipes: 'recipes',
  dialPlan: 'dial-plan',
  phoneMaskCandidate: 'phone-mask-candidate',
  customization: 'customization',
  radixExample: 'radix-example',
  home: {
    useMask: 'use-mask',
    useDateMask: 'use-date-mask',
    usePhoneMask: 'use-phone-mask',
    useCountrySelect: 'use-country-select',
  },
} as const;

export const SEGMENTS = {
  useMask: 'use-mask',
  useDateMask: 'use-date-mask',
  usePhoneMask: 'use-phone-mask',
  useCountrySelect: 'use-country-select',
  examples: 'examples',
} as const;

export const PATHS = {
  home: '/',
  changelog: '/changelog',
  docs: '/docs',
  useMask: `/docs/${SEGMENTS.useMask}`,
  useMaskExamples: `/docs/${SEGMENTS.useMask}/${SEGMENTS.examples}`,
  useDateMask: `/docs/${SEGMENTS.useDateMask}`,
  useDateMaskExamples: `/docs/${SEGMENTS.useDateMask}/${SEGMENTS.examples}`,
  usePhoneMask: `/docs/${SEGMENTS.usePhoneMask}`,
  usePhoneMaskExamples: `/docs/${SEGMENTS.usePhoneMask}/${SEGMENTS.examples}`,
  useCountrySelect: `/docs/${SEGMENTS.useCountrySelect}`,
  useCountrySelectExamples: `/docs/${SEGMENTS.useCountrySelect}/${SEGMENTS.examples}`,
} as const;

export const TYPE_LINKS: Record<string, string> = {
  ParsedValues: buildSectionLink(PATHS.useMask, SECTION_IDS.parsedValues),
  DialPlan: buildSectionLink(PATHS.usePhoneMask, SECTION_IDS.dialPlan),
  PhoneMaskCandidate: buildSectionLink(PATHS.usePhoneMask, SECTION_IDS.phoneMaskCandidate),
};
