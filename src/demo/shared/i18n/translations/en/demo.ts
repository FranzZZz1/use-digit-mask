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
    phoneRu: {
      title: 'Phone (Russia)',
      desc: 'mask: "+7 (###) ###-##-##"',
    },
    creditCard: {
      title: 'Credit card',
      desc: 'mask: "#### #### #### ####"',
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
  },
  codeComments: {
    allowedPrefixes: "also accepts '8' as a prefix without the '+'",
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
  },
};
