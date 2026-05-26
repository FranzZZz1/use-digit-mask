import { type ChangelogEntry } from '@/shared/config';

export const changelogEntries: ChangelogEntry[] = [
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
        items: [
          '|useMask|: fixed |Ctrl+Z| / |Ctrl+Y| — undo/redo now works reliably in controlled components.',
        ],
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
