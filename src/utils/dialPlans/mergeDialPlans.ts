import { DEFAULT_DIAL_PLANS_MAP } from './defaultPlans';
import  { type DialPlan } from './types';

/**
 * Merge overrides into a dial-plans map and return the result as an array.
 *
 * Map keys are ISO 3166-1 alpha-2 codes (or any unique string for custom entries).
 * `id` and `cc` are managed automatically and cannot be changed via overrides.
 *
 * - Existing key + partial object → fields are merged (override wins).
 * - Existing key + `null`        → entry is removed.
 * - New key + `{ pattern }`      → new entry is added (`pattern` is required).
 *
 * @example
 * const myPlans = mergeDialPlans({
 *   DE: { pattern: '## #########' },   // change Germany's pattern
 *   US: null,                           // remove United States
 *   CA: null,                           // remove Canada
 *   XX: { cc: '999', pattern: '###-###', label: 'Custom' }, // add new
 * });
 */
export function mergeDialPlans(
  overrides: Record<string, Partial<Omit<DialPlan, 'cc' | 'id'>> | null>,
  base: Record<string, DialPlan> = DEFAULT_DIAL_PLANS_MAP,
): DialPlan[] {
  const result: Record<string, DialPlan> = { ...base };

  Object.entries(overrides).forEach(([key, patch]) => {
    if (patch === null) {
      delete result[key];
    } else {
      const existing = result[key];
      result[key] = existing
        ? { ...existing, ...patch, id: key, cc: existing.cc }
        : { cc: key, pattern: '', ...patch, id: key };
    }
  });

  return Object.values(result).filter((plan) => Boolean(plan.pattern));
}
