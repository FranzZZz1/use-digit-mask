/**
 * Parsed representation of the current mask input value.
 *
 * @remarks
 * When used via `useMask` directly, `prefix` is the literal mask prefix -
 * everything before the first `#` slot (e.g. `'+7 ('` for mask `'+7 (###)...'`).
 *
 * When used via `usePhoneMask`, `prefix` is overridden with the resolved
 * phone-plan prefix (e.g. `'+7'`, `'+44'`, `'8'`) and may differ from the mask literal.
 */
export type ParsedValues = {
  prefix: string;
  rawWithPrefix: string;
  rawWithoutPrefix: string;
  formattedWithPrefix: string;
  formattedWithoutPrefix: string;
  formattedWithoutPlaceholderChars: string;
  isMaskCompleted: boolean;
  /**
   * The canonical E.164-style prefix for the resolved plan when the user typed
   * an alternative prefix (e.g. user typed `8` → `parenPrefix` is `+7`).
   * `undefined` when no altPrefix is in use or no plan is resolved.
   * Only populated by `usePhoneMask`; always `undefined` when using `useMask` directly.
   */
  parentPrefix?: string;
};

export type UseMaskProps = {
  value: string;
  onChange: (value: string, parsed: ParsedValues) => void;
  mask: string;
  allowedPrefixes?: string[];
  placeholderChar?: string;
  normalize?: (digits: string) => string;
  activateOnFocus?: boolean;
  deactivateOnEmptyBlur?: boolean;
  trimMaskTail?: boolean;
  // Character used to fill empty slots in `ghostValue`. Defaults to `placeholderChar`.
  ghostChar?: string;
  /**
   * When `true`, the mask template is always rendered regardless of focus state.
   * `onChange` still reports `''` when there are no digits entered.
   */
  alwaysActive?: boolean;
  /**
   * Maximum number of undo/redo steps to keep in memory. Defaults to `100`.
   * Each distinct digit-sequence change counts as one step.
   */
  historyLimit?: number;
};
