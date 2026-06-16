import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PASTE_STRIP_PREFIX, PHONE_MASK } from '../constants';

import { fireChangeAt, getInput, RussiaPhone, TestInput, UkPhone, UsPhone } from './_helpers';

/**
 * На Android вставка из буфера не генерирует событие paste - вместо этого
 * IME вставляет текст как обычный onChange. handlePaste при этом не вызывается,
 * и логика срезания префикса в useMask должна работать через handleChange.
 */
describe('Android IME paste - срезание allowed-префикса через onChange', () => {
  it('вставка числа с alt-префиксом "8" - "8" срезается', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('вставка форматированного номера при cursor внутри поля — двойной "+7" срезается', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '+7 (+7 (983) 120-48-97___) ___-__-__', 22);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});

describe('Android IME paste - guard rails: strip не происходит', () => {
  it('allowedPrefixes=["8"] - "7" не объявлен префиксом и не срезается', () => {
    render(<TestInput alwaysActive mask={PHONE_MASK} allowedPrefixes={['8']} />);
    const input = getInput();
    fireChangeAt(input, '79831204897', 11);
    expect(input.value).toBe('+7 (798) 312-04-89');
  });

  it('allowedPrefixes=[] - alt-префикс "8" не срезается', () => {
    render(<TestInput alwaysActive mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('allowedPrefixes=[] - ведущая "7" не срезается, идёт в первый слот', () => {
    render(<TestInput alwaysActive mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '79831204897', 11);
    expect(input.value).toBe('+7 (798) 312-04-89');
  });

  it('ровно maxDigits цифр с allowed-префиксным началом - strip не происходит', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '8983120489', 10);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('число не начинается с ни одного allowed-prefix - strip не происходит', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '12345678901', 11);
    expect(input.value).toBe('+7 (123) 456-78-90');
  });

  it('guard: ввод цифры совпадающей с alt-prefix в середину полной маски — strip не происходит', () => {
    render(<RussiaPhone initialValue="+7 (983) 120-48-97" />);
    const input = getInput();
    fireChangeAt(input, '+7 (8983) 120-48-97', 6);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });
});

describe('Android IME paste - частичный номер в активированное поле', () => {
  it('вставка "+7 (983) 120-" в поле с шаблоном — "+7" срезается, остаток идёт в тело', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (+7 (983) 120-___) ___-__-__', 18);
    expect(input.value).toBe('+7 (983) 120-__-__');
  });

  it('guard: обычный ввод "9" в первый слот — нет дублированного префикса, strip не происходит', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (9___) ___-__-__', 5);
    expect(input.value).toBe('+7 (9__) ___-__-__');
  });
});

describe('Форматы вставки — Сценарий A: замена всего поля (allowedPrefixes=["+7","8"])', () => {
  it('частичный "8983120" — 7 цифр < maxDigits, "8" не срезается', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '8983120', 7);
    expect(input.value).toBe('+7 (898) 312-0_-__');
  });

  it('частичный "8 (983) 120" — то же что "8983120", форматирование игнорируется', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '8 (983) 120', 11);
    expect(input.value).toBe('+7 (898) 312-0_-__');
  });

  it('частичный "7983120" — stripVisiblePrefix срезает "7", 6 цифр в тело', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '7983120', 7);
    expect(input.value).toBe('+7 (983) 120-__-__');
  });

  it('частичный "+7983120" — то же что "7983120", "+" не цифра', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7983120', 8);
    expect(input.value).toBe('+7 (983) 120-__-__');
  });

  it('частичный "+7 (983) 120" — isFormattedInput=true, "7" срезается', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (983) 120', 12);
    expect(input.value).toBe('+7 (983) 120-__-__');
  });

  it('полный "+79831204897" — stripVisiblePrefix срезает "7", 10 цифр', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+79831204897', 12);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('полный "8 (983) 120-48-97" — форматированный с alt-prefix, "8" срезается', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '8 (983) 120-48-97', 17);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});

describe('Форматы вставки — Сценарий B: вставка в cursor=4 активного шаблона', () => {
  it('частичный "8983120" — "8" не срезается (<maxDigits, нет двойного "+7 (")', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (8983120___) ___-__-__', 11);
    expect(input.value).toBe('+7 (898) 312-0_-__');
  });

  it('частичный "8 (983) 120" — то же что "8983120", скобки в raw-строке не влияют', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (8 (983) 120___) ___-__-__', 15);
    expect(input.value).toBe('+7 (898) 312-0_-__');
  });

  it('частичный "7983120" — нет двойного "+7 (", "7" не срезается', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (7983120___) ___-__-__', 11);
    expect(input.value).toBe('+7 (798) 312-0_-__');
  });

  it('частичный "+7983120" — "+7" без "(" не детектируется как embeddedPrefix, "7" не срезается', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (+7983120___) ___-__-__', 12);
    expect(input.value).toBe('+7 (798) 312-0_-__');
  });

  it('полный "89831204897" — "8" срезается (11 > maxDigits)', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (89831204897___) ___-__-__', 15);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('полный "79831204897" — "7" срезается (11 > maxDigits)', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (79831204897___) ___-__-__', 15);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('полный "+79831204897" — "7" срезается (11 > maxDigits)', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (+79831204897___) ___-__-__', 16);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});

describe('Android IME paste — номер с чужим двухсимвольным prefix-ом', () => {
  it('"+77 (123) 456-78-90" в маску "+7 (###)" — "7" срезается один раз, второй "7" идёт в тело', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+77 (123) 456-78-90', 19);
    expect(input.value).toBe('+7 (712) 345-67-89');
  });
});

describe('Android IME paste — pasteStripPrefix через onChange (H1)', () => {
  it('"always": 10 цифр с "8" через onChange — "8" стрипается', () => {
    render(<RussiaPhone alwaysActive pasteStripPrefix={PASTE_STRIP_PREFIX.always} />);
    const input = getInput();
    fireChangeAt(input, '8983120489', 10);
    expect(input.value).toBe('+7 (983) 120-48-9_');
  });

  it('default "overflow": 10 цифр с "8" через onChange — "8" остаётся в теле', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '8983120489', 10);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });
});

describe('iOS autofill / password manager / другие источники без paste-события', () => {
  it('iOS autofill форматированного номера — stripVisiblePrefix достаточно, fix не задействуется', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+7 (983) 120-48-97', 18);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('iOS autofill raw-цифр "79831204897" — stripAllowedPrefix срезает "7"', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '79831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('password manager с cursor ровно на strippedCandidate.length — мягкая деградация', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 10);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('WebView / password manager на desktop — курсор в конце, strip срабатывает', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});

describe('Mobile onChange на неактивном поле (cursor ≤ prefixLength)', () => {
  it('вставка "120" (cursor=3 ≤ prefixLength=4) — всё тело, без стрипа', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '120', 3);
    expect(input.value).toBe('+7 (120) ___-__-__');
  });

  it('вставка "8120" (cursor=4 ≤ prefixLength=4) — "8" не стрипается при overflow=false', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '8120', 4);
    expect(input.value).toBe('+7 (812) 0__-__-__');
  });

  it('вставка "89831204897" (cursor=4 ≤ prefixLength=4, overflow) — "8" стрипается', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 4);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('вставка "89831204897" (cursor=11 > prefixLength=4, overflow) — "8" стрипается', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('вставка "8983120489" (cursor=10, ровно maxDigits) — "8" НЕ стрипается (overflow mode)', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '8983120489', 10);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('pasteStripPrefix="always", "8983120489" (ровно maxDigits) — "8" стрипается', () => {
    render(<RussiaPhone pasteStripPrefix={PASTE_STRIP_PREFIX.always} />);
    const input = getInput();
    fireChangeAt(input, '8983120489', 10);
    expect(input.value).toBe('+7 (983) 120-48-9_');
  });
});

describe('General path (active) — США "+1 (###) ###-####"', () => {
  it('"12024567890" — visiblePrefix "1" стрипается, 10 цифр в тело', () => {
    render(<UsPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '12024567890', 11);
    expect(input.value).toBe('+1 (202) 456-7890');
  });

  it('"2024567890" (без prefix) — 10 цифр без стрипа', () => {
    render(<UsPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '2024567890', 10);
    expect(input.value).toBe('+1 (202) 456-7890');
  });

  it('"1234567890" — "1" стрипается как visiblePrefix, 9 цифр в тело', () => {
    render(<UsPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '1234567890', 10);
    expect(input.value).toBe('+1 (234) 567-890_');
  });

  it('pasteStripPrefix="always", "12024567890" — "1" стрипается', () => {
    render(<UsPhone alwaysActive pasteStripPrefix={PASTE_STRIP_PREFIX.always} />);
    const input = getInput();
    fireChangeAt(input, '12024567890', 11);
    expect(input.value).toBe('+1 (202) 456-7890');
  });
});

describe('General path (active) — Великобритания "+44 #### ######" (двузначный cc)', () => {
  it('"441234567890" — visiblePrefix "44" стрипается, 10 цифр в тело', () => {
    render(<UkPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '441234567890', 12);
    expect(input.value).toBe('+44 1234 567890');
  });

  it('"1234567890" (без prefix) — 10 цифр без стрипа', () => {
    render(<UkPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '1234567890', 10);
    expect(input.value).toBe('+44 1234 567890');
  });

  it('"4412345678" — "44" стрипается как visiblePrefix, 8 цифр в тело', () => {
    render(<UkPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '4412345678', 10);
    expect(input.value).toBe('+44 1234 5678__');
  });

  it('pasteStripPrefix="always", "4412345678" — "44" стрипается', () => {
    render(<UkPhone alwaysActive pasteStripPrefix={PASTE_STRIP_PREFIX.always} />);
    const input = getInput();
    fireChangeAt(input, '4412345678', 10);
    expect(input.value).toBe('+44 1234 5678__');
  });
});
