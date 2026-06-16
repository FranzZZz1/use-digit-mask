import { type ChangelogEntry } from '@/shared/config';

export const changelogEntries: ChangelogEntry[] = [
  {
    version: '0.7.0',
    date: '2026-06-16',
    sections: [
      {
        type: 'added',
        items: [
          '|useMask|: |onComplete| callback — fires once when the mask transitions from incomplete to fully filled. Only triggered by user interaction (typing, paste), not by programmatic |value| changes.',
          '|useMask|: |mask| now accepts a function |(digits: string) => string| — the mask updates automatically on every keystroke. Ideal for card inputs that switch between Visa/MC (16 slots) and Amex (15 slots) based on the first digit.',
          '|useMask|: |overwrite| mode — typing or pasting replaces the digit at the cursor position instead of inserting and shifting existing digits. Paste without a selection also overwrites; paste with a selection behaves like insert (replaces the selected range).',
          '|useMask|: |inputMode| prop included in returned |props| — defaults to |"numeric"| so the numeric keyboard appears on mobile without any extra attribute on |<input>|.',
          '|useMask|: |blocks| prop for per-group digit constraints. Accepts a positional array (|Block[]|) or a named object (|Record<string, NamedBlock>|). Named form: tokens in the mask string that match a key in |blocks| become digit groups; everything else stays a literal. Constraint functions receive the other groups by name: |DD: ({ MM, YYYY }) => ({ min: 1, max: getMaxDays(MM, YYYY) })|.',
          '|useDateMask|: new hook. Pass a format string (moment-style |DD/MM/YYYY| or date-fns-style |dd/MM/yyyy|) and get the right mask, per-field clamping and February / leap-year validation for free. The formatted value is directly compatible with |date-fns| |parse()| and |moment()|.',
          '|useMask|: |normalize| now receives block values as a second argument |(digits, blockValues) => string|. |blockValues| is an array of current digit strings — one per |#|-group in the mask. Existing single-argument functions continue to work unchanged.',
          '|useMask|: |ParsedValues| now includes |blockValues: string[]| (one entry per |#|-group in the mask) and |namedBlockValues: Record<string, string>| (keyed by name when named |blocks| are used). Both fields are always present — empty array / empty object when blocks are not defined.',
          '|useMask|: new |bypassMask| prop — bypasses all mask processing, so the input behaves like a plain controlled |<input>|. Accepts a |boolean| or a function |(value: string) => boolean| evaluated against the raw input on every keystroke, for fields that switch between a masked format and free text, e.g. a "phone or email" login field.',
          '|usePhoneMask|: new |country| prop — pre-fills the input with the selected country\'s dialing prefix on mount and whenever the prop changes. Matches |DialPlan.id| (falls back to |DialPlan.cc|). The user can erase the prefix and type any number freely.',
          '|usePhoneMask|: |UsePhoneMaskProps<T>| is now generic over the |dialPlans| array — |country| autocomplete reflects the actual plan IDs in use, including IDs added via |mergeDialPlans()|.',
          '|mergeDialPlans()|: now generic — returns |(DialPlan & { id: MergedIds<O> })[]|, accurately tracking which IDs remain after additions and removals.',
          'New exported types: |DefaultCountryId| (union of all built-in plan IDs from |DEFAULT_DIAL_PLANS_MAP|) and |MergedIds<O>| (IDs produced by |mergeDialPlans()|).',
        ],
      },
      {
        type: 'fixed',
        items: [
          '|usePhoneMask|: |formattedWithoutPlaceholderChars| no longer gets truncated by literal digits in the mask — only actually entered digits are counted.',
        ],
      },
      {
        type: 'breaking',
        items: [
          '|DialPlan.label| / |PhoneMaskCandidate.label| is now |{ en: string; ru: string }| instead of a plain string — |DEFAULT_DIAL_PLANS_MAP| ships Russian country names alongside English ones. Custom plans passed via |mergeDialPlans()| must update their |label| field accordingly.',
        ],
      },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-05-30',
    sections: [
      {
        type: 'added',
        items: [
          '|useMask|: new |pasteStripPrefix| option — |"overflow"| (default) strips |prefixAliases| from pasted text only when the digit count exceeds |maxDigits|; |"always"| restores the pre-v0.6 behaviour.',
          '|useMask|: SSR-friendly first render — the field now shows the formatted |value| immediately on mount (lazy init), avoiding an empty-then-formatted flash and hydration mismatches.',
          '|useCountrySelect|: dev-only warning when dial plans share a duplicate |id|/|cc| key — such plans silently overwrote each other and dropped from the list.',
        ],
      },
      {
        type: 'changed',
        items: [
          '|useMask|: returned |props| and handlers are now memoized.',
          '|useMask|: |allowedPrefixes| renamed to |prefixAliases| — the old name is kept as a deprecated alias and will continue to work.',
        ],
      },
      {
        type: 'fixed',
        items: [
          '|useMask|: pasting a number with a two-digit country code (e.g. |+77 (123) 456-78-90|) into a single-prefix mask (|+7 (###) ###-##-##|) via Android IME no longer double-strips the leading digit — the second |7| now correctly lands in the body.',
          '|useMask|: cutting content from a mask with a multi-digit literal prefix (e.g. |+77 (###)|) no longer places a stray prefix digit into the body.',
          '|useMask|, |pasteStripPrefix|: now applied to Android IME paste (which arrives as an |onChange| event), not only desktop |onPaste| — |"always"| previously had no effect on Android.',
          '|useMask|: pasting a prefix (e.g. |+7|) over a full selection is now undoable with Ctrl+Z.',
          '|useMask|: with a prefix-less mask (e.g. |##########|) plus |prefixAliases|, typing or pasting a leading prefix digit now enters the body instead of being swallowed; |prefix| is |""| and |rawWithPrefix| no longer double-counts the digit.',
          '|ParsedValues|: |formattedWithoutPrefix| no longer leaks a literal separator (e.g. the |(| from |+7 (|); |formattedWithoutPlaceholderChars| for an empty body is now the visible literal prefix.',
          '|useMask|: |normalize| is now applied to external/programmatic |value| too, not only to typed or pasted input.',
          '|usePhoneMask|: |isMaskCompleted| no longer reports completion one digit early for literal-prefix plans.',
        ],
      },
      {
        type: 'breaking',
        items: [
          '|useMask|, |pasteStripPrefix|: the default changed from |"always"| to |"overflow"| — pasting exactly |maxDigits| digits starting with a |prefixAlias| (e.g. |"8983120489"| into a 10-slot mask) no longer strips the leading digit. Desktop paste now matches Android IME behaviour. Pass |pasteStripPrefix="always"| to restore the previous behaviour.',
          '|MOCK_DIAL_PLANS| removed — use |DEFAULT_DIAL_PLANS| instead.',
        ],
      },
    ],
  },
  {
    version: '0.5.5',
    date: '2026-05-28',
    sections: [
      {
        type: 'fixed',
        items: [
          '|useMask|: Android IME paste (arriving as an |onChange| event instead of |onPaste|) now correctly strips the phone prefix — pasting a full number like |79991234567| no longer eats the leading digit.',
          '|usePhoneMask|: |api.getParsedValues()| now returns phone-aware values (correct |prefix|, |parentPrefix|, |rawWithoutPrefix|, |isMaskCompleted|) instead of the raw |useMask| values.',
          '|useMask|: |onCompositionStart| / |onCompositionEnd| removed from returned |props| — the composition guard was already removed in v0.5.3 so these handlers were no-ops.',
        ],
      },
    ],
  },
  {
    version: '0.5.4',
    date: '2026-05-26',
    sections: [
      {
        type: 'fixed',
        items: [
          '|useMask|: focusing a non-empty field no longer forces the caret to the end of the digits — the browser now keeps the caret at the click position. The caret is still placed after the prefix when the field is empty.',
        ],
      },
    ],
  },
  {
    version: '0.5.3',
    date: '2026-05-26',
    sections: [
      {
        type: 'fixed',
        items: [
          '|useMask|: removed early |isComposing| guard from |handleChange| — input was silently dropped on some mobile IME keyboards when the composition flag was set unexpectedly.',
        ],
      },
    ],
  },
  {
    version: '0.5.2',
    date: '2026-05-26',
    sections: [
      {
        type: 'fixed',
        items: ['|useMask|: fixed |Ctrl+Z| / |Ctrl+Y| — undo/redo now works reliably in controlled components.'],
      },
    ],
  },
  {
    version: '0.5.1',
    date: '2026-05-25',
    sections: [
      {
        type: 'fixed',
        items: [
          '|useMask|: pressing Backspace with the cursor at position 0 (beginning of the field) no longer clears the entire value when digits are present — the caret simply stays in place.',
        ],
      },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-05-24',
    sections: [
      {
        type: 'added',
        items: [
          '|useMask|: undo/redo history — |Ctrl+Z| / |Meta+Z| undoes the last change, |Ctrl+Y| / |Ctrl+Shift+Z| redoes it. New |historyLimit| prop (default |100|) caps the stack depth. New |api| fields: |undo()|, |redo()|, |canUndo|, |canRedo|.',
        ],
      },
      {
        type: 'fixed',
        items: [
          "|useMask|: when the cursor is inside the prefix area (before a literal digit such as |'7'| in mask |'+7 (###)...'|), typing a digit now correctly fills the first slot without capturing the literal prefix digit.",
        ],
      },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-05-15',
    sections: [
      {
        type: 'added',
        items: [
          "|useMask|: new |alwaysActive| prop — when |true|, the mask template is always rendered regardless of focus state. |onChange| still reports |''| when no digits are entered.",
          '|useMask|: new |ghostChar| prop — character used to fill empty slots in |ghostValue|. Defaults to |placeholderChar|.',
          '|useMask| / |usePhoneMask|: new |ghostValue| return field — the mask fully rendered with all slots filled by |ghostChar|, useful for building ghost/placeholder overlays.',
          "|ParsedValues.parentPrefix| — set when the user dials via an |altPrefixes| entry (e.g. typed |'8'| → |parentPrefix| is |'+7'|). Always |undefined| when using |useMask| directly.",
          '|PhoneMaskCandidate.parentPrefix| — canonical E.164 prefix for candidates resolved through |altPrefixes|. Computed once at candidate-build time.',
          '|PhoneMaskResult.parentPrefix| — propagated from the best-matched candidate.',
        ],
      },
      {
        type: 'fixed',
        items: [
          "|useMask|: when |allowedPrefixes| is empty, typing a digit that matches the mask's literal prefix digit (e.g. |'7'| for mask |'+7 (###)...'|) now correctly fills the first slot instead of being discarded.",
          "|useMask|: when |allowedPrefixes| is empty, pasting digits that start with the mask's prefix digit (e.g. |'79991234567'|) no longer strips the leading digit — all pasted digits fill slots from left to right.",
          '|useCountrySelect|: |disableSort| no longer ignores |stickyPins| and |priorityIds| — it now only disables candidate-based floating, leaving explicit pin configuration intact.',
        ],
      },
    ],
  },
  {
    version: '0.3.1',
    date: '2026-05-05',
    sections: [
      {
        type: 'fixed',
        items: [
          '|useMask|: |onChange| now called with the formatted value when an external value arrives without mask formatting (e.g. raw digits from a backend), preventing parent state from drifting away from what is displayed.',
        ],
      },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-05-04',
    sections: [
      {
        type: 'added',
        items: [
          '|useCountrySelect|: new |inputRef|, |disableSort|, |noInternalListeners| options.',
          '|usePhoneMask| now accepts all |useMask| props via spread (except |value| and |mask|).',
          '|dialPlanToCandidate| exported from the public API.',
          '|mergeDialPlans|: |cc| can now be set for new entries; missing |pattern| now throws.',
        ],
      },
      {
        type: 'fixed',
        items: [
          'Mobile: |onMouseDown| no longer prevents default on iOS/Android, fixing virtual keyboard not appearing.',
          'Mobile: long-press Backspace no longer jumps past the first digit block to position 0.',
          '|usePhoneMask|: |isMaskCompleted| now correctly reflects all slots filled after a plan change.',
          "|usePhoneMask selectCandidate|: body resets to |''| when switching to an incompatible prefix.",
          '|usePhoneMask forcedId|: invalidated when current digits no longer match the pinned plan.',
          '|useCountrySelect select()|: |flushSync| before |focus()| prevents focus from landing on |body|.',
          '|useCountrySelect|: |onSelect| read via ref, eliminating stale closure bug.',
          '|useMask|: |onChange| skipped when the formatted value is unchanged.',
        ],
      },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-04-20',
    sections: [
      {
        type: 'breaking',
        items: [
          "|DialPlan.altPrefixes| changed from |AltPrefix[]| to |string[]| — full prefix strings with optional leading |+|. Before: |[{ cc: '8', hasPlus: false }]| → After: |['8']|.",
        ],
      },
      {
        type: 'added',
        items: [
          '|useCountrySelect| hook — headless hook for building country-selector dropdowns.',
          '|DialPlan.hasPlus| option (default |true|) — controls whether the main prefix uses a leading |+| sign.',
          '|useCountrySelect|: |stickyPins| option — |priorityIds| stay pinned regardless of what the user types.',
          '|formatDigitsWithMask()| exported as a standalone pure utility.',
        ],
      },
      {
        type: 'changed',
        items: [
          'Dial plans module split into separate files: |defaultPlans|, |selectPhoneMask|, |mergeDialPlans|, |types|.',
          "|FALLBACK.prefix| is now |''| instead of |'+'| when no country is detected.",
        ],
      },
      {
        type: 'fixed',
        items: [
          '|usePhoneMask|: stale closure fixed — |ParsedValues.prefix| now always reflects the current input, not the previous render cycle.',
          '|usePhoneMask|: |selectCandidate| no longer depends on the |useMask| api, eliminating a stale-mask timing issue.',
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-04-02',
    sections: [
      {
        type: 'added',
        items: ['Initial release — |useMask| and |usePhoneMask| hooks.'],
      },
    ],
  },
];
