import  { type DialPlan } from './types';

/**
 * Default dial-plans map.
 * Key = ISO 3166-1 alpha-2 country code.
 * Multiple countries can share the same `cc` (e.g. US/CA both use +1, RU/KZ both use +7).
 * Override or extend entries via `mergeDialPlans()`.
 */
/** Union of all built-in country IDs (keys of `DEFAULT_DIAL_PLANS_MAP`). */
export type DefaultCountryId = keyof typeof DEFAULT_DIAL_PLANS_MAP;

export const DEFAULT_DIAL_PLANS_MAP = {
  // ── Americas ──────────────────────────────────────────────────────────────
  US: { id: 'US', cc: '1', pattern: '(###) ###-####', label: { en: 'United States', ru: 'США' } },
  CA: { id: 'CA', cc: '1', pattern: '(###) ###-####', label: { en: 'Canada', ru: 'Канада' } },
  PE: { id: 'PE', cc: '51', pattern: '### ### ###', label: { en: 'Peru', ru: 'Перу' } },
  MX: { id: 'MX', cc: '52', pattern: '## #### ####', label: { en: 'Mexico', ru: 'Мексика' } },
  AR: { id: 'AR', cc: '54', pattern: '(##) ####-####', label: { en: 'Argentina', ru: 'Аргентина' } },
  BR: { id: 'BR', cc: '55', pattern: '(##) #####-####', label: { en: 'Brazil', ru: 'Бразилия' } },
  CL: { id: 'CL', cc: '56', pattern: '# ####-####', label: { en: 'Chile', ru: 'Чили' } },
  CO: { id: 'CO', cc: '57', pattern: '### ###-####', label: { en: 'Colombia', ru: 'Колумбия' } },
  VE: { id: 'VE', cc: '58', pattern: '###-###-####', label: { en: 'Venezuela', ru: 'Венесуэла' } },

  // ── Europe — West ─────────────────────────────────────────────────────────
  RU: {
    id: 'RU',
    cc: '7',
    pattern: '(###) ###-##-##',
    label: { en: 'Russia', ru: 'Россия' },
    altPrefixes: ['8'],
  },
  KZ: { id: 'KZ', cc: '7', pattern: '(###) ###-##-##', label: { en: 'Kazakhstan', ru: 'Казахстан' } },
  GR: { id: 'GR', cc: '30', pattern: '### ### ####', label: { en: 'Greece', ru: 'Греция' } },
  NL: { id: 'NL', cc: '31', pattern: '# ########', label: { en: 'Netherlands', ru: 'Нидерланды' } },
  BE: { id: 'BE', cc: '32', pattern: '### ## ## ##', label: { en: 'Belgium', ru: 'Бельгия' } },
  FR: { id: 'FR', cc: '33', pattern: '# ## ## ## ##', label: { en: 'France', ru: 'Франция' } },
  ES: { id: 'ES', cc: '34', pattern: '### ### ###', label: { en: 'Spain', ru: 'Испания' } },
  IT: { id: 'IT', cc: '39', pattern: '### ### ####', label: { en: 'Italy', ru: 'Италия' } },
  CH: { id: 'CH', cc: '41', pattern: '## ### ## ##', label: { en: 'Switzerland', ru: 'Швейцария' } },
  AT: { id: 'AT', cc: '43', pattern: '### ######', label: { en: 'Austria', ru: 'Австрия' } },
  GB: { id: 'GB', cc: '44', pattern: '#### ######', label: { en: 'UK', ru: 'Великобритания' } },
  DK: { id: 'DK', cc: '45', pattern: '## ## ## ##', label: { en: 'Denmark', ru: 'Дания' } },
  SE: { id: 'SE', cc: '46', pattern: '##-### ## ##', label: { en: 'Sweden', ru: 'Швеция' } },
  NO: { id: 'NO', cc: '47', pattern: '### ## ###', label: { en: 'Norway', ru: 'Норвегия' } },
  DE: { id: 'DE', cc: '49', pattern: '### #######', label: { en: 'Germany', ru: 'Германия' } },
  PT: { id: 'PT', cc: '351', pattern: '### ### ###', label: { en: 'Portugal', ru: 'Португалия' } },
  LU: { id: 'LU', cc: '352', pattern: '### ### ###', label: { en: 'Luxembourg', ru: 'Люксембург' } },
  IE: { id: 'IE', cc: '353', pattern: '## ### ####', label: { en: 'Ireland', ru: 'Ирландия' } },
  IS: { id: 'IS', cc: '354', pattern: '### ####', label: { en: 'Iceland', ru: 'Исландия' } },
  FI: { id: 'FI', cc: '358', pattern: '## ### ####', label: { en: 'Finland', ru: 'Финляндия' } },

  // ── Europe — East & Central ───────────────────────────────────────────────
  HU: { id: 'HU', cc: '36', pattern: '## ### ####', label: { en: 'Hungary', ru: 'Венгрия' } },
  RO: { id: 'RO', cc: '40', pattern: '## ### ####', label: { en: 'Romania', ru: 'Румыния' } },
  PL: { id: 'PL', cc: '48', pattern: '### ### ###', label: { en: 'Poland', ru: 'Польша' } },
  BG: { id: 'BG', cc: '359', pattern: '## ### ####', label: { en: 'Bulgaria', ru: 'Болгария' } },
  LT: { id: 'LT', cc: '370', pattern: '### #####', label: { en: 'Lithuania', ru: 'Литва' } },
  LV: { id: 'LV', cc: '371', pattern: '## ### ###', label: { en: 'Latvia', ru: 'Латвия' } },
  EE: { id: 'EE', cc: '372', pattern: '#### ####', label: { en: 'Estonia', ru: 'Эстония' } },
  MD: { id: 'MD', cc: '373', pattern: '## ### ###', label: { en: 'Moldova', ru: 'Молдова' } },
  AM: { id: 'AM', cc: '374', pattern: '## ######', label: { en: 'Armenia', ru: 'Армения' } },
  BY: { id: 'BY', cc: '375', pattern: '(##) ###-##-##', label: { en: 'Belarus', ru: 'Беларусь' } },
  UA: { id: 'UA', cc: '380', pattern: '(##) ###-##-##', label: { en: 'Ukraine', ru: 'Украина' } },
  RS: { id: 'RS', cc: '381', pattern: '## ### ####', label: { en: 'Serbia', ru: 'Сербия' } },
  HR: { id: 'HR', cc: '385', pattern: '## ### ####', label: { en: 'Croatia', ru: 'Хорватия' } },
  SI: { id: 'SI', cc: '386', pattern: '## ### ###', label: { en: 'Slovenia', ru: 'Словения' } },
  BA: { id: 'BA', cc: '387', pattern: '## ### ###', label: { en: 'Bosnia', ru: 'Босния и Герцеговина' } },
  MK: { id: 'MK', cc: '389', pattern: '## ### ###', label: { en: 'North Macedonia', ru: 'Северная Македония' } },
  CZ: { id: 'CZ', cc: '420', pattern: '### ### ###', label: { en: 'Czech Republic', ru: 'Чехия' } },
  SK: { id: 'SK', cc: '421', pattern: '### ### ###', label: { en: 'Slovakia', ru: 'Словакия' } },

  // ── Asia — East & South-East ──────────────────────────────────────────────
  MY: { id: 'MY', cc: '60', pattern: '##-###-####', label: { en: 'Malaysia', ru: 'Малайзия' } },
  AU: { id: 'AU', cc: '61', pattern: '### ### ###', label: { en: 'Australia', ru: 'Австралия' } },
  ID: { id: 'ID', cc: '62', pattern: '###-###-####', label: { en: 'Indonesia', ru: 'Индонезия' } },
  PH: { id: 'PH', cc: '63', pattern: '### ### ####', label: { en: 'Philippines', ru: 'Филиппины' } },
  NZ: { id: 'NZ', cc: '64', pattern: '## ### ####', label: { en: 'New Zealand', ru: 'Новая Зеландия' } },
  SG: { id: 'SG', cc: '65', pattern: '#### ####', label: { en: 'Singapore', ru: 'Сингапур' } },
  TH: { id: 'TH', cc: '66', pattern: '##-###-####', label: { en: 'Thailand', ru: 'Таиланд' } },
  JP: { id: 'JP', cc: '81', pattern: '##-####-####', label: { en: 'Japan', ru: 'Япония' } },
  KR: { id: 'KR', cc: '82', pattern: '##-####-####', label: { en: 'South Korea', ru: 'Южная Корея' } },
  VN: { id: 'VN', cc: '84', pattern: '### ### ####', label: { en: 'Vietnam', ru: 'Вьетнам' } },
  CN: { id: 'CN', cc: '86', pattern: '###-####-####', label: { en: 'China', ru: 'Китай' } },

  // ── Asia — South, West & Middle East ─────────────────────────────────────
  TR: { id: 'TR', cc: '90', pattern: '(###) ### ## ##', label: { en: 'Turkey', ru: 'Турция' } },
  IN: { id: 'IN', cc: '91', pattern: '#####-#####', label: { en: 'India', ru: 'Индия' } },
  PK: { id: 'PK', cc: '92', pattern: '### #######', label: { en: 'Pakistan', ru: 'Пакистан' } },
  IR: { id: 'IR', cc: '98', pattern: '### ### ####', label: { en: 'Iran', ru: 'Иран' } },
  SA: { id: 'SA', cc: '966', pattern: '## ### ####', label: { en: 'Saudi Arabia', ru: 'Саудовская Аравия' } },
  AE: { id: 'AE', cc: '971', pattern: '## ### ####', label: { en: 'UAE', ru: 'ОАЭ' } },
  IL: { id: 'IL', cc: '972', pattern: '##-###-####', label: { en: 'Israel', ru: 'Израиль' } },
  BH: { id: 'BH', cc: '973', pattern: '#### ####', label: { en: 'Bahrain', ru: 'Бахрейн' } },
  QA: { id: 'QA', cc: '974', pattern: '#### ####', label: { en: 'Qatar', ru: 'Катар' } },

  // ── Africa ────────────────────────────────────────────────────────────────
  EG: { id: 'EG', cc: '20', pattern: '## #### ####', label: { en: 'Egypt', ru: 'Египет' } },
  ZA: { id: 'ZA', cc: '27', pattern: '## ### ####', label: { en: 'South Africa', ru: 'ЮАР' } },
  MA: { id: 'MA', cc: '212', pattern: '##-####-####', label: { en: 'Morocco', ru: 'Марокко' } },
  DZ: { id: 'DZ', cc: '213', pattern: '# ## ## ## ##', label: { en: 'Algeria', ru: 'Алжир' } },
  TN: { id: 'TN', cc: '216', pattern: '## ### ###', label: { en: 'Tunisia', ru: 'Тунис' } },
  NG: { id: 'NG', cc: '234', pattern: '### ### ####', label: { en: 'Nigeria', ru: 'Нигерия' } },
  KE: { id: 'KE', cc: '254', pattern: '### ### ###', label: { en: 'Kenya', ru: 'Кения' } },
} satisfies Record<string, DialPlan>;

/** Default plans as an array — pass directly to `usePhoneMask` / `selectPhoneMask`. */
export const DEFAULT_DIAL_PLANS: (DialPlan & { id: DefaultCountryId })[] = Object.values(
  DEFAULT_DIAL_PLANS_MAP,
) as (DialPlan & { id: DefaultCountryId })[];
