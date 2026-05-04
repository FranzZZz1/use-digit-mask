import { buildSectionLink, PATHS, SECTION_IDS } from '@/shared/router';

export const useCountrySelect = {
  lead: `Headless hook for building a country-selector dropdown that pairs with [|usePhoneMask|](${PATHS.usePhoneMask}). Handles list sorting, search filtering, open/close state, outside-click, Escape key, and optional focus-return to the phone input.`,
  overview: [
    `The hook is fully headless — it returns data and refs, leaving all rendering to you. The demo's [|CountrySelect|](${buildSectionLink(PATHS.home, SECTION_IDS.home.useCountrySelect)}) component is a reference implementation you can copy and adapt.`,
    '**Sorting behaviour** — two modes controlled by |stickyPins|:',
    '**Dynamic (default)**: when the phone input is empty, |priorityIds| float to the top. Once the user starts typing, ambiguous candidates take over the top slots and priority pins step aside.',
    '**Sticky**: |priorityIds| are always pinned at the top. Ambiguous candidates that are not already pinned bubble just below the divider.',
  ],
  params: {
    allPlans: `Full list of dial plans. Pass |allPlans| from [|usePhoneMask|](${buildSectionLink(PATHS.usePhoneMask, SECTION_IDS.returnValue)}).`,
    onSelect: `Called when the user picks a country. Wire to |selectPlan| from [|usePhoneMask|](${buildSectionLink(PATHS.usePhoneMask, SECTION_IDS.returnValue)}).`,
    currentId: `ISO id of the currently active plan. Pass |id| from [|usePhoneMask|](${buildSectionLink(PATHS.usePhoneMask, SECTION_IDS.returnValue)}).`,
    candidates: `Live ambiguous candidates from [|usePhoneMask|](${buildSectionLink(PATHS.usePhoneMask, SECTION_IDS.returnValue)}). Used to float matching countries to the top of the list.`,
    priorityIds: 'ISO ids to pin at the top of the list when the input is empty (e.g. |["US", "GB", "RU"]|).',
    stickyPins:
      'When |true|, |priorityIds| are always visible at the top regardless of what is typed. When |false| (default), they step aside once the user starts typing.',
    inputRef: 'Ref to the phone input. When provided, focus returns to the input after the user selects a country.',
    disableSort:
      'When |true|, items are returned in the natural order of |allPlans| — no floating of candidates or |priorityIds|. Useful when you manage ordering externally.',
    noInternalListeners:
      'When |true|, the hook skips its built-in outside-click and Escape listeners as well as auto-focusing |searchRef|. Use when integrating with a component library (e.g. Radix UI) that manages those interactions itself.',
  },
  returnValues: {
    isOpen: 'Whether the dropdown is currently open.',
    toggle: 'Toggle the dropdown open/closed. Attach to the trigger button |onClick|.',
    close: 'Close the dropdown and clear the search query.',
    query: 'Current search query string.',
    setQuery: 'Update the search query. Attach to the search input |onChange|.',
    currentPlan: `The currently selected [|DialPlan|](${buildSectionLink(PATHS.usePhoneMask, SECTION_IDS.dialPlan)}) object, or |undefined| when nothing is resolved yet.`,
    items: 'Sorted and filtered list of plans to render. Respects |stickyPins|, candidates, and search query.',
    dividerAfter: 'Insert a visual divider before |items[dividerAfter]|. |-1| means no divider.',
    containerRef: 'Attach to the root container element to enable close-on-outside-click.',
    searchRef: 'Attach to the search input — auto-focused when the dropdown opens.',
    select:
      'Select a plan: calls |onSelect|, closes the dropdown, and returns focus to the phone input (if |inputRef| is provided).',
  },
};
