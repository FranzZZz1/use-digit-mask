import  { type DialPlan } from './types';

/**
 * Default dial-plans map.
 * Key = ISO 3166-1 alpha-2 country code.
 * Multiple countries can share the same `cc` (e.g. US/CA both use +1, RU/KZ both use +7).
 * Override or extend entries via `mergeDialPlans()`.
 */
export const DEFAULT_DIAL_PLANS_MAP: Record<string, DialPlan> = {
  // ── Americas ──────────────────────────────────────────────────────────────
  US: { id: 'US', cc: '1', pattern: '(###) ###-####', label: 'United States' },
  CA: { id: 'CA', cc: '1', pattern: '(###) ###-####', label: 'Canada' },
  PE: { id: 'PE', cc: '51', pattern: '### ### ###', label: 'Peru' },
  MX: { id: 'MX', cc: '52', pattern: '## #### ####', label: 'Mexico' },
  AR: { id: 'AR', cc: '54', pattern: '(##) ####-####', label: 'Argentina' },
  BR: { id: 'BR', cc: '55', pattern: '(##) #####-####', label: 'Brazil' },
  CL: { id: 'CL', cc: '56', pattern: '# ####-####', label: 'Chile' },
  CO: { id: 'CO', cc: '57', pattern: '### ###-####', label: 'Colombia' },
  VE: { id: 'VE', cc: '58', pattern: '###-###-####', label: 'Venezuela' },

  // ── Europe — West ─────────────────────────────────────────────────────────
  RU: {
    id: 'RU',
    cc: '7',
    pattern: '(###) ###-##-##',
    label: 'Russia',
    altPrefixes: ['8'],
  },
  KZ: { id: 'KZ', cc: '7', pattern: '(###) ###-##-##', label: 'Kazakhstan' },
  GR: { id: 'GR', cc: '30', pattern: '### ### ####', label: 'Greece' },
  NL: { id: 'NL', cc: '31', pattern: '# ########', label: 'Netherlands' },
  BE: { id: 'BE', cc: '32', pattern: '### ## ## ##', label: 'Belgium' },
  FR: { id: 'FR', cc: '33', pattern: '# ## ## ## ##', label: 'France' },
  ES: { id: 'ES', cc: '34', pattern: '### ### ###', label: 'Spain' },
  IT: { id: 'IT', cc: '39', pattern: '### ### ####', label: 'Italy' },
  CH: { id: 'CH', cc: '41', pattern: '## ### ## ##', label: 'Switzerland' },
  AT: { id: 'AT', cc: '43', pattern: '### ######', label: 'Austria' },
  GB: { id: 'GB', cc: '44', pattern: '#### ######', label: 'UK' },
  DK: { id: 'DK', cc: '45', pattern: '## ## ## ##', label: 'Denmark' },
  SE: { id: 'SE', cc: '46', pattern: '##-### ## ##', label: 'Sweden' },
  NO: { id: 'NO', cc: '47', pattern: '### ## ###', label: 'Norway' },
  DE: { id: 'DE', cc: '49', pattern: '### #######', label: 'Germany' },
  PT: { id: 'PT', cc: '351', pattern: '### ### ###', label: 'Portugal' },
  LU: { id: 'LU', cc: '352', pattern: '### ### ###', label: 'Luxembourg' },
  IE: { id: 'IE', cc: '353', pattern: '## ### ####', label: 'Ireland' },
  IS: { id: 'IS', cc: '354', pattern: '### ####', label: 'Iceland' },
  FI: { id: 'FI', cc: '358', pattern: '## ### ####', label: 'Finland' },

  // ── Europe — East & Central ───────────────────────────────────────────────
  HU: { id: 'HU', cc: '36', pattern: '## ### ####', label: 'Hungary' },
  RO: { id: 'RO', cc: '40', pattern: '## ### ####', label: 'Romania' },
  PL: { id: 'PL', cc: '48', pattern: '### ### ###', label: 'Poland' },
  BG: { id: 'BG', cc: '359', pattern: '## ### ####', label: 'Bulgaria' },
  LT: { id: 'LT', cc: '370', pattern: '### #####', label: 'Lithuania' },
  LV: { id: 'LV', cc: '371', pattern: '## ### ###', label: 'Latvia' },
  EE: { id: 'EE', cc: '372', pattern: '#### ####', label: 'Estonia' },
  MD: { id: 'MD', cc: '373', pattern: '## ### ###', label: 'Moldova' },
  AM: { id: 'AM', cc: '374', pattern: '## ######', label: 'Armenia' },
  BY: { id: 'BY', cc: '375', pattern: '(##) ###-##-##', label: 'Belarus' },
  UA: { id: 'UA', cc: '380', pattern: '(##) ###-##-##', label: 'Ukraine' },
  RS: { id: 'RS', cc: '381', pattern: '## ### ####', label: 'Serbia' },
  HR: { id: 'HR', cc: '385', pattern: '## ### ####', label: 'Croatia' },
  SI: { id: 'SI', cc: '386', pattern: '## ### ###', label: 'Slovenia' },
  BA: { id: 'BA', cc: '387', pattern: '## ### ###', label: 'Bosnia' },
  MK: { id: 'MK', cc: '389', pattern: '## ### ###', label: 'North Macedonia' },
  CZ: { id: 'CZ', cc: '420', pattern: '### ### ###', label: 'Czech Republic' },
  SK: { id: 'SK', cc: '421', pattern: '### ### ###', label: 'Slovakia' },

  // ── Asia — East & South-East ──────────────────────────────────────────────
  MY: { id: 'MY', cc: '60', pattern: '##-###-####', label: 'Malaysia' },
  AU: { id: 'AU', cc: '61', pattern: '### ### ###', label: 'Australia' },
  ID: { id: 'ID', cc: '62', pattern: '###-###-####', label: 'Indonesia' },
  PH: { id: 'PH', cc: '63', pattern: '### ### ####', label: 'Philippines' },
  NZ: { id: 'NZ', cc: '64', pattern: '## ### ####', label: 'New Zealand' },
  SG: { id: 'SG', cc: '65', pattern: '#### ####', label: 'Singapore' },
  TH: { id: 'TH', cc: '66', pattern: '##-###-####', label: 'Thailand' },
  JP: { id: 'JP', cc: '81', pattern: '##-####-####', label: 'Japan' },
  KR: { id: 'KR', cc: '82', pattern: '##-####-####', label: 'South Korea' },
  VN: { id: 'VN', cc: '84', pattern: '### ### ####', label: 'Vietnam' },
  CN: { id: 'CN', cc: '86', pattern: '###-####-####', label: 'China' },

  // ── Asia — South, West & Middle East ─────────────────────────────────────
  TR: { id: 'TR', cc: '90', pattern: '(###) ### ## ##', label: 'Turkey' },
  IN: { id: 'IN', cc: '91', pattern: '#####-#####', label: 'India' },
  PK: { id: 'PK', cc: '92', pattern: '### #######', label: 'Pakistan' },
  IR: { id: 'IR', cc: '98', pattern: '### ### ####', label: 'Iran' },
  SA: { id: 'SA', cc: '966', pattern: '## ### ####', label: 'Saudi Arabia' },
  AE: { id: 'AE', cc: '971', pattern: '## ### ####', label: 'UAE' },
  IL: { id: 'IL', cc: '972', pattern: '##-###-####', label: 'Israel' },
  BH: { id: 'BH', cc: '973', pattern: '#### ####', label: 'Bahrain' },
  QA: { id: 'QA', cc: '974', pattern: '#### ####', label: 'Qatar' },

  // ── Africa ────────────────────────────────────────────────────────────────
  EG: { id: 'EG', cc: '20', pattern: '## #### ####', label: 'Egypt' },
  ZA: { id: 'ZA', cc: '27', pattern: '## ### ####', label: 'South Africa' },
  MA: { id: 'MA', cc: '212', pattern: '##-####-####', label: 'Morocco' },
  DZ: { id: 'DZ', cc: '213', pattern: '# ## ## ## ##', label: 'Algeria' },
  TN: { id: 'TN', cc: '216', pattern: '## ### ###', label: 'Tunisia' },
  NG: { id: 'NG', cc: '234', pattern: '### ### ####', label: 'Nigeria' },
  KE: { id: 'KE', cc: '254', pattern: '### ### ###', label: 'Kenya' },
};

/** Default plans as an array — pass directly to `usePhoneMask` / `selectPhoneMask`. */
export const DEFAULT_DIAL_PLANS: DialPlan[] = Object.values(DEFAULT_DIAL_PLANS_MAP);

/** @deprecated Use `DEFAULT_DIAL_PLANS` instead. */
export const MOCK_DIAL_PLANS = DEFAULT_DIAL_PLANS;
