import { DEFAULT_DIAL_PLANS_MAP, type DefaultCountryId } from './defaultPlans';
import { type DialPlan } from './types';

type DialPlanPatch = Partial<Omit<DialPlan, 'id'>> | null;

/**
 * Overrides object for `mergeDialPlans()`.
 *
 * Keys of `DEFAULT_DIAL_PLANS_MAP` (e.g. `"US"`, `"RU"`, `"GB"`) are suggested by
 * autocomplete, but any other string key is also allowed — for custom entries.
 */
export type DialPlanOverrides = {
  [K in keyof typeof DEFAULT_DIAL_PLANS_MAP]?: DialPlanPatch;
} & Record<string, DialPlanPatch>;

type NullKeys<O extends DialPlanOverrides> = {
  [K in keyof O]: O[K] extends null ? K : never;
}[keyof O] &
  string;

type NonNullKeys<O extends DialPlanOverrides> = {
  [K in keyof O]: O[K] extends null ? never : K;
}[keyof O] &
  string;

/**
 * Union of plan IDs produced by `mergeDialPlans<O>`:
 * default IDs minus removed keys, plus all non-null override keys.
 * Assumes the default `base` (`DEFAULT_DIAL_PLANS_MAP`) is used.
 */
export type MergedIds<O extends DialPlanOverrides> = Exclude<DefaultCountryId, NullKeys<O>> | NonNullKeys<O>;

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
 * @remarks Entries with an empty `pattern` are filtered out, so overriding an
 * existing key with `{ pattern: '' }` also removes it (same effect as `null`).
 *
 * @throws if a new entry is missing a `pattern` field.
 *
 * @example
 * const myPlans = mergeDialPlans({
 *   DE: { pattern: '## #########' },                         // change Germany's pattern
 *   US: null,                                                // remove United States
 *   XX: { cc: '999', pattern: '###-###', label: { en: 'Custom', ru: 'Кастом' } }, // add new
 * });
 */
export function mergeDialPlans<O extends DialPlanOverrides>(
  overrides: O,
  base: Record<string, DialPlan> = DEFAULT_DIAL_PLANS_MAP,
): (DialPlan & { id: MergedIds<O> })[] {
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

  return Object.values(result).filter((plan) => Boolean(plan.pattern)) as (DialPlan & { id: MergedIds<O> })[];
}
