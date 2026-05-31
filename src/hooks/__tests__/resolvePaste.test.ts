import { describe, expect, it } from 'vitest';

import { resolvePaste, type ResolvePasteOptions } from '../internal/resolvePaste';
import { computeMaskMeta } from '../internal/useMaskMeta';

import { PASTE_STRIP_PREFIX, PHONE_MASK, PHONE_PREFIX_DIGITS, PHONE_PREFIXES } from './constants';

const makeMeta = computeMaskMeta;

function makeHelpers(allowedPrefixesDigits: string[]) {
  const stripAllowedPrefix = (d: string) => {
    const match = allowedPrefixesDigits.find((p) => p && d.startsWith(p));
    return match ? d.slice(match.length) : d;
  };
  const startsWithAllowedPrefix = (d: string) => allowedPrefixesDigits.some((p) => p && d.startsWith(p));
  return { stripAllowedPrefix, startsWithAllowedPrefix };
}

const MASK = PHONE_MASK;
const ALLOWED = PHONE_PREFIXES;
const ALLOWED_DIGITS = PHONE_PREFIX_DIGITS;

function opts(overrides: Partial<ResolvePasteOptions> = {}): ResolvePasteOptions {
  const meta = makeMeta(MASK);
  const helpers = makeHelpers(ALLOWED_DIGITS);
  return {
    pasted: '',
    prevDigits: '',
    leftDigitsStart: 0,
    leftDigitsEnd: 0,
    isMaskActive: false,
    maskMeta: meta,
    allowedPrefixes: ALLOWED,
    allowedPrefixesDigits: ALLOWED_DIGITS,
    normalize: undefined,
    ...helpers,
    ...overrides,
  };
}

describe('resolvePaste — activate-prefix', () => {
  it('вставка "+7" в неактивное пустое поле -> activate-prefix', () => {
    expect(resolvePaste(opts({ pasted: '+7', isMaskActive: false }))).toEqual({ kind: 'activate-prefix' });
  });

  it('вставка "7" (digit-only prefix) в неактивное пустое поле -> activate-prefix', () => {
    expect(resolvePaste(opts({ pasted: '7', isMaskActive: false }))).toEqual({ kind: 'activate-prefix' });
  });

  it('вставка "+7 (" (trimmed visiblePrefix) в неактивное поле -> activate-prefix', () => {
    expect(resolvePaste(opts({ pasted: '+7 (', isMaskActive: false }))).toEqual({ kind: 'activate-prefix' });
  });

  it('вставка "+7" в АКТИВНОЕ поле -> не activate-prefix (цифра идёт в тело)', () => {
    const result = resolvePaste(opts({ pasted: '+7', isMaskActive: true }));
    expect(result.kind).toBe('apply');
  });

  it('вставка "+7" в непустое поле (есть prevDigits) -> не activate-prefix', () => {
    const result = resolvePaste(opts({ pasted: '+7', prevDigits: '123', leftDigitsStart: 0, leftDigitsEnd: 1 }));
    expect(result.kind).toBe('apply');
  });
});

describe('resolvePaste — полная замена содержимого', () => {
  it('"+79831204897" -> "7" срезается как visiblePrefix, тело 10 цифр', () => {
    const result = resolvePaste(opts({ pasted: '+79831204897' }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });

  it('"79831204897" -> "7" срезается как allowed digit-prefix', () => {
    const result = resolvePaste(opts({ pasted: '79831204897' }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });

  it('"89831204897" -> "8" срезается как alt-prefix', () => {
    const result = resolvePaste(opts({ pasted: '89831204897' }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });

  it('форматированный "+7 (983) 120-48-97" -> "7" срезается, 10 цифр', () => {
    const result = resolvePaste(opts({ pasted: '+7 (983) 120-48-97' }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });

  it('"+77 (123) 456-78-90" -> "7" срезается один раз, второй "7" идёт в тело', () => {
    const result = resolvePaste(opts({ pasted: '+77 (123) 456-78-90' }));
    expect(result).toEqual({ kind: 'apply', digits: '7123456789', caretDigitsOnLeft: 10 });
  });

  it('"8 (983) 120-48-97" (форматированный с alt-prefix) -> "8" срезается', () => {
    const result = resolvePaste(opts({ pasted: '8 (983) 120-48-97' }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });

  it('ровно 10 цифр без prefix -> strip не происходит', () => {
    const result = resolvePaste(opts({ pasted: '9831204897' }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });

  it('"overflow": частичный форматированный "+7 (983) 120-48-" — visiblePrefix стрипается несмотря на < maxDigits', () => {
    const result = resolvePaste(opts({ pasted: '+7 (983) 120-48-', pasteStripPrefix: PASTE_STRIP_PREFIX.overflow }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') expect(result.digits).toBe('98312048');
  });

  it('"overflow": частичный "+79831204" (non-digit prefix) — стрипается несмотря на < maxDigits', () => {
    const result = resolvePaste(opts({ pasted: '+79831204', pasteStripPrefix: PASTE_STRIP_PREFIX.overflow }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') expect(result.digits).toBe('9831204');
  });

  it('ровно 10 цифр с "8" — default "overflow": strip не происходит', () => {
    const result = resolvePaste(opts({ pasted: '8983120489' }));
    expect(result).toEqual({ kind: 'apply', digits: '8983120489', caretDigitsOnLeft: 10 });
  });

  it('ровно 10 цифр с "8" — явный "always": strip происходит', () => {
    const result = resolvePaste(opts({ pasted: '8983120489', pasteStripPrefix: PASTE_STRIP_PREFIX.always }));
    expect(result).toEqual({ kind: 'apply', digits: '983120489', caretDigitsOnLeft: 9 });
  });

  it('ровно 10 цифр с "8" — "overflow": strip не происходит, "8" остаётся в теле', () => {
    const result = resolvePaste(opts({ pasted: '8983120489', pasteStripPrefix: PASTE_STRIP_PREFIX.overflow }));
    expect(result).toEqual({ kind: 'apply', digits: '8983120489', caretDigitsOnLeft: 10 });
  });

  it('11 цифр с "8" — "overflow": overflow -> strip происходит', () => {
    const result = resolvePaste(opts({ pasted: '89831204897', pasteStripPrefix: PASTE_STRIP_PREFIX.overflow }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });

  it('11 цифр с "8" — "always": strip происходит (поведение совпадает)', () => {
    const result = resolvePaste(opts({ pasted: '89831204897', pasteStripPrefix: PASTE_STRIP_PREFIX.always }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });
});

describe('resolvePaste — частичная вставка', () => {
  it('вставка "56" в середину "12__" -> "1256"', () => {
    const result = resolvePaste(opts({ pasted: '56', prevDigits: '12', leftDigitsStart: 1, leftDigitsEnd: 1 }));
    expect(result).toEqual({ kind: 'apply', digits: '1562', caretDigitsOnLeft: 3 });
  });

  it('замена выделенного "23" на "56" в "1234" -> "1564"', () => {
    const result = resolvePaste(
      opts({
        pasted: '56',
        prevDigits: '1234',
        leftDigitsStart: 1,
        leftDigitsEnd: 3,
      }),
    );
    expect(result).toEqual({ kind: 'apply', digits: '1564', caretDigitsOnLeft: 3 });
  });

  it('prefix не срезается при вставке в середину поля', () => {
    const result = resolvePaste(
      opts({
        pasted: '+79831204897',
        prevDigits: '123',
        leftDigitsStart: 1,
        leftDigitsEnd: 1,
      }),
    );
    expect(result).toEqual({ kind: 'apply', digits: '1798312048', caretDigitsOnLeft: 10 });
  });

  it('вставка в конец поля', () => {
    const result = resolvePaste(
      opts({
        pasted: '56',
        prevDigits: '1234',
        leftDigitsStart: 4,
        leftDigitsEnd: 4,
      }),
    );
    expect(result).toEqual({ kind: 'apply', digits: '123456', caretDigitsOnLeft: 6 });
  });
});

describe('resolvePaste — skipPrefixStripOnce', () => {
  it('"+7" вставлен в активное пустое поле -> "7" идёт в тело (strip пропускается)', () => {
    const result = resolvePaste(opts({ pasted: '+7', isMaskActive: true }));
    expect(result).toEqual({ kind: 'apply', digits: '7', caretDigitsOnLeft: 1 });
  });
});

describe('resolvePaste — маска без prefix', () => {
  it('вставка "1234567890" в "####-####-##" -> полная маска', () => {
    const meta = makeMeta('####-####-##');
    const helpers = makeHelpers([]);
    const result = resolvePaste({
      pasted: '1234567890',
      prevDigits: '',
      leftDigitsStart: 0,
      leftDigitsEnd: 0,
      isMaskActive: false,
      maskMeta: meta,
      allowedPrefixes: [],
      allowedPrefixesDigits: [],
      normalize: undefined,
      ...helpers,
    });
    expect(result).toEqual({ kind: 'apply', digits: '1234567890', caretDigitsOnLeft: 10 });
  });
});
