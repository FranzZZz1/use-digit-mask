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
    allowedPrefixes:
      'List of prefix strings (e.g. |["+7", "8"]|) that are stripped when pasting a full number and activate an empty mask when |activateOnFocus=true|.',
    placeholderChar: 'Character shown in unfilled digit slots.',
    normalize:
      'Optional transform applied to extracted digits before applying the mask (e.g. to enforce a leading digit).',
    activateOnFocus: 'Show the mask prefix on focus, even when the field is empty.',
    deactivateOnEmptyBlur: 'Hide the mask on blur if no digits have been entered.',
    trimMaskTail: 'Hide placeholder characters beyond the last entered digit — the input shrinks as the user types.',
  },
  returnProps: {
    'props.value': 'Formatted value to pass to the input.',
    'props.ref': 'Ref — spread onto the input element.',
    'props.onChange': 'Handles character insertion and deletion.',
    'props.onKeyDown': 'Handles Backspace, Delete, Arrow keys, Home, End.',
    'props.onPaste': 'Strips prefix and clamps pasted text to available slots.',
    'props.onClick / onFocus / onBlur / onMouseDown': 'Caret positioning and activation/deactivation helpers.',
    'api.formatDigits': 'Pure formatter — converts raw digits into the masked string.',
    'api.getParsedValues': 'Returns a breakdown of the current (or given) formatted value.',
  },
  parsedValues: {
    p: 'The second argument of |onChange| and the return value of |api.getParsedValues()|.',
  },
  parsedValuesProps: {
    prefix: 'Literal characters before the first |#| slot (e.g. |+7 (|).',
    rawWithPrefix: 'Digits only, including prefix digits.',
    rawWithoutPrefix: 'Subscriber digits only — prefix stripped.',
    formattedWithPrefix: 'Full formatted string.',
    formattedWithoutPrefix: 'Formatted string with the prefix removed.',
    formattedWithoutPlaceholderChars:
      'Formatted string trimmed at the last filled digit — no trailing placeholder characters.',
    isMaskCompleted: 'True when every digit slot in the mask is filled.',
  },
};
