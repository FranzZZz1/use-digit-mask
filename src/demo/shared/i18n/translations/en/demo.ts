export const demo = {
  hero: {
    desc: 'Headless React hooks for digit-only masked inputs —\nphones, cards, dates, PINs and more.',
  },
  sections: {
    useMask: {
      title: 'useMask',
      desc: 'Generic hook for any digit-only mask pattern.',
    },
    usePhoneMask: {
      title: 'usePhoneMask',
      desc: 'Auto-detects mask from dial plans. Handles ambiguous country prefixes (e.g. +7 Russia / +7 Kazakhstan).',
    },
    useCountrySelect: {
      title: 'useCountrySelect',
      desc: 'Headless hook for country-selector dropdowns. Handles sorting, search, open state and outside-click.',
    },
  },
  cards: {
    playground: {
      title: 'Playground',
      desc: 'Adjust the mask, toggle any prop and instantly copy the ready-to-use code.',
      cta: 'Open Playground →',
    },
    phoneRu: {
      title: 'Phone (Russia)',
      desc: 'mask: "+7 (###) ###-##-##"',
    },
    creditCard: {
      title: 'Credit card',
      desc: 'mask: "#### #### #### ####"',
    },
    dynamicMask: {
      title: 'Dynamic mask',
      desc: '34 / 37 → Amex (4-6-5 · 15 digits), otherwise Visa / MC (4-4-4-4 · 16 digits)',
    },
    date: {
      title: 'Date',
      desc: 'mask: "##/##/####"',
    },
    pin: {
      title: 'PIN',
      desc: 'mask: "####"',
    },
    normalize: {
      title: 'Normalize',
      desc: 'Clamps hours ≤ 23 and minutes ≤ 59 on every keystroke',
    },
    phoneAuto: {
      title: 'Auto-detecting',
      desc: 'Type a number — mask and country are detected automatically',
    },
    countrySelect: {
      title: 'Country selector',
      desc: 'Pinned: US · GB · RU — type a prefix to sort by closest match',
    },
    alwaysActive: {
      title: 'Always active',
      desc: 'Mask template is always visible — no focus or input required',
    },
    ghostMask: {
      title: 'Ghost placeholder',
      desc: 'Faded mask chars behind the typed digits — only the remaining empty slots are visible',
    },
    ghostPhone: {
      title: 'Ghost placeholder',
      desc: 'Ghost appears only after the country code resolves — silent while the format is still ambiguous',
    },
  },
  examples: {
    useMask: 'Live demos covering all |useMask| props — activation modes, normalization, ghost overlay and more.',
    usePhoneMask: 'Live demos for |usePhoneMask| — auto-detection and ghost overlay.',
    useCountrySelect: 'Live demos for |useCountrySelect| — custom and Radix UI country selector implementations.',
  },
  playground: {
    parsedValues: {
      hide: 'Hide values',
      show: 'Show values',
    },
    tooltips: {
      mask: 'Digit slot = #, everything else is a literal prefix character. Example: +7 (###) ###-##-##',
      placeholderChar: 'Single character shown for empty digit slots',
      trimMaskTail: 'Hides placeholder chars until the user reaches that slot',
      alwaysActive: 'Mask template is always visible — no focus or input required',
      activateOnFocus: 'Mask activates when the input is focused',
      deactivateOnEmptyBlur: 'Mask hides when input loses focus with an empty value',
      prefixAliases: 'Comma-separated prefixes recognised as equivalent to the mask prefix',
      ghostChar: 'Faded overlay character shown behind untyped digit slots',
      ghostOnlyWhenResolved: 'Show ghost only after the country resolves — hidden while the mask is still ambiguous',
      stickyPins: 'Pinned countries stay at the top even after a candidate is resolved',
      disableSort: 'Disable dynamic sorting of matched candidates to the top of the list',
      priorityIds: 'Comma-separated ISO 3166-1 alpha-2 codes pinned at the top when input is empty',
    },
  },
  codeComments: {
    prefixAliases: "also accepts '8' as a prefix without the '+'",
    trimMaskTail: 'trimMaskTail hides placeholder chars until the user reaches that slot',
    normalize: 'called after digit extraction — clamp or transform before the mask is applied',
    uncontrolled: 'No external state needed — the hook manages the value internally',
    candidates: 'Shown when prefix is ambiguous, e.g. +7 → Russia / Kazakhstan',
    candidatesBubble: 'Typing +7 → Russia & Kazakhstan bubble to the top',
    priorityIds: 'Pinned at the top when input is empty',
    countryTrigger: 'Country trigger + dropdown',
    divider: 'Visual divider between pinned group and the rest',
    phoneInput: 'Phone input',
    noInternalListeners: 'Radix manages Escape and outside-click — disable built-in hook listeners',
    overridePattern: "change Germany's pattern",
    removeCountry: "Remove Kazakhstan — it won't appear in the list or candidates",
    addPlan: 'Add a brand-new plan — cc must be unique',
    alwaysActive: 'mask template is always shown — no focus or typing needed to reveal slots',
    ghostChar: 'fill empty ghost slots with a custom char instead of placeholderChar',
    hideGhostOnInput: 'hide ghost as soon as the user starts typing — with trimMaskTail, value is empty string until first digit',
    ghostOnlyWhenResolved: 'show ghost only after a country is detected — check mask !== E164_MASK',
  },
};
