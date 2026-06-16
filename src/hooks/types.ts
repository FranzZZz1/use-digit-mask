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
   * Digit values per `#`-group in the mask, in left-to-right order.
   * Each entry corresponds to one contiguous run of `#` slots.
   *
   * @example
   * // mask="##/##/####", value="+15/06/2024"
   * blockValues // ['15', '06', '2024']
   */
  blockValues: string[];
  /**
   * Digit values keyed by named-block token (only populated when the `blocks`
   * prop is passed as a `Record<string, NamedBlock>` with a named mask).
   * Empty object `{}` when positional `Block[]` or no `blocks` are used.
   *
   * @example
   * // mask="DD/MM/YYYY", blocks={{ DD, MM, YYYY }}, value="15/06/2024"
   * namedBlockValues // { DD: '15', MM: '06', YYYY: '2024' }
   */
  namedBlockValues: Record<string, string>;
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

/** Range constraint for a single digit group in {@link UseMaskProps.blocks}. */
export type BlockConstraint = { min?: number; max?: number };

/**
 * Function form of a block constraint. Receives an array of current digit strings —
 * one entry per digit group in the mask, in left-to-right order — and returns
 * the constraint for this block. Use array destructuring to name the values:
 *
 * @example
 * // day block that reads month (index 1) and year (index 2)
 * ([, month, year]) => ({ min: 1, max: getMaxDays(month, year) })
 */
export type BlockFn = (blockValues: string[]) => BlockConstraint;

/**
 * A single entry in the positional {@link UseMaskProps.blocks} array. Either a static
 * constraint `{ min, max }`, a {@link BlockFn} for cross-block constraints, or
 * `null`/`undefined` to leave the group unconstrained.
 */
export type Block = BlockConstraint | BlockFn | null | undefined;

/**
 * Function form of a named block constraint. Receives an object whose keys are the
 * named group tokens from the mask — use object destructuring to read other groups:
 *
 * @example
 * // DD block that reads MM and YYYY from the same mask
 * DD: ({ MM, YYYY }) => ({ min: 1, max: getMaxDays(MM, YYYY) })
 */
export type NamedBlockFn = (blockValues: Record<string, string>) => BlockConstraint;

/**
 * A single entry in the named {@link UseMaskProps.blocks} object.
 */
export type NamedBlock = BlockConstraint | NamedBlockFn | null | undefined;

export type UseMaskProps = {
  value: string;
  onChange: (value: string, parsed: ParsedValues) => void;
  /**
   * Mask template string, or a function that returns one based on current digits.
   * `#` marks a digit slot; all other characters are literals.
   *
   * Use the function form to switch between masks based on the entered digits —
   * for example, distinguishing Amex (15 slots) from Visa/MC (16 slots) by
   * the first digit.
   *
   * The function must be **pure** — the same digits must always produce the same mask.
   * It is called on every render and must be stable across renders (defined outside
   * the component or wrapped in `useCallback`).
   *
   * @example
   * // Amex starts with 3, everything else is Visa/MC
   * mask={(digits) => digits.startsWith('3')
   *   ? '#### ###### #####'
   *   : '#### #### #### ####'}
   */
  mask: string | ((digits: string) => string);
  /**
   * Called once when the mask transitions from incomplete to fully filled.
   * Fires only on user interaction (typing, paste); not on programmatic value changes.
   */
  onComplete?: (parsed: ParsedValues) => void;
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
  /**
   * Transform digits before they are applied to the mask. Called on every user
   * input and on external `value` changes.
   *
   * The second argument `blockValues` contains the current digit string split
   * by mask groups (same order as {@link UseMaskProps.blocks}), so you can read
   * other blocks from it without slicing `digits` manually:
   *
   * @example
   * normalize={(digits, [hours]) => parseInt(hours) > 12 ? clamp(digits) : digits}
   *
   * Existing `(digits: string) => string` functions continue to work unchanged.
   */
  normalize?: (digits: string, blockValues: string[]) => string;
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
   * When `true`, typing a digit within the already-filled portion of the mask
   * replaces the digit at the cursor position instead of inserting it (shifting
   * existing digits to the right). Digits beyond the filled portion are still
   * appended normally.
   *
   * Particularly useful for date inputs: with `overwrite` the user can correct
   * any part of a completed date without first deleting the digit.
   *
   * @default false
   */
  overwrite?: boolean;
  /**
   * Per-group digit constraints applied automatically as the user types.
   * Groups are consecutive runs of `#` in the mask, detected left to right.
   *
   * **Positional array** — each entry maps to the group at the same index:
   * ```ts
   * mask="##/##/####"
   * blocks={[{ min: 1, max: 31 }, { min: 1, max: 12 }, { min: 1, max: 9999 }]}
   * ```
   * Use a {@link BlockFn} when the constraint depends on another group's value
   * (e.g. max days based on month and year):
   * ```ts
   * mask="##/##/####"
   * blocks={[
   *   ([, month, year]) => ({ min: 1, max: getMaxDays(month, year) }),
   *   { min: 1, max: 12 },
   *   { min: 1, max: 9999 },
   * ]}
   * ```
   *
   * **Named object** — keys appear as literal tokens in the mask string; their
   * presence in `blocks` tells the hook to treat them as digit groups (replaced
   * by `#` slots) instead of literal characters. Keys absent from `blocks` stay
   * as visible literals in the mask. Constraint functions receive a
   * `Record<string, string>` — reference other groups by name:
   * ```ts
   * mask="DD/MM/YYYY"
   * blocks={{
   *   DD: ({ MM, YYYY }) => ({ min: 1, max: getMaxDays(MM, YYYY) }),
   *   MM: { min: 1, max: 12 },
   *   YYYY: { min: 1, max: 9999 },
   * }}
   * ```
   * The mask above renders as `__/__/____` in the input — the tokens
   * `DD`, `MM`, `YYYY` are replaced by placeholder characters, not shown as text.
   */
  blocks?: readonly Block[] | Record<string, NamedBlock>;
  /**
   * Value for the `inputmode` HTML attribute, included automatically in the
   * `props` object spread onto `<input>`.
   *
   * @default 'numeric', or 'text' when {@link bypassMask} is `true`
   */
  inputMode?: 'numeric' | 'tel' | 'decimal' | 'none' | 'text';
  /**
   * When `true` (or when the function form returns `true`), all mask
   * processing is bypassed: the input behaves like a plain controlled
   * `<input>` — `value` is shown as-is and `onChange` reports the raw input
   * value verbatim, with no digit extraction, formatting, caret management,
   * or history.
   *
   * Useful for fields that can switch between a masked format and free text,
   * e.g. a "phone or email" login field — bypass the mask while the user is
   * typing an email address.
   *
   * **Function form** `(value: string) => boolean` is evaluated against the
   * *raw* input as the user types — i.e. `e.target.value`, before any mask
   * processing — so it can react to the very first non-digit character
   * instead of one render late (a plain `boolean` computed from the previous
   * `value` would let the masked `onChange` strip that character first).
   * For external `value` updates, paste, focus/blur/keyboard handling, and
   * `ghostValue`/`inputMode`, it's evaluated against the current field value.
   *
   * The first edit that flips the function form from `false` to `true`
   * converts the formatted value to its raw form — placeholders and mask
   * literals are dropped, keeping only the digits already entered plus the
   * characters just typed/pasted (e.g. `"+7 (983) ___-__-__"` + typing `s`
   * after `983` becomes `"983s"`, not `"+7 (983s) ___-__-__"`). Once
   * `bypassMask` stays `true`, further edits pass through verbatim.
   *
   * @example
   * // "phone or email" field: bypass the mask once a non-digit appears
   * bypassMask={(input) => /[^\d\s()+-]/.test(input)}
   *
   * `getParsedValues` still works in this mode, returning the raw value in
   * every field (`prefix` is `''`, `isMaskCompleted` is always `false`).
   *
   * @default false
   */
  bypassMask?: boolean | ((value: string) => boolean);
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
