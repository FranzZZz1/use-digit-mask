/**
 * Opaque marker for a raw (verbatim) code fragment.
 * Use rawCode() to construct — never build this object directly.
 */
export type RawCode = { readonly __rawCode: string };

/** Emits `code` verbatim in the generated output — no quoting applied. */
export function rawCode(code: string): RawCode {
  return { __rawCode: code };
}

function isRawCode(v: unknown): v is RawCode {
  return typeof v === 'object' && v !== null && '__rawCode' in v;
}

/**
 * Typed value for a hook argument. The renderer handles serialization:
 * - string   → 'value'      (quoted string literal)
 * - boolean  → true / false
 * - number   → verbatim
 * - string[] → ['a', 'b']
 * - RawCode  → verbatim     (variable references, expressions)
 */
export type HookArgValue = string | boolean | number | string[] | RawCode;

/** A structured, typed hook key-value argument. */
export type HookArg = { key: string; value: HookArgValue };

/**
 * A single entry in the hook options block.
 * - HookArg: renderer quotes/serializes the value automatically.
 * - string:  pre-formatted raw line (useful for comments, complex literals).
 */
export type HookOption = HookArg | string;

function serializeArgValue(v: HookArgValue): string {
  if (typeof v === 'string') return `'${v}'`;
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return `[${v.map((i) => `'${i}'`).join(', ')}]`;
  if (isRawCode(v)) return v.__rawCode;
  return String(v);
}

export function renderHookOption(opt: HookOption): string {
  if (typeof opt === 'string') return opt;
  return `${opt.key}: ${serializeArgValue(opt.value)},`;
}

export function renderHookOptions(opts: HookOption[], indent: number = 4): string {
  const pad = ' '.repeat(indent);
  return opts.map((o) => `${pad}${renderHookOption(o)}`).join('\n');
}
