import { type ChangelogEntry } from '@/shared/config';

export const changelogEntries: ChangelogEntry[] = [
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
