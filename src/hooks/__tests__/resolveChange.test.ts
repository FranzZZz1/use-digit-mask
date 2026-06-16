import { describe, expect, it } from 'vitest';

import { resolveChange, type ResolveChangeOptions } from '../internal/resolveChange';
import { computeMaskMeta } from '../internal/useMaskMeta';

import { PASTE_STRIP_PREFIX, PHONE_MASK, PHONE_PREFIX_DIGITS } from './constants';

const makeMeta = computeMaskMeta;

function makePhonePrefixHelpers(visiblePrefixDigits: string, allowedPrefixesDigits: string[]) {
  const stripVisiblePrefix = (d: string) =>
    visiblePrefixDigits && d.startsWith(visiblePrefixDigits) ? d.slice(visiblePrefixDigits.length) : d;
  const stripAllowedPrefix = (d: string) => {
    const match = allowedPrefixesDigits.find((p) => p && d.startsWith(p));
    return match ? d.slice(match.length) : d;
  };
  const startsWithAllowedPrefix = (d: string) => allowedPrefixesDigits.some((p) => p && d.startsWith(p));
  return { stripVisiblePrefix, stripAllowedPrefix, startsWithAllowedPrefix };
}

const MASK_7 = PHONE_MASK;
const MASK_77 = '+77 (###) ###-##-##';

function opts7(overrides: Partial<ResolveChangeOptions> = {}): ResolveChangeOptions {
  const meta = makeMeta(MASK_7);
  const helpers = makePhonePrefixHelpers('7', PHONE_PREFIX_DIGITS);
  return {
    input: '',
    cursor: 0,
    isMaskActive: true,
    prevDigits: '',
    maskMeta: meta,
    allowedPrefixesDigits: PHONE_PREFIX_DIGITS,
    normalize: undefined,
    ...helpers,
    ...overrides,
  };
}

function opts77(overrides: Partial<ResolveChangeOptions> = {}): ResolveChangeOptions {
  const meta = makeMeta(MASK_77);
  const helpers = makePhonePrefixHelpers('77', ['77']);
  return {
    input: '',
    cursor: 0,
    isMaskActive: true,
    prevDigits: '1234567890',
    maskMeta: meta,
    allowedPrefixesDigits: ['77'],
    normalize: undefined,
    ...helpers,
    ...overrides,
  };
}

describe('resolveChange — неактивное поле (isMaskActive=false, prevDigitsLength=0)', () => {
  it('первый символ совпадает с allowed-prefix -> activate-prefix', () => {
    const result = resolveChange(opts7({ isMaskActive: false, prevDigits: '', input: '7', cursor: 1 }));
    expect(result).toEqual({ kind: 'activate-prefix' });
  });

  it('первый символ — обычная цифра -> apply с этой цифрой', () => {
    const result = resolveChange(opts7({ isMaskActive: false, prevDigits: '', input: '9', cursor: 1 }));
    expect(result).toEqual({ kind: 'apply', digits: '9', caretDigitsOnLeft: 1 });
  });

  it('isMaskActive=false но prevDigitsLength>0 -> не входим в блок неактивной маски', () => {
    const result = resolveChange(opts7({ isMaskActive: false, prevDigits: '1234567890', input: '+7', cursor: 2 }));
    expect(result).toEqual({ kind: 'clear' });
  });
});

describe('resolveChange — многосимвольный ввод в неактивное поле', () => {
  it('10 цифр вставлены в неактивное поле -> apply без stripped-prefix (length не > maxDigits)', () => {
    const result = resolveChange(opts7({ isMaskActive: false, prevDigits: '', input: '9831204897', cursor: 10 }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });

  it('курсор не в конце вставленных цифр -> caretDigitsOnLeft соответствует курсору, а не длине digits', () => {
    const result = resolveChange(opts7({ isMaskActive: false, prevDigits: '', input: '9831204897', cursor: 5 }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 5 });
  });
});

describe('resolveChange — cut с захватом prefix-а', () => {
  it('+7 (одиночный prefix) — оставшийся "+7 (" -> clear', () => {
    const result = resolveChange(opts7({ input: '+7 (', cursor: 4 }));
    expect(result).toEqual({ kind: 'clear' });
  });

  it('+7 (одиночный prefix) — оставшийся "+" -> clear', () => {
    const result = resolveChange(opts7({ input: '+', cursor: 1 }));
    expect(result).toEqual({ kind: 'clear' });
  });

  it('+7 (одиночный prefix) — пустой input -> clear', () => {
    const result = resolveChange(opts7({ input: '', cursor: 0 }));
    expect(result).toEqual({ kind: 'clear' });
  });

  it('+77 (двухсимвольный prefix) — оставшийся "+7" -> clear', () => {
    const result = resolveChange(opts77({ input: '+7', cursor: 2 }));
    expect(result).toEqual({ kind: 'clear' });
  });

  it('+77 (двухсимвольный prefix) — оставшийся "+" -> clear', () => {
    const result = resolveChange(opts77({ input: '+', cursor: 1 }));
    expect(result).toEqual({ kind: 'clear' });
  });

  it('+77 (двухсимвольный prefix) — пустой input -> clear', () => {
    const result = resolveChange(opts77({ input: '', cursor: 0 }));
    expect(result).toEqual({ kind: 'clear' });
  });

  it('+77 — оставшийся точный visiblePrefix "+77 (" -> clear (тело удалено)', () => {
    const result = resolveChange(opts77({ input: '+77 (', cursor: 5 }));
    expect(result).toEqual({ kind: 'clear' });
  });
});

describe('resolveChange — digit typed before prefix (Android edge-case)', () => {
  it('цифра "5" введена перед "+7 (" -> apply с "5" как первым слотом', () => {
    const result = resolveChange(opts7({ input: '5+7 (___) ___-__-__', cursor: 1 }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') {
      expect(result.digits).toBe('5');
      expect(result.caretDigitsOnLeft).toBe(1);
    }
  });

  it('цифра "5" введена перед "+77 (" -> apply с "5" как первым слотом', () => {
    const result = resolveChange(opts77({ input: '5+77 (___) ___-__-__', cursor: 1 }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') {
      expect(result.digits).toBe('5');
      expect(result.caretDigitsOnLeft).toBe(1);
    }
  });
});

describe('resolveChange — нормальный ввод', () => {
  it('форматированное значение — stripVisiblePrefix применяется', () => {
    const result = resolveChange(opts7({ input: '+7 (983) 120-48-97', cursor: 18 }));
    expect(result).toEqual({ kind: 'apply', digits: '9831204897', caretDigitsOnLeft: 10 });
  });

  it('ввод цифры "9" в первый слот активного поля', () => {
    const result = resolveChange(opts7({ input: '+7 (9__) ___-__-__', cursor: 6, prevDigits: '' }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') {
      expect(result.digits).toBe('9');
    }
  });
});

describe('resolveChange — Android IME paste (через onChange)', () => {
  it('полный номер с alt-prefix "8" (11 цифр) — "8" срезается, digits=10 цифр', () => {
    const result = resolveChange(opts7({ input: '89831204897', cursor: 11 }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') {
      expect(result.digits).toBe('9831204897');
      expect(result.caretDigitsOnLeft).toBe(11);
    }
  });

  it('двойной prefix в input (вставка на позицию внутри шаблона) — "7" срезается', () => {
    const result = resolveChange(opts7({ input: '+7 (+7 (983) 120-48-97___) ___-__-__', cursor: 22 }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') {
      expect(result.digits).toBe('9831204897');
    }
  });

  it('номер с чужим двухсимвольным prefix-ом "+77 (123)..." — стрипается только один "7"', () => {
    const result = resolveChange(opts7({ input: '+77 (123) 456-78-90', cursor: 19 }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') {
      expect(result.digits).toBe('71234567890');
    }
  });

  it('ровно maxDigits цифр с allowed-prefix — strip не происходит', () => {
    const result = resolveChange(opts7({ input: '8983120489', cursor: 10 }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') {
      expect(result.digits).toBe('8983120489');
    }
  });

  it('guard: ввод "8" в середину заполненной маски — strip не происходит', () => {
    const result = resolveChange(opts7({ input: '+7 (8983) 120-48-97', cursor: 6, prevDigits: '9831204897' }));
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') {
      expect(result.digits).toBe('89831204897');
      expect(result.caretDigitsOnLeft).toBe(2);
    }
  });
});

describe('resolveChange — выделение цифр + невалидный символ', () => {
  it('выделили последние 2 цифры заполненной маски и набрали букву -> ignore, каретка остаётся на месте выделения', () => {
    const result = resolveChange(
      opts7({ input: '+7 (983) 120-48-x', cursor: 17, prevDigits: '9831204897' }),
    );
    expect(result).toEqual({ kind: 'ignore', caretDigitsOnLeft: 10 });
  });

  it('выделили цифры в середине заполненной маски и набрали букву -> ignore, каретка на конце выделения', () => {
    const result = resolveChange(
      opts7({ input: '+7 (983) x-48-97', cursor: 10, prevDigits: '9831204897' }),
    );
    expect(result).toEqual({ kind: 'ignore', caretDigitsOnLeft: 6 });
  });

  it('выделение захватывает prefix + часть тела, набрали букву -> ignore, каретка на конце выделения', () => {
    const result = resolveChange(
      opts7({ input: 'x-48-97', cursor: 1, prevDigits: '9831204897' }),
    );
    expect(result).toEqual({ kind: 'ignore', caretDigitsOnLeft: 6 });
  });
});

describe('resolveChange — pasteStripPrefix', () => {
  it('default "overflow": 10 цифр с "8" — не стрипается (нет overflow)', () => {
    const result = resolveChange(opts7({ input: '8983120489', cursor: 10 }));
    expect(result).toEqual({ kind: 'apply', digits: '8983120489', caretDigitsOnLeft: 10 });
  });

  it('"always": 10 цифр с "8" — "8" стрипается даже без overflow (зеркалит desktop-paste)', () => {
    const result = resolveChange(
      opts7({ input: '8983120489', cursor: 10, pasteStripPrefix: PASTE_STRIP_PREFIX.always }),
    );
    expect(result).toEqual({ kind: 'apply', digits: '983120489', caretDigitsOnLeft: 10 });
  });

  it('"always" guard: ввод "8" в середину заполненной маски — strip не происходит (cursor guard)', () => {
    const result = resolveChange(
      opts7({
        input: '+7 (8983) 120-48-97',
        cursor: 6,
        prevDigits: '1234567890',
        pasteStripPrefix: PASTE_STRIP_PREFIX.always,
      }),
    );
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') expect(result.digits).toBe('89831204897');
  });

  it('"always": 11 цифр с "8" — overflow, поведение совпадает с overflow', () => {
    const result = resolveChange(
      opts7({ input: '89831204897', cursor: 11, pasteStripPrefix: PASTE_STRIP_PREFIX.always }),
    );
    expect(result.kind).toBe('apply');
    if (result.kind === 'apply') expect(result.digits).toBe('9831204897');
  });
});
