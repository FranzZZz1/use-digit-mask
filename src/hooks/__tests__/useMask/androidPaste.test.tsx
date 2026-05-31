import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PASTE_STRIP_PREFIX, PHONE_MASK, PHONE_PREFIXES } from '../constants';

import { fireChangeAt, getInput, TestInput } from './_helpers';

const MASK = PHONE_MASK;
const PREFIXES = PHONE_PREFIXES;

/**
 * На Android вставка из буфера не генерирует событие paste - вместо этого
 * IME вставляет текст как обычный onChange. handlePaste при этом не вызывается,
 * и логика срезания префикса в useMask должна работать через handleChange.
 */
describe('Android IME paste - срезание allowed-префикса через onChange', () => {
  it('вставка числа с alt-префиксом "8" - "8" срезается', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('вставка форматированного номера при cursor внутри поля — двойной "+7" срезается', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '+7 (+7 (983) 120-48-97___) ___-__-__', 22);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});

describe('Android IME paste - guard rails: strip не происходит', () => {
  it('allowedPrefixes=["8"] - "7" не объявлен префиксом и не срезается', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={['8']} />);
    const input = getInput();
    fireChangeAt(input, '79831204897', 11);
    expect(input.value).toBe('+7 (798) 312-04-89');
  });

  it('allowedPrefixes=[] - alt-префикс "8" не срезается', () => {
    render(<TestInput alwaysActive mask={MASK} />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('allowedPrefixes=[] - ведущая "7" не срезается, идёт в первый слот', () => {
    render(<TestInput alwaysActive mask={MASK} />);
    const input = getInput();
    fireChangeAt(input, '79831204897', 11);
    expect(input.value).toBe('+7 (798) 312-04-89');
  });

  it('ровно maxDigits цифр с allowed-префиксным началом - strip не происходит', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '8983120489', 10);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('число не начинается с ни одного allowed-prefix - strip не происходит', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '12345678901', 11);
    expect(input.value).toBe('+7 (123) 456-78-90');
  });

  it('guard: ввод цифры совпадающей с alt-prefix в середину полной маски — strip не происходит', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} initialValue="+7 (983) 120-48-97" />);
    const input = getInput();
    fireChangeAt(input, '+7 (8983) 120-48-97', 6);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });
});

describe('Android IME paste - частичный номер в активированное поле', () => {
  it('вставка "+7 (983) 120-" в поле с шаблоном — "+7" срезается, остаток идёт в тело', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (+7 (983) 120-___) ___-__-__', 18);
    expect(input.value).toBe('+7 (983) 120-__-__');
  });

  it('guard: обычный ввод "9" в первый слот — нет дублированного префикса, strip не происходит', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (9___) ___-__-__', 5);
    expect(input.value).toBe('+7 (9__) ___-__-__');
  });
});

describe('Форматы вставки — Сценарий A: замена всего поля (allowedPrefixes=["+7","8"])', () => {
  it('частичный "8983120" — 7 цифр < maxDigits, "8" не срезается', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '8983120', 7);
    expect(input.value).toBe('+7 (898) 312-0_-__');
  });

  it('частичный "8 (983) 120" — то же что "8983120", форматирование игнорируется', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '8 (983) 120', 11);
    expect(input.value).toBe('+7 (898) 312-0_-__');
  });

  it('частичный "7983120" — stripVisiblePrefix срезает "7", 6 цифр в тело', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7983120', 7);
    expect(input.value).toBe('+7 (983) 120-__-__');
  });

  it('частичный "+7983120" — то же что "7983120", "+" не цифра', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7983120', 8);
    expect(input.value).toBe('+7 (983) 120-__-__');
  });

  it('частичный "+7 (983) 120" — isFormattedInput=true, "7" срезается', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (983) 120', 12);
    expect(input.value).toBe('+7 (983) 120-__-__');
  });

  it('полный "+79831204897" — stripVisiblePrefix срезает "7", 10 цифр', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+79831204897', 12);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('полный "8 (983) 120-48-97" — форматированный с alt-prefix, "8" срезается', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '8 (983) 120-48-97', 17);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});

describe('Форматы вставки — Сценарий B: вставка в cursor=4 активного шаблона', () => {
  it('частичный "8983120" — "8" не срезается (<maxDigits, нет двойного "+7 (")', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (8983120___) ___-__-__', 11);
    expect(input.value).toBe('+7 (898) 312-0_-__');
  });

  it('частичный "8 (983) 120" — то же что "8983120", скобки в raw-строке не влияют', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (8 (983) 120___) ___-__-__', 15);
    expect(input.value).toBe('+7 (898) 312-0_-__');
  });

  it('частичный "7983120" — нет двойного "+7 (", "7" не срезается', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (7983120___) ___-__-__', 11);
    expect(input.value).toBe('+7 (798) 312-0_-__');
  });

  it('частичный "+7983120" — "+7" без "(" не детектируется как embeddedPrefix, "7" не срезается', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (+7983120___) ___-__-__', 12);
    expect(input.value).toBe('+7 (798) 312-0_-__');
  });

  it('полный "89831204897" — "8" срезается (11 > maxDigits)', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (89831204897___) ___-__-__', 15);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('полный "79831204897" — "7" срезается (11 > maxDigits)', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (79831204897___) ___-__-__', 15);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('полный "+79831204897" — "7" срезается (11 > maxDigits)', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (+79831204897___) ___-__-__', 16);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});

describe('Android IME paste — номер с чужим двухсимвольным prefix-ом', () => {
  it('"+77 (123) 456-78-90" в маску "+7 (###)" — "7" срезается один раз, второй "7" идёт в тело', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+77 (123) 456-78-90', 19);
    expect(input.value).toBe('+7 (712) 345-67-89');
  });
});

describe('Android IME paste — pasteStripPrefix через onChange (H1)', () => {
  it('"always": 10 цифр с "8" через onChange — "8" стрипается', () => {
    render(
      <TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} pasteStripPrefix={PASTE_STRIP_PREFIX.always} />,
    );
    const input = getInput();
    fireChangeAt(input, '8983120489', 10);
    expect(input.value).toBe('+7 (983) 120-48-9_');
  });

  it('default "overflow": 10 цифр с "8" через onChange — "8" остаётся в теле', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '8983120489', 10);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });
});

describe('iOS autofill / password manager / другие источники без paste-события', () => {
  it('iOS autofill форматированного номера — stripVisiblePrefix достаточно, fix не задействуется', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (983) 120-48-97', 18);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('iOS autofill raw-цифр "79831204897" — stripAllowedPrefix срезает "7"', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '79831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('password manager с cursor ровно на strippedCandidate.length — мягкая деградация', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 10);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('WebView / password manager на desktop — курсор в конце, strip срабатывает', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});
