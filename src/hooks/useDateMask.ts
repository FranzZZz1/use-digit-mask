import { useMemo } from 'react';

import { type NamedBlock, type UseMaskProps } from './types';
import { useMask } from './useMask';

export type UseDateMaskProps = Omit<UseMaskProps, 'mask' | 'blocks' | 'normalize'> & {
  /**
   * Date/time format string. Supports moment-style (`DD/MM/YYYY`) and
   * date-fns-style (`dd/MM/yyyy`) tokens — both casings are accepted.
   *
   * Recognised tokens:
   * - `dd` / `DD` — day of month (01–31)
   * - `MM` — month (01–12)
   * - `yyyy` / `YYYY` — 4-digit year
   * - `yy` / `YY` — 2-digit year
   * - `HH` — hours 24 h (00–23)
   * - `hh` — hours 12 h (01–12)
   * - `mm` — minutes (00–59)
   * - `ss` — seconds (00–59)
   *
   * Any other character becomes a literal separator in the mask.
   * The formatted value returned via `onChange` can be passed directly to
   * `date-fns` `parse(value, format, refDate)` or `moment(value, format)`.
   *
   * @example
   * useDateMask({ format: 'dd/MM/yyyy', value, onChange })
   * useDateMask({ format: 'dd.MM.yyyy HH:mm', value, onChange })
   */
  format: string;
  /**
   * Earliest allowed value. Pass a `Date` object or a formatted string matching
   * the `format` prop. Tokens present in the bound are applied hierarchically —
   * the minute constraint only activates when the hour already equals the bound.
   *
   * Incomplete string values (e.g. `'14:__'`) are accepted: only fully-typed
   * tokens participate in the constraint.
   *
   * @example
   * // No past dates
   * min={new Date('1900-01-01')}
   *
   * // Two time pickers — end must not precede start
   * min={startValue}  // e.g. '14:30'
   */
  min?: Date | string;
  /**
   * Latest allowed value. Same semantics as {@link min}.
   *
   * @example
   * // No future dates
   * max={new Date()}
   */
  max?: Date | string;
  /** Not available on `useDateMask` — bypass mode is `useMask`-only. */
  bypassMask?: never;
};

const TOKENS = [
  { token: 'yyyy', type: 'year4' },
  { token: 'YYYY', type: 'year4' },
  { token: 'yy', type: 'year2' },
  { token: 'YY', type: 'year2' },
  { token: 'MM', type: 'month' },
  { token: 'dd', type: 'day' },
  { token: 'DD', type: 'day' },
  { token: 'HH', type: 'hour24' },
  { token: 'hh', type: 'hour12' },
  { token: 'mm', type: 'minute' },
  { token: 'ss', type: 'second' },
] as const;

type TokenType = (typeof TOKENS)[number]['type'];
type ParsedToken = { type: TokenType; token: string };

const TOKEN_HIERARCHY: TokenType[] = ['year4', 'year2', 'month', 'day', 'hour24', 'hour12', 'minute', 'second'];

const hierarchyRank = (t: TokenType) => TOKEN_HIERARCHY.indexOf(t);

const TOKEN_DEFAULTS: Record<TokenType, { min: number; max: number }> = {
  year4: { min: 1, max: 9999 },
  year2: { min: 0, max: 99 },
  month: { min: 1, max: 12 },
  day: { min: 1, max: 31 },
  hour24: { min: 0, max: 23 },
  hour12: { min: 1, max: 12 },
  minute: { min: 0, max: 59 },
  second: { min: 0, max: 59 },
};

// Days per month (index 0 = January). February uses 29 as a safe upper bound
// when the year is unknown; leap-year logic tightens it when YYYY is complete.
const DAYS_PER_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function parseFormat(format: string): ParsedToken[] {
  const parsedTokens: ParsedToken[] = [];
  let i = 0;
  while (i < format.length) {
    let matched = false;
    for (let t = 0; t < TOKENS.length; t += 1) {
      const { token, type } = TOKENS[t];
      if (format.startsWith(token, i)) {
        parsedTokens.push({ type, token });
        i += token.length;
        matched = true;
        break;
      }
    }
    if (!matched) i += 1;
  }
  return parsedTokens;
}

type BoundValues = Record<string, string>;

/** Extract per-token digit strings from a Date object. */
function boundFromDate(date: Date, parsedTokens: ParsedToken[]): BoundValues {
  const map: BoundValues = {};
  for (let i = 0; i < parsedTokens.length; i += 1) {
    const { type, token } = parsedTokens[i];
    switch (type) {
      case 'year4':
        map[token] = String(date.getFullYear()).padStart(4, '0');
        break;
      case 'year2':
        map[token] = String(date.getFullYear() % 100).padStart(2, '0');
        break;
      case 'month':
        map[token] = String(date.getMonth() + 1).padStart(2, '0');
        break;
      case 'day':
        map[token] = String(date.getDate()).padStart(2, '0');
        break;
      case 'hour24':
        map[token] = String(date.getHours()).padStart(2, '0');
        break;
      case 'hour12':
        map[token] = String(date.getHours() % 12 || 12).padStart(2, '0');
        break;
      case 'minute':
        map[token] = String(date.getMinutes()).padStart(2, '0');
        break;
      case 'second':
        map[token] = String(date.getSeconds()).padStart(2, '0');
        break;
      default:
        break;
    }
  }
  return map;
}

/**
 * Extract per-token values from a formatted string.
 * Walks format and value in parallel; skips tokens whose extracted slice
 * contains placeholder chars (incomplete input — e.g. `'14:__'`).
 */
function boundFromString(value: string, format: string): BoundValues {
  const map: BoundValues = {};
  let fi = 0;
  let vi = 0;
  while (fi < format.length && vi < value.length) {
    let matched = false;
    for (let t = 0; t < TOKENS.length; t += 1) {
      const { token } = TOKENS[t];
      if (format.startsWith(token, fi)) {
        const slice = value.slice(vi, vi + token.length);
        if (slice.length === token.length && !slice.includes('_')) {
          map[token] = slice;
        }
        fi += token.length;
        vi += token.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      fi += 1;
      vi += 1;
    }
  }
  return map;
}

function parseBound(bound: Date | string | undefined, format: string, parsedTokens: ParsedToken[]): BoundValues | null {
  if (!bound) return null;
  if (bound instanceof Date) return boundFromDate(bound, parsedTokens);
  return boundFromString(bound, format);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getMaxDays(monthStr: string, yearStr: string): number {
  // Only constrain when the month block is fully typed (both digits).
  // A single-digit month like '2' could still become '20'–'29' (clamped to 12),
  // so we must not treat it as February prematurely.
  if (monthStr.length < 2) return 31;
  const month = parseInt(monthStr, 10);
  if (!month || month < 1 || month > 12) return 31;
  const base = DAYS_PER_MONTH[month - 1];
  if (month === 2 && yearStr.length === 4) {
    const year = parseInt(yearStr, 10);
    if (!Number.isNaN(year)) return isLeapYear(year) ? 29 : 28;
  }
  return base;
}

/** Returns tokens whose hierarchy rank is lower than `type`'s rank. */
function getParentTokens(parsedTokens: ParsedToken[], type: TokenType): ParsedToken[] {
  return parsedTokens.filter((t) => hierarchyRank(t.type) < hierarchyRank(type));
}

/**
 * Returns true when every parent token's current value exactly matches
 * the corresponding value in `bound` — meaning the bound constraint for
 * the child token should be activated.
 */
function parentsMatchBound(parents: ParsedToken[], bound: BoundValues, currentValues: Record<string, string>): boolean {
  return parents.every((p) => bound[p.token] !== undefined && currentValues[p.token] === bound[p.token]);
}

function buildNamedBlocks(
  parsedTokens: ParsedToken[],
  minValues: BoundValues | null,
  maxValues: BoundValues | null,
): Record<string, NamedBlock> {
  const monthToken = parsedTokens.find((t) => t.type === 'month')?.token;
  const yearToken = parsedTokens.find((t) => t.type === 'year4' || t.type === 'year2')?.token;

  const blocks: Record<string, NamedBlock> = {};

  for (let pi = 0; pi < parsedTokens.length; pi += 1) {
    const { type, token } = parsedTokens[pi];
    const parents = getParentTokens(parsedTokens, type);

    switch (type) {
      case 'year4':
      case 'year2': {
        const { min: defMin, max: defMax } = TOKEN_DEFAULTS[type];
        blocks[token] = {
          min: minValues?.[token] ? parseInt(minValues[token], 10) : defMin,
          max: maxValues?.[token] ? parseInt(maxValues[token], 10) : defMax,
        };
        break;
      }

      case 'day':
        blocks[token] = (values: Record<string, string>) => {
          const naturalMax = getMaxDays(
            monthToken ? (values[monthToken] ?? '') : '',
            yearToken ? (values[yearToken] ?? '') : '',
          );
          let min = 1;
          let max = naturalMax;

          if (minValues?.[token] && parentsMatchBound(parents, minValues, values)) {
            min = Math.max(1, parseInt(minValues[token], 10));
          }
          if (maxValues?.[token] && parentsMatchBound(parents, maxValues, values)) {
            max = Math.min(naturalMax, parseInt(maxValues[token], 10));
          }

          return { min, max };
        };
        break;

      default: {
        const { min: defMin, max: defMax } = TOKEN_DEFAULTS[type];

        const hasBounds = minValues?.[token] !== undefined || maxValues?.[token] !== undefined;
        if (!hasBounds && parents.length === 0) {
          blocks[token] = { min: defMin, max: defMax };
          break;
        }

        blocks[token] = (values: Record<string, string>) => {
          let min = defMin;
          let max = defMax;

          if (minValues?.[token] && parentsMatchBound(parents, minValues, values)) {
            min = Math.max(defMin, parseInt(minValues[token], 10));
          }
          if (maxValues?.[token] && parentsMatchBound(parents, maxValues, values)) {
            max = Math.min(defMax, parseInt(maxValues[token], 10));
          }

          return { min, max };
        };
        break;
      }
    }
  }

  return blocks;
}

export function useDateMask({ format, min, max, bypassMask: _bypassMask, ...rest }: UseDateMaskProps) {
  const parsedTokens = useMemo(() => parseFormat(format), [format]);

  const minValues = useMemo(() => parseBound(min, format, parsedTokens), [min, format, parsedTokens]);
  const maxValues = useMemo(() => parseBound(max, format, parsedTokens), [max, format, parsedTokens]);

  const blocks = useMemo(
    () => buildNamedBlocks(parsedTokens, minValues, maxValues),
    [parsedTokens, minValues, maxValues],
  );

  return useMask({ ...rest, mask: format, blocks });
}
