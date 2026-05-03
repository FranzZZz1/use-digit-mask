export type DialPlan = {
  cc: string;
  pattern: string;
  /** ISO 3166-1 alpha-2 country code used as a unique key (e.g. "RU", "US"). */
  id?: string;
  label?: string;
  /**
   * Whether to prepend `+` to the country code when displaying the prefix.
   * Defaults to `true`. Set to `false` for plans where the number is dialled without a plus sign.
   *
   * @example
   * // Dial without a leading plus
   * { cc: '8', pattern: '(###) ###-##-##', hasPlus: false }
   */
  hasPlus?: boolean;
  /**
   * Alternative dialing prefixes for this country, as full prefix strings.
   * A leading `+` means the prefix is dialled with the plus sign; no `+` means without.
   *
   * @example
   * // Russia can also be dialled as "8 ..." instead of "+7 ..."
   * altPrefixes: ['8']
   *
   * @example
   * // A hypothetical country reachable both as "+12" and "012"
   * altPrefixes: ['012']
   */
  altPrefixes?: string[];
};

export type PhoneMaskCandidate = {
  /** Matches DialPlan.id — used to force-select a specific plan. */
  id: string;
  mask: string;
  cc: string;
  prefix: string;
  prefixDigits: string;
  label?: string;
};

export type PhoneMaskResult = {
  mask: string;
  cc: string | null;
  id: string | null;
  prefix: string;
  /**
   * Ambiguous candidates sharing the same prefix (e.g. `+7` → Russia / Kazakhstan).
   *
   * **Invariant**: always either empty (`[]`) or contains ≥ 2 items.
   * The array is never exactly length 1.
   * Use `candidates.length > 0` to check for ambiguity — safe.
   */
  candidates: PhoneMaskCandidate[];
};
