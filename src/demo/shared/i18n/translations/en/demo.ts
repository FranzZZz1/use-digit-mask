export const demo = {
  hero: {
    desc: 'Headless React hooks for digit-only masked inputs —\nphones, cards, dates, PINs and more.',
  },
  sections: {
    useMask: {
      title: 'useMask',
      desc: 'Generic hook for any digit-only mask pattern.',
    },
    useDateMask: {
      title: 'useDateMask',
      desc: 'Pass a format string — mask, per-field clamping and February / leap-year validation are wired up automatically.',
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
    dateMask: {
      title: 'useDateMask',
      desc: 'Pass a format string — mask, clamping and February / leap-year validation are set up automatically',
    },
    dateMaskIso: {
      title: 'yyyy-MM-dd',
      desc: "ISO 8601 — pass the value directly to date-fns parse(value, 'yyyy-MM-dd', refDate)",
    },
    dateMaskDatetime: {
      title: 'dd.MM.yyyy HH:mm',
      desc: 'Date + time in a single field — hours (0–23) and minutes (0–59) auto-clamped',
    },
    dateMaskMax: {
      title: 'max — date not in the future',
      desc: 'Restricts the date to today or earlier; month and day limits tighten automatically as the year fills in',
    },
    dateMaskBirth: {
      title: 'Date of birth',
      desc: 'min + max together: year clamped to 1900 – current; use end-of-year as max to keep month and day unconstrained within the year',
    },
    overwrite: {
      title: 'Overwrite mode',
      desc: 'Typing or pasting replaces digits at the cursor instead of shifting them — ideal for date inputs',
    },
    onComplete: {
      title: 'onComplete',
      desc: 'Fires once when the mask transitions from incomplete to fully filled — trigger auto-submit, validation or any side effect',
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
    phoneOrEmail: {
      title: 'Phone or email',
      desc: 'bypassMask — the mask switches off as soon as a letter or "@" is typed, so the field accepts a free-text email',
    },
  },
  examples: {
    useMask: 'Live demos covering all |useMask| props — activation modes, normalization, ghost overlay and more.',
    useDateMask: 'Live demos for |useDateMask| — format variants and automatic date validation.',
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
      bypassMask: 'Bypasses all mask processing — the input behaves like a plain controlled <input>',
      prefixAliases: 'Comma-separated prefixes recognised as equivalent to the mask prefix',
      ghostChar: 'Faded overlay character shown behind untyped digit slots',
      ghostOnlyWhenResolved: 'Show ghost only after the country resolves — hidden while the mask is still ambiguous',
      stickyPins: 'Pinned countries stay at the top even after a candidate is resolved',
      disableSort: 'Disable dynamic sorting of matched candidates to the top of the list',
      priorityIds: 'Comma-separated ISO 3166-1 alpha-2 codes pinned at the top when input is empty',
    },
  },
  codeComments: {
    onComplete: 'called once when every digit slot is filled',
    overwrite: 'replace digits at cursor instead of shifting them right',
    dateMask: 'named tokens become ## slots; separators stay as literals',
    dynamicMask: 'pass a function — the mask updates automatically on every keystroke',
    recipeOnComplete: 'fires once when every digit slot is filled',
    recipeBlocks: 'named tokens become digit groups; constraint functions receive other groups by name',
    recipeBlocksDays: 'max days for DD depends on MM and YYYY — leap years included',
    recipeDateMax: 'prevent selecting a date after today',
    recipeBirthDate: 'end-of-year max keeps month/day unconstrained within the current year',
    recipeTimeRange: 'min re-evaluates automatically when the start value changes',
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
    recipePhoneOrEmail: 'switch off the mask once the input looks like an email — letters or "@"',
  },
};
