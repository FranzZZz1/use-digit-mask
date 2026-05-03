import { DEFAULT_DIAL_PLANS_MAP } from './defaultPlans';
import { type DialPlan } from './types';

/**
 * Merge overrides into a dial-plans map and return the result as an array.
 *
 * Map keys are ISO 3166-1 alpha-2 codes (or any unique string for custom entries).
 *
 * - Existing key + partial object → fields are merged (override wins).
 *   `id` is managed automatically; `cc` cannot be changed for existing entries.
 * - Existing key + `null`        → entry is removed.
 * - New key + object             → new entry added; `pattern` is required,
 *   `cc` defaults to the key if omitted.
 *
 * @throws if a new entry is missing a `pattern` field.
 *
 * @example
 * const myPlans = mergeDialPlans({
 *   DE: { pattern: '## #########' },                         // change Germany's pattern
 *   US: null,                                                // remove United States
 *   XX: { cc: '999', pattern: '###-###', label: 'Custom' }, // add new
 * });
 */
export function mergeDialPlans(
  overrides: Record<string, Partial<Omit<DialPlan, 'id'>> | null>,
  base: Record<string, DialPlan> = DEFAULT_DIAL_PLANS_MAP,
): DialPlan[] {
  const result: Record<string, DialPlan> = { ...base };

  Object.entries(overrides).forEach(([key, patch]) => {
    if (patch === null) {
      delete result[key];
    } else {
      const existing = result[key];
      if (existing) {
        result[key] = { ...existing, ...patch, id: key, cc: existing.cc };
      } else {
        const { pattern } = patch;
        if (!pattern) {
          throw new Error(`mergeDialPlans: new entry "${key}" requires a "pattern" field.`);
        }
        result[key] = { cc: key, ...patch, pattern, id: key };
      }
    }
  });

  return Object.values(result).filter((plan) => Boolean(plan.pattern));
}
