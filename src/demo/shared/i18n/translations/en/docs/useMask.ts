import { PATHS } from '@/shared/router';

export const useMask = {
  lead: 'Generic hook for any digit-only mask. Accepts a mask pattern where |#| marks a digit slot and every other character is a literal. Implements a fully controlled input model — pass |value| and |onChange|, spread |props| onto your |<input>|.',
  overview: [
    `|useMask| handles all keyboard interactions — insertion, deletion, arrow navigation, paste — and positions the caret correctly after every operation. The mask is static per render; for a dynamically-switching mask (e.g. phone country detection) see [|usePhoneMask|](${PATHS.usePhoneMask}).`,
    'The hook is headless — it returns |props| to spread onto a native |<input>| and an |api| object for programmatic access. No UI is rendered.',
  ],
  params: {
    mask: 'Mask pattern. |#| = digit slot, everything else is a literal. Example: |+7 (###) ###-##-##|.',
    value: 'Controlled input value.',
    onChange: 'Called on every change with the formatted value and parsed breakdown.',
    prefixAliases:
      'Prefix strings recognised as equivalent to the mask\'s own prefix (e.g. |["+7", "8"]|). Stripped on paste and activate an empty mask when typed alone.',
    placeholderChar: 'Character shown in unfilled digit slots.',
    normalize:
      'Optional transform applied to extracted digits before applying the mask (e.g. to enforce a leading digit).',
    activateOnFocus: 'Show the mask prefix on focus, even when the field is empty.',
    deactivateOnEmptyBlur: 'Hide the mask on blur if no digits have been entered.',
    trimMaskTail: 'Hide placeholder characters beyond the last entered digit — the input shrinks as the user types.',
    ghostChar:
      'Character used in the ghost overlay for empty digit slots. Defaults to |placeholderChar|. Useful when you want a visually distinct ghost (e.g. |"·"|) without changing the real input\'s placeholder.',
    alwaysActive:
      'Always render the full mask template, even when the field is empty and unfocused. |onChange| still reports |""| when no digits have been entered.',
    historyLimit: 'Maximum number of undo/redo steps kept in memory.',
    pasteStripPrefix:
      'Controls when |prefixAliases| are stripped from pasted text. |"overflow"| (default) — strip only when the digit count exceeds |maxDigits|; never discards the leading digit of a number that exactly fills the mask, and matches Android IME behaviour. |"always"| — strip whenever the pasted string starts with a known alias, regardless of digit count (pre-v0.6 behaviour).',
  },
  returnProps: {
    ghostValue:
      'Full mask string with typed digits filled in and |ghostChar| for empty slots. Always computed — render it in an absolutely-positioned overlay behind the input to create a ghost placeholder effect.',
    'props.value': 'Formatted value to pass to the input.',
    'props.ref': 'Ref — spread onto the input element.',
    'props.onChange': 'Handles character insertion and deletion.',
    'props.onKeyDown': 'Handles Backspace, Delete, Arrow keys, Home, End.',
    'props.onPaste': 'Strips prefix and clamps pasted text to available slots.',
    'props.onClick / onFocus / onBlur / onMouseDown': 'Caret positioning and activation/deactivation helpers.',
    'api.formatDigits': 'Pure formatter — converts raw digits into the masked string.',
    'api.getParsedValues': 'Returns a breakdown of the current (or given) formatted value.',
    'api.undo': 'Reverts the last change. Triggered internally by |Ctrl+Z| / |Meta+Z|.',
    'api.redo': 'Re-applies a reverted change. Triggered internally by |Ctrl+Y| / |Ctrl+Shift+Z|.',
    'api.canUndo': '|true| when the undo stack has steps to revert.',
    'api.canRedo': '|true| when the redo stack has steps to re-apply.',
  },
  parsedValues: {
    p: 'The second argument of |onChange| and the return value of |api.getParsedValues()|.',
  },
  parsedValuesProps: {
    prefix: 'The visible prefix — e.g. |+7|: a matched |prefixAlias|, or the mask literal with trailing separators trimmed.',
    rawWithPrefix: 'Digits only, including prefix digits.',
    rawWithoutPrefix: 'Subscriber digits only — prefix stripped.',
    formattedWithPrefix: 'Full formatted string.',
    formattedWithoutPrefix: 'Formatted string with the prefix removed.',
    formattedWithoutPlaceholderChars:
      'Formatted string trimmed at the last filled digit — no trailing placeholder characters.',
    isMaskCompleted: 'True when every digit slot in the mask is filled.',
  },
};
