/**
 * Parsed representation of the current mask input value.
 *
 * @remarks
 * When used via `useMask` directly, `prefix` is the **semantic** visible prefix:
 * - if `prefixAliases` are configured and one matches the input, that prefix
 *   string (e.g. `'+7'` or `'8'`) — note this is intentionally NOT the full mask
 *   literal `'+7 ('` (the trailing ` (` is a separator, not part of the prefix);
 * - otherwise the literal mask prefix — everything before the first `#` slot
 *   (e.g. `'+7 ('` for mask `'+7 (###)...'`);
 * - `''` when neither applies (e.g. a prefix-less mask like `'##########'`).
 *
 * The formatted fields (`formattedWithoutPrefix`, `formattedWithoutPlaceholderChars`)
 * are sliced at the literal mask boundary, so they never leak a stray separator
 * even when `prefix` is the shorter semantic form.
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

/** Controls when {@link UseMaskProps.prefixAliases} are stripped from pasted text. See {@link UseMaskProps.pasteStripPrefix}. */
export type PasteStripPrefix = 'always' | 'overflow';

export type UseMaskProps = {
  value: string;
  onChange: (value: string, parsed: ParsedValues) => void;
  mask: string;
  /**
   * Prefix strings the mask recognises as equivalent to its own literal prefix.
   * When the user types or pastes one of these (e.g. `'8'` for a `'+7 ...'` mask),
   * the hook activates the mask and strips the alias before filling digit slots.
   *
   * @example
   * // Accept both "+7" and "8" as valid entry prefixes for a Russian phone mask
   * prefixAliases: ['+7', '8']
   */
  prefixAliases?: string[];
  /**
   * @deprecated Use {@link prefixAliases} instead.
   */
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
  /**
   * Controls when {@link prefixAliases} are stripped from pasted text.
   *
   * - `'overflow'` *(default)*: strip only when the digit count exceeds
   *   `maxDigits`. Matches the Android IME behaviour — never discards the
   *   leading digit of a number that exactly fills the mask.
   * - `'always'`: strip whenever the pasted string starts with a known alias,
   *   regardless of digit count. Preserves the pre-v0.6 behaviour.
   *
   * @default 'overflow'
   */
  pasteStripPrefix?: PasteStripPrefix;
};
