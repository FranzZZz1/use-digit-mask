import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PASTE_STRIP_PREFIX, PHONE_MASK, PHONE_PREFIXES } from '../constants';

import { fireChangeAt, firePaste, getInput, placeCaret, TestInput } from './_helpers';

describe('Вставка - без префикса', () => {
  it('вставка чистых цифр в пустое поле', () => {
    render(<TestInput mask="#### #### #### ####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '1234567890123456');
    expect(input.value).toBe('1234 5678 9012 3456');
  });

  it('вставка лишних цифр обрезается до maxDigits', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '123456789');
    expect(input.value).toBe('1234');
  });

  it('вставка в середину заполненной маски', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5678" />);
    const input = getInput();
    placeCaret(input, 2);
    firePaste(input, '99');
    expect(input.value).toBe('1299 3456');
  });

  it('вставка заменяет выделение', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5678" />);
    const input = getInput();
    placeCaret(input, 0, 4);
    firePaste(input, '9999');
    expect(input.value).toBe('9999 5678');
  });

  it('цифры с нецифровыми символами внутри - только цифры', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '1-2-3-4');
    expect(input.value).toBe('1234');
  });
});

describe('Вставка - с видимым префиксом', () => {
  const MASK = PHONE_MASK;
  const PREFIXES = PHONE_PREFIXES;

  it('вставка "+7 (999) 123-45-67" - стрипает видимый префикс', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 0);
    firePaste(input, '+7 (999) 123-45-67');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('вставка "79991234567" - стрипает цифровой префикс', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 0);
    firePaste(input, '79991234567');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('вставка "89991234567" - префикс 8 стрипается', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 0);
    firePaste(input, '89991234567');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('вставка "9991234567" без префикса - вставляется как есть', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 0);
    firePaste(input, '9991234567');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('вставка только "+7" в неактивную маску -> активирует маску, тело пустое', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7');
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('вставка только "8" в неактивную маску -> активирует маску, тело пустое', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8');
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('вставка "7" (цифровой prefix) в неактивную маску -> активирует', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '7');
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('вставка "+7" в активированную маску -> "7" идёт в первый слот', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7');
    expect(input.value).toBe('+7 (7__) ___-__-__');
  });

  it('вставка "8" в активированную маску -> "8" идёт в первый слот', () => {
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8');
    expect(input.value).toBe('+7 (8__) ___-__-__');
  });

  it('вставка "+7" в активированную маску с уже введёнными цифрами -> "7" вставляется в начало', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} initialValue="+7 (983) 120-48-97" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7');
    expect(input.value).toBe('+7 (798) 312-04-89');
  });
});

describe('Вставка — pasteStripPrefix', () => {
  const MASK = PHONE_MASK;
  const PREFIXES = PHONE_PREFIXES;

  it('default "overflow": 10 цифр начинающихся с "8" — "8" остаётся, маска полная', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8983120489');
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('"always": 10 цифр начинающихся с "8" — "8" стрипается, маска неполная', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} pasteStripPrefix={PASTE_STRIP_PREFIX.always} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8983120489');
    expect(input.value).toBe('+7 (983) 120-48-9_');
  });

  it('"overflow": 10 цифр начинающихся с "8" — "8" остаётся в теле, маска полная', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} pasteStripPrefix={PASTE_STRIP_PREFIX.overflow} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8983120489');
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('"overflow": 11 цифр с "8" — overflow, "8" стрипается', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} pasteStripPrefix={PASTE_STRIP_PREFIX.overflow} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '89831204897');
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('"overflow": 11 цифр с "+7 (" — overflow, prefix стрипается', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} pasteStripPrefix={PASTE_STRIP_PREFIX.overflow} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+79831204897');
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('default "overflow": частичный "+7 (983) 120-48-" — visiblePrefix стрипается', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7 (983) 120-48-');
    expect(input.value).toBe('+7 (983) 120-48-__');
  });

  it('default "overflow": частичный "798312048" (raw, 9 цифр) — "7" не стрипается', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '798312048');
    expect(input.value).toBe('+7 (798) 312-04-8_');
  });
});

describe('Вставка при allowedPrefixes = []', () => {
  const MASK = PHONE_MASK;

  it('вставка "79991234567" — "7" идёт в первый слот, не стрипается как префикс', () => {
    render(<TestInput mask={MASK} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '79991234567');
    expect(input.value).toBe('+7 (799) 912-34-56');
  });

  it('вставка "+7 (9991234567)" — цифры маски не стрипаются, "7" идёт в слот', () => {
    render(<TestInput mask={MASK} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7 (9991234567)');
    expect(input.value).toBe('+7 (799) 912-34-56');
  });
});

describe('Вставка - маска без префикса', () => {
  it('вставка цифр соответствует ожидаемому формату даты', () => {
    render(<TestInput mask="##/##/####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '01012025');
    expect(input.value).toBe('01/01/2025');
  });

  it('вставка PIN-кода', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '4242');
    expect(input.value).toBe('4242');
  });
});
