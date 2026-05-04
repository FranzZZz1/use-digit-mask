import { buildSectionLink, PATHS, SECTION_IDS } from '@/shared/router';

export const usePhoneMask = {
  lead: `Wrapper around [|useMask|](${PATHS.useMask}) that auto-detects the mask from dial plans as the user types. Resolves ambiguous country prefixes (e.g. +7 → Russia vs Kazakhstan) and exposes |selectCandidate| / |selectPlan| for disambiguation UI.`,
  overview: [
    'Supports both **controlled** (|value| + |onChange|) and **uncontrolled** (|defaultValue|) modes. The active mask switches automatically as the user types more prefix digits.',
    `When multiple plans share the same prefix, the |candidates| array is populated. Render a disambiguation UI (e.g. flag buttons) and call |selectCandidate(c)| when the user picks one. For a full country-selector dropdown, combine with [|useCountrySelect|](${PATHS.useCountrySelect}).`,
  ],
  params: {
    value: 'Controlled value. Omit to use uncontrolled mode.',
    defaultValue: 'Initial value for uncontrolled mode.',
    onChange: 'Called on every change.',
    placeholderChar: 'Character for empty digit slots.',
    dialPlans: 'Dial plans to match against. Override to restrict to a subset or inject custom plans.',
    trimMaskTail: 'Hide placeholder characters beyond the last typed digit.',
  },
  returnValues: {
    props: `Spread onto |<input>|. Same props as [useMask → props](${buildSectionLink(PATHS.useMask, SECTION_IDS.returnValue)}).`,
    api: `Programmatic access. See [useMask → Return value](${buildSectionLink(PATHS.useMask, SECTION_IDS.returnValue)}).`,
    mask: 'Currently active mask string (switches as the user types).',
    cc: 'Country calling code digits (e.g. |"7"| for +7).',
    id: 'ISO 3166-1 alpha-2 id of the resolved plan (e.g. |"RU"|).',
    prefix: 'Resolved phone prefix (e.g. |"+7"|, |"+44"|, |"8"|).',
    candidates:
      'Ambiguous plans sharing the current prefix (e.g. +7 → Russia / Kazakhstan). Empty when unambiguous. Always either empty or ≥ 2 items.',
    allPlans: `The dial plans array in use — pass to [|useCountrySelect|](${PATHS.useCountrySelect}).`,
    selectCandidate: 'Force-select one of the ambiguous candidates. Useful for candidate disambiguation UI.',
    selectPlan: `Force-select any plan from |allPlans|. Used by [|useCountrySelect|](${PATHS.useCountrySelect}).`,
  },
  dialPlan: {
    cc: 'Country calling code digits (e.g. |"7"|, |"44"|, |"1"|).',
    pattern: 'Mask body after the country code (e.g. |"(###) ###-##-##"|).',
    id: 'ISO 3166-1 alpha-2 identifier (e.g. |"RU"|). Used as the unique key.',
    label: 'Human-readable country name (e.g. |"Russia"|).',
    hasPlus: 'Whether the prefix is dialled with a leading |+|.',
    altPrefixes:
      'Alternative dialable prefixes. A leading |+| means with plus sign, no |+| means without. Example: |["8"]| for Russia.',
  },
  phoneMaskCandidate: {
    id: 'ISO country code — matches |DialPlan.id|.',
    mask: 'Full mask pattern for this candidate.',
    cc: 'Country calling code digits (e.g. |"7"|).',
    prefix: 'Resolved phone prefix (e.g. |"+7"|).',
    prefixDigits: 'Raw digit sequence of the prefix.',
    label: 'Human-readable country name (e.g. |"Russia"|).',
  },
  customization: {
    heading: 'Customising plans',
    intro: `Pass your own array of plans via the |dialPlans| prop. The easiest way to build it is |mergeDialPlans(overrides, base?)| — it accepts an object of changes and returns a |DialPlan[]|. Keys are ISO country codes.`,
    snippetOverride: 'Change an existing country pattern',
    snippetRemove: 'Remove a country from the list',
    snippetAdd: 'Add a new plan',
  },
};
