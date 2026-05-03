import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
  const MASK = '+7 (###) ###-##-##';
  const PREFIXES = ['+7', '8'];

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

  it('вставка только "+7" в неактивную маску -> активирует маску', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7');
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('вставка только "8" в неактивную маску -> активирует маску', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8');
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('вставка "7" (цифровой префикс) в неактивную маску -> активирует', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '7');
    expect(input.value).toBe('+7 (___) ___-__-__');
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
